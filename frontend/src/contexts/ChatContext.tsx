import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Message, Conversation, ChatState } from '../types';
import { messagesAPI, usersAPI } from '../services/api';
import socketService from '../services/socket';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// Chat actions
type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: Message }
  | { type: 'SET_SELECTED_USER'; payload: User | null }
  | { type: 'SET_ONLINE_USERS'; payload: string[] }
  | { type: 'ADD_ONLINE_USER'; payload: string }
  | { type: 'REMOVE_ONLINE_USER'; payload: string }
  | { type: 'SET_USER_TYPING'; payload: { userId: string; isTyping: boolean } }
  | { type: 'MARK_MESSAGES_READ'; payload: { senderId: string } };

// Initial state
const initialState: ChatState = {
  conversations: [],
  messages: [],
  selectedUser: null,
  onlineUsers: [],
  typingUsers: {},
  loading: false,
};

// Chat reducer
const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg._id === action.payload._id ? action.payload : msg
        ),
      };
    
    case 'SET_SELECTED_USER':
      return { ...state, selectedUser: action.payload };
    
    case 'SET_ONLINE_USERS':
      return { ...state, onlineUsers: action.payload };
    
    case 'ADD_ONLINE_USER':
      return {
        ...state,
        onlineUsers: [...state.onlineUsers.filter(id => id !== action.payload), action.payload],
      };
    
    case 'REMOVE_ONLINE_USER':
      return {
        ...state,
        onlineUsers: state.onlineUsers.filter(id => id !== action.payload),
      };
    
    case 'SET_USER_TYPING':
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.userId]: action.payload.isTyping,
        },
      };
    
    case 'MARK_MESSAGES_READ':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.sender === action.payload.senderId ? { ...msg, isRead: true } : msg
        ),
      };
    
    default:
      return state;
  }
};

// Context type
interface ChatContextType {
  state: ChatState;
  loadConversations: () => Promise<void>;
  loadMessages: (userId: string) => Promise<void>;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  selectUser: (user: User | null) => void;
  markAsRead: (senderId: string) => Promise<void>;
  sendTyping: (receiverId: string, isTyping: boolean) => void;
}

// Create context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider component
interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { state: authState } = useAuth();

  // Setup socket listeners
  useEffect(() => {
    if (authState.isAuthenticated) {
      // Message listeners
      socketService.onReceiveMessage((message: Message) => {
        dispatch({ type: 'ADD_MESSAGE', payload: message });
        toast.success(`New message from ${typeof message.sender === 'object' ? message.sender.username : 'User'}`);
      });

      socketService.onMessageDelivered((message: Message) => {
        dispatch({ type: 'ADD_MESSAGE', payload: message });
      });

      // User status listeners
      socketService.onUserOnline((userId: string) => {
        dispatch({ type: 'ADD_ONLINE_USER', payload: userId });
      });

      socketService.onUserOffline((userId: string) => {
        dispatch({ type: 'REMOVE_ONLINE_USER', payload: userId });
      });

      // Typing listeners
      socketService.onUserTyping((data: { userId: string; isTyping: boolean }) => {
        dispatch({ type: 'SET_USER_TYPING', payload: data });
      });

      // Read receipt listeners
      socketService.onMessagesRead((data: { readerId: string }) => {
        dispatch({ type: 'MARK_MESSAGES_READ', payload: { senderId: data.readerId } });
      });

      // Error listener
      socketService.onError((data: { message: string }) => {
        toast.error(data.message);
      });

      return () => {
        socketService.removeAllListeners();
      };
    }
  }, [authState.isAuthenticated]);

  // Load conversations
  const loadConversations = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await messagesAPI.getConversations();
      dispatch({ type: 'SET_CONVERSATIONS', payload: response.conversations });
    } catch (error: any) {
      console.error('Load conversations error:', error);
      toast.error('Failed to load conversations');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Load messages for a specific user
  const loadMessages = async (userId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await messagesAPI.getMessages(userId);
      dispatch({ type: 'SET_MESSAGES', payload: response.messages });
    } catch (error: any) {
      console.error('Load messages error:', error);
      toast.error('Failed to load messages');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Send message
  const sendMessage = async (receiverId: string, content: string): Promise<void> => {
    try {
      if (!content.trim()) return;
      
      socketService.sendMessage({
        receiverId,
        content: content.trim(),
        messageType: 'text',
      });
    } catch (error: any) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    }
  };

  // Select user for chat
  const selectUser = (user: User | null): void => {
    dispatch({ type: 'SET_SELECTED_USER', payload: user });
    if (user) {
      loadMessages(user._id);
    }
  };

  // Mark messages as read
  const markAsRead = async (senderId: string): Promise<void> => {
    try {
      await messagesAPI.markAsRead(senderId);
      socketService.markAsRead(senderId);
    } catch (error: any) {
      console.error('Mark as read error:', error);
    }
  };

  // Send typing indicator
  const sendTyping = (receiverId: string, isTyping: boolean): void => {
    socketService.sendTyping(receiverId, isTyping);
  };

  const value: ChatContextType = {
    state,
    loadConversations,
    loadMessages,
    sendMessage,
    selectUser,
    markAsRead,
    sendTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Custom hook to use chat context
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 