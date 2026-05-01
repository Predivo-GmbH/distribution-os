import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PageMeta } from '@/components/shared/PageMeta'
import { APP_NAME } from '@/lib/app-config'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

type Status = 'verifying' | 'success' | 'error'

export function AuthVerify() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { verifyOtp } = useAuth()

  const token = useMemo(() => searchParams.get('token'), [searchParams])
  const email = useMemo(() => searchParams.get('email'), [searchParams])
  const type = useMemo(() => searchParams.get('type') || 'signup', [searchParams])

  const hasParams = Boolean(token && email)

  const [status, setStatus] = useState<Status>(hasParams ? 'verifying' : 'error')
  const [errorMsg, setErrorMsg] = useState(hasParams ? '' : 'Invalid verification link.')

  useEffect(() => {
    if (!token || !email) return

    verifyOtp(email, token)
      .then(() => {
        setStatus('success')
        const target = type === 'signup' ? '/signup?verified=true' : '/dashboard'
        setTimeout(() => navigate(target, { replace: true }), 2000)
      })
      .catch(() => {
        setStatus('error')
        setErrorMsg('This code has expired or is invalid. Please request a new one.')
      })
  }, [token, email, type, verifyOtp, navigate])

  return (
    <div className="min-h-dvh bg-[#0a0a0a] flex items-center justify-center px-4">
      <PageMeta title={`Verify Email — ${APP_NAME}`} noindex />
      <div className="w-full max-w-sm text-center">
        {status === 'verifying' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto" />
            <h1 className="text-xl font-semibold text-white">Verifying your email...</h1>
            <p className="text-sm text-slate-400">Please wait a moment.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <h1 className="text-xl font-semibold text-white">Email confirmed!</h1>
            <p className="text-sm text-slate-400">Redirecting you now...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h1 className="text-xl font-semibold text-white">Verification failed</h1>
            <p className="text-sm text-slate-400">{errorMsg}</p>
            <button
              onClick={() => navigate('/signup', { replace: true })}
              className="mt-4 px-6 py-3 min-h-[44px] rounded-lg bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-all"
            >
              Back to Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
