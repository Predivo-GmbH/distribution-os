import { handleCors, createJsonResponse } from '../_shared/cors.ts'
import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts'
import { TIER_LIMITS, type SubscriptionTier } from '../_shared/tier-map.ts'
import { logAnthropicUsage } from '../_shared/log-usage.ts'
import { callByo, BYO_PROVIDERS, type ByoProvider } from '../_shared/byo-provider.ts'
import { decryptSecret } from '../_shared/crypto.ts'
import { logError } from '../_shared/error-log.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || ''

Deno.serve(async (req: Request) => {
  try {
    const corsResponse = handleCors(req)
    if (corsResponse) return corsResponse

    if (req.method !== 'POST') {
      return createJsonResponse(req, { error: 'Method not allowed' }, 405)
    }

    // Authenticate user — verify the JWT signature server-side. A prior version
    // decoded the token without verification, so a forged JWT could pass auth and
    // drain the Anthropic key; getUser() validates the signature + expiry.
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return createJsonResponse(req, { error: 'Missing authorization' }, 401)
    }

    const admin = getSupabaseAdmin()
    const { data: { user }, error: authError } = await admin.auth.getUser(
      authHeader.replace('Bearer ', ''),
    )
    if (authError || !user) {
      return createJsonResponse(req, { error: 'Invalid token' }, 401)
    }
    const userId = user.id

    const { model: requestedModel, max_tokens, system, messages } = await req.json()

    if (!messages) {
      return createJsonResponse(req, { error: 'Missing required fields: messages' }, 400)
    }

    // --- Resolve key + provider ---
    // BYO: the user's own key (any of Anthropic / Kimi / OpenAI). The stored `provider`
    // decides the API shape — a key prefix alone can't tell OpenAI (`sk-…`) from Kimi (`sk-…`).
    // Fleet fallback: our Anthropic key when the user hasn't brought one.
    const { data: keyRow } = await admin
      .from('user_api_keys')
      .select('api_key, provider')
      .eq('user_id', userId)
      .single()

    // BYO keys are stored encrypted (AES-GCM); decryptSecret passes plaintext through for
    // any legacy row written before at-rest encryption landed.
    const isByo = Boolean(keyRow?.api_key)
    const apiKey: string = isByo ? await decryptSecret(keyRow!.api_key) : ANTHROPIC_API_KEY
    const provider: ByoProvider = isByo && BYO_PROVIDERS.includes(keyRow!.provider as ByoProvider)
      ? (keyRow!.provider as ByoProvider)
      : 'anthropic'

    if (!apiKey) {
      return createJsonResponse(req, { error: 'No API key available. Configure your key in Settings.' }, 400)
    }

    // --- Tier-based AI run limit ---
    // Enforced ONLY on the fleet key. A BYO user pays for their own calls on their own key,
    // so they aren't capped by the plan's aiRunsPerMonth.
    if (!isByo) {
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
            error: `Monthly AI run limit reached (${count}/${limit}). Upgrade your plan, or add your own API key in Settings for unlimited runs.`,
            code: 'QUOTA_EXCEEDED',
            usage: { used: count, limit },
          }, 429)
        }
      }
    }

    // --- Call the resolved provider (Anthropic / Kimi / OpenAI) ---
    // call-ai resolves the 'smart' tier; 'auto'/missing model resolves server-side per provider,
    // an explicit client model passes through. OpenAI's different request/response shape is
    // normalised inside the adapter so the response envelope below is provider-agnostic.
    const result = await callByo(provider, apiKey, {
      tier: 'smart',
      requestedModel,
      maxTokens: max_tokens ?? 4096,
      system,
      messages,
    })

    if (!result.ok) {
      return createJsonResponse(req, { error: result.error ?? 'AI provider error' }, result.status)
    }

    // --- Per-provider usage metering ---
    // Always record the user's own usage (powers their monthly quota + per-provider view).
    // Awaited: Supabase kills pending fetches when the function returns, and the quota count
    // reads this table, so a fire-and-forget insert could be dropped.
    await admin.from('ai_usage').insert({
      user_id: userId,
      provider,
      model: result.model,
      input_tokens: result.usage.input_tokens,
      output_tokens: result.usage.output_tokens,
    })

    // Only fleet-key spend belongs on the BackOffice cost dashboard. BYO spend is the user's —
    // logging it there would misattribute cost we don't pay.
    if (!isByo) {
      await logAnthropicUsage('Distribution-OS', 'call-ai', {
        model: result.model,
        usage: {
          input_tokens: result.usage.input_tokens,
          output_tokens: result.usage.output_tokens,
        },
      })
    }

    // Normalised envelope the frontend expects (reads content[].text) — same for every provider.
    return createJsonResponse(req, {
      content: [{ type: 'text', text: result.text }],
      model: result.model,
      provider,
      usage: result.usage,
    })
  } catch (err) {
    await logError('call-ai', 'call', err)
    return new Response(JSON.stringify({ error: `Internal error: ${err instanceof Error ? err.message : String(err)}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})
