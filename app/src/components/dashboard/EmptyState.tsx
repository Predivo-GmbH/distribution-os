import { Package } from 'lucide-react'
import type { Action } from '@/hooks/useAppState'

interface Props {
  dispatch: React.Dispatch<Action>
}

export function EmptyState({ dispatch }: Props) {
  function handleAddDemo() {
    dispatch({
      type: 'ADD_PRODUCT',
      payload: {
        name: 'My SaaS Product',
        description: 'A sample product to get started',
        stage: 'early',
        primaryEngine: 'pull',
        secondaryEngines: ['push', 'bridge'],
        color: '#6366F1',
      },
    })
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-light)] flex items-center justify-center mb-6">
        <Package size={28} className="text-[var(--color-accent)]" strokeWidth={1.5} />
      </div>
      <h1 className="text-2xl font-semibold text-[var(--color-ink)] mb-2">
        Welcome to Distribution OS
      </h1>
      <p className="text-[var(--color-ink-body)] max-w-md mb-8">
        Your weekly command center for distribution. Add your first product to get started with structured, stage-aware tasks.
      </p>
      <button
        onClick={handleAddDemo}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors active:scale-[0.98]"
      >
        + Add Your First Product
      </button>
    </div>
  )
}
