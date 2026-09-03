import { postAnalyticsPageviewTrackpageviewServer } from '../../engage-api'
import { engageClient, engageEnabled, engageRefused } from './client'
import type { VisitorRequest } from './request'

export interface TrackedPageview {
  visitorId: string
  pageviewId: string
}

/**
 * Registers one pageview with Engage, server to server.
 *
 * This is the only call that creates a pageview, and it is made exactly once per navigation from
 * the content route. Engage answers with the visitor id - minted when none was sent - and the
 * pageview id the client uses to attach engagement data later.
 *
 * Bounded by a deadline: analytics must never hold a page. Past it the pageview may still land
 * (the request is not aborted) but the response goes out without a pageview id.
 */
export async function trackPageview(
  req: VisitorRequest,
  visitorId: string | null,
  deadlineMs = 500
): Promise<TrackedPageview | null> {
  if (!engageEnabled()) return null

  const call = postAnalyticsPageviewTrackpageviewServer({
    client: engageClient(),
    headers: visitorId ? { 'External-Visitor-Id': visitorId } : undefined,
    body: {
      url: req.url,
      referrerUrl: req.referrer,
      browserUserAgent: req.userAgent,
      remoteClientAddress: req.ip,
      // Engage parses this as key=value pairs and reads the visitor's language from it.
      headers: `Accept-Language=${encodeURIComponent(req.acceptLanguage)}`,
      userIdentifier: '',
    },
  })
    .then(({ data, error, response }) => {
      if (response?.status === 402) {
        engageRefused()
        return null
      }
      if (error || !data?.externalVisitorId || !data.pageviewId) {
        console.warn('[engage] pageview not registered', response?.status, error)
        return null
      }
      return { visitorId: data.externalVisitorId, pageviewId: data.pageviewId }
    })
    .catch((e) => {
      console.warn('[engage] pageview error', e)
      return null
    })

  const deadline = new Promise<null>((resolve) => setTimeout(() => resolve(null), deadlineMs))
  return Promise.race([call, deadline])
}
