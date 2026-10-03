# Writing a post for kjeldsen.dev - a guide for whoever drafts it

This file is self-contained. Hand it to an agent (or a person) together with notes, data and
whatever else the post should be made from, and ask for a **structured draft**: a sequence of
blocks in the notation below. The draft is then placed in the CMS block by block, by a person in
the backoffice or by an agent through the Management API or the Umbraco MCP. Nothing in the draft
needs to be code. Everything the CMS needs is text, a few JSON snippets, and clear instructions
for the pictures.

## The site in one paragraph

kjeldsen.dev is Kaspar Boel Kjeldsen's personal developer blog: a headless Umbraco 18 backend,
a Nuxt 4 frontend, run cheaply on Azure, all of it open source. Posts are about Umbraco, headless
CMS work, caching, pipelines, AI in the editorial workflow, and whatever was built last. The
design is dark and editorial: a near-black page, one serif display face for headings, an
accent palette of sky blue, violet, ember orange and gold. Illustrations are flat vector drawings
rather than stock photos; charts are drawn in the page, not pasted in as images. The voice is
first person, direct, a little playful, honest about what went wrong and what it cost. Danish
puns in titles are allowed ("Headless - Not Hovedløst").

## What a post consists of

Every post has a few fields and then a body made of blocks.

```
TITLE:            The page name. Short, specific, may be a play on words.
SEO TITLE:        Optional. Defaults to the title.
SEO DESCRIPTION:  One or two sentences for search and social cards, 150 characters or so.
KEYWORDS:         Optional, comma separated.
LIST IMAGE:       The hero backdrop, the listing card picture and the social image.
                  A photo, or a generated illustration (see IMAGE BLOCK for how to brief one).
WRITER:           Kaspar, unless told otherwise.
PUBLISHING DATE:  Leave to the publisher unless the notes give one.
```

The body is a grid twelve columns wide. Each block spans the full width (12) or half (6). Two
half-width blocks sit side by side on a desktop and stack on a phone. Use half widths sparingly:
a pair of small charts, two small tables, a picture beside a short note. Everything else is full
width.

## The block notation

Write the body as one block per line (or per paragraph), each starting with the block name in
square brackets. Add `| span: 6` when a block should be half width. Keep the blocks in reading
order.

```
[HEADER] h1 | The little model that could
[RTE] A paragraph or several. Markdown-ish prose is fine: paragraphs, lists, links, inline code.
[IMAGE] photo: a cat asleep on a server rack | alt: A cat asleep on a server rack | caption: Production, 03:12
[OPEN IMAGE] photo: the full Azure portal blade | alt: ... | caption: ... | shape: Ratio
[READ MORE] label: How the cache key is built | close: Fold it back
    Prose that most readers can skip, folded away until asked for.
[CODE] csharp
    ...code...
[SPOTLIGHT] header: What this cost | text: Two evenings and about $17 of API calls.
[TABLE] caption: ... | JSON below
    { ...table json... }
[CHART] type: Bar | model: Sonnet | caption: ... | prompt: ... | dataset below
    { ...dataset json... }
[VIMEO] https://vimeo.com/123456789
```

What each block takes, in detail:

### [HEADER]

`[HEADER] h2 | The heading text`

Levels h1 to h5. One h1 per post (the title is shown separately in the hero, so the first h1 in
the body is the post's opening heading or is skipped altogether; most posts start with an RTE
block). h2 headings form the post's outline in the sidebar, so make them the sections. Emphasis
markers work in headings: `**ember**` and `--italic--`, see below.

### [RTE]

The prose. Write it as normal text with paragraphs; the person placing it will put it through
the rich text editor. Allowed inside: paragraphs, bulleted and numbered lists, links, inline
`code`, block quotes. Not allowed inside: images, tables, code listings, headings - those are
their own blocks, so split the prose around them.

Emphasis: the site has two markers of its own that work everywhere text goes.
`**like this**` renders in a warm ember gradient, bold. `--like this--` renders in the serif
italic, lavender. Use them for the one phrase in a paragraph that matters, not for every noun.
Ordinary bold and italic are fine too and look the same.

Length: a paragraph is three to five sentences. A section is two to five paragraphs. A post is
usually 800 to 2,000 words of prose plus its blocks.

### [IMAGE]

Two kinds. A **photo** the publisher will find or has:

`[IMAGE] photo: what the picture should show | alt: ... | caption: ... | shape: Ratio`

- `shape` is `Ratio` (16:9, the default), `Square`, or `Slim` (4:1, a banner).
- `alt` is for screen readers: what is in the picture, one sentence.
- `caption` is optional, shown under the picture in small monospace.

Or a **generated illustration**: a flat vector drawing the site makes from a brief, optionally
animated. Use this when there is no photo, or when the photo is a placeholder for a concept.

```
[IMAGE] generated | aspect: 16:9 | animate: yes
  prompt: A small orange mannequin without a head, standing at a drafting table, sketching a
          website on paper; warm wood tones, soft lamp light, the mannequin clearly orange.
  animation: The mannequin's hand sketches a few lines, pauses, and the lamp flickers once;
             three to four seconds, gentle.
  alt: A headless mannequin sketching a website at a drafting table
  caption: optional
```

How to brief one well: say what is in the scene, where things are, what colours matter, the mood.
The drawing style is fixed (cute, flat, rounded, hand-made feel on a dark page) so do not
describe style, describe content. If a reference photo exists, say so; the drawing will follow
its palette and composition. Animation is one clear action, two to five seconds, that plays once
and again on hover. `aspect` is `16:9` by default; `4:1` for a banner, `1:1` for a square, `3:1`
for a hero that will also be the list image.

### [OPEN IMAGE]

`[OPEN IMAGE] photo: what the picture should show | alt: ... | caption: ... | shape: Ratio`

A photo that the reader can open. In the page it looks exactly like an `[IMAGE]` photo, cropped
to its `shape`, with a small expand badge in the corner. Clicked or tapped, it opens over the page
**whole and uncropped**, as large as the screen allows, and the reader can zoom in (scroll,
double-click, pinch, double-tap) and drag it around; on a phone a swipe down closes it. The
caption is shown in both places.

Use it when the detail is the point: a screenshot with small text, a dashboard, a diagram, a
wide photo whose crop loses something. A plain illustration stays an `[IMAGE]`. Photos only:
a generated illustration cannot be opened, and a small screenshot is never enlarged past its own
size, so give a full-size capture. `shape: None` shows the uncropped picture in the page too.

### [READ MORE]

```
[READ MORE] label: How the cache key is built | close: Fold it back
  The prose that is folded away. Paragraphs, lists, links, quotes and the emphasis markers;
  nothing else.
```

A fold-out. The first four lines or so of the text show, fading out above a button with the
`label`; the reader taps it and the rest unfolds. `label` is what the button says, so make it
say what is inside ("The three things that broke", "How the cache key is built"); left out, it
reads "Read more". `close` is optional and defaults to "Show less". Emphasis markers work in
both.

Use it for what most readers can skip and some will want: the long story behind a decision, a
derivation, a list of edge cases, a war story that would break the flow. The main argument never
goes in a fold. Text only: no images, tables, code listings or headings inside; those stay their
own blocks, before or after it. A text shorter than the fold simply shows whole, so do not fold
two sentences. One or two per post; half width (`| span: 6`) works beside an image.

### [CODE]

```
[CODE] csharp
    public sealed record Thing(string Name);
```

The language on the first line picks the highlighting: csharp, json, html, typescript,
javascript, bash, yaml, xml, css, vue, powershell, razor, markdown. Anything else renders plain.
Keep listings short enough to read on a phone: under 30 lines, under 90 columns; trim what the
prose does not discuss. A copy button is added automatically.

### [SPOTLIGHT]

`[SPOTLIGHT] header: A short heading | text: One or two sentences, may be a short list. | icon: optional, what the small icon should show`

A highlighted panel beside the prose for an aside, a warning, a cost, a takeaway. One or two per
post at most.

### [VIMEO]

`[VIMEO] https://vimeo.com/<id>` - full width, the page URL is enough.

### [TABLE]

For anything that is a list of things with properties: package versions, timings before and
after, where secrets live, a comparison. Give the caption and the table as JSON:

```
[TABLE] caption: What the site runs on
{
  "columns": [
    "Package",
    { "key": "version", "label": "Version", "mono": true, "nowrap": true },
    { "key": "size", "label": "Size (MB)", "align": "right" }
  ],
  "rows": [
    ["Umbraco.Cms", "18.2.0", 42.1],
    { "Package": "Umbraco.AI", "version": "18.4.0", "size": 7.3 },
    [{ "text": "Nuxt", "href": "https://nuxt.com" }, "4.5.2", { "text": "29.8", "muted": true }]
  ],
  "footer": ["Total", "", 79.2],
  "note": "Unpacked package folders, October 2026.",
  "mobile": {
    "columns": ["Package", { "key": "size", "label": "MB", "align": "right" }]
  }
}
```

The rules:

- **columns**: a label, or an object with `key`, `label`, `align` (`left`, `center`, `right`),
  `mono` (monospace cells, for versions and codes), `nowrap`, `width` (a CSS width).
- **rows**: an array of cells in column order, or an object keyed by column `key`.
- **cells**: a string, a number, a boolean, or an object with `text` plus `strong`, `muted`,
  `mono`, `href`, `align`. Strings may use the `**bold**` / `--italic--` markers. Numbers are
  formatted with thousands separators, and a column of numbers right-aligns itself.
- **footer**: an optional totals row. **note**: an optional footnote.
- **mobile**: optional. The table shown on phones. Same shape; whatever it leaves out comes from
  the main table. Giving only `columns` keeps the rows and drops or reorders columns, which is
  the usual move: a five-column table becomes two or three columns on a phone. Giving only
  `rows` keeps the columns with different rows, say shorter labels.

Keep tables under about eight columns and thirty rows; past that it is a chart or an appendix.
A table wider than the page scrolls sideways, which readers tolerate on a desktop and dislike on
a phone - hence `mobile`.

### [CHART]

For anything where the shape of the numbers is the point: a trend, a comparison of sizes, a
share of a whole, a before and after. The site draws the chart itself from the data and a
brief; you do not design the chart, you say what it should show.

```
[CHART] type: Area | model: Opus | caption: Server response time at the edge, last 30 days
  prompt: Response time p50 and p95 in milliseconds over 30 days. The output cache went live on
          day 12; show the drop clearly and mark that day.
  dataset:
  [
    { "day": 1, "p50": 182, "p95": 421 },
    { "day": 2, "p50": 179, "p95": 433 }
  ]
```

- **type**: `Auto` (let the model choose - a good default), or one of Bar, Horizontal bar,
  Stacked bar, Line, Area, Scatter, Bubble, Pie, Donut, Radar, Heatmap, Treemap, Sunburst,
  Sankey, Funnel, Gauge, Boxplot, Candlestick, Graph.
- **model**: `Sonnet` (fast, fine for a clear dataset) or `Opus` (for messy data or a subtle
  point). Sonnet unless there is a reason.
- **prompt**: the point of the chart in a sentence or two, then what matters: what to highlight,
  the units, the period, a comparison to make, a threshold to mark. A title is derived from this,
  so say what the headline is ("the second half shipped three times as much").
- **dataset**: JSON, an array of objects with well-named keys, or an object holding such arrays.
  Name keys as you would label an axis (`month`, `deploys`, `p95`). Units go in the prompt. A few
  thousand rows is fine; the chart computes from the data, it does not copy it.
- **caption**: optional, shown under the chart.

Half-width charts (`| span: 6`) work for small multiples - two or three charts of the same kind
side by side - but each gets about 260 px on a desktop, so keep those simple: one series, few
categories.

## Choosing how to show data

When the notes come with data, decide for each dataset:

| The data is... | Use |
|---|---|
| A handful of facts with labels (versions, settings, costs, where things live) | `[TABLE]` |
| Many rows the reader may want to look up | `[TABLE]` with a `mobile` subset, or split into two tables |
| A trend over time | `[CHART]` Line or Area; mark the event that changed it |
| Sizes of a few things compared | `[CHART]` Bar (Horizontal bar when labels are long or there are more than eight) |
| Parts of a whole, at most six parts | `[CHART]` Donut |
| Before and after, a few measures | A small `[TABLE]` with strong "after" cells, or a Bar chart with two series |
| A single headline number | Prose or a `[SPOTLIGHT]`, not a chart |
| Relationships, flows between stages | `[CHART]` Sankey or Graph, sparingly |

One chart per point. If a dataset makes two points, that is two charts or a chart and a table.
The prose around a chart says what the reader should see in it and then moves on; the chart's
own title carries the headline, so do not repeat the numbers in a caption.

Numbers in prose: round them, give the unit, give the comparison ("from 420 ms to 95 ms, a
fifth of what it was"). Exact figures belong in the table.

## Shape of a good post

1. **Open with the point**, two or three paragraphs: what was built or found, why it matters,
   what the reader gets. No "In this post I will".
2. **The list image**: say what it should be. A generated illustration of the central idea,
   in 3:1, is the house style now; a photo works too.
3. **Sections with h2 headings**, each one thing: the problem, the approach, what happened, the
   numbers, what it cost, what is next. Four to seven sections.
4. **Evidence where it is claimed**: the code listing next to the paragraph that explains it,
   the chart next to the result it shows, the table next to the comparison, the screenshot
   (as an `[OPEN IMAGE]`, so its detail can be read) next to the step it shows. Detail that would
   break the flow goes in a `[READ MORE]`.
5. **A spotlight** for the one thing to remember, or the cost, or the warning.
6. **Close short**: what is next, or a question, or a link to the code. No summary of the post.

## Example draft

```
TITLE: The little model that could
SEO DESCRIPTION: Sonnet 5.5 drew the illustrations and the charts for this blog for under a dollar a piece. What it got right, where Opus had to step in, and what it cost.
KEYWORDS: umbraco, umbraco.ai, anthropic, charts, illustrations
LIST IMAGE: generated | aspect: 3:1 | animate: yes
  prompt: A small round robot at an easel painting a bar chart on canvas, brush in hand, a cup of
          coffee on a stool, warm lamp light on a dark studio floor.
  animation: The brush adds the last bar, the robot leans back to look, the coffee steams.
  alt: A small robot painting a bar chart at an easel

[RTE] Last week every picture on this blog was a stock photo. This week most of them are drawings
the site made for itself, and the charts are drawn in the page from the numbers they show. The
editor pastes data and a sentence; the model does the rest on save. This is what that took and
what it cost.

[HEADER] h2 | What the editor sees
[RTE] ...three paragraphs on the block, the save, the status field...
[OPEN IMAGE] photo: the backoffice with a Data Visio block open, dataset pasted, status filled in | alt: The Data Visio block in the Umbraco backoffice | caption: One block, one save, one chart

[HEADER] h2 | Sonnet first, Opus when it matters
[RTE] ...two paragraphs...
[CHART] type: Bar | model: Sonnet | caption: Time to draw a chart, by model
  prompt: Seconds per chart for Sonnet and Opus across the twelve charts drawn this week. Opus is
          slower; show how much, and that Sonnet is consistent.
  dataset: [ { "chart": "deploys", "sonnet": 28, "opus": 41 }, ... ]
[TABLE] caption: What a chart costs
{ "columns": ["Model", { "key": "in", "label": "Input tokens", "align": "right" }, { "key": "out", "label": "Output tokens", "align": "right" }, { "key": "cost", "label": "Cost", "align": "right" }],
  "rows": [["Sonnet 5.5", 2600, 3300, "$0.06"], ["Opus 5.5", 3300, 4600, "$0.39"]] }

[HEADER] h2 | Where it went wrong
[RTE] ...the heart that flew to the top-left corner, the donut refused for naming a variable top...
[CODE] javascript
    const top = data.sources[0]; // refused, once
[READ MORE] label: The other four things that broke
  ...a paragraph or a short list per failure, for the reader who wants all of them...
[SPOTLIGHT] header: Cost of the week | text: Twelve charts, nine drawings, about $22 of API calls. The decorator that let a laptop use the key cost more in head-scratching than the charts did in dollars.

[HEADER] h2 | What is next
[RTE] ...one paragraph...
```

## Handing the draft over

The draft goes to the person or agent that places it in the CMS. They will take each block as
written: prose into RTE blocks, folded prose and its labels into Read More blocks, JSON into
Table and Chart blocks verbatim, image briefs into the media library. So:

- Keep the block order and the notation exact; it is parsed by eye and by hand.
- Put JSON on its own lines, valid and complete. Test it mentally: every row has the columns'
  worth of cells; every dataset key is spelled the same way in every row.
- Write alt text for every image and a prompt for every generated one.
- Mark anything you are unsure of with `[TODO: ...]` rather than guessing a number.
- Do not write the chart titles or axis labels; the chart does that from the prompt.
