# Test: Playwright

The same blog, but schema and content are built by clicking through the Umbraco backoffice in a browser, with the Playwright MCP server (Edge, visible window). The Razor views are still written as code.

Setup: `npm run setup -- playwright`, which replaces `.mcp.json` with `@playwright/mcp` (pinned). Then `npm run up`. Approve the `playwright` MCP server when the session asks.

## Prompt 1 (Umbraco running)

```text
verify you can open the Umbraco backoffice at https://localhost:44317/umbraco in the Playwright browser and log in as admin@example.com with password 1234567890
```

Then `npm run down`.

## Prompt 2 (Umbraco stopped)

```text
Adhering to AGENTS.md and UMBRACO-RULES.md, your job is to demonstrate building an Umbraco site by driving the backoffice with Playwright.

Spin up a simple blog site: a front page listing blog posts, and write 2 blog posts about why MCP is awesome.

Take care to build everything with blocks and the block grid. Create the content model and the content through the Umbraco backoffice UI with the Playwright browser tools, the way an editor would (log in as admin@example.com with password 1234567890). Do not use the Management API, migration plans, uSync files or direct database access to create schema or content.

Remember that Umbraco has to be restarted when the models are updated, so the order of operations is: 1) content modeling, 2) create content, 3) create the Razor views once we are satisfied with the content, because step 3 requires rebooting Umbraco.

I have stopped Umbraco. Use "dotnet run" in the Umbraco project to start it before opening the backoffice.

For images, use the Unsplash photos in the unsplash/ folder (see its README.md) and upload them to the media library through the backoffice. Don't download other images.

Use the time while Umbraco is starting to plan the content modeling. You have ~30 seconds.

Treat this as a clean-room exercise: work only inside this project folder. Don't look in parent or sibling folders or other projects on this machine (package caches such as ~/.nuget are fine), and don't read or write any memory.

Work autonomously; I won't be answering questions during this task. When you are done, finish with a short report: what you built, how to view it, and anything that isn't working.
```
