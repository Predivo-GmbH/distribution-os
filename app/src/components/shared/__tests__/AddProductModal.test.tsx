import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddProductModal } from '../AddProductModal'

describe('AddProductModal', () => {
  const mockDispatch = vi.fn()

  it('does not render when closed', () => {
    render(<AddProductModal open={false} onClose={() => {}} dispatch={mockDispatch} />)
    expect(screen.queryByText('Add New Product')).not.toBeInTheDocument()
  })

  it('renders Add New Product heading when open', () => {
    render(<AddProductModal open={true} onClose={() => {}} dispatch={mockDispatch} />)
    expect(screen.getByText('Add New Product')).toBeInTheDocument()
  })

  it('renders Edit Product heading when editing', () => {
    const product = {
      id: 'p1',
      name: 'TestProd',
      description: 'Desc',
      stage: 'early' as const,
      primaryEngine: 'pull' as const,
      secondaryEngines: [] as ('pull' | 'push' | 'bridge' | 'search' | 'equity' | 'persistence')[],
      color: '#000',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    }
    render(
      <AddProductModal open={true} onClose={() => {}} dispatch={mockDispatch} editProduct={product} />
    )
    expect(screen.getByText('Edit Product')).toBeInTheDocument()
  })

  it('has product name input', () => {
    render(<AddProductModal open={true} onClose={() => {}} dispatch={mockDispatch} />)
    expect(screen.getByPlaceholderText(/DistroKit/)).toBeInTheDocument()
  })

  it('has description input', () => {
    render(<AddProductModal open={true} onClose={() => {}} dispatch={mockDispatch} />)
    expect(screen.getByPlaceholderText(/Short description/)).toBeInTheDocument()
  })

  it('has revenue input', () => {
    render(<AddProductModal open={true} onClose={() => {}} dispatch={mockDispatch} />)
    expect(screen.getByPlaceholderText('e.g. 2500')).toBeInTheDocument()
  })

  it('displays 4 product stages', () => {
    render(<AddProductModal open={true} onClose={() => {}} dispatch={mockDispatch} />)
    expect(screen.getByText('Pre-Launch')).toBeInTheDocument()
    expect(screen.getByText('Early')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Scaling')).toBeInTheDocument()
  })

  it('displays all 6 engines', () => {
    render(<AddProductModal open={true} onClose={() => {}} dispatch={mockDispatch} />)
    expect(screen.getByText('Pull')).toBeInTheDocument()
    expect(screen.getByText('Push')).toBeInTheDocument()
    expect(screen.getByText('Bridge')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByText('Equity')).toBeInTheDocument()
    expect(screen.getByText('Persistence')).toBeInTheDocument()
  })

  it('has Cancel and Add Product buttons', () => {
    render(<AddProductModal open={true} onClose={() => {}} dispatch={mockDispatch} />)
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('+ Add Product')).toBeInTheDocument()
  })

  it('has close button with accessible label', () => {
    render(<AddProductModal open={true} onClose={() => {}} dispatch={mockDispatch} />)
    expect(screen.getByRole('button', { name: 'Close modal' })).toBeInTheDocument()
  })

  it('has dialog role with aria-modal', () => {
    render(<AddProductModal open={true} onClose={() => {}} dispatch={mockDispatch} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('disables submit when name is empty', () => {
    render(<AddProductModal open={true} onClose={() => {}} dispatch={mockDispatch} />)
    const submitBtn = screen.getByText('+ Add Product')
    expect(submitBtn).toBeDisabled()
  })

  it('calls onClose when Cancel clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<AddProductModal open={true} onClose={onClose} dispatch={mockDispatch} />)
    await user.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })
})
