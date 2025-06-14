import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, LoginCredentials, RegisterData, AuthResponse } from '../types'
import { authApi } from '../services/api'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null })
          const response = await authApi.login(credentials)
          
          if (response.success && response.data) {
            const { user, accessToken, refreshToken } = response.data as AuthResponse
            set({
              user,
              accessToken,
              refreshToken,
              isLoading: false,
              error: null
            })
          } else {
            throw new Error(response.message || 'Login failed')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true, error: null })
          const response = await authApi.register(data)
          
          if (response.success && response.data) {
            const { user, accessToken, refreshToken } = response.data as AuthResponse
            set({
              user,
              accessToken,
              refreshToken,
              isLoading: false,
              error: null
            })
          } else {
            throw new Error(response.message || 'Registration failed')
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          const { accessToken } = get()
          if (accessToken) {
            await authApi.logout()
          }
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            error: null,
            isLoading: false
          })
        }
      },

      refreshAuth: async () => {
        try {
          const { refreshToken } = get()
          if (!refreshToken) {
            throw new Error('No refresh token available')
          }

          const response = await authApi.refreshToken(refreshToken)
          
          if (response.success && response.data) {
            const { user, accessToken, refreshToken: newRefreshToken } = response.data
            set({
              user,
              accessToken,
              refreshToken: newRefreshToken,
              error: null
            })
          } else {
            throw new Error('Token refresh failed')
          }
        } catch (error) {
          console.error('Token refresh error:', error)
          // Clear auth state on refresh failure
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            error: null
          })
          throw error
        }
      },

      clearError: () => set({ error: null }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      updateUser: (userData: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, ...userData } })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken
      })
    }
  )
)

// Initialize auth state from storage on app start
export const initializeAuth = () => {
  const { user, accessToken } = useAuthStore.getState()
  if (user && accessToken) {
    // Optionally verify token validity here
    return true
  }
  return false
} 