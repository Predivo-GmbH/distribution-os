import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Landing } from '../Landing'

beforeAll(() => {
  // jsdom doesn't implement IntersectionObserver
  globalThis.IntersectionObserver = class {
    constructor(private cb: IntersectionObserverCallback) {}
    observe(el: Element) {
      // Immediately trigger as visible so Reveal components render content
      this.cb([{ isIntersecting: true, target: el } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
    }
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver
})

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
    expect(screen.getByText(/Stop building alone/)).toBeInTheDocument()
    expect(screen.getByText(/distributing/)).toBeInTheDocument()
  })

  it('renders the tagline for solo founders', () => {
    renderLanding()
    expect(screen.getByText('Built for solo founders')).toBeInTheDocument()
  })

  it('displays all 6 distribution engines', () => {
    renderLanding()
    expect(screen.getAllByText('Pull Engine').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Push Engine').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Bridge Engine').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Search Engine').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Equity Engine')).toBeInTheDocument()
    expect(screen.getByText('Persistence Engine')).toBeInTheDocument()
  })

  it('renders How It Works section with 4 steps', () => {
    renderLanding()
    expect(screen.getByText('Validate Your Idea')).toBeInTheDocument()
    expect(screen.getByText('Build Your Brand')).toBeInTheDocument()
    expect(screen.getByText('Activate Distribution')).toBeInTheDocument()
    expect(screen.getByText('Scale With AI')).toBeInTheDocument()
  })

  it('has CTA links to signup', () => {
    renderLanding()
    const signupLinks = screen.getAllByRole('link', { name: /get started|get my 48 ai workers|start free/i })
    expect(signupLinks.length).toBeGreaterThanOrEqual(2)
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
  })

  it('renders footer with company name', () => {
    renderLanding()
    expect(screen.getByText(/Predivo GmbH/)).toBeInTheDocument()
  })

  it('renders the final CTA section', () => {
    renderLanding()
    expect(screen.getByText(/Ready to automate your distribution/)).toBeInTheDocument()
  })

  it('renders pricing section with 4 tiers', () => {
    renderLanding()
    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('Growth')).toBeInTheDocument()
    expect(screen.getByText('Scale')).toBeInTheDocument()
  })

  it('renders FAQ section', () => {
    renderLanding()
    expect(screen.getByText('What exactly are AI workers?')).toBeInTheDocument()
    expect(screen.getByText(/Got/)).toBeInTheDocument()
  })

  it('renders testimonials', () => {
    renderLanding()
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
    expect(screen.getByText('Marcus Rivera')).toBeInTheDocument()
    expect(screen.getByText('Aisha Patel')).toBeInTheDocument()
  })
})
