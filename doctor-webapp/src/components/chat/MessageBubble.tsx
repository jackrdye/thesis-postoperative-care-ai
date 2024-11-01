import React from 'react';

interface MessageProps {
  content: string;
  isAI: boolean;
}

const MessageBubble: React.FC<MessageProps> = ({ content, isAI }) => {
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`max-w-3/4 p-3 rounded-lg ${
          isAI
            ? 'bg-gray-200 text-gray-800'
            : 'bg-blue-500 text-white'
        }`}
      >
        <p className="text-sm">{content}</p>
      </div>
    </div>
  );
};

export default MessageBubble;

