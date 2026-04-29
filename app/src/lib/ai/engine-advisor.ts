/* ============================================================
   Engine Advisor Worker — Recommends Starting Engine
   ============================================================ */

import type { Product } from '@/types'
import { runWorker } from './worker-base'

export async function runEngineAdvisor(product: Product) {
  return runWorker({
    product,
    engine: 'persistence',
    workerType: 'engine-advisor',
    taskTitle: 'Engine Recommendation',
    maxTokens: 6144,
    userPrompt: `Analyze "${product.name}" and recommend which distribution engine to start with.

The 6 engines are:
1. **Pull** — SEO, content marketing, organic search. Best for: products with search demand, educational content.
2. **Push** — Social media, email, paid content. Best for: products with clear audience, content creators.
3. **Bridge** — Partnerships, connectors, referrals. Best for: B2B, niche markets, warm introductions.
4. **Search** — Google Ads, paid search. Best for: high-intent keywords, proven demand, budget available.
5. **Equity** — Partner deals, equity trades, co-creation. Best for: complementary products, shared audiences.
6. **Persistence** — Iteration, retention, momentum. Best for: existing users, product-market fit refinement.

Based on the product's stage (${product.stage}), name, description, and knowledge base context, provide:

1. **Primary Engine Recommendation** — Which engine to start with and why (3-5 sentences)
2. **Engine Ranking** — All 6 engines ranked by fit, with 1-line reasoning each
3. **Week 1 Quick Wins** — 3 specific actions for the recommended engine
4. **30-Day Roadmap** — Weekly milestones for the first month
5. **Secondary Engine** — Which engine to add second (after 2-4 weeks) and why
6. **Engines to Avoid** — Which engines are NOT a good fit right now, with reasoning
7. **Success Metrics** — 3 KPIs to track for the recommended engine

Be specific to the product's stage and niche. Avoid generic advice.`,
  })
}

export async function runEnginePlaybook(product: Product, engine: 'pull' | 'push' | 'bridge' | 'search' | 'equity' | 'persistence') {
  const playbooks: Record<string, string> = {
    pull: `Generate a Pull Engine (SEO/Content) playbook for "${product.name}".

Create a step-by-step execution guide:

1. **Keyword Foundation** — 10 target keywords (head + long-tail), search volume estimates, difficulty
2. **Content Architecture** — Pillar pages, cluster topics, internal linking strategy
3. **Comparison Pages** — 3 "[Product] vs [Competitor]" page outlines
4. **Programmatic SEO** — Template pages that can scale (e.g., "[Solution] for [Industry]")
5. **LLM Visibility** — How to get cited by AI assistants (structured data, FAQ schema, authority signals)
6. **Technical SEO Checklist** — Core Web Vitals, sitemap, robots.txt, schema markup
7. **Content Calendar** — 4-week publishing schedule with topics and formats
8. **Link Building** — 5 realistic link acquisition strategies for this niche

Each step should include specific, actionable tasks that can be tracked.`,

    push: `Generate a Push Engine (Social/Email) playbook for "${product.name}".

Create a step-by-step execution guide:

1. **Waitlist Strategy** — Landing page elements, lead magnet, signup incentive
2. **Educational Selling** — 5 teaching-first content pieces that naturally lead to the product
3. **Content Pillars** — 3 pillar topics with 5 sub-topics each
4. **Launch Psychology** — Pre-launch sequence (tease → reveal → urgency → launch)
5. **Email Sequences** — Welcome (5 emails), nurture (3 emails), activation (3 emails)
6. **LinkedIn Strategy** — Profile optimization, posting cadence, engagement tactics
7. **Community Building** — Where to build, how to grow, engagement playbook
8. **Metrics Dashboard** — What to track weekly (subscribers, open rate, click rate, conversions)

Each step should include specific, actionable tasks.`,

    bridge: `Generate a Bridge Engine (Partnerships/Outreach) playbook for "${product.name}".

Create a step-by-step execution guide:

1. **Connector Mapping** — 10 potential connectors (people/companies) with reach and relevance score
2. **Outreach Templates** — Cold DM, warm intro request, partnership pitch (3 templates each)
3. **Partnership Structures** — Revenue share, co-marketing, integration, referral program models
4. **Demo Script** — 5-minute product demo script optimized for conversion
5. **Follow-Up Sequences** — Day 1, 3, 7, 14 follow-up messages
6. **Referral Program** — Structure, incentives, tracking approach
7. **Event Strategy** — Online/offline events to attend or host
8. **Pipeline Management** — How to track and nurture connector relationships

Each step should include specific, actionable tasks.`,

    search: `Generate a Search Engine (Paid Ads) playbook for "${product.name}".

Create a step-by-step execution guide:

1. **Keyword Research** — 20 target keywords grouped by intent (informational, commercial, transactional)
2. **Campaign Structure** — Account > Campaigns > Ad Groups > Keywords hierarchy
3. **Ad Copy** — 5 responsive search ad variations with headlines and descriptions
4. **Landing Page Requirements** — Above-fold elements, social proof, CTA placement
5. **Budget Strategy** — Daily budget recommendation, bid strategy, scaling triggers
6. **Negative Keywords** — 20 negative keywords to exclude waste
7. **A/B Testing Plan** — What to test first, second, third (ads, landing pages, audiences)
8. **ROAS Targets** — Break-even ROAS, target ROAS, scaling ROAS by month

Each step should include specific, actionable tasks.`,

    equity: `Generate an Equity Engine (Partner Deals) playbook for "${product.name}".

Create a step-by-step execution guide:

1. **Partner Research** — 10 complementary products/services for partnership
2. **Deal Structures** — Revenue share, equity swap, co-creation, white-label options
3. **Pitch Package** — One-pager, deck outline, mutual benefit summary
4. **Negotiation Framework** — BATNA, walk-away points, deal terms checklist
5. **Integration Planning** — Technical integration requirements, API/embed options
6. **Co-Marketing Campaigns** — 3 joint campaign ideas with timeline
7. **Legal Checklist** — Key contract terms, IP protection, termination clauses
8. **Deal Pipeline** — Tracking framework (prospect → pitch → negotiate → close → execute)

Each step should include specific, actionable tasks.`,

    persistence: `Generate a Persistence Engine (Iteration/Retention) playbook for "${product.name}".

Create a step-by-step execution guide:

1. **Weekly Diagnostic** — Health check template (active users, churn, NPS, feature adoption)
2. **Failure Analysis** — Framework for diagnosing why users leave or features fail
3. **Messaging Clarity Audit** — Review homepage, onboarding, emails for clarity and consistency
4. **Stage Transition Criteria** — When to move from pre-launch → early → active → scaling
5. **Retention Loops** — 3 engagement loops to keep users coming back
6. **Feedback Collection** — In-app surveys, exit interviews, support ticket analysis
7. **Iteration Cycles** — 2-week sprint structure for continuous improvement
8. **Momentum Maintenance** — Daily/weekly habits to sustain progress during plateaus

Each step should include specific, actionable tasks.`,
  }

  return runWorker({
    product,
    engine,
    workerType: 'engine-playbook',
    taskTitle: `${engine.charAt(0).toUpperCase() + engine.slice(1)} Engine Playbook`,
    maxTokens: 8192,
    userPrompt: playbooks[engine],
  })
}
