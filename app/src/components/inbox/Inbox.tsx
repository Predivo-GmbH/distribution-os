import { useState, useMemo } from 'react'
import { Inbox as InboxIcon, Check, Pencil, RefreshCw, X, ChevronDown, ChevronRight, Filter } from 'lucide-react'
import type { AppState, InboxArtifact, ArtifactStatus, Engine } from '@/types'
import { ENGINE_META, WORKER_LABELS } from '@/types'
import { loadInbox, updateArtifactStatus, updateArtifact, removeArtifact } from '@/lib/storage'

interface Props {
  state: AppState
}

type FilterStatus = 'all' | ArtifactStatus

const STATUS_LABELS: Record<ArtifactStatus, { label: string; color: string; bg: string }> = {
  pending:      { label: 'Pending Review', color: 'var(--color-warning)',  bg: 'var(--color-warning-bg)' },
  approved:     { label: 'Approved',       color: 'var(--color-success)',  bg: 'var(--color-success)/10' },
  scheduled:    { label: 'Scheduled',      color: 'var(--color-accent)',   bg: 'var(--color-accent-light)' },
  published:    { label: 'Published',      color: 'var(--color-success)',  bg: 'var(--color-success)/10' },
  regenerating: { label: 'Regenerating',   color: 'var(--color-accent)',   bg: 'var(--color-accent-light)' },
  dismissed:    { label: 'Dismissed',      color: 'var(--color-ink-muted)', bg: 'var(--color-surface-hover)' },
}

export function Inbox({ state }: Props) {
  const [artifacts, setArtifacts] = useState<InboxArtifact[]>(() => loadInbox())
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [productFilter, setProductFilter] = useState<string>('all')
  const [engineFilter, setEngineFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [directionNote, setDirectionNote] = useState('')
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)

  function refresh() {
    setArtifacts(loadInbox())
  }

  // Filtered artifacts
  const filtered = useMemo(() => {
    return artifacts.filter(a => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false
      if (productFilter !== 'all' && a.productId !== productFilter) return false
      if (engineFilter !== 'all' && a.engine !== engineFilter) return false
      return true
    })
  }, [artifacts, statusFilter, productFilter, engineFilter])

  // Group by product, then engine
  const grouped = useMemo(() => {
    const map = new Map<string, Map<Engine, InboxArtifact[]>>()
    for (const a of filtered) {
      if (!map.has(a.productId)) map.set(a.productId, new Map())
      const engineMap = map.get(a.productId)!
      if (!engineMap.has(a.engine)) engineMap.set(a.engine, [])
      engineMap.get(a.engine)!.push(a)
    }
    return map
  }, [filtered])

  const pendingCount = artifacts.filter(a => a.status === 'pending').length

  function handleApprove(id: string) {
    updateArtifactStatus(id, 'approved')
    refresh()
  }

  function handleEditApprove(id: string) {
    updateArtifact(id, { editedContent: editContent, status: 'approved', approvedAt: new Date().toISOString() })
    setEditingId(null)
    setEditContent('')
    refresh()
  }

  function handleRegenerate(id: string) {
    updateArtifact(id, { status: 'regenerating', directionNote: directionNote || undefined })
    setRegeneratingId(null)
    setDirectionNote('')
    refresh()
  }

  function handleDismiss(id: string) {
    updateArtifactStatus(id, 'dismissed')
    refresh()
  }

  function handleDelete(id: string) {
    removeArtifact(id)
    refresh()
  }

  function getProductName(productId: string) {
    return state.products.find(p => p.id === productId)?.name ?? 'Unknown Product'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)] tracking-tight">Inbox</h1>
          <p className="text-[var(--color-ink-body)] mt-1">
            {pendingCount > 0
              ? `${pendingCount} item${pendingCount !== 1 ? 's' : ''} pending review`
              : 'All caught up — no items pending review'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="p-2 rounded-lg border border-[var(--color-edge)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)]">
          <Filter size={12} />
          Filter:
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as FilterStatus)}
          className="px-2.5 py-1.5 rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-edge-focus)]"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="regenerating">Regenerating</option>
          <option value="dismissed">Dismissed</option>
        </select>

        <select
          value={productFilter}
          onChange={e => setProductFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-edge-focus)]"
        >
          <option value="all">All products</option>
          {state.products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={engineFilter}
          onChange={e => setEngineFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-edge-focus)]"
        >
          <option value="all">All engines</option>
          {Object.entries(ENGINE_META).map(([key, meta]) => (
            <option key={key} value={key}>{meta.label}</option>
          ))}
        </select>

        {(statusFilter !== 'all' || productFilter !== 'all' || engineFilter !== 'all') && (
          <button
            onClick={() => { setStatusFilter('all'); setProductFilter('all'); setEngineFilter('all') }}
            className="text-xs text-[var(--color-accent-text)] hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <InboxIcon size={40} className="mx-auto mb-3 text-[var(--color-ink-muted)] opacity-40" />
          <p className="text-sm text-[var(--color-ink-muted)]">
            {artifacts.length === 0
              ? 'No artifacts yet. AI workers will generate content here once configured.'
              : 'No artifacts match your current filters.'}
          </p>
        </div>
      )}

      {/* Grouped artifact list */}
      {Array.from(grouped.entries()).map(([productId, engineMap]) => (
        <div key={productId} className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">{getProductName(productId)}</h2>

          {Array.from(engineMap.entries()).map(([engine, items]) => (
            <div key={engine} className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ENGINE_META[engine].color }} />
                <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--color-ink-muted)]">
                  {ENGINE_META[engine].label} Engine
                </span>
                <span className="text-xs text-[var(--color-ink-muted)]">({items.length})</span>
              </div>

              {items.map(artifact => {
                const isExpanded = expandedId === artifact.id
                const isEditing = editingId === artifact.id
                const isRegenerating = regeneratingId === artifact.id
                const statusInfo = STATUS_LABELS[artifact.status]

                return (
                  <div
                    key={artifact.id}
                    className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl overflow-hidden"
                  >
                    {/* Artifact header */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : artifact.id)}
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-[var(--color-surface-hover)] transition-colors"
                    >
                      {isExpanded
                        ? <ChevronDown size={14} className="text-[var(--color-ink-muted)] shrink-0" />
                        : <ChevronRight size={14} className="text-[var(--color-ink-muted)] shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[var(--color-ink)] truncate">
                            {WORKER_LABELS[artifact.workerType]}
                          </span>
                          <span
                            className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: statusInfo.color, backgroundColor: statusInfo.bg }}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-ink-muted)] mt-0.5 truncate">
                          {artifact.taskTitle} — {new Date(artifact.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </button>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="border-t border-[var(--color-edge)] p-4 space-y-4">
                        {/* Content display */}
                        {!isEditing ? (
                          <div className="bg-[var(--color-surface-hover)] rounded-lg p-4">
                            <p className="text-sm text-[var(--color-ink-body)] whitespace-pre-wrap">
                              {artifact.editedContent || artifact.content}
                            </p>
                            {artifact.editedContent && (
                              <p className="text-[10px] text-[var(--color-ink-muted)] mt-2 italic">Edited before approval</p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <textarea
                              value={editContent}
                              onChange={e => setEditContent(e.target.value)}
                              rows={10}
                              className="w-full px-3 py-2 rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-edge-focus)] resize-y"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditApprove(artifact.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] text-sm font-medium hover:bg-[var(--color-btn-primary-hover)] transition-colors"
                              >
                                <Check size={14} /> Approve Edit
                              </button>
                              <button
                                onClick={() => { setEditingId(null); setEditContent('') }}
                                className="px-3 py-1.5 rounded-lg border border-[var(--color-edge)] text-sm text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Regenerate direction note */}
                        {isRegenerating && (
                          <div className="space-y-2">
                            <textarea
                              value={directionNote}
                              onChange={e => setDirectionNote(e.target.value)}
                              placeholder="Optional: give the AI a direction for the new version..."
                              rows={3}
                              className="w-full px-3 py-2 rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-edge-focus)] resize-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRegenerate(artifact.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                              >
                                <RefreshCw size={14} /> Regenerate
                              </button>
                              <button
                                onClick={() => { setRegeneratingId(null); setDirectionNote('') }}
                                className="px-3 py-1.5 rounded-lg border border-[var(--color-edge)] text-sm text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Actions — only show for pending artifacts */}
                        {artifact.status === 'pending' && !isEditing && !isRegenerating && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleApprove(artifact.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] text-sm font-medium hover:bg-[var(--color-btn-primary-hover)] transition-colors"
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => { setEditingId(artifact.id); setEditContent(artifact.content) }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-edge)] text-sm font-medium text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
                            >
                              <Pencil size={14} /> Edit + Approve
                            </button>
                            <button
                              onClick={() => setRegeneratingId(artifact.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-edge)] text-sm font-medium text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
                            >
                              <RefreshCw size={14} /> Regenerate
                            </button>
                            <button
                              onClick={() => handleDismiss(artifact.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-bg)] transition-colors"
                            >
                              <X size={14} /> Dismiss
                            </button>
                          </div>
                        )}

                        {/* Delete for non-pending */}
                        {artifact.status !== 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(artifact.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-bg)] transition-colors"
                            >
                              <X size={14} /> Remove
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
