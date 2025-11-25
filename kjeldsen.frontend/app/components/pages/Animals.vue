<template>
  <div class="relative min-h-screen py-24 bg-[var(--zoo-secondary-1)] overflow-hidden">
    <div class="relative z-10 max-w-4xl px-6 mx-auto">
      <h1
        class="mt-8 mb-16 text-5xl font-black text-center uppercase text-[var(--zoo-secondary-3)]"
      >
        Dyrealfabetet
      </h1>

      <div v-for="(group, letter) in groupedAnimals" :key="letter" class="mb-12">
        <!-- Letter Header -->
        <div class="flex items-center mb-6">
          <h2 class="text-6xl font-black text-[var(--zoo-secondary-2)] opacity-50">
            {{ letter }}
          </h2>
          <div class="flex-1 h-px ml-6 bg-[var(--zoo-secondary-2)] opacity-30"></div>
        </div>

        <!-- Animals Grid -->
        <div class="grid gap-6">
          <NuxtLink
            v-for="animal in group"
            :key="animal.id"
            :to="animal.route.path"
            class="flex items-center p-4 transition-all bg-white shadow-sm hover:shadow-md rounded-3xl group"
          >
            <!-- Image -->
            <div
              class="relative flex-shrink-0 w-24 h-24 overflow-hidden rounded-full border-4 border-[var(--zoo-secondary-1)] group-hover:border-[var(--zoo-primary-2)] transition-colors"
            >
              <img
                v-if="animal.properties?.image?.[0]?.url"
                :src="`${animal.properties.image[0].url}?width=200&height=200&mode=crop`"
                :alt="animal.name || ''"
                class="object-cover w-full h-full"
              />
              <div
                v-else
                class="flex items-center justify-center w-full h-full text-gray-400 bg-gray-200"
              >
                <i class="fas fa-paw"></i>
              </div>
            </div>

            <!-- Content -->
            <div class="ml-6">
              <h3
                class="text-xl font-bold text-[var(--zoo-secondary-3)] group-hover:text-[var(--zoo-primary-2)] transition-colors"
              >
                {{ capitalize(animal.name) }}
              </h3>

              <!-- Tags -->
              <div class="flex flex-wrap gap-2 mt-2">
                <!-- Diet Tag -->
                <span
                  v-if="animal.properties?.diet"
                  class="px-3 py-1 text-xs font-bold text-white uppercase rounded-full bg-[var(--zoo-secondary-3)]"
                >
                  {{ animal.properties.diet }}
                </span>

                <!-- Habitat Tags -->
                <template v-if="animal.properties?.habitat">
                  <span
                    v-for="habitat in animal.properties.habitat.split(',')"
                    :key="habitat"
                    class="px-3 py-1 text-xs font-bold uppercase border rounded-full text-[var(--zoo-primary-3)] border-[var(--zoo-secondary-2)]"
                  >
                    {{ habitat.trim() }}
                  </span>
                </template>
              </div>
            </div>

            <!-- Arrow -->
            <div
              class="ml-auto text-[var(--zoo-secondary-2)] group-hover:text-[var(--zoo-primary-2)] transition-colors"
            >
              <i class="fas fa-arrow-right"></i>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import type {
    AnimalsContentResponseModel,
    AnimalContentResponseModel,
    PagedIApiContentResponseModel,
  } from '~~/server/delivery-api'

  const props = defineProps<{ data: AnimalsContentResponseModel }>()

  const { data: children } = await useFetch<PagedIApiContentResponseModel>(
    `/api/content/children/${props.data.id}`,
    { server: true }
  )

  const animals = computed(() => {
    return (children.value?.items || []).map((item) => item as AnimalContentResponseModel)
  })

  const capitalize = (s: string | null | undefined) => {
    if (!s) return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  const groupedAnimals = computed(() => {
    const groups: Record<string, AnimalContentResponseModel[]> = {}

    // Sort animals by name first
    const sorted = [...animals.value]
      .filter((a) => a.name)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))

    sorted.forEach((animal) => {
      const name = animal.name || ''
      const firstLetter = name.charAt(0).toUpperCase()
      if (!groups[firstLetter]) {
        groups[firstLetter] = []
      }
      groups[firstLetter].push(animal)
    })

    return groups
  })
</script>

<style></style>
