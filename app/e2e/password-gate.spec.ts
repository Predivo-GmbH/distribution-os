import { test, expect } from '@playwright/test'
import { unlockGate } from './helpers'

test.describe('Password Gate', () => {
  test('shows gate when not authenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Early Access')).toBeVisible()
    await expect(page.getByPlaceholder('Access code')).toBeVisible()
  })

  test('rejects incorrect password', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('Access code').fill('wrongpassword')
    await page.getByRole('button', { name: 'Enter' }).click()
    await expect(page.getByText('Incorrect code')).toBeVisible()
  })

  test('accepts correct password and shows app', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('Access code').fill(process.env.DISTOS_GATE_PASSWORD ?? '')
    await page.getByRole('button', { name: 'Enter' }).click()
    // After gate, should see landing page
    await expect(page.getByText('Distribution-OS', { exact: true }).first()).toBeVisible()
  })

  test('bypasses gate when session key is set', async ({ page }) => {
    await unlockGate(page)
    await page.goto('/')
    await expect(page.getByText('Early Access')).not.toBeVisible()
  })
})
