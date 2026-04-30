import { Link } from 'react-router-dom'
import { Check, Star } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { APP_NAME } from '@/lib/app-config'

const FOUNDING_TOTAL = 100
const FOUNDING_CLAIMED = 47

const TIERS = [
  { name: 'Free', price: '$0', period: '/forever', desc: 'Get started with zero risk', features: ['1 product', 'All 6 engines', 'Analytics dashboard', 'Community support', '3 AI runs/month', 'Basic playbooks'], cta: 'Start Free', highlighted: false },
  { name: 'Starter', price: '$19', period: '/month', desc: 'For early-stage founders', features: ['2 products', '15 AI runs/month', 'All playbooks', 'Email support', 'Export reports', 'Competitor tracking'], cta: 'Get Starter', highlighted: false },
  { name: 'Growth', price: '$49', period: '/month', desc: 'For serious distribution', features: ['5 products', '50 AI runs/month', 'Advanced analytics', 'Priority support (< 4h)', 'All integrations', 'Custom workflows', 'A/B testing', '30-day money-back guarantee'], cta: 'Get Growth', highlighted: true, badge: 'Most Popular' },
  { name: 'Scale', price: '$99', period: '/month', desc: 'Unlimited everything', features: ['Unlimited products', 'Unlimited AI runs', 'Custom integrations', 'Dedicated support', 'API access', 'White-label reports', 'Team sharing'], cta: 'Get Scale', highlighted: false },
]

export function Pricing() {
  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white antialiased">
      {/* Nav */}
      <header className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="font-bold text-white text-sm tracking-tight">{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="inline-flex items-center min-h-[44px] text-sm text-slate-400 hover:text-white transition-colors px-3">
              Log In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-24">
        {/* Founding Member Badge */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5 sm:p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[100px] bg-amber-500/[0.06] blur-[60px] rounded-full pointer-events-none" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-3">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              Founding Member Pricing
            </div>
            <p className="text-white font-semibold text-sm mb-1">Lock in launch prices forever</p>
            <p className="text-slate-400 text-xs mb-4">First {FOUNDING_TOTAL} members keep their price — even when we raise it.</p>
            <div className="max-w-xs mx-auto">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-amber-300 font-medium">{FOUNDING_CLAIMED} claimed</span>
                <span className="text-slate-500">{FOUNDING_TOTAL - FOUNDING_CLAIMED} spots left</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000" style={{ width: `${(FOUNDING_CLAIMED / FOUNDING_TOTAL) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white text-center tracking-tight mb-4">
          Simple pricing.{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Scale when ready.</span>
        </h1>
        <p className="text-slate-400 text-center mb-14 max-w-lg mx-auto text-base sm:text-lg">
          Start free. Upgrade when you need more products, AI runs, and advanced features.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {TIERS.map(({ name, price, period, desc, features, cta, highlighted, badge }) => (
            <div
              key={name}
              className={`rounded-2xl p-6 sm:p-7 flex flex-col relative ${
                highlighted
                  ? 'border-2 border-indigo-500 bg-indigo-500/[0.06]'
                  : 'border border-white/[0.06] bg-white/[0.02]'
              }`}
            >
              {badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-bold uppercase tracking-wider">
                  {badge}
                </div>
              )}
              <h3 className="text-white font-bold text-lg mb-1">{name}</h3>
              <p className="text-slate-500 text-sm mb-4">{desc}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-white">{price}</span>
                <span className="text-sm text-slate-500">{period}</span>
              </div>
              <Link
                to="/signup"
                className={`w-full py-3 min-h-[44px] rounded-xl text-center text-sm font-semibold transition-all duration-300 mb-6 block ${
                  highlighted
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                    : 'border border-slate-700 text-slate-300 hover:bg-white/[0.04] hover:border-slate-600'
                }`}
              >
                {cta}
              </Link>
              <ul className="space-y-3 flex-1">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-400">
                    <Check size={14} className="text-indigo-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="text-center">
          <p className="text-sm text-slate-500">
            All plans include all 6 distribution engines. No credit card required to start.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] bg-[#050508]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            {APP_NAME} &mdash; Built by Predivo GmbH
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/" className="px-2 min-h-[44px] inline-flex items-center text-slate-500 hover:text-slate-300 transition-colors">Home</Link>
            <Link to="/login" className="px-2 min-h-[44px] inline-flex items-center text-slate-500 hover:text-slate-300 transition-colors">Log In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
