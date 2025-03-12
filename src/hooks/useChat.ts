import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';

interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: {
    name: string;
    avatar_url: string;
    username: string;
  };
}

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  chat_id: string;
  sender?: {
    name: string;
    avatar_url: string;
    username: string;
  };
  reactions?: MessageReaction[];
}

interface Chat {
  id: string;
  created_at: string;
  updated_at: string;
  last_message?: ChatMessage;
  participants: Array<{
    user_id: string;
    name?: string;
    avatar_url?: string;
    username?: string;
  }>;
}

export function useChat(chatId?: string) {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);

  // Fetch messages for a specific chat
  const fetchMessages = useCallback(async () => {
    if (!chatId || !currentUser) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          chat_id,
          sender:users!sender_id (
            id,
            name,
            avatar_url,
            username
          ),
          reactions:message_reactions (
            id,
            emoji,
            user_id,
            user:users (
              name,
              avatar_url,
              username
            )
          )
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.showError('Failed to load messages');
    }
  }, [chatId, currentUser]);

  const fetchChats = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return [];
    }
    
    try {
      setLoading(true);
      
      const { data: userChats, error: chatsError } = await supabase
        .from('chats')
        .select(`
          id,
          created_at,
          updated_at,
          participants:chat_participants(
            user_id,
            users(
              id,
              name,
              avatar_url,
              username
            )
          ),
          last_message:chat_messages(
            id,
            content,
            created_at,
            sender_id
          )
        `)
        .eq('chat_participants.user_id', currentUser.id)
        .order('updated_at', { ascending: false });

      if (chatsError) throw chatsError;

      const chatsWithMessages = userChats.map(chat => ({
        id: chat.id,
        created_at: chat.created_at,
        updated_at: chat.updated_at,
        last_message: chat.last_message?.[0],
        participants: chat.participants.map(p => ({
          user_id: p.users.id,
          name: p.users.name,
          avatar_url: p.users.avatar_url,
          username: p.users.username
        }))
      }));

      setChats(chatsWithMessages);
      return chatsWithMessages;
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.showError('Failed to load chats');
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const sendMessage = useCallback(async (content: string) => {
    if (!currentUser || !chatId) {
      toast.showError('Cannot send message');
      return;
    }

    try {
      // Start a Supabase transaction
      const { data: message, error: messageError } = await supabase
        .rpc('send_chat_message', {
          p_content: content,
          p_chat_id: chatId,
          p_sender_id: currentUser.id,
          p_notification_type: 'chat_message' // Add notification type
        })
        .select(`
          id,
          content,
          created_at,
          sender_id,
          chat_id,
          sender:users!sender_id (
            id,
            name,
            avatar_url,
            username
          )
        `)
        .single();

      if (messageError) throw messageError;

      // Add message to local state
      setMessages(prev => [...prev, message]);
      
      // Refresh chat list to update last message
      fetchChats();

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.showError('Failed to send message');
    }
  }, [currentUser, chatId, fetchChats]);

  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!currentUser) return;

    try {
      const { data: existingReaction } = await supabase
        .from('message_reactions')
        .select('id')
        .match({
          message_id: messageId,
          user_id: currentUser.id,
          emoji: emoji
        })
        .single();

      if (existingReaction) {
        await supabase
          .from('message_reactions')
          .delete()
          .match({ id: existingReaction.id });
        
        setMessages(prev => 
          prev.map(message => 
            message.id === messageId 
              ? {
                  ...message,
                  reactions: message.reactions?.filter(r => r.id !== existingReaction.id)
                }
              : message
          )
        );
      } else {
        const { data: newReaction, error } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: currentUser.id,
            emoji: emoji
          })
          .select(`
            id,
            emoji,
            user_id,
            user:users (
              name,
              avatar_url,
              username
            )
          `)
          .single();

        if (error) throw error;

        setMessages(prev => 
          prev.map(message => 
            message.id === messageId 
              ? {
                  ...message,
                  reactions: [...(message.reactions || []), newReaction]
                }
              : message
          )
        );
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast.showError('Failed to update reaction');
    }
  }, [currentUser]);

  // Initial fetch of chats
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Fetch messages when chatId changes
  useEffect(() => {
    if (chatId) {
      fetchMessages();
    }
  }, [chatId, fetchMessages]);

  // Subscribe to new messages
  useEffect(() => {
    if (!chatId) return;

    const subscription = supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_id=eq.${chatId}`
      }, payload => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [chatId]);

  return {
    messages,
    sendMessage,
    loading,
    fetchChats,
    chats,
    toggleReaction,
    refreshMessages: fetchMessages
  };
}
