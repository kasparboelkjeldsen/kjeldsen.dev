# Test: Migrations

The same blog, but schema and content are built in C# with migration plans that run when Umbraco boots. The project has no MCP server for this test.

Setup: `npm run setup -- migrations` (removes `.mcp.json`), then `npm run up` so the first-boot install happens outside the timing, then `npm run down`. There is no prompt 1.

## Prompt 2 (Umbraco stopped)

```text
Adhering to AGENTS.md and UMBRACO-RULES.md, your job is to demonstrate building an Umbraco site in code with migration plans.

Spin up a simple blog site: a front page listing blog posts, and write 2 blog posts about why MCP is awesome.

Take care to build everything with blocks and the block grid. Create the content model and the content with migration plans: append new steps to ProjectMigrationPlan in Migrations/ and never edit the shipped steps. Do not use the backoffice, the Management API, uSync files or direct database access to create schema or content. Everything must come from migrations that would recreate the site on a fresh database.

ModelsBuilder only generates models once the migrations have run, so the order of operations is: 1) write the migrations for the content model and the content, 2) build and run Umbraco so they execute, 3) stop Umbraco, then create the Razor views once the models exist, build and restart.

Umbraco is currently stopped. Use "dotnet run" in the Umbraco project to start it.

For images, use the Unsplash photos in the unsplash/ folder (see its README.md): the migration reads them from disk and imports them into the media library. Don't download other images.

Plan the content modeling before you start writing code.

Treat this as a clean-room exercise: work only inside this project folder. Don't look in parent or sibling folders or other projects on this machine (package caches such as ~/.nuget are fine), and don't read or write any memory.

Work autonomously; I won't be answering questions during this task. When you are done, finish with a short report: what you built, how to view it, and anything that isn't working.
```
