import { ref } from 'vue'
import { useRoute } from 'vue-router'
import type { IApiContentResponseModel } from '~/../server/delivery-api'

export async function usePageContentFromRoute() {
  const nuxtApp = useNuxtApp()
  const route = useRoute()
  const slugArray = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]
  const cleanSlug = slugArray.filter(Boolean).join('/')
  const slugHasDot = cleanSlug.includes('.')
  const apiPath = `/api/content/${cleanSlug}/`

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

  // During SSR, read segment from original request's event.context (set by middleware)
  // and pass it as a header since the internal API call is a different event
  const headers: Record<string, string> = {}
  if (import.meta.server) {
    const event = useRequestEvent()
    if (event?.context?.engageSegment) {
      headers['X-Engage-Segment'] = event.context.engageSegment
    }
    // Also forward visitor ID if middleware set it
    if (event?.context?.engageVisitorId) {
      headers['X-Engage-Visitor'] = event.context.engageVisitorId
    }
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
