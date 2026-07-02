import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Target, Handshake, Search, Trophy, RefreshCw, CheckCircle2, Lightbulb, FileText, Rocket, Palette, ClipboardCheck, Globe, Star } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { APP_NAME } from '@/lib/app-config'

const ENGINES = [
  { icon: Zap, name: 'Pull Engine', desc: 'SEO, content marketing, and organic growth that compounds over time.', color: 'var(--color-engine-pull)' },
  { icon: Target, name: 'Push Engine', desc: 'Outbound campaigns, cold outreach, and proactive distribution.', color: 'var(--color-engine-push)' },
  { icon: Handshake, name: 'Bridge Engine', desc: 'Partnerships, integrations, and co-marketing opportunities.', color: 'var(--color-engine-bridge)' },
  { icon: Search, name: 'Search Engine', desc: 'Paid search, marketplace listings, and discovery optimization.', color: 'var(--color-engine-search)' },
  { icon: Trophy, name: 'Equity Engine', desc: 'Brand building, community, and earned reputation.', color: 'var(--color-engine-equity)' },
  { icon: RefreshCw, name: 'Persistence Engine', desc: 'Email sequences, retargeting, and retention loops.', color: 'var(--color-engine-persistence)' },
]

const STEPS = [
  { num: '01', title: 'Validate Your Idea', desc: '3-agent deep dive: market research, competitor analysis, and distribution feasibility.' },
  { num: '02', title: 'Build Your Brand', desc: 'Generate design tokens, brand book, and consistency-checked brand foundation.' },
  { num: '03', title: 'Activate Distribution', desc: 'Choose your engines, get a personalized playbook, and execute weekly tasks.' },
  { num: '04', title: 'Scale With AI', desc: '48 AI workers handle content, proposals, outreach, audits, and daily ops.' },
]

const FEATURES = [
  { icon: Lightbulb, title: 'Idea Validation', desc: 'Market research, competitor analysis, and distribution feasibility in one click.' },
  { icon: FileText, title: 'Offer Builder', desc: 'Product brief, 3-tier pricing, irresistible hook, and objection busters.' },
  { icon: Palette, title: 'Design Pipeline', desc: 'Brand analysis, design tokens, brand book, and consistency check.' },
  { icon: Rocket, title: 'Content Engine', desc: '7-day calendars, video scripts, and outreach DM sequences.' },
  { icon: ClipboardCheck, title: '8-Domain Audit', desc: 'Security, SEO, performance, code quality, accessibility, and more.' },
  { icon: Globe, title: 'Site Analysis', desc: 'Reverse-engineer any website or score it against a conversion checklist.' },
]

const PAIN_POINTS = [
  'You built a great product but nobody knows about it',
  'You spend 80% of your time building, 0% distributing',
  'You try random marketing tactics with no system',
  'You have no idea which distribution channel fits your product',
  'Content creation feels overwhelming without a framework',
]

const TESTIMONIALS = [
  { name: 'Solo Founder', role: 'SaaS Builder', quote: 'Finally a system that tells me exactly what to do each week for distribution.', stars: 5 },
  { name: 'Indie Hacker', role: 'Product Creator', quote: 'The 48 AI workers save me 20+ hours per week on content and outreach.', stars: 5 },
  { name: 'Bootstrapper', role: 'First-time Founder', quote: 'Went from 0 to structured distribution in one afternoon.', stars: 5 },
]

const FAQ = [
  { q: 'What is a distribution engine?', a: 'A distribution engine is a systematic approach to getting your product in front of customers. There are 6 engines covering every channel from SEO to partnerships.' },
  { q: 'Do I need a product already?', a: 'No. Start with Idea Validation to research your market and competitors before building anything.' },
  { q: 'How do the AI workers work?', a: 'Each worker is specialized for a specific task (e.g., SEO writing, competitor analysis). You click Generate and get production-ready output in seconds.' },
  { q: 'Is my data secure?', a: 'Yes. API keys are never stored client-side. All AI calls go through a secure edge function proxy.' },
  { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no commitments. Cancel your subscription at any time from the billing portal.' },
]

export function LandingOriginal() {
  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      {/* 1. Nav */}
      <header className="border-b border-[var(--color-edge)] sticky top-0 z-50 bg-[var(--color-bg)]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="font-semibold text-[var(--color-ink)] text-sm tracking-tight">
              {APP_NAME}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/pricing" className="hidden sm:inline-flex items-center min-h-[44px] text-sm text-[var(--color-ink-body)] hover:text-[var(--color-ink)] transition-colors">
              Pricing
            </Link>
            <Link to="/login" className="inline-flex items-center min-h-[44px] text-sm text-[var(--color-ink-body)] hover:text-[var(--color-ink)] transition-colors">
              Log In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors"
            >
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent-text)] text-xs font-semibold mb-6">
          Built for solo founders
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-[var(--color-ink)] tracking-tight leading-[1.1] mb-6">
          Stop building alone. <br />Start distributing with AI.
        </h1>
        <p className="text-lg text-[var(--color-ink-body)] max-w-2xl mx-auto mb-10">
          {APP_NAME} gives solo SaaS founders 48 AI workers across 6 proven distribution engines.
          Validate ideas, build brands, create content, and scale — all from one dashboard.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            to="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-semibold text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors"
          >
            Start Free <ArrowRight size={16} />
          </Link>
          <Link
            to="/pricing"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-lg border-2 border-[var(--color-edge)] text-sm font-medium text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            View Pricing
          </Link>
        </div>
        <p className="text-xs text-[var(--color-ink-muted)] mt-4">Free forever. No credit card required.</p>
      </section>

      {/* 3. Problem / Agitate */}
      <section className="border-t border-[var(--color-edge)] bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <h2 className="text-2xl font-bold text-[var(--color-ink)] text-center mb-3">
            Sound familiar?
          </h2>
          <p className="text-sm text-[var(--color-ink-body)] text-center mb-8 max-w-lg mx-auto">
            Most solo founders build amazing products that nobody discovers. Distribution is the bottleneck — not your code.
          </p>
          <div className="max-w-xl mx-auto space-y-3">
            {PAIN_POINTS.map((point, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-edge)]">
                <span className="text-[var(--color-error)] mt-0.5 shrink-0">✕</span>
                <span className="text-sm text-[var(--color-ink-body)]">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Solution */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
        <h2 className="text-2xl font-bold text-[var(--color-ink)] mb-3">
          Your AI distribution team
        </h2>
        <p className="text-sm text-[var(--color-ink-body)] max-w-lg mx-auto mb-8">
          {APP_NAME} replaces the marketing team you cannot afford. 48 specialized AI workers handle everything from idea validation to daily content — so you can focus on building.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-5 text-left">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-accent-light)] flex items-center justify-center mb-3">
                <Icon size={16} className="text-[var(--color-accent-text)]" />
              </div>
              <h3 className="font-semibold text-sm text-[var(--color-ink)] mb-1">{title}</h3>
              <p className="text-xs text-[var(--color-ink-body)]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. 6 Engines */}
      <section className="border-t border-[var(--color-edge)] bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <h2 className="text-2xl font-bold text-[var(--color-ink)] text-center mb-3">
            6 Distribution Engines
          </h2>
          <p className="text-sm text-[var(--color-ink-body)] text-center mb-8 sm:mb-12 max-w-lg mx-auto">
            Every SaaS product needs distribution. These six engines cover every channel — from organic pull to persistent retention.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ENGINES.map(({ icon: Icon, name, desc, color }) => (
              <div
                key={name}
                className="bg-[var(--color-bg)] border border-[var(--color-edge)] rounded-xl p-5"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: color + '20', color }}
                  >
                    <Icon size={16} />
                  </div>
                  <h3 className="font-semibold text-sm text-[var(--color-ink)]">{name}</h3>
                </div>
                <p className="text-sm text-[var(--color-ink-body)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. How it works */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <h2 className="text-2xl font-bold text-[var(--color-ink)] text-center mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {STEPS.map(({ num, title, desc }) => (
            <div key={num} className="flex gap-4">
              <span className="font-mono text-3xl font-bold text-[var(--color-accent)] opacity-40">
                {num}
              </span>
              <div>
                <h3 className="font-semibold text-[var(--color-ink)] mb-1">{title}</h3>
                <p className="text-sm text-[var(--color-ink-body)]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Social proof */}
      <section className="border-t border-[var(--color-edge)] bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <h2 className="text-2xl font-bold text-[var(--color-ink)] text-center mb-3">
            Founders love {APP_NAME}
          </h2>
          <p className="text-sm text-[var(--color-ink-body)] text-center mb-8">
            Join solo founders who replaced their marketing guesswork with a system.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, quote, stars }) => (
              <div key={name} className="bg-[var(--color-bg)] border border-[var(--color-edge)] rounded-xl p-5">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} size={14} className="text-[var(--color-accent)] fill-[var(--color-accent)]" />
                  ))}
                </div>
                <p className="text-sm text-[var(--color-ink-body)] mb-3 italic">&ldquo;{quote}&rdquo;</p>
                <p className="text-xs font-semibold text-[var(--color-ink)]">{name}</p>
                <p className="text-xs text-[var(--color-ink-muted)]">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Stats */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '48', label: 'AI Workers' },
            { value: '6', label: 'Distribution Engines' },
            { value: '10', label: 'App Sections' },
            { value: '0', label: 'Marketing Team Needed' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold text-[var(--color-accent)]">{value}</p>
              <p className="text-xs text-[var(--color-ink-muted)] mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="border-t border-[var(--color-edge)] bg-[var(--color-surface)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <h2 className="text-2xl font-bold text-[var(--color-ink)] text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="bg-[var(--color-bg)] border border-[var(--color-edge)] rounded-xl p-5">
                <h3 className="font-semibold text-sm text-[var(--color-ink)] mb-2">{q}</h3>
                <p className="text-sm text-[var(--color-ink-body)]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Final CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <h2 className="text-3xl font-bold text-[var(--color-ink)] mb-4">
          Ready to stop guessing and start distributing?
        </h2>
        <p className="text-[var(--color-ink-body)] mb-3">
          Free forever. Upgrade when you are ready.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
          <Link
            to="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 min-h-[44px] rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-semibold text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors"
          >
            Get Started Free <ArrowRight size={16} />
          </Link>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-[var(--color-ink-muted)]">
          <span className="flex items-center gap-1"><CheckCircle2 size={12} /> No credit card</span>
          <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Cancel anytime</span>
          <span className="flex items-center gap-1"><CheckCircle2 size={12} /> 48 AI workers</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-edge)] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--color-ink-muted)]">
              &copy; {new Date().getFullYear()} Distribution OS by Predivo GmbH. All rights reserved.
            </p>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">Swiss-made</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--color-ink-muted)]">
            <Link to="/pricing" className="px-2 min-h-[44px] inline-flex items-center hover:text-[var(--color-ink-body)] transition-colors">Pricing</Link>
            <Link to="/login" className="px-2 min-h-[44px] inline-flex items-center hover:text-[var(--color-ink-body)] transition-colors">Log In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
