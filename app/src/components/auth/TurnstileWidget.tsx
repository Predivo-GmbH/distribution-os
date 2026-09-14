import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react'

// Cloudflare Turnstile site keys are meant to be public (safe to ship in the client bundle) — but
// this product does not have one minted yet: the fleet holds no Cloudflare API token, so no key
// can be created for Distribution-OS right now. Read it from the environment rather than
// hardcoding one. When it is absent, this widget renders NOTHING and the token stays undefined,
// which keeps every auth call that would carry it an outage-safe no-op — exactly the state today,
// before a site key exists AND before CAPTCHA is enabled server-side (a separate, Roger-only
// production switch; see the PR this file shipped in).
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

interface TurnstileApi {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string
  reset: (id?: string) => void
  remove: (id: string) => void
}
declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

export interface TurnstileHandle {
  reset: () => void
}

interface TurnstileWidgetProps {
  /** Called with a token on success, or null on load/expire/error. */
  onToken: (token: string | null) => void
}

/**
 * Cloudflare Turnstile widget (Managed mode — mostly invisible for legit users).
 * Produces a single-use token; call reset() after each use (success or failure) to get a fresh
 * one for the next submit.
 *
 * Renders nothing, and never loads the Cloudflare script, when VITE_TURNSTILE_SITE_KEY is unset.
 */
const TurnstileWidget = forwardRef<TurnstileHandle, TurnstileWidgetProps>(({ onToken }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current)
        } catch {
          /* widget already gone — ignore */
        }
        onToken(null)
      }
    },
  }), [onToken])

  useEffect(() => {
    if (!SITE_KEY) return
    let cancelled = false

    function renderWidget() {
      if (cancelled || !window.turnstile || !containerRef.current || widgetIdRef.current) return
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => onToken(token),
        'error-callback': () => onToken(null),
        'expired-callback': () => onToken(null),
      })
    }

    if (window.turnstile) {
      renderWidget()
    } else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
      if (!script) {
        script = document.createElement('script')
        script.src = SCRIPT_SRC
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }
      script.addEventListener('load', renderWidget)
    }

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          /* ignore */
        }
        widgetIdRef.current = null
      }
    }
  }, [onToken])

  // No site key minted for this product yet — render nothing (see module comment above).
  if (!SITE_KEY) return null

  // overflow-x-auto: the Turnstile iframe is a fixed 300px; on narrow phones it would otherwise
  // push the page wider than the viewport (mirrors ReplyFlow's TurnstileWidget, audit v10 Med #22).
  return <div ref={containerRef} className="min-h-[65px] overflow-x-auto" />
})

TurnstileWidget.displayName = 'TurnstileWidget'
export default TurnstileWidget
