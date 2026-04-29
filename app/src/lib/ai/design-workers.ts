/* ============================================================
   Design Pipeline Workers — Brand Analysis, Tokens, Brand Book
   ============================================================ */

import type { Product } from '@/types'
import { runWorker } from './worker-base'

export async function runBrandAnalyzer(product: Product, urls: string[]) {
  const urlList = urls.map((u, i) => `${i + 1}. ${u}`).join('\n')
  return runWorker({
    product,
    engine: 'push',
    workerType: 'brand-analyzer',
    taskTitle: 'Brand Analysis Report',
    maxTokens: 8192,
    userPrompt: `Analyze the following reference websites to extract brand and design patterns. Scrape and analyze each URL:

${urlList}

Produce a structured brand analysis with:

1. **Color Palette** — Primary, secondary, accent, neutral, and semantic colors (hex values). Note light/dark mode if present.
2. **Typography** — Font families (headings, body, mono), sizes, weights, line heights. Note any custom or Google Fonts.
3. **Spacing System** — Base unit, common padding/margin values, gap patterns.
4. **Border & Radius** — Corner radius scale, border widths, shadow styles.
5. **Component Patterns** — Buttons, cards, inputs, navigation style. Note hover/active states.
6. **Layout Approach** — Grid system, max-width, breakpoints, responsive strategy.
7. **Tone & Personality** — Visual tone (corporate, playful, minimal, bold), animation style, imagery approach.
8. **Brand Voice** — Headline style, CTA language, formality level, use of jargon.

For each observation, cite which URL it comes from. Highlight the strongest patterns that appear across multiple sites. Flag any inconsistencies between sources.

Format as structured Markdown with clear sections and hex color codes.`,
  })
}

export async function runTokenExtractor(product: Product, brandAnalysis: string) {
  return runWorker({
    product,
    engine: 'push',
    workerType: 'token-extractor',
    taskTitle: 'Design Tokens',
    maxTokens: 8192,
    userPrompt: `Based on the following brand analysis, generate a complete design-tokens.json file.

## Brand Analysis Input
${brandAnalysis}

Generate valid JSON with this exact structure:

\`\`\`json
{
  "meta": {
    "name": "${product.name}",
    "version": "1.0.0",
    "generatedAt": "<ISO date>"
  },
  "colors": {
    "light": {
      "primary": { "value": "#hex", "usage": "Main brand color, CTAs" },
      "primary-hover": { "value": "#hex", "usage": "Hover state" },
      "secondary": { "value": "#hex", "usage": "Supporting brand color" },
      "accent": { "value": "#hex", "usage": "Highlights, badges" },
      "background": { "value": "#hex", "usage": "Page background" },
      "surface": { "value": "#hex", "usage": "Card/panel background" },
      "surface-hover": { "value": "#hex", "usage": "Hover background" },
      "border": { "value": "#hex", "usage": "Borders, dividers" },
      "text-primary": { "value": "#hex", "usage": "Headings, primary text" },
      "text-secondary": { "value": "#hex", "usage": "Body text" },
      "text-muted": { "value": "#hex", "usage": "Placeholders, hints" },
      "success": { "value": "#hex", "usage": "Success states" },
      "warning": { "value": "#hex", "usage": "Warning states" },
      "error": { "value": "#hex", "usage": "Error states" },
      "info": { "value": "#hex", "usage": "Informational" }
    },
    "dark": {
      "...same keys as light with dark mode values..."
    }
  },
  "typography": {
    "fontFamily": {
      "heading": "Font Name, fallbacks",
      "body": "Font Name, fallbacks",
      "mono": "Font Name, fallbacks"
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem"
    },
    "fontWeight": {
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700,
      "extrabold": 800
    },
    "lineHeight": {
      "tight": 1.25,
      "normal": 1.5,
      "relaxed": 1.75
    }
  },
  "spacing": {
    "unit": "4px",
    "scale": {
      "0": "0",
      "1": "4px",
      "2": "8px",
      "3": "12px",
      "4": "16px",
      "5": "20px",
      "6": "24px",
      "8": "32px",
      "10": "40px",
      "12": "48px",
      "16": "64px"
    }
  },
  "borderRadius": {
    "none": "0",
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "xl": "16px",
    "full": "9999px"
  },
  "shadows": {
    "sm": "0 1px 2px rgba(0,0,0,0.05)",
    "md": "0 4px 6px rgba(0,0,0,0.07)",
    "lg": "0 10px 15px rgba(0,0,0,0.1)"
  },
  "breakpoints": {
    "sm": "640px",
    "md": "768px",
    "lg": "1024px",
    "xl": "1280px"
  }
}
\`\`\`

Output ONLY valid JSON — no markdown fences, no explanation. Fill all values based on the brand analysis. If dark mode values were not found in the analysis, generate sensible dark variants of the light colors.`,
  })
}

export async function runBrandBookGenerator(product: Product, tokens: string, brandAnalysis: string) {
  return runWorker({
    product,
    engine: 'push',
    workerType: 'brand-book-generator',
    taskTitle: 'Brand Book',
    maxTokens: 12288,
    userPrompt: `Generate a comprehensive brand book document in Markdown for "${product.name}".

## Design Tokens
${tokens}

## Brand Analysis
${brandAnalysis}

Create a brand book with these 17 sections:

1. **Cover** — Product name, tagline, version date
2. **Table of Contents** — Section listing
3. **Brand Introduction** — Mission, vision, values, why the brand exists
4. **Brand Foundation** — Personality traits, target audience, strategic positioning
5. **Logo Design** — Logo description, usage rules, clear space, minimum size (note: user uploads their own logo)
6. **Logo Variants** — Primary, mark-only, monochrome, favicon guidance
7. **App Icon** — Icon design direction, sizing for different platforms
8. **Color System** — Full palette with hex values, light and dark mode, semantic colors, usage guidelines
9. **Typography** — Font families, type scale, weight usage, pairing rationale
10. **Spacing & Layout** — Spacing scale, grid system, breakpoints, layout principles
11. **Borders & Shadows** — Corner radius scale, shadow levels, border usage
12. **Iconography** — Icon style (e.g., Lucide), line weight, sizing, consistency rules
13. **Photography & Imagery** — Photo style direction, AI image prompt guidelines, color grading
14. **Animation & Motion** — Easing, duration scale, micro-interactions, reduce-motion fallbacks
15. **Voice & Tone** — Writing style, headline patterns, CTA language, formality, do/don't examples
16. **Accessibility** — Contrast ratios, focus states, ARIA guidelines, color-blind considerations
17. **Brand Collateral** — Business card specs, email signature, social media sizing

For each section, provide:
- Clear heading and description
- Specific values (colors, sizes, fonts) pulled from the tokens
- Do/Don't guidelines where applicable
- Rationale for design decisions

Write in a professional, reference-document style. This will be the single source of truth for all brand decisions.`,
  })
}

export async function runConsistencyChecker(product: Product, tokens: string, brandBook: string) {
  return runWorker({
    product,
    engine: 'push',
    workerType: 'consistency-checker',
    taskTitle: 'Design Consistency Report',
    maxTokens: 4096,
    userPrompt: `Validate the consistency between these design tokens and brand book for "${product.name}".

## Design Tokens (JSON)
${tokens}

## Brand Book Content
${brandBook}

Perform a thorough consistency audit:

1. **Color Consistency** — Do brand book color references match token hex values? Any mismatches?
2. **Typography Consistency** — Do font family/size/weight references align with tokens?
3. **Spacing Consistency** — Are spacing values in the brand book from the token scale?
4. **Completeness** — Are there tokens not documented in the brand book? Brand book sections with missing token backing?
5. **Contrast Compliance** — Do text/background color pairs meet WCAG AA (4.5:1 for normal text, 3:1 for large text)?
6. **Dark Mode Coverage** — Does every light color have a dark counterpart? Any gaps?
7. **Naming Consistency** — Are color/spacing/radius names used consistently throughout?

For each issue found, report:
- **Severity**: Critical / Warning / Info
- **Location**: Which section/token
- **Issue**: What's wrong
- **Fix**: How to resolve it

End with a summary score: X issues found (Y critical, Z warnings).
If no issues are found, confirm the design system is consistent and ready for implementation.`,
  })
}
