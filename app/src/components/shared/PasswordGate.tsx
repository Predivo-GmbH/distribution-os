import { useState, type ReactNode } from 'react'

const DEV_PASSWORD = 'distributionos2026'
const SESSION_KEY = 'distribution-os-dev-access'

interface Props {
  children: ReactNode
}

export function PasswordGate({ children }: Props) {
  const [granted, setGranted] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === 'true'
  )
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  if (granted) return <>{children}</>

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input === DEV_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setGranted(true)
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
            <div className="flex flex-col items-end gap-[3px]">
              <div className="w-[11px] h-[4px] rounded-sm bg-white" />
              <div className="w-[17px] h-[4px] rounded-sm bg-white/80" />
              <div className="w-[22px] h-[4px] rounded-sm bg-white/60" />
            </div>
          </div>
          <span className="font-semibold text-[var(--color-ink)] text-sm tracking-tight">
            Distribution OS
          </span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-6 text-center">
          <h1 className="text-xl font-semibold text-[var(--color-ink)] mb-1">
            Early Access
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mb-6">
            This product is in pre-launch. Enter the access code to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={input}
              onChange={e => { setInput(e.target.value); setError(false) }}
              className={`w-full px-3 py-2 rounded-lg border text-sm text-center bg-[var(--color-surface)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none ${
                error
                  ? 'border-[var(--color-error)]'
                  : 'border-[var(--color-edge-outline)] focus:border-[var(--color-edge-focus)]'
              }`}
              placeholder="Access code"
              autoFocus
            />
            {error && (
              <p className="text-xs text-[var(--color-error)]">Incorrect code. Try again.</p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
