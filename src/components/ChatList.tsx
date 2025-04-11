// src/components/ChatList.tsx
import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { Search } from 'lucide-react';
import { Chat } from '../types/chat';
import { useChat } from '../hooks/useChat';
import UserAvatar from './UserAvatar';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useSearchUsers } from '../hooks/useSearchUsers'; // Replace useUserSearch import
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';

interface ChatListProps {
  onChatSelect: (chat: Chat) => void;
  selectedChatId?: string;
}

interface ChatItem {
  id: string;
  name: string;
  avatar_url?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
}

interface SearchUser {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
  stats?: { wins: number; total_matches: number };
}

const ChatList: React.FC<ChatListProps> = ({ onChatSelect, selectedChatId }) => {
  const { currentUser } = useAuth();
  const { chats, loading: loadingChats } = useChat();
  const { users: searchResults, loading: isSearchingUsers, searchUsers } = useSearchUsers(); // Replace useUserSearch with useSearchUsers
  const [searchQuery, setSearchQuery] = useState('');
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null); // Use useRef for the timeout
  const toast = useToast();

  const filteredChats = chats?.filter(chat => {
    if (!searchQuery) return true;
    const otherParticipant = chat.participants?.find(p => p.user_id !== currentUser?.id);
    return otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           otherParticipant?.username?.toLowerCase().includes(searchQuery.toLowerCase());
  }) ?? [];

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      }
    }, 300);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchQuery, searchUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectUser = async (user: SearchUser) => {
    try {
      // Check if chat already exists
      const existingChat = chats?.find(chat => 
        chat.participants?.some(p => p.user_id === user.id)
      );

      if (existingChat) {
        onChatSelect(existingChat);
      } else {
        // First create the chat
        const { data: newChat, error: chatError } = await supabase
          .from('chats')
          .insert([{
            created_by: currentUser?.id
          }])
          .select()
          .single();

        if (chatError) throw chatError;

        // Then create the participants
        if (newChat) {
          const { error: participantsError } = await supabase
            .from('chat_participants')
            .insert([
              { chat_id: newChat.id, user_id: currentUser?.id },
              { chat_id: newChat.id, user_id: user.id }
            ]);

          if (participantsError) throw participantsError;

          // Fetch the complete chat with participants
          const { data: completeChat, error: fetchError } = await supabase
            .from('chats')
            .select(`
              *,
              participants:chat_participants(
                user_id,
                user:users(*)
              )
            `)
            .eq('id', newChat.id)
            .single();

          if (fetchError) throw fetchError;
          if (completeChat) {
            onChatSelect(completeChat as Chat);
          }
        }
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.showError('Failed to create chat');
    }
    setSearchQuery('');
  };

  if (loadingChats || isSearchingUsers) {
    return <div className="flex items-center justify-center h-full bg-white"><LoadingSpinner size="lg" color="#25D366" /></div>;
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="bg-white sticky top-0 z-10 border-b border-gray-200">
        <div className="relative p-3">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {searchQuery && searchResults.length > 0 && ( // Use searchResults
            <div className="absolute top-full left-0 right-0 bg-white rounded-md shadow-md z-20">
              <ul>
                {searchResults.map(user => ( // Use searchResults
                  <li key={user.id}>
                    <button
                      onClick={() => handleSelectUser(user)}
                      className="w-full flex items-center space-x-3 py-2 px-4 hover:bg-gray-100"
                    >
                      <UserAvatar src={user.avatar_url} alt={user.name} size="sm" />
                      <span className="text-sm font-semibold text-gray-800">{user.name}</span>
                    </button>
                  </li>
                ))}
                {searchResults.length > 5 && (
                  <li className="py-2 px-4 text-center text-gray-500">See more results</li>
                )}
              </ul>
            </div>
          )}
          {searchQuery && searchResults.length === 0 && !isSearchingUsers && ( // Use searchResults
            <div className="absolute top-full left-0 right-0 bg-white rounded-md shadow-md z-20 p-6 text-center">
              <div className="flex flex-col items-center space-y-3">
                <Search size={28} />
                <div>
                  {searchQuery.length < 1 ? (
                    <p className="text-sm text-gray-500">Type a name or username to search</p>
                  ) : (
                    <>
                      <p className="text-gray-700 font-medium text-base mb-1">Can't find "{searchQuery}"</p>
                      <p className="text-sm text-gray-500">Try using a different name or username</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-y-auto flex-grow bg-white">
        {searchQuery && searchResults.length > 0 ? null : ( // Use searchResults
          filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <span className="text-gray-400 mb-3"><Search size={28} /></span>
              <p className="text-gray-700 font-medium text-base mb-1">{searchQuery ? 'No matching chats found' : 'No chats yet'}</p>
              <p className="text-sm text-gray-500">{searchQuery ? 'Try different search terms' : 'Start a new chat to begin messaging'}</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredChats.map(chat => {
                const otherParticipant = chat.participants?.find(p => p.user_id !== currentUser?.id);
                const name = otherParticipant?.name || 'Unknown User';
                const avatarUrl = otherParticipant?.avatar_url;
                const lastMessage = chat.last_message?.content || 'No messages yet';
                const timestamp = chat.last_message?.created_at ? new Date(chat.last_message.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : chat.timestamp;

                return (
                  <li key={chat.id}>
                    <button
                      onClick={() => onChatSelect(chat as Chat)}
                      className={`w-full block py-3 px-4 hover:bg-gray-100 transition-colors ${chat.id === selectedChatId ? 'bg-green-50' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <UserAvatar src={avatarUrl} alt={name} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                          <p className="text-sm text-gray-500 truncate">{lastMessage}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          {timestamp && <span className="text-xs text-gray-500">{timestamp}</span>}
                          {chat.unreadCount > 0 && (
                            <div className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mt-1">{chat.unreadCount}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )
        )}
      </div>
    </div>
  );
};

export default ChatList;