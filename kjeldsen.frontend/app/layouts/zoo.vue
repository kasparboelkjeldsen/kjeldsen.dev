<template>
  <div
    class="relative min-h-screen font-sans bg-[var(--zoo-secondary-1)] text-[var(--zoo-primary-3)]"
    :style="cssVars"
  >
    <!-- Navigation Bar (Floating) -->
    <nav class="absolute left-0 right-0 z-50 flex justify-center top-6">
      <div
        class="backdrop-blur-sm rounded-full px-8 py-3 flex items-center justify-between max-w-[1400px] w-full mx-4 shadow-lg transition-colors duration-300"
        :class="
          hasSplash
            ? 'bg-[var(--zoo-primary-1)]/90 text-white'
            : 'bg-[var(--zoo-secondary-3)] text-white'
        "
      >
        <!-- Logo -->
        <div class="bg-[var(--zoo-primary-1)] rounded-full px-4 py-1 mr-8">
          <div class="text-2xl font-black tracking-tighter">ZOO</div>
        </div>

        <!-- Main Menu -->
        <ul class="items-center justify-center flex-1 hidden space-x-8 md:flex">
          <li class="relative cursor-pointer group">
            <div
              class="flex items-center gap-1 text-sm font-bold tracking-wide uppercase transition-colors duration-300 hover:text-gray-300"
            >
              Oplev ZOO <i class="fas fa-chevron-down text-[10px] ml-1"></i>
            </div>
          </li>
          <li class="relative cursor-pointer group">
            <div
              class="flex items-center gap-1 text-sm font-bold tracking-wide uppercase transition-colors duration-300 hover:text-gray-300"
            >
              Planlæg dit besøg <i class="fas fa-chevron-down text-[10px] ml-1"></i>
            </div>
          </li>
          <li class="relative cursor-pointer group">
            <div
              class="flex items-center gap-1 text-sm font-bold tracking-wide uppercase transition-colors duration-300 hover:text-gray-300"
            >
              Møder og aktiviteter <i class="fas fa-chevron-down text-[10px] ml-1"></i>
            </div>
          </li>
        </ul>

        <!-- Right Actions -->
        <div class="flex items-center ml-8 space-x-6">
          <a href="#" class="transition-all duration-300 hover:text-gray-300">
            <i class="text-lg fas fa-search"></i>
          </a>
          <a href="#" class="transition-all duration-300 hover:text-gray-300">
            <i class="text-lg fas fa-globe"></i>
          </a>
          <a href="#" class="transition-all duration-300 hover:text-gray-300">
            <i class="text-lg far fa-user"></i>
          </a>
          <a
            href="#"
            class="bg-[var(--zoo-primary-2)] hover:bg-[#d1491e] text-white font-bold py-3 px-8 rounded-full transition-colors duration-300 uppercase text-sm tracking-wider"
          >
            Køb billet og kort
          </a>
        </div>
      </div>
    </nav>

    <slot />

    <!-- Footer -->
    <footer class="px-5 py-12 bg-[var(--zoo-primary-3)] text-[var(--zoo-primary-4)]">
      <div class="grid max-w-6xl grid-cols-1 gap-8 mx-auto md:grid-cols-4">
        <div>
          <h3 class="mb-4 text-xl font-bold">ZOO STORE</h3>
          <p class="text-gray-400">Your one-stop shop for the latest zoo merchandise.</p>
        </div>
        <div>
          <h4 class="mb-4 text-lg font-semibold">Quick Links</h4>
          <ul class="space-y-2">
            <li>
              <a
                href="#"
                class="text-gray-400 transition-colors duration-300 hover:text-[var(--zoo-primary-4)]"
                >Home</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-400 transition-colors duration-300 hover:text-[var(--zoo-primary-4)]"
                >About Us</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-400 transition-colors duration-300 hover:text-[var(--zoo-primary-4)]"
                >Shop</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-400 transition-colors duration-300 hover:text-[var(--zoo-primary-4)]"
                >Contact</a
              >
            </li>
          </ul>
        </div>
        <div>
          <h4 class="mb-4 text-lg font-semibold">Customer Service</h4>
          <ul class="space-y-2">
            <li>
              <a
                href="#"
                class="text-gray-400 transition-colors duration-300 hover:text-[var(--zoo-primary-4)]"
                >FAQs</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-400 transition-colors duration-300 hover:text-[var(--zoo-primary-4)]"
                >Shipping Policy</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-400 transition-colors duration-300 hover:text-[var(--zoo-primary-4)]"
                >Returns & Exchanges</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-400 transition-colors duration-300 hover:text-[var(--zoo-primary-4)]"
                >Privacy Policy</a
              >
            </li>
          </ul>
        </div>
        <div>
          <h4 class="mb-4 text-lg font-semibold">Connect With Us</h4>
          <div class="flex space-x-4">
            <a
              href="#"
              class="text-xl text-gray-400 transition-colors duration-300 hover:text-[var(--zoo-primary-4)]"
            >
              <i class="fab fa-facebook"></i>
            </a>
            <a
              href="#"
              class="text-xl text-gray-400 transition-colors duration-300 hover:text-[var(--zoo-primary-4)]"
            >
              <i class="fab fa-twitter"></i>
            </a>
            <a
              href="#"
              class="text-xl text-gray-400 transition-colors duration-300 hover:text-[var(--zoo-primary-4)]"
            >
              <i class="fab fa-instagram"></i>
            </a>
            <a
              href="#"
              class="text-xl text-gray-400 transition-colors duration-300 hover:text-[var(--zoo-primary-4)]"
            >
              <i class="fab fa-pinterest"></i>
            </a>
          </div>
        </div>
      </div>
      <div class="pt-8 mt-8 text-center text-gray-400 border-t border-gray-700">
        <p>&copy; 2025 ZOO STORE. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
  import type { ZooHomepageContentResponseModel } from '~~/server/delivery-api'

  const { hasSplash } = useZooHeader()
  const { apiPath, slugHasDot, data } = await usePageContentFromRoute()
  const zoo = data.value as ZooHomepageContentResponseModel
  const splash = zoo.properties?.splash?.at(0)?.url ?? ''

  type Theme = 'autumn' | 'winter' | 'spring' | 'summer'

  const themes: Record<Theme, { primary: string[]; secondary: string[] }> = {
    autumn: {
      primary: ['#0B3D2E', '#F15A29', '#000000', '#FFFFFF'],
      secondary: ['#EBD9C6', '#BF9474', '#E39624'],
    },
    summer: {
      primary: ['#0F403D', '#0F6B57', '#1A9973', '#FFFFFF'],
      secondary: ['#BF9474', '#FED613', '#0F403D'],
    },
    winter: {
      primary: ['#233270', '#2F68AB', '#A6D1F0', '#E4F4FE'],
      secondary: ['#FFFFFF', '#4E008E', '#4E008E'],
    },
    spring: {
      primary: ['#91D6AC', '#FED613', '#BF9474', '#FFF8BF'],
      secondary: ['#EA5B34', '#0F403D', '#0F6B57'],
    },
  }

  const currentTheme = ref<Theme>((zoo.properties?.theme?.toLowerCase() as Theme) || 'autumn')

  const primaryColors = computed(() => themes[currentTheme.value].primary)
  const secondaryColors = computed(() => themes[currentTheme.value].secondary)

  const cssVars = computed(() => ({
    '--zoo-primary-1': primaryColors.value[0],
    '--zoo-primary-2': primaryColors.value[1],
    '--zoo-primary-3': primaryColors.value[2],
    '--zoo-primary-4': primaryColors.value[3],
    '--zoo-secondary-1': secondaryColors.value[0],
    '--zoo-secondary-2': secondaryColors.value[1],
    '--zoo-secondary-3': secondaryColors.value[2],
  }))

  useHead({
    link: [
      {
        rel: 'stylesheet',
        href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
      },
    ],
  })
</script>

<style>
  .offer-banner::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    animation: shine 3s infinite;
  }

  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background-color: var(--zoo-primary-2);
    transition: width 0.3s;
  }

  .nav-link:hover::after {
    width: 100%;
  }
</style>
