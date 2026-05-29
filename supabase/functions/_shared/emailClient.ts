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
    tls: { rejectUnauthorized: false },
  })

  return _transporter
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<void> {
  const from = Deno.env.get('SMTP_FROM') ?? 'Distribution-OS <noreply@distributionos.predivo.ch>'
  const transporter = getTransporter()

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text: text ?? html.replace(/<[^>]*>/g, ''),
  })
}
