/**
 * Shared SMTP email client using MetaNet (Plesk) hosting.
 *
 * Required Supabase secrets:
 *   SMTP_HOST     — tertia.sui-inter.net
 *   SMTP_PORT     — 465 (implicit TLS)
 *   SMTP_USER     — noreply@distributionos.predivo.ch
 *   SMTP_PASS     — mailbox password
 *   SMTP_FROM     — "Distribution-OS <noreply@distributionos.predivo.ch>"
 */
import nodemailer from 'npm:nodemailer@6'
import { sendMailWithRetry } from './smtp-retry.ts'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

let _transporter: ReturnType<typeof nodemailer.createTransport> | null = null

function getTransporter() {
  if (_transporter) return _transporter

  const host = Deno.env.get('SMTP_HOST')
  const port = parseInt(Deno.env.get('SMTP_PORT') ?? '465', 10)
  const user = Deno.env.get('SMTP_USER')
  const pass = Deno.env.get('SMTP_PASS')

  if (!host || !user || !pass) {
    throw new Error('Missing SMTP configuration (SMTP_HOST, SMTP_USER, SMTP_PASS)')
  }

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    // rejectUnauthorized was FALSE here, which accepts any certificate and makes the connection
    // that carries sign-in and password-reset mail interceptable. It is now verified, with SNI so
    // the right certificate is presented - the same setting the fleet's other mail client uses.
    // Checked before flipping it rather than assumed: a verified TLS handshake to
    // tertia.sui-inter.net:465 succeeds, certificate *.sui-inter.net issued by Sectigo,
    // valid 2026-06-03 to 2026-12-18 (2026-09-02).
    tls: { rejectUnauthorized: true, servername: host },
    // Nodemailer's defaults are 2min to connect and 10min on the socket. An edge function is
    // killed long before either, so a hung SMTP connection burns the whole invocation and
    // surfaces as an unhandled "Connection timeout" - which is exactly what happened to the
    // fleet's other copy of this file on production (Sentry SIGNALSCORE-2, 2026-08-29). These
    // bounds are short enough that a stall fails inside the budget and can be RETRIED below.
    connectionTimeout: 15_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,
  })

  return _transporter
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<void> {
  const from = Deno.env.get('SMTP_FROM') ?? 'Distribution-OS <noreply@distributionos.predivo.ch>'
  const transporter = getTransporter()

  await sendMailWithRetry(transporter, {
    from,
    to,
    subject,
    html,
    text: text ?? html.replace(/<[^>]*>/g, ''),
  })
}
