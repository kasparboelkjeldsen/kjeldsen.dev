import { createHighlighterCore, type HighlighterCore, type ThemedToken } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import { parseFence } from '~~/shared/fence'
import type { PageContent, AnyBlock, BlockGrid } from '~~/types/content'

/**
 * Syntax highlighting, server side only.
 *
 * Code blocks are highlighted once, when the delivery payload is fetched, and the result travels
 * to the browser as ready-made spans. Nothing of shiki reaches the client bundle, and a cached
 * payload carries its highlighting with it.
 *
 * V1 shipped shiki with its WebAssembly regex engine and had to inline a dozen of its ESM
 * dependencies into the Nitro build to make that work. This uses the fine-grained core with the
 * pure JavaScript engine and only the grammars the site's posts use, loaded on first use.
 */
const THEME = 'one-dark-pro'

// Grammars by fence name, loaded lazily. The alias map covers what editors actually type.
const GRAMMARS: Record<string, () => Promise<unknown>> = {
  csharp: () => import('@shikijs/langs/csharp'),
  json: () => import('@shikijs/langs/json'),
  html: () => import('@shikijs/langs/html'),
  typescript: () => import('@shikijs/langs/typescript'),
  javascript: () => import('@shikijs/langs/javascript'),
  bash: () => import('@shikijs/langs/bash'),
  yaml: () => import('@shikijs/langs/yaml'),
  xml: () => import('@shikijs/langs/xml'),
  css: () => import('@shikijs/langs/css'),
  vue: () => import('@shikijs/langs/vue'),
  powershell: () => import('@shikijs/langs/powershell'),
  razor: () => import('@shikijs/langs/razor'),
  markdown: () => import('@shikijs/langs/markdown'),
}

const ALIASES: Record<string, string> = {
  cs: 'csharp',
  'c#': 'csharp',
  ts: 'typescript',
  js: 'javascript',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  ps: 'powershell',
  ps1: 'powershell',
  pwsh: 'powershell',
  md: 'markdown',
  cshtml: 'razor',
  jsonc: 'json',
}

let core: Promise<HighlighterCore> | null = null
const loaded = new Set<string>()

function highlighter(): Promise<HighlighterCore> {
  core ??= createHighlighterCore({
    themes: [import('@shikijs/themes/one-dark-pro')],
    langs: [],
    engine: createJavaScriptRegexEngine({ forgiving: true }),
  })
  return core
}

/** The grammar name for a fence label, or null when there is no grammar for it. */
export function grammarFor(lang: string): string | null {
  const name = ALIASES[lang] ?? lang
  return name in GRAMMARS ? name : null
}

async function ensureGrammar(h: HighlighterCore, name: string): Promise<void> {
  if (loaded.has(name)) return
  await h.loadLanguage(await (GRAMMARS[name] as () => Promise<never>)())
  loaded.add(name)
}

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }
const escape = (s: string) => s.replace(/[&<>"]/g, (c) => ESCAPES[c] ?? c)

function tokenHtml(token: ThemedToken): string {
  const styles: string[] = []
  if (token.color) styles.push(`color:${token.color}`)
  if (token.fontStyle && token.fontStyle & 1) styles.push('font-style:italic')
  if (token.fontStyle && token.fontStyle & 2) styles.push('font-weight:600')
  const text = escape(token.content)
  return styles.length ? `<span style="${styles.join(';')}">${text}</span>` : text
}

/**
 * Highlights one code field. Returns one HTML string per line, or null when the language has no
 * grammar here - the component then renders the text plain.
 */
export async function highlightCode(raw: string | null | undefined): Promise<{ lines: string[]; lang: string } | null> {
  const { lang, body } = parseFence(raw)
  const name = grammarFor(lang)
  if (!name || !body) return null

  try {
    const h = await highlighter()
    await ensureGrammar(h, name)
    const tokens = h.codeToTokensBase(body, { lang: name, theme: THEME })
    return { lines: tokens.map((line) => line.map(tokenHtml).join('')), lang }
  } catch (e) {
    console.warn(`[highlight] ${lang} failed`, e)
    return null
  }
}

/** Adds `highlighted` and `language` to a code block's properties, in place. Other blocks pass through. */
export async function highlightBlock<T extends AnyBlock>(block: T): Promise<T> {
  if (block.contentType !== 'codeBlock') return block
  const props = block.properties as { code?: string | null; highlighted?: string[]; language?: string } | undefined
  const result = await highlightCode(props?.code)
  if (result && props) {
    props.highlighted = result.lines
    props.language = result.lang
  }
  return block
}

async function highlightGrid(grid: BlockGrid | null | undefined): Promise<void> {
  for (const item of grid?.items ?? []) {
    if (item.content) await highlightBlock(item.content)
    for (const area of item.areas ?? []) {
      for (const areaItem of area.items ?? []) {
        if (areaItem.content) await highlightBlock(areaItem.content)
      }
    }
  }
}

/** Highlights every code block in a page's grid, in place, and returns the page. */
export async function highlightContent<T extends PageContent>(content: T): Promise<T> {
  const grid = (content.properties as { grid?: BlockGrid | null } | null)?.grid
  await highlightGrid(grid)
  return content
}
