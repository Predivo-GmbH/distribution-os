/**
 * At-rest encryption for BYO API keys (Task C follow-up, 2026-07-30).
 * AES-256-GCM with a key from the BYOK_ENC_KEY edge secret (base64, 32 bytes).
 *
 * Stored format:  enc:v1:<ivBase64>.<ciphertext+tag Base64>
 * decryptSecret() passes through any value WITHOUT the enc:v1: prefix unchanged, so
 * legacy plaintext rows (written before this landed) keep working.
 */

const ENC_PREFIX = 'enc:v1:'

async function getKey(): Promise<CryptoKey> {
  const b64 = Deno.env.get('BYOK_ENC_KEY') || ''
  if (!b64) throw new Error('BYOK_ENC_KEY not set')
  const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
  if (raw.length !== 32) throw new Error('BYOK_ENC_KEY must decode to 32 bytes')
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}

function b64(bytes: Uint8Array): string {
  let s = ''
  for (const byte of bytes) s += String.fromCharCode(byte)
  return btoa(s)
}
function unb64(s: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
}

export function isEncrypted(v: string): boolean {
  return typeof v === 'string' && v.startsWith(ENC_PREFIX)
}

export async function encryptSecret(plain: string): Promise<string> {
  const key = await getKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plain)),
  )
  return `${ENC_PREFIX}${b64(iv)}.${b64(ct)}`
}

/** Decrypt an enc:v1: value; return any non-prefixed value unchanged (legacy plaintext). */
export async function decryptSecret(stored: string): Promise<string> {
  if (!isEncrypted(stored)) return stored
  const [ivB64, ctB64] = stored.slice(ENC_PREFIX.length).split('.')
  if (!ivB64 || !ctB64) throw new Error('malformed encrypted secret')
  const key = await getKey()
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(ivB64) }, key, unb64(ctB64))
  return new TextDecoder().decode(pt)
}
