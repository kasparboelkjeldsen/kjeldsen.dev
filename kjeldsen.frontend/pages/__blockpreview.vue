<template>
  <div id="__preview"><BlocksResolverComponent :data="data" /></div>
</template>

<script setup lang="ts">
import { BlocksResolverComponent } from '#components';
import type { IApiElementModel } from '~/server/delivery-api'

const event = useRequestEvent()

const data = event?.context.body.content as IApiElementModel;

</script>