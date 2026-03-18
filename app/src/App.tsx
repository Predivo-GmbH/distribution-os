import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { ProductView } from '@/components/products/ProductView'
import { ProductsList } from '@/components/products/ProductsList'
import { Settings } from '@/components/settings/Settings'
import { BriefingRoom } from '@/components/briefing/BriefingRoom'
import { FirstMission } from '@/components/onboarding/FirstMission'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'
import { SignUp } from '@/pages/SignUp'
import { ResetPassword } from '@/pages/ResetPassword'
import { Pricing } from '@/pages/Pricing'
import { PasswordGate } from '@/components/shared/PasswordGate'
import { useAppState } from '@/hooks/useAppState'
import { useOnboardingState } from '@/hooks/useOnboardingState'
import { usePreferences } from '@/hooks/usePreferences'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase'

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

  return <Outlet />
}

export default function App() {
  const { state, dispatch } = useAppState()
  const { prefs, setDarkMode, setWeekStartDay } = usePreferences()
  const hasProducts = state.products.length > 0
  const {
    isFirstTime,
    completeFirstMission,
    markBriefingVisited,
    showBriefingBadge,
  } = useOnboardingState(hasProducts)

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
                <Outlet />
              </AppLayout>
            }
          >
            <Route
              path="/dashboard"
              element={
                isFirstTime
                  ? <FirstMission dispatch={dispatch} onComplete={completeFirstMission} />
                  : <Dashboard state={state} dispatch={dispatch} />
              }
            />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )

  // Wrap in PasswordGate for pre-launch access control
  return <PasswordGate>{appContent}</PasswordGate>
}
