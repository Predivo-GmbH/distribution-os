import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Sparkles, Loader2 } from 'lucide-react'
import type { Product, ProductStage, Engine } from '@/types'
import { ENGINE_META } from '@/types'
import type { Action } from '@/hooks/useAppState'
import { Input } from '@/components/ui/Input'
import { useAISuggest } from '@/hooks/useAISuggest'

interface Props {
  open: boolean
  onClose: () => void
  dispatch: React.Dispatch<Action>
  editProduct?: Product
}

const STAGES: { value: ProductStage; label: string; desc: string }[] = [
  { value: 'pre-launch', label: 'Pre-Launch', desc: 'Building, not yet live' },
  { value: 'early', label: 'Early', desc: 'Recently launched, finding users' },
  { value: 'active', label: 'Active', desc: 'Growing, consistent traction' },
  { value: 'scaling', label: 'Scaling', desc: 'Established, optimizing growth' },
]

const ENGINES: Engine[] = ['pull', 'push', 'bridge', 'search', 'equity', 'persistence']

const ENGINE_DESCRIPTIONS: Record<Engine, string> = {
  pull: 'SEO, content marketing, organic',
  push: 'Outreach, cold email, ads',
  bridge: 'Partnerships, cross-promotion',
  search: 'SEO, paid search, directories',
  equity: 'Brand, community, referrals',
  persistence: 'Lifecycle, retention, email',
}

export function AddProductModal({ open, onClose, dispatch, editProduct }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [revenue, setRevenue] = useState('')
  const [stage, setStage] = useState<ProductStage>('early')
  const [primaryEngine, setPrimaryEngine] = useState<Engine>('pull')
  const [secondaryEngines, setSecondaryEngines] = useState<Engine[]>([])
  const ai = useAISuggest()

  // Pre-fill when editing — setState in effect is intentional here to sync form with prop
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name)
      setDescription(editProduct.description)
      setRevenue(editProduct.revenue ? String(editProduct.revenue) : '')
      setStage(editProduct.stage)
      setPrimaryEngine(editProduct.primaryEngine)
      setSecondaryEngines(editProduct.secondaryEngines)
    } else {
      setName('')
      setDescription('')
      setRevenue('')
      setStage('early')
      setPrimaryEngine('pull')
      setSecondaryEngines([])
    }
  }, [editProduct, open])
  /* eslint-enable react-hooks/set-state-in-effect */

  const modalRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  // Capture the trigger element when modal opens, restore focus on close
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement
    }
  }, [open])

  const handleClose = useCallback(() => {
    onClose()
    // Return focus to trigger button after close
    setTimeout(() => triggerRef.current?.focus(), 0)
  }, [onClose])

  // Keyboard: Escape to close + focus trap (Tab/Shift+Tab)
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleClose()
        return
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus() }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus() }
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handleClose])

  // Auto-focus first input on mount
  useEffect(() => {
    if (open && modalRef.current) {
      const firstInput = modalRef.current.querySelector<HTMLElement>('input, textarea, select')
      firstInput?.focus()
    }
  }, [open])

  async function handleAISuggest() {
    if (!name.trim()) return
    const result = await ai.analyze(name, description)
    if (!result) return
    if (!description.trim() && result.description) setDescription(result.description)
    setStage(result.stage)
    setPrimaryEngine(result.primaryEngine)
    setSecondaryEngines(result.secondaryEngines.filter(e => e !== result.primaryEngine))
  }

  function toggleSecondary(engine: Engine) {
    setSecondaryEngines(prev =>
      prev.includes(engine) ? prev.filter(e => e !== engine) : [...prev, engine]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    const revenueNum = revenue ? parseFloat(revenue) : undefined

    if (editProduct) {
      dispatch({
        type: 'UPDATE_PRODUCT',
        payload: {
          id: editProduct.id,
          updates: {
            name: name.trim(),
            description: description.trim(),
            revenue: revenueNum,
            stage,
            primaryEngine,
            secondaryEngines: secondaryEngines.filter(e => e !== primaryEngine),
            color: ENGINE_META[primaryEngine].color,
          },
        },
      })
    } else {
      dispatch({
        type: 'ADD_PRODUCT',
        payload: {
          name: name.trim(),
          description: description.trim(),
          revenue: revenueNum,
          stage,
          primaryEngine,
          secondaryEngines: secondaryEngines.filter(e => e !== primaryEngine),
          color: ENGINE_META[primaryEngine].color,
        },
      })
    }
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="modal-title" className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--color-surface)] rounded-2xl shadow-lg border border-[var(--color-edge)] mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <h2 id="modal-title" className="text-lg font-semibold text-[var(--color-ink)]">
            {editProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Product Name</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. DistroKit, BelegPilot..."
            />
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">Enter a product name</p>
          </div>

          {/* AI Suggest banner */}
          {ai.available && name.trim() && !editProduct && (
            <button
              type="button"
              onClick={handleAISuggest}
              disabled={ai.loading}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-dashed border-[var(--color-accent)]/40 bg-[var(--color-accent-light)]/50 text-left transition-colors hover:border-[var(--color-accent)]/70 disabled:opacity-60"
            >
              {ai.loading ? <Loader2 size={14} className="animate-spin text-[var(--color-accent-text)]" /> : <Sparkles size={14} className="text-[var(--color-accent-text)]" />}
              <span className="text-xs font-medium text-[var(--color-accent-text)]">
                {ai.loading ? 'Analyzing product...' : 'AI Fill — auto-suggest description, stage & engines'}
              </span>
            </button>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Description</label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Short description of your product"
            />
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">Briefly describe what this product does</p>
          </div>

          {/* Revenue */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Monthly Revenue (optional)</label>
            <Input
              type="number"
              value={revenue}
              onChange={e => setRevenue(e.target.value)}
              placeholder="e.g. 2500"
            />
          </div>

          {/* Product Stage */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-2">Product Stage</label>
            <div role="radiogroup" aria-label="Product stage" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STAGES.map(s => (
                <button
                  key={s.value}
                  type="button"
                  role="radio"
                  aria-checked={stage === s.value}
                  onClick={() => setStage(s.value)}
                  className={`px-3 py-2 min-h-[44px] rounded-lg border text-center transition-colors ${
                    stage === s.value
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)] text-[var(--color-accent-text)] font-medium'
                      : 'border-[var(--color-edge)] text-[var(--color-ink-body)] hover:border-[var(--color-edge-outline)]'
                  }`}
                >
                  <span className="text-xs">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Distribution Engines */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Distribution Engines</label>
            <p className="text-xs text-[var(--color-ink-muted)] mb-3">Select the engines you want to activate for this product.</p>
            <div className="space-y-2">
              {ENGINES.map(engine => {
                const isPrimary = primaryEngine === engine
                const isSecondary = secondaryEngines.includes(engine)
                const isSelected = isPrimary || isSecondary

                return (
                  <div key={engine} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors ${
                    isSelected
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]'
                      : 'border-[var(--color-edge)] hover:border-[var(--color-edge-outline)]'
                  }`}>
                    <button
                      type="button"
                      onClick={() => {
                        if (isPrimary) return
                        toggleSecondary(engine)
                      }}
                      className="flex items-center gap-3 flex-1 min-w-0 min-h-[44px]"
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
                            : 'border-[var(--color-edge-outline)]'
                        }`}
                      >
                        {isSelected && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: ENGINE_META[engine].color }}
                      />
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-[var(--color-ink)]">
                          {ENGINE_META[engine].label}
                          {isPrimary && (
                            <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--color-accent-text)]">Primary</span>
                          )}
                        </span>
                        <p className="text-xs text-[var(--color-ink-muted)]">
                          {ENGINE_DESCRIPTIONS[engine]}
                        </p>
                      </div>
                    </button>
                    {isSelected && !isPrimary && (
                      <button
                        type="button"
                        onClick={() => setPrimaryEngine(engine)}
                        className="shrink-0 px-3 py-2 min-h-[44px] rounded text-xs font-medium text-[var(--color-accent-text)] hover:bg-[var(--color-accent-light)] border border-[var(--color-accent)]/30 transition-colors"
                      >
                        Set as Primary
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 min-h-[44px] rounded-lg text-sm text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editProduct ? 'Save Changes' : '+ Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
