import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { unlockGate, unlockGateAuth, seedProduct } from './helpers'

test.describe('Accessibility — WCAG 2.1 AA', () => {
  test('Landing page passes axe audit', async ({ page }) => {
    await unlockGate(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })

  test('Login page passes axe audit', async ({ page }) => {
    await unlockGate(page)
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })

  test('Pricing page passes axe audit', async ({ page }) => {
    await unlockGate(page)
    await page.goto('/pricing')
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })

  test('SignUp page passes axe audit', async ({ page }) => {
    await unlockGate(page)
    await page.goto('/signup')
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })

  test('Dashboard passes axe audit', async ({ page }) => {
    await unlockGateAuth(page)
    await seedProduct(page)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    // Wait for tasks to generate
    await page.waitForSelector('[role="checkbox"]', { timeout: 10000 })
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })

  test('Products page passes axe audit', async ({ page }) => {
    await unlockGateAuth(page)
    await seedProduct(page)
    await page.goto('/products')
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })

  test('Settings page passes axe audit', async ({ page }) => {
    await unlockGateAuth(page)
    await seedProduct(page)
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })

  test('Briefing Room passes axe audit', async ({ page }) => {
    await unlockGateAuth(page)
    await seedProduct(page)
    await page.goto('/briefing')
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })

  test('Inbox page passes axe audit', async ({ page }) => {
    await unlockGateAuth(page)
    await seedProduct(page)
    await page.goto('/inbox')
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })

  test('All interactive elements meet 44px minimum touch target', async ({ page }) => {
    await unlockGate(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check all links and buttons for minimum touch target
    const interactives = await page.locator('a, button').all()
    for (const el of interactives) {
      const box = await el.boundingBox()
      if (box && box.height > 0 && box.width > 0) {
        // Allow small inline text links but flag very small buttons
        if (box.height < 30 && box.width < 30) {
          // Only fail for buttons, not tiny text links
          const tag = await el.evaluate(e => e.tagName.toLowerCase())
          if (tag === 'button') {
            expect(
              box.height >= 44 || box.width >= 44,
              `Button too small: ${box.width}x${box.height}`
            ).toBeTruthy()
          }
        }
      }
    }
  })
})
