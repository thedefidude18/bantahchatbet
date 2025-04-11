import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

interface ChatBubbleProps {
  content: string;
  timestamp: string;
  isSender: boolean;
  isRead?: boolean;
  senderName?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  content,
  timestamp,
  isSender,
  isRead,
  senderName
}) => {
  return (
    <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}>
      {!isSender && senderName && (
        <span className="text-xs text-gray-500 ml-2 mb-1">@{senderName}</span>
      )}
      <div className={`max-w-[70%] break-words rounded-2xl px-4 py-2 ${
        isSender ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
      }`}>
        <p>{content}</p>
        <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
          isSender ? 'text-blue-100' : 'text-gray-500'
        }`}>
          <span>{format(new Date(timestamp), 'HH:mm')}</span>
          {isSender && (
            <span>{isRead ? <CheckCheck size={14} /> : <Check size={14} />}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
