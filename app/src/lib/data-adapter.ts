/* ============================================================
   Data Adapter — LocalStorage ↔ Supabase
   Enables offline-first: localStorage works without auth,
   Supabase syncs when user is authenticated.
   ============================================================ */

import type { AppState, Product, Task, WeekRecord, UserPreferences, Engine, ProductStage } from '@/types'
import type { Database, DbProductStage, DbEngine } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { loadState, saveState, loadPrefs, savePrefs, getWeekId } from '@/lib/storage'

type ProductRow = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type TaskRow = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type WeekRecordRow = Database['public']['Tables']['week_records']['Row']
type PrefsRow = Database['public']['Tables']['user_preferences']['Row']

// ── Stage mapping (app uses 'pre-launch', DB uses 'pre_launch') ──

function toDbStage(stage: ProductStage): DbProductStage {
  return stage === 'pre-launch' ? 'pre_launch' : stage as DbProductStage
}

function fromDbStage(stage: DbProductStage): ProductStage {
  return stage === 'pre_launch' ? 'pre-launch' : stage as ProductStage
}

// ── Product mapping ──

function productToDb(p: Product, userId: string) {
  return {
    id: p.id,
    user_id: userId,
    name: p.name,
    description: p.description,
    stage: toDbStage(p.stage),
    primary_engine: p.primaryEngine as DbEngine,
    secondary_engines: p.secondaryEngines as DbEngine[],
    revenue: p.revenue ?? null,
    color: p.color,
  }
}

function productFromDb(row: {
  id: string
  name: string
  description: string
  stage: DbProductStage
  primary_engine: DbEngine
  secondary_engines: DbEngine[]
  revenue: number | null
  color: string
  created_at: string
  updated_at: string
}): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    stage: fromDbStage(row.stage),
    primaryEngine: row.primary_engine as Engine,
    secondaryEngines: (row.secondary_engines || []) as Engine[],
    revenue: row.revenue ?? undefined,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ── Task mapping ──

function taskToDb(t: Task, userId: string) {
  return {
    id: t.id,
    user_id: userId,
    product_id: t.productId,
    engine: t.engine as DbEngine,
    title: t.title,
    description: t.description ?? '',
    score: t.score,
    completed: t.completed,
    week_id: t.weekId,
  }
}

function taskFromDb(row: {
  id: string
  product_id: string
  engine: DbEngine
  title: string
  description: string
  score: number
  completed: boolean
  week_id: string
}): Task {
  return {
    id: row.id,
    productId: row.product_id,
    engine: row.engine as Engine,
    title: row.title,
    description: row.description || undefined,
    score: row.score,
    completed: row.completed,
    weekId: row.week_id,
  }
}

// ── Adapter Interface ──

export interface DataAdapter {
  loadAppState(): Promise<AppState>
  saveAppState(state: AppState): Promise<void>
  loadPreferences(): Promise<UserPreferences>
  savePreferences(prefs: UserPreferences): Promise<void>

  // Granular operations for Supabase (avoids full-state saves)
  addProduct(product: Product): Promise<void>
  updateProduct(id: string, updates: Partial<Product>): Promise<void>
  removeProduct(id: string): Promise<void>
  setTasks(tasks: Task[]): Promise<void>
  toggleTask(taskId: string, completed: boolean): Promise<void>
  archiveWeek(weekRecord: WeekRecord): Promise<void>
}

// ── LocalStorage Adapter ──

export class LocalStorageAdapter implements DataAdapter {
  async loadAppState(): Promise<AppState> {
    return loadState()
  }

  async saveAppState(state: AppState): Promise<void> {
    saveState(state)
  }

  async loadPreferences(): Promise<UserPreferences> {
    return loadPrefs()
  }

  async savePreferences(prefs: UserPreferences): Promise<void> {
    savePrefs(prefs)
  }

  async addProduct(): Promise<void> {
    // localStorage saves full state via useAppState effect
  }

  async updateProduct(): Promise<void> {}
  async removeProduct(): Promise<void> {}
  async setTasks(): Promise<void> {}
  async toggleTask(): Promise<void> {}
  async archiveWeek(): Promise<void> {}
}

// ── Supabase Adapter ──

export class SupabaseAdapter implements DataAdapter {
  userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  async loadAppState(): Promise<AppState> {
    const currentWeekId = getWeekId()

    // Fetch products
    const { data: productRows, error: prodErr } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at')

    if (prodErr) throw prodErr

    // Fetch current week tasks
    const { data: taskRows, error: taskErr } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', this.userId)
      .eq('week_id', currentWeekId)

    if (taskErr) throw taskErr

    // Fetch week history
    const { data: weekRows, error: weekErr } = await supabase
      .from('week_records')
      .select('*')
      .eq('user_id', this.userId)
      .order('week_id', { ascending: false })

    if (weekErr) throw weekErr

    return {
      products: ((productRows || []) as ProductRow[]).map(productFromDb),
      currentWeekId,
      tasks: ((taskRows || []) as TaskRow[]).map(taskFromDb),
      weekHistory: ((weekRows || []) as WeekRecordRow[]).map(r => ({
        id: r.week_id,
        startDate: '',
        endDate: '',
        tasks: [],
        completedAt: r.completed_at ?? undefined,
      })),
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async saveAppState(_state: AppState): Promise<void> {
    // Supabase uses granular operations, not full-state saves
  }

  async loadPreferences(): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('dark_mode, week_start_day')
      .eq('user_id', this.userId)
      .single()

    if (error || !data) {
      return { darkMode: false, weekStartDay: 'monday' }
    }

    const row = data as Pick<PrefsRow, 'dark_mode' | 'week_start_day'>
    return {
      darkMode: row.dark_mode,
      weekStartDay: row.week_start_day as UserPreferences['weekStartDay'],
    }
  }

  async savePreferences(prefs: UserPreferences): Promise<void> {
    await supabase
      .from('user_preferences')
      .update({
        dark_mode: prefs.darkMode,
        week_start_day: prefs.weekStartDay,
      } as Database['public']['Tables']['user_preferences']['Update'])
      .eq('user_id', this.userId)
  }

  async addProduct(product: Product): Promise<void> {
    const { error } = await supabase
      .from('products')
      .insert(productToDb(product, this.userId) as ProductInsert)

    if (error) throw error
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const dbUpdates: Record<string, unknown> = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.stage !== undefined) dbUpdates.stage = toDbStage(updates.stage)
    if (updates.primaryEngine !== undefined) dbUpdates.primary_engine = updates.primaryEngine
    if (updates.secondaryEngines !== undefined) dbUpdates.secondary_engines = updates.secondaryEngines
    if (updates.revenue !== undefined) dbUpdates.revenue = updates.revenue ?? null
    if (updates.color !== undefined) dbUpdates.color = updates.color

    const { error } = await supabase
      .from('products')
      .update(dbUpdates as Database['public']['Tables']['products']['Update'])
      .eq('id', id)
      .eq('user_id', this.userId)

    if (error) throw error
  }

  async removeProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', this.userId)

    if (error) throw error
  }

  async setTasks(tasks: Task[]): Promise<void> {
    if (tasks.length === 0) return

    const weekId = tasks[0].weekId
    // Delete existing tasks for this week, then insert new ones
    await supabase
      .from('tasks')
      .delete()
      .eq('user_id', this.userId)
      .eq('week_id', weekId)

    const { error } = await supabase
      .from('tasks')
      .insert(tasks.map(t => taskToDb(t, this.userId)) as TaskInsert[])

    if (error) throw error
  }

  async toggleTask(taskId: string, completed: boolean): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({ completed } as Database['public']['Tables']['tasks']['Update'])
      .eq('id', taskId)
      .eq('user_id', this.userId)

    if (error) throw error
  }

  async archiveWeek(weekRecord: WeekRecord): Promise<void> {
    const totalScore = weekRecord.tasks
      .filter(t => t.completed)
      .reduce((sum, t) => sum + t.score, 0)
    const maxScore = weekRecord.tasks.reduce((sum, t) => sum + t.score, 0)

    const { error } = await supabase
      .from('week_records')
      .upsert({
        user_id: this.userId,
        week_id: weekRecord.id,
        total_score: totalScore,
        max_score: maxScore,
        completed_at: weekRecord.completedAt ?? null,
      } as Database['public']['Tables']['week_records']['Insert'])

    if (error) throw error

    // Clear current week tasks
    await supabase
      .from('tasks')
      .delete()
      .eq('user_id', this.userId)
      .eq('week_id', weekRecord.id)
  }
}

// ── Factory ──

export function createAdapter(userId?: string): DataAdapter {
  if (userId) {
    return new SupabaseAdapter(userId)
  }
  return new LocalStorageAdapter()
}
