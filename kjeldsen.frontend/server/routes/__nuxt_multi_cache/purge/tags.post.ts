import { timingSafeEqual } from 'node:crypto'
import { purge } from '../../../utils/cache/store'
import { invalidateSegmentMap } from '../../../utils/engage/segment-map'

/**
 * Purge by cache key, called by the CMS on publish, unpublish and move to the recycle bin
 * (kjeldsen.backend/code/notifications/ContentSaved/).
 *
 * The path and header are the ones V1's nuxt-multi-cache exposed and the backend has called ever
 * since; keeping them means no backend configuration changed. The token is the delivery API key,
 * which the backend sets as `Nuxt:ApiKey` from the same Key Vault secret this app holds as
 * DELIVERY_KEY.
 *
 * Body: a JSON array of cache keys, e.g. ["content-<guid>", ...].
 */
const HEADER = 'x-nuxt-multi-cache-token'

export default defineEventHandler(async (event) => {
  if (!authorised(getHeader(event, HEADER))) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<unknown>(event)
  const keys = Array.isArray(body) ? body.filter((k): k is string => typeof k === 'string') : []
  if (!keys.length) {
    throw createError({ statusCode: 400, statusMessage: 'Expected a JSON array of cache keys' })
  }

  // Listings go with every purge (see content-children.ts): the container's key is not on the
  // children it lists, and a new or removed child changes the listing without touching it.
  const dropped = purge([...keys, 'children:*'])
  // Which pages vary by segment is content configuration too; cheap to refetch, so refetch.
  invalidateSegmentMap()

  console.info(`[cache] purged ${dropped} entries for ${keys.length} keys`)
  return { status: 'ok', keys: keys.length, dropped }
})

function authorised(sent: string | undefined): boolean {
  const expected = useRuntimeConfig().deliveryKey
  if (!expected || !sent) return false
  const a = Buffer.from(sent)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}
