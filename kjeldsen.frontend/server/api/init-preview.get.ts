import type { H3Event } from 'h3'
import { cmsBaseUrl } from '../utils/delivery'
import { isGuid, previewPass } from '../utils/preview'

/**
 * Where the backoffice's Preview button lands (`HeadlessPreview:Url`).
 *
 * Kraftvaerk.Umbraco.Headless.Preview replaces /umbraco/preview with an iframe pointing here:
 * `?id=<document key>&secret=<one-time guid>&uid=<backoffice user id>`. The secret is minted for
 * the logged-in editor and lives in the CMS's memory for a minute. Trading it at
 * /api/custompreviewapi/check proves the visitor came from that button (the check also consumes
 * it); then the browser is sent to the draft with a preview pass of our own
 * (server/utils/preview.ts). The long-lived guid the check answers with is not kept: it only
 * unlocks member-protected content, which nothing on this site is.
 */
export default defineEventHandler(async (event) => {
  const { id, secret, uid } = getQuery(event)

  // The user id is whatever the backoffice put in its NameIdentifier claim; the check decides.
  if (!isGuid(id) || !isGuid(secret) || typeof uid !== 'string' || !/^[\w-]{1,64}$/.test(uid)) {
    return refuse(event, 400, 'This is not a preview link.')
  }

  const check = await $fetch.raw(`${cmsBaseUrl()}/api/custompreviewapi/check`, {
    query: { key: secret, id: uid },
    ignoreResponseError: true,
  }).catch(() => null)

  if (check?.status !== 200) {
    return refuse(event, 401, 'This preview link has expired or was already used. Press Preview in Umbraco again.')
  }

  return sendRedirect(event, `/preview/${id.toLowerCase()}?t=${encodeURIComponent(previewPass(id))}`, 302)
})

function refuse(event: H3Event, status: number, message: string) {
  setResponseStatus(event, status)
  setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return `<!doctype html><meta charset="utf-8"><title>Preview</title><body style="font:16px system-ui;padding:2rem;background:#07080c;color:#e9ebf2">${message}</body>`
}
