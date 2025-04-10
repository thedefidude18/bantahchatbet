import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useSupabase } from '../contexts/SupabaseContext';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

export function useEventChat(eventId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const { supabase } = useSupabase();
  const toast = useToast();

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!eventId || !supabase) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:profiles(id, username, avatar_url)')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast.showError('Failed to load messages');
      } else {
        setMessages(data as Message[]);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.showError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [eventId, supabase, toast]);

  // Set up Supabase Realtime subscription
  useEffect(() => {
    if (!eventId || !supabase || !currentUser) {
      setIsLoading(false);
      return;
    }

    fetchMessages();

    // Set up Supabase Realtime channel
    const channel = supabase
      .channel(`event_chat_${eventId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `event_id=eq.${eventId}` 
        },
        (payload) => {
          // Handle new message
          const newMessage = payload.new as any;
          
          // Fetch the sender information if not included in the payload
          if (!newMessage.sender) {
            supabase
              .from('profiles')
              .select('id, username, avatar_url')
              .eq('id', newMessage.sender_id)
              .single()
              .then(({ data: senderData }) => {
                if (senderData) {
                  const messageWithSender = {
                    ...newMessage,
                    sender: senderData
                  };
                  setMessages(prev => [...prev, messageWithSender as Message]);
                }
              });
          } else {
            setMessages(prev => [...prev, newMessage as Message]);
          }
        }
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Connected to Supabase Realtime for event:', eventId);
          setIsConnected(true);
        } else {
          console.log('Supabase Realtime status:', status);
          setIsConnected(false);
        }
      });

    return () => {
      // Clean up subscription
      supabase.removeChannel(channel);
    };
  }, [eventId, supabase, currentUser, fetchMessages, toast]);

  // Send message function
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!content?.trim() || !currentUser || !supabase || !isConnected) {
      if (!isConnected) toast.showError('Chat is not connected');
      return false;
    }

    try {
      const { error } = await supabase.from('messages').insert({
        content: content.trim(),
        event_id: eventId,
        sender_id: currentUser.id,
        metadata: {
          notification_type: 'event_message',
          message_type: 'chat',
          event_id: eventId,
          sender_id: currentUser.id
        }
      });

      if (error) {
        console.error('Error sending message:', error);
        toast.showError('Failed to send message');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.showError('Failed to send message');
      return false;
    }
  }, [eventId, currentUser, supabase, isConnected, toast]);

  return {
    messages,
    sendMessage,
    isConnected,
    isLoading
  };
}