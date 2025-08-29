<template>
  <section class="max-w-6xl px-4 pb-24 mx-auto">
    <h1 class="mb-10 text-4xl font-bold leading-tight tracking-tight">Blog</h1>

    <ul class="grid pl-0 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
      <li
        v-for="child in blogPosts"
        :key="child.id"
        class="overflow-hidden transition-shadow shadow bg-zinc-900 rounded-xl hover:shadow-xl"
      >
        <a :href="child.route?.path ?? '#'" class="block h-full no-underline group">
          <div v-if="child.properties?.seoListImage?.[0]?.url">
            <img
              :src="child.properties.seoListImage[0].url"
              alt=""
              class="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div class="p-6">
            <p v-if="child.properties?.writer" class="text-white">
              {{ GetWriter(child.properties.writer) }}
            </p>
            <h2 class="mb-2 text-xl font-semibold text-white">
              {{ child.properties?.seoTitle }}
            </h2>
            <p class="text-sm text-gray-400">
              {{ child.properties?.seoDescription }}
            </p>
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
  const blogPosts = children.value?.items as BlogPostPageContentResponseModel[]
</script>

<style></style>
