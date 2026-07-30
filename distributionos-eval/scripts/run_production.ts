/**
 * Distribution-OS — provider head-to-head runner (Anthropic vs Kimi), 2026-07-22.
 *
 * `call-ai` is a pass-through proxy: it owns no prompt, it resolves the 'smart' tier and
 * forwards whatever the client sends. The real prompts live in app/src/lib/ai/*. This runner
 * reproduces the production pair verbatim:
 *   system = buildSystemPrompt()   (app/src/lib/ai/worker-base.ts:17-73)
 *   user   = the worker's userPrompt (app/src/lib/ai/push-workers.ts, offer-workers.ts)
 * with a REAL product knowledge base (ReplyFlow) so the output can be judged on merit.
 *
 *   npx tsx scripts/run_production.ts [--case W1] [--output-dir results_cmp_anthropic]
 *   AI_PROVIDER=kimi npx tsx scripts/run_production.ts --output-dir results_cmp_kimi
 */
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const AI_PROVIDER = (process.env.AI_PROVIDER === 'kimi' ? 'kimi' : 'anthropic') as 'anthropic' | 'kimi'
const PROVIDER_CFG = {
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    // call-ai resolves the 'smart' tier (index.ts:93) — Sonnet-class.
    model: process.env.AI_MODEL ?? 'claude-sonnet-4-6',
    price: { in: 3, out: 15 },
    headers: (k: string) => ({ 'x-api-key': k, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }),
    extra: {} as Record<string, unknown>,
  },
  kimi: {
    url: 'https://api.moonshot.ai/anthropic/v1/messages',
    model: process.env.AI_MODEL ?? 'kimi-k2.6',
    price: { in: 0.95, out: 4 },
    headers: (k: string) => ({ Authorization: `Bearer ${k}`, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }),
    // Without this Kimi returns [thinking, text] and content[0].text is undefined.
    extra: { thinking: { type: 'disabled' } } as Record<string, unknown>,
  },
}[AI_PROVIDER]

const MAX_TOKENS = 4096 // config.ts:20 default

function loadKey(): string {
  const envPath = path.resolve(__dirname, '..', '.env.eval')
  if (!fs.existsSync(envPath)) throw new Error(`.env.eval not found at ${envPath}`)
  const want = AI_PROVIDER === 'kimi' ? 'MOONSHOT_API_KEY' : 'ANTHROPIC_API_KEY'
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(new RegExp(`^${want}\\s*=\\s*(.+)`))
    if (m) return m[1].trim()
  }
  throw new Error(`${want} not found in .env.eval`)
}

// ── System prompt: buildSystemPrompt() output for a real product (ReplyFlow, push engine) ──

const SYSTEM_PROMPT = `You are an expert distribution strategist and content creator working for "ReplyFlow".
Product stage: launched. Primary engine: Push (outbound-led).

## Product
ReplyFlow writes on-brand replies to your Google reviews in seconds, so a one-person business never leaves a review unanswered.
Key benefits:
1. Replies in your own tone of voice, in the language the review was written in
2. Answers every review — including the angry ones — without you drafting anything
3. Turns review response rate into a local-SEO ranking advantage
Primary competitor: doing it manually, or a generic AI chatbot
Why switch: a generic chatbot writes obviously templated replies that customers spot; ReplyFlow learns the business's own voice.

## Ideal Customer Profile
Who: owner-operators of local Swiss/DACH service businesses — restaurants, hotels, clinics, salons, trades — 1 to 20 staff
Pain: reviews pile up unanswered because writing a good reply takes 15 minutes and they only have evenings
What they've tried: replying manually in bursts, asking staff to do it, pasting into ChatGPT
Desired outcome: every review answered within 24h, in a voice that sounds like them, without it becoming a job
Where they hang out: local business Facebook groups, industry associations, Google Business Profile itself

## Writing Style
Tone: professional, non-technical, confident
Length preference: medium

## Voice Reference (match this style)

Example 1:
Every unanswered review is a customer telling the next customer you didn't care enough to reply.

Example 2:
You didn't start a restaurant to write copy at 11pm. ReplyFlow answers the reviews; you run the place.`

// ── Cases: production userPrompts, verbatim ──

interface Case {
  id: string
  name: string
  userPrompt: string
}

const CASES: Case[] = [
  {
    id: 'W1',
    name: 'Landing page copy (push-workers.ts:91)',
    userPrompt: `Write complete waitlist/landing page copy for ReplyFlow.

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
  },
  {
    id: 'W2',
    name: 'Lead magnet document (push-workers.ts:58)',
    userPrompt: `Create a complete lead magnet document — not an outline, the actual content.

Target pain point: reviews pile up unanswered because writing a good reply takes 15 minutes.

First, determine the best format:
- **Checklist** — if the pain is about "not knowing what to do"
- **Framework/Guide** — if the pain is about "not knowing how to do it"
- **Reference Sheet** — if the pain is about "needing quick access to information"
- **Assessment/Score** — if the pain is about "not knowing where they stand"

Then write the complete document, including a title, the full body content, and a closing CTA
that bridges naturally to the product. Write every word — no placeholders, no "[insert here]".`,
  },
  {
    id: 'W3',
    name: 'Offer package (offer-workers.ts:47)',
    userPrompt: `Design an irresistible offer package. Produce:

1. The core offer — what exactly the customer gets, stated as an outcome
2. Pricing and the reasoning behind it
3. Bonuses or add-ons that raise perceived value without raising cost much
4. A risk reversal (guarantee) that removes the biggest reason not to buy
5. The scarcity or urgency mechanism, and why it is credible rather than fake
6. The one-sentence version of the offer, as it would appear on a pricing page`,
  },
]

async function runCase(c: Case, apiKey: string) {
  const start = Date.now()
  const res = await fetch(PROVIDER_CFG.url, {
    method: 'POST',
    headers: PROVIDER_CFG.headers(apiKey),
    body: JSON.stringify({
      ...PROVIDER_CFG.extra,
      model: PROVIDER_CFG.model,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: c.userPrompt }],
    }),
  })
  const durationMs = Date.now() - start
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = await res.json()
  const inTok = data.usage?.input_tokens ?? 0
  const outTok = data.usage?.output_tokens ?? 0
  return {
    provider: AI_PROVIDER,
    model: PROVIDER_CFG.model,
    case_id: c.id,
    case_name: c.name,
    output: data.content?.[0]?.text ?? '',
    stop_reason: data.stop_reason,
    duration_ms: durationMs,
    input_tokens: inTok,
    output_tokens: outTok,
    cost_usd: (inTok * PROVIDER_CFG.price.in + outTok * PROVIDER_CFG.price.out) / 1_000_000,
  }
}

async function main() {
  const args = process.argv.slice(2)
  const caseFilter = args.includes('--case') ? args[args.indexOf('--case') + 1] : null
  const outputDirName = args.includes('--output-dir') ? args[args.indexOf('--output-dir') + 1] : 'results_prod'
  const apiKey = loadKey()
  const outputDir = path.resolve(__dirname, '..', outputDirName)
  const cases = caseFilter ? CASES.filter((c) => c.id === caseFilter) : CASES

  console.log(`Distribution-OS call-ai — provider=${AI_PROVIDER} model=${PROVIDER_CFG.model}`)
  console.log(`Cases: ${cases.length}   Output: ${outputDir}`)
  console.log('='.repeat(60))

  let totalCost = 0
  for (const c of cases) {
    process.stdout.write(`  ${c.id} ${c.name.slice(0, 42).padEnd(42)} ... `)
    try {
      const r = await runCase(c, apiKey)
      fs.mkdirSync(path.join(outputDir, c.id), { recursive: true })
      fs.writeFileSync(path.join(outputDir, c.id, 'result.json'), JSON.stringify(r, null, 2))
      totalCost += r.cost_usd
      const words = r.output.split(/\s+/).filter(Boolean).length
      console.log(`${words} words, ${r.duration_ms}ms, $${r.cost_usd.toFixed(4)}${r.stop_reason === 'max_tokens' ? ' [TRUNCATED]' : ''}`)
    } catch (e) {
      console.log(`FAILED: ${(e as Error).message.slice(0, 90)}`)
    }
    await new Promise((r) => setTimeout(r, 500))
  }

  console.log('\n' + '='.repeat(60))
  console.log(`Done. Total cost: $${totalCost.toFixed(4)}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
