<template>
  <PageHero
    :image="backdrop.src"
    :image-set="backdrop.srcset"
    :eyebrow="content.name ?? 'kjeldsen.dev'"
    :title="title"
    size="xl"
  >
    <template v-if="hero.lede" #lede>
      <RteBlock :block="hero.lede" class="rte-lede" />
    </template>

    <template #meta>
      <div class="mt-9 flex flex-wrap items-center gap-3">
        <NuxtLink v-if="blogPath" :to="blogPath" class="btn btn-primary">
          Read the blog <span class="arrow" aria-hidden="true">→</span>
        </NuxtLink>
        <a href="https://github.com/kasparboelkjeldsen/kjeldsen.dev" class="btn" rel="noopener" target="_blank">
          Source on GitHub
        </a>
      </div>
    </template>
  </PageHero>

  <section v-if="hero.rest" class="container-prose pb-8 md:pb-12">
    <BlockGrid :grid="hero.rest" />
  </section>

  <section v-if="posts.length" class="container-wide py-16 md:py-24">
    <div v-reveal class="reveal mb-10 flex flex-wrap items-end justify-between gap-6">
      <div>
        <p class="eyebrow">Latest writing</p>
        <h2 class="display mt-3 text-4xl md:text-5xl">From the blog</h2>
      </div>
      <NuxtLink v-if="blogPath" :to="blogPath" class="btn">
        All posts <span class="arrow" aria-hidden="true">→</span>
      </NuxtLink>
    </div>

    <div class="grid gap-6 md:grid-cols-3">
      <div v-for="(post, i) in posts" :key="post.id" v-reveal="{ delay: i * 100 }" class="reveal flex">
        <PostCard :post="post" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import PageHero from '~/components/site/PageHero.vue'
  import BlockGrid from '~/components/content/BlockGrid.vue'
  import PostCard from '~/components/content/PostCard.vue'
  import RteBlock from '~/components/blocks/RteBlock.vue'
  import { markText } from '~/utils/marks'
  import { liftHero } from '~/utils/hero'
  import { cmsSrcset, UNSPLASH, unsplash, unsplashSrcset, withWidth } from '~/utils/images'
  import { gridOf, type PageContent } from '~~/types/content'

  const props = defineProps<{ content: Extract<PageContent, { contentType: 'homePage' }> }>()

  // The hero is the page's own opening blocks: the H1 becomes the title, the first paragraph
  // after it the lede. See utils/hero.ts.
  const hero = computed(() => liftHero(gridOf(props.content)))
  const title = computed(() => markText(hero.value.title || props.content.name || 'kjeldsen.dev'))

  // The editor's background picture if one is set; the Earth at night otherwise.
  const backdrop = computed(() => {
    const media = props.content.properties?.background?.[0]
    if (media?.url) {
      return { src: withWidth(media.url, 1800), srcset: cmsSrcset(media.url) }
    }
    return { src: unsplash(UNSPLASH.earth, 1800), srcset: unsplashSrcset(UNSPLASH.earth) }
  })

  // Where the blog lives is the editor's call, made in the navigation links.
  const blogPath = computed(
    () =>
      props.content.properties?.links?.find((l) => l.destinationType === 'blogPostContainerPage')?.route
        ?.path ?? null
  )

  const { data } = await useChildren(blogPath.value)

  const posts = computed(() => (data.value ?? []).slice(0, 3))
</script>
