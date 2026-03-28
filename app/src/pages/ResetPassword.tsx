import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PageMeta } from '@/components/shared/PageMeta'
import { Logo } from '@/components/shared/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function ResetPassword() {
  const { resetPassword, updatePassword } = useAuth()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  // Check if this is a password update (user arrived via reset link with session)
  const isUpdateMode = window.location.hash.includes('type=recovery')

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await resetPassword(email)
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await updatePassword(newPassword)
      window.location.href = '/dashboard'
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] flex items-center justify-center px-4">
      <PageMeta title="Reset Password — Distribution OS" noindex />
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <Logo />
          <span className="font-semibold text-[var(--color-ink)] text-sm tracking-tight">
            Distribution OS
          </span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-4 sm:p-6">
          {error && (
            <div role="alert" className="mb-4 p-3 rounded-lg bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)]">
              {error}
            </div>
          )}

          {isUpdateMode ? (
            <>
              <h1 className="text-xl font-semibold text-[var(--color-ink)] text-center mb-1">
                Set new password
              </h1>
              <p className="text-sm text-[var(--color-ink-muted)] text-center mb-6">
                Enter your new password below
              </p>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                  />
                </div>
                <Button type="submit" disabled={loading} size="full">
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </>
          ) : sent ? (
            <>
              <h1 className="text-xl font-semibold text-[var(--color-ink)] text-center mb-1">
                Check your email
              </h1>
              <p className="text-sm text-[var(--color-ink-body)] text-center mb-4">
                We sent a password reset link to <strong>{email}</strong>. Click the link in the email to set a new password.
              </p>
              <Link
                to="/login"
                className="block w-full py-2.5 min-h-[44px] rounded-lg border border-[var(--color-edge)] text-center text-sm font-medium text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                Back to Login
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-[var(--color-ink)] text-center mb-1">
                Reset password
              </h1>
              <p className="text-sm text-[var(--color-ink-muted)] text-center mb-6">
                Enter your email and we'll send you a reset link
              </p>
              <form onSubmit={handleRequestReset} className="space-y-4">
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
                <Button type="submit" disabled={loading} size="full">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-sm text-[var(--color-ink-muted)] text-center mt-4">
          <Link to="/login" className="min-h-[44px] inline-flex items-center text-[var(--color-accent-text)] hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  )
}
