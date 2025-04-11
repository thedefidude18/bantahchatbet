// src/components/ChatList.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import UserAvatar from './UserAvatar';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useSearchUsers } from '../hooks/useSearchUsers';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase'; // Ensure you import supabase

interface ChatListProps {
  selectedChatId?: string; // To highlight the currently selected chat
}

interface SearchUser {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
  stats?: { wins: number; total_matches: number };
}

interface ChatListItem {
  id: string;
  otherParticipant: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
  };
  lastMessage?: string;
  lastMessageTime?: Date | null;
  unreadCount?: number; // You'll need logic to fetch this
}

const ChatList: React.FC<ChatListProps> = ({ selectedChatId }) => {
  const { currentUser } = useAuth();
  const { users: searchResults, loading: isSearchingUsers, searchUsers } = useSearchUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const toast = useToast();
  const navigate = useNavigate();
  const [chatListItems, setChatListItems] = useState<ChatListItem[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);

  useEffect(() => {
    const fetchUserChats = async () => {
      setLoadingChats(true);
      try {
        const { data, error } = await supabase
          .from('chats')
          .select(`
            id,
            created_at,
            participants:chat_participants(
              user_id,
              user:users(*)
            ),
            last_message:private_messages(
              content,
              created_at
            )
          `)
          .join('chat_participants', 'chats.id', 'chat_participants.chat_id')
          .eq('chat_participants.user_id', currentUser?.id)
          .order('chats.created_at', { ascending: false }); // Or order by last message time

        if (error) throw error;

        const formattedChats: ChatListItem[] = data?.map(chat => {
          const otherParticipant = chat.participants?.find(
            p => p.user_id !== currentUser?.id
          )?.user;

          return {
            id: chat.id,
            otherParticipant: {
              id: otherParticipant?.id,
              name: otherParticipant?.name,
              username: otherParticipant?.username,
              avatar_url: otherParticipant?.avatar_url,
            },
            lastMessage: chat.last_message?.[0]?.content,
            lastMessageTime: chat.last_message?.[0]?.created_at ? new Date(chat.last_message[0].created_at) : null,
            unreadCount: 0, // Implement logic to fetch unread counts
          };
        }) || [];

        setChatListItems(formattedChats);
      } catch (error) {
        console.error('Error fetching user chats:', error);
        toast.showError('Failed to fetch chats');
      } finally {
        setLoadingChats(false);
      }
    };

    if (currentUser?.id) {
      fetchUserChats();
    }
  }, [currentUser?.id, toast]);

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
    console.log('Selected user for chat:', user);
    setSearchQuery('');
    navigate(`/chat/${user.id}`); // Immediately navigate to the chat view with the selected user's ID
  };

  const handleOpenChat = (chatId: string) => {
    navigate(`/chat/${chatId}`);
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
          {searchQuery && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white rounded-md shadow-md z-20">
              <ul>
                {searchResults.map(user => (
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
          {searchQuery && searchResults.length === 0 && !isSearchingUsers && (
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
        {searchQuery && searchResults.length > 0 ? null : (
          chatListItems.length === 0 && !loadingChats ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <span className="text-gray-400 mb-3"><Search size={28} /></span>
              <p className="text-gray-700 font-medium text-base mb-1">No chats yet</p>
              <p className="text-sm text-gray-500">Start a new chat by searching for a user above</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {chatListItems.map(chat => (
                <li key={chat.id}>
                  <button
                    onClick={() => handleOpenChat(chat.id)}
                    className={`w-full block py-3 px-4 hover:bg-gray-100 transition-colors ${chat.id === selectedChatId ? 'bg-green-50' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <UserAvatar src={chat.otherParticipant?.avatar_url} alt={chat.otherParticipant?.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{chat.otherParticipant?.name}</p>
                        <p className="text-sm text-gray-500 truncate">{chat.lastMessage || 'No messages yet'}</p>
                      </div>
                      {chat.lastMessageTime && (
                        <span className="text-xs text-gray-500">{new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                      )}
                      {chat.unreadCount > 0 && (
                        <div className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mt-1">{chat.unreadCount}</div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );
};

export default ChatList;