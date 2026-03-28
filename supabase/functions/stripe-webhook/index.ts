import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts'
import Stripe from 'https://esm.sh/stripe@17?target=deno'

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
if (!stripeKey) throw new Error('Missing STRIPE_SECRET_KEY env var')
const stripe = new Stripe(stripeKey, { apiVersion: '2025-04-30.basil' })
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
if (!webhookSecret) throw new Error('Missing STRIPE_WEBHOOK_SECRET env var')

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
    return new Response('Webhook verification failed', { status: 400 })
  }

  const admin = getSupabaseAdmin()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = session.customer as string
      const subscriptionId = session.subscription as string

      // Find user by stripe_customer_id and upgrade to pro
      const { error: checkoutError } = await admin
        .from('user_preferences')
        .update({
          subscription_tier: 'pro',
          stripe_subscription_id: subscriptionId,
        })
        .eq('stripe_customer_id', customerId)
      if (checkoutError) {
        return new Response('Database update failed', { status: 500 })
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      const isActive = subscription.status === 'active' || subscription.status === 'trialing'

      const { error: updateError } = await admin
        .from('user_preferences')
        .update({
          subscription_tier: isActive ? 'pro' : 'free',
          stripe_subscription_id: subscription.id,
        })
        .eq('stripe_customer_id', customerId)
      if (updateError) {
        return new Response('Database update failed', { status: 500 })
      }
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
      if (deleteError) {
        return new Response('Database update failed', { status: 500 })
      }
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
