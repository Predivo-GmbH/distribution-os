/* ============================================================
   AI Product Analyzer — Suggests description, stage & engines
   from just a product name.
   ============================================================ */

import type { ProductStage, Engine } from '@/types'
import { callAI } from './worker-base'

export interface ProductAnalysis {
  description: string
  stage: ProductStage
  primaryEngine: Engine
  secondaryEngines: Engine[]
  stageReasoning: string
  engineReasoning: string
}

const SYSTEM_PROMPT = `You are an expert SaaS distribution strategist. Given a product name (and optionally a short description), analyze the product and suggest:
1. A concise one-line description (if not provided)
2. The most likely product stage (pre-launch, early, active, scaling)
3. The best primary distribution engine and 1-2 secondary engines

Distribution engines:
- pull: SEO, content marketing, organic inbound. Best for products with educational content potential.
- push: Outbound DMs, cold email, social posts, building in public. Best for early-stage direct outreach.
- bridge: Partnerships, integrations, co-marketing. Best for products in an ecosystem.
- search: Paid ads, directories, search optimization. Best for high-intent keyword products.
- equity: Brand, community, referrals, testimonials. Best for products with loyal users.
- persistence: Lifecycle emails, onboarding sequences, retention. Best for products with existing users.

Product stages:
- pre-launch: Still building, no paying users yet
- early: Just launched, finding first users
- active: Consistent traffic and revenue, diversifying channels
- scaling: Growing fast, optimizing compounding returns

Respond ONLY with valid JSON matching this exact schema:
{
  "description": "string — one-line product description",
  "stage": "pre-launch|early|active|scaling",
  "primaryEngine": "pull|push|bridge|search|equity|persistence",
  "secondaryEngines": ["engine1", "engine2"],
  "stageReasoning": "string — one sentence why this stage",
  "engineReasoning": "string — one sentence why these engines"
}`

export async function analyzeProduct(name: string, description?: string): Promise<ProductAnalysis | null> {
  const userPrompt = description
    ? `Product: "${name}" — ${description}`
    : `Product: "${name}"`

  const result = await callAI({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    maxTokens: 512,
  })

  if (!result.success) return null

  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonStr = result.content.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(jsonStr) as ProductAnalysis

    // Validate fields
    const validStages: ProductStage[] = ['pre-launch', 'early', 'active', 'scaling']
    const validEngines: Engine[] = ['pull', 'push', 'bridge', 'search', 'equity', 'persistence']

    if (!validStages.includes(parsed.stage)) parsed.stage = 'early'
    if (!validEngines.includes(parsed.primaryEngine)) parsed.primaryEngine = 'pull'
    parsed.secondaryEngines = (parsed.secondaryEngines || []).filter(e => validEngines.includes(e))

    return parsed
  } catch {
    return null
  }
}
