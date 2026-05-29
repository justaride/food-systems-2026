# Romlig flytmodell (Spec 3a): sirkulære materialstrømmer på kart

- **Dato:** 2026-05-29
- **Status:** Design godkjent (brainstorming) — klar for implementeringsplan
- **Omfang:** Spec **3a** av to. Denne dekker det **romlige kart-laget**. Spec **3b** (DB `MaterialFlow`-migrasjon — gjøre flytene spørrbare i Prisma) er bevisst skilt ut til egen senere spec; 3a trenger den ikke (bygger på `material-flows.json`).
- **Linje:** Bygger på Spec 2 (`2026-05-29-sirkulaer-flytmodell-design.md`, PR #105/#107 — `FlowNode`/`FlowEdge`/`LoopFlows`, evidens-gradering) og Spec 1 (PR #104 — overclaim-gate/ærlighets-etos). Utløst av den kritiske analysen 2026-05-28 (romlig logistikk = topp-gap).

## 1. Bakgrunn og problem

Den kritiske analysen fant at **romlig logistikk-infrastruktur** er en topp-mangel: biogass-anlegg ligger langt fra avfallskildene, og omfordeling (Matsentralen/redistribusjon) er kjøletransport-/lokasjonsavhengig — så uten geografi kan man ikke koste eller vurdere sirkulær infrastruktur. Spec 2 ga strukturerte flyter (`material-flows.json`: `LoopFlows` med `FlowNode`/`FlowEdge`), men **nodene har ingen koordinater** og vises bare som ikke-romlig nettverksgraf/Sankey. 3a gir flytene ekte geografi på kart, slik at matsvinn↔biogass↔omfordeling-avstandene blir synlige — med ærlig signalisering av hvor presise posisjonene er.

Mye kart-infra finnes alt: `src/components/map/FoodMap.tsx` (Leaflet-choropleth + punktlag), `src/lib/map/MapContext.tsx` (per-land GeoJSON-lasting), punkt-datasett (`ports.geojson`, `aquaculture_sites.geojson` …), kommune-polygoner (`municipalities.geojson`, sentroid via Turf), `leaflet`/`react-leaflet`/`@turf/turf`.

## 2. Beslutninger låst i brainstorming

1. **Dekomponert:** 3a (kart) først; 3b (DB `MaterialFlow` + sync) senere egen spec.
2. **Kart-flate:** ekte Leaflet-kart — **utvid `FoodMap`** med et flyt-lag (korrekte avstander), ikke den stiliserte SVG-en.
3. **Koordinat-strategi:** hybrid stige + kurer nøkkel-noder + **presisjonsgrad** (en kommune-sentroid utgir seg aldri for et eksakt anlegg).
4. **Koordinat-hjem:** kuraterte **punkt-GeoJSON-datasett** (samme mønster som `ports`/`aquaculture`) + en ren resolver — ikke inline på `FlowNode`.

## 3. Arkitektur

### 3.1 Koordinat-datasett + ren resolver

Typer i `src/lib/flows/spatial.ts` (relative importer — test-importert modul):

```ts
export type CoordinatePrecision = 'exact_point' | 'kommune_centroid' | 'estimated' | 'unknown'
export type LngLat = [number, number] // [lng, lat] — samme konvensjon som eksisterende kart-data

export type ResolvedFlowNode = {
  loopId: string
  nodeId: string
  label: string
  type: FlowNodeType            // gjenbruk Spec 2
  coord?: LngLat                // undefined når precision === 'unknown'
  precision: CoordinatePrecision
  source?: string               // 'circular-nodes' | 'aquaculture' | 'kommune:NNNN'
}
```

**Kuratert datasett** `public/data/food-systems/circular-nodes.geojson` (`FeatureCollection` av `Point`, samme mønster som `ports.geojson`): hver feature har `properties: { key, label, kind, country, precision, source }`, der `key` matcher en flyt-nodes `ref` (aktør-slug) eller normalisert label. Feature-geometrien ER nodens koordinat; for kommune-nivå-noder bruker kuratoren en kommune-sentroid som det punktet (generert med en Turf-helper ved kurering) og setter `precision: 'kommune_centroid'`. `precision`/`source` er kuratorens ærlige gradering (`exact_point` for ekte anleggssted, `kommune_centroid` for sentroid-tilnærming).

**Ren resolver** `resolveFlowCoordinates(loops, lookups): ResolvedFlowNode[]` (avhengigheter injiseres → testbar):

```ts
export type FlowCoordLookups = {
  curated: Map<string, { coord: LngLat; precision: CoordinatePrecision; source: string }>  // key → feature fra circular-nodes.geojson
  aquacultureByRef: Map<string, LngLat>                                                     // node.ref → AquacultureSite-koordinat
}
```
Stige per node: **kuratert feature** (bruk dens `coord` + `precision` + `source`) → **`ref`→AquacultureSite** (`exact_point`) → **`unknown`** (ingen coord). Hver node får `precision` + `source`. En `FlowEdge` blir en kart-linje kun når *begge* endepunkter har coord. Abstrakte kategori-/prosess-noder uten kuratert feature blir ærlig `unknown` (uplassert) — dekningsrapporten (3.3) gjør graden av plassering transparent.

**Kurerings-helper** `kommuneCentroid(kommuneNr): LngLat` (Turf-sentroid av `municipalities.geojson`-polygon, i `src/lib/map/`) brukes *ved kurering* til å lage kommune-sentroid-koordinater for distribuerte kilder — testbar, men ikke en resolver-avhengighet.

All IO (lese GeoJSON, Turf-sentroider) ligger i loader/lag-kode; resolveren er ren.

### 3.2 `CircularFlowLayer` på FoodMap

Nytt **påskrubart Leaflet-lag** i `FoodMap` (samme mønster som havbruk/havner-lagene; **default av**).

- **Noder → markører:** `L.circleMarker` farget etter `CoordinatePrecision` — `exact_point` emerald (fylt), `kommune_centroid` amber (stiplet ring), `estimated` sky, `unknown` **ikke tegnet** (listet som «uplassert» i lag-panelet).
- **Kanter → flyt-linjer:** `L.polyline` mellom plasserte endepunkter, stylet etter `evidenceStatus` (samme palett som Spec 2-grafen: observed emerald / estimated amber / proxy sky / illustrative grå).
- **Popups (gjenbruk `Citation`-stil):** node → label + precision + source; kant → material + rLevel + evidenceStatus + `sourceRefs`.
- **Per land + lasting:** `FoodMap` er per land (`/kart/[country]`); laget viser noder som resolver til landet. `MapContext` laster `circular-nodes.geojson` + `material-flows.json`; resolveren kjøres klient-side med kommune-sentroider (Turf på allerede-lastet `municipalities.geojson`) + havbruk (allerede lastet).

Leaflet-tegningen er et tynt lag over resolverens rene output.

### 3.3 Ærlighet + validering

- **Presisjon + kilde** er ærlighets-mekanismen: vist via farge + tooltip; en kommune-sentroid ser tilnærmet ut og sier det.
- **Ren validator** `validateCircularNodes(geojson): CoordIssue[]` (test-først): hver feature har ikke-tom `source` + `key`; koordinater innenfor nordisk konvolutt (lat ~54–72, lng ~ -25–35, fanger byttet lng/lat); `kind` gyldig; `key` unik; `precision` ∈ de fire verdiene.
- **Resolver-invariant (test):** `exact_point` kun fra kuratert-punkt/entitet; `kommune_centroid` kun fra kommune-oppslag; `unknown` ⇒ ingen coord.
- **Guard-test** over committet `circular-nodes.geojson` (null blokkerende issues) + en **dekningsrapport** (`N exact / M kommune / K unknown` blant flyt-nodene) — transparent grad av tilnærming, kjører i `npm test`.
- **`unknown`/kanter:** uplasserte noder listes (ikke skjult); kanter med uplassert endepunkt tegnes ikke men **telles + rapporteres** (ingen stille kutt).

## 4. Dataflyt

```
material-flows.json (Spec 2: LoopFlows, noder uten coord)  ┐
circular-nodes.geojson (kuratert: key→coord/kommuneNr+precision+source) ┤
AquacultureSite-koordinater (eksisterende) ┤→ resolveFlowCoordinates(loops, lookups)
municipalities.geojson (Turf-sentroid for kommune-tier) ┘        │
                                                                 ▼
                                          ResolvedFlowNode[] (coord? + precision + source)
                                                                 │
                              ┌──────────────────────────────────┤
                              ▼                                   ▼
            CircularFlowLayer på FoodMap                 validateCircularNodes + guard
            (presisjons-markører + evidens-linjer,       (kilde/konvolutt/precision)
             per land, default-av toggle)                 + dekningsrapport (npm test)
```

## 5. Omfang (3a)

1. **Kurer `circular-nodes.geojson`** for nodene i matsvinn↔biogass↔omfordeling-loopene: biogass-anlegg (`no-magiske-fabrikken`/`se-biogas`/`nordic-gasum`/`dk-biogas`/`se-linkoping-biogas`/`fi-stormossen-vaasa`), Matsentralen/omfordeling (`no-matsentralen`, `nordic-tgtg`), nøkkel-avfallskilder. Slam-loopene (`no-akvakultur-slam`, `no-fiskeavfall`) via eksisterende AquacultureSite-koordinater. **Ikke** alle 25 loopers noder — resten resolver ærlig til `kommune_centroid`/`unknown`.
2. **Resolver + `CircularFlowLayer`** på FoodMap (per land, default-av).
3. **Validator + guard + dekningsrapport.**

## 6. Feilhåndtering / edge cases

- **`unknown`-node:** ikke tegnet; listet som «uplassert».
- **Kant med uplassert endepunkt:** ikke tegnet, men telt + rapportert.
- **Byttet/ugyldig koordinat:** fanget av nordisk-konvolutt-sjekken i validatoren.
- **Node matcher ingen feature/entitet:** `unknown` (fail-safe, ingen gjettet posisjon).
- **Manglende `circular-nodes.geojson`:** laget viser tom-tilstand; FoodMap ellers uendret.
- **Loop ikke relevant for landet:** filtreres ut av per-land-visningen.

## 7. Testing (test-først på de rene funksjonene)

- **Unit — `resolveFlowCoordinates`:** stigen (kuratert-punkt / kuratert-kommune→sentroid / ref→havbruk / unknown) + presisjons-stempling, fixtures med injiserte lookups.
- **Unit — `validateCircularNodes`:** sannhetstabell (mangler source, utenfor konvolutt, ugyldig kind, duplikat key, ugyldig precision, ren pass).
- **Unit — kommune-sentroid-helper:** Turf-sentroid av et polygon → forventet [lng,lat].
- **Guard** over committet `circular-nodes.geojson` + dekningsrapport (precision-tall). Kjører i `npm test` (find-basert glob fra PR #106 fanger `tests/lib/flows/*`).
- Ingen React-test-infra → `CircularFlowLayer` verifiseres via `npx tsc --noEmit` + de rene resolver/validator-testene; Playwright røyktest på `/kart/no` (flyt-toggle: 0 console-errors, markører + linjer rendrer).

Konvensjon (som Spec 1/2): test-importerte moduler (`src/lib/flows/*`) bruker relative **verdi**-importer; `import type` av `@/`-typer er erased og ufarlig. `FoodMap`/`MapContext`/`CircularFlowLayer` (komponenter) kan bruke `@/`.

## 8. Suksesskriterier

1. `circular-nodes.geojson` finnes, kuratert for matsvinn↔biogass↔omfordeling-loopene, hver feature kildebelagt + presisjons-gradert.
2. `resolveFlowCoordinates` plasserer flyt-noder via stigen med korrekt `precision`; `unknown` der ingen kilde.
3. `CircularFlowLayer` på `/kart/[country]` viser presisjons-fargede markører + evidens-stylede flyt-linjer (default-av toggle), 0 console-errors.
4. `validateCircularNodes`-guard + dekningsrapport kjører grønt i `npm test`; ingen kommune-sentroid presentert som `exact_point`.

## 9. Filer som berøres

**Nye:**
- `src/lib/flows/spatial.ts` (CoordinatePrecision/LngLat/ResolvedFlowNode/FlowCoordLookups + `resolveFlowCoordinates`)
- `src/lib/flows/validate-coords.ts` (`validateCircularNodes` + nordisk-konvolutt)
- `public/data/food-systems/circular-nodes.geojson` (kuratert)
- `src/components/map/CircularFlowLayer.tsx` (Leaflet-lag)
- tester: `tests/lib/flows/{spatial,validate-coords,kommune-centroid}.test.ts` + guard

**Endres:**
- `src/components/map/FoodMap.tsx` (registrer flyt-laget + toggle)
- `src/lib/map/MapContext.tsx` (last `circular-nodes.geojson` + `material-flows.json`)
- evt. en kommune-sentroid-helper i `src/lib/map/` (Turf)

## 10. Utenfor omfang

- **DB `MaterialFlow`-migrasjon (3b)** — egen spec.
- **Bred geokoding** av alle node-labels / `Company`-adresser (Company har ingen lat/lng).
- **Kryss-landegrense enkelt-kart** — kun per land (som dagens kart-UX).
- Ny sirkularitets-*innhold* — vi posisjonerer eksisterende flyter, utvider ikke korpuset.

## 11. Relaterte dokumenter

- Spec 2: `docs/superpowers/specs/2026-05-29-sirkulaer-flytmodell-design.md` (PR #105/#107)
- Spec 1: `docs/superpowers/specs/2026-05-29-datakvalitet-merking-design.md` (PR #104)
- Plan 2: `docs/superpowers/plans/2026-05-29-sirkulaer-flytmodell.md`
- Kritisk analyse: økt 2026-05-28 (romlig logistikk = topp-gap).
