# Food TG R12 Batch 08 report

**Dato:** 2026-06-24  
**Goal:** Execute controlled Food TG Research OS Runde 12 batch 08, one prompt at a time.  
**Batch:** `R12-FEED-004`, `R12-FEED-005`, `R12-WASTE-005`, `R12-DIST-003`  
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 4 | `R12-FEED-004`, `R12-FEED-005`, `R12-WASTE-005`, `R12-DIST-003` |
| park | 0 | - |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R12-FEED-004 | SSB 08801 gir kodeanker for soya og proteinkonsentrater, men SPC må ikke legges i HS 2304. | SSB 08801 API/metadata + UNSD HS 210610 | Kode viser ikke importør, resept, art eller om 210610 er soy-SPC. | A med C-hull | Type C sluttbruk/SPC; Type A kodeuttrekk | PCQ | Importer kodeledger; claim-lock bare for smal SSB-kodetekst etter PCQ. |
| R12-FEED-005 | Musling/tang/tare har gode FoU-ankre, men ikke åpen kommersiell volumserie. | FHF 901895 Mussel up | Realisert volum, kostnad og feed-producer-adopsjon er ikke åpent lukket. | A for prosjekt, C for volum | Type C kommersielt volum; Type B aktørdata | source-shortlist | Importer som teknologi-/kildekø med pilot/potensial-label. |
| R12-WASTE-005 | Prevention-tiltak kan shortlistes, men effekt krever baseline og målemetode. | Matvett KuttMatsvinn + Nordic Council Nord 2024:034 | Tiltak og anbefalinger kan ikke generaliseres uten scope/baseline. | A/B med C-hull | Type A metode; Type C harmonisert effektserie | source-shortlist | Importer tiltak-/metodekø; PCQ senere for tallfestet effekt. |
| R12-DIST-003 | NO/SE/FI har sterke EMV-kilder; DK/IS er gapfelt i denne batchen. | KT Dagligvarerapporten, Konkurrensverket EMV, KKV/FCCA 2025 | EMV-andel måles ulikt; DK/IS mangler fersk sammenlignbar primærkilde. | A for NO/SE/FI, B/C for DK/IS | Type C harmonisert serie; Type A/B DK follow-up | source-shortlist | Importer NO/SE/FI-ankre; hold DK/IS som synlige gap. |

## Per-target outcome

### R12-FEED-004 - ENRICH

Output: `research/external/r12/R12-FEED-004-soya-og-spc-koder.md`

Verified source anchors:

- SSB 08801 API/table hub: `https://data.ssb.no/api/v0/no/table/08801`
- SSB all countries and commodity numbers page: `https://www.ssb.no/utenriksokonomi/utenrikshandel/artikler/import-og-eksport-alle-land-og-varenummer`
- UNSD HS 210610 classification: `https://unstats.un.org/unsd/classifications/Econ/Detail/EN/32/210610`
- Landbruksdirektoratet Omverdenen 2024: `https://www.landbruksdirektoratet.no/nb/filarkiv/rapporter/Omverdenen%20til%20norsk%20landbruk%20og%20matindustri%20-%20rapport%20for%202024%20Rapport%202%202025.pdf`

Outcome: PCQ-ready code and gap memo. Useful finding is code separation: 2304 is soy oilcake/reststoff, while 210610 is protein concentrates/textured protein substances and still too broad for soy-SPC/end-use claims.

### R12-FEED-005 - ENRICH

Output: `research/external/r12/R12-FEED-005-musling-tang-og-tare.md`

Verified source anchors:

- FHF Mussel up 901895: `https://www.fhf.no/prosjekter/prosjektbasen/901895/`
- FHF new feed raw-material documentation call: `https://www.fhf.no/utlysninger/utlysninger/dokumentasjon-av-nye-forraavarer-sin-effekt-paa-ernaering-helse-og-kvalitet-hos-laksefisk/`
- Nofima new species/raw materials page: `https://nofima.no/forskning/ravarer-fra-havbruk-fiskeri-og-landbruk/mat-fra-nye-arter-vekster/`
- Nordic Innovation local fish feed project: `https://www.nordicinnovation.org/programs/local-fish-feed-ingredients-competitive-and-sustainable-production-high-quality`
- DTU project page: `https://orbit.dtu.dk/en/projects/local-raw-materials-for-production-of-fish-feed-for-aquaculture-3/`
- Nordic seaweed risk report: `https://pub.norden.org/temanord2022-564/1introduction.html`

Outcome: Source-shortlist candidate. Commercial volume and actual feed-recipe adoption remain parked as C/B gaps inside the output.

### R12-WASTE-005 - ENRICH

Output: `research/external/r12/R12-WASTE-005-prevention-tiltak-matsvinn.md`

Verified source anchors:

- Matvett KuttMatsvinn Servering: `https://www.matvett.no/bransje/matvett-in-english/kuttmatsvinn-servering-for-the-food-service-industry`
- Nordic Council of Ministers Nord 2024:034: `https://pub.norden.org/nord2024-034/about-this-publication.html`
- Nordic Council measuring/evaluating chapter: `https://pub.norden.org/nord2024-034/the-art-of-measuring-and-evaluating.html`
- EU publication on food waste prevention interventions: `https://op.europa.eu/en/web/eu-law-and-publications/publication-detail/-/publication/7c5f0088-a16e-11ef-85f0-01aa75ed71a1`
- JRC consumer intervention evaluation: `https://publications.jrc.ec.europa.eu/repository/handle/JRC133003`

Outcome: Source-shortlist and method queue. Prevention is usable as a catalogue only when baseline, period and measured effect stay visible.

### R12-DIST-003 - ENRICH

Output: `research/external/r12/R12-DIST-003-emv-og-leverandormakt-norden.md`

Verified source anchors:

- Konkurransetilsynet Dagligvarerapporten 2024: `https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25.pdf`
- Regjeringen.no EMV/vertikal integrasjon: `https://www.regjeringen.no/no/aktuelt/utredninger-av-egne-merkevarer-og-vertikal-integrasjon-i-dagligvaremarkedet/id2997249/`
- Konkurrensverket EMV report page: `https://www.konkurrensverket.se/informationsmaterial/rapportlista/handelns-egna-varumarken/`
- Konkurrensverket food-sector review: `https://www.konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2024-5.pdf`
- KKV/FCCA private-label report: `https://www.kkv.fi/uploads/sites/2/2025-03-tutkimusraportteja-kaupan-omat-merkit-eli-private-label-tuotteet-elintarvikemarkkinoilla.pdf`
- Danish retail/private-label analysis: `https://kfst.dk/media/2829/20140410-analyse-fremtidens-detailhandel.pdf`

Outcome: Source-shortlist with mismatch warnings. Norway, Sweden and Finland have strong authority anchors; Denmark and Iceland should remain gap/secondary fields until current primary sources are found.

## Stop-regler som ble brukt

- SPC ble ikke gjort til HS 2304 eller til ferdig sluttbruksclaim.
- Musling/tang/tare ble ikke gjort til kommersiell volumclaim uten primærserie.
- Prevention-effekt ble ikke generalisert fra programresultat eller anbefaling.
- EMV ble ikke rangert nordisk fordi måleenhet, år og kildetype ikke er harmonisert.
