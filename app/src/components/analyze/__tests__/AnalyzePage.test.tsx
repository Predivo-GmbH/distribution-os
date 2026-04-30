import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AnalyzePage } from '../AnalyzePage'
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
  runSiteAnalyzer: vi.fn().mockResolvedValue({ success: true, content: 'Site analysis result' }),
  runWebsiteAudit: vi.fn().mockResolvedValue({ success: true, content: 'Website audit result' }),
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

describe('AnalyzePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function renderComponent(state?: AppState) {
    return render(
      <HelmetProvider>
        <MemoryRouter>
          <AnalyzePage state={state ?? makeState([testProduct])} />
        </MemoryRouter>
      </HelmetProvider>
    )
  }

  it('renders the heading', () => {
    renderComponent()
    expect(screen.getByText('Site Analysis')).toBeInTheDocument()
  })

  it('renders both tabs', () => {
    renderComponent()
    expect(screen.getByRole('button', { name: /Deep Analysis/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Quick Score/i })).toBeInTheDocument()
  })

  it('renders URL input', () => {
    renderComponent()
    expect(screen.getByPlaceholderText('https://competitor.com')).toBeInTheDocument()
  })

  it('shows empty state when no products', () => {
    renderComponent(makeState([]))
    expect(screen.getByText('Add a product first to analyze sites.')).toBeInTheDocument()
  })

  it('renders Analyze button', () => {
    renderComponent()
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument()
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
