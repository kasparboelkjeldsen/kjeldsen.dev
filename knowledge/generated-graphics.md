# Generated graphics

Illustrations on the site are drawn by a model instead of photographed. An editor creates a
**Generated Graphics** media item, writes a prompt, optionally points at a reference photo, and
ticks *Animate*. Saving it sends the brief to the `sonnet-5-5` Umbraco.AI profile; what comes back
is stored on the item as an inline SVG and, when asked, a GSAP timeline. The frontend inlines the
SVG where a photo would go and plays the timeline once when it scrolls into view, again on hover
or tap.

The first one is the hands passing a heart in *The Culture of Kindness*.

## The pieces

| Where | What |
|---|---|
| Media type `generatedGraphics` (`uSync/v18/MediaTypes/generatedgraphics.config`) | `prompt`, `referenceImage`, `aspectRatio`, `animate`, `animationPrompt`, `regenerate` on the *Brief* tab; `svg`, `script`, `generationStatus`, `generationHash` on *Generated*. |
| `code/graphics/GeneratedGraphicsSavingHandler.cs` | `MediaSavingNotification` handler. Generates when the brief's fingerprint changed, when there is no drawing yet, or when *Regenerate* is ticked. Writes failures to *Status*; never blocks the save. |
| `code/graphics/GeneratedGraphicsGenerator.cs` | Builds the conversation, attaches the reference photo (downscaled to 1280 px JPEG, read from the media file system), calls `IAIChatService` with the profile alias, parses the `===SVG===` / `===SCRIPT===` reply, strips script elements and event attributes from the SVG. The whole prompt lives here. |
| `code/graphics/GeneratedGraphicsApiMediaBuilder.cs` | Decorates the delivery API's media builder so a picked Generated Graphics item always carries `svg`, `script` and `animate`. Without it those only appear with `?expand=...`, which the backoffice block preview never sends. |
| Data type *Image or Graphic Picker* | The image block's picker, allowing Image and Generated Graphics. The old *Image Media Picker* (Image only) still serves `seoListImage` and the reference image. |
| `kjeldsen.frontend/app/components/blocks/GeneratedGraphic.vue` | Renders the SVG with `v-html` (server-side, so it is a still before any script) and builds the timeline after mount with `new Function('svg', 'gsap', script)`. `fit="cover"` fills a box and crops (the root's `preserveAspectRatio` is switched to `slice`); `trigger="manual"` leaves playing to the parent through the exposed `replay()`. `document.querySelector('.graphic').__timeline` in devtools. |
| `kjeldsen.frontend/shared/graphics.ts` | Reads the properties off a media item, builds the file URL. Shared because the server-side listing loader needs it too; `app/utils/graphics.ts` re-exports it. |
| `code/graphics/GeneratedGraphicsFileController.cs` + `kjeldsen.frontend/server/api/media/svg/[key].get.ts`, `.../card/[key].get.ts` | The drawing as a file, `/api/media/svg/<key>.svg?v=<updateDate>`, and as a social card for `og:image`, `/api/media/card/<key>.jpg?v=<updateDate>`. The CMS serves them at `/media/svg/<key>.svg` and `/media/card/<key>.jpg`; the frontend proxies them on its own origin, where Front Door caches `/api/media/*`, so the revision in the query is what makes a regenerated drawing a new URL. |

## Where a graphic can go

- **Image block** in the grid (`ImageBlock.vue` hands over to `GeneratedGraphic.vue`).
- **SEO list image** on posts (the *Image or Graphic Picker* is on the SEO composition now): it
  becomes the post's hero backdrop, drawn full-bleed under the same veil and fade as a photo and
  playing once on load; the listing card's picture, playing when the card is hovered (or once in
  view on a device without hover); and the `og:image`, as the JPEG card above.
- **Home page background** (the unfiltered Media Picker already allowed it).

## The contract with the model

The system prompt in the generator is the specification. The parts that matter for the frontend:

- One `<svg>` with a `viewBox` for the requested aspect ratio and **no width/height**, so CSS sizes
  it. Presentation attributes only: no `<style>`, `<script>`, `<image>`, `<foreignObject>`.
- Every id is prefixed with `g` + the first six hex digits of the media key, because several of
  these can share a page and GSAP selects by id.
- The script is the **body** of `(svg, gsap) => timeline`. It must return a *paused*
  `gsap.timeline()` whose opening state is set by the timeline itself (`from`/`fromTo`/`set`),
  because the host calls `.restart()` on hover. It may only select inside `svg`; no plugins.

- An element the script animates carries **no `transform` attribute** in the markup; static
  positioning goes on an inner wrapper group. GSAP's `x`/`y` replace the attribute rather than add
  to it, and Opus's first hands drawing lost its heart to the top-left corner exactly that way.
- With a reference photo the drawing is a rendition *of the photo*: its sampled palette including
  the background (drawn as a full-bleed rect), its composition, light and mood. Site accents are
  for sparkles only. Without a photo the model is free, on the dark palette.
- The reply opens with a `===NOTES===` block (palette as hex, composition in a sentence), kept in
  *Status* so an editor can see what the model thought it was doing.

Sonnet 5.5 managed the first piece (118 s, 15k output tokens, most of them thinking) but
coloured it for the dark site rather than the photo. Opus 5.5 is the profile now
(`GeneratedGraphics.ProfileAlias` = `opus-5-5`, created as a copy of the Sonnet profile with the
model id swapped): 80-100 s and 8-10k output tokens a piece, and it matches a photo's palette
closely once told to. Profiles live in `umbracoAIProfile`; the management API for them answered
400 to the API user, so the row was inserted by SQL.

## Things to know

- **The save waits for the model.** A minute or two for an animated piece. The backoffice sits on
  the save button meanwhile. Fine for one editor; a background job with a second save would be the
  fix if it ever is not.
- **One at a time.** The saving notification runs inside the media tree's write lock, so a second
  media save - any media, by anyone - waits on the first drawing and fails after about twenty
  seconds with `DistributedWriteLockTimeoutException`. Three items created in parallel: one drew,
  two failed with that in *Status* and were regenerated one after the other. Same fix as above.
- **Ids are prefixed per item** with a hash of the media key, not its first digits: keys minted
  in a batch can share those, and two graphics with the same gradient ids on one page draw with
  each other's colours.
- **Front Door's origin timeout is 240 s** (the maximum; was the default 60 s until 2026-10-02).
  A save in the backoffice holds the request while the model draws, and at 60 s Front Door
  answered 504 while the origin finished anyway, so every generated save looked like a failure.
  The Pulumi profile carries the same value.
- **The Anthropic key only decrypts on the server that saved it.** After the connection was
  re-saved from production, the local backend got `invalid x-api-key` from Anthropic for the
  same row - Umbraco.AI protects connection secrets with the server's data-protection keys.
  Generate through production's Management API in that case (the API user is in the shared
  database and the generator code is deployed), rather than re-saving the key locally, which
  would break production the same way.
  **Since 2026-10-03 a local run can draw too**: `code/ai/DevelopmentAiKeyProtector.cs`
  decorates Umbraco.AI's field protector in Development and substitutes the key from user
  secrets (`dotnet user-secrets set "Umbraco:AI:DevelopmentApiKey" "<key>"`) whenever a stored
  secret does not decrypt on this machine. Saving a connection locally is still a bad idea.
- **Batch generation from a script**: one item at a time, and read the result off the saved
  item rather than the HTTP status - through Front Door the request can come back before the
  save does. `kjeldsen.experiment` keeps the script used for *Headless - Not Hovedløst*.
- **The script runs on the page.** That is the point of GSAP over CSS, and the editor who saved
  the item chose it. The generator strips the ways SVG itself can carry script; the timeline code
  is given only the `<svg>` element and `gsap`. Anyone who can save media can run JavaScript on
  the site - the same trust the rich text editor already extends.
- **Replay** is `mouseenter` and `pointerdown`. Under `prefers-reduced-motion` nothing plays by
  itself; a tap still does, because then the reader asked.
- **Block preview** shows the still. The backoffice injects the preview fragment as HTML, so the
  timeline never runs there.
- **Cost.** About $0.25 a drawing at Sonnet prices. The fingerprint stops a save that changed
  nothing in the brief from paying again; hand edits to the SVG survive until the brief changes.
- **A hand edit reaches a page's blocks only after that page is republished.** Saving the media
  item updates pickers resolved per request (the SEO list image, so the hero) at once, but a
  graphic inside a grid block stays as it was in the page's cached block value until the page is
  published again. Fixing the key in *Securing and Expanding the Delivery Api* (2026-10-03: the
  model drew the key's "reflection" as a mirror image floating 160 units below it, turning the
  other way; it became a blurred cast shadow offset like the lock plate's, rotating about the
  offset pivot) needed a republish of the post. `kjeldsen.experiment/visio/key-shadow.mjs` is
  the edit, as a pattern for the next one.
- **The social card is rasterised on request** by Svg.Skia (SkiaSharp) in the CMS: 1200x630,
  cropped to fill like the hero backdrop, so a 3:1 drawing loses about a third of its width, and
  JPEG at quality 85 (30-50 KB; the same cards as PNG were 90-240 KB, the gradients compress
  badly). Nothing is stored; Front Door keeps the result under the revisioned URL. Skia's Linux
  binary comes from `SkiaSharp.NativeAssets.Linux.NoDependencies`, pinned to the SkiaSharp
  version Svg.Skia resolves. No fonts are loaded, so `<text>` in a drawing would not appear on
  the card; the drawings so far have none.
- **Reference photos** come through `MediaFileManager.FileSystem`, so blob storage in every
  environment. Anthropic takes up to 5 MB / 8000 px; the originals are bigger, hence the resize.
