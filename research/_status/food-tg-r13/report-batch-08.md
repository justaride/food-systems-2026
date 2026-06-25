# Food TG R13 Batch 08 report

**Dato:** 2026-06-25
**Goal:** Execute controlled Food TG Research OS Runde 13 batch 08.
**Batch:** `R13-AKTOR-007`, `R13-AKTOR-008`, `R13-INNO-001`, `R13-INNO-002`
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 3 | `R13-AKTOR-008`, `R13-INNO-001`, `R13-INNO-002` |
| actor-gate | 1 | `R13-AKTOR-007` |
| park | 0 | - |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R13-AKTOR-007 | Skogshage/permakultur har kart- og nettverkslokatorer, ikke verifisert site-register. | Norsk Permakulturforening, KVANN, Agropub | Aktiv status per site mangler. | A/B locators; C inventory | Type B actor; Type C coverage | actor-gate | aktørspørsmål |
| R13-AKTOR-008 | Lokalmat-kanaler kan kartlegges, men volum og markedsandel er B/C. | Lokalmat.no, Bondens marked, REKO | Dedupe/volum/aktivstatus mangler. | A/B channels; C volume | Type A map; Type B/C dedupe | source-shortlist | importer |
| R13-INNO-001 | CEA-aktører finnes, men ambisjon/kapasitet/produksjon må skilles. | Avisomo, ONNA, Brreg, Euro Coop | Årsvolum og eierskap ikke lukket. | A/B actor/register; C volume | Type A status; Type B/C volume | source-shortlist | importer |
| R13-INNO-002 | Agrifoodtech-økosystemet har klyngeankre, ikke komplett funding-/effektledger. | NCE Heidner, AgriFoodTech Norway, Nordic Edge | Kapital/suksess er ikke fullstendig verifisert. | A/B cluster; C funding | Type A nodes; Type B/C capital | source-shortlist | importer |

## Per-target outcome

### R13-AKTOR-007 - ACTOR-GATE

Output: `research/_status/R13-AKTOR-007-skogshage-permakultur-sites.md`

Outcome: Actor-gate. Site-inventory krever per-site primærlocator og aktiv status.

### R13-AKTOR-008 - ENRICH

Output: `research/external/r13/R13-AKTOR-008-lokalmat-distribusjon.md`

Outcome: Source-shortlist. Kanaltyper og locators er nyttige; volum og produsenttotaler må ikke summeres.

### R13-INNO-001 - ENRICH

Output: `research/external/r13/R13-INNO-001-cea-vertikalt-landbruk.md`

Outcome: Source-shortlist. CEA-aktørledger kan brukes internt, men ikke som produksjonsclaim.

### R13-INNO-002 - ENRICH

Output: `research/external/r13/R13-INNO-002-agritech-okosystem.md`

Outcome: Source-shortlist. Økosystemkart er klart for kildekort, men funding-/effektdata må kontrolleres.

## Stop-regler som ble brukt

- Selvinnmeldte skogshage-/permakulturspor ble ikke gjort til verifisert site-register.
- Lokalmatkanaler ble ikke summert til markedsandel.
- CEA-kapasitet og partnerskap ble ikke gjort til realisert produksjon.
- Klyngetall og eksportprogram ble ikke gjort til suksessclaim.

## Må ikke visualiseres ennå

- `R13-AKTOR-007`: ingen nasjonalt skogshagekart uten site-verifikasjon.
- `R13-AKTOR-008`: ingen lokalmat-kanalfigur uten dedupe og volumcaveat.
- `R13-INNO-001`: ingen CEA-volumgraf uten realisert årsvolum.
- `R13-INNO-002`: ingen økosystem-/kapitalgraf uten kildeklasse per node.
