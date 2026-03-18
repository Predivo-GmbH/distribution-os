/* ============================================================
   localStorage Data Layer
   All data persists locally — no server, no auth.
   ============================================================ */

import type { AppState, Product, Task, WeekRecord, UserPreferences } from '@/types'

const STORAGE_KEY = 'distribution-os'

function getWeekId(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

function defaultState(): AppState {
  return {
    products: [],
    currentWeekId: getWeekId(),
    tasks: [],
    weekHistory: [],
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as AppState

    // Week transition: archive old tasks when a new week starts
    const currentWeek = getWeekId()
    if (parsed.currentWeekId !== currentWeek && parsed.tasks.length > 0) {
      const weekRecord: WeekRecord = {
        id: parsed.currentWeekId,
        startDate: '',
        endDate: '',
        tasks: [...parsed.tasks],
        completedAt: new Date().toISOString(),
      }

      if (!parsed.weekHistory) parsed.weekHistory = []
      parsed.weekHistory.push(weekRecord)
      parsed.tasks = []
    }

    parsed.currentWeekId = currentWeek
    return parsed
  } catch {
    return defaultState()
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function addProduct(state: AppState, product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): AppState {
  const now = new Date().toISOString()
  const newProduct: Product = {
    ...product,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  const next = { ...state, products: [...state.products, newProduct] }
  saveState(next)
  return next
}

export function updateProduct(state: AppState, id: string, updates: Partial<Product>): AppState {
  const next = {
    ...state,
    products: state.products.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ),
  }
  saveState(next)
  return next
}

export function removeProduct(state: AppState, id: string): AppState {
  const next = {
    ...state,
    products: state.products.filter(p => p.id !== id),
    tasks: state.tasks.filter(t => t.productId !== id),
  }
  saveState(next)
  return next
}

export function toggleTask(state: AppState, taskId: string): AppState {
  const next = {
    ...state,
    tasks: state.tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ),
  }
  saveState(next)
  return next
}

export function setTasks(state: AppState, tasks: Task[]): AppState {
  const next = { ...state, tasks }
  saveState(next)
  return next
}

export { getWeekId }

/* ============================================================
   User Preferences
   ============================================================ */

const PREFS_KEY = 'distribution-os-prefs'

const defaultPrefs: UserPreferences = {
  darkMode: false,
  weekStartDay: 'monday',
}

export function loadPrefs(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return defaultPrefs
    return { ...defaultPrefs, ...JSON.parse(raw) }
  } catch {
    return defaultPrefs
  }
}

export function savePrefs(prefs: UserPreferences): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
}

/* ============================================================
   Data Export
   ============================================================ */

export function exportState(state: AppState): string {
  return JSON.stringify(state, null, 2)
}
