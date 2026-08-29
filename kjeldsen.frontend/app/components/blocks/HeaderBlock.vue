<template>
  <component :is="tag" :class="sizeClass">{{ block.properties.headerTitle }}</component>
</template>

<script setup lang="ts">
  import type { HeaderBlock } from '~~/types/content'

  const props = defineProps<{ block: HeaderBlock }>()

  // headerLevel comes back as either a number or a string depending on the datatype.
  const level = computed(() => {
    const raw = props.block.properties.headerLevel
    const n = typeof raw === 'string' ? parseInt(raw.replace(/\D/g, ''), 10) : raw
    return Number.isFinite(n) && n! >= 1 && n! <= 6 ? (n as number) : 2
  })

  const tag = computed(() => `h${level.value}`)
  const sizeClass = computed(
    () => ({ 1: 'text-2xl', 2: 'text-xl', 3: 'text-lg' })[level.value] ?? 'text-base'
  )
</script>
