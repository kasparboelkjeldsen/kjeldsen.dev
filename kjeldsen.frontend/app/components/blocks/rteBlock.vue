<template>
  <div class="text-white" v-html="processedMarkup" />
</template>
<script lang="ts" setup>
  import { computed } from 'vue'
  import type { RteBlockElementModel } from '~/../server/delivery-api'

  const props = defineProps<{
    data: RteBlockElementModel
  }>()

  // Apply same custom marker logic as headerBlock: --highlight-- & **bold**
  const processedMarkup = computed(() => {
    const raw = props.data.properties?.richText?.markup || ''
    return raw
      .replace(/--([\s\S]+?)--/g, '<span class="text-red-300">$1<\/span>')
      .replace(/\*\*([\s\S]+?)\*\*/g, '<span class="text-sky-300">$1<\/span>')
  })
</script>
<style lang="css">
  /* Headings stay white, but strong/b/bold should be sky-300 */
  h2 {
    color: white;
  }
  p strong,
  p b,
  p bold,
  strong,
  b,
  bold {
    color: rgb(125, 211, 252) !important; /* tailwind sky-300 */
  }
  p a {
    color: white !important;
    text-decoration: underline !important;
  }

  p:first-child {
    margin-top: 0 !important;
  }

  p {
    margin-top: 1rem !important;
    margin-bottom: 1rem !important;
  }
</style>
