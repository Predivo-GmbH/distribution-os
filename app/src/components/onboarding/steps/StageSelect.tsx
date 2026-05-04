import { Sparkles } from 'lucide-react'
import type { ProductStage } from '@/types'
import type { useAISuggest } from '@/hooks/useAISuggest'

interface Props {
  stage: ProductStage
  onStageChange: (s: ProductStage) => void
  onNext: () => void
  onBack: () => void
  ai?: ReturnType<typeof useAISuggest>
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

export function StageSelect({ stage, onStageChange, onNext, onBack, ai }: Props) {
  const aiStage = ai?.analysis?.stage
  const aiReasoning = ai?.analysis?.stageReasoning

  function handleApplyAI() {
    if (aiStage) onStageChange(aiStage)
  }

  return (
    <div className="max-w-lg mx-auto py-6 sm:py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--color-accent-text)] mb-2">
        Step 3 of 5
      </p>
      <h2 className="text-2xl font-bold text-[var(--color-ink)] tracking-tight mb-2">
        What stage is your product in?
      </h2>
      <p className="text-sm text-[var(--color-ink-body)] mb-8">
        Your stage determines which distribution tasks are most relevant right now. You can change this later as your product grows.
      </p>

      {/* AI recommendation banner */}
      {aiStage && (
        <button
          onClick={handleApplyAI}
          className="w-full mb-4 flex items-start gap-3 px-4 py-3 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent-light)] text-left transition-colors hover:border-[var(--color-accent)]/60"
        >
          <Sparkles size={14} className="text-[var(--color-accent-text)] shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--color-accent-text)]">
              AI suggests: {STAGES.find(s => s.value === aiStage)?.label}
            </p>
            {aiReasoning && (
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{aiReasoning}</p>
            )}
            <p className="text-[10px] text-[var(--color-ink-muted)] mt-1">Click to apply</p>
          </div>
        </button>
      )}

      <div role="radiogroup" aria-label="Product stage" className="space-y-2 mb-8">
        {STAGES.map(s => (
          <button
            key={s.value}
            role="radio"
            aria-checked={stage === s.value}
            onClick={() => onStageChange(s.value)}
            className={`w-full text-left px-4 py-3.5 min-h-[44px] rounded-2xl border transition-colors ${
              stage === s.value
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]'
                : 'border-[var(--color-edge)] hover:border-[var(--color-edge-outline)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
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
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[var(--color-ink)]">{s.label}</p>
                  {aiStage === s.value && stage !== s.value && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-[var(--color-accent-text)] bg-[var(--color-accent-light)]">
                      <Sparkles size={8} />
                      AI pick
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{s.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="px-4 py-2.5 min-h-[44px] rounded-lg border border-[var(--color-edge)] text-sm text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors active:scale-[0.98]"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
