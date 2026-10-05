/**
 * robots.txt: everyone may read everything, AI crawlers and assistants included - it is a blog.
 *
 * Only draft previews are kept out, and those also answer noindex. The feed is offered as the
 * sitemap; search engines accept RSS there, and it lists every post.
 *
 * Served as a real 200 rather than left to the catch-all's 404, so no fetcher has to guess what a
 * JSON error body in place of robots.txt means.
 */
export default defineEventHandler((event) => {
  const site = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')

  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
  return `User-agent: *
Allow: /
Disallow: /preview/

Sitemap: ${site}/feed.xml
`
})
