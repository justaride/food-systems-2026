# Food TG R12 Batch 12 report

**Dato:** 2026-06-24
**Goal:** Execute controlled Food TG Research OS Runde 12 batch 12.
**Batch:** `R12-ACTOR-005`, `R12-VIZ-003`, `R12-VIZ-004`, `R12-VIZ-005`
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 4 | `R12-ACTOR-005`, `R12-VIZ-003`, `R12-VIZ-004`, `R12-VIZ-005` |
| park | 0 | - |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R12-ACTOR-005 | Nordiske frø-, genressurs- og permakulturflater kan gi kontekstnoder med norsk kobling, men ikke et komplett nordisk aktøratlas. | KVANN, NordGen, Nordic Seed Alliance og Nordic Permaculture | Medlemslister, gårdslister, aktiv status og produksjonsdata er ikke åpne per aktør. | A/B med Type B/C-hull | Type B actor; Type C medlems-/produsentlister; Type A kildeuttrekk | actor-gate | Importer nettverk/prosjekter etter dedup; krev primærlokator per aktør. |
| R12-VIZ-003 | Kausalkartet kan bygges som hypotesekart med evidensstyrke per pil, ikke som målt kausalmodell. | R12-GOV-001, R12-VIZ-001 og R12 PCQ/source outputs | Piler fra struktur til faktisk effekt mangler ofte målt effektserie. | A/B/C blandet | Type C for målt kausal effekt; Type A syntese; Type B aktørmekanismer | forstaelse | Importer som internt hypotesekart; ingen ekstern kausalfigur uten merking/PCQ. |
| R12-VIZ-004 | Datagap kan visualiseres som egne funn når hver tomme celle har eier, gapType, gate og lukkekrav. | Batch 01-05 beslutningslogger og R12-VIZ-001 | Gaplisten er batchbasert, ikke full nordisk systematisk revisjon. | A/B/C blandet | Type A/B/C blandet med synlige Type C-funn | internal | Importer som intern datagapfigurflate; ikke ekstern figur uten scope/metode. |
| R12-VIZ-005 | R12 har flere figur-, tabell- og casekortkandidater, men alle må beholde gate/status og svakeste punkt. | Batch 01-05 beslutningslogger, R12-VIZ-003 og R12-VIZ-004 | Mange kandidater er PCQ/source-shortlist/actor-gate, ikke claim-lock. | A/B/C blandet | Type A/B/C per kandidat | internal | Importer som intern uttakskø; velg senere PCQ-/claim-lock-kort. |

## Per-target outcome

### R12-ACTOR-005 - ENRICH

Output: `research/_status/R12-ACTOR-005-nordisk-kontekst-med-norsk-kobling.md`

Verified/source-checked anchors:

- KVANN om oss: `https://kvann.no/om-oss/`
- NordGen Svalbard Global Seed Vault: `https://www.nordgen.org/our-work/svalbard-global-seed-vault/`
- NordGen Annual Review 2024 projects: `https://publication.nordgen.org/NordGen-Annual-Review-2024/projects.html`
- Nordic Seed Alliance events: `https://www.nordicseedalliance.org/events/`
- Nordic Permaculture: `https://nordicpermaculture.org/en`
- Nordic Permaculture Festival: `https://nordicpermaculturefestival.org/`
- Nordic Permaculture Festival 2023 event page: `https://event.checkin.no/57356/nordic-permaculture-festival`

Outcome: Good actor-gate context map. Network and project nodes are usable as context; individual actors remain unverified until primary locator and active status are checked.

### R12-VIZ-003 - ENRICH

Output: `research/forstaelse/R12-VIZ-003-kausalkart-l1-l5.md`

Source anchors:

- `research/forstaelse/R12-GOV-001-governance-impotens-sloyfen.md`
- `docs/project/mandates/R12-VIZ-001-datakrav-for-ledd-profil-visualisering.md`
- Batch 01-05 decision logs.

Outcome: Internal hypothesis/evidence table created. Piler are allowed only with evidence strength and caveat; no measured-causality claim opened.

### R12-VIZ-004 - ENRICH

Output: `docs/project/mandates/R12-VIZ-004-datagap-figur-underlag.md`

Source anchors:

- Batch 01-05 decision logs.
- `docs/project/mandates/R12-VIZ-001-datakrav-for-ledd-profil-visualisering.md`

Outcome: Internal datagap substrate created with visible Type A/B/C distinction and closure action per gap.

### R12-VIZ-005 - ENRICH

Output: `docs/project/mandates/R12-VIZ-005-whitepaper-og-deck-uttaksoversikt.md`

Source anchors:

- Batch 01-05 decision logs.
- `research/forstaelse/R12-VIZ-003-kausalkart-l1-l5.md`
- `docs/project/mandates/R12-VIZ-004-datagap-figur-underlag.md`

Outcome: Internal extraction queue created. Candidates are organized by format, maturity, gate and next control.

## Stop-regler som ble brukt

- Nordisk aktørkontekst ble ikke gjort til komplett atlas eller produsentregister.
- Kausalkartet ble ikke gjort til målt kausalmodell.
- Datagapfiguren ble ikke gjort til ekstern figur uten scope/metode.
- Uttaksoversikten ble ikke skrevet i whitepaper/deck-stemme og åpner ingen claim-lock.
