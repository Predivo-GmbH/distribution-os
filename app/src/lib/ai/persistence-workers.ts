/* ============================================================
   Persistence Engine Workers — Retention / Diagnostics
   ============================================================ */

import type { Product } from '@/types'
import { runWorker } from './worker-base'

export async function runWeeklyDiagnostician(product: Product, weekData?: string) {
  return runWorker({
    product,
    engine: 'persistence',
    workerType: 'weekly-diagnostician',
    taskTitle: 'Weekly Diagnostic Brief',
    maxTokens: 2048,
    userPrompt: `Produce a weekly diagnostic brief for ${product.name}.

${weekData ? `This week's completion data:\n${weekData}` : 'No specific completion data provided. Generate a diagnostic template based on the product stage and engine assignments.'}

Produce:

### Health Check
For each active engine, assess:
- Momentum: accelerating / steady / decelerating / stalled
- Specific evidence for the assessment

### At-Risk Areas
Identify which aspects of distribution are falling behind and why. For each:
- **What's failing** — specific pattern (not "things are slow")
- **Why** — one of: momentum loss, wrong engine priority, messaging problem, timing issue, resource constraint
- **One fix** — specific, actionable thing to do this week to course-correct

### Wins to Compound
What worked well this week that should be doubled down on.

### Monday Morning Briefing
3-sentence summary a founder reads at 7 AM Monday to know exactly what to focus on.

Rules:
- Be honest, not encouraging — if something is failing, say so directly
- Every recommendation must be specific enough to execute in a single work session`,
  })
}

export async function runMessagingClarity(product: Product, landingPageCopy?: string) {
  return runWorker({
    product,
    engine: 'persistence',
    workerType: 'messaging-clarity',
    taskTitle: 'Messaging Clarity Analysis',
    maxTokens: 3072,
    userPrompt: `Analyze this product's messaging for clarity and ICP alignment.

${landingPageCopy ? `Landing page copy to analyze:\n${landingPageCopy}` : 'No specific copy provided. Analyze based on the product positioning in the knowledge base and generate recommendations for improvement.'}

### Analysis Method
Simulate 5 ICP-profile readers. For each:
- **Profile** — job title, company type, what they're looking for
- **Their interpretation** — what they think this product does after reading the copy
- **Confusion points** — where they got lost or made wrong assumptions
- **Would they buy?** — yes/no and why

### Messaging Gaps
The gap between reader interpretation and our actual value proposition. For each gap:
- **Where it happens** — specific section/sentence
- **Why it confuses** — the ICP doesn't have the context we assume they have
- **Rewrite suggestion** — specific alternative text

### Top 3 Rewrites
The 3 weakest sections, with complete rewritten copy:
1. **Original:** [text]
   **Problem:** [diagnosis]
   **Rewrite:** [new text]

Rules:
- Judge from the ICP's perspective, not ours
- "Clear" means a 7th grader with the ICP's job could understand it
- Every rewrite must use words the ICP actually uses, not our internal language`,
  })
}

export async function runStageTransitionAdvisor(product: Product, completionData?: string) {
  return runWorker({
    product,
    engine: 'persistence',
    workerType: 'stage-transition-advisor',
    taskTitle: 'Stage Transition Assessment',
    maxTokens: 2048,
    userPrompt: `Assess whether ${product.name} (currently in "${product.stage}" stage) should transition to the next stage.

${completionData ? `Performance data:\n${completionData}` : 'Assess based on the product stage, typical indicators, and the knowledge base context.'}

### Current Stage Assessment
- How long in current stage
- Key metrics for this stage (even if estimated)
- What "done" looks like for this stage

### Transition Indicators
For each leading indicator, rate as Met / Partially Met / Not Met:
- Revenue milestone for current stage
- Channel performance signals
- Completion rates on distribution tasks
- Market feedback signals

### Recommendation
**Should transition?** Yes / Not yet / Consider

If yes:
- **Move to:** [next stage]
- **Engine changes:** which engines to add, remove, or reprioritize
- **Tasks to add:** new weekly tasks for the new stage
- **Tasks to deprioritize:** current tasks that become less relevant
- **New strategic goal:** the one sentence that defines what success looks like in the next stage

If not yet:
- **What's missing:** specific gaps to close before transitioning
- **Timeline:** estimated weeks until transition criteria are met
- **Focus areas:** what to prioritize to accelerate the transition`,
  })
}
