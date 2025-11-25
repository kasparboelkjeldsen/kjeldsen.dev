<template>
  <component :is="resolveComponent(data.contentType)" :data="data" />
</template>

<script lang="ts" setup>
  import ZooHomepage from '~/components/pages/zooHomepage.vue'
  import ZooCtaPage from '~/components/pages/zooCtaPage.vue'
  import ZooContent from '~/components/pages/zooContent.vue'
  import Animals from './Animals.vue'
  import Animal from '~/components/pages/animal.vue'
  import type { IApiContentResponseModel } from '~~/server/delivery-api'

  const props = defineProps<{ data: IApiContentResponseModel }>()

  const resolveComponent = (contentType: string) => {
    switch (contentType) {
      case 'zooHomepage':
        return ZooHomepage
      case 'zooCtaPage':
        return ZooCtaPage
      case 'zooContent':
        return ZooContent
      case 'animals':
        return Animals
      case 'animal':
        return Animal
      default:
        return 'div' // Fallback or error component
    }
  }
</script>
