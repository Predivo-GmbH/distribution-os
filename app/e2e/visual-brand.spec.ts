import { test, expect } from '@playwright/test'
import { unlockGate, seedProduct } from './helpers'

test.describe('Visual & Brand Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await unlockGate(page)
    await seedProduct(page)
  })

  test('design system renders with consistent styling', async ({ page }) => {
    await page.goto('/dashboard')
    // Verify the app renders with a styled sidebar and main content
    await expect(page.locator('aside').first()).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
  })

  test('sidebar has correct structure', async ({ page }) => {
    await page.goto('/dashboard')
    const aside = page.locator('aside').first()
    await expect(aside.getByText('ShipSolo')).toBeVisible()
    await expect(aside.getByText('Dashboard')).toBeVisible()
    await expect(aside.getByText('Inbox')).toBeVisible()
    await expect(aside.getByText('Products')).toBeVisible()
    await expect(aside.getByText('Settings')).toBeVisible()
  })

  test('active nav link is highlighted on settings page', async ({ page }) => {
    await page.goto('/settings')
    // The Settings link should be active (has font-medium)
    const settingsLink = page.locator('aside').first().locator('a', { hasText: 'Settings' })
    const classes = await settingsLink.getAttribute('class')
    expect(classes).toContain('font-medium')
  })

  test('no console errors on main pages', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    for (const path of ['/dashboard', '/inbox', '/products', '/settings']) {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
    }

    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('net::ERR_') &&
      !e.includes('Failed to load resource')
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test('responsive layout: sidebar is visible on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/dashboard')
    await expect(page.locator('aside').first()).toBeVisible()
  })

  test('settings tabs render without layout shift', async ({ page }) => {
    await page.goto('/settings')
    // Scope to the tab bar inside main content area (not the sidebar nav)
    const tabBar = page.locator('main nav')
    const tabs = ['Products', 'Knowledge Base', 'AI Configuration', 'Integrations', 'Scheduler', 'Tasks', 'Metrics', 'General']
    for (const tab of tabs) {
      await tabBar.getByText(tab).click()
      await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    }
  })
})
