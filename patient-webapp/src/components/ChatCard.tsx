import Link from "next/link";
import { Chat } from "@prisma/client"; // Ensure this import path aligns with your project structure

interface ChatCardProps {
  chat: Chat;
  operationId: string;
}

const ChatCard: React.FC<ChatCardProps> = ({ chat, operationId }) => {

  if (!chat) {
    return null;
  }

  const displayTime = (timestamp: Date) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    // console.log(messageDate, today, yesterday);

    const messageDateString = messageDate.toLocaleDateString();
    const todayString = today.toLocaleDateString();
    const yesterdayString = yesterday.toLocaleDateString();

    if (messageDateString === todayString) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else if (messageDateString === yesterdayString) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString();
    }
  };


  const mostRecentMessage = chat.messages.length > 0
    ? chat.messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    : null;

  const displayMessage = mostRecentMessage ? mostRecentMessage.text : "No messages yet";
  const displayTimestamp = mostRecentMessage?.timestamp
    ? displayTime(mostRecentMessage.timestamp)
    : "N/A";


  return (
    <div className="rounded-lg border border-gray-300 p-4 hover:bg-gray-100">
      <div className="flex items-center justify-between">
        <Link
          legacyBehavior
          href={`/operations/${operationId}/chat/${chat.id}`}
        >
          <a className="text-blue-500 hover:underline">{chat.title}</a>
        </Link>
        {displayTimestamp && (
          <span className="text-sm text-gray-500">
            {displayTimestamp}
          </span>
        )}
      </div>
      <div className="text-base text-gray-600">
        <p className="line-clamp-2">
          {displayMessage}
        </p>
        <div className="flex w-full justify-end">
          <p className="text-sm">
            {chat.messages.length} Messages - {chat.numUnverifiedMessages}{" "}
            Unverified
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatCard;
