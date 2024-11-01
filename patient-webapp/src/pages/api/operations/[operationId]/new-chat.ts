import { NextApiRequest, NextApiResponse } from "next";
import { authMiddlewareNode } from "@/server/authMiddleware";
import { db } from "@/server/db";
import { Chat } from "@prisma/client";
import { ObjectId } from "bson";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    // Verify the user's identity
    const decodedToken = await authMiddlewareNode(req, res);
    if (!decodedToken) return; // If the token is invalid, the middleware will handle the response

    const { operationId } = req.query;

    // Check if the operation exists and belongs to the authenticated patient
    const operation = await db.operation.findFirst({
      where: {
        id: operationId as string,
        patientId: decodedToken.uid,
      },
    });

    if (!operation) {
      return res.status(404).json({ error: "Operation not found" });
    }


    const newChatData: Chat = {
        id: new ObjectId().toString(),
        title: `Chat ${new Date().toLocaleString()}`,
        messages: [],
        numUnverifiedMessages: 0,
        oldestUnverifiedMessage: null,
    }

    // Create a new chat for the operation
    const operationWithNewChat = await db.operation.update({
      where: { id: operationId as string },
      data: {
        chats: {
          push: newChatData,
        },
      },
    });

    // Return the newly created chat
    res.status(201).json({ chatId: newChatData.id });
  } catch (error) {
    console.error("Error creating new chat:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
