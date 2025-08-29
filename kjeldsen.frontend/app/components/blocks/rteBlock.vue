<template>
  <div class="text-white" v-html="data.properties?.richText?.markup" />
</template>
<script lang="ts" setup>
  import type { RteBlockElementModel } from '~/../server/delivery-api'

  defineProps<{
    data: RteBlockElementModel
  }>()
</script>
<style lang="css">
  /* Headings stay white, but strong/b/bold should be sky-300 */
  h2 {
    color: white !important;
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
