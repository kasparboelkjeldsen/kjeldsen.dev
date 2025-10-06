// server/plugins/cache-debug-comment.ts
// Nitro plugin to append cache debug HTML comment (if present in event.context.cacheDebugComment)
// to the rendered HTML response in SSR, without affecting hydration (inserted after </html> or before closing body tag).
import type { H3Event } from 'h3'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    try {
      const ctx: any = (event as H3Event).context
      const comment: string | undefined = ctx.cacheDebugComment
      if (!comment || typeof response.body !== 'string') return
      // Only inject into HTML documents
      if (!response.body.includes('<html')) return

      // Place comment right before </body> if possible, else append at end
      const idx = response.body.lastIndexOf('</body>')
      if (idx !== -1) {
        response.body = `${response.body.slice(0, idx)}${comment}\n${response.body.slice(idx)}`
      } else {
        response.body += `\n${comment}`
      }
    } catch (e) {
      // Silent fail; debug only
    }
  })
})
