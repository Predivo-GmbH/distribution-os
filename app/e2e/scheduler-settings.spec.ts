import { test, expect } from '@playwright/test'
import { unlockGateAuth, seedProduct, seedAIConfig } from './helpers'

test.describe('Scheduler Settings', () => {
  test.beforeEach(async ({ page }) => {
    await unlockGateAuth(page)
    await seedProduct(page)
    await seedAIConfig(page)
    await page.goto('/settings')
    await page.getByRole('tab', { name: 'Scheduler' }).click()
  })

  test('shows scheduler master toggle', async ({ page }) => {
    await expect(page.getByText('Automation Scheduler')).toBeVisible()
    await expect(page.getByText('When enabled, workers run automatically')).toBeVisible()
  })

  test('shows worker schedule list', async ({ page }) => {
    await expect(page.getByText('Worker Schedules')).toBeVisible()
    // Should show default scheduled workers
    await expect(page.getByText('LinkedIn Director')).toBeVisible()
    await expect(page.getByText('Keyword Research')).toBeVisible()
    await expect(page.getByText('Connector Research')).toBeVisible()
    await expect(page.getByText('Weekly Diagnostician')).toBeVisible()
  })

  test('shows cadence badges (daily/weekly)', async ({ page }) => {
    await expect(page.getByText('weekly').first()).toBeVisible()
    await expect(page.getByText('daily').first()).toBeVisible()
  })

  test('has save button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Save Schedule' })).toBeVisible()
  })

  test('save shows confirmation', async ({ page }) => {
    await page.getByRole('button', { name: 'Save Schedule' }).click()
    await expect(page.getByText('Saved')).toBeVisible()
  })
})
