import { useState } from 'react'
import type { AppState, UserPreferences } from '@/types'
import type { Action } from '@/hooks/useAppState'
import { IntelligencePanel } from '@/components/shared/IntelligencePanel'
import { ProductsTab } from './ProductsTab'
import { TasksTab } from './TasksTab'
import { MetricsTab } from './MetricsTab'
import { GeneralTab } from './GeneralTab'
import { KnowledgeBaseTab } from './KnowledgeBaseTab'
import { AIConfigTab } from './AIConfigTab'
import { APP_NAME } from '@/lib/app-config'
import { PageMeta } from '@/components/shared/PageMeta'
import { SchedulerTab } from './SchedulerTab'
import { IntegrationsTab } from './IntegrationsTab'

interface Props {
  state: AppState
  dispatch: React.Dispatch<Action>
  prefs: UserPreferences
  onDarkModeChange: (on: boolean) => void
  onWeekStartChange: (day: UserPreferences['weekStartDay']) => void
}

type Tab = 'products' | 'knowledge-base' | 'ai-config' | 'integrations' | 'scheduler' | 'tasks' | 'metrics' | 'general'

const TABS: { id: Tab; label: string }[] = [
  { id: 'products', label: 'Products' },
  { id: 'knowledge-base', label: 'Knowledge Base' },
  { id: 'ai-config', label: 'AI Configuration' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'scheduler', label: 'Scheduler' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'general', label: 'General' },
]

export function Settings({ state, dispatch, prefs, onDarkModeChange, onWeekStartChange }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('products')

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageMeta title={`Settings — ${APP_NAME}`} noindex />
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)] tracking-tight">Settings</h1>

      {/* Tab bar */}
      <div className="border-b border-[var(--color-edge)] overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0" style={{ maskImage: 'linear-gradient(to right, black 90%, transparent)' }}>
        <div role="tablist" aria-label="Settings sections" className="flex gap-4 md:gap-6 min-w-max">
          {TABS.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`settings-tabpanel-${tab.id}`}
              id={`settings-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 pt-2 min-h-[44px] text-sm font-medium transition-colors relative whitespace-nowrap ${
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
        </div>
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
      {activeTab === 'products' && <div role="tabpanel" id="settings-tabpanel-products" aria-labelledby="settings-tab-products"><ProductsTab state={state} dispatch={dispatch} /></div>}
      {activeTab === 'knowledge-base' && <div role="tabpanel" id="settings-tabpanel-knowledge-base" aria-labelledby="settings-tab-knowledge-base"><KnowledgeBaseTab state={state} /></div>}
      {activeTab === 'ai-config' && <div role="tabpanel" id="settings-tabpanel-ai-config" aria-labelledby="settings-tab-ai-config"><AIConfigTab /></div>}
      {activeTab === 'integrations' && <div role="tabpanel" id="settings-tabpanel-integrations" aria-labelledby="settings-tab-integrations"><IntegrationsTab /></div>}
      {activeTab === 'scheduler' && <div role="tabpanel" id="settings-tabpanel-scheduler" aria-labelledby="settings-tab-scheduler"><SchedulerTab /></div>}
      {activeTab === 'tasks' && <div role="tabpanel" id="settings-tabpanel-tasks" aria-labelledby="settings-tab-tasks"><TasksTab /></div>}
      {activeTab === 'metrics' && <div role="tabpanel" id="settings-tabpanel-metrics" aria-labelledby="settings-tab-metrics"><MetricsTab state={state} /></div>}
      {activeTab === 'general' && (
        <div role="tabpanel" id="settings-tabpanel-general" aria-labelledby="settings-tab-general">
          <GeneralTab
            state={state}
            dispatch={dispatch}
            prefs={prefs}
            onDarkModeChange={onDarkModeChange}
            onWeekStartChange={onWeekStartChange}
          />
        </div>
      )}
    </div>
  )
}
