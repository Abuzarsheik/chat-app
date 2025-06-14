import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: []
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    if (user && accessToken) {
      // Create socket connection
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: accessToken
        },
        transports: ['websocket', 'polling']
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
        toast.success('Connected to chat server');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
        if (reason !== 'io client disconnect') {
          toast.error('Disconnected from chat server');
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
        toast.error('Failed to connect to chat server');
      });

      // User status events
      newSocket.on('user-online', (userId: string) => {
        setOnlineUsers(prev => [...prev.filter(id => id !== userId), userId]);
      });

      newSocket.on('user-offline', (userId: string) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId));
      });

      newSocket.on('online-users', (users: string[]) => {
        setOnlineUsers(users);
      });

      // Message events
      newSocket.on('receive-message', (message) => {
        console.log('Received message:', message);
        toast.success(`New message from ${message.sender.username}`);
      });

      newSocket.on('message-sent', (message) => {
        console.log('Message sent confirmation:', message);
      });

      newSocket.on('messages-read', (data) => {
        console.log('Messages read:', data);
      });

      // Typing events
      newSocket.on('typing-indicator', (data) => {
        console.log('User typing:', data);
      });

      newSocket.on('stop-typing-indicator', (userId) => {
        console.log('User stopped typing:', userId);
      });

      // Error handling
      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error(error || 'Socket error occurred');
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
      };
    } else {
      // No user or token, clean up socket
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
      }
    }
  }, [user, accessToken]);

  const value: SocketContextType = {
    socket,
    isConnected,
    onlineUsers
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext; 