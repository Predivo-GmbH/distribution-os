import { Rocket } from 'lucide-react'

interface Props {
  onNext: () => void
}

export function Welcome({ onNext }: Props) {
  return (
    <div className="flex flex-col items-center text-center max-w-lg mx-auto py-12">
      <div className="w-20 h-20 rounded-2xl bg-[var(--color-accent)] flex items-center justify-center mb-8">
        <Rocket size={36} className="text-white" strokeWidth={1.5} />
      </div>

      <h1 className="text-3xl font-bold text-[var(--color-ink)] tracking-tight mb-3">
        Welcome to Distribution OS
      </h1>

      <p className="text-[var(--color-ink-body)] text-base leading-relaxed mb-6">
        Most SaaS products don't fail because they're bad — they fail because nobody knows they exist.
        Distribution OS gives you a weekly system to fix that.
      </p>

      {/* The purpose */}
      <div className="bg-[var(--color-accent-light)] border border-[var(--color-edge)] rounded-xl p-5 text-left w-full mb-6">
        <p className="text-sm font-semibold text-[var(--color-accent-text)] mb-2">Your goal</p>
        <p className="text-sm text-[var(--color-ink-body)] leading-relaxed">
          Build a <strong>sustainable distribution system</strong> that gets your product in front of the right people — consistently, week after week. Not a viral hack. Not guesswork. A repeatable machine that compounds over time until growth becomes predictable.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-5 text-left w-full mb-8">
        <p className="text-sm font-semibold text-[var(--color-ink)] mb-3">How it works:</p>
        <ol className="space-y-2.5 text-sm text-[var(--color-ink-body)]">
          <li className="flex gap-3">
            <span className="font-mono text-xs font-bold text-[var(--color-accent)] bg-[var(--color-accent-light)] w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span>You add your product and tell us what <strong>stage</strong> it's in (pre-launch, early, active, or scaling)</span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-xs font-bold text-[var(--color-accent)] bg-[var(--color-accent-light)] w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span>You choose which distribution <strong>engines</strong> to activate — the channels you'll use to reach users</span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-xs font-bold text-[var(--color-accent)] bg-[var(--color-accent-light)] w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5">3</span>
            <span>Every week, concrete tasks are generated. Complete them to build distribution momentum that compounds.</span>
          </li>
        </ol>
      </div>

      <button
        onClick={onNext}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-semibold text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors active:scale-[0.98]"
      >
        Start First Mission
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
