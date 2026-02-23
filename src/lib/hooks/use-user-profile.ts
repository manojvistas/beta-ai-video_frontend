import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'

export function useUserProfile() {
  const { user, ...authRest } = useAuth()
  const [avatar, setAvatar] = useState<string | null>(null)
  
  // Per-user avatar storage key
  const avatarKey = user?.id ? `user_avatar_${user.id}` : 'user_avatar'

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(avatarKey)
      if (stored) setAvatar(stored)
    }
  }, [avatarKey])

  // Update avatar
  const updateAvatar = (newAvatar: string) => {
    setAvatar(newAvatar)
    if (typeof window !== 'undefined') {
      localStorage.setItem(avatarKey, newAvatar)
    }
  }

  // Derived fields
  const getDisplayName = () => {
    if (user?.name) return user.name
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  const email = user?.email || ''
  
  // Prefer local upload, fallback to Google/Backend
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
