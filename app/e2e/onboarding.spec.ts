import { test, expect } from '@playwright/test'
import { unlockGate, seedNewUser } from './helpers'

test.describe('Onboarding — First Mission Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await unlockGate(page)
    await seedNewUser(page)
    // Mock AI suggest endpoint
    await page.route('**/functions/v1/ai-proxy', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ description: 'AI-generated description', stage: 'early', primaryEngine: 'pull', secondaryEngines: ['push'] }) })
    )
    await page.route('**/functions/v1/call-ai', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, content: 'Mock AI result' }) })
    )
  })

  // ONB-001: First Mission wizard shown to new users
  test('ONB-001: First Mission wizard shown to new users on Dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('Welcome to Distribution-OS')).toBeVisible()
    await expect(page.getByText('Start First Mission')).toBeVisible()
  })

  // ONB-002: Step 1 — Welcome screen with Next
  test('ONB-002: Step 1 — Welcome screen with "Start First Mission" button', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('Welcome to Distribution-OS')).toBeVisible()
    await expect(page.getByText('Your goal')).toBeVisible()
    await expect(page.getByText('How it works:')).toBeVisible()

    // Click Start First Mission to advance
    await page.getByText('Start First Mission').click()
    await expect(page.getByText('Name your product')).toBeVisible()
  })

  // ONB-003: Step 2 — Product name + description input
  test('ONB-003: Step 2 — Product name + description input', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByText('Start First Mission').click()

    await expect(page.getByText('Step 2 of 5')).toBeVisible()
    await expect(page.getByText('Name your product')).toBeVisible()

    // Fill product name
    const nameInput = page.getByPlaceholder('e.g. Distribution OS, BelegPilot, Acme CRM')
    await nameInput.fill('My Test Product')

    // Fill description
    const descInput = page.getByPlaceholder('One line about what it does')
    await descInput.fill('A distribution tool for founders')

    // Continue should be enabled now
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText('What stage is your product in?')).toBeVisible()
  })

  // ONB-004: Step 3 — Stage select
  test('ONB-004: Step 3 — Stage select (4 stages, radio buttons)', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByText('Start First Mission').click()

    // Step 2: fill name and continue
    await page.getByPlaceholder('e.g. Distribution OS, BelegPilot, Acme CRM').fill('TestProd')
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 3: Stage select
    await expect(page.getByText('Step 3 of 5')).toBeVisible()
    await expect(page.getByText('What stage is your product in?')).toBeVisible()

    // All 4 stages visible as radio buttons
    const radioGroup = page.locator('[role="radiogroup"]')
    await expect(radioGroup.getByText('Pre-Launch')).toBeVisible()
    await expect(radioGroup.getByText('Early')).toBeVisible()
    await expect(radioGroup.getByText('Active')).toBeVisible()
    await expect(radioGroup.getByText('Scaling')).toBeVisible()

    // Select "Active" stage
    await radioGroup.getByText('Active').click()
    const activeRadio = radioGroup.locator('[role="radio"]', { hasText: 'Active' })
    await expect(activeRadio).toHaveAttribute('aria-checked', 'true')

    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText('Choose your distribution engines')).toBeVisible()
  })

  // ONB-005: Step 4 — Engine select
  test('ONB-005: Step 4 — Engine select (primary + secondary toggles)', async ({ page }) => {
    await page.goto('/dashboard')
    // Navigate through steps 1-3
    await page.getByText('Start First Mission').click()
    await page.getByPlaceholder('e.g. Distribution OS, BelegPilot, Acme CRM').fill('TestProd')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 4: Engine select
    await expect(page.getByText('Step 4 of 5')).toBeVisible()
    await expect(page.getByText('Choose your distribution engines')).toBeVisible()
    await expect(page.getByText('Primary Engine')).toBeVisible()
    await expect(page.getByText('Secondary Engines')).toBeVisible()

    // 6 engines visible in primary radio group
    const primaryGroup = page.locator('[role="radiogroup"]')
    await expect(primaryGroup.getByText('Pull Engine')).toBeVisible()
    await expect(primaryGroup.getByText('Push Engine')).toBeVisible()
    await expect(primaryGroup.getByText('Bridge Engine')).toBeVisible()

    // Select Push as primary
    await primaryGroup.getByText('Push Engine').click()

    // Toggle a secondary engine
    const bridgeSecondary = page.locator('button', { hasText: 'Bridge' }).last()
    await bridgeSecondary.click()

    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText('Your first mission briefing')).toBeVisible()
  })

  // ONB-006: Step 5 — Mission Briefing summary + "Launch"
  test('ONB-006: Step 5 — Mission Briefing summary + Launch creates product', async ({ page }) => {
    await page.goto('/dashboard')
    // Navigate through steps 1-4
    await page.getByText('Start First Mission').click()
    await page.getByPlaceholder('e.g. Distribution OS, BelegPilot, Acme CRM').fill('TestProd')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 5: Mission Briefing
    await expect(page.getByText('Step 5 of 5')).toBeVisible()
    await expect(page.getByText('Your first mission briefing')).toBeVisible()
    await expect(page.getByText('TestProd')).toBeVisible()
    await expect(page.getByText('tasks this week')).toBeVisible()
    await expect(page.getByText('pt possible')).toBeVisible()

    // Launch button creates the product
    await page.getByRole('button', { name: 'Launch Mission' }).click()

    // Should show WelcomeModal after product creation
    await expect(page.getByText('Welcome to Distribution-OS!')).toBeVisible({ timeout: 5000 })
  })

  // ONB-007: Welcome Modal shown after first product created
  test('ONB-007: Welcome Modal is dismissable', async ({ page }) => {
    await page.goto('/dashboard')
    // Go through full wizard
    await page.getByText('Start First Mission').click()
    await page.getByPlaceholder('e.g. Distribution OS, BelegPilot, Acme CRM').fill('MyProduct')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Launch Mission' }).click()

    // Welcome Modal visible
    await expect(page.getByText('Welcome to Distribution-OS!')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Your 5-step setup plan')).toBeVisible()
    await expect(page.getByRole('button', { name: "Let's Go" })).toBeVisible()

    // Dismiss modal
    await page.getByRole('button', { name: "Let's Go" }).click()
    await expect(page.getByText('Welcome to Distribution-OS!')).not.toBeVisible()
  })
})
