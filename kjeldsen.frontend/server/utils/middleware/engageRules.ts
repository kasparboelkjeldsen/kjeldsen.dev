// Licensed domains for Umbraco Engage (MVP license limits to 3 domains, no wildcards)
const LICENSED_DOMAINS = ['localhost', 'kjeldsen.dev', 'umbraco.kjeldsen.dev']
const DEFAULT_LICENSED_DOMAIN = 'kjeldsen.dev'

export function normalizeAnalyticsUrl(fullUrl: string, config: any): string {
  const publicSiteRaw = (config.public.siteUrl || '').replace(/\/$/, '')
  const localhostRegex = /^https?:\/\/localhost(?::\d+)?\/?/i

  // Keep localhost as-is (it's a licensed domain)
  if (localhostRegex.test(fullUrl)) {
    return fullUrl
  }

  // Normalize to a licensed domain
  try {
    const u = new URL(fullUrl)
    const hostname = u.hostname.toLowerCase()
    
    // Already a licensed domain - keep it
    if (LICENSED_DOMAINS.includes(hostname)) {
      return fullUrl
    }
    
    // Rewrite to default licensed domain (e.g., www.kjeldsen.dev → kjeldsen.dev)
    u.hostname = DEFAULT_LICENSED_DOMAIN
    u.protocol = 'https:'
    u.port = ''
    return u.toString()
  } catch {
    /* ignore URL parse errors */
  }

  return fullUrl
}

export function serializeHeaders(headers: Record<string, string>): string {
  return Object.entries(headers)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
}
