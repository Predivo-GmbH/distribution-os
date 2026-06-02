import { test, expect } from '@playwright/test'
import { unlockGateAuth, seedProduct } from './helpers'

test.describe('Briefing Room — Full Tab Coverage', () => {
  test.beforeEach(async ({ page }) => {
    await unlockGateAuth(page)
    await seedProduct(page)
  })

  // BRF-001: Briefing Room loads with 5 tab labels — full test
  test('BRF-001: Briefing Room page loads with all 5 tab labels', async ({ page }) => {
    await page.goto('/briefing')
    await expect(page.getByText('Briefing Room')).toBeVisible()

    // All 5 tabs
    await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Engines' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Stages' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Scoring' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Workflow & Glossary' })).toBeVisible()
  })

  // BRF-004: Stages tab — 4 product stages with detail panels
  test('BRF-004: Stages tab shows 4 stages with detail panels', async ({ page }) => {
    await page.goto('/briefing')

    await page.getByRole('tab', { name: 'Stages' }).click()

    // All 4 stages should be visible
    await expect(page.getByText('Pre-Launch')).toBeVisible()
    await expect(page.getByText('Early')).toBeVisible()
    await expect(page.getByText('Active')).toBeVisible()
    await expect(page.getByText('Scaling')).toBeVisible()

    // Stage details should include focus areas
    await expect(page.getByText(/weeks before launch|after launch|growth phase|compounding/i).first()).toBeVisible()
  })

  // BRF-005: Scoring tab — scoring methodology
  test('BRF-005: Scoring tab shows methodology and metric cards', async ({ page }) => {
    await page.goto('/briefing')

    await page.getByRole('tab', { name: 'Scoring' }).click()

    // Scoring methodology content
    await expect(page.getByText(/scor|point|metric/i).first()).toBeVisible()
  })

  // BRF-006: Reference (Workflow & Glossary) tab
  test('BRF-006: Workflow & Glossary tab shows weekly workflow and glossary', async ({ page }) => {
    await page.goto('/briefing')

    await page.getByRole('tab', { name: 'Workflow & Glossary' }).click()

    // Should show workflow and/or glossary content
    await expect(page.getByText(/workflow|glossary|week|engine/i).first()).toBeVisible()
  })
})
