import axios from 'axios';
import {
  User,
  Message,
  Conversation,
  LoginFormData,
  RegisterFormData,
  SendMessageData,
  AuthResponse,
  MessagesResponse,
  ConversationsResponse,
  UsersResponse
} from '../types';

// Configure axios
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData: RegisterFormData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (userData: LoginFormData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', userData);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Messages API
export const messagesAPI = {
  getConversations: async (): Promise<ConversationsResponse> => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  getMessages: async (userId: string): Promise<MessagesResponse> => {
    const response = await api.get(`/messages/${userId}`);
    return response.data;
  },

  sendMessage: async (messageData: SendMessageData): Promise<{ message: Message }> => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  markAsRead: async (userId: string): Promise<void> => {
    await api.put(`/messages/read/${userId}`);
  },
};

// Users API
export const usersAPI = {
  getUsers: async (): Promise<UsersResponse> => {
    const response = await api.get('/users');
    return response.data;
  },

  searchUsers: async (query: string): Promise<UsersResponse> => {
    const response = await api.get('/users/search', { params: { q: query } });
    return response.data;
  },

  getUserById: async (userId: string): Promise<{ user: User }> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateProfile: async (userData: Partial<User>): Promise<{ user: User }> => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },
};

export default api; 