/**
 * Distribution-OS — bring-your-own-key multi-provider router for `call-ai` (Task C, 2026-07-30).
 *
 * The user supplies their OWN Anthropic / Kimi / OpenAI key; the stored `provider`
 * (user_api_keys.provider) decides which API shape to use. BYO = the USER pays for their
 * own calls on their own key, so offering OpenAI here costs the fleet nothing.
 *
 * How this differs from _shared/anthropic-model.ts: that layer runs the FLEET key with
 * env-configured anthropic<->kimi failover. THIS runs the CALLER's key and never fails
 * over across providers — one BYO key = one provider (you can't fail over to a provider
 * the user didn't give you a key for). Anthropic and Moonshot(Kimi) share the /v1/messages
 * shape; OpenAI uses /v1/chat/completions with a different request AND response — that
 * mismatch is the entire reason this adapter exists.
 */

const ANTHROPIC_VERSION = '2023-06-01'

export type ByoProvider = 'anthropic' | 'kimi' | 'openai'
export type ModelTier = 'fast' | 'smart'
export const BYO_PROVIDERS: readonly ByoProvider[] = ['anthropic', 'kimi', 'openai']

export interface ByoRequest {
  tier: ModelTier
  /** Explicit model id, or 'auto'/undefined for server-side resolution. */
  requestedModel?: string
  maxTokens: number
  system?: string
  messages: Array<{ role: string; content: unknown }>
}

export interface ByoResult {
  ok: boolean
  status: number
  text: string
  model: string
  usage: { input_tokens: number; output_tokens: number }
  error?: string
}

interface Shape {
  messagesUrl: string
  modelsUrl: string
  headers: (key: string) => Record<string, string>
  pinEnv: Record<ModelTier, string>
  family: Record<ModelTier, string>
  buildBody: (model: string, req: ByoRequest) => Record<string, unknown>
  parse: (json: Record<string, unknown>) => { text: string; model: string; input: number; output: number }
  /** For `auto` resolution from /v1/models — OpenAI lists many non-chat ids (embeddings, tts…). */
  isUsableModel: (id: string) => boolean
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function textFromMessages(json: any): string {
  return (json?.content ?? [])
    .filter((b: any) => b?.type === 'text')
    .map((b: any) => b.text)
    .join('\n')
}

export const SHAPES: Record<ByoProvider, Shape> = {
  anthropic: {
    messagesUrl: 'https://api.anthropic.com/v1/messages',
    modelsUrl: 'https://api.anthropic.com/v1/models?limit=100',
    headers: (key) => ({ 'x-api-key': key, 'anthropic-version': ANTHROPIC_VERSION, 'content-type': 'application/json' }),
    pinEnv: { fast: 'AI_MODEL_FAST', smart: 'AI_MODEL_SMART' },
    family: { fast: 'claude-haiku', smart: 'claude-sonnet' },
    buildBody: (model, req) => ({
      model,
      max_tokens: req.maxTokens,
      ...(req.system ? { system: req.system } : {}),
      messages: req.messages,
    }),
    parse: (json: any) => ({
      text: textFromMessages(json),
      model: json?.model ?? '',
      input: json?.usage?.input_tokens ?? 0,
      output: json?.usage?.output_tokens ?? 0,
    }),
    isUsableModel: () => true,
  },
  kimi: {
    // Moonshot ships an Anthropic-compatible Messages endpoint — same request/response as Anthropic.
    messagesUrl: 'https://api.moonshot.ai/anthropic/v1/messages',
    modelsUrl: 'https://api.moonshot.ai/v1/models',
    headers: (key) => ({ Authorization: `Bearer ${key}`, 'anthropic-version': ANTHROPIC_VERSION, 'content-type': 'application/json' }),
    pinEnv: { fast: 'KIMI_MODEL_FAST', smart: 'KIMI_MODEL_SMART' },
    family: { fast: 'kimi-k2.6', smart: 'kimi-k2.6' },
    // Without thinking:disabled, kimi-k2.6 returns [thinking, text] and content[0] is not the
    // text block — a HTTP-200 blank reply. See the warning in _shared/anthropic-model.ts.
    buildBody: (model, req) => ({
      thinking: { type: 'disabled' },
      model,
      max_tokens: req.maxTokens,
      ...(req.system ? { system: req.system } : {}),
      messages: req.messages,
    }),
    parse: (json: any) => ({
      text: textFromMessages(json),
      model: json?.model ?? '',
      input: json?.usage?.input_tokens ?? 0,
      output: json?.usage?.output_tokens ?? 0,
    }),
    isUsableModel: () => true,
  },
  openai: {
    messagesUrl: 'https://api.openai.com/v1/chat/completions',
    modelsUrl: 'https://api.openai.com/v1/models',
    headers: (key) => ({ Authorization: `Bearer ${key}`, 'content-type': 'application/json' }),
    pinEnv: { fast: 'OPENAI_MODEL_FAST', smart: 'OPENAI_MODEL_SMART' },
    family: { fast: 'gpt', smart: 'gpt' },
    buildBody: (model, req) => ({
      model,
      // max_completion_tokens is the forward-compatible field; o-series / gpt-5 reject max_tokens.
      max_completion_tokens: req.maxTokens,
      // OpenAI has no top-level `system`; it goes in as the first message.
      messages: [
        ...(req.system ? [{ role: 'system', content: req.system }] : []),
        ...req.messages,
      ],
    }),
    parse: (json: any) => ({
      text: json?.choices?.[0]?.message?.content ?? '',
      model: json?.model ?? '',
      input: json?.usage?.prompt_tokens ?? 0,
      output: json?.usage?.completion_tokens ?? 0,
    }),
    // Keep only chat-capable models when resolving `auto` (drop embeddings/audio/image/etc).
    isUsableModel: (id) =>
      id.startsWith('gpt') &&
      !/(embedding|whisper|tts|audio|realtime|transcribe|image|dall-e|moderation|search|instruct)/.test(id),
  },
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Provider inferred purely from the key prefix. Only `sk-ant-` is unambiguous (Anthropic).
 * OpenAI and Kimi both use bare `sk-…`, so everything else returns null and the stored
 * provider must be trusted instead.
 */
export function detectProvider(key: string): ByoProvider | null {
  return key.trim().startsWith('sk-ant-') ? 'anthropic' : null
}

/** Reason the stored provider can't match the key, or null when they're consistent. */
export function providerConflict(provider: ByoProvider, key: string): string | null {
  const k = key.trim()
  if (!k) return 'API key is empty.'
  if (provider === 'anthropic' && !k.startsWith('sk-ant-')) {
    return 'An Anthropic key should start with "sk-ant-".'
  }
  if (provider !== 'anthropic' && k.startsWith('sk-ant-')) {
    return `An "sk-ant-" key is an Anthropic key, but the selected provider is "${provider}".`
  }
  return null
}

const modelCache: Partial<Record<ByoProvider, { ids: string[]; at: number }>> = {}

async function liveModels(provider: ByoProvider, key: string): Promise<string[]> {
  const hit = modelCache[provider]
  if (hit && Date.now() - hit.at < 6 * 3600_000) return hit.ids
  const cfg = SHAPES[provider]
  const res = await fetch(cfg.modelsUrl, { headers: cfg.headers(key) })
  if (!res.ok) throw new Error(`models list failed (${provider}): ${res.status}`)
  const ids: string[] = (((await res.json()) as { data?: { id: string }[] }).data ?? []).map((m) => m.id)
  if (ids.length === 0) throw new Error(`models list empty (${provider})`)
  modelCache[provider] = { ids, at: Date.now() }
  return ids
}

async function resolveModel(provider: ByoProvider, tier: ModelTier, key: string, requested?: string): Promise<string> {
  if (requested && requested !== 'auto') return requested
  const cfg = SHAPES[provider]
  const pin = Deno.env.get(cfg.pinEnv[tier])
  if (pin) return pin
  const ids = await liveModels(provider, key)
  const fam = cfg.family[tier]
  return (
    ids.find((id) => id.startsWith(fam) && cfg.isUsableModel(id)) ??
    ids.find((id) => cfg.isUsableModel(id)) ??
    ids[0]
  )
}

function familyOf(model: string, provider: ByoProvider, tier: ModelTier): string {
  const m = model.match(/^([a-z]+-[a-z0-9.]+)/)
  return m ? m[1] : SHAPES[provider].family[tier]
}

/** Newest live model in the same family as `failed` (never `failed`), or null. */
async function substituteModel(provider: ByoProvider, failed: string, tier: ModelTier, key: string): Promise<string | null> {
  try {
    const cfg = SHAPES[provider]
    const ids = await liveModels(provider, key)
    const fam = familyOf(failed, provider, tier)
    return (
      ids.find((id) => id.startsWith(fam) && id !== failed && cfg.isUsableModel(id)) ??
      ids.find((id) => id.startsWith(cfg.family[tier]) && id !== failed && cfg.isUsableModel(id)) ??
      ids.find((id) => id !== failed && cfg.isUsableModel(id)) ??
      null
    )
  } catch {
    return null
  }
}

async function isModelNotFound(res: Response): Promise<boolean> {
  if (res.status !== 404) return false
  try {
    const j = await res.clone().json()
    return JSON.stringify(j).toLowerCase().includes('model')
  } catch {
    return true
  }
}

function errorMessage(json: Record<string, unknown>, status: number): string {
  const err = json?.error as { message?: string; type?: string } | undefined
  return err?.message || err?.type || `provider API error ${status}`
}

/**
 * One non-streaming completion on the caller's key for the given provider. Retries once on a
 * model-not-found 404 (retired model) with a live-listed substitute. Never throws for HTTP
 * errors — returns {ok:false, status, error} so the caller can surface a real status code.
 */
export async function callByo(provider: ByoProvider, apiKey: string, req: ByoRequest): Promise<ByoResult> {
  const cfg = SHAPES[provider]
  const zero = { input_tokens: 0, output_tokens: 0 }

  let model: string
  try {
    model = await resolveModel(provider, req.tier, apiKey, req.requestedModel)
  } catch (e) {
    return { ok: false, status: 400, text: '', model: '', usage: zero, error: `model resolution failed: ${(e as Error).message}` }
  }

  const call = (m: string) =>
    fetch(cfg.messagesUrl, { method: 'POST', headers: cfg.headers(apiKey), body: JSON.stringify(cfg.buildBody(m, req)) })

  let res: Response
  try {
    res = await call(model)
    if (await isModelNotFound(res)) {
      const sub = await substituteModel(provider, model, req.tier, apiKey)
      if (sub) {
        model = sub
        res = await call(model)
      }
    }
  } catch (e) {
    return { ok: false, status: 503, text: '', model, usage: zero, error: `${provider} network error: ${(e as Error).message}` }
  }

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    return { ok: false, status: res.status, text: '', model, usage: zero, error: errorMessage(json, res.status) }
  }
  const p = cfg.parse(json)
  return { ok: true, status: 200, text: p.text, model: p.model || model, usage: { input_tokens: p.input, output_tokens: p.output } }
}
