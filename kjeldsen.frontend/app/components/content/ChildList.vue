<template>
  <ul class="flex flex-col gap-2">
    <li v-for="child in children" :key="child.id">
      <NuxtLink :to="child.path ?? '/'" class="underline underline-offset-4">
        {{ child.name }}
      </NuxtLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
  import type { ChildSummary } from '~~/server/api/content-children'

  const props = defineProps<{ path: string }>()

  const { data } = await useAsyncData<ChildSummary[]>(
    `children:${props.path}`,
    () => $fetch<ChildSummary[]>('/api/content-children', { query: { path: props.path } }),
    { default: () => [], deep: false }
  )

  const children = computed(() => data.value ?? [])
</script>
