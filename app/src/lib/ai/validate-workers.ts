/* ============================================================
   Validation Pipeline Workers — Idea Research & Feasibility
   ============================================================ */

import type { Product } from '@/types'
import { runWorker } from './worker-base'

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

Format as structured Markdown. Be specific, data-driven, and brutally honest.`,
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

Include specific product names, real pricing, and actionable insights.`,
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

Be specific to the product's stage and niche.`,
  })
}
