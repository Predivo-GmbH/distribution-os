import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Playbooks } from '../Playbooks'
import type { AppState } from '@/types'

// Mock useSubscription
vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => ({ tier: 'starter', isPaid: true, limits: { maxProducts: 2, aiRunsPerMonth: 5 }, loading: false }),
  TIER_LIMITS: {
    free: { maxProducts: 1, aiRunsPerMonth: 0 },
    starter: { maxProducts: 2, aiRunsPerMonth: 5 },
    growth: { maxProducts: 5, aiRunsPerMonth: 25 },
    scale: { maxProducts: Infinity, aiRunsPerMonth: Infinity },
    pro: { maxProducts: Infinity, aiRunsPerMonth: Infinity },
  },
}))

// Mock AI workers
vi.mock('@/lib/ai', () => ({
  runEngineAdvisor: vi.fn().mockResolvedValue({ success: true, content: 'Engine advisor result' }),
  runEnginePlaybook: vi.fn().mockResolvedValue({ success: true, content: 'Engine playbook result' }),
}))

function makeState(products: AppState['products'] = []): AppState {
  return {
    products,
    currentWeekId: '2026-W18',
    tasks: [],
    weekHistory: [],
  }
}

const testProduct = {
  id: 'prod-1',
  name: 'TestProduct',
  description: 'A test product',
  stage: 'early' as const,
  primaryEngine: 'pull' as const,
  secondaryEngines: [] as const,
  color: '#3b82f6',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}

describe('Playbooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function renderComponent(state?: AppState) {
    return render(
      <HelmetProvider>
        <MemoryRouter>
          <Playbooks state={state ?? makeState([testProduct])} />
        </MemoryRouter>
      </HelmetProvider>
    )
  }

  it('renders the heading', () => {
    renderComponent()
    expect(screen.getByText('Engine Playbooks')).toBeInTheDocument()
  })

  it('renders Engine Advisor section', () => {
    renderComponent()
    expect(screen.getByText('Engine Advisor')).toBeInTheDocument()
  })

  it('renders all 6 engine cards', () => {
    renderComponent()
    expect(screen.getByText('Pull')).toBeInTheDocument()
    expect(screen.getByText('Push')).toBeInTheDocument()
    expect(screen.getByText('Bridge')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByText('Equity')).toBeInTheDocument()
    expect(screen.getByText('Persistence')).toBeInTheDocument()
  })

  it('shows empty state when no products', () => {
    renderComponent(makeState([]))
    expect(screen.getByText('Add a product first to generate playbooks.')).toBeInTheDocument()
  })

  it('renders Get Recommendation button', () => {
    renderComponent()
    expect(screen.getByRole('button', { name: /get recommendation/i })).toBeInTheDocument()
  })

  it('renders Generate buttons for each engine', () => {
    renderComponent()
    const buttons = screen.getAllByRole('button', { name: /generate/i })
    expect(buttons.length).toBeGreaterThanOrEqual(6)
  })

  it('shows product selector when multiple products', () => {
    const state = makeState([
      testProduct,
      { ...testProduct, id: 'prod-2', name: 'SecondProduct' },
    ])
    renderComponent(state)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('does not show product selector for single product', () => {
    renderComponent()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })
})
