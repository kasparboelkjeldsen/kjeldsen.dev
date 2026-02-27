import { createHighlighter, type Highlighter, type BundledLanguage } from 'shiki'

let highlighter: Highlighter | null = null

const SUPPORTED_LANGS: BundledLanguage[] = [
  'typescript',
  'javascript',
  'csharp',
  'vue',
  'vue-html',
  'json',
  'html',
  'css',
  'scss',
  'yaml',
  'bash',
  'powershell',
  'sql',
  'graphql',
  'python',
  'go',
  'rust',
  'java',
  'kotlin',
  'php',
  'ruby',
  'xml',
  'markdown',
]

// Language alias mapping
const LANG_ALIASES: Record<string, BundledLanguage> = {
  ts: 'typescript',
  js: 'javascript',
  cs: 'csharp',
  sh: 'bash',
  shell: 'bash',
  ps1: 'powershell',
  yml: 'yaml',
  py: 'python',
  rs: 'rust',
  kt: 'kotlin',
  rb: 'ruby',
  md: 'markdown',
  mjs: 'javascript',
  cjs: 'javascript',
}

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['github-dark'],
      langs: SUPPORTED_LANGS,
    })
  }
  return highlighter
}

function resolveLang(lang: string): BundledLanguage {
  const normalized = lang.toLowerCase().trim()
  return LANG_ALIASES[normalized] || (SUPPORTED_LANGS.includes(normalized as BundledLanguage) ? normalized as BundledLanguage : 'text' as BundledLanguage)
}

export interface HighlightResult {
  html: string
  language: string
}

/**
 * Highlights code using Shiki. Server-side only.
 */
export async function highlightCode(code: string, lang: string): Promise<HighlightResult> {
  const hl = await getHighlighter()
  const resolvedLang = resolveLang(lang)
  
  const html = hl.codeToHtml(code, {
    lang: resolvedLang,
    theme: 'github-dark',
  })
  
  return {
    html,
    language: resolvedLang,
  }
}

/**
 * Parses a markdown code fence and returns the code and language.
 * Input: ```ts\nconst x = 1;\n```
 * Output: { code: 'const x = 1;', lang: 'ts' }
 */
export function parseCodeFence(markdown: string): { code: string; lang: string } {
  const match = markdown.match(/^```(\w*)\r?\n([\s\S]*?)\r?\n?```\s*$/m)
  if (!match) {
    // Fallback: treat entire content as code
    return { code: markdown.trim(), lang: '' }
  }
  return {
    lang: match[1] || '',
    code: match[2] || '',
  }
}
