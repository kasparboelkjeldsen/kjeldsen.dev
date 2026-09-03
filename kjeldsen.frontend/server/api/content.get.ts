import { getContentItemByPath20 } from '../delivery-api'
import { deliveryClient, isContentPath } from '../utils/delivery'
import { cached } from '../utils/cache/store'
import { sendJson } from '../utils/compress'
import { highlightContent } from '../utils/highlight'
import { readVisitor } from '../utils/engage/visitor'
import { visitorRequest } from '../utils/engage/request'
import { activeSegments } from '../utils/engage/segments'
import type { EngageInfo } from '~~/types/engage'
import type { PageContent } from '~~/types/content'

/**
 * Server-side proxy for a single content item, addressed by `?path=`.
 *
 * The delivery key stays on the server; the browser only ever talks to this route.
 *
 * The path is a query parameter rather than a catch-all segment on purpose. A catch-all
 * (`/api/content/[...slug]`) does not match the *root* request `/api/content/`, and an unmatched
 * `/api/**` request falls through to the SSR renderer rather than 404ing - which turns "fetch the
 * home page" into a render that fetches itself, recursively, until the worker runs out of memory.
 * A query parameter has no empty-segment case.
 *
 * The delivery payload comes from the query cache (server/utils/cache/store.ts), keyed on path
 * and segment and dropped when the CMS purges one of the keys the payload lists. A miss costs the
 * hop to Umbraco; a 404 is thrown from the loader and therefore never cached.
 *
 * Personalization happens here too: if the page varies by segment (most do not) and the visitor
 * is known from the signed cookie, Engage resolves which variant applies and that alias is forced
 * on the delivery call. A personalized response is marked private so no shared cache, Front Door
 * included, ever holds one visitor's variant for another.
 *
 * Pageview registration is deliberately not here: the browser does it after the page has
 * rendered (server/api/engage/pageview.post.ts), so nothing about the page waits on Engage.
 */
export default defineEventHandler(async (event) => {
  const path = String(getQuery(event).path ?? '').replace(/^\/+|\/+$/g, '')

  if (!isContentPath(path)) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  // A chrome fetch - the navigation reading the root document - is never personalized.
  const chrome = getQuery(event).chrome === '1'

  const segments = chrome
    ? { abTest: null, personalization: null, forced: null }
    : await activeSegments(path, readVisitor(event), visitorRequest(event, path))

  const data = await cached(`item:${path}:${segments.forced ?? ''}`, async () => {
    const { data, error, response } = await getContentItemByPath20({
      client: deliveryClient(),
      path: { path },
      headers: segments.forced ? { 'Forced-Segment': segments.forced } : undefined,
    })

    if (response?.status === 404) {
      throw createError({ statusCode: 404, statusMessage: 'Content not found' })
    }

    if (error || !data) {
      console.error(`[content] ${response?.status} for path "${path}"`, error)
      throw createError({ statusCode: 502, statusMessage: 'Failed to fetch content' })
    }

    // Code blocks are highlighted here, once per cache fill, so the browser gets coloured spans
    // and never a highlighter.
    return { value: await highlightContent(data), keys: cacheKeysOf(data, path) }
  })

  if (segments.forced) {
    setResponseHeader(event, 'Cache-Control', 'private, no-store')
  }

  if (chrome) return sendJson(event, data)

  const engage: EngageInfo = { pageviewId: null, segment: segments.forced }
  return sendJson(event, { ...data, engage })
})

/**
 * What a payload depends on: the keys the CMS put on it (its own document and everything it
 * references), plus the path, so a purge can also address a page by where it lives.
 */
export function cacheKeysOf(content: PageContent, path: string): string[] {
  const props = content.properties as { cacheKeys?: string[] | null } | null
  return [...(props?.cacheKeys ?? []), `content-${content.id}`, `path:/${path}`]
}
