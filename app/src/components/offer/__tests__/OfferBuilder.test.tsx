import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { OfferBuilder } from '../OfferBuilder'
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
  runProductDefiner: vi.fn().mockResolvedValue({ success: true, content: 'Product brief result' }),
  runOfferDesigner: vi.fn().mockResolvedValue({ success: true, content: 'Offer design result' }),
}))

// Mock storage
vi.mock('@/lib/storage', () => ({
  loadInbox: vi.fn().mockReturnValue([]),
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

describe('OfferBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function renderComponent(state?: AppState) {
    return render(
      <HelmetProvider>
        <MemoryRouter>
          <OfferBuilder state={state ?? makeState([testProduct])} />
        </MemoryRouter>
      </HelmetProvider>
    )
  }

  it('renders the heading', () => {
    renderComponent()
    expect(screen.getByText('Offer Builder')).toBeInTheDocument()
  })

  it('renders both sections', () => {
    renderComponent()
    expect(screen.getByText('Product Brief')).toBeInTheDocument()
    expect(screen.getByText('Offer Design')).toBeInTheDocument()
  })

  it('renders section descriptions when no results', () => {
    renderComponent()
    expect(screen.getByText(/Define your product: name, persona/)).toBeInTheDocument()
    expect(screen.getByText(/Design pricing tiers/)).toBeInTheDocument()
  })

  it('shows empty state when no products', () => {
    renderComponent(makeState([]))
    expect(screen.getByText('Add a product first to build your offer.')).toBeInTheDocument()
  })

  it('renders Generate buttons for each section', () => {
    renderComponent()
    const buttons = screen.getAllByRole('button', { name: /generate/i })
    expect(buttons.length).toBeGreaterThanOrEqual(2)
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
