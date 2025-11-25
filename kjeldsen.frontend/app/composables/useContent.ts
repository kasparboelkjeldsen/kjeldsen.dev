import { ref } from 'vue'
import { useRoute } from 'vue-router'
import type { IApiContentResponseModel } from '~/../server/delivery-api'

export async function usePageContentFromRoute(forcedSegment?: string) {
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
  if (segTok) {
    const decryptedSegTok = await decryptSeg(segTok)
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
  } else if (segTok && externalVisitorId) {
    headers['Forced-Segment'] = segTok
    headers['External-Visitor-Id'] = externalVisitorId
  }

  const result = await useFetch<IApiContentResponseModel>(apiPath, {
    server: true,
    cache: 'no-cache',
    headers,
  })

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
