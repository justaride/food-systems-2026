# Map Phase 2, Slice 4: Wholesale and Logistics — Plan

> **Spec:** `docs/superpowers/specs/2026-09-14-kart-fase2-registerdata-design.md`

**Goal:** Replace `logistics_hubs.geojson` (19 hand-curated hubs with city-level coordinates) with food wholesale and warehousing sites from Brønnøysundregistrene's Enhetsregisteret:

- **Sub-units** (`underenheter` bulk CSV, NLOD) give the site: name, NACE code, employees and street address.
- **Main entities** (`enheter` bulk CSV) give the parent's organisational form, name and NACE code.

Sites are geocoded offline against Kartverket Matrikkelen addresses, as in slice 1.

**Baseline:** `origin/main` at `6702ff5`.

**Out of scope:** stores (slice 3), landing volumes (slice 5), the flow prototype's illustrative nodes, database, `/api`.

---

### Task 1: Selection rule

**Files:**
- create `src/lib/map/registers/wholesale.ts`
- create `tests/lib/map/registers/wholesale.test.ts`

A sub-unit becomes a candidate when all of these hold:

- it is active (no `nedleggelsesdato`)
- it has at least 20 employees
- its `naeringskode1` is in 46.3 (food wholesale) or 52.1 (warehousing)

Two refinements, both recorded in `_meta.selection`:

- **46.35 (tobacco) is excluded.** It is not food.
- **52.1 is kept only when it is food-related.** Either the parent's `naeringskode1` is a food code (03, 10, 11, 46.3, 47.1, 47.2, 56), or the unit or parent name names cold, frozen or food storage (`frys*`, `kjøl*`, `frigo*`, `cold`, `sjømat`, `seafood`, `fisk*`, `food`, `mat`, `kjøtt*`, `meieri*`, `frukt`, `grønt`). General third-party warehouses are excluded.

Tests with synthetic rows:

1. A 46.39 unit with 20 employees is kept; one with 19 is not.
2. A closed unit is dropped.
3. A 46.35 unit is excluded.
4. A 52.10 unit is kept for a food parent or a cold-storage name, and excluded otherwise.
5. A multi-line address yields each line as a geocoding candidate, and the best precision wins.

### Task 2: Fetch script

**File:** create `scripts/fetch-wholesale-logistics.ts`; add npm script `fetch:wholesale-logistics`.

1. Stream `underenheter` through `readCsvRecords` and keep the candidates.
2. Stream `enheter` for their parents only.
3. Geocode each candidate against Matrikkelen (`address` → `place-name` → `postnummer`).
4. Apply `publishDecision` to decide the output:
   - non-ENK parents become points
   - ENK or unknown parents are counted per kommune
5. Write `public/data/food-systems/no/wholesale-logistics.geojson` with the slice 1 `_meta` provenance (sourceClass, verificationStatus, citationText, licence, sources with SHA-256, counts per NACE group and precision).

Each point carries these properties:

- sub-unit orgnr and name
- parent name, orgnr and organisational form
- employees
- NACE code and description
- address, postnummer and poststed
- kommunenummer
- precision

The script fails in two cases:

- candidates ≠ points + kommune-counted + dropped
- more than 5 % of candidates lack a location

### Task 3: Map and consumers

- `src/lib/map/types.ts`: `LogisticsHub` gets the register fields. The name stays, so the vulnerability model is untouched.
- `src/lib/map/MapContext.tsx`: `parseLogisticsHubs`.
- `src/components/map/FoodMap.tsx`: the popup escapes all register text and shows parent, NACE, employees, address, precision and source. `UNVERIFIED_NOTE` is removed.
- `src/components/map/LayerPanel.tsx`: the layer becomes «Engros og lager», without the unverified flag.
- `src/components/map/FoodFlowMap.tsx`: fallback label.
- `src/lib/config/countries/no.ts`: `dataFiles` and `dataSources`, plus the Sårbarhet limitation text.
- `src/lib/queries/supply-chain.ts`: counts, layer spec and examples.
- `src/lib/queries/verdikjede.ts`.
- `public/data/food-systems/DATA-SOURCES.md`.

Then delete both copies of `logistics_hubs.geojson`. `no/flow-nodes.json` already holds the hub nodes the flow prototype uses.

### Task 4: Vulnerability model

Hub distance carries 37.5 % of the score. Run `calculateVulnerabilityScores` on real data with the 19 old hubs and with the register points, then report the shift in risk levels in the PR.

### Task 5: Verify and ship

1. Run `npm run test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, the research-artifacts audit, `audit:citable-reports` and `git diff --check`.
2. Spot-check ten seeded random points against the Kartverket address API and record them in the PR.
3. Open the PR. After approval and green CI, merge, then check `/kart/no` and `/kart/no/flow` live.
