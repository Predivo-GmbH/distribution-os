/* ============================================================
   AI Worker Base — Shared prompt builder + API call pattern
   All workers inherit from this foundation.
   ============================================================ */

import type { Product, KnowledgeBase, Engine, WorkerType } from '@/types'
import { ENGINE_META } from '@/types'
import { loadAIConfig, getAPIEndpoint } from './config'
import { loadKnowledgeBase } from '@/lib/storage'
import { addArtifact } from '@/lib/storage'

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

export async function callAI(options: AICallOptions): Promise<AICallResult> {
  const config = loadAIConfig()

  if (!config.apiKey) {
    return { success: false, content: '', error: 'API key not configured. Go to Settings > AI Configuration.' }
  }

  const endpoint = getAPIEndpoint(config)

  try {
    const response = await fetch(`${endpoint}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: config.model,
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
