import { useState } from 'react'
import { CreditCard, ArrowUpRight } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'
import { isSupabaseConfigured } from '@/lib/supabase'
import { PAID_TIERS, startCheckout, openBillingPortal, type PaidTier } from '@/lib/billing'

const TIER_ORDER = ['free', 'starter', 'growth', 'scale'] as const

const TIER_DISPLAY: Record<PaidTier, { name: string; price: string; blurb: string }> = {
  starter: { name: 'Starter', price: '$19/mo', blurb: '2 products · 15 AI runs/month' },
  growth: { name: 'Growth', price: '$49/mo', blurb: '5 products · 50 AI runs/month' },
  scale: { name: 'Scale', price: '$99/mo', blurb: 'Unlimited products · unlimited AI runs' },
}

export function BillingTab() {
  const { tier, isPaid, limits, loading } = useSubscription()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const currentRank = TIER_ORDER.indexOf(tier as (typeof TIER_ORDER)[number])
  const upgrades = PAID_TIERS.filter(t => TIER_ORDER.indexOf(t) > currentRank)

  async function handleUpgrade(t: PaidTier) {
    setBusy(t)
    setError(null)
    try {
      window.location.href = await startCheckout(t)
    } catch {
      setError('Could not start checkout. Please try again.')
      setBusy(null)
    }
  }

  async function handlePortal() {
    setBusy('portal')
    setError(null)
    try {
      window.location.href = await openBillingPortal()
    } catch {
      setError('Could not open the billing portal. Please try again.')
      setBusy(null)
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl p-4 sm:p-5">
        <p className="text-sm text-[var(--color-ink-muted)]">
          Billing is unavailable in local mode.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard size={16} className="text-[var(--color-ink-muted)]" />
          <h3 className="text-sm font-semibold text-[var(--color-ink)]">Current plan</h3>
        </div>
        {loading ? (
          <p className="text-sm text-[var(--color-ink-muted)]">Loading…</p>
        ) : (
          <>
            <p className="text-sm text-[var(--color-ink)] capitalize font-medium">{tier}</p>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">
              {limits.maxProducts === Infinity ? 'Unlimited' : limits.maxProducts} product
              {limits.maxProducts === 1 ? '' : 's'} ·{' '}
              {limits.aiRunsPerMonth === Infinity ? 'unlimited' : limits.aiRunsPerMonth} AI runs/month
            </p>
            {isPaid && (
              <button
                type="button"
                onClick={handlePortal}
                disabled={busy !== null}
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-[var(--color-accent)] hover:underline disabled:opacity-50"
              >
                {busy === 'portal' ? 'Opening…' : 'Manage subscription'} <ArrowUpRight size={13} />
              </button>
            )}
          </>
        )}
      </div>

      {!loading && upgrades.length > 0 && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-[var(--color-ink)] mb-3">Upgrade</h3>
          <div className="space-y-3">
            {upgrades.map(t => (
              <div key={t} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-[var(--color-ink)] font-medium">
                    {TIER_DISPLAY[t].name} <span className="text-[var(--color-ink-muted)] font-normal">{TIER_DISPLAY[t].price}</span>
                  </p>
                  <p className="text-xs text-[var(--color-ink-muted)]">{TIER_DISPLAY[t].blurb}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpgrade(t)}
                  disabled={busy !== null}
                  className="shrink-0 px-3 py-2 min-h-[36px] rounded-lg text-sm font-semibold bg-[var(--color-accent)] text-white hover:opacity-90 disabled:opacity-50"
                >
                  {busy === t ? 'Redirecting…' : 'Upgrade'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500" role="alert">{error}</p>
      )}
    </div>
  )
}
