<template>
  <div class="prose">
    <h1
      v-if="data.properties?.headerLevel === 'H1'"
      class="prose-h1"
      :style="{ color: 'var(--zoo-primary-1)' }"
      v-html="styledHeader"
    ></h1>
    <h2
      v-else-if="data.properties?.headerLevel === 'H2'"
      class="prose-h2"
      :style="{ color: 'var(--zoo-primary-1)' }"
      v-html="styledHeader"
    ></h2>
    <h3
      v-else-if="data.properties?.headerLevel === 'H3'"
      class="prose-h3"
      :style="{ color: 'var(--zoo-primary-1)' }"
      v-html="styledHeader"
    ></h3>
    <h4
      v-else-if="data.properties?.headerLevel === 'H4'"
      class="prose-h4"
      :style="{ color: 'var(--zoo-primary-1)' }"
      v-html="styledHeader"
    ></h4>
    <h5
      v-else-if="data.properties?.headerLevel === 'H5'"
      class="prose-h5"
      :style="{ color: 'var(--zoo-primary-1)' }"
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
    // Using Zoo theme variables
    return raw
      .replace(/--([\s\S]+?)--/g, '<span style="color: var(--zoo-primary-2)">$1</span>')
      .replace(/\*\*([\s\S]+?)\*\*/g, '<span style="color: var(--zoo-secondary-2)">$1</span>')
  })
</script>
