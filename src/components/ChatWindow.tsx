import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import UserAvatar from './UserAvatar';
import LoadingSpinner from './LoadingSpinner';
import UserProfileCard from './UserProfileCard';
import { format, formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  chat_id: string;
  sender: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
  };
}

interface Chat {
  id: string;
  event_id: string | null;
  type: string;
  created_at: string;
  participants: { user_id: string }[];
  event?: {
    title: string;
    creator_id: string;
    end_time: string;
    pool_amount: number;
  };
}

const ChatWindow: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            *,
            sender:users_view(id, name, username, avatar_url)
          `)
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });
        
        if (messagesError) throw messagesError;
        setMessages(messagesData || []);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    const fetchChatAndParticipants = async () => {
      try {
        const {
          data: chatData,
          error: chatError,
        }: {
          data: Chat | null;
          error: any;
        } = await supabase
          .from('chats')
          .select(`
            id,
            event_id,
            type,
            event:events(
              id,
              creator_id,
              title,
              end_time,
              pool_amount
            ),
            participants (user_id)
          `)
          .eq('id', chatId)
          .single();

        if (chatError) throw chatError;
        console.log(chatData);

        if (chatData && chatData.type === 'private' && chatData.participants) {
          const otherParticipantId = chatData.participants.find(p => p.user_id !== currentUser?.id)?.user_id;
          if (otherParticipantId) {
            const { data: userData, error: userError } = await supabase
              .from('users_view')
              .select('*')
              .eq('id', otherParticipantId)
              .single();

            if (userError) throw userError;
            setOtherUser(userData);
          }
        }
      } catch (error) {
        console.error('Error fetching chat details or participants:', error);
      } finally {
        setLoading(false);
      }
    };

    if (chatId && currentUser) {
      fetchMessages();
      fetchChatAndParticipants();
    }
  }, [chatId, currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  const formatTimestamp = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "EEEE p");
    } catch {
      return "Invalid date";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && currentUser && chatId) {
      try {
        const { error } = await supabase
          .from('messages')
          .insert([
            {
              chat_id: chatId,
              sender_id: currentUser.id,
              content: message.trim(),
            },
          ]);

        if (error) throw error;
        setMessage('');
        fetchMessages(); // Refresh messages after sending
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const chatHeader = () => {
    if (loading) {
      return <div className="flex items-center justify-center w-full h-16"><LoadingSpinner /></div>;
    }

    if (otherUser) {
      return (
        <div className="flex items-center space-x-2">
          <UserAvatar src={otherUser.avatar_url || '/default-avatar.png'} alt={otherUser.username} size="md" />
          <div>
            <h6 className="font-semibold text-white">{otherUser.name}</h6>
            <p className="text-xs text-[#D1C4E9]">@{otherUser.username}</p>
          </div>
        </div>
      );
    }
    return <h2 className="font-semibold text-white">Chat</h2>;
  };

  return (
    <div className="flex flex-col h-screen bg-[#F3F3F3]"> {/* Light Gray Background */}
      {/* Top Bar */}
      <div className="bg-[#673AB7] p-3 flex items-center shadow-sm z-10"> {/* Deep Purple */}
        {/* Back Button Placeholder - Implement Navigation */}
        {/* <button onClick={() => {}} className="mr-3 text-white">
          <ArrowLeft size={24} />
        </button> */}
        {chatHeader()}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-grow overflow-y-auto p-3 space-y-2">
        {loading && (
          <div className="flex justify-center items-center py-10">
            <LoadingSpinner />
          </div>
        )}
        {!loading &&
          messages.map((msg) => {
            const isCurrentUserSender = msg.sender_id === currentUser?.id;
            const messageBg = isCurrentUserSender ? '#DCF8C6' : 'white'; // Light Green for current user, White for others
            const textColor = '#212121'; // Dark Gray text

            return (
              <div
                key={msg.id}
                className={`flex flex-col w-fit max-w-[80%] ${
                  isCurrentUserSender ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div
                  className={`rounded-lg p-2 shadow-sm text-sm ${messageBg}`}
                  style={{
                    borderBottomRightRadius: isCurrentUserSender ? '0rem' : '0.5rem',
                    borderBottomLeftRadius: isCurrentUserSender ? '0.5rem' : '0rem',
                  }}
                >
                  {!isCurrentUserSender && msg.sender?.username && (
                    <span className="font-semibold text-[#5E35B1] block mb-0.5">{msg.sender.username}</span>
                  )}
                  <p className={`text-[${textColor}] break-words`}>{msg.content}</p>
                  <span className="text-xs text-gray-500 self-end mt-0.5">{formatTimestamp(msg.created_at)}</span>
                </div>
              </div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="bg-white p-3 border-t border-gray-200 flex items-center gap-3 sticky bottom-0">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Start a message"
          className="flex-grow p-2.5 bg-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-purple-400 text-sm px-4"
        />
        <button
          type="submit"
          disabled={!message.trim() || loading}
          className="ml-3 p-2 bg-gradient-to-r from-[#6A0DAD] to-[#A020F0] text-white rounded-full disabled:opacity-50 transition-opacity hover:opacity-90 flex items-center justify-center w-10 h-10"
        >
          <Send size={20} />
        </button>
      </form>

      {/* Subscribe to new messages (moved to the end to ensure rendering) */}
      {chatId && (
        <ChatSubscription
          chatId={chatId}
          onNewMessage={(newMessage: Message) => {
            setMessages(prev => [...prev, newMessage]);
            scrollToBottom();
          }}
        />
      )}
    </div>
  );
};

interface ChatSubscriptionProps {
  chatId: string;
  onNewMessage: (message: Message) => void;
}

const ChatSubscription: React.FC<ChatSubscriptionProps> = ({ chatId, onNewMessage }) => {
  const subscription = useRef<any>(null);

  useEffect(() => {
    if (chatId) {
      subscription.current = supabase
        .channel(`chat:${chatId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        }, payload => {
          if (payload.new) {
            onNewMessage(payload.new as Message);
          }
        })
        .subscribe();

      return () => {
        if (subscription.current) {
          supabase.removeChannel(subscription.current);
        }
      };
    }
  }, [chatId, onNewMessage]);

  return null; // This component doesn't render anything
};

export default ChatWindow;