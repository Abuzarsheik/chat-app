import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import toast from 'react-hot-toast'
import { 
  User, 
  Message, 
  Conversation, 
  LoginCredentials, 
  RegisterData, 
  ApiResponse, 
  AuthResponse, 
  UsersResponse 
} from '../types'

// API Configuration
const API_BASE_URL = 'http://localhost:5000'

// Axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token management
let accessToken: string | null = null

export const setAuthToken = (token: string | null) => {
  accessToken = token
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common['Authorization']
  }
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (accessToken && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Try to refresh the token
        const { useAuthStore } = await import('../stores/authStore')
        await useAuthStore.getState().refreshAuth()
        
        // Retry the original request
        const newToken = useAuthStore.getState().accessToken
        if (newToken) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        const { useAuthStore } = await import('../stores/authStore')
        useAuthStore.getState().logout()
        toast.error('Session expired. Please login again.')
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred'
    
    // Don't show toast for authentication errors (handled by forms)
    if (error.response?.status !== 401 && error.response?.status !== 400) {
      toast.error(errorMessage)
    }

    return Promise.reject(error)
  }
)

// Generic API request handler
const handleApiRequest = async <T>(
  requestFn: () => Promise<AxiosResponse<ApiResponse<T>>>
): Promise<ApiResponse<T>> => {
  try {
    const response = await requestFn()
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data
    }
    
    return {
      success: false,
      message: error.message || 'Network error',
      error: 'NETWORK_ERROR'
    }
  }
}

// Authentication API
export const authApi = {
  login: (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> =>
    handleApiRequest(() => apiClient.post('/auth/login', credentials)),

  register: (data: RegisterData): Promise<ApiResponse<AuthResponse>> =>
    handleApiRequest(() => apiClient.post('/auth/register', data)),

  logout: (): Promise<ApiResponse<null>> =>
    handleApiRequest(() => apiClient.post('/auth/logout')),

  refreshToken: (refreshToken: string): Promise<ApiResponse<AuthResponse>> =>
    handleApiRequest(() => apiClient.post('/auth/refresh', { refreshToken })),

  getProfile: (): Promise<ApiResponse<User>> =>
    handleApiRequest(() => apiClient.get('/auth/profile')),

  updateProfile: (data: Partial<User>): Promise<ApiResponse<User>> =>
    handleApiRequest(() => apiClient.put('/auth/profile', data)),

  changePassword: (data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }): Promise<ApiResponse<null>> =>
    handleApiRequest(() => apiClient.put('/auth/change-password', data)),
}

// Users API
export const usersApi = {
  getUsers: (params?: {
    search?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<UsersResponse>> =>
    handleApiRequest(() => apiClient.get('/users', { params })),

  getOnlineUsers: (): Promise<ApiResponse<User[]>> =>
    handleApiRequest(() => apiClient.get('/users/online')),

  getUserById: (userId: string): Promise<ApiResponse<User>> =>
    handleApiRequest(() => apiClient.get(`/users/${userId}`)),

  searchUsers: (query: string, limit?: number): Promise<ApiResponse<User[]>> =>
    handleApiRequest(() => apiClient.get('/users/search', { 
      params: { q: query, limit } 
    })),

  getConversations: (): Promise<ApiResponse<Conversation[]>> =>
    handleApiRequest(() => apiClient.get('/users/conversations')),

  getUnreadCounts: (): Promise<ApiResponse<Record<string, number>>> =>
    handleApiRequest(() => apiClient.get('/users/unread-counts')),
}

// Messages API
export const messagesApi = {
  getConversation: (
    userId: string, 
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<{ messages: Message[]; pagination: any }>> =>
    handleApiRequest(() => apiClient.get(`/messages/${userId}`, { params })),

  sendMessage: (data: {
    recipientId: string
    content: string
    messageType?: 'text' | 'image' | 'file'
  }): Promise<ApiResponse<Message>> =>
    handleApiRequest(() => apiClient.post('/messages', data)),

  markAsRead: (messageIds: string[]): Promise<ApiResponse<null>> =>
    handleApiRequest(() => apiClient.post('/messages/mark-read', { messageIds })),

  deleteMessage: (messageId: string): Promise<ApiResponse<null>> =>
    handleApiRequest(() => apiClient.delete(`/messages/${messageId}`)),

  searchMessages: (
    query: string, 
    userId?: string, 
    limit?: number
  ): Promise<ApiResponse<{ messages: Message[]; totalResults: number }>> =>
    handleApiRequest(() => apiClient.get('/messages/search', { 
      params: { q: query, userId, limit } 
    })),
}

// Health check
export const healthApi = {
  check: (): Promise<ApiResponse<{ 
    status: string
    timestamp: string
    uptime: number
    environment: string
  }>> =>
    handleApiRequest(() => apiClient.get('/health')),
}



// Export the configured axios instance for direct use if needed
export { apiClient }
export default apiClient 