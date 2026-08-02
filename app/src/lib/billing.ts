import { supabase, isSupabaseConfigured } from '@/lib/supabase'

/** Paid tiers the checkout accepts (resolved to Stripe price IDs server-side). */
export type PaidTier = 'starter' | 'growth' | 'scale'

export const PAID_TIERS: PaidTier[] = ['starter', 'growth', 'scale']

export function isPaidTier(name: string): name is PaidTier {
  return (PAID_TIERS as string[]).includes(name)
}

// A visitor who picks a paid tier while logged out is sent through /signup;
// the chosen tier is parked here and checkout resumes on first authenticated load.
const INTENDED_PLAN_KEY = 'dos-intended-plan'

export function rememberIntendedPlan(tier: PaidTier): void {
  try {
    localStorage.setItem(INTENDED_PLAN_KEY, tier)
  } catch {
    /* storage unavailable — checkout can be started from Settings → Billing */
  }
}

export function consumeIntendedPlan(): PaidTier | null {
  try {
    const value = localStorage.getItem(INTENDED_PLAN_KEY)
    localStorage.removeItem(INTENDED_PLAN_KEY)
    return value && isPaidTier(value) ? value : null
  } catch {
    return null
  }
}

/** Create a Stripe Checkout session for the tier and return its URL. Requires an authed session. */
export async function startCheckout(tier: PaidTier): Promise<string> {
  if (!isSupabaseConfigured) throw new Error('Billing is not configured')
  const { data, error } = await supabase.functions.invoke('stripe-checkout', {
    body: { tier, returnUrl: `${window.location.origin}/settings` },
  })
  if (error || !data?.url) throw new Error('Could not start checkout')
  return data.url as string
}

/** Open the Stripe customer portal (manage / cancel subscription). Requires a paying customer. */
export async function openBillingPortal(): Promise<string> {
  if (!isSupabaseConfigured) throw new Error('Billing is not configured')
  const { data, error } = await supabase.functions.invoke('stripe-portal', {
    body: { returnUrl: `${window.location.origin}/settings` },
  })
  if (error || !data?.url) throw new Error('Could not open the billing portal')
  return data.url as string
}

/** True when a Supabase session exists (visitor is logged in). */
export async function hasSession(): Promise<boolean> {
  if (!isSupabaseConfigured) return false
  const { data } = await supabase.auth.getSession()
  return Boolean(data.session)
}
