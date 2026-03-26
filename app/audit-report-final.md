# Distribution OS — Website Audit Report

**Date:** 2026-03-24
**Audited by:** Claude Code
**Stack:** React 19 + TypeScript 5.9 + Vite 8 + Tailwind CSS 4 + Supabase (auth) + TanStack React Query + React Router 7 + localStorage persistence + Anthropic AI API (direct browser calls)
**Overall Health Score: 74/100**

---

## Executive Summary

Distribution OS is a well-structured single-page application with clean TypeScript code, strict compiler settings, zero ESLint errors, and a solid design token system. The main concerns are: (1) a **hardcoded password** visible in the client bundle, (2) a **660 KB monolithic JS bundle** with no code splitting, (3) missing **robots.txt, sitemap.xml, and structured data** for the public-facing pages, (4) **no security headers** configured, and (5) **API keys stored in localStorage** without encryption. The codebase is well-organized with good separation of concerns and no dead code or TODO markers.

---

## Summary Table

| Domain         | Critical | High | Medium | Low | Info |
|----------------|----------|------|--------|-----|------|
| Security       | 1        | 2    | 2      | 1   | 0    |
| Technical SEO  | 0        | 2    | 3      | 1   | 1    |
| Performance    | 0        | 1    | 2      | 1   | 0    |
| Code Quality   | 0        | 0    | 1      | 2   | 1    |
| Accessibility  | 0        | 0    | 2      | 2   | 0    |
| **Total**      | **1**    | **5**| **10** | **7**| **2**|

---

## 1. SECURITY

### SEC-001 — Hardcoded Password in Client Bundle
**Severity:** Critical
**File:** `src/components/shared/PasswordGate.tsx`, line 3
**Description:** The pre-launch access password `distributionos2026` is hardcoded as a plain string constant. Since this is a client-side SPA, anyone can read it from the JS bundle via View Source or DevTools.
**Fix:** Move the password check to a server-side endpoint (Supabase Edge Function or simple API route). If a client-only gate is intentional for pre-launch, at minimum use an environment variable (`VITE_GATE_PASSWORD`) so it is not committed to source control, and understand this is security-through-obscurity only.

### SEC-002 — API Keys Stored in localStorage Without Encryption
**Severity:** High
**Files:** `src/lib/ai/config.ts` (line 23), `src/lib/ai/integrations.ts` (lines 11, 18, 22, 26)
**Description:** The Anthropic API key, LinkedIn access token, Google Ads token, and email service API key are all stored in `localStorage` as plain JSON. Any XSS vulnerability would expose all keys. localStorage is also accessible to browser extensions.
**Fix:** Store API keys in Supabase (server-side, encrypted at rest) and proxy API calls through an Edge Function. If local-only mode must be supported, warn users clearly and consider using `sessionStorage` to reduce persistence.

### SEC-003 — No Security Headers Configured
**Severity:** High
**File:** `vite.config.ts` (deployment config)
**Description:** No `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy` headers are configured. For Metanet FTP deployment, these must be set via `.htaccess` or the hosting panel.
**Fix:** Add an `.htaccess` file (or equivalent) with:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self' https://api.anthropic.com https://*.supabase.co;
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### SEC-004 — npm Audit: High Severity Vulnerability in `flatted`
**Severity:** Medium
**File:** `package-lock.json` (dependency: `flatted <=3.4.1`)
**Description:** Prototype Pollution via `parse()` in flatted. This is a transitive dependency.
**Fix:** Run `npm audit fix` to update to a patched version.

### SEC-005 — Direct Browser API Calls with `anthropic-dangerous-direct-browser-access` Header
**Severity:** Medium
**File:** `src/lib/ai/worker-base.ts`, line 106
**Description:** API calls to Anthropic are made directly from the browser with the `anthropic-dangerous-direct-browser-access` header. This exposes the API key in network traffic and bypasses standard CORS protections. The header name itself signals this is not a recommended pattern.
**Fix:** Route all AI API calls through a backend proxy (Supabase Edge Function). This also eliminates the need for user-managed API keys.

### SEC-006 — OTP `shouldCreateUser: true` Without Rate Limiting
**Severity:** Low
**File:** `src/hooks/useAuth.ts`, line 44
**Description:** The `sendOtp` function passes `shouldCreateUser: true`, meaning any email address triggers account creation. Without client-side rate limiting or CAPTCHA, this could be abused for account enumeration or email spam.
**Fix:** Add a CAPTCHA (e.g., Cloudflare Turnstile) on the signup form, or ensure Supabase rate-limiting is configured on the project dashboard.

---

## 2. TECHNICAL SEO

### SEO-001 — Missing robots.txt
**Severity:** High
**File:** `public/` (missing file)
**Description:** No `robots.txt` file exists. Search engines may crawl the app routes unpredictably, and there is no way to block protected routes from indexing.
**Fix:** Add `public/robots.txt`:
```
User-agent: *
Allow: /
Allow: /pricing
Disallow: /dashboard
Disallow: /inbox
Disallow: /products
Disallow: /settings
Disallow: /briefing

Sitemap: https://distribution-os.predivo.ch/sitemap.xml
```

### SEO-002 — Missing sitemap.xml
**Severity:** High
**File:** `public/` (missing file)
**Description:** No `sitemap.xml` exists. The public pages (`/`, `/pricing`, `/login`, `/signup`, `/reset-password`) are not discoverable by search engines via a sitemap.
**Fix:** Add `public/sitemap.xml` with the 5 public URLs, including `<lastmod>` dates and `<changefreq>`.

### SEO-003 — No Open Graph / Twitter Card Meta Tags
**Severity:** Medium
**File:** `index.html`
**Description:** The `index.html` has a `<meta name="description">` but no `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card`, or `twitter:title` tags. Social sharing will produce a blank preview.
**Fix:** Add OG and Twitter Card meta tags to `index.html`. For route-specific metadata, consider `react-helmet-async` or a Vite SSR plugin.

### SEO-004 — No Canonical Tag
**Severity:** Medium
**File:** `index.html`
**Description:** No `<link rel="canonical">` is set. This is especially important for SPA routes where the same content might be accessible via multiple URL patterns.
**Fix:** Add `<link rel="canonical" href="https://distribution-os.predivo.ch/" />` and dynamically update it per route using `react-helmet-async`.

### SEO-005 — No JSON-LD Structured Data
**Severity:** Medium
**File:** `index.html`, `src/pages/Landing.tsx`, `src/pages/Pricing.tsx`
**Description:** No JSON-LD structured data exists for Organization, SoftwareApplication, or FAQPage schemas. This limits rich snippet eligibility.
**Fix:** Add `<script type="application/ld+json">` blocks for `SoftwareApplication` and `Organization` schema on the landing page, and `Product` schema on the pricing page.

### SEO-006 — Single `<title>` for All Routes
**Severity:** Low
**File:** `index.html`, line 10
**Description:** The page title is always "Distribution OS" regardless of route. Each public page should have a unique, descriptive title.
**Fix:** Use `react-helmet-async` to set route-specific titles (e.g., "Pricing | Distribution OS", "Log In | Distribution OS").

### SEO-007 — Footer Missing Legal Links
**Severity:** Info
**Files:** `src/pages/Landing.tsx` (line 150), `src/pages/Pricing.tsx` (line 129)
**Description:** No links to privacy policy, terms of service, or imprint. German law (Impressumspflicht) requires an imprint for commercial websites operated by a GmbH.
**Fix:** Add footer links to `/privacy`, `/terms`, and `/imprint` pages. This is legally required for Prodiva GmbH.

---

## 3. PERFORMANCE

### PERF-001 — 660 KB Monolithic JS Bundle (No Code Splitting)
**Severity:** High
**File:** Build output: `dist/assets/index-DTxgHTyC.js` (660.21 KB, 181.79 KB gzipped)
**Description:** The entire application ships as a single JS chunk. Vite's build warning confirms the bundle exceeds the 500 KB threshold. The Briefing Room alone contains large inline data objects (~15 KB of text). Public pages (Landing, Pricing, Login, SignUp) download the entire app including Dashboard, Settings, AI workers, and scheduler.
**Fix:** Use `React.lazy()` + `Suspense` for route-level code splitting:
```tsx
const Dashboard = lazy(() => import('@/components/dashboard/Dashboard'))
const BriefingRoom = lazy(() => import('@/components/briefing/BriefingRoom'))
const Settings = lazy(() => import('@/components/settings/Settings'))
const Inbox = lazy(() => import('@/components/inbox/Inbox'))
```
This should reduce the initial bundle to ~200 KB for public pages.

### PERF-002 — Google Fonts Loaded as Render-Blocking Resource
**Severity:** Medium
**File:** `index.html`, lines 11-13
**Description:** Two Google Font families (Inter + JetBrains Mono, 8 weights total) are loaded via `<link>` tags. These block rendering until the fonts are downloaded. Loading 8 font weights is also excessive.
**Fix:**
1. Reduce to the weights actually used: Inter 400, 500, 600, 700 and JetBrains Mono 400, 500.
2. Add `font-display: swap` to the Google Fonts URL: `&display=swap` (already present).
3. Consider self-hosting the fonts with `@font-face` and `font-display: swap` for better control and fewer DNS lookups.

### PERF-003 — Polling Inbox Count Every 30 Seconds
**Severity:** Medium
**File:** `src/components/layout/AppLayout.tsx`, line 29
**Description:** The sidebar polls `localStorage` every 30 seconds to update the inbox badge count. While not expensive per-call, this runs continuously and is unnecessary when a React state update from the same tab could propagate the count change.
**Fix:** Use a shared state (React Context or a simple pub-sub) to broadcast inbox count changes instead of polling.

### PERF-004 — No Image Optimization Strategy
**Severity:** Low
**File:** General
**Description:** The app currently has no raster images (only SVG favicon and Lucide icons), which is good. However, there is no image optimization pipeline configured for when images are added (e.g., screenshots, OG images).
**Fix:** When images are needed, add `vite-plugin-image-optimizer` or use `<picture>` with WebP/AVIF formats.

---

## 4. CODE QUALITY

### CQ-001 — Leftover `console.debug` Statement
**Severity:** Medium
**File:** `src/lib/ai/integrations.ts`, line 121
**Description:** A `console.debug` statement remains in production code: `console.debug('[publishEmailSequence] would send:', emails.length, 'chars')`.
**Fix:** Remove the `console.debug` call or gate it behind a `DEV` check: `if (import.meta.env.DEV) console.debug(...)`.

### CQ-002 — Misleading Helper Text in AddProductModal
**Severity:** Low
**File:** `src/components/shared/AddProductModal.tsx`, line 164
**Description:** The description field's helper text says "Select a product type" but it is a free-text description input, not a product type selector.
**Fix:** Change line 164 to `<p className="mt-1 text-xs text-[var(--color-ink-muted)]">Brief summary of what your product does</p>`.

### CQ-003 — `WeekRecord.startDate` and `endDate` Always Empty
**Severity:** Low
**Files:** `src/lib/storage.ts` (line 46-47), `src/hooks/useAppState.ts` (line 57-58)
**Description:** When archiving a week, `startDate` and `endDate` are always set to empty strings `''`. The `WeekRecord` type defines them as `string` but they are never populated with actual dates.
**Fix:** Calculate the actual start and end dates from the `weekId` (ISO week) and populate them, or remove the fields from the type if they are not needed.

### CQ-004 — Zero ESLint Errors, Strict TypeScript
**Severity:** Info
**Files:** `tsconfig.app.json`, `eslint.config.js`
**Description:** ESLint passes with zero errors/warnings. TypeScript is configured with `strict: true`, `noUnusedLocals`, and `noUnusedParameters`. This is excellent.
**Fix:** No action needed. Maintain this standard.

---

## 5. ACCESSIBILITY (WCAG 2.1 AA)

### A11Y-001 — Modal Does Not Trap Focus
**Severity:** Medium
**File:** `src/components/shared/AddProductModal.tsx`
**Description:** The AddProductModal handles Escape key but does not implement focus trapping. A keyboard user can Tab out of the modal into the background content. There is also no `aria-describedby` for the modal description.
**Fix:** Implement a focus trap (use `@radix-ui/react-focus-trap` or a custom implementation). Ensure focus moves to the first focusable element on open and returns to the trigger on close.

### A11Y-002 — Tooltip Not Accessible to Keyboard Users
**Severity:** Medium
**File:** `src/components/shared/Tooltip.tsx`
**Description:** The Tooltip component uses `onMouseEnter`/`onMouseLeave` and `onFocus`/`onBlur`, which is good. However, the trigger element (`<span>`) is not natively focusable. It requires `tabIndex={0}` to be reachable by keyboard. The tooltip content also lacks `role="tooltip"` and `aria-describedby` linkage.
**Fix:** Add `tabIndex={0}` to the trigger span, `role="tooltip"` and a unique `id` to the tooltip content, and `aria-describedby` pointing to that id on the trigger.

### A11Y-003 — No Skip-to-Content Link
**Severity:** Low
**File:** `src/components/layout/AppLayout.tsx`
**Description:** No "Skip to main content" link exists. Keyboard users must tab through the entire sidebar navigation to reach the main content on every page.
**Fix:** Add a visually-hidden skip link as the first focusable element: `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to content</a>` and add `id="main-content"` to the `<main>` element.

### A11Y-004 — Landing Page Engine Cards Missing Heading Hierarchy
**Severity:** Low
**File:** `src/pages/Landing.tsx`, lines 91-108
**Description:** The engine cards in the landing page use `<h3>` inside a section whose heading is `<h2>`. This is correct, but the "How It Works" section at line 117 also uses `<h3>`, creating a flat heading structure where nesting should be evident. Additionally, engine card descriptions lack `role` or ARIA context for screen readers.
**Fix:** The heading hierarchy is technically valid. For improvement, add `aria-label` to each engine card section.

---

## Quick Wins (< 30 min each)

1. **SEC-004:** Run `npm audit fix` — 1 minute
2. **CQ-001:** Remove `console.debug` from `integrations.ts` — 1 minute
3. **CQ-002:** Fix misleading helper text in AddProductModal — 1 minute
4. **SEO-001:** Add `robots.txt` — 5 minutes
5. **SEO-002:** Add `sitemap.xml` — 5 minutes
6. **SEO-003:** Add OG/Twitter meta tags to `index.html` — 10 minutes
7. **SEO-004:** Add canonical tag — 2 minutes
8. **A11Y-003:** Add skip-to-content link — 10 minutes
9. **A11Y-002:** Add `tabIndex={0}` and `role="tooltip"` — 10 minutes

---

## Priority Roadmap

### Phase 1 — Critical & Quick Wins (This Week)
| ID | Finding | Effort |
|----|---------|--------|
| SEC-001 | Move password gate to env var or server-side | 30 min |
| SEC-004 | `npm audit fix` | 1 min |
| SEO-001 | Add `robots.txt` | 5 min |
| SEO-002 | Add `sitemap.xml` | 5 min |
| SEO-003 | Add OG/Twitter meta tags | 10 min |
| CQ-001 | Remove `console.debug` | 1 min |
| CQ-002 | Fix helper text | 1 min |
| SEO-007 | Add legal pages (Impressum, Privacy, Terms) | 2 hrs |

### Phase 2 — High Priority (Next Sprint)
| ID | Finding | Effort |
|----|---------|--------|
| PERF-001 | Route-level code splitting with `React.lazy` | 2 hrs |
| SEC-002 | Move API keys to server-side storage | 4 hrs |
| SEC-003 | Configure security headers | 1 hr |
| SEC-005 | Proxy AI calls through Edge Function | 4 hrs |
| A11Y-001 | Add focus trap to modal | 1 hr |
| A11Y-002 | Fix tooltip accessibility | 30 min |
| SEO-006 | Route-specific page titles | 1 hr |

### Phase 3 — Medium Priority (Backlog)
| ID | Finding | Effort |
|----|---------|--------|
| PERF-002 | Optimize font loading | 1 hr |
| PERF-003 | Replace inbox polling with pub-sub | 1 hr |
| SEO-004 | Dynamic canonical tags per route | 1 hr |
| SEO-005 | Add JSON-LD structured data | 1 hr |
| SEC-006 | Add CAPTCHA to signup | 2 hrs |
| A11Y-003 | Add skip-to-content link | 10 min |
| CQ-003 | Populate WeekRecord date fields | 30 min |

---

## Scoring Breakdown

| Category | Max | Score | Notes |
|----------|-----|-------|-------|
| Security | 25 | 14 | Hardcoded password (-6), localStorage API keys (-3), no headers (-2) |
| Technical SEO | 20 | 11 | No robots/sitemap (-4), no OG tags (-2), no structured data (-2), no legal pages (-1) |
| Performance | 20 | 15 | 660KB bundle (-4), render-blocking fonts (-1) |
| Code Quality | 20 | 18 | Excellent: strict TS, zero lint errors; minor console.debug (-1), misleading text (-1) |
| Accessibility | 15 | 11 | No focus trap (-2), tooltip issues (-1), no skip link (-1) |
| **Total** | **100** | **74** | |
