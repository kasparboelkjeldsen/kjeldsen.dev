<template>
  <div class="prose">
    <h1
      v-if="data.properties?.headerLevel === 'H1'"
      class="text-white prose-h1"
      v-html="styledHeader"
    ></h1>
    <h2
      v-else-if="data.properties?.headerLevel === 'H2'"
      class="text-white prose-h2"
      v-html="styledHeader"
    ></h2>
    <h3
      v-else-if="data.properties?.headerLevel === 'H3'"
      class="text-white prose-h3"
      v-html="styledHeader"
    ></h3>
    <h4
      v-else-if="data.properties?.headerLevel === 'H4'"
      class="text-white prose-h4"
      v-html="styledHeader"
    ></h4>
    <h5
      v-else-if="data.properties?.headerLevel === 'H5'"
      class="text-white prose-h5"
      v-html="styledHeader"
    ></h5>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue'
  import type { HeaderBlockElementModel } from '~/../server/delivery-api'

  const props = defineProps<{
    data: HeaderBlockElementModel
  }>()

  const styledHeader = computed(() => {
    const raw = props.data.properties?.headerTitle ?? ''
    // Convert custom --highlight-- markers and **bold** markers into styled spans
    // Use a tasteful red accent (red-300)
    return raw
      .replace(/--([\s\S]+?)--/g, '<span class="text-red-300">$1</span>')
      .replace(/\*\*([\s\S]+?)\*\*/g, '<span class="text-sky-300">$1</span>')
  })
</script>
