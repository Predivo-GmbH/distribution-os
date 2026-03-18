/* ============================================================
   Distribution OS — Core Types
   ============================================================ */

export type ProductStage = 'pre-launch' | 'early' | 'active' | 'scaling'

export type Engine = 'pull' | 'push' | 'bridge' | 'search' | 'equity' | 'persistence'

export interface Product {
  id: string
  name: string
  description: string
  stage: ProductStage
  primaryEngine: Engine
  secondaryEngines: Engine[]
  color: string
  revenue?: number
  createdAt: string
  updatedAt: string
}

export type SubscriptionTier = 'free' | 'pro'

export interface UserPreferences {
  darkMode: boolean
  weekStartDay: 'monday' | 'sunday' | 'saturday'
}

export interface Task {
  id: string
  productId: string
  engine: Engine
  title: string
  description?: string
  score: number
  completed: boolean
  weekId: string
}

export interface WeekRecord {
  id: string // e.g. "2026-W11"
  startDate: string
  endDate: string
  tasks: Task[]
  completedAt?: string
}

export interface AppState {
  products: Product[]
  currentWeekId: string
  tasks: Task[]
  weekHistory: WeekRecord[]
}

export const ENGINE_META: Record<Engine, { label: string; color: string; lightBg: string }> = {
  pull:        { label: 'Pull',        color: 'var(--color-engine-pull)',        lightBg: 'var(--color-engine-pull-light)' },
  push:        { label: 'Push',        color: 'var(--color-engine-push)',        lightBg: 'var(--color-engine-push-light)' },
  bridge:      { label: 'Bridge',      color: 'var(--color-engine-bridge)',      lightBg: 'var(--color-engine-bridge-light)' },
  search:      { label: 'Search',      color: 'var(--color-engine-search)',      lightBg: 'var(--color-engine-search-light)' },
  equity:      { label: 'Equity',      color: 'var(--color-engine-equity)',      lightBg: 'var(--color-engine-equity-light)' },
  persistence: { label: 'Persistence', color: 'var(--color-engine-persistence)', lightBg: 'var(--color-engine-persistence-light)' },
}
