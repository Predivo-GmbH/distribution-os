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
    <div className="bg-[var(--color-accent-light)] border border-[var(--color-edge)] rounded-xl overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center gap-2.5 px-4 sm:px-5 py-3.5 text-left hover:bg-[var(--color-accent-light)] transition-colors"
      >
        <Lightbulb size={15} className="text-[var(--color-accent)] shrink-0" />
        <span className="text-sm font-medium text-[var(--color-accent-text)] flex-1">
          {title}
        </span>
        <ChevronDown
          size={14}
          className={`text-[var(--color-accent)] transition-transform duration-200 ${
            collapsed ? '-rotate-90' : ''
          }`}
        />
      </button>
      {!collapsed && (
        <div className="px-4 sm:px-5 pb-4 pt-0 text-sm text-[var(--color-ink-body)] leading-relaxed">
          {children}
        </div>
      )}
    </div>
  )
}
