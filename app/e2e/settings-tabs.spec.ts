import { test, expect } from '@playwright/test'
import { unlockGate, seedProduct } from './helpers'

test.describe('Settings Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await unlockGate(page)
    await seedProduct(page)
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
  })

  test('renders all 8 settings tabs', async ({ page }) => {
    // Tab bar is inside <nav> within the main content area
    const tabBar = page.locator('main nav')
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
    await page.locator('main nav').getByText('Knowledge Base').click()
    await expect(page.getByRole('option', { name: 'TestSaaS' })).toBeAttached()
    await expect(page.getByText('Voice Examples')).toBeVisible()
    await expect(page.getByText('ICP Definition')).toBeVisible()
    await expect(page.getByText('Product Positioning')).toBeVisible()
    await expect(page.getByText('Tone Parameters')).toBeVisible()
  })

  test('Knowledge Base shows "Not set up" badge when empty', async ({ page }) => {
    await page.locator('main nav').getByText('Knowledge Base').click()
    await expect(page.getByText('Not set up')).toBeVisible()
  })

  test('AI Configuration tab renders', async ({ page }) => {
    await page.locator('main nav').getByText('AI Configuration').click()
    await expect(page.getByRole('heading', { name: 'Anthropic API' })).toBeVisible()
    await expect(page.getByPlaceholder('sk-ant-...')).toBeVisible()
    await expect(page.getByText('Enter your Anthropic API key')).toBeVisible()
  })

  test('AI Configuration shows model selector', async ({ page }) => {
    await page.locator('main nav').getByText('AI Configuration').click()
    await expect(page.getByRole('option', { name: /Claude Sonnet 4/ })).toBeAttached()
    await expect(page.getByRole('option', { name: /Claude Haiku/ })).toBeAttached()
    await expect(page.getByRole('option', { name: /Claude Opus/ })).toBeAttached()
  })

  test('Integrations tab renders all 4 integration cards', async ({ page }) => {
    await page.locator('main nav').getByText('Integrations').click()
    await expect(page.getByText('LinkedIn').first()).toBeVisible()
    await expect(page.getByText('Google Search Console')).toBeVisible()
    await expect(page.getByText('Google Ads')).toBeVisible()
    await expect(page.getByText('Email Service')).toBeVisible()
  })

  test('Integrations shows "Not connected" status by default', async ({ page }) => {
    await page.locator('main nav').getByText('Integrations').click()
    const notConnected = page.getByText('Not connected')
    await expect(notConnected.first()).toBeVisible()
  })

  test('Scheduler tab shows AI not configured warning when no API key', async ({ page }) => {
    await page.locator('main nav').getByText('Scheduler').click()
    await expect(page.getByText('Configure your Anthropic API key')).toBeVisible()
  })
})
