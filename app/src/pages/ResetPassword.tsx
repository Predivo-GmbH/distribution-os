import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

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
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)]">
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
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-edge-focus)]"
                    placeholder="At least 8 characters"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
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
                className="block w-full py-2.5 rounded-lg border border-[var(--color-edge)] text-center text-sm font-medium text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
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
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-edge-focus)]"
                    placeholder="you@example.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-sm text-[var(--color-ink-muted)] text-center mt-4">
          <Link to="/login" className="text-[var(--color-accent-text)] hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  )
}
