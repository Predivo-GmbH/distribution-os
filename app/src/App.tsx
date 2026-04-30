import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { PasswordGate } from '@/components/shared/PasswordGate'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase-config'

/* Public page chunks — lazy-loaded, no Supabase SDK dependency */
const Landing = lazy(() => import('@/pages/Landing').then(m => ({ default: m.Landing })))
const Login = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })))
const SignUp = lazy(() => import('@/pages/SignUp').then(m => ({ default: m.SignUp })))
const ResetPassword = lazy(() => import('@/pages/ResetPassword').then(m => ({ default: m.ResetPassword })))
const Pricing = lazy(() => import('@/pages/Pricing').then(m => ({ default: m.Pricing })))
const LandingOriginal = lazy(() => import('@/pages/LandingOriginal').then(m => ({ default: m.LandingOriginal })))

/* Authenticated app shell — lazy-loaded so the Supabase SDK (165 KB)
   and app-state hooks are NOT on the public page critical path. */
const AuthenticatedApp = lazy(() =>
  import('@/AuthenticatedApp').then(m => ({ default: m.AuthenticatedApp }))
)

function ProtectedRoutes() {
  const { user, loading } = useAuth()

  if (isSupabaseConfigured) {
    if (loading) {
      return <LoadingSpinner fullPage />
    }

    if (!user) {
      return <Navigate to="/login" replace />
    }
  } else if (import.meta.env.PROD) {
    // In production, Supabase MUST be configured — block the app
    return (
      <div className="min-h-dvh flex items-center justify-center p-4 text-center">
        <p className="text-red-600 font-medium">Configuration error: authentication service unavailable.</p>
      </div>
    )
  }
  // else: local dev without Supabase — allow through

  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <Outlet />
    </Suspense>
  )
}

function PublicOnlyRoutes() {
  const { user, loading } = useAuth()

  if (isSupabaseConfigured && !loading && user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <Outlet />
    </Suspense>
  )
}

export default function App() {
  const appContent = (
    <BrowserRouter>
      <Routes>
        {/* Public routes — no Supabase SDK loaded */}
        <Route element={<PublicOnlyRoutes />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/original" element={<LandingOriginal />} />
        </Route>

        {/* Protected routes — AuthenticatedApp loads Supabase + app state */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/*" element={<AuthenticatedApp />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )

  // Wrap in PasswordGate for pre-launch access control
  return <PasswordGate>{appContent}</PasswordGate>
}
