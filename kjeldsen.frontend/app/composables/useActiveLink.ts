import { computed } from 'vue'
import { useRoute } from 'vue-router'

/**
 * Composable providing an `isActive` helper for navigation links.
 * Normalizes paths (leading slash, trims trailing slashes except root) and
 * considers a link active if the current route matches exactly or is a child path.
 */
export function useActiveLink() {
  const route = useRoute()

  const trimSlashes = (p: string) => (p === '/' ? '/' : p.replace(/\/+$/, ''))
  const normalizePath = (p?: string | null) => {
    const s = (p ?? '/').toString()
    const withLead = s.startsWith('/') ? s : '/' + s
    return trimSlashes(withLead)
  }

  const currentPath = computed(() => normalizePath(route.path))

  interface MaybeLinkRoute {
    path?: string | null
  }
  interface MaybeLink {
    route?: MaybeLinkRoute | null
    [k: string]: any
  }

  const isActive = (link: MaybeLink) => {
    const base = normalizePath(link?.route?.path)
    const cur = currentPath.value
    if (base === '/') return cur === '/'
    return cur === base || cur.startsWith(base + '/')
  }

  return { isActive, currentPath }
}

export type UseActiveLinkReturn = ReturnType<typeof useActiveLink>
