/* ============================================================
   AI Worker Base — Shared prompt builder + API call pattern
   All workers inherit from this foundation.
   ============================================================ */

import type { Product, KnowledgeBase, Engine, WorkerType } from '@/types'
import { ENGINE_META } from '@/types'
import { loadAIConfig, type AIConfig, getAPIEndpoint } from './config'
import { loadKnowledgeBase } from '@/lib/storage'
import { addArtifact } from '@/lib/storage'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

/* ------------------------------------------------------------
   System Prompt Builder
   ------------------------------------------------------------ */

export function buildSystemPrompt(product: Product, engine: Engine, kb: KnowledgeBase): string {
  const parts: string[] = []

  // Core identity
  parts.push(`You are an expert distribution strategist and content creator working for "${product.name}".`)
  parts.push(`Product stage: ${product.stage}. Primary engine: ${ENGINE_META[engine].label}.`)

  // Product positioning
  if (kb.positioning.oneLiner) {
    parts.push(`\n## Product\n${kb.positioning.oneLiner}`)
    if (kb.positioning.benefits.some(b => b)) {
      parts.push(`Key benefits:\n${kb.positioning.benefits.filter(b => b).map((b, i) => `${i + 1}. ${b}`).join('\n')}`)
    }
    if (kb.positioning.competitor) {
      parts.push(`Primary competitor: ${kb.positioning.competitor}`)
    }
    if (kb.positioning.switchReason) {
      parts.push(`Why switch: ${kb.positioning.switchReason}`)
    }
  }

  // ICP
  if (kb.icp.who) {
    parts.push(`\n## Ideal Customer Profile`)
    parts.push(`Who: ${kb.icp.who}`)
    if (kb.icp.pain) parts.push(`Pain: ${kb.icp.pain}`)
    if (kb.icp.triedBefore) parts.push(`What they've tried: ${kb.icp.triedBefore}`)
    if (kb.icp.desiredOutcome) parts.push(`Desired outcome: ${kb.icp.desiredOutcome}`)
    if (kb.icp.hangoutsOnline) parts.push(`Where they hang out: ${kb.icp.hangoutsOnline}`)
  }

  // Tone
  parts.push(`\n## Writing Style`)
  parts.push(`Tone: ${kb.tone.formality}, ${kb.tone.technicality}, ${kb.tone.boldness}`)
  parts.push(`Length preference: ${kb.tone.lengthPreference}`)

  // Voice examples
  if (kb.voiceExamples.length > 0) {
    parts.push(`\n## Voice Reference (match this style)`)
    kb.voiceExamples.slice(0, 5).forEach((ex, i) => {
      parts.push(`\nExample ${i + 1}:\n${ex}`)
    })
  }

  // Approved artifacts as learning signal
  if (kb.approvedArtifacts.length > 0) {
    parts.push(`\n## Previously Approved Output (learn from the edits)`)
    kb.approvedArtifacts.slice(-5).forEach(a => {
      if (a.editedFrom && a.editedFrom !== a.content) {
        parts.push(`Original: ${a.editedFrom.slice(0, 200)}...`)
        parts.push(`Approved version: ${a.content.slice(0, 200)}...`)
      }
    })
  }

  return parts.join('\n')
}

/* ------------------------------------------------------------
   API Call
   ------------------------------------------------------------ */

export interface AICallOptions {
  systemPrompt: string
  userPrompt: string
  maxTokens?: number
}

export interface AICallResult {
  success: boolean
  content: string
  error?: string
}

/* ------------------------------------------------------------
   Direct-path model resolution (fleet standard 2026-07-05)
   The call-ai edge function resolves 'auto' server-side; the
   direct browser-to-Anthropic fallback paths must resolve it
   here via the live /v1/models list (newest sonnet-family).
   ------------------------------------------------------------ */

let directModelCache: { id: string; at: number } | null = null

async function resolveDirectModel(config: AIConfig): Promise<string> {
  if (config.model !== 'auto') return config.model
  if (directModelCache && Date.now() - directModelCache.at < 6 * 3600_000) {
    return directModelCache.id
  }
  const endpoint = getAPIEndpoint(config)
  const res = await fetch(`${endpoint}/v1/models?limit=100`, {
    headers: {
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
  })
  if (!res.ok) throw new Error(`Model list failed: ${res.status}`)
  const ids: string[] = ((await res.json()).data ?? []).map((m: { id: string }) => m.id)
  const id = ids.find(i => i.startsWith('claude-sonnet')) ?? ids[0]
  if (!id) throw new Error('Model list empty')
  directModelCache = { id, at: Date.now() }
  return id
}

export async function callAI(options: AICallOptions): Promise<AICallResult> {
  const config = loadAIConfig()

  // When Supabase is configured, route through the call-ai edge function (secure proxy)
  if (isSupabaseConfigured) {
    return callAIViaProxy(config, options)
  }

  // Local dev fallback: direct browser-to-API (only when Supabase is not configured)
  if (!config.apiKey) {
    return { success: false, content: '', error: 'API key not configured. Go to Settings > AI Configuration.' }
  }

  const endpoint = getAPIEndpoint(config)

  try {
    const model = await resolveDirectModel(config)
    const response = await fetch(`${endpoint}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: options.maxTokens ?? config.maxTokens,
        system: options.systemPrompt,
        messages: [{ role: 'user', content: options.userPrompt }],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const msg = (errorData as { error?: { message?: string } }).error?.message || `API error ${response.status}`
      return { success: false, content: '', error: msg }
    }

    const data = await response.json() as { content: { type: string; text: string }[] }
    const text = data.content
      .filter((block: { type: string }) => block.type === 'text')
      .map((block: { text: string }) => block.text)
      .join('\n')

    return { success: true, content: text }
  } catch (err) {
    return { success: false, content: '', error: `Network error: ${err instanceof Error ? err.message : 'Unknown'}` }
  }
}

async function callAIViaProxy(config: AIConfig, options: AICallOptions): Promise<AICallResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, content: '', error: 'Not authenticated. Please log in.' }
    }

    const { data, error } = await supabase.functions.invoke('call-ai', {
      body: {
        model: config.model,
        max_tokens: options.maxTokens ?? config.maxTokens,
        system: options.systemPrompt,
        messages: [{ role: 'user', content: options.userPrompt }],
      },
    })

    if (error) {
      // If edge function is throttled (429) or unavailable, fall back to direct API
      const isThrottled = error.message?.includes('429') || error.message?.includes('throttle')
      if (isThrottled) {
        // This path skips call-ai, and therefore skips BOTH quota enforcement and
        // usage logging. It runs on the user's own BYOK key, never the fleet key —
        // but it must never be silent, or spend disappears from the API dashboard.
        console.warn('[ai] call-ai throttled — falling back to direct API: quota and usage logging are BYPASSED for this call.')
        return callAIDirect(config, options)
      }
      return { success: false, content: '', error: error.message || 'Edge function error' }
    }

    if (data?.error) {
      // Also handle 429 returned in the response body
      if (data.code === 'QUOTA_EXCEEDED') {
        return { success: false, content: '', error: data.error }
      }
      return { success: false, content: '', error: data.error }
    }

    const text = (data.content as { type: string; text: string }[])
      .filter((block: { type: string }) => block.type === 'text')
      .map((block: { text: string }) => block.text)
      .join('\n')

    return { success: true, content: text }
  } catch {
    // On any network failure, attempt direct API fallback. Same caveat as above:
    // quota and usage logging are bypassed, so say so rather than failing silently.
    console.warn('[ai] call-ai unreachable — falling back to direct API: quota and usage logging are BYPASSED for this call.')
    return callAIDirect(config, options)
  }
}

async function callAIDirect(config: AIConfig, options: AICallOptions): Promise<AICallResult> {
  // Fallback: direct browser-to-Anthropic API (requires CORS header)
  const apiKey = config.apiKey
  if (!apiKey) {
    return { success: false, content: '', error: 'AI service temporarily unavailable. Add your own API key in Settings to use AI features directly.' }
  }

  const endpoint = getAPIEndpoint(config)

  try {
    const model = await resolveDirectModel(config)
    const response = await fetch(`${endpoint}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: options.maxTokens ?? config.maxTokens,
        system: options.systemPrompt,
        messages: [{ role: 'user', content: options.userPrompt }],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const msg = (errorData as { error?: { message?: string } }).error?.message || `API error ${response.status}`
      return { success: false, content: '', error: msg }
    }

    const data = await response.json() as { content: { type: string; text: string }[] }
    const text = data.content
      .filter((block: { type: string }) => block.type === 'text')
      .map((block: { text: string }) => block.text)
      .join('\n')

    return { success: true, content: text }
  } catch (err) {
    return { success: false, content: '', error: `Network error: ${err instanceof Error ? err.message : 'Unknown'}` }
  }
}

/* ------------------------------------------------------------
   Worker Execution Helper
   ------------------------------------------------------------ */

export interface WorkerRunOptions {
  product: Product
  engine: Engine
  workerType: WorkerType
  taskTitle: string
  userPrompt: string
  maxTokens?: number
}

export async function runWorker(options: WorkerRunOptions): Promise<AICallResult & { artifactId?: string }> {
  const kb = loadKnowledgeBase(options.product.id)
  const systemPrompt = buildSystemPrompt(options.product, options.engine, kb)

  const result = await callAI({
    systemPrompt,
    userPrompt: options.userPrompt,
    maxTokens: options.maxTokens,
  })

  if (result.success) {
    const artifact = addArtifact({
      productId: options.product.id,
      engine: options.engine,
      workerType: options.workerType,
      taskTitle: options.taskTitle,
      status: 'pending',
      content: result.content,
    })
    return { ...result, artifactId: artifact.id }
  }

  return result
}
