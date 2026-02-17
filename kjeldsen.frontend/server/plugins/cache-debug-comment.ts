// server/plugins/cache-debug-comment.ts
// Nitro plugin to append cache debug HTML comment (if present in event.context.cacheDebugComment)
// to the rendered HTML response in SSR, without affecting hydration (inserted after </html> or before closing body tag).
import type { H3Event } from 'h3'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    try {
      const ctx: any = (event as H3Event).context

      if (typeof response.body !== 'string' || !response.body.includes('<html')) return

      const generatedAt = Date.now()
      // We inject a meta tag with the server generation timestamp.
      // If this page is cached, this timestamp will be "old" when the client reads it.
      // The client can compare this timestamp with the current time.
      // If the difference is large (e.g. > 2000ms), it means we are seeing a cached version.
      // Since the middleware ONLY runs on fresh requests, a large diff implies middleware was SKIPPED.
      // Therefore, we must track the pageview client-side.
      const marker = `<meta name="engage-server-gen" content="${generatedAt}" />`

      // Calculate debug comment if needed
      const comment: string | undefined = ctx.cacheDebugComment

      let newBody = response.body

      // Insert marker
      if (newBody.includes('</head>')) {
        newBody = newBody.replace('</head>', `    ${marker}\n</head>`)
      }

      // Insert comment
      if (comment) {
        const idx = newBody.lastIndexOf('</body>')
        if (idx !== -1) {
          newBody = `${newBody.slice(0, idx)}${comment}\n${newBody.slice(idx)}`
        } else {
          newBody += `\n${comment}`
        }
      }

      response.body = newBody
    } catch (e) {
      // Silent fail; debug only
    }
  })
})
