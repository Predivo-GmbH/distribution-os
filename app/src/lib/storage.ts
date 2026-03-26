/* ============================================================
   localStorage Data Layer + Supabase sync
   Local reads for speed, async Supabase sync for cloud persistence.
   ============================================================ */

import type { AppState, WeekRecord, UserPreferences, InboxArtifact, ArtifactStatus } from '@/types'
import { isSupabaseConfigured } from '@/lib/supabase'

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
    const parsed = { ...defaultState(), ...JSON.parse(raw) } as AppState

    // Ensure arrays exist (schema migration safety)
    if (!Array.isArray(parsed.products)) parsed.products = []
    if (!Array.isArray(parsed.tasks)) parsed.tasks = []
    if (!Array.isArray(parsed.weekHistory)) parsed.weekHistory = []

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
   Inbox Storage — AI-Generated Artifacts
   ============================================================ */

const INBOX_KEY = 'distribution-os-inbox'

export function loadInbox(): InboxArtifact[] {
  try {
    const raw = localStorage.getItem(INBOX_KEY)
    if (!raw) return []
    return JSON.parse(raw) as InboxArtifact[]
  } catch {
    return []
  }
}

export function saveInbox(artifacts: InboxArtifact[]): void {
  localStorage.setItem(INBOX_KEY, JSON.stringify(artifacts))
}

export function addArtifact(artifact: Omit<InboxArtifact, 'id' | 'generatedAt'>): InboxArtifact {
  const items = loadInbox()
  const newItem: InboxArtifact = {
    ...artifact,
    id: generateId(),
    generatedAt: new Date().toISOString(),
  }
  items.unshift(newItem)
  saveInbox(items)

  if (isSupabaseConfigured) {
    import('@/lib/supabase-storage').then(sb =>
      sb.addInboxArtifact(artifact).catch(() => {})
    )
  }

  return newItem
}

export function updateArtifact(id: string, updates: Partial<InboxArtifact>): void {
  const items = loadInbox()
  const idx = items.findIndex(a => a.id === id)
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...updates }
    saveInbox(items)
  }

  if (isSupabaseConfigured) {
    import('@/lib/supabase-storage').then(sb =>
      sb.updateInboxArtifact(id, updates).catch(() => {})
    )
  }
}

export function updateArtifactStatus(id: string, status: ArtifactStatus): void {
  updateArtifact(id, {
    status,
    ...(status === 'approved' ? { approvedAt: new Date().toISOString() } : {}),
    ...(status === 'published' ? { publishedAt: new Date().toISOString() } : {}),
  })
}

export function removeArtifact(id: string): void {
  const items = loadInbox().filter(a => a.id !== id)
  saveInbox(items)

  if (isSupabaseConfigured) {
    import('@/lib/supabase-storage').then(sb =>
      sb.removeInboxArtifact(id).catch(() => {})
    )
  }
}

export function getPendingCount(): number {
  return loadInbox().filter(a => a.status === 'pending').length
}

/* ============================================================
   Knowledge Base Storage
   Per-product AI context stored under kb:{productId}
   ============================================================ */

import type { KnowledgeBase } from '@/types'
import { defaultKnowledgeBase } from '@/types'

const KB_PREFIX = 'distribution-os-kb:'

export function loadKnowledgeBase(productId: string): KnowledgeBase {
  try {
    const raw = localStorage.getItem(KB_PREFIX + productId)
    if (!raw) return defaultKnowledgeBase()
    return { ...defaultKnowledgeBase(), ...JSON.parse(raw) }
  } catch {
    return defaultKnowledgeBase()
  }
}

export function saveKnowledgeBase(productId: string, kb: KnowledgeBase): void {
  localStorage.setItem(KB_PREFIX + productId, JSON.stringify(kb))

  if (isSupabaseConfigured) {
    import('@/lib/supabase-storage').then(sb =>
      sb.saveKnowledgeBase(productId, kb).catch(() => {})
    )
  }
}

export function removeKnowledgeBase(productId: string): void {
  localStorage.removeItem(KB_PREFIX + productId)

  if (isSupabaseConfigured) {
    import('@/lib/supabase-storage').then(sb =>
      sb.removeKnowledgeBase(productId).catch(() => {})
    )
  }
}

export function hasKnowledgeBase(productId: string): boolean {
  const kb = loadKnowledgeBase(productId)
  return kb.voiceExamples.length > 0 || kb.icp.who !== '' || kb.positioning.oneLiner !== ''
}

/* ============================================================
   Product Cleanup — Remove orphaned data on product deletion
   ============================================================ */

const CRM_PREFIX = 'distribution-os-crm:'

export function removeProductArtifacts(productId: string): void {
  const items = loadInbox().filter(a => a.productId !== productId)
  saveInbox(items)
}

export function removeConnectorCRM(productId: string): void {
  localStorage.removeItem(CRM_PREFIX + productId)
}

export function cleanupProductData(productId: string): void {
  removeKnowledgeBase(productId)
  removeProductArtifacts(productId)
  removeConnectorCRM(productId)
}

/* ============================================================
   Data Export
   ============================================================ */

export function exportState(state: AppState): string {
  return JSON.stringify(state, null, 2)
}
