import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Search, Phone, Video, Info, Image, Smile, Send, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import UserAvatar from './UserAvatar';
import MobileFooterNav from './MobileFooterNav';
import { useChat } from '../hooks/useChat';
import ChatMessage from './ChatMessage';
import { io, Socket } from 'socket.io-client';
import { useToast } from '../contexts/ToastContext';

interface Chat {
  id: string;
  title: string;
  avatar?: string;
  lastMessage?: {
    content: string;
    timestamp: string;
  };
  unreadCount?: number;
}

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const toast = useToast();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);

  const {
    messages,
    sendMessage,
    loading,
    chats,
    toggleReaction,
    refreshMessages
  } = useChat(selectedChat?.id);

  // Add this function to fetch private messages
  const fetchPrivateMessages = useCallback(async () => {
    if (!selectedChat || !currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('private_messages')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .or(`sender_id.eq.${selectedChat.id},receiver_id.eq.${selectedChat.id}`)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching private messages:', error);
      toast.showError('Failed to load messages');
    }
  }, [selectedChat, currentUser]);

  // Add this effect to load messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchPrivateMessages();
    }
  }, [selectedChat, fetchPrivateMessages]);

  // Update the socket listener to add new messages to the state
  useEffect(() => {
    if (!currentUser) return;

    const socketUrl = new URL(import.meta.env.VITE_SOCKET_URL);
    const socket = io(socketUrl.toString(), {
      auth: {
        token: currentUser.token,
        userId: currentUser.id
      },
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('private_message', (message) => {
      console.log('Received private message:', message);
      // Add the new message to the state
      setMessages(prev => [...prev, message]);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  // Join private chat room when a chat is selected
  useEffect(() => {
    if (!socketRef.current || !selectedChat) return;

    console.log('[Chat Debug] Setting up socket listeners for chat:', selectedChat.id);
    
    socketRef.current.emit('join_private_chat', {
      chat_id: selectedChat.id
    });

    socketRef.current.on('joined_private_chat', (data) => {
      console.log('[Chat Debug] Joined private chat room:', data.chat_id);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('joined_private_chat');
        socketRef.current.emit('leave_private_chat', {
          chat_id: selectedChat.id
        });
      }
    };
  }, [selectedChat]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat || !socketRef.current) return;
    
    try {
      // Use WebSocket to send the message
     socketRef.current.emit('send_private_message', {
       content: messageText.trim(),
       sender_id: currentUser.id,
       receiver_id: selectedChat.id,
       notification_type: 'direct_message'
     });
      
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.showError('Failed to send message');
    }
  };

  // Ensure no Supabase operations are used for sending messages
  // Remove any Supabase-related code for message sending
  const handleReply = (messageId: string) => {
    const messageToReply = messages.find(m => m.id === messageId);
    if (messageToReply) {
      setReplyingTo(messageToReply);
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="lg:grid lg:grid-cols-[350px,1fr] h-screen">
        {/* Chat List Sidebar */}
        <div className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 
          ${showMobileChat ? 'hidden lg:block' : ''}`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chats</h1>
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search messages"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 
                  text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="overflow-y-auto h-[calc(100vh-140px)]">
            {filteredChats.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No chats available
              </div>
            ) : (
              filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => {
                    setSelectedChat(chat);
                    setShowMobileChat(true);
                  }}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800
                    ${selectedChat?.id === chat.id ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                >
                  <UserAvatar
                    src={chat.avatar}
                    alt={chat.title}
                    size="lg"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {chat.title}
                      </h3>
                      {chat.lastMessage?.timestamp && (
                        <span className="text-xs text-gray-500">
                          {chat.lastMessage.timestamp}
                        </span>
                      )}
                    </div>
                    {chat.lastMessage?.content && (
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {chat.unreadCount && chat.unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs font-bold rounded-full 
                      w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {chat.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        {selectedChat ? (
          <div className={`flex flex-col h-screen ${!showMobileChat ? 'hidden lg:flex' : ''}`}>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
              <button
                onClick={() => setShowMobileChat(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 
                  dark:hover:text-gray-200"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <UserAvatar
                src={selectedChat.avatar}
                alt={selectedChat.title}
                size="lg"
              />
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {selectedChat.title}
                </h2>
                <p className="text-sm text-gray-500">Active now</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                  dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                  dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                  dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isOwnMessage={message.sender_id === currentUser.id}
                  onReply={handleReply}
                  onReaction={toggleReaction}
                />
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {replyingTo && (
                <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Replying to: {replyingTo.content}
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                  dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Image className="w-6 h-6" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                  dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Smile className="w-6 h-6" />
                </button>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 
                    text-gray-900 dark:text-white focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="p-2 text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 
                    rounded-full disabled:opacity-50"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex items-center justify-center h-screen">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No chat selected
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
      <MobileFooterNav />
    </div>
  );
};

export default Messages;
