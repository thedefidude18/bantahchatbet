import supabase from '@/lib/supabase.js';

import React, { useState, useEffect, ChangeEvent } from 'react';
import PageHeader from '../components/PageHeader';
import MobileFooterNav from '../components/MobileFooterNav';
import { useAuth } from '../contexts/AuthContext';
import ChatWindow from '../components/ChatWindow';
import { usePrivateChat } from '../hooks/usePrivateChat';

const Messages: React.FC = () => {
  const [chatPartners, setChatPartners] = useState<{ user_id: string }[]>([]);
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { searchUsers } = usePrivateChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeChats, setActiveChats] = useState<string[]>([]);

  useEffect(() => {
    const fetchChatPartners = async () => {
      if (!currentUser) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_chat_partners', {
          user_id: currentUser.id,
        });
        if (error) throw error
        setChatPartners(data || []);
        setActiveChats(data.map((partner) => partner.user_id));
      } catch (error) {
        console.error('Error fetching chat partners:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChatPartners();
  }, [currentUser]);
  

  const handleSearchChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    
    if (!newSearchTerm) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true)
    try {
      const response = await searchUsers(newSearchTerm);
      const data = response?.data
      const error = response?.error
      if (error || !data) setSearchResults([]);
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    if (!activeChats.includes(userId)) {
      setActiveChats([...activeChats, userId]);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1b2e]">
      <PageHeader title="Messages" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4 relative">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchResults.length > 0 && (
            <ul className="absolute z-10 w-full bg-gray-800 border border-gray-300 rounded-md mt-1">
              {searchResults.map((user) => (
                <li
                  key={user.id}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                  onClick={() => handleUserClick(user.id)}
                >
                  {user.name || user.username}
                </li>
              ))}
            </ul>
          )}
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {activeChats.map((userId) => (
              <ChatWindow receiverId={userId} key={userId}/>
            ))}
            {chatPartners.length === 0 && <div>No chats yet.</div>}
          </div>
        )}
      </div>
      
      <MobileFooterNav />
    </div>
  );
};

export default Messages;

