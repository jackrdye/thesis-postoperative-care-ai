import { NextApiRequest, NextApiResponse } from "next";
import { authMiddlewareNode } from "@/server/authMiddleware";
import { db } from "@/server/db";
import { ObjectId } from "bson";
import { OpenAI } from "openai";
import { Message, Operation, SenderType, VerificationStatus } from "@prisma/client";

export const config = {
  runtime: "nodejs",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const decodedToken = await authMiddlewareNode(req, res);

  // Authentication failed
  if (res.headersSent || !decodedToken) {
    return;
  }

  const { operationId, chatId } = req.query;
  const { question } = req.body;

  if (!operationId || !chatId || !question) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  try {
    // Fetch the operation and verify the patient
    const operation = await db.operation.findUnique({
      where: {
        id: operationId as string,
      }
    });

    if (!operation) {
      return res.status(404).json({ message: 'Operation not found' });
    }

    // Verify that the requesting user is the patient
    if (operation.patientId !== decodedToken.uid) {
      return res.status(403).json({ message: 'Forbidden: User is not the patient' });
    }

    const chat = operation.chats.find((chat) => chat.id === chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Create the new patient message
    const newMessage: Message = {
      id: new ObjectId().toString(),
      text: question,
      sender: SenderType.PATIENT,
      timestamp: new Date(),
      verificationStatus: null,
      doctorNote: null,
      readTimestamp: null,
      readByPatient: null
    };

    // Add the patient question to the chat
    await db.operation.update({
      where: { id: operationId as string },
      data: {
        chats: {
          updateMany: {
            where: {
              id: chatId as string
            },
            data: {
              messages: {
                push: newMessage
              }
            }
          }
        }
      }
    });

    // Generate AI response
    const aiResponseText = await generateResponse(
      question,
      chat.messages,
      operation.patientInformation,
      operation.procedureName,
      Math.floor((new Date().getTime() - operation.procedureDate.getTime()) / (1000 * 3600 * 24)),
      operation.postOpInstructions
    );
    // const aiResponseText = "Hello, this is a test response";

    const aiMessage: Message = {
      id: new ObjectId().toString(),
      text: aiResponseText,
      sender: SenderType.AI,
      timestamp: new Date(),
      readTimestamp: null,
      verificationStatus: VerificationStatus.UNVERIFIED,
      doctorNote: null,
      readByPatient: null
    };

    // Add the AI response to the chat
    await db.operation.update({
      where: { id: operationId as string },
      data: {
        chats: {
          updateMany: {
            where: {
              id: chatId as string
            },
            data: {
              numUnverifiedMessages: {
                increment: 1
              },
              oldestUnverifiedMessage: {
                set: aiMessage.timestamp
              },
              messages: {
                push: aiMessage
              }
            }
          }
        }
      }
    });

    res.status(200).json({ message: 'Message added successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// --------- Function ----------
const apiKey = process.env.OPENAI_API_KEY;
const client = new OpenAI({ apiKey });

async function createCompletion(client: OpenAI, model: string, messages: any) {
  const completion = await client.chat.completions.create({
      model,
      messages
  });
  return completion;
}


async function generateResponse(
  question: string,
  history: (Message)[],
  patient: Operation["patientInformation"],
  procedureName: string,
  procedureDaysSinceProcedure: number,
  postoperativeInstructions: string
): Promise<string> {
  const patientInfo = `Age: ${patient.age}, Height: ${patient.height} cm, Weight: ${patient.weight} kg, Gender: ${patient.gender}`;
  const procedureInfo = `Procedure name: ${procedureName}, Days since procedure: ${procedureDaysSinceProcedure}`;

  const conversationHistory = history.map((msg) => ({
    role: msg.sender === SenderType.PATIENT ? "user" : "assistant",
    content: msg.text,
  }));

  const messages = [
      {
          role: "system",
          content: `You are a post operative care assistant. Your role is to help answer questions posed by the patient. Patient Information: ${patientInfo}. Procedure Information: ${procedureInfo}. The surgeons official postoperative instructions are ${postoperativeInstructions}. Your task is to answer the question based on the patient's information, the procedure details, and the postoperative instructions - do not recommend medication outside of the prescribed.`
      },
      ...conversationHistory,
      { role: "user", content: question }
  ];

  const completions = await Promise.all([
      createCompletion(client, "gpt-4o", messages),
      createCompletion(client, "gpt-4o", messages),
      createCompletion(client, "gpt-4o", messages)
  ]);

  const response1 = completions[0]?.choices[0]?.message;
  const response2 = completions[1]?.choices[0]?.message;
  const response3 = completions[2]?.choices[0]?.message;

  // Ensure all responses are complete
  if (!response1 || !response2 || !response3) {
      throw new Error("Incomplete completion data received.");
  }

  const initialInputTokens = completions[0].usage?.prompt_tokens;

  const totalInputTokens = completions.reduce((sum, completion) => sum + (completion.usage?.prompt_tokens ?? 0), 0);
  const totalOutputTokens = completions.reduce((sum, completion) => sum + (completion.usage?.completion_tokens ?? 0), 0);
  const totalTokens = totalInputTokens + totalOutputTokens;

  const debateMessages = [
      [
          { role: "system", content: `You are an expert in post operative care. Patient Information: ${patientInfo}. Procedure Information: ${procedureInfo}. Patient Question: ${question}` },
          { role: "user", content: `Your response was: ${response1.content}. The other agents responded - Agent 2: ${response2.content} - Agent 3: ${response3.content}. Do you want to reconsider your response?` }
      ],
      [
          { role: "system", content: `You are an expert in post operative care. Patient Information: ${patientInfo}. Procedure Information: ${procedureInfo}. Patient Question: ${question}` },
          { role: "user", content: `Your response was: ${response2.content}. The other agents responded - Agent 1: ${response1.content} - Agent 3: ${response3.content}. Do you want to reconsider your response?` }
      ],
      [
          { role: "system", content: `You are an expert in post operative care. Patient Information: ${patientInfo}. Procedure Information: ${procedureInfo}. Patient Question: ${question}` },
          { role: "user", content: `Your response was: ${response3.content}. The other agents responded - Agent 1: ${response1.content} - Agent 2: ${response2.content}. Do you want to reconsider your response?` }
      ]
  ];

  const debates = await Promise.all([
      createCompletion(client, "gpt-4o", debateMessages[0]),
      createCompletion(client, "gpt-4o", debateMessages[1]),
      createCompletion(client, "gpt-4o", debateMessages[2])
  ]);

  const debateResponse1 = debates[0]?.choices[0]?.message;
  const debateResponse2 = debates[1]?.choices[0]?.message;
  const debateResponse3 = debates[2]?.choices[0]?.message;

  // Ensure all debate responses are complete
  if (!debateResponse1 || !debateResponse2 || !debateResponse3) {
      throw new Error("Incomplete debate data received.");
  }

  const totalDebateInputTokens = debates.reduce((sum, debate) => sum + (debate.usage?.prompt_tokens ?? 0), 0);
  const totalDebateOutputTokens = debates.reduce((sum, debate) => sum + (debate.usage?.completion_tokens ?? 0), 0);
  const totalDebateTokens = debates.reduce((sum, debate) => sum + (debate.usage?.total_tokens ?? 0), 0);

  const finalSummary = await createCompletion(client, "gpt-4o", [
      { role: "system", content: `You are a summarization expert. Your role is to provide a final answer to the patient considering the previous 3 responses and their evaluations (do not mention the summarisation of 3 agents to the patient, also do not include a patient personal information summary). Patient question: ${question}. Patient information: ${patientInfo}. Procedure information: ${procedureInfo}` },
      { role: "user", content: `Agent 1's response: ${response1.content}` },
      { role: "user", content: `Agent 2's response: ${response2.content}` },
      { role: "user", content: `Agent 3's response: ${response3.content}` },
      { role: "user", content: `Agent 1's reconsideration: ${debateResponse1.content}` },
      { role: "user", content: `Agent 2's reconsideration: ${debateResponse2.content}` },
      { role: "user", content: `Agent 3's reconsideration: ${debateResponse3.content}` },
      { role: "user", content: "Please provide a final answer to the patient considering the previous 3 responses and their evaluations." }
  ]);

  const finalResponse = finalSummary?.choices[0]?.message;
  const finalOutputTokens = finalSummary?.usage?.completion_tokens;
  const totalFinalInputTokens = totalInputTokens + totalDebateInputTokens + (finalSummary?.usage?.prompt_tokens ?? 0);
  const totalFinalOutputTokens = totalOutputTokens + totalDebateOutputTokens + (finalOutputTokens ?? 0);
  const totalFinalTokens = totalTokens + totalDebateTokens + (finalSummary?.usage?.total_tokens ?? 0);

  if (!finalResponse?.content || !finalOutputTokens) {
      throw new Error("Final response is null or empty");
  }

  // Log the interaction
  // await logInteraction(
  //     question,
  //     patient,
  //     procedure,
  //     {
  //         response1: response1.content,
  //         response2: response2.content,
  //         response3: response3.content
  //     },
  //     {
  //         debateResponse1: debateResponse1.content,
  //         debateResponse2: debateResponse2.content,
  //         debateResponse3: debateResponse3.content
  //     },
  //     finalResponse.content,
  //     totalFinalTokens,
  //     totalFinalInputTokens,
  //     totalFinalOutputTokens,
  //     initialInputTokens,
  //     finalOutputTokens
  // );

  return finalResponse.content;
}
