/**
 * Inline emphasis markers.
 *
 * Editors write `**like this**` and `--like this--` in fields that hold no markup - block titles -
 * and also inside RTE markup, where TinyMCE has usually moved a tag in between the two markers:
 *
 *   **<code>false**</code>
 *   --<code>PublicAccess--&nbsp;</code>
 *
 * So a marker pair cannot be found by looking at text nodes alone, and the run it opens cannot be
 * wrapped in a single element either - that would produce overlapping tags. Instead the pair is
 * matched across the markup with tags treated as transparent, and every text run inside the pair
 * is wrapped in its own span. `**<code>false**</code>` becomes `<code><span>false</span></code>`,
 * which is what the editor meant and is valid HTML.
 *
 * Transparent, but not searchable: a marker has to sit in text, never inside a tag. Pasted markup
 * carries attribute values full of double dashes (`class="px-(--thread-margin)"`), and a marker
 * found there would put a <span> inside the tag and spill the rest of it onto the page as text.
 * So matching runs against a copy of the markup with every tag blanked out, and the wrapping is
 * then applied at the same offsets in the real markup.
 *
 * Real <strong> and <em> in RTE markup are left alone - CSS colours those to match.
 */

type Mark = { pattern: RegExp; className: string }

// A marker that never closes would otherwise pair with an unrelated one further down the page, so
// a run is abandoned if it crosses out of its own paragraph, heading or list item.
const CROSSES_BLOCK = /<\/?(?:p|div|br|li|ul|ol|h[1-6]|blockquote|pre|table|tr|td)\b/i

// Opens on a non-space and closes on a non-space, so an em-dash surrounded by spaces is not a
// marker. The lookarounds keep `<!--` and `-->` out of it. Both markers are two characters long,
// which applyMarks relies on to locate the inner run.
const MARKS: Mark[] = [
  { pattern: /\*\*(?!\s)((?:(?!\*\*)[\s\S])*?\S)\*\*/g, className: 'mark-bold' },
  { pattern: /(?<!<!)--(?!\s)((?:(?!--)[\s\S])*?\S)--(?!>)/g, className: 'mark-italic' },
]

const TAG = /<[^>]*>/g

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ESCAPES[ch] ?? ch)
}

/** Wraps each text run of a fragment, leaving tags where they are. */
function wrapTextRuns(fragment: string, className: string): string {
  return fragment.replace(/<[^>]*>|[^<]+/g, (chunk) =>
    chunk.startsWith('<') || !chunk.trim() ? chunk : `<span class="${className}">${chunk}</span>`
  )
}

/** The same string with every tag replaced by a run of NULs of the same length. */
function blankTags(html: string): string {
  return html.replace(TAG, (tag) => '\0'.repeat(tag.length))
}

function applyMarks(html: string): string {
  return MARKS.reduce((acc, { pattern, className }) => {
    const masked = blankTags(acc)
    let out = ''
    let last = 0

    for (const match of masked.matchAll(pattern)) {
      const start = match.index ?? 0
      const innerStart = start + 2
      const innerEnd = innerStart + (match[1]?.length ?? 0)
      const end = innerEnd + 2

      const inner = acc.slice(innerStart, innerEnd)
      if (CROSSES_BLOCK.test(inner)) continue

      out += acc.slice(last, start) + wrapTextRuns(inner, className)
      last = end
    }

    return out + acc.slice(last)
  }, html)
}

/** Marks up a plain-text field. The text is escaped first - it is not markup and must not become it. */
export function markText(text: string | null | undefined): string {
  return applyMarks(escapeHtml(text ?? ''))
}

/** Marks up existing RTE markup, leaving its tags intact. */
export function markMarkup(html: string | null | undefined): string {
  return applyMarks(html ?? '')
}
