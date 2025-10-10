<template>
  <!-- ✅ Navigation -->
  <header v-if="navigation?.properties?.links" class="relative z-10 py-6 md:min-h-0 min-h-24">
    <nav class="pl-5 pr-5">
      <ul class="flex justify-center gap-8 pl-3 font-mono text-base md:text-lg">
        <li v-for="link in navigation.properties.links" :key="link.title!">
          <a
            :href="link.route?.path ?? '/'"
            :class="[
              'transition-colors duration-200 hover:text-gray-400',
              isActive(link) && 'text-sky-300',
            ]"
            :aria-current="isActive(link) ? 'page' : undefined"
          >
            {{ link.title }}
          </a>
        </li>
      </ul>
    </nav>
  </header>

  <!-- ✅ Page content -->
  <main class="relative z-10 max-w-4xl px-4 pt-12 pb-24 mx-auto prose prose-invert">
    <PagesPageResolverComponent v-if="data" :data="data" class="relative z-10" />
    <pre v-if="!data" class="text-white">
    Failed to load content for <code>{{ apiPath }}</code>. Please check the console for more details.
  </pre>
  </main>
</template>

<script setup lang="ts">
  // no client-side injection needed; comment appended server-side via plugin
  import { useActiveLink } from '~/composables/useActiveLink'
  import { usePageContentFromRoute } from '~/composables/useContent'
  import { useNavigation } from '~/composables/useNavigation'
  import { useSeoForContent } from '~/composables/useSeo'
  import { useEngage } from '~/composables/useEngage'

  const { apiPath, slugHasDot, data } = await usePageContentFromRoute()

  const runtimeConfig = useRuntimeConfig()
  const useCache = runtimeConfig.public.useCache === 'true'

  // Always expose cache key debug comment (example site requirement), even if actual caching is disabled.
  if (data.value?.properties?.cacheKeys) {
    const cacheKeys = data.value.properties.cacheKeys || []
    const tags = ['reset', ...cacheKeys]

    if (import.meta.server) {
      // Console table (still helpful in prod logs for demonstration)
      console.table(cacheKeys.map((key: string, i: number) => ({ '#': i + 1, 'Cache Key': key })))

      if (cacheKeys.length) {
        const iso = new Date().toISOString()
        const utc = new Date().toUTCString()
        const safe = (s: string) => s.replace(/-->/g, '--&gt;')
        const tableLines = cacheKeys.map((k: string, i: number) => `#${i + 1} ${safe(k)}`)
        const comment = `<!-- Cache Keys (${cacheKeys.length}) | ISO: ${iso} | UTC: ${utc} | CacheEnabled: ${useCache}\n${tableLines.join('\n')}\n-->`
        const event = useRequestEvent()
        if (event) {
          ;(event.context as any).cacheDebugComment = comment
          // Expose engage pageview id to client bootstrap (if present from middleware)
          const pv = (event.context as any).engagePageviewId
          if (pv) {
            useHead({
              script: [
                {
                  key: 'engage-server-pv',
                  innerHTML: `window.__serverPageviewId = ${JSON.stringify(pv)};`,
                },
              ],
            })
          }
        }
      }
    }

    if (useCache) {
      useRouteCache((helper) => {
        helper
          .setMaxAge(3600 * 24)
          .setCacheable()
          .addTags(tags)
      })
    }
  }

  const { data: navigation } = await useNavigation()

  // Active link highlighting (refactored to composable)
  const { isActive } = useActiveLink()

  // SEO head handling extracted to composable
  useSeoForContent(data, { origin: 'https://kjeldsen.dev', lang: 'en' })

  // Client-side engage bootstrap (runs only in browser)
  if (process.client) {
    const { bootstrap } = useEngage()
    // Defer to next tick to ensure router state stable
    queueMicrotask(() => {
      bootstrap().then((s) => {
        if (s.ready) {
          console.debug('[engage] bootstrap complete (page)', {
            pageviewId: s.pageviewId,
            externalVisitorId: s.externalVisitorId,
          })
        } else if (s.error) {
          console.warn('[engage] bootstrap error', s.error)
        }
      })
    })
  }
</script>
