# Notes for agents working on kjeldsen.dev

A headless Umbraco 18 backend (`kjeldsen.backend/`), a Nuxt 4 frontend (`kjeldsen.frontend/`) and
Pulumi infrastructure (`kjeldsen.infra/`). The repository is public: never commit a secret.
Local runs share the production database (see `knowledge/local-development.md`).

The `knowledge/` folder holds the notes that are not obvious from the code; its README is the
index. Read the note for the area before changing it.

## Writing content through the API or the Umbraco MCP

Pages are block grids. The blocks that take structured data:

| Block | Alias | What goes in | Format |
|---|---|---|---|
| Table Block | `tableBlock` | `table`: JSON describing columns, rows, footer, note and an optional mobile variant; `caption` | [knowledge/table-block.md](knowledge/table-block.md) |
| Data Visio Block | `dataVisioBlock` | `dataset`: JSON; `prompt`: what the chart should say; `chartType`; `model` (Sonnet or Opus). The chart is written by the model on save. | [knowledge/data-visio.md](knowledge/data-visio.md) |
| Code Block | `codeBlock` | `code`: a fenced block, the language on the fence | - |
| Image Block | `imageBlock` | `image`: a photo or a Generated Graphics media item | [knowledge/generated-graphics.md](knowledge/generated-graphics.md) |

Text fields across the site accept `**bold**` and `--italic--` as emphasis markers; nothing else
in a text field becomes markup.

A page created through the API from a local run needs a re-save and publish before production
routes it (`knowledge/local-development.md`). Saves that trigger generation (graphics, charts)
wait for the model; do one at a time.
