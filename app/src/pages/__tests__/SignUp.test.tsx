import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { SignUp } from '../SignUp'

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    sendOtp: vi.fn().mockResolvedValue(undefined),
    verifyOtp: vi.fn().mockResolvedValue({ isNewUser: true }),
    signUp: vi.fn().mockResolvedValue(undefined),
    user: null,
    loading: false,
    session: null,
    signIn: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
    signOut: vi.fn(),
  }),
}))

describe('SignUp Page', () => {
  function renderSignUp() {
    return render(
      <HelmetProvider>
        <MemoryRouter>
          <SignUp />
        </MemoryRouter>
      </HelmetProvider>
    )
  }

  it('renders the create account heading', () => {
    renderSignUp()
    expect(screen.getByText('Create your account')).toBeInTheDocument()
  })

  it('shows email step first', () => {
    renderSignUp()
    expect(screen.getByText('Enter your email to get started')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
  })

  it('renders Continue button', () => {
    renderSignUp()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('has link to login', () => {
    renderSignUp()
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login')
  })

  it('shows Distribution OS branding', () => {
    renderSignUp()
    expect(screen.getByText('Distribution OS')).toBeInTheDocument()
  })

  it('email input is required', () => {
    renderSignUp()
    expect(screen.getByPlaceholderText('you@example.com')).toBeRequired()
  })
})
