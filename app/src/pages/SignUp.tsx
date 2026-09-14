import { useState, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PageMeta } from '@/components/shared/PageMeta'
import { Logo } from '@/components/shared/Logo'
import { APP_NAME } from '@/lib/app-config'
import { Mail, Lock, ArrowLeft } from 'lucide-react'
import OtpInput from '@/components/auth/OtpInput'
import ResendTimer from '@/components/auth/ResendTimer'
import TurnstileWidget, { type TurnstileHandle } from '@/components/auth/TurnstileWidget'

type Step = 'email' | 'otp' | 'password'

export function SignUp() {
  const { sendOtp, verifyOtp, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // Cloudflare Turnstile token for the signup email step (/otp signup). Ignored by Supabase until
  // CAPTCHA is enabled in Auth settings — a no-op today, outage-safe to ship.
  const [otpToken, setOtpToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileHandle>(null)

  const handleSendOtp = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError('')
    setLoading(true)
    try {
      await sendOtp(email, otpToken ?? undefined)
      setStep('otp')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      turnstileRef.current?.reset()
      setLoading(false)
    }
  }, [email, otpToken, sendOtp])

  const handleVerifyOtp = useCallback(async (code: string) => {
    setError('')
    setLoading(true)
    try {
      await verifyOtp(email, code)
      setStep('password')
    } catch {
      setError('Invalid or expired code. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [email, verifyOtp])

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
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

  async function handleResend() {
    setError('')
    try {
      await sendOtp(email, otpToken ?? undefined)
    } catch {
      setError('Failed to resend code. Please try again.')
    } finally {
      turnstileRef.current?.reset()
    }
  }

  const stepIndex = step === 'email' ? 0 : step === 'otp' ? 1 : 2
  const stepLabels = ['Email', 'Verify', 'Password']
  const stepDescriptions = {
    email: 'Enter your email to get started',
    otp: 'Check your email for a verification code',
    password: 'Set a password (optional)',
  }

  const inputClass =
    'w-full px-4 py-3 min-h-[44px] rounded-lg bg-white/[0.06] border border-white/[0.1] text-white text-base md:text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all'

  return (
    <div className="min-h-dvh bg-[#0a0a0a] flex items-center justify-center px-4">
      <PageMeta title={`Sign Up — ${APP_NAME}`} noindex />
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <Logo />
          <span className="font-bold text-white text-sm tracking-tight">{APP_NAME}</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
          <h1 className="text-xl font-semibold text-white text-center mb-1">Create your account</h1>
          <p className="text-sm text-slate-400 text-center mb-6">
            {stepDescriptions[step]}
          </p>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${i <= stepIndex ? 'bg-indigo-500 scale-110' : 'bg-white/[0.15]'}`} />
                {i < stepLabels.length - 1 && (
                  <div className={`w-6 h-px transition-all duration-300 ${i < stepIndex ? 'bg-indigo-500' : 'bg-white/[0.1]'}`} />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div role="alert" className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <TurnstileWidget ref={turnstileRef} onToken={setOtpToken} />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 min-h-[44px] rounded-lg bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? 'Sending code...' : 'Continue'}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <div className="space-y-5">
              <p className="text-sm text-slate-400 text-center">
                We sent a 6-digit code to <span className="text-white font-medium">{email}</span>
              </p>
              <OtpInput onComplete={handleVerifyOtp} disabled={loading} />
              {loading && (
                <p className="text-center text-sm text-slate-400">Verifying...</p>
              )}
              <ResendTimer onResend={async () => { await handleResend() }} />
              <button
                type="button"
                onClick={() => { setStep('email'); setError('') }}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Use a different email
              </button>
            </div>
          )}

          {/* Step 3: Password */}
          {step === 'password' && (
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Password <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    minLength={8}
                    placeholder="At least 8 characters"
                    className={`${inputClass} pl-10`}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  You can always log in via email code instead.
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 min-h-[44px] rounded-lg bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? 'Setting up...' : password ? 'Set Password & Continue' : 'Skip & Continue'}
              </button>
            </form>
          )}
        </div>

        <p className="text-sm text-slate-500 text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="min-h-[44px] inline-flex items-center text-indigo-400 hover:text-indigo-300 transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
