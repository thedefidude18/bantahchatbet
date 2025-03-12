import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser?.access_token) {
      console.log('No access token available, cleaning up socket');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
    console.log('Initializing socket connection');

    // Only create a new socket if we don't have one
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        auth: {
          token: currentUser.access_token,
          userId: currentUser.id
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected successfully', socketRef.current?.id);
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        setIsConnected(false);
      });

      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error);
        setIsConnected(false);
      });
    }

    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [currentUser?.access_token]); // Only depend on the access token

  return (
    <SocketContext.Provider value={{ 
      socket: socketRef.current, 
      isConnected 
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
