import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PasswordGate } from '../PasswordGate'
import { APP_NAME } from '@/lib/app-config'

describe('PasswordGate', () => {
  it('shows password form when not authenticated', () => {
    render(
      <PasswordGate>
        <div>Protected content</div>
      </PasswordGate>
    )
    expect(screen.getByText('Early Access')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Access code')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('shows children when session key is set', () => {
    sessionStorage.setItem('distribution-os-dev-access', 'true')
    render(
      <PasswordGate>
        <div>Protected content</div>
      </PasswordGate>
    )
    expect(screen.getByText('Protected content')).toBeInTheDocument()
    expect(screen.queryByText('Early Access')).not.toBeInTheDocument()
  })

  it('renders Enter button', () => {
    render(
      <PasswordGate>
        <div>Content</div>
      </PasswordGate>
    )
    expect(screen.getByRole('button', { name: 'Enter' })).toBeInTheDocument()
  })

  it('shows error message on wrong code submission', async () => {
    const user = userEvent.setup()
    render(
      <PasswordGate>
        <div>Content</div>
      </PasswordGate>
    )
    const input = screen.getByPlaceholderText('Access code')
    await user.type(input, 'wrongpassword')
    await user.click(screen.getByRole('button', { name: 'Enter' }))
    // Should show error and clear input
    expect(screen.getByText(/Incorrect code/)).toBeInTheDocument()
  })

  it('input field is present and interactive', () => {
    render(
      <PasswordGate>
        <div>Content</div>
      </PasswordGate>
    )
    const input = screen.getByPlaceholderText('Access code')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'password')
  })

  it('shows app branding', () => {
    render(
      <PasswordGate>
        <div>Content</div>
      </PasswordGate>
    )
    expect(screen.getByText(APP_NAME)).toBeInTheDocument()
  })
})
