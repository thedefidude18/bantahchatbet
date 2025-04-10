import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useSupabase } from '../contexts/SupabaseContext';

interface Message  {
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
  const [messages, setMessages] = useState<any[]>([]);
  const { currentUser } = useAuth();
  const { supabase } = useSupabase();
  const toast = useToast();

  useEffect(() => {
    const channel = supabase
      .channel(`event_chat:${eventId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `event_id=eq.${eventId}` },
        (payload) => {
          console.log('Change received!', payload);
          // add the new messages to the state.
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    // Fetch Initial Messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Error fetching messages:', error);
        toast.showError('Error fetching messages' + error.message)
      } else {
        setMessages(data);
      }
    };

    fetchMessages();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, supabase]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content?.trim()) {
      return false;
    }
    const { data, error } = await supabase
      .from('messages')
      .insert({
        event_id: eventId,
        content,
        sender_id: currentUser?.id,
      })
      .select();
    if(error) {
      toast.showError('Error sending message' + error.message);
      return false
    }
    return true
  }, [eventId, currentUser]);

  return {
    messages,
    sendMessage
  };
}
