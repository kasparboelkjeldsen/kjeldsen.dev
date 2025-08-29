<template>
  <div>
    <h1>{{ data.properties?.seoTitle ?? data.name }}</h1>
    <address class="text-base text-sky-300" itemprop="author">
      {{ data.properties?.writer?.at(0)?.name }}
    </address>
    <GridModule v-if="data.properties?.grid" :data="data.properties.grid" />
  </div>
</template>

<script lang="ts" setup>
import type { BlogPostPageContentResponseModel } from '~/../server/delivery-api';

defineProps<{
  data: BlogPostPageContentResponseModel;
}>();

</script>
