# Food TG R12 Batch 10 report

**Dato:** 2026-06-24  
**Goal:** Execute controlled Food TG Research OS Runde 12 batch 10.  
**Batch:** `R12-TRUE-002`, `R12-TRUE-003`, `R12-TRUE-004`, `R12-TRUE-005`  
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 4 | `R12-TRUE-002`, `R12-TRUE-003`, `R12-TRUE-004`, `R12-TRUE-005` |
| park | 0 | - |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R12-TRUE-002 | TEEBAgriFood er sterkt metodeanker for true-cost accounting, men ikke norsk kronefasit. | UNEP/TEEB TEEBAgriFood + FAO SOFA 2023 | Norsk systemgrense, indikatorvalg og verdsettingsmetode er ikke lukket. | A for metode, B/C for norsk monetariserbar bruk | Type A/C + Type B for aktordata | source-shortlist | Importer metode-shortlist; ingen kronefestet true-cost claim. |
| R12-TRUE-003 | Sufficiency/prevention kan forstas via demand-side mitigation og food-waste prevention. | IPCC AR6 WGIII + European Commission food waste | Norsk sufficiency-indikator og prevention-effekt krever baseline. | A med B/C implementeringshull | Type A/C + Type B/C effektdata | source-shortlist / forstaelse | Importer begrepsnotat; ingen normativ aktorintensjonsclaim. |
| R12-TRUE-004 | IPBES Nexus er verifisert; tallsporet bor korrigeres til 71 response options, ikke 70 anbefalinger. | IPBES DOI/citation guide + EU Knowledge4Policy | SOIL-score mangler primarlocator. | A for rapport/SPM, C for SOIL-score | Type A for PCQ; Type C for SOIL-score | PCQ | Importer source card; parker SOIL-score. |
| R12-TRUE-005 | FHI/Helsedirektoratet gir folkehelse-outputankre, men ikke true-cost-regnskap. | FHI sykdomsbyrde + Helsedirektoratet kosthold 2025 | Attribusjon fra matsystemstruktur til sykdomsbyrde og tilgjengelighet er ikke lukket. | A med C attribusjonshull | Type A/C | source-shortlist | Importer helsekildeanker og datagap; ingen helse-true-cost tallfesting. |

## Per-target outcome

### R12-TRUE-002 - ENRICH

Output: `research/external/r12/R12-TRUE-002-teebagrifood-og-true-cost-accounting.md`

Verified source anchors:

- UNEP TEEBAgriFood Evaluation Framework: `https://www.unep.org/topics/teeb/teeb-agriculture-and-food-teebagrifood/teebagrifood-evaluation-framework`
- UNEP/TEEB Scientific and Economic Foundations: `https://www.unep.org/topics/teeb/teeb-agriculture-and-food-teebagrifood/teeb-agrifood-resources/scientific-and-economic`
- FAO SOFA 2023 official synthesis: `https://knowledge4policy.ec.europa.eu/publication/state-food-agriculture-2023-revealing-true-cost-food-transform-agrifood-systems_en`
- FAO TCA two-phase page: `https://www.fao.org/3/cc7724en/online/state-of-food-and-agriculture-2023/true-cost-accounting-assessment.html`

Outcome: Good method shortlist. Keep capital/flow/outcome/impact vocabulary, but no Norwegian price or hidden-cost claim without own model.

### R12-TRUE-003 - ENRICH

Output: `research/forstaelse/R12-TRUE-003-sufficiency-og-prevention-i-matsystemer.md`

Verified source anchors:

- IPCC AR6 WGIII chapter 5: `https://www.ipcc.ch/report/ar6/wg3/chapter/chapter-5/`
- IPCC AR6 WGIII SPM C.10: `https://www.ipcc.ch/report/ar6/wg3/chapter/summary-for-policymakers/`
- European Commission food waste: `https://food.ec.europa.eu/food-safety/food-waste_en`
- EU Platform on Food Losses and Food Waste: `https://sdgs.un.org/partnerships/eu-platform-food-losses-and-food-waste-flw-working-together-fight-food-waste`

Outcome: Good forstaelse/source-shortlist candidate. Sufficiency should be treated as service-need and demand-side framework, not as moralized actor-intention language.

### R12-TRUE-004 - ENRICH WITH MISMATCH

Output: `research/external/r12/R12-TRUE-004-nexus-rapporten-anbefalingstall-og-soil-score.md`

Verified source anchors:

- IPBES Nexus citation guide: `https://ict.ipbes.net/ipbes-ict-guide/data-and-knowledge-management/citations-of-ipbes-assessments/nexus-assessment`
- Full report DOI: `https://doi.org/10.5281/zenodo.13850054`
- SPM DOI: `https://doi.org/10.5281/zenodo.13850289`
- EU Knowledge4Policy SPM card: `https://knowledge4policy.ec.europa.eu/publication/ipbes-thematic-assessment-report-interlinkages-among-biodiversity-water-food-health_en`
- UNEP-WCMC secondary article: `https://www.unep-wcmc.org/en/news/ipbes-nexus-assessment`

Outcome: Nexus source card is useful. `70 anbefalinger` should not be imported as-is; strongest controlled wording is `71 response options`. `SOIL-score` is parked until a primary locator defines it.

### R12-TRUE-005 - ENRICH

Output: `research/external/r12/R12-TRUE-005-folkehelse-output-norsk-matsystem.md`

Verified source anchors:

- FHI Sykdomsbyrde i Norge: `https://www.fhi.no/he/fr/folkehelserapporten/samfunn/sykdomsbyrde/`
- FHI temautgave 2026, store folkehelseutfordringer: `https://www.fhi.no/he/fr/temautgave-2026-viktigste-folkehelseutfordringene/Del-1-5/del-3---de-store-utfordringenen-for-folkehelsen/`
- Helsedirektoratet Utviklingen i norsk kosthold 2025: `https://www.helsedirektoratet.no/rapporter/utviklingen-i-norsk-kosthold-2025`
- Helsedirektoratet PDF: `https://www.helsedirektoratet.no/rapporter/utviklingen-i-norsk-kosthold-2025/pdf-av-rapporten/Rapport_utviklingen_norsk_kosthold_2025.pdf?download=false`
- NOU 2025:8 folkehelse section: `https://www.regjeringen.no/no/dokumenter/nou-2025-8/id3118916/?ch=4`

Outcome: Good source-shortlist and datagap memo. Health-output can be anchored, but attribution to matsystem structure and any health true-cost number must wait.

## Stop-regler som ble brukt

- TEEBAgriFood/FAO ble ikke gjort til norsk kronefestet true-cost-modell.
- Sufficiency ble ikke gjort til normativt aktorclaim eller norsk effektmal.
- Nexus `70 anbefalinger` ble ikke importert fordi primar-/policykort peker mot `71 response options`, og `response options` er ikke det samme som vedtatte anbefalinger.
- `SOIL-score` ble parkert fordi ingen primarlocator ble funnet i Nexus-sporet.
- Folkehelse-output ble ikke monetarisert eller attribuert til matsystemstruktur uten egen modell.
