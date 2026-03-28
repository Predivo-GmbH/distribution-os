/** Accessible loading spinner for Suspense fallbacks and loading states. */
export function LoadingSpinner({ fullPage = false }: { fullPage?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center ${fullPage ? 'min-h-dvh bg-[var(--color-bg)]' : 'flex-1'}`}
      role="status"
    >
      <div
        className="h-6 w-6 rounded-full border-2 border-[var(--color-edge)] border-t-[var(--color-accent)] animate-spin"
        aria-hidden="true"
      />
      <span className="sr-only">Loading...</span>
    </div>
  )
}
