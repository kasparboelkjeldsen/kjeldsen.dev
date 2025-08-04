<template>
  <div class="font-mono">
    <MDC :value="props.data.properties?.code" />
  </div>
</template>
<script lang="ts" setup>
import type { CodeBlockElementModel } from "~/../server/delivery-api";

const props = defineProps<{
  data: CodeBlockElementModel;
}>();
</script>
