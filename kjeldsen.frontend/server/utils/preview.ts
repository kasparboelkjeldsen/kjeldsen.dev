import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * The preview pass: proof that a request for draft content came through the CMS's preview button.
 *
 * Kraftvaerk.Umbraco.Headless.Preview opens this site in an iframe in the backoffice with a
 * one-time secret that only a logged-in editor can have minted; server/api/init-preview.get.ts
 * trades it with the CMS and, if the CMS agrees, hands out one of these. It travels in the URL
 * (`/preview/<id>?t=<pass>`) rather than a cookie because the preview lives in a cross-site
 * iframe, where browsers are dropping third-party cookies.
 *
 * `<expiry>.<signature>`, signed with the delivery key over the document id and the expiry, so a
 * pass opens one document for an hour and cannot be forged or moved to another document.
 */
const TTL_MS = 60 * 60 * 1000

export function previewPass(id: string, now = Date.now()): string {
  const expires = now + TTL_MS
  return `${expires}.${signature(id, expires)}`
}

export function isValidPreviewPass(id: string, pass: string, now = Date.now()): boolean {
  const [expiresText, sent] = pass.split('.')
  const expires = Number(expiresText)
  if (!sent || !Number.isInteger(expires) || expires < now || expires > now + TTL_MS) return false

  const expected = Buffer.from(signature(id, expires))
  const given = Buffer.from(sent)
  return expected.length === given.length && timingSafeEqual(expected, given)
}

function signature(id: string, expires: number): string {
  const key = useRuntimeConfig().deliveryKey
  if (!key) throw new Error('DELIVERY_KEY is not configured')
  return createHmac('sha256', key).update(`preview:${id.toLowerCase()}:${expires}`).digest('base64url')
}

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isGuid(value: unknown): value is string {
  return typeof value === 'string' && GUID.test(value)
}
