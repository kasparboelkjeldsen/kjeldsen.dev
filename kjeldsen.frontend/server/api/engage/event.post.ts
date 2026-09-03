import { postAnalyticsPageeventTrackpageevent } from '../../engage-api'
import { engageClient, engageEnabled } from '../../utils/engage/client'
import { readVisitor } from '../../utils/engage/visitor'
import type { EngageEvent } from '~~/types/engage'

/**
 * One custom event, tracked immediately through Engage's own page event endpoint.
 *
 * The pageview id ties it to the page; the visitor id, from the cookie, lets Engage update the
 * visitor's in-memory profile straight away so a goal or score can affect the next page.
 */
const GUID = /^[0-9a-f-]{36}$/i

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<EngageEvent>>(event)

  if (!engageEnabled() || !body?.pageviewId || !GUID.test(body.pageviewId) || !body.category) {
    setResponseStatus(event, 204)
    return null
  }

  const visitorId = readVisitor(event)

  const { response, error } = await postAnalyticsPageeventTrackpageevent({
    client: engageClient(),
    headers: {
      'Pageview-Id': body.pageviewId,
      ...(visitorId ? { 'External-Visitor-Id': visitorId } : {}),
    },
    body: {
      category: String(body.category).slice(0, 200),
      action: body.action ? String(body.action).slice(0, 200) : undefined,
      label: body.label ? String(body.label).slice(0, 200) : undefined,
      timestamp: new Date().toISOString(),
    },
  })

  if (error) console.warn('[engage] event failed', response?.status, error)

  setResponseStatus(event, 204)
  return null
})
