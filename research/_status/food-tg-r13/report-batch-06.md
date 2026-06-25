# Food TG R13 Batch 06 report

**Dato:** 2026-06-25
**Goal:** Execute controlled Food TG Research OS Runde 13 batch 06.
**Batch:** `R13-PROT-005`, `R13-PROT-008`, `R13-AKTOR-001`, `R13-AKTOR-002`
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 2 | `R13-PROT-005`, `R13-PROT-008` |
| actor-gate | 2 | `R13-AKTOR-001`, `R13-AKTOR-002` |
| park | 0 | - |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R13-PROT-005 | Presisjonsfermentering har aktør-/kapasitetsankre, men EU/Norge-salg og dyrket-kjøttvolum er ikke lukket. | EFSA Novel Food, EU Union list, Solar Foods, Melt&Marble | Kapasitet/søknad/pilot er ikke realisert volum eller EU-autorisasjon. | A regulatory; A/B actor; C volume | Type A status; Type C volume | forstaelse | vent |
| R13-PROT-008 | Erter og åkerbønner har sterk 2026-statistikk, men mat/fôr-splitt og foredlingskjede er fortsatt gap. | Landbruksdirektoratet 2026, SSB | Humant konsum er ikke egen åpen statistikkserie. | A aggregate; B human-use indication; C allocation | Type A crop data; Type B/C food/feed split | source-shortlist | importer |
| R13-AKTOR-001 | Markedshager har nettverks-/kartlokatorer, men ikke komplett verifisert produsentregister. | Markedshager Norge, Småskala Grønt Norge, Økoguiden API | Aktiv drift og produksjonsstatus må kontrolleres per produsent. | A/B locators; C complete registry | Type B actor-gate; Type C coverage | actor-gate | aktørspørsmål |
| R13-AKTOR-002 | Økoguiden gir andelslandbruk-lokatorer, men ikke verifisert aktiv 2025/2026-status per gård. | Økoguiden API, Solsiden actor page, SNL | Karttreff er ikke aktiv-status, og treff må dedupes. | A/B locators; B total; C active register | Type B actor-gate; Type C active/dedup state | actor-gate | aktørspørsmål |

## Per-target outcome

### R13-PROT-005 - ENRICH

Output: `research/forstaelse/R13-PROT-005-presisjonsfermentering-dyrket-kjott.md`

Verified source anchors:

- EFSA Novel Food: `https://www.efsa.europa.eu/en/topics/topic/novel-food`
- European Commission Union list: `https://food.ec.europa.eu/food-safety/novel-food/authorisations/union-list-novel-foods_en`
- Solar Foods EU Novel Food process: `https://investors.solarfoods.com/release/b2d87859-e297-47df-a282-4bbdb79bfa24`
- Solein Factory 01: `https://www.solein.com/articles/factory-01-where-the-sun-never-sets-on-harvest-season/`
- Melt&Marble: `https://www.meltandmarble.com/`

Outcome: Forstaelse. Regulatorisk/statusmemo er nyttig, men ikke kilde til claim, volumfigur eller markedslansering.

### R13-PROT-008 - ENRICH

Output: `research/external/r13/R13-PROT-008-bonner-erter-akerbonne.md`

Verified source anchors:

- Landbruksdirektoratet 2026 report: `https://www.landbruksdirektoratet.no/nb/filarkiv/rapporter/%C3%85kerb%C3%B8nner%2C%20erter%20og%20oljefr%C3%B8.%20Vurdering%20av%20tilskudd%20for%20%C3%A5%20%C3%B8ke%20norskandelen%20i%20matindustrien%20Rapport%202026%203%2016.pdf`
- SSB Korn og oljevekster: `https://www.ssb.no/jord-skog-jakt-og-fiskeri/jordbruk/statistikk/korn-og-oljevekster-areal-og-avlinger`
- NLR Kornstatistikk: `https://kornforum.nlr.no/kornstatistikk`

Outcome: Source-shortlist. Belgvekstdata er styrket, men mat/fôr-splitt og foredlingskobling må holdes som gap.

### R13-AKTOR-001 - ACTOR-GATE

Output: `research/_status/R13-AKTOR-001-markedshager-verifisert.md`

Verified source anchors:

- Markedshager Norge: `https://www.markedshage.no/`
- Finn markedshager: `https://www.markedshage.no/markedshager-i-fylkene/`
- Småskala Grønt Norge: `https://www.markedshage.no/nb/nyheter/2026/06/smaskala-gront-norge-har-apnet-for-innmelding/`
- Økoguiden API Search/8074: `https://okologisknorge.no/Umbraco/Api/EcoGuideApi/Search/8074`

Outcome: Actor-gate. Locatorgrunnlag finnes, men verifisert produsent-CSV krever per-aktør aktiv-status og dedupe.

### R13-AKTOR-002 - ACTOR-GATE

Output: `research/_status/R13-AKTOR-002-andelslandbruk-aktiv-status.md`

Verified source anchors:

- Økoguiden: `https://okologisknorge.no/oekoguiden/`
- Økoguiden categories: `https://okologisknorge.no/Umbraco/Api/EcoGuideApi/GetCategories`
- Økoguiden Search/8074: `https://okologisknorge.no/Umbraco/Api/EcoGuideApi/Search/8074`
- Solsiden andelslandbruk: `https://www.solsidenandel.net/`
- SNL andelslandbruk: `https://snl.no/andelslandbruk`

Outcome: Actor-gate. Gode lokatorer, men aktiv 2025/2026-status per gård må hentes fra aktørsider eller direkte kontakt.

## Stop-regler som ble brukt

- Kapasitet, Novel Food-søknad og self-GRAS ble ikke gjort til EU/EØS-markedstilgang.
- Belgvekstvolum ble ikke gjort til humanproteinvolum uten mat/fôr-splitt.
- Kart-/API-treff ble ikke gjort til aktiv gårdsstatus.
- Nettverks-/organisasjonsstatus ble ikke gjort til komplett nasjonalt produsentregister.

## Må ikke visualiseres ennå

- `R13-PROT-005`: ingen modenhets-/volumgraf som blander kapasitet, søknad, godkjenning og salg.
- `R13-PROT-008`: ingen areal-/volumtrend uten fôr/mat-scope, foreløpig status og sesongsvingninger.
- `R13-AKTOR-001`: ingen markedshagekart som later som kart-/API-dekning er komplett eller aktiv-verifisert.
- `R13-AKTOR-002`: ingen andelslandbruk-total eller kart som bruker Økoguiden-treff som aktiv 2026-register.
