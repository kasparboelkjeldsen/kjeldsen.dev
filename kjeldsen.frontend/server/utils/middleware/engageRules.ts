export function normalizeAnalyticsUrl(fullUrl: string, config: any): string {
  const publicSiteRaw = (config.public.siteUrl || '').replace(/\/$/, '')
  const fallbackCanonical = 'https://www.kjeldsen.dev'
  const localhostRegex = /^https?:\/\/localhost(?::\d+)?\/?/i

  if (localhostRegex.test(fullUrl)) {
    const targetHost = publicSiteRaw || fallbackCanonical
    try {
      const u = new URL(fullUrl)
      const target = new URL(targetHost)
      u.host = target.host
      u.protocol = target.protocol
      return u.toString()
    } catch {
      return fullUrl
    }
  }

  // Force non-localhost hosts to licensed domain
  try {
    const u = new URL(fullUrl)
    if (u.hostname !== 'kjeldsen.dev') {
      u.hostname = 'kjeldsen.dev'
      u.protocol = 'https:'
      u.port = ''
      return u.toString()
    }
  } catch {
    /* ignore */
  }

  return fullUrl
}

export function serializeHeaders(headers: Record<string, string>): string {
  return Object.entries(headers)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
}
