import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ResetPassword } from '../ResetPassword'
import { APP_NAME } from '@/lib/app-config'

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    resetPassword: vi.fn().mockResolvedValue(undefined),
    updatePassword: vi.fn().mockResolvedValue(undefined),
    user: null,
    loading: false,
    session: null,
    signIn: vi.fn(),
    signUp: vi.fn(),
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    signOut: vi.fn(),
  }),
}))

describe('ResetPassword Page', () => {
  function renderResetPassword() {
    return render(
      <HelmetProvider>
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
      </HelmetProvider>
    )
  }

  it('renders the reset password heading', () => {
    renderResetPassword()
    expect(screen.getByText('Reset password')).toBeInTheDocument()
  })

  it('shows email input and instructions', () => {
    renderResetPassword()
    expect(screen.getByText(/send you a reset link/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
  })

  it('renders Send Reset Link button', () => {
    renderResetPassword()
    expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument()
  })

  it('has back to login link', () => {
    renderResetPassword()
    expect(screen.getByRole('link', { name: 'Back to Login' })).toHaveAttribute('href', '/login')
  })

  it('shows app branding', () => {
    renderResetPassword()
    expect(screen.getByText(APP_NAME)).toBeInTheDocument()
  })
})
