<template>
  <PageHero :image="backdrop.src" :image-set="backdrop.srcset" :eyebrow="eyebrow" :title="title" size="lg" />

  <section class="container-wide">
    <ChildList :path="content.route?.path ?? '/'" />
  </section>
</template>

<script setup lang="ts">
  import PageHero from '~/components/site/PageHero.vue'
  import ChildList from '~/components/content/ChildList.vue'
  import { markText } from '~/utils/marks'
  import { UNSPLASH, unsplash, unsplashSrcset } from '~/utils/images'
  import type { PageContent } from '~~/types/content'

  const props = defineProps<{ content: PageContent }>()

  const isWriters = computed(() => props.content.contentType === 'writerContainerPage')

  const eyebrow = computed(() => (isWriters.value ? 'People' : 'Writing'))

  // Container names are lower-case in the tree ("blog"); a title wants a capital.
  const title = computed(() => {
    const name = props.content.name ?? ''
    return markText(name.charAt(0).toUpperCase() + name.slice(1))
  })

  const backdrop = computed(() => {
    const id = isWriters.value ? UNSPLASH.stars : UNSPLASH.nebula
    return { src: unsplash(id, 1800), srcset: unsplashSrcset(id) }
  })
</script>
