import { ref } from 'vue'
import { useRoute } from 'vue-router'
import type { IApiContentResponseModel } from '~/../server/delivery-api'

export async function usePageContentFromRoute() {
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

  const result = await useFetch<IApiContentResponseModel>(apiPath, {
    server: true,
    cache: 'no-cache',
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
