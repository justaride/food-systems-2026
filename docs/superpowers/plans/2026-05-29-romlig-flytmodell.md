# Romlig flytmodell (Spec 3a) — Implementeringsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vise de kuraterte sirkulære materialstrømmene (matsvinn ↔ biogass ↔ omfordeling) som et geografisk lag på det eksisterende Leaflet-kartet, ærlig presisjons-gradert (eksakt punkt / kommune-sentroid / estimert / ukjent), slik at romlig logistikk-infrastruktur kan vurderes.

**Architecture:** En ren resolver (`src/lib/flows/spatial.ts`) kobler Spec 2-flytnodene (`LoopFlows` fra `material-flows.json`) til koordinater via en stige: kuratert `circular-nodes.geojson`-feature (matchet på node-`id`/`ref`/normalisert label) → node-`ref` → `AquacultureSite`-koordinat (exact_point) → `unknown`. En ren validator (`src/lib/flows/validate-coords.ts`) og en kommune-sentroid-Turf-helper (`src/lib/map/kommune-centroid.ts`) støtter kurering. Et imperativt Leaflet-lag bygges av `buildCircularFlowLayer` (`src/components/map/CircularFlowLayer.tsx`) og registreres i `FoodMap.tsx` på nøyaktig samme måte som de andre lagene (en `useEffect` + `LayerGroup`-ref), med toggle i `LayerPanel.tsx` (default av) og data lastet i `MapContext.tsx`.

**Tech Stack:** Next.js 16 (App Router, klient-komponenter), Leaflet (rå/imperativ — IKKE react-leaflet i `FoodMap`), `@turf/turf` (centroid, kun ved kurering), TypeScript. Tester: `node --import=tsx --test <fil>`; full suite `npm test` (find-basert glob fanger `tests/lib/flows/*`).

**Arkitektur-avvik fra spec (bevisst, følger eksisterende mønster):** Spec §3 nevner `CircularFlowLayer.tsx` som en komponent. `FoodMap` bruker rå imperativ Leaflet (ikke react-leaflet `<LayersControl>`), der hvert lag er en `useEffect` som bygger en `L.LayerGroup`. Vi følger det etablerte mønsteret: `CircularFlowLayer.tsx` eksporterer en ren byggefunksjon `buildCircularFlowLayer(opts): L.LayerGroup` som `FoodMap`s `useEffect` kaller — samme form som `aquaculture`/`ports`/`farms`-lagene. Dette honorerer spec-filnavnet og spec-oppførselen (presisjons-fargede markører + evidens-stylede polylinjer + popups + per-land toggle) uten å innføre en parallell react-leaflet-arkitektur.

**Konvensjoner (les før du starter):**
- Moduler under `src/lib/flows/*` og `src/lib/map/kommune-centroid.ts` importeres av tester → bruk **RELATIVE** importer for lokale moduler (både `type` og verdi): `./types`, `../data/...`. Pakke-importer (`@turf/turf`, `node:test`) er greie. IKKE bruk `@/`-alias i test-importerte moduler (tsx-runneren løser ikke alias).
- Test-filer importerer src via relativ sti 3 nivåer opp: `import { X } from '../../../src/lib/flows/spatial'`.
- React/klient-filer (`CircularFlowLayer.tsx`, `FoodMap.tsx`, `MapContext.tsx`, `LayerPanel.tsx`) bruker `@/`-alias som resten av kart-koden — de er IKKE test-importert.
- Leaflet-koordinatrekkefølge: GeoJSON/datasett bruker `[lng, lat]`; Leaflet `circleMarker`/`polyline` bruker `[lat, lng]`. Konverter alltid `[coord[1], coord[0]]`.
- Implementerere committer **KUN sine egne filer** (aldri `git add -A` — det finnes urelaterte ukommitterte endringer i treet: `docs/meetings/*`, mandates, `tests/lib/food-transfer-wageningen.test.ts`).
- Branch: `codex/romlig-flytmodell` (fra `main`). Spec: `docs/superpowers/specs/2026-05-29-romlig-flytmodell-design.md`.
- Hvis en `tsx`-kommando feiler på sandbox-IPC-pipe (EPERM), retry med sandbox disabled.
- Kjent pre-eksisterende TS1501 i `tests/lib/insight-link-scripts.test.ts` er urelatert; ignorer den.

---

## Filstruktur

| Fil | Ansvar | Test? |
|-----|--------|-------|
| `src/lib/flows/spatial.ts` (ny) | Rene typer + `normalizeKey`, `buildCuratedLookup`, `resolveFlowCoordinates`, `summarizeCoverage` | TDD |
| `src/lib/flows/validate-coords.ts` (ny) | `validateCircularNodes(geojson) → CoordIssue[]`, `ALLOWED_KINDS` | TDD |
| `src/lib/map/kommune-centroid.ts` (ny) | `kommuneCentroid(polygonFeature) → LngLat` (Turf, kun kurering) | TDD |
| `public/data/food-systems/circular-nodes.geojson` (ny) | Kuratert punkt-datasett, kildebelagt + presisjons-gradert | Guard-test |
| `src/components/map/CircularFlowLayer.tsx` (ny) | `buildCircularFlowLayer(opts) → L.LayerGroup` + stil/label-konstanter | tsc + Playwright |
| `src/lib/map/types.ts` (endre) | Legg `'circular-flows'` i `MapLayer` | tsc |
| `src/lib/map/MapContext.tsx` (endre) | Last + eksponer `circularNodes` + `materialFlows` | tsc + lint |
| `src/components/map/FoodMap.tsx` (endre) | Registrer flyt-laget (`useEffect` + ref) | tsc + lint + Playwright |
| `src/components/map/LayerPanel.tsx` (endre) | Toggle-rad (gated på data) | tsc + lint |
| `tests/lib/flows/circular-nodes-guard.test.ts` (ny) | Guard over committet geojson + dekningsrapport | Selve testen |

---

## Datagrunnlag (fra `public/data/food-systems/material-flows.json`, 25 loops)

Plasserbare sirkulær-loops (har navngitte, geo-forankrede noder) — disse er kurerings-mål:

| loopId | Node-`id`-er (utvalg) | Geo-anker (kilde-type) |
|--------|------------------------|------------------------|
| `no-magiske-fabrikken` | `kildesortert-matavfall-husdyrgjodsel`, `anaerob-nedbrytning`, `biometan-biorest-gjodsel`, `jordbruk` | Den Magiske Fabrikken, Tønsberg/Rygg (~10.32, 59.23) — anleggsadresse, **exact_point** |
| `dk-kalundborg` | `symbiosis`, `power-plant`, `food-industry`, `co-located-industry`, `gypsum-board`, `shared-water` | Kalundborg Symbiosis, DK (~11.09, 55.68) — **exact_point** |
| `se-linkoping-biogas` | `matavfall-slakteriavfall`, `biogass`, `drivstoff-til-kollektivtransport-digestat-til-jordbruk` | Linköping biogas, SE (~15.62, 58.41) — **exact_point** |
| `fi-stormossen-vaasa` | `matavfall-bioavfall`, `biogass-biorest-som-godkjent-gjodsel` | Stormossen, Vaasa, FI (~21.7, 63.1) — **exact_point** |
| `no-matsentralen` | `surplus-food-from-retail-industry`, `food-banks`, `vulnerable-populations` | Matsentralen Oslo (~10.80, 59.93) — **exact_point**/`food-bank` |
| `nordic-gasum` | `biogas-production-in-fi-se`, `lbg-transport`, `heavy-vehicle-fuel-across-nordics` | Gasum-anlegg (FI/SE) — representativt, **kommune_centroid**/**estimated** |

Abstrakte kategorinoder uten ærlig geo-anker (f.eks. `dk-biogas`s `food-waste-manure`, `agriculture`; `se-biogas`) kureres **ikke** → resolver gir `unknown` → tegnes ikke. Dette er ærlig-by-construction: kartet viser kun det som faktisk er stedfestet.

**Viktig observasjon:** Kun 1 av 25 loops har en node med `ref` (`/aktorer/infinitum`, en pant-aktør — ikke akvakultur). AquacultureSite-stigen (tier 2) finnes derfor for spec-troskap og fremtidige akvakultur-forankrede loops, men på dagens data er den i praksis aldri utløst — kuratert `circular-nodes.geojson` (matchet på node-`id`) bærer alle koordinater.

---

### Task 1: Ren resolver — `src/lib/flows/spatial.ts`

**Files:**
- Create: `src/lib/flows/spatial.ts`
- Test: `tests/lib/flows/spatial.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/lib/flows/spatial.test.ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  normalizeKey,
  buildCuratedLookup,
  resolveFlowCoordinates,
  summarizeCoverage,
  type FlowCoordLookups,
} from '../../../src/lib/flows/spatial'
import type { LoopFlows } from '../../../src/lib/flows/types'

const geojson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { key: 'anaerob-nedbrytning', label: 'Anaerob nedbrytning', kind: 'biogas_plant', country: 'no', precision: 'exact_point', source: 'Den Magiske Fabrikken' },
      geometry: { type: 'Point', coordinates: [10.32, 59.23] },
    },
    {
      type: 'Feature',
      properties: { key: 'jordbruk', label: 'Jordbruk', kind: 'agriculture', country: 'no', precision: 'kommune_centroid', source: 'SSB kommune-sentroid (Tønsberg)' },
      geometry: { type: 'Point', coordinates: [10.41, 59.27] },
    },
  ],
}

const loops: LoopFlows[] = [
  {
    loopId: 'no-magiske-fabrikken',
    nodes: [
      { id: 'anaerob-nedbrytning', type: 'category', label: 'anaerob nedbrytning' },
      { id: 'jordbruk', type: 'category', label: 'jordbruk' },
      { id: 'biometan-biorest-gjodsel', type: 'category', label: 'biometan + biorest-gjodsel' },
      { id: 'oppdrett', type: 'company', label: 'Oppdrettsanlegg', ref: 'mowi-x' },
    ],
    edges: [],
  },
]

describe('normalizeKey', () => {
  it('lowercases, strips diacritics, collapses whitespace', () => {
    assert.equal(normalizeKey('  Anaerob   Nedbrytning '), 'anaerob nedbrytning')
    assert.equal(normalizeKey('Tønsberg'), 'tonsberg')
  })
})

describe('buildCuratedLookup', () => {
  it('keys curated coords by feature.key', () => {
    const lookup = buildCuratedLookup(geojson)
    assert.equal(lookup.size, 2)
    assert.deepEqual(lookup.get('anaerob-nedbrytning'), {
      coord: [10.32, 59.23], precision: 'exact_point', source: 'Den Magiske Fabrikken',
    })
  })
})

describe('resolveFlowCoordinates', () => {
  const lookups: FlowCoordLookups = {
    curated: buildCuratedLookup(geojson),
    aquacultureByRef: new Map([['mowi-x', [5.5, 62.1] as [number, number]]]),
  }
  const resolved = resolveFlowCoordinates(loops, lookups)

  it('returns one ResolvedFlowNode per loop node', () => {
    assert.equal(resolved.length, 4)
  })

  it('tier 1: curated feature matched by node id wins with its precision + source', () => {
    const n = resolved.find(r => r.nodeId === 'anaerob-nedbrytning')!
    assert.deepEqual(n.coord, [10.32, 59.23])
    assert.equal(n.precision, 'exact_point')
    assert.equal(n.source, 'Den Magiske Fabrikken')
    assert.equal(n.loopId, 'no-magiske-fabrikken')
  })

  it('tier 2: node.ref → aquaculture coord = exact_point when not curated', () => {
    const n = resolved.find(r => r.nodeId === 'oppdrett')!
    assert.deepEqual(n.coord, [5.5, 62.1])
    assert.equal(n.precision, 'exact_point')
    assert.match(n.source ?? '', /[Aa]kvakultur/)
  })

  it('tier 3: no curated + no aquaculture match → unknown, no coord', () => {
    const n = resolved.find(r => r.nodeId === 'biometan-biorest-gjodsel')!
    assert.equal(n.coord, undefined)
    assert.equal(n.precision, 'unknown')
  })
})

describe('summarizeCoverage', () => {
  it('counts resolved nodes per precision', () => {
    const lookups: FlowCoordLookups = {
      curated: buildCuratedLookup(geojson),
      aquacultureByRef: new Map([['mowi-x', [5.5, 62.1] as [number, number]]]),
    }
    const counts = summarizeCoverage(resolveFlowCoordinates(loops, lookups))
    assert.equal(counts.exact_point, 2)
    assert.equal(counts.kommune_centroid, 1)
    assert.equal(counts.unknown, 1)
    assert.equal(counts.estimated, 0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import=tsx --test tests/lib/flows/spatial.test.ts`
Expected: FAIL — `Cannot find module '../../../src/lib/flows/spatial'`.

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/flows/spatial.ts
import type { FlowNodeType, LoopFlows } from './types'

export type CoordinatePrecision = 'exact_point' | 'kommune_centroid' | 'estimated' | 'unknown'
export type LngLat = [number, number]

export type CuratedCoord = { coord: LngLat; precision: CoordinatePrecision; source: string }

export type FlowCoordLookups = {
  /** Keyed by node id (also matched against node.ref and normalized label). */
  curated: Map<string, CuratedCoord>
  /** Keyed by node.ref → exact site coordinate. Vestigial on current data (no node refs an aquaculture site). */
  aquacultureByRef: Map<string, LngLat>
}

export type ResolvedFlowNode = {
  loopId: string
  nodeId: string
  label: string
  type: FlowNodeType
  coord?: LngLat
  precision: CoordinatePrecision
  source?: string
}

const AQUACULTURE_SOURCE = 'Akvakulturregisteret (Fiskeridirektoratet)'

export function normalizeKey(s: string): string {
  return s
    .toLowerCase()
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/å/g, 'a')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

type CuratedFeature = {
  geometry?: { type?: string; coordinates?: unknown }
  properties?: { key?: string; precision?: string; source?: string }
}

export function buildCuratedLookup(geojson: { features?: CuratedFeature[] }): Map<string, CuratedCoord> {
  const map = new Map<string, CuratedCoord>()
  for (const f of geojson.features ?? []) {
    const key = f.properties?.key
    const coords = f.geometry?.coordinates
    if (!key || !Array.isArray(coords) || coords.length < 2) continue
    map.set(key, {
      coord: [Number(coords[0]), Number(coords[1])],
      precision: (f.properties?.precision as CoordinatePrecision) ?? 'unknown',
      source: f.properties?.source ?? '',
    })
  }
  return map
}

export function resolveFlowCoordinates(loops: LoopFlows[], lookups: FlowCoordLookups): ResolvedFlowNode[] {
  const resolved: ResolvedFlowNode[] = []
  for (const loop of loops) {
    for (const node of loop.nodes) {
      const base = { loopId: loop.loopId, nodeId: node.id, label: node.label, type: node.type }

      // Tier 1: curated — try node.ref, node.id, normalized label (first hit wins).
      const candidates = [node.ref, node.id, normalizeKey(node.label)].filter(Boolean) as string[]
      let hit: CuratedCoord | undefined
      for (const c of candidates) {
        hit = lookups.curated.get(c)
        if (hit) break
      }
      if (hit) {
        resolved.push({ ...base, coord: hit.coord, precision: hit.precision, source: hit.source })
        continue
      }

      // Tier 2: node.ref → aquaculture site → exact_point.
      const aqua = node.ref ? lookups.aquacultureByRef.get(node.ref) : undefined
      if (aqua) {
        resolved.push({ ...base, coord: aqua, precision: 'exact_point', source: AQUACULTURE_SOURCE })
        continue
      }

      // Tier 3: unknown.
      resolved.push({ ...base, precision: 'unknown' })
    }
  }
  return resolved
}

export function summarizeCoverage(resolved: ResolvedFlowNode[]): Record<CoordinatePrecision, number> {
  const counts: Record<CoordinatePrecision, number> = {
    exact_point: 0, kommune_centroid: 0, estimated: 0, unknown: 0,
  }
  for (const r of resolved) counts[r.precision] += 1
  return counts
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import=tsx --test tests/lib/flows/spatial.test.ts`
Expected: PASS — all describe-blocks green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/flows/spatial.ts tests/lib/flows/spatial.test.ts
git commit -m "feat(flows): add spatial coordinate resolver for circular flows"
```

---

### Task 2: Ren validator — `src/lib/flows/validate-coords.ts`

**Files:**
- Create: `src/lib/flows/validate-coords.ts`
- Test: `tests/lib/flows/validate-coords.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/lib/flows/validate-coords.test.ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { validateCircularNodes, ALLOWED_KINDS } from '../../../src/lib/flows/validate-coords'

function feature(props: Record<string, unknown>, coords: [number, number] = [10.5, 59.9]) {
  return { type: 'Feature', properties: props, geometry: { type: 'Point', coordinates: coords } }
}
const ok = { key: 'k1', label: 'L', kind: 'biogas_plant', country: 'no', precision: 'exact_point', source: 'Kilde X' }

describe('validateCircularNodes', () => {
  it('passes a well-formed collection', () => {
    const issues = validateCircularNodes({ type: 'FeatureCollection', features: [feature(ok)] })
    assert.deepEqual(issues, [])
  })

  it('flags missing key, missing source, invalid precision, invalid kind', () => {
    const issues = validateCircularNodes({
      type: 'FeatureCollection',
      features: [
        feature({ ...ok, key: '' }),
        feature({ ...ok, key: 'k2', source: '' }),
        feature({ ...ok, key: 'k3', precision: 'wild_guess' }),
        feature({ ...ok, key: 'k4', kind: 'spaceport' }),
      ],
    })
    const codes = issues.map(i => i.code).sort()
    assert.ok(codes.includes('missing_key'))
    assert.ok(codes.includes('missing_source'))
    assert.ok(codes.includes('invalid_precision'))
    assert.ok(codes.includes('invalid_kind'))
  })

  it('flags duplicate keys', () => {
    const issues = validateCircularNodes({
      type: 'FeatureCollection',
      features: [feature({ ...ok, key: 'dup' }), feature({ ...ok, key: 'dup' })],
    })
    assert.ok(issues.some(i => i.code === 'duplicate_key'))
  })

  it('flags non-Point geometry', () => {
    const issues = validateCircularNodes({
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: ok, geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] } }],
    })
    assert.ok(issues.some(i => i.code === 'not_point_geometry'))
  })

  it('flags coordinates outside the Nordic envelope (catches swapped lat/lng)', () => {
    // Swapped: [59.23, 10.32] → lng=59.23 > 35 → out of envelope.
    const issues = validateCircularNodes({
      type: 'FeatureCollection',
      features: [feature({ ...ok, key: 'swap' }, [59.23, 10.32])],
    })
    assert.ok(issues.some(i => i.code === 'coord_out_of_envelope'))
  })

  it('exposes the allowed-kinds vocabulary', () => {
    assert.ok(ALLOWED_KINDS.includes('biogas_plant'))
    assert.ok(ALLOWED_KINDS.includes('food_bank'))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import=tsx --test tests/lib/flows/validate-coords.test.ts`
Expected: FAIL — `Cannot find module '../../../src/lib/flows/validate-coords'`.

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/flows/validate-coords.ts
import type { CoordinatePrecision } from './spatial'

export const ALLOWED_KINDS = [
  'biogas_plant',
  'food_bank',
  'redistribution',
  'waste_source',
  'industrial_symbiosis',
  'processing',
  'agriculture',
  'energy_user',
] as const
export type CircularNodeKind = (typeof ALLOWED_KINDS)[number]

const PRECISIONS: CoordinatePrecision[] = ['exact_point', 'kommune_centroid', 'estimated', 'unknown']

// Nordic envelope: lng -25..35, lat 54..72. A swapped [lat,lng] like [59,10] lands
// lng=59 > 35 and is flagged.
const LNG_MIN = -25, LNG_MAX = 35, LAT_MIN = 54, LAT_MAX = 72

export type CoordIssueCode =
  | 'missing_key'
  | 'duplicate_key'
  | 'missing_source'
  | 'invalid_precision'
  | 'invalid_kind'
  | 'coord_out_of_envelope'
  | 'not_point_geometry'

export type CoordIssue = { code: CoordIssueCode; key?: string; message: string }

type Feature = {
  geometry?: { type?: string; coordinates?: unknown }
  properties?: Record<string, unknown>
}

export function validateCircularNodes(geojson: unknown): CoordIssue[] {
  const issues: CoordIssue[] = []
  const features = (geojson as { features?: Feature[] })?.features ?? []
  const seen = new Set<string>()

  for (const f of features) {
    const p = f.properties ?? {}
    const key = typeof p.key === 'string' ? p.key : ''

    if (!key) {
      issues.push({ code: 'missing_key', message: 'Feature mangler ikke-tom "key".' })
    } else if (seen.has(key)) {
      issues.push({ code: 'duplicate_key', key, message: `Duplikat key "${key}".` })
    } else {
      seen.add(key)
    }

    if (typeof p.source !== 'string' || p.source.trim() === '') {
      issues.push({ code: 'missing_source', key, message: `Feature "${key}" mangler "source".` })
    }
    if (!PRECISIONS.includes(p.precision as CoordinatePrecision)) {
      issues.push({ code: 'invalid_precision', key, message: `Feature "${key}" har ugyldig precision "${String(p.precision)}".` })
    }
    if (!(ALLOWED_KINDS as readonly string[]).includes(p.kind as string)) {
      issues.push({ code: 'invalid_kind', key, message: `Feature "${key}" har ugyldig kind "${String(p.kind)}".` })
    }

    if (f.geometry?.type !== 'Point') {
      issues.push({ code: 'not_point_geometry', key, message: `Feature "${key}" er ikke Point-geometri.` })
      continue
    }
    const c = f.geometry.coordinates
    if (!Array.isArray(c) || c.length < 2 || typeof c[0] !== 'number' || typeof c[1] !== 'number') {
      issues.push({ code: 'coord_out_of_envelope', key, message: `Feature "${key}" har ugyldige koordinater.` })
      continue
    }
    const [lng, lat] = c as [number, number]
    if (lng < LNG_MIN || lng > LNG_MAX || lat < LAT_MIN || lat > LAT_MAX) {
      issues.push({ code: 'coord_out_of_envelope', key, message: `Feature "${key}" [${lng}, ${lat}] er utenfor nordisk konvolutt (mulig byttet lat/lng).` })
    }
  }
  return issues
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import=tsx --test tests/lib/flows/validate-coords.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/flows/validate-coords.ts tests/lib/flows/validate-coords.test.ts
git commit -m "feat(flows): add circular-nodes geojson validator"
```

---

### Task 3: Kommune-sentroid-helper — `src/lib/map/kommune-centroid.ts`

**Files:**
- Create: `src/lib/map/kommune-centroid.ts`
- Test: `tests/lib/map/kommune-centroid.test.ts`

Brukes ved **kurering** (Task 4) for å regne sentroid av et `municipalities.geojson`-polygon når en node kun kan stedfestes til en kommune. Ikke en resolver-avhengighet.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/lib/map/kommune-centroid.test.ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { kommuneCentroid } from '../../../src/lib/map/kommune-centroid'

describe('kommuneCentroid', () => {
  it('returns [lng, lat] centroid of a square polygon', () => {
    const square = {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[10, 59], [11, 59], [11, 60], [10, 60], [10, 59]]],
      },
    }
    const [lng, lat] = kommuneCentroid(square)
    assert.ok(Math.abs(lng - 10.5) < 1e-6, `lng ${lng}`)
    assert.ok(Math.abs(lat - 59.5) < 1e-6, `lat ${lat}`)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import=tsx --test tests/lib/map/kommune-centroid.test.ts`
Expected: FAIL — `Cannot find module '../../../src/lib/map/kommune-centroid'`.

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/map/kommune-centroid.ts
import { centroid } from '@turf/turf'
import type { LngLat } from '../flows/spatial'

/** Centroid of a polygon/multipolygon feature as [lng, lat]. Curation-time helper. */
export function kommuneCentroid(feature: GeoJSON.Feature): LngLat {
  const c = centroid(feature as GeoJSON.Feature<GeoJSON.Geometry>)
  const [lng, lat] = c.geometry.coordinates as [number, number]
  return [lng, lat]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import=tsx --test tests/lib/map/kommune-centroid.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/map/kommune-centroid.ts tests/lib/map/kommune-centroid.test.ts
git commit -m "feat(map): add kommune-centroid turf helper for coordinate curation"
```

---

### Task 4: Kuratert datasett — `public/data/food-systems/circular-nodes.geojson`

**Files:**
- Create: `public/data/food-systems/circular-nodes.geojson`

**Dette er en datakurering-oppgave, ikke kode.** Regelen: stedfest kun noder du kan kildebelegge ærlig. Navngitte anlegg → `exact_point` med kildelenke. Kun-kommune → `kommune_centroid` (bruk `kommuneCentroid`-helperen mot `public/data/food-systems/no/municipalities.geojson`, oppgi kommunen i `source`). Region/nasjonal uten punkt → `estimated` (oppgi metode). Abstrakte kategorinoder (f.eks. `food-waste-manure`, `agriculture`) som ikke kan stedfestes ærlig → **utelat** (resolver gir `unknown`, tegnes ikke).

**Feature-schema (hver feature):**
- `geometry`: `Point`, `coordinates: [lng, lat]` (lng først!).
- `properties.key`: **node-`id`** fra `material-flows.json` (join-nøkkel). Unik.
- `properties.label`: lesbar etikett.
- `properties.kind`: én av `ALLOWED_KINDS` (`biogas_plant`, `food_bank`, `redistribution`, `waste_source`, `industrial_symbiosis`, `processing`, `agriculture`, `energy_user`).
- `properties.country`: `no` | `dk` | `se` | `fi`.
- `properties.precision`: `exact_point` | `kommune_centroid` | `estimated`.
- `properties.source`: ikke-tom kildebeskrivelse (anlegg/register/metode).

**Fullt arbeidet eksempel (kopier formen):**

```json
{
  "type": "FeatureCollection",
  "_meta": {
    "source": "Kuratert fra Norsk Biogassforening, Energinet.dk, Matsentralen, anleggslokasjoner",
    "updated": "2026-05",
    "note": "Presisjons-gradert: exact_point = kildebelagt anleggspunkt; kommune_centroid = sentroid via kommune-centroid-helper; estimated = regional metode. Abstrakte noder uten ærlig anker er utelatt."
  },
  "features": [
    {
      "type": "Feature",
      "properties": {
        "key": "anaerob-nedbrytning",
        "label": "Den Magiske Fabrikken (anaerob nedbrytning)",
        "kind": "biogas_plant",
        "country": "no",
        "precision": "exact_point",
        "source": "Den Magiske Fabrikken / Greve Biogass — anleggslokasjon Rygg, Tønsberg (norsk-biogassforening.no)"
      },
      "geometry": { "type": "Point", "coordinates": [10.3210, 59.2330] }
    },
    {
      "type": "Feature",
      "properties": {
        "key": "biometan-biorest-gjodsel",
        "label": "Biometan + biorest (Den Magiske Fabrikken)",
        "kind": "biogas_plant",
        "country": "no",
        "precision": "exact_point",
        "source": "Den Magiske Fabrikken — samlokalisert oppgraderingsanlegg, Tønsberg"
      },
      "geometry": { "type": "Point", "coordinates": [10.3210, 59.2330] }
    },
    {
      "type": "Feature",
      "properties": {
        "key": "jordbruk",
        "label": "Jordbruk (biorest-mottak, Vestfold)",
        "kind": "agriculture",
        "country": "no",
        "precision": "kommune_centroid",
        "source": "Kommune-sentroid Tønsberg (SSB municipalities.geojson) — biorest-spredning regionalt"
      },
      "geometry": { "type": "Point", "coordinates": [10.4080, 59.2700] }
    },
    {
      "type": "Feature",
      "properties": {
        "key": "surplus-food-from-retail-industry",
        "label": "Matsentralen Oslo (overskuddsmat-mottak)",
        "kind": "redistribution",
        "country": "no",
        "precision": "exact_point",
        "source": "Matsentralen Norge — Oslo-sentral, Alnabru (matsentralen.no)"
      },
      "geometry": { "type": "Point", "coordinates": [10.8260, 59.9270] }
    },
    {
      "type": "Feature",
      "properties": {
        "key": "food-banks",
        "label": "Matsentralen-nettverk (food banks)",
        "kind": "food_bank",
        "country": "no",
        "precision": "exact_point",
        "source": "Matsentralen Norge — Oslo-sentral, Alnabru (matsentralen.no)"
      },
      "geometry": { "type": "Point", "coordinates": [10.8260, 59.9270] }
    },
    {
      "type": "Feature",
      "properties": {
        "key": "symbiosis",
        "label": "Kalundborg Symbiosis",
        "kind": "industrial_symbiosis",
        "country": "dk",
        "precision": "exact_point",
        "source": "Kalundborg Symbiosis — Kalundborg, DK (symbiosis.dk)"
      },
      "geometry": { "type": "Point", "coordinates": [11.0900, 55.6800] }
    },
    {
      "type": "Feature",
      "properties": {
        "key": "power-plant",
        "label": "Asnæsværket (samlokalisert kraftverk)",
        "kind": "energy_user",
        "country": "dk",
        "precision": "exact_point",
        "source": "Kalundborg Symbiosis — Asnæsværket, Kalundborg"
      },
      "geometry": { "type": "Point", "coordinates": [11.1050, 55.6680] }
    },
    {
      "type": "Feature",
      "properties": {
        "key": "matavfall-slakteriavfall",
        "label": "Matavfall + slakteriavfall (Linköping)",
        "kind": "waste_source",
        "country": "se",
        "precision": "kommune_centroid",
        "source": "Tekniska verken Linköping — kommune-sentroid Linköping"
      },
      "geometry": { "type": "Point", "coordinates": [15.6200, 58.4100] }
    },
    {
      "type": "Feature",
      "properties": {
        "key": "biogass",
        "label": "Linköping biogass (Tekniska verken)",
        "kind": "biogas_plant",
        "country": "se",
        "precision": "exact_point",
        "source": "Tekniska verken — biogassanlegg Linköping (tekniskaverken.se)"
      },
      "geometry": { "type": "Point", "coordinates": [15.6210, 58.4080] }
    },
    {
      "type": "Feature",
      "properties": {
        "key": "matavfall-bioavfall",
        "label": "Matavfall + bioavfall (Vaasa-regionen)",
        "kind": "waste_source",
        "country": "fi",
        "precision": "kommune_centroid",
        "source": "Stormossen — kommune-sentroid Vaasa-regionen"
      },
      "geometry": { "type": "Point", "coordinates": [21.7000, 63.1000] }
    },
    {
      "type": "Feature",
      "properties": {
        "key": "biogass-biorest-som-godkjent-gjodsel",
        "label": "Stormossen biogass (Vaasa)",
        "kind": "biogas_plant",
        "country": "fi",
        "precision": "exact_point",
        "source": "Stormossen Oy — biogassanlegg Kvevlax, Vaasa (stormossen.fi)"
      },
      "geometry": { "type": "Point", "coordinates": [21.7400, 63.1300] }
    }
  ]
}
```

Kuratoren kan utvide med flere noder fra de plasserbare loopene (`dk-kalundborg` resterende noder, `nordic-gasum`, `se-linkoping`-resten) etter samme regler. **Minst** node-`id`-ene over (de navngitte anleggene) må være med, slik at guard-testen (Task 8) finner ≥ 4 `exact_point`.

- [ ] **Step 1: Lag filen** med eksempelet over som start, utvid med flere ærlig-kildebelagte noder fra de plasserbare loopene.

- [ ] **Step 2: Verifiser med validatoren**

Run:
```bash
node --import=tsx -e "import {readFileSync} from 'node:fs'; import {validateCircularNodes} from './src/lib/flows/validate-coords.ts'; const g=JSON.parse(readFileSync('public/data/food-systems/circular-nodes.geojson','utf8')); const i=validateCircularNodes(g); console.log(i.length?i:'OK: 0 issues, '+g.features.length+' features');"
```
Expected: `OK: 0 issues, <N> features` (hvis EPERM på sandbox-pipe, retry med sandbox disabled).

- [ ] **Step 3: Commit**

```bash
git add public/data/food-systems/circular-nodes.geojson
git commit -m "data: curate circular-nodes geojson (precision-graded, sourced)"
```

---

### Task 5: Leaflet-lag-bygger — `src/components/map/CircularFlowLayer.tsx`

**Files:**
- Create: `src/components/map/CircularFlowLayer.tsx`

Ren byggefunksjon (ingen React-render; bygger en `L.LayerGroup` imperativt, slik resten av `FoodMap` gjør). Ikke enhetstestet (krever `L` + DOM) — dekkes av `tsc` + Playwright-røyktest (Task 9).

- [ ] **Step 1: Implementér**

```tsx
// src/components/map/CircularFlowLayer.tsx
import L from 'leaflet'
import type { EvidenceStatus } from '@/lib/visualization/types'
import type { MaterialFlowsFile } from '@/lib/flows/types'
import type { AquacultureSite } from '@/lib/map/types'
import {
  buildCuratedLookup,
  resolveFlowCoordinates,
  normalizeKey,
  type CoordinatePrecision,
  type FlowCoordLookups,
  type LngLat,
  type ResolvedFlowNode,
} from '@/lib/flows/spatial'

// Matches MaterialFlowTab EVIDENCE_COLORS (Spec 2 palette).
const EVIDENCE_LINE_COLORS: Record<EvidenceStatus, string> = {
  observed: '#059669',
  estimated: '#d97706',
  proxy: '#0284c7',
  illustrative: '#a8a29e',
}

const PRECISION_STYLE: Record<Exclude<CoordinatePrecision, 'unknown'>, { color: string; dashArray?: string; label: string }> = {
  exact_point: { color: '#059669', label: 'Eksakt punkt' },
  kommune_centroid: { color: '#d97706', dashArray: '3 3', label: 'Kommune-sentroid' },
  estimated: { color: '#0284c7', dashArray: '1 4', label: 'Estimert' },
}

const KIND_LABELS: Record<string, string> = {
  biogas_plant: 'Biogassanlegg',
  food_bank: 'Matsentral',
  redistribution: 'Omfordeling',
  waste_source: 'Avfallskilde',
  industrial_symbiosis: 'Industriell symbiose',
  processing: 'Foredling',
  agriculture: 'Jordbruk',
  energy_user: 'Energimottaker',
}

const EVIDENCE_LABELS: Record<EvidenceStatus, string> = {
  observed: 'Observert',
  estimated: 'Estimert',
  proxy: 'Proxy',
  illustrative: 'Illustrativ',
}

export type BuildCircularFlowLayerOptions = {
  circularNodes: GeoJSON.FeatureCollection
  materialFlows: MaterialFlowsFile
  aquacultureSites: AquacultureSite[]
  country: string
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Loops shown on this country's map: country-prefixed loops + cross-border nordic loops. */
function loopShown(loopId: string, country: string): boolean {
  return loopId.startsWith(`${country}-`) || loopId.startsWith('nordic-')
}

export function buildCircularFlowLayer(opts: BuildCircularFlowLayerOptions): L.LayerGroup {
  const { circularNodes, materialFlows, aquacultureSites, country } = opts

  const aquacultureByRef = new Map<string, LngLat>()
  for (const site of aquacultureSites) {
    aquacultureByRef.set(normalizeKey(site.name), site.coordinates)
  }

  const lookups: FlowCoordLookups = {
    curated: buildCuratedLookup(circularNodes),
    aquacultureByRef,
  }

  const loops = materialFlows.loops.filter((l) => loopShown(l.loopId, country))
  const resolved = resolveFlowCoordinates(loops, lookups)

  // Index for edge endpoint lookup: `${loopId}::${nodeId}` → resolved node.
  const byKey = new Map<string, ResolvedFlowNode>()
  for (const r of resolved) byKey.set(`${r.loopId}::${r.nodeId}`, r)

  const group = L.layerGroup()

  // Polylines first (under markers): edges with both endpoints placed.
  for (const loop of loops) {
    for (const edge of loop.edges) {
      const from = byKey.get(`${loop.loopId}::${edge.fromId}`)
      const to = byKey.get(`${loop.loopId}::${edge.toId}`)
      if (!from?.coord || !to?.coord) continue
      const color = EVIDENCE_LINE_COLORS[edge.evidenceStatus] ?? EVIDENCE_LINE_COLORS.illustrative
      const line = L.polyline(
        [
          [from.coord[1], from.coord[0]],
          [to.coord[1], to.coord[0]],
        ],
        {
          color,
          weight: 2,
          opacity: 0.8,
          ...(edge.evidenceStatus === 'illustrative' ? { dashArray: '5 5' } : {}),
        },
      )
      const sources = edge.sourceRefs.map((s) => esc(s.label ?? '')).filter(Boolean).join(', ')
      line.bindPopup(`
        <div style="min-width:200px">
          <strong>${esc(edge.material)}</strong>
          ${edge.process ? `<br/><small>Prosess: ${esc(edge.process)}</small>` : ''}
          ${edge.rLevel ? `<br/><small>R-nivå: ${esc(edge.rLevel)}</small>` : ''}
          <br/><small style="color:${color}">● ${EVIDENCE_LABELS[edge.evidenceStatus] ?? edge.evidenceStatus}</small>
          ${sources ? `<br/><small>Kilder: ${sources}</small>` : ''}
        </div>
      `)
      line.addTo(group)
    }
  }

  // Markers: placed nodes (skip unknown). Dedup identical coords per node key.
  const drawn = new Set<string>()
  for (const r of resolved) {
    if (!r.coord || r.precision === 'unknown') continue
    if (drawn.has(`${r.loopId}::${r.nodeId}`)) continue
    drawn.add(`${r.loopId}::${r.nodeId}`)
    const style = PRECISION_STYLE[r.precision]
    const marker = L.circleMarker([r.coord[1], r.coord[0]], {
      radius: 7,
      fillColor: style.color,
      color: '#fff',
      weight: 2,
      fillOpacity: 0.9,
      ...(style.dashArray ? { dashArray: style.dashArray } : {}),
    })
    const kindLabel = KIND_LABELS[String((findKind(circularNodes, r.nodeId)) ?? '')] ?? ''
    marker.bindPopup(`
      <div style="min-width:200px">
        <strong>${esc(r.label)}</strong>
        ${kindLabel ? `<br/><small>${kindLabel}</small>` : ''}
        <br/><small style="color:${style.color}">● ${style.label}</small>
        ${r.source ? `<br/><small>Kilde: ${esc(r.source)}</small>` : ''}
      </div>
    `)
    marker.addTo(group)
  }

  return group
}

function findKind(geojson: GeoJSON.FeatureCollection, key: string): string | undefined {
  for (const f of geojson.features) {
    if ((f.properties as { key?: string } | null)?.key === key) {
      return (f.properties as { kind?: string }).kind
    }
  }
  return undefined
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: ingen NYE feil i `CircularFlowLayer.tsx` (kun den kjente urelaterte TS1501 i `tests/lib/insight-link-scripts.test.ts`).

- [ ] **Step 3: Commit**

```bash
git add src/components/map/CircularFlowLayer.tsx
git commit -m "feat(map): add buildCircularFlowLayer (precision markers + evidence polylines)"
```

---

### Task 6: Data-lasting + toggle — `MapContext.tsx`, `types.ts`, `LayerPanel.tsx`

**Files:**
- Modify: `src/lib/map/types.ts:3`
- Modify: `src/lib/map/MapContext.tsx`
- Modify: `src/components/map/LayerPanel.tsx:11-42,45,47-55`

- [ ] **Step 1: Legg `'circular-flows'` i `MapLayer`** (`src/lib/map/types.ts` linje 3)

Erstatt:
```typescript
export type MapLayer = 'stores' | 'boundaries' | 'aquaculture' | 'processing' | 'ports' | 'desert' | 'vulnerability' | 'properties' | 'logistics' | 'farms'
```
med:
```typescript
export type MapLayer = 'stores' | 'boundaries' | 'aquaculture' | 'processing' | 'ports' | 'desert' | 'vulnerability' | 'properties' | 'logistics' | 'farms' | 'circular-flows'
```

- [ ] **Step 2: `MapContext.tsx` — import-type**

Etter linje 11 (`import type { CountryConfig, CountryCode } from '@/lib/config/countries'`), legg til:
```typescript
import type { MaterialFlowsFile } from '@/lib/flows/types'
```

- [ ] **Step 3: `MapContext.tsx` — utvid context-typen**

I `type MapContextType = { ... }` (etter `companyProperties: GeoJSON.FeatureCollection | null`), legg til:
```typescript
  circularNodes: GeoJSON.FeatureCollection | null
  materialFlows: MaterialFlowsFile | null
```

- [ ] **Step 4: `MapContext.tsx` — state**

Etter `const [companyProperties, setCompanyProperties] = useState<GeoJSON.FeatureCollection | null>(null)`, legg til:
```typescript
  const [circularNodes, setCircularNodes] = useState<GeoJSON.FeatureCollection | null>(null)
  const [materialFlows, setMaterialFlows] = useState<MaterialFlowsFile | null>(null)
```

- [ ] **Step 5: `MapContext.tsx` — last topp-nivå data (ikke per-land)**

I reset-blokka (etter `setFarms([])`), legg til:
```typescript
    setCircularNodes(null)
    setMaterialFlows(null)
```

Utvid `optional`-arrayen (etter `farms`-linja) med to topp-nivå fetch (merk: IKKE `dataPath`, disse ligger på `/data/food-systems/`-rota):
```typescript
        optionalFetch('/data/food-systems/circular-nodes.geojson'),
        optionalFetch('/data/food-systems/material-flows.json'),
```

Utvid destrukturering i `.then(([...]) => {` til å inkludere de to nye (etter `farmData`):
```typescript
        .then(([storesData, municipalitiesData, geojsonData, aquaData, plantData, portData, hubData, farmData, circularNodesData, materialFlowsData]) => {
```

Etter `if (farmData) setFarms(parseFarms(farmData))`, legg til:
```typescript
          if (circularNodesData) setCircularNodes(circularNodesData)
          if (materialFlowsData) setMaterialFlows(materialFlowsData)
```

- [ ] **Step 6: `MapContext.tsx` — eksponer i value-memo**

I `const value = useMemo(() => ({ ... }))`, etter `companyProperties,`, legg til:
```typescript
    circularNodes,
    materialFlows,
```
og i memo-dependency-arrayen (siste arg), etter `companyProperties,`, legg til:
```typescript
    circularNodes, materialFlows,
```

- [ ] **Step 7: `LayerPanel.tsx` — toggle-rad**

I `BASE_LAYER_GROUPS` (etter `Analyse`-gruppa, før `]`), legg til en ny gruppe:
```typescript
  {
    label: 'Sirkularitet',
    layers: [
      { id: 'circular-flows', label: 'Sirkulære strømmer' },
    ],
  },
```

I destruktureringen (linje 45), legg til `circularNodes`:
```typescript
  const { activeLayers, toggleLayer, activeChains, toggleChain, stores, isLoading, aquacultureSites, processingPlants, ports, logisticsHubs, farms, vulnerabilityScores, companyProperties, countryConfig, circularNodes } = useMapContext()
```

I `hasData`-recorden, legg til:
```typescript
    'circular-flows': (circularNodes?.features?.length ?? 0) > 0,
```

- [ ] **Step 8: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: ingen nye feil.

- [ ] **Step 9: Commit**

```bash
git add src/lib/map/types.ts src/lib/map/MapContext.tsx src/components/map/LayerPanel.tsx
git commit -m "feat(map): load circular-nodes + material-flows, add circular-flows toggle"
```

---

### Task 7: Registrer laget i `FoodMap.tsx`

**Files:**
- Modify: `src/components/map/FoodMap.tsx:7-18,62-75,333-378`

- [ ] **Step 1: Importér byggefunksjonen**

Etter `import { getVulnerabilityColor } from '@/lib/map/vulnerability'` (linje 19), legg til:
```typescript
import { buildCircularFlowLayer } from './CircularFlowLayer'
```

- [ ] **Step 2: Legg til layer-ref**

Etter `const farmsRef = useRef<L.LayerGroup | null>(null)` (linje 69), legg til:
```typescript
  const circularFlowRef = useRef<L.LayerGroup | null>(null)
```

- [ ] **Step 3: Utvid context-destrukturering**

I `useMapContext()`-destruktureringen (linje 71-75), legg til `country`, `circularNodes`, `materialFlows`:
```typescript
  const {
    stores, geojson, activeLayers, activeChains, municipalities,
    aquacultureSites, processingPlants, ports, vulnerabilityScores,
    companyProperties, logisticsHubs, farms, setSelectedMunicipality, countryConfig,
    country, circularNodes, materialFlows,
  } = useMapContext()
```

- [ ] **Step 4: Legg til lag-`useEffect`** (etter Farms-`useEffect`, ca. linje 378, før "Food desert layer"-blokka)

```typescript
  // Circular material flows (spatial) — default-off layer
  useEffect(() => {
    if (!mapRef.current) return
    if (circularFlowRef.current) {
      mapRef.current.removeLayer(circularFlowRef.current)
      circularFlowRef.current = null
    }
    if (!activeLayers.includes('circular-flows') || !circularNodes || !materialFlows) return

    const layer = buildCircularFlowLayer({ circularNodes, materialFlows, aquacultureSites, country })
    layer.addTo(mapRef.current)
    circularFlowRef.current = layer

    return () => {
      if (mapRef.current && layer) mapRef.current.removeLayer(layer)
      circularFlowRef.current = null
    }
  }, [circularNodes, materialFlows, aquacultureSites, activeLayers, country])
```

- [ ] **Step 5: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: ingen nye feil. (`country` finnes i `MapContextType`; `buildCircularFlowLayer` matcher signaturen fra Task 5.)

- [ ] **Step 6: Commit**

```bash
git add src/components/map/FoodMap.tsx
git commit -m "feat(map): register circular-flows layer in FoodMap"
```

---

### Task 8: Guard-test + dekningsrapport

**Files:**
- Create: `tests/lib/flows/circular-nodes-guard.test.ts`

- [ ] **Step 1: Write the test**

```typescript
// tests/lib/flows/circular-nodes-guard.test.ts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { validateCircularNodes } from '../../../src/lib/flows/validate-coords'
import { buildCuratedLookup, resolveFlowCoordinates, summarizeCoverage } from '../../../src/lib/flows/spatial'
import type { MaterialFlowsFile } from '../../../src/lib/flows/types'

const ROOT = join(process.cwd(), 'public', 'data', 'food-systems')

function loadJson(file: string): unknown {
  return JSON.parse(readFileSync(join(ROOT, file), 'utf8'))
}

describe('circular-nodes.geojson guard', () => {
  const geojson = loadJson('circular-nodes.geojson') as GeoJSON.FeatureCollection
  const flows = loadJson('material-flows.json') as MaterialFlowsFile

  it('passes the validator with zero issues', () => {
    const issues = validateCircularNodes(geojson)
    assert.deepEqual(issues, [], `Coordinate issues:\n${JSON.stringify(issues, null, 2)}`)
  })

  it('every curated key matches a real node id in material-flows.json', () => {
    const nodeIds = new Set(flows.loops.flatMap((l) => l.nodes.map((n) => n.id)))
    const orphans = geojson.features
      .map((f) => (f.properties as { key?: string } | null)?.key)
      .filter((k): k is string => Boolean(k) && !nodeIds.has(k))
    assert.deepEqual(orphans, [], `Curated keys not present as node ids: ${orphans.join(', ')}`)
  })

  it('resolves enough exact points and reports coverage', () => {
    const lookups = { curated: buildCuratedLookup(geojson), aquacultureByRef: new Map() }
    const resolved = resolveFlowCoordinates(flows.loops, lookups)
    const coverage = summarizeCoverage(resolved)
    // Honest coverage report (printed, not silently truncated).
    console.log(
      `[circular-flows coverage] exact_point=${coverage.exact_point} ` +
        `kommune_centroid=${coverage.kommune_centroid} estimated=${coverage.estimated} unknown=${coverage.unknown}`,
    )
    assert.ok(coverage.exact_point >= 4, `Expected >=4 exact_point, got ${coverage.exact_point}`)
  })
})
```

- [ ] **Step 2: Run the guard test**

Run: `node --import=tsx --test tests/lib/flows/circular-nodes-guard.test.ts`
Expected: PASS + en `[circular-flows coverage] ...`-linje i output. Hvis den feiler på `exact_point >= 4`, gå tilbake til Task 4 og kurer flere navngitte anlegg.

- [ ] **Step 3: Commit**

```bash
git add tests/lib/flows/circular-nodes-guard.test.ts
git commit -m "test(flows): guard circular-nodes geojson + coverage report"
```

---

### Task 9: Full verifisering — suite, typecheck, lint, røyktest

**Files:** ingen (verifisering).

- [ ] **Step 1: Full test-suite**

Run: `npm test`
Expected: alle tester grønne (de tidligere 416 + de nye fra Task 1, 2, 3, 8). Ingen skips i `tests/lib/flows`.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: kun kjent urelatert TS1501 i `tests/lib/insight-link-scripts.test.ts`.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: ingen nye feil/advarsler i de endrede filene.

- [ ] **Step 4: Playwright røyktest på `/kart/no`**

Start dev (sjekk om en allerede kjører på en port; ikke start dobbelt), naviger til `/kart/no`, og verifiser:
1. Ingen console-feil ved last.
2. `LayerPanel` viser gruppa **«Sirkularitet»** med rad **«Sirkulære strømmer»** (forutsatt at `circular-nodes.geojson` har features).
3. Kryss av «Sirkulære strømmer» → markører + linjer tegnes uten console-feil; popups åpner.
4. Fjern krysset → laget forsvinner.

Bruk Playwright MCP (`browser_navigate`, `browser_snapshot`, `browser_console_messages`, `browser_click`). Hvis ingen dev kjører:
```bash
npm run dev
```
(noter porten; repoet har sett port 3001/3100 i bruk).

- [ ] **Step 5: Ingen commit** (verifisering). Hvis røyktesten avdekker feil, fiks i relevant task-fil og re-commit der.

---

## Self-Review

**1. Spec-dekning (mot `docs/superpowers/specs/2026-05-29-romlig-flytmodell-design.md` §3.1):**
- `CoordinatePrecision`, `LngLat`, `ResolvedFlowNode`, `FlowCoordLookups` → Task 1 ✓
- `resolveFlowCoordinates` 3-stige (kuratert → AquacultureSite exact_point → unknown) → Task 1 ✓ (tier 2 troskap mot spec; vestigial på dagens data — dokumentert i Datagrunnlag)
- `circular-nodes.geojson` FeatureCollection of Point med `{key,label,kind,country,precision,source}` → Task 4 ✓
- `validateCircularNodes(geojson): CoordIssue[]` → Task 2 ✓
- kommune-sentroid Turf-helper (kurerings-tid, ikke resolver-avhengighet) → Task 3 ✓
- CircularFlowLayer: presisjons-fargede markører (exact emerald / kommune amber-stiplet / estimated sky / unknown ikke tegnet) + evidens-stylede polylinjer (Spec 2-palett) + popups + default-av toggle + per-land → Task 5 + 7 ✓
- FoodMap-registrering + MapContext-lasting av circular-nodes + material-flows → Task 6 + 7 ✓
- Guard over committet geojson + dekningsrapport → Task 8 ✓

**2. Placeholder-skann:** Ingen «TBD»/«TODO»/«handle edge cases». All kode er konkret. Task 4 (kurering) er bevisst data-arbeid, men gir fullt schema + arbeidet eksempel + valideringskommando + akseptkriterium (≥4 exact_point via guard).

**3. Type-konsistens:** `LngLat`/`CoordinatePrecision`/`FlowCoordLookups`/`ResolvedFlowNode` defineres i Task 1 og importeres uendret i Task 2 (`CoordinatePrecision`), Task 3 (`LngLat`), Task 5 (alle), Task 8. `buildCuratedLookup`/`resolveFlowCoordinates`/`summarizeCoverage` har samme signatur i Task 1, 5, 8. `buildCircularFlowLayer(opts)` definert i Task 5 kalles med matchende `BuildCircularFlowLayerOptions` i Task 7. `MapLayer`-verdien `'circular-flows'` brukes konsistent i types/MapContext/LayerPanel/FoodMap. `MaterialFlowsFile.loops` + `LoopFlows.{nodes,edges}` + `FlowNode.{id,ref,label,type}` + `FlowEdge.{fromId,toId,material,process,rLevel,evidenceStatus,sourceRefs}` matcher `src/lib/flows/types.ts` (verifisert). `EVIDENCE_LINE_COLORS` matcher `MaterialFlowTab` `EVIDENCE_COLORS` (verifisert). `AquacultureSite.{name,coordinates}` matcher `src/lib/map/types.ts` (verifisert).

**4. Avvik dokumentert:** (a) `CircularFlowLayer` er en byggefunksjon, ikke react-leaflet-komponent — følger `FoodMap`s imperative mønster (begrunnet i Architecture). (b) Per-land-filter via loopId-prefiks (`<country>-` + `nordic-`) i stedet for en egen allow-list — deterministisk, gjenbruker eksisterende loopId-konvensjon. (c) Match på node-`id` som primær join-nøkkel (spec sa «ref/normalisert label»; `id` lagt til fordi 24/25 loops mangler `ref` og `id` er den stabile slug-en — `ref` + normalisert label beholdt som fallback, så spec-intensjonen er bevart).

---

## Execution Handoff

(fylles ut etter at planen er lagret — tilby subagent-driven vs. inline.)
