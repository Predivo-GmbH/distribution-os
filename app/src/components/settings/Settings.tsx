import { useState } from 'react'
import type { AppState, UserPreferences } from '@/types'
import type { Action } from '@/hooks/useAppState'
import { IntelligencePanel } from '@/components/shared/IntelligencePanel'
import { ProductsTab } from './ProductsTab'
import { TasksTab } from './TasksTab'
import { MetricsTab } from './MetricsTab'
import { GeneralTab } from './GeneralTab'

interface Props {
  state: AppState
  dispatch: React.Dispatch<Action>
  prefs: UserPreferences
  onDarkModeChange: (on: boolean) => void
  onWeekStartChange: (day: UserPreferences['weekStartDay']) => void
}

type Tab = 'products' | 'tasks' | 'metrics' | 'general'

const TABS: { id: Tab; label: string }[] = [
  { id: 'products', label: 'Products' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'general', label: 'General' },
]

export function Settings({ state, dispatch, prefs, onDarkModeChange, onWeekStartChange }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('products')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--color-ink)] tracking-tight">Settings</h1>

      {/* Tab bar */}
      <div className="border-b border-[var(--color-edge)]">
        <nav className="flex gap-6">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-[var(--color-accent-text)]'
                  : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink-body)]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)]" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Intelligence Panel — only on Products tab */}
      {activeTab === 'products' && (
        <IntelligencePanel id="settings-help" title="Setting up a product">
          <div className="space-y-2">
            <p><strong>Name & Description</strong> — identify what SaaS you're distributing. Each product gets its own weekly task set.</p>
            <p><strong>Stage</strong> — determines which tasks are relevant. Pre-Launch focuses on outreach; Scaling focuses on compounding channels.</p>
            <p><strong>Primary Engine</strong> — your main distribution channel. Most of your weekly tasks will come from this engine.</p>
            <p><strong>Secondary Engines</strong> — additional channels that diversify your distribution mix. They generate fewer tasks but keep your strategy balanced.</p>
          </div>
        </IntelligencePanel>
      )}

      {/* Tab content */}
      {activeTab === 'products' && <ProductsTab state={state} dispatch={dispatch} />}
      {activeTab === 'tasks' && <TasksTab />}
      {activeTab === 'metrics' && <MetricsTab state={state} />}
      {activeTab === 'general' && (
        <GeneralTab
          state={state}
          dispatch={dispatch}
          prefs={prefs}
          onDarkModeChange={onDarkModeChange}
          onWeekStartChange={onWeekStartChange}
        />
      )}
    </div>
  )
}
