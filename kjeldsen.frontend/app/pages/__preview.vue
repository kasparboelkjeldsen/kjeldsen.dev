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
    <pre v-else class="text-white">
Failed to load preview content for <code>{{ apiPath }}</code>. Please check the console for more details.
</pre>
  </main>
</template>

<script setup lang="ts">
  import { computed, onMounted, onBeforeUnmount } from 'vue'
  import { useRoute } from 'vue-router'
  import { useNavigation } from '~/composables/useNavigation'
  import { usePreviewById } from '~/composables/usePreview'

  const route = useRoute()

  // Pulls ?id=... from the query internally and calls /api/preview
  const { apiPath, data, error, pending } = await usePreviewById(route.query.id?.toString() || '')

  // Optional: log errors to keep parity with your other page
  if (error?.value) {
    console.error(`Failed to fetch preview content for id: ${route.query.id}`, error.value)
  }

  const { data: navigation } = await useNavigation()

  // Active link highlighting helpers (unchanged)
  const trimSlashes = (p: string) => (p === '/' ? '/' : p.replace(/\/+$/, ''))
  const normalizePath = (p?: string | null) => {
    const s = (p ?? '/').toString()
    const withLead = s.startsWith('/') ? s : '/' + s
    return trimSlashes(withLead)
  }
  const currentPath = computed(() => normalizePath(route.path))
  const isActive = (link: { route?: { path?: string | null } } | any) => {
    const base = normalizePath(link?.route?.path)
    const cur = currentPath.value
    if (base === '/') return cur === '/'
    return cur === base || cur.startsWith(base + '/')
  }

  // Prevent navigation in preview mode
  const clickHandler = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null
    if (!target) return
    const anchor = target.closest('a') as HTMLAnchorElement | null
    if (!anchor) return
    // Allow explicit target _blank so editors can still open new tab manually if needed
    if (anchor.target === '_blank') return
    e.preventDefault()
    anchor.setAttribute('data-preview-blocked', 'true')
    alert('sorry, navigation is disabled in preview mode')
  }

  onMounted(() => {
    document.addEventListener('click', clickHandler, true)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('click', clickHandler, true)
  })
</script>
<style>
  /* webkit */
  html::-webkit-scrollbar,
  body::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  html::-webkit-scrollbar-track,
  body::-webkit-scrollbar-track {
    background: #1a1a1a;
  }
  html::-webkit-scrollbar-thumb,
  body::-webkit-scrollbar-thumb {
    background-color: #555;
    border-radius: 8px;
    border: 2px solid #1a1a1a;
  }
  html::-webkit-scrollbar-thumb:hover,
  body::-webkit-scrollbar-thumb:hover {
    background-color: #888;
  }

  /* firefox */
  html,
  body {
    scrollbar-width: thin;
    scrollbar-color: #555 #1a1a1a;
  }
</style>
