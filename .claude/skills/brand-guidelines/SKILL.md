---
description: >
  Distribution OS brand guidelines and design system. Enforces brand tokens, typography,
  color palette, component patterns, and visual standards across all generated UI.
  Loaded automatically during frontend coding sessions.
user-invocable: false
---

# Distribution OS Brand Guidelines

Every UI element generated for Distribution OS MUST follow these brand rules. This is the binding contract. No exceptions.

Canonical source: `docs/design-tokens.json` — when this skill and the token file conflict, the token file wins.

## Brand Identity

- **Product:** Distribution OS — weekly command center for solo SaaS founders
- **Company:** Predivo GmbH
- **Voice:** Direct, calm authority. No hype. Founder-to-founder.
- **Design Direction:** Clean utility dashboard. Information-dense but breathable. Dark mode supported. shadcn/ui foundation with custom tokens.
- **CSS:** Tailwind CSS 4
- **UI Library:** shadcn/ui customized with Distribution OS tokens
- **Icons:** lucide-react

## Color System

### Accent (Electric Indigo)

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| accent.default | `#6366F1` | `bg-accent` / `text-accent` | Primary buttons, links, active states, focus rings |
| accent.hover | `#4F46E5` | `hover:bg-accent-hover` | Hover state |
| accent.muted | `#A5B4FC` | `text-accent-muted` | Subtle indicators, disabled accent, secondary links |
| accent.on | `#FFFFFF` | `text-accent-on` | Text on accent backgrounds |

### Light Mode — Surfaces

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| surface.page | `#EEF2FF` | `bg-surface-page` | Page background (indigo-tinted, NOT flat white) |
| surface.card | `#FFFFFF` | `bg-surface-card` | Cards, panels, modals |
| surface.sunken | `#F5F7FF` | `bg-surface-sunken` | Inset areas, input backgrounds |

### Light Mode — Ink (Text)

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| ink.default | `#1E1B4B` | `text-ink` | Primary text, headings |
| ink.secondary | `#4338CA` | `text-ink-secondary` | Subheadings, emphasized secondary |
| ink.body | `#475569` | `text-ink-body` | Body text |
| ink.muted | `#94A3B8` | `text-ink-muted` | Captions, placeholders, icons |

### Dark Mode — Surfaces

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| dark.surface.base | `#1E1B4B` | `dark:bg-surface-base` | Page background |
| dark.surface.card | `#2E2A6E` | `dark:bg-surface-card` | Cards, elevated panels |
| dark.surface.elevated | `#3730A3` | `dark:bg-surface-elevated` | Popovers, dropdowns, tooltips |

### Dark Mode — Ink (Text)

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| dark.ink.default | `#F8FAFC` | `dark:text-ink` | Primary text |
| dark.ink.body | `#CBD5E1` | `dark:text-ink-body` | Body text |
| dark.ink.muted | `#64748B` | `dark:text-ink-muted` | Captions, placeholders |

### Edges (Borders)

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| edge.default | `#E0E7FF` | `border-edge` | Card borders, dividers (light) |
| edge.strong | `#C7D2FE` | `border-edge-strong` | Input borders (light) |
| edge.focus | `#6366F1` | `ring-accent` | Focus rings |
| dark.edge.default | `#3730A3` | `dark:border-edge` | Card borders (dark) |
| dark.edge.subtle | `#312E81` | `dark:border-edge-subtle` | Dividers (dark) |

### Engine Colors (Indicators Only)

These are ONLY for small elements: dots, tags, badge borders, chart lines. Never as full section or card backgrounds.

| Engine | Value | Tailwind | Dot class |
|--------|-------|----------|-----------|
| Pull | `#10B981` | `text-engine-pull` | `bg-emerald-500` |
| Push | `#8B5CF6` | `text-engine-push` | `bg-violet-500` |
| Bridge | `#F59E0B` | `text-engine-bridge` | `bg-amber-500` |
| Search | `#0EA5E9` | `text-engine-search` | `bg-sky-500` |
| Equity | `#F43F5E` | `text-engine-equity` | `bg-rose-500` |
| Persistence | `#64748B` | `text-engine-persistence` | `bg-slate-500` |

### Status

| Status | Foreground | Background | Usage |
|--------|-----------|------------|-------|
| Success | `#16A34A` | `#F0FDF4` | Completed tasks, positive metrics |
| Warning | `#D97706` | `#FFFBEB` | Attention needed |
| Error | `#DC2626` | `#FEF2F2` | Failures, blockers |
| Info | `#2563EB` | `#EFF6FF` | Neutral information |

## Typography

### Font Families
- **UI:** Inter — all interface text (headings, body, labels, buttons)
- **Data:** JetBrains Mono — scores, percentages, metrics, engine tags, countdowns, KPIs

### Type Scale

| Token | Size | Weight | Line Height | Tailwind | Usage |
|-------|------|--------|-------------|----------|-------|
| display | 32px | 700 | 1.25 | `text-3xl font-bold` | Hero metrics, weekly score |
| h1 | 24px | 600 | 1.33 | `text-2xl font-semibold` | Page titles |
| h2 | 20px | 600 | 1.4 | `text-xl font-semibold` | Section headings |
| h3 | 16px | 600 | 1.5 | `text-base font-semibold` | Card titles |
| body | 14px | 400 | 1.5 | `text-sm` | Default text |
| small | 13px | 400 | 1.38 | `text-[13px]` | Helper text |
| caption | 12px | 500 | 1.33 | `text-xs font-medium` | Table headers, labels |
| micro | 11px | 600 | 1.27 | `text-[11px] font-semibold` | Engine tags, badges |

### Rules
- Body text is ALWAYS 14px. Create hierarchy through weight and color, not size jumps.
- Scores and percentages: JetBrains Mono, tabular numerals (`font-mono tabular-nums`).
- Engine tag labels: JetBrains Mono, 11px, uppercase, semibold.
- Table headers: uppercase, 12px, medium weight, muted color, 0.05em letter-spacing.

## Layout

| Element | Value |
|---------|-------|
| Sidebar width | 240px (collapsed: 64px icons-only) |
| Container max-width | 1280px |
| Content padding | 24px |
| Card gap | 16px |
| Section gap | 24px |
| Navbar height | 56px |

### Grid
- Primary: 12-column grid, 16px gap
- Dashboard cards: responsive grid `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
- Sidebar + main content layout for all app pages

### Breakpoints
sm: 640px | md: 768px | lg: 1024px | xl: 1280px | 2xl: 1440px

## Component Patterns

### Sidebar
- 240px wide, dark surface (`#1E1B4B`) bg in dark mode, white bg in light mode
- Grouped sections with uppercase 11px muted labels
- Nav items: 14px, icon (16px) + label, 8px gap, 8px border-radius
- Active: accent bg tint + accent text
- Collapses to 64px (icons only) on narrow screens

### Task Items (Weekly Tasks)
- Row: 48px height, left engine-color dot (8px), task label, right-side metadata
- Completed: muted text + strikethrough + check icon
- Pending: default ink + empty circle
- Group by engine, sorted by priority

### Metric Cards
- White card (light) or elevated surface (dark), 1px border, 12px radius, 20px padding
- Top: caption label (12px, muted). Center: display number (JetBrains Mono, 32px, bold). Bottom: trend indicator (small, green/red arrow + percentage)
- NO drop shadows at rest. Subtle shadow on hover only.

### Engine Tags
- Inline badge: engine-color left border (3px) or dot (6px), muted bg tint, JetBrains Mono 11px uppercase label
- Example: `<span class="font-mono text-[11px] uppercase font-semibold border-l-3 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-r">Pull</span>`

### Product Dots
- Small colored dot (8px circle) next to a product or channel name
- Use engine color matching the product's primary distribution channel
- Always paired with text label, never standalone

### Buttons
- Primary: `bg-accent` (#6366F1), white text, 8px radius, 36px height, font-weight 500
- Secondary: white bg (light) / elevated surface (dark), border, default ink text, 8px radius
- Ghost: transparent bg, accent or muted text, no border
- Destructive: red bg, white text
- Icon buttons: 36x36px square, 8px radius

### Inputs
- Height: 40px, 8px radius, `border-edge-strong` border
- Focus: accent border + accent ring (`ring-2 ring-accent/25`)
- Label above: 14px medium weight, 4px gap
- Sunken background in forms (`bg-surface-sunken`)

### Cards
- Light: white bg, 1px `border-edge` border, 12px radius, 20px padding
- Dark: `bg-surface-card` (#2E2A6E), 1px `border-edge` border, 12px radius, 20px padding
- NO drop shadows at rest. Border provides structure.
- Hover: subtle shadow transition (150ms)

### Data Tables
- Row height: 44px, 1px bottom divider, no vertical borders
- Header: uppercase, 12px, muted color, 0.05em tracking
- Numbers: right-aligned, JetBrains Mono
- Status: engine-color dot + text label
- Hover: subtle row highlight
- NO zebra striping

## Animation Rules

- **Entrance:** opacity 0 to 1, translateY 12px to 0, duration 300ms, ease-out
- **Card hover:** shadow transition, 150ms ease
- **Button press:** scale(0.98), 50ms ease-out
- **Color transitions:** 150ms ease-out
- **Sidebar collapse:** width transition, 200ms ease
- **Loading states:** pulse animation on skeleton elements
- **Respect** `prefers-reduced-motion` — disable all motion transforms

## Mandatory Rules

### ALWAYS
- Support both light and dark mode via Tailwind `dark:` prefix
- Use design tokens — never hardcode hex values in components
- Use Inter for UI text, JetBrains Mono for data/metrics
- Use lucide-react for icons (default 16px, stroke-width 1.5)
- Use shadcn/ui as component foundation, customized with Distribution OS tokens
- Use engine colors ONLY as small indicators (dots, tags, borders, chart lines)
- Cards at rest = 1px border, no shadow
- Page background = tinted (`#EEF2FF` light / `#1E1B4B` dark), never flat white or pure black
- Scores, percentages, KPIs = JetBrains Mono with tabular numerals
- Respect `prefers-reduced-motion`

### NEVER
- Use engine colors as full section or card backgrounds
- Use shadows on cards at rest (border-only at rest, shadow on hover)
- Use fonts other than Inter and JetBrains Mono
- Use flat white (`#FFFFFF`) as page background (cards only)
- Use pure black (`#000000`) as dark background (use `#1E1B4B` indigo-black)
- Use zebra-striped tables
- Use scale transforms on hover (except subtle button press)
- Hardcode hex colors in JSX — always use token classes
- Use glow effects, glassmorphism, or neon aesthetics
- Mix engine colors together in gradients
