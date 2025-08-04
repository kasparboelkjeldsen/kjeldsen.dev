<template>
  <div>
    <PagesHomePage v-if="props.data.contentType === 'homePage'" :data="data" />
    <PagesBlogPostContainerPage
      v-else-if="props.data.contentType === 'blogPostContainerPage'"
      :data="data"
    />
    <PagesBlogPostPage
      v-else-if="props.data.contentType === 'blogPostPage'"
      :data="data"
    />
    <div v-else>
      <pre>{{ data }}</pre>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IApiContentResponseModel } from "~/../server/delivery-api";

const props = defineProps<{ data: IApiContentResponseModel }>();
</script>

<style></style>
