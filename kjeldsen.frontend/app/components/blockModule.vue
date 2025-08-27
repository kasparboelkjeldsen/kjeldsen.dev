<template>
  <div class="mb-2 text-white" v-for="(item, index) in data.items" :key="index">
      <BlocksResolverComponent v-if="item.content" :data="item.content" :columns="12" />
  </div>
</template>

<script lang="ts" setup>
import type { ApiBlockListModel } from '~/../server/delivery-api';

const props = defineProps<{
  data: ApiBlockListModel;
}>();

</script>