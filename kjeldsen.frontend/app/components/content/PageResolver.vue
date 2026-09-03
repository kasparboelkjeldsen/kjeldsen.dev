<template>
  <div>
    <!-- Every page type on this site is a grid of blocks, but the chrome around that grid differs:
         the home page opens with a hero built from its first blocks, a post carries its date,
         author and outline, a container lists its children. v-if rather than <component :is> so
         the discriminated union narrows and each chrome gets its own typed content.

         The wrapping element is the single root the route transition animates; the comment sits
         inside it because a root-level comment survives in development and makes a fragment. -->
    <HomeChrome v-if="content.contentType === 'homePage'" :content="content" />
    <BlogPostChrome v-else-if="content.contentType === 'blogPostPage'" :content="content" />
    <ContainerChrome v-else-if="isContainer" :content="content" />
    <ContentChrome v-else :content="content" />
  </div>
</template>

<script setup lang="ts">
  import HomeChrome from '~/components/chrome/HomeChrome.vue'
  import BlogPostChrome from '~/components/chrome/BlogPostChrome.vue'
  import ContainerChrome from '~/components/chrome/ContainerChrome.vue'
  import ContentChrome from '~/components/chrome/ContentChrome.vue'
  import type { PageContent } from '~~/types/content'

  const props = defineProps<{ content: PageContent }>()

  // Container types list their children instead of carrying their own grid.
  const containerTypes = ['blogPostContainerPage', 'writerContainerPage']
  const isContainer = computed(() => containerTypes.includes(props.content.contentType ?? ''))
</script>
