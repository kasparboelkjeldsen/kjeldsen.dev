<template>
  <div
    class="fixed bottom-0 left-0 right-0 z-[100] bg-gray-900/95 backdrop-blur text-white border-t border-gray-700 px-6 py-3 flex items-center justify-between shadow-2xl transition-transform duration-300"
    :class="{ 'translate-y-full': isHidden }"
  >
    <!-- Toggle Handle -->
    <button
      @click="isHidden = !isHidden"
      class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-gray-900/95 text-xs px-3 py-1 rounded-t-lg border-t border-x border-gray-700 hover:bg-gray-800 transition-colors"
    >
      {{ isHidden ? 'Show Admin' : 'Hide' }}
    </button>

    <div class="flex items-center gap-6">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span class="text-xs font-bold tracking-wider uppercase text-gray-400">Engage Admin</span>
      </div>

      <div class="h-4 w-px bg-gray-700"></div>

      <!-- Segment Selector -->
      <div class="flex items-center gap-3">
        <label class="text-sm text-gray-300">Segment:</label>
        <div class="relative">
          <select
            v-model="selectedSegment"
            class="bg-gray-800 border border-gray-600 text-white text-sm rounded px-3 py-1.5 focus:ring-2 focus:ring-[var(--zoo-primary-2)] focus:border-transparent outline-none min-w-[200px]"
          >
            <option :value="null">-- Default / Automated --</option>
            <option
              v-for="segment in segments"
              :key="segment.umbracoSegmentAlias"
              :value="segment.umbracoSegmentAlias"
            >
              {{ segment.segmentName }}
            </option>
          </select>
        </div>

        <button
          v-if="selectedSegment !== activeCookie"
          @click="impersonate"
          class="bg-[var(--zoo-primary-2)] hover:bg-[#d1491e] text-white text-xs font-bold px-3 py-2 rounded transition-colors uppercase tracking-wide"
        >
          Impersonate
        </button>

        <button
          v-if="activeCookie"
          @click="clearImpersonation"
          class="bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold px-3 py-2 rounded transition-colors uppercase tracking-wide"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Status Info -->
    <div class="flex items-center gap-6 text-xs text-gray-400">
      <!-- Scores -->
      <div v-if="scores.length > 0" class="flex items-center gap-4 border-r border-gray-700 pr-6">
        <div v-for="group in scores" :key="group.id" class="flex flex-col gap-1">
          <span class="font-bold text-gray-500 uppercase tracking-wider text-[10px]">{{
            group.title
          }}</span>
          <div class="flex gap-2">
            <div
              v-for="persona in group.personas"
              :key="persona.id"
              class="flex items-center gap-1 bg-gray-800 rounded px-2 py-0.5"
              :class="{ 'ring-1 ring-[var(--zoo-primary-2)]': persona.score > 0 }"
            >
              <span class="text-gray-300">{{ persona.title }}</span>
              <span
                class="font-mono font-bold"
                :class="persona.score > 0 ? 'text-[var(--zoo-primary-2)]' : 'text-gray-600'"
              >
                {{ persona.score }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeCookie">
        Active Override:
        <span class="text-[var(--zoo-primary-2)] font-bold">{{ activeCookie }}</span>
      </div>
      <div v-else>Running in <span class="text-green-400 font-bold">Automated Mode</span></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const route = useRoute()
  const isHidden = ref(false)

  // State
  const segments = ref<any[]>([])
  const scores = ref<any[]>([])
  const selectedSegment = ref<string | null>(null)

  // Cookie
  const isPreview = route.query.engagePreviewAbTestVariantId !== undefined
  const manualSegmentCookie = !isPreview ? useCookie<string | null>('manual-segment') : ref(null)
  const visitorCookie = !isPreview ? useCookie<string | null>('engage_visitor') : ref(null)
  const activeCookie = computed(() => manualSegmentCookie.value)

  // Initialize selection from cookie
  watchEffect(() => {
    if (manualSegmentCookie.value) {
      selectedSegment.value = manualSegmentCookie.value
    }
  })

  // Fetch segments for current route
  const fetchSegments = async () => {
    try {
      const path = route.path
      const data: any = await $fetch('/api/engage/segments', {
        query: { path },
      })

      if (data && data.segments) {
        segments.value = data.segments
      } else {
        segments.value = []
      }
    } catch (e) {
      console.error('Failed to fetch segments', e)
      segments.value = []
    }
  }

  const fetchScores = async () => {
    if (!visitorCookie.value) return
    try {
      const data: any = await $fetch('/api/engage/scores', {
        query: { externalVisitorId: visitorCookie.value },
      })
      scores.value = data || []
    } catch (e) {
      console.error('Failed to fetch scores', e)
      scores.value = []
    }
  }

  // Refetch when route changes
  watch(
    () => route.path,
    () => {
      fetchSegments()
      fetchScores()
      // Reset selection if not locked? No, user said "store the choice in a cookie", implies global override.
      // But the available segments might change per page.
      // If the selected segment is not valid for this page, what happens?
      // The CMS will probably just ignore it or return default content.
    },
    { immediate: true }
  )

  const impersonate = () => {
    if (selectedSegment.value) {
      manualSegmentCookie.value = selectedSegment.value
      // Reload to apply changes
      window.location.reload()
    }
  }

  const clearImpersonation = () => {
    manualSegmentCookie.value = null
    selectedSegment.value = null
    window.location.reload()
  }
</script>
