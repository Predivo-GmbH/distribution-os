import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Landing } from '../Landing'

describe('Landing Page', () => {
  function renderLanding() {
    return render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    )
  }

  it('renders the hero heading', () => {
    renderLanding()
    expect(screen.getByText(/Stop building/)).toBeInTheDocument()
    expect(screen.getByText(/Start distributing/)).toBeInTheDocument()
  })

  it('renders the tagline for solo founders', () => {
    renderLanding()
    expect(screen.getByText('Built for solo founders')).toBeInTheDocument()
  })

  it('displays all 6 distribution engines', () => {
    renderLanding()
    expect(screen.getByText('Pull Engine')).toBeInTheDocument()
    expect(screen.getByText('Push Engine')).toBeInTheDocument()
    expect(screen.getByText('Bridge Engine')).toBeInTheDocument()
    expect(screen.getByText('Search Engine')).toBeInTheDocument()
    expect(screen.getByText('Equity Engine')).toBeInTheDocument()
    expect(screen.getByText('Persistence Engine')).toBeInTheDocument()
  })

  it('renders How It Works section with 4 steps', () => {
    renderLanding()
    expect(screen.getByText('How It Works')).toBeInTheDocument()
    expect(screen.getByText('Add Your Product')).toBeInTheDocument()
    expect(screen.getByText('Activate Engines')).toBeInTheDocument()
    expect(screen.getByText('Execute Weekly Tasks')).toBeInTheDocument()
    expect(screen.getByText('Track & Compound')).toBeInTheDocument()
  })

  it('has CTA links to signup', () => {
    renderLanding()
    const signupLinks = screen.getAllByRole('link', { name: /get started|start free/i })
    expect(signupLinks.length).toBeGreaterThanOrEqual(2) // Hero + CTA
    for (const link of signupLinks) {
      expect(link).toHaveAttribute('href', '/signup')
    }
  })

  it('has navigation links', () => {
    renderLanding()
    const loginLinks = screen.getAllByRole('link', { name: /log in/i })
    expect(loginLinks.length).toBeGreaterThanOrEqual(1)
    for (const link of loginLinks) {
      expect(link).toHaveAttribute('href', '/login')
    }
    const pricingLinks = screen.getAllByRole('link', { name: /pricing/i })
    expect(pricingLinks.length).toBeGreaterThanOrEqual(1)
  })

  it('renders footer with company name', () => {
    renderLanding()
    expect(screen.getByText(/Predivo GmbH/)).toBeInTheDocument()
  })

  it('renders the "Ready to distribute?" CTA section', () => {
    renderLanding()
    expect(screen.getByText('Ready to distribute?')).toBeInTheDocument()
    expect(screen.getByText(/No credit card required/)).toBeInTheDocument()
  })
})
