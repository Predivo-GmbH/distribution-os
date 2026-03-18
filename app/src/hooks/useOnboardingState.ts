import { useState, useCallback } from 'react'

const STORAGE_KEY = 'distribution-os-onboarding'

interface OnboardingState {
  firstMissionComplete: boolean
  briefingVisited: boolean
  completedSteps: number[]
}

const DEFAULT_STATE: OnboardingState = {
  firstMissionComplete: false,
  briefingVisited: false,
  completedSteps: [],
}

function load(): OnboardingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return DEFAULT_STATE
}

function save(state: OnboardingState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function useOnboardingState(hasProducts: boolean) {
  const [state, setState] = useState(load)

  const isFirstTime = !hasProducts && !state.firstMissionComplete

  const completeStep = useCallback((step: number) => {
    setState(prev => {
      const next = {
        ...prev,
        completedSteps: prev.completedSteps.includes(step)
          ? prev.completedSteps
          : [...prev.completedSteps, step],
      }
      save(next)
      return next
    })
  }, [])

  const completeFirstMission = useCallback(() => {
    setState(prev => {
      const next = { ...prev, firstMissionComplete: true }
      save(next)
      return next
    })
  }, [])

  const markBriefingVisited = useCallback(() => {
    setState(prev => {
      if (prev.briefingVisited) return prev
      const next = { ...prev, briefingVisited: true }
      save(next)
      return next
    })
  }, [])

  return {
    onboarding: state,
    isFirstTime,
    completeStep,
    completeFirstMission,
    markBriefingVisited,
    showBriefingBadge: !state.briefingVisited,
  }
}
