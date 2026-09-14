# Map Phase 2, Slice 1: Geocoder and Processing Establishments — Plan

> **Spec:** `docs/superpowers/specs/2026-09-14-kart-fase2-registerdata-design.md`

**Goal:** Replace `processing_plants.geojson` (30 hand-curated plants) with a layer generated from Mattilsynet's approved-establishment lists. Points are geocoded offline against Matrikkelen addresses and resolved to Brreg entities. Only non-ENK establishments are published as points.

**Baseline:** `origin/main` at `8d3ae36`.

**Out of scope:** ports, stores, logistics hubs, landing volumes, database, `/api`, company-page links.

---

### Task 1: Register cache

**Files:** create `scripts/lib/register-cache.ts`.

- `cachedDownload(url, fileName, { maxAgeHours })` downloads to `tmp/kart-cache/`, streams to disk and returns `{ path, sha256, bytes, fetchedAt }`.
- It reuses the cached file when fresh.
- It unzips `.zip` sources to a sibling folder.

### Task 2: Normalisation and geocoder

**Files:**
- create `src/lib/map/registers/normalize.ts`
- create `src/lib/map/registers/geocode.ts`
- create `tests/lib/map/registers/geocode.test.ts`

1. Write failing tests with synthetic Matrikkel rows:
   - an exact street address and postnummer returns `precision: "address"`
   - an abbreviation (`gt.` vs `gate`) and a house-number letter still match
   - an unknown street in a known postnummer returns `precision: "postnummer"` at the centroid
   - an unknown postnummer returns `null`
2. Implement `normalizeAddress`, `buildAddressIndex(rows)`, `geocode(index, address, postnr)`.
3. Tests pass.

### Task 3: Mattilsynet list parsing

**Files:**
- create `src/lib/map/registers/mattilsynet.ts`
- create `tests/lib/map/registers/mattilsynet.test.ts`

1. Write failing tests on synthetic CSV text for the combined list (`GODKJENNINGSNUMMER;VIRKSOMHETSNAVN;ADRESSE;POSTNR;POSTSTED;PRODUKSJONSFORM;ART;SEKSJON`):
   - rows group by approval number
   - sections map to a category: 1–6 meat, 8 seafood, 9 dairy, 10 egg, 0 general
   - activities and species collect without duplicates
2. Test the fish list's `BEDRIFTSNUMMER` join (orgnr per approval number).
3. Test `extractCsvLinks(html)`, which finds attachment CSV URLs on a list page.

### Task 4: Brreg resolution and privacy split

**Files:**
- create `src/lib/map/registers/brreg-match.ts`
- create `src/lib/map/registers/privacy.ts`
- create tests for both

1. Failing tests:
   - an orgnr match wins
   - otherwise a normalised name plus postnummer matches exactly one sub-unit
   - ambiguous name matches stay unresolved
   - an ENK parent is never published as a point
   - unresolved and ENK rows are counted per kommune, with kommune taken from the geocoded postnummer
2. Implement.

### Task 5: Fetch script

**Files:** create `scripts/fetch-processing-establishments.ts`; add npm script `fetch:processing-establishments`.

1. Download these into `tmp/kart-cache/` and hash them:
   - the Mattilsynet list pages and CSVs
   - Matrikkelen address CSV
   - Brreg `underenheter` and `enheter` CSV
2. Build the establishments, then geocode, resolve and split them.
3. Write `public/data/food-systems/no/processing-establishments.geojson` with:
   - `_meta`: sourceClass, citationText, urls, accessedAt, sha256 per source, verificationStatus, licence notes, and counts per category, precision and publish status
   - `kommuneCounts`
4. Fail when rows read ≠ points + counted + dropped, when the dropped share exceeds 10 %, or when Mattilsynet's licence cannot be recorded.

### Task 6: Map and consumers

**Files:**
- `src/lib/map/types.ts`
- `src/lib/map/MapContext.tsx`
- `src/components/map/FoodMap.tsx`
- `src/components/map/LayerPanel.tsx`
- `src/lib/config/countries/no.ts`
- `src/lib/queries/supply-chain.ts`
- `src/lib/queries/verdikjede.ts`
- `public/data/food-systems/DATA-SOURCES.md`

1. Replace the `ProcessingPlant` shape with register fields:
   - approval number
   - name
   - category
   - activities
   - address
   - precision
   - orgnr
   - employees
2. The popup shows these, plus the source and «posisjon: adresse/postnummer».
3. Colour points by category.
4. Drop the `unverified` flag for the processing layer. Add a Datakilder entry with licence, counts and `npm run fetch:processing-establishments`.
5. Point the supply-chain and verdikjede counts at the new file.
6. Delete `processing_plants.geojson` (root and `no/`) and drop `processingCompanies` from all country configs.

### Task 7: Verify and ship

1. Run `npm run test`, `npm run lint`, `npx tsc --noEmit`, `npm run build` and `npm run audit:research-artifacts -- --base=origin/main`.
2. Spot-check ten random points against the source row and the Kartverket address API, and record them in the PR description.
3. Open the PR, merge, and live-check `/kart/no`.
