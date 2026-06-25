# Food TG R13 Batch 02 report

**Dato:** 2026-06-25
**Goal:** Execute controlled Food TG Research OS Runde 13 batch 02.
**Batch:** `R13-GAP-004`, `R13-GAP-006`, `R13-GAP-003`, `R13-WASTE-002`
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 3 | `R13-GAP-004`, `R13-GAP-003`, `R13-WASTE-002` |
| actor-gate | 1 | `R13-GAP-006` |
| park | 0 | - |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R13-GAP-004 | Alternative fôrproteiner er mest kapasitet/plan/pilot; realisert fôr-grade årsvolum er ikke offentlig lukket. | Enorm, Invertapro, Solar Foods, Unibio | Mangler realisert fôrvolum og faktisk substitusjon i fôr. | A/B/C per actor row | Type A kapasitet; Type B/C volum | source-shortlist | importer |
| R13-GAP-006 | R12 C-hull er delt i Type A desk-uttak, Type B actor-gate og ekte Type C. | R12 intake JSONL/MD | Intern syntese, ikke primærkilde. | internal R12 triage synthesis | Type A/B/C reclassification | actor-gate | aktørspørsmål |
| R13-GAP-003 | Transport/lager kan være matrelevant risikoinventar, men ikke tallfestet kapasitetsmodell. | OE 60-2023, FFI, Riksrevisjonen, nordiske beredskapskilder | Dagsdekning, lager og kjølekapasitet er ikke åpent tallfestet. | A qualitative, C capacity | Type A extraction; Type B/C capacity | source-shortlist | importer |
| R13-WASTE-002 | Oppdrettsslam er godt dokumentert som ressurs/problem; nasjonal realisert massebalanse mangler. | NIBIO, SINTEF OppSlam, FHF, Miljødirektoratet | Modellert utslipp, potensiell oppsamling og faktisk innsamlet volum må ikke blandes. | A with Type C gaps | Type A method; Type B operator; Type C national series | PCQ | importer |

## Per-target outcome

### R13-GAP-004 - ENRICH

Output: `research/external/r13/R13-GAP-004-alternative-nordiske-forproteiner.md`

Verified source anchors:

- Enorm Biofactory: `https://enormbiofactory.com/`
- Invertapro: `https://www.invertapro.com/`
- Solar Foods: `https://solarfoods.com/`
- Unibio news: `https://www.unibio.dk/news`

Outcome: Source-shortlist. Actor ledger strengthened, but all realisert fôr-grade volum remains C/actor-gate.

### R13-GAP-006 - ACTOR-GATE

Output: `research/forstaelse/R13-GAP-006-type-c-eskalering.md`

Source anchors:

- `research/_status/food-tg-r12/r12-intake-index-2026-06-24.jsonl`
- `research/_status/food-tg-r12/r12-intake-index-2026-06-24.md`

Outcome: Actor-gate queue and Type A/B/C reclassification. This is internal triage, not external evidence.

### R13-GAP-003 - ENRICH

Output: `research/external/r13/R13-GAP-003-transport-lager-sarbarhet.md`

Verified source anchors:

- OE report 60-2023: `https://www.regjeringen.no/contentassets/2617bce77a8240c784c5b4a1d55c12fd/oe-rapport-60-2023-med-vedlegg.pdf`
- Riksrevisjonen matsikkerhet: `https://www.riksrevisjonen.no/rapporter-mappe/no-2023-2024/matsikkerhet-og-beredskap-pa-landbruksomradet/`
- FFI 26/010 and Nordic preparedness sources

Outcome: Source-shortlist risk inventory with explicit C fields for capacities and stocks.

### R13-WASTE-002 - ENRICH

Output: `research/external/r13/R13-WASTE-002-oppdrettsslam-massebalanse.md`

Verified source anchors:

- NIBIO Fiskeslam: `https://www.nibio.no/tema/jord/organisk-avfall-som-gjodsel/fiskeslam`
- NIBIO fosfortap: `https://www.nibio.no/nyheter/store-fosfortap-i-norsk-akvakultur`
- SINTEF OppSlam: `https://www.sintef.no/en/projects/2025/oppslam-calculation-model-for-emission-and-collection-of-sludge-from-fish-farms-at-sea/`
- FHF 910382: `https://www.fhf.no/prosjekter/prosjektbasen/910382/`

Outcome: PCQ/datgap. Good method anchors; actual collected volume must go to actor-gate.

## Stop-regler som ble brukt

- Kapasitet ble ikke gjort til realisert fôrprotein.
- R12 C-hull ble ikke "fikset" uten ny locator.
- Kvalitative transportnoder ble ikke tallfestet.
- Modellert oppdrettsslamutslipp ble ikke gjort til faktisk innsamlet volum.

## Må ikke visualiseres ennå

- `R13-GAP-004`: ingen aktørgraf som viser volum uten at realisert/kapasitet/plan er skilt.
- `R13-GAP-003`: ingen sårbarhetskart med dagsdekning/lagerkapasitet som ikke er åpent dokumentert.
- `R13-WASTE-002`: ingen massebalansefigur som blander modellert, oppsamlet og behandlet volum.
