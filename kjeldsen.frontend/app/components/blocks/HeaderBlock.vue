<template>
  <component :is="tag" :class="sizeClass">{{ block.properties?.headerTitle }}</component>
</template>

<script setup lang="ts">
  import type { HeaderBlockElementModel } from '~~/server/delivery-api'

  const props = defineProps<{ block: HeaderBlockElementModel }>()

  // headerLevel is a string from the datatype ("h2", "2", ...), so pull the digits out of it.
  const level = computed(() => {
    const n = parseInt((props.block.properties?.headerLevel ?? '').replace(/\D/g, ''), 10)
    return n >= 1 && n <= 6 ? n : 2
  })

  const tag = computed(() => `h${level.value}`)
  const sizeClass = computed(
    () => ({ 1: 'text-2xl', 2: 'text-xl', 3: 'text-lg' })[level.value] ?? 'text-base'
  )
</script>
