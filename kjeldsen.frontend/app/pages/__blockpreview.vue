<template>
  <!-- The id is what the CMS scrapes: HeadlessBlockPreview:Selector. -->
  <div id="__preview">
    <BlockResolver v-if="block" :block="block" />
  </div>
</template>

<script setup lang="ts">
  import BlockResolver from '~/components/content/BlockResolver.vue'
  import type { AnyBlock } from '~~/types/content'

  // No layout: the CMS wants the block on its own, not the site's header and footer around it.
  definePageMeta({ layout: false })

  // Server-only by nature. The block arrives on the request that asked for this page (see
  // server/middleware/block-preview.ts), so there is nothing for a browser to render here.
  const event = useRequestEvent()
  const block = event?.context.blockPreview as AnyBlock | null | undefined
</script>
