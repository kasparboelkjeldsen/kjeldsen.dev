import { processingCommands, sign } from '../utils/media'

/**
 * Repoints media URLs at the CMS for block previews only.
 *
 * Every image the site renders is addressed `/api/media/...` and served by this app's own media
 * route. That works everywhere except here: the backoffice injects the preview fragment into a
 * shadow root on its *own* page, so a root-relative URL resolves against the CMS, which has no
 * `/api/media`. Pointing at this origin instead is not an option either - the backoffice is https
 * and the frontend is http in development, and browsers drop the mixed-content image.
 *
 * So the URLs are rewritten to the CMS's real `/media/...` path, signed the same way the media
 * route signs them, which lands on the origin the preview is already being displayed on.
 *
 * Done to the rendered HTML rather than in the components because it is a property of where the
 * markup is going, not of what the block is - nothing in `app/` should have to know it is being
 * previewed.
 */
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('render:html', (html, { event }) => {
    if (!event?.context.blockPreview) return
    html.body = html.body.map((chunk) => chunk.replace(/\/api\/media\/[^\s"'<>]+/g, toCmsMedia))
  })
})

function toCmsMedia(match: string): string {
  // Attribute values arrive HTML-escaped, and go back the same way.
  const [rawPath = '', rawQuery = ''] = match.replace(/&amp;/g, '&').split('?')

  const path = rawPath.replace(/^\/api/, '')
  const commands = processingCommands(new URLSearchParams(rawQuery))

  // An unsignable command set means the original image, uncropped, rather than a broken one.
  return `${path}${commands === null ? '' : sign(path, commands)}`.replace(/&/g, '&amp;')
}
