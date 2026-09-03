import { createClient, createConfig } from '../delivery-api/client'
import type { Client } from '../delivery-api/client'

/**
 * The delivery API client, configured once per server process.
 *
 * On Umbraco 18 the API key is an OpenAPI *security scheme* (`ApiKeyAuth`, header `Api-Key`)
 * rather than a per-operation parameter, so it is supplied through `auth` here instead of being
 * passed to every call. The generated SDK attaches it to each request.
 */
let cached: Client | null = null

export function deliveryClient(): Client {
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
 * The CMS origin, normalised.
 *
 * Exported because the delivery API is not the only thing addressed against it - media is proxied
 * through this frontend too, so that route needs the same host resolved the same way.
 */
export function cmsBaseUrl(): string {
  const trimmed = (useRuntimeConfig().public.cmsHost || '').replace(/\/$/, '')
  if (!trimmed) throw new Error('CMSHOST is not configured')
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

/**
 * Paths containing a dot are static-asset requests that leaked into the catch-all route.
 * Rejecting them here keeps them off the CMS entirely.
 */
export function isContentPath(path: string): boolean {
  return !path.includes('.')
}
