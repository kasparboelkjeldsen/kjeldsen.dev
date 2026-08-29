# Upstream findings

Collected while getting Umbraco 18 and Engage 18 running on SQLite. All of it is observable from the
shipped packages. Two of these are bugs that bite on SQL Server too, independently of any of the
portability work.

## Correctness, not portability

**A failed migration step silently rolls back the ones before it, while still reporting success.**
`DatabaseContext` reference-counts `Complete()` calls and calls `AbortTransaction()` on dispose if
any user did not complete. So a single swallowed failure in one migration discards every migration
that ran before it in the same context — and the plan still logs "Done", leaving an empty database
that claims to be migrated. Every visible signal says success.

**Not all database access goes through `IDatabaseFactory`.** Most does, which makes the factory a
good seam. But `ExecuteWithTimeout` builds a command and calls `ExecuteNonQuery` directly, bypassing
NPoco's pipeline, and the data-generation status check constructs a `SqlConnection` of its own. Any
consumer swapping the factory will find those two paths still hard-wired.

## Failing hard where degrading would do

**`StartupCheckerComponent` throws from inside the component initialisation chain**, which takes
unrelated components down with it — in our case uSync's first-boot import, so the site booted with no
content and nothing pointing at Engage as the cause. Engage 18 improved this a great deal: it now
disables its own features and lets the site continue. The same treatment for other startup failures
would be welcome.

**`Settings.Enabled` gates too much at once.** From Engage 18 it controls both the analytics
subsystems *and* the backoffice section. On a database where star-generation reporting cannot run,
there is no way to keep the UI without also starting the thing that fails. Separate switches — or a
reporting subsystem that degrades rather than retries — would resolve this.

**The SQLite check is a substring match.** It looks for `Data Source=` together with `.db`,
`.sqlite` or `:memory:` in the connection string, rather than inspecting the configured provider. It
both misses cases and can be defeated by renaming a file.

## Environment probing

**`SERVERPROPERTY('IsColumnstoreIndexSupported')` returns NULL on SQL Server 2025 Express /
LocalDB**, on an instance where creating a non-clustered columnstore index in fact succeeds. Any
capability probe treating "not 1" as "unsupported" will wrongly disable columnstore there. Worth
noting because LocalDB is the only practical way to test Engage on machines where installing SQL
Server is not permitted.

## Portability inventory

If Engage is ever to run on anything other than SQL Server, this is the concrete list rather than a
general "it uses raw SQL". Each item is individually fixable:

`sp_rename` · `sys.objects` / `sys.indexes` / `sys.columns` / `sys.default_constraints` ·
`INFORMATION_SCHEMA` · `OBJECT_ID` · `COL_LENGTH` · `AT TIME ZONE` · `TRY_CONVERT` · bitwise `^` ·
`OFFSET ... FETCH` · `SELECT TOP` · `WITH (NOLOCK)` · `DELETE alias FROM ... JOIN` ·
`UPDATE alias ... FROM` · `#temp` tables · `IDENTITY` · `IF` / `BEGIN` / `END` procedural guards ·
`DROP INDEX x ON t` · `_:` GOTO labels as no-op placeholders

Two shipped scripts also contain **no statement terminators at all**, separating statements by blank
lines. That parses on SQL Server and nowhere else, and it is the single reason star-generation
reporting could not be translated.

## Star generation

Worth saying separately, because the design is sound and the delivery is what hurts. It is a
conventional star schema — 16 dimension and 22 fact tables, dropped and rebuilt each run — expressed
as one 1704-line script of set-based ETL: 72 inserts, 55 group-bys, 151 joins, ten CTEs, nine window
functions, around ten temp tables. There is already a crude templating layer substituting timing
instrumentation into the SQL.

A code-first rewrite would help, but the split matters. The **schema** (drop and create, ~680 lines)
maps cleanly onto migrations or an EF model and would gain provider portability for free. The
**populate** step is the wrong shape for EF Core, which has no `INSERT INTO ... SELECT`; expressing
it through an ORM would either fail to translate the window functions or pull millions of analytics
rows into memory. Composing it from typed query fragments that can emit per-dialect SQL keeps it
set-based while making it portable — and would give per-step timing for free, which the templating
currently fakes.

The encouraging part is that `IStarGenerationQueryProvider` already exists as a DI-registered seam
returning the three scripts, so this can be done incrementally rather than as one big rewrite.

The real cost of such a rewrite is not the SQL. It is proving the numbers still match — golden-dataset
regression tests across timezone boundaries, segment attribution and A/B assignment. Without those
you ship silently wrong analytics, which is worse than none.

## Smaller things

- Star generation runs once daily at `Engage:Reporting:DataGenerationTime` (default 04:00, evaluated
  in UTC) and cannot be retriggered the same day, which makes developing against it slow.
  `IStarGenerationScheduler.GenerateScheduled()` already exists as an on-demand hook; exposing it in
  the backoffice would remove the need for everyone to write their own trigger.
- uSync derives its folder from the Umbraco major version, so a major upgrade silently starts reading
  an empty directory unless the export is copied across.
