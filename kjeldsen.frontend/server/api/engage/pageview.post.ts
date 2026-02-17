import { parse } from 'cookie'
import { encryptSeg, sanitizeSegment } from '~~/server/utils/seg-crypto'
import { normalizeAnalyticsUrl, serializeHeaders } from '../../utils/middleware/engageRules'

const VISITOR_COOKIE = 'engage_visitor'
const PAGEVIEW_COOKIE = 'engage_pv'
const SEGMENT_TOKEN_COOKIE = 'segTok'
const SEGMENT_ALIAS_COOKIE = 'engageSegment'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const path = body.path || '/'

  const config = useRuntimeConfig()
  const deliveryKey: string | undefined = config.deliveryKey
  let baseUrl = (config.public.cmsHost || '').replace(/\/$/, '')
  if (baseUrl && !/^https?:\/\//i.test(baseUrl)) baseUrl = `https://${baseUrl}`

  if (!baseUrl) {
    return { success: false, reason: 'no-cms-host' }
  }

  const req = event.node.req
  const rawCookie = req.headers.cookie || ''
  const cookies = rawCookie ? parse(rawCookie) : {}
  const existingVisitorId = cookies[VISITOR_COOKIE]

  const host = req.headers.host || ''
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https'

  // Reconstruct full URL
  let fullUrl = `${proto}://${host}${path}`
  // Use shared normalization (copied from middleware logic for consistency)
  fullUrl = normalizeAnalyticsUrl(fullUrl, config)

  const forwardedFor = req.headers['x-forwarded-for']
  const forwardedIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(',')[0]?.trim()
  const remoteClientAddress = forwardedIp || req.socket?.remoteAddress || '0.0.0.0'

  const userAgent = (req.headers['user-agent'] as string) || 'nuxt-app'

  const requestBody = {
    url: fullUrl,
    referrerUrl: body.referrer || '',
    headers: serializeHeaders({
      'X-Original-Url': fullUrl,
      'X-Referrer': body.referrer || '',
      'X-Browser-UserAgent': userAgent,
      'User-Agent': userAgent,
      'X-Remote-Client-Address': remoteClientAddress,
    }),
    browserUserAgent: userAgent,
    remoteClientAddress,
    userIdentifier: '',
    externalVisitorId: existingVisitorId || '',
  }

  const targetUrl = `${baseUrl}/umbraco/engageextensions/pageview/register`
  let response: any

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

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    response = await res.json()
  } catch (e) {
    // Retry logic (simplified)
    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': deliveryKey || '',
        },
        body: JSON.stringify({ ...requestBody, externalVisitorId: '' }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      response = await res.json()
    } catch (e2) {
      console.error('[engage/api] tracking failed', e2)
      return { success: false }
    }
  }

  // Set cookies
  const pageviewId = response?.pageviewId
  const externalVisitorId = response?.externalVisitorId || existingVisitorId
  const activeSegmentAlias = sanitizeSegment(response?.activeSegmentAlias)
  const secure = proto === 'https'

  if (externalVisitorId && externalVisitorId !== existingVisitorId) {
    setCookie(event, VISITOR_COOKIE, externalVisitorId, {
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
      secure,
      maxAge: 60 * 60 * 24 * 365,
    })
  }

  if (pageviewId) {
    setCookie(event, PAGEVIEW_COOKIE, pageviewId, {
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
      secure,
      maxAge: 60 * 30,
    })
  }

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
    } catch (e) {}
  }

  const cacheableSegment = activeSegmentAlias === 'anon' ? 'default' : activeSegmentAlias
  setCookie(event, SEGMENT_ALIAS_COOKIE, cacheableSegment, {
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
    secure,
    maxAge: 7 * 24 * 3600,
  })

  return { success: true, segment: cacheableSegment }
})
