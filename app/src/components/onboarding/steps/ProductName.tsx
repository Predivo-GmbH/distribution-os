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
    <div className="max-w-lg mx-auto py-12">
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
          <input
            value={name}
            onChange={e => onNameChange(e.target.value)}
            placeholder="e.g. Distribution OS, BelegPilot, Acme CRM"
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-edge-focus)] focus:ring-2 focus:ring-[var(--color-edge-focus)]/25"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Short Description</label>
          <input
            value={description}
            onChange={e => onDescriptionChange(e.target.value)}
            placeholder="One line about what it does"
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-edge-focus)] focus:ring-2 focus:ring-[var(--color-edge-focus)]/25"
          />
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
          disabled={!name.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
