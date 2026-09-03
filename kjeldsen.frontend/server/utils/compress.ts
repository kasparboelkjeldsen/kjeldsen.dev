import { brotliCompressSync, constants, gzipSync } from 'node:zlib'
import type { H3Event } from 'h3'

/**
 * Sends a JSON body compressed when the client can take it.
 *
 * Front Door only compresses what it caches, and the API routes are deliberately uncached, so a
 * 40 KB content payload went over the wire as 40 KB. Brotli at a low quality level is a few
 * milliseconds for that size and roughly a fifth of the bytes.
 *
 * Only for requests that actually carry an Accept-Encoding - a browser navigating client side.
 * The server-side render's internal call to the same route arrives without one and gets plain
 * JSON, so it never has to decode anything.
 */
const MIN_BYTES = 1024

export function sendJson(event: H3Event, data: unknown): Buffer | unknown {
  const json = JSON.stringify(data)
  const accept = getHeader(event, 'accept-encoding') ?? ''
  setResponseHeader(event, 'Content-Type', 'application/json; charset=utf-8')

  if (json.length < MIN_BYTES || !accept) return data

  appendResponseHeader(event, 'Vary', 'Accept-Encoding')

  if (/\bbr\b/.test(accept)) {
    setResponseHeader(event, 'Content-Encoding', 'br')
    return brotliCompressSync(json, { params: { [constants.BROTLI_PARAM_QUALITY]: 4 } })
  }
  if (/\bgzip\b/.test(accept)) {
    setResponseHeader(event, 'Content-Encoding', 'gzip')
    return gzipSync(json, { level: 6 })
  }
  return data
}
