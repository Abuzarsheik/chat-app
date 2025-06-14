// User types
export interface User {
  id: string;
  username: string;
  email: string;
  online: boolean;
  lastSeen: Date;
  createdAt: Date;
}

// Message types
export interface Message {
  id: string;
  sender: {
    id: string;
    username: string;
    email: string;
  };
  recipient: {
    id: string;
    username: string;
    email: string;
  };
  content: string;
  messageType: 'text' | 'image' | 'file';
  readBy: string[];
  createdAt: Date;
  updatedAt?: Date;
}

// Conversation types
export interface Conversation {
  id: string;
  participant: User;
  lastMessage?: {
    id: string;
    content: string;
    messageType: 'text' | 'image' | 'file';
    createdAt: Date;
  };
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

// Socket types
export interface SocketUser {
  userId: string;
  socketId: string;
  username: string;
  email: string;
}

export interface TypingIndicator {
  senderId: string;
  senderName: string;
}

export interface MessageStatus {
  messageIds: string[];
  readBy: string;
  readerName: string;
}

// Component prop types
export interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

export interface UserListItemProps {
  user: User;
  unreadCount?: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export interface ChatHeaderProps {
  user: User;
  isTyping: boolean;
  onBack?: () => void;
}

export interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
  placeholder?: string;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Error types
export interface FormError {
  field: string;
  message: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

// Chat state types
export interface ChatState {
  selectedUserId: string | null;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, boolean>;
  onlineUsers: string[];
  unreadCounts: Record<string, number>;
}

// Search types
export interface SearchResult {
  users: User[];
  query: string;
  totalResults: number;
}

// Emoji types (for future emoji support)
export interface EmojiData {
  id: string;
  name: string;
  native: string;
  unified: string;
  keywords: string[];
  shortcodes: string;
}

// File upload types (for future file support)
export interface FileUpload {
  file: File;
  progress: number;
  url?: string;
  error?: string;
}

// Notification types
export interface NotificationData {
  id: string;
  type: 'message' | 'typing' | 'online' | 'offline';
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  userId?: string;
}

// Settings types
export interface UserSettings {
  theme: Theme;
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    email: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    readReceipts: boolean;
  };
  chat: {
    sendOnEnter: boolean;
    fontSize: 'small' | 'medium' | 'large';
    messagePreview: boolean;
  };
}

// Route types
export interface RouteParams {
  userId?: string;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// WebSocket event types
export interface SocketEvents {
  // Client to Server
  'send-message': (data: {
    recipientId: string;
    content: string;
    messageType?: 'text' | 'image' | 'file';
  }) => void;
  'typing': (recipientId: string) => void;
  'stop-typing': (recipientId: string) => void;
  'mark-as-read': (data: {
    messageIds: string[];
    senderId: string;
  }) => void;
  'join-conversation': (otherUserId: string) => void;
  'leave-conversation': (otherUserId: string) => void;
  'get-user-status': (userId: string) => void;

  // Server to Client
  'receive-message': (message: Message) => void;
  'message-sent': (message: Message) => void;
  'user-online': (userId: string) => void;
  'user-offline': (userId: string) => void;
  'typing-indicator': (data: TypingIndicator) => void;
  'stop-typing-indicator': (senderId: string) => void;
  'messages-read': (data: MessageStatus) => void;
  'user-status': (data: { userId: string; online: boolean }) => void;
  'online-users': (userIds: string[]) => void;
  'error': (message: string) => void;
} 