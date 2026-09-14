import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // captchaToken is a Cloudflare Turnstile token, threaded through to GoTrue's captcha-protected
  // endpoints (/token, /signup, /otp, /recover) as options.captchaToken. GoTrue IGNORES it until
  // CAPTCHA is enabled in this project's Auth settings (a separate, production-only switch), so
  // passing it — or not — is a no-op today. That is what makes shipping this wiring safe on its
  // own: it only starts mattering once the server half lands.
  const signIn = useCallback(async (email: string, password: string, captchaToken?: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: captchaToken ? { captchaToken } : undefined,
    })
    if (error) throw error
  }, [])

  const signUp = useCallback(async (email: string, password: string, captchaToken?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: captchaToken ? { captchaToken } : undefined,
    })
    if (error) throw error
  }, [])

  const sendOtp = useCallback(async (email: string, captchaToken?: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, ...(captchaToken ? { captchaToken } : {}) },
    })
    if (error) throw error
  }, [])

  const sendLoginOtp = useCallback(async (email: string, captchaToken?: string) => {
    // shouldCreateUser: false — only sends OTP if account exists. Supabase returns 200 regardless
    // (prevents email enumeration), so this is exactly the endpoint an unauthenticated caller can
    // abuse to make Distribution-OS email a login code to any address, unlimited, until CAPTCHA is
    // enforced server-side. captchaToken is the fix's client half for it.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, ...(captchaToken ? { captchaToken } : {}) },
    })
    if (error) throw error
  }, [])

  const verifyOtp = useCallback(async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })
    if (error) throw error
    return { isNewUser: !data.user?.user_metadata?.full_name }
  }, [])

  const resetPassword = useCallback(async (email: string, captchaToken?: string) => {
    const redirectTo = `${window.location.origin}/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
      ...(captchaToken ? { captchaToken } : {}),
    })
    if (error) throw error
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    sendOtp,
    sendLoginOtp,
    verifyOtp,
    resetPassword,
    updatePassword,
    signOut,
  }
}
