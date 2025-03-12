import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const useSupport = () => {
  const { currentUser } = useAuth();
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      loadTicketAndMessages();
    }
  }, [currentUser]);

  const loadTicketAndMessages = async () => {
    try {
      setLoading(true);
      // Load active ticket
      const { data: ticket } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('status', 'open')
        .single();

      if (ticket) {
        setActiveTicket(ticket);
        // Load messages for active ticket
        const { data: messages } = await supabase
          .from('support_messages')
          .select('*')
          .eq('ticket_id', ticket.id)
          .order('created_at', { ascending: true });
        
        setMessages(messages || []);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (message: string) => {
    try {
      const { data: ticket } = await supabase
        .from('support_tickets')
        .insert([
          {
            user_id: currentUser.id,
            status: 'open',
          },
        ])
        .single();

      if (ticket) {
        await sendMessage(message, ticket.id);
        setActiveTicket(ticket);
      }
    } catch (error) {
      throw error;
    }
  };

  const sendMessage = async (content: string, ticketId = activeTicket?.id) => {
    try {
      const { data: message } = await supabase
        .from('support_messages')
        .insert([
          {
            ticket_id: ticketId,
            sender_id: currentUser.id,
            content,
          },
        ])
        .single();

      if (message) {
        setMessages((prev) => [...prev, message]);
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    activeTicket,
    messages,
    loading,
    error,
    createTicket,
    sendMessage,
  };
};
