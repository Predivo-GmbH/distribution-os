import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Target, Handshake, Search, Trophy, RefreshCw } from 'lucide-react'

const ENGINES = [
  { icon: Zap, name: 'Pull Engine', desc: 'SEO, content marketing, and organic growth that compounds over time.', color: 'var(--color-engine-pull)' },
  { icon: Target, name: 'Push Engine', desc: 'Outbound campaigns, cold outreach, and proactive distribution.', color: 'var(--color-engine-push)' },
  { icon: Handshake, name: 'Bridge Engine', desc: 'Partnerships, integrations, and co-marketing opportunities.', color: 'var(--color-engine-bridge)' },
  { icon: Search, name: 'Search Engine', desc: 'Paid search, marketplace listings, and discovery optimization.', color: 'var(--color-engine-search)' },
  { icon: Trophy, name: 'Equity Engine', desc: 'Brand building, community, and earned reputation.', color: 'var(--color-engine-equity)' },
  { icon: RefreshCw, name: 'Persistence Engine', desc: 'Email sequences, retargeting, and retention loops.', color: 'var(--color-engine-persistence)' },
]

const STEPS = [
  { num: '01', title: 'Add Your Product', desc: 'Define your SaaS product, its stage, and revenue.' },
  { num: '02', title: 'Activate Engines', desc: 'Choose which distribution engines to focus on.' },
  { num: '03', title: 'Execute Weekly Tasks', desc: 'Complete scored tasks each week across your active engines.' },
  { num: '04', title: 'Track & Compound', desc: 'Watch your distribution score grow as consistency compounds.' },
]

export function Landing() {
  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      {/* Nav */}
      <header className="border-b border-[var(--color-edge)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
              <div className="flex flex-col items-end gap-[3px]">
                <div className="w-[11px] h-[4px] rounded-sm bg-white" />
                <div className="w-[17px] h-[4px] rounded-sm bg-white/80" />
                <div className="w-[22px] h-[4px] rounded-sm bg-white/60" />
              </div>
            </div>
            <span className="font-semibold text-[var(--color-ink)] text-sm tracking-tight">
              Distribution OS
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/pricing" className="text-sm text-[var(--color-ink-body)] hover:text-[var(--color-ink)] transition-colors">
              Pricing
            </Link>
            <Link to="/login" className="text-sm text-[var(--color-ink-body)] hover:text-[var(--color-ink)] transition-colors">
              Log In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors"
            >
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent-text)] text-xs font-semibold mb-6">
          Built for solo founders
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-[var(--color-ink)] tracking-tight leading-[1.1] mb-6">
          Stop building. <br />Start distributing.
        </h1>
        <p className="text-lg text-[var(--color-ink-body)] max-w-2xl mx-auto mb-10">
          Distribution OS gives solo SaaS founders a weekly execution system across 6 proven distribution engines. Score your progress, build streaks, and compound your reach.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-semibold text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors"
          >
            Start Free <ArrowRight size={16} />
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[var(--color-edge)] text-sm font-medium text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* 6 Engines */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-[var(--color-ink)] text-center mb-3">
          6 Distribution Engines
        </h2>
        <p className="text-sm text-[var(--color-ink-body)] text-center mb-12 max-w-lg mx-auto">
          Every SaaS product needs distribution. These six engines cover every channel — from organic pull to persistent retention.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ENGINES.map(({ icon: Icon, name, desc, color }) => (
            <div
              key={name}
              className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-5"
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
      </section>

      {/* How it works */}
      <section className="border-t border-[var(--color-edge)] bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto px-6 py-24">
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
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-[var(--color-ink)] mb-4">
          Ready to distribute?
        </h2>
        <p className="text-[var(--color-ink-body)] mb-8">
          Free to start. No credit card required.
        </p>
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-semibold text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors"
        >
          Get Started Free <ArrowRight size={16} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-edge)] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--color-ink-muted)]">
            Distribution OS — Built by Prodiva GmbH
          </p>
          <div className="flex items-center gap-4 text-xs text-[var(--color-ink-muted)]">
            <Link to="/pricing" className="hover:text-[var(--color-ink-body)] transition-colors">Pricing</Link>
            <Link to="/login" className="hover:text-[var(--color-ink-body)] transition-colors">Log In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
