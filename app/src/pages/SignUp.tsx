import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PageMeta } from '@/components/shared/PageMeta'
import { Logo } from '@/components/shared/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { APP_NAME } from '@/lib/app-config'

type Step = 'email' | 'otp' | 'password'

export function SignUp() {
  const { sendOtp, verifyOtp, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await sendOtp(email)
      setStep('otp')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await verifyOtp(email, otp)
      setStep('password')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // User is already authenticated from OTP verification — just set password
      if (password) {
        await updatePassword(password)
      }
      navigate('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] flex items-center justify-center px-4">
      <PageMeta title={`Sign Up — ${APP_NAME}`} noindex />
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <Logo />
          <span className="font-semibold text-[var(--color-ink)] text-sm tracking-tight">
            {APP_NAME}
          </span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-4 sm:p-6">
          <h1 className="text-xl font-semibold text-[var(--color-ink)] text-center mb-1">
            Create your account
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] text-center mb-6">
            {step === 'email' && 'Enter your email to get started'}
            {step === 'otp' && 'Check your email for a verification code'}
            {step === 'password' && 'Set a password (optional)'}
          </p>

          {error && (
            <div role="alert" className="mb-4 p-3 rounded-lg bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)]">
              {error}
            </div>
          )}

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
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
                {loading ? 'Sending code...' : 'Continue'}
              </Button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Verification Code</label>
                <Input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="font-mono text-center text-lg tracking-[0.3em]"
                  placeholder="000000"
                />
              </div>
              <Button type="submit" disabled={loading} size="full">
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
              <button
                type="button"
                onClick={() => { setStep('email'); setOtp('') }}
                className="w-full min-h-[44px] inline-flex items-center justify-center text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink-body)] transition-colors"
              >
                Back to email
              </button>
            </form>
          )}

          {/* Step 3: Password */}
          {step === 'password' && (
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">
                  Password <span className="text-[var(--color-ink-muted)] font-normal">(optional)</span>
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={8}
                  placeholder="At least 8 characters"
                />
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">
                  You can always log in via email code instead.
                </p>
              </div>
              <Button type="submit" disabled={loading} size="full">
                {loading ? 'Setting up...' : password ? 'Set Password & Continue' : 'Skip & Continue'}
              </Button>
            </form>
          )}
        </div>

        <p className="text-sm text-[var(--color-ink-muted)] text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="min-h-[44px] inline-flex items-center text-[var(--color-accent-text)] hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
