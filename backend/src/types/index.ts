import { Request } from 'express';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

// User Interface
export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  online: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateLastSeen(): Promise<IUser>;
  setOnlineStatus(status: boolean): Promise<IUser>;
}

// User Model Interface (for static methods)
export interface IUserModel {
  findOnlineUsers(): Promise<IUser[]>;
  searchUsers(query: string, excludeUserId?: string): Promise<IUser[]>;
}

// Message Interface
export interface IMessage extends Document {
  _id: string;
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'file';
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Message Model Interface (for static methods)
export interface IMessageModel {
  getConversation(userId1: string, userId2: string, page?: number, limit?: number): Promise<IMessage[]>;
  markAsRead(messageIds: string[], userId: string): Promise<any>;
  getUnreadCount(userId: string): Promise<any[]>;
  getRecentConversations(userId: string): Promise<any[]>;
}

// Conversation Interface
export interface IConversation extends Document {
  _id: string;
  participants: string[];
  lastMessage: string;
  unreadCount: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

// JWT Payload Interface
export interface IJWTPayload {
  userId: string;
  email: string;
  username: string;
}

// Extended Request Interface with User
export interface IAuthRequest extends Request {
  user?: IJWTPayload;
}

// Socket User Interface
export interface ISocketUser {
  userId: string;
  socketId: string;
  username: string;
  email: string;
}

// Socket Events Interface
export interface ISocketEvents {
  // Client to Server
  join: (userId: string) => void;
  'send-message': (data: {
    recipientId: string;
    content: string;
    messageType?: 'text' | 'image' | 'file';
  }) => void;
  typing: (recipientId: string) => void;
  'stop-typing': (recipientId: string) => void;
  disconnect: () => void;

  // Server to Client
  'receive-message': (message: IMessage) => void;
  'user-online': (userId: string) => void;
  'user-offline': (userId: string) => void;
  'typing-indicator': (data: { senderId: string; senderName: string }) => void;
  'stop-typing-indicator': (senderId: string) => void;
  error: (message: string) => void;
}

// API Response Interface
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Login Response Interface
export interface ILoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
    online: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

// Register Data Interface
export interface IRegisterData {
  username: string;
  email: string;
  password: string;
}

// Login Data Interface
export interface ILoginData {
  email: string;
  password: string;
}

// User Profile Interface
export interface IUserProfile {
  id: string;
  username: string;
  email: string;
  online: boolean;
  lastSeen: Date;
  createdAt: Date;
}

// Message Data Interface
export interface IMessageData {
  id: string;
  sender: {
    id: string;
    username: string;
  };
  recipient: {
    id: string;
    username: string;
  };
  content: string;
  messageType: 'text' | 'image' | 'file';
  readBy: string[];
  createdAt: Date;
}

// Conversation Data Interface
export interface IConversationData {
  id: string;
  participants: IUserProfile[];
  lastMessage?: IMessageData;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Error Response Interface
export interface IErrorResponse {
  success: false;
  message: string;
  error: string;
  statusCode: number;
} 