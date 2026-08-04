import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * v11 hardened audit gates — Distribution-OS.
 * Drives the LIVE staging site (staging.distributionos.predivo.ch) as the authenticated
 * e2e test user (session injected by auth.setup.ts). Read-write against the STAGING
 * Supabase (jckctrtkstejolddqzlk) via the Management API (superuser SQL — seeds/cleans
 * rows and bypasses the PostgREST 1000-cap). All secrets come from env:
 *   DIST_MGMT_TOKEN = Supabase Management API token (DB seed + cleanup)
 *   STAGING_REF     = jckctrtkstejolddqzlk (default)
 *   STAGING_TEST_EMAIL = confirmed staging test user (default below)
 *   STAGING_URL / STAGING_HTTP_USER / STAGING_HTTP_PASS via config (Basic auth)
 *
 * Gate A   — constrained-viewport reachability (off-screen critical-control class):
 *            the Add-Product dialog "+ Add Product" submit button at 4 viewports.
 * Gate B/J — mutation commit-boundary + zero-residue: creating a product writes NO
 *            products row on dialog-open/abandon, exactly ONE on Save.
 * Gate I   — correctness under real data volume (>1000-row PostgREST cap): the /products
 *            list must RENDER all products, not silently cap at 1000. Reads the rendered
 *            card count (not summed network).
 * Gate K   — fault-injected 500/empty data loads render gracefully (no white screen).
 * Gate M   — deployed-bundle identity — staging bundle talks to STAGING, never prod.
 *
 * A red run here IS the alert (same model as the fleet grant-drift/auth-email guards).
 * The only user-scoped table these gates write is `products`; every seed/cleanup is a
 * marker-scoped Management API SQL statement (name like 'ZZ_V11GATE%').
 */

const REF = process.env.STAGING_REF ?? 'jckctrtkstejolddqzlk'
const PROD_REF = 'jxjpbmkgmuunpayqgbsx'
const MGMT = process.env.DIST_MGMT_TOKEN ?? ''
const TEST_EMAIL = process.env.STAGING_TEST_EMAIL ?? 'e2e-test@distributionos-test.local'
const MARKER = 'ZZ_V11GATE_DELETE_ME'

// ---- Management API helper (superuser SQL; bypasses RLS + PostgREST 1000-cap) ----
async function sql<T = Record<string, unknown>>(query: string): Promise<T[]> {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MGMT}`,
      'Content-Type': 'application/json',
      'User-Agent': 'curl/8.5.0',
    },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) throw new Error(`mgmt query ${res.status}: ${await res.text()}`)
  return res.json()
}

// SQL-literal escape (marker/ids only — never user input).
const q = (s: string) => s.replace(/'/g, "''")

let USER_ID = ''

async function loadUserId(): Promise<string> {
  const rows = await sql<{ id: string }>(
    `select id from auth.users where email = '${q(TEST_EMAIL)}' limit 1;`,
  )
  if (!rows.length) throw new Error(`test user ${TEST_EMAIL} not found on staging`)
  return rows[0].id
}

// Remove every marker product this suite may have created (tasks cascade via FK).
async function cleanupMarkers() {
  await sql(
    `delete from public.products where user_id = '${q(USER_ID)}' and name like '${MARKER}%';`,
  )
}

const markerProductCount = async () =>
  Number(
    (await sql<{ n: number }>(
      `select count(*)::int as n from public.products where user_id='${q(USER_ID)}' and name like '${MARKER}%';`,
    ))[0].n,
  )

// Scope to the Add-Product dialog by its accessible name — creating the first product
// pops the onboarding WelcomeModal (also role="dialog"), so a bare getByRole('dialog')
// would ambiguously match it.
const addDialog = (page: Page) => page.getByRole('dialog', { name: 'Add New Product' })

// Open the Add-Product dialog (page-level button; unambiguous while the dialog is closed).
async function openAddProductDialog(page: Page) {
  await page.goto('/products')
  await page.waitForLoadState('networkidle')
  await page.locator('button:has-text("+ Add Product")').first().click()
  await expect(addDialog(page)).toBeVisible({ timeout: 10_000 })
}
const dialogNameInput = (page: Page) =>
  addDialog(page).getByPlaceholder('e.g. DistroKit, BelegPilot...')
const dialogSubmit = (page: Page) =>
  addDialog(page).getByRole('button', { name: '+ Add Product' })

// -------------------------- GATE A: viewport reachability --------------------------
const VIEWPORTS = [
  { name: '390x844 portrait', w: 390, h: 844 },
  { name: '375x360 kb-open', w: 375, h: 360 },
  { name: '812x375 landscape', w: 812, h: 375 },
  { name: '667x375 landscape', w: 667, h: 375 },
]

type Reach = {
  rectTop: number; rectBottom: number; vh: number
  inViewport: boolean; visible: boolean; hitOk: boolean; hitTag: string | null
}

async function measure(control: Locator): Promise<Reach> {
  return control.evaluate((el: Element) => {
    const r = el.getBoundingClientRect()
    const vh = window.visualViewport?.height ?? window.innerHeight
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2
    const hit = document.elementFromPoint(cx, cy)
    const he = el as HTMLElement
    return {
      rectTop: Math.round(r.top), rectBottom: Math.round(r.bottom), vh: Math.round(vh),
      inViewport: r.bottom <= vh + 0.5 && r.top >= -0.5 && r.left >= -0.5 && r.right <= window.innerWidth + 0.5,
      visible: he.offsetParent !== null && r.width > 0 && r.height > 0,
      hitOk: hit === el || el.contains(hit) || (!!hit && hit.contains(el)),
      hitTag: hit ? `${hit.tagName}.${(typeof hit.className === 'string' ? hit.className.split(' ')[0] : '')}` : null,
    }
  })
}

async function runReachGate(
  page: Page, label: string, open: () => Promise<void>, control: () => Locator,
) {
  const rows: string[] = []
  await page.setViewportSize({ width: 900, height: 900 })
  await open()
  await expect(control()).toBeVisible({ timeout: 15_000 })

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.w, height: vp.h })
    await page.waitForTimeout(250)
    let m = await measure(control())
    // "Reachable" = in-viewport AND visible AND its own center hit-tests to the control.
    // A scrollable modal (max-h + overflow-y-auto) can leave the submit in-viewport by rect
    // yet clipped by the dialog's own overflow boundary -> hit-test lands on the overlay.
    // Framework allowance: that's normal scrollable-modal UX, so scroll it into view and
    // RE-assert. A control that stays off-screen or covered by a FOREIGN overlay after the
    // allowed scroll still fails (the true off-screen/obstructed-Save defect class).
    let ok = m.inViewport && m.visible && m.hitOk
    let viaScroll = false
    if (!ok) {
      await control().scrollIntoViewIfNeeded().catch(() => {})
      await page.waitForTimeout(150)
      const m2 = await measure(control())
      if (m2.inViewport && m2.visible && m2.hitOk) { m = m2; ok = true; viaScroll = true }
    }
    expect.soft(m.inViewport && m.visible, `${label} @ ${vp.name}: control in viewport`).toBe(true)
    expect.soft(m.hitOk, `${label} @ ${vp.name}: hit-test == control (reachable, unobstructed)`).toBe(true)
    rows.push(
      `  ${label.padEnd(16)} | ${vp.name.padEnd(18)} | reachable=${ok}${viaScroll ? '(scroll)' : ''}`.padEnd(64) +
      ` | hitTest=${m.hitOk} | top=${m.rectTop} bottom=${m.rectBottom} vh=${m.vh} | hit=${m.hitTag}`,
    )
    if (vp.name === '375x360 kb-open') {
      await page.screenshot({ path: `test-results/gateA-${label}-375x360.png` })
    }
  }
  console.log(`\n[GATE A] ${label}\n${rows.join('\n')}`)
}

test.describe('Distribution-OS v11 gates', () => {
  test.beforeAll(async () => { USER_ID = await loadUserId() })

  // Open the Add-Product dialog and measure the "+ Add Product" submit-button reachability
  // — the exact off-screen-Save defect class — across constrained viewports.
  test('Gate A — Add-Product dialog "+ Add Product" reachability', async ({ page }) => {
    await runReachGate(
      page,
      'AddProduct',
      async () => {
        await openAddProductDialog(page)
        // Fill a name so the submit button is enabled (a disabled control is not the
        // real actionable target); we NEVER submit in this gate — no DB write.
        await dialogNameInput(page).fill(`${MARKER} reach`)
      },
      () => dialogSubmit(page),
    )
  })

  // -------------------------- GATE B/J: commit-boundary + zero-residue --------------------------
  // Creating a product is the app's cheapest real DB write (fire-and-forget sb.addProduct).
  // Opening/abandoning the dialog must write NO products row; Save must write exactly one.
  test('Gate B/J — create-product commit-boundary + zero-residue', async ({ page }) => {
    test.setTimeout(120_000)
    expect(MGMT, 'DIST_MGMT_TOKEN required').not.toBe('')

    // Pre-clean stale marker rows a prior/cancelled run may have left (shared staging).
    await cleanupMarkers()
    console.log(`[GATE B/J] baseline marker products=${await markerProductCount()}`)

    try {
      await page.setViewportSize({ width: 1000, height: 900 })

      // (1) Commit boundary: OPENING the dialog writes no products row.
      await openAddProductDialog(page)
      const dialog = addDialog(page)
      await page.waitForTimeout(800)
      const onOpen = await markerProductCount()
      console.log(`[GATE B/J] after dialog open (NO Save): products=${onOpen}`)
      expect(onOpen, 'opening the dialog writes NO products row').toBe(0)

      // (2) ABANDON (Escape) leaves zero residue.
      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden({ timeout: 5_000 })
      const onAbandon = await markerProductCount()
      console.log(`[GATE B/J] after abandon: products=${onAbandon}`)
      expect(onAbandon, 'abandon leaves 0 products rows').toBe(0)

      // (3) Reopen, fill name, Save -> exactly one row.
      await page.locator('button:has-text("+ Add Product")').first().click()
      await expect(dialog).toBeVisible({ timeout: 10_000 })
      await dialogNameInput(page).fill(`${MARKER} ${Date.now()}`)
      await dialogSubmit(page).click()
      await expect(dialog).toBeHidden({ timeout: 15_000 })

      let saved = 0
      for (let i = 0; i < 20; i++) {
        saved = await markerProductCount()
        if (saved >= 1) break
        await page.waitForTimeout(500)
      }
      console.log(`[GATE B/J] after Save: products=${saved}`)
      expect(saved, 'exactly one products row after Save').toBe(1)
    } finally {
      // CLEANUP — always remove marker rows even on failure.
      await cleanupMarkers()
      const leftover = await markerProductCount()
      console.log(`[GATE B/J] CLEANUP: marker products leftover=${leftover}`)
      expect(leftover, 'all marker rows removed').toBe(0)
    }
  })

  // -------------------------- GATE I: correctness under REAL data volume --------------------------
  // loadProducts() did `.select('*')` with no `.range()` -> PostgREST silently caps at 1000
  // rows, so a user with >1000 products would see only 1000 in the /products list. Seed >1000
  // marker products and assert the app RENDERS all of them (rendered card count, not summed
  // network) — passes whether loadProducts one-shots or paginates.
  test('Gate I — /products renders ALL products past the 1000-cap', async ({ page }) => {
    test.setTimeout(180_000)
    expect(MGMT, 'DIST_MGMT_TOKEN required').not.toBe('')
    const SEED = 1001

    await cleanupMarkers()

    // Count RENDERED marker cards (each product is an <a href="/products/:id"> showing its name).
    const readCount = async (): Promise<number> => {
      await page.setViewportSize({ width: 1200, height: 900 })
      await page.goto('/products')
      await page.waitForLoadState('networkidle')
      const cards = page.locator('a[href^="/products/"]', { hasText: MARKER })
      // Rendering settles after hydration; poll for a stable count.
      let last = -1, stable = 0
      for (let i = 0; i < 40; i++) {
        const v = await cards.count()
        if (v === last) { if (++stable >= 3) return v } else { stable = 0; last = v }
        await page.waitForTimeout(300)
      }
      return last
    }

    try {
      const before = await readCount()
      await sql(
        `insert into public.products (user_id, name, primary_engine, stage)
         select '${q(USER_ID)}', '${MARKER} #' || g, 'pull', 'early'
         from generate_series(1, ${SEED}) g;`,
      )
      const total = await markerProductCount()
      console.log(`[GATE I] seeded ${SEED} products (marker total ${total}; PostgREST default cap = 1000)`)

      const after = await readCount()
      console.log(`[GATE I] rendered marker cards: before=${before} after=${after} (expected ${before + SEED})`)
      expect(after - before, `app must render all ${SEED} new products, not silently cap at 1000`).toBe(SEED)
    } finally {
      // Clean up so a failure never leaves 1001 seed rows on staging.
      await cleanupMarkers()
    }
  })

  // -------------------------- GATE K: fault-injected data loads --------------------------
  for (const mode of ['500', 'empty'] as const) {
    for (const route of ['/dashboard', '/products'] as const) {
      test(`Gate K — ${route} graceful under ${mode}`, async ({ page }) => {
        await page.route(/\/rest\/v1\/.*/, (r) =>
          mode === '500'
            ? r.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"injected"}' })
            : r.fulfill({ status: 200, contentType: 'application/json', headers: { 'content-range': '*/0' }, body: '[]' }),
        )
        const errors: string[] = []
        page.on('pageerror', (e) => errors.push(e.message))
        await page.goto(route)
        await page.waitForTimeout(6000) // allow hydrate + localStorage fallback + settle

        // The AppLayout shell (main navigation) renders even when every data call fails.
        const shell = page.locator('nav[aria-label="Main navigation"], button[aria-label="Open sidebar"]').first()
        const shellVisible = await shell.isVisible().catch(() => false)
        const bodyText = (await page.locator('body').innerText().catch(() => '')).trim()
        const whiteScreen = bodyText.length < 20
        console.log(`[GATE K] ${route} ${mode}: shell=${shellVisible} bodyLen=${bodyText.length} pageerrors=${errors.length}`)
        expect.soft(shellVisible, `${route} ${mode}: app shell renders (no white screen)`).toBe(true)
        expect.soft(whiteScreen, `${route} ${mode}: not a white screen`).toBe(false)
        expect.soft(errors.length, `${route} ${mode}: no uncaught page errors`).toBe(0)
      })
    }
  }

  // -------------------------- GATE M: deployed-bundle identity & backend origin --------------------------
  // Proves the deployed STAGING site talks to the STAGING Supabase (never prod). This is both
  // a deploy-identity check and the guard that makes the write-gates above safe: if staging
  // were built with prod env, Gate B/I would be mutating the PRODUCTION database.
  test('Gate M — staging bundle talks to the STAGING backend, never prod', async ({ page }) => {
    const hosts = new Set<string>()
    page.on('request', (r) => {
      const u = r.url()
      if (u.includes('.supabase.co')) hosts.add(new URL(u).host)
    })
    await page.goto('/products')
    // Wait for the app shell to actually mount before judging network.
    await expect(page.locator('nav[aria-label="Main navigation"], button[aria-label="Open sidebar"]').first())
      .toBeVisible({ timeout: 15_000 })
    // The data fetch (loadProducts) can land after networkidle on a slow CI runner — poll for it.
    for (let i = 0; i < 25 && hosts.size === 0; i++) await page.waitForTimeout(300)
    const hostList = [...hosts]
    console.log(`[GATE M] supabase hosts contacted: ${JSON.stringify(hostList)}`)
    expect(hostList.some((h) => h.startsWith(REF)), `staging app talks to STAGING (${REF})`).toBe(true)
    expect(hostList.some((h) => h.startsWith(PROD_REF)), 'staging app must NOT touch PROD supabase').toBe(false)
  })
})
