import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

interface ChatBubbleProps {
  content: string;
  timestamp: string;
  isSender: boolean;
  isRead?: boolean;
  senderName?: string;
  hasAvatar?: boolean; // Optional prop to indicate if there's an avatar
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  content,
  timestamp,
  isSender,
  isRead,
  senderName,
  hasAvatar = false,
}) => {
  return (
    <div className={`flex ${isSender ? 'flex-row-reverse items-start' : 'items-start'} mb-2`}>
      {/* Space for Avatar */}
      {!isSender && hasAvatar && <div className="w-8 h-8 mr-2 rounded-full bg-gray-300"></div>}
      {isSender && hasAvatar && <div className="w-8 h-8 ml-2 rounded-full bg-gray-300"></div>}

      <div className="flex flex-col">
        <div className={`${isSender ? 'items-end' : 'items-start'}`}>
          {!isSender && senderName && (
            <span className="text-xs text-gray-500 mb-0.5">@{senderName}</span>
          )}
          <div
            className={`rounded-md px-3 py-2 break-words shadow-sm ${
              isSender
                ? 'bg-blue-600 text-white rounded-bl-md'
                : 'bg-gray-200 text-gray-900 rounded-br-md'
            }`}
          >
            <p className="text-sm leading-snug">{content}</p>
          </div>
        </div>
        <span
          className={`text-[0.7rem] text-gray-500 mt-0.5 ${isSender ? 'text-right' : 'text-left'}`}
        >
          {format(new Date(timestamp), 'HH:mm')}
          {isSender && (
            <span className="ml-1">{isRead ? <CheckCheck size={10} /> : <Check size={10} />}</span>
          )}
        </span>
      </div>
    </div>
  );
};

export default ChatBubble;