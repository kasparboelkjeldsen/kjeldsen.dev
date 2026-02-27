import { getRequestURL, getHeader, type H3Event } from 'h3'
import { VISITOR_COOKIE, SEGMENT_ALIAS_PATTERN, DEFAULT_SEGMENT } from './constants'
import { normalizeClientIp } from './ip'
import { normalizeAnalyticsUrl } from '../middleware/engageRules'

export interface EngageIdentifyResponse {
  pageviewId?: string
  externalVisitorId?: string
  activeSegmentAlias?: string
}

/**
 * Identifies a visitor by calling Umbraco Engage.
 * 
 * This is called during cache key generation (buildCacheKey) to determine
 * the visitor's segment BEFORE the cache lookup. This allows first-time
 * visitors to hit existing segment caches immediately.
 * 
 * @param event - H3 event
 * @returns The segment alias (or 'default' on failure)
 */
export async function identifyVisitor(event: H3Event): Promise<string> {
  try {
    const config = useRuntimeConfig()
    const deliveryKey: string | undefined = config.deliveryKey
    let baseUrl = (config.public?.cmsHost || '').replace(/\/$/, '')
    if (baseUrl && !/^https?:\/\//i.test(baseUrl)) baseUrl = `https://${baseUrl}`
    
    if (!baseUrl) {
      console.warn('[engage/identify] missing cmsHost')
      return DEFAULT_SEGMENT
    }

    const url = getRequestURL(event)
    const path = url.pathname || '/'
    const host = getHeader(event, 'host') || ''
    const proto = (getHeader(event, 'x-forwarded-proto') as string) || 'https'
    const rawUrl = `${proto}://${host}${path}${url.search}`
    const fullUrl = normalizeAnalyticsUrl(rawUrl, config)
    
    // Get existing visitor ID from cookie
    const existingVisitorId = getVisitorIdFromCookie(event)

    // Resolve client IP
    const remoteClientAddress = getClientAddress(event)

    const requestBody = {
      url: fullUrl,
      referrerUrl: getHeader(event, 'referer') || '',
      headers: JSON.stringify({
        'X-Original-Url': fullUrl,
        'X-Browser-UserAgent': getHeader(event, 'user-agent') || 'nuxt-app',
        'User-Agent': getHeader(event, 'user-agent') || 'nuxt-app',
        'X-Remote-Client-Address': remoteClientAddress,
      }),
      browserUserAgent: getHeader(event, 'user-agent') || 'nuxt-app',
      remoteClientAddress,
      userIdentifier: '',
      externalVisitorId: existingVisitorId,
    }

    const targetUrl = `${baseUrl}/umbraco/engageextensions/pageview/register`
    
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
      console.warn(`[engage/identify] HTTP ${res.status}`)
      return DEFAULT_SEGMENT
    }

    const response: EngageIdentifyResponse = await res.json()
    
    // Store response in context for middleware to use (avoids double API call)
    event.context._engageResponse = response
    event.context._engageIdentified = true
    
    const activeSegmentAlias = response?.activeSegmentAlias
    if (!activeSegmentAlias || activeSegmentAlias === 'anon') {
      return DEFAULT_SEGMENT
    }
    
    if (!SEGMENT_ALIAS_PATTERN.test(activeSegmentAlias)) {
      return DEFAULT_SEGMENT
    }
    
    return activeSegmentAlias
  } catch (e) {
    console.warn('[engage/identify] error', e)
    return DEFAULT_SEGMENT
  }
}

/**
 * Extracts the visitor ID from the cookie header.
 */
function getVisitorIdFromCookie(event: H3Event): string {
  const cookieHeader = getHeader(event, 'cookie') || ''
  const match = cookieHeader.match(new RegExp(`(?:^|; )${VISITOR_COOKIE}=([^;]+)`))
  if (match && match[1]) {
    return decodeURIComponent(match[1])
  }
  return ''
}

/**
 * Resolves the client's IP address from headers or socket.
 */
function getClientAddress(event: H3Event): string {
  const forwardedFor = getHeader(event, 'x-forwarded-for')
  const forwardedIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(',')[0]?.trim()
  return normalizeClientIp(forwardedIp || event.node?.req?.socket?.remoteAddress)
}
