<template>
  <NuxtLink
    :to="post.path ?? '/'"
    class="card spot group flex w-full overflow-hidden"
    :class="featured ? 'flex-col md:flex-row' : 'flex-col'"
    @pointermove="track"
  >
    <!-- The featured picture is positioned absolutely on wide screens so the words set the card's
         height; a portrait photo otherwise stretches the card to its own full height. -->
    <div
      v-if="post.image"
      class="relative overflow-hidden bg-surface"
      :class="featured ? 'aspect-[16/10] md:aspect-auto md:min-h-[24rem] md:w-[55%] md:border-r md:border-b-0 border-b border-line' : 'aspect-[16/10] border-b border-line'"
    >
      <img
        :src="withWidth(post.image.url, featured ? 1200 : 800)"
        :srcset="cmsSrcset(post.image.url, featured ? [800, 1200, 1600] : [480, 800, 1200])"
        :sizes="featured ? '(min-width: 48rem) 60vw, 100vw' : '(min-width: 64rem) 33vw, (min-width: 48rem) 50vw, 100vw'"
        alt=""
        :width="featured ? 1200 : 800"
        :height="featured ? 750 : 500"
        loading="lazy"
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-[1.05]"
      >
    </div>

    <div class="relative flex flex-1 flex-col" :class="featured ? 'justify-center p-7 md:p-10 lg:p-12' : 'p-6 md:p-7'">
      <p class="eyebrow">
        <span v-if="featured" class="text-sky">Latest</span>
        <span v-if="featured && (post.date || post.authors.length)"> · </span>
        <time v-if="post.date" :datetime="post.date">{{ formatDate(post.date) }}</time>
        <span v-if="post.date && post.authors.length"> · </span>
        <span v-if="post.authors.length">{{ post.authors.join(', ') }}</span>
      </p>

      <h3
        class="display mt-3 leading-tight"
        :class="featured ? 'text-3xl md:text-4xl lg:text-[2.75rem]' : 'text-2xl md:text-[1.7rem]'"
        v-html="title"
      />

      <p
        v-if="post.description"
        class="mt-3 leading-relaxed text-fg-2"
        :class="featured ? 'line-clamp-4 text-base md:mt-4 md:text-lg' : 'line-clamp-3 text-sm'"
      >
        {{ post.description }}
      </p>

      <span class="inline-flex items-center gap-2 text-sm font-medium text-sky" :class="featured ? 'mt-6' : 'mt-auto pt-6'">
        Read
        <span class="arrow transition-transform duration-500 ease-out-expo group-hover:translate-x-1" aria-hidden="true">→</span>
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
  import { markText } from '~/utils/marks'
  import { formatDate } from '~/utils/dates'
  import { cmsSrcset, withWidth } from '~/utils/images'
  import type { ChildSummary } from '~~/server/api/content-children'

  const props = defineProps<{ post: ChildSummary; featured?: boolean }>()

  const title = computed(() => markText(props.post.title ?? props.post.name))

  // Feeds the .spot glow: two custom properties, written straight to the element on pointer move.
  // No reactive state, so hovering never renders anything.
  function track(e: PointerEvent) {
    const el = e.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }
</script>
