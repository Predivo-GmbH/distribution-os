import type { ProductStage } from '@/types'

interface Props {
  stage: ProductStage
  onStageChange: (s: ProductStage) => void
  onNext: () => void
  onBack: () => void
}

const STAGES: { value: ProductStage; label: string; desc: string }[] = [
  {
    value: 'pre-launch',
    label: 'Pre-Launch',
    desc: 'You\'re still building. No paying users yet, but you want to build anticipation and validate demand.',
  },
  {
    value: 'early',
    label: 'Early',
    desc: 'You\'ve launched and have your first users. Now you need repeatable channels to grow.',
  },
  {
    value: 'active',
    label: 'Active',
    desc: 'You have consistent traffic and revenue. Time to diversify channels and optimize.',
  },
  {
    value: 'scaling',
    label: 'Scaling',
    desc: 'You\'re growing fast. Focus on compounding returns, retention, and partnerships.',
  },
]

export function StageSelect({ stage, onStageChange, onNext, onBack }: Props) {
  return (
    <div className="max-w-lg mx-auto py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--color-accent-text)] mb-2">
        Step 3 of 5
      </p>
      <h2 className="text-2xl font-bold text-[var(--color-ink)] tracking-tight mb-2">
        What stage is your product in?
      </h2>
      <p className="text-sm text-[var(--color-ink-body)] mb-8">
        Your stage determines which distribution tasks are most relevant right now. You can change this later as your product grows.
      </p>

      <div className="space-y-2 mb-8">
        {STAGES.map(s => (
          <button
            key={s.value}
            onClick={() => onStageChange(s.value)}
            className={`w-full text-left px-4 py-3.5 rounded-xl border transition-colors ${
              stage === s.value
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]'
                : 'border-[var(--color-edge)] hover:border-[var(--color-edge-outline)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  stage === s.value
                    ? 'border-[var(--color-accent)]'
                    : 'border-[var(--color-edge-outline)]'
                }`}
              >
                {stage === s.value && (
                  <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-ink)]">{s.label}</p>
                <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{s.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-lg border border-[var(--color-edge)] text-sm text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
