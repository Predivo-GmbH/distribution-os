/* ============================================================
   AI Configuration — API key + model settings
   ============================================================ */

const AI_CONFIG_KEY = 'distribution-os-ai-config'

// Bring-your-own-key providers. Anthropic + Kimi share the Messages API shape;
// OpenAI uses Chat Completions. The call-ai edge function routes on this value.
export type AIProvider = 'anthropic' | 'kimi' | 'openai'

export const PROVIDER_META: Record<AIProvider, { label: string; keyPlaceholder: string; keyHint: string }> = {
  anthropic: { label: 'Anthropic (Claude)', keyPlaceholder: 'sk-ant-...', keyHint: 'Anthropic keys start with "sk-ant-".' },
  kimi: { label: 'Kimi (Moonshot)', keyPlaceholder: 'sk-...', keyHint: 'Get a key at platform.moonshot.ai.' },
  openai: { label: 'OpenAI (GPT)', keyPlaceholder: 'sk-...', keyHint: 'Get a key at platform.openai.com.' },
}

export interface AIConfig {
  apiKey: string
  provider: AIProvider
  model: string
  maxTokens: number
  proxyUrl: string
}

// Fleet standard (2026-07-05): no hard-coded model IDs as defaults.
// 'auto' is resolved server-side by the call-ai edge function
// (per-provider pin + retirement fallback via /v1/models).
const DEFAULT_CONFIG: AIConfig = {
  apiKey: '',
  provider: 'anthropic',
  model: 'auto',
  maxTokens: 4096,
  proxyUrl: '',
}

/** Provider inferred from a key prefix. Only `sk-ant-` is unambiguous; else null. */
export function detectProvider(key: string): AIProvider | null {
  return key.trim().startsWith('sk-ant-') ? 'anthropic' : null
}

/** Reason the chosen provider can't match the key, or null when consistent. */
export function providerConflict(provider: AIProvider, key: string): string | null {
  const k = key.trim()
  if (!k) return null
  if (provider === 'anthropic' && !k.startsWith('sk-ant-')) {
    return 'An Anthropic key should start with "sk-ant-".'
  }
  if (provider !== 'anthropic' && k.startsWith('sk-ant-')) {
    return `An "sk-ant-" key is an Anthropic key — switch the provider to Anthropic, or paste your ${PROVIDER_META[provider].label} key.`
  }
  return null
}

// Model IDs retired by Anthropic on 2026-06-15 — stored configs must be
// remapped or every AI call 404s with "model not found". Retired defaults
// map to 'auto' (server-side resolution); explicit opus choice is preserved.
const RETIRED_MODELS: Record<string, string> = {
  'claude-sonnet-4-20250514': 'auto',
  'claude-opus-4-20250514': 'claude-opus-4-6',
}

export function loadAIConfig(): AIConfig {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY)
    if (!raw) return DEFAULT_CONFIG
    const config: AIConfig = { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
    if (RETIRED_MODELS[config.model]) config.model = RETIRED_MODELS[config.model]
    return config
  } catch {
    return DEFAULT_CONFIG
  }
}

export function saveAIConfig(config: AIConfig): void {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config))
}

export function isAIConfigured(): boolean {
  const config = loadAIConfig()
  return config.apiKey.length > 0
}

export function getAPIEndpoint(config: AIConfig): string {
  // Use proxy URL if set (needed for browser CORS), otherwise direct API
  return config.proxyUrl || 'https://api.anthropic.com'
}
