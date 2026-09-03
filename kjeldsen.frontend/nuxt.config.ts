import tailwindcss from '@tailwindcss/vite'

// One gradient dot, inline, so the site has a favicon without a public/ directory.
const favicon =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="#07080c"/><circle cx="16" cy="16" r="7" fill="url(#g)"/></svg>`
  )

export default defineNuxtConfig({
  compatibilityDate: '2026-08-29',
  ssr: true,
  devtools: { enabled: process.env.NODE_ENV !== 'production' },

  css: ['~/assets/css/main.css'],

  // Fonts are downloaded at build time and served from this origin under /_fonts/ with hashed
  // names, which Front Door caches at the edge. Nothing is loaded from Google at runtime: the
  // point of the setup is serving fast from cheap Azure, and that point dies if assets go elsewhere.
  modules: ['@nuxt/fonts'],
  fonts: {
    provider: 'google',
    families: [
      { name: 'Inter', global: true, weights: [400, 500, 600], styles: ['normal'] },
      { name: 'Instrument Serif', global: true, weights: [400], styles: ['normal', 'italic'] },
      { name: 'JetBrains Mono', global: true, weights: [400, 500], styles: ['normal'] },
    ],
    defaults: { subsets: ['latin', 'latin-ext'] },
  },

  nitro: {
    // .br and .gz variants of every build asset, written at build time and served when the
    // client accepts them. Front Door caches the compressed variants too.
    compressPublicAssets: true,
  },

  app: {
    // A short crossfade between routes. The hero on the next page runs its own entrance, so this
    // only has to get the old page out of the way.
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'theme-color', content: '#07080c' },
        { name: 'color-scheme', content: 'dark' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: favicon }],
      // Marks the document as scripted before first paint. Entrance effects that hide an element
      // until it scrolls into view are gated on this class, so a browser without JavaScript - or a
      // crawler - gets everything visible and nothing waiting on an observer that never runs.
      script: [{ innerHTML: "document.documentElement.classList.add('js')", tagPosition: 'head' }],
    },
  },

  // Tailwind 4 is a Vite plugin. No tailwind.config.js and no PostCSS config -
  // configuration lives in the CSS file itself via @theme.
  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    // Private: server only. The delivery key must never reach the browser, which is
    // why all CMS calls go through the Nitro routes in server/api rather than direct.
    deliveryKey: process.env.DELIVERY_KEY,
    // Umbraco:CMS:Imaging:HMACSecretKey, verbatim. The CMS rejects any image URL carrying
    // processing commands unless it is signed with this, so the media route signs on the way
    // through. Leave it unset and media is proxied unsigned, which is correct for a CMS that
    // has no HMAC key configured.
    imageKey: process.env.IMAGE_HMAC_KEY,
    engage: {
      // Set ENGAGE_ENABLED=false to stop every Engage call: no pageviews, no segments, no cookie.
      // Locally the CMS runs Engage disabled under the SQLite profile, so the calls fail softly
      // anyway; this is for turning them off outright.
      enabled: process.env.ENGAGE_ENABLED !== 'false',
    },
    public: {
      cmsHost: process.env.CMSHOST || 'https://localhost:44375',
      siteUrl: process.env.SITE_URL || 'http://localhost:3000',
    },
  },
})
