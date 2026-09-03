<template>
  <!-- Markup is authored in our own backoffice and sanitised there (Umbraco:CMS:Global:SanitizeTinyMce),
       so rendering it as HTML is the intended path for a headless RTE. It is still the one place in
       this app where CMS content becomes markup - keep it that way. -->
  <div v-if="markup" class="rte" v-html="markup" />
</template>

<script setup lang="ts">
  import type { RteBlockElementModel } from '~~/server/delivery-api'

  const props = defineProps<{ block: RteBlockElementModel }>()
  const markup = computed(() => props.block.properties?.richText?.markup ?? '')
</script>

<style scoped>
  /* Structural only: the RTE emits bare tags, and without this everything collapses into one
     undifferentiated run of text. Real typography comes with the design. */
  .rte :deep(p) {
    margin-block: 0.75rem;
  }
  .rte :deep(ul),
  .rte :deep(ol) {
    margin-block: 0.75rem;
    padding-inline-start: 1.5rem;
    list-style: revert;
  }
  .rte :deep(a) {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  .rte :deep(h1),
  .rte :deep(h2),
  .rte :deep(h3) {
    margin-block: 1.25rem 0.5rem;
    font-weight: 600;
  }
</style>
