import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuditPage } from '../AuditPage'
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
  runSecurityAudit: vi.fn().mockResolvedValue({ success: true, content: 'Security audit result' }),
  runSEOAudit: vi.fn().mockResolvedValue({ success: true, content: 'SEO audit result' }),
  runPerformanceAudit: vi.fn().mockResolvedValue({ success: true, content: 'Performance audit result' }),
  runCodeQualityAudit: vi.fn().mockResolvedValue({ success: true, content: 'Code quality audit result' }),
  runAccessibilityAudit: vi.fn().mockResolvedValue({ success: true, content: 'Accessibility audit result' }),
  runUIConsistencyAudit: vi.fn().mockResolvedValue({ success: true, content: 'UI consistency audit result' }),
  runResponsiveAudit: vi.fn().mockResolvedValue({ success: true, content: 'Responsive audit result' }),
  runMobileVisualAudit: vi.fn().mockResolvedValue({ success: true, content: 'Mobile visual audit result' }),
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

describe('AuditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function renderComponent(state?: AppState) {
    return render(
      <HelmetProvider>
        <MemoryRouter>
          <AuditPage state={state ?? makeState([testProduct])} />
        </MemoryRouter>
      </HelmetProvider>
    )
  }

  it('renders the heading', () => {
    renderComponent()
    expect(screen.getByText('8-Domain Audit')).toBeInTheDocument()
  })

  it('renders all 8 domain cards', () => {
    renderComponent()
    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.getByText('SEO')).toBeInTheDocument()
    expect(screen.getByText('Performance')).toBeInTheDocument()
    expect(screen.getByText('Code Quality')).toBeInTheDocument()
    expect(screen.getByText('Accessibility')).toBeInTheDocument()
    expect(screen.getByText('UI Consistency')).toBeInTheDocument()
    expect(screen.getByText('Responsive')).toBeInTheDocument()
    expect(screen.getByText('Mobile Visual')).toBeInTheDocument()
  })

  it('shows empty state when no products', () => {
    renderComponent(makeState([]))
    expect(screen.getByText('Add a product first to run an audit.')).toBeInTheDocument()
  })

  it('renders Run Full Audit button', () => {
    renderComponent()
    expect(screen.getByRole('button', { name: /run full audit/i })).toBeInTheDocument()
  })

  it('renders Run buttons for each domain', () => {
    renderComponent()
    const buttons = screen.getAllByRole('button', { name: /^run$/i })
    expect(buttons.length).toBeGreaterThanOrEqual(8)
  })

  it('does not show Export Report initially', () => {
    renderComponent()
    expect(screen.queryByRole('button', { name: /export report/i })).not.toBeInTheDocument()
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
