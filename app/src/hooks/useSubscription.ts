import { useState, useEffect } from 'react'
import { isSupabaseConfigured } from '@/lib/supabase-config'
import type { SubscriptionTier } from '@/types'

export const TIER_LIMITS = {
  free: { maxProducts: 1, aiRunsPerMonth: 3 },
  starter: { maxProducts: 2, aiRunsPerMonth: 15 },
  growth: { maxProducts: 5, aiRunsPerMonth: 50 },
  scale: { maxProducts: Infinity, aiRunsPerMonth: Infinity },
  // Legacy 2-tier mapping
  pro: { maxProducts: Infinity, aiRunsPerMonth: Infinity },
} as const

export function useSubscription() {
  const [tier, setTier] = useState<SubscriptionTier>('free')
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return }

    import('@/lib/supabase-storage').then(sb =>
      sb.loadUserPreferences()
        .then(p => setTier(p.subscriptionTier))
        .catch(() => {})
        .finally(() => setLoading(false))
    )
  }, [])

  const limits = TIER_LIMITS[tier] ?? TIER_LIMITS.free
  const isPaid = tier !== 'free'

  return { tier, isPaid, limits, loading }
}
