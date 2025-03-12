import React, { useState } from 'react';
import { MessageReactions } from './MessageReactions';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { Reply, Smile } from 'lucide-react';
import UserAvatar from './UserAvatar';

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
  onReply?: (messageId: string) => void;
  showAvatar?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isOwnMessage, 
  onReply,
  showAvatar = true 
}) => {
  const [showActions, setShowActions] = useState(false);

  const handleReaction = async (emoji: string) => {
    try {
      const { data: existingReaction } = await supabase
        .from('message_reactions')
        .select('id')
        .match({ 
          message_id: message.id, 
          user_id: currentUser.id,
          emoji: emoji 
        })
        .single();

      if (existingReaction) {
        await supabase
          .from('message_reactions')
          .delete()
          .match({ id: existingReaction.id });
      } else {
        await supabase
          .from('message_reactions')
          .insert({
            message_id: message.id,
            user_id: currentUser.id,
            emoji: emoji
          });
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  return (
    <div 
      className={`group relative flex items-end gap-2 px-4 py-1 hover:bg-white/5 -mx-4 ${
        isOwnMessage ? 'flex-row-reverse' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar - only show if it's not own message and showAvatar is true */}
      {(!isOwnMessage && showAvatar) && (
        <div className="flex-shrink-0 mb-1">
          <UserAvatar
            src={message.sender?.avatar_url}
            fallback={message.sender?.username?.[0] || 'U'}
            size="sm"
          />
        </div>
      )}

      <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {/* Sender name and time */}
        {showAvatar && (
          <div className={`flex items-center gap-2 mb-1 text-xs ${
            isOwnMessage ? 'justify-end' : 'justify-start'
          }`}>
            {!isOwnMessage && (
              <span className="font-medium text-white/90">
                {message.sender?.username}
              </span>
            )}
            <span className="text-white/40">
              {format(new Date(message.created_at), 'HH:mm')}
            </span>
          </div>
        )}

        {/* Message bubble */}
        <div className="relative group">
          <div 
            className={`rounded-2xl px-4 py-2 break-words ${
              isOwnMessage 
                ? 'bg-[#CCFF00] text-black rounded-br-sm' 
                : 'bg-[#2C2D44] text-white/90 rounded-bl-sm'
            }`}
          >
            {message.content}
          </div>

          {/* Hover actions */}
          {showActions && (
            <div 
              className={`absolute top-1/2 -translate-y-1/2 ${
                isOwnMessage ? '-left-16' : '-right-16'
              } flex items-center gap-1`}
            >
              <button 
                onClick={() => onReply?.(message.id)}
                className="p-1.5 rounded-full bg-[#242538] text-white/60 hover:text-white 
                hover:bg-[#2c2d44] transition-colors"
              >
                <Reply className="w-4 h-4" />
              </button>
              <button 
                className="p-1.5 rounded-full bg-[#242538] text-white/60 hover:text-white 
                hover:bg-[#2c2d44] transition-colors"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={`mt-1 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <MessageReactions
              messageId={message.id}
              reactions={message.reactions}
              onReact={handleReaction}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
