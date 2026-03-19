/* ============================================================
   Push Engine Workers (non-LinkedIn)
   - Email Sequence Writer
   - Lead Magnet Generator
   - Waitlist Page Copy Writer
   - Content Performance Analyst
   ============================================================ */

import type { Product } from '@/types'
import { runWorker } from './worker-base'

export async function runEmailSequenceWriter(product: Product, launchDate?: string) {
  return runWorker({
    product,
    engine: 'push',
    workerType: 'email-sequence-writer',
    taskTitle: 'Email Sequence — Pre-Launch',
    maxTokens: 8192,
    userPrompt: `Write a complete 10-email pre-launch sequence for ${product.name}.
${launchDate ? `Target launch date: ${launchDate}` : ''}

Each email must be written in full — not outlined, not summarized. Produce the actual email.

### Email Arc:
1. **Problem definition** — introduce the pain the ICP faces
2. **Problem amplification** — deepen the pain, show consequences of not solving it
3. **Solution introduction** — reveal the product as the answer
4. **Social proof** — early user results, testimonials, beta feedback
5. **Objection handling #1** — address the biggest concern (usually price or complexity)
6. **Objection handling #2** — address the second biggest concern (usually trust or switching cost)
7. **Urgency** — time-limited offer or early bird pricing
8. **Scarcity** — limited spots, founding member benefits
9. **Launch** — product is live, clear CTA to buy/sign up
10. **Post-launch follow-up** — for non-converters, soft re-engagement

For each email provide:
- **Subject line** (+ one alternative for A/B testing)
- **Preview text** (the snippet shown in inbox)
- **Full email body** (formatted with paragraphs, not walls of text)
- **CTA** (specific button text)
- **Send timing** (days relative to launch, e.g., "L-14", "L-7", "Launch Day")

Rules:
- Write in the brand's voice and tone from the knowledge base
- Each email should stand alone but build on the previous
- Include personal anecdote placeholders marked [ADD YOUR STORY: topic]
- No generic marketing speak — every sentence should feel written by a founder, not a copywriter`,
  })
}

export async function runLeadMagnetGenerator(product: Product, painPoint?: string) {
  return runWorker({
    product,
    engine: 'push',
    workerType: 'lead-magnet-generator',
    taskTitle: painPoint ? `Lead Magnet — ${painPoint}` : 'Lead Magnet — ICP Pain Point',
    maxTokens: 6144,
    userPrompt: `Create a complete lead magnet document — not an outline, the actual content.

${painPoint ? `Target pain point: ${painPoint}` : 'Choose the highest-impact pain point from the ICP definition.'}

First, determine the best format:
- **Checklist** — if the pain is about "not knowing what to do"
- **Framework/Guide** — if the pain is about "not knowing how to do it"
- **Reference Sheet** — if the pain is about "needing quick access to information"
- **Assessment/Score** — if the pain is about "not knowing where they stand"

Then produce the complete document:

1. **Title** — specific, outcome-driven (e.g., "The 7-Point Checklist for X")
2. **Introduction** (1 paragraph) — why this matters, what they'll get
3. **Full content** — the actual checklist/framework/reference with detailed explanations
4. **Implementation section** — exactly how to use this, step by step
5. **CTA** — natural bridge to the product ("If you want to automate steps 3-7, [product] does exactly that")

Rules:
- Must be genuinely useful standalone — not a thinly veiled sales pitch
- Specific enough that someone could take action immediately after reading
- 1500-3000 words
- Formatted for easy scanning (numbered lists, bold key points, clear sections)`,
  })
}

export async function runWaitlistCopyWriter(product: Product) {
  return runWorker({
    product,
    engine: 'push',
    workerType: 'waitlist-copy-writer',
    taskTitle: 'Waitlist Landing Page Copy',
    maxTokens: 4096,
    userPrompt: `Write complete waitlist/landing page copy for ${product.name}.

Produce:

### Headlines (2 variants for A/B testing)
- **Variant A:** [headline] + [subheadline]
- **Variant B:** [headline] + [subheadline]

### Hero Section
- Problem statement (1-2 sentences in the ICP's language)
- Solution statement (1 sentence)
- Primary CTA ("Join the waitlist" / "Get early access" — choose the best framing)

### Three Benefit Blocks
For each:
- **Icon suggestion** (describe what icon to use)
- **Headline** (outcome-focused, not feature-focused)
- **Description** (2 sentences max)

### Social Proof Section
- Guidance on what proof to add (type, format, placement)
- 3 placeholder testimonial templates showing ideal structure

### FAQ (5 questions)
Derived from the ICP's likely objections:
- Each question is something the ICP would actually ask
- Each answer handles the objection and reinforces value

### CTA Section
- Final headline
- Supporting copy (1 sentence)
- Button text
- Below-button reassurance text ("No credit card required" etc.)

Rules:
- Every word should build desire or reduce friction
- Use the ICP's exact language, not marketing jargon
- The page should work without images — copy does the heavy lifting`,
  })
}

export async function runContentPerformanceAnalyst(product: Product, performanceData?: string) {
  return runWorker({
    product,
    engine: 'push',
    workerType: 'content-performance-analyst',
    taskTitle: 'Content Performance Analysis — Weekly',
    maxTokens: 2048,
    userPrompt: `Analyze recent content performance and produce actionable insights.

${performanceData ? `Performance data:\n${performanceData}` : 'No performance data provided. Generate a template analysis based on typical LinkedIn content patterns for a B2B SaaS product.'}

Produce:

### Pattern Analysis
- **Best-performing hooks** — what opening styles drove the most engagement
- **Best-performing content types** — educational vs storytelling vs lead-gen
- **Best posting days/times** — when engagement peaked
- **Audience growth signals** — what correlated with follower growth

### 3 Specific Recommendations
For each:
1. What to do differently this week
2. Why (backed by the data)
3. Expected impact

### Content Calendar Input
Feed these insights directly into next week's LinkedIn Director run:
- Topics to double down on
- Angles to avoid
- Optimal posting schedule

Be specific — cite actual patterns, not generic advice.`,
  })
}
