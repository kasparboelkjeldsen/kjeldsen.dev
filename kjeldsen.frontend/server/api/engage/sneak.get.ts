import { parse } from 'cookie'
import { normalizeAnalyticsUrl, serializeHeaders } from '../../utils/middleware/engageRules'

const VISITOR_COOKIE = 'engage_visitor'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const targetPath = query.path as string

  // Use existing setup from runtime config
  const config = useRuntimeConfig()
  const deliveryKey = config.deliveryKey
  let cmsHost = (config.public.cmsHost || '').replace(/\/$/, '')
  if (cmsHost && !/^https?:\/\//i.test(cmsHost)) cmsHost = `https://${cmsHost}`

  if (!cmsHost) {
    // If no CMS host, we can't check segmentation
    return { segmented: false }
  }

  const req = event.node.req
  const rawCookie = req.headers.cookie || ''
  const cookies = rawCookie ? parse(rawCookie) : {}
  const visitorId = cookies[VISITOR_COOKIE] || ''

  // Reconstruct the full expected URL for the target path
  // We use the current request's host/proto to simulate the visitor navigating there
  const host = req.headers.host || ''
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https'

  // Ensure targetPath starts with / if not empty
  const safePath = targetPath.startsWith('/') ? targetPath : `/${targetPath}`
  let fullUrl = `${proto}://${host}${safePath}`

  // Reuse normalization logic to match what middleware sends
  fullUrl = normalizeAnalyticsUrl(fullUrl, config)

  // Remote client address
  const forwardedFor = req.headers['x-forwarded-for']
  const forwardedIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(',')[0]?.trim()
  const remoteClientAddress = forwardedIp || req.socket?.remoteAddress || '0.0.0.0'

  const userAgent = (req.headers['user-agent'] as string) || 'nuxt-app'

  // Prepare the sneaky payload
  const payload = {
    externalVisitorId: visitorId,
    url: fullUrl,
    referrerUrl: req.headers.referer || '',
    headers: serializeHeaders({
      'X-Original-Url': fullUrl,
      'X-Referrer': req.headers.referer || '',
      'X-Browser-UserAgent': userAgent,
      'User-Agent': userAgent,
      'X-Remote-Client-Address': remoteClientAddress,
    }),
    remoteClientAddress,
    browserUserAgent: userAgent,
  }

  try {
    const checkUrl = `${cmsHost}/umbraco/engageextensions/pageview/sneaky-segment-check`

    const res = await fetch(checkUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': deliveryKey || '',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      // If the check fails, assume no segmentation to avoid breaking UX
      return { segmented: false }
    }

    // backend returns a string (the segment alias)
    const segmentAlias = await res.text()

    // Logic: if we get a segment back that isn't empty, 'default', or 'anon',
    // it counts as a specific segmentation for this page.
    const isSegmented =
      segmentAlias &&
      segmentAlias !== 'null' &&
      segmentAlias !== 'default' &&
      segmentAlias !== 'anon'

    return {
      segmented: !!isSegmented,
      debugParams:
        process.env.NODE_ENV === 'development' ? { segmentAlias, targetPath } : undefined,
    }
  } catch (e) {
    console.error('[SneakySeg] Check failed', e)
    return { segmented: false }
  }
})
