/* ============================================================
   Search Engine Workers — Paid Discovery
   ============================================================ */

import type { Product } from '@/types'
import { runWorker } from './worker-base'

export async function runKeywordStrategy(product: Product) {
  return runWorker({
    product,
    engine: 'search',
    workerType: 'keyword-strategy',
    taskTitle: 'Keyword Strategy Brief — Weekly',
    maxTokens: 3072,
    userPrompt: `Create a prioritized keyword action list for paid search this week.

Provide:

### Top 5 Keywords to Target
For each:
1. **Keyword** — exact phrase
2. **Recommended content type** — landing page, blog post, comparison page
3. **Estimated ranking timeline** — realistic for our product stage
4. **Current competitor ranking** — who ranks #1-3 for this keyword and what their content looks like
5. **Our angle** — how to differentiate from existing results

### Budget Allocation
If running Google Ads:
- Which keywords to bid on vs. pursue organically
- Suggested daily budget per keyword
- Expected CPC range

### Quick Wins
3 specific actions that could improve rankings this week with minimal effort (internal linking, title updates, content additions).`,
  })
}

export async function runAdCopyGenerator(product: Product, keyword?: string, landingPageUrl?: string) {
  return runWorker({
    product,
    engine: 'search',
    workerType: 'ad-copy-generator',
    taskTitle: keyword ? `Ad Copy — ${keyword}` : 'Google Ads Copy Variations',
    maxTokens: 3072,
    userPrompt: `Generate 5 Google Ads variations${keyword ? ` for the keyword: "${keyword}"` : ' for our top keyword'}.
${landingPageUrl ? `Landing page: ${landingPageUrl}` : ''}

Each variation should test a different value proposition angle:
1. **Outcome-focused** — emphasize the result the customer gets
2. **Speed-focused** — emphasize how fast they get the result
3. **Specificity-focused** — use specific numbers, percentages, or time frames
4. **Pain-focused** — lead with the problem and transition to solution
5. **Competitor-contrast** — position against the alternative without naming them

For each variation, provide:
- **Headline 1** (max 30 chars)
- **Headline 2** (max 30 chars)
- **Headline 3** (max 30 chars)
- **Description 1** (max 90 chars)
- **Description 2** (max 90 chars)
- **Display path** suggestion

Also include:
- 5 recommended negative keywords to add
- 3 ad extension suggestions (sitelinks, callouts, or structured snippets)`,
  })
}

export async function runLandingPageCopy(product: Product, keyword?: string) {
  return runWorker({
    product,
    engine: 'search',
    workerType: 'landing-page-copy',
    taskTitle: keyword ? `Landing Page — ${keyword}` : 'Conversion Landing Page Copy',
    maxTokens: 4096,
    userPrompt: `Write complete, conversion-optimized landing page copy${keyword ? ` targeting: "${keyword}"` : ''}.

Structure:
1. **Headline** — tightly matched to search intent (provide 2 variants for A/B testing)
2. **Subheadline** — expand on the headline, address the "what's in it for me"
3. **Hero section** — problem statement + solution in 2-3 sentences
4. **3 Benefit blocks** — each with an icon suggestion, headline, and 2-sentence description
5. **Objection-handling section** — address the top 3 concerns the ICP has before buying
6. **Social proof framework** — what type of proof to add (testimonials, logos, stats) with placeholder text showing the ideal format
7. **FAQ** (5 questions) — derived from the ICP's likely objections and misconceptions
8. **CTA** — primary and secondary, with specific button text

Rules:
- Every word should serve conversion, not information
- Match the ICP's language exactly — no marketing jargon they wouldn't use
- The page should feel like it was written specifically for the searcher's intent`,
  })
}

export async function runROASAnalyst(product: Product, csvData?: string) {
  return runWorker({
    product,
    engine: 'search',
    workerType: 'roas-analyst',
    taskTitle: 'ROAS Analysis — Budget Recommendations',
    maxTokens: 3072,
    userPrompt: `Analyze Google Ads performance and recommend budget reallocation.

${csvData ? `Campaign data:\n${csvData}` : 'No campaign data provided. Generate a template analysis showing the format and type of recommendations you would provide.'}

Produce:

### Scale These (Positive ROAS)
Keywords with positive ROAS above target. For each: current spend, ROAS, recommended new budget, expected impact.

### Pause These (Negative ROAS)
Keywords with negative ROAS or zero conversions over 2+ weeks. For each: total spend wasted, reason to pause, potential reallocation.

### Add These Negative Keywords
Patterns found in search terms that waste budget. List specific negative keywords to add.

### Campaign Health Summary
One paragraph: overall ROAS trend, spend efficiency, and the single most impactful change to make this week.

Be direct — specific numbers and specific actions only.`,
  })
}
