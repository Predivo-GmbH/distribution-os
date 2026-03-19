import { useState } from 'react'
import { CheckCircle2, Link2, Unlink, Eye, EyeOff } from 'lucide-react'
import type { IntegrationConfig } from '@/lib/ai/integrations'
import { loadIntegrations, saveIntegrations } from '@/lib/ai/integrations'

export function IntegrationsTab() {
  const [config, setConfig] = useState<IntegrationConfig>(loadIntegrations())
  const [saved, setSaved] = useState(false)
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({})

  function handleSave() {
    saveIntegrations(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function toggleToken(key: string) {
    setShowTokens(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--color-ink-muted)]">
        Integrations enable autonomous publishing. All are optional — without them, AI still generates content and you publish manually.
      </p>

      {/* LinkedIn */}
      <IntegrationCard
        title="LinkedIn"
        description="Auto-publish scheduled posts from the LinkedIn Director. Without this, posts are copied to clipboard."
        connected={config.linkedin.connected}
        onToggle={() => setConfig(prev => ({
          ...prev,
          linkedin: { ...prev.linkedin, connected: !prev.linkedin.connected }
        }))}
      >
        <div className="space-y-3">
          <TokenField
            label="Access Token"
            value={config.linkedin.accessToken}
            onChange={v => setConfig(prev => ({ ...prev, linkedin: { ...prev.linkedin, accessToken: v } }))}
            show={showTokens['linkedin'] ?? false}
            onToggleShow={() => toggleToken('linkedin')}
            placeholder="LinkedIn OAuth access token"
          />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-ink)]">Auto-publish</p>
              <p className="text-xs text-[var(--color-ink-muted)]">Posts publish automatically at scheduled times (30-min override window in Inbox)</p>
            </div>
            <button
              onClick={() => setConfig(prev => ({ ...prev, linkedin: { ...prev.linkedin, autoPublish: !prev.linkedin.autoPublish } }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                config.linkedin.autoPublish ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-edge-outline)]'
              }`}
            >
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                config.linkedin.autoPublish ? 'translate-x-4.5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </IntegrationCard>

      {/* Google Search Console */}
      <IntegrationCard
        title="Google Search Console"
        description="Import impressions/CTR data for the Search Console Optimizer. Without this, upload CSV manually."
        connected={config.googleSearchConsole.connected}
        onToggle={() => setConfig(prev => ({
          ...prev,
          googleSearchConsole: { ...prev.googleSearchConsole, connected: !prev.googleSearchConsole.connected }
        }))}
      >
        <TokenField
          label="Access Token"
          value={config.googleSearchConsole.accessToken}
          onChange={v => setConfig(prev => ({ ...prev, googleSearchConsole: { ...prev.googleSearchConsole, accessToken: v } }))}
          show={showTokens['gsc'] ?? false}
          onToggleShow={() => toggleToken('gsc')}
          placeholder="Google OAuth access token"
        />
      </IntegrationCard>

      {/* Google Ads */}
      <IntegrationCard
        title="Google Ads"
        description="Import campaign performance data for the ROAS Analyst. Without this, upload CSV manually."
        connected={config.googleAds.connected}
        onToggle={() => setConfig(prev => ({
          ...prev,
          googleAds: { ...prev.googleAds, connected: !prev.googleAds.connected }
        }))}
      >
        <TokenField
          label="Access Token"
          value={config.googleAds.accessToken}
          onChange={v => setConfig(prev => ({ ...prev, googleAds: { ...prev.googleAds, accessToken: v } }))}
          show={showTokens['gads'] ?? false}
          onToggleShow={() => toggleToken('gads')}
          placeholder="Google Ads API token"
        />
      </IntegrationCard>

      {/* Email Service */}
      <IntegrationCard
        title="Email Service"
        description="Schedule and send email sequences on approval. Without this, sequences export as formatted text."
        connected={config.emailService.connected}
        onToggle={() => setConfig(prev => ({
          ...prev,
          emailService: { ...prev.emailService, connected: !prev.emailService.connected }
        }))}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Provider</label>
            <select
              value={config.emailService.provider}
              onChange={e => setConfig(prev => ({ ...prev, emailService: { ...prev.emailService, provider: e.target.value as IntegrationConfig['emailService']['provider'] } }))}
              className="px-3 py-2 rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-edge-focus)]"
            >
              <option value="">Select provider...</option>
              <option value="resend">Resend</option>
              <option value="loops">Loops</option>
              <option value="postmark">Postmark</option>
            </select>
          </div>
          <TokenField
            label="API Key"
            value={config.emailService.apiKey}
            onChange={v => setConfig(prev => ({ ...prev, emailService: { ...prev.emailService, apiKey: v } }))}
            show={showTokens['email'] ?? false}
            onToggleShow={() => toggleToken('email')}
            placeholder="Email service API key"
          />
        </div>
      </IntegrationCard>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="px-5 py-2 rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium text-sm hover:bg-[var(--color-btn-primary-hover)] transition-colors"
        >
          Save Integrations
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

/* Sub-components */

function IntegrationCard({ title, description, connected, onToggle, children }: {
  title: string; description: string; connected: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[var(--color-ink)]">{title}</h3>
            {connected
              ? <span className="flex items-center gap-1 text-[10px] font-medium text-[var(--color-success)]"><Link2 size={10} /> Connected</span>
              : <span className="flex items-center gap-1 text-[10px] font-medium text-[var(--color-ink-muted)]"><Unlink size={10} /> Not connected</span>
            }
          </div>
          <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{description}</p>
        </div>
        <button
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            connected ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-edge-outline)]'
          }`}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
            connected ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>
      {connected && children}
    </div>
  )
}

function TokenField({ label, value, onChange, show, onToggleShow, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; show: boolean; onToggleShow: () => void; placeholder: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-10 rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-edge-focus)] font-mono"
        />
        <button
          onClick={onToggleShow}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  )
}
