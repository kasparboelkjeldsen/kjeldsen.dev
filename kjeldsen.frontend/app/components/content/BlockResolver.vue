<template>
  <component :is="resolved" v-if="resolved" :block="block" />

  <!-- Unknown block types stay visible rather than disappearing silently. In a headless setup
       an editor can add a doctype before the frontend knows about it, and a blank space is a
       much worse failure than a labelled placeholder. -->
  <div v-else class="border border-dashed p-3 text-sm">
    <strong>{{ block.contentType }}</strong>
    <span class="opacity-60"> — no component</span>
  </div>
</template>

<script setup lang="ts">
  import { defineAsyncComponent } from 'vue'
  import type { AnyBlock } from '~~/types/content'

  const props = defineProps<{ block: AnyBlock }>()

  // Async so each block lands in its own chunk instead of the entry bundle.
  const blocks: Record<string, ReturnType<typeof defineAsyncComponent>> = {
    headerBlock: defineAsyncComponent(() => import('~/components/blocks/HeaderBlock.vue')),
    rteBlock: defineAsyncComponent(() => import('~/components/blocks/RteBlock.vue')),
    codeBlock: defineAsyncComponent(() => import('~/components/blocks/CodeBlock.vue')),
    spotlightBlock: defineAsyncComponent(() => import('~/components/blocks/SpotlightBlock.vue')),
    vimeoBlock: defineAsyncComponent(() => import('~/components/blocks/VimeoBlock.vue')),
  }

  const resolved = computed(() => blocks[props.block.contentType] ?? null)
</script>
