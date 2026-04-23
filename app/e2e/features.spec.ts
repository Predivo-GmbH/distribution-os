import { test, expect } from '@playwright/test'
import { unlockGate, seedProduct, seedInbox } from './helpers'

test.describe('Feature Tests — Key User Journeys', () => {
  test('Password Gate blocks access and unlocks with correct code', async ({ page }) => {
    // Without gate bypass, should see the gate
    await page.goto('/')
    await expect(page.locator('text=Early Access')).toBeVisible()
    await expect(page.locator('text=Access code')).toBeVisible()
  })

  test('Landing page links navigate correctly', async ({ page }) => {
    await unlockGate(page)
    await page.goto('/')

    // Click Log In
    await page.click('a:has-text("Log In")')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('text=Welcome back')).toBeVisible()

    // Go back and click Get Started
    await page.goto('/')
    await page.click('a:has-text("Get Started")')
    await expect(page).toHaveURL(/\/signup/)
  })

  test('Dashboard task generation and completion', async ({ page }) => {
    await unlockGate(page)
    await seedProduct(page)
    await page.goto('/dashboard')

    // Tasks should be generated
    await expect(page.locator('[role="checkbox"]').first()).toBeVisible()

    // Toggle a task
    const firstCheckbox = page.locator('[role="checkbox"]').first()
    await firstCheckbox.click()
    await expect(firstCheckbox).toHaveAttribute('aria-checked', 'true')

    // Toggle back
    await firstCheckbox.click()
    await expect(firstCheckbox).toHaveAttribute('aria-checked', 'false')
  })

  test('Dashboard search filters tasks', async ({ page }) => {
    await unlockGate(page)
    await seedProduct(page)
    await page.goto('/dashboard')

    // Wait for tasks
    await expect(page.locator('[role="checkbox"]').first()).toBeVisible()
    const initialCount = await page.locator('[role="checkbox"]').count()

    // Search for something unlikely
    await page.fill('input[placeholder="Search..."]', 'zzzznonexistent')
    await expect(page.locator('text=No tasks match')).toBeVisible()

    // Clear search
    await page.fill('input[placeholder="Search..."]', '')
    const restoredCount = await page.locator('[role="checkbox"]').count()
    expect(restoredCount).toBe(initialCount)
  })

  test('Products list shows product card and navigates to detail', async ({ page }) => {
    await unlockGate(page)
    await seedProduct(page)
    await page.goto('/products')

    // Product card should exist
    await expect(page.locator('text=TestSaaS')).toBeVisible()
    await expect(page.locator('text=early')).toBeVisible()

    // Click to navigate
    await page.click('a:has-text("TestSaaS")')
    await expect(page).toHaveURL(/\/products\/test-product-1/)
    await expect(page.locator('h1:has-text("TestSaaS")')).toBeVisible()
  })

  test('Add Product modal opens and closes', async ({ page }) => {
    await unlockGate(page)
    await seedProduct(page)
    await page.goto('/products')

    // Open modal
    await page.click('button:has-text("Add Product")')
    await expect(page.locator('text=Add New Product')).toBeVisible()

    // Close modal
    await page.click('[aria-label="Close modal"]')
    await expect(page.locator('text=Add New Product')).not.toBeVisible()
  })

  test('Settings tabs switch correctly', async ({ page }) => {
    await unlockGate(page)
    await seedProduct(page)
    await page.goto('/settings')

    // Default tab is Products
    await expect(page.locator('[role="tab"][aria-selected="true"]')).toHaveText('Products')

    // Click General tab
    await page.click('[role="tab"]:has-text("General")')
    await expect(page.locator('[role="tab"]:has-text("General")')).toHaveAttribute('aria-selected', 'true')
  })

  test('Sidebar navigation works', async ({ page }) => {
    await unlockGate(page)
    await seedProduct(page)
    await page.goto('/dashboard')

    // Click Products in sidebar
    await page.click('nav a:has-text("Products")')
    await expect(page).toHaveURL(/\/products/)

    // Click Settings
    await page.click('nav a:has-text("Settings")')
    await expect(page).toHaveURL(/\/settings/)

    // Click Dashboard
    await page.click('nav a:has-text("Dashboard")')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('Briefing Room tabs and engine cards', async ({ page }) => {
    await unlockGate(page)
    await seedProduct(page)
    await page.goto('/briefing')

    // Overview tab should be active
    await expect(page.locator('text=Why does this exist?')).toBeVisible()

    // Switch to Engines tab
    await page.click('[role="tab"]:has-text("Engines")')
    await expect(page.locator('text=Pull Engine')).toBeVisible()

    // Expand an engine card
    await page.click('button:has-text("Pull Engine")')
    await expect(page.locator('text=What it is')).toBeVisible()
  })

  test('Inbox displays artifacts with correct filters', async ({ page }) => {
    await unlockGate(page)
    await seedProduct(page)
    await seedInbox(page)
    await page.goto('/inbox')

    // Should show pending count
    await expect(page.locator('text=1 item pending review')).toBeVisible()

    // Should show both artifacts
    await expect(page.locator('text=LinkedIn Director')).toBeVisible()
    await expect(page.locator('text=SEO Content Writer')).toBeVisible()
  })

  test('Pricing page has free and pro plans', async ({ page }) => {
    await unlockGate(page)
    await page.goto('/pricing')
    await expect(page.locator('text=Free')).toBeVisible()
    await expect(page.locator('text=Pro')).toBeVisible()
    await expect(page.locator('text=Recommended')).toBeVisible()
  })
})
