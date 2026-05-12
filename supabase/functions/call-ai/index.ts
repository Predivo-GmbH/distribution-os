import { handleCors, createJsonResponse } from '../_shared/cors.ts'
import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts'
import { TIER_LIMITS, type SubscriptionTier } from '../_shared/tier-map.ts'
import { logAnthropicUsage } from '../_shared/log-usage.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || ''

Deno.serve(async (req: Request) => {
  try {
    const corsResponse = handleCors(req)
    if (corsResponse) return corsResponse

    if (req.method !== 'POST') {
      return createJsonResponse(req, { error: 'Method not allowed' }, 405)
    }

    // Authenticate user — decode JWT directly to avoid auth API rate limits
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return createJsonResponse(req, { error: 'Missing authorization' }, 401)
    }

    const token = authHeader.replace('Bearer ', '')
    let userId: string
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      userId = payload.sub
      if (!userId) throw new Error('no sub claim')
      // Check expiry
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return createJsonResponse(req, { error: 'Token expired' }, 401)
      }
    } catch {
      return createJsonResponse(req, { error: 'Invalid token' }, 401)
    }

    const admin = getSupabaseAdmin()

    const { model, max_tokens, system, messages } = await req.json()

    if (!model || !messages) {
      return createJsonResponse(req, { error: 'Missing required fields: model, messages' }, 400)
    }

    // --- Tier-based AI run limit enforcement ---
    const { data: prefs } = await admin
      .from('user_preferences')
      .select('subscription_tier')
      .eq('user_id', userId)
      .single()

    const tier: SubscriptionTier = (prefs?.subscription_tier as SubscriptionTier) ?? 'free'
    const limit = TIER_LIMITS[tier]?.aiRunsPerMonth ?? TIER_LIMITS.free.aiRunsPerMonth

    if (limit !== Infinity) {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const { count, error: countError } = await admin
        .from('ai_usage')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', monthStart)

      if (countError) {
        return createJsonResponse(req, { error: `Quota check failed: ${countError.message}` }, 500)
      }

      if ((count ?? 0) >= limit) {
        return createJsonResponse(req, {
          error: `Monthly AI run limit reached (${count}/${limit}). Upgrade your plan for more runs.`,
          code: 'QUOTA_EXCEEDED',
          usage: { used: count, limit },
        }, 429)
      }
    }

    // Check for user's own API key (BYOK)
    let apiKey = ANTHROPIC_API_KEY
    const { data: keyRow } = await admin
      .from('user_api_keys')
      .select('api_key')
      .eq('user_id', userId)
      .single()

    if (keyRow?.api_key) {
      apiKey = keyRow.api_key
    }

    if (!apiKey) {
      return createJsonResponse(req, { error: 'No API key available. Configure your key in Settings.' }, 400)
    }

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: max_tokens ?? 4096,
        system,
        messages,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const msg = (errorData as { error?: { message?: string } }).error?.message || `Anthropic API error ${response.status}`
      return createJsonResponse(req, { error: msg }, response.status)
    }

    const data = await response.json()
    await logAnthropicUsage('Distribution-OS', 'call-ai', data)

    // Log usage (fire-and-forget)
    const usage = (data as { usage?: { input_tokens?: number; output_tokens?: number } }).usage
    if (usage) {
      admin.from('ai_usage').insert({
        user_id: userId,
        model,
        input_tokens: usage.input_tokens ?? 0,
        output_tokens: usage.output_tokens ?? 0,
      }).then(() => {})
    }

    return createJsonResponse(req, data)
  } catch (err) {
    return new Response(JSON.stringify({ error: `Internal error: ${err instanceof Error ? err.message : String(err)}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})
