import type { Engine } from '@/types'
import { ENGINE_META } from '@/types'

interface Props {
  primaryEngine: Engine
  secondaryEngines: Engine[]
  onPrimaryChange: (e: Engine) => void
  onSecondaryToggle: (e: Engine) => void
  onNext: () => void
  onBack: () => void
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

export function EngineSelect({ primaryEngine, secondaryEngines, onPrimaryChange, onSecondaryToggle, onNext, onBack }: Props) {
  return (
    <div className="max-w-xl mx-auto py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--color-accent-text)] mb-2">
        Step 4 of 5
      </p>
      <h2 className="text-2xl font-bold text-[var(--color-ink)] tracking-tight mb-2">
        Choose your distribution engines
      </h2>
      <p className="text-sm text-[var(--color-ink-body)] mb-8">
        Engines are the channels through which you distribute your product. Pick one primary engine to focus on, then optionally add secondary engines. Your weekly tasks will be generated based on these selections.
      </p>

      {/* Primary engine */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-[var(--color-ink)] mb-3">Primary Engine</label>
        <div className="grid grid-cols-2 gap-2">
          {ENGINES.map(engine => (
            <button
              key={engine}
              onClick={() => onPrimaryChange(engine)}
              className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                primaryEngine === engine
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]'
                  : 'border-[var(--color-edge)] hover:border-[var(--color-edge-outline)]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: ENGINE_META[engine].color }}
                />
                <span className="text-sm font-semibold text-[var(--color-ink)]">
                  {ENGINE_META[engine].label}
                </span>
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
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
            </button>
          ))}
        </div>
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
