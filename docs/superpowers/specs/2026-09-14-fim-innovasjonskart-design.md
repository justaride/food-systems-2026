# FIM Innovation Map on the Platform — Design

**Date:** 2026-09-14

**Status:** Approved in chat (option 2: show everything; private data repo; v009 scope)

**Branch:** `claude/aktorer-plattform-integration-fd6a94`

## Goal

Show the Food Innovation Map Norway (FIM) candidate profiles — in full — inside the platform. The weekend research produced sealed local packages but nothing reached the database or UI. The owner has confirmed the platform pages sit behind Cloudflare Access and that all FIM content, including registry roles and ownership names, may be shown there.

## Evidence baseline

- Newest sealed package: `enrichment-v009` — 863 profiles (201 inherited, 662 from the fishery approval crosswalk), 8,770 findings, 3,789 numeric observations, 18 profile fields each.
- Pilot `food-innovation-pilot-v001` (sealed) holds automated reviews for 14 jobs (12 actor profiles, 2 exception jobs).
- All content is `status: candidate`, `human_verified: false`. The UI must say so; it must not present profiles as verified.
- Page routes on `food-systems.naturalstateproject.com` return 302 to Cloudflare Access (checked 2026-09-14). When this spec was written, `/api/*` bypassed Access and answered unauthenticated. Later on 2026-09-14 the bypass was narrowed to `/api/version`, `/api/data-status` and `/api/library-analysis/status`, and PR #413 added an in-app Access JWT check on every other API route.
- `justaride/food-systems-2026` is a public repository. A 2026-09-14 attempt to commit FIM was blocked for that reason.

## Hard boundaries

- **No FIM data in the public repo.** No profiles, findings, names, or org-number lists in code, fixtures, migrations, specs, or logs. Test fixtures are synthetic.
- **No FIM data through `/api/*`.** FIM is read only by server components. A test fails if any file under `src/app/api` references the FIM query module or Prisma models.
- No change to existing `Actor`, `Company`, CAR registry, readiness, or claim-lock state.
- The import never marks anything verified or promoted.

## Architecture

### Data transport

A new private repository `justaride/food-systems-private-data` holds the import inputs under `fim/enrichment-v009/` and `fim/pilot-v001/`. Only the files the importer reads are copied: `enriched-profiles.json`, `findings.json`, `numeric-observations.json`, `summary.json`, `SEALED.json`, and the pilot `derived/REVIEWED-CANDIDATES.json` and `SEALED.json`. The full working set stays archived on BigBrain.

`prod-data-import.yml` gets two targets, `fim-v009-dry` and `fim-v009`. Only these targets check out the private repo, using a read-only deploy key stored as the `PRIVATE_DATA_DEPLOY_KEY` secret. `fim-v009` passes the Estate backup gate like every other mutating target; `fim-v009-dry` is exempt.

### Data model

Two tables, names well under PostgreSQL's 63-character identifier limit:

- `FimRelease` — release id (`enrichment-v009`), seal and manifest hashes, profile/finding/observation counts, pilot seal hash, `importedAt`.
- `FimProfile` — one row per profile: `id` (actor_id), `releaseId`, `name`, `orgNumber?`, `entityKind`, `group` (`core` | `fishery`), `origin?`, `companyId?` (matched on `Company.orgNr`), `fields` (JSONB, the 18 fields as sealed), `findings` (JSONB array), `numericObservations` (JSONB array), `narrative?`, `openQuestions?`, `assessment?`, `pilotReview?` (JSONB), `documentedFieldCount`, `conflictCount`, `searchText`.

JSONB keeps the sealed structure intact and avoids a lossy re-modelling of 40+ evidence kinds. List queries select only scalar columns.

### Importer

`scripts/import-fim-profiles.ts`, driven by `FIM_DATA_DIR`:

1. Read inputs; fail closed unless counts match `summary.json` and `SEALED.json` matches the expected seal hash.
2. Pure `buildFimProfileRows()` maps profiles, attaches findings/observations by `actor_id`, and attaches pilot reviews where `job_id === "actor-" + actor_id`.
3. Dry run (default) prints a JSON plan: planned, creates, updates, company links, pilot overlays.
4. `--apply` upserts the release and all profiles in one transaction, then reads back and asserts the persisted count.

### UI

- `/innovasjonskart` — header with candidate notice, totals, filters (group, entity kind, text search on name/org number), server-side pagination via search params.
- `/innovasjonskart/[id]` — identity header with link to `/selskap/[id]` when matched; narrative; all 18 fields as cards with evidence state, rendered values, qualification, period, and source link; findings; numeric observations table; pilot review with verdicts; open questions.
- Nav entry `innovasjonskart` in the `kunnskap` group, NO/EN labels.

## Verification

- Unit tests: row builder and input validation (synthetic fixture), API-leak guard, workflow target and backup-gate tests.
- `npm run test`, `npm run lint`, `npm run build`, `git diff --check`.
- Local dry run and apply against the local database when available.
- After merge and deploy: `fim-v009-dry`, then `fim-v009` in prod (owner confirms), then log in and check both pages.
