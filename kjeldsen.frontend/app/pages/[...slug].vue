<template>
  <component :is="slugComponent" />
</template>

<script setup lang="ts">
  import DefaultSlug from '~/components/slugs/defaultSlug.vue'
  import ZooSlug from '~/components/slugs/zooSlug.vue'

  const route = useRoute()
  const slugComponent = computed(() => (route.path.startsWith('/zoo') ? ZooSlug : DefaultSlug))
</script>
