import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hasSession, isPaidTier, rememberIntendedPlan, startCheckout } from '@/lib/billing'

interface Props {
  tierName: string
  label: string
  className: string
}

/**
 * Pricing-card CTA. Free → /signup. Paid tier → Stripe Checkout when a session
 * exists; otherwise the chosen tier is remembered and checkout resumes right
 * after signup (see AuthenticatedApp).
 */
export function TierCtaButton({ tierName, label, className }: Props) {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  async function handleClick() {
    const tier = tierName.toLowerCase()
    if (!isPaidTier(tier)) {
      navigate('/signup')
      return
    }
    setBusy(true)
    setFailed(false)
    try {
      if (await hasSession()) {
        window.location.assign(await startCheckout(tier))
      } else {
        rememberIntendedPlan(tier)
        navigate('/signup')
      }
    } catch {
      setFailed(true)
      setBusy(false)
    }
  }

  return (
    <>
      <button type="button" onClick={handleClick} disabled={busy} className={className}>
        {busy ? 'Redirecting…' : label}
      </button>
      {failed && (
        <p className="text-red-400 text-xs -mt-4 mb-4 text-center" role="alert">
          Checkout failed — try again, or upgrade later from Settings.
        </p>
      )}
    </>
  )
}
