/* ============================================================
   Task Templates — Stage × Engine Matrix
   These define what tasks are available for each stage/engine combination.
   The core intelligence of Distribution OS.
   ============================================================ */

import type { Engine, ProductStage } from '@/types'

interface TaskTemplate {
  title: string
  description?: string
  score: number
  engine: Engine
  stages: ProductStage[]
}

export const TASK_TEMPLATES: TaskTemplate[] = [
  // PULL ENGINE — SEO / Organic
  { engine: 'pull', stages: ['pre-launch', 'early'], score: 3, title: 'Write 1 comparison page: [Your Product] vs [Competitor]' },
  { engine: 'pull', stages: ['pre-launch', 'early'], score: 2, title: 'Research 5 long-tail keywords in your niche' },
  { engine: 'pull', stages: ['early', 'active'], score: 4, title: 'Write 2 SEO-optimized blog posts targeting distribution keywords' },
  { engine: 'pull', stages: ['active', 'scaling'], score: 3, title: 'Update top 3 pages with fresh content and internal links' },
  { engine: 'pull', stages: ['active', 'scaling'], score: 5, title: 'Create a pillar page for your core topic cluster' },
  { engine: 'pull', stages: ['scaling'], score: 4, title: 'Build 3 backlinks through guest posts or collaborations' },

  // PUSH ENGINE — Outbound / Waitlist
  { engine: 'push', stages: ['pre-launch'], score: 4, title: 'Send 10 personal DMs to target users about your upcoming launch' },
  { engine: 'push', stages: ['pre-launch'], score: 3, title: 'Post a "building in public" update on X or LinkedIn' },
  { engine: 'push', stages: ['pre-launch', 'early'], score: 5, title: 'Publish weekly blog post on distribution tactics' },
  { engine: 'push', stages: ['early', 'active'], score: 3, title: 'Send 10 cold outreach DMs on LinkedIn' },
  { engine: 'push', stages: ['active', 'scaling'], score: 4, title: 'Write and share a LinkedIn thought leadership post' },

  // BRIDGE ENGINE — Partnerships / Integrations
  { engine: 'bridge', stages: ['pre-launch', 'early'], score: 3, title: 'Reach out to 3 potential integration partners' },
  { engine: 'bridge', stages: ['early', 'active'], score: 4, title: 'Propose a co-marketing initiative with a complementary tool' },
  { engine: 'bridge', stages: ['active', 'scaling'], score: 5, title: 'Ship one API integration with a partner product' },
  { engine: 'bridge', stages: ['scaling'], score: 4, title: 'Create a partner directory or marketplace page' },

  // SEARCH ENGINE — Paid Discovery
  { engine: 'search', stages: ['early', 'active'], score: 3, title: 'Set up Google Search Console and submit sitemap' },
  { engine: 'search', stages: ['active'], score: 4, title: 'Run a $50 test campaign on Google Ads for your top keyword' },
  { engine: 'search', stages: ['active', 'scaling'], score: 3, title: 'Submit product to 2 SaaS directories' },
  { engine: 'search', stages: ['scaling'], score: 5, title: 'Optimize top landing page for conversion (A/B test)' },

  // EQUITY ENGINE — Brand / Community
  { engine: 'equity', stages: ['pre-launch'], score: 3, title: 'Define your brand voice in 3 sentences' },
  { engine: 'equity', stages: ['early', 'active'], score: 4, title: 'Engage in 5 community discussions (Reddit, Discord, IH)' },
  { engine: 'equity', stages: ['active', 'scaling'], score: 3, title: 'Collect and publish 2 customer testimonials' },
  { engine: 'equity', stages: ['scaling'], score: 5, title: 'Launch a referral or affiliate program' },

  // PERSISTENCE ENGINE — Retention / Lifecycle
  { engine: 'persistence', stages: ['early', 'active'], score: 3, title: 'Set up a welcome email sequence (3 emails)' },
  { engine: 'persistence', stages: ['active'], score: 4, title: 'Review and update onboarding email sequence' },
  { engine: 'persistence', stages: ['active', 'scaling'], score: 3, title: 'Send a product update newsletter to all users' },
  { engine: 'persistence', stages: ['scaling'], score: 5, title: 'Implement a churn prevention workflow (usage-based triggers)' },
]

export function getTasksForProduct(stage: ProductStage, engines: Engine[]): TaskTemplate[] {
  return TASK_TEMPLATES.filter(
    t => t.stages.includes(stage) && engines.includes(t.engine)
  )
}
