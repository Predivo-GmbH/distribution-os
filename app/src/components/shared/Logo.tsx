interface LogoProps {
  size?: number
}

export function Logo({ size = 32 }: LogoProps) {
  // Scale bar dimensions proportionally from the base 32px size
  const scale = size / 32
  const barH = Math.round(4 * scale)
  const gap = Math.round(3 * scale)
  const radius = Math.round(2 * scale)

  return (
    <div
      className="rounded-lg bg-[var(--color-accent)] flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div className="flex flex-col items-end" style={{ gap }}>
        <div style={{ width: Math.round(11 * scale), height: barH, borderRadius: radius }} className="bg-[var(--color-ink-inverted)]" />
        <div style={{ width: Math.round(17 * scale), height: barH, borderRadius: radius }} className="bg-[var(--color-ink-inverted)]/80" />
        <div style={{ width: Math.round(22 * scale), height: barH, borderRadius: radius }} className="bg-[var(--color-ink-inverted)]/60" />
      </div>
    </div>
  )
}
