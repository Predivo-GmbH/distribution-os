import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Logo } from '../Logo'

describe('Logo', () => {
  it('renders at default size 32px', () => {
    const { container } = render(<Logo />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.width).toBe('32px')
    expect(wrapper.style.height).toBe('32px')
  })

  it('renders at custom size', () => {
    const { container } = render(<Logo size={48} />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.width).toBe('48px')
    expect(wrapper.style.height).toBe('48px')
  })

  it('renders three bars (growth icon)', () => {
    const { container } = render(<Logo />)
    const bars = container.querySelectorAll('[class*="bg-"]')
    // Should have at least the 3 bars + wrapper
    expect(bars.length).toBeGreaterThanOrEqual(3)
  })

  it('has accent background color class', () => {
    const { container } = render(<Logo />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('bg-[var(--color-accent)]')
  })
})
