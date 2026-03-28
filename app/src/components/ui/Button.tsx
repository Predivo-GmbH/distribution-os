import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] hover:bg-[var(--color-btn-primary-hover)] active:scale-[0.98]',
        destructive:
          'bg-[var(--color-btn-destructive-bg)] text-[var(--color-btn-destructive-text)] hover:opacity-90 active:scale-[0.98]',
        ghost:
          'hover:bg-[var(--color-surface-raised)] text-[var(--color-ink-muted)]',
      },
      size: {
        sm: 'px-3 py-1.5',
        md: 'px-5 py-2',
        lg: 'px-6 py-2.5',
        full: 'w-full py-3',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

export { Button }
