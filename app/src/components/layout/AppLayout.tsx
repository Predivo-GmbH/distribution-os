import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { LayoutDashboard, Package, Settings, BookOpen, Inbox, Menu, X, Lightbulb, FileText, Rocket, Palette, FileEdit, Map, ClipboardCheck, Clock, Globe, Lock, LogOut } from 'lucide-react'
import type { Product } from '@/types'
import { ENGINE_META } from '@/types'
import { cn } from '@/lib/utils'
import { getPendingCount } from '@/lib/storage'
import { APP_NAME } from '@/lib/app-config'
import { Logo } from '@/components/shared/Logo'

interface Props {
  children: ReactNode
  products: Product[]
  showBriefingBadge?: boolean
  onboardingComplete?: boolean
  userEmail?: string
  onSignOut?: () => Promise<void>
}

const ONBOARDING_UNLOCKED = new Set(['/dashboard', '/products', '/settings'])

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inbox', icon: Inbox, label: 'Inbox' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/validate', icon: Lightbulb, label: 'Validate' },
  { to: '/brief', icon: FileText, label: 'Brief' },
  { to: '/setup', icon: Rocket, label: 'Setup' },
  { to: '/build-kit', icon: Palette, label: 'Build Kit' },
  { to: '/proposals', icon: FileEdit, label: 'Proposals' },
  { to: '/playbooks', icon: Map, label: 'Playbooks' },
  { to: '/audit', icon: ClipboardCheck, label: 'Audit' },
  { to: '/schedule', icon: Clock, label: 'Schedule' },
  { to: '/analyze', icon: Globe, label: 'Analyze' },
]

export function AppLayout({ children, products, showBriefingBadge, onboardingComplete = true, userEmail, onSignOut }: Props) {
  const [inboxCount, setInboxCount] = useState(() => getPendingCount())
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Poll inbox count every 30s
  useEffect(() => {
    const interval = setInterval(() => setInboxCount(getPendingCount()), 30000)
    return () => clearInterval(interval)
  }, [])

  // Close sidebar on Escape key
  useEffect(() => {
    if (!sidebarOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen])

  // Collect active engines from all products
  const activeEngines = [...new Set(products.flatMap(p => [p.primaryEngine, ...p.secondaryEngines]))]

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-[var(--color-edge)]">
        <div className="flex items-center gap-2.5">
          <Logo />
          <span className="font-bold text-[var(--color-ink)] text-sm tracking-tight">
            {APP_NAME}
          </span>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Primary navigation */}
      <nav className="flex flex-col gap-0.5 px-3 py-4" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const locked = !onboardingComplete && !ONBOARDING_UNLOCKED.has(to)

          if (locked) {
            return (
              <div
                key={to}
                className="group flex items-center gap-2.5 px-3 py-2 min-h-[44px] rounded-xl text-sm opacity-35 cursor-not-allowed select-none"
                title="Complete setup to unlock"
              >
                <Icon size={16} strokeWidth={1.5} className="shrink-0" />
                {label}
                <Lock size={10} className="ml-auto text-[var(--color-ink-muted)]" />
              </div>
            )
          }

          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-2.5 px-3 py-2 min-h-[44px] rounded-xl text-sm transition-all duration-200',
                  isActive
                    ? 'bg-[var(--color-accent-light)] text-[var(--color-accent-text)] font-medium'
                    : 'text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)]'
                )
              }
            >
              <Icon size={16} strokeWidth={1.5} className="shrink-0" />
              {label}
              {label === 'Inbox' && inboxCount > 0 && (
                <span className="ml-auto px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[var(--color-accent)] text-white leading-none tabular-nums">
                  {inboxCount}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Engine section */}
      {activeEngines.length > 0 && (
        <div className="px-3 py-2">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-ink-muted)]">
            Active Engines
          </p>
          <div className="flex flex-col gap-0.5">
            {activeEngines.map(engine => (
              <div
                key={engine}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm text-[var(--color-ink-body)]"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ENGINE_META[engine].color,
                    boxShadow: `0 0 8px ${ENGINE_META[engine].color}40`,
                  }}
                />
                {ENGINE_META[engine].label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* User account */}
      {userEmail && (
        <div className="px-3 pb-2">
          <div className="border-t border-[var(--color-edge)] pt-3">
            <div className="flex items-center gap-2.5 px-3 py-2">
              <div className="w-7 h-7 rounded-full bg-[var(--color-accent)] flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white leading-none">
                  {userEmail[0].toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-[var(--color-ink-body)] truncate flex-1" title={userEmail}>
                {userEmail}
              </span>
              {onSignOut && (
                <button
                  onClick={async () => { await onSignOut(); window.location.href = '/login' }}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-error)] transition-colors"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resources + Settings section */}
      <div className="px-3 pb-4">
        <div className="border-t border-[var(--color-edge)] pt-3 mb-1">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-ink-muted)]">
            Resources
          </p>
        </div>
        <NavLink
          to="/briefing"
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 px-3 py-2 min-h-[44px] rounded-xl text-sm transition-all duration-200',
              isActive
                ? 'bg-[var(--color-accent-light)] text-[var(--color-accent-text)] font-medium'
                : 'text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)]'
            )
          }
        >
          <BookOpen size={16} strokeWidth={1.5} />
          Briefing Room
          {showBriefingBadge && (
            <span className="ml-auto px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-gradient-to-r from-indigo-500 to-violet-500 text-white leading-none">
              NEW
            </span>
          )}
        </NavLink>
        <NavLink
          to="/settings"
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 px-3 py-2 min-h-[44px] rounded-xl text-sm transition-all duration-200',
              isActive
                ? 'bg-[var(--color-accent-light)] text-[var(--color-accent-text)] font-medium'
                : 'text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)]'
            )
          }
        >
          <Settings size={16} strokeWidth={1.5} />
          Settings
        </NavLink>
      </div>
    </>
  )

  return (
    <div className="flex min-h-dvh">
      {/* Skip to content */}
      <a href="#app-main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--color-accent)] focus:text-white focus:rounded-lg focus:font-semibold focus:text-sm">Skip to content</a>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[var(--sidebar-width)] shrink-0 bg-[var(--color-surface-sidebar)] border-r border-[var(--color-edge)] flex-col backdrop-blur-xl">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        role="dialog"
        aria-modal={sidebarOpen}
        aria-label="Sidebar navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[280px] bg-[var(--color-surface-page)] border-r border-[var(--color-edge)] flex flex-col transition-transform duration-200 md:hidden backdrop-blur-xl',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Main content */}
      <main id="app-main-content" className="flex-1 min-w-0 overflow-y-auto">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-[var(--color-edge)] bg-[var(--color-surface-page)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <Logo />
          <span className="font-bold text-[var(--color-ink)] text-sm tracking-tight">
            {APP_NAME}
          </span>
        </div>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
