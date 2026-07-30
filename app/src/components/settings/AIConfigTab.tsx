import { useState } from 'react'
import { CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import type { AIConfig, AIProvider } from '@/lib/ai/config'
import { loadAIConfig, saveAIConfig, isAIConfigured, PROVIDER_META, providerConflict, detectProvider } from '@/lib/ai/config'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const PROVIDERS: AIProvider[] = ['anthropic', 'kimi', 'openai']

export function AIConfigTab() {
  const [config, setConfig] = useState<AIConfig>(loadAIConfig())
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const conflict = providerConflict(config.provider, config.apiKey)

  // Auto-switch to Anthropic when an sk-ant- key is pasted under a different provider.
  function handleKeyChange(apiKey: string) {
    const detected = detectProvider(apiKey)
    setConfig(prev => ({ ...prev, apiKey, provider: detected ?? prev.provider }))
  }

  async function handleSave() {
    setError(null)
    if (config.apiKey && conflict) {
      setError(conflict)
      return
    }

    saveAIConfig(config)

    // Persist the key + provider through the save-api-key edge function, which ENCRYPTS the
    // key at rest (AES-GCM). We no longer write user_api_keys directly — RLS blocks that so a
    // plaintext key can't bypass encryption.
    if (isSupabaseConfigured && config.apiKey) {
      setSaving(true)
      try {
        const { data, error: fnError } = await supabase.functions.invoke('save-api-key', {
          body: { api_key: config.apiKey, provider: config.provider },
        })
        if (fnError || data?.error) {
          setError(`Saved locally, but syncing to the server failed: ${data?.error || fnError?.message}`)
          setSaving(false)
          return
        }
      } catch (e) {
        setError(`Saved locally, but syncing to the server failed: ${e instanceof Error ? e.message : 'unknown error'}`)
        setSaving(false)
        return
      }
      setSaving(false)
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const configured = isAIConfigured()
  const meta = PROVIDER_META[config.provider]

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
          {configured ? 'AI is configured and ready to generate.' : 'Choose a provider and enter your API key to enable AI generation.'}
        </span>
      </div>

      {/* API Key */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl p-4 sm:p-5 space-y-4">
        <h3 className="text-base font-semibold text-[var(--color-ink)]">AI Provider</h3>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Provider</label>
          <p className="text-xs text-[var(--color-ink-muted)] mb-2">Bring your own key. You pay your provider directly and your runs aren&apos;t capped by the plan quota.</p>
          <select
            value={config.provider}
            onChange={e => setConfig(prev => ({ ...prev, provider: e.target.value as AIProvider }))}
            className="min-h-[44px] px-3 py-2 rounded-xl border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-base md:text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-edge-focus)]"
          >
            {PROVIDERS.map(p => (
              <option key={p} value={p}>{PROVIDER_META[p].label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">API Key</label>
          <p className="text-xs text-[var(--color-ink-muted)] mb-2">{meta.keyHint} Stored securely against your account and used only to call your chosen provider.</p>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={config.apiKey}
              onChange={e => handleKeyChange(e.target.value)}
              placeholder={meta.keyPlaceholder}
              className="w-full px-3 py-2 pr-10 min-h-[44px] rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-base md:text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-edge-focus)] font-mono"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {config.apiKey && conflict && (
            <p className="flex items-center gap-1 mt-2 text-xs text-[var(--color-warning)]">
              <AlertCircle size={13} /> {conflict}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Model</label>
          <p className="text-xs text-[var(--color-ink-muted)] mb-2">Leave as <span className="font-mono">auto</span> for the recommended model for your provider, or enter a specific model id.</p>
          <input
            type="text"
            value={config.model}
            onChange={e => setConfig(prev => ({ ...prev, model: e.target.value.trim() || 'auto' }))}
            placeholder="auto"
            className="w-64 px-3 py-2 min-h-[44px] rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-base md:text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-edge-focus)] font-mono"
          />
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
      <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl p-4 sm:p-5 space-y-4">
        <h3 className="text-base font-semibold text-[var(--color-ink)]">Advanced</h3>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">API Proxy URL</label>
          <p className="text-xs text-[var(--color-ink-muted)] mb-2">
            Optional. Only used by the local-dev direct fallback (Anthropic only). Leave empty in normal use — AI runs through the secure server proxy.
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
          disabled={saving}
          className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Configuration'}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-[var(--color-success)]">
            <CheckCircle2 size={14} /> Saved
          </span>
        )}
        {error && (
          <span className="flex items-center gap-1 text-sm text-[var(--color-warning)]">
            <AlertCircle size={14} /> {error}
          </span>
        )}
      </div>
    </div>
  )
}
