/**
 * CRITICAL PATH E2E TESTS — ShipSolo (Distribution-OS)
 * =====================================================
 * Tests that the most fundamental user flows ACTUALLY WORK.
 * If these fail, the app is broken. CI MUST NOT use continue-on-error.
 *
 * Tests:
 * 1. Login flow: OTP send succeeds (no error)
 * 2. Edge functions: all reachable, not returning 500
 * 3. Protected routes: redirect works AND auth page is functional
 * 4. Supabase: project is alive, auth service healthy
 */

import { test, expect } from '@playwright/test'

// ── Project Config ──────────────────────────────────────────────────

const CONFIG = {
  authPath: '/login',
  testEmail: 'roger@mueller.ro',
  supabaseUrl: process.env.VITE_SUPABASE_URL || 'https://jxjpbmkgmuunpayqgbsx.supabase.co',
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || '',
  edgeFunctions: [
    'send-auth-email',
    'stripe-webhook',
    'delete-account',
  ],
  protectedRoutes: ['/dashboard', '/settings', '/products', '/inbox'],
}

// ── Login Flow ──────────────────────────────────────────────────────

test.describe('CRITICAL PATH — Login Flow', () => {
  test('OTP send succeeds without errors', async ({ page }) => {
    await page.goto(CONFIG.authPath)
    await page.waitForLoadState('networkidle')

    // Switch to Email Code tab
    const emailCodeTab = page.locator('button:has-text("Email Code")')
    await expect(emailCodeTab).toBeVisible({ timeout: 10000 })
    await emailCodeTab.click()

    // Fill email
    const emailInput = page.locator('input[type="email"]').first()
    await expect(emailInput).toBeVisible({ timeout: 5000 })
    await emailInput.fill(CONFIG.testEmail)

    // Submit
    const submitBtn = page.locator('button:has-text("Send Login Code")')
    await expect(submitBtn).toBeVisible()
    await submitBtn.click()

    // Wait for network response
    await page.waitForTimeout(5000)

    // FAIL: error alert should NOT appear
    const errorAlert = page.locator('[role="alert"]').first()
    const hasError = await errorAlert.isVisible().catch(() => false)
    if (hasError) {
      const errorText = await errorAlert.textContent()
      expect(hasError, `Login failed with error: "${errorText}"`).toBe(false)
    }

    // SUCCESS: code input screen should appear (shows "We sent a 6-digit code to...")
    const sentMessage = page.locator('text=/sent a 6-digit code/i').first()
    const sentVisible = await sentMessage.isVisible().catch(() => false)

    expect(
      sentVisible,
      'OTP code screen did not appear — email send failed'
    ).toBe(true)
  })

  test('auth page loads without JS errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto(CONFIG.authPath)
    await page.waitForLoadState('networkidle')

    expect(errors, `JS errors: ${errors.join(', ')}`).toEqual([])
  })

  test('password login form is functional', async ({ page }) => {
    await page.goto(CONFIG.authPath)
    await page.waitForLoadState('networkidle')

    // Password tab should be active by default
    const emailInput = page.locator('input[type="email"]').first()
    await expect(emailInput).toBeVisible({ timeout: 10000 })
    await expect(emailInput).toBeEditable()

    const passwordInput = page.locator('input[type="password"]')
    await expect(passwordInput).toBeVisible()
    await expect(passwordInput).toBeEditable()

    const signInBtn = page.locator('button:has-text("Sign In")')
    await expect(signInBtn).toBeVisible()
    await expect(signInBtn).toBeEnabled()
  })
})

// ── Edge Function Health ────────────────────────────────────────────

test.describe('CRITICAL PATH — Edge Functions', () => {
  for (const funcName of CONFIG.edgeFunctions) {
    test(`"${funcName}" is reachable (not 500)`, async ({ request }) => {
      const response = await request.post(
        `${CONFIG.supabaseUrl}/functions/v1/${funcName}`,
        {
          headers: { 'Content-Type': 'application/json' },
          data: JSON.stringify({ _health_check: true }),
          failOnStatusCode: false,
        }
      )

      const status = response.status()
      // 500 = function crashed or misconfigured
      expect(status, `"${funcName}" returned 500 — DOWN`).not.toBe(500)

      // Check for verify_jwt misconfiguration
      if (status === 401) {
        const body = await response.text()
        expect(
          body.includes('requires authorization token'),
          `"${funcName}" has verify_jwt incorrectly enabled`
        ).toBe(false)
      }
    })
  }
})

// ── Protected Routes ────────────────────────────────────────────────

test.describe('CRITICAL PATH — Route Guards', () => {
  for (const route of CONFIG.protectedRoutes) {
    test(`${route} redirects to login with working form`, async ({ page }) => {
      await page.goto(route)
      await page.waitForLoadState('networkidle')

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/)

      // Auth form should be functional (not just present)
      const emailInput = page.locator('input[type="email"]').first()
      await expect(emailInput).toBeVisible({ timeout: 5000 })
      await expect(emailInput).toBeEditable()

      const signInBtn = page.locator('button:has-text("Sign In")')
      await expect(signInBtn).toBeVisible()
      await expect(signInBtn).toBeEnabled()
    })
  }
})

// ── Infrastructure ──────────────────────────────────────────────────

test.describe('CRITICAL PATH — Infrastructure', () => {
  test('Supabase auth service is healthy', async ({ request }) => {
    const response = await request.get(
      `${CONFIG.supabaseUrl}/auth/v1/health`,
      {
        headers: CONFIG.supabaseAnonKey ? { apikey: CONFIG.supabaseAnonKey } : {},
        failOnStatusCode: false,
      }
    )
    expect(response.status()).toBe(200)
  })

  test('Supabase REST API is reachable', async ({ request }) => {
    const response = await request.get(
      `${CONFIG.supabaseUrl}/rest/v1/`,
      {
        headers: { apikey: 'test' },
        failOnStatusCode: false,
      }
    )
    // Any response < 500 means the project is alive
    expect(response.status()).toBeLessThan(500)
  })

  test('Production site is reachable', async ({ request }) => {
    const response = await request.get('https://distributionos.predivo.ch', {
      failOnStatusCode: false,
    })
    expect(response.status()).toBeLessThan(500)
  })
})
