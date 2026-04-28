import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Login } from '../Login'
import { APP_NAME } from '@/lib/app-config'

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    signIn: vi.fn().mockResolvedValue(undefined),
    user: null,
    loading: false,
    session: null,
    signUp: vi.fn(),
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
    signOut: vi.fn(),
  }),
}))

describe('Login Page', () => {
  function renderLogin() {
    return render(
      <HelmetProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </HelmetProvider>
    )
  }

  it('renders the welcome heading', () => {
    renderLogin()
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
  })

  it('renders email and password inputs', () => {
    renderLogin()
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
  })

  it('renders sign in button', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('has link to sign up', () => {
    renderLogin()
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/signup')
  })

  it('has link to forgot password', () => {
    renderLogin()
    expect(screen.getByRole('link', { name: /forgot password/i })).toHaveAttribute('href', '/reset-password')
  })

  it('has required attribute on email input', () => {
    renderLogin()
    expect(screen.getByPlaceholderText('you@example.com')).toBeRequired()
  })

  it('shows app branding', () => {
    renderLogin()
    expect(screen.getByText(APP_NAME)).toBeInTheDocument()
  })
})
