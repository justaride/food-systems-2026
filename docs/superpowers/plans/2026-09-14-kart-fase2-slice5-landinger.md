# Map Phase 2, Slice 5: Landing Volumes — Plan

> **Spec:** `docs/superpowers/specs/2026-09-14-kart-fase2-registerdata-design.md`

**Goal:** Enrich the processing establishments from slice 1 with the volumes landed at them in 2025.

- **Source:** Fiskeridirektoratet's open landing and sales-note register (`fangstdata_2025.csv.zip`, NLOD), stream-aggregated per receiving station.
- **Join:** a station code that equals a Mattilsynet approval number is matched to the slice 1 point.
- **Everything else** is published per landing kommune or as a suppressed national remainder.

**Baseline:** `origin/main` at `0ed7e67`.

**Evidence (2025 file, 974,467 rows, checked 2026-09-14):**

- Sales notes (`Dokumenttype 0`) hold 1,914,824 tonnes landed in Norway. Landing documents hold 326 tonnes, 315 of them repeating a sales note, so only sales notes are summed.
- 502,529 tonnes were landed abroad and are left out.
- There are 447 receiving stations in Norway. 278 match an approval number, and 77 received from fewer than three vessels.
- `Mottaker ID` is empty in the file.

**Hard boundaries:**

- Fisher IDs, vessel IDs, vessel names and per-landing rows never leave memory or `tmp/`.
- A volume is published for a station only when at least three distinct vessels delivered there in the year; the same rule applies per kommune. Smaller cells go into one national suppressed total, so a published figure never describes a single fisher's catch.
- Volumes are whole tonnes of round weight (`Rundvekt`) per species main group. No prices or values.

**Out of scope:** a separate landings map layer, other years, prices, database, `/api`.

---

### Task 1: Aggregation logic

**Files:**
- create `src/lib/map/registers/landings.ts`
- create `tests/lib/map/registers/landings.test.ts`

1. `addLanding(acc, row)` keeps sales notes landed in Norway. It sums kilograms per station and species main group, and tracks distinct vessels and the station's landing kommune.
2. `finalizeLandings(acc, approvalNumbers, minVessels = 3)` splits the result three ways:
   - matched stations with enough vessels, keyed by approval number
   - the rest per landing kommune, when the kommune clears the vessel threshold
   - a suppressed remainder
3. The output carries no vessel identifiers, and the reconciliation holds exactly: stations + kommuner + suppressed = total.

Tests use synthetic rows only.

### Task 2: Fetch script

**File:** create `scripts/fetch-landings.ts`; add npm script `fetch:landings`.

1. Download `https://register.fiskeridir.no/uttrekk/fangstdata_2025.csv.zip` into `tmp/kart-cache/fiskeridir/`, hash it, unzip it and stream the CSV.
2. Write `public/data/food-systems/no/landings-2025.json`. `_meta` carries:
   - sourceClass `registry_snapshot`
   - verificationStatus `unverified`
   - citationText and licence (NLOD 2.0)
   - the selection and privacy rule
   - sources with SHA-256
   - counts, including rows read, rows kept and the tonnes in each bucket
3. The script fails when the buckets do not add up to the total, or when fewer than 50 % of the tonnes landed in Norway can be tied to a station.

### Task 3: Map

- `src/lib/map/types.ts`: `ProcessingPlant.landings?`.
- `src/lib/map/MapContext.tsx`: load `dataFiles.landings` and attach it to processing plants by approval number.
- `src/components/map/FoodMap.tsx`: the processing popup shows «Landet 2025: N tonn», the main species groups and the source.
- `src/lib/config/countries/no.ts`: `dataFiles.landings` and a Datakilder entry.
- `public/data/food-systems/DATA-SOURCES.md`.

### Task 4: Verify and ship

1. Run `npm run test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, the research-artifacts audit, `audit:citable-reports` and `git diff --check`.
2. Spot-check ten seeded published stations. Recompute each total from the raw CSV and compare the station's landing kommune with the establishment's kommune.
3. Open the PR, merge after green CI, and live-check a seafood popup on `/kart/no`.
