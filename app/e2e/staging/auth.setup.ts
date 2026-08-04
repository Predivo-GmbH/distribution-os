/**
 * Staging auth setup — authenticate the e2e test user against the STAGING Supabase
 * project (jckctrtkstejolddqzlk) and persist the session into storageState so the
 * v11 gates run as a real logged-in user.
 *
 * Signs in via a direct Node fetch (outside the browser, so HTTP Basic auth on the
 * staging origin never interferes), then injects the session into localStorage under
 * the `sb-<ref>-auth-token` key the supabase-js SDK reads on boot.
 *
 * Env (provided by staging-gates.yml; sensible local defaults below):
 *   E2E_SUPABASE_URL          staging Supabase project URL
 *   STAGING_SUPABASE_ANON_KEY staging anon/publishable key (client-safe)
 *   STAGING_TEST_EMAIL / STAGING_TEST_PASSWORD  confirmed staging test user
 */
import { test as setup, expect } from '@playwright/test'

const AUTH_FILE = 'playwright/.auth/staging-user.json'

const SUPABASE_URL = process.env.E2E_SUPABASE_URL || 'https://jckctrtkstejolddqzlk.supabase.co'
// anon key is client-safe (embedded in every browser bundle); env-overridable for rotation.
const ANON_KEY = process.env.STAGING_SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impja2N0cnRrc3Rlam9sZGRxemxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MTk2MjIsImV4cCI6MjEwMDk5NTYyMn0.p5CkT07WpbEk01Tcm15fICJws-UsbyEkaReXHzVMWok'

const REF = (SUPABASE_URL.match(/https?:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1]) || 'jckctrtkstejolddqzlk'
const EMAIL = process.env.STAGING_TEST_EMAIL || 'e2e-test@distributionos-test.local'
const PASSWORD = process.env.STAGING_TEST_PASSWORD || ''

setup('authenticate on staging', async ({ page }) => {
  expect(PASSWORD, 'STAGING_TEST_PASSWORD must be set').not.toBe('')

  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  const bodyText = await res.text()
  expect(res.ok, `Login failed (${EMAIL}): ${bodyText}`).toBeTruthy()
  const session = JSON.parse(bodyText)

  // Navigate to the app, then seed the SDK session + PasswordGate bypass into localStorage.
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')

  await page.evaluate(({ s, ref }) => {
    // PasswordGate is disabled on staging builds, but set the bypass key too for safety.
    sessionStorage.setItem('distribution-os-dev-access', 'true')
    localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify({
      access_token: s.access_token,
      refresh_token: s.refresh_token,
      expires_at: s.expires_at,
      expires_in: s.expires_in,
      token_type: s.token_type,
      user: s.user,
    }))
  }, { s: session, ref: REF })

  // Confirm the session takes: an authenticated route must not bounce to /login.
  await page.goto('/products')
  await page.waitForLoadState('networkidle')
  expect(page.url(), 'authenticated route should not redirect to /login').not.toContain('/login')

  await page.context().storageState({ path: AUTH_FILE })
})
