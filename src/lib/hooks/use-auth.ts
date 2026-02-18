'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function useAuth() {
  const router = useRouter()
  const [initialCheckDone, setInitialCheckDone] = useState(false)
  const {
    isAuthenticated,
    isLoading,
    isCheckingAuth,
    login,
    register,
    logout,
    checkAuth,
    checkAuthRequired,
    error,
    hasHydrated,
    authRequired,
    user
  } = useAuthStore()

  useEffect(() => {
    // Only check auth after the store has hydrated from localStorage
    if (!hasHydrated) return

    let cancelled = false

    const runInitialCheck = async () => {
      try {
        // Run the full auth check in a single async flow to avoid
        // a loading-state gap between checkAuthRequired and checkAuth
        let required = authRequired
        if (required === null) {
          required = await checkAuthRequired()
        }
        if (required && !cancelled) {
          await checkAuth()
        }
      } catch (err) {
        console.error('Failed to check auth:', err)
      } finally {
        if (!cancelled) {
          setInitialCheckDone(true)
        }
      }
    }

    runInitialCheck()

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated])

  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password)
    if (success) {
      // Check if there's a stored redirect path
      const redirectPath = sessionStorage.getItem('redirectAfterLogin')
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin')
        router.push(redirectPath)
      } else {
        router.push('/notebooks')
      }
    }
    return success
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleRegister = async (name: string, email: string, password: string) => {
    return register(name, email, password)
  }

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || isCheckingAuth || !hasHydrated || !initialCheckDone,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout
  }
}