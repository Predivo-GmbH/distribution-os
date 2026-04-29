/* ============================================================
   Proposal & Content Engine Workers
   ============================================================ */

import type { Product } from '@/types'
import { runWorker } from './worker-base'

export async function runProposalWriter(product: Product, transcript: string) {
  return runWorker({
    product,
    engine: 'bridge',
    workerType: 'proposal-writer',
    taskTitle: 'Sales Proposal',
    maxTokens: 8192,
    userPrompt: `Based on the following sales call transcript, create a tailored proposal for "${product.name}".

## Call Transcript
${transcript}

Generate a complete sales proposal with:

1. **Executive Summary** — 2-3 sentences summarizing the prospect's situation and how we solve it
2. **Problem Statement** — Specific pain points mentioned in the call, in the prospect's own words
3. **Proposed Solution** — How our product addresses each pain point, with specific features
4. **Implementation Plan** — Timeline with milestones (Week 1, 2, 4, 8)
5. **Pricing & Terms** — Recommend the right tier based on their needs, include the irresistible offer hook
6. **Objection Handling** — Pre-address the top 3 likely objections based on the call
7. **Follow-Up Sequence**:
   - 48-hour email (thank you + proposal summary + clear CTA)
   - Day 5 nudge (add new value, address potential concern)
   - Day 10 final (create urgency, offer call)
8. **Next Steps** — Clear action items for both sides

Write in a professional but warm tone. Reference specific things the prospect said to show you listened.`,
  })
}

export async function runContentWriter(product: Product) {
  return runWorker({
    product,
    engine: 'push',
    workerType: 'content-writer',
    taskTitle: '7-Day Content Calendar',
    maxTokens: 8192,
    userPrompt: `Create a 7-day content calendar for "${product.name}".

For each day, generate:

1. **Platform** — LinkedIn, Twitter/X, Blog, or Newsletter
2. **Content Type** — Post, article, thread, carousel, story
3. **Hook** — Opening line that stops the scroll (use customer pain language)
4. **Full Draft** — Complete ready-to-publish content
5. **CTA** — Call to action
6. **Hashtags** — 3-5 relevant hashtags
7. **Best Time** — Optimal posting time

Content rules:
- Use the ICP's exact pain language from the Knowledge Base
- Mix educational (40%), storytelling (30%), and promotional (30%)
- Each piece should be standalone but build a narrative across the week
- Include at least 1 contrarian take and 1 personal story prompt
- No generic "5 tips" posts — every piece must be specific and opinionated

Format as a structured Markdown calendar.`,
  })
}

export async function runVideoScriptWriter(product: Product) {
  return runWorker({
    product,
    engine: 'push',
    workerType: 'video-script-writer',
    taskTitle: 'Video Script',
    maxTokens: 6144,
    userPrompt: `Write a video script for "${product.name}" that can be used for YouTube, TikTok, or Instagram Reels.

Generate 3 video concepts of different lengths:

## Video 1: Short-Form (60 seconds)
- Hook (first 3 seconds — pattern interrupt)
- Problem (10 seconds)
- Solution reveal (15 seconds)
- Proof/demo (20 seconds)
- CTA (10 seconds)

## Video 2: Medium-Form (3-5 minutes)
- Cold open hook (15 seconds)
- Context/story (45 seconds)
- Main content — 3 key points (2-3 minutes)
- Recap + CTA (30 seconds)

## Video 3: Long-Form Tutorial (8-12 minutes)
- Hook + agenda (30 seconds)
- Why this matters (1 minute)
- Step-by-step walkthrough (5-8 minutes)
- Common mistakes (1-2 minutes)
- CTA + next video teaser (30 seconds)

For each script include:
- Exact words to say (not just bullet points)
- B-roll suggestions
- On-screen text overlays
- Thumbnail concept

Use conversational, energetic tone. Focus on the ICP's specific problems.`,
  })
}

export async function runOutreachDMWriter(product: Product) {
  return runWorker({
    product,
    engine: 'bridge',
    workerType: 'outreach-dm-writer',
    taskTitle: 'Outreach DM Sequences',
    maxTokens: 6144,
    userPrompt: `Create outreach DM sequences for "${product.name}" across multiple platforms.

Generate sequences for:

## LinkedIn DM Sequence (5 messages)
1. Connection request message (personalized, no pitch)
2. Thank-you after connect (value-first, mention shared interest)
3. Value drop (share relevant content/insight)
4. Soft intro (mention the problem you solve, ask if relevant)
5. Direct ask (offer demo/trial, include social proof)

## Twitter/X DM Sequence (3 messages)
1. Initial reach-out (reference their tweet, add value)
2. Follow-up (share case study or result)
3. Ask (offer help, low-commitment CTA)

## Email Cold Outreach (3 emails)
1. Subject + body (pattern interrupt, specific problem)
2. Follow-up (different angle, add proof)
3. Break-up email (create urgency, final offer)

Rules:
- Each message under 150 words (DMs) or 200 words (email)
- Personalization placeholders: {{first_name}}, {{company}}, {{pain_point}}, {{mutual_connection}}
- No "I hope this finds you well" or "I'd love to pick your brain"
- Lead with value, not with your product
- Include response rate benchmarks for each approach`,
  })
}
