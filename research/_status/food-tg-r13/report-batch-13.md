# Food TG R13 Batch 13 report

**Dato:** 2026-06-25
**Goal:** Execute controlled Food TG Research OS Runde 13 batch 13.
**Batch:** `R13-LAND-004`, `R13-LAND-006`
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 2 | `R13-LAND-004`, `R13-LAND-006` |
| actor-gate | 0 | - |
| park | 0 | - |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R13-LAND-004 | Datagap-atlaset sorterer Type A/B/C-hull, men er intern kontrollkø. | R13 batchrapporter/decisions | Ingen selvstendig kildeverdi. | Internal only | Type A desk; Type B actor; Type C no locator | internal | vent |
| R13-LAND-006 | Figurkandidater må bli små kontrollfigurer med gate/metode/tomme celler synlig. | R13 decisions/intake-index | Figurkøen er ikke datagrunnlag. | Internal only | Type A figurskjema; Type B actor inputs; Type C blandet radar | internal | vent |

## Per-target outcome

### R13-LAND-004 - ENRICH

Output: `docs/project/mandates/R13-LAND-004-datagap-atlas.md`

Outcome: Internal. Atlaset kan styre videre kontrollarbeid, men skal ikke visualiseres eller importeres som faktakilde.

### R13-LAND-006 - ENRICH

Output: `docs/project/mandates/R13-LAND-006-figurkandidater.md`

Outcome: Internal. Figurkøen er en stoppliste og prioriteringsflate, ikke en åpning for deck/whitepaper.

## Stop-regler som ble brukt

- Datagap ble ikke gjort til fraværspåstand.
- Figurkandidater ble ikke åpnet som eksterne visualiseringer.
- Interne synteser ble ikke gjort til kildegrunnlag.

## Må ikke visualiseres ennå

- `R13-LAND-004`: ingen datagap-atlasfigur før Type A/B/C, gate og neste handling vises.
- `R13-LAND-006`: ingen radar/rangering/spider chart uten radvis kildeklasse, metode og tomme celler.
