export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) return

  const log = (msg: string, ...args: any[]) => console.log(`[SneakSegmentation] ${msg}`, ...args)

  log('Plugin initializing...')

  const cleanupUrl = () => {
    if (!window.location.search.includes('segmentbreak')) return

    log('Cleaning up segmentbreak from URL')
    const url = new URL(window.location.href)
    url.searchParams.delete('segmentbreak')
    window.history.replaceState({}, '', url.toString())
  }

  const checkCacheAndTrack = async () => {
    // Check for server generation timestamp meta tag
    const meta = document.querySelector('meta[name="engage-server-gen"]') as HTMLMetaElement | null
    if (!meta) {
      log('No engage-server-gen meta tag found')
      return
    }

    // Try to parse both simple timestamp or ISO date
    let genTimestamp = parseInt(meta.content, 10)
    if (isNaN(genTimestamp)) {
      // Fallback for cases where it's not just a raw number?
      // Actually our nitro plugin injects Date.now(), so it should be a number.
      log('Invalid engage-server-gen timestamp', meta.content)
      return
    }

    const now = Date.now()
    // Using a threshold of 8 seconds (8000ms) to detect if the page was served from cache.
    // If the difference between now and generation time is > 8s, we assume it came from cache
    // because server-side generation + network transport shouldn't take that long on a fresh hit.
    const diff = now - genTimestamp

    log(`Server gen: ${genTimestamp}, Now: ${now}, Diff: ${diff}ms`)

    if (diff > 8000) {
      log('Page appears cached (Diff > 8000ms). Triggering client-side pageview.')
      try {
        await $fetch('/api/engage/pageview', {
          method: 'POST',
          body: { path: window.location.pathname, referrer: document.referrer },
        })
        log('Client-side pageview tracked.')
      } catch (e) {
        console.error('[SneakSegmentation] detailed pageview track failed', e)
      }
    } else {
      log('Page appears fresh. server-side tracking likely handled it.')
    }
  }

  const runSneakyCheck = () => {
    cleanupUrl()
    checkCacheAndTrack()
    log('Running check')
    setTimeout(() => {
      const links = document.querySelectorAll('a')
      log(`Found ${links.length} links`)

      links.forEach(async (link) => {
        const href = link.getAttribute('href')
        if (
          !href ||
          href.startsWith('http') ||
          href.startsWith('//') ||
          href.startsWith('#') ||
          href.includes('segmentbreak')
        )
          return

        try {
          const data = await $fetch<{ segmented: boolean; debugParams?: any }>(
            '/api/engage/sneak',
            {
              params: { path: href },
            }
          )

          if (data && data.segmented) {
            const separator = href.includes('?') ? '&' : '?'
            const newHref = `${href}${separator}segmentbreak=true`
            log(`patching link: ${href} -> ${newHref}`)
            link.setAttribute('href', newHref)
          }
        } catch (e) {
          console.error('[SneakSegmentation] Error checking link', href, e)
        }
      })
    }, 500)
  }

  nuxtApp.hook('app:mounted', () => {
    log('app:mounted')
    runSneakyCheck()
  })

  nuxtApp.hook('page:finish', () => {
    log('page:finish')
    runSneakyCheck()
  })
})
