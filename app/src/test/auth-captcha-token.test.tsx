/**
 * auth-captcha-token.test.tsx — proves the client half of the sign-in bot-protection fix.
 *
 * THE VULNERABILITY (measured live 2026-09-14): production Supabase project jxjpbmkgmuunpayqgbsx
 * accepts a tokenless, unauthenticated POST /auth/v1/recover with HTTP 200, and a tokenless POST
 * /auth/v1/otp reaches user lookup (422 otp_disabled) instead of being refused — captcha is not
 * enforced. So today, anyone who knows a Distribution-OS customer's email can make it send that
 * customer a password-reset link or a login code, unlimited, from the fleet's shared Postmark
 * sending reputation.
 *
 * The fix threads a Cloudflare Turnstile captchaToken through every captcha-protected GoTrue
 * endpoint useAuth() exposes: signIn (/token), signUp (/signup), sendOtp (/otp signup),
 * sendLoginOtp (/otp login — the endpoint the incident describes), resetPassword (/recover).
 * Enabling CAPTCHA in Supabase Auth is PROJECT-WIDE, so every one of these must carry the token
 * or the server-side enable would lock real users out of whichever entry point was missed.
 *
 * This suite asserts each method forwards the token into the exact Supabase options field the SDK
 * sends to GoTrue as options.captchaToken. It does NOT prove server enforcement — that is a
 * Supabase Auth-settings switch, a separate production change outside this repo's client code —
 * and is proven live by supabase/functions/_shared/signin-captcha.prod.test.mjs once flipped.
 * This proves the wiring is correct and ready, and is a no-op (token ignored) until then.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Spies for every supabase.auth method useAuth() calls. vi.hoisted so the factory below (which
// vi.mock hoists to the top of the module) can close over them without a TDZ error.
const auth = vi.hoisted(() => ({
  getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
  onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: null }),
  signUp: vi.fn().mockResolvedValue({ data: null, error: null }),
  signInWithOtp: vi.fn().mockResolvedValue({ data: null, error: null }),
  resetPasswordForEmail: vi.fn().mockResolvedValue({ data: null, error: null }),
}))
vi.mock('@/lib/supabase', () => ({
  supabase: { auth },
  isSupabaseConfigured: true,
}))

import { useAuth } from '@/hooks/useAuth'

const TOKEN = 'turnstile-token-abc123'

beforeEach(() => {
  Object.values(auth).forEach((f) => 'mockClear' in f && f.mockClear())
})

describe('useAuth methods forward the Turnstile captchaToken to Supabase', () => {
  it('sendLoginOtp passes captchaToken (the endpoint the incident abused)', async () => {
    const { result } = renderHook(() => useAuth())
    await act(async () => { await result.current.sendLoginOtp('user@example.com', TOKEN) })
    expect(auth.signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com',
        options: expect.objectContaining({ shouldCreateUser: false, captchaToken: TOKEN }),
      }),
    )
  })

  it('sendOtp (signup) passes captchaToken', async () => {
    const { result } = renderHook(() => useAuth())
    await act(async () => { await result.current.sendOtp('new@example.com', TOKEN) })
    expect(auth.signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new@example.com',
        options: expect.objectContaining({ shouldCreateUser: true, captchaToken: TOKEN }),
      }),
    )
  })

  it('signIn (signInWithPassword) passes captchaToken', async () => {
    const { result } = renderHook(() => useAuth())
    await act(async () => { await result.current.signIn('user@example.com', 'pw', TOKEN) })
    expect(auth.signInWithPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com',
        password: 'pw',
        options: expect.objectContaining({ captchaToken: TOKEN }),
      }),
    )
  })

  it('signUp passes captchaToken', async () => {
    const { result } = renderHook(() => useAuth())
    await act(async () => { await result.current.signUp('new@example.com', 'pw', TOKEN) })
    expect(auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new@example.com',
        password: 'pw',
        options: expect.objectContaining({ captchaToken: TOKEN }),
      }),
    )
  })

  it('resetPassword passes captchaToken alongside redirectTo', async () => {
    const { result } = renderHook(() => useAuth())
    await act(async () => { await result.current.resetPassword('user@example.com', TOKEN) })
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'user@example.com',
      expect.objectContaining({ captchaToken: TOKEN }),
    )
  })

  it('omits captchaToken cleanly when none is supplied (outage-safe no-op before server enable)', async () => {
    const { result } = renderHook(() => useAuth())
    await act(async () => { await result.current.sendLoginOtp('user@example.com') })
    const arg = auth.signInWithOtp.mock.calls[0][0]
    expect(arg.options).toEqual({ shouldCreateUser: false })
    expect('captchaToken' in arg.options).toBe(false)
  })

  it('signIn omits the options.captchaToken field entirely when no token is supplied', async () => {
    const { result } = renderHook(() => useAuth())
    await act(async () => { await result.current.signIn('user@example.com', 'pw') })
    const arg = auth.signInWithPassword.mock.calls[0][0]
    expect(arg.options).toBeUndefined()
  })
})
