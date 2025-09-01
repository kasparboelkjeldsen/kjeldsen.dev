import type { HomePageContentModel } from '~/../server/delivery-api'

export async function useSite() {
  const result = await useFetch<HomePageContentModel>('/api/content/navigation', {
    server: true,
    cache: 'no-cache',
  })
  return {
    data: result.data,
    error: result.error,
    pending: result.pending,
  }
}
