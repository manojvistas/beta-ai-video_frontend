import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'

export function useUserProfile() {
  const { user, ...authRest } = useAuth()
  const [avatar, setAvatar] = useState<string | null>(null)
  
  // Initialize from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user_avatar')
      if (stored) setAvatar(stored)
    }
  }, [])

  // Update avatar
  const updateAvatar = (newAvatar: string) => {
    setAvatar(newAvatar)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_avatar', newAvatar)
    }
  }

  // Derived fields
  const getDisplayName = () => {
    if (user?.name) return user.name
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  const email = user?.email || ''
  
  // Prefer local avatar, fallback to user.picture (backend), fallback to null
  const displayPicture = avatar || user?.picture || null

  return {
    ...authRest,
    user: {
      ...user,
      name: getDisplayName(),
      email,
      picture: displayPicture
    },
    updateAvatar
  }
}
