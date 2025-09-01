<template>
  <!-- ✅ Navigation -->
  <header v-if="navigation?.properties?.links" class="relative z-10 py-6">
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
  import { useRoute } from 'vue-router'
  import { watchEffect, ref, computed } from 'vue'
  import { usePageContentFromRoute } from '~/composables/useContent'
  import { useNavigation } from '~/composables/useNavigation'
  import type { SeoCompositionContentResponseModel } from '~/../server/delivery-api'

  const route = useRoute()
  const { apiPath, slugHasDot, data } = await usePageContentFromRoute()

  if (data.value?.properties?.cacheKeys) {
    const cacheKeys = data.value.properties.cacheKeys || []
    const tags = ['reset', ...cacheKeys]

    if (import.meta.server) {
      console.table(cacheKeys.map((key: string, i: number) => ({ '#': i + 1, 'Cache Key': key })))
    }
  }

  const { data: navigation } = await useNavigation()

  // Active link highlighting helpers
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

  watchEffect(() => {
    if (data.value) {
      const seo = data.value as SeoCompositionContentResponseModel

      const origin = 'https://kjeldsen.dev'

      const toAbsolute = (u?: string | null) => {
        if (!u) return ''
        if (/^https?:\/\//i.test(u)) return u
        if (!origin) return u
        return `${origin}${u.startsWith('/') ? '' : '/'}${u}`
      }

      const title = seo?.properties?.seoTitle ?? data.value?.name ?? ''
      const description = seo?.properties?.seoDescription ?? ''
      const rawKeywords = seo?.properties?.seoKeyWords ?? ''
      const keywordsList = rawKeywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)
      const keywords = keywordsList.join(', ')
      const published = seo?.properties?.seoPublishingDate ?? ''
      const imageUrl = seo?.properties?.seoListImage?.[0]?.url ?? ''
      const absoluteImage = toAbsolute(imageUrl)
      const canonical = origin ? `${origin}${route.fullPath}` : ''

      const meta: any[] = []
      if (description) meta.push({ name: 'description', content: description, key: 'description' })
      if (keywords) meta.push({ name: 'keywords', content: keywords, key: 'keywords' })
      // Also add Open Graph article tags for each keyword
      if (keywordsList.length) {
        for (const kw of keywordsList) {
          meta.push({ property: 'article:tag', content: kw, key: `article:tag:${kw}` })
        }
      }
      meta.push({ property: 'og:title', content: title, key: 'og:title' })
      if (description)
        meta.push({ property: 'og:description', content: description, key: 'og:description' })
      if (canonical) meta.push({ property: 'og:url', content: canonical, key: 'og:url' })
      meta.push({ property: 'og:type', content: published ? 'article' : 'website', key: 'og:type' })
      if (absoluteImage)
        meta.push({ property: 'og:image', content: absoluteImage, key: 'og:image' })

      meta.push({
        name: 'twitter:card',
        content: absoluteImage ? 'summary_large_image' : 'summary',
        key: 'twitter:card',
      })
      meta.push({ name: 'twitter:title', content: title, key: 'twitter:title' })
      if (description)
        meta.push({ name: 'twitter:description', content: description, key: 'twitter:description' })
      if (absoluteImage)
        meta.push({ name: 'twitter:image', content: absoluteImage, key: 'twitter:image' })
      if (published)
        meta.push({
          property: 'article:published_time',
          content: published,
          key: 'article:published_time',
        })

      const link = canonical ? [{ rel: 'canonical', href: canonical, key: 'canonical' }] : []

      useHead({
        title,
        meta,
        link,
        htmlAttrs: { lang: 'en' },
      })
    }
  })
</script>
