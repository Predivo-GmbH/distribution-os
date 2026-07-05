/* ============================================================
   AI Configuration — API key + model settings
   ============================================================ */

const AI_CONFIG_KEY = 'distribution-os-ai-config'

export interface AIConfig {
  apiKey: string
  model: string
  maxTokens: number
  proxyUrl: string
}

// Fleet standard (2026-07-05): no hard-coded model IDs as defaults.
// 'auto' is resolved server-side by the call-ai edge function
// (AI_MODEL_SMART pin + retirement fallback via /v1/models).
const DEFAULT_CONFIG: AIConfig = {
  apiKey: '',
  model: 'auto',
  maxTokens: 4096,
  proxyUrl: '',
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
