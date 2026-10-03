# Blocks

Every page body is a **block grid** (`defaultGrid` data type, twelve columns). This note is the
catalogue: what each block takes, what the frontend does with it, and how to write one through the
Management API or the Umbraco MCP. The frontend maps aliases to components in
`kjeldsen.frontend/app/components/content/BlockResolver.vue`; a block without a component renders
a labelled placeholder rather than nothing.

## Writing blocks through the API

The grid property's value is Umbraco's block grid JSON:

```json
{
  "layout": { "Umbraco.BlockGrid": [
    { "$type": "BlockGridLayoutItem", "columnSpan": 12, "rowSpan": 1, "areas": [], "contentKey": "<guid>", "settingsKey": null }
  ] },
  "contentData": [
    { "contentTypeKey": "<element type key>", "key": "<guid>", "values": [
      { "editorAlias": "Umbraco.TextBox", "culture": null, "segment": null, "alias": "headerTitle", "value": "..." }
    ] }
  ],
  "settingsData": [],
  "expose": [ { "contentKey": "<guid>", "culture": null, "segment": null } ]
}
```

One layout item, one contentData item and one expose entry per block, all on the same key.
Dropdown values are arrays (`["H2"]`); media pickers are arrays of
`{ "key": <guid>, "mediaKey": <media guid>, "mediaTypeAlias": "Image", "crops": [], "focalPoint": null }`;
rich text is `{ "markup": "<p>...</p>", "blocks": null }`. `kjeldsen.experiment/visio/` keeps
scripts that write whole pages this way. Pages vary by culture (`en-US`) even though properties do
not. A page created from a local run needs a re-save and publish before production routes it.

**Column spans.** A block spanning 12 owns the row and may break out of the text column (images,
code, charts, tables do); 6 sits beside a neighbour on a wide screen and stacks on a phone.
Everything is allowed at root and in areas.

**Emphasis markers.** Plain-text fields across the site accept `**bold**` and `--italic--`; the
frontend escapes the text and turns only those into styled spans (`app/utils/marks.ts`). Nothing
else in a text field becomes markup.

## The blocks in use

### Header Block - `headerBlock` (`9ede4277-930d-4106-b18c-b3380269d981`), 12 only

| Property | Editor | Notes |
|---|---|---|
| `headerTitle` | Textstring | The heading, with emphasis markers. |
| `headerLevel` | Dropdown | `H1` to `H5`. Level 2 headings get an id and feed the post outline. |

### RTE Block - `rteBlock` (`387fbbea-8c41-4019-ac76-c3e6e590f6e1`), 6 or 12

| Property | Editor | Notes |
|---|---|---|
| `richText` | Rich text | Rendered as the article's prose. Emphasis markers work inside the markup too; real `<strong>`/`<em>` are styled to match. |

### Code Block - `codeBlock` (`f618abe7-aaac-4ad7-927c-4d39b15c975d`), 6 or 12

| Property | Editor | Notes |
|---|---|---|
| `code` | Markdown editor | A fenced block: ```` ```csharp ... ``` ````. The language on the fence picks the grammar; the fences are dropped. Highlighted on the server (`server/utils/highlight.ts`) with grammars for csharp, json, html, typescript, javascript, bash, yaml, xml, css, vue, powershell, razor and markdown; anything else renders plain. A copy button comes with it. |

### Image Block - `imageBlock` (`1495d116-fbc6-4c94-905d-65c841fe85d0`), 6 or 12

| Property | Editor | Notes |
|---|---|---|
| `image` | Media picker (Image or Generated Graphics) | A photo is served through `/api/media` with a srcset per shape; a Generated Graphics item is inlined as SVG with its GSAP timeline ([generated-graphics.md](generated-graphics.md)). |
| `altText` | Textstring | |
| `bottomText` | Textstring | Caption under the picture. |
| `cropPreference` | Dropdown | `Ratio` (16:9, default), `Square`, `Slim` (4:1), `None`. Picks the crop ladder, not an alias. |

### Open Image Block - `openImageBlock` (`0da33810-d90d-451c-beb8-858ebe1a487b`), 6 or 12

An Image Block that opens. In the page it is the same picture, crop ladder, frame and caption
(`OpenImageBlock.vue` renders `ImageBlock.vue` with `zoom`), plus a corner badge and a zoom-in
cursor. Clicked, it opens `ImageLightbox.vue`: a native modal `<dialog>` with the **whole,
uncropped** image, as large as the screen allows and never upscaled past the original. The
opened image is still resized through `/api/media` (a WebP srcset from 480 to 2000 px wide,
capped at the original's width); zooming in switches the `sizes` hint so the browser fetches the
largest. Wheel, pinch, double click or double tap zoom (up to 4x) about the cursor or fingers;
a zoomed picture pans with a drag, and an unzoomed one is dismissed by dragging it up or down.
Escape, the close button or a tap beside the picture closes it; `+`, `-`, `0` and the arrows work
from the keyboard. Focus returns to the picture.

| Property | Editor | Notes |
|---|---|---|
| `image` | Image Media Picker (images only), mandatory | Same media JSON as `imageBlock.image`. Generated Graphics are not offered here. |
| `altText` | Textstring | Also the dialog's accessible name. |
| `bottomText` | Textstring | Caption under the picture and at the foot of the opened view. |
| `cropPreference` | Dropdown | As on the Image Block; only the in-page picture is cropped. |

### Read More Block - `readMoreBlock` (`5eaba068-1493-4873-81ea-a893365c1d97`), 6 or 12

Text that starts folded: about four lines show, fading out, above a pill button carrying the
label. Opening animates the height to the full text, melts the fade and draws a sky-to-ember rule
down the left edge; the button becomes the close label and the chevron turns. Closing a long text
from below scrolls the block back into view. Text that fits inside the fold shows whole with no
button. The whole text is in the server-rendered markup (`ReadMoreBlock.vue`).

| Property | Editor | Notes |
|---|---|---|
| `label` | Textstring | The button. Empty means "Read more". Emphasis markers work: `How the --segment-aware-- cache works`. |
| `text` | Rich text (`Read More Rich Text`, `52308e7d-8261-4ce2-9214-476a0277ca36`), mandatory | Text only: paragraphs, bold, italic, underline, strike, sub/superscript, links, lists, quotes, rules. No images, media, embeds, tables, code blocks, headings or source editing. Written as `{ "markup": "<p>...</p>", "blocks": null }`; emphasis markers work. |
| `closeLabel` | Textstring | Optional; the button once open. Empty means "Show less". |

### Table Block - `tableBlock` (`c8d9e0f1-2a3b-4c5d-8e6f-7a8b9c0d1e2f`), 6 or 12

| Property | Editor | Notes |
|---|---|---|
| `table` | Textarea | JSON, format below. |
| `caption` | Textstring | Under the table, and the table's accessible name. |

Rendered by `TableBlock.vue` through the parser in `shared/table.ts`. A table wider than its cell
scrolls sideways inside its frame.

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

- **Columns**: a label, or `{ key, label, align (left|center|right), mono, nowrap, width }`.
  `key` defaults to `label`; `width` is a CSS width.
- **Rows**: an array of cells in column order, or an object keyed by column `key` (or label).
  Missing cells are empty.
- **Cells**: a string, number, boolean or null, or `{ text, strong, muted, mono, href, align }`.
  `href` takes `https://`, `/`, `#` and `mailto:` only. Numbers are formatted with thousands
  separators (up to three decimals); a column whose body is all numbers right-aligns and goes
  monospace by itself.
- **`footer`**: one row rendered as totals. **`note`**: a footnote after the caption.
- **`mobile`**: the table below 48 rem. Same shape; whatever it leaves out comes from the desktop
  table. `columns` alone re-projects the desktop rows onto those columns by key (a subset or a
  reorder needs no rows of its own); `rows` alone keeps the columns and swaps the rows. Both
  variants are in the server-rendered markup and CSS picks one by width.

Invalid JSON renders a small "Table JSON missing or invalid" panel.

### Data Visio Block - `dataVisioBlock` (`b7e4c2a1-6d3f-4e8b-9a5c-1f2d3e4a5b6c`), 6 or 12

A chart the model writes from a dataset on save. The whole story is in
[data-visio.md](data-visio.md); the editor's side:

| Property | Editor | Notes |
|---|---|---|
| `dataset` | Textarea | JSON object or array. Handed to the chart as-is; the model computes from it. |
| `prompt` | Textarea | What the chart should say: what to highlight, units, period, comparison. |
| `chartType` | Dropdown | `Auto` or one of Bar, Horizontal bar, Stacked bar, Line, Area, Scatter, Bubble, Pie, Donut, Radar, Heatmap, Treemap, Sunburst, Sankey, Funnel, Gauge, Boxplot, Candlestick, Graph. |
| `model` | Dropdown | `Sonnet 5.5 (fast)` or `Opus 5.5 (best)`; empty means Sonnet. |
| `caption` | Textstring | Under the chart. |
| `regenerate` | Toggle | One-shot: redraw on the next save; clears itself. |

`summary`, `spec`, `meta`, `generationStatus` and `generationHash` on the *Generated* tab are
written by the model; do not set them when creating a block. The save waits for the model, 20-60
seconds a chart, so write charts one or two at a time. Generation needs an Anthropic key that
decrypts on the saving server: production has one, a local run needs the development key from
user secrets ([local-development.md](local-development.md)).

### Spotlight Block - `spotlightBlock` (`a34c3bf8-3b46-4f88-9bb0-09b0ed11c963`), 6 or 12

A highlighted panel with an icon.

| Property | Editor | Notes |
|---|---|---|
| `header` | Textstring | Emphasis markers work. |
| `text` | Rich text | |
| `iconImage` | Media picker | Shown at 96 px. |

### Vimeo Block - `vimeoBlock` (`37af3f54-4f3f-47ea-858e-9556f6e7c9cf`), 12 only

| Property | Editor | Notes |
|---|---|---|
| `url` | Textstring | A vimeo.com page URL; the numeric id is embedded. Anything else renders nothing. |

### Cache Key Example Block - `cacheKeyExampleBlock` (`2fbb5f26-eb3b-443e-80ac-5699dcbab4ea`), 6, 9 or 12

No properties. Prints the cache keys of the page it sits on, for the caching posts. The block
catalogue filter (`code/blockfilter/`) only offers it on the *umbraco packages* page and pages
whose name contains "Caching".

### Api User Test - `apiUserTest` (`569c6ba9-0dd0-4974-8e82-b2103a5b0aed`), 6 or 12

No properties. Two buttons that call the Delivery API from the browser, anonymously and as a
deliberately published, read-one-node API user, for the post about API users.

## Defined but without a frontend component

These exist in the CMS (and in the grid's allowed list) but `BlockResolver.vue` has no component
for them, so they render as a placeholder. Leave them unless a post needs one.

| Alias | Key | What it is |
|---|---|---|
| `imageBlockPersonalized` | `d5c2bc6a-ccca-43af-b5a6-8b4fa6f40b4d` | Same properties as `imageBlock`; from the Engage personalization experiments. |
| `cardBlock` / `card` | `bfe8a0c1-fb50-4924-8a72-f358d4148358` / `f4465054-6c72-4903-9433-65d9e3f6cb24` | A title and rich text with a block list of cards (`title`, `call`). |
| `funTimeWebEkg`, `funTimeWebMurderBlock` | `5e0f13c0-…`, `9ff4c671-…` | Markers for the "fun time web" demos, no properties. |
| `testBlock` | `fb1c626d-b539-49be-9295-412f1bfe462a` | One property of every editor type; a fixture for testing the Delivery API's output. Not in the grid. |
| `writerElement` | `e752af0d-e084-415f-9604-14d6313559c8` | `writerName`, `luckyNumber`; used by the blog post's writer picker, not the grid. |

## Adding a block

1. Create the element type (backoffice, MCP or Management API) and allow it in `defaultGrid` with
   its column spans; uSync exports both to `uSync/v18/` on save, and the shared database means
   production has it at once.
2. `npm run gen` in the frontend (CMS running) regenerates the typed models.
3. A component in `app/components/blocks/` and a line in `BlockResolver.vue`. Server-side work per
   block (highlighting, chart stills) goes through `prepareBlock` in `server/utils/highlight.ts`.
4. Styles in `app/assets/css/main.css`, then rebuild `kjeldsen.backend/wwwroot/css/cms.css` so the
   backoffice preview matches.
5. A section here.
