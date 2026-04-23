import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { PageMeta } from '../PageMeta'

describe('PageMeta', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <HelmetProvider>
        <PageMeta title="Test Page" />
      </HelmetProvider>
    )
    expect(container).toBeInTheDocument()
  })

  it('accepts description prop', () => {
    const { container } = render(
      <HelmetProvider>
        <PageMeta title="Test" description="A test page" />
      </HelmetProvider>
    )
    expect(container).toBeInTheDocument()
  })

  it('accepts noindex prop', () => {
    const { container } = render(
      <HelmetProvider>
        <PageMeta title="Test" noindex />
      </HelmetProvider>
    )
    expect(container).toBeInTheDocument()
  })

  it('accepts canonical prop', () => {
    const { container } = render(
      <HelmetProvider>
        <PageMeta title="Test" canonical="https://example.com" />
      </HelmetProvider>
    )
    expect(container).toBeInTheDocument()
  })
})
