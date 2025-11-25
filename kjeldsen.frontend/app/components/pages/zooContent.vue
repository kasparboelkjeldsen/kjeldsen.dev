<template>
  <div class="relative min-h-screen py-24 bg-[var(--zoo-secondary-1)] overflow-hidden">
    <div class="relative z-10 max-w-4xl px-6 mx-auto">
      <GridModule v-if="data?.properties?.grid" :data="data.properties.grid" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { ZooContentContentResponseModel } from '~~/server/delivery-api'

  defineProps<{ data: ZooContentContentResponseModel }>()
</script>
