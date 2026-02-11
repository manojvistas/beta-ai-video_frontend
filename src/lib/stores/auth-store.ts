import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getAuthApiUrl } from '@/lib/config'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  lastAuthCheck: number | null
  isCheckingAuth: boolean
  hasHydrated: boolean
  authRequired: boolean | null
  setHasHydrated: (state: boolean) => void
  checkAuthRequired: () => Promise<boolean>
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  checkAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      lastAuthCheck: null,
      isCheckingAuth: false,
      hasHydrated: false,
      authRequired: null,

      setHasHydrated: (state: boolean) => {
        set({ hasHydrated: state })
      },

      checkAuthRequired: async () => {
        try {
          const authApiUrl = await getAuthApiUrl()
          // Use /api/auth/health to support both direct access and proxying
          const response = await fetch(`${authApiUrl}/api/auth/health`, { cache: 'no-store' })

          if (!response.ok) {
            throw new Error(`Auth service unavailable: ${response.status}`)
          }

          set({ authRequired: true })
          return true
        } catch (error) {
          console.error('Failed to check auth status:', error)

          // If it's a network error, set a more helpful error message
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            set({
              error: 'Unable to connect to auth service. Please check if the API is running.',
              authRequired: true // Fail closed to prevent infinite loops, assume auth required
            })
          } else {
            set({ authRequired: true })
          }

          // Re-throw the error so the UI can handle it
          throw error
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const authApiUrl = await getAuthApiUrl()
          const response = await fetch(`${authApiUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
          })
          
          if (response.ok) {
            set({ 
              isAuthenticated: true, 
              isLoading: false,
              lastAuthCheck: Date.now(),
              error: null
            })
            return true
          } else {
            let errorMessage = 'Authentication failed'
            if (response.status === 401) {
              errorMessage = 'Invalid credentials. Please try again.'
            } else if (response.status === 403) {
              errorMessage = 'Access denied. Please check your credentials.'
            } else if (response.status >= 500) {
              errorMessage = 'Server error. Please try again later.'
            } else {
              errorMessage = `Authentication failed (${response.status})`
            }
            
            set({ 
              error: errorMessage,
              isLoading: false,
              isAuthenticated: false
            })
            return false
          }
        } catch (error) {
          console.error('Network error during auth:', error)
          let errorMessage = 'Authentication failed'
          
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            errorMessage = 'Unable to connect to auth service. Please check if the API is running.'
          } else if (error instanceof Error) {
            errorMessage = `Network error: ${error.message}`
          } else {
            errorMessage = 'An unexpected error occurred during authentication'
          }
          
          set({ 
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false
          })
          return false
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const authApiUrl = await getAuthApiUrl()
          const response = await fetch(`${authApiUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name, email, password })
          })

          if (response.ok) {
            set({ isLoading: false, error: null })
            return true
          }

          const payload = await response.json().catch(() => null)
          const backendMessage = payload?.error || payload?.message

          let errorMessage = 'Registration failed'
          if (response.status === 409) {
            errorMessage = backendMessage || 'Email already registered. Please sign in.'
          } else if (response.status === 400) {
            errorMessage = backendMessage || 'Please check the form fields and try again.'
          } else if (response.status >= 500) {
            errorMessage = backendMessage || 'Server error. Please try again later.'
          } else {
            errorMessage = backendMessage || `Registration failed (${response.status})`
          }

          set({ isLoading: false, error: errorMessage })
          return false
        } catch (error) {
          let errorMessage = 'Registration failed'
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            errorMessage = 'Unable to connect to auth service. Please check if the API is running.'
          } else if (error instanceof Error) {
            errorMessage = `Network error: ${error.message}`
          }

          set({ isLoading: false, error: errorMessage })
          return false
        }
      },
      
      logout: () => {
        set({ 
          isAuthenticated: false,
          error: null
        })
      },
      
      checkAuth: async () => {
        const state = get()
        const { lastAuthCheck, isCheckingAuth, isAuthenticated } = state

        // If already checking, return current auth state
        if (isCheckingAuth) {
          return isAuthenticated
        }

        // If we checked recently (within 30 seconds) and are authenticated, skip
        const now = Date.now()
        if (isAuthenticated && lastAuthCheck && (now - lastAuthCheck) < 30000) {
          return true
        }

        set({ isCheckingAuth: true })

        try {
          const authApiUrl = await getAuthApiUrl()
          const response = await fetch(`${authApiUrl}/api/auth/me`, {
            method: 'GET',
            credentials: 'include'
          })
          
          if (response.ok) {
            set({ 
              isAuthenticated: true, 
              lastAuthCheck: now,
              isCheckingAuth: false 
            })
            return true
          } else {
            set({
              isAuthenticated: false,
              lastAuthCheck: null,
              isCheckingAuth: false
            })
            return false
          }
        } catch (error) {
          console.error('checkAuth error:', error)
          set({ 
            isAuthenticated: false, 
            lastAuthCheck: null,
            isCheckingAuth: false 
          })
          return false
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    }
  )
)