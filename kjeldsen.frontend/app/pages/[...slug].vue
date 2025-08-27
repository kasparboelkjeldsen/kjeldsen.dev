<template>
  <!-- ✅ Navigation -->
  <header v-if="navigation?.properties?.links" class="relative z-10 py-6">
    <nav>
      <ul class="flex justify-center gap-8 font-mono text-lg">
        <li v-for="link in navigation.properties.links" :key="link.title!">
          <a
            :href="link.route?.path ?? '/'"
            class="transition-colors duration-200 hover:text-gray-400"
          >
            {{ link.title }}
        </a>
        </li>
      </ul>
    </nav>
  </header>

  <!-- ✅ Page content -->
  <main class="relative z-10 max-w-4xl px-4 pt-12 pb-24 mx-auto prose prose-invert">
    <PagesPageResolverComponent
      v-if="data"
      :data="data"
      class="relative z-10"
    />
      <pre v-if="!data" class="text-white">
    Failed to load content for <code>{{ apiPath }}</code>. Please check the console for more details.
  </pre>
  </main>

</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { watchEffect, ref } from "vue";
import type {
  SeoCompositionContentResponseModel,
  NavigationCompositionContentResponseModel,
  IApiContentResponseModel,
} from "~/../server/delivery-api";

const route = useRoute();
const slugArray = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug];
const cleanSlug = slugArray.filter(Boolean).join("/");
const slugHasDot = cleanSlug.includes(".");
const apiPath = "/api/content/" + cleanSlug + "/";

const data = ref<IApiContentResponseModel | null>(null);

if (!slugHasDot) {
  const result = await useFetch<IApiContentResponseModel>(apiPath, {
    server: true,
    cache: "no-cache",
  });
  if (result.error.value) {
    console.error(`Failed to fetch content for path: ${apiPath}`, result.error.value);
    data.value = null;
  } else if (result.data.value) {
    data.value = result.data.value;
  }
  
}

if (data.value?.properties?.cacheKeys) {
  const cacheKeys = data.value.properties.cacheKeys || [];
  const tags = ["reset", ...cacheKeys];

  if (import.meta.server) {
    console.table(cacheKeys.map((key, i) => ({ '#': i + 1, 'Cache Key': key })));
  }
}

const { data: navigation } =
  await useFetch<NavigationCompositionContentResponseModel>("/api/content/navigation", {
    server: true,
    cache: "no-cache",
  });

watchEffect(() => {
  if (data.value) {
    const seo = data.value as SeoCompositionContentResponseModel;
    useHead({
      title: seo?.properties?.seoTitle ?? data.value?.name,
    });
  }
});
</script>
