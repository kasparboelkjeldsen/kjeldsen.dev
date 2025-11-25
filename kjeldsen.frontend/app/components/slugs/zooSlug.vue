<template>
  <ZooPageResolverComponent v-if="data" :data="data" />
</template>

<script lang="ts" setup>
  import ZooPageResolverComponent from '~/components/pages/ZooPageResolverComponent.vue'
  import { usePageContentFromRoute } from '~/composables/useContent'
  import { useZooHeader } from '~/composables/useZooHeader'

  const { data } = await usePageContentFromRoute()
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
</script>
