# Map Phase 2, Slice 3: Stores — Plan

> **Spec:** `docs/superpowers/specs/2026-09-14-kart-fase2-registerdata-design.md`

**Goal:** Replace the map's `stores.json` (3,849 OSM stores from 2024-Q4, 99.9 % without address) with a fresh OpenStreetMap snapshot from Overpass.

- **Selection** keeps the traditional grocery concept chains of Dagligvarefasiten, as decided by the owner in chat on 2026-09-14. Service retail (7-Eleven, Mix, Snarkjøp, Narvesen, Circle K) and independents are counted in `_meta`, not shown.
- **Reconciliation** checks the chain counts against Dagligvarefasiten 2025 (NielsenIQ, stores per 31 December 2024; 3,816 in total).

**Baseline:** `origin/main` at `d8235a1`.

**Hard boundary kept:** `no/chart-metrics.json` (parent shares, Lorenz, Zipf on `/sammenligning`) stays derived from the frozen 2024 `no/stores.json`.

- The file is content-hashed in `research/landscape/norway-fsd-source-ledger-2026-08-10.jsonl`.
- Its HHI 3440 is pinned in `tests/landscape/validate-norway-fsd-crosswalk.test.ts`.
- The spec rules out changes to public-facing claims.

The map reads a new file; the frozen snapshot is left in place for chart metrics only.

**Out of scope:** chart metrics and the FSD crosswalk, other countries, landing volumes (slice 5), database, `/api`.

---

### Task 1: Chain classification

**Files:**
- create `src/lib/map/registers/grocery-chains.ts`
- create `tests/lib/map/registers/grocery-chains.test.ts`

1. `classifyGroceryElement(tags)` maps an OSM element to one of 14 chains.
   - The `brand` tag is checked first. Without a brand, a chain name at the start of `name` counts; the longest alias wins, so «Coop Extra» → Extra and «Eurospar» is not Spar.
   - A service-retail brand is excluded even when the name looks like a chain.
2. `dedupeNearby` drops a second element of the same chain within 75 m (a node and a way for one shop).
3. `reconcileChains(counts)` compares against Dagligvarefasiten 2024 and fails on either condition:
   - the total deviates by more than 10 %
   - a chain with at least 50 reference stores deviates by more than 15 %

   Spar and Coop Prix are compared as one pair, because their order in the source PDF is ambiguous (255/257). Nærbutikken is only reported, as part of «NG øvrige».

Tests use synthetic tags only.

### Task 2: Fetch script

**File:** create `scripts/fetch-grocery-stores.ts`; add npm script `fetch:grocery-stores`.

1. Query Overpass (`nwr[shop~supermarket|convenience]` in Norway, `out tags center`) through `cachedDownload`. The script sends a descriptive User-Agent, since Overpass rejects the default one with HTTP 406.
2. Classify, deduplicate and label each store with the nearest Matrikkelen poststed within 2 km.
3. Write `public/data/food-systems/no/grocery-stores.json` as `{ _meta, stores }`. `_meta` carries:
   - sourceClass `registry_snapshot`
   - verificationStatus `unverified`
   - the Overpass `timestamp_osm_base`
   - sources with SHA-256
   - licence: ODbL 1.0 with attribution «© OpenStreetMap-bidragsytere»
   - counts per chain, per exclusion reason and per reconciliation row
4. Phone numbers and websites are dropped, because a franchise store's number may be the merchant's own.
5. The script fails when elements read ≠ stores + excluded + duplicates, or when reconciliation fails.

### Task 3: Map and consumers

- `src/lib/config/countries/no.ts`: `dataFiles.stores` → `grocery-stores.json`, Eurospar chain and parent, and the Butikker `dataSources` entry with the ODbL attribution.
- `src/lib/map/MapContext.tsx`: accept `{ stores }` as well as the array other countries use.
- `src/components/map/FoodMap.tsx`: the store popup escapes OSM text and shows the poststed and «Kilde: OpenStreetMap-bidragsytere (ODbL)».
- `public/data/food-systems/DATA-SOURCES.md`: a new section, with `no/stores.json` marked as the frozen chart-metrics snapshot.
- Delete the unused root copy `public/data/food-systems/stores.json`.

### Task 4: Vulnerability and food desert

Run `calculateVulnerabilityScores` before and after on real data and report the shift in the PR.

### Task 5: Verify and ship

1. Run `npm run test`, `npm run lint`, `npx tsc --noEmit`, `npm run build` (confirm `chart-metrics.json` is unchanged), the research-artifacts audit, `audit:citable-reports` and `git diff --check`.
2. Spot-check ten seeded random stores against the OSM element and the nearest Kartverket address.
3. Open the PR; after approval and green CI, merge and live-check `/kart/no`.
