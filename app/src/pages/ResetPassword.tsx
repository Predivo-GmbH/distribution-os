import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PageMeta } from '@/components/shared/PageMeta'
import { Logo } from '@/components/shared/Logo'
import { APP_NAME } from '@/lib/app-config'
import { Mail, Lock, CheckCircle, ArrowLeft } from 'lucide-react'
import TurnstileWidget, { type TurnstileHandle } from '@/components/auth/TurnstileWidget'

export function ResetPassword() {
  const { resetPassword, updatePassword } = useAuth()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  // Cloudflare Turnstile token for the /recover request. Ignored by Supabase until CAPTCHA is
  // enabled in Auth settings — a no-op today, outage-safe to ship.
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileHandle>(null)

  const isUpdateMode = window.location.hash.includes('type=recovery')

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email, captchaToken ?? undefined)
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      turnstileRef.current?.reset()
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

  const inputClass =
    'w-full px-4 py-3 min-h-[44px] rounded-lg bg-white/[0.06] border border-white/[0.1] text-white text-base md:text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all'

  return (
    <div className="min-h-dvh bg-[#0a0a0a] flex items-center justify-center px-4">
      <PageMeta title={`Reset Password — ${APP_NAME}`} noindex />
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <Logo />
          <span className="font-bold text-white text-sm tracking-tight">{APP_NAME}</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
          {error && (
            <div role="alert" className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {error}
            </div>
          )}

          {isUpdateMode ? (
            <>
              <h1 className="text-xl font-semibold text-white text-center mb-1">
                Set new password
              </h1>
              <p className="text-sm text-slate-400 text-center mb-6">
                Enter your new password below
              </p>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="At least 8 characters"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 min-h-[44px] rounded-lg bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          ) : sent ? (
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <h1 className="text-xl font-semibold text-white mb-2">Check your email</h1>
              <p className="text-sm text-slate-400 mb-6">
                We sent a password reset link to <span className="text-white font-medium">{email}</span>.
                Click the link in the email to set a new password.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full py-3 min-h-[44px] rounded-lg border border-white/[0.1] text-sm font-medium text-slate-300 hover:bg-white/[0.06] transition-all"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-white text-center mb-1">
                Reset password
              </h1>
              <p className="text-sm text-slate-400 text-center mb-6">
                Enter your email and we'll send you a reset link
              </p>
              <form onSubmit={handleRequestReset} className="space-y-4">
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
                <TurnstileWidget ref={turnstileRef} onToken={setCaptchaToken} />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 min-h-[44px] rounded-lg bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-sm text-slate-500 text-center mt-6">
          <Link to="/login" className="min-h-[44px] inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}
