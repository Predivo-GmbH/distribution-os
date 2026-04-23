import { describe, it, expect } from 'vitest'
import { loadAIConfig, saveAIConfig, isAIConfigured, getAPIEndpoint } from '../config'
import type { AIConfig } from '../config'

describe('AI Config', () => {
  it('returns default config when nothing stored', () => {
    const config = loadAIConfig()
    expect(config.apiKey).toBe('')
    expect(config.model).toBe('claude-sonnet-4-20250514')
    expect(config.maxTokens).toBe(4096)
    expect(config.proxyUrl).toBe('')
  })

  it('saves and loads config', () => {
    const config: AIConfig = {
      apiKey: 'sk-test-key',
      model: 'claude-opus-4-20250514',
      maxTokens: 8192,
      proxyUrl: 'https://proxy.example.com',
    }
    saveAIConfig(config)
    const loaded = loadAIConfig()
    expect(loaded.apiKey).toBe('sk-test-key')
    expect(loaded.model).toBe('claude-opus-4-20250514')
    expect(loaded.maxTokens).toBe(8192)
  })

  it('isAIConfigured returns false when no API key', () => {
    expect(isAIConfigured()).toBe(false)
  })

  it('isAIConfigured returns true when API key set', () => {
    saveAIConfig({
      apiKey: 'sk-test',
      model: 'claude-sonnet-4-20250514',
      maxTokens: 4096,
      proxyUrl: '',
    })
    expect(isAIConfigured()).toBe(true)
  })

  it('getAPIEndpoint returns proxy URL when set', () => {
    const config: AIConfig = { apiKey: '', model: '', maxTokens: 0, proxyUrl: 'https://proxy.example.com' }
    expect(getAPIEndpoint(config)).toBe('https://proxy.example.com')
  })

  it('getAPIEndpoint returns default Anthropic URL when no proxy', () => {
    const config: AIConfig = { apiKey: '', model: '', maxTokens: 0, proxyUrl: '' }
    expect(getAPIEndpoint(config)).toBe('https://api.anthropic.com')
  })
})
