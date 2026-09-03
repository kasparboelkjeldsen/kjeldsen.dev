<template>
  <PageHero :title="title" size="md">
    <template v-if="hero.lede" #lede>
      <RteBlock :block="hero.lede" class="rte-lede" />
    </template>
  </PageHero>

  <section class="container-prose pb-8">
    <BlockGrid v-if="hero.rest" :grid="hero.rest" />
  </section>
</template>

<script setup lang="ts">
  import PageHero from '~/components/site/PageHero.vue'
  import BlockGrid from '~/components/content/BlockGrid.vue'
  import RteBlock from '~/components/blocks/RteBlock.vue'
  import { markText } from '~/utils/marks'
  import { liftHero } from '~/utils/hero'
  import { gridOf, type PageContent } from '~~/types/content'

  const props = defineProps<{ content: PageContent }>()

  // An opening H1 block is the page's real title; failing that, a writer's name, then the node.
  const hero = computed(() => liftHero(gridOf(props.content), false))

  const title = computed(() => {
    const named = (props.content.properties as { writerName?: string | null } | undefined)?.writerName
    return markText(hero.value.title || named || props.content.name)
  })
</script>
