import { handleCors, createJsonResponse } from '../_shared/cors.ts'

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

    // Decode JWT directly — no auth API call
    const token = authHeader.replace('Bearer ', '')
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (!payload.sub) throw new Error('no sub')
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return createJsonResponse(req, { error: 'Token expired' }, 401)
      }
    } catch {
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

    return createJsonResponse(req, await response.json())
  } catch (err) {
    return new Response(JSON.stringify({ error: `Internal: ${err instanceof Error ? err.message : String(err)}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})
