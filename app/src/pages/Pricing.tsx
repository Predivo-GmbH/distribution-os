import { Link } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { APP_NAME } from '@/lib/app-config'

const FEATURES = [
  { name: 'Products', free: '1', pro: 'Unlimited' },
  { name: 'All 6 distribution engines', free: true, pro: true },
  { name: 'Weekly task scoring', free: true, pro: true },
  { name: 'Briefing Room', free: true, pro: true },
  { name: 'Week history & streaks', free: false, pro: true },
  { name: 'Dark mode', free: false, pro: true },
  { name: 'Export data (JSON)', free: false, pro: true },
  { name: 'Trend analytics', free: false, pro: true },
]

export function Pricing() {
  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      {/* Nav */}
      <header className="border-b border-[var(--color-edge)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="font-semibold text-[var(--color-ink)] text-sm tracking-tight">
              {APP_NAME}
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/login" className="inline-flex items-center min-h-[44px] text-sm text-[var(--color-ink-body)] hover:text-[var(--color-ink)] transition-colors">
              Log In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-24">
        <h1 className="text-3xl font-bold text-[var(--color-ink)] text-center mb-3">
          Simple, transparent pricing
        </h1>
        <p className="text-[var(--color-ink-body)] text-center mb-12 max-w-lg mx-auto">
          Start free. Upgrade when you need unlimited products, history tracking, and advanced features.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 sm:mb-16">
          {/* Free */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-[var(--color-ink)] mb-1">Free</h2>
            <p className="text-sm text-[var(--color-ink-body)] mb-4">Perfect for getting started</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-[var(--color-ink)]">$0</span>
              <span className="text-sm text-[var(--color-ink-muted)]">/month</span>
            </div>
            <Link
              to="/signup"
              className="block w-full py-2.5 min-h-[44px] rounded-lg border border-[var(--color-edge)] text-center text-sm font-medium text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors mb-6"
            >
              Get Started Free
            </Link>
            <ul className="space-y-3">
              {FEATURES.map(f => (
                <li key={f.name} className="flex items-center gap-2.5 text-sm">
                  {f.free === true || typeof f.free === 'string' ? (
                    <Check size={14} className="text-[var(--color-accent)] shrink-0" />
                  ) : (
                    <X size={14} className="text-[var(--color-ink-muted)] shrink-0" />
                  )}
                  <span className={f.free ? 'text-[var(--color-ink-body)]' : 'text-[var(--color-ink-muted)]'}>
                    {f.name}
                    {typeof f.free === 'string' && <span className="text-xs text-[var(--color-ink-muted)] ml-1">({f.free})</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="bg-[var(--color-surface)] border-2 border-[var(--color-accent)] rounded-xl p-4 sm:p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[var(--color-accent)] text-white text-xs font-semibold">
              Recommended
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-ink)] mb-1">Pro</h2>
            <p className="text-sm text-[var(--color-ink-body)] mb-4">For serious solo founders</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-[var(--color-ink)]">$19</span>
              <span className="text-sm text-[var(--color-ink-muted)]">/month</span>
            </div>
            <Link
              to="/signup"
              className="block w-full py-2.5 min-h-[44px] rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] text-center text-sm font-medium hover:bg-[var(--color-btn-primary-hover)] transition-colors mb-6"
            >
              Start Free, Upgrade Later
            </Link>
            <ul className="space-y-3">
              {FEATURES.map(f => (
                <li key={f.name} className="flex items-center gap-2.5 text-sm">
                  <Check size={14} className="text-[var(--color-accent)] shrink-0" />
                  <span className="text-[var(--color-ink-body)]">
                    {f.name}
                    {typeof f.pro === 'string' && <span className="text-xs text-[var(--color-ink-muted)] ml-1">({f.pro})</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ-like note */}
        <div className="text-center">
          <p className="text-sm text-[var(--color-ink-muted)]">
            All plans include all 6 distribution engines. No credit card required to start.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-edge)] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--color-ink-muted)]">
            {APP_NAME} — Built by Predivo GmbH
          </p>
          <div className="flex items-center gap-4 text-xs text-[var(--color-ink-muted)]">
            <Link to="/" className="px-2 min-h-[44px] inline-flex items-center hover:text-[var(--color-ink-body)] transition-colors">Home</Link>
            <Link to="/login" className="px-2 min-h-[44px] inline-flex items-center hover:text-[var(--color-ink-body)] transition-colors">Log In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
