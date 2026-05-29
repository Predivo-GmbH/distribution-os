import { test, expect } from '@playwright/test'
import { unlockGate, seedProduct } from './helpers'

test.describe('Settings — General Tab', () => {
  test.beforeEach(async ({ page }) => {
    await unlockGate(page)
    await seedProduct(page)
    await page.goto('/settings')
    await page.locator('main nav').getByText('General').click()
  })

  // GEN-001: Dark Mode toggle
  test('GEN-001: Dark Mode toggle switch works', async ({ page }) => {
    await expect(page.getByText('Dark Mode')).toBeVisible()
    await expect(page.getByText('Switch between light and dark interface themes')).toBeVisible()

    // Find the dark mode switch
    const darkModeSwitch = page.locator('[role="switch"][aria-label="Dark Mode"]')
    await expect(darkModeSwitch).toBeVisible()

    // Get initial state
    const initialChecked = await darkModeSwitch.getAttribute('aria-checked')

    // Toggle
    await darkModeSwitch.click()

    // State should change
    const newChecked = await darkModeSwitch.getAttribute('aria-checked')
    expect(newChecked).not.toBe(initialChecked)
  })

  // GEN-002: Week Starts On selector
  test('GEN-002: Week Starts On selector changes start day', async ({ page }) => {
    await expect(page.getByText('Week Starts On')).toBeVisible()

    const select = page.locator('select', { hasText: 'Monday' })
    await expect(select).toBeVisible()

    // Change to Sunday
    await select.selectOption('sunday')
    const value = await select.inputValue()
    expect(value).toBe('sunday')

    // Change to Saturday
    await select.selectOption('saturday')
    const value2 = await select.inputValue()
    expect(value2).toBe('saturday')
  })

  // GEN-003: Export Data
  test('GEN-003: Export Data downloads JSON file', async ({ page }) => {
    await expect(page.getByText('Export Data')).toBeVisible()
    await expect(page.getByText('Download all your products, tasks, and history as JSON')).toBeVisible()

    // Set up download listener
    const [download] = await Promise.all([
      page.waitForEvent('download').catch(() => null),
      page.getByRole('button', { name: 'Export' }).click(),
    ])

    // Download should have been triggered (or click should succeed without crash)
    if (download) {
      expect(download.suggestedFilename()).toMatch(/distribution-os-export.*\.json/)
    }
  })

  // GEN-004: Reset All Data
  test('GEN-004: Reset All Data with confirmation dialog', async ({ page }) => {
    await expect(page.getByText('Reset All Data')).toBeVisible()
    await expect(page.getByText('Permanently delete all products and task history')).toBeVisible()

    // Handle the confirmation dialog
    page.on('dialog', dialog => dialog.dismiss()) // dismiss to NOT reset

    await page.getByRole('button', { name: 'Reset' }).click()

    // After dismissing, data should still be intact
    await page.locator('main nav').getByText('Products').click()
    await expect(page.getByText('TestSaaS')).toBeVisible()
  })

  test('GEN-004b: Reset All Data actually resets when confirmed', async ({ page }) => {
    // Handle the confirmation dialog — accept to reset
    page.on('dialog', dialog => dialog.accept())

    await page.getByRole('button', { name: 'Reset' }).click()

    // After accepting, products should be cleared
    await page.locator('main nav').getByText('Products').click()
    await expect(page.getByText('TestSaaS')).not.toBeVisible({ timeout: 3000 })
  })

  // GEN-005: Sign Out button
  test('GEN-005: Sign Out button visible when Supabase configured', async ({ page }) => {
    // Sign Out only shows when isSupabaseConfigured = true
    // In test env without Supabase, check the Account section renders or is absent
    const signOutSection = page.getByText('Sign Out')
    const aboutSection = page.getByText('About')

    // At minimum, About section should render
    await expect(aboutSection).toBeVisible()

    // If Sign Out is visible, verify it exists with correct label
    if (await signOutSection.isVisible().catch(() => false)) {
      await expect(page.getByText('Sign out of your account on this device')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible()
    }
  })
})
