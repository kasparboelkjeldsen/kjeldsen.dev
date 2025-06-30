<template>
  <!-- ✅ Navigation -->
  <header v-if="navigation?.properties.links" class="relative z-10 py-6">
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
  <main class="relative z-10 max-w-4xl px-4 pb-24 mx-auto prose prose-invert">
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
import { watchEffect } from "vue";
import type {
  SeoCompositionContentResponseModel,
  NavigationCompositionContentResponseModel,
  IApiContentResponseModel,
} from "~/server/delivery-api";


const route = useRoute();
const slugArray = Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug];
// Filter out empty segments
const cleanSlug = "/" + slugArray.filter(Boolean).join("/");
const apiPath = "/api/content" + cleanSlug;

const { data } = await useFetch<IApiContentResponseModel>(apiPath, {
  server: true, cache: "no-cache"
});

if (data.value?.properties.cacheKeys) {
  const cacheKeys = data.value.properties.cacheKeys || [];
  const tags = ["reset", ...cacheKeys];
  const timestamp = new Date().toISOString();

console.log(`\n🔥 [${timestamp}] Cache Miss! These keys were not found: 🔥\n`);
console.table(
  cacheKeys.map((key, index) => ({
    '#': index + 1,
    'Cache Key': key,
  }))
);

/*
  useRouteCache((helper) => {
    helper
      .setMaxAge(3600 * 24)
      .setCacheable()
      .addTags(tags);
  });*/
}

const { data: navigation } =
  await useFetch<NavigationCompositionContentResponseModel>(
    "/api/content/navigation",
    { server: true, cache: "no-cache"
    },
  );

watchEffect(() => {
  if (data.value) {
    const seo = data.value as SeoCompositionContentResponseModel;
    useHead({
      title: seo.properties.seoTitle ?? data.value?.name,
    });
  }
});
</script>
