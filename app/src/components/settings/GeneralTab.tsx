import type { AppState } from '@/types'
import type { Action } from '@/hooks/useAppState'
import type { UserPreferences } from '@/types'
import { exportState } from '@/lib/storage'

interface Props {
  state: AppState
  dispatch: React.Dispatch<Action>
  prefs: UserPreferences
  onDarkModeChange: (on: boolean) => void
  onWeekStartChange: (day: UserPreferences['weekStartDay']) => void
}

export function GeneralTab({ state, dispatch, prefs, onDarkModeChange, onWeekStartChange }: Props) {
  function handleExport() {
    const json = exportState(state)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `distribution-os-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleReset() {
    if (confirm('Are you sure you want to reset all data? This will permanently delete all products, tasks, and history. This action cannot be undone.')) {
      dispatch({ type: 'RESET_STATE' })
    }
  }

  return (
    <div className="space-y-8">
      {/* Appearance */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-5">
        <h3 className="text-base font-semibold text-[var(--color-ink)] mb-4">Appearance</h3>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-[var(--color-ink)]">Dark Mode</p>
            <p className="text-xs text-[var(--color-ink-muted)]">Switch between light and dark interface themes</p>
          </div>
          <button
            onClick={() => onDarkModeChange(!prefs.darkMode)}
            role="switch"
            aria-checked={prefs.darkMode}
            aria-label="Dark Mode"
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              prefs.darkMode ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-edge-outline)]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                prefs.darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-2 mt-2">
          <div>
            <p className="text-sm font-medium text-[var(--color-ink)]">Week Starts On</p>
            <p className="text-xs text-[var(--color-ink-muted)]">Choose which day your distribution week begins</p>
          </div>
          <select
            value={prefs.weekStartDay}
            onChange={e => onWeekStartChange(e.target.value as UserPreferences['weekStartDay'])}
            className="px-3 py-1.5 rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-edge-focus)]"
          >
            <option value="monday">Monday</option>
            <option value="sunday">Sunday</option>
            <option value="saturday">Saturday</option>
          </select>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-5">
        <h3 className="text-base font-semibold text-[var(--color-ink)] mb-4">Data Management</h3>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-[var(--color-ink)]">Export Data</p>
            <p className="text-xs text-[var(--color-ink-muted)]">Download all your products, tasks, and history as JSON</p>
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-lg border border-[var(--color-edge)] text-sm font-medium text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            Export
          </button>
        </div>

        <div className="flex items-center justify-between py-2 mt-2">
          <div>
            <p className="text-sm font-medium text-[var(--color-ink)]">Reset All Data</p>
            <p className="text-xs text-[var(--color-ink-muted)]">Permanently delete all products and task history</p>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg bg-[var(--color-error)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Reset
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-5">
        <h3 className="text-base font-semibold text-[var(--color-ink)] mb-2">About</h3>
        <p className="text-sm text-[var(--color-ink-body)]">
          Distribution OS v1.0.0 — Built by Prodiva GmbH
        </p>
        <p className="text-xs text-[var(--color-ink-muted)] mt-1">
          Local-first. No account required. Data stays in your browser.
        </p>
      </div>
    </div>
  )
}
