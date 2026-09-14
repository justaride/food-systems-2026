# Map Phase 2, Slice 2: Ports — Plan

> **Spec:** `docs/superpowers/specs/2026-09-14-kart-fase2-registerdata-design.md`

**Goal:** Replace `ports.geojson` (25 hand-curated ports with unsourced tonnage) with Kystverket's two registers:

- **Fiskerihavner** (WFS `layer_1077`, 766 points, geometry only)
- **ISPS port facilities** (WFS `layer_420`, 634 approved facilities with name, harbour, functions, owner type and kommune)

Both come from `https://services.kystverket.no/wfs.ashx` as WFS 1.0 GML in UTM 33N (EPSG:32633).

**Baseline:** `origin/main` at `b3147bd`.

**Out of scope:** landing volumes per harbour (slice 5), logistics hubs (slice 4), database, `/api`.

---

### Task 1: WFS parsing and projection

- `src/lib/map/registers/wfs.ts` — `parseWfsGmlPoints(gml)` returns `{ fid, x, y, properties }` and decodes XML entities.
- UTM 33N → WGS84, via an existing library if the repo has one, otherwise a tested Krüger-series implementation.
- Tests use a synthetic GML snippet and a reference coordinate pair.

### Task 2: Naming fishing harbours

- `src/lib/map/registers/nearest.ts` builds a grid index of Matrikkelen addresses. `nearestPlace(lng, lat)` returns poststed, kommunenummer, kommunenavn and distance.
- Fishing harbours are labelled «Fiskerihavn, <poststed>». Both layers take kommunenummer from the nearest address.
- A harbour more than 5 km from any address keeps the label «Fiskerihavn» and gets no kommune.

### Task 3: Fetch script

**File:** `scripts/fetch-ports-register.ts`; npm script `fetch:ports-register`.

1. Download both layers into `tmp/kart-cache/kystverket/`, hashing each.
2. Convert coordinates and name the points.
3. Write `public/data/food-systems/no/ports-register.geojson` with the same `_meta` provenance as slice 1.

Rules:

- `ownercompanyname` is published only when `ownertypenor` is «Offentlig» or the name carries a legal-form suffix (AS, ASA, SA, IKS, KF, …). Otherwise it is left out, because a private owner without a legal form may be a person.
- The script fails if the feature count differs from the WFS count, or a converted point falls outside Norway's bounding box.

### Task 4: Keep the flow prototype working

- `flows.json` edges reference legacy port and hub ids. Copy the 15 nodes the edges use into an optional `nodes` array in `flows.json`, still marked illustrative.
- `FoodFlowMap` prefers `dataset.nodes` and falls back to context ports and hubs.

### Task 5: Map and consumers

Update these files:

- `src/lib/map/types.ts`: `Port` and `PortType` become `fishing-harbour | port-facility`.
- `src/lib/map/MapContext.tsx`: `parsePorts`.
- `src/components/map/FoodMap.tsx`: port popup with name, harbour, functions, owner when publishable, kommune and source.
- `src/components/map/LayerPanel.tsx`: drop the unverified flag.
- `src/lib/config/countries/no.ts`: `dataFiles` and `dataSources`.
- `src/lib/queries/supply-chain.ts`: counts, layer spec and examples.
- `src/lib/queries/verdikjede.ts`.
- `public/data/food-systems/DATA-SOURCES.md`.

Then delete both copies of `ports.geojson`.

### Task 6: Verify and ship

1. Run `npm run test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, the research-artifacts audit and `audit:citable-reports`.
2. Spot-check ten random points: fishing harbours against the nearest address, ISPS facilities against their `harbour` and `councilname`.
3. Open the PR, merge after green CI, and check `/kart/no` and `/kart/no/flow` live.
