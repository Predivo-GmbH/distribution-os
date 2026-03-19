import { test, expect } from '@playwright/test'
import { unlockGate, seedProduct } from './helpers'

test.describe('App Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await unlockGate(page)
    await seedProduct(page)
  })

  test('sidebar renders all nav items', async ({ page }) => {
    await page.goto('/dashboard')
    const sidebar = page.locator('aside')
    await expect(sidebar.getByText('Dashboard')).toBeVisible()
    await expect(sidebar.getByText('Inbox')).toBeVisible()
    await expect(sidebar.getByText('Products')).toBeVisible()
    await expect(sidebar.getByText('Settings')).toBeVisible()
    await expect(sidebar.getByText('Briefing Room')).toBeVisible()
  })

  test('dashboard shows command center heading', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: /command center/i })).toBeVisible()
  })

  test('navigates to Inbox', async ({ page }) => {
    await page.goto('/dashboard')
    await page.locator('aside').getByText('Inbox').click()
    await expect(page).toHaveURL('/inbox')
  })

  test('navigates to Products', async ({ page }) => {
    await page.goto('/dashboard')
    await page.locator('aside').getByText('Products').click()
    await expect(page).toHaveURL('/products')
  })

  test('navigates to Settings', async ({ page }) => {
    await page.goto('/dashboard')
    await page.locator('aside').getByText('Settings').click()
    await expect(page).toHaveURL('/settings')
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  })

  test('shows engine indicators in sidebar', async ({ page }) => {
    await page.goto('/dashboard')
    const sidebar = page.locator('aside')
    await expect(sidebar.getByText('Engines')).toBeVisible()
    await expect(sidebar.getByText('Push')).toBeVisible()
    await expect(sidebar.getByText('Pull')).toBeVisible()
    await expect(sidebar.getByText('Bridge')).toBeVisible()
  })
})
