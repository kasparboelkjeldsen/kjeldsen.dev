import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-08-29',
  ssr: true,
  devtools: { enabled: process.env.NODE_ENV !== 'production' },

  css: ['~/assets/css/main.css'],

  // Tailwind 4 is a Vite plugin. No tailwind.config.js and no PostCSS config -
  // configuration lives in the CSS file itself via @theme.
  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    // Private: server only. The delivery key must never reach the browser, which is
    // why all CMS calls go through the Nitro routes in server/api rather than direct.
    deliveryKey: process.env.DELIVERY_KEY,
    public: {
      cmsHost: process.env.CMSHOST || 'https://localhost:44375',
      siteUrl: process.env.SITE_URL || 'http://localhost:3000',
    },
  },
})
