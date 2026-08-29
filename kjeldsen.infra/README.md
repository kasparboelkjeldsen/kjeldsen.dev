# kjeldsen.dev infrastructure

Pulumi, in C#, against a **local file backend** — no Pulumi Cloud, no state stored in any service.

The stack was **adopted from infrastructure that already existed** using `pulumi import`, rather
than by recreating anything. Two things follow from that, and they shape the whole program:

- Every resource carries an explicit Azure name. Auto-naming is disabled in `Pulumi.yaml`, because
  a generated suffix would make Pulumi propose replacing a live resource.
- The target state is **`pulumi preview` reporting no changes**. That clean preview is the proof
  the code matches what is deployed, and it means `up` is a no-op rather than a gamble.

## Layout

| File | Contents |
|---|---|
| `Program.cs` | Entry point; calls each resource group |
| `Resources/Core.cs` | Resource group, Log Analytics, both Application Insights components |
| `Resources/Data.cs` | Storage account and container, SQL server and database, Key Vault |
| `Resources/Compute.cs` | App Service plans and the two web apps |
| `Resources/Dns.cs` | The `kjeldsen.dev` zone and all records |
| `Resources/FrontDoor.cs` | Front Door, in full |

## Front Door

Previously only the *profile* was code; everything below it was created by hand in the portal.
All of it is now managed: the endpoint, both origin groups, both origins, both routes, all three
custom domains, the `cacheRules` rule set with its `noContentCache` rule, the `BlockWeirdTraffic`
security policy and the `block` WAF policy.

## Running it

Requires the Pulumi CLI and an `az login` session. The CLI is installed per-user at
`%LOCALAPPDATA%\Pulumi` and is on the user PATH.

```powershell
$env:PULUMI_BACKEND_URL = "file://C:/Users/<you>/AppData/Local/pulumi-state/kjeldsen.dev"
$env:PULUMI_CONFIG_PASSPHRASE = "<passphrase>"

pulumi stack select dev
pulumi preview
```

**State lives outside this repository**, at `%LOCALAPPDATA%\pulumi-state\kjeldsen.dev`. That is
deliberate: this repo is public, and Pulumi state carries resource outputs including secrets. Back
that directory up — it is the only copy, which is the trade-off for not using a hosted backend.

Secrets in state are encrypted with a passphrase (`PULUMI_CONFIG_PASSPHRASE`). Lose it and the
encrypted values in state are unrecoverable. If you would rather not keep a passphrase around,
`pulumi stack change-secrets-provider azurekeyvault://kjdevkv.vault.azure.net/keys/<key>` moves
encryption to the existing Key Vault.

## Cross-references, and where they stop

Resources reference each other rather than repeating literals: `resourceGroup.Name`, the origins
take the web apps' `DefaultHostName`, the web apps take their plan's `Id`, and so on. That is the
point of using Pulumi over an ARM template - a real dependency graph.

Nine nested `ResourceReference` ids are the exception and stay as literals: route to origin group,
route to custom domain, route to rule set, and the security policy's domains and WAF policy. Azure
returns those nested ids with lowercased path segments (`origingroups`, `customdomains`) while a
resource's `.Id` output is canonical (`originGroups`, `customDomains`). ARM ids are case-insensitive
so the two are equivalent, but Pulumi string-diffs them, and writing the canonical form back would
produce a *perpetual* diff because Azure keeps returning its own casing. `DependsOn` carries the
dependency instead, so the graph is still correct.

The three `secrets/0--<guid>` ids on the custom domains and the `SQL_Default` maintenance
configuration are Azure-managed resources this stack does not create, so they stay literal too.

## Things deliberately not authored here

Two values are adopted rather than generated, because authoring them would damage production:

- **SQL admin password.** The previous TypeScript program created it with `RandomPassword`, so any
  run against fresh state would have rotated the live credential and broken the site.
- **`UmbracoPrimaryStorageKey`.** That program wrote the literal string
  `"<fetch manually if needed>"` into Key Vault, which would overwrite the real key.

Key Vault *secrets* are not managed by this stack at all for the same reason — the values in the
vault are live and several are consumed at boot by the backend.

## Known drift worth fixing

Two Front Door custom domains are not in a healthy validation state:

- `umbraco.kjeldsen.dev` — `TimedOut`
- `kjeldsen.dev` (apex) — `PendingRevalidation`

These are managed certificates and revalidate via the `_dnsauth` TXT records, which are in the zone
and now managed here. If revalidation lapses for good, TLS on those hostnames eventually breaks.
