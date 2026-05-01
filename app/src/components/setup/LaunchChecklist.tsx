import { useState, useEffect } from 'react'
import { PageMeta } from '@/components/shared/PageMeta'
import { APP_NAME } from '@/lib/app-config'
import { Check, Copy, ChevronDown, ChevronRight, Rocket, Globe, Database, Mail, CreditCard, GitBranch, Key, Server } from 'lucide-react'

interface CheckItem {
  id: string
  label: string
  hint: string
}

interface Category {
  key: string
  label: string
  icon: React.ElementType
  items: CheckItem[]
}

const CATEGORIES: Category[] = [
  {
    key: 'domain', label: 'Domain & Hosting', icon: Globe,
    items: [
      { id: 'domain-register', label: 'Register domain', hint: 'Buy your .com/.io domain from Namecheap, Cloudflare, or similar.' },
      { id: 'domain-dns', label: 'Configure DNS', hint: 'Point A/CNAME records to your hosting provider.' },
      { id: 'domain-ssl', label: 'SSL certificate active', hint: 'Verify HTTPS works on your domain.' },
    ],
  },
  {
    key: 'supabase', label: 'Supabase', icon: Database,
    items: [
      { id: 'sb-project', label: 'Create Supabase project', hint: 'Create a new project at supabase.com. Note the project URL and anon key.' },
      { id: 'sb-auth', label: 'Enable email auth', hint: 'Settings > Auth > Enable email/password sign-in.' },
      { id: 'sb-rls', label: 'Verify RLS policies', hint: 'All tables should have Row Level Security enabled.' },
      { id: 'sb-migrations', label: 'Run migrations', hint: 'Apply all SQL migrations from /supabase/migrations/.' },
    ],
  },
  {
    key: 'smtp', label: 'Email (SMTP)', icon: Mail,
    items: [
      { id: 'smtp-provider', label: 'Set up SMTP provider', hint: 'Metanet, SendGrid, Resend, or similar. Get host, port, username, password.' },
      { id: 'smtp-edge', label: 'Deploy send-auth-email function', hint: 'Edge function for transactional auth emails (OTP, password reset).' },
      { id: 'smtp-test', label: 'Test email delivery', hint: 'Send a test email and verify it arrives (check spam folder).' },
    ],
  },
  {
    key: 'stripe', label: 'Stripe Payments', icon: CreditCard,
    items: [
      { id: 'stripe-account', label: 'Activate Stripe account', hint: 'Complete Stripe onboarding with business details.' },
      { id: 'stripe-products', label: 'Create products & prices', hint: 'Set up Starter/Growth/Scale products with monthly prices.' },
      { id: 'stripe-webhook', label: 'Configure webhook', hint: 'Point webhook to your checkout edge function endpoint.' },
      { id: 'stripe-portal', label: 'Enable customer portal', hint: 'Let users manage subscriptions via Stripe-hosted portal.' },
    ],
  },
  {
    key: 'cicd', label: 'CI/CD Pipeline', icon: GitBranch,
    items: [
      { id: 'ci-repo', label: 'Push to GitHub', hint: 'Create a private repo and push your code.' },
      { id: 'ci-secrets', label: 'Set GitHub secrets', hint: 'FTP_HOST, FTP_USER, FTP_PASS, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, etc.' },
      { id: 'ci-workflow', label: 'Verify deploy workflow', hint: 'Push to main and confirm GitHub Actions deploys successfully.' },
    ],
  },
  {
    key: 'env', label: 'Environment Variables', icon: Server,
    items: [
      { id: 'env-local', label: 'Create .env.local', hint: 'Copy .env.example and fill in your values.' },
      { id: 'env-ci', label: 'Set CI env vars', hint: 'All VITE_* vars must be available in the GitHub Actions build step.' },
      { id: 'env-edge', label: 'Set edge function secrets', hint: 'supabase secrets set STRIPE_SECRET_KEY=... ANTHROPIC_API_KEY=... etc.' },
    ],
  },
  {
    key: 'ai', label: 'AI Configuration', icon: Key,
    items: [
      { id: 'ai-key', label: 'Set Anthropic API key', hint: 'Set ANTHROPIC_API_KEY as Supabase edge function secret for the call-ai proxy.' },
      { id: 'ai-test', label: 'Test AI generation', hint: 'Run a worker and verify the response comes back correctly.' },
    ],
  },
]

const STORAGE_KEY = 'distribution-os-launch-checklist'

function loadChecked(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch { return {} }
}

export function LaunchChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>(loadChecked)
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    CATEGORIES.forEach(c => { init[c.key] = true })
    return init
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked))
  }, [checked])

  function toggle(id: string) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function toggleCategory(key: string) {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const totalItems = CATEGORIES.reduce((sum, c) => sum + c.items.length, 0)
  const completedItems = Object.values(checked).filter(Boolean).length
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  function generateEnvTemplate() {
    const template = [
      '# .env.local — Generated by Launch Checklist',
      '# Fill in your values below',
      '',
      '# Supabase',
      'VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co',
      'VITE_SUPABASE_ANON_KEY=your-anon-key',
      '',
      '# Stripe',
      'VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...',
      '',
      '# App',
      'VITE_APP_URL=https://your-domain.com',
      'VITE_PASSWORD_GATE_DISABLED=true',
    ].join('\n')
    navigator.clipboard.writeText(template)
  }

  return (
    <div className="space-y-6">
      <PageMeta title={`Setup — ${APP_NAME}`} noindex />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)] tracking-tight">Launch Checklist</h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">Everything you need before going live.</p>
        </div>
        <button
          onClick={generateEnvTemplate}
          className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-lg text-xs font-medium border border-[var(--color-edge)] bg-[var(--color-surface)] text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          <Copy size={12} />
          Copy .env template
        </button>
      </div>

      {/* Progress bar */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">{completedItems} of {totalItems} completed</span>
          <span className="text-sm font-semibold text-[var(--color-accent-text)]">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--color-surface-hover)] overflow-hidden">
          <div className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        {progress === 100 && (
          <div className="flex items-center gap-2 mt-3 text-sm text-[var(--color-success)] font-medium">
            <Rocket size={14} />
            Ready to launch!
          </div>
        )}
      </div>

      {/* Categories */}
      {CATEGORIES.map(({ key, label, icon: Icon, items }) => {
        const catCompleted = items.filter(i => checked[i.id]).length
        return (
          <div key={key} className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleCategory(key)}
              className="w-full flex items-center justify-between px-4 sm:px-5 py-3 min-h-[44px] text-left hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon size={16} className="text-[var(--color-accent-text)]" />
                <span className="text-sm font-semibold text-[var(--color-ink)]">{label}</span>
                <span className="text-xs text-[var(--color-ink-muted)]">{catCompleted}/{items.length}</span>
              </div>
              {expanded[key] ? <ChevronDown size={14} className="text-[var(--color-ink-muted)]" /> : <ChevronRight size={14} className="text-[var(--color-ink-muted)]" />}
            </button>
            {expanded[key] && (
              <div className="border-t border-[var(--color-edge)]">
                {items.map(item => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 px-4 sm:px-5 py-3 min-h-[44px] cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors border-b border-[var(--color-edge)] last:border-b-0"
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${checked[item.id] ? 'bg-[var(--color-accent)] border-[var(--color-accent)]' : 'border-[var(--color-edge)]'}`}>
                      {checked[item.id] && <Check size={12} className="text-white" />}
                    </div>
                    <input type="checkbox" checked={!!checked[item.id]} onChange={() => toggle(item.id)} className="sr-only" />
                    <div>
                      <span className={`text-sm ${checked[item.id] ? 'line-through text-[var(--color-ink-muted)]' : 'text-[var(--color-ink)]'}`}>{item.label}</span>
                      <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{item.hint}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
