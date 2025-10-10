import type { H3Event } from 'h3'

export async function handleSitemap(event: H3Event) {
  const req = event.node.req
  if (req.method !== 'GET' || req.url !== '/sitemap.xml') return
  try {
    const response = await fetch(`${process.env.CMSHOST}/api/slug`)
    const slugsRaw = (await response.json()) as unknown
    const slugs: string[] = Array.isArray(slugsRaw)
      ? slugsRaw.filter((s): s is string => typeof s === 'string')
      : []
    setHeader(event, 'Content-Type', 'application/xml')
    const host = req.headers.host || ''
    const baseUrl = `https://${host}`
    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...slugs.map((slug: string) => `  <url><loc>${baseUrl}${slug}</loc></url>`),
      '</urlset>',
    ]
    return lines.join('\n')
  } catch {
    setHeader(event, 'Content-Type', 'application/xml')
    const host = req.headers.host || ''
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      `  <url><loc>https://${host}/</loc></url>`,
      '</urlset>',
    ].join('\n')
  }
}
