import type { NavigationCompositionContentResponseModel } from '~/../server/delivery-api'

export async function useNavigation() {
  const result = await useFetch<NavigationCompositionContentResponseModel>(
    '/api/content/navigation',
    {
      server: true,
      cache: 'no-cache',
    }
  )
  return {
    data: result.data,
    error: result.error,
    pending: result.pending,
  }
}
