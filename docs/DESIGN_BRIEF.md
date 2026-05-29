# BelegPilot Design Brief

## Product
- **Name:** BelegPilot
- **Description:** AI-powered document processing tool that turns receipts and invoices into ERP-ready bookings for Swiss Treuhand firms.
- **Audience:** Swiss Treuhand (fiduciary) firm owners and senior accountants managing 50-200 SME clients, aged 38-55, German-speaking Switzerland primary.
- **Goal:** Eliminate 40% of manual document entry time by automating extraction, categorization (Swiss Kontenrahmen KMU), and multi-ERP export.

## Reference
- **Kraken (Consumer App):** Light theme with tinted backgrounds, pill-shaped components, generous whitespace, progressive disclosure. Excellent auth flows and clean card patterns.
- **Fey (Finance Dashboard):** High data density without clutter, atmospheric depth through subtle color layering, command palette pattern, warm accent tones. Excellent table and data visualization patterns.
- **Stripe (Dashboard):** The gold standard for fintech data tables — uppercase micro-labels, border-first card design, split-pane editing, contextual bulk actions. Excellent form patterns and settings pages.

## Brand Direction

- **Accent color:** `#0E7C6B` (Deep Teal-Green)
- **Font:** Plus Jakarta Sans (primary UI) + JetBrains Mono (document data, amounts, account numbers)
- **Theme:** Light only (default: light)
- **Tone:** Precise, trustworthy, and quietly confident — like a senior Swiss accountant who never makes mistakes.
- **Reference summary:** Combines Stripe's structured data hierarchy and table mastery with Kraken's generous whitespace and tinted surface backgrounds, filtered through a Swiss professional sensibility. The result is a clean, light interface that handles dense financial data without feeling clinical or overwhelming. Warm tinted backgrounds (sage/mint) replace Kraken's lavender, creating a distinctly non-purple identity that signals reliability and precision.

### Accent Color Selection — 3 Options Evaluated

**Option A (SELECTED): Deep Teal-Green `#0E7C6B`**
- Rationale: Evokes financial trust, precision, and stability. Green is universally associated with finance and accounting. This specific shade is deep enough to feel professional (not playful), distinct from ReplyFlow's `#0D9488` (which is lighter/brighter Tailwind teal-600), and works beautifully with light sage-tinted backgrounds. Swiss banks (UBS, Credit Suisse) historically lean into green/blue-green territory.
- Light variant: `#E6F5F2` (sage-mint tint for page backgrounds)
- Hover: `#0A6355`

**Option B: Warm Slate-Blue `#3D5A80`**
- Rationale: A muted, sophisticated blue that avoids the brightness of LaunchReady/SignalScore's `#2563EB`. Professional and trustworthy, but potentially too conservative and forgettable. Could blend into generic corporate software.

**Option C: Deep Amber `#B45309`**
- Rationale: Warm, distinctive, draws from Fey's copper/amber palette. Unique in Roger's product lineup. However, amber can feel like a warning color in data-heavy UIs, and may clash with red error states. Risky for a financial document tool where trust is paramount.

### Why Deep Teal-Green Wins
1. Finance-native: Green = money, accounting, trust. No explanation needed for Sandra.
2. Distinct: Clearly different from ReplyFlow's teal-600 (lighter, more cyan). BelegPilot's is deeper, more emerald.
3. Light theme friendly: Creates beautiful sage/mint tinted backgrounds (`#E6F5F2`, `#F0F7F5`) that feel calm and professional.
4. Data-safe: Works alongside green (success) and red (error) semantic colors without confusion — the accent is teal-leaning, not pure green.
5. Swiss association: Evokes precision, quality, alpine reliability.

## Design Principles

### From Stripe (Primary Influence — Data Patterns)
- **Border-first, not shadow-first.** Cards and containers use subtle borders (`#E3E8EE`), not drop shadows. Keeps things flat and professional.
- **Uppercase micro-labels.** Table headers, section labels use small uppercase text (12px, medium weight, letter-spaced). Creates structured, professional hierarchy.
- **Consistent 14px body.** Nearly everything reads at 14px. Hierarchy through weight and color, not wild size jumps.
- **Contextual actions.** Bulk actions appear when rows are selected. Item actions appear on hover. Reduces permanent clutter.
- **Split-pane editing.** Edit form on left, live preview on right — ideal for document review workflows.
- **Mark optional, not required.** Instead of asterisks on required fields, tag optional fields with "Optional" label.

### From Kraken (Secondary Influence — Surface & Spacing)
- **Tinted page backgrounds.** Not flat white — use subtle sage-mint tint (`#F0F7F5`) for page backgrounds, white (`#FFFFFF`) for cards. Creates natural layering without shadows.
- **Generous whitespace in consumer flows.** Auth, onboarding, and settings get breathing room. Data views can be denser.
- **Progressive disclosure.** Complex flows broken into simple steps. One action per screen for onboarding.
- **Status through color.** Green = success/verified, red = error/needs attention, amber = warning/low confidence. Minimal text, maximum meaning.

### From Fey (Tertiary Influence — Data Density)
- **Data density without clutter.** High information density achieved through careful typography hierarchy, not visual noise.
- **Color restraint.** The UI is mostly neutral grays with color reserved for data meaning and the brand accent.
- **Command palette pattern.** Quick document search, client switching, navigation via keyboard-first search overlay.

### Anti-Slop Rules (enforced at design AND code time)
- No generic Inter/Roboto used lazily — Plus Jakarta Sans is intentional and distinctive
- No purple anywhere — that is SignalForge territory
- No predictable symmetric card grids with uniform spacing
- No cookie-cutter hero sections (this is an app, not a marketing site)
- No shadows on cards — use borders like Stripe
- No colored pill buttons for primary CTAs — use the accent color with subtle rounded corners (6-8px), not full pill shapes
- No zebra-striped tables — use subtle row dividers like Stripe
- Every page must have ONE distinctive element (the document preview pane, the confidence meter, the extraction highlight overlay)
- Typography must create clear hierarchy through weight and color, not just size changes
- Tinted backgrounds must create atmosphere — not flat white everywhere

### Quality Markers (what good looks like)
- Deep teal-green accent with sage-tinted surfaces — distinctive, financial, Swiss
- Type scale with clear weight/color hierarchy (semibold headings, regular body, muted captions)
- Intentional whitespace — generous in auth/settings, compact in document tables
- Cards that earn their existence — document cards show extraction results, not decorative wrappers
- Tables with uppercase micro-labels, right-aligned amounts, compact rows, contextual actions
- Split-pane document review — original document left, extracted data right
- Confidence indicators per extracted field (green/amber/red dots, not verbose text)
- Animations that serve a purpose: extraction progress, field validation, document upload feedback

## Pages/Screens Needed

### Authentication & Onboarding
- [x] Login (email + password, single centered card on sage-tinted background)
- [x] Signup (email → password → firm details, progressive multi-step like Kraken)
- [x] Forgot Password / Reset
- [x] Email Verification

### Core Application
- [x] Dashboard / Home (overview metrics: documents processed today, pending review, recent activity, quick upload)
- [x] Document Upload (drag-and-drop zone + file browser, batch upload support, upload progress)
- [x] Document Review / Detail (split-pane: original PDF/image left, extracted data right with confidence scores, edit fields inline)
- [x] Document List (Stripe-style table: checkbox, document name, client, status badge, amount, date, actions. Filters: client, status, date range, document type)
- [x] Client Management (list of SME clients with document counts, account mapping per client)
- [x] Client Detail (client info, assigned Kontenrahmen mappings, document history, ERP export settings)
- [x] Export (select documents → choose target ERP format → preview → download. Export history table)

### Settings & Account
- [x] Settings — Firm Profile (firm name, address, contact)
- [x] Settings — Team (future: user management, not MVP but reserve the page)
- [x] Settings — ERP Connections (configure default export formats per client)
- [x] Settings — Billing / Subscription (plan display, usage meter: documents used/limit)
- [x] Settings — Account Security (password change, 2FA future)

### Legal
- [x] Privacy Policy (nDSG/FADP + GDPR compliant)
- [x] Terms of Service (Swiss law)
- [x] Impressum

## Technical Constraints
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **UI Library:** shadcn/ui (customized to BelegPilot design tokens)
- **CSS:** Tailwind CSS 4
- **Animation:** Framer Motion (entrance animations, upload progress, extraction feedback)
- **Responsive:** Desktop-first (primary use case is desktop accountant workstation), responsive down to tablet. No mobile app.
- **Accessibility:** WCAG 2.1 AA minimum. High contrast ratios critical — financial data must be readable.
- **Backend:** Python 3.12 + FastAPI (matching SignalForge architecture)
- **Database:** Supabase (PostgreSQL) with RLS
- **Auth:** Supabase Auth (OTP + password)
- **File Storage:** Supabase Storage (PDF/image uploads)
- **AI:** Claude Sonnet API (vision) for document extraction
- **i18n:** DE (primary) + FR (secondary) + IT (tertiary) via `src/lib/i18n.ts` pattern
- **Deploy:** GitHub Actions → Metanet (frontend) + Railway (backend)

## Footer Standard

Footer must comply with `C:\Business\Internal Projects\footer-standard.md`. Key rules:
- Use a shared Footer component -- never inline footer markup on individual pages
- Copyright: `Distribution OS by Predivo GmbH. All rights reserved.`
- Slogan: `Swiss-made · Software that Thinks Ahead` (always English)
- Email templates must also include standard footer

## Component Specifications

### Sidebar (from Stripe)
- Fixed left sidebar, ~220px wide
- White background with subtle right border `#E3E8EE`
- Sections grouped with uppercase 11px section labels in muted gray
- Nav items: 14px, regular weight, icon (16px) + label, 8px gap
- Active: accent color text + light accent tint background
- Collapsible to ~64px (icons only) on smaller screens

### Data Tables (from Stripe, critical for BelegPilot)
- Header: uppercase, 12px, medium weight, 0.5px letter-spacing, muted gray `#697386`
- Rows: 48px height, 1px solid `#E3E8EE` dividers, no vertical borders
- Row hover: light gray background
- Checkbox column for multi-select
- Status: small colored dot + text label (green "Verified", amber "Review", red "Error")
- Amounts: right-aligned, tabular numerals (JetBrains Mono)
- Actions: contextual on hover + bulk toolbar when rows selected
- Filters: pill-shaped chips above table, dropdown with checkboxes + "Apply"
- Pagination: "Previous" / "Next" text buttons, results count

### Document Review Pane (BelegPilot-specific, inspired by Stripe split-pane)
- Left panel (~50%): Original document viewer (PDF/image with zoom/pan)
- Right panel (~50%): Extracted data form with confidence indicators
- Each extracted field: label + value + confidence dot (green/amber/red)
- Low-confidence fields highlighted with amber background tint
- Inline editing: click value to edit, save on blur or Enter
- Field-level actions: "Accept", "Flag for review"
- Top bar: document name, client assignment dropdown, status badge, Save + Export buttons

### Cards (from Stripe + Kraken hybrid)
- Background: white `#FFFFFF`
- Border: 1px solid `#E3E8EE`
- Border-radius: 8px
- Shadow: none (border-first philosophy)
- Padding: 20-24px
- On sage-tinted page background, white cards provide natural elevation

### Buttons
- Primary: `#0E7C6B` background, white text, border-radius 6px, height 36px, font-weight 500
- Secondary: white background, 1px `#E3E8EE` border, dark text, border-radius 6px
- Ghost: no border, no background, accent or gray text
- Destructive: `#DF1B41` background, white text (rare)
- Full-width for auth CTAs, auto-width for inline actions

### Input Fields
- Height: 40px
- Border: 1px solid `#D3D8DF`, border-radius 6px
- Background: white
- Focus: accent color border ring `#0E7C6B` with subtle tinted shadow
- Label: 14px medium weight above input, 4px gap
- Helper text: 13px muted gray below input
