<template>
  <div class="term">
    <div class="code-bar">
      <span class="code-dots" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted">
        cache keys · {{ cacheKeys.length }}
      </span>
    </div>

    <div v-if="cacheKeys.length" class="py-2">
      <div v-for="key in cacheKeys" :key="key" class="term-row">
        <i class="term-dot" aria-hidden="true"></i>
        <span class="text-fg-2">{{ key }}</span>
      </div>
    </div>

    <p v-else class="term-row py-3 text-muted">No cache keys on this page.</p>
  </div>
</template>

<script setup lang="ts">
  import type { CacheKeyExampleBlockElementModel } from '~~/server/delivery-api'

  // The element type has no properties of its own - it is a marker that says "print the keys of
  // the page you are on". Kraftvaerk.Umbraco.Headless.CacheKeys puts those on the content item.
  defineProps<{ block: CacheKeyExampleBlockElementModel }>()

  // Same key as the page fetch, so this reads the already-loaded document rather than refetching.
  const { data } = await usePageContent()

  // `cacheKeys` is added to the response at runtime, after the OpenAPI content type schemas are
  // generated, so it is not on the generated properties model and has to be read off the side.
  const cacheKeys = computed(() => {
    const props = data.value?.properties as { cacheKeys?: string[] | null } | undefined
    return props?.cacheKeys ?? []
  })
</script>
