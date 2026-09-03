import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

/**
 * The visitor's Engage identity, carried in a first-party cookie.
 *
 * Engage only accepts an `External-Visitor-Id` it has seen before, and it is the id that every
 * pageview, segment match and profile keys off. It is minted by Engage on the first tracked
 * pageview and kept here for a year.
 *
 * Signed, not encrypted: a forged id could at most impersonate another visitor's segment, which
 * only reveals published variant content. The signature stops casual tampering and keeps garbage
 * out of Engage; V1 went further with JWE and it bought nothing this does not.
 */
const COOKIE = 'kd_visitor'
const MAX_AGE = 365 * 24 * 60 * 60

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function secret(): Buffer {
  // Derived from the delivery key so there is no second secret to manage; the delivery key never
  // leaves the server either.
  return createHmac('sha256', 'kjeldsen.dev/visitor').update(useRuntimeConfig().deliveryKey ?? '').digest()
}

function sign(id: string): string {
  return createHmac('sha256', secret()).update(id.toLowerCase()).digest('base64url')
}

/** The visitor id from the request cookie, or null when absent, malformed or wrongly signed. */
export function readVisitor(event: H3Event): string | null {
  const raw = getCookie(event, COOKIE)
  if (!raw) return null

  const [id, signature] = raw.split('.')
  if (!id || !signature || !GUID.test(id)) return null

  const expected = Buffer.from(sign(id))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null

  return id.toLowerCase()
}

export function writeVisitor(event: H3Event, id: string): void {
  setCookie(event, COOKIE, `${id.toLowerCase()}.${sign(id)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    maxAge: MAX_AGE,
  })
}
