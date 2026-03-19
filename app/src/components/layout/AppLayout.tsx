import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { LayoutDashboard, Package, Settings, BookOpen, Inbox, Menu, X } from 'lucide-react'
import type { Product } from '@/types'
import { ENGINE_META } from '@/types'
import { cn } from '@/lib/utils'
import { getPendingCount } from '@/lib/storage'

interface Props {
  children: ReactNode
  products: Product[]
  showBriefingBadge?: boolean
}

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inbox', icon: Inbox, label: 'Inbox' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function AppLayout({ children, products, showBriefingBadge }: Props) {
  const [inboxCount, setInboxCount] = useState(() => getPendingCount())
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Poll inbox count every 30s
  useEffect(() => {
    const interval = setInterval(() => setInboxCount(getPendingCount()), 30000)
    return () => clearInterval(interval)
  }, [])

  // Collect active engines from all products
  const activeEngines = [...new Set(products.flatMap(p => [p.primaryEngine, ...p.secondaryEngines]))]

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-14 border-b border-[var(--color-edge)]">
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
        {/* Close button — mobile only */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Primary navigation */}
      <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-[var(--color-accent-light)] text-[var(--color-accent-text)] font-medium'
                  : 'text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)]'
              )
            }
          >
            <Icon size={16} strokeWidth={1.5} />
            {label}
            {label === 'Inbox' && inboxCount > 0 && (
              <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--color-accent)] text-white leading-none tabular-nums">
                {inboxCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Engine section */}
      {activeEngines.length > 0 && (
        <div className="px-3 py-2">
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--color-ink-muted)]">
            Engines
          </p>
          <div className="flex flex-col gap-0.5">
            {activeEngines.map(engine => (
              <div
                key={engine}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--color-ink-body)]"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: ENGINE_META[engine].color }}
                />
                {ENGINE_META[engine].label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Resources section */}
      <div className="px-3 pb-4">
        <div className="border-t border-[var(--color-edge)] pt-3 mb-1">
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--color-ink-muted)]">
            Resources
          </p>
        </div>
        <NavLink
          to="/briefing"
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
              isActive
                ? 'bg-[var(--color-accent-light)] text-[var(--color-accent-text)] font-medium'
                : 'text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)]'
            )
          }
        >
          <BookOpen size={16} strokeWidth={1.5} />
          Briefing Room
          {showBriefingBadge && (
            <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--color-accent)] text-white leading-none">
              NEW
            </span>
          )}
        </NavLink>
      </div>
    </>
  )

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[var(--sidebar-width)] shrink-0 bg-[var(--color-surface-sidebar)] border-r border-[var(--color-edge)] flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[280px] bg-[var(--color-surface-sidebar)] border-r border-[var(--color-edge)] flex flex-col transition-transform duration-200 md:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-[var(--color-edge)] bg-[var(--color-surface-sidebar)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold text-[var(--color-ink)] text-sm tracking-tight">
            Distribution OS
          </span>
        </div>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
