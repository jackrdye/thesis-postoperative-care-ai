import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useOperation } from '@/hooks/useOperation';
import ReactMarkdown from 'react-markdown';
import { useQueryClient } from 'react-query'; // Import useQueryClient
import { auth } from '@/server/firebase';

const ChatPage: React.FC = () => {
  
  const router = useRouter();
  const { operationId, chatId } = router.query;
  const { data: operation, isLoading, error } = useOperation(operationId as string);
  const queryClient = useQueryClient(); // Initialize queryClient

  const handleVerify = async (messageId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      const token = await user.getIdToken();

      const response = await fetch(`/api/operations/${operationId}/chat/${chatId}/message/${messageId}/verify-response`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to verify message');
      }

      // Update the message status in the UI
      if (amendMessageId === messageId) {
        setAmendMessageId(null);
      }
    } catch (error) {
      console.error('Error verifying message:', error);
      // Handle error (e.g., show an error message to the user)
    }

    // Invalidate the query to refetch the operation data
    await queryClient.invalidateQueries(['operation', operationId]);
  };

  const [amendMessageId, setAmendMessageId] = useState<string | null>(null);
  const [doctorNote, setDoctorNote] = useState<string>('');

  const handleAmend = (messageId: string) => {
    setAmendMessageId(messageId);
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDoctorNote(e.target.value);
  };

  const submitDoctorNote = async (messageId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      const token = await user.getIdToken();

      const response = await fetch(`/api/operations/${operationId}/chat/${chatId}/message/${messageId}/amend-response`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ doctorNote }),
      });

      if (!response.ok) {
        throw new Error('Failed to amend message');
      }

      setAmendMessageId(null);
      setDoctorNote('');
      
      // Invalidate the query to refetch the operation data
      await queryClient.invalidateQueries(['operation', operationId]);
    } catch (error) {
      console.error('Error amending message:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error as string}</div>;
  if (!operation) return <div>Operation not found</div>;

  const chat = operation.chats.find((c) => c.id === chatId);
  if (!chat) return <div>Chat not found</div>;

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-4">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">{chat.title}</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {chat.messages.map((message) => {
              let bgColor = 'bg-white'; // Default background color

              if (message.sender === 'AI') {
                if (message.verificationStatus === 'VERIFIED') {
                  bgColor = 'bg-green-100';
                } else if (message.verificationStatus === 'AMENDED') {
                  bgColor = 'bg-yellow-100';
                } else if (message.verificationStatus === 'UNVERIFIED') {
                  bgColor = 'bg-red-100';
                }
              }

              return (
                <li key={message.id} className={`px-2 sm:px-4 py-3 sm:py-4 ${bgColor}`}>
                  <div className="flex space-x-2 sm:space-x-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs sm:text-sm font-medium">{message.sender}</h3>
                        <p className="text-xs sm:text-sm text-gray-500">{new Date(message.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-700">
                        <ReactMarkdown className="markdown break-words">{message.text}</ReactMarkdown>
                      </div>
                      {message.verificationStatus === 'AMENDED' && message.doctorNote && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-xs sm:text-sm font-medium text-yellow-800">Doctor's Note:</p>
                          <p className="text-xs sm:text-sm text-yellow-700">{message.doctorNote}</p>
                        </div>
                      )}
                      {message.sender === 'AI' && (
                        <div className="flex mt-2 justify-around space-x-2">
                          <button 
                            className="bg-green-500 text-white text-xs sm:text-sm px-4 sm:px-24 py-1 rounded-md"
                            onClick={() => handleVerify(message.id)}
                          >
                            Verify
                          </button>
                          <button 
                            className="bg-yellow-500 text-white text-xs sm:text-sm px-4 sm:px-24 py-1 rounded-md"
                            onClick={() => handleAmend(message.id)}
                          >
                            Amend
                          </button>
                        </div>
                      )}
                      {amendMessageId === message.id && (
                        <div className="mt-2 pt-2">
                          <textarea
                            className="w-full p-2 border rounded-md text-xs sm:text-sm"
                            value={doctorNote}
                            onChange={handleNoteChange}
                            placeholder="Add your note here..."
                          />
                          <button 
                            className="bg-green-500 text-white text-xs sm:text-sm px-4 py-1 mt-2 rounded"
                            onClick={() => submitDoctorNote(message.id)}
                          >
                            Submit Note
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
