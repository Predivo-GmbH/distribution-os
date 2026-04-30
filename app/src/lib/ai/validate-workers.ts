/* ============================================================
   Validation Pipeline Workers — Idea Research & Feasibility
   ============================================================ */

import type { Product } from '@/types'
import { runWorker } from './worker-base'

const KB_EXTRACT_INSTRUCTIONS = `

At the very end of your response, include a structured extraction block exactly like this (replace brackets with actual values):

\`\`\`kb-extract
ICP_WHO: [one-sentence description of the ideal customer]
ICP_PAIN: [primary pain point in one sentence]
ICP_TRIED_BEFORE: [what the ICP currently uses]
ICP_DESIRED_OUTCOME: [what the ICP wants to achieve]
ICP_HANGOUTS: [where the ICP spends time online]
POSITIONING_ONELINER: [one-sentence product positioning]
POSITIONING_BENEFIT_1: [key benefit 1]
POSITIONING_BENEFIT_2: [key benefit 2]
POSITIONING_BENEFIT_3: [key benefit 3]
POSITIONING_COMPETITOR: [primary competitor name]
POSITIONING_SWITCH_REASON: [why switch from competitor]
\`\`\`

Only fill in fields you have data for. Leave unknown fields empty (e.g. "ICP_HANGOUTS: ").`

export async function runMarketResearcher(product: Product) {
  return runWorker({
    product,
    engine: 'search',
    workerType: 'market-researcher',
    taskTitle: 'Market Research Brief',
    maxTokens: 6144,
    userPrompt: `Research the market for this product. Produce:

1. **Market Size** — TAM/SAM/SOM estimates with reasoning
2. **Target ICP Profile** — detailed ideal customer (demographics, psychographics, buying behavior)
3. **Pain Points** — 5 specific, validated pain points with severity ranking
4. **Existing Solutions** — what the ICP currently uses, why it's inadequate
5. **Market Trends** — 3-5 trends creating opportunity
6. **MRR Potential** — realistic revenue estimate with assumptions
7. **Go/No-Go Recommendation** — clear verdict with reasoning

Format as structured Markdown. Be specific, data-driven, and brutally honest.${KB_EXTRACT_INSTRUCTIONS}`,
  })
}

export async function runCompetitorAnalyst(product: Product) {
  return runWorker({
    product,
    engine: 'search',
    workerType: 'competitor-analyst',
    taskTitle: 'Competitor Analysis',
    maxTokens: 6144,
    userPrompt: `Perform deep competitive analysis. Produce:

1. **Direct Competitors** (3-5) — name, URL, pricing, key features, weaknesses
2. **Indirect Competitors** (2-3) — alternative solutions the ICP uses
3. **Feature Comparison Matrix** — detailed comparison table
4. **Pricing Analysis** — competitor pricing tiers and positioning
5. **Gap Analysis** — unserved needs competitors miss
6. **Differentiation Strategy** — 3 concrete ways to differentiate
7. **Competitive Moat** — what makes this product defensible

Include specific product names, real pricing, and actionable insights.${KB_EXTRACT_INSTRUCTIONS}`,
  })
}

export async function runDistributionSpecialist(product: Product) {
  return runWorker({
    product,
    engine: 'search',
    workerType: 'distribution-specialist',
    taskTitle: 'Distribution Feasibility Report',
    maxTokens: 6144,
    userPrompt: `Assess distribution feasibility. Produce:

1. **Channel Ranking** — rank all 6 engines (Pull/Push/Bridge/Search/Equity/Persistence) by fit for this product, with reasoning
2. **Quick Wins** — 3 distribution actions achievable in week 1
3. **30-Day Plan** — week-by-week distribution roadmap
4. **Content Strategy** — 5 content pieces that would drive early traction
5. **Community Strategy** — where the ICP hangs out, how to reach them
6. **Paid Strategy** — whether paid acquisition makes sense, estimated CAC
7. **Partnership Opportunities** — 3 potential integration/co-marketing partners

Be specific to the product's stage and niche.${KB_EXTRACT_INSTRUCTIONS}`,
  })
}

/* ── KB Extract Parser ── */

export interface KBExtract {
  icp_who?: string
  icp_pain?: string
  icp_tried_before?: string
  icp_desired_outcome?: string
  icp_hangouts?: string
  positioning_oneliner?: string
  positioning_benefit_1?: string
  positioning_benefit_2?: string
  positioning_benefit_3?: string
  positioning_competitor?: string
  positioning_switch_reason?: string
}

/**
 * Parse the ```kb-extract block from worker output.
 * Returns the extracted fields and the content with the block stripped.
 */
export function parseKBExtract(content: string): { clean: string; extract: KBExtract } {
  const extract: KBExtract = {}

  // Match the kb-extract code block
  const blockRegex = /```kb-extract\n([\s\S]*?)```/
  const match = content.match(blockRegex)

  if (!match) {
    return { clean: content, extract }
  }

  const lines = match[1].split('\n')
  for (const line of lines) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim().toLowerCase()
    const value = line.slice(colonIdx + 1).trim()
    if (!value) continue

    switch (key) {
      case 'icp_who': extract.icp_who = value; break
      case 'icp_pain': extract.icp_pain = value; break
      case 'icp_tried_before': extract.icp_tried_before = value; break
      case 'icp_desired_outcome': extract.icp_desired_outcome = value; break
      case 'icp_hangouts': extract.icp_hangouts = value; break
      case 'positioning_oneliner': extract.positioning_oneliner = value; break
      case 'positioning_benefit_1': extract.positioning_benefit_1 = value; break
      case 'positioning_benefit_2': extract.positioning_benefit_2 = value; break
      case 'positioning_benefit_3': extract.positioning_benefit_3 = value; break
      case 'positioning_competitor': extract.positioning_competitor = value; break
      case 'positioning_switch_reason': extract.positioning_switch_reason = value; break
    }
  }

  // Strip the kb-extract block from displayed content
  const clean = content.replace(blockRegex, '').trimEnd()

  return { clean, extract }
}
