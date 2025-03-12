import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
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
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const { currentUser } = useAuth();
  const { supabase } = useSupabase();
  const toast = useToast();  // Moved hook to maintain consistent order

  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;

    const initSocket = async () => {
      if (!currentUser || !eventId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('No access token available');
        }

        const socketUrl = new URL(import.meta.env.VITE_SOCKET_URL);
        socketUrl.protocol = socketUrl.protocol.replace('http', 'ws');

        const socket = io(socketUrl.toString(), {
          auth: {
            token: session.access_token,
            userId: currentUser.id
          },
          transports: ['websocket'],
          path: '/socket.io/',
          reconnectionAttempts: 3,
          reconnectionDelay: 1000,
          timeout: 5000,
          withCredentials: true,
          extraHeaders: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        socket.io.on("error", (error) => {
          console.error("Transport error:", error);
          if (mounted) {
            retryTimeout = setTimeout(initSocket, 2000);
          }
        });

        socket.on('connect', () => {
          console.log('Connected to server, transport:', socket.io.engine.transport.name);
          socket.emit('join_event_chat', {
            eventId,
            userId: currentUser.id,
            username: currentUser.username,
            token: session.access_token
          });
        });

        socket.on('disconnect', () => {
          console.log('Disconnected from server');
          if (mounted) {
            setIsConnected(false);
            setIsJoined(false);
          }
        });

        // Debug listeners
        socket.on('connect', () => {
          console.log('Socket connected with ID:', socket.id);
          socket.emit('join_event_chat', { 
            eventId,
            userId: currentUser.id,
            username: currentUser.username
          });
        });

        socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          if (mounted) {
            toast.showError('Connection error: ' + error.message);
            setIsLoading(false);
          }
        });

        socket.on('join_success', () => {
          if (mounted) {
            setIsJoined(true);
            setIsLoading(false);
          }
        });

        socket.on('chat_history', (history: Message[]) => {
          if (mounted) {
            setMessages(history);
          }
        });

        socket.on('new_event_message', (message: Message) => {
          if (mounted) {
            setMessages(prev => [...prev, message]);
          }
        });

        socket.on('chat_error', (error) => {
          console.error('Chat error:', error);
          if (mounted) {
            toast.showError(error.message);
            setIsLoading(false);
          }
        });

        socketRef.current = socket;
      } catch (error) {
        console.error('Socket initialization error:', error);
        if (mounted) {
          setIsLoading(false);
          toast.showError('Failed to connect to chat');
          retryTimeout = setTimeout(initSocket, 2000);
        }
      }
    };

    initSocket();

    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [currentUser, eventId, supabase, toast]);

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current?.connected || !isJoined) {
      toast.showError('Chat is not connected');
      return false;
    }

    if (!content?.trim()) {
      return false;
    }

    socketRef.current.emit('send_event_message', {
      eventId,
      content: content.trim(),
      metadata: {
        notification_type: 'event_message',
        message_type: 'chat',
        event_id: eventId,
        sender_id: currentUser?.id
      }
    });

    return true;
  }, [eventId, isJoined, toast, currentUser]);

  return {
    messages,
    sendMessage,
    isConnected: isConnected && isJoined,
    isLoading
  };
}
