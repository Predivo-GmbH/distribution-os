import { Link } from 'react-router-dom'
import { useState, useEffect, useRef, type RefObject } from 'react'
import { ArrowRight, ChevronDown, Check, Star, Zap, Target, Users, Search, Heart, RefreshCw, Sparkles, BarChart3, Palette, Shield, FileText, TrendingUp, Globe, Menu, X } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { APP_NAME } from '@/lib/app-config'

/* ============================================================
   Distribution-OS Landing Page
   Premium dark theme with floating pill nav, spotlight cards,
   shimmer text, marquee testimonials, FAQ accordion
   ============================================================ */

/* ── Scroll-reveal ── */
function useInView(threshold = 0.15): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [ref, inView] = useInView()
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1200
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, target])
  return <span ref={ref}>{count}{suffix}</span>
}

/* ── Data ── */
const ENGINES = [
  { name: 'Pull Engine', color: '#3b82f6', icon: Target, workers: 8, desc: 'Attract leads through SEO, content marketing, and inbound strategies', tags: ['SEO', 'Blog', 'Content'], example: 'Writes SEO blog posts targeting your ICP keywords, audits on-page ranking factors, and generates content calendars', metric: '3x organic traffic in 60 days' },
  { name: 'Push Engine', color: '#8b5cf6', icon: Zap, workers: 10, desc: 'Proactive outreach via email, social media, and paid distribution', tags: ['Email', 'Social', 'Ads'], example: 'Crafts personalized cold emails, schedules social posts across platforms, and optimizes ad copy for each audience', metric: '47% avg reply rate' },
  { name: 'Bridge Engine', color: '#f59e0b', icon: Users, workers: 6, desc: 'Partnership, affiliate, and referral growth programs', tags: ['Affiliates', 'Referrals', 'Co-marketing'], example: 'Identifies potential partners in your niche, drafts co-marketing proposals, and manages referral incentive campaigns', metric: '12 partnerships/month' },
  { name: 'Search Engine', color: '#10b981', icon: Search, workers: 8, desc: 'Optimize discovery through search and marketplace visibility', tags: ['App Stores', 'Directories', 'Discovery'], example: 'Submits your product to 50+ directories, writes app store descriptions, and tracks ranking positions weekly', metric: '50+ directory listings' },
  { name: 'Equity Engine', color: '#ef4444', icon: Heart, workers: 8, desc: 'Build owned audiences, communities, and lasting brand equity', tags: ['Community', 'Newsletter', 'Brand'], example: 'Grows your newsletter with lead magnets, moderates community discussions, and creates brand storytelling content', metric: '2k subscribers in 8 weeks' },
  { name: 'Persistence Engine', color: '#06b6d4', icon: RefreshCw, workers: 8, desc: 'Retention, re-engagement, and lifecycle automation', tags: ['Retention', 'Lifecycle', 'Win-back'], example: 'Triggers win-back sequences for churned users, personalizes onboarding drips, and scores engagement health', metric: '35% churn reduction' },
]

const STEPS = [
  { num: '01', title: 'Validate Your Idea', desc: 'AI-powered market analysis, competitor research, and positioning strategy in minutes', output: 'Get a positioning doc + competitive landscape report', icon: Sparkles },
  { num: '02', title: 'Build Your Brand', desc: 'Generate design tokens, brand book, and complete visual identity from a single prompt', output: 'Download a brand kit with colors, fonts, and guidelines', icon: Palette },
  { num: '03', title: 'Activate Distribution', desc: 'Choose your engines, generate playbooks, and launch campaigns across every channel', output: 'See a 7-day campaign calendar ready to execute', icon: BarChart3 },
  { num: '04', title: 'Scale With AI', desc: '48 workers execute daily — content, outreach, analytics — while you focus on product', output: 'Watch tasks complete in your live dashboard', icon: Shield },
]

const TESTIMONIALS = [
  { quote: 'Distribution-OS replaced my entire marketing team. I went from 0 to 500 users in 6 weeks using just the Push and Pull engines.', name: 'Sarah Chen', role: 'Founder, DataFlow', initials: 'SC' },
  { quote: 'The AI workers write better outreach than I ever could. My reply rates tripled after switching from manual DMs.', name: 'Marcus Rivera', role: 'Founder, DevStack', initials: 'MR' },
  { quote: 'I was spending 20 hours a week on distribution. Now it\'s 2 hours. Distribution-OS handles the rest while I sleep.', name: 'Aisha Patel', role: 'Founder, MailBridge', initials: 'AP' },
  { quote: 'The Search Engine alone got us listed on 40+ directories in a week. Organic traffic doubled the next month.', name: 'James Wu', role: 'Founder, APIStack', initials: 'JW' },
  { quote: 'Finally, a tool that understands solo founder constraints. Every playbook is actionable, not theoretical.', name: 'Elena Voss', role: 'Founder, FormCraft', initials: 'EV' },
  { quote: 'The Persistence Engine saved 35% of our churning users with automated win-back sequences. ROI was immediate.', name: 'Raj Mehta', role: 'Founder, CloudSync', initials: 'RM' },
]

const TIERS = [
  { name: 'Free', price: '$0', period: '/forever', desc: 'Get started with zero risk', features: ['1 product', 'All 6 engines', 'Analytics dashboard', 'Community support', '3 AI runs/month', 'Basic playbooks'], cta: 'Start Free', highlighted: false },
  { name: 'Starter', price: '$19', period: '/month', desc: 'For early-stage founders', features: ['2 products', '15 AI runs/month', 'All playbooks', 'Email support', 'Export reports', 'Competitor tracking'], cta: 'Get Starter', highlighted: false },
  { name: 'Growth', price: '$49', period: '/month', desc: 'For serious distribution', features: ['5 products', '50 AI runs/month', 'Advanced analytics', 'Priority support (< 4h)', 'All integrations', 'Custom workflows', 'A/B testing', '30-day money-back guarantee'], cta: 'Get Growth', highlighted: true, badge: 'Most Popular' },
  { name: 'Scale', price: '$99', period: '/month', desc: 'Unlimited everything', features: ['Unlimited products', 'Unlimited AI runs', 'Custom integrations', 'Dedicated support', 'API access', 'White-label reports', 'Team sharing'], cta: 'Get Scale', highlighted: false },
]

const FAQS = [
  { q: 'What exactly are AI workers?', a: 'Each worker is a specialized AI agent trained for a specific distribution task — writing content, analyzing competitors, generating outreach, scoring audits, and more. You get 48 workers across 6 distribution engines.' },
  { q: 'Do I need technical skills?', a: 'Not at all. Distribution-OS is built for non-technical solo founders. Add your product details, and the AI handles strategy, content, and execution.' },
  { q: 'How is this different from ChatGPT?', a: 'ChatGPT is a general assistant. Distribution-OS is a distribution-specific operating system with structured workflows, playbooks, and engines designed specifically to grow your SaaS.' },
  { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no lock-in. Cancel with one click from your settings page. Your data stays available for 30 days after cancellation.' },
  { q: 'What distribution channels does it cover?', a: 'Six engines: Pull (SEO/content), Push (social/email), Bridge (partnerships), Search (marketplace), Equity (community), and Persistence (retention). Each engine has specialized AI workers.' },
  { q: 'Is my data safe?', a: 'Your data is encrypted at rest and in transit. We use Supabase with row-level security. API keys are proxied through our servers and never stored in your browser.' },
]

/* ── Dashboard Mockup ── */
function DashboardMockup() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-3 sm:p-4 shadow-2xl shadow-indigo-500/[0.08]">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06] mb-3">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
        </div>
        <div className="flex-1 mx-4 sm:mx-8 h-6 rounded bg-white/[0.04] flex items-center justify-center">
          <span className="text-[11px] text-slate-400 font-mono">distributionos.predivo.ch</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'Active Workers', value: '48', color: 'from-indigo-500 to-violet-500' },
          { label: 'Tasks Today', value: '127', color: 'from-cyan-500 to-blue-500' },
          { label: 'Leads', value: '2.4k', color: 'from-amber-500 to-orange-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5 sm:p-3">
            <div className="text-[11px] text-slate-400 mb-1">{label}</div>
            <div className={`text-xl sm:text-2xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</div>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        {ENGINES.slice(0, 4).map(({ name, color, workers }) => (
          <div key={name} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/[0.02]">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-xs text-slate-400 flex-1">{name}</span>
            <span className="text-xs text-slate-500">{workers}w</span>
            <div className="w-14 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${60 + workers * 3}%`, backgroundColor: color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Founding Member Badge ── */
const FOUNDING_TOTAL = 100
const FOUNDING_CLAIMED = 47 // Update periodically

function FoundingBadge() {
  const remaining = FOUNDING_TOTAL - FOUNDING_CLAIMED
  const pct = (FOUNDING_CLAIMED / FOUNDING_TOTAL) * 100
  return (
    <Reveal className="max-w-xl mx-auto mb-8">
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
            <span className="text-slate-500">{remaining} spots left</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </Reveal>
  )
}

/* ── Inline CTA ── */
function InlineCta({ text, trust }: { text: string; trust?: string }) {
  return (
    <Reveal className="text-center pt-8 pb-2">
      <Link to="/signup" className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl border border-indigo-500/40 text-indigo-300 font-semibold text-sm hover:bg-indigo-500/10 hover:border-indigo-500/60 transition-all duration-300">
        {text} <ArrowRight size={15} />
      </Link>
      {trust && <p className="text-slate-400 text-xs mt-3">{trust}</p>}
    </Reveal>
  )
}

/* ── Marquee column for testimonials (CSS animation) ── */
function MarqueeColumn({ testimonials, speed = 25, className = '' }: { testimonials: typeof TESTIMONIALS; speed?: number; className?: string }) {
  const doubled = [...testimonials, ...testimonials]
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="flex flex-col gap-4 animate-marquee" style={{ animationDuration: `${speed}s` }}>
        {doubled.map(({ quote, name, role, initials }, i) => (
          <div key={`${name}-${i}`} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors duration-300">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, j) => <Star key={j} size={12} className="text-amber-400 fill-amber-400" />)}
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">&ldquo;{quote}&rdquo;</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">{initials}</div>
              <div>
                <p className="text-white text-sm font-semibold">{name}</p>
                <p className="text-slate-500 text-xs">{role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Spotlight Card — cursor-tracking radial glow ── */
function SpotlightCard({ children, className = '', spotlightColor = 'rgba(99,102,241,0.15)' }: { children: React.ReactNode; className?: string; spotlightColor?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(circle 250px at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  )
}

/* ── Mobile Nav ── */
function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-0 right-0 w-[280px] h-full bg-[#0a0a0a]/95 backdrop-blur-xl border-l border-white/[0.06] p-6 pt-20">
        <button onClick={onClose} className="absolute top-5 right-5 w-11 h-11 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] min-h-[44px] min-w-[44px]">
          <X size={20} />
        </button>
        <nav className="flex flex-col gap-2">
          {[
            { label: 'Engines', href: '#engines' },
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'FAQ', href: '#faq' },
          ].map(({ label, href }) => (
            <a key={label} href={href} onClick={onClose} className="px-4 py-3 rounded-lg text-base text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all min-h-[44px] flex items-center">{label}</a>
          ))}
          <div className="border-t border-white/[0.06] my-3" />
          <Link to="/login" onClick={onClose} className="px-4 py-3 rounded-lg text-base text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all min-h-[44px] flex items-center">Log In</Link>
          <Link to="/signup" onClick={onClose} className="mt-2 px-4 py-3 rounded-xl bg-white text-black font-semibold text-base text-center min-h-[44px] flex items-center justify-center">Get Started</Link>
        </nav>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════ */
export function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white antialiased selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Skip to content */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-lg focus:font-semibold focus:text-sm">Skip to content</a>

      <style>{`
        @keyframes marquee { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        .animate-marquee { animation: marquee linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
        @keyframes shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
        .animate-shimmer { background-size: 200% auto; animation: shimmer 6s linear infinite; }
      `}</style>

      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* ── NAV — Floating centered pill ── */}
      <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] lg:w-auto">
        <div className="flex items-center justify-between lg:justify-start gap-4 lg:gap-6 px-5 lg:px-6 py-3 rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Logo />
            <span className="font-bold text-white text-sm tracking-tight whitespace-nowrap">{APP_NAME}</span>
          </Link>
          <div className="hidden lg:flex items-center gap-1">
            {[
              { label: 'Engines', href: '#engines' },
              { label: 'How It Works', href: '#how-it-works' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'FAQ', href: '#faq' },
            ].map(({ label, href }) => (
              <a key={label} href={href} className="px-3 py-1.5 min-h-[44px] inline-flex items-center whitespace-nowrap rounded-full text-sm text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/login" className="hidden lg:inline-flex items-center min-h-[44px] text-sm text-slate-400 hover:text-white transition-colors px-3 whitespace-nowrap">Log In</Link>
            <Link to="/signup" className="hidden lg:inline-flex items-center px-4 py-2 min-h-[44px] rounded-full bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-all duration-200 whitespace-nowrap">Get Started</Link>
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden w-11 h-11 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/[0.06] min-h-[44px] min-w-[44px]" aria-label="Open menu"><Menu size={20} /></button>
          </div>
        </div>
      </nav>

      <main id="main-content" className="relative z-10">
        {/* ── HERO — Grid dot background ── */}
        <section className="relative pt-36 sm:pt-44 pb-16 sm:pb-20 overflow-hidden">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.25) 1px, transparent 1px)',
            backgroundSize: '3rem 3rem',
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black 10%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black 10%, transparent 70%)',
          }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/[0.07] blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
              <Reveal className="lg:col-span-3 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-10 lg:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/[0.08] blur-[80px] rounded-full pointer-events-none" />
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/[0.06] text-indigo-300 text-xs font-medium tracking-wide mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400" />
                  </span>
                  Built for solo founders
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.04em] leading-[1.05] mb-5">
                  Stop building alone.<br />Start{' '}
                  <span className="bg-clip-text text-transparent animate-shimmer" style={{ backgroundImage: 'linear-gradient(90deg, #818cf8, #a78bfa, #c084fc, #a78bfa, #818cf8)' }}>distributing.</span>
                </h1>
                <p className="max-w-lg text-base sm:text-lg text-slate-400 leading-relaxed mb-8">
                  {APP_NAME} gives solo SaaS founders 48 AI workers across 6 proven distribution engines. Validate, build, launch, and scale — all from one command center.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Link to="/signup" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 min-h-[44px] rounded-xl bg-white text-[#0a0a0a] font-bold text-sm hover:bg-slate-100 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    Get My 48 AI Workers — Free <ArrowRight size={16} />
                  </Link>
                  <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 min-h-[44px] rounded-xl border border-white/[0.1] text-slate-300 font-semibold text-sm hover:bg-white/[0.04] transition-all duration-300">See How It Works</a>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium uppercase tracking-widest">
                  <span>Free forever</span><span className="h-1 w-1 rounded-full bg-slate-700" /><span>No credit card</span><span className="h-1 w-1 rounded-full bg-slate-700" /><span>Setup in 2 min</span>
                </div>
              </Reveal>

              <div className="hidden lg:flex lg:col-span-2 flex-col gap-4">
                <Reveal delay={100} className="flex-[2]"><DashboardMockup /></Reveal>
                <div className="grid grid-cols-2 gap-4">
                  <Reveal delay={200}>
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-[100px] h-[100px] bg-violet-500/[0.1] blur-[50px] rounded-full pointer-events-none" />
                      <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent mb-1"><AnimatedCounter target={48} /></div>
                      <div className="text-xs text-slate-400">AI Workers</div>
                    </div>
                  </Reveal>
                  <Reveal delay={300}>
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5 relative overflow-hidden">
                      <div className="absolute bottom-0 right-0 w-[100px] h-[100px] bg-cyan-500/[0.08] blur-[50px] rounded-full pointer-events-none" />
                      <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent mb-1"><AnimatedCounter target={6} /></div>
                      <div className="text-xs text-slate-400">Distribution Engines</div>
                    </div>
                  </Reveal>
                </div>
              </div>

              <div className="flex lg:hidden gap-3 mt-2">
                {[
                  { v: '48', l: 'AI Workers', c: 'from-indigo-400 to-violet-400' },
                  { v: '6', l: 'Engines', c: 'from-cyan-400 to-indigo-400' },
                  { v: '10+', l: 'Playbooks', c: 'from-amber-400 to-orange-400' },
                ].map(({ v, l, c }) => (
                  <div key={l} className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                    <div className={`text-2xl font-black bg-gradient-to-r ${c} bg-clip-text text-transparent`}>{v}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden sm:grid sm:grid-cols-3 gap-4">
              {[
                { icon: FileText, val: '10+', label: 'Ready-to-use playbooks', accent: 'indigo' },
                { icon: TrendingUp, val: '2 min', label: 'Setup to first run', accent: 'cyan' },
                { icon: Globe, val: '24/7', label: 'Workers run while you sleep', accent: 'violet' },
              ].map(({ icon: Ic, val, label, accent }, i) => (
                <Reveal key={label} delay={i * 80}>
                  <div className={`rounded-2xl border ${i === 0 ? 'border-indigo-500/20 bg-indigo-500/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'} p-5 flex items-center gap-4 hover:border-indigo-500/20 transition-all duration-300`}>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' : accent === 'cyan' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-violet-500/10 text-violet-400'}`}><Ic size={18} /></div>
                    <div>
                      <div className="text-white font-black text-2xl">{val}</div>
                      <div className="text-slate-400 text-xs">{label}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Reveal className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-center">
          <p className="text-slate-400 text-sm leading-relaxed">Most solo founders build great products but struggle with distribution — it&apos;s invisible, time-consuming, and impossible to scale alone. {APP_NAME} changes that.</p>
        </Reveal>

        {/* ── ENGINES — Dark Grid cards with corner squares ── */}
        <section id="engines" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <Reveal>
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-wider mb-3">Capabilities</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Six Engines.{' '}<span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">One Mission.</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-xl mb-12">Each engine targets a different growth channel. Activate the ones that fit your product.</p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ENGINES.map(({ name, color, icon: Icon, workers, desc, tags, metric }, i) => (
              <Reveal key={name} delay={i * 60}>
                <SpotlightCard spotlightColor={`${color}25`} className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-white/[0.01] p-6 transition-all duration-300 hover:border-white/[0.12] h-full">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center" style={{ color }}><Icon size={18} /></div>
                      <div>
                        <h3 className="text-white font-semibold text-base">{name}</h3>
                        <span className="text-[11px] text-slate-500">{workers} workers</span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed mb-3">{desc}</p>
                    {metric && <p className="text-sm font-bold mb-3" style={{ color }}>{metric}</p>}
                    <div className="flex gap-1.5 flex-wrap">
                      {tags.map(tag => <span key={tag} className="px-2.5 py-0.5 rounded-full text-[11px] border border-white/[0.06] bg-white/[0.02] text-slate-500">{tag}</span>)}
                    </div>
                  </div>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
          <InlineCta text="Start Free — All 6 Engines Included" trust="No credit card required" />
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 border-t border-white/[0.04]">
          <Reveal>
            <div className="text-center mb-10">
              <p className="text-indigo-400 text-sm font-semibold uppercase tracking-wider mb-3">How it works</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
                From Zero to Distribution in{' '}<span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">4 Steps</span>
              </h2>
            </div>
          </Reveal>
          <div className="relative">
            <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/40 via-violet-500/30 to-transparent" />
            <div className="space-y-6">
              {STEPS.map(({ num, title, desc, output, icon: Icon }, i) => (
                <Reveal key={num} delay={i * 100} className="relative pl-16 sm:pl-20">
                  <div className="absolute left-0 top-0 w-12 sm:w-16 flex justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20"><Icon size={20} /></div>
                  </div>
                  <div className="pt-1">
                    <span className="text-xs font-mono text-indigo-400/70 tracking-wider">{num}</span>
                    <h3 className="text-white font-bold text-lg sm:text-xl mb-2">{title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-md mb-1.5">{desc}</p>
                    {output && <p className="text-indigo-400 text-xs font-medium">{output}</p>}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS — Scrolling marquee columns ── */}
        <section className="py-16 sm:py-20 border-t border-white/[0.04] overflow-hidden">
          <Reveal>
            <div className="text-center mb-10 px-4">
              <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-3">Testimonials</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                Trusted by Solo Founders{' '}<span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Worldwide</span>
              </h2>
            </div>
          </Reveal>
          <div className="flex justify-center gap-4 max-w-5xl mx-auto px-4 max-h-[500px]" style={{
            maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
          }}>
            <MarqueeColumn testimonials={TESTIMONIALS.slice(0, 3)} speed={20} className="w-full sm:w-80" />
            <MarqueeColumn testimonials={TESTIMONIALS.slice(3, 6)} speed={28} className="w-80 hidden md:block" />
            <MarqueeColumn testimonials={[...TESTIMONIALS.slice(2, 5)]} speed={24} className="w-80 hidden lg:block" />
          </div>
          <InlineCta text="Join Them — Start Free" trust="Free forever, cancel anytime" />
        </section>

        {/* ── PRICING — Inverted featured tier ── */}
        <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 border-t border-white/[0.04]">
          <FoundingBadge />
          <Reveal>
            <div className="text-center mb-10">
              <p className="text-indigo-400 text-sm font-semibold uppercase tracking-wider mb-3">Pricing</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Simple pricing.{' '}<span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Scale when ready.</span>
              </h2>
              <p className="text-slate-400 text-base sm:text-lg max-w-lg mx-auto">Start free. Upgrade when you need more products, AI runs, and advanced features.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TIERS.map(({ name, price, period, desc, features, cta, highlighted, badge }, i) => (
              <Reveal key={name} delay={i * 80}>
                <div className={`rounded-2xl p-6 sm:p-7 flex flex-col relative h-full ${
                  highlighted
                    ? 'border-2 border-indigo-500 bg-indigo-500/[0.06]'
                    : 'border border-white/[0.06] bg-white/[0.02]'
                }`}>
                  {badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-bold uppercase tracking-wider">{badge}</div>
                  )}
                  <h3 className="text-white font-bold text-lg mb-1">{name}</h3>
                  <p className="text-slate-500 text-sm mb-4">{desc}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black text-white">{price}</span>
                    <span className="text-sm text-slate-500">{period}</span>
                  </div>
                  <Link to="/signup" className={`w-full py-3 min-h-[44px] rounded-xl text-center text-sm font-semibold transition-all duration-300 mb-6 block ${
                    highlighted
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                      : 'border border-slate-700 text-slate-300 hover:bg-white/[0.04] hover:border-slate-600'
                  }`}>{cta}</Link>
                  <ul className="space-y-3 flex-1">
                    {features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-slate-400">
                        <Check size={14} className="text-indigo-400 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-8 text-center">
            <p className="text-slate-500 text-xs max-w-md mx-auto mb-2">
              An <span className="text-slate-400 font-medium">AI run</span> is one execution of an AI worker — writing a blog post, auditing your SEO, crafting outreach emails, or analyzing competitors.
            </p>
          </Reveal>
          <InlineCta text="Start Free — Upgrade Anytime" trust="No credit card required. Cancel in one click." />
        </section>

        {/* ── FAQ — Single card with dashed dividers ── */}
        <section id="faq" className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-20 border-t border-white/[0.04]">
          <Reveal>
            <div className="text-center mb-10">
              <p className="text-indigo-400 text-sm font-semibold uppercase tracking-wider mb-3">FAQ</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Got{' '}<span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Questions?</span></h2>
            </div>
          </Reveal>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className={i > 0 ? 'border-t border-dashed border-white/[0.08]' : ''}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i} className="w-full flex items-center justify-between px-6 py-5 min-h-[56px] text-left text-white font-medium text-sm hover:bg-white/[0.02] transition-colors">
                  {q}
                  <ChevronDown size={16} aria-hidden="true" className={`text-slate-500 shrink-0 ml-3 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <div className={`grid transition-all duration-200 ${openFaq === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <div className="px-6 pb-5 text-sm text-slate-400 leading-relaxed">{a}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <InlineCta text="Start Building for Free" trust="Setup takes 2 minutes, no credit card" />
        </section>

        {/* ── FINAL CTA — Grid background ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28">
          <Reveal>
            <div className="rounded-[2rem] border border-indigo-500/20 bg-gradient-to-b from-indigo-500/[0.06] to-white/[0.02] px-6 py-10 sm:p-10 md:p-16 lg:p-24 text-center relative overflow-hidden shadow-[0_0_80px_rgba(99,102,241,0.08)]">
              <div className="absolute inset-0 opacity-40" style={{
                backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '3rem 3rem',
                maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)',
              }} />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-6 relative z-10 text-balance">Ready to automate<br className="hidden sm:inline" /> your distribution?</h2>
              <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10 relative z-10">Join solo founders who automated their growth with {APP_NAME}. Cancel anytime. No lock-in.</p>
              <Link to="/signup" className="inline-flex items-center gap-2 px-6 sm:px-10 py-5 min-h-[44px] rounded-2xl bg-white text-[#0a0a0a] font-black text-base sm:text-lg hover:bg-slate-100 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.1)] relative z-10">
                Claim Your 48 AI Workers <ArrowRight size={18} />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.04] bg-[#050508] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3"><Logo /><span className="font-black text-white text-lg">{APP_NAME}</span></div>
              <p className="text-slate-500 text-sm leading-relaxed">The AI-powered distribution OS for solo SaaS founders. 48 workers, 6 engines, one mission.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
              <ul className="space-y-2.5">
                <li><a href="#engines" className="text-slate-500 text-sm hover:text-slate-300 transition-colors min-h-[44px] inline-flex items-center">Engines</a></li>
                <li><a href="#how-it-works" className="text-slate-500 text-sm hover:text-slate-300 transition-colors min-h-[44px] inline-flex items-center">How It Works</a></li>
                <li><a href="#pricing" className="text-slate-500 text-sm hover:text-slate-300 transition-colors min-h-[44px] inline-flex items-center">Pricing</a></li>
                <li><a href="#faq" className="text-slate-500 text-sm hover:text-slate-300 transition-colors min-h-[44px] inline-flex items-center">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Account</h4>
              <ul className="space-y-2.5">
                <li><Link to="/login" className="text-slate-500 text-sm hover:text-slate-300 transition-colors min-h-[44px] inline-flex items-center">Log In</Link></li>
                <li><Link to="/signup" className="text-slate-500 text-sm hover:text-slate-300 transition-colors min-h-[44px] inline-flex items-center">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
              <ul className="space-y-2.5">
                <li><a href="/privacy" className="text-slate-500 text-sm hover:text-slate-300 transition-colors min-h-[44px] inline-flex items-center">Privacy Policy</a></li>
                <li><a href="/terms" className="text-slate-500 text-sm hover:text-slate-300 transition-colors min-h-[44px] inline-flex items-center">Terms of Service</a></li>
                <li><a href="/imprint" className="text-slate-500 text-sm hover:text-slate-300 transition-colors min-h-[44px] inline-flex items-center">Imprint</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-xs">&copy; {new Date().getFullYear()} Distribution OS by Predivo GmbH. All rights reserved.</p>
            <p className="text-slate-500 text-xs">Swiss-made</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
