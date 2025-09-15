// server/api/init-preview.get.ts (or wherever your route lives)
import { defineEventHandler, getQuery, setCookie, sendRedirect, createError } from 'h3'
import { $fetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  const { id, secret, uid, rand } = getQuery(event)

  if (!id || !secret) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id or secret' })
  }

  const {
    public: { cmsHost },
  } = useRuntimeConfig(event)
  const url = `${cmsHost}/api/custompreviewapi/check?key=${encodeURIComponent(String(secret))}&id=${encodeURIComponent(String(uid))}`
  // Call CMS check endpoint; expect 200 + GUID body or 401
  let guid: string
  try {
    // Use responseType 'text' so we get the raw GUID body
    const res = await $fetch.raw<string>(url, { method: 'GET', responseType: 'json', retry: 0 })
    if (res.status !== 200 || !res._data) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    guid = String(res._data).trim()
    if (!/^[0-9a-fA-F-]{36}$/.test(guid)) {
      // Defensive: if API returns something unexpected
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
  } catch (err: any) {
    // $fetch throws on non-2xx; normalize to 401 for this flow
    if (err?.statusCode === 401) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    // Bubble other errors as 502 to indicate upstream failure
    console.error(err)
    throw createError({ statusCode: 502, statusMessage: 'Preview check failed' })
  }

  // Store GUID in a short-lived cookie
  setCookie(event, 'umb_preview', guid, {
    path: '/',
    httpOnly: true,
    sameSite: 'none', // << third-party iframe requires this
    secure: true, // << required for SameSite=None
    maxAge: 3600,
  })

  // Redirect into the Nuxt preview UI
  return sendRedirect(
    event,
    `/__preview?id=${encodeURIComponent(String(id))}&rand=${encodeURIComponent(String(rand))}`,
    302
  )
})
