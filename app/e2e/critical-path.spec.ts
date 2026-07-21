/**
 * CRITICAL PATH E2E TESTS — Distribution-OS
 * ==========================================
 * Tests that the most fundamental user flows ACTUALLY WORK.
 * If these fail, the app is broken. CI MUST NOT use continue-on-error.
 *
 * Tier 1: Edge function health, auth API, Supabase alive
 * Tier 2: call-ai behavior, Stripe checkout, data persistence
 *
 * These tests hit the REAL backend — no mocks.
 *
 * Required env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 *               E2E_TEST_EMAIL, E2E_TEST_PASSWORD
 */

import { test, expect, request as apiRequest } from '@playwright/test'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jxjpbmkgmuunpayqgbsx.supabase.co'
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_8Q_iepRvUKjASo9_3RagaA_q7uaSCMr'
// Service-role key must come from the environment — never commit it (see docs/Credentials.txt)
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const E2E_EMAIL = process.env.E2E_TEST_EMAIL || 'e2e-test@distributionos.predivo.ch'
const E2E_PASSWORD = process.env.E2E_TEST_PASSWORD ?? ''
const E2E_USER_ID = '6ffcc8aa-7518-44d0-ac1c-db4a1651ad90'
const BASE_URL = process.env.BASE_URL || 'https://distributionos.predivo.ch'

const EDGE_FUNCTIONS = [
  // 'ai-proxy' deleted 2026-07-21: orphaned duplicate of call-ai with no quota
  // enforcement and verify_jwt=false — a forged JWT returned 200 (verified live).
  'call-ai', 'send-auth-email',
  'stripe-checkout', 'stripe-portal', 'stripe-webhook',
]

async function getAuthToken(): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: E2E_EMAIL, password: E2E_PASSWORD }),
  })
  if (!res.ok) throw new Error(`Auth failed: ${res.status} ${await res.text()}`)
  return (await res.json()).access_token
}

// ═══════════════════════════════════════════════════════════════
// TIER 1 — Infrastructure Health
// ═══════════════════════════════════════════════════════════════

test.describe('TIER 1 — Infrastructure', () => {
  test('Supabase auth is healthy', async ({ request }) => {
    const r = await request.get(`${SUPABASE_URL}/auth/v1/health`, {
      headers: { apikey: SUPABASE_ANON_KEY },
      failOnStatusCode: false,
    })
    expect(r.status()).toBe(200)
  })

  test('REST API is reachable', async ({ request }) => {
    const r = await request.get(`${SUPABASE_URL}/rest/v1/`, {
      headers: { apikey: SUPABASE_ANON_KEY },
      failOnStatusCode: false,
    })
    expect(r.status()).toBeLessThan(500)
  })

  test('production site loads', async ({ request }) => {
    const r = await request.get(BASE_URL, { failOnStatusCode: false })
    expect(r.status()).toBeLessThan(500)
  })

  test('E2E test user can authenticate', async () => {
    const token = await getAuthToken()
    expect(token).toBeTruthy()
    const payload = JSON.parse(atob(token.split('.')[1]))
    expect(payload.sub).toBe(E2E_USER_ID)
    expect(payload.role).toBe('authenticated')
  })

  for (const fn of EDGE_FUNCTIONS) {
    test(`edge fn "${fn}" is reachable (not 500)`, async ({ request }) => {
      const r = await request.post(`${SUPABASE_URL}/functions/v1/${fn}`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        data: JSON.stringify({ _health_check: true }),
        failOnStatusCode: false,
      })
      expect(r.status(), `"${fn}" returned 500`).not.toBe(500)
      if (r.status() === 401) {
        const body = await r.text()
        expect(body, `"${fn}" verify_jwt misconfigured`).not.toContain('requires authorization token')
      }
    })
  }
})

// ═══════════════════════════════════════════════════════════════
// TIER 1 — Auth UI
// ═══════════════════════════════════════════════════════════════

test.describe('TIER 1 — Auth UI', () => {
  // Bypass Password Gate for all UI tests
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('distribution-os-dev-access', 'true')
    })
  })

  test('login page loads with functional form', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))

    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    expect(errors, `JS errors: ${errors.join(', ')}`).toEqual([])

    const emailInput = page.locator('input[type="email"]').first()
    await expect(emailInput).toBeVisible({ timeout: 10000 })

    // Mandatory: opacity > 0
    const opacity = await emailInput.evaluate((el: HTMLElement) => parseFloat(getComputedStyle(el).opacity))
    expect(opacity, 'Email input must be visible (opacity > 0)').toBeGreaterThan(0)

    // Mandatory: accepts keystrokes
    await emailInput.fill('test@example.com')
    expect(await emailInput.inputValue()).toBe('test@example.com')

    const pwInput = page.locator('input[type="password"]')
    await expect(pwInput).toBeVisible()
    await expect(pwInput).toBeEditable()
  })

  test('signup page loads', async ({ page }) => {
    await page.goto('/signup')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 10000 })
  })

  for (const route of ['/dashboard', '/settings', '/products', '/inbox']) {
    test(`${route} redirects to login`, async ({ page }) => {
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveURL(/\/login/)
      await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 5000 })
    })
  }
})

// ═══════════════════════════════════════════════════════════════
// TIER 2 — call-ai Behavior
// ═══════════════════════════════════════════════════════════════

test.describe('TIER 2 — call-ai', () => {
  let token: string

  test.beforeAll(async () => {
    token = await getAuthToken()
  })

  test('returns valid AI response with usage stats', async ({ request }) => {
    const r = await request.post(`${SUPABASE_URL}/functions/v1/call-ai`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      data: JSON.stringify({
        model: 'claude-sonnet-5',
        // claude-sonnet-5 runs adaptive thinking by default; thinking tokens
        // count against max_tokens, so leave headroom for the text answer
        max_tokens: 500,
        system: 'Respond with exactly: TEST_OK',
        messages: [{ role: 'user', content: 'Say the magic word' }],
      }),
      failOnStatusCode: false,
    })
    expect(r.status(), `call-ai returned ${r.status()}`).toBe(200)

    const data = await r.json()
    expect(data.content).toBeDefined()
    expect(Array.isArray(data.content)).toBe(true)
    expect(data.content.length).toBeGreaterThan(0)
    // content may lead with a thinking block — find the text block by type,
    // same as the app does in worker-base.ts
    const textBlock = data.content.find((b: { type: string }) => b.type === 'text')
    expect(textBlock, 'response contains a text block').toBeDefined()
    expect(textBlock.text).toBeTruthy()
    expect(data.usage).toBeDefined()
    expect(data.usage.input_tokens).toBeGreaterThan(0)
  })

  test('rejects unauthenticated (anon key)', async ({ request }) => {
    const r = await request.post(`${SUPABASE_URL}/functions/v1/call-ai`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      data: JSON.stringify({
        model: 'claude-sonnet-5', max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      }),
      failOnStatusCode: false,
    })
    expect(r.status()).toBe(401)
  })

  test('rejects missing required fields', async ({ request }) => {
    const r = await request.post(`${SUPABASE_URL}/functions/v1/call-ai`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      data: JSON.stringify({ model: 'claude-sonnet-5' }),
      failOnStatusCode: false,
    })
    expect(r.status()).toBe(400)
    const d = await r.json()
    expect(d.error).toContain('Missing required fields')
  })

  test('logs usage to ai_usage table', async ({ request }) => {
    // Make a call
    await request.post(`${SUPABASE_URL}/functions/v1/call-ai`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      data: JSON.stringify({
        model: 'claude-sonnet-5', max_tokens: 10,
        system: 'Say OK', messages: [{ role: 'user', content: 'test' }],
      }),
    })
    await new Promise(r => setTimeout(r, 2000))

    // Verify usage was logged — non-browser UA required: Supabase rejects
    // secret API keys when the User-Agent looks like a browser
    const ctx = await apiRequest.newContext({ userAgent: 'distribution-os-e2e' })
    const r = await ctx.get(
      `${SUPABASE_URL}/rest/v1/ai_usage?user_id=eq.${E2E_USER_ID}&order=created_at.desc&limit=1`,
      { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } }
    )
    expect(r.status(), `ai_usage read failed: ${await r.text()}`).toBe(200)
    const rows = await r.json()
    expect(rows.length).toBeGreaterThan(0)
    expect(rows[0].model).toBe('claude-sonnet-5')
    expect(rows[0].input_tokens).toBeGreaterThan(0)
    await ctx.dispose()
  })
})

// ═══════════════════════════════════════════════════════════════
// TIER 2 — Stripe
// ═══════════════════════════════════════════════════════════════

test.describe('TIER 2 — Stripe', () => {
  let token: string

  test.beforeAll(async () => {
    token = await getAuthToken()
  })

  test('stripe-checkout returns URL or expected error', async ({ request }) => {
    const r = await request.post(`${SUPABASE_URL}/functions/v1/stripe-checkout`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      data: JSON.stringify({ tier: 'starter' }),
      failOnStatusCode: false,
    })
    // 200 = checkout URL, 400 = already subscribed, both valid
    expect([200, 400]).toContain(r.status())
    if (r.status() === 200) {
      const d = await r.json()
      expect(d.url).toContain('checkout.stripe.com')
    }
  })

  test('stripe-webhook rejects unsigned requests', async ({ request }) => {
    const r = await request.post(`${SUPABASE_URL}/functions/v1/stripe-webhook`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ type: 'test' }),
      failOnStatusCode: false,
    })
    expect(r.status()).toBeGreaterThanOrEqual(400)
  })
})

// ═══════════════════════════════════════════════════════════════
// TIER 2 — Data Persistence (RLS)
// ═══════════════════════════════════════════════════════════════

test.describe('TIER 2 — Data Persistence', () => {
  test.describe.configure({ mode: 'serial' })
  let token: string

  test.beforeAll(async () => {
    token = await getAuthToken()
  })

  test('authenticated user can CRUD products', async ({ request }) => {
    const id = crypto.randomUUID()

    // Insert
    const ins = await request.post(`${SUPABASE_URL}/rest/v1/products`, {
      headers: {
        apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json', Prefer: 'return=representation',
      },
      data: JSON.stringify({
        id, user_id: E2E_USER_ID, name: 'E2E Test', description: 'test',
        stage: 'early', primary_engine: 'push', secondary_engines: ['pull'], color: '#000',
      }),
      failOnStatusCode: false,
    })
    expect(ins.status(), 'Product insert failed').toBe(201)

    // Read
    const read = await request.get(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    })
    const rows = await read.json()
    expect(rows.length).toBe(1)
    expect(rows[0].name).toBe('E2E Test')

    // Delete
    const del = await request.delete(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    })
    expect(del.status()).toBeLessThan(300)
  })

  test('authenticated user can CRUD tasks', async ({ request }) => {
    // Need a product first
    const pid = crypto.randomUUID()
    const prodIns = await request.post(`${SUPABASE_URL}/rest/v1/products`, {
      headers: {
        apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json', Prefer: 'return=representation',
      },
      data: JSON.stringify({
        id: pid, user_id: E2E_USER_ID, name: 'Task Test Product', description: 'temp',
        stage: 'early', primary_engine: 'push', secondary_engines: [], color: '#000',
      }),
      failOnStatusCode: false,
    })
    expect(prodIns.status(), `Task-test product insert failed: ${await prodIns.text()}`).toBe(201)

    const tid = crypto.randomUUID()
    const ins = await request.post(`${SUPABASE_URL}/rest/v1/tasks`, {
      headers: {
        apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json', Prefer: 'return=representation',
      },
      data: JSON.stringify({
        id: tid, user_id: E2E_USER_ID, product_id: pid,
        engine: 'push', title: 'E2E Task', description: 'test', score: 3,
        completed: false, week_id: '2026-W23',
      }),
      failOnStatusCode: false,
    })
    expect(ins.status(), `Task insert failed: ${await ins.text()}`).toBe(201)

    // Clean up
    await request.delete(`${SUPABASE_URL}/rest/v1/tasks?id=eq.${tid}`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
    })
    await request.delete(`${SUPABASE_URL}/rest/v1/products?id=eq.${pid}`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
    })
  })
})

// ═══════════════════════════════════════════════════════════════
// TIER 2 — User Preferences
// ═══════════════════════════════════════════════════════════════

test.describe('TIER 2 — User Preferences', () => {
  let token: string

  test.beforeAll(async () => { token = await getAuthToken() })

  const headers = () => ({
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  })

  test('can read user preferences', async ({ request }) => {
    const r = await request.get(
      `${SUPABASE_URL}/rest/v1/user_preferences?user_id=eq.${E2E_USER_ID}&select=*`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` }, failOnStatusCode: false },
    )
    // May be empty (no row yet) or 200 with data — both are valid
    expect([200, 406].includes(r.status()) || (r.status() === 200)).toBeTruthy()
  })

  test('can upsert and read back preferences', async ({ request }) => {
    const upsert = await request.post(`${SUPABASE_URL}/rest/v1/user_preferences`, {
      headers: { ...headers(), Prefer: 'return=representation,resolution=merge-duplicates' },
      data: JSON.stringify({
        user_id: E2E_USER_ID,
        dark_mode: true,
        week_start_day: 'sunday',
        subscription_tier: 'scale',
      }),
      failOnStatusCode: false,
    })
    expect(upsert.status(), `Upsert failed: ${await upsert.text()}`).toBeLessThan(300)

    // Read back
    const r = await request.get(
      `${SUPABASE_URL}/rest/v1/user_preferences?user_id=eq.${E2E_USER_ID}&select=dark_mode,week_start_day`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } },
    )
    expect(r.status()).toBe(200)
    const rows = await r.json()
    expect(rows[0].dark_mode).toBe(true)
    expect(rows[0].week_start_day).toBe('sunday')

    // Reset to defaults
    await request.post(`${SUPABASE_URL}/rest/v1/user_preferences`, {
      headers: { ...headers(), Prefer: 'return=representation,resolution=merge-duplicates' },
      data: JSON.stringify({ user_id: E2E_USER_ID, dark_mode: false, week_start_day: 'monday', subscription_tier: 'scale' }),
    })
  })
})

// ═══════════════════════════════════════════════════════════════
// TIER 2 — Inbox Artifacts
// ═══════════════════════════════════════════════════════════════

test.describe('TIER 2 — Inbox Artifacts', () => {
  let token: string
  let productId: string

  test.beforeAll(async ({ request }) => {
    token = await getAuthToken()
    // Create a temp product for artifact foreign key
    productId = crypto.randomUUID()
    await request.post(`${SUPABASE_URL}/rest/v1/products`, {
      headers: {
        apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        id: productId, user_id: E2E_USER_ID, name: 'Artifact Test Product',
        description: 'temp', stage: 'early', primary_engine: 'push',
        secondary_engines: [], color: '#111',
      }),
    })
  })

  test.afterAll(async ({ request }) => {
    // Clean up artifacts and product
    await request.delete(`${SUPABASE_URL}/rest/v1/inbox_artifacts?product_id=eq.${productId}`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
    })
    await request.delete(`${SUPABASE_URL}/rest/v1/products?id=eq.${productId}`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
    })
  })

  test('can insert, read, update, and delete an inbox artifact', async ({ request }) => {
    const aid = crypto.randomUUID()
    const h = {
      apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json', Prefer: 'return=representation',
    }

    // INSERT
    const ins = await request.post(`${SUPABASE_URL}/rest/v1/inbox_artifacts`, {
      headers: h,
      data: JSON.stringify({
        id: aid, user_id: E2E_USER_ID, product_id: productId,
        engine: 'push', worker_type: 'linkedin-director',
        task_title: 'E2E Artifact', status: 'pending',
        content: 'Test content from E2E',
      }),
      failOnStatusCode: false,
    })
    expect(ins.status(), `Artifact insert: ${await ins.text()}`).toBe(201)

    // READ
    const read = await request.get(
      `${SUPABASE_URL}/rest/v1/inbox_artifacts?id=eq.${aid}&select=task_title,status,content`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } },
    )
    const rows = await read.json()
    expect(rows).toHaveLength(1)
    expect(rows[0].task_title).toBe('E2E Artifact')
    expect(rows[0].status).toBe('pending')

    // UPDATE status
    const upd = await request.patch(`${SUPABASE_URL}/rest/v1/inbox_artifacts?id=eq.${aid}&user_id=eq.${E2E_USER_ID}`, {
      headers: h,
      data: JSON.stringify({ status: 'approved', approved_at: new Date().toISOString() }),
      failOnStatusCode: false,
    })
    expect(upd.status()).toBeLessThan(300)

    // DELETE
    const del = await request.delete(`${SUPABASE_URL}/rest/v1/inbox_artifacts?id=eq.${aid}`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    })
    expect(del.status()).toBeLessThan(300)
  })

  test('RLS prevents reading other users artifacts', async ({ request }) => {
    // Insert with service role as a different user
    const fakeId = crypto.randomUUID()
    await request.post(`${SUPABASE_URL}/rest/v1/inbox_artifacts`, {
      headers: {
        apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        id: fakeId, user_id: '00000000-0000-0000-0000-000000000001', product_id: productId,
        engine: 'push', worker_type: 'linkedin-director',
        task_title: 'Other User Artifact', status: 'pending', content: 'secret',
      }),
    })

    // Try to read as E2E user — should get empty
    const r = await request.get(
      `${SUPABASE_URL}/rest/v1/inbox_artifacts?id=eq.${fakeId}&select=*`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } },
    )
    const rows = await r.json()
    expect(rows, 'RLS should hide other users artifacts').toHaveLength(0)

    // Clean up
    await request.delete(`${SUPABASE_URL}/rest/v1/inbox_artifacts?id=eq.${fakeId}`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
    })
  })
})

// ═══════════════════════════════════════════════════════════════
// TIER 2 — Knowledge Base
// ═══════════════════════════════════════════════════════════════

test.describe('TIER 2 — Knowledge Base', () => {
  let token: string
  let productId: string

  test.beforeAll(async ({ request }) => {
    token = await getAuthToken()
    productId = crypto.randomUUID()
    await request.post(`${SUPABASE_URL}/rest/v1/products`, {
      headers: {
        apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        id: productId, user_id: E2E_USER_ID, name: 'KB Test Product',
        description: 'temp', stage: 'early', primary_engine: 'push',
        secondary_engines: [], color: '#222',
      }),
    })
  })

  test.afterAll(async ({ request }) => {
    await request.delete(`${SUPABASE_URL}/rest/v1/knowledge_bases?product_id=eq.${productId}`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
    })
    await request.delete(`${SUPABASE_URL}/rest/v1/products?id=eq.${productId}`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
    })
  })

  test('can upsert and read back knowledge base', async ({ request }) => {
    const h = {
      apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation,resolution=merge-duplicates',
    }

    const upsert = await request.post(`${SUPABASE_URL}/rest/v1/knowledge_bases`, {
      headers: h,
      data: JSON.stringify({
        user_id: E2E_USER_ID, product_id: productId,
        icp_who: 'SaaS founders', icp_pain: 'No distribution strategy',
        positioning_one_liner: 'AI-powered distribution',
        tone_formality: 'conversational',
        voice_examples: ['Example tweet'],
      }),
      failOnStatusCode: false,
    })
    expect(upsert.status(), `KB upsert: ${await upsert.text()}`).toBeLessThan(300)

    // Read back
    const r = await request.get(
      `${SUPABASE_URL}/rest/v1/knowledge_bases?product_id=eq.${productId}&user_id=eq.${E2E_USER_ID}&select=icp_who,positioning_one_liner`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } },
    )
    const rows = await r.json()
    expect(rows).toHaveLength(1)
    expect(rows[0].icp_who).toBe('SaaS founders')
    expect(rows[0].positioning_one_liner).toBe('AI-powered distribution')
  })

  test('can delete knowledge base', async ({ request }) => {
    const del = await request.delete(
      `${SUPABASE_URL}/rest/v1/knowledge_bases?product_id=eq.${productId}&user_id=eq.${E2E_USER_ID}`,
      {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      },
    )
    expect(del.status()).toBeLessThan(300)

    // Verify deleted
    const r = await request.get(
      `${SUPABASE_URL}/rest/v1/knowledge_bases?product_id=eq.${productId}&user_id=eq.${E2E_USER_ID}&select=*`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } },
    )
    const rows = await r.json()
    expect(rows).toHaveLength(0)
  })
})
