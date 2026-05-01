import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePreferences } from '../usePreferences'

// Mock supabase module
vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: null,
}))

vi.mock('@/lib/supabase-storage', () => ({
  loadUserPreferences: vi.fn().mockResolvedValue({ darkMode: true, weekStartDay: 'monday', subscriptionTier: 'free' }),
  saveUserPreferences: vi.fn().mockResolvedValue(undefined),
}))

describe('usePreferences', () => {
  it('returns default preferences', () => {
    const { result } = renderHook(() => usePreferences())
    expect(result.current.prefs.darkMode).toBe(true)
    expect(result.current.prefs.weekStartDay).toBe('monday')
  })

  it('setDarkMode updates dark mode preference', () => {
    const { result } = renderHook(() => usePreferences())
    act(() => {
      result.current.setDarkMode(true)
    })
    expect(result.current.prefs.darkMode).toBe(true)
  })

  it('setWeekStartDay updates week start day', () => {
    const { result } = renderHook(() => usePreferences())
    act(() => {
      result.current.setWeekStartDay('sunday')
    })
    expect(result.current.prefs.weekStartDay).toBe('sunday')
  })

  it('persists to localStorage on change', () => {
    const { result } = renderHook(() => usePreferences())
    act(() => {
      result.current.setDarkMode(true)
    })
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'distribution-os-prefs',
      expect.stringContaining('"darkMode":true')
    )
  })

  it('applies dark class to documentElement when dark mode on', () => {
    const { result } = renderHook(() => usePreferences())
    act(() => {
      result.current.setDarkMode(true)
    })
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes dark class when dark mode off', () => {
    document.documentElement.classList.add('dark')
    const { result } = renderHook(() => usePreferences())
    act(() => {
      result.current.setDarkMode(false)
    })
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
