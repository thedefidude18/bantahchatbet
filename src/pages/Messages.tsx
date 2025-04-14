import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import MobileFooterNav from '../components/MobileFooterNav';
import { supabase } from '../lib/supabase';
import { Search } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface User {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface LastMessage {
  content: string;
  created_at: string;
  sender_id: string;
  sender_name: string;
}

interface ChatListItem {
  chat_id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar_url: string | null;
  last_message: LastMessage | null;
  unread_count: number; // You'll need to implement logic for this
}

const Messages: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [chatListItems, setChatListItems] = useState<ChatListItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [refreshChatList, setRefreshChatList] = useState(false);

  const handleNewMessageSent = () => {
    setRefreshChatList(prev => !prev);
  };

  useEffect(() => {
    const fetchChatList = async () => {
      try {
        if (!currentUser) return;

        // Fetch all chats the current user is a participant in
        const { data: chatParticipants, error: participantsError } = await supabase
          .from('chat_participants')
          .select('chat_id')
          .eq('user_id', currentUser.id);

        if (participantsError) {
          console.error('Error fetching chat participants:', participantsError);
          return;
        }

        const chatIds = chatParticipants.map(p => p.chat_id);
        if (chatIds.length === 0) {
          setChatListItems([]);
          return;
        }

        // Fetch details for each chat
        const chatDetailsPromises = chatIds.map(async (chatId) => {
          // Find the other participant in the chat
          const { data: otherParticipant, error: otherParticipantError } = await supabase
            .from('chat_participants')
            .select('user_id')
            .eq('chat_id', chatId)
            .neq('user_id', currentUser.id)
            .single();

          if (otherParticipantError) {
            console.error(`Error fetching other participant for chat ${chatId}:`, otherParticipantError);
            return null;
          }

          const otherUserId = otherParticipant?.user_id;
          if (!otherUserId) return null;

          // Fetch the other user's details
          const { data: otherUser, error: otherUserError } = await supabase
            .from('users_view')
            .select('id, name, avatar_url')
            .eq('id', otherUserId)
            .single();

          if (otherUserError) {
            console.error(`Error fetching user details for ${otherUserId}:`, otherUserError);
            return null;
          }

          // Fetch the last message in the chat
          const { data: lastMessageData, error: lastMessageError } = await supabase
            .from('messages')
            .select('content, created_at, sender_id, sender:users_view(name)')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (lastMessageError && lastMessageError.code !== 'PGRST116') { // Ignore "no rows found" error
            console.error(`Error fetching last message for chat ${chatId}:`, lastMessageError);
            return null;
          }

          const lastMessage: LastMessage | null = lastMessageData
            ? {
                content: lastMessageData.content,
                created_at: lastMessageData.created_at,
                sender_id: lastMessageData.sender_id,
                sender_name: lastMessageData.sender?.name || 'Unknown',
              }
            : null;

          // TODO: Implement logic to fetch unread message count
          const unread_count = 0;

          return {
            chat_id: chatId,
            other_user_id: otherUser.id,
            other_user_name: otherUser.name,
            other_user_avatar_url: otherUser.avatar_url,
            last_message: lastMessage,
            unread_count: unread_count,
          };
        });

        const chatListResults = await Promise.all(chatDetailsPromises);
        setChatListItems(chatListResults.filter(item => item !== null) as ChatListItem[]);
      } catch (error) {
        console.error('Error fetching chat list:', error);
      }
    };

    fetchChatList();
  }, [currentUser, refreshChatList]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (searchQuery) {
          const { data, error } = await supabase
            .from('users_view')
            .select('id, name, avatar_url')
            .ilike('name', `%${searchQuery}%`)
            .limit(10);

          if (error) {
            console.error('Error searching users:', error);
          } else {
            setUsers(data || []);
          }
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [searchQuery, isSearchModalOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const openSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
    setSearchQuery(''); // Clear search query when closing
    setUsers([]);//Clear user data
  };

  const handleUserClick = (userId: string) => {
    navigate(`/messages/${userId}`);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header title="Messages" showBackButton={false} />
      <div className="container mx-auto mt-4 flex-grow">
        <h1 className="text-2xl font-bold mb-4">Messages</h1>

        {/* Chat List */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Chats</h2>
          {chatListItems.length > 0 ? (
            <div className="flex flex-col space-y-3">
              {chatListItems.map(item => (
                <div
                  key={item.chat_id}
                  className="bg-white p-4 rounded-md shadow-sm cursor-pointer hover:bg-gray-100"
                  onClick={() => handleUserClick(item.other_user_id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={item.other_user_avatar_url || '/avatar.svg'}
                        alt={item.other_user_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {item.unread_count > 0 && (
                        <div className="absolute top-0 right-0 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                          {item.unread_count}
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h6 className="font-semibold">{item.other_user_name}</h6>
                      {item.last_message && (
                        <p className="text-sm text-gray-600 truncate">
                          {item.last_message.sender_id === currentUser?.id ? 'You: ' : `${item.last_message.sender_name}: `}
                          {item.last_message.content}
                        </p>
                      )}
                    </div>
                    {item.last_message?.created_at && (
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(item.last_message.created_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No active chats yet.</p>
          )}
        </div>

        {/* Search Icon */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">New Message</h2>
          <button
            onClick={openSearchModal}
            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
          >
            <Search className="h-6 w-6" />
          </button>
        </div>

        {/* Display Searched users (Modal or inline) */}
        {isSearchModalOpen && (
          <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-md p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Search Users</h2>
                <button onClick={closeSearchModal} className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                placeholder="Search by name"
                className="w-full p-2 border rounded mb-2"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {users.length > 0 ? (
                <div className="flex flex-col">
                  {users.map(user => (
                    <div
                      key={user.id}
                      className="mb-2 p-3 border rounded shadow-sm cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        handleUserClick(user.id);
                        closeSearchModal();
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <img
                          src={user.avatar_url || '/avatar.svg'}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <h6 className="font-semibold">{user.name}</h6>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery && <p>No users found.</p>}
            </div>
          </div>
        )}
      </div>
      <MobileFooterNav />
    </div>
  );
};

export default Messages;