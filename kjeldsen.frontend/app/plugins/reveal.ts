/**
 * `v-reveal`: fade-and-rise an element the first time it scrolls into view.
 *
 * Put the `reveal` class on the element in the template as well. That way it is in the
 * server-rendered markup, the stylesheet can hide it before hydration, and nothing flashes into
 * view and then out again. (The directive cannot add it during SSR itself: a class the server
 * emits and the client vnode does not carry is a hydration mismatch.) The hiding rule is gated on
 * `html.js`, set by an inline script in the head, and backed by a CSS safety animation that shows
 * the element after a few seconds regardless - so a browser without JavaScript, a crawler, or a
 * hydration that never arrives all still get the content.
 *
 * Usage: `<div class="reveal" v-reveal>` or `v-reveal="{ delay: 120 }"` for a staggered entrance.
 */
type RevealOptions = { delay?: number } | undefined

export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | null = null

  function observe(el: Element) {
    observer ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          observer?.unobserve(entry.target)
        }
      },
      // Fire a little before the element's top edge reaches the bottom of the viewport, so the
      // motion is underway by the time the reader's eye gets there.
      { rootMargin: '0px 0px -6% 0px', threshold: 0.01 }
    )
    observer.observe(el)
  }

  nuxtApp.vueApp.directive<HTMLElement, RevealOptions>('reveal', {
    // Nothing to render on the server; the class comes from the template. Declared so SSR knows
    // the directive is intentional rather than warning about it.
    getSSRProps: () => ({}),

    mounted(el, binding) {
      el.classList.add('reveal')

      const delay = binding.value?.delay ?? 0
      if (delay) el.style.setProperty('--reveal-delay', `${delay}ms`)

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced || !('IntersectionObserver' in window)) {
        el.classList.add('is-in')
        return
      }

      observe(el)
    },

    unmounted(el) {
      observer?.unobserve(el)
    },
  })
})
