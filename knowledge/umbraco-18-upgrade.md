# Umbraco 17 → 18 upgrade

Done on the `v18` branch, rehearsed first on a throwaway project (bare Umbraco + Engage, blank
database) before touching this one. That rehearsal was worth it — the failures that mattered showed
up there first, where a boot takes seconds instead of minutes.

## Package matrix

| Package | From | To |
|---|---|---|
| Umbraco.Cms | 17.3.1 | 18.1.1 |
| Umbraco.Engage, Umbraco.Engage.Headless | 17.1.1 | 18.1.0 |
| uSync | 17.0.4 | 18.1.2 |
| Umbraco.StorageProviders.AzureBlob (+ ImageSharp) | 17.0.0 | 18.0.0 |
| kraftvaerk.umbraco.blockfilter | 1.2.8 | 1.4.1 |
| Kraftvaerk.Umbraco.Headless.BlockPreview | 1.3.1 | 1.4.3 |
| Kraftvaerk.Umbraco.Headless.CacheKeys | 1.1.2 | 1.2.0 |
| Kraftvaerk.Umbraco.Headless.Preview | 1.1.2 | 1.2.0 |
| Azure.Storage.Blobs | 12.27.0 | 12.29.2 |
| Azure.Identity | 1.20.0 | 1.21.0 |

The two Azure bumps are forced, not optional. StorageProviders 18 requires Azure.Storage.Blobs
≥ 12.29.1, and the older direct reference turns that into an `NU1605` downgrade *error*.

### Outstanding package issues

**`Umbraco.Community.DeliveryApiExtensions` was removed.** There is no v18 release, not even a
prerelease. Nothing in the codebase referenced it — it is configuration-only, providing typed Swagger
and Delivery API preview tooling — so removing it broke nothing. The `DeliveryApiExtensions` section
is still in `appsettings.json`, ready for the package to return. Re-add it when v18 ships.

**`Kraftvaerk.Umbraco.Headless.CacheKeys` warns (`NU1608`).** It declares
`Umbraco.Cms (>= 17.0.0 && <= 18.0.0)` and we resolve 18.1.1. It builds and runs; the fix is to widen
the range in that package, which we own.

## Code changes v18 required

Four, all small:

- `MarketingApiControllerBase` → `EngageApiControllerBase`. Engage finally dropped the legacy
  uMarketingSuite naming. Same namespace.
- `IAnalyticsClientSideDataProcessor.Process()` → `ProcessAsync(CancellationToken)`.
- `BlockListItem.ContentUdi` → `.Content`. Umbraco 18 retired UDIs on block items, so the null guard
  in `Views/Partials/blocklist/default.cshtml` had to change.
- `DefaultAzureCredential` became ambiguous between `Azure.Core` 1.55 and `Azure.Identity` 1.20.
  Resolved by the Azure.Identity bump rather than by fully qualifying it.

## Traps

**uSync's folder follows the Umbraco major version.** It is built at runtime as
`uSync/v{major}`, so on 18 it reads `uSync/v18`. The v17 export was copied across; without that,
first-boot import finds nothing and you get an empty site that looks like a broken import. Delete
`uSync/v17` once v18 is settled.

**The columnstore Harmony patch corrupted Engage 18's schema script.** This one would have reached
production. The patch strips Engage's columnstore indexes because our Azure SQL tier does not support
them, and it found the end of each block by scanning for a `)WITH` line. Engage 17 wrote them that
way; Engage 18 ends them with `);` instead, so the forward scan ran off the end and the backward scan
for a comment header crossed into the *previous* table. Simulated against the real 18 script it would
have deleted **five entire `CREATE TABLE` definitions** — including `umbracoEngageAnalyticsPageview`,
`AnalyticsSession` and `AnalyticsVisitor` — leaving the index bodies dangling.

It now finds the end by tracking parentheses forward from the `CREATE`, which is shape-independent.
Verified against both script generations: 79 tables in and 79 out on 17, 81 in and 81 out on 18, with
all columnstore indexes removed in both.

**Clean `obj/` and `bin/` after the package bump.** Umbraco and Engage ship backoffice assets as
static web assets, and a stale manifest serves a mix of old and new files.

**Clear the browser cache before judging the result.** See the note at the end of
[local-development.md](local-development.md); this cost more time than any actual bug.

## Verified end state

Builds clean. Boots on both SQLite and LocalDB with zero errors. The Engage migration plan completes.
uSync imports 221 changes and 21 document URLs. On LocalDB: 209 tables, 127 Engage tables, 43
reporting tables, 5 columnstore indexes, and star generation runs and completes without failure.
