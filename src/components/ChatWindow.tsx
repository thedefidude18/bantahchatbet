import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Phone, Video } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import UserAvatar from './UserAvatar';
import LoadingSpinner from './LoadingSpinner';
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

interface ChatWindowProps {
 onNewMessageSent: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onNewMessageSent }) => {
 const { userId } = useParams<{ userId: string }>();
 const { currentUser } = useAuth();
 const [messages, setMessages] = useState<Message[]>([]);
 const [message, setMessage] = useState('');
 const [loading, setLoading] = useState(true);
 const messagesEndRef = useRef<HTMLDivElement>(null);
 const [otherUser, setOtherUser] = useState<any>(null);
 const [showProfile, setShowProfile] = useState(false);
 const navigate = useNavigate();

 const fetchMessages = async () => {
  try {
   if (!userId) {
    setLoading(false);
    return;
   }

   //Fetch Chat Id from chat_participants table.
   const { data: chatParticipantData, error: chatParticipantError } = await supabase
    .from('chat_participants')
    .select('chat_id')
    .eq('user_id', currentUser.id)



   if (chatParticipantError) throw chatParticipantError

   const chatId = chatParticipantData[0]?.chat_id;

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
  } finally {
   setLoading(false);
   scrollToBottom()
  }
 };

 useEffect(() => {
  const fetchChatAndParticipants = async () => {
   try {
    if (!userId) return;
    //Fetch Chat Id from chat_participants table.
    const { data: chatParticipantData, error: chatParticipantError } = await supabase
     .from('chat_participants')
     .select('chat_id')
     .eq('user_id', currentUser.id)



    if (chatParticipantError) throw chatParticipantError

    const chatId = chatParticipantData[0]?.chat_id;


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
      created_at
     `)
     .eq('id', chatId)
     .single();

    if (chatError) throw chatError;

     const { data: participantData, error: participantError } = await supabase
      .from('chat_participants')
      .select('user_id')
      .eq('chat_id', chatId)
      .neq('user_id', currentUser?.id)
      .single()

    if(participantError) throw participantError;

    const otherParticipantId = participantData?.user_id;

     if (otherParticipantId) {
      const { data: userData, error: userError } = await supabase
       .from('users_view')
       .select('*')
       .eq('id', otherParticipantId)
       .single();

      if (userError) throw userError;
      setOtherUser(userData);
     }

   } catch (error) {
    console.error('Error fetching chat details or participants:', error);
   } finally {
    setLoading(false);
   }
  };

  if (userId && currentUser) {
   fetchMessages();
   fetchChatAndParticipants();
  }
 }, [userId, currentUser]);

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
  if (message.trim() && currentUser && userId) {
   try {
    //Fetch Chat Id from chat_participants table.
    const { data: chatParticipantData, error: chatParticipantError } = await supabase
     .from('chat_participants')
     .select('chat_id')
     .eq('user_id', currentUser.id)



    if (chatParticipantError) throw chatParticipantError

    const chatId = chatParticipantData[0]?.chat_id;
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
    fetchMessages();
    onNewMessageSent();
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
    <div className="flex items-center justify-between p-4">
     <div className="flex items-center">
      <button onClick={() => navigate(-1)} className="text-black mr-2">
       <ArrowLeft className="h-6 w-6" />
      </button>
      <UserAvatar src={otherUser.avatar_url || '/default-avatar.png'} alt={otherUser.username} size="md" />
      <div className="ml-2">
       <h6 className="font-semibold text-black">{otherUser.name}</h6>
       <p className="text-xs text-gray-500">Online</p>
      </div>
     </div>
     <div className="flex items-center">
      <button className="text-gray-600 hover:text-gray-800 mr-2">
       <Phone className="h-5 w-5" />
      </button>
      <button className="text-gray-600 hover:text-gray-800">
       <Video className="h-5 w-5" />
      </button>
     </div>
    </div>
   );
  }
  return <h2 className="font-semibold text-white">Chat</h2>;
 };

 return (
  <div className="flex flex-col h-screen bg-[#F3F3F3]"> {/* Light Gray Background */}
   {/* Top Bar */}
   <div className="bg-[#673AB7] p-3 flex items-center shadow-sm z-10"> {/* White */}
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
      const messageAlignment = isCurrentUserSender ? 'self-end items-end' : 'self-start items-start';
      const messageBg = isCurrentUserSender ? 'bg-[#DCF8C6]' : 'bg-gray-100';
      const textColor =  '#212121'; // Dark Gray text
      const borderRadius = isCurrentUserSender ? 'border-bottom-right-radius: 0rem; border-bottom-left-radius: 0.5rem;' : 'border-bottom-right-radius: 0.5rem; border-bottom-left-radius: 0rem;';

      return (
       <div
        key={msg.id}
        className={`flex flex-col w-fit max-w-[80%] ${messageAlignment}`}
       >
        <div
         className={`rounded-lg p-2 shadow-sm text-sm ${messageBg}`}
         style={{ borderRadius }}
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
   {userId && (
    <ChatSubscription
     chatId={userId}
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