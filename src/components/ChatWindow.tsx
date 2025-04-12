import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import UserAvatar from './UserAvatar';
import LoadingSpinner from './LoadingSpinner';
import UserProfileCard from './UserProfileCard';
import ChatBubble from './ChatBubble';

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
}

const ChatWindow: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender:users_view(id, name, username, avatar_url)
          `)
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        setMessages(data);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchOtherUser = async () => {
      try {
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .select(`
            id,
            event_id,
            type,
            event:events(
              id,
              creator_id,
              title
            )
          `)
          .eq('id', chatId)
          .single();

        if (chatError) throw chatError;

        if (chatData.event_id) {
          // This is an event chat
          const { data: eventParticipants, error: participantsError } = await supabase
            .from('event_participants')
            .select('user_id')
            .eq('event_id', chatData.event_id)
            .neq('user_id', currentUser?.id)
            .single();

          if (participantsError) throw participantsError;

          if (eventParticipants) {
            const { data: userData, error: userError } = await supabase
              .from('users_view')
              .select('*')
              .eq('id', eventParticipants.user_id)
              .single();

            if (userError) throw userError;
            setOtherUser(userData);
          }
        }
      } catch (error) {
        console.error('Error fetching other user:', error);
      }
    };

    if (chatId && currentUser) {
      fetchMessages();
      fetchOtherUser();

      // Subscribe to new messages
      const subscription = supabase
        .channel(`chat:${chatId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        }, payload => {
          setMessages(prev => [...prev, payload.new as Message]);
          scrollToBottom(); // Scroll to bottom on new message
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [chatId, currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            chat_id: chatId,
            sender_id: currentUser.id,
            content: newMessage.trim(),
          },
        ]);

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b p-4 flex items-center space-x-3">
        <button
          onClick={() => setShowProfile(true)}
          className="focus:outline-none"
        >
          <UserAvatar src={otherUser?.avatar_url} alt={otherUser?.name} size="md" />
        </button>
        <div className="flex-1">
          <h2 className="font-semibold">{otherUser?.name}</h2>
          <p className="text-sm text-gray-500">@{otherUser?.username}</p>
        </div>
      </div>

      {showProfile && otherUser && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <UserProfileCard
            user={otherUser}
            onClose={() => setShowProfile(false)}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            content={message.content}
            timestamp={message.created_at}
            isSender={message.sender_id === currentUser?.id}
            isRead={false} // You'll need to implement read status logic
            senderAvatar={message.sender?.avatar_url}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;