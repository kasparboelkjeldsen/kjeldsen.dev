import type { H3Event } from 'h3'

/**
 * Handles block preview POST requests.
 * Activates when method is POST and custom header 'kuhb-header' is present.
 */
export async function handleBlockPreview(event: H3Event) {
  const req = event.node.req
  if (req.method !== 'POST' || !req.headers['kuhb-header']) return
  const body = await readBody(event)
  ;(event.context as any).body = body
  ;(event.context as any).blockPreview = true
}
