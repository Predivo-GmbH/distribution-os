import { Sparkles, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { useAISuggest } from '@/hooks/useAISuggest'

interface Props {
  name: string
  description: string
  onNameChange: (v: string) => void
  onDescriptionChange: (v: string) => void
  onNext: () => void
  onBack: () => void
  ai?: ReturnType<typeof useAISuggest>
}

export function ProductName({ name, description, onNameChange, onDescriptionChange, onNext, onBack, ai }: Props) {
  async function handleAISuggest() {
    if (!ai || !name.trim()) return
    const result = await ai.analyze(name, description)
    if (result?.description && !description.trim()) {
      onDescriptionChange(result.description)
    }
  }

  return (
    <div className="max-w-lg mx-auto py-6 sm:py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--color-accent-text)] mb-2">
        Step 2 of 5
      </p>
      <h2 className="text-2xl font-bold text-[var(--color-ink)] tracking-tight mb-2">
        Name your product
      </h2>
      <p className="text-sm text-[var(--color-ink-body)] mb-8">
        What SaaS product are you distributing? This is what you're building and selling — each product gets its own set of weekly distribution tasks.
      </p>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Product Name</label>
          <Input
            value={name}
            onChange={e => onNameChange(e.target.value)}
            placeholder="e.g. Distribution OS, BelegPilot, Acme CRM"
          />
        </div>

        {ai?.available && name.trim() && (
          <div>
            <button
              type="button"
              onClick={handleAISuggest}
              disabled={ai.loading}
              className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border border-dashed border-[var(--color-accent)]/40 bg-[var(--color-accent-light)]/50 text-left transition-colors hover:border-[var(--color-accent)]/70 disabled:opacity-60"
            >
              {ai.loading ? (
                <Loader2 size={16} className="animate-spin text-[var(--color-accent-text)] shrink-0" />
              ) : (
                <Sparkles size={16} className="text-[var(--color-accent-text)] shrink-0 animate-pulse" />
              )}
              <span className="flex flex-col">
                <span className="text-sm font-medium text-[var(--color-accent-text)]">
                  {ai.loading ? 'Analyzing...' : 'AI Suggest \u2014 auto-fill description, stage & engines'}
                </span>
                {!ai.loading && (
                  <span className="text-xs text-[var(--color-ink-body)]">(uses 1 credit)</span>
                )}
              </span>
            </button>
            {ai?.error && (
              <p className="text-xs text-red-500 mt-1.5">{ai.error}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Short Description</label>
          <Input
            value={description}
            onChange={e => onDescriptionChange(e.target.value)}
            placeholder="One line about what it does"
          />
          {ai?.analysis?.description && description === ai.analysis.description && (
            <p className="mt-1.5 text-xs text-[var(--color-accent-text)] flex items-center gap-1">
              <Sparkles size={10} />
              AI-generated — feel free to edit
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="px-4 py-2.5 min-h-[44px] rounded-lg border border-[var(--color-edge)] text-sm text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          Back
        </button>
        <Button onClick={onNext} disabled={!name.trim()} size="lg">
          Continue
        </Button>
      </div>
    </div>
  )
}
