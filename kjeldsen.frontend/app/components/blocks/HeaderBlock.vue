<template>
  <!-- innerHTML rather than v-html: Vue drops v-html on <component :is>, which renders the heading
       empty. headerTitle is plain text carrying emphasis markers, and markText escapes it before
       turning those into spans, so nothing an editor types can become markup. -->
  <component :is="tag" :id="id || undefined" class="display scroll-mt-32" :class="sizeClass" :innerHTML="title" />
</template>

<script setup lang="ts">
  import type { HeaderBlockElementModel } from '~~/server/delivery-api'
  import { markText } from '~/utils/marks'
  import { slugify } from '~/utils/slug'

  const props = defineProps<{ block: HeaderBlockElementModel }>()

  const title = computed(() => markText(props.block.properties?.headerTitle))

  // headerLevel is a string from the datatype ("h2", "2", ...), so pull the digits out of it.
  const level = computed(() => {
    const n = parseInt((props.block.properties?.headerLevel ?? '').replace(/\D/g, ''), 10)
    return n >= 1 && n <= 6 ? n : 2
  })

  const tag = computed(() => `h${level.value}`)

  // Second-level headings are the ones a post's outline links to.
  const id = computed(() => (level.value === 2 ? slugify(props.block.properties?.headerTitle) : ''))

  const sizeClass = computed(
    () =>
      ({
        1: 'text-5xl md:text-6xl',
        2: 'text-3xl md:text-[2.5rem]',
        3: 'text-2xl md:text-3xl',
        4: 'text-xl md:text-2xl',
      })[level.value] ?? 'text-lg'
  )
</script>
