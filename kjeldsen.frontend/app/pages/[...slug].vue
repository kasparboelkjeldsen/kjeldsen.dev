<template>
  <PageResolver v-if="data" :content="data" />
</template>

<script setup lang="ts">
  import PageResolver from '~/components/content/PageResolver.vue'

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

  useHead({
    title: () => data.value?.name ?? 'kjeldsen.dev',
    htmlAttrs: { lang: 'en' },
  })
</script>
