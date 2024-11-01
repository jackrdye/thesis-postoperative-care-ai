import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useOperations } from '@/hooks/useOperations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const Home: React.FC = () => {
  const { data: operations, isLoading } = useOperations();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!operations) {
    return <div>No operations found</div>;
  }

  // Sort operations by the oldest unverified message in their chats
  const sortedOperations = operations.sort((a, b) => {
    const operationAOldestUnverified = a.chats.reduce((oldest, chat) => {
      if (!chat.oldestUnverifiedMessage) return oldest;
      return oldest ? (chat.oldestUnverifiedMessage < oldest ? chat.oldestUnverifiedMessage : oldest) : chat.oldestUnverifiedMessage;
    }, null as Date | null);

    const operationBOldestUnverified = b.chats.reduce((oldest, chat) => {
      if (!chat.oldestUnverifiedMessage) return oldest;
      return oldest ? (chat.oldestUnverifiedMessage < oldest ? chat.oldestUnverifiedMessage : oldest) : chat.oldestUnverifiedMessage;
    }, null as Date | null);

    if (!operationAOldestUnverified && !operationBOldestUnverified) return 0;
    if (!operationAOldestUnverified) return 1;
    if (!operationBOldestUnverified) return -1;
    return operationAOldestUnverified.getTime() - operationBOldestUnverified.getTime();
  });

  return (
    <>
      <Head>
        <title>Doctor's Operations</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="max-w-sm mx-auto p-4 bg-gray-100 min-h-screen shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Your Operations</h1>
        <Link href="/operations/create-operation" className="flex items-center justify-center mb-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600">
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Create New Operation
        </Link>
        {sortedOperations.map((operation) => {
          // Calculate the total number of unverified messages across all chats
          const totalUnverifiedMessages = operation.chats.reduce((total, chat) => {
            return total + chat.numUnverifiedMessages;
          }, 0);

          // // Find the latest message across all chats
          // const latestMessage = operation.chats.reduce((latest, chat) => {
          //   const chatLatestMessage = chat.messages[chat.messages.length - 1];
          //   return chatLatestMessage.timestamp > latest.timestamp ? chatLatestMessage : latest;
          // }, { timestamp: new Date(0) });

          return (
            <Link href={`/operations/${operation.id}`} key={operation.id}>
              <div className="bg-white rounded-lg p-4 mb-4 shadow relative">
                <h2 className="text-lg font-semibold mb-2">
                  {operation.patient.firstName && operation.patient.lastName
                    ? `${operation.patient.firstName} ${operation.patient.lastName}`
                    : operation.patient.email}
                </h2>
                <p className="text-sm text-gray-600">Procedure: {operation.procedureName}</p>
                <p className="text-sm text-gray-600">Date: {new Date(operation.procedureDate).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">
                  Pending Verification Since: {(() => {
                    // Check if there are any chats
                    if (operation.chats.length === 0) {
                      return "Up to Date";
                    }

                    // Find the oldest unverified message across all chats
                    const oldestChat = operation.chats.reduce((oldest, chat) => 
                      (chat.oldestUnverifiedMessage && oldest.oldestUnverifiedMessage && chat.oldestUnverifiedMessage < oldest.oldestUnverifiedMessage) ? chat : oldest
                    );
                    
                    // If there are no unverified messages, return "Up to Date"
                    if (!oldestChat.oldestUnverifiedMessage) {
                      return "Up to Date";
                    }

                    // Calculate the time since the oldest unverified message
                    const timeSince = new Date().getTime() - new Date(oldestChat.oldestUnverifiedMessage).getTime();
                    const minutes = Math.floor(timeSince / 60000);
                    const hours = Math.floor(minutes / 60);
                    const days = Math.floor(hours / 24);
                    
                    // Return the appropriate time ago string
                    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
                    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
                    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
                  })()}
                </p>
                {totalUnverifiedMessages > 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    {totalUnverifiedMessages}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
};

export default Home;
