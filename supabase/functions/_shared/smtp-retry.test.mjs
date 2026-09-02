/**
 * Manual test for _shared/smtp-retry.ts — the guard against the failure that hit the fleet's
 * other copy of this mail client (Sentry SIGNALSCORE-2, "Connection timeout", production
 * 2026-08-29). This repo's vitest suite covers app/src only and cannot import a Deno module.
 *
 *   node --experimental-strip-types supabase/functions/_shared/smtp-retry.test.mjs
 */
const { sendMailWithRetry, isRetryableSmtpError, RETRYABLE_SMTP_CODES } =
  await import('./smtp-retry.ts')

let pass = 0, fail = 0
const check = (name, cond) => { cond ? (pass++, console.log('  ok   ' + name)) : (fail++, console.log('  FAIL ' + name)) }
const noSleep = async () => {}
const msg = { from: 'a@b.c', to: 'd@e.f', subject: 's', html: '<p>h</p>' }

/** The exact value Sentry recorded. nodemailer raises it with no `code` on some paths. */
const CONNECTION_TIMEOUT = new Error('Connection timeout')

check('matches the production failure by message alone', isRetryableSmtpError(CONNECTION_TIMEOUT))
check('matches every connection-stage code',
  RETRYABLE_SMTP_CODES.every((code) => isRetryableSmtpError(Object.assign(new Error('x'), { code }))))
check('does NOT retry a rejected login - it would fail identically forever',
  !isRetryableSmtpError(Object.assign(new Error('Invalid login'), { code: 'EAUTH' })))
check('does NOT retry a rejected recipient',
  !isRetryableSmtpError(Object.assign(new Error('no such user'), { code: 'EENVELOPE' })))
check('does NOT retry ESOCKET - it can fire after the server took the message, so a retry could double-send',
  !isRetryableSmtpError(Object.assign(new Error('socket hang up'), { code: 'ESOCKET' })))
check('survives a non-Error throw', !isRetryableSmtpError(null) && isRetryableSmtpError('Connection timeout'))

// DEFECT INJECTION: without a retry, one stall ends the whole auth-email request.
{
  let calls = 0
  const sendMail = async () => { calls++; throw CONNECTION_TIMEOUT }
  let threw = false
  try { await sendMail(msg) } catch { threw = true }
  check('DEFECT: one stall ends the request outright', threw && calls === 1)
}

{
  let calls = 0
  const sendMail = async () => { if (++calls === 1) throw CONNECTION_TIMEOUT; return { messageId: 'ok' } }
  await sendMailWithRetry({ sendMail }, msg, { sleep: noSleep })
  check('rides out a single connection timeout and delivers', calls === 2)
}

{
  let calls = 0
  const sendMail = async () => { calls++; throw CONNECTION_TIMEOUT }
  let threw = false
  try { await sendMailWithRetry({ sendMail }, msg, { attempts: 2, sleep: noSleep }) } catch { threw = true }
  check('a mail host that is genuinely down still surfaces the error', threw)
  check('and it stopped after the attempt budget', calls === 3)
}

{
  let calls = 0
  const eauth = Object.assign(new Error('Invalid login'), { code: 'EAUTH' })
  const sendMail = async () => { calls++; throw eauth }
  let threw = false
  try { await sendMailWithRetry({ sendMail }, msg, { sleep: noSleep }) } catch { threw = true }
  check('a bad password is thrown on the first attempt, never retried', threw && calls === 1)
}

{
  let calls = 0, slept = 0
  const sendMail = async () => { calls++; return { messageId: 'ok' } }
  await sendMailWithRetry({ sendMail }, msg, { sleep: async () => { slept++ } })
  check('a clean send is not retried and not delayed', calls === 1 && slept === 0)
}

{
  const waits = []
  let calls = 0
  const sendMail = async () => { if (++calls <= 2) throw CONNECTION_TIMEOUT; return { messageId: 'ok' } }
  await sendMailWithRetry({ sendMail }, msg, { sleep: async (ms) => { waits.push(ms) } })
  check('backs off longer on each retry', JSON.stringify(waits) === JSON.stringify([1000, 2000]))
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
