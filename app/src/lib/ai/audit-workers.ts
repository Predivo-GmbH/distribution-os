/* ============================================================
   8-Domain Audit Workers
   ============================================================ */

import type { Product } from '@/types'
import { runWorker } from './worker-base'

const AUDIT_CONTEXT = (product: Product, domain: string) =>
  `You are auditing "${product.name}" for ${domain}. Score findings on severity (Critical/High/Medium/Low). For each issue found, provide: location, description, fix recommendation, and effort estimate. End with a domain score out of the max points.`

export async function runSecurityAudit(product: Product, repoContext: string) {
  return runWorker({
    product, engine: 'persistence', workerType: 'audit-security',
    taskTitle: 'Security Audit (25pts)',
    maxTokens: 8192,
    userPrompt: `${AUDIT_CONTEXT(product, 'Security (25 points max)')}

Context about the project:
${repoContext}

Audit these security domains:

1. **Dependency Vulnerabilities** (5pts) — Known CVEs in dependencies, outdated packages
2. **Secret Management** (5pts) — .gitignore coverage, .env handling, hardcoded secrets
3. **Security Headers** (3pts) — CSP, X-Frame-Options, HSTS, Referrer-Policy
4. **CORS Configuration** (3pts) — Allowed origins, credentials handling
5. **XSS Prevention** (3pts) — Input sanitization, dangerouslySetInnerHTML usage
6. **RLS Policies** (3pts) — Row Level Security on all tables, policy coverage
7. **Authentication** (3pts) — Session management, token handling, password requirements

Format as a structured audit report with scores per sub-domain.`,
  })
}

export async function runSEOAudit(product: Product, repoContext: string) {
  return runWorker({
    product, engine: 'pull', workerType: 'audit-seo',
    taskTitle: 'SEO Audit (20pts)',
    maxTokens: 6144,
    userPrompt: `${AUDIT_CONTEXT(product, 'SEO (20 points max)')}

Context: ${repoContext}

Audit:
1. **Technical SEO** (5pts) — robots.txt, sitemap.xml, canonical URLs, URL structure
2. **Meta Tags** (5pts) — Title tags, meta descriptions, og:image, twitter:card
3. **Structured Data** (4pts) — JSON-LD schema, breadcrumbs, FAQ schema
4. **Content** (3pts) — H1 hierarchy, alt text, internal linking
5. **Performance Impact** (3pts) — Core Web Vitals, render-blocking resources, mobile-friendly

Format as a scored audit report.`,
  })
}

export async function runPerformanceAudit(product: Product, repoContext: string) {
  return runWorker({
    product, engine: 'persistence', workerType: 'audit-performance',
    taskTitle: 'Performance Audit (20pts)',
    maxTokens: 6144,
    userPrompt: `${AUDIT_CONTEXT(product, 'Performance (20 points max)')}

Context: ${repoContext}

Audit:
1. **Bundle Size** (5pts) — Total JS/CSS size, code splitting effectiveness, tree shaking
2. **Loading Strategy** (5pts) — Lazy loading, dynamic imports, preloading critical assets
3. **Image Optimization** (4pts) — Format (WebP/AVIF), sizing, lazy loading, compression
4. **Runtime Performance** (3pts) — Re-render patterns, memoization, virtualization
5. **Caching** (3pts) — Service worker, HTTP caching headers, CDN usage

Format as a scored audit report.`,
  })
}

export async function runCodeQualityAudit(product: Product, repoContext: string) {
  return runWorker({
    product, engine: 'persistence', workerType: 'audit-code-quality',
    taskTitle: 'Code Quality Audit (20pts)',
    maxTokens: 6144,
    userPrompt: `${AUDIT_CONTEXT(product, 'Code Quality (20 points max)')}

Context: ${repoContext}

Audit:
1. **Build Health** (5pts) — Zero TypeScript errors, clean builds, no warnings
2. **Linting** (4pts) — ESLint config, consistent rules, no suppressed warnings
3. **Type Safety** (4pts) — TypeScript strict mode, no any types, proper generics
4. **Code Organization** (4pts) — File structure, naming conventions, separation of concerns
5. **DRY Compliance** (3pts) — Duplicated logic, abstraction quality, shared utilities

Format as a scored audit report.`,
  })
}

export async function runAccessibilityAudit(product: Product, repoContext: string) {
  return runWorker({
    product, engine: 'persistence', workerType: 'audit-accessibility',
    taskTitle: 'Accessibility Audit (15pts)',
    maxTokens: 6144,
    userPrompt: `${AUDIT_CONTEXT(product, 'Accessibility (15 points max)')}

Context: ${repoContext}

Audit:
1. **Keyboard Navigation** (4pts) — Tab order, focus management, skip links, focus traps
2. **ARIA** (4pts) — Proper roles, labels, live regions, landmarks
3. **Color Contrast** (3pts) — WCAG AA compliance (4.5:1 normal, 3:1 large text)
4. **Screen Reader** (2pts) — Alt text, heading hierarchy, form labels
5. **Motion** (2pts) — prefers-reduced-motion support, animation controls

Format as a scored audit report.`,
  })
}

export async function runUIConsistencyAudit(product: Product, repoContext: string) {
  return runWorker({
    product, engine: 'persistence', workerType: 'audit-ui-consistency',
    taskTitle: 'UI Consistency Audit (bonus)',
    maxTokens: 6144,
    userPrompt: `${AUDIT_CONTEXT(product, 'UI Consistency (bonus points)')}

Context: ${repoContext}

Audit:
1. **Design Token Adherence** — Are colors, fonts, spacing from CSS variables / design tokens?
2. **Component Consistency** — Same components used consistently across pages?
3. **Spacing System** — Consistent padding/margin patterns?
4. **Typography Scale** — Heading/body sizes follow a scale?
5. **Interactive States** — Hover, focus, active, disabled states consistent?

Format as a findings report with bonus score.`,
  })
}

export async function runResponsiveAudit(product: Product, repoContext: string) {
  return runWorker({
    product, engine: 'persistence', workerType: 'audit-responsive',
    taskTitle: 'Responsive Audit (bonus)',
    maxTokens: 6144,
    userPrompt: `${AUDIT_CONTEXT(product, 'Responsive Design (bonus points)')}

Context: ${repoContext}

Audit:
1. **Touch Targets** — Min 44x44px on mobile, adequate spacing
2. **Breakpoints** — Proper responsive breakpoints, no horizontal scroll
3. **Content Overflow** — Text truncation, table scrolling, image sizing
4. **Mobile Navigation** — Hamburger menu, drawer, bottom nav patterns
5. **Font Sizing** — Readable on mobile (min 14px body), proper scaling

Format as a findings report with bonus score.`,
  })
}

export async function runMobileVisualAudit(product: Product, repoContext: string) {
  return runWorker({
    product, engine: 'persistence', workerType: 'audit-mobile-visual',
    taskTitle: 'Mobile Visual Audit (bonus)',
    maxTokens: 4096,
    userPrompt: `${AUDIT_CONTEXT(product, 'Mobile Visual Quality (bonus points)')}

Context: ${repoContext}

Provide a checklist for visual verification at these viewport widths:
- 375px (iPhone SE)
- 390px (iPhone 14)
- 768px (iPad)
- 1024px (iPad landscape)

For each viewport, list:
1. Pages to screenshot
2. Key elements to verify (layout, text, images, interactions)
3. Common issues to check for (overflow, truncation, spacing)

This checklist is meant to guide manual visual testing with actual screenshots.`,
  })
}
