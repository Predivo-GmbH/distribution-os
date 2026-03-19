import { useReducer, useEffect } from 'react'
import type { AppState, Product, Task, WeekRecord } from '@/types'
import { loadState, saveState, generateId, getWeekId, cleanupProductData } from '@/lib/storage'

export type Action =
  | { type: 'ADD_PRODUCT'; payload: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_PRODUCT'; payload: { id: string; updates: Partial<Product> } }
  | { type: 'REMOVE_PRODUCT'; payload: string }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'ARCHIVE_WEEK' }
  | { type: 'IMPORT_STATE'; payload: AppState }
  | { type: 'RESET_STATE' }

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
      cleanupProductData(action.payload)
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
    default:
      return state
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(reducer, null, loadState)

  // Persist on every state change
  useEffect(() => {
    saveState(state)
  }, [state])

  return { state, dispatch }
}
