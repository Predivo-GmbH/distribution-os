/* ============================================================
   LinkedIn Director — Flagship AI Worker
   4-phase weekly LinkedIn content generation
   ============================================================ */

import type { Product } from '@/types'
import { runWorker, callAI, buildSystemPrompt } from './worker-base'
import { loadKnowledgeBase } from '@/lib/storage'
import { addArtifact } from '@/lib/storage'

/* ------------------------------------------------------------
   Phase 1: Ideation — Generate 12 post ideas
   ------------------------------------------------------------ */

export async function generateIdeas(product: Product) {
  return runWorker({
    product,
    engine: 'push',
    workerType: 'linkedin-director',
    taskTitle: 'LinkedIn Director — Post Ideas',
    maxTokens: 4096,
    userPrompt: `Generate exactly 12 LinkedIn post ideas for this week.

For each idea, provide:
1. **Topic** — what the post is about
2. **Hook angle** — the opening line strategy (question, bold claim, story opener, contrarian take, stat)
3. **Content type** — one of: Educational, Storytelling, Lead-gen
4. **Engagement rationale** — one sentence on why this will resonate with the ICP

Evaluate each idea internally before presenting. Only surface the top 12.

Rules:
- Mix content types: at least 4 educational, 3 storytelling, 3 lead-gen, 2 flexible
- No generic business advice — every idea must relate to the specific ICP's pain or desired outcome
- Vary hook styles — no two posts should open the same way
- Consider the product stage when choosing topics

Format each idea as:
### Idea [N]
**Topic:** ...
**Hook:** ...
**Type:** Educational | Storytelling | Lead-gen
**Why it works:** ...`,
  })
}

/* ------------------------------------------------------------
   Phase 2: Post Writing — Generate full posts from ideas
   ------------------------------------------------------------ */

export async function generatePosts(product: Product, ideas: string) {
  const kb = loadKnowledgeBase(product.id)
  const systemPrompt = buildSystemPrompt(product, 'push', kb)

  const result = await callAI({
    systemPrompt,
    maxTokens: 8192,
    userPrompt: `Write LinkedIn posts for each of the following ideas. For each idea, write TWO variations:
1. **Short-form** — under 150 words, punchy, high-density
2. **Long-form** — 200–400 words, deeper exploration

Formatting rules for LinkedIn:
- Short paragraphs (1-2 sentences max per paragraph)
- Line break between every paragraph
- No bullet-heavy structure unless the content demands it
- Hook in the first line — must stop the scroll
- End with a clear CTA or thought-provoking question
- No hashtags in the body — add 3-5 relevant ones at the very end

Here are the ideas to write:

${ideas}

Format output as:
### Post [N]: [Topic]
#### Short Version
[post text]

#### Long Version
[post text]

---`,
  })

  if (result.success) {
    const artifact = addArtifact({
      productId: product.id,
      engine: 'push',
      workerType: 'linkedin-director',
      taskTitle: 'LinkedIn Director — Written Posts',
      status: 'pending',
      content: result.content,
    })
    return { ...result, artifactId: artifact.id }
  }

  return result
}

/* ------------------------------------------------------------
   Phase 3: Posting Calendar — 7-day schedule
   ------------------------------------------------------------ */

export async function generateCalendar(product: Product, postCount: number) {
  return runWorker({
    product,
    engine: 'push',
    workerType: 'linkedin-director',
    taskTitle: 'LinkedIn Director — Posting Calendar',
    maxTokens: 2048,
    userPrompt: `Create a 7-day LinkedIn posting calendar for ${postCount} posts.

Rules:
- Sequence: educational content early week (Mon-Tue), storytelling mid-week (Wed-Thu), lead-gen end of week (Fri)
- Recommended posting times based on B2B LinkedIn best practices (typically 7:30-8:30 AM or 12:00-1:00 PM local time)
- Include a fallback time for each slot (if the primary time is missed)
- Explain the sequence rationale briefly

Format:
### Monday
**Time:** [primary] (fallback: [time])
**Post:** [post number and brief description]
**Rationale:** [why this post on this day]

### Tuesday
...

End with a brief summary of the week's strategy.`,
  })
}

/* ------------------------------------------------------------
   Phase 4: Full Weekly Run — All phases in sequence
   ------------------------------------------------------------ */

export interface LinkedInDirectorResult {
  ideas: { success: boolean; content: string; artifactId?: string; error?: string }
  posts: { success: boolean; content: string; artifactId?: string; error?: string } | null
  calendar: { success: boolean; content: string; artifactId?: string; error?: string } | null
}

export async function runFullWeekly(product: Product): Promise<LinkedInDirectorResult> {
  // Phase 1: Ideas
  const ideas = await generateIdeas(product)

  if (!ideas.success) {
    return { ideas, posts: null, calendar: null }
  }

  // Phase 2: Write posts from ideas
  const posts = await generatePosts(product, ideas.content)

  // Phase 3: Calendar
  const calendar = await generateCalendar(product, 12)

  return { ideas, posts, calendar }
}
