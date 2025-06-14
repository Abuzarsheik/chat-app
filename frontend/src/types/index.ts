export interface User {
  _id: string;
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Message {
  _id: string;
  sender: User | string;
  receiver: User | string;
  content: string;
  messageType: 'text' | 'image' | 'file';
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  _id: string;
  user: User;
  lastMessage: {
    content: string;
    createdAt: Date;
    messageType: string;
  };
  unreadCount: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface ChatState {
  conversations: Conversation[];
  messages: Message[];
  selectedUser: User | null;
  onlineUsers: string[];
  typingUsers: { [key: string]: boolean };
  loading: boolean;
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SendMessageData {
  receiverId: string;
  content: string;
  messageType?: 'text' | 'image' | 'file';
}

export interface SocketEvents {
  // Client to server
  sendMessage: (data: SendMessageData) => void;
  typing: (data: { receiverId: string; isTyping: boolean }) => void;
  markAsRead: (data: { senderId: string }) => void;
  
  // Server to client
  receiveMessage: (message: Message) => void;
  messageDelivered: (message: Message) => void;
  userOnline: (userId: string) => void;
  userOffline: (userId: string) => void;
  userTyping: (data: { userId: string; isTyping: boolean }) => void;
  messagesRead: (data: { readerId: string }) => void;
  error: (data: { message: string }) => void;
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  errors?: any[];
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface MessagesResponse {
  messages: Message[];
}

export interface ConversationsResponse {
  conversations: Conversation[];
}

export interface UsersResponse {
  users: User[];
} 