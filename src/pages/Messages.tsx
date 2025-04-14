import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import MobileFooterNav from '../components/MobileFooterNav';
import { supabase } from '../lib/supabase';
import { Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns'; // For relative timestamps
import { Presence } from 'supabase-js'; // Import Presence

interface User {
  id: string;
  name: string;
  avatar_url: string | null;
  is_online?: boolean; // Add is_online status
}

interface LastMessage {
  content: string;
  created_at: string;
  sender_id: string;
  sender_name?: string; // Optional sender name if fetched
}

interface ChatListItem {
  chat_id: string;
  other_user: User;
  last_message: LastMessage | null;
  unread_count: number; // Placeholder for unread count
}

// --- ChatListItemSkeleton Component ---
const ChatListItemSkeleton: React.FC = () => (
  <div className="bg-white p-3 rounded-lg shadow-sm flex items-center space-x-3 animate-pulse">
    {/* Avatar Placeholder */}
    <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0"></div>
    {/* Text Placeholders */}
    <div className="flex-grow min-w-0 space-y-2">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div> {/* Name Placeholder */}
      <div className="h-3 bg-gray-300 rounded w-1/2"></div> {/* Message Placeholder */}
    </div>
    {/* Timestamp Placeholder */}
    <div className="h-3 bg-gray-300 rounded w-10 flex-shrink-0"></div>
  </div>
);


const Messages: React.FC = () => {
  const [chatListItems, setChatListItems] = useState<ChatListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChatList, setFilteredChatList] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set()); // State for online users
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all'); // State for active filter
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [refreshChatList, setRefreshChatList] = useState(false);

  const handleNewMessageSent = () => {
    setRefreshChatList(prev => !prev); // Trigger a refresh when a message is sent
  };

  // --- Presence Effect ---
  useEffect(() => {
    if (!currentUser) return;

    const presenceChannel = supabase.channel(`user_presence_${currentUser.id}`);

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState<User>();
        const onlineUserIds = Object.keys(newState).map(key => newState[key][0].id);
        setOnlineUsers(new Set(onlineUserIds));
        console.log('Presence sync, online:', onlineUserIds);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Presence join:', key, newPresences);
        setOnlineUsers(prev => new Set([...prev, newPresences[0].id]));
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Presence leave:', key, leftPresences);
        setOnlineUsers(prev => {
            const next = new Set(prev);
            leftPresences.forEach(p => next.delete(p.id));
            return next;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Presence subscribed, tracking user:', currentUser.id);
          await presenceChannel.track({ id: currentUser.id, online_at: new Date().toISOString() });
        } else if (status === 'CLOSED') {
            console.log('Presence channel closed');
        } else {
            console.log('Presence status:', status);
        }
      });

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [currentUser]);


  useEffect(() => {
    const fetchChatList = async () => {
      setLoading(true);
      try {
        if (!currentUser) return;

        // 1. Fetch all chat_ids where the current user is a participant
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
          setLoading(false);
          return;
        }

        // 2. Fetch details for each chat (other participant, last message)
        const chatDetailsPromises = chatIds.map(async (chatId) => {
          // Fetch the other participant's user_id
          const { data: otherParticipant, error: otherParticipantError } = await supabase
            .from('chat_participants')
            .select('user_id')
            .eq('chat_id', chatId)
            .neq('user_id', currentUser.id)
            .single(); // Assuming private chats have only two participants

          if (otherParticipantError || !otherParticipant) {
           // console.warn(`Could not find other participant for chat ${chatId}:`, otherParticipantError);
            return null; // Skip this chat if no other participant found
          }
          const otherUserId = otherParticipant.user_id;

          // Fetch other user's details
          const { data: otherUser, error: otherUserError } = await supabase
            .from('users_view')
            .select('id, name, avatar_url')
            .eq('id', otherUserId)
            .single();

          if (otherUserError || !otherUser) {
            console.error(`Error fetching user details for ${otherUserId}:`, otherUserError);
            return null; // Skip if user details not found
          }

          // Fetch the last message for the chat
          const { data: lastMessageData, error: lastMessageError } = await supabase
            .from('messages')
            .select('content, created_at, sender_id, sender:users_view(name)')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(); // Use maybeSingle to handle chats with no messages yet

          if (lastMessageError) {
              console.error(`Error fetching last message for chat ${chatId}:`, lastMessageError);
              // We might still want to show the chat, just without a last message preview
          }

          const lastMessage: LastMessage | null = lastMessageData
            ? {
                content: lastMessageData.content,
                created_at: lastMessageData.created_at,
                sender_id: lastMessageData.sender_id,
                sender_name: lastMessageData.sender?.name || '...', // Placeholder if sender name isn't joined properly
              }
            : null;

          return {
            chat_id: chatId,
            other_user: otherUser,
            last_message: lastMessage,
            // is_online will be updated by the presence effect
            unread_count: 0, // Placeholder - Implement unread count logic here
          };
        });

        const chatListResults = (await Promise.all(chatDetailsPromises))
                                    .filter(item => item !== null) as ChatListItem[];

        // Sort chats by the last message timestamp (most recent first)
        chatListResults.sort((a, b) => {
            if (!a.last_message) return 1; // Chats without messages go to the bottom
            if (!b.last_message) return -1;
            return new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime();
        });


        setChatListItems(chatListResults);

      } catch (error) {
        console.error('Error fetching chat list:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatList();
  }, [currentUser, refreshChatList]);

  // --- Update Online Status in List Effect ---
  useEffect(() => {
      const updateOnlineStatus = (list: ChatListItem[]) => list.map(item => ({
          ...item,
          other_user: {
              ...item.other_user,
              is_online: onlineUsers.has(item.other_user.id)
          }
      }));

      setChatListItems(prevItems => updateOnlineStatus(prevItems));
      // Also update the filtered list if it's currently showing results
      if (filteredChatList.length > 0 || searchQuery) {
        setFilteredChatList(prevItems => updateOnlineStatus(prevItems));
      }
  }, [onlineUsers]); // Rerun whenever onlineUsers changes

  // Filter logic based on search query AND active filter
  useEffect(() => {
    let listToFilter = chatListItems;

    // Apply active filter first
    if (activeFilter === 'unread') {
      // Filter based on unread_count - requires unread logic to be implemented
      listToFilter = listToFilter.filter(item => item.unread_count > 0);
    }

    // Apply search query
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = listToFilter.filter(item =>
        (item.other_user.name && typeof item.other_user.name === 'string' && item.other_user.name.toLowerCase().includes(lowerCaseQuery)) ||
        (item.last_message?.content && typeof item.last_message.content === 'string' && item.last_message.content.toLowerCase().includes(lowerCaseQuery))
      );
      setFilteredChatList(filtered);
    } else {
      setFilteredChatList(listToFilter); // Show filtered list (or all if no filter active) if search is empty
    }
  }, [searchQuery, chatListItems, activeFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleUserClick = (userId: string) => {
    navigate(`/messages/${userId}`);
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50"> {/* Light background */}
      <Header title="Messages" showBackButton={false} /> {/* No back button on main messages list */}
      <div className="container mx-auto mt-4 px-4 flex-grow flex flex-col">
        {/* Modern Search Bar */}
        <div className="relative mb-4">
           <span className="absolute inset-y-0 left-0 flex items-center pl-3">
               <Search className="h-5 w-5 text-gray-400" />
           </span>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
          />
        </div>

        {/* Filter/Sort Bar */}
        <div className="flex space-x-2 mb-4 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${ 
              activeFilter === 'all' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('unread')}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${ 
              activeFilter === 'unread' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Unread
          </button>
          {/* Add more filter/sort options here */}
        </div>

        {/* Chat List */}
        <div className="flex-grow overflow-y-auto">
          {loading ? (
             <div className="space-y-2">
             {/* Render multiple skeletons */}
             <ChatListItemSkeleton />
             <ChatListItemSkeleton />
             <ChatListItemSkeleton />
             <ChatListItemSkeleton />
           </div>
          ) : filteredChatList.length > 0 ? (
             <div className="space-y-2">
              {filteredChatList.map(item => (
                <div
                  key={item.chat_id}
                  className="bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition-colors duration-150 flex items-center space-x-3"
                  onClick={() => handleUserClick(item.other_user.id)}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.other_user.avatar_url || '/avatar.svg'} // Ensure you have a default avatar
                      alt={item.other_user.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    />
                    {/* Online/Offline Badge */}
                    <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white ${ 
                      item.other_user.is_online ? 'bg-green-500' : 'bg-gray-400'
                    }`}></span>
                  </div>
                  {/* Chat Info */}
                  <div className="flex-grow min-w-0"> {/* min-w-0 prevents text overflow issues */}
                    <div className="flex justify-between items-center mb-1">
                      <h6 className="font-semibold text-gray-800 truncate">{item.other_user.name}</h6>
                      {item.last_message?.created_at && (
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {formatRelativeTime(item.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    {item.last_message ? (
                      <p className="text-sm text-gray-600 truncate">
                        {item.last_message.sender_id === currentUser?.id ? 'You: ' : ''}
                        {item.last_message.content}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No messages yet</p>
                    )}
                  </div>
                   {/* Unread Badge (Placeholder) */}
                   {item.unread_count > 0 && (
                     <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                       {item.unread_count < 10 ? item.unread_count : '9+'}
                     </div>
                   )} 
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500 text-center">
                {searchQuery 
                    ? 'No matching chats found.' 
                    : activeFilter === 'unread' 
                    ? 'No unread messages.' 
                    : 'No chats yet. Start a conversation!'}
              </p>
            </div>
          )}
        </div>
      </div>
      <MobileFooterNav />
    </div>
  );
};

export default Messages;
