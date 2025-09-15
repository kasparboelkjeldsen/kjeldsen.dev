// composables/usePreview.ts
import { ref } from 'vue'
import type { IApiContentResponseModel } from '~/../server/delivery-api'

export async function usePreviewById(id: string | null | undefined) {
  const cleanId = id?.trim()
  const apiPath = `/api/preview${cleanId ? `?id=${encodeURIComponent(cleanId)}` : ''}`

  if (!cleanId) {
    return {
      apiPath,
      id: null as string | null,
      data: ref<IApiContentResponseModel | null>(null),
      error: ref<any>(null),
      pending: ref(false),
    }
  }

  const result = await useFetch<IApiContentResponseModel>(apiPath, {
    server: true,
    cache: 'no-cache',
  })

  if (result.error.value) {
    console.error(`Failed to fetch preview content for id: ${cleanId}`, result.error.value)
  }

  return {
    apiPath,
    id: cleanId,
    data: result.data,
    error: result.error,
    pending: result.pending,
  }
}
