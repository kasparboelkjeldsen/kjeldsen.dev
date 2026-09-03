import { readVisitor, writeVisitor } from '../../utils/engage/visitor'
import { visitorRequest } from '../../utils/engage/request'
import { trackPageview } from '../../utils/engage/track'

/**
 * Registers a pageview, called by the browser once a page has rendered.
 *
 * Off the render path on purpose. Registration goes through Front Door to the backend and takes
 * 150 to 400 ms; when the content route waited for it, that was most of a warm page's time to
 * first byte. Here it costs the page nothing: the plugin posts after hydration, the answer carries
 * the pageview id for the engagement batch, and a new visitor gets the cookie from this response.
 *
 * The visitor's real browser and address are what Engage sees - the browser made this request.
 * The page URL comes from the body because this route's own URL is not the page.
 */
const GUID = /^[0-9a-f-]{36}$/i

export default defineEventHandler(async (event) => {
  const body = await readBody<{ path?: string; referrer?: string }>(event)
  const path = String(body?.path ?? '/')
    .split('?')[0]!
    .replace(/^\/+|\/+$/g, '')

  const visitorId = readVisitor(event)
  const req = visitorRequest(event, path)
  // The plugin knows the previous page; the request's Referer is this page.
  if (typeof body?.referrer === 'string') req.referrer = body.referrer

  const tracked = await trackPageview(req, visitorId)

  if (tracked && tracked.visitorId !== visitorId && GUID.test(tracked.visitorId)) {
    writeVisitor(event, tracked.visitorId)
  }

  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return { pageviewId: tracked?.pageviewId ?? null }
})
