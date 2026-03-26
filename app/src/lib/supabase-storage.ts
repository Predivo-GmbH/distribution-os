/* ============================================================
   Supabase Data Layer — Distribution OS
   Mirrors localStorage API but reads/writes to Supabase.
   Only called when isSupabaseConfigured && user is authenticated.
   ============================================================ */

import { supabase } from '@/lib/supabase'
import type {
  Product, Task,
  UserPreferences, InboxArtifact, ArtifactStatus,
  KnowledgeBase, Engine, WorkerType,
} from '@/types'
import { defaultKnowledgeBase } from '@/types'
import type { Json, Database } from '@/types/database'

async function getUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser()
  if (!data.user) throw new Error('No authenticated user')
  return data.user.id
}

/* ============================================================
   Products
   ============================================================ */

export async function loadProducts(): Promise<Product[]> {
  const uid = await getUserId()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: true })
  if (error) throw error
  type ProductRow = Database['public']['Tables']['products']['Row']
  return ((data ?? []) as ProductRow[]).map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    stage: r.stage.replace('_', '-') as Product['stage'],
    primaryEngine: r.primary_engine as Engine,
    secondaryEngines: r.secondary_engines as Engine[],
    color: r.color,
    revenue: r.revenue ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))
}

export async function addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const uid = await getUserId()
  const { data, error } = await supabase
    .from('products')
    .insert({
      user_id: uid,
      name: product.name,
      description: product.description,
      stage: product.stage.replace('-', '_') as 'pre_launch' | 'early' | 'active' | 'scaling',
      primary_engine: product.primaryEngine,
      secondary_engines: product.secondaryEngines,
      color: product.color,
      revenue: product.revenue ?? null,
    })
    .select()
    .single()
  if (error) throw error
  const r = data as Database['public']['Tables']['products']['Row']
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    stage: r.stage.replace('_', '-') as Product['stage'],
    primaryEngine: r.primary_engine as Engine,
    secondaryEngines: r.secondary_engines as Engine[],
    color: r.color,
    revenue: r.revenue ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const dbUpdates: Record<string, unknown> = {}
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.description !== undefined) dbUpdates.description = updates.description
  if (updates.stage !== undefined) dbUpdates.stage = updates.stage.replace('-', '_')
  if (updates.primaryEngine !== undefined) dbUpdates.primary_engine = updates.primaryEngine
  if (updates.secondaryEngines !== undefined) dbUpdates.secondary_engines = updates.secondaryEngines
  if (updates.color !== undefined) dbUpdates.color = updates.color
  if (updates.revenue !== undefined) dbUpdates.revenue = updates.revenue ?? null

  const { error } = await supabase.from('products').update(dbUpdates).eq('id', id)
  if (error) throw error
}

export async function removeProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

/* ============================================================
   Tasks
   ============================================================ */

export async function loadTasks(weekId: string): Promise<Task[]> {
  const uid = await getUserId()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', uid)
    .eq('week_id', weekId)
  if (error) throw error
  type TaskRow = Database['public']['Tables']['tasks']['Row']
  return ((data ?? []) as TaskRow[]).map(r => ({
    id: r.id,
    productId: r.product_id,
    engine: r.engine as Engine,
    title: r.title,
    description: r.description || undefined,
    score: r.score,
    completed: r.completed,
    weekId: r.week_id,
  }))
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  const uid = await getUserId()
  // Upsert all tasks
  if (tasks.length === 0) return
  const rows = tasks.map(t => ({
    id: t.id,
    user_id: uid,
    product_id: t.productId,
    engine: t.engine,
    title: t.title,
    description: t.description ?? '',
    score: t.score,
    completed: t.completed,
    week_id: t.weekId,
  }))
  const { error } = await supabase.from('tasks').upsert(rows)
  if (error) throw error
}

export async function toggleTask(taskId: string, completed: boolean): Promise<void> {
  const { error } = await supabase.from('tasks').update({ completed }).eq('id', taskId)
  if (error) throw error
}

export async function deleteTasksByProduct(productId: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('product_id', productId)
  if (error) throw error
}

/* ============================================================
   User Preferences
   ============================================================ */

export async function loadUserPreferences(): Promise<UserPreferences> {
  const uid = await getUserId()
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', uid)
    .single()
  if (error || !data) return { darkMode: false, weekStartDay: 'monday' }
  const row = data as Database['public']['Tables']['user_preferences']['Row']
  return {
    darkMode: row.dark_mode,
    weekStartDay: row.week_start_day as UserPreferences['weekStartDay'],
  }
}

export async function saveUserPreferences(prefs: UserPreferences): Promise<void> {
  const uid = await getUserId()
  const { error } = await supabase
    .from('user_preferences')
    .update({
      dark_mode: prefs.darkMode,
      week_start_day: prefs.weekStartDay,
    })
    .eq('user_id', uid)
  if (error) throw error
}

/* ============================================================
   Inbox Artifacts
   ============================================================ */

export async function loadInboxArtifacts(): Promise<InboxArtifact[]> {
  const uid = await getUserId()
  const { data, error } = await supabase
    .from('inbox_artifacts')
    .select('*')
    .eq('user_id', uid)
    .order('generated_at', { ascending: false })
  if (error) throw error
  type ArtifactRow = Database['public']['Tables']['inbox_artifacts']['Row']
  return ((data ?? []) as ArtifactRow[]).map(r => ({
    id: r.id,
    productId: r.product_id,
    engine: r.engine as Engine,
    workerType: r.worker_type as WorkerType,
    taskTitle: r.task_title,
    status: r.status as ArtifactStatus,
    content: r.content,
    editedContent: r.edited_content ?? undefined,
    directionNote: r.direction_note ?? undefined,
    generatedAt: r.generated_at,
    approvedAt: r.approved_at ?? undefined,
    scheduledFor: r.scheduled_for ?? undefined,
    publishedAt: r.published_at ?? undefined,
  }))
}

export async function addInboxArtifact(artifact: Omit<InboxArtifact, 'id' | 'generatedAt'>): Promise<InboxArtifact> {
  const uid = await getUserId()
  const { data, error } = await supabase
    .from('inbox_artifacts')
    .insert({
      user_id: uid,
      product_id: artifact.productId,
      engine: artifact.engine,
      worker_type: artifact.workerType,
      task_title: artifact.taskTitle,
      status: artifact.status,
      content: artifact.content,
      edited_content: artifact.editedContent ?? null,
      direction_note: artifact.directionNote ?? null,
    })
    .select()
    .single()
  if (error) throw error
  const r = data as Database['public']['Tables']['inbox_artifacts']['Row']
  return {
    id: r.id,
    productId: r.product_id,
    engine: r.engine as Engine,
    workerType: r.worker_type as WorkerType,
    taskTitle: r.task_title,
    status: r.status as ArtifactStatus,
    content: r.content,
    editedContent: r.edited_content ?? undefined,
    directionNote: r.direction_note ?? undefined,
    generatedAt: r.generated_at,
    approvedAt: r.approved_at ?? undefined,
    scheduledFor: r.scheduled_for ?? undefined,
    publishedAt: r.published_at ?? undefined,
  }
}

export async function updateInboxArtifact(id: string, updates: Partial<InboxArtifact>): Promise<void> {
  const dbUpdates: Record<string, unknown> = {}
  if (updates.status !== undefined) dbUpdates.status = updates.status
  if (updates.content !== undefined) dbUpdates.content = updates.content
  if (updates.editedContent !== undefined) dbUpdates.edited_content = updates.editedContent
  if (updates.directionNote !== undefined) dbUpdates.direction_note = updates.directionNote
  if (updates.approvedAt !== undefined) dbUpdates.approved_at = updates.approvedAt
  if (updates.scheduledFor !== undefined) dbUpdates.scheduled_for = updates.scheduledFor
  if (updates.publishedAt !== undefined) dbUpdates.published_at = updates.publishedAt

  const { error } = await supabase.from('inbox_artifacts').update(dbUpdates).eq('id', id)
  if (error) throw error
}

export async function updateArtifactStatus(id: string, status: ArtifactStatus): Promise<void> {
  const updates: Record<string, unknown> = { status }
  if (status === 'approved') updates.approved_at = new Date().toISOString()
  if (status === 'published') updates.published_at = new Date().toISOString()

  const { error } = await supabase.from('inbox_artifacts').update(updates).eq('id', id)
  if (error) throw error
}

export async function removeInboxArtifact(id: string): Promise<void> {
  const { error } = await supabase.from('inbox_artifacts').delete().eq('id', id)
  if (error) throw error
}

export async function getPendingArtifactCount(): Promise<number> {
  const uid = await getUserId()
  const { count, error } = await supabase
    .from('inbox_artifacts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', uid)
    .eq('status', 'pending')
  if (error) throw error
  return count ?? 0
}

/* ============================================================
   Knowledge Base
   ============================================================ */

export async function loadKnowledgeBase(productId: string): Promise<KnowledgeBase> {
  const uid = await getUserId()
  const { data, error } = await supabase
    .from('knowledge_bases')
    .select('*')
    .eq('user_id', uid)
    .eq('product_id', productId)
    .single()
  if (error || !data) return defaultKnowledgeBase()
  const row = data as Database['public']['Tables']['knowledge_bases']['Row']
  return {
    voiceExamples: row.voice_examples ?? [],
    icp: {
      who: row.icp_who ?? '',
      pain: row.icp_pain ?? '',
      triedBefore: row.icp_tried_before ?? '',
      desiredOutcome: row.icp_desired_outcome ?? '',
      hangoutsOnline: row.icp_hangouts_online ?? '',
    },
    positioning: {
      oneLiner: row.positioning_one_liner ?? '',
      benefits: (row.positioning_benefits ?? ['', '', '']) as [string, string, string],
      competitor: row.positioning_competitor ?? '',
      switchReason: row.positioning_switch_reason ?? '',
    },
    tone: {
      formality: (row.tone_formality ?? 'conversational') as KnowledgeBase['tone']['formality'],
      technicality: (row.tone_technicality ?? 'accessible') as KnowledgeBase['tone']['technicality'],
      boldness: (row.tone_boldness ?? 'bold') as KnowledgeBase['tone']['boldness'],
      lengthPreference: (row.tone_length_preference ?? 'short-form') as KnowledgeBase['tone']['lengthPreference'],
    },
    approvedArtifacts: (row.approved_artifacts as unknown as KnowledgeBase['approvedArtifacts']) ?? [],
  }
}

export async function saveKnowledgeBase(productId: string, kb: KnowledgeBase): Promise<void> {
  const uid = await getUserId()
  const row = {
    user_id: uid,
    product_id: productId,
    voice_examples: kb.voiceExamples,
    icp_who: kb.icp.who,
    icp_pain: kb.icp.pain,
    icp_tried_before: kb.icp.triedBefore,
    icp_desired_outcome: kb.icp.desiredOutcome,
    icp_hangouts_online: kb.icp.hangoutsOnline,
    positioning_one_liner: kb.positioning.oneLiner,
    positioning_benefits: kb.positioning.benefits,
    positioning_competitor: kb.positioning.competitor,
    positioning_switch_reason: kb.positioning.switchReason,
    tone_formality: kb.tone.formality,
    tone_technicality: kb.tone.technicality,
    tone_boldness: kb.tone.boldness,
    tone_length_preference: kb.tone.lengthPreference,
    approved_artifacts: kb.approvedArtifacts as unknown as Json,
  }
  const { error } = await supabase
    .from('knowledge_bases')
    .upsert(row, { onConflict: 'user_id,product_id' })
  if (error) throw error
}

export async function removeKnowledgeBase(productId: string): Promise<void> {
  const uid = await getUserId()
  const { error } = await supabase
    .from('knowledge_bases')
    .delete()
    .eq('user_id', uid)
    .eq('product_id', productId)
  if (error) throw error
}

export async function hasKnowledgeBase(productId: string): Promise<boolean> {
  const kb = await loadKnowledgeBase(productId)
  return kb.voiceExamples.length > 0 || kb.icp.who !== '' || kb.positioning.oneLiner !== ''
}
