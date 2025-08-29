export default defineEventHandler(async (event) => {
  if (event.node.req.method == 'POST' && event.node.req.headers['kuhb-header']) {
    const body = await readBody(event)
    event.context.body = body
    event.context.blockPreview = true
  } else if (event.node.req.method == 'GET') {
    setHeader(event, 'Cache-Control', 'public, max-age=86400')
  }

  // if page is sitemap.xml
  if (event.node.req.url === '/sitemap.xml') {
    // fetch slug data from api
    const response = await fetch(`${process.env.CMSHOST}/api/slug`)
    const slugsRaw = (await response.json()) as unknown
    const slugs: string[] = Array.isArray(slugsRaw)
      ? slugsRaw.filter((s): s is string => typeof s === 'string')
      : []
    // slugs now contains the format: [ '/', '/blog/', '/blog/the-culture-of-kindness/', '/umbraco-packages/' ]

    setHeader(event, 'Content-Type', 'application/xml')
    const host = event.node.req.headers.host || ''
    const baseUrl = `https://${host}`

    // return xml
    return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${slugs.map((slug: string) => `  <url><loc>${baseUrl}${slug}</loc></url>`).join('\n')}
  </urlset>`
  }
})
