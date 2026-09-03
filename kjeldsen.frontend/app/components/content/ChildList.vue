<template>
  <div v-if="children.length" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    <div
      v-for="(child, i) in children"
      :key="child.id"
      v-reveal="{ delay: Math.min(i, 5) * 90 }"
      class="reveal flex"
      :class="{ 'md:col-span-2 lg:col-span-3': i === 0 }"
    >
      <!-- The newest post leads, full width, with the picture beside the words. -->
      <PostCard :post="child" :featured="i === 0" />
    </div>
  </div>

  <p v-else class="text-fg-2">Nothing published here yet.</p>
</template>

<script setup lang="ts">
  import PostCard from './PostCard.vue'

  const props = defineProps<{ path: string }>()

  const { data } = await useChildren(props.path)

  // Already ordered newest-first by the endpoint, which is the only place that knows the rule.
  const children = computed(() => data.value ?? [])
</script>
