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

const DEFAULT_CONFIG: AIConfig = {
  apiKey: '',
  model: 'claude-sonnet-4-20250514',
  maxTokens: 4096,
  proxyUrl: '',
}

export function loadAIConfig(): AIConfig {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY)
    if (!raw) return DEFAULT_CONFIG
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
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
