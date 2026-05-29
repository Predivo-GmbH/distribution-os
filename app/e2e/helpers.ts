import { type Page } from '@playwright/test'

/** Bypass the PasswordGate by setting the session key before navigation */
export async function unlockGate(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('distribution-os-dev-access', 'true')
  })
}

/** Seed a product into localStorage so the app skips FirstMission onboarding */
export async function seedProduct(page: Page) {
  await page.addInitScript(() => {
    const state = {
      products: [{
        id: 'test-product-1',
        name: 'TestSaaS',
        description: 'A test SaaS product for e2e testing',
        stage: 'early',
        primaryEngine: 'push',
        secondaryEngines: ['pull', 'bridge'],
        color: '#6366f1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }],
      currentWeekId: '2026-W12',
      tasks: [],
      weekHistory: [],
    }
    localStorage.setItem('distribution-os', JSON.stringify(state))

    // Mark first mission and setup sprint as done
    const onboarding = {
      firstMissionComplete: true,
      setupSprintComplete: true,
      briefingVisited: false,
      completedSteps: [],
    }
    localStorage.setItem('distribution-os-onboarding', JSON.stringify(onboarding))
  })
}

/** Seed product + knowledge base */
export async function seedProductWithKB(page: Page) {
  await seedProduct(page)
  await page.addInitScript(() => {
    const kb = {
      voiceExamples: ['We build tools that respect your time.', 'No fluff, just results.'],
      icp: {
        who: 'Solo SaaS founders, indie hackers',
        pain: 'No time for manual distribution',
        triedBefore: 'Social media managers, freelancers',
        desiredOutcome: 'Consistent pipeline of users without hiring',
        hangoutsOnline: 'Twitter, Indie Hackers, HN',
      },
      positioning: {
        oneLiner: 'AI-powered distribution for solo founders',
        benefits: ['Save 10 hours/week', 'Consistent growth', 'No team needed'],
        competitor: 'Doing it manually',
        switchReason: 'Automated, consistent, always-on',
      },
      tone: {
        formality: 'conversational',
        technicality: 'accessible',
        boldness: 'bold',
        lengthPreference: 'short-form',
      },
    }
    localStorage.setItem('distribution-os-kb:test-product-1', JSON.stringify(kb))
  })
}

/** Seed product but leave setup sprint incomplete */
export async function seedProductForSetupSprint(page: Page) {
  await page.addInitScript(() => {
    const state = {
      products: [{
        id: 'test-product-1',
        name: 'TestSaaS',
        description: 'A test SaaS product',
        stage: 'early',
        primaryEngine: 'push',
        secondaryEngines: ['pull'],
        color: '#6366f1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }],
      currentWeekId: '2026-W12',
      tasks: [],
      weekHistory: [],
    }
    localStorage.setItem('distribution-os', JSON.stringify(state))

    const onboarding = {
      firstMissionComplete: true,
      setupSprintComplete: false,
      briefingVisited: false,
      completedSteps: [],
    }
    localStorage.setItem('distribution-os-onboarding', JSON.stringify(onboarding))
  })
}

/** Seed AI config so AI-dependent features are available */
export async function seedAIConfig(page: Page) {
  await page.addInitScript(() => {
    const config = {
      apiKey: 'sk-ant-test-key-for-e2e',
      model: 'claude-sonnet-4-20250514',
      maxTokens: 4096,
      proxyUrl: '',
    }
    localStorage.setItem('distribution-os-ai-config', JSON.stringify(config))
  })
}

/** Seed state for a brand-new user who has NOT completed FirstMission */
export async function seedNewUser(page: Page) {
  await page.addInitScript(() => {
    const state = {
      products: [],
      currentWeekId: '2026-W12',
      tasks: [],
      weekHistory: [],
    }
    localStorage.setItem('distribution-os', JSON.stringify(state))

    const onboarding = {
      firstMissionComplete: false,
      setupSprintComplete: false,
      briefingVisited: false,
      completedSteps: [],
    }
    localStorage.setItem('distribution-os-onboarding', JSON.stringify(onboarding))
  })
}

/** Seed product with week history so dashboard shows trends */
export async function seedProductWithHistory(page: Page) {
  await page.addInitScript(() => {
    const state = {
      products: [{
        id: 'test-product-1',
        name: 'TestSaaS',
        description: 'A test SaaS product for e2e testing',
        stage: 'early',
        primaryEngine: 'push',
        secondaryEngines: ['pull', 'bridge'],
        color: '#6366f1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }],
      currentWeekId: '2026-W12',
      tasks: [],
      weekHistory: [{
        weekId: '2026-W11',
        tasks: [
          { id: 'prev-1', productId: 'test-product-1', engine: 'push', title: 'Post on LinkedIn', description: '', score: 3, completed: true, weekId: '2026-W11' },
          { id: 'prev-2', productId: 'test-product-1', engine: 'pull', title: 'Write blog post', description: '', score: 5, completed: false, weekId: '2026-W11' },
        ],
        completedAt: '2026-03-16T00:00:00.000Z',
      }],
    }
    localStorage.setItem('distribution-os', JSON.stringify(state))

    const onboarding = {
      firstMissionComplete: true,
      setupSprintComplete: true,
      briefingVisited: false,
      completedSteps: [],
    }
    localStorage.setItem('distribution-os-onboarding', JSON.stringify(onboarding))
  })
}

/** Seed scheduler run records for activity monitor */
export async function seedSchedulerRecords(page: Page) {
  await page.addInitScript(() => {
    const records = [
      { workerType: 'linkedin-director', productId: 'test-product-1', ranAt: '2026-03-18T08:00:00.000Z', success: true, duration: 12500 },
      { workerType: 'seo-content-writer', productId: 'test-product-1', ranAt: '2026-03-17T09:00:00.000Z', success: false, duration: 3200, error: 'API key expired' },
    ]
    localStorage.setItem('distribution-os-run-records', JSON.stringify(records))
  })
}

/** Seed launch checklist with some items checked */
export async function seedLaunchChecklist(page: Page) {
  await page.addInitScript(() => {
    const checked = { 'domain-register': true, 'domain-dns': true }
    localStorage.setItem('distribution-os-launch-checklist', JSON.stringify(checked))
  })
}

/** Seed inbox with sample artifacts */
export async function seedInbox(page: Page) {
  await page.addInitScript(() => {
    const artifacts = [
      {
        id: 'art-1',
        productId: 'test-product-1',
        engine: 'push',
        workerType: 'linkedin-director',
        taskTitle: 'LinkedIn Weekly Content',
        status: 'pending',
        content: '# LinkedIn Post Ideas\n\n1. Why most SaaS fail at distribution\n2. The compound effect of weekly posting',
        generatedAt: '2026-03-19T08:00:00.000Z',
      },
      {
        id: 'art-2',
        productId: 'test-product-1',
        engine: 'pull',
        workerType: 'seo-content-writer',
        taskTitle: 'SEO Blog Post',
        status: 'approved',
        content: '# How to Build a Distribution System\n\nContent here...',
        generatedAt: '2026-03-18T08:00:00.000Z',
        approvedAt: '2026-03-18T10:00:00.000Z',
      },
    ]
    localStorage.setItem('distribution-os-inbox', JSON.stringify(artifacts))
  })
}
