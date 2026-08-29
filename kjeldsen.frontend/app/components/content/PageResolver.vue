<template>
  <article>
    <h1 class="text-2xl font-semibold">{{ content.name }}</h1>
    <p class="mt-1 text-xs opacity-60">{{ content.contentType }}</p>

    <!-- Every page type on this site is a grid of blocks, so one path covers them all.
         Add a per-type component here only when a type genuinely needs different chrome. -->
    <BlockGrid v-if="grid" :grid="grid" class="mt-8" />

    <ChildList v-if="showsChildren" :path="content.route?.path ?? '/'" class="mt-8" />
  </article>
</template>

<script setup lang="ts">
  import BlockGrid from './BlockGrid.vue'
  import ChildList from './ChildList.vue'
  import { gridOf, type PageContent } from '~~/types/content'

  const props = defineProps<{ content: PageContent }>()

  const grid = computed(() => gridOf(props.content))

  // Container types list their children instead of carrying their own grid.
  const containerTypes = ['blogPostContainerPage', 'writerContainerPage']
  const showsChildren = computed(() => containerTypes.includes(props.content.contentType ?? ''))
</script>
