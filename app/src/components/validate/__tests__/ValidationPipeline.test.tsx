import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ValidationPipeline } from '../ValidationPipeline'
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
  runMarketResearcher: vi.fn().mockResolvedValue({ success: true, content: 'Market analysis result' }),
  runCompetitorAnalyst: vi.fn().mockResolvedValue({ success: true, content: 'Competitor analysis result' }),
  runDistributionSpecialist: vi.fn().mockResolvedValue({ success: true, content: 'Distribution strategy result' }),
}))

// Mock storage
vi.mock('@/lib/storage', () => ({
  loadInbox: vi.fn().mockReturnValue([]),
}))

const mockDispatch = vi.fn()

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

describe('ValidationPipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function renderPipeline(state?: AppState) {
    return render(
      <HelmetProvider>
        <MemoryRouter>
          <ValidationPipeline state={state ?? makeState([testProduct])} dispatch={mockDispatch} />
        </MemoryRouter>
      </HelmetProvider>
    )
  }

  it('renders the heading', () => {
    renderPipeline()
    expect(screen.getByText('Idea Validation')).toBeInTheDocument()
  })

  it('renders all 3 sections', () => {
    renderPipeline()
    expect(screen.getByText('Market Research')).toBeInTheDocument()
    expect(screen.getByText('Competitor Analysis')).toBeInTheDocument()
    expect(screen.getByText('Distribution Strategy')).toBeInTheDocument()
  })

  it('renders section descriptions when no results', () => {
    renderPipeline()
    expect(screen.getByText(/Analyze market size/)).toBeInTheDocument()
    expect(screen.getByText(/Deep-dive into competitors/)).toBeInTheDocument()
    expect(screen.getByText(/Rank channels/)).toBeInTheDocument()
  })

  it('shows empty state when no products', () => {
    renderPipeline(makeState([]))
    expect(screen.getByText('Add a product first to run validation.')).toBeInTheDocument()
  })

  it('renders Generate buttons for each section', () => {
    renderPipeline()
    const buttons = screen.getAllByRole('button', { name: /generate/i })
    expect(buttons.length).toBeGreaterThanOrEqual(3)
  })

  it('renders Run All button', () => {
    renderPipeline()
    expect(screen.getByRole('button', { name: /run all/i })).toBeInTheDocument()
  })

  it('shows product selector when multiple products', () => {
    const state = makeState([
      testProduct,
      { ...testProduct, id: 'prod-2', name: 'SecondProduct' },
    ])
    renderPipeline(state)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('does not show product selector for single product', () => {
    renderPipeline()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })
})
