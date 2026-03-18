import { useState, useEffect } from 'react'
import type { UserPreferences } from '@/types'
import { loadPrefs, savePrefs } from '@/lib/storage'

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(loadPrefs)

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
    savePrefs(prefs)
  }, [prefs])

  function setDarkMode(on: boolean) {
    setPrefs(prev => ({ ...prev, darkMode: on }))
  }

  function setWeekStartDay(day: UserPreferences['weekStartDay']) {
    setPrefs(prev => ({ ...prev, weekStartDay: day }))
  }

  return { prefs, setDarkMode, setWeekStartDay }
}
