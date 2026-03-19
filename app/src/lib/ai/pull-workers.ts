/* ============================================================
   Pull Engine Workers — SEO / Organic
   ============================================================ */

import type { Product } from '@/types'
import { runWorker } from './worker-base'

export async function runSEOContentWriter(product: Product, keyword?: string) {
  return runWorker({
    product,
    engine: 'pull',
    workerType: 'seo-content-writer',
    taskTitle: keyword ? `SEO Content — ${keyword}` : 'SEO Content Page',
    maxTokens: 6144,
    userPrompt: `Write a complete, publication-ready SEO page${keyword ? ` targeting the keyword: "${keyword}"` : ' for the most relevant keyword for this product'}.

Produce the full page with these sections:
1. **H1** — keyword-rich, compelling
2. **Meta title** (under 60 chars) and **meta description** (under 155 chars)
3. **Introduction** (2-3 paragraphs) — hook the reader with their pain, establish relevance
4. **Body sections** (3-5 sections with H2 headers) — thorough, expert-level content
5. **Comparison table** (if a competitor is defined in the KB) — honest, specific feature/benefit comparison
6. **CTA section** — clear next step tied to the product
7. **Suggested internal links** — 3-5 related topic URLs to create or link to

Rules:
- Write for the ICP, not for a general audience
- Every section should demonstrate expertise the reader can't get from a Google snippet
- Use natural keyword placement — no stuffing
- Include specific data points, examples, or frameworks where relevant
- Aim for 1500-2500 words`,
  })
}

export async function runKeywordResearch(product: Product) {
  return runWorker({
    product,
    engine: 'pull',
    workerType: 'keyword-research',
    taskTitle: 'Keyword Research Brief — Weekly',
    maxTokens: 3072,
    userPrompt: `Generate a prioritized keyword research brief with 10 keywords to target.

For each keyword provide:
1. **Keyword phrase** — exact phrase to target
2. **Estimated monthly searches** — rough volume (low/medium/high or numeric estimate)
3. **Difficulty signal** — Low / Medium / High based on likely competition
4. **Recommended content type** — blog post, comparison page, pillar page, landing page, FAQ, tool/calculator
5. **One-line rationale** — why this keyword matters for our ICP specifically

Prioritize by:
- Relevance to ICP pain points (most important)
- Commercial intent (prefer keywords where the searcher is close to buying)
- Achievable difficulty (prefer low-medium difficulty for newer products)

Format as a ranked table. Include a brief strategy note at the top explaining the overall keyword direction for this week.`,
  })
}

export async function runSearchConsoleOptimizer(product: Product, csvData?: string) {
  return runWorker({
    product,
    engine: 'pull',
    workerType: 'search-console-optimizer',
    taskTitle: 'Search Console Optimization — CTR Improvements',
    maxTokens: 3072,
    userPrompt: `Analyze Search Console performance data and recommend CTR improvements.

${csvData ? `Search Console data:\n${csvData}` : 'No Search Console data provided. Generate example recommendations based on typical patterns for a product like ours.'}

For each page with high impressions but CTR below 3%, provide:
1. **Current page URL/title**
2. **Current impressions and CTR**
3. **Diagnosis** — why CTR is likely low (title mismatch, weak description, wrong intent, etc.)
4. **Option A** — new title + description (conservative improvement)
5. **Option B** — new title + description (bold rewrite)

Also identify:
- Pages ranking positions 4-10 that could move to top 3 with content updates
- Keywords where we rank for unintended pages (cannibalization)

Format as a clear action list the founder can implement immediately.`,
  })
}

export async function runBacklinkOutreach(product: Product, targetUrl?: string) {
  return runWorker({
    product,
    engine: 'pull',
    workerType: 'backlink-outreach',
    taskTitle: targetUrl ? `Backlink Outreach — ${targetUrl}` : 'Backlink Outreach Draft',
    maxTokens: 2048,
    userPrompt: `Write a personalized backlink outreach email${targetUrl ? ` targeting: ${targetUrl}` : ' for a relevant site in our niche'}.

The email should:
1. Reference the target site's specific content (mention an article, resource, or topic they cover)
2. Explain why our content/product is relevant to their audience
3. Make a clear, low-friction ask (guest post, resource link, mention, etc.)
4. Be under 150 words
5. Include a subject line

Also generate:
- **Follow-up email** (for 5 days later, under 80 words)
- **3 alternative subject lines** to A/B test

Rules:
- No "I came across your website" — be specific
- Frame it as value to their readers, not a favor to us
- Sound human, not templated`,
  })
}
