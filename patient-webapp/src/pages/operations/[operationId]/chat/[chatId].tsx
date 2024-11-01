import Navbar from "@/components/general/Navbar";
import RecoveryInfo from "@/components/chat-page/RecoveryInfo";
import ChatHistory from "@/components/chat-page/ChatHistory";
import MessageInput from "@/components/chat-page/MessageInput";
import { useOperation } from "@/hooks/useOperation";
import { Chat, Message, SenderType } from "@prisma/client";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { auth } from "@/firebase";
import { useQueryClient } from "react-query";
import { ObjectId } from "bson";

export default function ChatAIPage() {
  // Can retrieve messages from the backend for a unique postoperative id passed to the MessageAIPage
  const router = useRouter();
  const chatId = router.query.chatId as string;
  const operationId = router.query.operationId as string;
  console.log(`Chat ID: ${chatId}, Operation ID: ${operationId}`);

  // Ensure operations are fetched and cached
  // Retrieve the operation using the operation ID
  const { data: operation, isLoading: loadingOperation } =
    useOperation(operationId);

  // Find the specific chat within the operation
  const chat: Chat | undefined = operation?.chats.find(
    (chat) => chat.id === chatId,
  );
    
  const [messages, setMessages] = useState<Message[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (chat) {
      const sortedMessages = [...chat.messages].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setMessages(sortedMessages);
    }
  }, [chat]);

  console.log(`Current chat details for Chat ID: ${chatId}:`, chat);
  
  const handleSubmit = async (message: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not logged in');
      }

      const temporaryMessage: Message = {
        // id: new ObjectId().toString(), // Temporary ID to instantly update the UI - this will be replaced by the backend
        id: "temporaryId", // Temporary ID to instantly update the UI - this will be replaced by the backend
        text: message,
        timestamp: new Date(),
        sender: SenderType.PATIENT,
        readTimestamp: null,
        verificationStatus: null,
        doctorNote: null,
        readByPatient: null,
      };

      // Optimistically update the UI
      setMessages((prevMessages) => [temporaryMessage, ...prevMessages]);

      const token = await user.getIdToken();
      const response = await fetch(`/api/operations/${operationId}/chat/${chatId}/patient-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ question: message }),
      });
      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const responseData = await response.json();
      // const aiMessage: AIMessageData = {
      //   _id: new ObjectId(), // Temporary ID
      //   text: responseData.answer,
      //   timestamp: new Date(),
      //   sender: "ai",
      //   readTimestamp: null,
      //   readByDoctor: false,
      // };
      // setMessages((prevMessages) => [aiMessage, ...prevMessages]);

      queryClient.invalidateQueries(["operation", operationId]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  if (loadingOperation) return <div>Loading operation details...</div>;
  if (!operation) return <div>Operation not found.</div>;
  if (!chat) return <div>No chat found for this operation.</div>;
  
  return (
    <main className="relative mx-auto flex h-screen max-h-screen max-w-screen-sm flex-col items-center sm:rounded-2xl sm:border-8 sm:border-gray-300">
      <Navbar
        title={chat.title}
        showBackArrow
        phoneNumber="1234"
        showVerticalDotIcon
      />
      <RecoveryInfo />
      <ChatHistory messages={messages} />
      <MessageInput onSubmit={handleSubmit} />
    </main>
  );
}
