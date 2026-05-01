import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { AppState } from '@/types'
import { ENGINE_META } from '@/types'
import type { Action } from '@/hooks/useAppState'
import { ArrowRight } from 'lucide-react'
import { AddProductModal } from '@/components/shared/AddProductModal'

interface Props {
  state: AppState
  dispatch: React.Dispatch<Action>
}

export function ProductsList({ state, dispatch }: Props) {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)] tracking-tight">
            Products
          </h1>
          <p className="text-sm text-[var(--color-ink-body)] mt-1">
            Manage your SaaS products and their distribution engine assignments.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors whitespace-nowrap shrink-0"
        >
          + Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.products.map(product => {
          const tasks = state.tasks.filter(t => t.productId === product.id)
          const completed = tasks.filter(t => t.completed).length
          const allEngines = [product.primaryEngine, ...product.secondaryEngines]

          return (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl p-4 sm:p-5 hover:border-[var(--color-accent-muted)] transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[var(--color-ink)]">{product.name}</h3>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--color-accent-light)] text-[var(--color-accent-text)]">
                      {product.stage.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-ink-body)] mt-0.5 line-clamp-2">{product.description}</p>
                </div>
                <ArrowRight
                  size={16}
                  className="text-[var(--color-ink-muted)] group-hover:text-[var(--color-accent)] transition-colors mt-1"
                />
              </div>

              {/* Revenue */}
              {product.revenue && (
                <p className="text-sm font-mono font-semibold text-[var(--color-ink)] mb-3">
                  ${product.revenue.toLocaleString()} <span className="text-xs font-normal text-[var(--color-ink-muted)]">MRR</span>
                </p>
              )}

              {/* Engine badges + stats */}
              <div className="flex items-center gap-2 flex-wrap">
                {allEngines.map(engine => (
                  <span
                    key={engine}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                    style={{
                      color: ENGINE_META[engine].color,
                      backgroundColor: ENGINE_META[engine].lightBg,
                    }}
                  >
                    {ENGINE_META[engine].label}
                  </span>
                ))}
                <span className="text-xs text-[var(--color-ink-muted)] ml-auto">
                  {completed}/{tasks.length} tasks
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      <AddProductModal
        open={showModal}
        onClose={() => setShowModal(false)}
        dispatch={dispatch}
      />
    </div>
  )
}
