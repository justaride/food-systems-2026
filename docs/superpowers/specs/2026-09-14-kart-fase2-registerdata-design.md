# Map Phase 2: Register Data for /kart/no — Design

**Date:** 2026-09-14

**Status:** Started on request in chat ("start fase 2"), following the map audit and Phase 1 (PR #416, #417)

**Branch:** `claude/kart-fase2-registerdata`

## Goal

Replace the hand-curated value-chain layers on `/kart/no` with layers generated from public registers, so every point on the map traces to a register row, a download date and a file hash. Phase 1 flagged these layers as unverified; Phase 2 removes the reason for the flag.

## Evidence baseline (checked 2026-09-14)

| Layer today | Records | Problem | Register replacement | Tested scale |
|---|---|---|---|---|
| `processing_plants.geojson` | 30 | ≥ 12 share city-centre coordinates; one plant does not exist; no sources | Mattilsynet approved establishments (CSV per list) + Brreg | 3,091 section rows in the combined list |
| `ports.geojson` | 25 | Unsourced tonnage; cargo and fish landings mixed | Kystverket fiskerihavner (WFS `layer_1077`, 766 points) + ISPS port facilities (`layer_420`, 634) | 1,400 points |
| `logistics_hubs.geojson` | 19 | City-level coordinates; ASKO/Coop hubs missing | Brreg underenheter NACE 46.3 / 52.1 with ≥ 20 employees | ~270 units |
| `stores.json` | 3,849 | 2024 snapshot; 99.9 % without address | Overpass refresh (4,603 grocery shops today) reconciled against Konkurransetilsynet chain totals | 4,603 |
| — | — | Landing volumes absent | Fiskeridirektoratet `fangstdata_<år>.csv.zip`, aggregated per receiving station | 688,582 rows (2026) |

Supporting sources:

- **Kartverket addresses.** `ws.geonorge.no/adresser/v1` is fine for spot checks. The bulk `MatrikkelenAdresse` CSV (151.7 MB) supports offline geocoding. Licence CC BY 4.0.
- **Brreg Enhetsregisteret.** Bulk `underenheter` CSV (61.3 MB), refreshed nightly. Licence NLOD. Sub-units have no coordinates; sole proprietorships (ENK) can only be identified on the main entity.

Of Fiskeridirektoratet's 407 station/plant codes, 283 match Mattilsynet approval numbers.

## Hard boundaries

- **The build stays DB-free.** Layers are committed static files produced by fetch scripts, following the `scripts/fetch-farm-foretak.ts` pattern. No new Prisma models, no `/api` routes.
- **No personal data in the public repo.**
  - A point is published only for an establishment resolved to a Brreg main entity that is not a sole proprietorship (organisasjonsform ≠ ENK).
  - ENK and unresolved establishments are published only as counts per kommune.
  - Fisher IDs, vessel names and per-landing rows never leave `tmp/`.
- **Raw downloads live in `tmp/kart-cache/`** (already gitignored) and are never committed.
- **Every generated file carries provenance in `_meta`** (per `.claude/source-attribution-policy.md`, "Minimum for ny import"):
  - `sourceClass: "registry_snapshot"`
  - `citationText`
  - source `url`(s)
  - `accessedAt`
  - SHA-256 of each downloaded source file
  - `verificationStatus: "unverified"`
  - counts
- **Every point states its geocoding precision:** `address` (exact Matrikkel match on street address and postnummer) or `postnummer` (centroid of that postnummer's addresses). Rows that match neither are dropped from the points and reported in `_meta`.
- **Licence check before commit.** Mattilsynet's licence is untested. The slice that commits Mattilsynet-derived data must record the licence found, or stop.
- No change to other countries, the database, claim-lock state or public-facing claims.

## Architecture

### Shared modules (`src/lib/map/registers/`)

Pure, unit-tested functions with no I/O:

- `normalize.ts` — address and name normalisation (case, whitespace, `gate`/`gt.`, letters on house numbers).
- `geocode.ts` — builds an index from Matrikkel rows (`postnr + normalised adressetekst → [lng, lat]`) and a postnummer centroid table; `geocode(address, postnr)` returns `{ coordinates, precision } | null`.
- `brreg-match.ts` — resolves an establishment to a sub-unit by orgnr, or by normalised name plus postnummer; returns the parent's orgnr, organisasjonsform and employee count.
- `privacy.ts` — splits resolved rows into publishable points and per-kommune counts.

Download, streaming and caching live in `scripts/lib/register-cache.ts`: fetch to `tmp/kart-cache/`, compute SHA-256, reuse the cached file when younger than a max age.

### Output files (`public/data/food-systems/no/`)

Each file is GeoJSON with `_meta` plus a `kommuneCounts` block for non-published rows:

- `processing-establishments.geojson`
- `ports-register.geojson`
- `wholesale-logistics.geojson`
- a refreshed `stores.json`

### Consumers to move per slice

- `src/lib/config/countries/no.ts`: `dataFiles` and `dataSources`. The replaced layer loses `unverified`.
- `src/lib/map/MapContext.tsx` parsers and `src/components/map/FoodMap.tsx` popups. Processing points get colours by category (meat, seafood, dairy, egg, general) instead of by six named companies.
- `src/lib/queries/supply-chain.ts` and `src/lib/queries/verdikjede.ts`. They read root-level copies in `public/data/food-systems/`; point them at `no/` and delete the root copy in the same slice.
- `public/data/food-systems/DATA-SOURCES.md`.
- The hand-curated file is deleted in the slice that replaces its last consumer.

## Slices

| # | Slice | Replaces | Main risk |
|---|---|---|---|
| 1 | Geocoder + processing establishments (Mattilsynet + Brreg) | `processing_plants.geojson` | Name+postnummer match rate against Brreg; Mattilsynet licence |
| 2 | Ports (Kystverket fiskerihavner + ISPS) | `ports.geojson` | Fiskerihavner have no names — label by nearest address/kommune |
| 3 | Stores (Overpass refresh + chain totals check) | `stores.json` | Overpass timeouts; the ODbL attribution must stay visible |
| 4 | Wholesale and logistics (Brreg 46.3 / 52.1, ≥ 20 employees) | `logistics_hubs.geojson` | NACE captures non-food warehousing — filter and sample-check |
| 5 | Landing volumes (Fiskeridirektoratet, per station, joined to slice 1) | — (enriches slice 1) | 745 MB CSV per year — stream, never load whole |

Slice 1 goes first because it has the largest gain (30 → about 1,500 establishments), rests on an official approval register, and builds the geocoder the other slices reuse. The vulnerability model keeps using `logistics_hubs.geojson` until slice 4.

## Verification (per slice)

- Unit tests for every pure module, with **synthetic fixtures only** (no real establishment or person names).
- **Reconciliation.** The generated `_meta` counts must equal source totals: rows read = points + kommune-counted + dropped. The script fails if the dropped share exceeds a stated threshold (slice 1: 10 %).
- **Spot check.** Ten random points compared against the source row and the Kartverket address API, recorded in the PR description.
- `npm run test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run audit:research-artifacts -- --base=origin/main`.
- **Live check** after deploy: layer count, popup provenance, Datakilder entry.

## Out of scope

- Database imports of the same registers.
- Linking map points to `/selskap/[id]`. That needs an orgnr → id resolver without exposing data through `/api`.
- Other Nordic countries.
- Travel-time food-desert analysis (Phase 3).
