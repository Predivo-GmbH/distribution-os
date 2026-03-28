import { useState } from 'react'
import { Zap, BookOpen, Key, Link2, Play, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react'
import type { AppState, Product } from '@/types'
import { ENGINE_META } from '@/types'
import { KnowledgeBaseTab } from '@/components/settings/KnowledgeBaseTab'
import { AIConfigTab } from '@/components/settings/AIConfigTab'
import { IntegrationsTab } from '@/components/settings/IntegrationsTab'
import { SchedulerTab } from '@/components/settings/SchedulerTab'
import { hasKnowledgeBase } from '@/lib/storage'
import { isAIConfigured } from '@/lib/ai/config'
import { loadSchedulerConfig, saveSchedulerConfig, schedulerTick } from '@/lib/ai/scheduler'
import { executeWorker } from '@/hooks/useScheduler'

interface Props {
  state: AppState
  onComplete: () => void
}

type Step = 1 | 2 | 3 | 4 | 5

const STEPS = [
  { num: 1, label: 'Products', icon: CheckCircle2, estimate: '~ already done' },
  { num: 2, label: 'Knowledge Base', icon: BookOpen, estimate: '~ 20 min' },
  { num: 3, label: 'AI Config', icon: Key, estimate: '~ 2 min' },
  { num: 4, label: 'Integrations', icon: Link2, estimate: '~ 15 min' },
  { num: 5, label: 'First Run', icon: Play, estimate: '~ 1 min' },
] as const

export function SetupSprint({ state, onComplete }: Props) {
  const [step, setStep] = useState<Step>(1)
  const [firstRunStatus, setFirstRunStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [artifactCount, setArtifactCount] = useState(0)

  const kbConfigured = state.products.some(p => hasKnowledgeBase(p.id))
  const aiConfigured = isAIConfigured()

  function canProceed(s: Step): boolean {
    switch (s) {
      case 1: return state.products.length > 0
      case 2: return true // KB is strongly recommended but not blocking
      case 3: return true // AI config is recommended but not blocking
      case 4: return true // Integrations are optional
      case 5: return true
      default: return true
    }
  }

  function next() {
    if (step < 5) setStep((step + 1) as Step)
  }

  function back() {
    if (step > 1) setStep((step - 1) as Step)
  }

  async function handleFirstRun() {
    if (!aiConfigured) {
      // Skip first run, just complete
      onComplete()
      return
    }

    setFirstRunStatus('running')

    try {
      // Enable scheduler temporarily for first run
      const config = loadSchedulerConfig()
      const wasEnabled = config.enabled
      if (!wasEnabled) {
        saveSchedulerConfig({ ...config, enabled: true })
      }

      const ran = await schedulerTick(state.products, executeWorker)
      setArtifactCount(ran)

      // Restore scheduler state if it wasn't enabled
      if (!wasEnabled) {
        saveSchedulerConfig({ ...config, enabled: false })
      }

      setFirstRunStatus('done')
    } catch {
      setFirstRunStatus('error')
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 sm:mb-8">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)] flex items-center justify-center">
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)] tracking-tight">Setup Sprint</h1>
          <p className="text-sm text-[var(--color-ink-muted)]">Get your AI automation running in under an hour</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-5 sm:mb-8 overflow-x-auto">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const isActive = s.num === step
          const isDone = s.num < step
          return (
            <div key={s.num} className="flex items-center">
              <button
                onClick={() => s.num <= step && setStep(s.num as Step)}
                className={`flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-[var(--color-accent-light)] text-[var(--color-accent-text)] font-medium'
                    : isDone
                      ? 'text-[var(--color-success)] hover:bg-[var(--color-surface-hover)]'
                      : 'text-[var(--color-ink-muted)]'
                }`}
              >
                {isDone
                  ? <CheckCircle2 size={14} />
                  : <Icon size={14} />
                }
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.num}</span>
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight size={14} className="text-[var(--color-ink-muted)] mx-0.5" />
              )}
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[var(--color-progress-track)] rounded-full mb-5 sm:mb-8 overflow-hidden">
        <div
          className="h-full bg-[var(--color-accent)] transition-all duration-300 ease-out rounded-full"
          style={{ width: `${((step - 1) / 4) * 100}%` }}
        />
      </div>

      {/* Step content */}
      {step === 1 && (
        <StepWrapper
          title="Step 1: Confirm your products"
          description="You've already registered your products. Confirm they look correct before we continue."
          onNext={next}
          canProceed={canProceed(1)}
        >
          <div className="space-y-3">
            {state.products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <p className="text-xs text-[var(--color-ink-muted)] mt-4">
            Need to change something? You can edit products anytime in Settings.
          </p>
        </StepWrapper>
      )}

      {step === 2 && (
        <StepWrapper
          title="Step 2: Fill in the Knowledge Base"
          description="This is the most important step. The Knowledge Base teaches the AI your voice, your customer, and your positioning. Better input = dramatically better output."
          onNext={next}
          onBack={back}
          canProceed={canProceed(2)}
          nextLabel={kbConfigured ? 'Next' : 'Skip for now'}
          hint={!kbConfigured ? 'You can always fill this in later from Settings > Knowledge Base.' : undefined}
        >
          <KnowledgeBaseTab state={state} />
        </StepWrapper>
      )}

      {step === 3 && (
        <StepWrapper
          title="Step 3: Connect your AI"
          description="Enter your Anthropic API key. This enables all 24 AI workers to generate content for you."
          onNext={next}
          onBack={back}
          canProceed={canProceed(3)}
          nextLabel={aiConfigured ? 'Next' : 'Skip for now'}
          hint={!aiConfigured ? 'Without an API key, AI generation won\'t work. You can add it later in Settings > AI Configuration.' : undefined}
        >
          <AIConfigTab />
        </StepWrapper>
      )}

      {step === 4 && (
        <StepWrapper
          title="Step 4: Connect integrations"
          description="Integrations enable autonomous publishing. All are optional — without them, the AI still generates content and you publish manually."
          onNext={next}
          onBack={back}
          canProceed={canProceed(4)}
          nextLabel="Next"
        >
          <IntegrationsTab />
        </StepWrapper>
      )}

      {step === 5 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-ink)] tracking-tight mb-1">
              Step 5: Review scheduler & launch
            </h2>
            <p className="text-sm text-[var(--color-ink-muted)]">
              Review the default schedule, then trigger your first batch of AI-generated artifacts.
            </p>
          </div>

          <SchedulerTab />

          {/* First Run section */}
          <div className="bg-[var(--color-surface)] border-2 border-[var(--color-accent)]/30 rounded-xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Play size={18} className="text-[var(--color-accent)]" />
              <h3 className="text-base font-semibold text-[var(--color-ink)]">First Run</h3>
            </div>
            <p className="text-sm text-[var(--color-ink-body)]">
              {aiConfigured
                ? 'Trigger all scheduled workers now. Generated artifacts will appear in the Inbox for you to review, edit, and approve. This calibrates the AI with your first round of feedback.'
                : 'AI is not configured yet. You can skip the first run and complete setup. Come back to Settings > AI Configuration to add your API key later.'
              }
            </p>

            {firstRunStatus === 'idle' && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={back}
                  className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-lg border border-[var(--color-edge)] text-sm text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <ArrowLeft size={14} className="inline mr-1" />
                  Back
                </button>
                {aiConfigured ? (
                  <button
                    onClick={handleFirstRun}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-semibold text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors active:scale-[0.98]"
                  >
                    <Play size={14} />
                    Run All Workers Now
                  </button>
                ) : (
                  <button
                    onClick={onComplete}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-semibold text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors active:scale-[0.98]"
                  >
                    Complete Setup
                  </button>
                )}
                {aiConfigured && (
                  <button
                    onClick={onComplete}
                    className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
                  >
                    Skip first run
                  </button>
                )}
              </div>
            )}

            {firstRunStatus === 'running' && (
              <div className="flex items-center gap-3 text-sm text-[var(--color-ink-body)]">
                <div className="w-4 h-4 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
                Running all scheduled workers... This may take a few minutes.
              </div>
            )}

            {firstRunStatus === 'done' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-[var(--color-success)]">
                  <CheckCircle2 size={16} />
                  First run complete! {artifactCount > 0 ? `${artifactCount} artifact${artifactCount !== 1 ? 's' : ''} generated.` : 'Workers executed.'}
                </div>
                <p className="text-sm text-[var(--color-ink-body)]">
                  Head to the Inbox to review, edit, and approve your first batch of AI-generated content.
                </p>
                <button
                  onClick={onComplete}
                  className="inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-semibold text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors active:scale-[0.98]"
                >
                  Go to Inbox
                  <ChevronRight size={14} />
                </button>
              </div>
            )}

            {firstRunStatus === 'error' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-[var(--color-error)]">
                  Some workers encountered errors. Check the Inbox for any generated artifacts.
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onComplete}
                    className="inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-semibold text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors active:scale-[0.98]"
                  >
                    Continue to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ============================================================
   Sub-components
   ============================================================ */

function StepWrapper({
  title,
  description,
  children,
  onNext,
  onBack,
  canProceed,
  nextLabel = 'Next',
  hint,
}: {
  title: string
  description: string
  children: React.ReactNode
  onNext: () => void
  onBack?: () => void
  canProceed: boolean
  nextLabel?: string
  hint?: string
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--color-ink)] tracking-tight mb-1">{title}</h2>
        <p className="text-sm text-[var(--color-ink-muted)]">{description}</p>
      </div>

      {children}

      <div className="flex items-center gap-3 pt-2">
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2.5 min-h-[44px] rounded-lg border border-[var(--color-edge)] text-sm text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <ArrowLeft size={14} className="inline mr-1" />
            Back
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-semibold text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {nextLabel}
          <ChevronRight size={14} />
        </button>
        {hint && (
          <span className="text-xs text-[var(--color-ink-muted)]">{hint}</span>
        )}
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const engines = [product.primaryEngine, ...product.secondaryEngines]
  const configured = hasKnowledgeBase(product.id)

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">{product.name}</h3>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
              style={{ color: ENGINE_META[product.primaryEngine].color, backgroundColor: ENGINE_META[product.primaryEngine].lightBg }}
            >
              {product.stage.replace('-', ' ')}
            </span>
          </div>
          {product.description && (
            <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{product.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {engines.map(engine => (
              <span key={engine} className="flex items-center gap-1 text-[10px] text-[var(--color-ink-muted)]">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ENGINE_META[engine].color }} />
                {ENGINE_META[engine].label}
              </span>
            ))}
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
          configured
            ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
            : 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]'
        }`}>
          {configured ? 'KB ready' : 'KB needed'}
        </span>
      </div>
    </div>
  )
}
