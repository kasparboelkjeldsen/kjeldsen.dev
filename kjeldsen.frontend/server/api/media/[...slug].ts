import { cmsBaseUrl } from '../../utils/delivery'
import { processingCommands, sign } from '../../utils/media'

/**
 * Streams CMS media through the frontend, signing image-processing commands on the way.
 *
 * Two things make this route load-bearing rather than a convenience:
 *
 * 1. The backend's `AbsolutePathApiUrlProvider` prefixes every delivery-API media URL with `/api`
 *    (kjeldsen.backend/code/delivery/Provider/AbsolutePathApiUrlProvider.cs), so images resolve
 *    against this origin. Without this route they hit the `/api` catch-all and 404.
 * 2. `Umbraco:CMS:Imaging:HMACSecretKey` is set, so ImageSharp answers 400 to any URL carrying
 *    processing commands without a valid `hmac`. Every crop the frontend asks for has to be signed.
 *
 * The signing rules live in server/utils/media.ts, because the block preview needs the same answer.
 */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''

  // Decoded before the check so an encoded traversal (`%2e%2e`) cannot walk off /media.
  if (!slug || decodeURIComponent(slug).includes('..')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid media path' })
  }

  const path = `/media/${slug}`
  const commands = processingCommands(getRequestURL(event).searchParams)

  if (commands === null) {
    throw createError({ statusCode: 400, statusMessage: 'Unsupported image command' })
  }

  return proxyRequest(event, `${cmsBaseUrl()}${path}${sign(path, commands)}`)
})
