import type { Engine, ProductStage } from '@/types'
import { ENGINE_META } from '@/types'
import { getTasksForProduct } from '@/data/task-templates'

interface Props {
  name: string
  stage: ProductStage
  primaryEngine: Engine
  secondaryEngines: Engine[]
  onLaunch: () => void
  onBack: () => void
}

export function MissionBriefing({ name, stage, primaryEngine, secondaryEngines, onLaunch, onBack }: Props) {
  const engines = [primaryEngine, ...secondaryEngines]
  const tasks = getTasksForProduct(stage, engines)

  // Group by engine
  const tasksByEngine = tasks.reduce((acc, t) => {
    if (!acc[t.engine]) acc[t.engine] = []
    acc[t.engine].push(t)
    return acc
  }, {} as Record<string, typeof tasks>)

  const totalScore = tasks.reduce((sum, t) => sum + t.score, 0)

  return (
    <div className="max-w-xl mx-auto py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--color-accent-text)] mb-2">
        Step 5 of 5
      </p>
      <h2 className="text-2xl font-bold text-[var(--color-ink)] tracking-tight mb-2">
        Your first mission briefing
      </h2>
      <p className="text-sm text-[var(--color-ink-body)] mb-6">
        Based on <strong>{name}</strong> being in the <strong>{stage}</strong> stage with{' '}
        {engines.length} active engine{engines.length > 1 ? 's' : ''}, here are the tasks
        generated for your first week:
      </p>

      {/* Task preview */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-5 mb-6 space-y-5">
        {Object.entries(tasksByEngine).map(([engine, engineTasks]) => (
          <div key={engine}>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: ENGINE_META[engine as Engine].color }}
              />
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] font-mono text-[var(--color-ink-muted)]">
                {ENGINE_META[engine as Engine].label}
              </span>
            </div>
            <div className="space-y-1">
              {engineTasks.map((task, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-ink)]"
                >
                  <div className="w-3.5 h-3.5 rounded border-2 border-[var(--color-edge-outline)] shrink-0" />
                  <span className="flex-1">{task.title}</span>
                  <span className="font-mono text-xs font-semibold text-[var(--color-ink-muted)] tabular-nums">
                    {task.score}pt
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-edge)]">
          <span className="text-sm text-[var(--color-ink-muted)]">{tasks.length} tasks this week</span>
          <span className="font-mono text-sm font-bold text-[var(--color-accent)] tabular-nums">
            {totalScore}pt possible
          </span>
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
          onClick={onLaunch}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-semibold text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors active:scale-[0.98]"
        >
          Launch Mission
        </button>
      </div>
    </div>
  )
}
