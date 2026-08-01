/**
 * Stripe Price ID → Subscription Tier mapping.
 *
 * Price IDs are set as edge function env vars so they can be updated
 * without redeploying code. This module reads them once on cold start.
 *
 * Env vars: STRIPE_STARTER_PRICE_ID, STRIPE_GROWTH_PRICE_ID, STRIPE_SCALE_PRICE_ID
 */

export type SubscriptionTier = 'free' | 'starter' | 'growth' | 'scale'

const starterPriceId = Deno.env.get('STRIPE_STARTER_PRICE_ID') ?? ''
const growthPriceId = Deno.env.get('STRIPE_GROWTH_PRICE_ID') ?? ''
const scalePriceId = Deno.env.get('STRIPE_SCALE_PRICE_ID') ?? ''

/** Maps Stripe price IDs to tier names. Only contains non-empty entries. */
export const PRICE_TO_TIER: Record<string, SubscriptionTier> = {}

if (starterPriceId) PRICE_TO_TIER[starterPriceId] = 'starter'
if (growthPriceId) PRICE_TO_TIER[growthPriceId] = 'growth'
if (scalePriceId) PRICE_TO_TIER[scalePriceId] = 'scale'

/** Reverse map so the frontend can request a tier by NAME and the price ID never leaves the server. */
export const TIER_TO_PRICE: Partial<Record<SubscriptionTier, string>> = {}
if (starterPriceId) TIER_TO_PRICE.starter = starterPriceId
if (growthPriceId) TIER_TO_PRICE.growth = growthPriceId
if (scalePriceId) TIER_TO_PRICE.scale = scalePriceId

/** Tier limits — must stay in sync with app/src/hooks/useSubscription.ts */
export const TIER_LIMITS: Record<SubscriptionTier, { maxProducts: number; aiRunsPerMonth: number }> = {
  free:    { maxProducts: 1,        aiRunsPerMonth: 3 },
  starter: { maxProducts: 2,        aiRunsPerMonth: 15 },
  growth:  { maxProducts: 5,        aiRunsPerMonth: 50 },
  scale:   { maxProducts: Infinity, aiRunsPerMonth: Infinity },
}

/**
 * Given a Stripe subscription, resolve the tier by looking up the first
 * matching price ID in PRICE_TO_TIER.
 */
export function tierFromSubscription(items: { price: { id: string } }[]): SubscriptionTier {
  for (const item of items) {
    const tier = PRICE_TO_TIER[item.price.id]
    if (tier) return tier
  }
  return 'free'
}
