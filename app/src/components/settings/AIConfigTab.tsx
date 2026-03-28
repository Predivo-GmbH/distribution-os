import { useState } from 'react'
import { CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import type { AIConfig } from '@/lib/ai/config'
import { loadAIConfig, saveAIConfig, isAIConfigured } from '@/lib/ai/config'

export function AIConfigTab() {
  const [config, setConfig] = useState<AIConfig>(loadAIConfig())
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)

  function handleSave() {
    saveAIConfig(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const configured = isAIConfigured()

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
        configured
          ? 'bg-[var(--color-success)]/5 border-[var(--color-success)]/20'
          : 'bg-[var(--color-warning-bg)] border-[var(--color-warning)]/20'
      }`}>
        {configured
          ? <CheckCircle2 size={16} className="text-[var(--color-success)]" />
          : <AlertCircle size={16} className="text-[var(--color-warning)]" />
        }
        <span className="text-sm text-[var(--color-ink)]">
          {configured ? 'AI is configured and ready to generate.' : 'Enter your Anthropic API key to enable AI generation.'}
        </span>
      </div>

      {/* API Key */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-4 sm:p-5 space-y-4">
        <h3 className="text-base font-semibold text-[var(--color-ink)]">Anthropic API</h3>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">API Key</label>
          <p className="text-xs text-[var(--color-ink-muted)] mb-2">Your key is stored locally in your browser. It is never sent anywhere except the Anthropic API.</p>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={config.apiKey}
              onChange={e => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="sk-ant-..."
              className="w-full px-3 py-2 pr-10 min-h-[44px] rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-base md:text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-edge-focus)] font-mono"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Model</label>
          <select
            value={config.model}
            onChange={e => setConfig(prev => ({ ...prev, model: e.target.value }))}
            className="min-h-[44px] px-3 py-2 rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-base md:text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-edge-focus)]"
          >
            <option value="claude-sonnet-4-20250514">Claude Sonnet 4 (recommended)</option>
            <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 (faster, cheaper)</option>
            <option value="claude-opus-4-6">Claude Opus 4.6 (most capable)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Max Tokens</label>
          <p className="text-xs text-[var(--color-ink-muted)] mb-2">Maximum output length per generation. Higher = more detailed but costs more.</p>
          <input
            type="number"
            value={config.maxTokens}
            onChange={e => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 4096 }))}
            min={1024}
            max={16384}
            step={1024}
            className="w-32 px-3 py-2 min-h-[44px] rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-base md:text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-edge-focus)] font-mono"
          />
        </div>
      </div>

      {/* Proxy */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-4 sm:p-5 space-y-4">
        <h3 className="text-base font-semibold text-[var(--color-ink)]">Advanced</h3>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">API Proxy URL</label>
          <p className="text-xs text-[var(--color-ink-muted)] mb-2">
            Optional. If you're running a CORS proxy, enter its base URL here. Leave empty to call the Anthropic API directly.
          </p>
          <input
            type="url"
            value={config.proxyUrl}
            onChange={e => setConfig(prev => ({ ...prev, proxyUrl: e.target.value }))}
            placeholder="https://your-proxy.example.com"
            className="w-full px-3 py-2 min-h-[44px] rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-base md:text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-edge-focus)]"
          />
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="px-5 py-2.5 min-h-[44px] rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors"
        >
          Save Configuration
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-[var(--color-success)]">
            <CheckCircle2 size={14} /> Saved
          </span>
        )}
      </div>
    </div>
  )
}
