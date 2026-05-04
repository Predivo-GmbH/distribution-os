import { Sparkles } from 'lucide-react'
import type { Engine } from '@/types'
import { ENGINE_META } from '@/types'
import type { useAISuggest } from '@/hooks/useAISuggest'

interface Props {
  primaryEngine: Engine
  secondaryEngines: Engine[]
  onPrimaryChange: (e: Engine) => void
  onSecondaryToggle: (e: Engine) => void
  onNext: () => void
  onBack: () => void
  ai?: ReturnType<typeof useAISuggest>
}

const ENGINE_DESCRIPTIONS: Record<Engine, string> = {
  pull: 'Attract users organically through SEO, content marketing, and inbound strategies. Compounds over time.',
  push: 'Reach users directly through outbound — DMs, cold email, social posts, and "building in public" content.',
  bridge: 'Grow through partnerships, integrations, and co-marketing with complementary products.',
  search: 'Get discovered through paid ads, directories, and search engine optimization.',
  equity: 'Build long-term brand value through community engagement, testimonials, and referral programs.',
  persistence: 'Keep users engaged with lifecycle emails, onboarding sequences, and retention workflows.',
}

const ENGINES: Engine[] = ['pull', 'push', 'bridge', 'search', 'equity', 'persistence']

export function EngineSelect({ primaryEngine, secondaryEngines, onPrimaryChange, onSecondaryToggle, onNext, onBack, ai }: Props) {
  const aiPrimary = ai?.analysis?.primaryEngine
  const aiSecondary = ai?.analysis?.secondaryEngines ?? []
  const aiReasoning = ai?.analysis?.engineReasoning

  function handleApplyAI() {
    if (!aiPrimary) return
    onPrimaryChange(aiPrimary)
    // Apply secondary engines by toggling
    for (const eng of aiSecondary) {
      if (eng !== aiPrimary && !secondaryEngines.includes(eng)) {
        onSecondaryToggle(eng)
      }
    }
  }

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--color-accent-text)] mb-2">
        Step 4 of 5
      </p>
      <h2 className="text-2xl font-bold text-[var(--color-ink)] tracking-tight mb-2">
        Choose your distribution engines
      </h2>
      <p className="text-sm text-[var(--color-ink-body)] mb-5 sm:mb-8">
        Engines are the channels through which you distribute your product. Pick one primary engine to focus on, then optionally add secondary engines. Your weekly tasks will be generated based on these selections.
      </p>

      {/* AI recommendation banner */}
      {aiPrimary && (
        <button
          onClick={handleApplyAI}
          className="w-full mb-5 flex items-start gap-3 px-4 py-3 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent-light)] text-left transition-colors hover:border-[var(--color-accent)]/60"
        >
          <Sparkles size={14} className="text-[var(--color-accent-text)] shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--color-accent-text)]">
              AI suggests: {ENGINE_META[aiPrimary].label}
              {aiSecondary.length > 0 && (
                <span className="font-normal"> + {aiSecondary.map(e => ENGINE_META[e].label).join(', ')}</span>
              )}
            </p>
            {aiReasoning && (
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{aiReasoning}</p>
            )}
            <p className="text-[10px] text-[var(--color-ink-muted)] mt-1">Click to apply</p>
          </div>
        </button>
      )}

      {/* Primary engine */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-[var(--color-ink)] mb-3">Primary Engine</label>
        <div role="radiogroup" aria-label="Primary engine" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ENGINES.map(engine => (
            <button
              key={engine}
              role="radio"
              aria-checked={primaryEngine === engine}
              onClick={() => onPrimaryChange(engine)}
              className={`text-left px-4 py-3 min-h-[44px] rounded-2xl border transition-colors ${
                primaryEngine === engine
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]'
                  : 'border-[var(--color-edge)] hover:border-[var(--color-edge-outline)]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  aria-hidden="true"
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: ENGINE_META[engine].color }}
                />
                <span className="text-sm font-semibold text-[var(--color-ink)]">
                  {ENGINE_META[engine].label}
                </span>
                {aiPrimary === engine && primaryEngine !== engine && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-[var(--color-accent-text)] bg-[var(--color-accent-light)]">
                    <Sparkles size={8} />
                    AI pick
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                {ENGINE_DESCRIPTIONS[engine]}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Secondary engines */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Secondary Engines</label>
        <p className="text-xs text-[var(--color-ink-muted)] mb-3">Optional — add more to diversify your distribution mix.</p>
        <div className="flex flex-wrap gap-2">
          {ENGINES.filter(e => e !== primaryEngine).map(engine => (
            <button
              key={engine}
              onClick={() => onSecondaryToggle(engine)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-md text-xs font-medium border transition-colors ${
                secondaryEngines.includes(engine)
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)] text-[var(--color-accent-text)]'
                  : 'border-[var(--color-edge)] text-[var(--color-ink-muted)] hover:border-[var(--color-edge-outline)]'
              }`}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: ENGINE_META[engine].color }}
              />
              {ENGINE_META[engine].label}
              {aiSecondary.includes(engine) && !secondaryEngines.includes(engine) && (
                <Sparkles size={8} className="text-[var(--color-accent-text)]" />
              )}
            </button>
          ))}
        </div>
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
