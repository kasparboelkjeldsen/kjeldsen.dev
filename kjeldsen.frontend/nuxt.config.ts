// nuxt.config.ts
import { visualizer } from 'rollup-plugin-visualizer'
import type { ConfigEnv } from 'vite'
import { inspectChunks } from './inspectChunks'

const analyze = process.env.ANALYZE === 'true'

export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2024-11-01',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },

  css: ['~/assets/css/tailwind.css'],
  postcss: { plugins: { tailwindcss: {}, autoprefixer: {} } },

  modules: ['@nuxtjs/tailwindcss', '@nuxt/fonts', '@nuxtjs/mdc'],
  mdc: {
    highlight: {
      theme: 'github-dark',
      langs: ['ts', 'js', 'csharp', 'vue-html', 'vue', 'json', 'mermaid'],
      wrapperStyle: true,
    },
  },
  features: {
    inlineStyles: true,
  },
  fonts: {
    // default config applies to all families unless overridden
    defaults: { subsets: ['latin'] },
    families: [
      { name: 'Atkinson Hyperlegible', weights: [400, 700] },
      { name: 'JetBrains Mono', weights: [400, 700] },
    ],
  },

  experimental: {
    payloadExtraction: false,
    componentIslands: true,
  },

  runtimeConfig: {
    murderKey: process.env.MURDER_KEY,
    deliveryKey: process.env.DELIVERY_KEY,
    public: {
      siteUrl: 'https://www.kjeldsen.dev',
      useCache: process.env.USE_CACHE,
      murderClient: process.env.MURDER_CLIENT,
      cmsHost: process.env.CMSHOST || 'https://localhost:44375',
      appInsights: process.env.APP_INSIGHTS,
      debugUnloadListeners: process.env.DEBUG_UNLOAD_LISTENERS,
    },
  },

  routeRules: { '/__blockpreview': { ssr: true, prerender: false } },

  vite: {
    build: {
      minify: true,
      sourcemap: analyze,
      target: 'es2022',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('chart.js') || id.includes('vue-chartjs')) return 'vendor-chart'
            if (id.includes('prismjs')) return 'vendor-prism'
            if (id.includes('@microsoft/applicationinsights-web')) return 'vendor-appinsights'
            return undefined
          },
        },
      },
    },
    plugins: [
      //shikiSsrOnly(),
      ...(analyze
        ? [
            // client report
            {
              ...visualizer({
                filename: 'stats-client.html',
                template: 'treemap',
                gzipSize: true,
                brotliSize: true,
              }),
              apply(_c: any, env: ConfigEnv) {
                return env.command === 'build'
              }, // allow both; file name differs
            } as any,
            // print chunk → modules (client)
            {
              ...inspectChunks(12),
              apply(_c: any, env: ConfigEnv) {
                return env.command === 'build'
              },
            } as any,
          ]
        : []),
    ],
  },

  nitro: {
    minify: true,
    sourceMap: analyze,
    compressPublicAssets: true,
    ...(analyze
      ? {
          rollupConfig: {
            plugins: [
              visualizer({
                filename: 'stats-nitro.html',
                template: 'treemap',
                gzipSize: true,
                brotliSize: true,
              }),
            ],
          },
        }
      : {}),
  },
})
