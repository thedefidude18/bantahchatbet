import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import MobileFooterNav from '../components/MobileFooterNav';

interface User {
 id: string;
 name: string;
 avatar_url: string | null;
}

const Messages: React.FC = () => {
 const { chatId } = useParams<{ chatId: string }>();
 const [users, setUsers] = useState<User[]>([]);
 const [searchQuery, setSearchQuery] = useState('');
 const navigate = useNavigate();
 const { currentUser } = useAuth();

 useEffect(() => {
  // Fetch users from your data source here
  // Replace this with your actual data fetching logic
  const fetchUsers = async () => {
   try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    const data = await response.json();
    setUsers(data.map((user: any) => ({
     id: user.id.toString(),
     name: user.name,
     avatar_url: null, // Replace with actual avatar URL if available
    })));
   } catch (error) {
    console.error('Error fetching users:', error);
   }
  };

  fetchUsers();
 }, []);

 const filteredUsers = users.filter(user =>
  user.name.toLowerCase().includes(searchQuery.toLowerCase())
 );

 return (
  <div className="h-screen flex flex-col">
   <Header title="Messages" showBackButton={true} />
   <div className="container mx-auto mt-4 flex-grow">
    <h1 className="text-2xl font-bold mb-4">Messages</h1>
    <input
     type="text"
     placeholder="Search users..."
     value={searchQuery}
     onChange={(e) => setSearchQuery(e.target.value)}
     className="mb-4 border rounded px-2 py-1"
    />
    {filteredUsers.length > 0 ? (
     <div className="flex flex-col">
      {filteredUsers.map(user => {
       const avatarUrl = user.avatar_url || currentUser?.avatar_url || null;
       return (
        <div key={user.id} className="mb-2 p-4 border rounded shadow-md">
         <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{user.name}</h2>
          <img
           src={avatarUrl || '/avatar.svg'}
           alt={user.name}
           className="w-8 h-8 rounded-full"
          />
         </div>
         <button
          onClick={() => {
           navigate(`/messages/${user.id}`)
          }}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
         >
          Chat
         </button>
        </div>
       );
      })}
     </div>
    ) : (
     <p>No chats yet. Search for users to start a conversation!</p>
    )}
   </div>
   <MobileFooterNav />
  </div>
 );
};

export default Messages;