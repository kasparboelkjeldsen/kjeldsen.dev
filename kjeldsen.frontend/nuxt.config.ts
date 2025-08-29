// nuxt.config.ts
import { visualizer } from 'rollup-plugin-visualizer'
import type { ConfigEnv } from 'vite'
import { inspectChunks } from './inspectChunks'

const analyze = process.env.ANALYZE === 'true'

export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  css: ['~/assets/css/tailwind.css', 'prismjs/themes/prism-okaidia.css'],
  postcss: { plugins: { tailwindcss: {}, autoprefixer: {} } },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/google-fonts', '@nuxtjs/mdc'],

  googleFonts: {
    families: { 'Atkinson Hyperlegible': [400, 700], 'JetBrains Mono': [400, 700] },
    display: 'swap',
    preconnect: true,
  },

  experimental: { payloadExtraction: false },

  runtimeConfig: {
    murderKey: process.env.MURDER_KEY,
    deliveryKey: process.env.DELIVERY_KEY,
    public: {
      siteUrl: 'https://www.kjeldsen.dev',
      useCache: process.env.USE_CACHE,
      murderClient: process.env.MURDER_CLIENT,
      cmsHost: process.env.CMSHOST || 'https://localhost:44375',
      appInsights: process.env.APP_INSIGHTS,
    },
  },

  mdc: {
    highlight: {
      theme: 'github-dark',
      langs: ['ts', 'js', 'csharp', 'vue-html', 'vue', 'json', 'mermaid'],
      wrapperStyle: true,
    },
  },

  routeRules: { '/__blockpreview': { ssr: true, prerender: false } },

  vite: {
    build: {
      minify: true,
      sourcemap: true,
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
    minify: false,
    sourceMap: true,
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
