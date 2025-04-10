import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import UserAvatar from './UserAvatar';
import { useSocketChat } from '../hooks/useSocketChat';

interface NewEventChatProps {
  eventId: string;
  onClose: () => void;
}

const NewEventChat: React.FC<NewEventChatProps> = ({ eventId, onClose }) => {
  const { currentUser } = useAuth();
  const toast = useToast();
  const { messages, sendMessage, isConnected } = useSocketChat(eventId);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!message.trim() || !isConnected) {
      if (!isConnected) toast.showError('Chat is disconnected');
      return;
    }

    const success = await sendMessage(message.trim());
    if (success) {
      setMessage('');
    } else {
      toast.showError('Failed to send message');
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1b2e]/90 flex items-center justify-center p-4">
      <div className="bg-[#242538] w-full max-w-2xl rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-lg font-semibold text-white">Event Chat</h2>
        </div>

        {/* Messages */}
        <div className="h-[60vh] overflow-y-auto p-4 space-y-4">
          {Array.isArray(messages) &&
            messages.map((msg, index) => {
              if (!msg || !msg.id) return null;

              // Ensure msg.sender exists and has the required properties
              const sender = msg.sender || {};
              const isCurrentUser = msg.sender_id === currentUser?.id;

              return (
                <div
                  key={msg.id || index}
                  className={`flex items-start gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                >
                  <UserAvatar
                    url={sender.avatar_url || '/default-avatar.png'}
                    username={sender.name || 'User'}
                    size="sm"
                  />
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[70%] ${
                      isCurrentUser ? 'bg-[#CCFF00] text-black ml-auto' : 'bg-white/10 text-white'
                    }`}
                  >
                    <p>{msg.content}</p>
                  </div>
                </div>
              );
            })}

          {/* Dummy div to scroll into view */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-white/5 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#CCFF00]"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || !isConnected}
              className="p-3 bg-[#CCFF00] text-black rounded-lg disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewEventChat;
