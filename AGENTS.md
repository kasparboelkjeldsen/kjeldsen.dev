# Notes for agents working on kjeldsen.dev

A headless Umbraco 18 backend (`kjeldsen.backend/`), a Nuxt 4 frontend (`kjeldsen.frontend/`) and
Pulumi infrastructure (`kjeldsen.infra/`). The repository is public: never commit a secret.
Local runs share the production database (see `knowledge/local-development.md`).

The `knowledge/` folder holds the notes that are not obvious from the code; its README is the
index. Read the note for the area before changing it.

## Writing content through the API or the Umbraco MCP

Pages are block grids. [knowledge/blocks.md](knowledge/blocks.md) is the catalogue: every
block's alias, key, column spans and properties, the grid JSON a page is written as, the Table
block's JSON format and the Data Visio block's brief. Read it before writing content.

To draft a post from notes and data, use [knowledge/blog-guide.md](knowledge/blog-guide.md): it
defines the `[HEADER]` / `[RTE]` / `[TABLE]` / `[CHART]` draft notation that the placer then maps
onto the blocks above.

Text fields across the site accept `**bold**` and `--italic--` as emphasis markers; nothing else
in a text field becomes markup.

A page created through the API from a local run needs a re-save and publish before production
routes it (`knowledge/local-development.md`). Saves that trigger generation (graphics, charts)
wait for the model; do one at a time.
