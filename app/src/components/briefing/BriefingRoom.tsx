import { useEffect, useState } from 'react'
import type { Engine } from '@/types'
import { ENGINE_META } from '@/types'
import { Tooltip } from '@/components/shared/Tooltip'
import { ChevronDown } from 'lucide-react'
import { PageMeta } from '@/components/shared/PageMeta'
import { APP_NAME } from '@/lib/app-config'

interface Props {
  onVisit: () => void
}

/* ─── Tabs ─── */
type Tab = 'overview' | 'engines' | 'stages' | 'scoring' | 'reference'

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'engines', label: 'Engines' },
  { key: 'stages', label: 'Stages' },
  { key: 'scoring', label: 'Scoring' },
  { key: 'reference', label: 'Workflow & Glossary' },
]

/* ─── Engine deep-dive data ─── */
const ENGINE_DETAILS: Record<Engine, {
  tagline: string
  what: string
  why: string
  when: string
  examples: string[]
  metrics: string[]
  timeToResults: string
}> = {
  pull: {
    tagline: 'Attract users who are already searching for solutions like yours.',
    what: 'The Pull engine covers all inbound and organic distribution — SEO, content marketing, comparison pages, pillar content, and keyword-driven blog posts. Instead of reaching out to users, you create assets that pull them toward you through search engines and organic discovery.',
    why: 'Pull compounds over time. A blog post written today can generate traffic for years. It\'s the most cost-effective long-term channel because each piece of content builds on the last, strengthening your domain authority and topical relevance.',
    when: 'Start building Pull foundations in the Early stage. It takes 3–6 months to see meaningful organic traffic, so the earlier you start, the sooner it compounds. By the Scaling stage, Pull should be your dominant engine.',
    examples: ['SEO-optimized blog posts targeting buyer-intent keywords', 'Comparison pages (Your Product vs Competitor)', 'Pillar pages covering your core topic cluster', 'Long-tail keyword research and content mapping', 'Internal linking strategies between related content'],
    metrics: ['Organic traffic (Google Search Console)', 'Keyword rankings for target terms', 'Pages indexed and crawled', 'Backlinks acquired', 'Content-to-signup conversion rate'],
    timeToResults: '3–6 months for meaningful traffic; 12+ months for compounding returns',
  },
  push: {
    tagline: 'Reach users directly through outbound effort and social presence.',
    what: 'The Push engine is about proactive outreach — cold DMs, social media posts, "building in public" content, email campaigns, and direct engagement. You go to where your users are and put your product in front of them.',
    why: 'Push delivers the fastest results of any engine. It\'s essential in early stages when you have zero organic traffic and need to manually acquire your first users. It also validates whether your messaging resonates before you invest in scalable channels.',
    when: 'Push is critical during Pre-Launch and Early stages. Use it to build a waitlist, get beta users, and validate product-market fit. In later stages, shift Push from cold outreach to thought leadership and audience building.',
    examples: ['Personal DMs to target users on LinkedIn or X', '"Building in public" updates showing your progress', 'Cold email outreach to potential customers', 'Weekly LinkedIn thought leadership posts', 'Engaging in niche communities (Reddit, Indie Hackers, Discord)'],
    metrics: ['Response rate on outreach messages', 'Social post impressions and engagement', 'Direct signups from outbound efforts', 'Waitlist growth rate', 'DM-to-demo conversion rate'],
    timeToResults: 'Days to weeks; fastest engine for immediate traction',
  },
  bridge: {
    tagline: 'Grow by connecting your product to complementary audiences.',
    what: 'The Bridge engine leverages partnerships, integrations, and co-marketing with products that share your target audience but aren\'t competitors. You "bridge" from their established user base to yours.',
    why: 'Bridges give you access to audiences that already trust another product. An integration listing, a co-authored blog post, or a partner directory placement can drive highly qualified traffic because users are already in a buying mindset within that ecosystem.',
    when: 'Start reaching out to potential partners in the Early stage. Ship your first integration in the Active stage. Build a partner ecosystem in the Scaling stage. Bridge works best when you have a stable product that others would want to integrate with.',
    examples: ['API integrations with complementary SaaS tools', 'Co-marketing campaigns with non-competing products', 'Partner directory or marketplace listings', 'Joint webinars or podcast appearances', 'Affiliate or referral arrangements with partners'],
    metrics: ['Partner-referred signups', 'Integration adoption rate', 'Co-marketing campaign reach', 'Partner directory click-through rate', 'Revenue attributed to partnerships'],
    timeToResults: '1–3 months to establish first partnership; ongoing compounding as network grows',
  },
  search: {
    tagline: 'Get discovered through paid channels, directories, and search optimization.',
    what: 'The Search engine covers paid discovery — Google Ads, SaaS directories (Product Hunt, G2, Capterra), landing page optimization, and paid social campaigns. It\'s about making your product findable through channels that require investment.',
    why: 'Search accelerates discovery when organic channels haven\'t matured yet. It\'s also the fastest way to test messaging, validate demand for specific keywords, and identify which landing page angles convert best — insights you can then apply to your Pull engine.',
    when: 'Set up basics (Search Console, sitemap) in the Early stage. Run paid experiments in the Active stage when you have enough revenue to fund tests. Scale winning campaigns in the Scaling stage.',
    examples: ['Google Ads campaigns targeting high-intent keywords', 'Submitting to SaaS directories (G2, Capterra, Product Hunt)', 'A/B testing landing pages for conversion optimization', 'Setting up Google Search Console and Analytics', 'Retargeting campaigns for website visitors'],
    metrics: ['Cost per acquisition (CPA)', 'Click-through rate (CTR) on ads', 'Directory listing views and clicks', 'Landing page conversion rate', 'Return on ad spend (ROAS)'],
    timeToResults: 'Days for paid ads; 2–4 weeks for directory listings to generate traffic',
  },
  equity: {
    tagline: 'Build brand value that makes every other engine more effective.',
    what: 'The Equity engine builds long-term brand value — community engagement, social proof, testimonials, referral programs, and brand identity. Unlike other engines that drive direct acquisition, Equity amplifies every other channel by making your brand more trusted and recognizable.',
    why: 'Brand equity is a compounding moat. When users trust your brand, your cold emails get higher response rates, your content gets more shares, and your conversion rates improve across all channels. It\'s the multiplier that makes everything else work better.',
    when: 'Define your brand voice in Pre-Launch. Start community engagement in the Early stage. Collect testimonials and build social proof in the Active stage. Launch referral programs in the Scaling stage.',
    examples: ['Engaging in 5+ community discussions per week (Reddit, Discord, IH)', 'Collecting and publishing customer testimonials', 'Building a referral or affiliate program', 'Defining a consistent brand voice across channels', 'Creating case studies from successful customers'],
    metrics: ['Net Promoter Score (NPS)', 'Brand mention volume', 'Referral program participation rate', 'Testimonial count and quality', 'Community engagement rate'],
    timeToResults: '3–12 months; Equity is the slowest engine but creates the strongest moat',
  },
  persistence: {
    tagline: 'Keep users engaged after acquisition through lifecycle communication.',
    what: 'The Persistence engine focuses on retention and lifecycle marketing — welcome email sequences, product update newsletters, onboarding flows, churn prevention, and usage-based engagement triggers. It\'s about maximizing the value of users you\'ve already acquired.',
    why: 'Acquiring a new user costs 5–7x more than retaining an existing one. Persistence ensures users actually adopt your product, understand its value, and stick around. It\'s the most underrated distribution channel because retained users become your best advocates.',
    when: 'Set up a basic welcome email sequence in the Early stage. Refine onboarding in the Active stage. Implement churn prevention and usage-based triggers in the Scaling stage.',
    examples: ['Welcome email sequence (3–5 emails over first week)', 'Product update newsletters to all users', 'Onboarding flow optimization', 'Churn prevention workflows (triggered by usage drops)', 'Re-engagement campaigns for dormant users'],
    metrics: ['Email open and click rates', 'Onboarding completion rate', 'Monthly churn rate', 'User activation rate (first value moment)', 'Customer lifetime value (LTV)'],
    timeToResults: '2–4 weeks for email sequences; 1–3 months for measurable retention improvements',
  },
}

/* ─── Stage deep-dive data ─── */
const STAGE_DETAILS = [
  {
    value: 'pre-launch',
    label: 'Pre-Launch',
    duration: '2–8 weeks before launch',
    what: 'You\'re building your product and preparing to launch. No paying users yet, but you should already be doing distribution work — building anticipation, validating demand, and growing a waitlist.',
    signals: ['Product is still in development or private beta', 'No paying customers yet', 'You\'re validating whether people want this', 'You have a landing page but no public product'],
    focus: { push: 70, bridge: 30 } as Record<string, number>,
    advice: 'Don\'t wait until launch to start distributing. The biggest mistake founders make is building in silence. Use Push (outreach, social) to build a waitlist and validate demand. Use Bridge to find early partners who can amplify your launch.',
    mistakes: ['Building in silence for months', 'Spending time on SEO before product-market fit', 'Not collecting emails from interested people'],
  },
  {
    value: 'early',
    label: 'Early',
    duration: 'First 1–3 months after launch',
    what: 'You\'ve launched and have your first users (free or paying). Now you need to find repeatable acquisition channels while learning what messaging and positioning resonates.',
    signals: ['You have a live, public product', 'First 10–100 users or customers', 'Revenue is inconsistent or just starting', 'You\'re still learning what resonates'],
    focus: { pull: 60, push: 40 } as Record<string, number>,
    advice: 'Start building Pull foundations (blog, SEO) now — they take months to pay off. Keep Push active for short-term growth. This is the stage where you discover which channels work for YOUR product. Experiment widely.',
    mistakes: ['Stopping outreach too early', 'Trying to scale before finding product-market fit', 'Ignoring user feedback in favor of growth tactics'],
  },
  {
    value: 'active',
    label: 'Active',
    duration: '3–12 months; consistent growth phase',
    what: 'You have consistent traffic, revenue, and a growing user base. Your product-market fit is validated. Now it\'s time to diversify your distribution channels and optimize what\'s working.',
    signals: ['Consistent monthly revenue growth', '100–1,000+ users', 'At least one channel driving reliable signups', 'Product-market fit feels solid'],
    focus: { pull: 40, push: 30, bridge: 30 } as Record<string, number>,
    advice: 'Diversify across engines. If Pull is working, keep investing but add Bridge (partnerships) and Search (directories, ads) to reduce single-channel risk. Start collecting testimonials (Equity) and setting up retention workflows (Persistence).',
    mistakes: ['Relying on a single channel', 'Neglecting retention while chasing acquisition', 'Not investing in brand/equity building'],
  },
  {
    value: 'scaling',
    label: 'Scaling',
    duration: '12+ months; compounding returns phase',
    what: 'You\'re growing fast and need to optimize for efficiency and sustainability. Focus shifts from finding channels to maximizing the ones that work, plus building moats through brand equity and retention.',
    signals: ['1,000+ users or significant MRR', 'Multiple channels driving growth', 'Team might be growing', 'Competitors are noticing you'],
    focus: { pull: 50, equity: 25, persistence: 25 } as Record<string, number>,
    advice: 'Double down on Pull for compounding organic returns. Invest heavily in Equity (brand, community, referrals) to build a moat. Use Persistence to maximize LTV and turn users into advocates. This is where distribution becomes a sustainable machine.',
    mistakes: ['Ignoring retention in favor of pure acquisition', 'Not building a brand moat while competitors enter', 'Scaling paid channels without understanding unit economics'],
  },
]

const ENGINES: Engine[] = ['pull', 'push', 'bridge', 'search', 'equity', 'persistence']

/* ─── Expandable Engine Card ─── */
function EngineCard({ engine }: { engine: Engine }) {
  const [open, setOpen] = useState(false)
  const d = ENGINE_DETAILS[engine]

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl overflow-hidden transition-shadow hover:shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center gap-4 px-5 py-4 text-left min-h-[44px]"
      >
        <div
          aria-hidden="true"
          className="w-3.5 h-3.5 rounded-full shrink-0"
          style={{ backgroundColor: ENGINE_META[engine].color }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-ink)]">{ENGINE_META[engine].label} Engine</p>
          <p className="text-xs text-[var(--color-ink-muted)] mt-0.5 truncate">{d.tagline}</p>
        </div>
        <span className="text-[10px] font-mono text-[var(--color-ink-muted)] shrink-0 hidden sm:block">
          {d.timeToResults.split(';')[0]}
        </span>
        <ChevronDown
          aria-hidden="true"
          size={14}
          className={`text-[var(--color-ink-muted)] shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 pt-0 border-t border-[var(--color-edge)]">
          <div className="pt-4 space-y-4">
            {/* Three-column info blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[var(--color-surface-hover)] rounded-lg p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--color-ink-muted)] mb-1.5">What it is</p>
                <p className="text-xs text-[var(--color-ink-body)] leading-relaxed">{d.what}</p>
              </div>
              <div className="bg-[var(--color-surface-hover)] rounded-lg p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--color-ink-muted)] mb-1.5">Why it matters</p>
                <p className="text-xs text-[var(--color-ink-body)] leading-relaxed">{d.why}</p>
              </div>
              <div className="bg-[var(--color-surface-hover)] rounded-lg p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--color-ink-muted)] mb-1.5">When to use it</p>
                <p className="text-xs text-[var(--color-ink-body)] leading-relaxed">{d.when}</p>
              </div>
            </div>

            {/* Two-column: tactics + metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--color-ink-muted)] mb-2">Example tactics</p>
                <ul className="space-y-1.5">
                  {d.examples.map(ex => (
                    <li key={ex} className="flex gap-2 text-xs text-[var(--color-ink-body)]">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0 mt-1"
                        style={{ backgroundColor: ENGINE_META[engine].color }}
                      />
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--color-ink-muted)] mb-2">Key metrics to track</p>
                <ul className="space-y-1.5">
                  {d.metrics.map(m => (
                    <li key={m} className="flex gap-2 text-xs text-[var(--color-ink-body)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-ink-muted)] shrink-0 mt-1" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Time to results badge */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--color-ink-muted)]">Time to results:</span>
              <span className="text-xs font-mono text-[var(--color-accent)]">{d.timeToResults}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Main Component ─── */
export function BriefingRoom({ onVisit }: Props) {
  const [tab, setTab] = useState<Tab>('overview')
  const [activeStage, setActiveStage] = useState(0)

  useEffect(() => { onVisit() }, [onVisit])

  return (
    <div className="space-y-6">
      <PageMeta title={`Briefing Room — ${APP_NAME}`} noindex />
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)] tracking-tight mb-1">
          Briefing Room
        </h1>
        <p className="text-sm text-[var(--color-ink-muted)]">
          Your complete reference guide. Hover over <Tooltip content="Dotted-underlined terms have tooltips — hover to learn more.">highlighted terms</Tooltip> for quick definitions.
        </p>
      </div>

      {/* Tab bar */}
      <div className="[mask-image:linear-gradient(to_right,black_90%,transparent)] sm:[mask-image:none]">
        <div role="tablist" aria-label="Briefing Room sections" className="flex gap-1 p-1 bg-[var(--color-surface-hover)] rounded-lg overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-1">
          {TABS.map(t => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              aria-controls={`briefing-tabpanel-${t.key}`}
              id={`briefing-tab-${t.key}`}
              onClick={() => setTab(t.key)}
              className={`shrink-0 sm:flex-1 px-3 py-2 min-h-[44px] rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                tab === t.key
                  ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm'
                  : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink-body)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ OVERVIEW TAB ═══ */}
      {tab === 'overview' && (
        <div role="tabpanel" id="briefing-tabpanel-overview" aria-labelledby="briefing-tab-overview" className="space-y-6">
          {/* The "Why" — front and center */}
          <div className="bg-[var(--color-accent-light)] border border-[var(--color-edge)] rounded-2xl p-4 sm:p-6">
            <h2 className="text-base font-semibold text-[var(--color-accent-text)] mb-3">Why does this exist?</h2>
            <div className="space-y-3 text-sm text-[var(--color-ink-body)] leading-relaxed">
              <p>
                <strong>Most SaaS products don't fail because the product is bad — they fail because nobody knows they exist.</strong> As a solo founder, you're responsible for building AND distributing your product. But distribution is where most founders stall: they know they should "do marketing" but don't know what specifically to do this week.
              </p>
              <p>
                {APP_NAME} exists to solve exactly that problem. It turns the vague goal of "grow my product" into a concrete, weekly checklist of high-impact actions — personalized to where your product is right now and which growth channels you've chosen.
              </p>
            </div>
          </div>

          {/* The Goal */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl p-4 sm:p-6">
            <h2 className="text-base font-semibold text-[var(--color-ink)] mb-3">The end goal</h2>
            <div className="space-y-3 text-sm text-[var(--color-ink-body)] leading-relaxed">
              <p>
                The goal is <strong>sustainable, predictable growth</strong> — not a viral spike that fades. Every task you complete is a brick in a distribution system that compounds week over week:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="bg-[var(--color-surface-hover)] rounded-lg p-3.5">
                  <p className="text-xs font-semibold text-[var(--color-ink)] mb-1">Week 1–4</p>
                  <p className="text-xs text-[var(--color-ink-muted)]">You build habits. First content published, first outreach sent, first partnerships explored. The numbers are small but the system is running.</p>
                </div>
                <div className="bg-[var(--color-surface-hover)] rounded-lg p-3.5">
                  <p className="text-xs font-semibold text-[var(--color-ink)] mb-1">Month 2–3</p>
                  <p className="text-xs text-[var(--color-ink-muted)]">Organic traffic starts appearing. Your outreach gets sharper. You've found 1–2 channels that work. Distribution stops feeling like guesswork.</p>
                </div>
                <div className="bg-[var(--color-surface-hover)] rounded-lg p-3.5">
                  <p className="text-xs font-semibold text-[var(--color-ink)] mb-1">Month 3–6</p>
                  <p className="text-xs text-[var(--color-ink-muted)]">Content compounds. Partnerships drive referrals. Your brand has a presence. Users start finding you without you pushing.</p>
                </div>
                <div className="bg-[var(--color-surface-hover)] rounded-lg p-3.5">
                  <p className="text-xs font-semibold text-[var(--color-ink)] mb-1">Month 6+</p>
                  <p className="text-xs text-[var(--color-ink-muted)]">You have a distribution machine. Multiple channels feed your funnel. Growth is predictable. You spend less time wondering "what should I do?" and more time executing.</p>
                </div>
              </div>
            </div>
          </div>

          {/* What is Distribution OS */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl p-4 sm:p-6">
            <h2 className="text-base font-semibold text-[var(--color-ink)] mb-3">How {APP_NAME} works</h2>
            <div className="space-y-3 text-sm text-[var(--color-ink-body)] leading-relaxed">
              <p>
                {APP_NAME} is a{' '}
                <Tooltip content="Every Monday, a new set of tasks is generated based on your products, their stages, and your active engines. You work through these tasks during the week and track your progress.">
                  weekly command center
                </Tooltip>{' '}
                that converts distribution strategy into structured, completable tasks. Instead of asking "what should I do to grow my SaaS this week?", you get a tailored{' '}
                <Tooltip content="Tasks are generated from a matrix of 30+ templates, filtered by your product's stage and active engines. Each task has a point value (2–5 pts) based on strategic impact.">
                  task list
                </Tooltip>{' '}
                based on your product's stage and the{' '}
                <Tooltip content="Engines are the 6 distribution channels: Pull, Push, Bridge, Search, Equity, and Persistence. Each represents a distinct strategy for growing your product.">
                  distribution engines
                </Tooltip>{' '}
                you've activated.
              </p>
            </div>
          </div>

          {/* Quick-start 3 steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { n: '1', title: 'Configure', desc: 'Add products in Settings. Choose a stage and select engines.' },
              { n: '2', title: 'Execute', desc: 'Tasks auto-generate weekly. Work through them on your Dashboard.' },
              { n: '3', title: 'Track', desc: 'Check off tasks. Watch your score and completion rate climb.' },
            ].map(s => (
              <div key={s.n} className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl p-4 flex gap-3">
                <span className="font-mono text-xl font-bold text-[var(--color-accent)] shrink-0">{s.n}</span>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-ink)] mb-0.5">{s.title}</p>
                  <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Engine overview grid — compact */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)] mb-3">The 6 Engines at a Glance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {ENGINES.map(engine => (
                <button
                  key={engine}
                  onClick={() => setTab('engines')}
                  className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-lg p-3 text-left hover:border-[var(--color-edge-outline)] transition-colors group min-h-[44px]"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: ENGINE_META[engine].color }}
                    />
                    <span className="text-xs font-semibold text-[var(--color-ink)]">{ENGINE_META[engine].label}</span>
                  </div>
                  <p className="text-[11px] text-[var(--color-ink-muted)] leading-snug line-clamp-2">
                    {ENGINE_DETAILS[engine].tagline}
                  </p>
                  <span className="text-[10px] text-[var(--color-accent-text)] mt-1.5 inline-block opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ ENGINES TAB ═══ */}
      {tab === 'engines' && (
        <div role="tabpanel" id="briefing-tabpanel-engines" aria-labelledby="briefing-tab-engines" className="space-y-3">
          <p className="text-sm text-[var(--color-ink-body)]">
            Each engine is a distinct distribution strategy. Choose a{' '}
            <Tooltip content="Your primary engine gets the most weekly tasks and should be the channel you invest the most time in. Choose based on your stage and where your target users spend time.">
              primary engine
            </Tooltip>{' '}
            and optionally add{' '}
            <Tooltip content="Secondary engines generate fewer tasks but diversify your distribution. Most founders run 2–3 engines total.">
              secondary engines
            </Tooltip>.{' '}
            Click any card below to expand its full details.
          </p>
          {ENGINES.map(engine => (
            <EngineCard key={engine} engine={engine} />
          ))}
        </div>
      )}

      {/* ═══ STAGES TAB ═══ */}
      {tab === 'stages' && (
        <div role="tabpanel" id="briefing-tabpanel-stages" aria-labelledby="briefing-tab-stages" className="space-y-6">
          <p className="text-sm text-[var(--color-ink-body)]">
            Your product's stage determines which tasks are generated. Update it in Settings as your product grows. Each stage has a recommended{' '}
            <Tooltip content="The engine mix is the percentage of effort allocated to each engine. It shifts as your product matures — early stages favor outbound (Push), later stages favor compounding channels (Pull, Equity).">
              engine mix
            </Tooltip>.
          </p>

          {/* Timeline stepper */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-0 sm:flex sm:items-center">
            {STAGE_DETAILS.map((s, i) => (
              <div key={s.value} className="flex items-center sm:flex-1">
                <button
                  onClick={() => setActiveStage(i)}
                  className={`relative flex flex-col items-center gap-1.5 w-full group min-h-[44px] justify-center`}
                >
                  {/* Step number badge (mobile) + Dot (desktop) */}
                  <div
                    className={`w-6 h-6 sm:w-4 sm:h-4 rounded-full border-2 transition-colors z-10 flex items-center justify-center ${
                      activeStage === i
                        ? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
                        : 'bg-[var(--color-surface)] border-[var(--color-edge-outline)] group-hover:border-[var(--color-accent)]'
                    }`}
                  >
                    <span className={`text-[10px] font-bold sm:hidden ${activeStage === i ? 'text-white' : 'text-[var(--color-ink-muted)]'}`}>{i + 1}</span>
                  </div>
                  {/* Label */}
                  <span className={`text-xs font-medium transition-colors ${
                    activeStage === i ? 'text-[var(--color-accent-text)]' : 'text-[var(--color-ink-muted)]'
                  }`}>
                    {s.label}
                  </span>
                  <span className="text-[10px] text-[var(--color-ink-muted)] font-mono hidden sm:block">{s.duration}</span>
                </button>
                {/* Connector line */}
                {i < STAGE_DETAILS.length - 1 && (
                  <div className={`hidden sm:block h-0.5 flex-1 -mx-2 mt-[-24px] ${
                    i < activeStage ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-edge)]'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Active stage detail */}
          {(() => {
            const s = STAGE_DETAILS[activeStage]
            return (
              <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl overflow-hidden">
                <div className="px-4 sm:px-6 pt-5 pb-4">
                  <p className="text-sm text-[var(--color-ink-body)] leading-relaxed">{s.what}</p>
                </div>

                <div className="px-4 sm:px-6 pb-5 space-y-5 border-t border-[var(--color-edge)] pt-4">
                  {/* Two-column: Signals + Mistakes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--color-ink-muted)] mb-2">You're in this stage if…</p>
                      <ul className="space-y-1.5">
                        {s.signals.map(sig => (
                          <li key={sig} className="flex gap-2 text-xs text-[var(--color-ink-body)]">
                            <span className="text-[var(--color-accent)] shrink-0 mt-0.5">-</span>
                            {sig}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--color-ink-muted)] mb-2">Common mistakes</p>
                      <ul className="space-y-1.5">
                        {s.mistakes.map(m => (
                          <li key={m} className="flex gap-2 text-xs text-[var(--color-ink-body)]">
                            <span className="text-[var(--color-error)] shrink-0 mt-0.5">!</span>
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Engine mix */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--color-ink-muted)] mb-2">Recommended engine mix</p>
                    <div className="flex gap-0.5 h-3 rounded-full overflow-hidden bg-[var(--color-progress-track)] mb-2">
                      {Object.entries(s.focus).map(([engine, pct]) => (
                        <div
                          key={engine}
                          className="h-full first:rounded-l-full last:rounded-r-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: ENGINE_META[engine as Engine].color,
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(s.focus).map(([engine, pct]) => (
                        <span key={engine} className="flex items-center gap-1.5 text-xs text-[var(--color-ink-body)]">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: ENGINE_META[engine as Engine].color }}
                          />
                          {ENGINE_META[engine as Engine].label} {pct}%
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Strategy advice */}
                  <div className="bg-[var(--color-accent-light)] rounded-lg p-3 sm:p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--color-accent-text)] mb-1">Strategy</p>
                    <p className="text-sm text-[var(--color-ink-body)] leading-relaxed">{s.advice}</p>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* ═══ SCORING TAB ═══ */}
      {tab === 'scoring' && (
        <div role="tabpanel" id="briefing-tabpanel-scoring" aria-labelledby="briefing-tab-scoring" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl p-4 sm:p-5">
              <p className="font-mono text-3xl font-bold text-[var(--color-accent)] mb-1">2–5</p>
              <p className="text-sm font-semibold text-[var(--color-ink)] mb-1.5">Points per task</p>
              <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                Each task has a{' '}
                <Tooltip content="Point values are based on strategic impact. A 5-point task (like shipping an integration) has more long-term value than a 2-point task (like keyword research). Prioritize high-point tasks when short on time.">
                  point value
                </Tooltip>{' '}
                reflecting its strategic impact. Higher-point tasks deliver more value but take more effort.
              </p>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl p-4 sm:p-5">
              <p className="font-mono text-3xl font-bold text-[var(--color-accent)] mb-1">Weekly</p>
              <p className="text-sm font-semibold text-[var(--color-ink)] mb-1.5">Score resets</p>
              <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                Your{' '}
                <Tooltip content="The weekly score appears in the top-right of your Dashboard as completed/total (e.g., 24/38). It resets every Monday with fresh tasks.">
                  weekly score
                </Tooltip>{' '}
                resets every Monday when new tasks generate. A fresh start each week — no backlog anxiety.
              </p>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl p-4 sm:p-5">
              <p className="font-mono text-3xl font-bold text-[var(--color-accent)] mb-1">60%+</p>
              <p className="text-sm font-semibold text-[var(--color-ink)] mb-1.5">Target completion</p>
              <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                Your{' '}
                <Tooltip content="Completion percentage is per product on the Dashboard. 100% is great, but consistent 60%+ weeks build real distribution momentum over time.">
                  completion rate
                </Tooltip>{' '}
                shows progress. 100% is ideal, but consistent 60%+ weeks build real momentum.
              </p>
            </div>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-[var(--color-ink)] mb-3">How tasks are generated</h3>
            <div className="space-y-3 text-sm text-[var(--color-ink-body)] leading-relaxed">
              <p>
                The{' '}
                <Tooltip content="There are 30+ templates in the system, each mapped to specific stages and engines. Your weekly tasks are a filtered subset of these templates.">
                  task generation system
                </Tooltip>{' '}
                uses a <strong>Stage × Engine matrix</strong> with 30+ templates. Each Monday, the system filters templates that match your product's current stage and active engines to produce your weekly task list.
              </p>
              <p>
                This means your tasks <strong>evolve as your product grows</strong>. When you move from "Early" to "Active" stage in Settings, you'll see new tasks appear that are relevant to your current growth phase — and previous-stage tasks phase out.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ REFERENCE TAB ═══ */}
      {tab === 'reference' && (
        <div role="tabpanel" id="briefing-tabpanel-reference" aria-labelledby="briefing-tab-reference" className="space-y-6">
          {/* Detailed workflow */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl p-4 sm:p-6">
            <h2 className="text-base font-semibold text-[var(--color-ink)] mb-4">Weekly Workflow</h2>
            <div className="space-y-4">
              {[
                {
                  n: '1', title: 'Configure (once)',
                  desc: 'Add your products in Settings. For each product, set its stage and choose engines. You only need to do this once per product — update the stage as your product grows.',
                  tip: 'Start with one product and 2–3 engines. You can always add more later.',
                },
                {
                  n: '2', title: 'Execute (weekly)',
                  desc: 'Every Monday, tasks auto-generate on your Dashboard based on your current configuration. Work through them during the week — each task is a concrete action you can complete in 30–60 minutes.',
                  tip: 'Block 1–2 hours per day for distribution work. Consistency matters more than volume.',
                },
                {
                  n: '3', title: 'Track (weekly)',
                  desc: 'Check off tasks as you complete them. Your weekly score and completion percentage update in real time. Use the per-product progress cards to see which products need more attention.',
                  tip: 'If you can\'t finish all tasks, prioritize high-point tasks first — they have the most strategic impact.',
                },
              ].map(step => (
                <div key={step.n} className="flex gap-4">
                  <span className="font-mono text-xl font-bold text-[var(--color-accent)] shrink-0 w-6 text-right">{step.n}</span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)] mb-0.5">{step.title}</p>
                    <p className="text-sm text-[var(--color-ink-body)] leading-relaxed mb-1">{step.desc}</p>
                    <p className="text-xs text-[var(--color-ink-muted)] italic">Tip: {step.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Glossary */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl p-4 sm:p-6">
            <h2 className="text-base font-semibold text-[var(--color-ink)] mb-4">Glossary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
              {[
                { term: 'Engine', def: 'A distribution channel category (Pull, Push, Bridge, Search, Equity, Persistence). Each represents a distinct growth strategy.' },
                { term: 'Primary Engine', def: 'Your main distribution focus. Generates the most weekly tasks. Should get the most time and effort.' },
                { term: 'Secondary Engine', def: 'Additional channels that complement your primary engine. Fewer tasks, but keeps your strategy diversified.' },
                { term: 'Product Stage', def: 'Where your product is in its lifecycle (Pre-Launch, Early, Active, Scaling). Determines which tasks are most relevant.' },
                { term: 'Weekly Score', def: 'Sum of point values from completed tasks. Resets every Monday. Shown as completed/total (e.g., 24/38).' },
                { term: 'Task Template', def: 'A pre-defined distribution activity in the Stage × Engine matrix. Templates are filtered by your config to generate weekly tasks.' },
                { term: 'Completion Rate', def: 'Percentage of tasks completed per product. Shown on Dashboard metric cards with a progress bar.' },
                { term: 'Command Center', def: 'Your Dashboard — the weekly view showing all active tasks, scores, and progress across products.' },
              ].map(({ term, def }) => (
                <div key={term} className="py-2.5 border-b border-[var(--color-edge)]">
                  <p className="text-xs font-semibold text-[var(--color-ink)] mb-0.5">{term}</p>
                  <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">{def}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
