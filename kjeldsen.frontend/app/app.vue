<template>
  <NuxtLayout :name="layout">
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
  import { useAppInsights } from '~/composables/useAppInsights'
  const layout = 'main'

  const { trackEvent, trackException } = useAppInsights()
</script>
