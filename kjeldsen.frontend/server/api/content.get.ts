import { getContentItemByPath20 } from '../delivery-api'
import { deliveryClient, isContentPath } from '../utils/delivery'
import { readVisitor, writeVisitor } from '../utils/engage/visitor'
import { visitorRequest } from '../utils/engage/request'
import { activeSegments } from '../utils/engage/segments'
import { settle, trackPageview } from '../utils/engage/track'
import type { EngageInfo } from '~~/types/engage'

/** How long a request may wait in total for Engage to register its pageview. */
const TRACKING_BUDGET_MS = 1500

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
 * This is also where Engage happens, because it is the one request every navigation makes, server
 * side or client side:
 *
 * 1. The visitor is read from the signed cookie.
 * 2. If the page varies by segment (most do not), Engage resolves which variant this visitor
 *    gets, and that alias is forced on the delivery call. A page that does not vary never asks.
 * 3. The pageview is registered - once, here, with the visitor's own browser and address - and a
 *    visitor with no cookie yet gets one from Engage's answer.
 *
 * A personalized response is marked private so no shared cache, Front Door included, ever holds
 * one visitor's variant for another.
 */
export default defineEventHandler(async (event) => {
  const path = String(getQuery(event).path ?? '').replace(/^\/+|\/+$/g, '')

  if (!isContentPath(path)) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  // A chrome fetch - the navigation reading the root document - is not a pageview and is never
  // personalized. It skips Engage entirely.
  const chrome = getQuery(event).chrome === '1'

  const visitorId = chrome ? null : readVisitor(event)
  const req = visitorRequest(event, path)

  // Tracking starts first and runs alongside everything below; it is waited for last, against a
  // budget measured from here, so a slow Engage costs the response nothing until the page itself
  // is ready. The segment lookup has to finish before the delivery call, which needs the alias.
  const started = Date.now()
  const tracking = chrome ? Promise.resolve(null) : trackPageview(req, visitorId)
  const segments = chrome
    ? { abTest: null, personalization: null, forced: null }
    : await activeSegments(path, visitorId, req)

  const { data, error, response } = await getContentItemByPath20({
    client: deliveryClient(),
    path: { path },
    headers: segments.forced ? { 'Forced-Segment': segments.forced } : undefined,
  })

  const tracked = await settle(tracking, started + TRACKING_BUDGET_MS)

  if (response?.status === 404) {
    throw createError({ statusCode: 404, statusMessage: 'Content not found' })
  }

  if (error || !data) {
    console.error(`[content] ${response?.status} for path "${path}"`, error)
    throw createError({ statusCode: 502, statusMessage: 'Failed to fetch content' })
  }

  if (tracked && tracked.visitorId !== visitorId) {
    writeVisitor(event, tracked.visitorId)
  }

  if (segments.forced) {
    setResponseHeader(event, 'Cache-Control', 'private, no-store')
  }

  if (chrome) return data

  const engage: EngageInfo = {
    pageviewId: tracked?.pageviewId ?? null,
    segment: segments.forced,
  }

  return { ...data, engage }
})
