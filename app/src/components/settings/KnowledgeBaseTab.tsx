import { useState, useEffect, useRef, useId } from 'react'
import { Brain, ChevronDown, ChevronRight, Plus, X, CheckCircle2 } from 'lucide-react'
import type { AppState, KnowledgeBase, KnowledgeBaseTone } from '@/types'
import { defaultKnowledgeBase } from '@/types'
import { ENGINE_META } from '@/types'
import { loadKnowledgeBase, saveKnowledgeBase, hasKnowledgeBase } from '@/lib/storage'

interface Props {
  state: AppState
}

type Section = 'voice' | 'icp' | 'positioning' | 'tone'

const TONE_OPTIONS: { key: keyof KnowledgeBaseTone; labelA: string; labelB: string; valueA: string; valueB: string }[] = [
  { key: 'formality', labelA: 'Formal', labelB: 'Conversational', valueA: 'formal', valueB: 'conversational' },
  { key: 'technicality', labelA: 'Technical', labelB: 'Accessible', valueA: 'technical', valueB: 'accessible' },
  { key: 'boldness', labelA: 'Bold', labelB: 'Measured', valueA: 'bold', valueB: 'measured' },
  { key: 'lengthPreference', labelA: 'Short-form', labelB: 'Long-form', valueA: 'short-form', valueB: 'long-form' },
]

export function KnowledgeBaseTab({ state }: Props) {
  const [selectedProductId, setSelectedProductId] = useState<string>(state.products[0]?.id ?? '')
  const [kb, setKb] = useState<KnowledgeBase>(() =>
    state.products[0]?.id ? loadKnowledgeBase(state.products[0].id) : defaultKnowledgeBase()
  )
  const [expandedSections, setExpandedSections] = useState<Set<Section>>(new Set(['voice', 'icp', 'positioning', 'tone']))
  const [saved, setSaved] = useState(false)
  const [newExample, setNewExample] = useState('')
  const isFirstRender = useRef(true)
  const productSelectId = useId()
  const voiceTextareaId = useId()

  function handleProductChange(productId: string) {
    setSelectedProductId(productId)
    if (productId) {
      setKb(loadKnowledgeBase(productId))
    }
  }

  // Auto-save on kb change (debounced) — skip initial mount
  useEffect(() => {
    if (!selectedProductId) return
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timer = setTimeout(() => {
      saveKnowledgeBase(selectedProductId, kb)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 800)
    return () => clearTimeout(timer)
  }, [kb, selectedProductId])

  function toggleSection(section: Section) {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  function addVoiceExample() {
    const trimmed = newExample.trim()
    if (!trimmed) return
    setKb(prev => ({ ...prev, voiceExamples: [...prev.voiceExamples, trimmed] }))
    setNewExample('')
  }

  function removeVoiceExample(index: number) {
    setKb(prev => ({ ...prev, voiceExamples: prev.voiceExamples.filter((_, i) => i !== index) }))
  }

  if (state.products.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--color-ink-muted)]">
        <Brain size={32} className="mx-auto mb-3 opacity-50" />
        <p className="text-sm">Add a product first to configure its Knowledge Base.</p>
      </div>
    )
  }

  const selectedProduct = state.products.find(p => p.id === selectedProductId)

  return (
    <div className="space-y-6">
      {/* Product selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label htmlFor={productSelectId} className="sr-only">Select product</label>
          <select
            id={productSelectId}
            value={selectedProductId}
            onChange={e => handleProductChange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] font-medium focus:outline-none focus:border-[var(--color-edge-focus)]"
          >
            {state.products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {selectedProduct && (
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
              style={{ color: ENGINE_META[selectedProduct.primaryEngine].color, backgroundColor: ENGINE_META[selectedProduct.primaryEngine].lightBg }}
            >
              {selectedProduct.stage.replace('-', ' ')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--color-ink-muted)]">
          {saved && (
            <span className="flex items-center gap-1 text-[var(--color-success)]">
              <CheckCircle2 size={12} /> Saved
            </span>
          )}
          {hasKnowledgeBase(selectedProductId) ? (
            <span className="px-2 py-0.5 rounded bg-[var(--color-success)]/10 text-[var(--color-success)] font-medium">Configured</span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-[var(--color-warning-bg)] text-[var(--color-warning)] font-medium">Not set up</span>
          )}
        </div>
      </div>

      {/* Voice Examples */}
      <SectionCard
        title="Voice Examples"
        description="Paste 10–15 examples of your writing style. LinkedIn posts, emails, landing page copy. These train the AI to match your voice."
        section="voice"
        expanded={expandedSections.has('voice')}
        onToggle={toggleSection}
        count={kb.voiceExamples.length}
        target={10}
      >
        <div className="space-y-3">
          {kb.voiceExamples.map((example, i) => (
            <div key={i} className="group relative bg-[var(--color-surface-hover)] rounded-lg p-3 pr-8">
              <p className="text-sm text-[var(--color-ink-body)] whitespace-pre-wrap line-clamp-3">{example}</p>
              <button
                onClick={() => removeVoiceExample(i)}
                className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--color-error-bg)] text-[var(--color-ink-muted)] hover:text-[var(--color-error)] transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <label htmlFor={voiceTextareaId} className="sr-only">Voice example</label>
            <textarea
              id={voiceTextareaId}
              value={newExample}
              onChange={e => setNewExample(e.target.value)}
              placeholder="Paste a writing example here..."
              rows={3}
              className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-edge-focus)] resize-none"
            />
          </div>
          <button
            onClick={addVoiceExample}
            disabled={!newExample.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--color-accent-text)] hover:bg-[var(--color-accent-light)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={14} /> Add Example
          </button>
        </div>
      </SectionCard>

      {/* ICP Definition */}
      <SectionCard
        title="ICP Definition"
        description="Define your ideal customer profile. The AI uses this to target all generated content precisely."
        section="icp"
        expanded={expandedSections.has('icp')}
        onToggle={toggleSection}
      >
        <div className="space-y-4">
          <Field
            label="Who is your customer?"
            hint="Job title, company type, company size"
            value={kb.icp.who}
            onChange={v => setKb(prev => ({ ...prev, icp: { ...prev.icp, who: v } }))}
          />
          <Field
            label="Primary pain they're solving"
            value={kb.icp.pain}
            onChange={v => setKb(prev => ({ ...prev, icp: { ...prev.icp, pain: v } }))}
          />
          <Field
            label="What have they tried that hasn't worked?"
            value={kb.icp.triedBefore}
            onChange={v => setKb(prev => ({ ...prev, icp: { ...prev.icp, triedBefore: v } }))}
          />
          <Field
            label="Desired outcome they're paying for"
            value={kb.icp.desiredOutcome}
            onChange={v => setKb(prev => ({ ...prev, icp: { ...prev.icp, desiredOutcome: v } }))}
          />
          <Field
            label="Where they hang out online"
            hint="LinkedIn, specific subreddits, communities, newsletters"
            value={kb.icp.hangoutsOnline}
            onChange={v => setKb(prev => ({ ...prev, icp: { ...prev.icp, hangoutsOnline: v } }))}
          />
        </div>
      </SectionCard>

      {/* Product Positioning */}
      <SectionCard
        title="Product Positioning"
        description="How the AI frames your product in every piece of content it generates."
        section="positioning"
        expanded={expandedSections.has('positioning')}
        onToggle={toggleSection}
      >
        <div className="space-y-4">
          <Field
            label="One-sentence description"
            hint="What does the product do?"
            value={kb.positioning.oneLiner}
            onChange={v => setKb(prev => ({ ...prev, positioning: { ...prev.positioning, oneLiner: v } }))}
          />
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">
              Three benefits in customer language
            </label>
            <p className="text-xs text-[var(--color-ink-muted)] mb-2">Not features — outcomes the customer gets.</p>
            <div className="space-y-2">
              {[0, 1, 2].map(i => (
                <input
                  key={i}
                  type="text"
                  value={kb.positioning.benefits[i] ?? ''}
                  onChange={e => {
                    const benefits = [...kb.positioning.benefits] as [string, string, string]
                    benefits[i] = e.target.value
                    setKb(prev => ({ ...prev, positioning: { ...prev.positioning, benefits } }))
                  }}
                  placeholder={`Benefit ${i + 1}`}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-edge-focus)]"
                />
              ))}
            </div>
          </div>
          <Field
            label="Primary competitor or alternative"
            hint="What is the customer currently using?"
            value={kb.positioning.competitor}
            onChange={v => setKb(prev => ({ ...prev, positioning: { ...prev.positioning, competitor: v } }))}
          />
          <Field
            label="Why should they switch?"
            value={kb.positioning.switchReason}
            onChange={v => setKb(prev => ({ ...prev, positioning: { ...prev.positioning, switchReason: v } }))}
          />
        </div>
      </SectionCard>

      {/* Tone Parameters */}
      <SectionCard
        title="Tone Parameters"
        description="Constrain the AI's writing style globally for this product."
        section="tone"
        expanded={expandedSections.has('tone')}
        onToggle={toggleSection}
      >
        <div className="space-y-4">
          {TONE_OPTIONS.map(opt => (
            <div key={opt.key} className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-ink-body)]">{opt.labelA} vs {opt.labelB}</span>
              <div className="flex rounded-lg border border-[var(--color-edge-outline)] overflow-hidden">
                <button
                  onClick={() => setKb(prev => ({ ...prev, tone: { ...prev.tone, [opt.key]: opt.valueA } }))}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    kb.tone[opt.key] === opt.valueA
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-[var(--color-surface)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  {opt.labelA}
                </button>
                <button
                  onClick={() => setKb(prev => ({ ...prev, tone: { ...prev.tone, [opt.key]: opt.valueB } }))}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    kb.tone[opt.key] === opt.valueB
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-[var(--color-surface)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  {opt.labelB}
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

/* ============================================================
   Sub-components
   ============================================================ */

function SectionCard({
  title,
  description,
  section,
  expanded,
  onToggle,
  count,
  target,
  children,
}: {
  title: string
  description: string
  section: Section
  expanded: boolean
  onToggle: (s: Section) => void
  count?: number
  target?: number
  children: React.ReactNode
}) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl overflow-hidden">
      <button
        onClick={() => onToggle(section)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--color-surface-hover)] transition-colors"
      >
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[var(--color-ink)]">{title}</h3>
            {count !== undefined && target !== undefined && (
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                count >= target ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-accent-light)] text-[var(--color-accent-text)]'
              }`}>
                {count}/{target}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{description}</p>
        </div>
        {expanded ? <ChevronDown size={16} className="text-[var(--color-ink-muted)]" /> : <ChevronRight size={16} className="text-[var(--color-ink-muted)]" />}
      </button>
      {expanded && (
        <div className="px-5 pb-5 border-t border-[var(--color-edge)]">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--color-ink)] mb-1">{label}</label>
      {hint && <p className="text-xs text-[var(--color-ink-muted)] mb-1.5">{hint}</p>}
      <textarea
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-edge-focus)] resize-none"
      />
    </div>
  )
}
