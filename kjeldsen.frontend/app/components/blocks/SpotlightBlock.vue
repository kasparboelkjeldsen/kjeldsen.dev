<template>
  <section class="border-l-2 pl-4">
    <img v-if="icon" :src="icon" alt="" class="mb-2 h-10 w-10" >
    <h2 v-if="block.properties.header" class="text-lg font-semibold">
      {{ block.properties.header }}
    </h2>
    <div v-if="markup" class="rte mt-1" v-html="markup" />
  </section>
</template>

<script setup lang="ts">
  import type { SpotlightBlock } from '~~/types/content'

  const props = defineProps<{ block: SpotlightBlock }>()

  const markup = computed(() => props.block.properties.text?.markup ?? '')

  // Media picker properties arrive as an array even when the editor picks one item.
  const icon = computed(() => props.block.properties.iconImage?.[0]?.url ?? '')
</script>
