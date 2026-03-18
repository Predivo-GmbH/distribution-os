import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { SubscriptionTier } from '@/types'

interface SubscriptionState {
  tier: SubscriptionTier
  loading: boolean
  canAddProduct: (currentCount: number) => boolean
  canExport: boolean
  canViewHistory: boolean
  canUseDarkMode: boolean
  openCheckout: () => Promise<void>
  openPortal: () => Promise<void>
}

export function useSubscription(userId?: string): SubscriptionState {
  const [tier, setTier] = useState<SubscriptionTier>('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setTier('free')
      setLoading(false)
      return
    }

    supabase
      .from('user_preferences')
      .select('subscription_tier')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        const row = data as { subscription_tier: string } | null
        setTier((row?.subscription_tier as SubscriptionTier) || 'free')
        setLoading(false)
      })

    // Listen for realtime changes (e.g., after webhook updates tier)
    const channel = supabase
      .channel('subscription')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_preferences',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newTier = payload.new.subscription_tier as SubscriptionTier
          if (newTier) setTier(newTier)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const isPro = tier === 'pro'

  const openCheckout = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: { returnUrl: window.location.origin + '/settings' },
    })

    if (error) throw error
    if (data?.url) window.location.href = data.url
  }, [])

  const openPortal = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data, error } = await supabase.functions.invoke('stripe-portal', {
      body: { returnUrl: window.location.origin + '/settings' },
    })

    if (error) throw error
    if (data?.url) window.location.href = data.url
  }, [])

  return {
    tier,
    loading,
    canAddProduct: (currentCount: number) => isPro || currentCount < 1,
    canExport: isPro,
    canViewHistory: isPro,
    canUseDarkMode: isPro,
    openCheckout,
    openPortal,
  }
}
