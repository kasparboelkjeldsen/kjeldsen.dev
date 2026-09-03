<template>
  <ReadingProgress />

  <PageHero :image="image?.src" :image-set="image?.srcset" :title="title" :lede="description ?? undefined" size="lg">
    <template #eyebrow>
      <time v-if="date" :datetime="date">{{ formatDate(date) }}</time>
      <span v-if="date && author"> · </span>
      <span v-if="author">{{ author }}</span>
      <span> · {{ minutes }} min read</span>
    </template>
  </PageHero>

  <div class="container-wide">
    <div class="xl:grid xl:grid-cols-[1fr_44rem_1fr] xl:gap-10">
      <div class="hidden xl:block"></div>

      <article class="container-prose min-w-0 xl:max-w-none xl:px-0">
        <BlockGrid v-if="grid" :grid="grid" />
      </article>

      <aside class="hidden xl:block">
        <PostOutline v-if="grid" :grid="grid" class="sticky top-32" />
      </aside>
    </div>

    <nav class="container-prose mt-20 flex items-center justify-between gap-4 border-t border-line pt-8" aria-label="Post">
      <NuxtLink :to="parentPath" class="btn">
        <span class="arrow" aria-hidden="true">←</span> All posts
      </NuxtLink>
      <p v-if="date" class="font-mono text-xs text-muted">Published {{ formatDate(date) }}</p>
    </nav>
  </div>
</template>

<script setup lang="ts">
  import PageHero from '~/components/site/PageHero.vue'
  import ReadingProgress from '~/components/site/ReadingProgress.vue'
  import BlockGrid from '~/components/content/BlockGrid.vue'
  import PostOutline from '~/components/content/PostOutline.vue'
  import { markText } from '~/utils/marks'
  import { formatDate, readingMinutes } from '~/utils/dates'
  import { cmsSrcset, withWidth } from '~/utils/images'
  import { gridOf, type PageContent } from '~~/types/content'

  const props = defineProps<{ content: Extract<PageContent, { contentType: 'blogPostPage' }> }>()

  const grid = computed(() => gridOf(props.content))
  const seo = computed(() => props.content.properties)

  const title = computed(() => markText(seo.value?.seoTitle || props.content.name))
  const description = computed(() => seo.value?.seoDescription || null)
  const date = computed(() => seo.value?.seoPublishingDate || null)

  // The writer is a content picker; expanded or not, its name is on the item.
  const author = computed(() => {
    const writer = seo.value?.writer?.[0]
    const named = writer?.properties as { writerName?: string | null } | undefined
    return named?.writerName || writer?.name || null
  })

  const image = computed(() => {
    const url = seo.value?.seoListImage?.[0]?.url
    return url ? { src: withWidth(url, 1800), srcset: cmsSrcset(url) } : null
  })

  // Reading time from everything the post actually says: rich text, spotlights and headings.
  const minutes = computed(() => {
    const text = (grid.value?.items ?? [])
      .map((item) => {
        const p = item.content?.properties as
          | { richText?: { markup?: string } | null; text?: { markup?: string } | null; headerTitle?: string | null }
          | undefined
        return p?.richText?.markup ?? p?.text?.markup ?? p?.headerTitle ?? ''
      })
      .join(' ')
    return readingMinutes(text)
  })

  // The listing this post belongs to: one segment up.
  const parentPath = computed(() => {
    const path = props.content.route?.path ?? '/'
    const parent = path.replace(/\/+$/, '').replace(/[^/]+$/, '')
    return parent || '/'
  })
</script>
