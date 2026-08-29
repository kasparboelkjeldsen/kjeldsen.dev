# knowledge

Working notes for kjeldsen.dev — the things that are not obvious from the code, and the reasons
behind decisions that look strange without context.

| Note | What it covers |
|---|---|
| [local-development.md](local-development.md) | Running the backend locally: SQLite vs LocalDB, the two launch profiles, first-boot behaviour |
| [umbraco-18-upgrade.md](umbraco-18-upgrade.md) | The 17 → 18 upgrade: package matrix, code changes, and the traps that cost real time |
| [engage-on-sqlite.md](engage-on-sqlite.md) | Why Engage needs a translation layer to run on SQLite, what it does, and what still does not work |
| [upstream-findings.md](upstream-findings.md) | Portability and correctness findings worth reporting upstream |
| [frontend-v2.md](frontend-v2.md) | Rebuilding the frontend: where OpenAPI moved in 18, what to keep from V1, and what the personalization round trips cost |

## A note on sources

Everything here is derived from behaviour that is observable from the shipped NuGet packages —
error messages, embedded SQL resources, public types and their signatures. This repository is
public, so nothing here comes from any non-public source, and no credentials appear in these notes.
Local admin passwords live in .NET user secrets, never in the repository.
