import type { H3Event } from 'h3'

/**
 * What Engage needs to know about the visitor's request: the page they are on, where they came
 * from, their browser and their address. Read once per request and passed to every Engage call,
 * so a pageview is attributed to the visitor rather than to this server.
 */
export interface VisitorRequest {
  /** Absolute URL of the page, on the public site host. */
  url: string
  referrer: string
  userAgent: string
  ip: string
  acceptLanguage: string
}

export function visitorRequest(event: H3Event, contentPath: string): VisitorRequest {
  const site = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')
  const path = `/${contentPath.replace(/^\/+|\/+$/g, '')}`

  return {
    // The URL is rebuilt from the configured site host rather than from the request, which on a
    // client-side navigation is the API route, and behind a proxy is the internal host.
    url: `${site}${path === '/' ? '/' : `${path}/`}`,
    referrer: getHeader(event, 'referer') ?? '',
    userAgent: getHeader(event, 'user-agent') ?? '',
    ip: getRequestIP(event, { xForwardedFor: true }) ?? '127.0.0.1',
    acceptLanguage: getHeader(event, 'accept-language') ?? 'en',
  }
}

/** Headers that make an Engage API call look like it came from the visitor. */
export function visitorHeaders(req: VisitorRequest, visitorId?: string | null): Record<string, string> {
  return {
    'User-Agent': req.userAgent || 'kjeldsen.dev',
    'X-Forwarded-For': req.ip,
    'Accept-Language': req.acceptLanguage,
    ...(req.referrer ? { Referer: req.referrer } : {}),
    ...(visitorId ? { 'External-Visitor-Id': visitorId } : {}),
  }
}
