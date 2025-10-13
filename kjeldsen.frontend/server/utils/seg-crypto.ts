import * as jose from 'jose'

// Derive a 32-byte key from DELIVERY_KEY using SHA-256 (cached)
let _keyPromise: Promise<Uint8Array> | null = null
async function getKey(): Promise<Uint8Array> {
  if (_keyPromise) return _keyPromise
  _keyPromise = (async () => {
    const base = process.env.DELIVERY_KEY || 'default-secret-change-me'
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(base))
    return new Uint8Array(hash)
  })()
  return _keyPromise
}

export async function encryptSeg(seg: string, ttlSec = 7 * 24 * 3600): Promise<string> {
  const key = await getKey()
  const now = Math.floor(Date.now() / 1000)
  const payload = { seg, exp: now + ttlSec }
  const plaintext = new TextEncoder().encode(JSON.stringify(payload))
  return new jose.CompactEncrypt(plaintext)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .encrypt(key)
}

export async function decryptSeg(tok?: string): Promise<string | null> {
  if (!tok) return null
  try {
    const key = await getKey()
    const { plaintext } = await jose.compactDecrypt(tok, key)
    const decoded = JSON.parse(new TextDecoder().decode(plaintext)) as {
      seg?: string
      exp?: number
    }
    if (!decoded.seg) return null
    const now = Math.floor(Date.now() / 1000)
    if (decoded.exp && decoded.exp < now) return null
    return decoded.seg
  } catch {
    return null
  }
}

export function sanitizeSegment(seg?: string | null): string {
  if (!seg) return 'anon'
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(seg)) return 'anon'
  return seg
}
