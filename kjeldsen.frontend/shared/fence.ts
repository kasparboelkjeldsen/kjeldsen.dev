/**
 * Editors paste Markdown fences into the code block's field - ```json ... ``` - so the language
 * is read off the opening fence and the fences themselves are dropped. Shared by the server,
 * which highlights, and the component, which renders plain text when there is no highlighting.
 */
export interface Fence {
  lang: string
  body: string
}

export function parseFence(raw: string | null | undefined): Fence {
  const text = (raw ?? '').replace(/\r\n?/g, '\n')
  const fenced = text.match(/^\s*```([\w+#.-]*)[ \t]*\n([\s\S]*?)\n?[ \t]*```\s*$/)
  const body = (fenced ? fenced[2] : text) ?? ''
  return { lang: (fenced?.[1] ?? '').toLowerCase(), body: body.replace(/\s+$/, '') }
}
