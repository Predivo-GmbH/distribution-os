import { useState } from 'react'
import { X, Zap } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'

interface Props {
  open: boolean
  onClose: () => void
  feature: string
  userId?: string
}

export function UpgradeModal({ open, onClose, feature, userId }: Props) {
  const { openCheckout } = useSubscription(userId)
  const [loading, setLoading] = useState(false)

  if (!open) return null

  async function handleUpgrade() {
    setLoading(true)
    try {
      await openCheckout()
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-accent-light)] mx-auto mb-4">
          <Zap size={20} className="text-[var(--color-accent)]" />
        </div>

        <h2 className="text-lg font-semibold text-[var(--color-ink)] text-center mb-1">
          Upgrade to Pro
        </h2>
        <p className="text-sm text-[var(--color-ink-body)] text-center mb-6">
          <strong>{feature}</strong> is a Pro feature. Upgrade to unlock unlimited products, history tracking, dark mode, and more.
        </p>

        <div className="flex items-baseline justify-center gap-1 mb-6">
          <span className="text-3xl font-bold text-[var(--color-ink)]">$19</span>
          <span className="text-sm text-[var(--color-ink-muted)]">/month</span>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:opacity-50 mb-3"
        >
          {loading ? 'Redirecting to checkout...' : 'Upgrade Now'}
        </button>
        <button
          onClick={onClose}
          className="w-full py-2 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink-body)] transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
