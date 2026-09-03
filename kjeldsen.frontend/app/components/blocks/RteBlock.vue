<template>
  <!-- Markup is authored in our own backoffice and sanitised there (Umbraco:CMS:Global:SanitizeTinyMce),
       so rendering it as HTML is the intended path for a headless RTE. It is still the one place in
       this app where CMS content becomes markup - keep it that way. -->
  <div v-if="markup" class="rte" v-html="markup" />
</template>

<script setup lang="ts">
  import type { RteBlockElementModel } from '~~/server/delivery-api'
  import { markMarkup } from '~/utils/marks'

  const props = defineProps<{ block: RteBlockElementModel }>()
  const markup = computed(() => markMarkup(props.block.properties?.richText?.markup))
</script>
