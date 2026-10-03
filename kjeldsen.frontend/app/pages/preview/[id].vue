<template>
  <div>
    <!-- Same single root as [...slug].vue: the route transition animates one element. -->
    <PageResolver v-if="data" :content="data" />
  </div>
</template>

<script setup lang="ts">
  /**
   * A document as saved in the CMS, published or not: what the backoffice's Preview button shows
   * (via server/api/init-preview.get.ts). The pass in `?t` is checked on every fetch, so this page
   * is only as open as the link that reached it. Rendered with the site's own components; never
   * cached, indexed or counted as a pageview.
   */
  import PageResolver from '~/components/content/PageResolver.vue'
  import type { PageContent } from '~~/types/content'
  import type { SeoCompositionContentPropertiesModel } from '~~/server/delivery-api'

  const route = useRoute()
  const id = String(route.params.id ?? '')
  const pass = String(route.query.t ?? '')
  const requestFetch = useRequestFetch()

  const { data, error } = await useAsyncData<PageContent>(`preview:${id}`, () =>
    requestFetch<PageContent>('/api/preview', { query: { id, t: pass } })
  , { deep: false })

  if (error.value || !data.value) {
    const status = error.value?.statusCode ?? 404
    throw createError({
      statusCode: status,
      statusMessage: status === 401 ? 'This preview link has expired. Press Preview in Umbraco again.' : 'Preview not available',
      fatal: true,
    })
  }

  const seo = computed(() => data.value?.properties as Partial<SeoCompositionContentPropertiesModel> | undefined)
  useHead({ title: () => `Preview: ${seo.value?.seoTitle || data.value?.name || 'page'} · kjeldsen.dev` })
  useSeoMeta({ robots: 'noindex, nofollow' })
</script>
