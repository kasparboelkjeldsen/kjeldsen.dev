# Running the backend locally

There are two local database modes. Neither touches the Azure SQL database — that connection string
is only pulled from Key Vault when `Azure:UseKeyVaultDatabase` is true, which it is not in
`appsettings.Development.json`. Media, delivery keys, licences and App Insights still come from
Key Vault and Azure Blob in both modes.

```bash
# SQLite - fast, disposable, no dependencies
dotnet run --project kjeldsen.backend

# LocalDB - real SQL Server, full Engage
dotnet run --project kjeldsen.backend --launch-profile SqlServer
```

## Which one to use

**SQLite** for CMS work: upgrades, content modelling, anything where you want a database you can
delete and rebuild in a minute. Engage installs and its schema is created, but
`Engage:Settings:Enabled` is off — see [engage-on-sqlite.md](engage-on-sqlite.md) for why.

**LocalDB** when you need Engage for real: analytics, personalization, A/B testing, star-generation
reporting, columnstore indexes. This is the closest local mirror of production.

## LocalDB setup

The `SqlServer` profile expects a database called `kjeldsendev` on `(localdb)\MSSQLLocalDB`. LocalDB
ships with Visual Studio and the SQL Server client tooling, so it is usually already present and
needs **no administrator rights** — which makes it the practical way to test Engage on a machine
where installing SQL Server proper is not allowed.

```bash
sqllocaldb start MSSQLLocalDB
sqlcmd -S "(localdb)\MSSQLLocalDB" -E -C -Q "IF DB_ID('kjeldsendev') IS NULL CREATE DATABASE kjeldsendev;"
```

The connection string uses Integrated Security, so no credential appears in the repository.

The profile only overrides what differs from the SQLite setup — connection string, provider, Engage
back in the main database, Engage enabled, columnstore left intact. Environment variables win over
`appsettings.Development.json`, so there is no duplicated configuration.

> Keep the profile name free of spaces and brackets. A profile called `Umbraco.Web.UI (SQL Server)`
> silently fails to match on some shells, and the app then falls back to the default profile — that
> is, to SQLite — while looking like it started correctly.

### Columnstore on LocalDB

LocalDB is SQL Server Express, and Express has supported columnstore indexes since 2016 SP1. Engage's
five non-clustered columnstore indexes create fine there.

`SERVERPROPERTY('IsColumnstoreIndexSupported')` nonetheless returns **NULL** on this instance. The
`EngageExtensions:NoColumnStore` probe treats anything other than `1` as unsupported, so left to
itself it would strip indexes from a server that supports them. The profile sets `NoColumnStore` to
false to prevent that.

## First boot

Both modes install unattended and then seed themselves from the committed uSync export, so a blank
database becomes a working site without touching the installer.

- Admin credentials come from **user secrets** (`Umbraco:CMS:Unattended:UnattendedUser*`). They are
  deliberately not in `appsettings.Development.json`, because this repository is public.
- uSync imports on first boot only (`ImportOnFirstBoot`), so later boots keep whatever you changed
  locally. `ExportOnSave` is off locally so an upgrade cannot silently rewrite the committed export.
- Expect around a dozen uSync import errors on a blank database. They are not database-related: some
  document types carry `Segment` property variations that only settle after a second pass, and one
  serializer needs `UmbracoHelper`, which is unavailable during startup import. Re-running the import
  from the backoffice clears them.

> After a failed or partial uSync import, ModelsBuilder regenerates `umbraco/models` to match
> whatever actually imported — including *deleting* model files for document types that failed.
> Check `git status` before committing.

## Resetting

```bash
# SQLite: delete the database files and boot again
rm kjeldsen.backend/umbraco/Data/*.sqlite.db*

# LocalDB
sqlcmd -S "(localdb)\MSSQLLocalDB" -E -C -Q "DROP DATABASE kjeldsendev;"
```

Also clear `umbraco/Data/TEMP` when switching modes — it caches NuCache and Examine indexes from the
previous database and will otherwise be read as if it still applied.

## Backoffice assets after an upgrade

Umbraco and Engage ship their backoffice as ES modules under `/App_Plugins`, served from the package
with cache headers and loaded by URL. After a major upgrade the browser will happily keep serving the
*previous* version's modules on the same origin, which shows up as extensions failing to register —
missing exports, sections that never appear — while the server is serving entirely correct files.

Clear site data for `localhost:44375` before concluding anything is broken. Verifying with
`fetch(url, {cache: 'reload'})` tells you what the server actually sent, as opposed to what the
module loader used.
