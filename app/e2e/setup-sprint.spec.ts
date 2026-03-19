import { test, expect } from '@playwright/test'
import { unlockGate, seedProductForSetupSprint } from './helpers'

test.describe('Setup Sprint', () => {
  test.beforeEach(async ({ page }) => {
    await unlockGate(page)
    await seedProductForSetupSprint(page)
  })

  test('shows Setup Sprint when first mission is complete but sprint is not', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('Setup Sprint')).toBeVisible()
    await expect(page.getByText('Get your AI automation running')).toBeVisible()
  })

  test('Step 1 shows registered products', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('Step 1: Confirm your products')).toBeVisible()
    await expect(page.getByText('TestSaaS')).toBeVisible()
    await expect(page.getByText('KB needed')).toBeVisible()
  })

  test('step indicator shows all 5 step labels', async ({ page }) => {
    await page.goto('/dashboard')
    // The step indicator buttons contain these labels
    await expect(page.getByText('Knowledge Base')).toBeVisible()
    await expect(page.getByText('AI Config')).toBeVisible()
    await expect(page.getByText('First Run')).toBeVisible()
  })

  test('navigates between steps with Next and Back', async ({ page }) => {
    await page.goto('/dashboard')
    // Step 1 → Step 2
    await page.getByRole('button', { name: /next/i }).click()
    await expect(page.getByText('Step 2: Fill in the Knowledge Base')).toBeVisible()
    // Step 2 → Step 1
    await page.getByRole('button', { name: /back/i }).click()
    await expect(page.getByText('Step 1: Confirm your products')).toBeVisible()
  })

  test('Step 2 shows Knowledge Base form', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('button', { name: /next/i }).click()
    await expect(page.getByText('Voice Examples')).toBeVisible()
    await expect(page.getByText('ICP Definition')).toBeVisible()
  })

  test('Step 3 shows AI Configuration', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('button', { name: /next/i }).click()
    await page.getByRole('button', { name: /skip for now|next/i }).click()
    await expect(page.getByText('Step 3: Connect your AI')).toBeVisible()
    await expect(page.getByPlaceholder('sk-ant-...')).toBeVisible()
  })

  test('Step 4 shows Integrations', async ({ page }) => {
    await page.goto('/dashboard')
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /skip for now|next/i }).click()
    }
    await expect(page.getByText('Step 4: Connect integrations')).toBeVisible()
    await expect(page.getByText('LinkedIn').first()).toBeVisible()
  })

  test('Step 5 shows Scheduler and First Run', async ({ page }) => {
    await page.goto('/dashboard')
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: /skip for now|next/i }).click()
    }
    await expect(page.getByText('Step 5: Review scheduler & launch')).toBeVisible()
    // Since no AI key, should show "Complete Setup" button
    await expect(page.getByRole('button', { name: 'Complete Setup' })).toBeVisible()
  })

  test('completing setup sprint shows Dashboard on next visit', async ({ page }) => {
    await page.goto('/dashboard')
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: /skip for now|next/i }).click()
    }
    await page.getByRole('button', { name: 'Complete Setup' }).click()
    // Should now show the Dashboard with Command Center heading
    await expect(page.getByRole('heading', { name: /command center/i })).toBeVisible()
  })
})
