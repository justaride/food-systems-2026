# Food TG R13 Batch 05 report

**Dato:** 2026-06-25
**Goal:** Execute controlled Food TG Research OS Runde 13 batch 05.
**Batch:** `R13-PROT-001`, `R13-PROT-002`, `R13-PROT-003`, `R13-PROT-004`
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 4 | `R13-PROT-001`, `R13-PROT-002`, `R13-PROT-003`, `R13-PROT-004` |
| actor-gate | 0 | - |
| park | 0 | - |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R13-PROT-001 | Insektprotein er FoU/pilot/kapasitet/regulatorisk mulighet, ikke åpen realisert fôrvolumserie. | Invertapro, EØS/TSE, EU Novel Food, Nofima | Ingen realisert kommersiell årsvolumserie. | A/B status; C volum | Type A status; Type B/C volum | source-shortlist | importer |
| R13-PROT-002 | Single-cell har sterke teknologispor; Unibio har 24 tonn førsteforsendelse, Solar Foods er matprotein. | Unibio, Solar Foods, Nofima | Kapasitet og første shipment er ikke årlig realisert volum. | A/B status; C volum | Type A/B capacity; Type C volume | source-shortlist | importer |
| R13-PROT-003 | Musling/tang/tare lukkes som FoU- og datagapledger, ikke volumclaim. | FHF 901895, Nofima, Nordic Innovation | Potensial og FoU er ikke realisert fôrvolum. | A project; C commercial volume | Type A project; Type C volume | source-shortlist | importer |
| R13-PROT-004 | Plantebasert humanprotein har markedsankre, men ikke komplett åpen volum-/råvaretabell. | Nofima, NIBIO, Landbruksdirektoratet | Markedsandel og råvareopprinnelse er ikke koblet åpent. | A/B indicators; C full allocation | Type A/B market/crop; Type C linkage | source-shortlist | importer |

## Per-target outcome

### R13-PROT-001 - ENRICH

Output: `research/external/r13/R13-PROT-001-insektprotein.md`

Verified source anchors:

- Invertapro: `https://www.invertapro.com/`
- Invertapro feed page: `https://www.invertapro.com/en/for-til-produksjonsdyr`
- EØS/TSE insektsmel: `https://www.regjeringen.no/no/sub/eos-notatbasen/notatene/2017/juni/vet-tse-insektsmel-i-fiskefor/id2558190/`
- European Commission novel food insects: `https://food.ec.europa.eu/food-safety/novel-food/authorisations/approval-insect-novel-food_en`

Outcome: Source-shortlist. Aktør- og regulatorisk ledger styrket; volum fortsatt C/actor-gate.

### R13-PROT-002 - ENRICH

Output: `research/external/r13/R13-PROT-002-single-cell-fermentering.md`

Verified source anchors:

- Unibio 2021 shipment: `https://www.unibio.dk/news/press-release--unibio-makes-its-first-ever-commercial-shipment-of-uniprotein-r-in-europe-to-danish-agro`
- Solar Foods Factory 01: `https://solarfoods.com/solar-foods-factory-01-has-reached-its-productivity-targets/`
- Nofima protein digestibility: `https://nofima.com/projects/the-effect-of-process-on-protein-digestibility-in-salmon/`

Outcome: Source-shortlist. Teknologiberedskap styrket, men årlig realisert volum og mat/fôrstatus må holdes separat.

### R13-PROT-003 - ENRICH

Output: `research/external/r13/R13-PROT-003-musling-tang-tare.md`

Verified source anchors:

- FHF 901895 Mussel up: `https://www.fhf.no/prosjekter/prosjektbasen/901895/`
- Nofima nye arter/vekster: `https://nofima.no/forskning/ravarer-fra-havbruk-fiskeri-og-landbruk/mat-fra-nye-arter-vekster/`
- Nordic Innovation Local Fish Feed Ingredients: `https://www.nordicinnovation.org/programs/local-fish-feed-ingredients-competitive-and-sustainable-production-high-quality`

Outcome: Source-shortlist. R12-hullet er lukket som FoU-/datagapledger, ikke volumclaim.

### R13-PROT-004 - ENRICH

Output: `research/external/r13/R13-PROT-004-plantebasert-humanprotein.md`

Verified source anchors:

- Nofima plantedata: `https://kommunikasjon.ntb.no/pressemelding/18348215/norskproduserte-vegetarprodukter-i-framgang-men-nedgang-i-salget-totalt?lang=no&publisherId=9232871`
- NIBIO åkerbønner/erter: `https://www.nibio.no/nyheter/mange-muligheter-med-akerbonner-og-erter`
- Landbruksdirektoratet åkerbønner/erter/oljefrø: `https://www.landbruksdirektoratet.no/nb/filarkiv/rapporter/%C3%85kerb%C3%B8nner%2C%20erter%20og%20oljefr%C3%B8.%20Vurdering%20av%20tilskudd%20for%20%C3%A5%20%C3%B8ke%20norskandelen%20i%20matindustrien%20Rapport%202026%203%2016.pdf`

Outcome: Source-shortlist. Marked og råvarepotensial er bedre kartlagt; full volum-/råvarekobling mangler.

## Stop-regler som ble brukt

- Kapasitet, FoU og pilot ble ikke gjort til realisert volum.
- Matprotein og fôrprotein ble holdt adskilt.
- Prosjektpotensial for blåskjell ble ikke gjort til produksjonskapasitet.
- Asko-/Nofima-markedsindikatorer ble ikke gjort til totalmarked.

## Må ikke visualiseres ennå

- `R13-PROT-001`: ingen volumgraf for insektprotein uten realisert tonnasje.
- `R13-PROT-002`: ingen single-cell kapasitetsgraf som blander mat, fôr, plan og produksjon.
- `R13-PROT-003`: ingen marint-proteinvolumfigur uten å skille potensial, FoU og realisert volum.
- `R13-PROT-004`: ingen markedsandelsgraf uten datadekning og råvareopprinnelse.
