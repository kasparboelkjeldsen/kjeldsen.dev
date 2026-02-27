<template>
  <section class="max-w-6xl px-4 pb-24 mx-auto">
    <header class="mb-12">
      <h1 class="text-4xl font-bold leading-tight tracking-tight">Blog</h1>
      <p class="mt-2 text-lg text-gray-400">Thoughts, tutorials, and insights</p>
    </header>

    <ul class="grid gap-6 pl-0 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
      <li
        v-for="child in sortedPosts"
        :key="child.id"
        class="pl-0 overflow-hidden transition-all duration-300 border bg-zinc-900/70 rounded-2xl border-white/10 hover:border-white/20 hover:bg-zinc-900 group"
      >
        <a :href="child.route?.path ?? '#'" class="flex flex-col h-full no-underline">
          <div v-if="child.properties?.seoListImage?.[0]?.url" class="relative overflow-hidden">
            <img
              :src="child.properties.seoListImage[0].url"
              alt=""
              class="object-cover w-full transition-transform duration-500 h-52 group-hover:scale-105"
            />
            <div
              class="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-zinc-900/60 to-transparent group-hover:opacity-100"
            />
          </div>
          <div class="flex flex-col flex-1 p-6">
            <div class="flex items-center gap-3 mb-3 text-xs">
              <span
                v-if="child.properties?.writer"
                class="font-medium text-white/70"
              >
                {{ GetWriter(child.properties.writer) }}
              </span>
              <span v-if="child.properties?.writer && child.properties?.seoPublishingDate" class="text-white/30">·</span>
              <time v-if="child.properties?.seoPublishingDate" class="text-sky-400/80">
                {{ formatDate(child.properties.seoPublishingDate) }}
              </time>
            </div>
            <h2 class="mb-2 text-xl font-semibold leading-snug text-white transition-colors duration-200 group-hover:text-sky-300">
              {{ child.properties?.seoTitle }}
            </h2>
            <p class="flex-1 text-sm leading-relaxed text-gray-400 line-clamp-3">
              {{ child.properties?.seoDescription }}
            </p>
            <div class="flex items-center gap-1 mt-4 text-sm font-medium transition-colors duration-200 text-sky-400 group-hover:text-sky-300">
              Read more
              <svg class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </a>
      </li>
    </ul>
  </section>
</template>

<script lang="ts" setup>
  import type {
    BlogPostContainerPageContentResponseModel,
    BlogPostPageContentResponseModel,
    IApiContentModel,
    WriterContentModel,
    PagedIApiContentResponseModel,
  } from '~/../server/delivery-api'

  // ✅ Define props like before
  const props = defineProps<{
    data: BlogPostContainerPageContentResponseModel
  }>()

  // ✅ Helper remains unchanged
  function GetWriter(model: IApiContentModel[]) {
    return model
      .map((item) => (item as WriterContentModel).properties?.writerName)
      .filter((name): name is string => !!name)
      .join(', ')
  }

  // ✅ Now calling your secure API endpoint instead of content.children()
  const { data: children } = await useFetch<PagedIApiContentResponseModel>(
    `/api/content/children/${props.data.id}`,
    { server: true }
  )

  // ✅ Fully typed!
  const blogPosts = (children.value?.items as BlogPostPageContentResponseModel[]) ?? []

  function parseDate(post: BlogPostPageContentResponseModel): number {
    const raw = post.properties?.seoPublishingDate
    if (!raw) return 0
    const d = new Date(raw)
    return isNaN(d.getTime()) ? 0 : d.getTime()
  }

  const sortedPosts = computed(() => {
    return [...blogPosts].sort((a, b) => parseDate(b) - parseDate(a))
  })

  function formatDate(raw: string) {
    const d = new Date(raw)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    })
  }
</script>

<style></style>
