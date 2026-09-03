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

  // `contentType` is the union discriminant, so this narrows for free at every call site.
  type BlockType = NonNullable<AnyBlock['contentType']>

  // Async so each block lands in its own chunk instead of the entry bundle. Partial<> because we
  // deliberately do not have a component for every block type — the fallback below covers the rest.
  const blocks: Partial<Record<BlockType, ReturnType<typeof defineAsyncComponent>>> = {
    headerBlock: defineAsyncComponent(() => import('~/components/blocks/HeaderBlock.vue')),
    rteBlock: defineAsyncComponent(() => import('~/components/blocks/RteBlock.vue')),
    codeBlock: defineAsyncComponent(() => import('~/components/blocks/CodeBlock.vue')),
    spotlightBlock: defineAsyncComponent(() => import('~/components/blocks/SpotlightBlock.vue')),
    vimeoBlock: defineAsyncComponent(() => import('~/components/blocks/VimeoBlock.vue')),
    imageBlock: defineAsyncComponent(() => import('~/components/blocks/ImageBlock.vue')),
    apiUserTest: defineAsyncComponent(() => import('~/components/blocks/ApiUserTest.vue')),
    cacheKeyExampleBlock: defineAsyncComponent(
      () => import('~/components/blocks/CacheKeyExampleBlock.vue')
    ),
  }

  const resolved = computed(() => blocks[props.block.contentType as BlockType] ?? null)
</script>
