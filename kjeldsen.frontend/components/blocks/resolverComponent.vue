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
      :data="props.data" :columns="props.columns"
    />
    <BlocksTestBlock
      v-else-if="props.data.contentType === 'testBlock'"
      :data="props.data"
    />
    <BlocksHeaderBlock
      v-else-if="props.data.contentType === 'headerBlock'"
      :data="props.data"
    />
    <div v-else>
      <h1>{{ props.data.contentType }}</h1>
      <pre>{{ props.data }}</pre>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BlocksCodeBlock, BlocksFunTimeWebMurderBlock, BlocksFunTimeWebEkg, BlocksRteBlock, BlocksImageBlock, BlocksTestBlock, BlocksHeaderBlock } from "#components";
import type { IApiElementModel } from "~/server/delivery-api";

const props = defineProps<{ data: IApiElementModel, columns: number }>();

</script>

<style></style>
