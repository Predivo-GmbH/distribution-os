import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PageMeta } from '@/components/shared/PageMeta'
import { Logo } from '@/components/shared/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

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
      <PageMeta title="Log In — Distribution OS" noindex />
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <Logo />
          <span className="font-semibold text-[var(--color-ink)] text-sm tracking-tight">
            Distribution OS
          </span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-4 sm:p-6">
          <h1 className="text-xl font-semibold text-[var(--color-ink)] text-center mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] text-center mb-6">
            Log in to your Distribution OS account
          </p>

          {error && (
            <div role="alert" className="mb-4 p-3 rounded-lg bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-[var(--color-ink)]">Password</label>
                <Link to="/reset-password" className="min-h-[44px] inline-flex items-center text-xs text-[var(--color-accent-text)] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            <Button type="submit" disabled={loading} size="full">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>

        <p className="text-sm text-[var(--color-ink-muted)] text-center mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="min-h-[44px] inline-flex items-center text-[var(--color-accent-text)] hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
