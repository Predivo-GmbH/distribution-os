import { handleCors, createJsonResponse } from '../_shared/cors.ts'
import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts'
import Stripe from 'https://esm.sh/stripe@17?target=deno'
import { PRICE_TO_TIER } from '../_shared/tier-map.ts'

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
if (!stripeKey) throw new Error('Missing STRIPE_SECRET_KEY env var')
const stripe = new Stripe(stripeKey, { apiVersion: '2025-04-30.basil' })

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'POST') {
    return createJsonResponse(req, { error: 'Method not allowed' }, 405)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return createJsonResponse(req, { error: 'Missing authorization' }, 401)
  }

  const admin = getSupabaseAdmin()
  const { data: { user }, error: authError } = await admin.auth.getUser(
    authHeader.replace('Bearer ', ''),
  )
  if (authError || !user) {
    return createJsonResponse(req, { error: 'Unauthorized' }, 401)
  }

  try {
    const { returnUrl, priceId } = await req.json()

    // Validate priceId against allowed tiers
    if (!priceId || !PRICE_TO_TIER[priceId]) {
      return createJsonResponse(req, { error: 'Invalid or missing priceId' }, 400)
    }

    const appUrl = Deno.env.get('APP_URL') || 'https://distributionos.predivo.ch'
    const allowedOrigins = [appUrl, 'http://localhost:5173']
    try {
      const parsed = new URL(returnUrl)
      if (!allowedOrigins.includes(parsed.origin)) {
        return createJsonResponse(req, { error: 'Invalid return URL' }, 400)
      }
    } catch {
      return createJsonResponse(req, { error: 'Invalid return URL' }, 400)
    }

    // Get or create Stripe customer
    const { data: prefs } = await admin
      .from('user_preferences')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId = prefs?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      await admin
        .from('user_preferences')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: returnUrl,
    })

    return createJsonResponse(req, { url: session.url })
  } catch (err) {
    return createJsonResponse(req, { error: 'Checkout session creation failed' }, 500)
  }
})
