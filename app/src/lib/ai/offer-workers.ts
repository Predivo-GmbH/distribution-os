/* ============================================================
   Offer Builder Workers — Product Brief & Offer Design
   ============================================================ */

import type { Product } from '@/types'
import { runWorker } from './worker-base'

export async function runProductDefiner(product: Product) {
  return runWorker({
    product,
    engine: 'push',
    workerType: 'product-definer',
    taskTitle: 'Product Brief',
    maxTokens: 6144,
    userPrompt: `Create a comprehensive product brief. Produce:

1. **Product Name Options** — 3 name suggestions with rationale (evaluate memorability, domain availability signals, SEO potential)
2. **One-Liner** — the single sentence that explains what it does and who it's for
3. **Elevator Pitch** — 30-second version for conversations
4. **Target Persona** — detailed profile (name, role, company size, daily frustrations, goals, tools used)
5. **Problem Statement** — the specific pain this solves, in customer language
6. **3 MVP Features** — the minimum viable feature set with user stories for each
7. **Success Metrics** — how the founder will know it's working (specific KPIs)
8. **Anti-Features** — 3 things this product explicitly does NOT do (and why)

Write in customer language, not technical jargon. Every section should be directly usable in marketing copy.`,
  })
}

export async function runOfferDesigner(product: Product) {
  return runWorker({
    product,
    engine: 'push',
    workerType: 'offer-designer',
    taskTitle: 'Offer Design',
    maxTokens: 6144,
    userPrompt: `Design an irresistible offer package. Produce:

1. **3-Tier Pricing** — Free/Starter/Pro with specific features per tier, price points, and reasoning
2. **Irresistible Hook** — the headline offer that makes saying no feel stupid
3. **Value Stack** — list everything included with perceived value next to each item
4. **Risk Reversal** — guarantee structure (money-back, results-based, or hybrid)
5. **Urgency Mechanics** — 2-3 ethical urgency triggers (founding member pricing, capacity limits, early-adopter bonuses)
6. **Objection Busters** — top 5 objections and scripted responses
7. **Comparison Positioning** — "Unlike [competitor], we [unique benefit]" statements
8. **Launch Offer** — special limited-time offer for first 100 customers

Be specific with numbers. Don't use generic pricing — calculate based on the product's value proposition.`,
  })
}
