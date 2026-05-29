import { test, expect } from '@playwright/test'
import { unlockGateAuth, seedProduct, seedInbox } from './helpers'

test.describe('Inbox — Filters and Actions', () => {
  test.beforeEach(async ({ page }) => {
    await unlockGateAuth(page)
    await seedProduct(page)
    await seedInbox(page)
    // Mock AI for regeneration
    await page.route('**/functions/v1/**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, content: 'Regenerated content' }) })
    )
  })

  // INB-007: Filter by status
  test('INB-007: inbox filter by status dropdown', async ({ page }) => {
    await page.goto('/inbox')
    await expect(page.getByText('LinkedIn Weekly Content')).toBeVisible()

    // Select "Pending Review" filter
    const statusSelect = page.locator('select').first()
    await statusSelect.selectOption('pending')

    // Only pending artifact should be visible
    await expect(page.getByText('LinkedIn Weekly Content')).toBeVisible()
    // Approved artifact should be filtered out
    await expect(page.getByText('SEO Blog Post')).not.toBeVisible()

    // Select "Approved" filter
    await statusSelect.selectOption('approved')
    await expect(page.getByText('SEO Blog Post')).toBeVisible()
    await expect(page.getByText('LinkedIn Weekly Content')).not.toBeVisible()

    // Reset to all
    await statusSelect.selectOption('all')
    await expect(page.getByText('LinkedIn Weekly Content')).toBeVisible()
    await expect(page.getByText('SEO Blog Post')).toBeVisible()
  })

  // INB-008: Filter by product dropdown
  test('INB-008: inbox filter by product dropdown', async ({ page }) => {
    await page.goto('/inbox')
    await expect(page.getByText('LinkedIn Weekly Content')).toBeVisible()

    // Product filter select — second select element
    const selects = page.locator('select')
    const productSelect = selects.nth(1)
    await expect(productSelect).toBeVisible()

    // Should have "All products" and "TestSaaS"
    await expect(productSelect.locator('option', { hasText: 'All products' })).toBeAttached()
    await expect(productSelect.locator('option', { hasText: 'TestSaaS' })).toBeAttached()

    // Select TestSaaS
    await productSelect.selectOption('test-product-1')
    await expect(page.getByText('LinkedIn Weekly Content')).toBeVisible()
  })

  // INB-009: Filter by engine dropdown
  test('INB-009: inbox filter by engine dropdown', async ({ page }) => {
    await page.goto('/inbox')
    await expect(page.getByText('LinkedIn Weekly Content')).toBeVisible()

    // Engine filter — third select
    const selects = page.locator('select')
    const engineSelect = selects.nth(2)
    await expect(engineSelect).toBeVisible()

    // Should have "All engines" option
    await expect(engineSelect.locator('option', { hasText: 'All engines' })).toBeAttached()

    // Filter by Pull engine — should show only SEO Blog Post
    await engineSelect.selectOption('pull')
    await expect(page.getByText('SEO Blog Post')).toBeVisible()
    await expect(page.getByText('LinkedIn Weekly Content')).not.toBeVisible()
  })

  // INB-010: Expand artifact to view full content
  test('INB-010: expand artifact to view full generated content', async ({ page }) => {
    await page.goto('/inbox')

    // Click on artifact header to expand
    await page.getByText('LinkedIn Weekly Content').click()

    // Expanded content should be visible
    await expect(page.getByText('Why most SaaS fail at distribution')).toBeVisible()
    await expect(page.getByText('The compound effect of weekly posting')).toBeVisible()
  })

  // INB-011: Approve artifact
  test('INB-011: approve artifact changes status', async ({ page }) => {
    await page.goto('/inbox')

    // Expand the pending artifact
    await page.getByText('LinkedIn Weekly Content').click()

    // Click Approve
    await page.getByRole('button', { name: /^Approve$/ }).click()

    // Status should change — "Pending Review" badge should disappear for this artifact
    // Re-expand and check the status badge
    await page.getByText('LinkedIn Weekly Content').click()
    await expect(page.locator('text=Approved').first()).toBeVisible()
  })

  // INB-012: Edit artifact content + approve with edits
  test('INB-012: edit artifact content and approve with edits', async ({ page }) => {
    await page.goto('/inbox')

    // Expand the pending artifact
    await page.getByText('LinkedIn Weekly Content').click()

    // Click "Edit + Approve"
    await page.getByRole('button', { name: 'Edit + Approve' }).click()

    // Textarea should appear with the content
    const textarea = page.locator('textarea')
    await expect(textarea).toBeVisible()

    // Modify content
    await textarea.fill('Edited content for LinkedIn post')

    // Click "Approve Edit"
    await page.getByRole('button', { name: 'Approve Edit' }).click()

    // Should show as approved now
    await page.getByText('LinkedIn Weekly Content').click()
    await expect(page.getByText('Edited content for LinkedIn post')).toBeVisible()
  })

  // INB-013: Regenerate artifact with direction note
  test('INB-013: regenerate artifact with optional direction note', async ({ page }) => {
    await page.goto('/inbox')

    // Expand the pending artifact
    await page.getByText('LinkedIn Weekly Content').click()

    // Click Regenerate
    await page.getByRole('button', { name: /Regenerate/ }).click()

    // Direction note textarea should appear
    const directionTextarea = page.getByPlaceholder(/give the AI a direction/i)
    await expect(directionTextarea).toBeVisible()

    // Fill in direction
    await directionTextarea.fill('Make it more technical and specific')

    // Submit regeneration
    await page.getByRole('button', { name: 'Regenerate' }).last().click()

    // Status should change to "Regenerating"
    await page.getByText('LinkedIn Weekly Content').click()
    await expect(page.getByText('Regenerating').first()).toBeVisible()
  })

  // INB-014: Dismiss artifact
  test('INB-014: dismiss artifact changes status to dismissed', async ({ page }) => {
    await page.goto('/inbox')

    // Expand the pending artifact
    await page.getByText('LinkedIn Weekly Content').click()

    // Click Dismiss
    await page.getByRole('button', { name: 'Dismiss' }).click()

    // Artifact should now show "Dismissed" status
    await page.getByText('LinkedIn Weekly Content').click()
    await expect(page.getByText('Dismissed').first()).toBeVisible()
  })

  // INB-015: Delete artifact permanently
  test('INB-015: delete artifact permanently removes it', async ({ page }) => {
    await page.goto('/inbox')

    // First approve the SEO Blog Post (already approved), expand it
    await page.getByText('SEO Blog Post').click()

    // Non-pending artifacts show "Remove" button
    await page.getByRole('button', { name: 'Remove' }).click()

    // Artifact should be removed from the list
    await expect(page.getByText('SEO Blog Post')).not.toBeVisible()
  })
})
