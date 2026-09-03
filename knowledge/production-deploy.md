# Production deploy, 2026-09-03: fresh database, Umbraco 18, V2 frontend

What it took to put the Umbraco 18 backend and the V2 frontend on the existing Azure resources
with an empty database, and what to know before the next deploy. Everything stayed on the tiers
that were already there: B1 for both App Service plans, Standard S0 for SQL, Standard Front Door.

## What was done, in order

1. **Backup.** A bacpac of the Umbraco 16 database was exported with `az sql db export` to the
   storage account's `backups` container (`kjdevsqldbumbraco-20260903T154430Z.bacpac`, 31 MB). The
   old content is also preserved in git history; the newer site has all the prose.
2. **Content export.** The local site's content, media and settings were exported through uSync's
   management API (`POST /umbraco/usync/api/v1/Perform`, action `Export`, group `All`, incrementing
   `stepNumber` until `complete`, with a bearer token from an API user) and committed to
   `kjeldsen.backend/uSync/v18`. Media files were already in the production blob container, since
   local development uses the same storage account.
3. **App settings.** Backend: `Umbraco__CMS__Unattended__InstallUnattended=true`, the unattended
   user name/email/password, `uSync__Settings__ImportOnFirstBoot=true`. Frontend: a system-assigned
   identity with get/list on Key Vault, then `NUXT_PUBLIC_CMS_HOST`, `NUXT_PUBLIC_SITE_URL`,
   `NUXT_DELIVERY_KEY` (Key Vault reference) and `NUXT_IMAGE_KEY`, plus the startup command
   `node server/index.mjs`. V2 reads its configuration at runtime; V1 baked it in at build time.
4. **Deploy.** `main` fast-forwarded to `v18` and pushed; the pipeline built and deployed both apps.
5. **Reset.** Backend stopped, database deleted and recreated empty with the same name, SKU,
   collation and backup redundancy, backend started. Umbraco installed unattended.
6. **Fix-ups**, below, then a uSync import via `uSync__Settings__ImportAtStartup=All` for one boot.

## Traps, and the fixes now in place

- **Zip deploy leaves old assemblies behind.** `UmbracoDeliveryApiExtensions.dll` from the V1 era
  was still in wwwroot after the pipeline's deploy, and Umbraco's type scanner crashed the process
  loading it. The pipeline now deploys the backend with `az webapp deploy --clean true`, which
  removes anything not in the package. A one-off clean deploy of the same artifact fixed it live.
- **uSync's first-boot import is one shot.** It runs once, records that it ran, and if it fails
  halfway there is no second chance from that setting. It failed here on a duplicate media key:
  an older `engage.config` alongside the newly exported `engage-1.config`, both for the same
  folder. uSync's export does not delete stale files, so check for duplicate keys after exporting.
  The recovery was `uSync__Settings__ImportAtStartup=All` for a single restart, then removing it.
- **Startup can exceed App Service's 230-second probe.** With Engage's migrations and a full uSync
  import, the first boot took over three minutes and one attempt was killed. Set
  `WEBSITES_CONTAINER_START_TIME_LIMIT=900` on the backend; it is harmless on ordinary boots.
- **Front Door forwards the client address with a port.** Engage's headless request model rejects
  `ip:port`, and the backend rewrites Engage's stock track endpoint to the site's own
  `engageextensions/pageview/register`, which fails the same way. The frontend now reduces the
  forwarded address to a bare IP before sending it.
- **The pipeline trigger only watches `kjeldsen.backend/**` and `kjeldsen.frontend/**`.** A change
  to the pipeline itself or to `knowledge/` does not build; queue a run with
  `az pipelines run --branch main`. Manual runs build and deploy both apps. A push that touches
  either app *does* trigger a run within about half a minute (`individualCI`); queuing a manual
  run as well deploys everything twice. `az pipelines runs list` omits in-progress runs, so check
  the REST build list before queuing.
- **First requests for new image variants are slow.** A never-before-seen crop or format
  (`format=webp` was new on 2026-09-03) makes the CMS encode it, eight seconds for a 2400px hero on
  S0; ImageSharp's cache is in the `kjdevblob` container (`cache/`), so it is once per variant.
  The pipeline's warm-up stage crawls the pages and fetches their images after every frontend
  deploy so a visitor never pays it.
- **The backend still tries to purge V1's cache endpoint on publish** ("Nuxt cache invalidation
  failed: NotFound"). Harmless until the V2 cache exists; it will need pointing at the new route.

## Settings that can go, and when

- `uSync__Settings__ImportAtStartup` - remove after the import; it makes every restart slow.
- `Umbraco__CMS__Unattended__InstallUnattended` and `uSync__Settings__ImportOnFirstBoot` - inert
  on a populated database. Leave them, or remove them for tidiness.
- The `engagelicense`, delivery key and SQL secrets in Key Vault are unchanged.

## Where things are

| Thing | Where |
|---|---|
| Pipeline | Azure DevOps `kaspark88/kjeldsen.dev`, definition id 2, YAML in `kjeldsen.infra/pipelines/umbraco.yaml` |
| Backend logs | `az webapp log download -g kjdev-rg -n kjdev-app-backend`; the app's own log is `*_default_docker.log`, the platform's is `*_docker.log` |
| Kudu | `https://kjdev-app-backend-eqhhguczfrh6gndg.scm.westeurope-01.azurewebsites.net`, reachable with `az rest --resource https://management.azure.com/` |
| Backup | `backups/kjdevsqldbumbraco-20260903T154430Z.bacpac` in `kjdevstorage` |
| Backoffice admin | kaspark88@gmail.com; the password is outside the repository and should be changed on first login |
