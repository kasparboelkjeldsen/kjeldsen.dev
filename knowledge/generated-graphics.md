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
| `kjeldsen.frontend/app/components/blocks/GeneratedGraphic.vue` | Renders the SVG with `v-html` (server-side, so it is a still before any script) and builds the timeline after mount with `new Function('svg', 'gsap', script)`. `document.querySelector('.graphic').__timeline` in devtools. |
| `kjeldsen.frontend/app/utils/graphics.ts` | Reads the three properties off a media item; `ImageBlock.vue` branches on it. |

## The contract with the model

The system prompt in the generator is the specification. The parts that matter for the frontend:

- One `<svg>` with a `viewBox` for the requested aspect ratio and **no width/height**, so CSS sizes
  it. Presentation attributes only: no `<style>`, `<script>`, `<image>`, `<foreignObject>`.
- Every id is prefixed with `g` + the first six hex digits of the media key, because several of
  these can share a page and GSAP selects by id.
- The script is the **body** of `(svg, gsap) => timeline`. It must return a *paused*
  `gsap.timeline()` whose opening state is set by the timeline itself (`from`/`fromTo`/`set`),
  because the host calls `.restart()` on hover. It may only select inside `svg`; no plugins.

Sonnet 5.5 followed all of that on the first try: 118 s, 3k tokens in (the photo is most of
it) and 15k out for a 4 KB SVG and a 3 KB script. Most of the output tokens are the model
thinking, not the drawing. If the drawings get worse on harder briefs, change
`GeneratedGraphics.ProfileAlias` to an Opus profile.

## Things to know

- **The save waits for the model.** A minute or two for an animated piece. The backoffice sits on
  the save button meanwhile. Fine for one editor; a background job with a second save would be the
  fix if it ever is not.
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
- **Reference photos** come through `MediaFileManager.FileSystem`, so blob storage in every
  environment. Anthropic takes up to 5 MB / 8000 px; the originals are bigger, hence the resize.
