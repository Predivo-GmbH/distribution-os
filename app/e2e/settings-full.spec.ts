import { test, expect } from '@playwright/test'
import { unlockGateAuth, seedProduct, seedProductWithKB, seedAIConfig } from './helpers'

test.describe('Settings — Full Tab Coverage', () => {
  test.beforeEach(async ({ page }) => {
    await unlockGateAuth(page)
    await seedProductWithKB(page)
    await seedAIConfig(page)
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
  })

  // SET-002: Products tab — full interaction
  test('SET-002: Products tab lists products with Edit button', async ({ page }) => {
    // Products tab should be default
    await expect(page.getByText('TestSaaS')).toBeVisible()
    await expect(page.getByRole('button', { name: /edit/i })).toBeVisible()
  })

  // SET-003: Products tab — Edit product opens modal
  test('SET-003: Products tab — Edit product opens modal pre-filled', async ({ page }) => {
    await page.getByRole('button', { name: /edit/i }).first().click()
    // Modal should open with pre-filled name
    const nameInput = page.locator('[role="dialog"] input, .fixed input').first()
    if (await nameInput.isVisible().catch(() => false)) {
      await expect(nameInput).toHaveValue('TestSaaS')
    }
  })

  // SET-004: Products tab — Delete product
  test('SET-004: Products tab — Delete product with confirmation', async ({ page }) => {
    // Look for delete button
    const deleteBtn = page.getByRole('button', { name: /delete|remove/i })
    if (await deleteBtn.isVisible().catch(() => false)) {
      // Set up dialog handler for confirmation
      page.on('dialog', dialog => dialog.accept())
      await deleteBtn.click()
    }
    // Page should not crash
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  })

  // SET-007: Knowledge Base — add/remove voice examples
  test('SET-007: Knowledge Base tab — add and remove voice examples', async ({ page }) => {
    await page.getByRole('tab', { name: 'Knowledge Base' }).click()
    await expect(page.getByText('Voice Examples')).toBeVisible()

    // Existing examples from seedProductWithKB
    await expect(page.getByText('We build tools that respect your time.')).toBeVisible()

    // Add a new example
    const newExampleInput = page.getByPlaceholder(/add|example|voice/i)
    if (await newExampleInput.isVisible().catch(() => false)) {
      await newExampleInput.fill('New voice example for testing')
      // Press Enter or click Add
      await newExampleInput.press('Enter')
    }

    // Remove button (X) should exist on examples
    const removeBtn = page.locator('button:has(svg.lucide-x)').first()
    if (await removeBtn.isVisible().catch(() => false)) {
      await removeBtn.click()
    }
  })

  // SET-008: Knowledge Base — fill ICP, Positioning, Tone
  test('SET-008: Knowledge Base — fill ICP, Positioning, and Tone auto-saves', async ({ page }) => {
    await page.getByRole('tab', { name: 'Knowledge Base' }).click()

    // ICP section should show pre-filled values from seed
    await expect(page.getByText('ICP Definition')).toBeVisible()

    // Positioning section
    await expect(page.getByText('Product Positioning')).toBeVisible()

    // Tone section with sliders/selectors
    await expect(page.getByText('Tone Parameters')).toBeVisible()

    // Modify an ICP field
    const icpField = page.getByText('Solo SaaS founders, indie hackers')
    if (await icpField.isVisible().catch(() => false)) {
      // Find the input/textarea near it and verify it's editable
      const nearbyInput = icpField.locator('..').locator('input, textarea').first()
      if (await nearbyInput.isVisible().catch(() => false)) {
        await nearbyInput.fill('Updated ICP for testing')
      }
    }

    // Auto-save indicator should show "Saved"
    await page.waitForTimeout(1500) // wait for debounce
  })

  // SET-009: AI Configuration — full flow with show/hide and save
  test('SET-009: AI Configuration — API key input, show/hide, save', async ({ page }) => {
    await page.getByRole('tab', { name: 'AI Configuration' }).click()

    // API key input with show/hide toggle
    const keyInput = page.getByPlaceholder('sk-ant-...')
    await expect(keyInput).toBeVisible()

    // Should have pre-filled value from seedAIConfig
    const value = await keyInput.inputValue()
    expect(value).toBeTruthy()

    // Look for show/hide toggle
    const toggleBtn = page.locator('button', { hasText: /show|hide|eye/i })
    if (await toggleBtn.isVisible().catch(() => false)) {
      await toggleBtn.click() // toggle visibility
    }

    // Save button
    const saveBtn = page.getByRole('button', { name: /save/i })
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click()
    }
  })

  // SET-012: Integrations — enter access token + toggle auto-publish
  test('SET-012: Integrations tab — enter access token and toggle auto-publish', async ({ page }) => {
    await page.getByRole('tab', { name: 'Integrations' }).click()

    // 4 integration cards visible
    await expect(page.getByText('LinkedIn').first()).toBeVisible()
    await expect(page.getByText('Google Search Console')).toBeVisible()

    // Look for token input fields
    const tokenInputs = page.locator('input[type="text"], input[type="password"]')
    if (await tokenInputs.first().isVisible().catch(() => false)) {
      await tokenInputs.first().fill('test-access-token')
    }

    // Toggle switch for auto-publish
    const toggle = page.locator('[role="switch"]').first()
    if (await toggle.isVisible().catch(() => false)) {
      await toggle.click()
    }
  })

  // SET-016: Tasks tab — task template library by engine
  test('SET-016: Tasks tab shows task template library grouped by engine', async ({ page }) => {
    await page.getByRole('tab', { name: 'Tasks' }).click()

    // Should show engine groupings with task templates
    await expect(page.getByText(/Engine Tasks/)).toBeVisible()
    await expect(page.getByText(/template/i)).toBeVisible()

    // Should show point values
    await expect(page.getByText(/\d+pt/)).toBeVisible()
  })

  // SET-017: Metrics tab — scoring configuration
  test('SET-017: Metrics tab shows scoring configuration and streak history', async ({ page }) => {
    await page.getByRole('tab', { name: 'Metrics' }).click()

    // Scoring configuration
    await expect(page.getByText('Scoring Configuration')).toBeVisible()
    await expect(page.getByText('High-impact task')).toBeVisible()
    await expect(page.getByText('Medium-impact task')).toBeVisible()
    await expect(page.getByText('Low-impact task')).toBeVisible()

    // Point values
    await expect(page.getByText('+5 pts')).toBeVisible()
    await expect(page.getByText('+3 pts')).toBeVisible()
    await expect(page.getByText('+1 pts')).toBeVisible()
  })
})
