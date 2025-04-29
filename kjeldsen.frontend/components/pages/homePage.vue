<template>
  <div>
    <h1>{{ props.data.properties.seoTitle ?? props.data.name}}</h1>
  </div>
</template>

<script lang="ts" setup>
import type { HomePageContentResponseModel } from "~/server/delivery-api";

// Define props to accept data passed to the component
const props = defineProps<{ data: HomePageContentResponseModel }>();
</script>

<style></style>
