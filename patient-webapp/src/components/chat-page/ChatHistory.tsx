import React from "react";
import { Message } from "@prisma/client";
import MessageBubble from "./MessageBubble";

export default function ChatHistory({ messages }: { messages: Message[] }) {
  if (!messages) {
    return null;
  }

  // Sort messages by time in descending order using Date objects
  const sortedMessages = messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  console.log("sortedMessages", sortedMessages);
  return (
    <div className="flex flex-col-reverse w-full flex-1 overflow-y-auto">
      {sortedMessages.map((message, index) => (
        <MessageBubble key={index} msg={message} />
      ))}
    </div>
  );
}
