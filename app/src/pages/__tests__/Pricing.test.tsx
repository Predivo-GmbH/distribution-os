import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Pricing } from '../Pricing'

describe('Pricing Page', () => {
  function renderPricing() {
    return render(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>
    )
  }

  it('renders the pricing heading', () => {
    renderPricing()
    expect(screen.getByText(/Simple pricing/)).toBeInTheDocument()
  })

  it('displays all 4 tier plans', () => {
    renderPricing()
    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('Growth')).toBeInTheDocument()
    expect(screen.getByText('Scale')).toBeInTheDocument()
  })

  it('shows correct prices', () => {
    renderPricing()
    expect(screen.getByText('$0')).toBeInTheDocument()
    expect(screen.getByText('$19')).toBeInTheDocument()
    expect(screen.getByText('$49')).toBeInTheDocument()
    expect(screen.getByText('$99')).toBeInTheDocument()
  })

  it('marks Growth as the recommended tier', () => {
    renderPricing()
    expect(screen.getByText('Recommended')).toBeInTheDocument()
  })

  it('has a CTA per tier (buttons wired to checkout since 2026-08-01)', () => {
    renderPricing()
    const tierCtas = screen.getAllByRole('button', { name: /start free|get starter|get growth|get scale/i })
    expect(tierCtas.length).toBe(4)
    expect(screen.getAllByRole('link', { name: /get started/i }).length).toBeGreaterThanOrEqual(1)
  })

  it('renders footer with navigation back home', () => {
    renderPricing()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
  })

  it('shows all engines note', () => {
    renderPricing()
    expect(screen.getByText(/All plans include all 6 distribution engines/)).toBeInTheDocument()
  })
})
