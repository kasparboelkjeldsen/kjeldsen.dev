import type { ApiLinkModel, NavigationCompositionContentPropertiesModel } from '~~/server/delivery-api'
import type { PageContent } from '~~/types/content'
import type { EngageInfo } from '~~/types/engage'

/** What the content route answers with: the page, plus what Engage made of the request. */
export type ContentResponse = PageContent & { engage?: EngageInfo }

/** Normalises a route or slug into the path form the delivery API expects: no leading or trailing slash. */
export function toContentPath(slug: string | string[] | undefined | null): string {
  const parts = Array.isArray(slug) ? slug : [slug]
  return parts.filter(Boolean).join('/').replace(/^\/+|\/+$/g, '')
}

interface ContentOptions {
  /**
   * The document is being fetched for the chrome around a page - the navigation, say - not as the
   * page the visitor is on. The content route then leaves Engage out of it: no pageview, no segment.
   */
  chrome?: boolean
}

/**
 * Fetches one content item by path.
 *
 * Keyed on the path (and on whether it is a chrome fetch), so two components asking for the same
 * document share one request. On `/` the page's own fetch and the navigation's fetch of the root
 * document are two requests on purpose: only one of them is a pageview.
 *
 * Goes through the request-aware fetch rather than a bare `$fetch`, because the content route is
 * where Engage identifies the visitor: during server rendering the browser's cookie, user agent
 * and referrer have to reach it, and a cookie it sets has to come back out on the page response.
 * A bare `$fetch` on the server carries none of that.
 */
export function useContentByPath(path: string, options: ContentOptions = {}) {
  const event = useRequestEvent()
  const requestFetch = useRequestFetch()
  const engage = useEngageInfo()
  const chrome = options.chrome === true

  const result = useAsyncData<ContentResponse>(
    `content:${chrome ? 'chrome:' : ''}${path}`,
    () =>
      requestFetch<ContentResponse>('/api/content', {
        query: chrome ? { path, chrome: '1' } : { path },
        onResponse({ response }) {
          if (!import.meta.server || !event) return
          // The visitor cookie Engage minted has to reach the browser, and this internal call's
          // response headers otherwise stop at the server.
          const cookies = response.headers.getSetCookie?.() ?? []
          if (!cookies.length) return
          const existing = event.node.res.getHeader('set-cookie')
          const current = Array.isArray(existing) ? existing : existing ? [String(existing)] : []
          event.node.res.setHeader('set-cookie', [...current, ...cookies])
        },
      }),
    { deep: false }
  )

  if (!chrome) {
    watch(
      () => result.data.value?.engage,
      (info) => {
        if (info) engage.value = info
      },
      { immediate: true }
    )
  }

  return result
}

/** The current route's content. */
export function usePageContent() {
  const route = useRoute()
  return useContentByPath(toContentPath(route.params.slug as string | string[]))
}

/**
 * Site navigation, which is a property of the root document rather than a separate endpoint.
 *
 * `links` comes from the navigation composition, so it is read off that shape rather than off a
 * specific page type — any content type composed with it will carry the property.
 */
export async function useNavigation() {
  const { data } = await useContentByPath('', { chrome: true })
  const links = computed<ApiLinkModel[]>(() => {
    const props = data.value?.properties as NavigationCompositionContentPropertiesModel | undefined
    return props?.links ?? []
  })
  return { links }
}
