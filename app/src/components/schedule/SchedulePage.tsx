import { useState } from 'react'
import type { AppState } from '@/types'
import { PageMeta } from '@/components/shared/PageMeta'
import { APP_NAME } from '@/lib/app-config'
import { loadSchedulerConfig, loadRunRecords, DAY_LABELS } from '@/lib/ai'
import type { SchedulerConfig, WorkerRunRecord } from '@/lib/ai'
import { Clock, Calendar, Activity, CheckCircle2, XCircle, ChevronDown, ChevronRight } from 'lucide-react'

type Block = 'market-pulse' | 'build' | 'content' | 'outreach'

const DAILY_BLOCKS: { key: Block; label: string; desc: string; time: string }[] = [
  { key: 'market-pulse', label: 'Market Pulse', desc: 'Check competitors, industry news, trends', time: '8:00 - 9:00' },
  { key: 'build', label: 'Build', desc: 'Core product development, bug fixes, features', time: '9:00 - 12:00' },
  { key: 'content', label: 'Content', desc: 'Write posts, schedule social, record videos', time: '13:00 - 15:00' },
  { key: 'outreach', label: 'Outreach', desc: 'DMs, emails, partnership calls, networking', time: '15:00 - 17:00' },
]

export function SchedulePage(_props: { state: AppState }) {
  const [config] = useState<SchedulerConfig | null>(() => loadSchedulerConfig())
  const [records] = useState<WorkerRunRecord[]>(() => loadRunRecords())
  const [expandedBlock, setExpandedBlock] = useState<Block | null>('market-pulse')
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'activity'>('daily')

  const recentRecords = records.slice(-20).reverse()

  return (
    <div className="space-y-6">
      <PageMeta title={`Schedule — ${APP_NAME}`} noindex />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)] tracking-tight">Schedule & Ops</h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">Daily routine, weekly automations, and activity monitoring.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {[
          { key: 'daily' as const, label: 'Daily Routine', icon: Clock },
          { key: 'weekly' as const, label: 'Weekly Automations', icon: Calendar },
          { key: 'activity' as const, label: 'Activity Monitor', icon: Activity },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg text-xs font-medium transition-colors shrink-0 ${
              activeTab === key
                ? 'bg-[var(--color-accent-light)] text-[var(--color-accent-text)]'
                : 'text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Daily Routine */}
      {activeTab === 'daily' && (
        <div className="space-y-3">
          {DAILY_BLOCKS.map(block => {
            const isExpanded = expandedBlock === block.key
            return (
              <div key={block.key} className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedBlock(isExpanded ? null : block.key)}
                  className="w-full flex items-center justify-between px-4 sm:px-5 py-3 min-h-[44px] text-left hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[var(--color-ink-muted)] w-[90px] shrink-0">{block.time}</span>
                    <div>
                      <span className="text-sm font-semibold text-[var(--color-ink)]">{block.label}</span>
                      <p className="text-xs text-[var(--color-ink-muted)]">{block.desc}</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown size={14} className="text-[var(--color-ink-muted)]" /> : <ChevronRight size={14} className="text-[var(--color-ink-muted)]" />}
                </button>
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-4 border-t border-[var(--color-edge)] pt-3">
                    <p className="text-xs text-[var(--color-ink-muted)] mb-2">Suggested tasks for this block:</p>
                    <ul className="space-y-1.5">
                      {block.key === 'market-pulse' && (
                        <>
                          <li className="text-sm text-[var(--color-ink-body)]">Check competitor social media for new announcements</li>
                          <li className="text-sm text-[var(--color-ink-body)]">Review industry newsletters and trends</li>
                          <li className="text-sm text-[var(--color-ink-body)]">Update competitive positioning notes</li>
                        </>
                      )}
                      {block.key === 'build' && (
                        <>
                          <li className="text-sm text-[var(--color-ink-body)]">Work on top-priority feature or bug fix</li>
                          <li className="text-sm text-[var(--color-ink-body)]">Review and merge pull requests</li>
                          <li className="text-sm text-[var(--color-ink-body)]">Update documentation for recent changes</li>
                        </>
                      )}
                      {block.key === 'content' && (
                        <>
                          <li className="text-sm text-[var(--color-ink-body)]">Write and schedule social media posts</li>
                          <li className="text-sm text-[var(--color-ink-body)]">Draft blog article or newsletter</li>
                          <li className="text-sm text-[var(--color-ink-body)]">Engage with comments and community</li>
                        </>
                      )}
                      {block.key === 'outreach' && (
                        <>
                          <li className="text-sm text-[var(--color-ink-body)]">Send personalized DMs to 5 prospects</li>
                          <li className="text-sm text-[var(--color-ink-body)]">Follow up on pending conversations</li>
                          <li className="text-sm text-[var(--color-ink-body)]">Schedule partnership calls</li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Weekly Automations */}
      {activeTab === 'weekly' && config && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-[var(--color-ink)] mb-3">Scheduled Workers</h2>
          {config.schedules.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-muted)] italic">No workers scheduled yet. Configure schedules in Settings.</p>
          ) : (
            <div className="space-y-2">
              {config.schedules.map((sched, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--color-edge)] last:border-b-0">
                  <div>
                    <span className="text-sm text-[var(--color-ink)]">{sched.workerType}</span>
                    <p className="text-xs text-[var(--color-ink-muted)]">
                      {sched.cadence} · {sched.cadence === 'weekly' ? DAY_LABELS[sched.dayOfWeek] : 'Every day'}
                    </p>
                  </div>
                  <span className={`text-xs font-medium ${sched.enabled ? 'text-[var(--color-success)]' : 'text-[var(--color-ink-muted)]'}`}>
                    {sched.enabled ? 'Active' : 'Paused'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Activity Monitor */}
      {activeTab === 'activity' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-[var(--color-ink)] mb-3">Recent Activity</h2>
          {recentRecords.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-muted)] italic">No worker runs recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {recentRecords.map((record, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-[var(--color-edge)] last:border-b-0">
                  {record.success ? (
                    <CheckCircle2 size={14} className="text-[var(--color-success)] shrink-0" />
                  ) : (
                    <XCircle size={14} className="text-[var(--color-error)] shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-[var(--color-ink)]">{record.workerType}</span>
                    <p className="text-xs text-[var(--color-ink-muted)] truncate">{record.productName || record.productId}</p>
                  </div>
                  <span className="text-xs text-[var(--color-ink-muted)] shrink-0">
                    {new Date(record.runAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
