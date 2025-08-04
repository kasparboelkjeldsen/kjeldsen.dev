<template>
  <div>
    <h1>{{ data.properties.seoTitle ?? data.name }}</h1>
    <h3>{{ data.properties.writer?.at(0)?.name }}</h3>
    <GridModule v-if="data.properties.grid" :data="data.properties.grid" />
  </div>
</template>

<script lang="ts" setup>
import type { BlogPostPageContentResponseModel } from '~/../server/delivery-api';

defineProps<{
  data: BlogPostPageContentResponseModel;
}>();

</script>

<style scoped>
 h3 {
  color: white;
 }
</style>