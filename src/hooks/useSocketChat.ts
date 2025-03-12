import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  event_id: string;
  created_at: string;
  sender?: {
    name: string;
    avatar_url: string;
  };
}

interface TypingUser {
  id: string;
  name: string;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
const RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY = 1000;

export function useSocketChat(eventId: string) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const { currentUser } = useAuth();
  const toast = useToast();

  // Initialize socket connection
  useEffect(() => {
    if (!currentUser?.id || !eventId) return;

    let reconnectAttempts = 0;

    const initializeSocket = () => {
      socketRef.current = io(SOCKET_URL, {
        auth: { userId: currentUser.id },
        reconnection: true,
        reconnectionAttempts: RECONNECTION_ATTEMPTS,
        reconnectionDelay: RECONNECTION_DELAY,
        query: { eventId }
      });

      socketRef.current.on('connect', () => {
        setIsConnected(true);
        reconnectAttempts = 0;
        console.log('Connected to chat server');
      });

      socketRef.current.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from chat server');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reconnectAttempts++;
        
        if (reconnectAttempts >= RECONNECTION_ATTEMPTS) {
          toast.showError('Chat connection failed. Please refresh the page.');
        }
      });

      // Event specific handlers
      socketRef.current.on('message_history', (history: Message[]) => {
        setMessages(history);
      });

      socketRef.current.on('receive_message', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      socketRef.current.on('message_error', (error) => {
        toast.showError(error.message || 'Failed to send message');
      });

      socketRef.current.on('user_typing', (user: TypingUser) => {
        setTypingUsers(prev => {
          if (!prev.find(u => u.id === user.id)) {
            return [...prev, user];
          }
          return prev;
        });
      });

      socketRef.current.on('user_stop_typing', (userId: string) => {
        setTypingUsers(prev => prev.filter(user => user.id !== userId));
      });

      // Join event room
      socketRef.current.emit('join_event', eventId);
    };

    initializeSocket();

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_event', eventId);
        socketRef.current.removeAllListeners();
        socketRef.current.close();
        socketRef.current = null;
      }
      setMessages([]);
      setTypingUsers([]);
      setIsConnected(false);
    };
  }, [currentUser?.id, eventId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!socketRef.current || !currentUser || !eventId) {
      toast.showError('Cannot send message - not connected');
      return false;
    }

    try {
      socketRef.current.emit('send_event_message', {
        content,
        event_id: eventId,
        sender_id: currentUser.id
      });
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.showError('Failed to send message');
      return false;
    }
  }, [currentUser, eventId]);

  const startTyping = useCallback(() => {
    if (!socketRef.current || !currentUser || !eventId) return;
    
    socketRef.current.emit('typing', {
      eventId,
      userId: currentUser.id,
      name: currentUser.name
    });
  }, [currentUser, eventId]);

  const stopTyping = useCallback(() => {
    if (!socketRef.current || !currentUser || !eventId) return;
    
    socketRef.current.emit('stop_typing', {
      eventId,
      userId: currentUser.id
    });
  }, [currentUser, eventId]);

  return {
    messages,
    sendMessage,
    isConnected,
    typingUsers,
    startTyping,
    stopTyping
  };
}
