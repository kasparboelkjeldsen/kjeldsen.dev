// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    "nuxt-multi-cache",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/google-fonts",
    "@nuxt/image",
    "@nuxtjs/mdc",
  ],
  googleFonts: {
    families: {
      "Atkinson Hyperlegible": [400, 700],
      "JetBrains Mono": [400, 700],
    },
    display: "swap",
    preconnect: true,
  },
  multiCache: {
    data: {
      enabled: true,
    },
    route: {
      enabled: true,
    },
    api: {
      enabled: true,
      prefix: "/__nuxt_multi_cache",
      authorization: "woot",
      cacheTagInvalidationDelay: 1000,
    },
  },

  experimental: {
    componentIslands: true,
  },
  image: {
    domains: ["localhost:44375"],
    provider: "ipx",
    ipx: {},
  },
  runtimeConfig: {
    murderKey: process.env.MURDER_KEY,
    deliveryKey: process.env.DELIVERY_KEY,
    public: {
      useCache: process.env.USE_CACHE,
      murderClient: process.env.MURDER_CLIENT,
      cmsHost: process.env.CMSHOST || "https://localhost:44375",
    },
  },
  mdc: {
    highlight: {
      theme: "github-dark",
      langs: ["ts", "js", "csharp", "vue-html", "vue", "json"],
      wrapperStyle: true,
    },
  },
});
