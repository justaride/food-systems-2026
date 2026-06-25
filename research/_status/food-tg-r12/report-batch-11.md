# Food TG R12 Batch 11 report

**Dato:** 2026-06-24  
**Goal:** Execute controlled Food TG Research OS Runde 12 batch 11.  
**Batch:** `R12-GOV-003`, `R12-GOV-004`, `R12-GOV-005`, `R12-VIZ-002`  
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 4 | `R12-GOV-003`, `R12-GOV-004`, `R12-GOV-005`, `R12-VIZ-002` |
| park | 0 | - |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R12-GOV-003 | Nordiske konkurransemyndigheter har A-kildebare fusjons-/oppkjopsterskler og noen underterskelverktøy, men ingen felles vedtatt dagligvare- eller EMV-spesifikk terskel ble funnet. | KT fusjonsside, Swedish Competition Act, KFST merger page, FCCA Towercast/call-in analysis | EMV-spesifikke regler er hovedsakelig kartlegging/analyse, ikke vedtatt nordisk forbudsgrense. | A med C-felt | Type A for lov-/kildeuttrekk; Type C for felles EMV-terskel | source-shortlist | Importer som terskel-/virkemiddelmatrise, ikke claim-lock. |
| R12-GOV-004 | Implementeringsbarrierer kan shortlistes som kapital, energi/drift, regulering/areal, aksept og skaleringsrisiko; konkurs/pause beviser ikke teknologisvikt. | KSV Infarm trustee report, GU Ventures/Mycorena, Glaros et al. 2024, CFS Network white paper | Plantagon og Rest mangler trygg primær/entity-match; casekilder forklarer ikke hele årsaksbildet. | B med A/C-felt | Type A for primær case-follow-up; Type B actor economics; Type C entity mismatch | source-shortlist | Importer barrierematrise; parker Plantagon/Rest-rader til primærlokator/entity-match. |
| R12-GOV-005 | Relevante finansieringshorisonter finnes, men bare hvis de styrker uavhengig analyse, kildekontroll og datagap. | Innovasjon Norge Bionova + Forskningsrådet Land-based Bioeconomy 2026 | Søkerrolle, partnere, eligibility og frister er ikke besluttet. | A med B/C fit-felt | Type A for call follow-up; Type B for partner/rolle; Type C for fit | internal | Importer som intern funding-fit matrix; ingen søknadsanbefaling. |
| R12-VIZ-002 | Spider/radar kan brukes internt hvis score uten kilde er tom/null som missing evidence og C-felt tegnes synlig. | R12-VIZ-001 + batch 01-05 beslutningslogger | R12-output er ikke harmonisert scoregrunnlag og flere akser er actor-gate/C. | Internal med C-felt | Type A/B/C blandet | internal | Importer modellspesifikasjon; ingen ekstern radarfigur. |

## Per-target outcome

### R12-GOV-003 - ENRICH

Output: `research/external/r12/R12-GOV-003-nordiske-regulatoriske-terskler.md`

Verified source anchors:

- Konkurransetilsynet fusjoner/oppkjøp: `https://konkurransetilsynet.no/fusjoner-og-oppkjop-%C2%A716/mer-om-fusjoner-og-oppkjop/`
- Swedish Competition Act: `https://www.konkurrensverket.se/en/competition/laws-and-rules/swedish-competition-act/`
- KFST mergers: `https://en.kfst.dk/competition/mergers`
- FCCA Towercast/call-in analysis: `https://www.kkv.fi/en/blogs/fcca-blog/towercast-investigations-how-does-the-fcca-investigate-mergers-that-fall-below-the-turnover-thresholds/`
- Konkurransetilsynet Dagligvarerapporten 2025: `https://konkurransetilsynet.no/wp-content/uploads/2026/04/Dagligvarerapport-2025.pdf`
- Konkurrensverket food industry inquiry summary: `https://www.konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2024-5_summary.pdf`
- KKV private label report 2025: `https://www.kkv.fi/uploads/sites/2/2025-03-tutkimusraportteja-kaupan-omat-merkit-eli-private-label-tuotteet-elintarvikemarkkinoilla.pdf`

Outcome: Good source-shortlist. Use as legal/policy matrix, not as a statement that Nordic law has a shared EMV threshold.

### R12-GOV-004 - ENRICH

Output: `research/external/r12/R12-GOV-004-implementeringsbarrierer-sirkulaere-mattiltak.md`

Verified source anchors:

- KSV Infarm proposal trustee report: `https://www.ksvadvisory.com/docs/default-source/insolvency-case-documents/infarm-indoor-urban-farming/noi-proceedings/reports/first-report-of-the-proposal-trustee-dated-november-8-2023---final.pdf?sfvrsn=6f363be1_4`
- GU Ventures/Mycorena: `https://www.mynewsdesk.com/se/guventures/pressreleases/efter-konkursen-mycorena-saeljs-till-belgiska-foeretaget-naplasol-3339557`
- Glaros et al. 2024: `https://ecologyandsociety.org/vol29/iss1/art12/`
- CFS Network / GRA / WUR white paper: `https://globalresearchalliance.org/wp-content/uploads/2023/09/white-paper_CFS_2023_WUR_638397.pdf`

Outcome: Barrierematrise is usable. Plantagon and Rest are retained as follow-up/parked case rows because primary locator/entity match is not good enough.

### R12-GOV-005 - ENRICH

Output: `docs/project/mandates/R12-GOV-005-finansieringsmuligheter-food-tg.md`

Verified source anchors:

- Innovasjon Norge Bionova: `https://www.innovasjonnorge.no/artikkel/bionova-tilskudd-til-biookonomi-og-klimatiltak`
- Forskningsrådet Land-based Bioeconomy 2026: `https://www.forskningsradet.no/en/call-for-proposals/2026/innovation-projects-for-the-industrial-sector-food-and-bioresources-2026/`
- Nordic Innovation Green and Competitive Nordic Region: `https://www.nordicinnovation.org/programs/call-project-proposals-green-and-competitive-nordic-region`
- NordForsk food security call: `https://www.nordforsk.org/calls/call-proposals-nordic-and-baltic-solutions-food-security`
- Horizon Europe Cluster 6: `https://research-and-innovation.ec.europa.eu/funding/funding-opportunities/funding-programmes-and-open-calls/horizon-europe/cluster-6-food-bioeconomy-natural-resources-agriculture-and-environment_en`
- CBE JU: `https://www.cbe.europa.eu/`
- EIT Food open calls: `https://www.eitfood.eu/open-calls-overview`

Outcome: Internal funding-fit matrix created. It should trigger go/no-go notes, not immediate application writing.

### R12-VIZ-002 - ENRICH

Output: `docs/project/mandates/R12-VIZ-002-spider-radarmodell.md`

Source anchors:

- `docs/project/mandates/R12-VIZ-001-datakrav-for-ledd-profil-visualisering.md`
- `research/forstaelse/R12-GOV-001-governance-impotens-sloyfen.md`
- `research/external/r12/R12-GOV-002-ansvarsmatrise-matberedskap.md`
- `research/_status/food-tg-r12/decisions/batch-01.jsonl` through `batch-05.jsonl`

Outcome: Internal model specification created. Radar/spider must render gaps, C-cells and actor-gates instead of smoothing them into a polygon.

## Stop-regler som ble brukt

- GOV-003 ble ikke gjort til claim om nordisk EMV-regulering fordi EMV-kildene er kartlegging/analyse, ikke felles vedtatt terskel.
- GOV-004 ble ikke gjort til teknologidom fordi konkurs/pause ikke beviser at teknologien feiler; Plantagon og Rest ble ikke caseført som modne uten primær/entity-match.
- GOV-005 ble ikke gjort til søknadsstrategi fordi finansieringsfit krever eier, partner, frist og rollebeslutning.
- VIZ-002 ble ikke gjort til ekstern radarfigur fordi scoregrunnlaget har blandede A/B/C-celler og flere actor-gates.
