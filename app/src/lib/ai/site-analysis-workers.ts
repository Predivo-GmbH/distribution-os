/* ============================================================
   Site Analysis Workers — URL Analysis & Website Audit
   ============================================================ */

import type { Product } from '@/types'
import { runWorker } from './worker-base'

export async function runSiteAnalyzer(product: Product, url: string) {
  return runWorker({
    product,
    engine: 'pull',
    workerType: 'site-analyzer',
    taskTitle: 'Site Analysis',
    maxTokens: 8192,
    userPrompt: `Analyze this website: ${url}

Reverse-engineer the design thinking, conversion psychology, and UX patterns. Produce:

1. **First Impression** — What does the site communicate in the first 3 seconds? Visual hierarchy, value proposition clarity.
2. **Design Analysis**
   - Color palette (extract hex codes)
   - Typography (fonts, scale, hierarchy)
   - Spacing and layout patterns
   - Component library / design system indicators
3. **Conversion Psychology**
   - Hero section effectiveness (hook, sub-hook, CTA)
   - Social proof placement and types
   - Urgency/scarcity tactics
   - Trust signals (badges, testimonials, logos)
   - Pricing page psychology (anchoring, decoy, framing)
4. **UX Patterns**
   - Navigation structure and information architecture
   - User flow from landing → signup/purchase
   - Form design and friction points
   - Mobile responsiveness approach
5. **Content Strategy**
   - Headline patterns and copywriting style
   - Use of customer pain language vs feature language
   - Content depth and SEO indicators
6. **Technical Indicators**
   - Tech stack hints (React, Next.js, WordPress, etc.)
   - Performance indicators (load speed, optimization)
   - Third-party integrations visible
7. **Strengths to Steal** — Top 3 things worth replicating
8. **Weaknesses to Exploit** — Top 3 gaps or mistakes

Be specific with examples from the actual site. This is competitive intelligence.`,
  })
}

export async function runWebsiteAudit(product: Product, url: string) {
  return runWorker({
    product,
    engine: 'pull',
    workerType: 'website-audit',
    taskTitle: 'Website Quick Audit',
    maxTokens: 6144,
    userPrompt: `Score this website against a 17-item conversion checklist: ${url}

Rate each item 0-5 (0=missing, 1=poor, 3=adequate, 5=excellent):

**First Impression (3 items)**
1. Value proposition clarity — Is it obvious what the product does within 3 seconds?
2. Visual hierarchy — Does the eye flow naturally to the most important elements?
3. Professional design — Does it look trustworthy and polished?

**Navigation (3 items)**
4. Clear navigation — Can users find what they need easily?
5. Mobile menu — Is the mobile experience smooth?
6. Call-to-action visibility — Is the primary CTA always visible?

**Content (4 items)**
7. Headline quality — Are headlines benefit-driven (not feature-driven)?
8. Social proof — Testimonials, logos, case studies, numbers?
9. Pain → Solution flow — Does content follow the problem-agitation-solution pattern?
10. FAQ section — Are common objections addressed?

**Conversion (4 items)**
11. CTA clarity — Is it clear what happens when you click?
12. Pricing transparency — Are prices visible without signup?
13. Trust signals — Security badges, guarantee, company info?
14. Urgency elements — Time-limited offers, scarcity indicators?

**Technical (3 items)**
15. Page speed — Does it load fast?
16. Mobile responsiveness — Does it work on phones?
17. SEO basics — Meta title, description, Open Graph?

For each item, provide: score (0-5), observation, and improvement suggestion.

End with: Total score /85, letter grade (A/B/C/D/F), and top 3 priority fixes.`,
  })
}
