import { useState, useEffect, useRef } from 'react'
import type { UserPreferences } from '@/types'
import { loadPrefs, savePrefs } from '@/lib/storage'
import { isSupabaseConfigured } from '@/lib/supabase'
import * as sb from '@/lib/supabase-storage'

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(loadPrefs)
  const isFirstLoad = useRef(true)

  // Load from Supabase on mount
  useEffect(() => {
    if (!isSupabaseConfigured) return
    sb.loadUserPreferences().then(setPrefs).catch(() => {})
  }, [])

  // Apply dark mode class on mount and when it changes
  useEffect(() => {
    if (prefs.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [prefs.darkMode])

  // Persist on every change
  useEffect(() => {
    // Always save to localStorage as cache
    savePrefs(prefs)

    // Skip Supabase sync on first render (initial load)
    if (isFirstLoad.current) {
      isFirstLoad.current = false
      return
    }

    if (isSupabaseConfigured) {
      sb.saveUserPreferences(prefs).catch(() => {})
    }
  }, [prefs])

  function setDarkMode(on: boolean) {
    setPrefs(prev => ({ ...prev, darkMode: on }))
  }

  function setWeekStartDay(day: UserPreferences['weekStartDay']) {
    setPrefs(prev => ({ ...prev, weekStartDay: day }))
  }

  return { prefs, setDarkMode, setWeekStartDay }
}
