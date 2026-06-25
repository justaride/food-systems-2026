# Food TG R13 Batch 10 report

**Dato:** 2026-06-25
**Goal:** Execute controlled Food TG Research OS Runde 13 batch 10.
**Batch:** `R13-INNO-007`, `R13-OKO-001`, `R13-OKO-002`, `R13-OKO-003`
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 4 | `R13-INNO-007`, `R13-OKO-001`, `R13-OKO-002`, `R13-OKO-003` |
| actor-gate | 0 | - |
| park | 0 | - |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R13-INNO-007 | Offentlig etterspørsel finnes som anskaffelser og piloter, ikke skalert systemendring. | Bærum Smart Mat/LUP; Bærum/VIV Kortreist mat | Utfall, lokalmatandel og skalering mangler. | A owner/procurement; B programme; C seed | Type A awards; Type B outcomes; Type C media | source-shortlist | importer |
| R13-OKO-001 | Økologisk areal ligger rundt 4,5 % inkl. karens i 2025, under 10 %-målet for 2032. | SSB tabell 12661 | SSB/Debio avviker litt; produksjon er varegruppevis. | A area/target; A/B production | Type A reconciliation; Type B commodity tables | PCQ | importer |
| R13-OKO-002 | Måleprogrammer finnes, men ikke offentlig nasjonalt register for regenerative effekter per gård. | NIBIO JordVAAK/LSK-jord | Resultatverdier, gjentatte målinger og praksisattribusjon mangler. | A design; B pilot; C planned/not measured | Type A public values; Type B pilot validation; Type C planned | forstaelse | vent |
| R13-OKO-003 | JordVAAK/LSK gir sterke programkilder, men nasjonal målt baseline/trend er under bygging. | NIBIO JordVAAK og LSK-jord | Modellert karbon og målte SOC-trender må holdes adskilt. | A programme; B project; C model/not measured | Type A baseline outputs; Type B MRV; Type C terminology | PCQ | importer |

## Per-target outcome

### R13-INNO-007 - ENRICH

Output: `research/external/r13/R13-INNO-007-offentlig-innovasjon.md`

Outcome: Source-shortlist. Kan brukes som casekø for offentlige piloter og anskaffelser med tydelig pilot-/skaleringcaveat.

### R13-OKO-001 - ENRICH

Output: `research/external/r13/R13-OKO-001-okologisk-areal-produksjon.md`

Outcome: PCQ. Areal- og målradene er sterke, men SSB/Debio og karens/sertifisert må avstemmes før claim-lock.

### R13-OKO-002 - ENRICH

Output: `research/forstaelse/R13-OKO-002-agrookologisk-metrikk.md`

Outcome: Forstaelse. Bruk som metode-/datagapkart, ikke som effektpåstand.

### R13-OKO-003 - ENRICH

Output: `research/external/r13/R13-OKO-003-jordhelse-karbon.md`

Outcome: PCQ. Program- og indikatorradene kan kontrolleres videre, men baseline/trendclaims må vente.

## Stop-regler som ble brukt

- Pilot/anskaffelse ble ikke gjort til skalert kommunal implementering.
- Økologisk areal inkl. karens ble ikke gjort til sertifisert-only andel.
- Regenerativ metrikk ble ikke gjort til dokumentert effekt uten offentlig måling.
- Modellert karbon ble ikke gjort til målt karbon.

## Må ikke visualiseres ennå

- `R13-INNO-007`: ingen offentlig-innovasjonskart uten pilot/status/anskaffelsesutfall.
- `R13-OKO-001`: ingen økoarealfigur uten karens vs sertifisert og SSB/Debio-valg.
- `R13-OKO-002`: ingen regenerativ effektfigur uten offentlig baseline/resultatdata.
- `R13-OKO-003`: ingen jordkarbontrendfigur før målt baseline og gjentaksmåling finnes.
