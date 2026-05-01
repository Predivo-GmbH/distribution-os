import { useState, useEffect } from 'react'
import type { AppState, WorkerType } from '@/types'
import { PageMeta } from '@/components/shared/PageMeta'
import { APP_NAME } from '@/lib/app-config'
import { loadInbox } from '@/lib/storage'
import { Loader2, Sparkles, FileText, PenTool, Video, Send, Copy, Download } from 'lucide-react'
import { runProposalWriter, runContentWriter, runVideoScriptWriter, runOutreachDMWriter } from '@/lib/ai'

type Tab = 'proposal' | 'content' | 'video' | 'outreach'

const TABS: { key: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { key: 'proposal', label: 'Proposal', icon: FileText, desc: 'Paste a sales call transcript to generate a tailored proposal with follow-up sequence.' },
  { key: 'content', label: 'Content Calendar', icon: PenTool, desc: 'Generate a 7-day content calendar with ready-to-publish posts.' },
  { key: 'video', label: 'Video Scripts', icon: Video, desc: 'Create video scripts for short, medium, and long-form content.' },
  { key: 'outreach', label: 'Outreach DMs', icon: Send, desc: 'Generate multi-platform outreach sequences (LinkedIn, Twitter, Email).' },
]

const TAB_WORKER_MAP: Record<Tab, WorkerType> = {
  proposal: 'proposal-writer',
  content: 'content-writer',
  video: 'video-script-writer',
  outreach: 'outreach-dm-writer',
}

export function Proposals({ state }: { state: AppState }) {
  const [productId, setProductId] = useState(state.products[0]?.id ?? '')
  const [activeTab, setActiveTab] = useState<Tab>('proposal')
  const [transcript, setTranscript] = useState('')
  const [results, setResults] = useState<Record<Tab, string>>({ proposal: '', content: '', video: '', outreach: '' })
  const [loading, setLoading] = useState<Record<Tab, boolean>>({ proposal: false, content: false, video: false, outreach: false })
  const [errors, setErrors] = useState<Record<Tab, string>>({ proposal: '', content: '', video: '', outreach: '' })

  const product = state.products.find(p => p.id === productId)

  // Load existing artifacts on mount / product change
  useEffect(() => {
    if (!productId) return
    const inbox = loadInbox()
    const loaded: Partial<Record<Tab, string>> = {}
    for (const tab of ['proposal', 'content', 'video', 'outreach'] as Tab[]) {
      const workerType = TAB_WORKER_MAP[tab]
      const artifact = inbox.find(a => a.productId === productId && a.workerType === workerType)
      if (artifact) loaded[tab] = artifact.editedContent || artifact.content
    }
    setResults(prev => ({ ...prev, ...loaded }))
  }, [productId])

  async function generate(tab: Tab) {
    if (!product) return
    setLoading(prev => ({ ...prev, [tab]: true }))
    setErrors(prev => ({ ...prev, [tab]: '' }))
    try {
      let result
      switch (tab) {
        case 'proposal':
          if (!transcript.trim()) {
            setErrors(prev => ({ ...prev, proposal: 'Paste a sales call transcript first.' }))
            return
          }
          result = await runProposalWriter(product, transcript)
          break
        case 'content':
          result = await runContentWriter(product)
          break
        case 'video':
          result = await runVideoScriptWriter(product)
          break
        case 'outreach':
          result = await runOutreachDMWriter(product)
          break
      }
      if (result.success) {
        setResults(prev => ({ ...prev, [tab]: result.content }))
      } else {
        setErrors(prev => ({ ...prev, [tab]: result.error || 'Generation failed' }))
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, [tab]: err instanceof Error ? err.message : 'Unknown error' }))
    } finally {
      setLoading(prev => ({ ...prev, [tab]: false }))
    }
  }

  if (state.products.length === 0) {
    return (
      <div className="space-y-6">
        <PageMeta title={`Proposals — ${APP_NAME}`} noindex />
        <h1 className="text-2xl font-semibold text-[var(--color-ink)] tracking-tight">Proposals & Content</h1>
        <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-6 text-center">
          <p className="text-sm text-[var(--color-ink-muted)]">Add a product first to generate proposals and content.</p>
        </div>
      </div>
    )
  }

  const currentTab = TABS.find(t => t.key === activeTab)!

  return (
    <div className="space-y-6">
      <PageMeta title={`Proposals — ${APP_NAME}`} noindex />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)] tracking-tight">Proposals & Content</h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">Generate sales proposals, content calendars, video scripts, and outreach sequences.</p>
        </div>
        {state.products.length > 1 && (
          <select
            value={productId}
            onChange={e => setProductId(e.target.value)}
            className="px-3 py-2 min-h-[44px] rounded-lg border border-[var(--color-edge)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)]"
          >
            {state.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg text-xs font-medium transition-colors shrink-0 ${
              activeTab === key
                ? 'bg-[var(--color-accent-light)] text-[var(--color-accent-text)]'
                : 'text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-5 py-3 border-b border-[var(--color-edge)] gap-2">
          <div className="flex items-center gap-2">
            <currentTab.icon size={16} className="text-[var(--color-accent-text)]" />
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">{currentTab.label}</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {results[activeTab] && (
              <>
                <button
                  onClick={() => navigator.clipboard.writeText(results[activeTab])}
                  className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[44px] rounded-lg text-xs font-medium border border-[var(--color-edge)] text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <Copy size={12} />
                  Copy
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([results[activeTab]], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${activeTab}-${product?.name || 'output'}.md`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[44px] rounded-lg text-xs font-medium border border-[var(--color-edge)] text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <Download size={12} />
                  Download
                </button>
              </>
            )}
            <button
              onClick={() => generate(activeTab)}
              disabled={loading[activeTab] || !product}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-lg text-xs font-medium bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading[activeTab] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {loading[activeTab] ? 'Generating...' : results[activeTab] ? 'Regenerate' : 'Generate'}
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {/* Transcript input for proposals */}
          {activeTab === 'proposal' && !results.proposal && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-2">Sales Call Transcript</label>
              <textarea
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                placeholder="Paste your sales call transcript here..."
                rows={8}
                className="w-full px-3 py-2 min-h-[44px] rounded-lg border border-[var(--color-edge)] bg-[var(--color-surface)] text-base md:text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] resize-y"
              />
            </div>
          )}

          {errors[activeTab] && (
            <div className="mb-3 p-3 rounded-lg bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)]">{errors[activeTab]}</div>
          )}

          {results[activeTab] ? (
            <div className="prose prose-sm max-w-none text-[var(--color-ink-body)] whitespace-pre-wrap max-h-[600px] overflow-y-auto">{results[activeTab]}</div>
          ) : !loading[activeTab] ? (
            <p className="text-sm text-[var(--color-ink-muted)] italic">{currentTab.desc}</p>
          ) : (
            <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
              <Loader2 size={14} className="animate-spin" />
              Generating {currentTab.label.toLowerCase()}...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
