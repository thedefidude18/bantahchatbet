import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Chat } from '../types/chat';
import { useChat } from '../hooks/useChat';
import UserAvatar from './UserAvatar';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

interface ChatListProps {
  onChatSelect: (chat: Chat) => void;
  selectedChatId?: string;
}

const ChatList: React.FC<ChatListProps> = ({ onChatSelect, selectedChatId }) => {
  const { currentUser } = useAuth();
  const { chats, loading } = useChat();
  const [searchQuery, setSearchQuery] = useState('');

  console.log('ChatList render - loading:', loading, 'chats:', chats);

  const filteredChats = chats.filter(chat =>
    chat.participants.some(p =>
      p.user_id !== currentUser?.id &&
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading) {
    console.log('Rendering loading spinner');
    return (
      <div className="flex items-center justify-center h-full bg-[#EDEDED]">
        <LoadingSpinner size="lg" color="#7C3AED" />
      </div>
    );
  }

  console.log('Rendering chat list');
  return (
    <div className="h-full overflow-y-auto bg-[#EDEDED]">
      {/* Search input */}
      <div className="p-4 sticky top-0 bg-[#EDEDED] z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Chat list */}
      {filteredChats.length === 0 ? (
        <div className="flex items-center justify-center h-[calc(100%-80px)] text-gray-500">
          {searchQuery ? 'No chats found' : 'No chats yet'}
        </div>
      ) : (
        <div className="space-y-1 p-2">
          {filteredChats.map(chat => {
            const otherParticipant = chat.participants.find(
              p => p.user_id !== currentUser?.id
            );

            return (
              <button
                key={chat.id}
                onClick={() => onChatSelect(chat)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors ${
                  chat.id === selectedChatId ? 'bg-light-hover dark:bg-dark-hover' : ''
                }`}
              >
                <UserAvatar
                  src={otherParticipant?.avatar_url}
                  alt={otherParticipant?.name || 'User'}
                  size="md"
                />
                <div className="flex-1 text-left">
                  <h3 className="font-semibold">{otherParticipant?.name}</h3>
                  <p className="text-sm text-light-text/60 dark:text-dark-text/60 truncate">
                    {chat.last_message?.content || 'No messages yet'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatList;
