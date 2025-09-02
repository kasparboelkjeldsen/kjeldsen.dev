<template>
  <div>
    <component
      v-if="Resolved && !isIsland"
      :is="Resolved"
      :data="props.data"
      :columns="props.columns"
    />
    <NuxtIsland
      v-else-if="Resolved && isIsland"
      :name="islandList.find((island) => island.contentType === props.data.contentType)?.toRender!"
      :props="{ data: props.data, columns: props.columns }"
    />
    <div v-else>
      <h1>{{ props.data.contentType }}</h1>
      <pre>{{ props.data }}</pre>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { NuxtIsland } from '#components'
  import { defineAsyncComponent, computed } from 'vue'
  import type { IApiElementModel } from '~/../server/delivery-api'

  const props = defineProps<{ data: IApiElementModel; columns: number }>()

  // Lazy-load all blocks to avoid pulling them into the main chunk
  const mapping: Record<string, any> = {
    funTimeWebEkg: defineAsyncComponent(() => import('./funTimeWebEkg.vue')),
    rteBlock: defineAsyncComponent(() => import('./rteBlock.vue')),
    funTimeWebMurderBlock: defineAsyncComponent(() => import('./funTimeWebMurderBlock.vue')),
    //codeBlock: defineAsyncComponent(() => import('./codeBlock.island.vue')),
    imageBlock: defineAsyncComponent(() => import('./imageBlock.vue')),
    testBlock: defineAsyncComponent(() => import('./testBlock.vue')),
    headerBlock: defineAsyncComponent(() => import('./headerBlock.vue')),
    spotlightBlock: defineAsyncComponent(() => import('./spotlightBlock.vue')),
    cacheKeyExampleBlock: defineAsyncComponent(() => import('./cacheKeyExampleBlock.vue')),
    vimeoBlock: defineAsyncComponent(() => import('./vimeoBlock.vue')),
  }
  const islandList = [{ contentType: 'codeBlock', toRender: 'BlocksCodeBlock' }]

  const isIsland = computed(() =>
    islandList.some((island) => island.contentType === props.data.contentType)
  )
  const Resolved = computed(() => mapping[props.data.contentType as string] || null)
</script>

<style></style>
