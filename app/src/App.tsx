import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { PasswordGate } from '@/components/shared/PasswordGate'
import { useAppState } from '@/hooks/useAppState'
import { useOnboardingState } from '@/hooks/useOnboardingState'
import { usePreferences } from '@/hooks/usePreferences'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useScheduler } from '@/hooks/useScheduler'

const Dashboard = lazy(() => import('@/components/dashboard/Dashboard').then(m => ({ default: m.Dashboard })))
const ProductView = lazy(() => import('@/components/products/ProductView').then(m => ({ default: m.ProductView })))
const ProductsList = lazy(() => import('@/components/products/ProductsList').then(m => ({ default: m.ProductsList })))
const Settings = lazy(() => import('@/components/settings/Settings').then(m => ({ default: m.Settings })))
const BriefingRoom = lazy(() => import('@/components/briefing/BriefingRoom').then(m => ({ default: m.BriefingRoom })))
const Inbox = lazy(() => import('@/components/inbox/Inbox').then(m => ({ default: m.Inbox })))
const FirstMission = lazy(() => import('@/components/onboarding/FirstMission').then(m => ({ default: m.FirstMission })))
const SetupSprint = lazy(() => import('@/components/onboarding/SetupSprint').then(m => ({ default: m.SetupSprint })))
const Landing = lazy(() => import('@/pages/Landing').then(m => ({ default: m.Landing })))
const Login = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })))
const SignUp = lazy(() => import('@/pages/SignUp').then(m => ({ default: m.SignUp })))
const ResetPassword = lazy(() => import('@/pages/ResetPassword').then(m => ({ default: m.ResetPassword })))
const Pricing = lazy(() => import('@/pages/Pricing').then(m => ({ default: m.Pricing })))

function ProtectedRoutes() {
  const { user, loading } = useAuth()

  // If Supabase is not configured, skip auth (local-only mode)
  if (isSupabaseConfigured) {
    if (loading) {
      return (
        <div className="min-h-dvh flex items-center justify-center bg-[var(--color-bg)]">
          <div className="text-sm text-[var(--color-ink-muted)]">Loading...</div>
        </div>
      )
    }

    if (!user) {
      return <Navigate to="/login" replace />
    }
  }

  return <Outlet />
}

function PublicOnlyRoutes() {
  const { user, loading } = useAuth()

  if (isSupabaseConfigured && !loading && user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-sm text-[var(--color-ink-muted)]">Loading...</div>
      </div>
    }>
      <Outlet />
    </Suspense>
  )
}

export default function App() {
  const { state, dispatch } = useAppState()
  const { prefs, setDarkMode, setWeekStartDay } = usePreferences()
  const hasProducts = state.products.length > 0
  const {
    isFirstTime,
    needsSetupSprint,
    completeFirstMission,
    completeSetupSprint,
    markBriefingVisited,
    showBriefingBadge,
  } = useOnboardingState(hasProducts)

  // Run automation scheduler in background
  useScheduler(state.products)

  const loadingFallback = (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-sm text-[var(--color-ink-muted)]">Loading...</div>
    </div>
  )

  const appContent = (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicOnlyRoutes />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/pricing" element={<Pricing />} />
        </Route>

        {/* Protected routes — inside AppLayout */}
        <Route element={<ProtectedRoutes />}>
          <Route
            element={
              <AppLayout products={state.products} showBriefingBadge={showBriefingBadge}>
                <Suspense fallback={loadingFallback}>
                  <Outlet />
                </Suspense>
              </AppLayout>
            }
          >
            <Route
              path="/dashboard"
              element={
                isFirstTime
                  ? <FirstMission dispatch={dispatch} onComplete={completeFirstMission} />
                  : needsSetupSprint
                    ? <SetupSprint state={state} onComplete={completeSetupSprint} />
                    : <Dashboard state={state} dispatch={dispatch} />
              }
            />
            <Route path="/inbox" element={<Inbox state={state} />} />
            <Route path="/briefing" element={<BriefingRoom onVisit={markBriefingVisited} />} />
            <Route path="/products" element={<ProductsList state={state} dispatch={dispatch} />} />
            <Route path="/products/:id" element={<ProductView state={state} dispatch={dispatch} />} />
            <Route path="/settings" element={
              <Settings
                state={state}
                dispatch={dispatch}
                prefs={prefs}
                onDarkModeChange={setDarkMode}
                onWeekStartChange={setWeekStartDay}
              />
            } />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )

  // Wrap in PasswordGate for pre-launch access control
  return <PasswordGate>{appContent}</PasswordGate>
}
