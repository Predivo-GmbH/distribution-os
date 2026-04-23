import { describe, it, expect } from 'vitest'
import {
  loadState,
  saveState,
  generateId,
  getWeekId,
  loadPrefs,
  savePrefs,
  loadInbox,
  saveInbox,
  addArtifact,
  updateArtifact,
  updateArtifactStatus,
  removeArtifact,
  getPendingCount,
  loadKnowledgeBase,
  saveKnowledgeBase,
  removeKnowledgeBase,
  hasKnowledgeBase,
  exportState,
  cleanupProductData,
} from '../storage'
import type { AppState, InboxArtifact } from '@/types'

describe('getWeekId', () => {
  it('returns a string in YYYY-Www format', () => {
    const id = getWeekId(new Date('2026-03-15'))
    expect(id).toMatch(/^\d{4}-W\d{2}$/)
  })

  it('returns current week when called with no args', () => {
    const id = getWeekId()
    expect(id).toMatch(/^\d{4}-W\d{2}$/)
  })
})

describe('loadState / saveState', () => {
  it('returns default state when nothing is stored', () => {
    const state = loadState()
    expect(state.products).toEqual([])
    expect(state.tasks).toEqual([])
    expect(state.weekHistory).toEqual([])
    expect(state.currentWeekId).toMatch(/^\d{4}-W\d{2}$/)
  })

  it('saves and loads state correctly', () => {
    const state: AppState = {
      products: [{
        id: 'p1',
        name: 'Test',
        description: 'Test product',
        stage: 'early',
        primaryEngine: 'pull',
        secondaryEngines: ['push'],
        color: '#000',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      }],
      currentWeekId: '2026-W10',
      tasks: [],
      weekHistory: [],
    }
    saveState(state)
    const loaded = loadState()
    expect(loaded.products).toHaveLength(1)
    expect(loaded.products[0].name).toBe('Test')
  })

  it('handles corrupt JSON gracefully', () => {
    localStorage.setItem('distribution-os', '{bad json')
    const state = loadState()
    expect(state.products).toEqual([])
  })

  it('ensures arrays exist during schema migration', () => {
    localStorage.setItem('distribution-os', JSON.stringify({
      currentWeekId: getWeekId(),
    }))
    const state = loadState()
    expect(Array.isArray(state.products)).toBe(true)
    expect(Array.isArray(state.tasks)).toBe(true)
    expect(Array.isArray(state.weekHistory)).toBe(true)
  })
})

describe('generateId', () => {
  it('returns a string', () => {
    const id = generateId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })
})

describe('loadPrefs / savePrefs', () => {
  it('returns default prefs when nothing stored', () => {
    const prefs = loadPrefs()
    expect(prefs.darkMode).toBe(false)
    expect(prefs.weekStartDay).toBe('monday')
  })

  it('saves and loads preferences', () => {
    savePrefs({ darkMode: true, weekStartDay: 'sunday' })
    const prefs = loadPrefs()
    expect(prefs.darkMode).toBe(true)
    expect(prefs.weekStartDay).toBe('sunday')
  })

  it('handles corrupt prefs JSON', () => {
    localStorage.setItem('distribution-os-prefs', 'invalid')
    const prefs = loadPrefs()
    expect(prefs.darkMode).toBe(false)
  })
})

describe('Inbox storage', () => {
  it('returns empty array when no inbox data', () => {
    expect(loadInbox()).toEqual([])
  })

  it('saves and loads inbox artifacts', () => {
    const items: InboxArtifact[] = [{
      id: 'a1',
      productId: 'p1',
      engine: 'pull',
      workerType: 'seo-content-writer',
      taskTitle: 'Test task',
      status: 'pending',
      content: 'Test content',
      generatedAt: '2026-01-01',
    }]
    saveInbox(items)
    const loaded = loadInbox()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].id).toBe('a1')
  })

  it('addArtifact prepends to inbox', () => {
    const artifact = addArtifact({
      productId: 'p1',
      engine: 'push',
      workerType: 'linkedin-director',
      taskTitle: 'LinkedIn Post',
      status: 'pending',
      content: 'Some content',
    })
    expect(artifact.id).toBeDefined()
    expect(artifact.generatedAt).toBeDefined()
    const loaded = loadInbox()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].workerType).toBe('linkedin-director')
  })

  it('updateArtifact modifies an existing artifact', () => {
    addArtifact({
      productId: 'p1',
      engine: 'push',
      workerType: 'linkedin-director',
      taskTitle: 'Test',
      status: 'pending',
      content: 'Original',
    })
    const items = loadInbox()
    updateArtifact(items[0].id, { content: 'Updated' })
    const updated = loadInbox()
    expect(updated[0].content).toBe('Updated')
  })

  it('updateArtifactStatus sets approved timestamps', () => {
    const artifact = addArtifact({
      productId: 'p1',
      engine: 'pull',
      workerType: 'seo-content-writer',
      taskTitle: 'Test',
      status: 'pending',
      content: 'Content',
    })
    updateArtifactStatus(artifact.id, 'approved')
    const items = loadInbox()
    expect(items[0].status).toBe('approved')
    expect(items[0].approvedAt).toBeDefined()
  })

  it('removeArtifact deletes from inbox', () => {
    const artifact = addArtifact({
      productId: 'p1',
      engine: 'pull',
      workerType: 'seo-content-writer',
      taskTitle: 'Test',
      status: 'pending',
      content: 'Content',
    })
    removeArtifact(artifact.id)
    expect(loadInbox()).toHaveLength(0)
  })

  it('getPendingCount counts only pending items', () => {
    addArtifact({ productId: 'p1', engine: 'pull', workerType: 'seo-content-writer', taskTitle: 'T1', status: 'pending', content: 'C1' })
    addArtifact({ productId: 'p1', engine: 'push', workerType: 'linkedin-director', taskTitle: 'T2', status: 'approved', content: 'C2' })
    // Manually set the second to approved
    const items = loadInbox()
    items[0].status = 'approved'
    saveInbox(items)
    expect(getPendingCount()).toBe(1)
  })
})

describe('Knowledge Base storage', () => {
  it('returns default KB when nothing stored', () => {
    const kb = loadKnowledgeBase('p1')
    expect(kb.voiceExamples).toEqual([])
    expect(kb.icp.who).toBe('')
    expect(kb.positioning.oneLiner).toBe('')
  })

  it('saves and loads knowledge base', () => {
    const kb = {
      voiceExamples: ['Example 1'],
      icp: { who: 'Founders', pain: 'No time', triedBefore: '', desiredOutcome: '', hangoutsOnline: '' },
      positioning: { oneLiner: 'The best tool', benefits: ['Fast', 'Easy', 'Cheap'] as [string, string, string], competitor: '', switchReason: '' },
      tone: { formality: 'conversational' as const, technicality: 'accessible' as const, boldness: 'bold' as const, lengthPreference: 'short-form' as const },
      approvedArtifacts: [],
    }
    saveKnowledgeBase('p1', kb)
    const loaded = loadKnowledgeBase('p1')
    expect(loaded.voiceExamples).toEqual(['Example 1'])
    expect(loaded.icp.who).toBe('Founders')
  })

  it('removeKnowledgeBase deletes from storage', () => {
    saveKnowledgeBase('p1', {
      voiceExamples: ['Test'],
      icp: { who: 'Test', pain: '', triedBefore: '', desiredOutcome: '', hangoutsOnline: '' },
      positioning: { oneLiner: '', benefits: ['', '', ''], competitor: '', switchReason: '' },
      tone: { formality: 'conversational', technicality: 'accessible', boldness: 'bold', lengthPreference: 'short-form' },
      approvedArtifacts: [],
    })
    removeKnowledgeBase('p1')
    const kb = loadKnowledgeBase('p1')
    expect(kb.voiceExamples).toEqual([])
  })

  it('hasKnowledgeBase detects populated KB', () => {
    expect(hasKnowledgeBase('p1')).toBe(false)
    saveKnowledgeBase('p1', {
      voiceExamples: ['Test'],
      icp: { who: '', pain: '', triedBefore: '', desiredOutcome: '', hangoutsOnline: '' },
      positioning: { oneLiner: '', benefits: ['', '', ''], competitor: '', switchReason: '' },
      tone: { formality: 'conversational', technicality: 'accessible', boldness: 'bold', lengthPreference: 'short-form' },
      approvedArtifacts: [],
    })
    expect(hasKnowledgeBase('p1')).toBe(true)
  })
})

describe('cleanupProductData', () => {
  it('removes KB and artifacts for a product', () => {
    saveKnowledgeBase('p1', {
      voiceExamples: ['Test'],
      icp: { who: '', pain: '', triedBefore: '', desiredOutcome: '', hangoutsOnline: '' },
      positioning: { oneLiner: '', benefits: ['', '', ''], competitor: '', switchReason: '' },
      tone: { formality: 'conversational', technicality: 'accessible', boldness: 'bold', lengthPreference: 'short-form' },
      approvedArtifacts: [],
    })
    addArtifact({ productId: 'p1', engine: 'pull', workerType: 'seo-content-writer', taskTitle: 'T', status: 'pending', content: 'C' })
    cleanupProductData('p1')
    expect(hasKnowledgeBase('p1')).toBe(false)
    // Artifacts for p1 should be removed
    expect(loadInbox().filter(a => a.productId === 'p1')).toHaveLength(0)
  })
})

describe('exportState', () => {
  it('returns valid JSON string', () => {
    const state: AppState = {
      products: [],
      currentWeekId: '2026-W10',
      tasks: [],
      weekHistory: [],
    }
    const json = exportState(state)
    expect(JSON.parse(json)).toEqual(state)
  })
})
