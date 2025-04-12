import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Loader, MoreVertical } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import UserAvatar from './UserAvatar';
import { useEventChat } from '../hooks/useEventChat';

interface NewEventChatProps {
  eventId: string;
  eventPoolAmount: string;
  eventCreatorId: string;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender?: {
    name: string;
    avatar_url: string;
  };
}

const NewEventChat: React.FC<NewEventChatProps> = ({ eventId, eventPoolAmount, eventCreatorId, onClose }) => {
  const { currentUser } = useAuth();
  const toast = useToast();
  const { messages, sendMessage, isLoading } = useEventChat(eventId);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isCurrentUserAdmin = currentUser?.id === eventCreatorId;

  const handleSubmit = async () => {
    if (message.trim()) {
      const success = await sendMessage(message.trim());
      if (!success) {
        toast.showError('Failed to send message');
      }
      setMessage('');
    }
  };

  const handleYes = () => {
    toast.showInfo('Yes action (implementation needed)');
  };

  const handleNo = () => {
    toast.showInfo('No action (implementation needed)');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0F111A]/90 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Event Chat</h2>
              <p className="text-sm text-gray-500">Pool: {eventPoolAmount}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleYes} className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors">
              Yes
            </button>
            <button onClick={handleNo} className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors">
              No
            </button>
            {isCurrentUserAdmin && (
              <div className="relative">
                <button onClick={toggleMenu} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <MoreVertical className="w-6 h-6" />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-10">
                    <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Block User (placeholder)</button>
                    <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Ban User (placeholder)</button>
                    <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Report (placeholder)</button>
                    <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Share (placeholder)</button>
                    <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Edit (placeholder)</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="h-[65vh] overflow-y-auto p-6 space-y-4 bg-gray-50">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : (
            messages
              .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .map((msg) => (
                <div key={msg.id} className="flex items-start gap-2">
                  <UserAvatar url={msg.sender?.avatar_url || '/default-avatar.png'} username={msg.sender?.name || 'User'} size="sm" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">{msg.sender?.name || 'User'}</span>
                    <p className="text-sm text-gray-800 bg-gray-100 rounded-lg p-2">{msg.content}</p>
                  </div>
                </div>
              ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center gap-3">
            <UserAvatar url={currentUser?.user_metadata?.avatar_url || '/default-avatar.png'} username={currentUser?.user_metadata?.full_name || 'You'} size="sm" />
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Type your message..."
              className="flex-1 bg-gray-100 text-gray-900 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || isLoading}
              className={`p-2 rounded-full transition-colors ${
                !message.trim() || isLoading
                  ? 'bg-gray-200 text-gray-500'
                  : 'bg-indigo-500 text-white hover:bg-indigo-600'
              }`}
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