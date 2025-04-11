import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Loader, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import UserAvatar from './UserAvatar';
import { useSocketChat } from '../hooks/useSocketChat';

const MOCK_MESSAGES = [
  {
    id: 'm1',
    content: "I think this event will definitely happen! 🎯",
    sender: { id: '1', name: 'Alice Chen', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
    sender_id: '1',
  },
  {
    id: 'm2',
    content: "The markets are looking favorable 📈",
    sender: { id: '2', name: 'Bob Smith', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
    sender_id: '2',
  },
  {
    id: 'm3',
    content: "I'm betting on YES! Who's with me? 🙋‍♂️",
    sender: { id: '3', name: 'Charlie Wang', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie' },
    sender_id: '3',
  },
];

interface NewEventChatProps {
  eventId: string;
  eventPoolAmount: string; // Amount of the event pool (e.g., "1000 USDT")
  onClose: () => void;
}

const NewEventChat: React.FC<NewEventChatProps> = ({ eventId, eventPoolAmount, onClose }) => {
  const { currentUser } = useAuth();
  const toast = useToast();
  const { messages, sendMessage, isConnected, isLoading } = useSocketChat(eventId);
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

  const handleYes = () => {
    toast.showSuccess('You selected YES');
    // Implement actual logic for YES selection
  };

  const handleNo = () => {
    toast.showSuccess('You selected NO');
    // Implement actual logic for NO selection
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0F111A]/90 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <img src="/back_arrow.png" alt="Back" className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Event Chat</h2>
              <p className="text-sm text-gray-500">Pool: {eventPoolAmount}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleYes}
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 rounded-full transition-colors shadow-sm"
            >
              YES
            </button>
            <button
              onClick={handleNo}
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 rounded-full transition-colors shadow-sm"
            >
              NO
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[65vh] overflow-y-auto p-6 space-y-6 bg-gray-50">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : (
            [...MOCK_MESSAGES, ...(Array.isArray(messages) ? messages : [])].map((msg, index) => {
              if (!msg || !msg.id) return null;
              const sender = msg.sender || {};
              const isCurrentUser = msg.sender_id === currentUser?.id;
              
              // Generate a consistent color based on sender ID
              const colors = [
                'bg-gradient-to-r from-violet-400 to-violet-500',
                'bg-gradient-to-r from-blue-400 to-blue-500',
                'bg-gradient-to-r from-teal-400 to-teal-500',
                'bg-gradient-to-r from-amber-400 to-amber-500',
              ];
              const colorIndex = parseInt(msg.sender_id) % colors.length;
              const bubbleColor = isCurrentUser ? 'bg-gradient-to-r from-indigo-400 to-indigo-500' : colors[colorIndex];

              return (
                <div
                  key={msg.id || index}
                  className={`flex items-end gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                >
                  <UserAvatar
                    url={sender.avatar_url || '/default-avatar.png'}
                    username={sender.name || 'User'}
                    size="sm"
                  />
                  <div className="flex flex-col gap-1">
                    {!isCurrentUser && (
                      <span className="text-sm text-gray-500 px-1">{sender.name}</span>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2.5 max-w-[320px] ${bubbleColor} text-white shadow-sm`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <img src="/attachment_icon.png" alt="Attach" className="w-6 h-6" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-gray-100 text-gray-900 rounded-full px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || !isConnected || isLoading}
              className={`p-3 rounded-full transition-colors ${
                !message.trim() || isLoading 
                  ? 'bg-gray-100 text-gray-400' 
                  : 'bg-gradient-to-r from-indigo-400 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-600'
              } disabled:opacity-50 shadow-sm`}
            >
              <img src="/send_icon.png" alt="Send" className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewEventChat;