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

type Tab = 'password' | 'email-code'
type OtpStep = 'email' | 'verify'

export function Login() {
  const { signIn, sendLoginOtp, verifyOtp } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpStep, setOtpStep] = useState<OtpStep>('email')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // Cloudflare Turnstile tokens for the two sign-in forms. Managed mode solves invisibly for real
  // users; each token is single-use, so reset() after every submit to fetch a fresh one. The
  // token is forwarded to Supabase but ignored until CAPTCHA is enabled in Auth settings, so this
  // is a no-op today (outage-safe).
  const [passwordToken, setPasswordToken] = useState<string | null>(null)
  const [codeToken, setCodeToken] = useState<string | null>(null)
  const passwordTurnstileRef = useRef<TurnstileHandle>(null)
  const codeTurnstileRef = useRef<TurnstileHandle>(null)

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password, passwordToken ?? undefined)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password.')
    } finally {
      passwordTurnstileRef.current?.reset()
      setLoading(false)
    }
  }

  async function handleSendLoginOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await sendLoginOtp(email, codeToken ?? undefined)
      setOtpStep('verify')
    } catch {
      setError('No account found with this email.')
    } finally {
      codeTurnstileRef.current?.reset()
      setLoading(false)
    }
  }

  const handleVerifyOtp = useCallback(async (code: string) => {
    setError('')
    setLoading(true)
    try {
      await verifyOtp(email, code)
      navigate('/dashboard')
    } catch {
      setError('Invalid or expired code. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [email, verifyOtp, navigate])

  const inputClass =
    'w-full px-4 py-3 min-h-[44px] rounded-lg bg-white/[0.06] border border-white/[0.1] text-white text-base md:text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all'

  return (
    <div className="min-h-dvh bg-[#0a0a0a] flex items-center justify-center px-4">
      <PageMeta title={`Log In — ${APP_NAME}`} noindex />
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <Logo />
          <span className="font-bold text-white text-sm tracking-tight">{APP_NAME}</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
          <h1 className="text-xl font-semibold text-white text-center mb-1">Welcome back</h1>
          <p className="text-sm text-slate-400 text-center mb-6">
            Log in to your {APP_NAME} account
          </p>

          {/* Tabs */}
          <div className="flex rounded-lg bg-white/[0.04] p-1 mb-6">
            <button
              type="button"
              onClick={() => { setTab('password'); setError(''); setOtpStep('email') }}
              className={`flex-1 py-2 min-h-[44px] rounded-md text-sm font-medium transition-all ${tab === 'password' ? 'bg-white/[0.1] text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'}`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => { setTab('email-code'); setError('') }}
              className={`flex-1 py-2 min-h-[44px] rounded-md text-sm font-medium transition-all ${tab === 'email-code' ? 'bg-white/[0.1] text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'}`}
            >
              Email Code
            </button>
          </div>

          {error && (
            <div role="alert" className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Password Tab */}
          {tab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
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
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-slate-300">Password</label>
                  <Link
                    to="/reset-password"
                    className="min-h-[44px] inline-flex items-center text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <TurnstileWidget ref={passwordTurnstileRef} onToken={setPasswordToken} />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 min-h-[44px] rounded-lg bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Email Code Tab */}
          {tab === 'email-code' && otpStep === 'email' && (
            <form onSubmit={handleSendLoginOtp} className="space-y-4">
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
              <TurnstileWidget ref={codeTurnstileRef} onToken={setCodeToken} />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 min-h-[44px] rounded-lg bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? 'Sending code...' : 'Send Login Code'}
              </button>
            </form>
          )}

          {tab === 'email-code' && otpStep === 'verify' && (
            <div className="space-y-5">
              <p className="text-sm text-slate-400 text-center">
                We sent a 6-digit code to <span className="text-white font-medium">{email}</span>
              </p>
              <OtpInput onComplete={handleVerifyOtp} disabled={loading} />
              {loading && (
                <p className="text-center text-sm text-slate-400">Verifying...</p>
              )}
              <ResendTimer onResend={async () => {
                try {
                  await sendLoginOtp(email, codeToken ?? undefined)
                } finally {
                  codeTurnstileRef.current?.reset()
                }
              }} />
              <button
                type="button"
                onClick={() => { setOtpStep('email'); setError('') }}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to email
              </button>
            </div>
          )}
        </div>

        <p className="text-sm text-slate-500 text-center mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="min-h-[44px] inline-flex items-center text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
