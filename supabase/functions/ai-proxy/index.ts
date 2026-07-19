import { handleCors, createJsonResponse } from '../_shared/cors.ts'
import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts'
import { logAnthropicUsage } from '../_shared/log-usage.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || ''

Deno.serve(async (req: Request) => {
  try {
    const corsResponse = handleCors(req)
    if (corsResponse) return corsResponse

    if (req.method !== 'POST') {
      return createJsonResponse(req, { error: 'Method not allowed' }, 405)
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return createJsonResponse(req, { error: 'Missing authorization' }, 401)
    }

    // Verify the JWT signature server-side. A prior version decoded the token
    // without verification, so a forged JWT could pass auth and drain the
    // Anthropic key; getUser() validates the signature + expiry.
    const admin = getSupabaseAdmin()
    const { data: { user }, error: authError } = await admin.auth.getUser(
      authHeader.replace('Bearer ', ''),
    )
    if (authError || !user) {
      return createJsonResponse(req, { error: 'Invalid token' }, 401)
    }

    const { model, max_tokens, system, messages } = await req.json()
    if (!model || !messages) {
      return createJsonResponse(req, { error: 'Missing required fields' }, 400)
    }

    if (!ANTHROPIC_API_KEY) {
      return createJsonResponse(req, { error: 'No API key configured' }, 400)
    }

    // Call Anthropic API directly — no DB queries for now
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model, max_tokens: max_tokens ?? 4096, system, messages }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const msg = (errorData as { error?: { message?: string } }).error?.message || `API error ${response.status}`
      return createJsonResponse(req, { error: msg }, response.status)
    }

    const data = await response.json()
    await logAnthropicUsage('Distribution-OS', 'ai-proxy', data)
    return createJsonResponse(req, data)
  } catch (err) {
    return new Response(JSON.stringify({ error: `Internal: ${err instanceof Error ? err.message : String(err)}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})
