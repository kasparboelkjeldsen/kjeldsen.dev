<template>
  <div class="relative min-h-screen py-24 bg-[var(--zoo-secondary-1)] overflow-hidden">
    <!-- Background Image -->
    <div v-if="splash" class="absolute inset-0">
      <img :src="splash" class="object-cover w-full h-full" alt="" />
      <div class="absolute inset-0 bg-black/40"></div>
    </div>

    <div class="relative z-10 max-w-4xl px-6 mx-auto text-center">
      <h1
        class="mt-8 mb-8 text-5xl font-black uppercase"
        :class="splash ? 'text-white drop-shadow-lg' : 'text-[var(--zoo-primary-1)]'"
      >
        {{ data.properties?.headTitle }}
      </h1>
      <GridModule v-if="data?.properties?.grid" :data="data.properties.grid" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { ZooCtaPageContentResponseModel } from '~~/server/delivery-api'

  // Placeholder component for Zoo CTA Page
  const props = defineProps<{ data: ZooCtaPageContentResponseModel }>()

  const splash = computed(() => props.data.properties?.splash?.at(0)?.url ?? '')
</script>
