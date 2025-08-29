<template>
  <div id="__preview">
    <BlocksResolverComponent :data="data" :columns="12" class="max-w-4xl prose prose-invert" />
  </div>
</template>

<script setup lang="ts">
  import { BlocksResolverComponent } from '#components'
  import type { IApiElementModel } from '~/../server/delivery-api'

  const event = useRequestEvent()

  const data = event?.context.body.content as IApiElementModel
</script>
