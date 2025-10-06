import { watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import type { SeoCompositionContentResponseModel } from '~/../server/delivery-api'

type HasBasicContentShape =
  | {
      name?: string | null
      properties?: Record<string, any>
    }
  | null
  | undefined

interface UseSeoOptions {
  origin?: string
  lang?: string
}

/**
 * Observes a content ref and registers <head> tags (title, meta, canonical, social).
 * Extracted from the slug page to keep it clean.
 */
export function useSeoForContent(
  content: Ref<HasBasicContentShape | SeoCompositionContentResponseModel | any>,
  opts: UseSeoOptions = {}
) {
  const route = useRoute()
  const origin = opts.origin || 'https://kjeldsen.dev'
  const lang = opts.lang || 'en'

  const toAbsolute = (u?: string | null) => {
    if (!u) return ''
    if (/^https?:\/\//i.test(u)) return u
    if (!origin) return u
    return `${origin}${u.startsWith('/') ? '' : '/'}${u}`
  }

  watch(
    () => content.value,
    (val) => {
      if (!val) return
      const seo = val as SeoCompositionContentResponseModel
      const title = (seo?.properties as any)?.seoTitle || val.name || ''
      const description = (seo?.properties as any)?.seoDescription || ''
      const rawKeywords = (seo?.properties as any)?.seoKeyWords || ''
      const keywordsList = rawKeywords
        .split(',')
        .map((k: string) => k.trim())
        .filter(Boolean)
      const keywords = keywordsList.join(', ')
      const published = (seo?.properties as any)?.seoPublishingDate || ''
      const imageUrl = (seo?.properties as any)?.seoListImage?.[0]?.url || ''
      const absoluteImage = toAbsolute(imageUrl)
      const canonical = origin ? `${origin}${route.fullPath}` : ''

      const meta: any[] = []
      if (description) meta.push({ name: 'description', content: description, key: 'description' })
      if (keywords) meta.push({ name: 'keywords', content: keywords, key: 'keywords' })
      if (keywordsList.length) {
        for (const kw of keywordsList) {
          meta.push({ property: 'article:tag', content: kw, key: `article:tag:${kw}` })
        }
      }
      meta.push({ property: 'og:title', content: title, key: 'og:title' })
      if (description)
        meta.push({ property: 'og:description', content: description, key: 'og:description' })
      if (canonical) meta.push({ property: 'og:url', content: canonical, key: 'og:url' })
      meta.push({ property: 'og:type', content: published ? 'article' : 'website', key: 'og:type' })
      if (absoluteImage)
        meta.push({ property: 'og:image', content: absoluteImage, key: 'og:image' })
      meta.push({
        name: 'twitter:card',
        content: absoluteImage ? 'summary_large_image' : 'summary',
        key: 'twitter:card',
      })
      meta.push({ name: 'twitter:title', content: title, key: 'twitter:title' })
      if (description)
        meta.push({ name: 'twitter:description', content: description, key: 'twitter:description' })
      if (absoluteImage)
        meta.push({ name: 'twitter:image', content: absoluteImage, key: 'twitter:image' })
      if (published)
        meta.push({
          property: 'article:published_time',
          content: published,
          key: 'article:published_time',
        })

      const link = canonical ? [{ rel: 'canonical', href: canonical, key: 'canonical' }] : []

      useHead({
        title,
        meta,
        link,
        htmlAttrs: { lang },
      })
    },
    { immediate: true }
  )
}
