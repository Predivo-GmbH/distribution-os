import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with status role', () => {
    render(<LoadingSpinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('has accessible "Loading..." label', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toHaveClass('sr-only')
  })

  it('applies full-page class when fullPage prop is true', () => {
    render(<LoadingSpinner fullPage />)
    const container = screen.getByRole('status')
    expect(container.className).toContain('min-h-dvh')
  })

  it('does not apply full-page class by default', () => {
    render(<LoadingSpinner />)
    const container = screen.getByRole('status')
    expect(container.className).not.toContain('min-h-dvh')
    expect(container.className).toContain('flex-1')
  })

  it('has aria-hidden spinner div', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status').querySelector('[aria-hidden="true"]')
    expect(spinner).toBeInTheDocument()
    expect(spinner?.className).toContain('animate-spin')
  })
})
