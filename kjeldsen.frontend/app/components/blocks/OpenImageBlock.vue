<template>
  <ImageBlock :block="block" zoom />
</template>

<script setup lang="ts">
  /**
   * The Image block that opens: the same picture, crop ladder and caption, as a button that shows
   * the whole uncropped image in a lightbox (ImageLightbox.vue) with zoom and pan.
   */
  import type { OpenImageBlockElementModel } from '~~/server/delivery-api'
  import ImageBlock from '~/components/blocks/ImageBlock.vue'

  defineProps<{ block: OpenImageBlockElementModel }>()
</script>
