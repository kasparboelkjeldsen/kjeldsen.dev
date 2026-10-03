# Table blocks

A **Table Block** in the grid is a table described as JSON in its `table` property, with an
optional `caption`. Written by an editor or by an agent through the Management API or the
Umbraco MCP; rendered by `kjeldsen.frontend/app/components/blocks/TableBlock.vue` with the parser
in `kjeldsen.frontend/shared/table.ts`. Half or full width in the grid; a table wider than its
cell scrolls sideways inside its frame.

## The format

```json
{
  "columns": [
    "Package",
    { "key": "version", "label": "Version", "mono": true, "nowrap": true },
    { "key": "size", "label": "Size (MB)", "align": "right" }
  ],
  "rows": [
    ["Umbraco.Cms", "18.2.0", 42.1],
    { "Package": "Umbraco.AI", "version": "18.4.0", "size": 7.3 },
    [{ "text": "Umbraco.Engage", "href": "https://umbraco.com/products/umbraco-engage/" }, "18.2.1", { "text": "11.0", "muted": true }]
  ],
  "footer": ["Total", "", 60.4],
  "note": "Package sizes as unpacked, October 2026.",
  "mobile": {
    "columns": ["Package", { "key": "size", "label": "MB", "align": "right" }]
  }
}
```

**Columns** - each is a label (string) or an object:

| Field | Meaning |
|---|---|
| `key` | How rows refer to the column when they are objects. Defaults to `label`. |
| `label` | The header text. May use `**bold**` / `--italic--`. |
| `align` | `left` (default), `center`, `right`. |
| `mono` | Monospace cells (versions, hashes, numbers). |
| `nowrap` | Never wrap this column. |
| `width` | A CSS width for the column, e.g. `"40%"` or `"12rem"`. |

**Rows** - each is an array of cells in column order, or an object keyed by column `key` (or
`label`). Missing cells are empty.

**Cells** - a string, number, boolean or `null`, or an object:

| Field | Meaning |
|---|---|
| `text` | The content (a number is fine). May use `**bold**` / `--italic--`, the site's emphasis markers. |
| `strong` | Bold, brighter. |
| `muted` | Dimmed. |
| `mono` | Monospace. |
| `href` | Makes the cell a link. `https://`, `/`, `#` and `mailto:` only. |
| `align` | Overrides the column's alignment for this cell. |

Numbers are formatted with thousands separators (up to three decimals) and a column whose body
is all numbers is right-aligned and monospaced on its own.

**`footer`** - one row rendered as totals (bolder, ruled above). **`note`** - a footnote shown
after the caption.

**`mobile`** - the table below 48 rem (phones). Same shape as the top level (`columns`, `rows`,
`footer`); whatever it leaves out comes from the desktop table:

- `mobile.columns` alone: the desktop rows are re-projected onto those columns by key, so a
  subset or reorder of columns needs no rows of its own. The example above drops the version on
  phones.
- `mobile.rows` alone: different rows, same columns - say, fewer of them, or shorter labels.
- No `mobile`: the desktop table is shown at every width and scrolls sideways if it has to.

Both variants are in the server-rendered markup; CSS picks one by width, so nothing re-lays out
when the page hydrates.

## Writing one through the API

The block is an item of element type `tableBlock` (key `c8d9e0f1-2a3b-4c5d-8e6f-7a8b9c0d1e2f`) in
a page's block grid. Its values are `table` (the JSON above, as a string) and `caption`. The
grid's JSON shape is the usual `layout` / `contentData` / `expose` of Umbraco's block grid; see
`kjeldsen.experiment/visio/visio-page.mjs` for a complete page written through the Management API.

Text is never trusted as markup: cell text is escaped and only the two emphasis markers become
spans. Invalid JSON renders a small "Table JSON missing or invalid" panel rather than nothing.
