import { useEffect } from 'react'
import { Zap, CheckCircle2, BookOpen, Key, Link2, Play } from 'lucide-react'

interface Props {
  productName: string
  onDismiss: () => void
}

const STEPS = [
  { icon: CheckCircle2, label: 'Confirm your product', time: 'Done', done: true },
  { icon: BookOpen, label: 'Add knowledge base', time: '~20 min' },
  { icon: Key, label: 'Connect your AI', time: '~2 min' },
  { icon: Link2, label: 'Set up integrations', time: '~15 min' },
  { icon: Play, label: 'Run your first worker', time: '~1 min' },
]

export function WelcomeModal({ productName, onDismiss }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onDismiss])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onDismiss}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-[var(--color-edge)] bg-[var(--color-surface-page)] p-6 sm:p-8 shadow-2xl"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to Distribution-OS"
      >
        {/* Ambient glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-indigo-500/[0.08] blur-[80px] rounded-full pointer-events-none" />

        <div className="relative space-y-6">
          {/* Icon + heading */}
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
              <Zap size={24} className="text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight">
              Welcome to Distribution-OS!
            </h2>
            <p className="text-sm text-[var(--color-ink-muted)] mt-1">
              <strong className="text-[var(--color-ink)]">{productName}</strong> is ready. Let's set up your distribution system.
            </p>
          </div>

          {/* Setup plan */}
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-ink-muted)] mb-3">
              Your 5-step setup plan
            </p>
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    step.done
                      ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                      : 'bg-[var(--color-accent-light)] text-[var(--color-accent-text)]'
                  }`}>
                    <Icon size={14} />
                  </div>
                  <span className={`flex-1 text-sm ${step.done ? 'text-[var(--color-ink-muted)] line-through' : 'text-[var(--color-ink)]'}`}>
                    {step.label}
                  </span>
                  <span className={`text-xs tabular-nums ${step.done ? 'text-[var(--color-success)]' : 'text-[var(--color-ink-muted)]'}`}>
                    {step.time}
                  </span>
                </div>
              )
            })}
          </div>

          {/* CTA */}
          <button
            onClick={onDismiss}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:from-indigo-500 hover:to-violet-500 transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20"
          >
            Let's Go
          </button>

          <p className="text-center text-xs text-[var(--color-ink-muted)]">
            Takes about 2 minutes to get your first AI run
          </p>
        </div>
      </div>
    </div>
  )
}
