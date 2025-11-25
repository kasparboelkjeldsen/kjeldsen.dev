<template>
  <div>
    <!-- Hero Section -->
    <div class="relative h-[750px] w-full overflow-hidden">
      <!-- Background Image -->
      <img
        v-if="splash"
        :src="splash"
        class="absolute inset-0 object-cover w-full h-full"
        alt="Giraffes and Zebras"
      />

      <!-- Overlay for text readability -->
      <div class="absolute inset-0 bg-black/20"></div>

      <!-- Hero Content -->
      <div class="absolute inset-0 flex items-center">
        <div class="max-w-[1400px] mx-auto w-full px-8">
          <h1
            class="text-[100px] leading-[0.9] font-black text-white uppercase drop-shadow-lg max-w-3xl"
          >
            {{ zoo.properties?.heroTitle }}
          </h1>
        </div>
      </div>
    </div>

    <!-- Floating Information Panel -->
    <div class="relative z-10 -mt-[150px] px-4 pb-20">
      <div
        class="max-w-[1200px] mx-auto bg-[#FFF5EB] rounded-[48px] shadow-2xl p-12 grid grid-cols-1 md:grid-cols-3 gap-0 relative overflow-hidden"
      >
        <!-- Column 1: Opening Hours -->
        <div class="pr-8 border-r border-[#D8D8D8]">
          <h3 class="text-[#0B3D2E] font-semibold text-sm uppercase mb-4 tracking-wider">
            Åbningstider
          </h3>
          <div class="text-[#333333]">
            <p class="mb-1">Idag lørdag 15.november</p>
            <p class="text-2xl font-bold">10.00–16.00</p>
          </div>
        </div>

        <!-- Column 2: Today's Events -->
        <div class="px-8 border-r border-[#D8D8D8] flex flex-col">
          <h3 class="text-[#0B3D2E] font-semibold text-sm uppercase mb-4 tracking-wider">
            Det sker i dag
          </h3>
          <div class="flex-1 space-y-4">
            <div>
              <p class="font-medium text-[#333333]">Hjælp med at passe hestene</p>
              <p class="font-bold text-[#333333]">14.25–14.45</p>
            </div>
            <div>
              <p class="font-medium text-[#333333]">Workshop: Red en chimpanseunge</p>
              <p class="font-bold text-[#333333]">14.40–15.30</p>
            </div>
          </div>
          <button
            class="mt-6 self-center border border-[#0B3D2E] text-[#0B3D2E] bg-white rounded-full px-6 py-2 text-sm font-bold uppercase hover:bg-[#0B3D2E] hover:text-white transition-colors"
          >
            Se programmet
          </button>
        </div>

        <!-- Column 3: Tickets -->
        <div class="flex flex-col pl-8">
          <h3 class="text-[#0B3D2E] font-semibold text-sm uppercase mb-2 tracking-wider">
            Køb billet og zookort
          </h3>
          <p class="text-[#777777] text-sm mb-6">Spring køen over og køb entré til ZOO online.</p>

          <div class="flex flex-col items-start space-y-3">
            <button
              class="border border-[#F15A29] text-[#F15A29] rounded-full px-6 py-2 text-sm font-bold uppercase hover:bg-[#F15A29] hover:text-white transition-colors w-full md:w-auto text-center"
            >
              Billetter
            </button>
            <button
              class="border border-[#F15A29] text-[#F15A29] rounded-full px-6 py-2 text-sm font-bold uppercase hover:bg-[#F15A29] hover:text-white transition-colors w-full md:w-auto text-center"
            >
              Zookort
            </button>
            <button
              class="border border-[#F15A29] text-[#F15A29] rounded-full px-6 py-2 text-sm font-bold uppercase hover:bg-[#F15A29] hover:text-white transition-colors w-full md:w-auto text-center"
            >
              Gavekort
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { ZooHomepageContentResponseModel } from '~~/server/delivery-api'

  const props = defineProps<{
    data: ZooHomepageContentResponseModel
  }>()

  const zoo = computed(() => props.data)
  const splash = computed(() => zoo.value.properties?.splash?.at(0)?.url ?? '')
</script>
