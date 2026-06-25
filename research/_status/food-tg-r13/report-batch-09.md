# Food TG R13 Batch 09 report

**Dato:** 2026-06-25
**Goal:** Execute controlled Food TG Research OS Runde 13 batch 09.
**Batch:** `R13-INNO-003`, `R13-INNO-004`, `R13-INNO-006`, `R13-INNO-005`
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 4 | `R13-INNO-003`, `R13-INNO-004`, `R13-INNO-006`, `R13-INNO-005` |
| actor-gate | 0 | - |
| park | 0 | - |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R13-INNO-003 | Funding-fit finnes i norske og nordiske/EU-virkemidler, men søkerrolle og topic-frister er ikke avklart. | Forskningsrådet IPN landbasert bioøkonomi 2026 | Søkerrolle, konsortium og EU topic-frister mangler. | A programme; B frames; C eligibility | Type A/B/C | internal | vent |
| R13-INNO-004 | Failure/survival-ledger kan føres per juridisk enhet, ikke som teknologidom. | Brreg/Konkursregisteret Restaurant Rest AS | Svenske og globale registerflater er ikke lukket. | A/B legal/register; C sector-cause | Type A register; Type B/C causality | source-shortlist | importer |
| R13-INNO-006 | Norske FoU-aktører har sterke prosjektlokatorer; Forskningsrådet er funder/enabler. | NIBIO Feed&Feeding; Ruralis CHEOPS | Prosjekt er ikke implementert resultat. | A project/institution; C impact | Type A project IDs; Type B actor roles; Type C impact | source-shortlist | importer |
| R13-INNO-005 | Konverteringsbarrierer kan kartlegges som mønstre, ikke generell sektorclaim. | CEPS/Rizos et al. 2021 | Enkeltcase generaliserer ikke alene. | A/B reviews/reports; C cases | Type A prevalence; Type B Nordic/case cause; Type C generalization | source-shortlist | importer |

## Per-target outcome

### R13-INNO-003 - ENRICH

Output: `docs/project/mandates/R13-INNO-003-finansiering-virkemidler.md`

Outcome: Internal. Virkemiddelmatrisen kan brukes som intern fit-/søknadsforberedelse, men ikke som påstand om kvalifisering eller søknadsanbefaling.

### R13-INNO-004 - ENRICH

Output: `research/external/r13/R13-INNO-004-failure-survival-ledger.md`

Outcome: Source-shortlist. Ledgeren kan brukes til kildekort med juridisk enhet, jurisdiksjon og asset-overlevelse synlig.

### R13-INNO-006 - ENRICH

Output: `research/external/r13/R13-INNO-006-fou-aktorer.md`

Outcome: Source-shortlist. FoU-aktørkartet er klart som kilde-/metodekandidat, men ikke som komplett økosystemkart eller effektdokumentasjon.

### R13-INNO-005 - ENRICH

Output: `research/external/r13/R13-INNO-005-konverteringsbarrierer.md`

Outcome: Source-shortlist. Barrieremønstrene kan løftes som research-kart når A-kilde og case-caveat vises sammen.

## Stop-regler som ble brukt

- Funding-fit ble ikke gjort til søknadsanbefaling eller eligibility-claim.
- Konkurs/insolvens ble ikke gjort til teknologidom.
- Prosjektlokatorer ble ikke gjort til implementerte resultater eller sektoradopsjon.
- Enkeltcase ble ikke generalisert til sektorbarriere.

## Må ikke visualiseres ennå

- `R13-INNO-003`: ingen funding-radar uten søkerrolle, frist og konsortium.
- `R13-INNO-004`: ingen failure-graf som beviser teknologi- eller sektortrend.
- `R13-INNO-006`: ingen FoU-økosystemkart som later som dekningen er komplett eller resultater implementert.
- `R13-INNO-005`: ingen barrieremodell uten A-kilde per mønster og single-case caveat.
