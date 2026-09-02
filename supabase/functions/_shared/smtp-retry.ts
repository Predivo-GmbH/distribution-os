/**
 * Retry for TRANSIENT mail-transport failures. Deliberately dependency-free (no remote import,
 * no nodemailer type) so it can be unit-tested with plain node — emailClient.ts itself imports
 * `npm:nodemailer@6` and cannot be.
 *
 * WHY IT EXISTS. This is the fleet's second copy of the same mail client. The first one,
 * SignalScore's, threw an unhandled "Connection timeout" on production on 2026-08-29 22:05
 * (Sentry SIGNALSCORE-2): nothing was wrong with the mail host or the credentials, a single SMTP
 * connection stalled, nodemailer gave up, and the whole auth-email request 500'd on one bad
 * second. There was no retry and no timeout bound anywhere on that path — nodemailer's own
 * defaults are two minutes to connect and ten on the socket, which an edge function never lives
 * long enough to reach, so a stall burned the entire invocation instead of failing fast.
 *
 * This product had the identical defect and had simply not hit it yet. It sends auth email
 * (`send-auth-email`), so the failure would land on a real person trying to sign in.
 * Copied from `signalscore/supabase/functions/_shared/smtp-retry.ts` (commit e3e01e5).
 */

/**
 * SMTP failures worth trying again — and only those.
 *
 * Every code below is raised BEFORE the message body is handed over, so a retry cannot send the
 * same email twice. `ESOCKET` is deliberately absent: it can fire mid-stream, after the server
 * has already taken the DATA, and retrying that risks a duplicate. `EAUTH` and `EENVELOPE` are
 * absent because they mean the credentials or the address are wrong — the next attempt fails
 * identically and the caller must see it.
 */
export const RETRYABLE_SMTP_CODES = ['ETIMEDOUT', 'ECONNECTION', 'ECONNRESET', 'ECONNREFUSED', 'EDNS']

/** The same class when it arrives only as a message, which is how Sentry recorded it. */
export const RETRYABLE_SMTP_MESSAGE =
  /connection timeout|greeting never received|connection closed|connect etimedout|econnrefused|getaddrinfo/i

export function isRetryableSmtpError(err: unknown): boolean {
  const code = (err as { code?: unknown } | null)?.code
  if (typeof code === 'string' && RETRYABLE_SMTP_CODES.includes(code)) return true
  const msg = err instanceof Error ? err.message : String(err)
  return RETRYABLE_SMTP_MESSAGE.test(msg)
}

export const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export interface MailSender {
  sendMail: (message: Record<string, unknown>) => Promise<unknown>
}

/**
 * Send over SMTP, retrying a connection-stage failure with backoff. A mail host that is genuinely
 * down fails every attempt and the error still reaches the caller unchanged — nothing is
 * swallowed, and every absorbed blip is printed to the function log.
 */
export async function sendMailWithRetry(
  transporter: MailSender,
  message: Record<string, unknown>,
  opts: { attempts?: number; sleep?: (ms: number) => Promise<void> } = {},
): Promise<void> {
  const attempts = opts.attempts ?? 2
  const wait = opts.sleep ?? defaultSleep
  for (let n = 0; ; n++) {
    try {
      await transporter.sendMail(message)
      return
    } catch (err) {
      if (n >= attempts || !isRetryableSmtpError(err)) throw err
      const why = err instanceof Error ? err.message : String(err)
      console.log(`[smtp-retry] attempt ${n + 1}/${attempts} after "${why}"`)
      await wait((n + 1) * 1000)
    }
  }
}
