import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOnboardingState } from '../useOnboardingState'

describe('useOnboardingState', () => {
  it('returns isFirstTime=true when no products and not completed', () => {
    const { result } = renderHook(() => useOnboardingState(false))
    expect(result.current.isFirstTime).toBe(true)
  })

  it('returns isFirstTime=false when user has products', () => {
    const { result } = renderHook(() => useOnboardingState(true))
    expect(result.current.isFirstTime).toBe(false)
  })

  it('returns needsSetupSprint=true when products exist but not completed', () => {
    // First complete the first mission
    const { result } = renderHook(() => useOnboardingState(true))
    // isFirstTime is false (has products), but setupSprint not done
    expect(result.current.needsSetupSprint).toBe(true)
  })

  it('completeFirstMission marks first mission as done', () => {
    const { result } = renderHook(() => useOnboardingState(false))
    expect(result.current.isFirstTime).toBe(true)

    act(() => {
      result.current.completeFirstMission()
    })
    // After completing first mission, isFirstTime depends on hasProducts
    // Since hasProducts is false, isFirstTime checks firstMissionComplete
    expect(result.current.isFirstTime).toBe(false)
  })

  it('completeSetupSprint marks setup sprint as done', () => {
    // Simulate: has products, first mission done, setup sprint not done
    localStorage.setItem('distribution-os-onboarding', JSON.stringify({
      firstMissionComplete: true,
      setupSprintComplete: false,
      briefingVisited: false,
      completedSteps: [],
    }))

    const { result } = renderHook(() => useOnboardingState(true))
    expect(result.current.needsSetupSprint).toBe(true)

    act(() => {
      result.current.completeSetupSprint()
    })
    expect(result.current.needsSetupSprint).toBe(false)
  })

  it('markBriefingVisited sets badge to false', () => {
    const { result } = renderHook(() => useOnboardingState(false))
    expect(result.current.showBriefingBadge).toBe(true)

    act(() => {
      result.current.markBriefingVisited()
    })
    expect(result.current.showBriefingBadge).toBe(false)
  })

  it('persists state to localStorage on changes', () => {
    const { result } = renderHook(() => useOnboardingState(false))
    act(() => {
      result.current.completeFirstMission()
    })
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'distribution-os-onboarding',
      expect.stringContaining('"firstMissionComplete":true')
    )
  })

  it('completeStep adds step to completedSteps', () => {
    const { result } = renderHook(() => useOnboardingState(false))
    act(() => {
      result.current.completeStep(1)
    })
    expect(result.current.onboarding.completedSteps).toContain(1)
  })

  it('completeStep does not duplicate steps', () => {
    const { result } = renderHook(() => useOnboardingState(false))
    act(() => {
      result.current.completeStep(1)
      result.current.completeStep(1)
    })
    expect(result.current.onboarding.completedSteps.filter(s => s === 1)).toHaveLength(1)
  })
})
