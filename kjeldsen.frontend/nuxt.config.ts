// https://nuxt.com/docs/api/configuration/nuxt-config

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

// https://localhost:44375/api/slug
export default defineNuxtConfig({
  css: ['~/assets/css/tailwind.css'],
  webpack: {
    extractCSS: true,
  },
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    "nuxt-multi-cache",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/google-fonts",
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
      authorization: process.env.DELIVERY_KEY!,
      cacheTagInvalidationDelay: 1000,
    },
  },
/*
  experimental: {
    componentIslands: true,
  },*/
  runtimeConfig: {
    murderKey: process.env.MURDER_KEY,
    deliveryKey: process.env.DELIVERY_KEY,
    public: {
      siteUrl: 'https://www.kjeldsen.dev',
      useCache: process.env.USE_CACHE,
      murderClient: process.env.MURDER_CLIENT,
      cmsHost: process.env.CMSHOST || "https://localhost:44375",
    },
  },
  mdc: {
    highlight: {
      theme: "github-dark",
      langs: ["ts", "js", "csharp", "vue-html", "vue", "json", "mermaid"],
      wrapperStyle: true,
    },
  },
  routeRules: {
    "/__blockpreview": {ssr: true, prerender: false}
  },
  nitro: {
    prerender: {
      routes: (() => {
        const filePath = resolve('./.nuxt-prerender-routes.json')
        if (!existsSync(filePath)) {
          console.warn('⚠️  No prerender routes file found')
          return []
        }

        const raw = readFileSync(filePath, 'utf-8')
        return JSON.parse(raw)
      })()
    }
  }

});
