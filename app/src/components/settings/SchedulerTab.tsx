import { useState } from 'react'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { WORKER_LABELS } from '@/types'
import type { SchedulerConfig, WorkerSchedule } from '@/lib/ai/scheduler'
import { loadSchedulerConfig, saveSchedulerConfig, loadRunRecords, DAY_LABELS, getNextRunTime } from '@/lib/ai/scheduler'
import { isAIConfigured } from '@/lib/ai/config'

export function SchedulerTab() {
  const [config, setConfig] = useState<SchedulerConfig>(loadSchedulerConfig())
  const [saved, setSaved] = useState(false)
  const records = loadRunRecords()
  const aiConfigured = isAIConfigured()

  function handleSave() {
    saveSchedulerConfig(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function toggleEnabled() {
    setConfig(prev => ({ ...prev, enabled: !prev.enabled }))
  }

  function updateSchedule(idx: number, updates: Partial<WorkerSchedule>) {
    setConfig(prev => ({
      ...prev,
      schedules: prev.schedules.map((s, i) => i === idx ? { ...s, ...updates } : s),
    }))
  }

  function getLastRun(workerType: string): string | null {
    const record = records.find(r => r.workerType === workerType)
    if (!record) return null
    return new Date(record.lastRun).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (!aiConfigured) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--color-warning-bg)] border border-[var(--color-warning)]/20">
        <AlertCircle size={16} className="text-[var(--color-warning)]" />
        <span className="text-sm text-[var(--color-ink)]">
          Configure your Anthropic API key in the AI Configuration tab before enabling the scheduler.
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Master toggle */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--color-ink)]">Automation Scheduler</h3>
            <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
              When enabled, workers run automatically on their configured schedule. Generated artifacts appear in the Inbox for review.
            </p>
          </div>
          <div className="min-h-[44px] flex items-center">
            <button
              onClick={toggleEnabled}
              role="switch"
              aria-checked={config.enabled}
              aria-label="Automation Scheduler"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.enabled ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-edge-outline)]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  config.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Worker schedule list */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 sm:px-5 border-b border-[var(--color-edge)]">
          <h3 className="text-base font-semibold text-[var(--color-ink)]">Worker Schedules</h3>
        </div>

        <div className="divide-y divide-[var(--color-edge)]">
          {config.schedules.map((schedule, idx) => {
            const lastRun = getLastRun(schedule.workerType)
            const nextRun = schedule.enabled ? getNextRunTime(schedule) : null

            return (
              <div key={schedule.workerType} className="px-4 py-4 sm:px-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--color-ink)]">
                        {WORKER_LABELS[schedule.workerType]}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        schedule.cadence === 'daily'
                          ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]'
                          : 'bg-[var(--color-info-bg)] text-[var(--color-info)]'
                      }`}>
                        {schedule.cadence}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-[var(--color-ink-muted)]">
                      {schedule.cadence === 'weekly' && (
                        <span>{DAY_LABELS[schedule.dayOfWeek]}s at {String(schedule.hour).padStart(2, '0')}:{String(schedule.minute).padStart(2, '0')}</span>
                      )}
                      {schedule.cadence === 'daily' && (
                        <span>Daily at {String(schedule.hour).padStart(2, '0')}:{String(schedule.minute).padStart(2, '0')}</span>
                      )}
                      {lastRun && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> Last: {lastRun}
                        </span>
                      )}
                      {nextRun && schedule.enabled && (
                        <span>Next: {nextRun.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
                    {/* Time picker */}
                    <input
                      type="time"
                      value={`${String(schedule.hour).padStart(2, '0')}:${String(schedule.minute).padStart(2, '0')}`}
                      onChange={e => {
                        const [h, m] = e.target.value.split(':').map(Number)
                        updateSchedule(idx, { hour: h, minute: m })
                      }}
                      className="px-2 py-1 min-h-[44px] rounded border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-base md:text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-edge-focus)]"
                    />

                    {/* Day picker for weekly */}
                    {schedule.cadence === 'weekly' && (
                      <select
                        value={schedule.dayOfWeek}
                        onChange={e => updateSchedule(idx, { dayOfWeek: parseInt(e.target.value) })}
                        className="px-2 py-1 min-h-[44px] rounded border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-base md:text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-edge-focus)]"
                      >
                        {DAY_LABELS.map((day, i) => (
                          <option key={i} value={i}>{day.slice(0, 3)}</option>
                        ))}
                      </select>
                    )}

                    {/* Enable toggle */}
                    <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <button
                        onClick={() => updateSchedule(idx, { enabled: !schedule.enabled })}
                        role="switch"
                        aria-checked={schedule.enabled}
                        aria-label={`${WORKER_LABELS[schedule.workerType]} schedule`}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          schedule.enabled ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-edge-outline)]'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                            schedule.enabled ? 'translate-x-4.5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="px-5 py-2 min-h-[44px] rounded-xl bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors"
        >
          Save Schedule
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-[var(--color-success)]">
            <CheckCircle2 size={14} /> Saved
          </span>
        )}
      </div>
    </div>
  )
}
