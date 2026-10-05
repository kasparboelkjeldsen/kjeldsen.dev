import type { H3Event } from 'h3'
import { cmsBaseUrl } from './delivery'

/**
 * Fetches one of a Generated Graphics item's files from the CMS (GeneratedGraphicsFileController):
 * `/media/svg/<key>.svg` or `/media/card/<key>.jpg`. The key comes off the route as `<key>.<ext>`
 * and must be a bare GUID, so nothing but these two files can be reached through it.
 */
export async function fetchGraphicFile(event: H3Event, folder: 'svg' | 'card', ext: 'svg' | 'jpg'): Promise<Response> {
  const key = (getRouterParam(event, 'key') ?? '').replace(new RegExp(`\.${ext}$`, 'i'), '')

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)) {
    throw createError({ statusCode: 404, statusMessage: 'No such graphic' })
  }

  const upstream = await fetch(`${cmsBaseUrl()}/media/${folder}/${key}.${ext}`)
  if (!upstream.ok) {
    throw createError({ statusCode: upstream.status === 404 ? 404 : 502, statusMessage: 'No such graphic' })
  }

  return upstream
}
