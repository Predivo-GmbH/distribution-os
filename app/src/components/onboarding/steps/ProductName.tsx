import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface Props {
  name: string
  description: string
  onNameChange: (v: string) => void
  onDescriptionChange: (v: string) => void
  onNext: () => void
  onBack: () => void
}

export function ProductName({ name, description, onNameChange, onDescriptionChange, onNext, onBack }: Props) {
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
        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Short Description</label>
          <Input
            value={description}
            onChange={e => onDescriptionChange(e.target.value)}
            placeholder="One line about what it does"
          />
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
