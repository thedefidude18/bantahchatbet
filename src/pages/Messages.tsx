import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Search, Plus, Users, Send, Smile, Image, Paperclip, ArrowLeft, MoreVertical } from 'lucide-react';
import MobileFooterNav from '../components/MobileFooterNav';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import UserAvatar from '../components/UserAvatar';
import { format } from 'date-fns';
import { useToast } from '../contexts/ToastContext';
import EmojiPicker from 'emoji-picker-react';
import { Menu } from '@headlessui/react';
import ChallengeModal from '../components/ChallengeModal';
import { useSocket } from '../contexts/SocketContext';
import { PrivateMessageReactions } from '../components/PrivateMessageReactions';
import ProfileCard from '../components/ProfileCard';

interface User {
  id: string;
  name: string;
  username: string;
  avatar_url: string;
  status?: 'online' | 'offline' | 'away';
  last_seen?: string;
  user_stats?: {
    rank: number;
    points: number;
  };
}

interface PrivateMessage {
  id: string;
  content: string;
  receiver_id: string;
  sender_id: string;
  created_at: string;
  sender: User;
  reply_to?: string;
  replied_to_message?: PrivateMessage;
  reactions?: { [key: string]: number };
}

interface MessagesProps {
  // ... existing props
}

const Messages: React.FC<MessagesProps> = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { socket, isConnected } = useSocket();
  const [selectedChat, setSelectedChat] = useState<User | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<PrivateMessage | null>(null);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const toast = useToast();

  // Add the challenge handler
  const handleChallenge = () => {
    setShowChallengeModal(true);
  };

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser?.id) return;

      try {
        setLoading(true);
        // First, get the users from the users table
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select(`
            id,
            name,
            username,
            avatar_url
          `)
          .neq('id', currentUser.id);

        if (usersError) throw usersError;

        // Then, get the user stats with correct columns
        const { data: statsData, error: statsError } = await supabase
          .from('user_stats')
          .select(`
            user_id,
            events_won,
            events_participated,
            total_earnings
          `);

        if (statsError) throw statsError;

        // Create a map of user stats
        const statsMap = new Map(
          statsData?.map(stat => [
            stat.user_id, 
            { 
              rank: stat.events_won || 0, // Using events_won as a simple ranking metric
              points: stat.total_earnings || 0
            }
          ]) || []
        );

        // Process users
        const combinedUsers = usersData?.map(user => ({
          ...user,
          status: 'offline',
          user_stats: statsMap.get(user.id) || { rank: 0, points: 0 }
        })) || [];

        // Sort by total earnings (points)
        const sortedUsers = combinedUsers.sort((a, b) => 
          (b.user_stats?.points || 0) - (a.user_stats?.points || 0)
        );
        
        setUsers(sortedUsers);
        setFilteredUsers(sortedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.showError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser?.id, toast]);

  // Add this debug log to check if users are being fetched
  useEffect(() => {
    console.log('Current users:', users);
    console.log('Filtered users:', filteredUsers);
  }, [users, filteredUsers]);

  // Filter users based on search query
  useEffect(() => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleUserSelect = async (userId: string) => {
    if (!currentUser?.id || !userId) return;

    // Verify the user exists first
    const { data: userExists } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (!userExists) {
      toast.showError('Selected user not found');
      return;
    }

    try {
      // First query for messages where current user is sender
      const { data: sentMessages, error: sentError } = await supabase
        .from('private_messages')
        .select('*')
        .eq('sender_id', currentUser.id)
        .eq('receiver_id', userId);

      if (sentError) throw sentError;

      // Second query for messages where current user is receiver
      const { data: receivedMessages, error: receivedError } = await supabase
        .from('private_messages')
        .select('*')
        .eq('sender_id', userId)
        .eq('receiver_id', currentUser.id);

      if (receivedError) throw receivedError;

      // Combine and sort messages
      const allMessages = [...(sentMessages || []), ...(receivedMessages || [])].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      const selectedUser = users.find(user => user.id === userId);
      if (selectedUser) {
        setSelectedChat(selectedUser);
        setMessages(allMessages);
        setShowMobileChat(true);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.showError('Failed to load messages');
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || !currentUser) return;

    const messageData = {
      content: message.trim(),
      sender_id: currentUser.id,
      receiver_id: selectedChat.id,
      notification_type: 'direct_message'
    };

    // Create temporary message for optimistic update
    const tempMessage = {
      id: crypto.randomUUID(),
      ...messageData,
      created_at: new Date().toISOString(),
      sender: currentUser
    };

    try {
      setMessages(prev => [...prev, tempMessage]);
      setMessage('');

      const { data, error } = await supabase
        .rpc('send_private_message', {
          p_content: messageData.content,
          p_sender_id: messageData.sender_id,
          p_receiver_id: messageData.receiver_id,
          p_notification_type: messageData.notification_type
        });

      if (error) throw error;

      // Get the first (and only) message from the returned array
      const insertedMessage = Array.isArray(data) ? data[0] : data;

      if (!insertedMessage) throw new Error('No message returned from server');

      // Update UI with saved message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id ? insertedMessage : msg
        )
      );

    } catch (error) {
      console.error('Error sending message:', error);
      toast.showError('Failed to send message');
      // Revert optimistic update
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setMessage(messageData.content);
    }
  };

  const handleReply = (message: PrivateMessage) => {
    setReplyingTo(message);
    // Focus the message input
    document.getElementById('message-input')?.focus();
  };

  useEffect(() => {
    if (!socket || !selectedChat || !currentUser) return;

    // Join private chat room
    socket.emit('join_private_chat', selectedChat.id);

    // Message handlers
    const handleNewMessage = (message: any) => {
      setMessages(prev => [...prev, message]);
    };

    socket.on('receive_message', handleNewMessage);

    return () => {
      socket.off('receive_message', handleNewMessage);
      socket.emit('leave_private_chat', selectedChat.id);
    };
  }, [socket, selectedChat, currentUser]);

  return (
    <div className="h-[100dvh] bg-[#1a1b2e] text-white flex flex-col">
      <div className="flex-1 lg:grid lg:grid-cols-[320px,1fr] h-full overflow-hidden">
        {/* Users Sidebar */}
        <div className={`h-full bg-[#242538] border-r border-white/10 flex flex-col ${showMobileChat ? 'hidden lg:block' : ''}`}>
          {/* Header section */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="font-semibold text-lg text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Messages ({filteredUsers.length})
                </h2>
              </div>
              <button 
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => {/* Handle new message */}}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full bg-[#1a1b2e] rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CCFF00]"
              />
            </div>
          </div>

          {/* Users list section */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/60 p-4">
                <Users className="w-12 h-12 mb-2" />
                <p className="text-center">No users found</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSelect(user.id)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-[#1a1b2e] transition-colors ${
                      selectedChat?.id === user.id ? 'bg-[#1a1b2e]' : ''
                    }`}
                  >
                    <div className="relative">
                      <UserAvatar
                        user={user}
                        className="w-12 h-12"
                      />
                      {user.status === 'online' && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#CCFF00] border-2 border-[#242538]"></div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium truncate">{user.name || 'Anonymous'}</p>
                      <p className="text-white/60 text-sm truncate">@{user.username || 'anonymous'}</p>
                      {user.user_stats && (
                        <p className="text-[#CCFF00] text-xs">
                          Rank #{user.user_stats.rank} • {user.user_stats.points} pts
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`h-full bg-[#1a1b2e] flex flex-col ${!showMobileChat ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'}`}>
          {selectedChat ? (
            <>
              {/* Chat Header - fixed */}
              <div className="bg-[#242538] p-3 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setShowMobileChat(false)} 
                      className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setShowProfileCard(true)}
                      className="flex items-center gap-3 hover:bg-white/10 p-2 rounded-lg transition-colors"
                    >
                      <UserAvatar
                        user={selectedChat}
                        className="w-10 h-10"
                      />
                      <div>
                        <h2 className="font-semibold text-white">{selectedChat.name}</h2>
                        <p className="text-sm text-white/60">@{selectedChat.username}</p>
                      </div>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleChallenge}
                      className="px-4 py-2 bg-[#CCFF00] text-black rounded-lg hover:bg-[#CCFF00]/90 transition-colors"
                    >
                      Challenge
                    </button>

                    <Menu as="div" className="relative">
                      <Menu.Button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </Menu.Button>
                      <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-[#242538] rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                className={`${
                                  active ? 'bg-white/10' : ''
                                } group flex w-full items-center px-4 py-2 text-sm text-white`}
                              >
                                Clear chat
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                className={`${
                                  active ? 'bg-white/10' : ''
                                } group flex w-full items-center px-4 py-2 text-sm text-red-500`}
                              >
                                Block user
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Menu>
                  </div>
                </div>
              </div>

              {/* Messages Area - scrollable */}
              <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                <div className="p-3 space-y-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'} group`}>
                      <div className={`max-w-[85%] ${msg.sender_id === currentUser?.id ? 'ml-4' : 'mr-4'}`}> {/* Increase max-width for mobile */}
                        {msg.reply_to && msg.replied_to_message && (
                          <div className="text-xs mb-1 p-1.5 rounded bg-black/10"> {/* Reduce size of reply preview */}
                            <div className="font-medium">{msg.replied_to_message.sender?.name}</div>
                            <div className="truncate">{msg.replied_to_message.content}</div>
                          </div>
                        )}
                        <div className={`rounded-2xl px-3 py-2 ${
                          msg.sender_id === currentUser?.id 
                            ? 'bg-[#CCFF00] text-black rounded-br-sm' 
                            : 'bg-[#2C2D44] text-white/90 rounded-bl-sm'
                        }`}>
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-xs opacity-75">{msg.sender?.name}</span>
                          </div>
                          <p className="text-sm break-words">{msg.content}</p>
                          
                          <PrivateMessageReactions
                            messageId={msg.id}
                            reactions={msg.reactions || []}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input Area - fixed at bottom */}
              <div className="shrink-0 bg-[#242538] border-t border-white/10 p-2 md:p-3">
                <div className="relative flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Smile className="w-4 h-4 text-white/60" />
                    </button>
                    
                    <label className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                      <Image className="w-4 h-4 text-white/60" />
                      <input type="file" className="hidden" accept="image/*" />
                    </label>
                  </div>

                  <input
                    id="message-input"
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-[#1a1b2e] text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#CCFF00]"
                  />
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="p-1.5 rounded-lg bg-[#CCFF00] text-black hover:bg-[#CCFF00]/90 disabled:opacity-50 disabled:hover:bg-[#CCFF00]"
                  >
                    <Send className="w-4 h-4" />
                  </button>

                  {showEmojiPicker && (
                    <div className="absolute bottom-full right-0 mb-2 z-50">
                      <EmojiPicker
                        onEmojiClick={(emojiData) => {
                          setMessage(prev => prev + emojiData.emoji);
                          setShowEmojiPicker(false);
                        }}
                        theme="dark"
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-white/60 bg-[#1a1b2e]">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                <p>Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>

        {/* Profile Card Modal */}
        {showProfileCard && selectedChat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="relative w-full max-w-lg mx-4">
              <ProfileCard
                profile={selectedChat}
                onClose={() => setShowProfileCard(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Only show MobileFooterNav when not in chat view on mobile */}
      {!showMobileChat && <MobileFooterNav />}

      {showChallengeModal && selectedChat && (
        <ChallengeModal
          challengerId={currentUser?.id}
          challengedId={selectedChat.id}
          challengedName={selectedChat.name}
          challengedUsername={selectedChat.username}
          challengedAvatar={selectedChat.avatar_url}
          onClose={() => setShowChallengeModal(false)}
          onSuccess={() => {
            setShowChallengeModal(false);
            // Optionally send a message about the challenge
            handleSendMessage();
          }}
        />
      )}
    </div>
  );
};

export default Messages;
