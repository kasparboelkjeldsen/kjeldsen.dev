export default defineEventHandler(async (event) => {
  const req = event.node.req
  const method = req.method || 'GET'
  const url = req.url || ''

  // Block preview POST handler
  if (method === 'POST' && req.headers['kuhb-header']) {
    const body = await readBody(event)
    event.context.body = body
    event.context.blockPreview = true
  }

  // Only set cache header for media API endpoints (e.g. /api/media/...)
  if (method === 'GET' && url.includes('/api/media')) {
    setHeader(event, 'Cache-Control', 'public, max-age=86400')
  }

  // Dynamic sitemap.xml generation (no caching header unless you add it explicitly)
  if (url === '/sitemap.xml') {
    try {
      const response = await fetch(`${process.env.CMSHOST}/api/slug`)
      const slugsRaw = (await response.json()) as unknown
      const slugs: string[] = Array.isArray(slugsRaw)
        ? slugsRaw.filter((s): s is string => typeof s === 'string')
        : []

      setHeader(event, 'Content-Type', 'application/xml')
      const host = req.headers.host || ''
      const baseUrl = `https://${host}`

      return `<?xml version="1.0" encoding="UTF-8"?>\n  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${slugs
        .map((slug: string) => `    <url><loc>${baseUrl}${slug}</loc></url>`)
        .join('\n')}\n  </urlset>`
    } catch (e) {
      // Fallback minimal sitemap if API fails
      setHeader(event, 'Content-Type', 'application/xml')
      const host = req.headers.host || ''
      return `<?xml version="1.0" encoding="UTF-8"?>\n  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n    <url><loc>https://${host}/</loc></url>\n  </urlset>`
    }
  }
})
