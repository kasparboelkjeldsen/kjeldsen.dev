import { createHmac } from 'node:crypto'

/**
 * Turning a media path from the delivery API into something the CMS will actually serve.
 *
 * Shared because two callers need the identical answer: the /api/media route that proxies images
 * for the site, and the block-preview HTML rewrite, which has to point images at the CMS origin
 * because the backoffice renders the preview there.
 */
const MAX_DIMENSION = 2000

/**
 * The commands we are willing to sign, rebuilt rather than passed through.
 *
 * Signing whatever was asked for would hand the open resize endpoint straight back to the internet
 * and make the CMS's HMAC pointless. Values are re-emitted literally instead of via
 * `URLSearchParams`, because the signature covers the query string exactly as sent - percent-encoding
 * the comma in `rxy` would change the bytes ImageSharp hashes and every crop would 400.
 *
 * Returns null to reject, '' when there is nothing to process.
 */
export function processingCommands(query: URLSearchParams): string | null {
  const parts: string[] = []

  for (const [key, value] of query) {
    // A caller-supplied signature is never trusted; this module is the only thing that signs.
    if (key === 'hmac') continue

    if (key === 'width' || key === 'height') {
      const n = Number(value)
      if (!Number.isInteger(n) || n < 1 || n > MAX_DIMENSION) return null
    } else if (key === 'rxy') {
      const focal = value.split(',').map(Number)
      if (focal.length !== 2 || focal.some((n) => !Number.isFinite(n) || n < 0 || n > 1)) return null
    } else {
      return null
    }

    parts.push(`${key}=${value}`)
  }

  return parts.join('&')
}

/**
 * ImageSharp signs the lower-cased path and query, and takes the digest as lowercase hex. The
 * secret is the base64 value from config, decoded to bytes - not the base64 text itself.
 */
export function sign(path: string, commands: string): string {
  if (!commands) return ''

  const key = useRuntimeConfig().imageKey
  if (!key) return `?${commands}`

  const digest = createHmac('sha256', Buffer.from(key, 'base64'))
    .update(`${path}?${commands}`.toLowerCase())
    .digest('hex')

  return `?${commands}&hmac=${digest}`
}
