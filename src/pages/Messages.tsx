import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import MobileFooterNav from '../components/MobileFooterNav';
import { supabase } from '../lib/supabase';
import { Search } from 'lucide-react';

interface User {
 id: string;
 name: string;
 avatar_url: string | null;
}

const Messages: React.FC = () => {
 const { chatId } = useParams<{ chatId: string }>();
 const [topUsers, setTopUsers] = useState<User[]>([]);
 const [users, setUsers] = useState<User[]>([]);
 const [searchQuery, setSearchQuery] = useState('');
 const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
 const navigate = useNavigate();
 const { currentUser } = useAuth();

 const [refreshTopUsers, setRefreshTopUsers] = useState(false);

 const handleNewMessageSent = () => {
  setRefreshTopUsers(prev => !prev);
 };

 useEffect(() => {
  const fetchTopUsers = async () => {
   try {
    if (!currentUser) return;

    // Find the users with whom the current user has chats with
    const { data, error } = await supabase
     .from('chat_participants')
     .select('chat_id, user_id')
     .eq('user_id', currentUser.id);

    if (error) {
     console.error('Error fetching top users:', error);
     return;
    }

    // Extract the chat IDs
    const chatIds = data.map((item) => item.chat_id);

    // Fetch other user's ids from those chats
    const { data: otherParticipants, error: otherError } = await supabase
     .from('chat_participants')
     .select('user_id')
     .in('chat_id', chatIds)
     .neq('user_id', currentUser.id)
     .limit(5);

    if (otherError) {
     console.error('Error fetching top users:', otherError);
     return;
    }

    const otherUserIds = otherParticipants.map((item) => item.user_id);

    // Fetch user details from the users_view table
    const { data: usersData, error: usersError } = await supabase
     .from('users_view')
     .select('id, name, avatar_url')
     .in('id', otherUserIds);

    if (usersError) {
     console.error('Error fetching user details:', usersError);
     return;
    }

    setTopUsers(usersData || []);
   } catch (error) {
    console.error('Error fetching top users:', error);
   }
  };

  fetchTopUsers();
 }, [currentUser, refreshTopUsers]);

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
   <Header title="Messages" showBackButton={true} />
   <div className="container mx-auto mt-4 flex-grow">
    <h1 className="text-2xl font-bold mb-4">Messages</h1>

    {/* Top Users */}
    <div className="mb-4">
     <h2 className="text-lg font-semibold mb-2">Top Users</h2>
     <div className="flex overflow-x-auto">
      {topUsers.map(user => (
       <div key={user.id} className="mr-4 flex flex-col items-center cursor-pointer"
        onClick={() => handleUserClick(user.id)}>
        <div className="relative">
         <img
          src={user.avatar_url || '/avatar.svg'}
          alt={user.name}
          className="w-16 h-16 rounded-full object-cover"
         />
         <div className="absolute inset-0 rounded-full border-2 border-blue-500"></div>
        </div>
        <p className="text-center text-sm mt-2">{user.name}</p>
       </div>
      ))}
     </div>
    </div>

    {/* Search Icon (replaces search bar) */}
    <button
     onClick={openSearchModal}
     className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
    >
     <Search className="h-6 w-6" />
    </button>

    {/* Display Searched users*/}
    {users.length > 0 ? (
     <div className="flex flex-col">
      {users.map(user => {
       const avatarUrl = user.avatar_url || currentUser?.avatar_url || null;
       return (
        <div key={user.id} className="mb-2 p-4 border rounded shadow-md cursor-pointer"
         onClick={() => handleUserClick(user.id)}>
         <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{user.name}</h2>
          <img
           src={avatarUrl || '/avatar.svg'}
           alt={user.name}
           className="w-8 h-8 rounded-full"
          />
         </div>
        </div>
       );
      })}
     </div>
    ) : ( <p>No messages found, start a new message here</p> )}
   </div>
   <MobileFooterNav />
  </div>
 );
};

export default Messages;