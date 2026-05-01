"""Update ShipSolo email templates: correct subject format, deep links, OTP copyability."""
import urllib.request, json

ref = 'jxjpbmkgmuunpayqgbsx'
token = 'sbp_a41ca66c2e931965a241edb2e5ea19e5b249d283'

BRAND = '#6C5CE7'
FONT = "Segoe UI,-apple-system,BlinkMacSystemFont,Roboto,Helvetica Neue,Arial,sans-serif"
ICON = 'https://distributionos.predivo.ch/apple-touch-icon.png'
APP = 'ShipSolo'
COMPANY = 'Predivo GmbH'
SITE = 'https://distributionos.predivo.ch'

def layout(body):
    return ''.join([
        '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
        '<html xmlns="http://www.w3.org/1999/xhtml">',
        '<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>',
        '<body style="margin:0;padding:0;background-color:#f4f4f5;">',
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 16px;">',
        '<tr><td align="center">',
        '<table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">',
        '<tr>',
        '<td style="vertical-align:middle;padding-right:10px;">',
        '<img src="' + ICON + '" width="28" height="28" alt="' + APP + '" style="display:block;border-radius:6px;" />',
        '</td>',
        '<td style="vertical-align:middle;">',
        '<span style="font-family:' + FONT + ';font-size:20px;font-weight:700;color:' + BRAND + ';letter-spacing:-0.02em;">' + APP + '</span>',
        '</td>',
        '</tr></table>',
        '<table role="presentation" cellpadding="0" cellspacing="0" width="480" style="max-width:480px;width:100%;background-color:#ffffff;border:1px solid #e4e4e7;border-radius:12px;">',
        '<tr><td style="padding:36px 32px;font-family:' + FONT + ';">',
        body,
        '</td></tr></table>',
        '<table role="presentation" cellpadding="0" cellspacing="0" style="padding-top:24px;">',
        '<tr><td align="center" style="font-family:' + FONT + ';font-size:12px;color:#a1a1aa;">',
        '&copy; 2026 ' + COMPANY + ' &middot; ' + APP,
        '<br />',
        '<a href="' + SITE + '" style="color:' + BRAND + ';text-decoration:none;">distributionos.predivo.ch</a>',
        '</td></tr></table>',
        '</td></tr></table>',
        '</body></html>'
    ])

def button(text, href):
    return ''.join([
        '<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:24px auto 0;">',
        '<tr><td style="background-color:' + BRAND + ';border-radius:8px;mso-padding-alt:14px 40px;">',
        '<a href="' + href + '" target="_blank" style="display:inline-block;padding:14px 40px;font-family:' + FONT + ';font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;mso-line-height-rule:exactly;">',
        text,
        '</a></td></tr></table>'
    ])

def otp_box(valid_text):
    return ''.join([
        '<div style="margin:20px 0;padding:16px;background:#f5f5f5;border-radius:8px;text-align:center;">',
        '<p style="color:#3f3f46;margin:0 0 8px 0;font-size:13px;">Your verification code</p>',
        '<p style="font-size:32px;font-weight:700;color:#18181b;margin:0;font-family:Courier New,monospace;">{{ .Token }}</p>',
        '<p style="color:#a1a1aa;margin:8px 0 0 0;font-size:12px;">' + valid_text + '</p>',
        '</div>'
    ])

# --- Confirmation (new user signup via signInWithOtp) ---
confirmation = layout(''.join([
    '<h1 style="font-size:22px;font-weight:700;color:#18181b;margin:0 0 16px 0;">Confirm your signup</h1>',
    '<p style="font-size:15px;color:#3f3f46;line-height:1.6;margin:0 0 8px 0;">Enter this code to verify your email address and create your ' + APP + ' account.</p>',
    otp_box('Valid for 10 minutes'),
    button('Confirm Email', '{{ .ConfirmationURL }}'),
    '<p style="font-size:13px;color:#a1a1aa;margin:16px 0 0 0;">If you did not create an account, you can safely ignore this email.</p>'
]))

# --- Recovery ---
recovery = layout(''.join([
    '<h1 style="font-size:22px;font-weight:700;color:#18181b;margin:0 0 16px 0;">Reset your password</h1>',
    '<p style="font-size:15px;color:#3f3f46;line-height:1.6;margin:0 0 8px 0;">We received a request to reset the password for your ' + APP + ' account. Click the button below to set a new password.</p>',
    button('Reset Password', '{{ .ConfirmationURL }}'),
    '<p style="font-size:13px;color:#a1a1aa;margin:16px 0 0 0;">If you did not request this, you can safely ignore this email. Your password will not be changed.</p>'
]))

# --- Magic Link (existing user login via signInWithOtp) ---
magic_link = layout(''.join([
    '<h1 style="font-size:22px;font-weight:700;color:#18181b;margin:0 0 16px 0;">Sign in to ' + APP + '</h1>',
    '<p style="font-size:15px;color:#3f3f46;line-height:1.6;margin:0 0 8px 0;">Use the code below to sign in to your account, or click the button.</p>',
    otp_box('Valid for 10 minutes'),
    button('Sign In', '{{ .ConfirmationURL }}'),
    '<p style="font-size:13px;color:#a1a1aa;margin:16px 0 0 0;">If you did not request this, you can safely ignore this email.</p>'
]))

# --- Email Change ---
email_change = layout(''.join([
    '<h1 style="font-size:22px;font-weight:700;color:#18181b;margin:0 0 16px 0;">Confirm Email Change</h1>',
    '<p style="font-size:15px;color:#3f3f46;line-height:1.6;margin:0 0 8px 0;">You requested to change the email address on your ' + APP + ' account. Click the button below to confirm.</p>',
    button('Confirm Email Change', '{{ .ConfirmationURL }}'),
    '<p style="font-size:13px;color:#a1a1aa;margin:16px 0 0 0;">If you did not make this change, please contact support immediately.</p>'
]))

# --- Invite ---
invite = layout(''.join([
    '<h1 style="font-size:22px;font-weight:700;color:#18181b;margin:0 0 16px 0;">You have been invited to ' + APP + '</h1>',
    '<p style="font-size:15px;color:#3f3f46;line-height:1.6;margin:0 0 8px 0;">Click the button below to accept the invitation and set up your account.</p>',
    button('Accept Invitation', '{{ .ConfirmationURL }}'),
    '<p style="font-size:13px;color:#a1a1aa;margin:16px 0 0 0;">If you were not expecting this invitation, you can safely ignore this email.</p>'
]))

# --- Reauthentication ---
reauth = layout(''.join([
    '<h1 style="font-size:22px;font-weight:700;color:#18181b;margin:0 0 16px 0;">Confirm Reauthentication</h1>',
    '<p style="font-size:15px;color:#3f3f46;line-height:1.6;margin:0 0 8px 0;">Enter the code below to confirm your identity:</p>',
    otp_box('Enter this code in the app')
]))

payload = {
    "mailer_templates_confirmation_content": confirmation,
    "mailer_templates_recovery_content": recovery,
    "mailer_templates_magic_link_content": magic_link,
    "mailer_templates_email_change_content": email_change,
    "mailer_templates_invite_content": invite,
    "mailer_templates_reauthentication_content": reauth,
    # Correct subject format per playbook standard
    "mailer_subjects_confirmation": "{{ .Token }} is your ShipSolo verification code",
    "mailer_subjects_recovery": "Reset your ShipSolo password",
    "mailer_subjects_magic_link": "{{ .Token }} is your ShipSolo sign-in code",
    "mailer_subjects_email_change": "Confirm your new email address",
    "mailer_subjects_invite": "You have been invited to ShipSolo",
    "mailer_subjects_reauthentication": "{{ .Token }} is your ShipSolo verification code"
}

for k, v in payload.items():
    if 'content' in k:
        print(f'{k}: {len(v)} chars')
    else:
        print(f'{k}: {v}')

with open('scripts/templates-payload.json', 'w') as f:
    json.dump(payload, f)
print(f'\nPayload written: {len(json.dumps(payload))} bytes')
