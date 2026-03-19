/* ============================================================
   Equity Engine Workers — Brand / Community / Partnerships
   ============================================================ */

import type { Product } from '@/types'
import { runWorker } from './worker-base'

export async function runPartnerResearch(product: Product) {
  return runWorker({
    product,
    engine: 'equity',
    workerType: 'partner-research',
    taskTitle: 'Partner Research — Distribution Partners',
    maxTokens: 4096,
    userPrompt: `Find 8-10 potential distribution partners for ${product.name}.

A "partner" is an organization or individual whose audience overlaps with our ICP: companies, coaching programs, communities, newsletters, complementary SaaS tools, course creators.

For each partner provide:
1. **Name** — the organization/person
2. **Type** — SaaS, community, newsletter, course, coaching, agency
3. **Estimated audience size** — rough magnitude with evidence
4. **Evidence of audience quality** — why their audience matches our ICP (be specific)
5. **Relevance score** (1-10) — how closely their audience overlaps with our ICP
6. **Partnership angle** — the specific way we'd work together (affiliate, co-marketing, integration, bundle, referral)
7. **Brief** — 2-3 sentences on why this partner's audience would buy our product

Rank from most to least relevant. Focus on partners where there's a clear, specific reason their audience needs what we offer — not just "they're in the same space."`,
  })
}

export async function runPitchPackage(product: Product, partnerInfo?: string) {
  return runWorker({
    product,
    engine: 'equity',
    workerType: 'pitch-package',
    taskTitle: 'Pitch Package — Partner Outreach',
    maxTokens: 4096,
    userPrompt: `Create a complete pitch package for this partner:

${partnerInfo || 'No specific partner provided. Generate a general pitch package template based on the product positioning and ICP.'}

Generate:

### Outreach Message (under 200 words)
- Zero-risk framing — emphasize what's in it for THEM
- Reference something specific about their work
- Clear, easy next step

### One-Page Partnership Overview
A shareable document covering:
- **What we do** (1 sentence)
- **Why their audience needs this** (3 specific reasons tied to their audience)
- **Partnership structure** (suggested deal: revenue share %, co-marketing arrangement, etc.)
- **What we provide** (custom landing page, affiliate tracking, marketing assets, demo support)
- **Expected results** (realistic projections based on audience size)

### Demo Walkthrough Script (tailored to their audience)
- 3-minute script highlighting features most relevant to THEIR audience
- Uses THEIR audience's language
- Anticipates THEIR audience's objections

### Suggested Deal Structure
Based on estimated audience size, recommend:
- Commission/revenue share percentage
- Payment terms
- Exclusivity considerations
- Trial period suggestion`,
  })
}

export async function runImprovementPrioritizer(product: Product, feedback?: string) {
  return runWorker({
    product,
    engine: 'equity',
    workerType: 'improvement-prioritizer',
    taskTitle: 'Daily Improvement Priority',
    maxTokens: 1536,
    userPrompt: `Determine the single most important improvement to ship today.

${feedback ? `Recent user feedback:\n${feedback}` : 'No specific feedback provided. Analyze based on the product stage, ICP pain points, and typical early-stage SaaS priorities.'}

Produce:

### The One Thing to Ship Today
**What:** [specific, concrete improvement]
**Why:** [frequency and severity of mentions, or strategic importance]
**Impact:** [expected effect on retention/conversion/satisfaction]
**Effort estimate:** [small/medium/large]

### Runner-up (ship tomorrow)
**What:** [second priority]
**Why:** [rationale]

### This Week's Pattern
What theme is emerging from recent feedback? Is it a UX issue, a missing feature, a messaging problem, or a reliability concern?

Rules:
- Be ruthlessly specific — "improve the onboarding flow" is too vague
- "Add a tooltip to the pricing page explaining the annual discount" is the right level of specificity
- One thing. Not three things. One.`,
  })
}
