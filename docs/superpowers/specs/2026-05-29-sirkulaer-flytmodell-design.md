# Sirkulær flytmodell: strukturerte, evidens-graderte materialstrømmer

- **Dato:** 2026-05-29
- **Status:** Design godkjent (brainstorming) — klar for implementeringsplan
- **Omfang:** Spec 2 av 2 i datakvalitet-/sirkularitetsarbeidet. Spec 1 (`2026-05-29-datakvalitet-merking-design.md`, levert i PR #104) ga et beregnet deknings-/evidens-primitiv + overclaim-gate.
- **Branch-uavhengighet:** Denne spec-en gjenbruker **pre-eksisterende** evidensvokabular (`EvidenceStatus`, `VisualizationSourceRef` i `src/lib/visualization/types.ts`; `NetworkEdge.evidenceStatus` i `src/lib/network-map.ts`; R-stigen i `src/lib/data/r-ladder.ts`) — **ikke** Spec 1s nye `src/lib/coverage/`-kode. Den kan derfor branche fra `main` og merges uavhengig av PR #104.

## 1. Bakgrunn og problem

Den kritiske analysen (2026-05-28) fant at **sirkularitet er prosjektets svakeste ledd relativt til viktighet**: det er dekket som *policy og ambisjon*, ikke som *målte materialstrømmer*. I dag har sirkularitet-ruten looper/gap/aktørcaser + en N/P/K-næringsflyt-fane, men flytene er **fritekst**: i `public/data/food-systems/circularity-loops.json` (25 looper, 37 gap) er `flow` en narrativ streng («Food waste + manure → anaerobic digestion → biogas + digestate → energy + fertilizer → agriculture») og `volume` en fritekst-streng («8100 GWh/yr»). Strukturert finnes bare `rLevel` (R0–R9), `value_chain_step[]` og `theme`.

Mye infrastruktur finnes allerede å bygge på: `FoodFlowSankey` tar `{nodes, links{source,target,value}}`; `SupplyChainGraph` (react-force-graph) tar `NetworkNode[]/NetworkEdge[]` der **`NetworkEdge` allerede har `evidenceStatus`**; `circular-leverage.ts` graderer `evidenceStatus` + `sourceRefs` per post. Tiltaket er derfor primært å **type prosaen + koble til eksisterende viz + grade evidens** — ikke et nybygg.

## 2. Beslutninger låst i brainstorming

1. **Omfang:** strukturer de eksisterende loopenes flyt → typede noder+kanter, **evidens-gradert**, **ikke-romlig**; gjenbruk `FoodFlowSankey` + `SupplyChainGraph`. Kart utsatt.
2. **Strukturering:** **bootstrap-parse alle 25 looper** (split `flow` på «→») + kuratert opprydding (fyll mengde/enhet/evidens/kilder).
3. **Evidens-håndheving:** **integritets-guard (test) + display-badges** — ikke CI/deploy-gate.
4. **Datamodell-hjem:** **sidecar `material-flows.json`** nøklet på `loopId` — rører ikke den merge-script-styrte loops-fila.

## 3. Arkitektur

### 3.1 Flyt-modellen + sidecar

Per-loop graf (selvstendige noder + kanter per loop). Typer i `src/lib/flows/types.ts`:

```ts
import type { EvidenceStatus, VisualizationSourceRef } from '@/lib/visualization/types' // import type → erased
import type { RLevel, ValueChainStep } from '@/lib/data/r-ladder' // eksakt eksport-navn verifiseres i planen

export type FlowNodeType = 'actor' | 'company' | 'location' | 'category' | 'process'

export type FlowNode = {
  id: string                  // stabil id i loopens graf, f.eks. 'husholdning', 'biogassanlegg'
  type: FlowNodeType
  label: string
  ref?: string                // valgfri slug → /aktorer|/selskap via CIRCULARITY_ACTOR_MAP
  valueChainStep?: ValueChainStep
}

export type FlowQuantity = { value: number; unit: string }   // 'GWh/år' | 't/år' | '%' | 'm³/år' …

export type FlowEdge = {
  id: string
  fromId: string              // FlowNode.id i samme loop
  toId: string
  material: string            // 'matavfall' | 'husdyrgjødsel' | 'biogass' | 'fiskeslam' …
  process?: string
  rLevel?: RLevel
  quantity?: FlowQuantity
  year?: number
  evidenceStatus: EvidenceStatus      // 'observed'|'estimated'|'proxy'|'illustrative'
  sourceRefs: VisualizationSourceRef[]
}

export type LoopFlows = { loopId: string; nodes: FlowNode[]; edges: FlowEdge[] }
export type MaterialFlowsFile = { generated: string; description: string; loops: LoopFlows[] }
```

**Sidecar:** `public/data/food-systems/material-flows.json` = `{ generated, description, loops: LoopFlows[] }`, lastet klient-side (samme mønster som `circularity-loops.json`/`nutrient-flows.json`).

Designvalg: noder er loop-skopede (enkelt for per-loop-viz + union); `quantity` valgfri (ikke alle kanter er kvantifisert); `evidenceStatus`+`sourceRefs` per kant er evidens-arven (samme vokabular som `circular-leverage.ts`).

### 3.2 Bootstrap-parser + kurering

**Ren parse-funksjon** `parseLoopFlow(loop): LoopFlows` i `src/lib/flows/parse.ts`:
- Splitter `flow` på «→» → én **node per segment**, **kant mellom påfølgende segmenter**.
- Node-type: default `category`; matcher segment-label en nøkkel i `CIRCULARITY_ACTOR_MAP` → `type:'actor'` + `ref`.
- `material` = kildenodens label (førstegjetning); `process` tom; arver loopens `rLevel` på kanter og `value_chain_step` på noder der utledbart.
- **Honest-by-construction:** skjeletter får `evidenceStatus:'illustrative'` og **ingen `quantity`** med mindre `parseVolume('8100 GWh/yr') → {value,unit}` gir trygg match. Loopens `sources[]` kopieres inn som `sourceRefs` (kun label). Parseren kan ikke overclaime; kurering løfter til `observed/estimated` *med* kilder.

**IO-wrapper** `scripts/bootstrap-material-flows.ts`: leser `circularity-loops.json`, kjører `parseLoopFlow` per loop, skriver `material-flows.json` **idempotent-additivt** — eksisterende (kuraterte) `loopId`-er overskrives aldri; kun manglende legges til. Trygt å re-kjøre.

**Kurering:** menneske redigerer `material-flows.json` (node-typer/`ref`, reelle `quantity`+enhet, løft `evidenceStatus`, ekte `sourceRefs`). Guard-en (3.4) håndhever.

### 3.3 Adapter + visualisering

**Ren adapter** `src/lib/flows/adapter.ts`:
- `toNetwork(loops): { nodes: NetworkNode[]; edges: NetworkEdge[] }` — **primær**. `FlowNode→NetworkNode` (id, label, type, `href` via `ref`+`CIRCULARITY_ACTOR_MAP`, `valueChainStage`); `FlowEdge→NetworkEdge` (source/target, `label`=material, **`evidenceStatus`**, `estimatedValue`=quantity?.value). Mates til eksisterende **`SupplyChainGraph`** — håndterer **sykler** (lukkede looper).
- `toSankey(loops): { nodes:[{name}]; links:[{source,target,value}] }` — **sekundær** «magnitude»-view for kvantifiserte kanter; til eksisterende **`FoodFlowSankey`** (Recharts). Sankey er asyklisk → lukke-kanten droppes her (grafen viser hele sirkelen).

**Plassering:** ny fane `flyt` i `src/app/sirkularitet/SirkularitetContent.tsx` (ved siden av matrix/…/naeringsflyt). Liten ny wrapper `MaterialFlowTab`: fetcher `material-flows.json`, loop-velger (én/«alle»), rendrer nettverksgraf (primær) + Sankey (kvantifisert) + evidens-legende + kilde-detalj per kant via eksisterende **`Citation`**-komponent. Selve grafene er gjenbruk.

**Honest viz:** kant-farge/-stil drives av `evidenceStatus` — `illustrative` *ser* svakere ut enn `observed` (synlig motstykke til guard-en).

### 3.4 Integritets-guard

**Ren validator** `validateMaterialFlows(file): FlowIssue[]` i `src/lib/flows/validate.ts`. Regler:
- `observed`-kant ⇒ ≥1 **citerbar** kilde (`citationReadiness` citable_* eller url/path); `estimated`/`proxy` ⇒ ≥1 `sourceRef`; `illustrative` ⇒ ingen krav.
- kant med `quantity` ⇒ ikke-tom `unit`.
- `fromId`/`toId` løser til en node i samme loop.
- `rLevel` (hvis satt) ∈ R0..R9; node-`ref` (hvis satt) finnes i `CIRCULARITY_ACTOR_MAP` (warning).
- `loopId` finnes i `circularity-loops.json` (ingen fantom-looper).

Håndhevet av en **guard-test** (`tests/lib/flows/guard.test.ts`) som kjører validatoren over *faktisk committet* `material-flows.json` → null blokkerende issues. Kjører i `npm test`; *ikke* CI/deploy-gate.

## 4. Dataflyt

```
circularity-loops.json (25 looper, fritekst flow/volume)
   │  scripts/bootstrap-material-flows.ts (parseLoopFlow + parseVolume, idempotent-add)
   ▼
material-flows.json (LoopFlows[]: noder+kanter, illustrative-skjeletter)
   │  kuratert runde (mengde/enhet/evidens/kilder)
   ▼
material-flows.json (kuratert) ──► adapter.toNetwork ──► SupplyChainGraph (primær, sykler, evidens-farget)
   │                              └► adapter.toSankey  ──► FoodFlowSankey (kvantifisert magnitude)
   │                                                        begge i `flyt`-fanen i sirkularitet-ruten
   ▼
validateMaterialFlows ── guard-test (npm test) ──► null blokkerende issues
```

## 5. Juni-omfang

1. Bootstrap **alle 25** looper → skjeletter (`illustrative`, ingen overclaim).
2. Kurer **de whitepaper-relevante først** — konkret: loopene referert av `circular-leverage.ts` via `relatedLoopIds` (~10 stk) → løft til `observed/estimated` med reelle tall + kilder. Resten forblir ærlig-svake `illustrative`-skjeletter til kurert (guard passerer uansett).
3. Adapter + `flyt`-fane (nettverk + Sankey).

## 6. Feilhåndtering / edge cases

- **Sykler:** nettverksgrafen håndterer dem; `toSankey` dropper lukke-kanten (Sankey er asyklisk) og logger hvilke kanter som ble utelatt.
- **Ukvantifiserte kanter:** vises i nettverksgrafen uten tall, men **ekskluderes fra Sankey** (som kun viser kvantifiserte strømmer). Ikke en feil.
- **Dinglende `fromId`/`toId`:** blokkerende guard-issue.
- **Parse-skjelett:** alltid `illustrative` + ingen `quantity` → guard krever ingenting før kurering løfter det.
- **Manglende `material-flows.json`:** `flyt`-fanen viser tom-tilstand (samme mønster som SirkularitetContent når data mangler).

## 7. Testing (test-først på de rene funksjonene)

- **Unit — `parseLoopFlow`/`parseVolume`:** split-på-«→», node/kant-bygging, actor-ref-deteksjon, `illustrative`-default, volum-parse-caser («8100 GWh/yr», «92.3% return rate», ikke-parsbar → ingen quantity).
- **Unit — `validateMaterialFlows`:** sannhetstabell (observed-uten-kilde, quantity-uten-enhet, dinglende ref, ugyldig rLevel, ren pass).
- **Unit — `toNetwork`/`toSankey`:** `LoopFlows`-fixture → forventet form, inkl. Sankey sykkel-droppe-oppførsel.
- **Guard:** `validateMaterialFlows` over committet `material-flows.json` → null blokkerende.
- Ingen React-test-infra → `MaterialFlowTab` verifiseres via `npx tsc --noEmit` + de rene adapter-testene (tynt render-lag).

Konvensjon (samme som Spec 1): moduler importert av tester (`src/lib/flows/*`) bruker relative **verdi**-importer; `import type` av `@/`-typer er ufarlig (erased). Komponenter/scripts kan bruke `@/`.

## 8. Suksesskriterier

1. `material-flows.json` finnes med strukturerte `LoopFlows` for alle 25 looper (bootstrap), de ~10 whitepaper-relevante kuratert til `observed/estimated` med kilder.
2. `flyt`-fanen i sirkularitet-ruten viser nettverksgraf (evidens-farget) + Sankey, drevet av `material-flows.json`.
3. `validateMaterialFlows` håndhever integritet; guard-testen passerer i `npm test`.
4. Ingen parse-skjelett presenteres sterkere enn `illustrative` uten kilde.

## 9. Filer som berøres

**Nye:**
- `src/lib/flows/{types,parse,adapter,validate}.ts`
- `scripts/bootstrap-material-flows.ts`
- `public/data/food-systems/material-flows.json` (generert + kuratert)
- `src/components/charts/MaterialFlowTab.tsx` (wrapper rundt SupplyChainGraph + FoodFlowSankey)
- tester: `tests/lib/flows/{parse,validate,adapter,guard}.test.ts`

**Endres:**
- `src/app/sirkularitet/SirkularitetContent.tsx` (ny `flyt`-fane + tab-knapp)
- evt. `package.json` (`bootstrap-material-flows`-script)

## 10. Utenfor omfang

- **Romlig kobling / kart** (matsvinn↔biogass↔omfordeling via FoodFlowMap) — krever kuratert koordinat-datasett; egen runde etter juni.
- **DB `MaterialFlow`-tabell** — spørrbar/graf-koblet; sammen med den romlige utvidelsen, ikke juni.
- **Generalisering av `NutrientFlowsView`** til den nye modellen — N/P/K-fanen står som den er; en evt. sammenslåing er en senere opprydding.
- Ny sirkularitets-*innhold* (nye looper/gap) — vi strukturerer det eksisterende, ikke utvider korpuset.

## 11. Relaterte dokumenter

- Spec 1: `docs/superpowers/specs/2026-05-29-datakvalitet-merking-design.md` (PR #104)
- Plan 1: `docs/superpowers/plans/2026-05-29-datakvalitet-merking.md`
- Kritisk analyse: økt 2026-05-28 (database/bibliotek/dekning).
