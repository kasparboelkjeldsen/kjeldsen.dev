<template>
  <div>
    {{ data.properties }}
  </div>
</template>
<script lang="ts" setup>
import type { TestBlockElementModel} from '~/server/delivery-api';

defineProps<{
  data: TestBlockElementModel;
}>();
</script>