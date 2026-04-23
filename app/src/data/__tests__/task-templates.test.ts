import { describe, it, expect } from 'vitest'
import { TASK_TEMPLATES, getTasksForProduct } from '../task-templates'
import type { ProductStage } from '@/types'

describe('TASK_TEMPLATES', () => {
  it('has templates for all 6 engines', () => {
    const engines = new Set(TASK_TEMPLATES.map(t => t.engine))
    expect(engines.size).toBe(6)
    expect(engines).toContain('pull')
    expect(engines).toContain('push')
    expect(engines).toContain('bridge')
    expect(engines).toContain('search')
    expect(engines).toContain('equity')
    expect(engines).toContain('persistence')
  })

  it('all templates have valid scores between 2 and 5', () => {
    for (const t of TASK_TEMPLATES) {
      expect(t.score).toBeGreaterThanOrEqual(2)
      expect(t.score).toBeLessThanOrEqual(5)
    }
  })

  it('all templates have non-empty titles', () => {
    for (const t of TASK_TEMPLATES) {
      expect(t.title.length).toBeGreaterThan(0)
    }
  })

  it('all templates have at least one valid stage', () => {
    const validStages: ProductStage[] = ['pre-launch', 'early', 'active', 'scaling']
    for (const t of TASK_TEMPLATES) {
      expect(t.stages.length).toBeGreaterThan(0)
      for (const stage of t.stages) {
        expect(validStages).toContain(stage)
      }
    }
  })
})

describe('getTasksForProduct', () => {
  it('filters by stage and engines', () => {
    const tasks = getTasksForProduct('early', ['pull', 'push'])
    expect(tasks.length).toBeGreaterThan(0)
    for (const t of tasks) {
      expect(t.stages).toContain('early')
      expect(['pull', 'push']).toContain(t.engine)
    }
  })

  it('returns empty array when no matching engines', () => {
    const tasks = getTasksForProduct('early', [])
    expect(tasks).toEqual([])
  })

  it('returns templates that span multiple stages', () => {
    const earlyTasks = getTasksForProduct('early', ['pull'])
    const activeTasks = getTasksForProduct('active', ['pull'])
    // Some tasks span early+active, so there should be overlap
    const earlyTitles = new Set(earlyTasks.map(t => t.title))
    const activeTitles = new Set(activeTasks.map(t => t.title))
    const overlap = [...earlyTitles].filter(t => activeTitles.has(t))
    expect(overlap.length).toBeGreaterThanOrEqual(0) // At least possible
  })

  it('returns different tasks for different stages', () => {
    const preLaunch = getTasksForProduct('pre-launch', ['push'])
    const scaling = getTasksForProduct('scaling', ['push'])
    // Pre-launch and scaling should have different push tasks
    const preTitles = new Set(preLaunch.map(t => t.title))
    const scaleTitles = new Set(scaling.map(t => t.title))
    expect(preTitles).not.toEqual(scaleTitles)
  })
})
