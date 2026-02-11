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
  import { useCustomCache } from '~/composables/useCustomCache'

  const { apiPath, slugHasDot, data } = await usePageContentFromRoute()

  // Apply custom cache handling & debug comment
  const cacheResult = useCustomCache(data)

  const { data: navigation } = await useNavigation()

  // Active link highlighting (refactored to composable)
  const { isActive } = useActiveLink()

  // SEO head handling extracted to composable
  useSeoForContent(data, { origin: 'https://kjeldsen.dev', lang: 'en' })

  // Note: Engage bootstrap (pageview tracking) is handled by server middleware
  // (server/middleware/engageBootstrap.ts) - no client-side call needed
</script>
