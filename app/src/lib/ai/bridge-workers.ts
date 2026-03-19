/* ============================================================
   Bridge Engine Workers
   - Connector Research Agent
   - Personalized Outreach Writer
   - Follow-up Sequence Manager
   - Demo Script Generator
   - Connector Performance Brief
   ============================================================ */

import type { Product } from '@/types'
import { runWorker } from './worker-base'
import { loadConnectorCRM } from './connector-crm'

/* ------------------------------------------------------------
   Connector Research Agent
   ------------------------------------------------------------ */

export async function runConnectorResearch(product: Product) {
  const crm = loadConnectorCRM(product.id)
  const existingNames = crm.map(c => c.name).join(', ')

  return runWorker({
    product,
    engine: 'bridge',
    workerType: 'connector-research',
    taskTitle: 'Connector Research — New Candidates',
    maxTokens: 4096,
    userPrompt: `Find 5 new connector candidates for distribution partnerships.

A "connector" is someone with an audience that overlaps with our ICP — newsletter writers, community leaders, course creators, complementary SaaS founders, LinkedIn creators, podcast hosts.

For each candidate, provide:
1. **Name** — real or placeholder if you're suggesting a profile type
2. **Platform** — where they have their audience (LinkedIn, newsletter, YouTube, community, etc.)
3. **Audience description** — who follows them and why
4. **Estimated audience size** — rough order of magnitude
5. **Why they're a fit** — specific connection to our ICP's pain/outcome
6. **Profile link** — a URL to find them (or search query to locate them)

Rank from most relevant to least.

${existingNames ? `IMPORTANT: Avoid duplicates. We already have these connectors: ${existingNames}` : ''}

Focus on quality over quantity. Each candidate should have a clear, specific reason they'd be motivated to share our product with their audience.`,
  })
}

/* ------------------------------------------------------------
   Personalized Outreach Writer
   ------------------------------------------------------------ */

export async function runOutreachWriter(product: Product, connectorInfo?: string) {
  return runWorker({
    product,
    engine: 'bridge',
    workerType: 'personalized-outreach',
    taskTitle: 'Personalized Outreach — Connector Message',
    maxTokens: 3072,
    userPrompt: `Write a personalized outreach sequence for this connector:

${connectorInfo || 'No specific connector provided. Generate a template outreach sequence based on the product ICP and positioning.'}

Generate:

### Initial Message
A first-touch message that:
- References their specific recent content (be specific — mention a topic or post)
- Frames our product as directly valuable to their audience (not to them personally)
- Makes a clear, low-friction ask (not "let's hop on a call" — something easier)
- Is under 150 words
- Feels personal, not templated

### Follow-up #1 (send 5 days later if no response)
- Add a new angle or value proposition
- Reference something new from their recent activity
- Under 100 words

### Follow-up #2 (send 10 days after initial if no response)
- Final touch, graceful exit
- Leave door open
- Under 80 words

Rules:
- No generic phrases like "I'd love to connect" or "I came across your profile"
- Every sentence should reference something specific about THEM
- The ask should be genuinely easy to say yes to`,
  })
}

/* ------------------------------------------------------------
   Follow-up Sequence Manager
   ------------------------------------------------------------ */

export async function runFollowUpCheck(product: Product) {
  const crm = loadConnectorCRM(product.id)
  const needsFollowUp = crm.filter(c => {
    if (c.status === 'dormant' || c.status === 'identified') return false
    if (!c.lastContactDate) return false
    const daysSince = Math.floor((Date.now() - new Date(c.lastContactDate).getTime()) / 86400000)
    return daysSince >= (c.followUpThresholdDays ?? 5)
  })

  if (needsFollowUp.length === 0) {
    return { success: true, content: 'No connectors need follow-up right now.', noAction: true }
  }

  const connectorSummaries = needsFollowUp.map(c =>
    `- ${c.name} (${c.platform}) — Status: ${c.status}, Last contact: ${c.lastContactDate}, Notes: ${c.notes || 'none'}`
  ).join('\n')

  return runWorker({
    product,
    engine: 'bridge',
    workerType: 'follow-up-sequence',
    taskTitle: 'Follow-up Drafts — Overdue Connectors',
    maxTokens: 3072,
    userPrompt: `Draft follow-up messages for each of these connectors who haven't been contacted recently:

${connectorSummaries}

For each connector, write a contextual follow-up that:
- References where the conversation stands based on their status
- Adds new value (a stat, a result, a piece of content) — not just "checking in"
- Is under 100 words
- Feels natural and unhurried

Format:
### [Connector Name]
**Status:** [their current status]
**Days since last contact:** [number]
**Follow-up message:**
[the message]`,
  })
}

/* ------------------------------------------------------------
   Demo Script Generator
   ------------------------------------------------------------ */

export async function runDemoScript(product: Product, connectorInfo?: string) {
  return runWorker({
    product,
    engine: 'bridge',
    workerType: 'demo-script-generator',
    taskTitle: 'Demo Script — Connector Conversation',
    maxTokens: 3072,
    userPrompt: `Create a demo script tailored for this specific connector conversation:

${connectorInfo || 'No specific connector provided. Generate a general demo script based on the product ICP and positioning.'}

The script should:
1. **Opening (30 seconds)** — Frame the demo around THEIR audience's specific problem
2. **Core demo (3 minutes)** — Show the 2-3 features most relevant to their audience, using language their audience uses
3. **Objection handling** — Anticipate 3 objections specific to this audience type, with responses
4. **Close (30 seconds)** — Clear next step, low friction

Rules:
- Use the connector's audience language, not our marketing language
- Highlight different features than a generic demo would
- Include specific talking points, not just an outline
- Keep total script under 5 minutes of speaking time`,
  })
}

/* ------------------------------------------------------------
   Connector Performance Brief
   ------------------------------------------------------------ */

export async function runPerformanceBrief(product: Product) {
  const crm = loadConnectorCRM(product.id)

  if (crm.length === 0) {
    return { success: true, content: 'No connectors in the CRM yet. Run Connector Research first.', noAction: true }
  }

  const crmSummary = crm.map(c =>
    `- ${c.name} | Platform: ${c.platform} | Status: ${c.status} | Audience: ~${c.audienceSize ?? 'unknown'} | Commission: ${c.commissionRate ?? 'not set'} | Revenue: $${c.revenue ?? 0} | Last contact: ${c.lastContactDate || 'never'}`
  ).join('\n')

  return runWorker({
    product,
    engine: 'bridge',
    workerType: 'connector-performance',
    taskTitle: 'Connector Performance Brief — Weekly',
    maxTokens: 2048,
    userPrompt: `Analyze our connector pipeline and produce a one-page performance brief.

Current connector data:
${crmSummary}

Produce:

### Active & Producing
List connectors that are active and generating results. For each: what's working, recommended action (increase commission, provide more assets, etc.)

### Dormant
List connectors that have gone quiet. For each: how long dormant, recommended re-engagement angle.

### Never Converted
List connectors who responded but never produced results. For each: recommended action (new angle, replace, or deprioritize).

### Top Recommendations
3 specific, prioritized actions for this week to improve connector revenue.

Be direct and specific — no generic advice.`,
  })
}
