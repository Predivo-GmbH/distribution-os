import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
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

        <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-6">
          <h1 className="text-xl font-semibold text-[var(--color-ink)] text-center mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] text-center mb-6">
            Log in to your Distribution OS account
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-edge-focus)]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-[var(--color-ink)]">Password</label>
                <Link to="/reset-password" className="text-xs text-[var(--color-accent-text)] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-edge-focus)]"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-sm text-[var(--color-ink-muted)] text-center mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[var(--color-accent-text)] hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
