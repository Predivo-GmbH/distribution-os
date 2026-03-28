import { useState, useRef } from 'react'

interface Props {
  content: string
  children: React.ReactNode
}

export function Tooltip({ content, children }: Props) {
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  function show() {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setVisible(true), 200)
  }

  function hide() {
    clearTimeout(timeoutRef.current)
    setVisible(false)
  }

  return (
    <span
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <span
        className="border-b border-dotted border-[var(--color-ink-muted)] cursor-help"
        tabIndex={0}
        role="button"
        aria-describedby={visible ? `tooltip-${content.slice(0, 20).replace(/\s/g, '-')}` : undefined}
        onClick={() => setVisible(v => !v)}
      >
        {children}
      </span>
      {visible && (
        <span className="absolute z-50 bottom-full left-0 sm:left-1/2 sm:-translate-x-1/2 mb-2 w-[min(288px,calc(100vw-32px))] px-3.5 py-2.5 rounded-lg bg-[var(--color-ink)] text-[var(--color-surface-page)] text-xs leading-relaxed shadow-lg pointer-events-none">
          {content}
          <span className="absolute top-full left-4 sm:left-1/2 sm:-translate-x-1/2 -mt-px border-4 border-transparent border-t-[var(--color-ink)]" />
        </span>
      )}
    </span>
  )
}
