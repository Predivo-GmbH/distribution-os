import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { BuildKit } from '../BuildKit'
import type { AppState } from '@/types'

// Mock useSubscription
vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => ({ tier: 'starter', isPaid: true, limits: { maxProducts: 2, aiRunsPerMonth: 5 }, loading: false }),
  TIER_LIMITS: {
    free: { maxProducts: 1, aiRunsPerMonth: 3 },
    starter: { maxProducts: 2, aiRunsPerMonth: 5 },
    growth: { maxProducts: 5, aiRunsPerMonth: 25 },
    scale: { maxProducts: Infinity, aiRunsPerMonth: Infinity },
    pro: { maxProducts: Infinity, aiRunsPerMonth: Infinity },
  },
}))

// Mock AI workers
vi.mock('@/lib/ai', () => ({
  runBrandAnalyzer: vi.fn().mockResolvedValue({ success: true, content: 'Brand analysis result' }),
  runTokenExtractor: vi.fn().mockResolvedValue({ success: true, content: 'Token extraction result' }),
  runBrandBookGenerator: vi.fn().mockResolvedValue({ success: true, content: 'Brand book result' }),
  runConsistencyChecker: vi.fn().mockResolvedValue({ success: true, content: 'Consistency check result' }),
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

describe('BuildKit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function renderComponent(state?: AppState) {
    return render(
      <HelmetProvider>
        <MemoryRouter>
          <BuildKit state={state ?? makeState([testProduct])} />
        </MemoryRouter>
      </HelmetProvider>
    )
  }

  it('renders the heading', () => {
    renderComponent()
    expect(screen.getByText('Design Build Kit')).toBeInTheDocument()
  })

  it('renders step indicator with all steps', () => {
    renderComponent()
    expect(screen.getAllByText('Reference URLs').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Brand Analysis')).toBeInTheDocument()
    expect(screen.getByText('Design Tokens')).toBeInTheDocument()
    expect(screen.getByText('Brand Book')).toBeInTheDocument()
    expect(screen.getByText('Consistency Check')).toBeInTheDocument()
  })

  it('shows empty state when no products', () => {
    renderComponent(makeState([]))
    expect(screen.getByText('Add a product first to run the design pipeline.')).toBeInTheDocument()
  })

  it('renders URL input on initial step', () => {
    renderComponent()
    expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument()
  })

  it('renders Analyze Brand button', () => {
    renderComponent()
    expect(screen.getByRole('button', { name: /analyze brand/i })).toBeInTheDocument()
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
