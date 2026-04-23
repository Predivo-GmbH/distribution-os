import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IntelligencePanel } from '../IntelligencePanel'

describe('IntelligencePanel', () => {
  it('renders title text', () => {
    render(
      <IntelligencePanel id="test" title="Test Title">
        <p>Content</p>
      </IntelligencePanel>
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('shows children content when expanded (default)', () => {
    render(
      <IntelligencePanel id="test" title="Title">
        <p>Panel content</p>
      </IntelligencePanel>
    )
    expect(screen.getByText('Panel content')).toBeInTheDocument()
  })

  it('collapses on click', async () => {
    const user = userEvent.setup()
    render(
      <IntelligencePanel id="toggle-test" title="Collapsible">
        <p>Hidden content</p>
      </IntelligencePanel>
    )
    // Click to collapse
    await user.click(screen.getByText('Collapsible'))
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument()
  })

  it('expands again on second click', async () => {
    const user = userEvent.setup()
    render(
      <IntelligencePanel id="toggle-test-2" title="Collapsible">
        <p>Show me</p>
      </IntelligencePanel>
    )
    // Collapse
    await user.click(screen.getByText('Collapsible'))
    expect(screen.queryByText('Show me')).not.toBeInTheDocument()
    // Expand again
    await user.click(screen.getByText('Collapsible'))
    expect(screen.getByText('Show me')).toBeInTheDocument()
  })

  it('persists collapsed state to localStorage', async () => {
    const user = userEvent.setup()
    render(
      <IntelligencePanel id="persist-test" title="Persist">
        <p>Content</p>
      </IntelligencePanel>
    )
    await user.click(screen.getByText('Persist'))
    expect(localStorage.setItem).toHaveBeenCalledWith('dos-panels-persist-test', 'collapsed')
  })
})
