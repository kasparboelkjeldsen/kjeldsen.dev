import { ref } from 'vue'
import { useRoute } from 'vue-router'
import type { IApiContentResponseModel } from '~/../server/delivery-api'

export async function usePageContentFromRoute(forcedSegment?: string) {
  const nuxtApp = useNuxtApp()
  const route = useRoute()
  const slugArray = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]
  const cleanSlug = slugArray.filter(Boolean).join('/')
  const slugHasDot = cleanSlug.includes('.')
  const apiPath = `/api/content/${cleanSlug}/`
  const externalVisitorId = useCookie<string | null>('engage_visitor').value || null
  const segTok = useCookie<string | null>('segTok').value || null

  // Try to get manual segment from cookie, or fallback to request header if we just set it in middleware
  let manualSegment = useCookie<string | null>('manual-segment').value || null
  if (!manualSegment && import.meta.server) {
    const headers = useRequestHeaders(['manual-segment'])
    manualSegment = headers['manual-segment'] || null
  }

  console.log('frontend manual segment', manualSegment)
  let decryptedSegTok: string | null = null
  if (segTok) {
    try {
      const res = await $fetch<{ segment: string | null }>('/api/engage/decrypt', {
        method: 'POST',
        body: { token: segTok },
      })
      decryptedSegTok = res.segment
    } catch (e) {
      console.error('Failed to decrypt segment token', e)
    }
  }

  if (slugHasDot) {
    // Disallow dot paths, mirror server logic
    return {
      apiPath,
      cleanSlug,
      slugHasDot,
      data: ref<IApiContentResponseModel | null>(null),
      error: ref<any>(null),
      pending: ref(false),
    }
  }
  const headers: Record<string, string> = {}

  if (forcedSegment) {
    headers['Forced-Segment'] = forcedSegment
  } else if (manualSegment) {
    headers['Forced-Segment'] = manualSegment
  } else if (decryptedSegTok && externalVisitorId) {
    headers['Forced-Segment'] = decryptedSegTok
    headers['External-Visitor-Id'] = externalVisitorId
  }

  const result = await nuxtApp.runWithContext(() =>
    useFetch<IApiContentResponseModel>(apiPath, {
      server: true,
      cache: 'no-cache',
      headers,
    })
  )

  // Normalize null when missing
  if (result.error.value) {
    // Keep same logging contract; caller can also log if desired
    console.error(`Failed to fetch content for path: ${apiPath}`, result.error.value)
  }

  return {
    apiPath,
    cleanSlug,
    slugHasDot,
    data: result.data,
    error: result.error,
    pending: result.pending,
  }
}
