import type { PageContent, HomePage, LinkItem } from '~~/types/content'

/** Normalises a route or slug into the path form the delivery API expects: no leading or trailing slash. */
export function toContentPath(slug: string | string[] | undefined | null): string {
  const parts = Array.isArray(slug) ? slug : [slug]
  return parts.filter(Boolean).join('/').replace(/^\/+|\/+$/g, '')
}

/**
 * Fetches one content item by path.
 *
 * Keyed on the path so two components asking for the same document share one request. That matters
 * for the root: the navigation lives on the home page's own document, so on `/` the page fetch and
 * the navigation fetch collapse into a single call.
 */
export function useContentByPath(path: string) {
  return useAsyncData<PageContent>(
    `content:${path}`,
    () => $fetch<PageContent>('/api/content', { query: { path } }),
    { deep: false }
  )
}

/** The current route's content. */
export function usePageContent() {
  const route = useRoute()
  return useContentByPath(toContentPath(route.params.slug as string | string[]))
}

/** Site navigation, which is a property of the root document rather than a separate endpoint. */
export async function useNavigation() {
  const { data } = await useContentByPath('')
  const links = computed<LinkItem[]>(() => {
    const props = data.value?.properties as HomePage | undefined
    return props?.links ?? []
  })
  return { links }
}
