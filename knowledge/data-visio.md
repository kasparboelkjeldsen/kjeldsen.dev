# Data Visio blocks

A chart in an article is drawn by a model from a dataset the editor pasted. The **Data Visio
Block** in the grid takes the data as JSON, a sentence about what the chart should say, a chart
type (or *Auto*) and a choice of model; when the page is saved, the model writes the Apache ECharts
option that draws it, and the frontend renders that with a preconfigured ECharts build. The
same block is a half-width cell or a full-width one, on a phone or a desktop - the script lays
itself out for the box it gets.

The test page is `/data-visio/`.

## The pieces

| Where | What |
|---|---|
| Element type `dataVisioBlock` (`uSync/v18/ContentTypes/datavisioblock.config`) | *Content*: `dataset`, `prompt`, `chartType`, `model`, `caption`, `regenerate`. *Generated*: `summary`, `spec`, `meta`, `generationStatus`, `generationHash`. Allowed in the default grid at 6 or 12 columns. |
| Data types *Data Visio - Chart Type* and *Data Visio - Model* | Dropdowns. The model one says "Sonnet 5.5 (fast)" / "Opus 5.5 (best)"; `DataVisio.ProfileFor` maps anything mentioning Opus to the `opus-5-5` profile and the rest to `sonnet-5-5`. |
| `code/visio/DataVisioSavingHandler.cs` | `ContentSavingNotification` handler. Walks the page's block grid JSON for items of the element type, reads the brief, writes the result back into the item's values. Generates when the brief's fingerprint changed, when there is no chart yet, or when *Regenerate* is ticked. Failures go to *Status*; the save never fails because of it. |
| `code/visio/DataVisioGenerator.cs` | The conversation and the contract. One system prompt (what the page looks like, what the runtime offers, the design rules) and one user turn (the brief and the dataset, truncated past 24k characters). Parses `===META===` / `===SCRIPT===`, refuses a script that reaches outside the chart. |
| `kjeldsen.frontend/shared/visio.ts` | Reads the block, the box-sizing rule, the palette and fonts the script sees as `ctx`, the host-side `tuneOption`, the forbidden-API guard. Shared by server and browser. |
| `kjeldsen.frontend/shared/echarts.ts` | The ECharts build: which charts, components and features are registered, and the `kjeldsen` theme (Inter, muted hairlines, the accents as series colours, a dark tooltip). The prompt lists exactly what is registered here. |
| `kjeldsen.frontend/server/utils/visio.ts` | The chart as a server-rendered SVG still, run in a `node:vm` context with a timeout. Added to the block as `still` by `prepareBlock` (next to code highlighting) for the page payload and for the backoffice preview. |
| `kjeldsen.frontend/app/components/blocks/DataVisioBlock.vue` + `DataVisioChart.vue` | The frame, caption and box; the live chart built when the box scrolls into view, resized by a ResizeObserver, re-laid-out when it crosses the compact breakpoint. |

## The contract with the model

The script is the **body** of `(data, echarts, ctx) => option`:

- `data` is the dataset parsed from JSON. The option is computed from it, never a copy of it,
  which keeps the stored script small and means an edited dataset with the same shape redraws
  without a regeneration (the fingerprint changes, so it *will* regenerate on save; a hand edit
  to the script survives until then).
- `echarts` is the module, for `echarts.graphic.LinearGradient` and the like.
- `ctx` is `{ width, height, compact, span, colors, palette, fonts }`. `compact` is true under
  480 px, which covers phones and half-width cells on a desktop. The function is called again
  when `compact` flips.
- A `===META===` JSON block in front carries `aspect` (width/height the chart wants), `summary`
  (the chart in words, stored on the block, used as the box's `aria-label` and shown where the
  still could not be drawn) and `notes` for the editor (kept in *Status*).

Available series types: bar, line, pie, scatter, radar, heatmap, treemap, sunburst, sankey,
funnel, gauge, boxplot, candlestick, graph. Add one in `shared/echarts.ts` and in the prompt
together.

## Sizing

The box's height is CSS: `clamp(260px, 100cqw / aspect, 600px)` on a wide frame,
`clamp(240px, 100cqw / min(aspect, 1.25), 480px)` under 480 px (container query on the frame).
`visioHeight()` in `shared/visio.ts` is the same rule in TypeScript, used to size the server
still. Because the height is settled by CSS before any script runs, nothing shifts when the live
chart replaces the still.

A full-width block breaks out of the text column like a photo; a half-width one stays in its
cell, which on a desktop is about 260 px wide. Charts there are small multiples and the script
is told so through `compact`.

## The still

ECharts renders to an SVG string without a DOM, so the page arrives with every chart drawn: no
empty box while the chart chunk loads, a picture for readers without JavaScript, and a picture
in the backoffice block preview, which injects markup and never runs scripts. The browser
builds the live chart when the box scrolls into view - so the entrance animation is seen - and
fades the still out under it.

The still is drawn at 860 px (full width) or 400 px (half) and scaled by the box; on a phone it
letterboxes slightly until the live chart takes over.

## Things to know

- **The save waits for the model**: 20-60 s per chart with Sonnet, longer with Opus. Several
  charts on one page generate one after another in the same save. Front Door gives the origin
  240 s; past that the backoffice sees a 504 while the save finishes anyway, as with generated
  graphics. Save charts a block or two at a time.
- **Generation runs where the Anthropic key decrypts** - production, as described in
  [generated-graphics.md](generated-graphics.md). Locally the handler reports `invalid x-api-key`
  in *Status* and leaves any existing chart alone.
- **The script runs on the page and on the server.** That is the design: the editor who saved
  the block is trusted with the page already (the rich text editor extends the same trust). The
  generator refuses a script that names the document, window, network or timers; the frontend
  checks again before running one; the server runs it in a fresh V8 context with only its three
  arguments and an 800 ms timeout. None of that is a sandbox against a determined author, all
  of it stops a bug.
- **Block values in the saving notification are in database form.** A dropdown's pick arrives
  as the string `["Bar"]`, not an array; a boolean may be `"1"`. The handler unwraps dropdowns
  by their `editorAlias` only, because a dataset is a JSON array too.
- **System.Text.Json nodes cannot be re-attached to their parent.** The walker edits objects
  and arrays in place and only ever replaces strings (a nested block editor's JSON).
- **Variable names are not globals.** `self`, `top` and `parent` were on the forbidden list for
  an afternoon; a donut script with `const top = data.sources[0]` was refused for it. Only names
  that are nothing but globals are listed.
- **Cost**: roughly $0.05-0.15 a chart with Sonnet, three to five times that with Opus. The
  fingerprint stops a save that changed nothing in the brief from paying again.
- **The chunk**: ECharts core plus the registered charts is about 350 KB compressed, loaded only
  on a page with a chart, from this origin.
