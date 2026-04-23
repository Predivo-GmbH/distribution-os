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
    expect(screen.getByText('Simple, transparent pricing')).toBeInTheDocument()
  })

  it('displays Free and Pro plans', () => {
    renderPricing()
    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
  })

  it('shows $0/month for free plan', () => {
    renderPricing()
    expect(screen.getByText('$0')).toBeInTheDocument()
  })

  it('shows $19/month for pro plan', () => {
    renderPricing()
    expect(screen.getByText('$19')).toBeInTheDocument()
  })

  it('displays feature comparison items', () => {
    renderPricing()
    // Features appear twice (once in each plan column)
    const engines = screen.getAllByText('All 6 distribution engines')
    expect(engines.length).toBeGreaterThanOrEqual(2)
    const scoring = screen.getAllByText('Weekly task scoring')
    expect(scoring.length).toBeGreaterThanOrEqual(2)
    const briefing = screen.getAllByText('Briefing Room')
    expect(briefing.length).toBeGreaterThanOrEqual(2)
    const darkMode = screen.getAllByText('Dark mode')
    expect(darkMode.length).toBeGreaterThanOrEqual(2)
  })

  it('marks Pro as recommended', () => {
    renderPricing()
    expect(screen.getByText('Recommended')).toBeInTheDocument()
  })

  it('has signup CTA links', () => {
    renderPricing()
    const signupLinks = screen.getAllByRole('link', { name: /get started|start free|upgrade/i })
    expect(signupLinks.length).toBeGreaterThanOrEqual(2)
  })

  it('renders footer with navigation back home', () => {
    renderPricing()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
  })
})
