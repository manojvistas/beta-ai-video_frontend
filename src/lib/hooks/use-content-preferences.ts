/**
 * Hooks for managing content preferences (text size, font) with localStorage
 */

import { useState, useEffect, useCallback } from 'react'

export type FontFamily = 'inter' | 'times' | 'arial' | 'georgia' | 'roboto'

interface ContentPreferences {
  textSize: number // in percentage: 100 = default
  fontFamily: FontFamily
}

const DEFAULT_PREFERENCES: ContentPreferences = {
  textSize: 100,
  fontFamily: 'inter',
}

const STORAGE_KEY = 'content-preferences'

/**
 * Hook for managing content preferences with localStorage persistence
 */
export function useContentPreferences() {
  const [preferences, setPreferences] = useState<ContentPreferences>(DEFAULT_PREFERENCES)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...parsed,
        })
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save preferences to localStorage whenever they change
  const updatePreferences = useCallback((updates: Partial<ContentPreferences>) => {
    setPreferences((prev) => {
      const updated = {
        ...prev,
        ...updates,
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (error) {
        console.error('Failed to save preferences:', error)
      }

      return updated
    })
  }, [])

  // Update text size
  const updateTextSize = useCallback((size: number) => {
    updatePreferences({ textSize: Math.max(75, Math.min(200, size)) })
  }, [updatePreferences])

  // Update font family
  const updateFontFamily = useCallback((font: FontFamily) => {
    updatePreferences({ fontFamily: font })
  }, [updatePreferences])

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    updatePreferences(DEFAULT_PREFERENCES)
  }, [updatePreferences])

  return {
    preferences,
    isLoaded,
    updateTextSize,
    updateFontFamily,
    updatePreferences,
    resetPreferences,
  }
}

/**
 * Hook for managing share state with toast notifications
 */
export function useShareState() {
  const [shared, setShared] = useState(false)

  const markAsShared = useCallback(() => {
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }, [])

  return { shared, markAsShared }
}

/**
 * Font family to CSS mapping
 */
export const FONT_FAMILIES: Record<FontFamily, string> = {
  inter: 'font-sans',
  times: 'font-serif',
  arial: '"Arial", sans-serif',
  georgia: '"Georgia", serif',
  roboto: '"Roboto", sans-serif',
}

/**
 * Font family display names
 */
export const FONT_DISPLAY_NAMES: Record<FontFamily, string> = {
  inter: 'Inter (Default)',
  times: 'Times New Roman',
  arial: 'Arial',
  georgia: 'Georgia',
  roboto: 'Roboto',
}
