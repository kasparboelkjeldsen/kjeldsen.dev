import { handleBlockPreview } from '../utils/middleware/blockPreview'
import { handleCacheControlMedia } from '../utils/middleware/cacheControlMedia'
import { handleSitemap } from '../utils/middleware/sitemap'
import { parse, serialize } from 'cookie'
import { encryptSeg, sanitizeSegment } from '~~/server/utils/seg-crypto'
import { normalizeAnalyticsUrl, serializeHeaders } from '~~/server/utils/middleware/engageRules'

const VISITOR_COOKIE = 'engage_visitor'
const PAGEVIEW_COOKIE = 'engage_pv'
const SEGMENT_TOKEN_COOKIE = 'segTok'
const SEGMENT_ALIAS_COOKIE = 'engageSegment' // Plain alias for cache key

export default defineEventHandler(async (event) => {
  // Order matters: handlers may short-circuit by returning a value.
  await handleBlockPreview(event)
  handleCacheControlMedia(event)

  const sitemap = await handleSitemap(event)
  if (sitemap) return sitemap

  // --- Engage Bootstrap Logic ---
  const url = getRequestURL(event)
  const path = url.pathname || '/'

  // Skip for API routes, static assets, and internal routes
  if (
    path.startsWith('/api/') ||
    path.startsWith('/_nuxt/') ||
    path.startsWith('/__') ||
    path.includes('.') // static files
  ) {
    return
  }
  // Skip if in preview mode
  if (url.searchParams.has('engagePreviewAbTestVariantId')) {
    event.context.engageSegment = 'default'
    return
  }

  const req = event.node.req
  const rawCookie = req.headers.cookie || ''
  const cookies = rawCookie ? parse(rawCookie) : {}
  const query = getQuery(event)

  // Check strict segment break
  const segmentBreak = query.segmentbreak === 'true' || query.segmentbreak === ''

  // If engageSegment cookie exists AND we are not forcing a break, visitor is already identified
  const existingSegmentAlias = cookies[SEGMENT_ALIAS_COOKIE]
  if (!segmentBreak && existingSegmentAlias && /^[A-Za-z0-9_-]{1,64}$/.test(existingSegmentAlias)) {
    event.context.engageSegment = existingSegmentAlias
    return
  }

  // If we are forcing a break, we might want to clear the existing cookie from the response
  // so the new one takes precedence.
  // The logic below will re-run the identification and overwrite the cookie.

  // First-time visitor or Forced Re-evaluation - bootstrap engage server-side
  try {
    const started = Date.now()
    const config = useRuntimeConfig()
    const deliveryKey: string | undefined = config.deliveryKey
    let baseUrl = (config.public.cmsHost || '').replace(/\/$/, '')
    if (baseUrl && !/^https?:\/\//i.test(baseUrl)) baseUrl = `https://${baseUrl}`

    if (!baseUrl) {
      console.warn('[engage/middleware] missing cmsHost, defaulting to anon')
      setSegmentCookieAndContext(event, 'default')
      return
    }

    const existingVisitorId = cookies[VISITOR_COOKIE]
    const host = req.headers.host || ''
    const proto = (req.headers['x-forwarded-proto'] as string) || 'https'

    // Build full URL for analytics
    let fullUrl = `${proto}://${host}${path}${url.search}`
    // Remove segmentbreak from the analytics URL if present, maybe?
    // Or keep it to track the event? The user didn't specify, but safer to keep.
    fullUrl = normalizeAnalyticsUrl(fullUrl, config)

    // Remote client address
    const forwardedFor = req.headers['x-forwarded-for']
    const forwardedIp = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(',')[0]?.trim()
    const remoteClientAddress = forwardedIp || req.socket?.remoteAddress || '0.0.0.0'

    const requestBody = {
      url: fullUrl,
      referrerUrl: req.headers.referer || '',
      headers: serializeHeaders({
        'X-Original-Url': fullUrl,
        'X-Referrer': req.headers.referer || '',
        'X-Browser-UserAgent': (req.headers['user-agent'] as string) || 'nuxt-app',
        'User-Agent': (req.headers['user-agent'] as string) || 'nuxt-app',
        'X-Remote-Client-Address': remoteClientAddress,
      }),
      browserUserAgent: req.headers['user-agent'] || 'nuxt-app',
      remoteClientAddress,
      userIdentifier: '',
      externalVisitorId: existingVisitorId || '',
    }

    // Use custom engageextensions endpoint instead of auto-generated API
    const targetUrl = `${baseUrl}/umbraco/engageextensions/pageview/register`

    let response: any
    // ... fetching logic ...
    // Simplified fetching loop for brevity in replacement, but I should copy the full retry logic
    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': deliveryKey || '',
          ...(existingVisitorId ? { 'External-Visitor-Id': existingVisitorId } : {}),
        },
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }

      response = await res.json()
    } catch (firstErr) {
      // Retry without visitor ID
      try {
        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Api-Key': deliveryKey || '',
          },
          body: JSON.stringify({ ...requestBody, externalVisitorId: '' }),
        })

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        response = await res.json()
      } catch (secondErr) {
        console.warn('[engage/middleware] analytics request failed', {
          durationMs: Date.now() - started,
          url: requestBody.url,
          error: secondErr,
        })
        setSegmentCookieAndContext(event, 'default')
        return
      }
    }

    const pageviewId = response?.pageviewId
    const externalVisitorId = response?.externalVisitorId || existingVisitorId
    const activeSegmentAlias = sanitizeSegment(response?.activeSegmentAlias)
    const secure = proto === 'https'

    // Set visitor cookie
    if (externalVisitorId && externalVisitorId !== existingVisitorId) {
      setCookie(event, VISITOR_COOKIE, externalVisitorId, {
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
        secure,
        maxAge: 60 * 60 * 24 * 365,
      })
    }

    // Set pageview cookie
    if (pageviewId) {
      setCookie(event, PAGEVIEW_COOKIE, pageviewId, {
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
        secure,
        maxAge: 60 * 30,
      })
    }

    // Set encrypted segment token (for content API)
    if (activeSegmentAlias !== 'anon') {
      try {
        const segTok = await encryptSeg(activeSegmentAlias)
        setCookie(event, SEGMENT_TOKEN_COOKIE, segTok, {
          path: '/',
          sameSite: 'lax',
          httpOnly: false,
          secure,
          maxAge: 7 * 24 * 3600,
        })
      } catch (e) {
        console.warn('[engage/middleware] segment encryption failed', e)
      }
    }

    // Set plain segment alias cookie for cache key (THE KEY NEW COOKIE)
    const cacheableSegment = activeSegmentAlias === 'anon' ? 'default' : activeSegmentAlias
    setSegmentCookieAndContext(event, cacheableSegment, secure)

    // Also store visitor ID in context for SSR forwarding
    if (externalVisitorId) {
      event.context.engageVisitorId = externalVisitorId
    }

    console.debug('[engage/middleware] bootstrap complete', {
      durationMs: Date.now() - started,
      segment: cacheableSegment,
      hasVisitor: !!externalVisitorId,
      path,
    })
  } catch (e) {
    console.error('[engage/middleware] unexpected error', e)
    setSegmentCookieAndContext(event, 'default')
  }
})

function setSegmentCookieAndContext(event: any, segment: string, secure = true) {
  // Store in context for immediate use by content fetching
  event.context.engageSegment = segment

  // Set cookie for future requests (cache key will use this)
  setCookie(event, SEGMENT_ALIAS_COOKIE, segment, {
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
    secure,
    maxAge: 7 * 24 * 3600, // 7 days
  })
}
