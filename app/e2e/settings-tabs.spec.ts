import { test, expect } from '@playwright/test'
import { unlockGateAuth, seedProduct } from './helpers'

test.describe('Settings Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await unlockGateAuth(page)
    await seedProduct(page)
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
  })

  test('renders all 8 settings tabs', async ({ page }) => {
    // Tab bar is inside <nav> within the main content area
    const tabBar = page.locator('[role="tablist"]')
    await expect(tabBar.getByText('Products')).toBeVisible()
    await expect(tabBar.getByText('Knowledge Base')).toBeVisible()
    await expect(tabBar.getByText('AI Configuration')).toBeVisible()
    await expect(tabBar.getByText('Integrations')).toBeVisible()
    await expect(tabBar.getByText('Scheduler')).toBeVisible()
    await expect(tabBar.getByText('Tasks')).toBeVisible()
    await expect(tabBar.getByText('Metrics')).toBeVisible()
    await expect(tabBar.getByText('General')).toBeVisible()
  })

  test('Knowledge Base tab loads with product selector', async ({ page }) => {
    await page.getByRole('tab', { name: 'Knowledge Base' }).click()
    await expect(page.getByRole('option', { name: 'TestSaaS' })).toBeAttached()
    await expect(page.getByText('Voice Examples')).toBeVisible()
    await expect(page.getByText('ICP Definition')).toBeVisible()
    await expect(page.getByText('Product Positioning')).toBeVisible()
    await expect(page.getByText('Tone Parameters')).toBeVisible()
  })

  test('Knowledge Base shows "Not set up" badge when empty', async ({ page }) => {
    await page.getByRole('tab', { name: 'Knowledge Base' }).click()
    await expect(page.getByText('Not set up')).toBeVisible()
  })

  test('AI Configuration tab renders', async ({ page }) => {
    await page.getByRole('tab', { name: 'AI Configuration' }).click()
    await expect(page.getByRole('heading', { name: 'AI Provider' })).toBeVisible()
    // Default provider is Anthropic, so the key placeholder is the sk-ant- hint.
    await expect(page.getByPlaceholder('sk-ant-...')).toBeVisible()
    await expect(page.getByText('Choose a provider and enter your API key')).toBeVisible()
  })

  test('AI Configuration shows the multi-provider selector (Anthropic / Kimi)', async ({ page }) => {
    await page.getByRole('tab', { name: 'AI Configuration' }).click()
    await expect(page.getByRole('option', { name: /Anthropic \(Claude\)/ })).toBeAttached()
    await expect(page.getByRole('option', { name: /Kimi \(Moonshot\)/ })).toBeAttached()
    // OpenAI removed 2026-07-31 — must NOT be offered.
    await expect(page.getByRole('option', { name: /OpenAI/ })).toHaveCount(0)
    // Model is now a provider-agnostic free-text field defaulting to 'auto'.
    await expect(page.getByPlaceholder('auto')).toBeVisible()
  })

  test('AI Configuration warns when the key does not match the selected provider', async ({ page }) => {
    await page.getByRole('tab', { name: 'AI Configuration' }).click()
    // Provider defaults to Anthropic; a non-"sk-ant-" key must trigger the conflict warning.
    await page.getByPlaceholder('sk-ant-...').fill('sk-not-an-anthropic-key')
    await expect(page.getByText('An Anthropic key should start with "sk-ant-".')).toBeVisible()
  })

  test('Integrations tab renders all 4 integration cards', async ({ page }) => {
    await page.getByRole('tab', { name: 'Integrations' }).click()
    await expect(page.getByText('LinkedIn').first()).toBeVisible()
    await expect(page.getByText('Google Search Console')).toBeVisible()
    await expect(page.getByText('Google Ads')).toBeVisible()
    await expect(page.getByText('Email Service')).toBeVisible()
  })

  test('Integrations shows "Not connected" status by default', async ({ page }) => {
    await page.getByRole('tab', { name: 'Integrations' }).click()
    const notConnected = page.getByText('Not connected')
    await expect(notConnected.first()).toBeVisible()
  })

  test('Scheduler tab shows AI not configured warning when no API key', async ({ page }) => {
    await page.getByRole('tab', { name: 'Scheduler' }).click()
    await expect(page.getByText('Configure your Anthropic API key')).toBeVisible()
  })
})
