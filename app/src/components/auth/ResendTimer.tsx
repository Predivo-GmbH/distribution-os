import { useState, useEffect, useCallback } from 'react'

interface ResendTimerProps {
  onResend: () => Promise<void>
  cooldownSeconds?: number
}

export default function ResendTimer({ onResend, cooldownSeconds = 60 }: ResendTimerProps) {
  const [seconds, setSeconds] = useState(cooldownSeconds)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (seconds <= 0) return
    const timer = setInterval(() => setSeconds((s) => s - 1), 1000)
    return () => clearInterval(timer)
  }, [seconds])

  const handleResend = useCallback(async () => {
    setSending(true)
    try {
      await onResend()
      setSeconds(cooldownSeconds)
    } finally {
      setSending(false)
    }
  }, [onResend, cooldownSeconds])

  if (seconds > 0) {
    return (
      <p className="text-center text-sm text-slate-500">
        Resend code in{' '}
        <span className="font-medium text-slate-400">{seconds}s</span>
      </p>
    )
  }

  return (
    <button
      onClick={handleResend}
      disabled={sending}
      className="mx-auto block min-h-[44px] text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300 disabled:opacity-50"
    >
      {sending ? 'Sending...' : 'Resend code'}
    </button>
  )
}
