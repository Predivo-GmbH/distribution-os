/* ============================================================
   Automation Scheduler
   Runs workers on defined cadences without manual triggering.
   Uses setInterval + stored next-run timestamps.
   ============================================================ */

import type { Product, WorkerType } from '@/types'

const SCHEDULER_CONFIG_KEY = 'distribution-os-scheduler-config'
const SCHEDULER_RUNS_KEY = 'distribution-os-scheduler-runs'

/* ------------------------------------------------------------
   Types
   ------------------------------------------------------------ */

export type ScheduleCadence = 'daily' | 'weekly'

export interface WorkerSchedule {
  workerType: WorkerType
  enabled: boolean
  cadence: ScheduleCadence
  dayOfWeek: number // 0=Sun, 1=Mon, ... 6=Sat (for weekly)
  hour: number // 0-23
  minute: number // 0-59
  autoApprove: boolean
  autoApproveThreshold?: number // 0-100, confidence score
}

export interface SchedulerConfig {
  enabled: boolean
  schedules: WorkerSchedule[]
}

export interface WorkerRunRecord {
  workerType: WorkerType
  lastRun: string // ISO date
  nextRun: string // ISO date
  productId: string
  status: 'success' | 'error' | 'skipped'
  error?: string
}

/* ------------------------------------------------------------
   Default Schedule (from spec)
   ------------------------------------------------------------ */

const DEFAULT_SCHEDULES: WorkerSchedule[] = [
  { workerType: 'linkedin-director',          enabled: true,  cadence: 'weekly', dayOfWeek: 0, hour: 8,  minute: 0,  autoApprove: false },
  { workerType: 'keyword-research',           enabled: true,  cadence: 'weekly', dayOfWeek: 0, hour: 8,  minute: 0,  autoApprove: false },
  { workerType: 'connector-research',         enabled: true,  cadence: 'weekly', dayOfWeek: 0, hour: 8,  minute: 0,  autoApprove: false },
  { workerType: 'weekly-diagnostician',       enabled: true,  cadence: 'weekly', dayOfWeek: 0, hour: 20, minute: 0,  autoApprove: false },
  { workerType: 'content-performance-analyst',enabled: true,  cadence: 'weekly', dayOfWeek: 6, hour: 20, minute: 0,  autoApprove: false },
  { workerType: 'roas-analyst',               enabled: true,  cadence: 'weekly', dayOfWeek: 1, hour: 7,  minute: 0,  autoApprove: false },
  { workerType: 'connector-performance',      enabled: true,  cadence: 'weekly', dayOfWeek: 1, hour: 7,  minute: 0,  autoApprove: false },
  { workerType: 'stage-transition-advisor',   enabled: true,  cadence: 'weekly', dayOfWeek: 0, hour: 20, minute: 0,  autoApprove: false },
  { workerType: 'follow-up-sequence',         enabled: true,  cadence: 'daily',  dayOfWeek: 0, hour: 9,  minute: 0,  autoApprove: false },
  { workerType: 'improvement-prioritizer',    enabled: true,  cadence: 'daily',  dayOfWeek: 0, hour: 8,  minute: 0,  autoApprove: false },
  { workerType: 'search-console-optimizer',   enabled: true,  cadence: 'weekly', dayOfWeek: 1, hour: 7,  minute: 0,  autoApprove: false },
]

/* ------------------------------------------------------------
   Config Storage
   ------------------------------------------------------------ */

export function loadSchedulerConfig(): SchedulerConfig {
  try {
    const raw = localStorage.getItem(SCHEDULER_CONFIG_KEY)
    if (!raw) return { enabled: false, schedules: DEFAULT_SCHEDULES }
    const parsed = JSON.parse(raw) as SchedulerConfig
    // Merge with defaults to pick up new workers
    const existingTypes = new Set(parsed.schedules.map(s => s.workerType))
    const merged = [
      ...parsed.schedules,
      ...DEFAULT_SCHEDULES.filter(d => !existingTypes.has(d.workerType)),
    ]
    return { ...parsed, schedules: merged }
  } catch {
    return { enabled: false, schedules: DEFAULT_SCHEDULES }
  }
}

export function saveSchedulerConfig(config: SchedulerConfig): void {
  localStorage.setItem(SCHEDULER_CONFIG_KEY, JSON.stringify(config))
}

/* ------------------------------------------------------------
   Run Records Storage
   ------------------------------------------------------------ */

export function loadRunRecords(): WorkerRunRecord[] {
  try {
    const raw = localStorage.getItem(SCHEDULER_RUNS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as WorkerRunRecord[]
  } catch {
    return []
  }
}

export function saveRunRecords(records: WorkerRunRecord[]): void {
  localStorage.setItem(SCHEDULER_RUNS_KEY, JSON.stringify(records))
}

function recordRun(workerType: WorkerType, productId: string, status: 'success' | 'error' | 'skipped', nextRun: Date, error?: string): void {
  const records = loadRunRecords()
  const idx = records.findIndex(r => r.workerType === workerType && r.productId === productId)
  const record: WorkerRunRecord = {
    workerType,
    productId,
    lastRun: new Date().toISOString(),
    nextRun: nextRun.toISOString(),
    status,
    error,
  }
  if (idx !== -1) {
    records[idx] = record
  } else {
    records.push(record)
  }
  saveRunRecords(records)
}

/* ------------------------------------------------------------
   Next Run Calculation
   ------------------------------------------------------------ */

export function getNextRunTime(schedule: WorkerSchedule, fromDate: Date = new Date()): Date {
  const next = new Date(fromDate)
  next.setSeconds(0, 0)

  if (schedule.cadence === 'daily') {
    next.setHours(schedule.hour, schedule.minute)
    if (next <= fromDate) {
      next.setDate(next.getDate() + 1)
    }
  } else {
    // Weekly
    next.setHours(schedule.hour, schedule.minute)
    const currentDay = next.getDay()
    let daysUntil = schedule.dayOfWeek - currentDay
    if (daysUntil < 0 || (daysUntil === 0 && next <= fromDate)) {
      daysUntil += 7
    }
    next.setDate(next.getDate() + daysUntil)
  }

  return next
}

export function isDue(schedule: WorkerSchedule, productId: string): boolean {
  const records = loadRunRecords()
  const record = records.find(r => r.workerType === schedule.workerType && r.productId === productId)

  if (!record) return true // Never run before

  const nextRun = new Date(record.nextRun)
  return new Date() >= nextRun
}

/* ------------------------------------------------------------
   Scheduler Tick — Check and run due workers
   ------------------------------------------------------------ */

export type WorkerExecutor = (workerType: WorkerType, product: Product) => Promise<{ success: boolean; error?: string }>

export async function schedulerTick(products: Product[], executor: WorkerExecutor): Promise<number> {
  const config = loadSchedulerConfig()
  if (!config.enabled) return 0

  let ranCount = 0

  for (const schedule of config.schedules) {
    if (!schedule.enabled) continue

    for (const product of products) {
      if (!isDue(schedule, product.id)) continue

      const nextRun = getNextRunTime(schedule)

      try {
        const result = await executor(schedule.workerType, product)
        recordRun(schedule.workerType, product.id, result.success ? 'success' : 'error', nextRun, result.error)
        if (result.success) ranCount++
      } catch (err) {
        recordRun(schedule.workerType, product.id, 'error', nextRun, err instanceof Error ? err.message : 'Unknown error')
      }
    }
  }

  return ranCount
}

/* ------------------------------------------------------------
   Day labels
   ------------------------------------------------------------ */

export const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
