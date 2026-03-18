# BelegPilot Design System

> **Canonical source:** `docs/design-tokens.json` — when this document and the token file conflict, the token file wins.
>
> **Last audit:** 2026-03-11

## Design Philosophy

Combines Stripe's structured data hierarchy and table mastery with Kraken's generous whitespace and tinted surface backgrounds, filtered through a Swiss professional sensibility. The result is a clean, light interface that handles dense financial data without feeling clinical or overwhelming. Precise, trustworthy, and quietly confident — like a senior Swiss accountant who never makes mistakes.

---

## Color System

### Ink (Text)
| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| ink.default | `#1A1D23` | `text-ink` | Primary text, headings |
| ink.sub | `#2D3039` | `text-ink-sub` | Subheadings |
| ink.body | `#505967` | `text-ink-body` | Body text |
| ink.muted | `#697386` | `text-ink-muted` | Captions, placeholders, table headers |

### Surface (Backgrounds)
| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| surface.default | `#FFFFFF` | `bg-surface` | Card backgrounds, content areas |
| surface.page | `#F0F7F5` | `bg-surface-page` | Page background (sage-mint tint) |
| surface.alt | `#E6F5F2` | `bg-surface-alt` | Alternate sections, light accent |
| surface.hover | `#F5F6F8` | `bg-surface-hover` | Row hover states |
| surface.sidebar | `#FFFFFF` | `bg-surface-sidebar` | Sidebar background |

### Edge (Borders)
| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| edge.default | `#E3E8EE` | `border-edge` | Card/container borders |
| edge.subtle | `#EBEEF2` | `border-edge-subtle` | Row dividers |
| edge.outline | `#D3D8DF` | `border-edge-outline` | Input borders |

### Accent — Deep Teal-Green
| Token | Value | Usage |
|-------|-------|-------|
| accent.default | `#0E7C6B` | Links, focus rings, active nav, primary buttons |
| accent.hover | `#0A6355` | Hover state |
| accent.light | `#E6F5F2` | Light accent backgrounds |
| accent.lighter | `#F0F7F5` | Lightest accent tint |

### Status Colors
| Token | Value | Usage |
|-------|-------|-------|
| error | `#DF1B41` | Error states, low confidence |
| success | `#22C55E` | Verified, high confidence |
| warning | `#F59E0B` | Needs review, medium confidence |

### Confidence Indicators
Small dots (8px diameter) next to extracted document fields:
- **Green** `#22C55E` — high confidence (>95%), auto-accepted
- **Amber** `#F59E0B` — medium confidence (70-95%), highlighted for review
- **Red** `#DF1B41` — low confidence (<70%), requires manual verification

---

## Typography

**Fonts:** Plus Jakarta Sans (all UI text) + JetBrains Mono (financial data, amounts, account numbers)

| Level | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| Display | 2rem (32px) | 700 | 1.15 | -0.02em | Dashboard hero metrics |
| Heading 1 | 1.5rem (24px) | 600 | 1.2 | -0.01em | Page titles |
| Heading 2 | 1.25rem (20px) | 600 | 1.3 | -0.005em | Section titles |
| Heading 3 | 1rem (16px) | 600 | 1.4 | — | Card titles |
| Body lg | 0.9375rem (15px) | 400 | 1.5 | — | Descriptions |
| Body | 0.875rem (14px) | 400 | 1.5 | — | Default (Stripe standard) |
| Body sm | 0.8125rem (13px) | 400 | 1.5 | — | Table cells, secondary |
| Caption | 0.75rem (12px) | 500 | 1.4 | 0.01em | Helper text |
| Micro-label | 0.6875rem (11px) | 500 | 1.3 | 0.05em | UPPERCASE table/section headers |

### Typography Patterns
- **Table headers:** UPPERCASE micro-labels (11px, medium weight, letter-spaced, muted gray `#697386`)
- **Amounts:** JetBrains Mono, right-aligned, `font-variant-numeric: tabular-nums`
- **Hierarchy:** Through weight and color, not wild size jumps (Stripe approach)
- **Form labels:** 14px, medium weight, above input, 4px gap
- **Optional fields:** Tagged with "Optional" label — no asterisks on required fields

---

## Layout

| Element | Value |
|---------|-------|
| Sidebar width | 220px (collapsed: 64px) |
| Container max-width | 1400px |
| Container padding | 16px / 24px / 32px (mobile/tablet/desktop) |
| Section vertical padding | 24-32px |
| Section gap | 24px |
| Document review split | 50% left (document) / 50% right (data) |

### Navigation Structure
- **Fixed left sidebar** (no top navbar)
- Sidebar sections grouped with UPPERCASE 11px section labels
- Nav items: 14px regular weight, 16px lucide icon + text label, 8px gap
- Active state: accent color text + light accent tint background

### Breakpoints
| Name | Width |
|------|-------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1536px |

**Desktop-first.** Primary use case: desktop accountant workstation. Responsive down to tablet. No mobile app.

---

## Border Radii

| Token | Value | Usage |
|-------|-------|-------|
| lg | 8px | Cards, containers |
| md | 6px | Buttons, inputs |
| sm | 4px | Small elements |
| pill | 9999px | Filter chips only (NOT primary CTAs) |

---

## Shadows

**Border-first philosophy.** Cards and containers use borders, never shadows. Shadows reserved for floating elements only.

| Token | Value | Usage |
|-------|-------|-------|
| none | — | Cards (use 1px `#E3E8EE` border) |
| sm | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | Dropdown menus |
| md | `0 4px 8px -2px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.04)` | Command palette |
| lg | `0 12px 24px -4px rgba(0,0,0,0.08), 0 4px 8px -2px rgba(0,0,0,0.04)` | Modal dialogs |

---

## Components

### Sidebar (Stripe-style)
- Fixed left, 220px wide
- White background with 1px right border `#E3E8EE`
- Grouped sections: UPPERCASE 11px section labels in `#697386`
- Nav items: 14px, regular weight, 16px icon + label, 8px gap
- Active: `#0E7C6B` text + `#E6F5F2` background
- Collapsible to 64px (icons only) on smaller screens

### Data Tables (Stripe-style)
- **Header:** UPPERCASE, 11px, medium weight, 0.05em letter-spacing, `#697386`
- **Rows:** 48px height, 1px `#E3E8EE` dividers, NO vertical borders, NO zebra stripes
- **Row hover:** `#F5F6F8` background
- **Checkbox:** 16px, first column for multi-select
- **Status:** 8px colored dot + text label (green "Verified", amber "Review", red "Error")
- **Amounts:** JetBrains Mono, right-aligned, tabular-nums
- **Actions:** Contextual on hover + bulk toolbar on row selection
- **Filters:** Pill-shaped chips above table, dropdown with checkboxes
- **Pagination:** "Previous"/"Next" text buttons + results count

### Document Review Pane (BelegPilot-specific)
- **Left panel (~50%):** Original document viewer (PDF/image, zoom/pan)
- **Right panel (~50%):** Extracted data form with confidence indicators
- Each field: label + value + 8px confidence dot (green/amber/red)
- Low-confidence fields: amber background tint `#FEF3C7`
- Inline editing: click value to edit, save on blur/Enter
- Field actions: "Accept", "Flag for review"
- **Top bar:** Document name, client dropdown, status badge, Save + Export buttons

### Cards
- Background: `#FFFFFF`
- Border: 1px solid `#E3E8EE`
- Radius: 8px
- Shadow: **NONE** (border provides elevation on sage page bg)
- Padding: 20-24px

### Buttons
| Variant | Background | Text | Radius | Height | Weight |
|---------|-----------|------|--------|--------|--------|
| Primary | `#0E7C6B` | White | 6px | 36px | 500 |
| Secondary | White + 1px `#E3E8EE` border | Dark | 6px | 36px | 500 |
| Ghost | Transparent | Accent/gray | 6px | 36px | 500 |
| Destructive | `#DF1B41` | White | 6px | 36px | 500 |

Full-width for auth CTAs. Auto-width for inline actions.

### Input Fields
- Height: 40px
- Border: 1px solid `#D3D8DF`, radius 6px
- Background: white
- Focus: `#0E7C6B` border ring + subtle tinted shadow
- Label: 14px medium weight above, 4px gap
- Helper: 13px muted gray below
- Error: `#DF1B41` border + error message below

---

## Animations

| Effect | Implementation |
|--------|---------------|
| Section entrance | Framer Motion: opacity 0→1, y +16px, 0.4s ease-out |
| Card stagger | staggerChildren: 0.06s |
| Color transitions | 150ms |
| Button press | 50ms |
| Sidebar collapse | 200ms |
| Extraction progress | Linear progress bar with accent color |
| Field confidence | 300ms ease-in-out color animation |
| Upload dropzone | 200ms ease-out state change |
| Loading states | Skeleton shimmer with `#F0F7F5` base |

---

## Icons

- **Library:** lucide-react
- **Default size:** 16px (nav icons)
- **Stroke width:** 1.5
- **Color:** Muted `#697386` default, accent `#0E7C6B` for active/emphasis

---

## Rules

### ALWAYS
- Use design tokens for all colors — never hardcode hex in components
- Light theme only — no dark mode support needed
- Use shadcn/ui (customized to BelegPilot tokens) as component foundation
- Use Framer Motion for entrance animations and extraction feedback
- Use Plus Jakarta Sans for all UI text
- Use JetBrains Mono for financial data (amounts, account numbers, IBAN)
- Use 1px borders on cards — NEVER shadows
- Use UPPERCASE micro-labels for table headers and section labels
- Use sage-mint page backgrounds `#F0F7F5` — NOT flat white
- Mark optional fields with "Optional" label
- Right-align amounts with tabular-nums
- Use confidence dots per extracted field
- Desktop-first responsive
- WCAG 2.1 AA minimum

### NEVER
- Hardcode hex values in components
- Use purple anywhere (SignalForge territory)
- Apply shadows to cards (use borders)
- Use pill-shaped primary buttons (use 6px radius)
- Use zebra-striped tables (use row dividers)
- Use generic Inter/Roboto lazily
- Use flat white page backgrounds
- Use predictable symmetric card grids
- Create cookie-cutter hero sections (this is an app)
- Skip confidence indicators on extracted data
