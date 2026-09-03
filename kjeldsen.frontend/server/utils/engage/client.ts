import { createClient, createConfig } from '../../engage-api/client'
import type { Client } from '../../engage-api/client'
import { cmsBaseUrl } from '../delivery'

/**
 * The Engage headless API client, configured once per server process.
 *
 * Same arrangement as the delivery client: the API key is a security scheme on every operation and
 * is supplied through `auth`, and the base URL is the CMS. Engage's own endpoints and this site's
 * engageextensions endpoints share the document, so one client covers both.
 */
let cached: Client | null = null

export function engageClient(): Client {
  if (cached) return cached

  const key = useRuntimeConfig().deliveryKey

  cached = createClient(
    createConfig({
      baseUrl: cmsBaseUrl(),
      auth: () => key,
    })
  )

  return cached
}

/**
 * Whether Engage calls should be attempted at all.
 *
 * Off by configuration, or backed off after Engage answered 402: the licence does not cover this
 * host, so every further call would fail the same way for a while.
 */
let refusedUntil = 0

export function engageEnabled(): boolean {
  if (useRuntimeConfig().engage?.enabled === false) return false
  return Date.now() >= refusedUntil
}

/** Called on a 402: stop asking for ten minutes rather than on every request. */
export function engageRefused(): void {
  refusedUntil = Date.now() + 10 * 60 * 1000
}
