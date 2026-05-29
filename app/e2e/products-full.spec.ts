import { test, expect } from '@playwright/test'
import { unlockGate, seedProduct } from './helpers'

test.describe('Products Management — Full Coverage', () => {
  test.beforeEach(async ({ page }) => {
    await unlockGate(page)
    await seedProduct(page)
  })

  // PRD-004: Add Product modal — fill all fields and save
  test('PRD-004: Add Product modal — fill name, description, stage, engines, and save', async ({ page }) => {
    await page.goto('/products')

    // Open Add Product modal
    await page.getByRole('button', { name: 'Add Product' }).click()
    await expect(page.getByText('Add New Product')).toBeVisible()

    // Fill name
    const nameInput = page.locator('input').first()
    await nameInput.fill('New SaaS Product')

    // Fill description
    const descInput = page.locator('input').nth(1)
    await descInput.fill('A new product for testing')

    // Select stage — click on a stage option
    await page.getByText('Pre-Launch').click()

    // Select primary engine
    const pullRadio = page.locator('[role="radio"]', { hasText: 'Pull' })
    if (await pullRadio.isVisible().catch(() => false)) {
      await pullRadio.click()
    }

    // Submit the form
    const saveBtn = page.getByRole('button', { name: /save|create|add/i })
    await saveBtn.click()

    // Modal should close and new product should appear
    await expect(page.getByText('Add New Product')).not.toBeVisible({ timeout: 3000 })
    await expect(page.getByText('New SaaS Product')).toBeVisible()
  })

  // PRD-005: Product detail — full render
  test('PRD-005: Product detail renders name, stage, engines, and task list', async ({ page }) => {
    await page.goto('/products/test-product-1')

    // Name
    await expect(page.locator('h1', { hasText: 'TestSaaS' })).toBeVisible()

    // Stage badge
    await expect(page.getByText('early')).toBeVisible()

    // Engine assignments
    await expect(page.getByText('Push').first()).toBeVisible()

    // Edit button
    await expect(page.getByRole('button', { name: /edit/i })).toBeVisible()

    // Task list grouped by engine
    await expect(page.locator('[role="checkbox"]').first()).toBeVisible({ timeout: 10000 })
  })

  // PRD-006: Product detail — Edit button opens modal
  test('PRD-006: Edit button opens AddProductModal in edit mode', async ({ page }) => {
    await page.goto('/products/test-product-1')

    // Click Edit
    await page.getByRole('button', { name: /edit/i }).click()

    // Modal should open with pre-filled values
    await expect(page.getByText(/Edit Product|Add New Product/)).toBeVisible()
    // Name should be pre-filled with "TestSaaS"
    const nameInput = page.locator('input').first()
    await expect(nameInput).toHaveValue('TestSaaS')
  })
})
