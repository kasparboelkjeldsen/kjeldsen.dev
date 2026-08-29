# Engage on SQLite

Umbraco Engage is SQL Server-only by design. It refuses to start on SQLite, and even with that check
removed its schema and queries are T-SQL throughout. Running the CMS on SQLite locally therefore
needs a translation layer, which lives in `kjeldsen.backend/code/engage/Setup/Sqlite/`.

This is a local development aid. It is inert on SQL Server: every part of it is gated on the
configured provider being `Microsoft.Data.Sqlite`, so production is untouched.

## What the pieces do

**`EngageSqliteGuardComposer`** removes Engage's `StartupCheckerComponent`, which throws outright on
a SQLite connection string, and swaps in a SQLite `IDatabaseFactory`. Both only when on SQLite.

**`SqliteEngageDatabaseFactory`** hands Engage connections to its own SQLite file. It declares both
the one- and two-argument `CreateDatabase` overloads, because the interface changed shape between
Engage 17.1.1 and 18.1.0 and the same file has to satisfy either.

**`EngageSqliteAdo`** is the ADO layer: it translates every statement and narrows Int64 to Int32.
Translation happens *here*, at the command, rather than in NPoco's execution hook, because Engage's
`ExecuteWithTimeout` builds a command and calls `ExecuteNonQuery` on it directly — a hook at the
NPoco level silently misses every schema migration.

**`EngageSqlDialect`** is the translator itself.

## Three problems worth understanding

**Deadlock.** Engage holds a write transaction across a whole migration run while Umbraco needs its
own write to record plan state. SQL Server allows that; SQLite has one writer per file, so sharing a
file deadlocks the boot with no error at all — it simply stops. Engage therefore gets its own
database file via `Engage:Settings:DatabaseConnectionStringName`, which is Engage's own supported
seam, not a hack.

**Silent rollback.** Engage's `DatabaseContext` reference-counts `Complete()` calls and aborts the
shared transaction on dispose if any user failed to complete. One swallowed failure in one migration
therefore rolls back *all* of them — while the plan still logs "Done" and leaves an empty database.
This cost the most time to find, because every visible signal said success.

**Integer width.** SQLite returns every integer as Int64. Engage's migrations read untyped rows and
assign straight to `int?`, which throws. Narrowing to Int32 when the value fits is safe both ways,
since int widens to long implicitly but not the reverse.

## What the dialect rewrites

Schema scripts get the full treatment; ordinary runtime queries only get what they need.

- `IF OBJECT_ID(...) BEGIN ... END` → `CREATE TABLE IF NOT EXISTS`; all procedural `IF`/`BEGIN`/
  `END`/`ELSE` removed, since a bare `BEGIN` is read as *begin transaction*
- T-SQL types → SQLite affinities; `IDENTITY` + a separate primary key folded into
  `INTEGER PRIMARY KEY AUTOINCREMENT`
- `sp_rename` → `ALTER TABLE ... RENAME TO` / `RENAME COLUMN` (constraint and index renames dropped —
  SQLite cannot rename them and their names carry no meaning here)
- `sys.objects` / `sys.indexes` / `sys.columns` / `INFORMATION_SCHEMA` → derived tables over
  `sqlite_master` and `pragma_table_info`, exposing the same column names so predicates still work
- `OBJECT_ID` / `COL_LENGTH` → existence subqueries; `AT TIME ZONE` → `datetime(x,'utc')`;
  `TRY_CONVERT` → identity; `ISNULL` → `IFNULL`; `NEWID()` → a randomblob GUID expression
- `OFFSET ... FETCH` → `LIMIT/OFFSET`; `SELECT TOP n` → `LIMIT`; `WITH (NOLOCK)` dropped
- bitwise `^` → `(a | b) - (a & b)`; `DROP INDEX x ON t` → `DROP INDEX x`
- `DELETE alias FROM ... JOIN` → `WHERE EXISTS`, or `NOT EXISTS` when it is a `LEFT JOIN ... IS NULL`
  anti-join — getting that distinction wrong silently deletes nothing
- `DECLARE @v` / `SELECT @v = ...` inlined as scalar subqueries
- Statement terminators inserted where Engage separates statements by blank lines instead of `;`

Because SQLite has no procedural `IF`, guards cannot be evaluated in SQL — so they are stripped and
then re-applied in C# against the live catalog (`ApplySchemaGuards`). A rename whose source table is
missing, or an `ADD COLUMN` for a column that already exists, is dropped rather than executed. This
matters: Engage 18 creates `umbracoEngageSettingsGoal` directly, so the migration that renames the
old table has nothing to rename.

## What works, and what does not

**Works.** Engage installs completely — the full migration plan runs and commits, 87 tables and 76
indexes on Engage 18. The backoffice section loads and navigates. Licence validation succeeds.

**Unproven.** No data has ever flowed through it locally. Collection needs the frontend, so the
collect → process → analytics path is untested rather than known-good.

**Does not work: star-generation reporting.** Its two scripts contain no statement terminators at all
and lean hard on T-SQL; they are not translatable. Engage's own scheduler runs star generation
whenever Engage is enabled, so on SQLite it fails every run and logs roughly thirty failed statements
into `umbraco/Logs/engage-sql-failures.log`, while also starving the analytics processor of the
single write lock.

Hence the measured trade-off in `appsettings.Development.json`:

| `Engage:Settings:Enabled` | Result |
|---|---|
| `false` | Zero errors. Engage still installs. From Engage 18 this also hides the backoffice section. |
| `true` | Engage tab available, ~30 failed statements per generation run. Harmless to the CMS. |

It is left off. **If you want working Engage, use the LocalDB profile** — see
[local-development.md](local-development.md).

## Diagnostics

Failing statements are written to `umbraco/Logs/engage-sql-failures.log` with the original and the
translated SQL side by side. Nearly every gap above was found that way; guessing from the exception
alone is not viable, because much of Engage's SQL is assembled in C# and never appears in a file.
