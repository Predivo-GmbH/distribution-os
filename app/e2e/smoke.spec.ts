import { test, expect } from '@playwright/test'
import { unlockGate, unlockGateAuth, seedProduct } from './helpers'

test.describe('Smoke Tests — All Routes Load', () => {
  test('Landing page loads', async ({ page }) => {
    await unlockGate(page)
    await page.goto('/')
    await expect(page.locator('text=Stop building')).toBeVisible()
    await expect(page.locator('text=Start distributing')).toBeVisible()
  })

  test('Pricing page loads', async ({ page }) => {
    await unlockGate(page)
    await page.goto('/pricing')
    await expect(page.locator('text=Simple pricing.')).toBeVisible()
    await expect(page.locator('text=$0')).toBeVisible()
    await expect(page.locator('text=$49')).toBeVisible()
  })

  test('Login page loads', async ({ page }) => {
    await unlockGate(page)
    await page.goto('/login')
    await expect(page.locator('text=Welcome back')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('SignUp page loads', async ({ page }) => {
    await unlockGate(page)
    await page.goto('/signup')
    await expect(page.locator('text=Create your account')).toBeVisible()
  })

  test('Reset Password page loads', async ({ page }) => {
    await unlockGate(page)
    await page.goto('/reset-password')
    await expect(page.locator('text=Reset password')).toBeVisible()
  })

  test('Dashboard loads with seeded product', async ({ page }) => {
    await unlockGateAuth(page)
    await seedProduct(page)
    await page.goto('/dashboard')
    await expect(page.locator('text=Command Center')).toBeVisible()
  })

  test('Products page loads', async ({ page }) => {
    await unlockGateAuth(page)
    await seedProduct(page)
    await page.goto('/products')
    await expect(page.locator('text=Products')).toBeVisible()
    await expect(page.locator('text=TestSaaS')).toBeVisible()
  })

  test('Product detail page loads', async ({ page }) => {
    await unlockGateAuth(page)
    await seedProduct(page)
    await page.goto('/products/test-product-1')
    await expect(page.locator('h1:has-text("TestSaaS")')).toBeVisible()
  })

  test('Settings page loads', async ({ page }) => {
    await unlockGateAuth(page)
    await seedProduct(page)
    await page.goto('/settings')
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible()
  })

  test('Briefing Room loads', async ({ page }) => {
    await unlockGateAuth(page)
    await seedProduct(page)
    await page.goto('/briefing')
    await expect(page.locator('text=Briefing Room')).toBeVisible()
  })

  test('Inbox page loads', async ({ page }) => {
    await unlockGateAuth(page)
    await seedProduct(page)
    await page.goto('/inbox')
    await expect(page.locator('h1:has-text("Inbox")')).toBeVisible()
  })

  test('No console errors on landing page', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await unlockGate(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(errors).toHaveLength(0)
  })
})
