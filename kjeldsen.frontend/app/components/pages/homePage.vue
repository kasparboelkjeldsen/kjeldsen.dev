<template>
  <div>
    <GridModule v-if="data?.properties?.grid" :data="data.properties.grid" />
  </div>
</template>

<script lang="ts" setup>
  import type { HomePageContentResponseModel } from '~/../server/delivery-api'

  // Define props to accept data passed to the component
  const props = defineProps<{ data: HomePageContentResponseModel }>()
</script>

<style></style>
