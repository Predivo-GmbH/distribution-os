import { useReducer, useEffect, useRef, useCallback } from 'react'
import type { AppState, Product, Task, WeekRecord } from '@/types'
import { loadState, saveState, generateId, getWeekId, cleanupProductData } from '@/lib/storage'
import { isSupabaseConfigured } from '@/lib/supabase'
import * as sb from '@/lib/supabase-storage'

export type Action =
  | { type: 'ADD_PRODUCT'; payload: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_PRODUCT'; payload: { id: string; updates: Partial<Product> } }
  | { type: 'REMOVE_PRODUCT'; payload: string }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'ARCHIVE_WEEK' }
  | { type: 'IMPORT_STATE'; payload: AppState }
  | { type: 'RESET_STATE' }
  | { type: '_HYDRATE'; payload: Partial<AppState> }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_PRODUCT': {
      const now = new Date().toISOString()
      return {
        ...state,
        products: [
          ...state.products,
          { ...action.payload, id: generateId(), createdAt: now, updatedAt: now },
        ],
      }
    }
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.id
            ? { ...p, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : p
        ),
      }
    case 'REMOVE_PRODUCT': {
      if (!isSupabaseConfigured) cleanupProductData(action.payload)
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload),
        tasks: state.tasks.filter(t => t.productId !== action.payload),
      }
    }
    case 'SET_TASKS':
      return { ...state, tasks: action.payload }
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload ? { ...t, completed: !t.completed } : t
        ),
      }
    case 'ARCHIVE_WEEK': {
      if (state.tasks.length === 0) return state
      const weekRecord: WeekRecord = {
        id: state.currentWeekId,
        startDate: '',
        endDate: '',
        tasks: [...state.tasks],
        completedAt: new Date().toISOString(),
      }
      return {
        ...state,
        weekHistory: [...state.weekHistory, weekRecord],
        tasks: [],
        currentWeekId: getWeekId(),
      }
    }
    case 'IMPORT_STATE':
      return { ...action.payload, currentWeekId: getWeekId() }
    case 'RESET_STATE':
      return {
        products: [],
        currentWeekId: getWeekId(),
        tasks: [],
        weekHistory: [],
      }
    case '_HYDRATE':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

export function useAppState() {
  const [state, rawDispatch] = useReducer(reducer, null, loadState)
  const isHydrated = useRef(false)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  })

  // Load from Supabase on mount
  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false

    async function hydrate() {
      try {
        const [products, tasks] = await Promise.all([
          sb.loadProducts(),
          sb.loadTasks(getWeekId()),
        ])
        if (!cancelled) {
          rawDispatch({ type: '_HYDRATE', payload: { products, tasks } })
          isHydrated.current = true
        }
      } catch {
        // Fall back to localStorage data (already loaded)
      }
    }
    hydrate()
    return () => { cancelled = true }
  }, [])

  // Persist to localStorage (always, as cache/fallback)
  useEffect(() => {
    saveState(state)
  }, [state])

  // Dispatch wrapper that syncs mutations to Supabase
  const dispatch = useCallback((action: Action) => {
    rawDispatch(action)

    if (!isSupabaseConfigured) return

    // Fire-and-forget Supabase sync
    switch (action.type) {
      case 'ADD_PRODUCT': {
        // Pass the locally-generated ID to prevent ID divergence
        const localProduct = stateRef.current.products[stateRef.current.products.length - 1]
        sb.addProduct(action.payload, localProduct?.id).catch(() => {})
        break
      }
      case 'UPDATE_PRODUCT':
        sb.updateProduct(action.payload.id, action.payload.updates).catch(() => {})
        break
      case 'REMOVE_PRODUCT':
        sb.removeProduct(action.payload).catch(() => {})
        sb.removeKnowledgeBase(action.payload).catch(() => {})
        break
      case 'TOGGLE_TASK': {
        const task = stateRef.current.tasks.find(t => t.id === action.payload)
        if (task) sb.toggleTask(action.payload, !task.completed).catch(() => {})
        break
      }
      case 'SET_TASKS':
        sb.saveTasks(action.payload).catch(() => {})
        break
    }
  }, [])

  return { state, dispatch }
}
