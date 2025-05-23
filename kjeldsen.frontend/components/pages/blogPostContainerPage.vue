<template>
  <section class="px-4 pb-24 max-w-6xl mx-auto">
    <h1 class="text-4xl font-bold leading-tight tracking-tight mb-10">Blog</h1>

    <ul class="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
      <li
        v-for="child in blogPosts"
        :key="child.id"
        class="bg-zinc-900 rounded-xl overflow-hidden shadow hover:shadow-xl transition-shadow"
      >
        <a :href="child.route?.path ?? '#'" class="block group h-full">
          <div v-if="child.properties.seoListImage?.[0]?.url">
            <img 
              :src="child.properties.seoListImage[0].url"
              alt=""
              class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div class="p-6">
            <p v-if="child.properties.writer" class="text-white">{{ GetWriter(child.properties.writer) }}</p>
            <h2 class="text-xl font-semibold mb-2 text-white">
              {{ child.properties.seoTitle }}
            </h2>
            <p class="text-gray-400 text-sm">
              {{ child.properties.seoDescription }}
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
  PagedIApiContentResponseModel
} from "~/server/delivery-api";

// ✅ Define props like before
const props = defineProps<{
  data: BlogPostContainerPageContentResponseModel;
}>();

// ✅ Helper remains unchanged
function GetWriter(model: IApiContentModel[]) {
  
  return model
    .map((item) => (item as WriterContentModel).properties?.writerName)
    .filter((name): name is string => !!name)
    .join(", ");
}

// ✅ Now calling your secure API endpoint instead of content.children()
const { data: children } = await useFetch<PagedIApiContentResponseModel>(`/api/content/children/${props.data.id}`,{ server: true });


// ✅ Fully typed!
const blogPosts = children.value?.items as BlogPostPageContentResponseModel[];
</script>

<style></style>
