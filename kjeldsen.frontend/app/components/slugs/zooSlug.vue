<template>
  <ZooPageResolverComponent v-if="data" :data="data" />
</template>

<script lang="ts" setup>
  import ZooPageResolverComponent from '~/components/pages/ZooPageResolverComponent.vue'
  import { usePageContentFromRoute } from '~/composables/useContent'

  const { data } = await usePageContentFromRoute()
  console.log('page-id', data.value?.id)
  const { setHasSplash } = useZooHeader()

  watchEffect(() => {
    if (!data.value) return

    const type = data.value.contentType
    if (type === 'zooHomepage') {
      setHasSplash(true)
    } else if (type === 'zooCtaPage') {
      // Check if splash image exists
      const hasSplashImage = !!(data.value as any).properties?.splash?.length
      setHasSplash(hasSplashImage)
    } else {
      setHasSplash(false)
    }
  })
  // Client-side engage bootstrap (runs only in browser)
  if (import.meta.client) {
    const { bootstrap } = useEngage()
    // Defer to next tick to ensure router state stable
    queueMicrotask(() => {
      bootstrap().then((s) => {
        if (s.ready) {
          console.debug('[engage] bootstrap complete (page)', {
            pageviewId: s.pageviewId,
            externalVisitorId: s.externalVisitorId,
            segment: s.segment,
          })
        } else if (s.error) {
          console.warn('[engage] bootstrap error', s.error, { fullState: s })
        } else {
          console.warn('[engage] bootstrap not ready and no error', { fullState: s })
        }
      })
    })
  }
</script>
