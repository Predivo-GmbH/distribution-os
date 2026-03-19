import { test, expect } from '@playwright/test'
import { unlockGate, seedProduct, seedInbox } from './helpers'

test.describe('Inbox', () => {
  test.beforeEach(async ({ page }) => {
    await unlockGate(page)
    await seedProduct(page)
  })

  test('shows empty state when no artifacts', async ({ page }) => {
    await page.goto('/inbox')
    await expect(page.getByText(/no artifacts/i)).toBeVisible()
  })

  test('shows pending artifact count in sidebar badge', async ({ page }) => {
    await seedInbox(page)
    await page.goto('/dashboard')
    // The sidebar should show Inbox with a badge count
    const sidebar = page.locator('aside').first()
    await expect(sidebar.getByText('Inbox')).toBeVisible()
    // Badge shows "1" (one pending artifact)
    await expect(sidebar.getByText('1')).toBeVisible()
  })

  test('renders artifacts with correct status badges', async ({ page }) => {
    await seedInbox(page)
    await page.goto('/inbox')
    // Should show the pending artifact
    await expect(page.getByText('LinkedIn Weekly Content')).toBeVisible()
    // Should show status badges
    await expect(page.getByText('pending').first()).toBeVisible()
  })

  test('shows both artifacts when no filter applied', async ({ page }) => {
    await seedInbox(page)
    await page.goto('/inbox')
    await expect(page.getByText('LinkedIn Weekly Content')).toBeVisible()
    await expect(page.getByText('SEO Blog Post')).toBeVisible()
  })
})
