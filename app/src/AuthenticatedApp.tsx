import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { consumeIntendedPlan, startCheckout } from '@/lib/billing'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { WelcomeModal } from '@/components/onboarding/WelcomeModal'
import { useAppState } from '@/hooks/useAppState'
import { useOnboardingState } from '@/hooks/useOnboardingState'
import { usePreferences } from '@/hooks/usePreferences'
import { useScheduler } from '@/hooks/useScheduler'
import { useAuth } from '@/hooks/useAuth'

const Dashboard = lazy(() => import('@/components/dashboard/Dashboard').then(m => ({ default: m.Dashboard })))
const ProductView = lazy(() => import('@/components/products/ProductView').then(m => ({ default: m.ProductView })))
const ProductsList = lazy(() => import('@/components/products/ProductsList').then(m => ({ default: m.ProductsList })))
const Settings = lazy(() => import('@/components/settings/Settings').then(m => ({ default: m.Settings })))
const BriefingRoom = lazy(() => import('@/components/briefing/BriefingRoom').then(m => ({ default: m.BriefingRoom })))
const Inbox = lazy(() => import('@/components/inbox/Inbox').then(m => ({ default: m.Inbox })))
const FirstMission = lazy(() => import('@/components/onboarding/FirstMission').then(m => ({ default: m.FirstMission })))
const SetupSprint = lazy(() => import('@/components/onboarding/SetupSprint').then(m => ({ default: m.SetupSprint })))
const ValidationPipeline = lazy(() => import('@/components/validate/ValidationPipeline').then(m => ({ default: m.ValidationPipeline })))
const OfferBuilder = lazy(() => import('@/components/offer/OfferBuilder').then(m => ({ default: m.OfferBuilder })))
const LaunchChecklist = lazy(() => import('@/components/setup/LaunchChecklist').then(m => ({ default: m.LaunchChecklist })))
const BuildKit = lazy(() => import('@/components/design/BuildKit').then(m => ({ default: m.BuildKit })))
const Proposals = lazy(() => import('@/components/proposals/Proposals').then(m => ({ default: m.Proposals })))
const Playbooks = lazy(() => import('@/components/playbooks/Playbooks').then(m => ({ default: m.Playbooks })))
const AuditPage = lazy(() => import('@/components/audit/AuditPage').then(m => ({ default: m.AuditPage })))
const SchedulePage = lazy(() => import('@/components/schedule/SchedulePage').then(m => ({ default: m.SchedulePage })))
const AnalyzePage = lazy(() => import('@/components/analyze/AnalyzePage').then(m => ({ default: m.AnalyzePage })))

/**
 * Authenticated app shell — lazy-loaded from App.tsx so that useAppState,
 * usePreferences, useScheduler (and their Supabase storage imports) stay
 * off the public page critical path. Saves ~165 KB for unauthenticated visitors.
 */
export function AuthenticatedApp() {
  const { state, dispatch } = useAppState()

  // A visitor who picked a paid tier on the public pricing page while logged
  // out lands here right after signup — resume their checkout immediately.
  useEffect(() => {
    const intended = consumeIntendedPlan()
    if (!intended) return
    startCheckout(intended)
      .then(url => { window.location.href = url })
      .catch(() => { /* stay in the app; upgrade remains available in Settings → Billing */ })
  }, [])

  const { prefs, setDarkMode, setWeekStartDay } = usePreferences()
  const { user, signOut } = useAuth()
  const hasProducts = state.products.length > 0
  const {
    isFirstTime,
    needsSetupSprint,
    showWelcomeModal,
    completeFirstMission,
    completeSetupSprint,
    markBriefingVisited,
    dismissWelcomeModal,
    showBriefingBadge,
  } = useOnboardingState(hasProducts)

  // Run automation scheduler in background
  useScheduler(state.products)

  const onboardingComplete = !isFirstTime && !needsSetupSprint

  return (
    <AppLayout products={state.products} showBriefingBadge={showBriefingBadge} onboardingComplete={onboardingComplete} userEmail={user?.email} onSignOut={signOut}>
      {showWelcomeModal && (
        <WelcomeModal
          productName={state.products[0]?.name || 'Your product'}
          onDismiss={dismissWelcomeModal}
        />
      )}
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
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
          <Route path="/validate" element={<ValidationPipeline state={state} />} />
          <Route path="/brief" element={<OfferBuilder state={state} />} />
          <Route path="/setup" element={<LaunchChecklist />} />
          <Route path="/build-kit" element={<BuildKit state={state} />} />
          <Route path="/proposals" element={<Proposals state={state} />} />
          <Route path="/playbooks" element={<Playbooks state={state} />} />
          <Route path="/audit" element={<AuditPage state={state} />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/analyze" element={<AnalyzePage state={state} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  )
}
