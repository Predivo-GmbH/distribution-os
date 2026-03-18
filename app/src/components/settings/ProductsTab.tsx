import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { AppState } from '@/types'
import { ENGINE_META } from '@/types'
import type { Action } from '@/hooks/useAppState'
import { AddProductModal } from '@/components/shared/AddProductModal'

interface Props {
  state: AppState
  dispatch: React.Dispatch<Action>
}

export function ProductsTab({ state, dispatch }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState<typeof state.products[0] | undefined>()

  function openAdd() {
    setEditProduct(undefined)
    setShowModal(true)
  }

  function openEdit(product: typeof state.products[0]) {
    setEditProduct(product)
    setShowModal(true)
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this product? All associated tasks will also be removed.')) {
      dispatch({ type: 'REMOVE_PRODUCT', payload: id })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--color-ink-muted)]">
          {state.products.length} product{state.products.length !== 1 ? 's' : ''} registered
        </p>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors"
        >
          + Add Product
        </button>
      </div>

      {/* Product cards */}
      <div className="space-y-4">
        {state.products.map(product => {
          const productTasks = state.tasks.filter(t => t.productId === product.id && t.weekId === state.currentWeekId)
          const allEngines = [product.primaryEngine, ...product.secondaryEngines]

          return (
            <div
              key={product.id}
              className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: ENGINE_META[product.primaryEngine].color }}
                  />
                  <h3 className="text-base font-semibold text-[var(--color-ink)]">
                    {product.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--color-accent-light)] text-[var(--color-accent-text)]">
                    {product.stage.replace('-', ' ')}
                  </span>
                </div>
                <button
                  onClick={() => openEdit(product)}
                  className="text-sm text-[var(--color-accent-text)] hover:underline"
                >
                  Edit
                </button>
              </div>

              <p className="text-sm text-[var(--color-ink-body)] mb-3">
                {product.description || 'No description'}
              </p>

              {/* Engine badges */}
              <div className="flex flex-wrap gap-1.5 mb-3">
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
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-6 text-xs text-[var(--color-ink-muted)]">
                <span>Stage: <span className="capitalize">{product.stage.replace('-', ' ')}</span></span>
                <span>Revenue: {product.revenue ? `$${product.revenue.toLocaleString()} MRR` : '—'}</span>
                <span>Tasks this week: {productTasks.length}</span>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="ml-auto p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-bg)] transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}

        {state.products.length === 0 && (
          <div className="text-center py-12 text-[var(--color-ink-muted)]">
            <p className="text-sm">No products registered yet.</p>
            <button
              onClick={openAdd}
              className="mt-3 text-sm text-[var(--color-accent-text)] hover:underline"
            >
              Add your first product
            </button>
          </div>
        )}
      </div>

      <AddProductModal
        open={showModal}
        onClose={() => setShowModal(false)}
        dispatch={dispatch}
        editProduct={editProduct}
      />
    </div>
  )
}
