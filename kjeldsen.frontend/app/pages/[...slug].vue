<template>
  <div>
    <!-- One unconditional root element, and nothing beside it - not even a comment, which Vue
         keeps in development and which would make this a fragment again. The route transition
         can only animate a single element, and a page whose root is a v-if or a fragment leaves
         nothing to mount on client-side navigation. -->
    <PageResolver v-if="data" :content="data" />
  </div>
</template>

<script setup lang="ts">
  import PageResolver from '~/components/content/PageResolver.vue'
  import type { SeoCompositionContentPropertiesModel } from '~~/server/delivery-api'

  const route = useRoute()
  const path = toContentPath(route.params.slug as string | string[])
  const { data, error } = await useContentByPath(path)

  // A missing page has to answer 404, not 200 with "not found" in the body - otherwise crawlers
  // and the CDN treat every typo'd URL as real content. `fatal` renders the error page.
  if (error.value || !data.value) {
    throw createError({
      statusCode: error.value?.status === 404 || !error.value ? 404 : 502,
      statusMessage: 'Page not found',
      fatal: true,
    })
  }

  const config = useRuntimeConfig()

  // The SEO composition is on some page types and not others, so it is read off the side.
  const seo = computed(() => data.value?.properties as Partial<SeoCompositionContentPropertiesModel> | undefined)

  const isHome = computed(() => data.value?.contentType === 'homePage')
  const pageTitle = computed(() => seo.value?.seoTitle || data.value?.name || 'kjeldsen.dev')

  useHead({
    title: () => (isHome.value ? 'kjeldsen.dev' : `${pageTitle.value} · kjeldsen.dev`),
  })

  useSeoMeta({
    description: () => seo.value?.seoDescription || undefined,
    ogTitle: () => pageTitle.value,
    ogDescription: () => seo.value?.seoDescription || undefined,
    ogType: () => (data.value?.contentType === 'blogPostPage' ? 'article' : 'website'),
    ogImage: () => {
      const url = seo.value?.seoListImage?.[0]?.url
      return url ? `${config.public.siteUrl.replace(/\/$/, '')}${url}?width=1200` : undefined
    },
    twitterCard: 'summary_large_image',
  })
</script>
