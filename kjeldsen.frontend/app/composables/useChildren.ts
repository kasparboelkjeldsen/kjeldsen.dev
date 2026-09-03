import type { ChildSummary } from '~~/server/api/content-children'

/**
 * The children of a container page, as listing summaries, newest first.
 *
 * One composable rather than a fetch at each call site because the home page and the listing page
 * both ask for the same children under the same key, and Nuxt refuses to share a key between two
 * calls whose handlers differ. Here they cannot.
 */
export function useChildren(path: string | null | undefined) {
  const key = `children:${path ?? ''}`
  return useAsyncData<ChildSummary[]>(
    key,
    () => (path ? $fetch<ChildSummary[]>('/api/content-children', { query: { path } }) : Promise.resolve([])),
    { default: () => [], deep: false }
  )
}
