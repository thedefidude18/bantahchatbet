import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';

interface EventChatMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender?: { name: string; avatar_url: string };
}

export function useEventChat(eventId: string) {
  const [messages, setMessages] = useState<EventChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const toast = useToast();

  const fetchInitialMessages = useCallback(async () => {
    console.log('fetchMessages called with eventId:', eventId);
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_chat_messages')
        .select(
          `
          id,
          content,
          sender_id,
          created_at,
          users (name, avatar_url)
        `
        )
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast.showError('Failed to load messages');
        throw error;
      }

      const formattedMessages: EventChatMessage[] = (data || []).map(
        (message) => ({
          id: message.id,
          content: message.content,
          sender_id: message.sender_id,
          created_at: message.created_at,
          sender: { name: message.users?.name || 'Unknown', avatar_url: message.users?.avatar_url || '/default-avatar.png' },
        })
      );

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching initial messages:', error);
      toast.showError('Failed to load initial messages.');
    } finally {
      setIsLoading(false);
    }
  }, [eventId, setIsLoading, setMessages, toast]);

  const sendMessage = useCallback(
    async (message: string): Promise<boolean> => {
      if (!currentUser) {
        toast.showError('You must be logged in to send messages.');
        return false;
      }

      try {
        const { data, error } = await supabase
          .from('event_chat_messages')
          .insert([
            {
              event_id: eventId,
              sender_id: currentUser.id,
              content: message,
              id: crypto.randomUUID()
            },
          ])
          .select(
            `
           id,
            content,
            sender_id,
            created_at,
            users (name, avatar_url)
          `
          )
          .single();

        if (error) {
          throw error;
        }

        const formattedMessage: EventChatMessage = {
          id: data.id,
          content: data.content,
          sender_id: data.sender_id,
          created_at: data.created_at,
          sender: { name: data.users?.name || 'Unknown', avatar_url: data.users?.avatar_url || '/default-avatar.png' }
        };

        setMessages((prevMessages) => [...prevMessages, formattedMessage]);
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        toast.showError('Failed to send message.');
        return false;
      }
    },
    [currentUser, eventId, setIsLoading, setMessages, toast]
  );

  useEffect(() => {
    fetchInitialMessages();
  }, [fetchInitialMessages]);

  useEffect(() => {
    let subscription: any = null; // Initialize subscription to null

    if (eventId) { // Only subscribe if eventId is valid
      subscription = supabase
        .channel(`event_chat:${eventId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'event_chat_messages',
            filter: `event_id=eq.${eventId}`,
          },
          (payload) => {
            console.log('Realtime event received:', payload);
            if (!payload.new) return;
            const formattedMessage: EventChatMessage = {
              id: payload.new.id,
              content: payload.new.content,
              sender_id: payload.new.sender_id,
              created_at: payload.new.created_at,
              sender: { name: payload.new.users?.name || 'Unknown', avatar_url: payload.new.users?.avatar_url || '/default-avatar.png' }
            };
            setMessages(prevMessages => [...prevMessages, formattedMessage]);
          }
        )
        .subscribe();
    }

    // Use a cleanup function that handles potential null subscription
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [eventId]); // eventId is the dependency

  return {
    messages,
    sendMessage,
    isLoading,
  };
}
