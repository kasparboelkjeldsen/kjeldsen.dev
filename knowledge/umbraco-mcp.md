# Umbraco MCP, locally

`@umbraco-cms/mcp-dev` wraps the Umbraco Management API as MCP tools, so an assistant can read and
edit document types, data types, content and media directly. Configured in `.mcp.json` at the repo
root; **local development only** — the API user behind it is deliberately not created in production.

## Where the secret lives

`.mcp.json` is committed and contains **no credentials**. It references
`${UMBRACO_MCP_CLIENT_SECRET}`, which Claude Code expands from the environment. The actual value is
in `.claude/settings.local.json`, which is gitignored:

```jsonc
{ "env": { "UMBRACO_MCP_CLIENT_SECRET": "…" } }
```

This repository is public, so nothing else is acceptable — even for a credential that only works
against localhost. A secret committed to a public repo gets scraped and flagged regardless of what
it can reach.

The matching API user (client id `umbraco-back-office-mcp`) is created in the backoffice under
*Users → API Users*.

## Four things that will bite

**It must be HTTPS.** OpenIddict rejects the token request over plain HTTP outright:

```
"error_description": "This server only accepts HTTPS requests."
```

so `UMBRACO_BASE_URL` is `https://localhost:44375`, not the `:36323` HTTP binding.

**Which forces `NODE_TLS_REJECT_UNAUTHORIZED=0`.** The ASP.NET dev certificate is a *self-signed
leaf*, not a locally-issued chain, so Node fails with `DEPTH_ZERO_SELF_SIGNED_CERT`. Node 22+'s
`--use-system-ca` does **not** fix this — tested, same error — because there is no root CA to find.
Disabling verification is scoped to this one server in `.mcp.json` and never leaves localhost.

**The API user lives in the database.** uSync does not export users or API users, so the credential
exists only in whichever local database it was created in. Create it on SQLite and it will not
exist under the `SqlServer` (LocalDB) profile, or vice versa.

**The server connects once, at session start.** If the site is not already running when the session
begins, the tools never register and do not retry — start Umbraco first. If it happens anyway,
don't block on it: the MCP is a thin wrapper over the Management API and the same credentials work
directly.

```
POST /umbraco/management/api/v1/security/back-office/token
grant_type=client_credentials&client_id=umbraco-back-office-mcp&client_secret=…
```

then `Bearer` against `/umbraco/management/api/v1/…`. That also sidesteps the MCP's content
sanitizer, which rejects `../`, `?` and `&` in Razor.

## Tool count is a real cost

`UMBRACO_INCLUDE_TOOL_COLLECTIONS` decides how many tools load, and it matters — every tool's
schema is context:

| Collections | Tools |
|---|---|
| everything we first tried (11 collections) | 244 |
| `document,document-type,data-type,media,media-type,template` | 186 |
| `document,document-type,data-type` | 106 |

Currently on the middle set. Widen it deliberately for a specific task rather than leaving
everything on — available collections include `partial-view`, `stylesheet`, `script`, `dictionary`,
`language`, `member`, `member-type`, `user`, `user-group`, `webhook`, `redirect`, `relation-type`,
`log-viewer`, `document-blueprint`, `document-version`, `property-type`, `server`.

## Version

Pinned to `@umbraco-cms/mcp-dev@18` so npx tracks 18.x against our Umbraco 18.1.1. The package uses
dist-tags per major (`lts-17` is 17.6.5); `latest` is currently 18.1.4.

## Not the same thing as the backend's own MCP server

`kjeldsen.backend` also hosts an MCP server of its own at `/mcp`
(`ModelContextProtocol.AspNetCore`, `code/mcp/NoteTools.cs`, behind the `McpAccess` policy). That is
unrelated to this — it exposes our own tools, not Umbraco's Management API.
