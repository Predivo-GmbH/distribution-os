import { ENGINE_META } from '@/types'
import type { Engine } from '@/types'
import { TASK_TEMPLATES } from '@/data/task-templates'

const ENGINES: Engine[] = ['pull', 'push', 'bridge', 'search', 'equity', 'persistence']

export function TasksTab() {
  const templatesByEngine = ENGINES.map(engine => ({
    engine,
    templates: TASK_TEMPLATES.filter(t => t.engine === engine),
  }))

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--color-ink-body)]">
        Manage the default task templates for each distribution engine. Tasks are automatically generated weekly based on your product stage and active engines.
      </p>

      {templatesByEngine.map(({ engine, templates }) => (
        <div key={engine}>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: ENGINE_META[engine].color }}
            />
            <span className="text-sm font-semibold text-[var(--color-ink)]">
              {ENGINE_META[engine].label} Engine Tasks
            </span>
            <span className="text-xs text-[var(--color-ink-muted)]">
              ({templates.length} template{templates.length !== 1 ? 's' : ''})
            </span>
          </div>

          <div className="space-y-1">
            {templates.map((template, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-[var(--color-edge)] bg-[var(--color-surface)]"
              >
                <span className="text-sm text-[var(--color-ink)]">{template.title}</span>
                <span className="text-xs font-mono font-semibold text-[var(--color-ink-muted)] tabular-nums shrink-0 ml-4">
                  +{template.score} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
