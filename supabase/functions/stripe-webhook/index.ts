import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts'
import { PRICE_TO_TIER, type SubscriptionTier } from '../_shared/tier-map.ts'
import Stripe from 'https://esm.sh/stripe@17?target=deno'
import { logError } from '../_shared/error-log.ts'

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
if (!stripeKey) throw new Error('Missing STRIPE_SECRET_KEY env var')
const stripe = new Stripe(stripeKey, { apiVersion: '2025-04-30.basil' })
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
if (!webhookSecret) throw new Error('Missing STRIPE_WEBHOOK_SECRET env var')

/**
 * Resolve tier from a Stripe subscription's line items.
 */
function resolveTier(subscription: Stripe.Subscription): SubscriptionTier {
  for (const item of subscription.items.data) {
    const tier = PRICE_TO_TIER[item.price.id]
    if (tier) return tier
  }
  return 'free'
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('Missing stripe-signature', { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
  } catch (err) {
    await logError('stripe-webhook', 'signature-verify', err)
    return new Response('Webhook verification failed', { status: 400 })
  }

  const admin = getSupabaseAdmin()

  // EVERY FAILURE BELOW IS LOGGED, WITH THE EVENT'S TYPE AND ID (2026-11-27). Stripe mailed on 27.11.2026 that this
  // live endpoint had answered HTTP 500 three times since 21.11 and that it stops sending on 30.11 if that goes on.
  // The signature check passed (no signature-verify row in error_log), so the 500 came from the handler, and nothing
  // said why: a thrown error answered 500 with no trace, and a failed update answered 500 without logging. Now the
  // reason lands in error_log (ids only, never customer data), and Stripe still gets a 500 so it retries.
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        // ONE STRIPE ACCOUNT FOR EVERY PRODUCT (Predivo GmbH). This endpoint receives every completed checkout of the
        // account, including other products' one-time payments, which have no subscription. Distribution-OS sells
        // subscriptions only, so such a checkout is not ours: acknowledge it. Before this, the handler asked Stripe for
        // subscription `null`, which throws, and answered 500.
        if (session.mode !== 'subscription' || !session.subscription) break
        const customerId = session.customer as string
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id

        // Fetch the full subscription to get price IDs
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const tier = resolveTier(subscription)

        const { error: checkoutError } = await admin
          .from('user_preferences')
          .update({
            subscription_tier: tier,
            stripe_subscription_id: subscriptionId,
          })
          .eq('stripe_customer_id', customerId)
        if (checkoutError) throw new Error(`user_preferences update failed: ${checkoutError.message}`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const isActive = subscription.status === 'active' || subscription.status === 'trialing'
        const tier = isActive ? resolveTier(subscription) : 'free'

        const { error: updateError } = await admin
          .from('user_preferences')
          .update({
            subscription_tier: tier,
            stripe_subscription_id: subscription.id,
          })
          .eq('stripe_customer_id', customerId)
        if (updateError) throw new Error(`user_preferences update failed: ${updateError.message}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { error: deleteError } = await admin
          .from('user_preferences')
          .update({
            subscription_tier: 'free',
            stripe_subscription_id: null,
          })
          .eq('stripe_customer_id', customerId)
        if (deleteError) throw new Error(`user_preferences update failed: ${deleteError.message}`)
        break
      }
    }
  } catch (err) {
    await logError('stripe-webhook', `handle ${event.type}`, err, { event_id: event.id, livemode: event.livemode })
    return new Response('Webhook handler failed', { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
