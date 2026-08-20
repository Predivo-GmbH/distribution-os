import { handleCors, createJsonResponse } from '../_shared/cors.ts'
import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts'
import { BYO_PROVIDERS, providerConflict, type ByoProvider } from '../_shared/byo-provider.ts'
import { encryptSecret } from '../_shared/crypto.ts'
import { logError } from '../_shared/error-log.ts'

/**
 * Stores a user's BYO API key + provider, ENCRYPTED at rest (AES-256-GCM via _shared/crypto).
 * The raw key never lands in the DB. Writes go through here (service role) because RLS no
 * longer lets users write user_api_keys directly — that's what forces encryption.
 * Body: { api_key, provider }  or  { action: 'delete' }.
 */
Deno.serve(async (req: Request) => {
  try {
    const cors = handleCors(req)
    if (cors) return cors
    if (req.method !== 'POST') return createJsonResponse(req, { error: 'Method not allowed' }, 405)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return createJsonResponse(req, { error: 'Missing authorization' }, 401)

    const admin = getSupabaseAdmin()
    const { data: { user }, error: authError } = await admin.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) return createJsonResponse(req, { error: 'Invalid token' }, 401)

    const body = await req.json().catch(() => ({}))

    // Remove the stored key.
    if (body.action === 'delete') {
      const { error } = await admin.from('user_api_keys').delete().eq('user_id', user.id)
      if (error) return createJsonResponse(req, { error: error.message }, 500)
      return createJsonResponse(req, { ok: true, deleted: true })
    }

    const apiKey: string = (body.api_key ?? '').trim()
    const provider = body.provider as ByoProvider
    if (!apiKey || !provider) return createJsonResponse(req, { error: 'Missing api_key or provider' }, 400)
    if (!BYO_PROVIDERS.includes(provider)) return createJsonResponse(req, { error: `Invalid provider: ${provider}` }, 400)

    const conflict = providerConflict(provider, apiKey)
    if (conflict) return createJsonResponse(req, { error: conflict }, 400)

    const encrypted = await encryptSecret(apiKey)
    const { error } = await admin.from('user_api_keys').upsert({
      user_id: user.id,
      api_key: encrypted,
      provider,
      updated_at: new Date().toISOString(),
    })
    if (error) return createJsonResponse(req, { error: error.message }, 500)

    return createJsonResponse(req, { ok: true, provider })
  } catch (err) {
    await logError('save-api-key', 'save-key', err)
    return new Response(JSON.stringify({ error: `Internal error: ${err instanceof Error ? err.message : String(err)}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})
