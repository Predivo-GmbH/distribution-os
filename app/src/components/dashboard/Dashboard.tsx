import { useEffect, useMemo, useState } from 'react'
import { Search, Inbox, TrendingUp, TrendingDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { AppState } from '@/types'
import { ENGINE_META } from '@/types'
import type { Action } from '@/hooks/useAppState'
import { getTasksForProduct } from '@/data/task-templates'
import { generateId, getPendingCount } from '@/lib/storage'
import { IntelligencePanel } from '@/components/shared/IntelligencePanel'
import { GenerateButton } from '@/components/shared/GenerateButton'

interface Props {
  state: AppState
  dispatch: React.Dispatch<Action>
}

export function Dashboard({ state, dispatch }: Props) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const inboxPending = getPendingCount()
  const dateRange = useMemo(() => {
    const now = new Date()
    const start = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    const end = new Date(now.getTime() + 6 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    return `${start} — ${end}`
  }, [])

  // Generate tasks if none exist for current week
  useEffect(() => {
    if (state.tasks.length === 0 && state.products.length > 0) {
      const tasks = state.products.flatMap(product => {
        const engines = [product.primaryEngine, ...product.secondaryEngines]
        const templates = getTasksForProduct(product.stage, engines)
        return templates.map(t => ({
          id: generateId(),
          productId: product.id,
          engine: t.engine,
          title: t.title,
          description: t.description,
          score: t.score,
          completed: false,
          weekId: state.currentWeekId,
        }))
      })
      dispatch({ type: 'SET_TASKS', payload: tasks })
    }
  }, [state.products, state.tasks.length, state.currentWeekId, dispatch])

  const weekTasks = state.tasks.filter(t => t.weekId === state.currentWeekId)
  const totalScore = weekTasks.filter(t => t.completed).reduce((sum, t) => sum + t.score, 0)
  const maxScore = weekTasks.reduce((sum, t) => sum + t.score, 0)
  const overallPct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  // Last week for trend calculation
  const lastWeek = state.weekHistory.length > 0
    ? state.weekHistory[state.weekHistory.length - 1]
    : null

  // Per-engine metric cards
  const activeEngines = [...new Set(weekTasks.map(t => t.engine))]
  const engineMetrics = activeEngines.map(engine => {
    const tasks = weekTasks.filter(t => t.engine === engine)
    const completedTasks = tasks.filter(t => t.completed)
    const score = completedTasks.reduce((sum, t) => sum + t.score, 0)
    const max = tasks.reduce((sum, t) => sum + t.score, 0)
    const pct = max > 0 ? Math.round((score / max) * 100) : 0

    let trend: number | null = null
    if (lastWeek) {
      const lastScore = lastWeek.tasks
        .filter(t => t.engine === engine && t.completed)
        .reduce((sum, t) => sum + t.score, 0)
      trend = score - lastScore
    }

    return { engine, score, max, pct, trend }
  })

  // Filter tasks by search
  const filteredTasks = search
    ? weekTasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    : weekTasks

  const completed = weekTasks.filter(t => t.completed).length
  const total = weekTasks.length

  // Group filtered tasks by engine
  const tasksByEngine = filteredTasks.reduce((acc, task) => {
    if (!acc[task.engine]) acc[task.engine] = []
    acc[task.engine].push(task)
    return acc
  }, {} as Record<string, typeof filteredTasks>)

  return (
    <div className="space-y-6 sm:space-y-8">
      <IntelligencePanel id="dashboard-how" title="What you're building toward">
        <div className="space-y-2">
          <p><strong>Every task you complete is a brick in your distribution system.</strong> The goal isn't to check boxes — it's to build consistent growth channels that compound over time. Founders who do distribution work every week for 3–6 months see predictable, sustainable growth replace the guesswork.</p>
          <p>Tasks are auto-generated each Monday based on your products' stages and active engines. Your <strong>weekly score</strong> (top-right) tracks total points earned. Aim for 100%, but even consistent 60% weeks build real momentum.</p>
        </div>
      </IntelligencePanel>

      {/* Header with ambient glow */}
      <div className="relative">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-indigo-500/[0.06] blur-[100px] rounded-full pointer-events-none dark:block hidden" />
        <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)] tracking-tight">
              Week {state.currentWeekId.split('-W')[1]} Command Center
            </h1>
            <p className="text-[var(--color-ink-body)] mt-1 text-sm">
              {dateRange}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 sm:flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="w-full sm:w-44 min-h-[44px] pl-8 pr-3 py-2 rounded-xl border border-[var(--color-edge)] bg-[var(--color-surface)] text-base md:text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-edge-focus)] sm:focus:w-56 transition-all"
              />
            </div>
            {/* Score badge */}
            <div className="rounded-2xl border border-[var(--color-edge)] bg-[var(--color-surface)] px-4 py-2.5 shrink-0">
              <div className="font-mono text-2xl sm:text-3xl font-black tabular-nums bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                {totalScore}/{maxScore}
              </div>
              <div className="text-[10px] text-[var(--color-ink-muted)] uppercase tracking-wider text-center font-medium">
                Weekly Score
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inbox summary card */}
      {inboxPending > 0 && (
        <button
          onClick={() => navigate('/inbox')}
          className="w-full flex items-center gap-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] p-4 hover:bg-indigo-500/[0.08] hover:border-indigo-500/30 transition-all duration-300 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <Inbox size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              {inboxPending} item{inboxPending !== 1 ? 's' : ''} pending review
            </p>
            <p className="text-xs text-[var(--color-ink-muted)]">
              AI-generated artifacts across {state.products.length} product{state.products.length !== 1 ? 's' : ''}
            </p>
          </div>
          <span className="text-xs font-semibold text-[var(--color-accent-text)]">Review &rarr;</span>
        </button>
      )}

      {/* Per-engine metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {engineMetrics.map(({ engine, score, max, pct, trend }) => {
          const meta = ENGINE_META[engine as keyof typeof ENGINE_META]
          return (
            <div
              key={engine}
              className="relative overflow-hidden rounded-2xl border border-[var(--color-edge)] bg-[var(--color-surface)] p-5 transition-all duration-300 hover:border-[var(--color-edge-outline)]"
            >
              {/* Ambient engine color glow */}
              <div
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-[40px] pointer-events-none opacity-30 dark:opacity-20"
                style={{ backgroundColor: meta?.color }}
              />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: meta?.color,
                      boxShadow: `0 0 8px ${meta?.color}40`,
                    }}
                  />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">
                    {meta?.label} Engine
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="font-mono text-3xl font-black text-[var(--color-ink)] tabular-nums">
                    {pct}<span className="text-lg text-[var(--color-ink-muted)]">%</span>
                  </p>
                  {trend !== null && trend !== 0 && (
                    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${trend > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                      {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {trend > 0 ? '+' : ''}{trend}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--color-ink-muted)] mt-0.5">
                  {score} of {max} pts
                </p>
                <div className="mt-3 h-1.5 rounded-full bg-[var(--color-progress-track)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct === 100 ? 'var(--color-progress-success)' : meta?.color,
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Overall progress bar */}
      {maxScore > 0 && (
        <div className="rounded-2xl border border-[var(--color-edge)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--color-ink)]">Overall Progress</span>
            <span className="text-sm font-mono font-semibold text-[var(--color-accent-text)] tabular-nums">{overallPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-progress-track)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-indigo-500 to-violet-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Task list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">
            This Week's Tasks
          </h2>
          <span className="text-sm text-[var(--color-ink-muted)]">
            {completed} of {total} completed
          </span>
        </div>

        {/* Column headers */}
        <div className="hidden sm:flex items-center gap-3 px-4 py-2 mb-2">
          <div className="w-4" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-ink-muted)] w-20">Engine</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-ink-muted)] flex-1">Task</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-ink-muted)] w-20 text-center">AI</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-ink-muted)] w-16 text-right">Score</span>
        </div>

        {filteredTasks.length === 0 && search && (
          <div className="text-center py-12 text-sm text-[var(--color-ink-muted)]">
            No tasks match &ldquo;{search}&rdquo;
          </div>
        )}

        <div className="space-y-1.5">
          {Object.entries(tasksByEngine).flatMap(([engine, tasks]) =>
            tasks.map(task => {
              const product = state.products.find(p => p.id === task.productId)
              const meta = ENGINE_META[engine as keyof typeof ENGINE_META]
              return (
                <div
                  key={task.id}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--color-edge)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-edge-outline)] transition-all duration-200"
                >
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_TASK', payload: task.id })}
                    role="checkbox"
                    aria-checked={task.completed}
                    aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 -m-3 p-3 cursor-pointer"
                  >
                    <div
                      className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200"
                      style={{
                        backgroundColor: task.completed ? meta?.color || 'var(--color-accent)' : 'transparent',
                        borderColor: task.completed ? meta?.color || 'var(--color-accent)' : 'var(--color-edge-outline)',
                        boxShadow: task.completed ? `0 0 8px ${meta?.color}40` : 'none',
                      }}
                    >
                      {task.completed && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                  <span
                    className="hidden sm:inline-flex w-20 shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] font-mono"
                    style={{ color: meta?.color }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: meta?.color,
                        boxShadow: `0 0 6px ${meta?.color}30`,
                      }}
                    />
                    {meta?.label}
                  </span>
                  <div
                    className="sm:hidden w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: meta?.color }}
                  />
                  <span
                    className={`flex-1 text-sm ${
                      task.completed
                        ? 'text-[var(--color-ink-muted)] line-through'
                        : 'text-[var(--color-ink)]'
                    }`}
                  >
                    {task.title}
                  </span>
                  <span className="flex w-20 justify-center">
                    {product && !task.completed && <GenerateButton task={task} product={product} />}
                  </span>
                  <span className="font-mono text-xs font-semibold text-[var(--color-ink-muted)] tabular-nums w-auto sm:w-16 text-right shrink-0">
                    +{task.score}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
