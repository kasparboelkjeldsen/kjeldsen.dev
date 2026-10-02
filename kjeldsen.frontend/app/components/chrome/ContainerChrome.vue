<template>
  <PageHero :image="backdrop.src" :image-set="backdrop.srcset" :graphic="graphic" :eyebrow="eyebrow" :title="title" size="lg" />

  <section class="container-wide">
    <ChildList :path="content.route?.path ?? '/'" />
  </section>
</template>

<script setup lang="ts">
  import PageHero from '~/components/site/PageHero.vue'
  import ChildList from '~/components/content/ChildList.vue'
  import { markText } from '~/utils/marks'
  import { cmsSrcset, UNSPLASH, unsplash, unsplashSrcset, withWidth } from '~/utils/images'
  import { generatedGraphicOf } from '~/utils/graphics'
  import type { IApiMediaWithCropsModel } from '~~/server/delivery-api'
  import type { PageContent } from '~~/types/content'

  const props = defineProps<{ content: PageContent }>()

  const isWriters = computed(() => props.content.contentType === 'writerContainerPage')

  const eyebrow = computed(() => (isWriters.value ? 'People' : 'Writing'))

  // Container names are lower-case in the tree ("blog"); a title wants a capital.
  const title = computed(() => {
    const name = props.content.name ?? ''
    return markText(name.charAt(0).toUpperCase() + name.slice(1))
  })

  // The editor's background on the container type, where the type has one (the blog container
  // does; the writers' does not yet). A Generated Graphics item is drawn full-bleed; a photo is
  // served through the media route; nothing picked means the nebula or the stars from Unsplash.
  const media = computed(
    () => (props.content.properties as { background?: IApiMediaWithCropsModel[] | null } | undefined)?.background?.[0] ?? null
  )
  const graphic = computed(() => generatedGraphicOf(media.value))

  const backdrop = computed(() => {
    if (media.value?.url && !graphic.value) {
      return { src: withWidth(media.value.url, 1800), srcset: cmsSrcset(media.value.url) }
    }
    const id = isWriters.value ? UNSPLASH.stars : UNSPLASH.nebula
    return { src: unsplash(id, 1800), srcset: unsplashSrcset(id) }
  })
</script>
