import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { AppState } from '@/types'
import { ENGINE_META } from '@/types'
import type { Action } from '@/hooks/useAppState'
import { ChevronRight, Pencil } from 'lucide-react'
import { IntelligencePanel } from '@/components/shared/IntelligencePanel'
import { AddProductModal } from '@/components/shared/AddProductModal'
import { GenerateButton } from '@/components/shared/GenerateButton'

interface Props {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const STAGE_RECOMMENDATIONS: Record<string, string> = {
  'pre-launch': 'Focus 70% on Push engine (outreach, waitlist) and 30% on Bridge (partnerships). Build anticipation before launch.',
  'early': 'Focus 60% on Pull engine (SEO, content) and 40% on Push (outbound). Establish organic foundations.',
  'active': 'Balance Pull (40%), Push (30%), and Bridge (30%). Diversify your distribution channels.',
  'scaling': 'Focus on Pull (50%) for compounding returns. Layer in Equity (25%) and Persistence (25%) for retention.',
}

const STAGE_COLORS: Record<string, string> = {
  'pre-launch': 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  'early': 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  'active': 'bg-[var(--color-info-bg)] text-[var(--color-info)]',
  'scaling': 'bg-[var(--color-accent-light)] text-[var(--color-accent-text)]',
}

export function ProductView({ state, dispatch }: Props) {
  const { id } = useParams<{ id: string }>()
  const product = state.products.find(p => p.id === id)
  const [showEditModal, setShowEditModal] = useState(false)

  if (!product) {
    return (
      <div className="text-center py-24">
        <p className="text-[var(--color-ink-muted)]">Product not found.</p>
        <Link to="/products" className="text-[var(--color-accent-text)] text-sm mt-2 inline-block">
          Back to Products
        </Link>
      </div>
    )
  }

  const productTasks = state.tasks.filter(t => t.productId === product.id && t.weekId === state.currentWeekId)
  const engines = [product.primaryEngine, ...product.secondaryEngines]

  // Group by engine
  const tasksByEngine = productTasks.reduce((acc, task) => {
    if (!acc[task.engine]) acc[task.engine] = []
    acc[task.engine].push(task)
    return acc
  }, {} as Record<string, typeof productTasks>)

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)]">
        <Link to="/dashboard" className="hover:text-[var(--color-accent-text)]">Dashboard</Link>
        <ChevronRight size={14} />
        <Link to="/products" className="hover:text-[var(--color-accent-text)]">Products</Link>
        <ChevronRight size={14} />
        <span className="text-[var(--color-ink)]">{product.name}</span>
      </div>

      {/* Product header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-[var(--color-ink)] tracking-tight">
            {product.name}
          </h1>
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${STAGE_COLORS[product.stage] || 'bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]'}`}>
            {product.stage.replace('-', ' ')}
          </span>
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--color-edge)] text-sm text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          <Pencil size={14} />
          Edit
        </button>
      </div>

      {/* Strategy recommendation */}
      <div className="bg-[var(--color-accent-light)] border border-[var(--color-edge)] rounded-xl p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--color-accent-text)] mb-1">
          Stage Recommendation — {product.stage.replace('-', ' ')}
        </p>
        <p className="text-sm text-[var(--color-ink-body)]">
          {STAGE_RECOMMENDATIONS[product.stage]}
        </p>
      </div>

      <IntelligencePanel id="product-tasks" title="Reading your task board">
        <div className="space-y-2">
          <p>Tasks are grouped by <strong>engine</strong> — each group represents a distribution channel. The counter (e.g. "2/4") shows completed vs total tasks per engine.</p>
          <p>Each task has a <strong>point value</strong> reflecting impact. Higher-point tasks (4–5 pts) have more strategic value. Prioritize these first if you're short on time.</p>
          <p>Click any task to mark it complete. Your progress feeds into the weekly score on your Dashboard.</p>
        </div>
      </IntelligencePanel>

      {/* Tasks by engine */}
      {engines.map(engine => {
        const tasks = tasksByEngine[engine] || []
        if (tasks.length === 0) return null

        return (
          <div key={engine}>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: ENGINE_META[engine].color }}
              />
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] font-mono text-[var(--color-ink-muted)]">
                {ENGINE_META[engine].label}
              </span>
              <span className="text-xs text-[var(--color-ink-muted)] ml-auto">
                {tasks.filter(t => t.completed).length}/{tasks.length}
              </span>
            </div>
            <div className="space-y-1">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-edge)] hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_TASK', payload: task.id })}
                    role="checkbox"
                    aria-checked={task.completed}
                    aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                    className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                    style={{
                      backgroundColor: task.completed ? 'var(--color-accent)' : 'transparent',
                      borderColor: task.completed ? 'var(--color-accent)' : 'var(--color-edge-outline)',
                    }}
                  >
                    {task.completed && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      task.completed
                        ? 'text-[var(--color-ink-muted)] line-through'
                        : 'text-[var(--color-ink)]'
                    }`}
                  >
                    {task.title}
                  </span>
                  {!task.completed && <GenerateButton task={task} product={product} />}
                  <span className="font-mono text-xs font-semibold text-[var(--color-ink-muted)] tabular-nums">
                    +{task.score} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      <AddProductModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        dispatch={dispatch}
        editProduct={product}
      />
    </div>
  )
}
