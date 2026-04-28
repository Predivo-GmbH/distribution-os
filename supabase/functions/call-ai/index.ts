import { handleCors, createJsonResponse } from '../_shared/cors.ts'
import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'POST') {
    return createJsonResponse(req, { error: 'Method not allowed' }, 405)
  }

  // Authenticate user
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
    const { model, max_tokens, system, messages } = await req.json()

    if (!model || !messages) {
      return createJsonResponse(req, { error: 'Missing required fields: model, messages' }, 400)
    }

    // Check for user's own API key (BYOK)
    let apiKey = ANTHROPIC_API_KEY
    const { data: keyRow } = await admin
      .from('user_api_keys')
      .select('api_key')
      .eq('user_id', user.id)
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

    // Log usage (fire-and-forget)
    const usage = (data as { usage?: { input_tokens?: number; output_tokens?: number } }).usage
    if (usage) {
      admin.from('ai_usage').insert({
        user_id: user.id,
        model,
        input_tokens: usage.input_tokens ?? 0,
        output_tokens: usage.output_tokens ?? 0,
      }).then(() => {})
    }

    return createJsonResponse(req, data)
  } catch (err) {
    return createJsonResponse(req, { error: `Internal error: ${err instanceof Error ? err.message : 'Unknown'}` }, 500)
  }
})
