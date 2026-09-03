import { useState, type ReactNode } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { APP_NAME } from '@/lib/app-config'

// SHA-256 hex hash of the access code (never store plaintext)
const PASSWORD_HASH =
  'bf194a2edae59994d210a808e2637f98f82c3d77188d31993ad8acf2c4fe983a'
const SESSION_KEY = 'distribution-os-dev-access'

async function sha256(message: string): Promise<string> {
  const data = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

interface Props {
  children: ReactNode
}

export function PasswordGate({ children }: Props) {
  const gateDisabled = import.meta.env.VITE_PASSWORD_GATE_DISABLED === 'true'

  const [granted, setGranted] = useState(
    () => gateDisabled || sessionStorage.getItem(SESSION_KEY) === 'true'
  )
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  if (granted) return <>{children}</>

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const hash = await sha256(input)
    if (hash === PASSWORD_HASH) {
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
            {APP_NAME}
          </span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-4 sm:p-6 text-center">
          <h1 className="text-xl font-semibold text-[var(--color-ink)] mb-1">
            Early Access
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mb-6">
            This product is in pre-launch. Enter the access code to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              value={input}
              onChange={e => { setInput(e.target.value); setError(false) }}
              className={`text-center ${error ? 'border-[var(--color-error)]' : ''}`}
              placeholder="Access code"
              autoFocus
            />
            {error && (
              <p className="text-xs text-[var(--color-error)]">Incorrect code. Try again.</p>
            )}
            <Button type="submit" size="full">
              Enter
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
