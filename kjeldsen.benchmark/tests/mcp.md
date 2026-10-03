# Test: MCP

Schema and content are built through the Umbraco MCP server. This is the main test.

Setup: `npm run setup -- mcp` (the default after every reset), then `npm run up`.

## Prompt 1 (Umbraco running)

```text
verify you are connected to the Umbraco.Bench project's Umbraco MCP server
```

Then `npm run down`.

## Prompt 2 (Umbraco stopped)

```text
Adhering to AGENTS.md and UMBRACO-RULES.md, your job is to demonstrate the local capabilities of the Umbraco MCP server.

Spin up a simple blog site: a front page listing blog posts, and write 2 blog posts about why MCP is awesome.

Take care to build everything with blocks and the block grid. Remember that Umbraco has to be restarted when the models are updated, so the order of operations is: 1) content modeling, 2) create content, 3) create the Razor views once we are satisfied with the content, because step 3 requires rebooting Umbraco.

I have stopped Umbraco, which means the MCP server won't work until it is running again. Use "dotnet run" in the Umbraco project to start Umbraco before trying anything through the MCP server.

Always use the MCP server to create content. Do not write any migration plans as part of this test.

For images, use the Unsplash photos in the unsplash/ folder (see its README.md) and import them into the media library. Don't download other images.

Use the time while Umbraco is starting to plan the content modeling. You have ~30 seconds.

Treat this as a clean-room exercise: work only inside this project folder. Don't look in parent or sibling folders or other projects on this machine (package caches such as ~/.nuget are fine), and don't read or write any memory.

Work autonomously; I won't be answering questions during this task. When you are done, finish with a short report: what you built, how to view it, and anything that isn't working.
```
