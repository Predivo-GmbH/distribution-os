import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../Input'

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('accepts and displays value', () => {
    render(<Input value="hello" readOnly />)
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument()
  })

  it('handles user typing', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Input onChange={onChange} />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'test')
    expect(onChange).toHaveBeenCalled()
  })

  it('supports email type', () => {
    render(<Input type="email" placeholder="Email" />)
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email')
  })

  it('supports password type', () => {
    const { container } = render(<Input type="password" />)
    const input = container.querySelector('input')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('supports required attribute', () => {
    render(<Input required placeholder="Required" />)
    expect(screen.getByPlaceholderText('Required')).toBeRequired()
  })

  it('merges custom className', () => {
    render(<Input className="custom-input" placeholder="Custom" />)
    expect(screen.getByPlaceholderText('Custom').className).toContain('custom-input')
  })

  it('has 44px minimum height for touch targets', () => {
    render(<Input placeholder="Touch" />)
    expect(screen.getByPlaceholderText('Touch').className).toContain('min-h-[44px]')
  })
})
