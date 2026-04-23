import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tooltip } from '../Tooltip'

describe('Tooltip', () => {
  it('renders children', () => {
    render(<Tooltip content="Tip text">Hover me</Tooltip>)
    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('does not show tooltip content initially', () => {
    render(<Tooltip content="Tip text">Hover me</Tooltip>)
    expect(screen.queryByText('Tip text')).not.toBeInTheDocument()
  })

  it('shows tooltip on click (for mobile)', async () => {
    const user = userEvent.setup()
    render(<Tooltip content="Tip text">Click me</Tooltip>)
    await user.click(screen.getByText('Click me'))
    expect(screen.getByText('Tip text')).toBeInTheDocument()
  })

  it('has cursor-help class on trigger', () => {
    render(<Tooltip content="Tip text">Hover me</Tooltip>)
    const trigger = screen.getByText('Hover me')
    expect(trigger.className).toContain('cursor-help')
  })

  it('trigger is focusable with tabIndex', () => {
    render(<Tooltip content="Tip text">Focus me</Tooltip>)
    expect(screen.getByText('Focus me')).toHaveAttribute('tabindex', '0')
  })

  it('has role="button" on trigger', () => {
    render(<Tooltip content="Tip text">Button</Tooltip>)
    expect(screen.getByRole('button', { name: 'Button' })).toBeInTheDocument()
  })
})
