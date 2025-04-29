<template>
  <div>
    <BlocksFunTimeWebEkg
      v-if="props.data.contentType === 'funTimeWebEkg'"
      :data="props.data"
    />
    <BlocksRteBlock
      v-else-if="props.data.contentType === 'rteBlock'"
      :data="props.data"
    />
    <BlocksFunTimeWebMurderBlock
      v-else-if="props.data.contentType === 'funTimeWebMurderBlock'"
      :data="props.data"
    />
    <BlocksCodeBlock
      v-else-if="props.data.contentType === 'codeBlock'"
      :data="props.data"
    />
    <BlocksImageBlock
      v-else-if="props.data.contentType === 'imageBlock'"
      :data="props.data"
    />
    <pre v-else>{{ props.data }}</pre>
  </div>
</template>

<script lang="ts" setup>
import { BlocksCodeBlock, BlocksFunTimeWebMurderBlock } from "#components";
import type { IApiElementModel } from "~/server/delivery-api";

const props = defineProps<{ data: IApiElementModel }>();
</script>

<style></style>
