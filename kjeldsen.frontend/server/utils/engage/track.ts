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
 * Returns the promise without waiting on it. The content route starts this first, fetches the
 * page while it runs, and only then waits for it against a budget (see `settle`), so tracking
 * overlaps the content fetch rather than delaying it. Behind Front Door the call has been measured
 * at over a second on a cold backend.
 */
export function trackPageview(req: VisitorRequest, visitorId: string | null): Promise<TrackedPageview | null> {
  if (!engageEnabled()) return Promise.resolve(null)

  return postAnalyticsPageviewTrackpageviewServer({
    client: engageClient(),
    headers: visitorId ? { 'External-Visitor-Id': visitorId } : undefined,
    body: {
      url: req.url,
      referrerUrl: req.referrer,
      browserUserAgent: req.userAgent,
      remoteClientAddress: req.ip,
      // No `headers` string, on purpose. Engage's headless request wrapper clears every header
      // on the underlying request when one is supplied - Host included - and the site's own
      // register controller (which the backend rewrites this call to) then reads the Umbraco
      // context and dies on the missing host. The visitor's language is lost to the pageview;
      // the pageview is not.
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
}

/**
 * Waits for a tracking call, but only until `deadline` (a `Date.now()` value). Past it the
 * response goes out without a pageview id; the registration itself still completes in the
 * background, so the visit is not lost, only the client-side engagement data for it.
 */
export function settle<T>(call: Promise<T | null>, deadline: number): Promise<T | null> {
  const remaining = deadline - Date.now()
  if (remaining <= 0) return Promise.resolve(null)
  const timer = new Promise<null>((resolve) => setTimeout(() => resolve(null), remaining))
  return Promise.race([call, timer])
}
