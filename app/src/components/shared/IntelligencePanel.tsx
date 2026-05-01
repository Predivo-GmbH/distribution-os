import { useState } from 'react'
import { ChevronDown, Lightbulb } from 'lucide-react'

interface Props {
  id: string
  title: string
  children: React.ReactNode
}

const STORAGE_PREFIX = 'dos-panels-'

function isCollapsed(id: string): boolean {
  try {
    return localStorage.getItem(STORAGE_PREFIX + id) === 'collapsed'
  } catch {
    return false
  }
}

export function IntelligencePanel({ id, title, children }: Props) {
  const [collapsed, setCollapsed] = useState(() => isCollapsed(id))

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(STORAGE_PREFIX + id, next ? 'collapsed' : 'expanded')
  }

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[200px] h-[100px] bg-indigo-500/[0.06] blur-[60px] rounded-full pointer-events-none" />
      <button
        onClick={toggle}
        className="w-full flex items-center gap-2.5 px-4 sm:px-5 py-3.5 text-left hover:bg-indigo-500/[0.04] transition-colors relative"
      >
        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
          <Lightbulb size={14} className="text-indigo-400" />
        </div>
        <span className="text-sm font-medium text-[var(--color-accent-text)] flex-1">
          {title}
        </span>
        <ChevronDown
          size={14}
          className={`text-[var(--color-accent-muted)] transition-transform duration-200 ${
            collapsed ? '-rotate-90' : ''
          }`}
        />
      </button>
      {!collapsed && (
        <div className="px-4 sm:px-5 pb-4 pt-0 text-sm text-[var(--color-ink-body)] leading-relaxed relative">
          {children}
        </div>
      )}
    </div>
  )
}
