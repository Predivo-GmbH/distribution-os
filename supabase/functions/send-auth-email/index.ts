/**
 * Supabase Auth Email Hook — sends all auth emails (confirmation, recovery, OTP, etc.)
 * via MetaNet SMTP instead of Supabase's built-in mailer.
 *
 * Configured in Supabase Auth -> Hooks -> Send Email Hook
 * Must verify the webhook signature using SEND_EMAIL_HOOK_SECRET.
 */

import { sendEmail } from '../_shared/emailClient.ts'

const HOOK_SECRET = Deno.env.get('SEND_EMAIL_HOOK_SECRET')
if (!HOOK_SECRET) console.warn('SEND_EMAIL_HOOK_SECRET is not set — all webhook requests will be rejected')
const SITE_URL = Deno.env.get('APP_URL') ?? 'https://distributionos.predivo.ch'

// ─── Brand constants (email template standard)
const BRAND = '#6C5CE7'
const ACCENT = '#6C5CE7'
const FONT = "'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,'Helvetica Neue',Arial,sans-serif"
const ICON_URL = 'https://distributionos.predivo.ch/apple-touch-icon.png'
const APP_NAME = 'ShipSolo'
const COMPANY = 'Predivo GmbH'

interface AuthEmailPayload {
  user: {
    email: string
    user_metadata?: Record<string, unknown>
  }
  email_data: {
    token: string
    token_hash: string
    redirect_to: string
    email_action_type: string
    site_url: string
    token_new?: string
    token_hash_new?: string
  }
}

// ─── layout(body: string): string — full XHTML email wrapping body in card
function layout(body: string): string {
  return [
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
    '<html xmlns="http://www.w3.org/1999/xhtml">',
    '<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>',
    '<body style="margin:0;padding:0;background-color:#f4f4f5;">',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 16px;">',
    '<tr><td align="center">',
    // Logo
    '<table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">',
    '<tr>',
    '<td style="vertical-align:middle;padding-right:10px;">',
    '<img src="' + ICON_URL + '" width="28" height="28" alt="' + APP_NAME + '" style="display:block;border-radius:6px;" />',
    '</td>',
    '<td style="vertical-align:middle;">',
    '<span style="font-family:' + FONT + ';font-size:20px;font-weight:700;color:' + BRAND + ';letter-spacing:-0.02em;">' + APP_NAME + '</span>',
    '</td>',
    '</tr>',
    '</table>',
    // Card
    '<table role="presentation" cellpadding="0" cellspacing="0" width="480" style="max-width:480px;width:100%;background-color:#ffffff;border:1px solid #e4e4e7;border-radius:12px;">',
    '<tr><td style="padding:36px 32px;font-family:' + FONT + ';">',
    body,
    '</td></tr>',
    '</table>',
    // Footer
    '<table role="presentation" cellpadding="0" cellspacing="0" style="padding-top:24px;">',
    '<tr><td align="center" style="font-family:' + FONT + ';font-size:12px;color:#a1a1aa;">',
    '&copy; 2026 ' + COMPANY + ' &middot; ' + APP_NAME,
    '<br />',
    '<a href="' + SITE_URL + '" style="color:' + BRAND + ';text-decoration:none;">distributionos.predivo.ch</a>',
    '</td></tr>',
    '</table>',
    '</td></tr>',
    '</table>',
    '</body>',
    '</html>',
  ].join('\n')
}

// ─── button(text: string, href: string): string — Outlook-compatible centered CTA
function button(text: string, href: string): string {
  return [
    '<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:24px auto 0;">',
    '<tr><td style="background-color:' + ACCENT + ';border-radius:8px;mso-padding-alt:14px 40px;">',
    '<a href="' + href + '" target="_blank" style="display:inline-block;padding:14px 40px;font-family:' + FONT + ';font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;mso-line-height-rule:exactly;">',
    '<!--[if mso]>&nbsp;&nbsp;&nbsp;<![endif]-->',
    text,
    '<!--[if mso]>&nbsp;&nbsp;&nbsp;<![endif]-->',
    '</a>',
    '</td></tr>',
    '</table>',
  ].join('')
}

// Build the confirmation/action URL
function buildActionUrl(payload: AuthEmailPayload): string {
  const { token_hash, email_action_type, redirect_to } = payload.email_data
  const type = email_action_type === 'signup' ? 'signup' :
               email_action_type === 'recovery' ? 'recovery' :
               email_action_type === 'invite' ? 'invite' :
               email_action_type === 'magiclink' ? 'magiclink' :
               email_action_type === 'email_change' ? 'email_change' :
               email_action_type

  const redirectTo = redirect_to || SITE_URL
  return SITE_URL + '/auth/confirm?token_hash=' + token_hash + '&type=' + type + '&redirect_to=' + encodeURIComponent(redirectTo)
}

function getEmailContent(payload: AuthEmailPayload): { subject: string; html: string } {
  const { email_action_type, token } = payload.email_data
  const actionUrl = buildActionUrl(payload)

  switch (email_action_type) {
    case 'signup':
      return {
        subject: 'Confirm your ' + APP_NAME + ' account',
        html: layout([
          '<h1 style="font-size:22px;font-weight:700;color:#18181b;margin:0 0 16px 0;">Confirm your signup</h1>',
          '<p style="font-size:15px;color:#3f3f46;line-height:1.6;margin:0 0 8px 0;">Thanks for signing up for ' + APP_NAME + '. Use the code below to verify your email address:</p>',
          '<div style="margin:20px 0;padding:16px;background:#f5f5f5;border-radius:8px;text-align:center;">',
          '<p style="color:#3f3f46;margin:0 0 8px 0;font-size:13px;">Your verification code</p>',
          '<p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#18181b;margin:0;font-family:\'Courier New\',monospace;">' + token + '</p>',
          '<p style="color:#a1a1aa;margin:8px 0 0 0;font-size:12px;">Valid for 10 minutes</p>',
          '</div>',
          button('Confirm Email', actionUrl),
          '<p style="font-size:13px;color:#a1a1aa;margin:16px 0 0 0;">If you didn&rsquo;t create an account, you can safely ignore this email.</p>',
        ].join('\n')),
      }

    case 'recovery':
      return {
        subject: 'Reset your ' + APP_NAME + ' password',
        html: layout([
          '<h1 style="font-size:22px;font-weight:700;color:#18181b;margin:0 0 16px 0;">Reset your password</h1>',
          '<p style="font-size:15px;color:#3f3f46;line-height:1.6;margin:0 0 8px 0;">We received a request to reset the password for your ' + APP_NAME + ' account. Click the button below to set a new password.</p>',
          button('Reset Password', actionUrl),
          '<p style="font-size:13px;color:#a1a1aa;margin:16px 0 0 0;">If you didn&rsquo;t request this, you can safely ignore this email. Your password will not be changed.</p>',
        ].join('\n')),
      }

    case 'magiclink':
      return {
        subject: 'Your ' + APP_NAME + ' login code',
        html: layout([
          '<h1 style="font-size:22px;font-weight:700;color:#18181b;margin:0 0 16px 0;">Sign in to ' + APP_NAME + '</h1>',
          '<p style="font-size:15px;color:#3f3f46;line-height:1.6;margin:0 0 8px 0;">Use the code below to sign in to your account, or click the button.</p>',
          '<div style="margin:20px 0;padding:16px;background:#f5f5f5;border-radius:8px;text-align:center;">',
          '<p style="color:#3f3f46;margin:0 0 8px 0;font-size:13px;">Your verification code</p>',
          '<p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#18181b;margin:0;font-family:\'Courier New\',monospace;">' + token + '</p>',
          '<p style="color:#a1a1aa;margin:8px 0 0 0;font-size:12px;">Valid for 1 hour</p>',
          '</div>',
          button('Sign In', actionUrl),
          '<p style="font-size:13px;color:#a1a1aa;margin:16px 0 0 0;">If you didn&rsquo;t request this, you can safely ignore this email.</p>',
        ].join('\n')),
      }

    case 'email_change':
      return {
        subject: 'Confirm your new email address',
        html: layout([
          '<h1 style="font-size:22px;font-weight:700;color:#18181b;margin:0 0 16px 0;">Confirm Email Change</h1>',
          '<p style="font-size:15px;color:#3f3f46;line-height:1.6;margin:0 0 8px 0;">You requested to change the email address on your ' + APP_NAME + ' account. Click the button below to confirm.</p>',
          button('Confirm Email Change', actionUrl),
          '<p style="font-size:13px;color:#a1a1aa;margin:16px 0 0 0;">If you didn&rsquo;t make this change, please contact support immediately.</p>',
        ].join('\n')),
      }

    default:
      return {
        subject: APP_NAME + ': Action required',
        html: layout([
          '<h1 style="font-size:22px;font-weight:700;color:#18181b;margin:0 0 16px 0;">Action Required</h1>',
          '<p style="font-size:15px;color:#3f3f46;line-height:1.6;margin:0 0 8px 0;">Click the button below to complete your action. Your verification code is: <strong style="font-weight:600;color:#18181b;">' + token + '</strong></p>',
          button('Continue', actionUrl),
        ].join('\n')),
      }
  }
}

// Decode Standard Webhooks secret: "whsec_<base64>" or "v1,whsec_<base64>" → raw bytes
function decodeHookSecret(secret: string): Uint8Array {
  let b64 = secret
  if (b64.startsWith('v1,')) b64 = b64.slice(3)
  if (b64.startsWith('whsec_')) b64 = b64.slice(6)
  const raw = atob(b64)
  const bytes = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
  return bytes
}

// Verify the webhook signature (HMAC SHA-256, Standard Webhooks format)
async function verifySignature(payload: string, signature: string): Promise<boolean> {
  if (!HOOK_SECRET) {
    console.error('SEND_EMAIL_HOOK_SECRET not configured — rejecting request')
    return false
  }

  const secretBytes = decodeHookSecret(HOOK_SECRET)
  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  const expected = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')

  // Signature format from Supabase: "v1,<hex>"
  const provided = signature.replace('v1,', '')

  // Timing-safe comparison
  if (expected.length !== provided.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i)
  }
  return diff === 0
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405 })
  }

  const body = await req.text()

  // Verify webhook signature if secret is configured
  const signature = req.headers.get('x-supabase-webhook-signature') ?? ''
  if (HOOK_SECRET && !(await verifySignature(body, signature))) {
    console.error('Invalid webhook signature')
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 })
  }

  let payload: AuthEmailPayload
  try {
    payload = JSON.parse(body)
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const email = payload.user?.email
  if (!email) {
    return new Response(JSON.stringify({ error: 'No email in payload' }), { status: 400 })
  }

  try {
    const { subject, html } = getEmailContent(payload)
    await sendEmail({ to: email, subject, html })
    console.log('Auth email sent: ' + payload.email_data.email_action_type + ' -> ' + email)
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Failed to send auth email to ' + email + ':', (err as Error).message)
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
