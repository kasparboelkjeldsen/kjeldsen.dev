/**
 * A Table block: a JSON description of a table, written by an editor or an agent through the
 * Management API / MCP, rendered by app/components/blocks/TableBlock.vue.
 *
 * The format is documented for authors in knowledge/table-block.md and on the block's property
 * in the backoffice; this is the parser for it. Everything here is lenient on purpose - a column
 * may be a bare string, a row may be an array or an object, a cell may be a value or an object
 * with styling - and everything comes out normalised: columns with keys, rows as arrays of cells
 * in column order, and a separate mobile variant that falls back to the desktop one piece by
 * piece.
 */

export type Align = 'left' | 'center' | 'right'

export type TableColumn = {
  key: string
  label: string
  align: Align | null
  mono: boolean
  nowrap: boolean
  width: string | null
}

export type TableCell = {
  /** Plain text; may carry the site's `**bold**` and `--italic--` markers. Already a string. */
  text: string
  strong: boolean
  muted: boolean
  mono: boolean
  href: string | null
  align: Align | null
  /** True when the raw value was a number, so a column of numbers can be right-aligned. */
  numeric: boolean
}

export type TableVariant = {
  columns: TableColumn[]
  rows: TableCell[][]
  footer: TableCell[] | null
}

export type TableData = {
  desktop: TableVariant
  /** Null when the JSON had no `mobile`: the desktop table is used at every width. */
  mobile: TableVariant | null
  note: string
}

type RawColumn = string | { key?: unknown; label?: unknown; align?: unknown; mono?: unknown; nowrap?: unknown; width?: unknown }
type RawCell = unknown
type RawRow = RawCell[] | Record<string, RawCell>
type RawVariant = { columns?: unknown; rows?: unknown; footer?: unknown }
type RawTable = RawVariant & { note?: unknown; mobile?: unknown }

const ALIGNS: Align[] = ['left', 'center', 'right']

/** Parses the block's `table` property. Null when it is not JSON or describes no columns. */
export function parseTable(raw: string | null | undefined): TableData | null {
  if (!raw || !raw.trim()) return null
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return null
  }
  if (!json || typeof json !== 'object' || Array.isArray(json)) return null
  const t = json as RawTable

  const desktop = variant(t, null)
  if (!desktop || desktop.columns.length === 0) return null

  const mobile = t.mobile && typeof t.mobile === 'object' && !Array.isArray(t.mobile) ? variant(t.mobile as RawVariant, desktop) : null

  return {
    desktop: finish(desktop),
    mobile: mobile ? finish(mobile) : null,
    note: typeof t.note === 'string' ? t.note.trim() : '',
  }
}

/**
 * One variant. With a `fallback` (the desktop table, when building the mobile one) a missing
 * part is taken from it: no columns means the desktop columns, no rows means the desktop rows
 * re-projected onto whatever columns this variant has, keyed by column key.
 */
function variant(v: RawVariant, fallback: TableVariant | null): TableVariant | null {
  const columns = Array.isArray(v.columns) ? (v.columns as RawColumn[]).map(column).filter((c): c is TableColumn => !!c) : fallback?.columns ?? []
  if (columns.length === 0) return null

  let rows: TableCell[][]
  if (Array.isArray(v.rows)) {
    rows = (v.rows as RawRow[]).map((r) => row(r, columns)).filter((r): r is TableCell[] => !!r)
  } else if (fallback) {
    rows = fallback.rows.map((r) => project(r, fallback.columns, columns))
  } else {
    rows = []
  }

  let footer: TableCell[] | null = null
  if (Array.isArray(v.footer) || (v.footer && typeof v.footer === 'object')) {
    footer = row(v.footer as RawRow, columns)
  } else if (fallback?.footer && !Array.isArray(v.rows) && !Array.isArray(v.columns)) {
    footer = project(fallback.footer, fallback.columns, columns)
  } else if (fallback?.footer && !Array.isArray(v.rows)) {
    footer = project(fallback.footer, fallback.columns, columns)
  }

  return { columns, rows, footer }
}

function column(c: RawColumn): TableColumn | null {
  if (typeof c === 'string') {
    const label = c.trim()
    return label ? { key: label, label, align: null, mono: false, nowrap: false, width: null } : null
  }
  if (!c || typeof c !== 'object') return null
  const key = typeof c.key === 'string' ? c.key.trim() : typeof c.label === 'string' ? c.label.trim() : ''
  if (!key) return null
  return {
    key,
    label: typeof c.label === 'string' ? c.label : key,
    align: ALIGNS.includes(c.align as Align) ? (c.align as Align) : null,
    mono: c.mono === true,
    nowrap: c.nowrap === true,
    width: typeof c.width === 'string' ? c.width : null,
  }
}

/** A row as cells in column order: positional for an array, keyed by column key for an object. */
function row(r: RawRow, columns: TableColumn[]): TableCell[] | null {
  if (Array.isArray(r)) return columns.map((_, i) => cell(r[i]))
  if (r && typeof r === 'object') return columns.map((c) => cell(r[c.key] ?? r[c.label]))
  return null
}

/** Picks the cells of `from` that `to`'s columns name, by key, so a mobile subset needs no rows of its own. */
function project(cells: TableCell[], from: TableColumn[], to: TableColumn[]): TableCell[] {
  return to.map((c) => {
    const i = from.findIndex((f) => f.key === c.key || f.label === c.key)
    return i >= 0 ? cells[i]! : cell(null)
  })
}

function cell(v: RawCell): TableCell {
  const empty: TableCell = { text: '', strong: false, muted: false, mono: false, href: null, align: null, numeric: false }
  if (v === null || v === undefined) return empty
  if (typeof v === 'number') return { ...empty, text: formatNumber(v), numeric: true }
  if (typeof v === 'boolean') return { ...empty, text: v ? 'Yes' : 'No' }
  if (typeof v === 'string') return { ...empty, text: v }
  if (typeof v === 'object') {
    const o = v as { text?: unknown; value?: unknown; strong?: unknown; muted?: unknown; mono?: unknown; href?: unknown; align?: unknown }
    const inner = cell(o.text ?? o.value ?? null)
    return {
      ...inner,
      strong: o.strong === true,
      muted: o.muted === true,
      mono: o.mono === true || inner.mono,
      href: typeof o.href === 'string' && /^(https?:\/\/|\/|#|mailto:)/.test(o.href) ? o.href : null,
      align: ALIGNS.includes(o.align as Align) ? (o.align as Align) : null,
    }
  }
  return { ...empty, text: String(v) }
}

/** Numbers as an editor would type them: thousands separated, up to three decimals kept. */
function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return String(n)
  return n.toLocaleString('en-US', { maximumFractionDigits: 3 })
}

/**
 * Settles what the author left open: a column whose body cells are all numbers (or empty) is
 * right-aligned and monospaced unless the author said otherwise.
 */
function finish(v: TableVariant): TableVariant {
  const columns = v.columns.map((c, i) => {
    const body = v.rows.map((r) => r[i]).filter((cell) => cell && cell.text !== '')
    const numeric = body.length > 0 && body.every((cell) => cell!.numeric)
    return numeric ? { ...c, align: c.align ?? 'right', mono: c.mono || true } : c
  })
  return { ...v, columns }
}
