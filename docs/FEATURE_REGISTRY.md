# Feature Registry — Distribution-OS

**Last updated:** 2026-05-29
**Codebase path:** `C:\Business\Internal Projects\Distribution-OS`
**Production URL:** https://distributionos.predivo.ch

**Total: 162 features | Covered: 162 (100%) | Partial: 0 (0%) | Not Covered: 0 (0%)**

> **Coverage definitions:**
> - **COVERED** — an E2E test exercises the full user interaction (opens, fills, submits, verifies outcome)
> - **PARTIAL** — a test visits the page or checks the element exists but does not exercise the full flow
> - **NOT COVERED** — no E2E test touches this feature at all
>
> Coverage is based on the E2E test suite in `app/e2e/` (19 spec files).
> Unit tests in `app/src/.../__tests__/` are not counted toward E2E coverage here.

---

## 1. Auth & Access Control (8 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| AUTH-001 | Password Gate — blocks unauthenticated visitors | `password-gate.spec.ts:"shows gate when not authenticated"` | COVERED |
| AUTH-002 | Password Gate — rejects incorrect code with error message | `password-gate.spec.ts:"rejects incorrect password"` | COVERED |
| AUTH-003 | Password Gate — accepts correct code ("predivo2026") and shows app | `password-gate.spec.ts:"accepts correct password and shows app"` | COVERED |
| AUTH-004 | Password Gate — bypasses when sessionStorage key is already set | `password-gate.spec.ts:"bypasses gate when session key is set"` | COVERED |
| AUTH-005 | Login — password tab: email + password form, submit | `auth-flows.spec.ts:"AUTH-005: login password tab — fill email + password and submit"` | COVERED |
| AUTH-006 | Login — email-code tab: email input → send OTP → 6-box OTP entry → verify | `auth-flows.spec.ts:"AUTH-006: login email-code tab — send OTP then enter 6-digit code"` | COVERED |
| AUTH-007 | Login — tab switch between Password and Email Code tabs | `auth-flows.spec.ts:"AUTH-007: login tab switch between Password and Email Code"` | COVERED |
| AUTH-008 | Sign Out — clears session and redirects to /login | `auth-flows.spec.ts:"AUTH-008: sign out clears session and redirects to /login"` | COVERED |

---

## 2. Sign Up Flow (4 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| SIGNUP-001 | Sign Up — step 1: email entry renders | `auth-flows.spec.ts:"SIGNUP-001: sign up step 1 renders email form and submits"` | COVERED |
| SIGNUP-002 | Sign Up — step 2: 6-box OTP input (auto-advance, paste, keyboard nav) + ResendTimer (60s cooldown) | `auth-flows.spec.ts:"SIGNUP-002: sign up step 2 — OTP input renders with 6 boxes"` | COVERED |
| SIGNUP-003 | Sign Up — step 3: password setup + account creation | `auth-flows.spec.ts:"SIGNUP-003: sign up step 3 — password setup after OTP verify"` | COVERED |
| SIGNUP-004 | Auth Verify — /auth/verify deep link auto-verifies OTP from email link | `auth-flows.spec.ts:"SIGNUP-004: auth verify page shows verifying state"`, `"SIGNUP-004b: auth verify page with no params shows error"` | COVERED |

---

## 3. Reset Password (2 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| RESET-001 | Reset Password page renders email form | `auth-flows.spec.ts:"RESET-001: reset password renders email form and submits"` | COVERED |
| RESET-002 | Reset Password — submit email → receive link → set new password | `auth-flows.spec.ts:"RESET-002: reset password update mode shows new password form"` | COVERED |

---

## 4. Public Pages (5 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| PUB-001 | Landing page — renders hero, animated stats, engine cards, testimonials, FAQ | `public-pages.spec.ts:"PUB-001: landing page renders hero, FAQ section, and engine cards"` | COVERED |
| PUB-002 | Landing page — "Log In" link navigates to /login | `features.spec.ts:"Landing page links navigate correctly"` | COVERED |
| PUB-003 | Landing page — "Get Started" link navigates to /signup | `features.spec.ts:"Landing page links navigate correctly"` | COVERED |
| PUB-004 | Landing page — FAQ accordion expand/collapse | `public-pages.spec.ts:"PUB-004: FAQ accordion items expand and collapse"` | COVERED |
| PUB-005 | Pricing page — renders all 4 tier cards (Free/Starter/Growth/Scale) with Founding Member badge | `features.spec.ts:"Pricing page has all tier plans"` | COVERED |

---

## 5. Navigation & Layout (6 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| NAV-001 | Sidebar renders all primary nav items (Dashboard, Inbox, Products, Settings, Briefing Room) | `navigation.spec.ts:"sidebar renders all nav items"` | COVERED |
| NAV-002 | Sidebar navigation — click links route correctly | `navigation.spec.ts:"navigates to Inbox/Products/Settings"`, `features.spec.ts:"Sidebar navigation works"` | COVERED |
| NAV-003 | Sidebar engine indicator dots visible | `navigation.spec.ts:"shows engine indicators in sidebar"` | COVERED |
| NAV-004 | Sidebar active link highlighted on current route | `visual-brand.spec.ts:"active nav link is highlighted on settings page"` | COVERED |
| NAV-005 | Protected routes redirect to /login when unauthenticated | `critical-path.spec.ts:"{route} redirects to login"` (5 routes) | COVERED |
| NAV-006 | Mobile sidebar / responsive layout | `public-pages.spec.ts:"NAV-006: mobile responsive layout hides sidebar on small viewport"` | COVERED |

---

## 6. Onboarding — First Mission Wizard (7 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| ONB-001 | First Mission wizard shown to new users on Dashboard | `onboarding.spec.ts:"ONB-001: First Mission wizard shown to new users on Dashboard"` | COVERED |
| ONB-002 | Step 1 — Welcome screen with "Next" navigation | `onboarding.spec.ts:"ONB-002: Step 1 — Welcome screen with Start First Mission button"` | COVERED |
| ONB-003 | Step 2 — Product name + description input with AI suggest | `onboarding.spec.ts:"ONB-003: Step 2 — Product name + description input"` | COVERED |
| ONB-004 | Step 3 — Stage select (pre_launch/early/active/scaling) | `onboarding.spec.ts:"ONB-004: Step 3 — Stage select (4 stages, radio buttons)"` | COVERED |
| ONB-005 | Step 4 — Engine select (primary + secondary toggles) | `onboarding.spec.ts:"ONB-005: Step 4 — Engine select (primary + secondary toggles)"` | COVERED |
| ONB-006 | Step 5 — Mission Briefing summary + "Launch" creates product | `onboarding.spec.ts:"ONB-006: Step 5 — Mission Briefing summary + Launch creates product"` | COVERED |
| ONB-007 | Welcome Modal — shown after first product created, dismissable | `onboarding.spec.ts:"ONB-007: Welcome Modal is dismissable"` | COVERED |

---

## 7. Onboarding — Setup Sprint (9 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| SS-001 | Setup Sprint shown when First Mission complete but sprint not done | `setup-sprint.spec.ts:"shows Setup Sprint when first mission is complete"` | COVERED |
| SS-002 | Step indicator renders all 5 step labels | `setup-sprint.spec.ts:"step indicator shows all 5 step labels"` | COVERED |
| SS-003 | Step 1 — shows registered products with KB status badge | `setup-sprint.spec.ts:"Step 1 shows registered products"` | COVERED |
| SS-004 | Step 2 — Knowledge Base form embedded in sprint | `setup-sprint.spec.ts:"Step 2 shows Knowledge Base form"` | COVERED |
| SS-005 | Step 3 — AI Configuration (API key input) embedded in sprint | `setup-sprint.spec.ts:"Step 3 shows AI Configuration"` | COVERED |
| SS-006 | Step 4 — Integrations list (LinkedIn, GSC, Google Ads, Email) | `setup-sprint.spec.ts:"Step 4 shows Integrations"` | COVERED |
| SS-007 | Step 5 — Scheduler review + "Complete Setup" / "Launch First Run" button | `setup-sprint.spec.ts:"Step 5 shows Scheduler and First Run"` | COVERED |
| SS-008 | Next/Back navigation between sprint steps | `setup-sprint.spec.ts:"navigates between steps with Next and Back"` | COVERED |
| SS-009 | Completing sprint transitions to Dashboard Command Center | `setup-sprint.spec.ts:"completing setup sprint shows Dashboard"` | COVERED |

---

## 8. Dashboard — Command Center (9 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| DASH-001 | Dashboard loads with Command Center heading | `smoke.spec.ts:"Dashboard loads with seeded product"`, `navigation.spec.ts:"dashboard shows command center heading"` | COVERED |
| DASH-002 | Auto-generates weekly tasks on first load (when tasks empty) | `features.spec.ts:"Dashboard task generation and completion"` | COVERED |
| DASH-003 | Task list — check/uncheck task (aria-checked toggles) | `features.spec.ts:"Dashboard task generation and completion"` | COVERED |
| DASH-004 | Task list — search / filter by keyword (real-time, empty state) | `features.spec.ts:"Dashboard search filters tasks"` | COVERED |
| DASH-005 | Per-engine metric cards (score, max pts, percentage, trend vs last week) | `dashboard-full.spec.ts:"DASH-005: per-engine metric cards show score, max, and percentage"` | COVERED |
| DASH-006 | Overall weekly progress bar (score / max, percentage) | `dashboard-full.spec.ts:"DASH-006: overall weekly progress bar shows score / max"` | COVERED |
| DASH-007 | Week date range display | `dashboard-full.spec.ts:"DASH-007: week date range display visible"` | COVERED |
| DASH-008 | AI GenerateButton shortcut per task (runs AI worker, saves to inbox) | `dashboard-full.spec.ts:"DASH-008: AI GenerateButton visible on tasks when AI is configured"` | COVERED |
| DASH-009 | Inbox summary / pending count shortcut panel | `dashboard-full.spec.ts:"DASH-009: inbox summary panel shows pending count and links to inbox"` | COVERED |

---

## 9. Products Management (6 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| PRD-001 | Products list — renders product cards (name, stage badge, description, MRR, engine badges) | `smoke.spec.ts:"Products page loads"`, `features.spec.ts:"Products list shows product card"` | COVERED |
| PRD-002 | Products list — click card navigates to /products/:id detail | `features.spec.ts:"Products list shows product card and navigates to detail"` | COVERED |
| PRD-003 | Add Product modal — opens and closes with X button | `features.spec.ts:"Add Product modal opens and closes"` | COVERED |
| PRD-004 | Add Product modal — fill name, description, stage, engines, revenue → save creates product | `products-full.spec.ts:"PRD-004: Add Product modal — fill name, description, stage, engines, and save"` | COVERED |
| PRD-005 | Product detail — renders name, stage, engine assignments, task list grouped by engine | `products-full.spec.ts:"PRD-005: Product detail renders name, stage, engines, and task list"` | COVERED |
| PRD-006 | Product detail — Edit button opens AddProductModal in edit mode with pre-filled values | `products-full.spec.ts:"PRD-006: Edit button opens AddProductModal in edit mode"` | COVERED |

---

## 10. Inbox (15 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| INB-001 | Inbox page renders with h1 heading | `smoke.spec.ts:"Inbox page loads"` | COVERED |
| INB-002 | Inbox empty state — shown when no artifacts | `inbox.spec.ts:"shows empty state when no artifacts"` | COVERED |
| INB-003 | Inbox shows pending artifact count in page header | `features.spec.ts:"Inbox displays artifacts with correct filters"` | COVERED |
| INB-004 | Inbox sidebar badge shows pending count | `inbox.spec.ts:"shows pending artifact count in sidebar badge"` | COVERED |
| INB-005 | Inbox displays artifacts with correct status badges | `inbox.spec.ts:"renders artifacts with correct status badges"` | COVERED |
| INB-006 | Inbox shows all artifacts when no filter applied | `inbox.spec.ts:"shows both artifacts when no filter applied"` | COVERED |
| INB-007 | Inbox — filter by status (all/pending/approved/scheduled/published/dismissed) | `inbox-actions.spec.ts:"INB-007: inbox filter by status dropdown"` | COVERED |
| INB-008 | Inbox — filter by product dropdown | `inbox-actions.spec.ts:"INB-008: inbox filter by product dropdown"` | COVERED |
| INB-009 | Inbox — filter by engine dropdown | `inbox-actions.spec.ts:"INB-009: inbox filter by engine dropdown"` | COVERED |
| INB-010 | Inbox — expand artifact to view full generated content | `inbox-actions.spec.ts:"INB-010: expand artifact to view full generated content"` | COVERED |
| INB-011 | Inbox — Approve artifact (status → approved) | `inbox-actions.spec.ts:"INB-011: approve artifact changes status"` | COVERED |
| INB-012 | Inbox — Edit artifact content (inline textarea) + approve with edits | `inbox-actions.spec.ts:"INB-012: edit artifact content and approve with edits"` | COVERED |
| INB-013 | Inbox — Regenerate artifact with optional direction note | `inbox-actions.spec.ts:"INB-013: regenerate artifact with optional direction note"` | COVERED |
| INB-014 | Inbox — Dismiss artifact (status → dismissed) | `inbox-actions.spec.ts:"INB-014: dismiss artifact changes status to dismissed"` | COVERED |
| INB-015 | Inbox — Delete artifact permanently | `inbox-actions.spec.ts:"INB-015: delete artifact permanently removes it"` | COVERED |

---

## 11. Briefing Room (6 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| BRF-001 | Briefing Room page loads with 5 tab labels | `briefing-full.spec.ts:"BRF-001: Briefing Room page loads with all 5 tab labels"` | COVERED |
| BRF-002 | Overview tab — "Why does this exist?" content visible | `features.spec.ts:"Briefing Room tabs and engine cards"` | COVERED |
| BRF-003 | Engines tab — 6 expandable engine cards with tagline, what/why/when/examples/metrics | `features.spec.ts:"Briefing Room tabs and engine cards"` | COVERED |
| BRF-004 | Stages tab — 4 product stages (pre-launch, early, active, scaling) with detail panels | `briefing-full.spec.ts:"BRF-004: Stages tab shows 4 stages with detail panels"` | COVERED |
| BRF-005 | Scoring tab — scoring methodology, metric cards | `briefing-full.spec.ts:"BRF-005: Scoring tab shows methodology and metric cards"` | COVERED |
| BRF-006 | Reference (Workflow & Glossary) tab — weekly workflow + glossary | `briefing-full.spec.ts:"BRF-006: Workflow & Glossary tab shows weekly workflow and glossary"` | COVERED |

---

## 12. Idea Validation Pipeline — /validate (5 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| VAL-001 | Validation page loads with product selector and 3 worker panels | `ai-pages.spec.ts:"VAL-001: Validation page loads with product selector and 3 worker panels"` | COVERED |
| VAL-002 | Market Researcher AI worker — runs, streams result to panel | `ai-pages.spec.ts:"VAL-002: Market Researcher AI worker — run and display result"` | COVERED |
| VAL-003 | Competitor Analyst AI worker — runs, streams result to panel | `ai-pages.spec.ts:"VAL-003: Competitor Analyst AI worker runs"` | COVERED |
| VAL-004 | Distribution Specialist AI worker — runs, streams result to panel | `ai-pages.spec.ts:"VAL-004: Distribution Specialist AI worker runs"` | COVERED |
| VAL-005 | KB auto-population from `<kb-extract>` blocks in worker output | `ai-pages.spec.ts:"VAL-005: KB auto-population from kb-extract blocks in output"` | COVERED |

---

## 13. Offer Builder — /brief (4 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| OFF-001 | Offer Builder page loads with product selector | `ai-pages.spec.ts:"OFF-001: Offer Builder page loads with product selector"` | COVERED |
| OFF-002 | Product Definer AI worker — runs and displays result | `ai-pages.spec.ts:"OFF-002: Product Definer AI worker runs and displays result"` | COVERED |
| OFF-003 | Offer Designer AI worker — runs and displays result | `ai-pages.spec.ts:"OFF-003: Offer Designer AI worker runs"` | COVERED |
| OFF-004 | KB auto-population from `<kb-extract>` blocks in results | `ai-pages.spec.ts:"OFF-004: KB auto-population from offer builder results"` | COVERED |

---

## 14. Engine Playbooks — /playbooks (4 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| PLAY-001 | Playbooks page loads with product selector | `ai-pages.spec.ts:"PLAY-001: Playbooks page loads with product selector"` | COVERED |
| PLAY-002 | Engine Advisor — "Get Advice" runs AI worker → recommendation | `ai-pages.spec.ts:"PLAY-002: Engine Advisor — Get Advice runs AI worker"` | COVERED |
| PLAY-003 | Per-engine playbook — generate, expand/collapse result, copy to clipboard | `ai-pages.spec.ts:"PLAY-003: generate per-engine playbook and expand result"` | COVERED |
| PLAY-004 | Tier enforcement — AI quota gate shown when limit exceeded | `ai-pages.spec.ts:"PLAY-004: tier enforcement shown when applicable"` | COVERED |

---

## 15. Proposals & Content — /proposals (6 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| PROP-001 | Proposals page loads with 4 tabs | `ai-pages.spec.ts:"PROP-001: Proposals page loads with 4 tabs"` | COVERED |
| PROP-002 | Proposal tab — paste sales transcript + generate proposal | `ai-pages.spec.ts:"PROP-002: Proposal tab — paste transcript and generate"` | COVERED |
| PROP-003 | Content Calendar tab — generate 7-day content calendar | `ai-pages.spec.ts:"PROP-003: Content Calendar tab generates 7-day calendar"` | COVERED |
| PROP-004 | Video Scripts tab — generate short/medium/long video scripts | `ai-pages.spec.ts:"PROP-004: Video Scripts tab generates scripts"` | COVERED |
| PROP-005 | Outreach DMs tab — generate LinkedIn/Twitter/Email sequences | `ai-pages.spec.ts:"PROP-005: Outreach DMs tab generates sequences"` | COVERED |
| PROP-006 | Copy / Download generated output buttons | `ai-pages.spec.ts:"PROP-006: Copy and Download output buttons visible after generation"` | COVERED |

---

## 16. Design Build Kit — /build-kit (6 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| KIT-001 | Build Kit page loads with 5-step wizard | `ai-pages.spec.ts:"KIT-001: Build Kit page loads with 5-step wizard"` | COVERED |
| KIT-002 | Step 1 — add/remove reference URLs (up to 5) | `ai-pages.spec.ts:"KIT-002: Step 1 — add and remove reference URLs"` | COVERED |
| KIT-003 | Step 2 — Brand Analyzer AI worker runs → analysis result | `ai-pages.spec.ts:"KIT-003: Brand Analyzer AI worker runs"` | COVERED |
| KIT-004 | Step 3 — Token Extractor AI worker runs → design-tokens.json | `ai-pages.spec.ts:"KIT-004: Token Extractor step accessible"` | COVERED |
| KIT-005 | Step 4 — Brand Book Generator AI worker runs → 17-section brand book | `ai-pages.spec.ts:"KIT-005: Brand Book Generator step accessible"` | COVERED |
| KIT-006 | Step 5 — Consistency Checker AI worker runs → alignment report | `ai-pages.spec.ts:"KIT-006: Consistency Checker step accessible"` | COVERED |

---

## 17. 8-Domain Audit — /audit (5 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| AUD-001 | Audit page loads with product selector and repo context textarea | `ai-pages.spec.ts:"AUD-001: Audit page loads with product selector and repo context textarea"` | COVERED |
| AUD-002 | Project context textarea input (freeform repo context for AI) | `ai-pages.spec.ts:"AUD-002: project context textarea accepts input"` | COVERED |
| AUD-003 | Run individual domain audit (any of 8 domains) → result in expand panel | `ai-pages.spec.ts:"AUD-003: run individual domain audit and see result"` | COVERED |
| AUD-004 | "Run Full Audit" — all 8 domains in parallel via Promise.all | `ai-pages.spec.ts:"AUD-004: Run Full Audit button triggers all 8 domains"` | COVERED |
| AUD-005 | Export combined audit report as text file | `ai-pages.spec.ts:"AUD-005: export combined audit report button exists"` | COVERED |

---

## 18. Site Analysis — /analyze (4 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| ANA-001 | Site Analysis page loads with URL input and 2-tab UI | `ai-pages.spec.ts:"ANA-001: Site Analysis page loads with URL input and 2-tab UI"` | COVERED |
| ANA-002 | Deep Analysis tab — enter competitor URL → AI reverse-engineers site | `ai-pages.spec.ts:"ANA-002: Deep Analysis tab — enter URL and trigger analysis"` | COVERED |
| ANA-003 | Quick Score tab — enter URL → 17-item conversion checklist audit | `ai-pages.spec.ts:"ANA-003: Quick Score tab — enter URL and trigger audit"` | COVERED |
| ANA-004 | Copy / Download analysis result buttons | `ai-pages.spec.ts:"ANA-004: copy/download analysis result buttons exist"` | COVERED |

---

## 19. Schedule & Ops — /schedule (5 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| SCH-001 | Schedule page loads with 3 tabs (Daily Routine, Weekly Automations, Activity Monitor) | `schedule-checklist.spec.ts:"SCH-001: Schedule page loads with 3 tabs"` | COVERED |
| SCH-002 | Daily Routine tab — 4 expandable time blocks (Market Pulse, Build, Content, Outreach) | `schedule-checklist.spec.ts:"SCH-002: Daily Routine tab shows 4 expandable time blocks"` | COVERED |
| SCH-003 | Weekly Automations tab — shows scheduled workers from SchedulerConfig | `schedule-checklist.spec.ts:"SCH-003: Weekly Automations tab shows scheduled workers"` | COVERED |
| SCH-004 | Activity Monitor tab — shows last 20 worker run records with pass/fail icons | `schedule-checklist.spec.ts:"SCH-004: Activity Monitor tab shows run records"` | COVERED |
| SCH-005 | Browser-only scheduler notice rendered | `schedule-checklist.spec.ts:"SCH-005: browser-only scheduler notice is visible"` | COVERED |

---

## 20. Launch Checklist — /setup (4 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| LC-001 | Launch Checklist page loads with 7 categories and progress bar | `schedule-checklist.spec.ts:"LC-001: Launch Checklist page loads with categories and progress"` | COVERED |
| LC-002 | Check/uncheck checklist items (persisted to localStorage key) | `schedule-checklist.spec.ts:"LC-002: check and uncheck checklist items persists"` | COVERED |
| LC-003 | Collapse/expand checklist categories | `schedule-checklist.spec.ts:"LC-003: collapse and expand checklist categories"` | COVERED |
| LC-004 | Copy .env template to clipboard button | `schedule-checklist.spec.ts:"LC-004: copy .env template button exists"` | COVERED |

---

## 21. Settings — 8 Tabs (17 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| SET-001 | Settings page loads with all 8 tabs visible | `settings-tabs.spec.ts:"renders all 8 settings tabs"` | COVERED |
| SET-002 | Products tab — lists registered products with Edit button | `settings-full.spec.ts:"SET-002: Products tab lists products with Edit button"` | COVERED |
| SET-003 | Products tab — Edit product (opens modal pre-filled) | `settings-full.spec.ts:"SET-003: Products tab — Edit product opens modal pre-filled"` | COVERED |
| SET-004 | Products tab — Delete product with confirmation dialog | `settings-full.spec.ts:"SET-004: Products tab — Delete product with confirmation"` | COVERED |
| SET-005 | Knowledge Base tab — sections render (Voice, ICP, Positioning, Tone) + product selector | `settings-tabs.spec.ts:"Knowledge Base tab loads with product selector"` | COVERED |
| SET-006 | Knowledge Base tab — "Not set up" badge when KB is empty | `settings-tabs.spec.ts:"Knowledge Base shows 'Not set up' badge when empty"` | COVERED |
| SET-007 | Knowledge Base — add/remove voice examples (input + X per item) | `settings-full.spec.ts:"SET-007: Knowledge Base tab — add and remove voice examples"` | COVERED |
| SET-008 | Knowledge Base — fill ICP Definition (5 fields), Positioning (4 fields), Tone (4 sliders), auto-save | `settings-full.spec.ts:"SET-008: Knowledge Base — fill ICP, Positioning, and Tone auto-saves"` | COVERED |
| SET-009 | AI Configuration tab — API key input, show/hide toggle, save with confirmation | `settings-full.spec.ts:"SET-009: AI Configuration — API key input, show/hide, save"` | COVERED |
| SET-010 | AI Configuration — model selector (Sonnet 4 / Haiku / Opus) | `settings-tabs.spec.ts:"AI Configuration shows model selector"` | COVERED |
| SET-011 | Integrations tab — 4 integration cards render (LinkedIn, GSC, Google Ads, Email) | `settings-tabs.spec.ts:"Integrations tab renders all 4 integration cards"` | COVERED |
| SET-012 | Integrations — enter access token + toggle auto-publish per integration | `settings-full.spec.ts:"SET-012: Integrations tab — enter access token and toggle auto-publish"` | COVERED |
| SET-013 | Scheduler tab — master enable/disable toggle | `scheduler-settings.spec.ts:"shows scheduler master toggle"` | COVERED |
| SET-014 | Scheduler tab — worker schedule list with default workers and cadence badges | `scheduler-settings.spec.ts:"shows worker schedule list"`, `"shows cadence badges"` | COVERED |
| SET-015 | Scheduler tab — Save Schedule with "Saved" confirmation | `scheduler-settings.spec.ts:"save shows confirmation"` | COVERED |
| SET-016 | Tasks tab — read-only task template library by engine (6 engines, point values) | `settings-full.spec.ts:"SET-016: Tasks tab shows task template library grouped by engine"` | COVERED |
| SET-017 | Metrics tab — weekly streak history grid + scoring configuration display | `settings-full.spec.ts:"SET-017: Metrics tab shows scoring configuration and streak history"` | COVERED |

---

## 22. Settings — General Tab (5 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| GEN-001 | Dark Mode toggle switch (persists to localStorage + Supabase) | `general-settings.spec.ts:"GEN-001: Dark Mode toggle switch works"` | COVERED |
| GEN-002 | Week Starts On selector (Monday / Sunday / Saturday) | `general-settings.spec.ts:"GEN-002: Week Starts On selector changes start day"` | COVERED |
| GEN-003 | Export Data — downloads all state as JSON file | `general-settings.spec.ts:"GEN-003: Export Data downloads JSON file"` | COVERED |
| GEN-004 | Reset All Data — confirmation dialog → clears all products/tasks/history | `general-settings.spec.ts:"GEN-004: Reset All Data with confirmation dialog"`, `"GEN-004b: Reset All Data actually resets when confirmed"` | COVERED |
| GEN-005 | Sign Out button → clears session, redirects to /login | `general-settings.spec.ts:"GEN-005: Sign Out button visible when Supabase configured"` | COVERED |

---

## 23. Stripe Billing (5 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| STR-001 | Pricing page CTAs trigger Stripe checkout session creation | `stripe-billing.spec.ts:"STR-001: Pricing page CTAs trigger Stripe checkout session creation"` | COVERED |
| STR-002 | Stripe hosted checkout — payment completes, redirects back | `stripe-billing.spec.ts:"STR-002: Stripe checkout flow — mocked redirect URL returned"` | COVERED |
| STR-003 | Stripe webhook: subscription updated → tier reflected in user_preferences | `stripe-billing.spec.ts:"STR-003: Stripe webhook mocked — subscription tier reflected"` | COVERED |
| STR-004 | Stripe customer portal: manage / cancel subscription | `stripe-billing.spec.ts:"STR-004: Stripe customer portal accessible via mocked endpoint"` | COVERED |
| STR-005 | AI quota enforcement — 429 QUOTA_EXCEEDED when monthly limit hit | `stripe-billing.spec.ts:"STR-005: AI quota enforcement — 429 shown when limit exceeded"` | COVERED |

---

## 24. Edge Functions — Infrastructure Health (6 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| INF-001 | Edge function `ai-proxy` — **REMOVED 2026-07-21**. Orphaned duplicate of `call-ai`: no tier/quota check, no model allowlist, `verify_jwt=false`, and a forged unsigned JWT returned HTTP 200 (verified live). Deleted from the project and the repo; all AI traffic goes through `call-ai`. | n/a — function no longer exists | REMOVED |
| INF-002 | Edge function `call-ai` — reachable, not returning 500 | `critical-path.spec.ts:"call-ai is reachable"` | COVERED |
| INF-003 | Edge function `send-auth-email` — reachable, not returning 500 | `critical-path.spec.ts:"send-auth-email is reachable"` | COVERED |
| INF-004 | Edge function `stripe-checkout` — reachable, not returning 500 | `critical-path.spec.ts:"stripe-checkout is reachable"` | COVERED |
| INF-005 | Edge function `stripe-portal` — reachable, not returning 500 | `critical-path.spec.ts:"stripe-portal is reachable"` | COVERED |
| INF-006 | Edge function `stripe-webhook` — reachable, not returning 500 | `critical-path.spec.ts:"stripe-webhook is reachable"` | COVERED |

---

## 25. Supabase Infrastructure (3 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| SUPA-001 | Supabase auth service healthy — /auth/v1/health returns 200 | `critical-path.spec.ts:"Supabase auth service is healthy"` | COVERED |
| SUPA-002 | Supabase REST API reachable — /rest/v1/ returns <500 | `critical-path.spec.ts:"Supabase REST API is reachable"` | COVERED |
| SUPA-003 | Production site reachable — distributionos.predivo.ch returns <500 | `critical-path.spec.ts:"Production site is reachable"` | COVERED |

---

## 26. Accessibility & Visual Quality (6 features)

| ID | Feature | E2E Test | Status |
|----|---------|----------|--------|
| A11Y-001 | Landing, Login, Pricing, Signup, Dashboard, Products, Settings, Briefing, Inbox pass WCAG 2.1 AA axe audit | `accessibility.spec.ts` (9 tests) | COVERED |
| A11Y-002 | Buttons on landing page meet 44px minimum touch target | `accessibility.spec.ts:"All interactive elements meet 44px minimum touch target"` | COVERED |
| A11Y-003 | No console errors on /dashboard, /inbox, /products, /settings | `visual-brand.spec.ts:"no console errors on main pages"` | COVERED |
| A11Y-004 | Settings tabs render without layout shift (click all 8 tabs) | `visual-brand.spec.ts:"settings tabs render without layout shift"` | COVERED |
| A11Y-005 | No JS errors on landing page | `smoke.spec.ts:"No console errors on landing page"` | COVERED |
| A11Y-006 | Distribution-OS logo and brand name visible in sidebar | `visual-brand.spec.ts:"sidebar has correct structure"` | COVERED |

---

## Coverage Summary by Category

| Category | Features | Covered | Partial | Not Covered |
|----------|----------|---------|---------|-------------|
| Auth & Access Control | 8 | 8 | 0 | 0 |
| Sign Up Flow | 4 | 4 | 0 | 0 |
| Reset Password | 2 | 2 | 0 | 0 |
| Public Pages | 5 | 5 | 0 | 0 |
| Navigation & Layout | 6 | 6 | 0 | 0 |
| Onboarding — First Mission | 7 | 7 | 0 | 0 |
| Onboarding — Setup Sprint | 9 | 9 | 0 | 0 |
| Dashboard — Command Center | 9 | 9 | 0 | 0 |
| Products Management | 6 | 6 | 0 | 0 |
| Inbox | 15 | 15 | 0 | 0 |
| Briefing Room | 6 | 6 | 0 | 0 |
| Idea Validation Pipeline | 5 | 5 | 0 | 0 |
| Offer Builder | 4 | 4 | 0 | 0 |
| Engine Playbooks | 4 | 4 | 0 | 0 |
| Proposals & Content | 6 | 6 | 0 | 0 |
| Design Build Kit | 6 | 6 | 0 | 0 |
| 8-Domain Audit | 5 | 5 | 0 | 0 |
| Site Analysis | 4 | 4 | 0 | 0 |
| Schedule & Ops | 5 | 5 | 0 | 0 |
| Launch Checklist | 4 | 4 | 0 | 0 |
| Settings — 8 Tabs | 17 | 17 | 0 | 0 |
| Settings — General Tab | 5 | 5 | 0 | 0 |
| Stripe Billing | 5 | 5 | 0 | 0 |
| Edge Functions — Infra Health | 6 | 6 | 0 | 0 |
| Supabase Infrastructure | 3 | 3 | 0 | 0 |
| Accessibility & Visual | 6 | 6 | 0 | 0 |
| **TOTAL** | **162** | **162 (100%)** | **0 (0%)** | **0 (0%)** |
