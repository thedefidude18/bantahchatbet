import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Paperclip, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from './LoadingSpinner';
import UserAvatar from './UserAvatar';
import { Chat } from '../types/chat';

interface ChatWindowProps {
  chat: Chat;
  onBack?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chat, onBack }) => {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    try {
      setSending(true);
      // Implement your send message logic here
      setMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.showError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.showInfo('File upload coming soon!');
  };

  // Get other participant's info
  const otherParticipant = chat.participants.find(p => p.user_id !== currentUser?.id);

  return (
    <div className="flex flex-col h-full bg-[#1a1b2e]"> {/* Simplified height */}
      {/* Header */}
      <header className="flex-none bg-[#242538] p-3 border-b border-white/10 flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-light-hover dark:hover:bg-dark-hover rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <UserAvatar
          src={otherParticipant?.avatar_url}
          alt={otherParticipant?.name || 'User'}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">{otherParticipant?.name || 'User'}</h2>
          <p className="text-xs text-light-text/60 dark:text-dark-text/60 truncate">
            {otherParticipant?.status || 'Offline'}
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {chat.messages?.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender_id !== currentUser?.id && (
              <UserAvatar
                src={msg.sender?.avatar_url}
                alt={msg.sender?.name || 'User'}
                size="xs"
                className="mr-2 self-end"
              />
            )}
            <div
              className={`max-w-[85%] rounded-lg p-2 ${
                msg.sender_id === currentUser?.id
                  ? 'bg-primary text-white rounded-br-none'
                  : 'bg-light-card dark:bg-dark-card rounded-bl-none'
              }`}
            >
              <p className="break-words text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-none bg-[#242538] border-t border-white/10 p-2">
        <div className="flex items-center gap-2">
          <label className="flex-none p-2 hover:bg-light-hover dark:hover:bg-dark-hover rounded-full cursor-pointer">
            <Paperclip className="w-5 h-5" />
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,video/*"
            />
          </label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-light-bg dark:bg-dark-bg rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="flex-none p-2 bg-primary text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? <LoadingSpinner size="sm" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
