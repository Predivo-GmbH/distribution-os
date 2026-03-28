import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const inputBase =
  'w-full px-3 py-2.5 min-h-[44px] rounded-lg border border-[var(--color-edge-outline)] bg-[var(--color-surface)] text-base md:text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-edge-focus)] focus:ring-2 focus:ring-[var(--color-edge-focus)]/25'

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(inputBase, className)} {...props} />
  ),
)
Input.displayName = 'Input'

export { Input }
