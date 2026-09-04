import { loadChildren } from '../utils/children'
import type { ChildSummary } from '../utils/children'

/**
 * The blog as RSS 2.0, at /feed.xml.
 *
 * Built from the same summaries the /blog/ listing uses, so it costs one cached delivery call and
 * is dropped by the same purge when a post is published. Each item carries the post's SEO title
 * and description, its publishing date and its author; the permalink is the guid. The picture
 * goes along as an enclosure, sized for a reader's thumbnail, so aggregators that show one have
 * something to show.
 */
const BLOG = '/blog/'
const TITLE = 'kjeldsen.dev'
const DESCRIPTION = 'Notes on Umbraco, headless delivery and running it cheaply on Azure, by Kaspar Boel Kjeldsen.'

export default defineEventHandler(async (event) => {
  const site = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')
  const posts = (await loadChildren(BLOG)).filter((p) => p.path)

  const items = posts.map((post) => item(site, post)).join('\n')
  const newest = posts[0] ? new Date(posts[0].date ?? posts[0].updateDate) : new Date()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
<title>${escape(TITLE)}</title>
<link>${site}/</link>
<description>${escape(DESCRIPTION)}</description>
<language>en</language>
<lastBuildDate>${newest.toUTCString()}</lastBuildDate>
<atom:link href="${site}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>
`

  setResponseHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=900')
  return xml
})

function item(site: string, post: ChildSummary): string {
  const link = `${site}${post.path}`
  const date = new Date(post.date ?? post.updateDate)
  const lines = [
    `<title>${escape(post.title ?? post.name ?? '')}</title>`,
    `<link>${link}</link>`,
    `<guid isPermaLink="true">${link}</guid>`,
    `<pubDate>${date.toUTCString()}</pubDate>`,
    ...(post.description ? [`<description>${escape(post.description)}</description>`] : []),
    ...post.authors.map((a) => `<dc:creator>${escape(a)}</dc:creator>`),
    ...(post.image
      ? [`<enclosure url="${escape(`${site}${post.image.url}${post.image.url.includes('?') ? '&' : '?'}width=1200&format=jpg`)}" type="image/jpeg" length="0"/>`]
      : []),
  ]
  return `<item>
${lines.join('\n')}
</item>`
}

function escape(text: string): string {
  return text.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!)
}
