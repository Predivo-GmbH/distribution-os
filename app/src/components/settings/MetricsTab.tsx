import type { AppState } from '@/types'

interface Props {
  state: AppState
}

const SCORING_TIERS = [
  { label: 'High-impact task', examples: 'SEO page, outreach campaign', pts: 5 },
  { label: 'Medium-impact task', examples: 'Social post, directory listing', pts: 3 },
  { label: 'Low-impact task', examples: 'Review, update existing asset', pts: 1 },
]

export function MetricsTab({ state }: Props) {
  const recentWeeks = [...state.weekHistory].reverse().slice(0, 4)

  return (
    <div className="space-y-6 sm:space-y-8">
      <p className="text-sm text-[var(--color-ink-body)]">
        Track your weekly distribution scoring and streaks across all products.
      </p>

      {/* Scoring Configuration */}
      <div>
        <h3 className="text-base font-semibold text-[var(--color-ink)] mb-4">Scoring Configuration</h3>
        <div className="space-y-2">
          {SCORING_TIERS.map(tier => (
            <div
              key={tier.pts}
              className="flex items-center justify-between px-4 py-3 rounded-lg border border-[var(--color-edge)] bg-[var(--color-surface)]"
            >
              <div>
                <p className="text-sm font-medium text-[var(--color-ink)]">{tier.label}</p>
                <p className="text-xs text-[var(--color-ink-muted)]">{tier.examples}</p>
              </div>
              <span className="text-sm font-mono font-semibold text-[var(--color-accent-text)] tabular-nums">
                +{tier.pts} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Streak History */}
      <div>
        <h3 className="text-base font-semibold text-[var(--color-ink)] mb-4">Weekly Streak History</h3>

        {recentWeeks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {recentWeeks.map(week => {
              const totalScore = week.tasks
                .filter(t => t.completed)
                .reduce((sum, t) => sum + t.score, 0)
              const maxScore = week.tasks.reduce((sum, t) => sum + t.score, 0)
              const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

              return (
                <div
                  key={week.id}
                  className={`rounded-2xl border p-4 text-center ${
                    pct >= 60
                      ? 'border-[var(--color-progress-success)]/30 bg-[var(--color-progress-success)]/5'
                      : 'border-[var(--color-edge)] bg-[var(--color-surface)]'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1">
                    {week.id}
                  </p>
                  <p className="text-2xl font-bold font-mono text-[var(--color-ink)] tabular-nums">
                    {totalScore}
                  </p>
                  <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                    {pct}% complete
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 rounded-2xl border border-dashed border-[var(--color-edge)] bg-[var(--color-surface)]">
            <p className="text-sm text-[var(--color-ink-muted)]">
              Complete your first week to see streak data.
            </p>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">
              Week history is recorded automatically when a new week starts.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
