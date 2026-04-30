# Økologisk Norden - importanalyse 2026-04-29

## Hva som er gjort

Det er opprettet en lokal evidenspakke for økologisk jordbruk og marked i Norden:

- Originale nedlastinger: `research/evidence-pack/okologisk-norden-2026-04-29/downloads/`
- Tekstuttrekk: `research/evidence-pack/okologisk-norden-2026-04-29/text/`
- Eksporter: `research/evidence-pack/okologisk-norden-2026-04-29/exports/`

Pakken dekker nå offisielle eller primære sektor-/kontrollkilder for Norge, Danmark, Sverige, Finland og Island, samt FiBL/IFOAM som benchmark.

## Integrasjon Utført

Innhentede indikatorer er nå integrert som staging og splittede core-series-filer:

- `research/data/nordic/core-series/_staging/organic_integration_candidates_2026-04-29.csv`
- `research/data/nordic/core-series/organic_market_retail_annual.csv`
- `research/data/nordic/core-series/organic_control_operators_annual.csv`
- `research/data/nordic/core-series/organic_public_procurement_annual.csv`
- `research/data/nordic/core-series/organic_policy_targets.csv`
- `research/data/nordic/core-series/organic_selected_production_annual.csv`
- `research/data/nordic/core-series/organic_selected_trade_annual.csv`

`research/data/nordic/core-series/series_manifest.json` og `public/data/food-systems/DATA-SOURCES.md` er oppdatert med disse seriene. Alle integrerte rader beholder `quality_flag`, `import_status`, `comparability`, kilde-URL og kildehenvisning.

Etter Sverige-fortsettelsen er staging økt til 86 rader. `organic_control_operators_annual.csv` har 22 rader, inkludert KRAV private-label-rader, og `organic_public_procurement_annual.csv` har 8 rader, inkludert svenske Ekomatcentrum/KRAV-rader med eksplisitt scope.

## Kvalitetsport Lukket: Norge 2025

Full rapport fra Landbruksdirektoratet er nå lastet ned og ekstrahert:

- `research/evidence-pack/okologisk-norden-2026-04-29/downloads/no-landbruksdirektoratet-okologiske-jordbruksvarer-2025.pdf`
- `research/evidence-pack/okologisk-norden-2026-04-29/text/no-landbruksdirektoratet-okologiske-jordbruksvarer-2025.txt`

De norske 2025-radene i staging/core-series peker nå på PDF-tekstfilen med `quality_flag=authority_report_pdf`. Press-siden er beholdt som støtte/proveniens, men er ikke lenger primærkilde for de norske 2025-indikatorene.

## Kvalitetsport Delvis Lukket: Island Kontroll

Direkte Tún-/TRACES-spor er nå hentet og normalisert:

- `research/evidence-pack/okologisk-norden-2026-04-29/downloads/is-tun-vottunarskra-2026.html`
- `research/evidence-pack/okologisk-norden-2026-04-29/downloads/is-traces-organic-operator-issued-2026.json`
- `research/evidence-pack/okologisk-norden-2026-04-29/exports/is_traces_organic_operator_issued_2026.csv`
- `research/evidence-pack/okologisk-norden-2026-04-29/exports/is_traces_organic_operator_summary_2026.csv`

TRACES-uttrekket viser 59 utstedte islandske øko-sertifikater og 59 unike operatørnavn per 2026-04-29. Totalt offentlig statusuttrekk viser 75 rader: 59 issued, 12 withdrawn og 4 expired. Dette er en nåværende sertifikatstatus, ikke en årlig offisiell kontrollrapport.

Islandsk policyplan er også hentet:

- `research/evidence-pack/okologisk-norden-2026-04-29/downloads/is-government-organic-action-plan-2024.pdf`
- `research/evidence-pack/okologisk-norden-2026-04-29/text/is-government-organic-action-plan-2024.txt`

Den gir 10 % mål for økologisk sertifisert eller omleggingsareal innen 2040 og peker på behov for bedre årlig datainnsamling om marked/import.

## Kvalitetsport Fortsatt Åpen: Island Areal Og Marked

Ny primærsjekk er gjennomført for Hagstofa/Statistics Iceland og Lífrænt Ísland:

- `research/evidence-pack/okologisk-norden-2026-04-29/exports/is_hagstofa_agriculture_pxweb_catalog_2026-04-29.csv`
- `research/evidence-pack/okologisk-norden-2026-04-29/downloads/is-statice-agriculture-2026.html`
- `research/evidence-pack/okologisk-norden-2026-04-29/downloads/is-statice-production-in-agriculture-2024-news-2026.html`
- `research/evidence-pack/okologisk-norden-2026-04-29/downloads/is-statice-production-value-agriculture-2024-news-2026.html`
- `research/evidence-pack/okologisk-norden-2026-04-29/downloads/is-lifraent-island-home-2026.html`
- `research/evidence-pack/okologisk-norden-2026-04-29/exports/is_lifraent_island_map_entries_2026-04-29.csv`

Hagstofa/PxWeb-uttrekket dekker 26 landbrukstabeller. Ingen tabelltittel, variabel eller verditekst traff på organic/lífrænt/vottun/certification. Statice-nyhetene for 2024 gir generell produksjon og produksjonsverdi, men ikke økologisk split. Lífrænt Ísland gir et nyttig aktør-/produsentkart med 23 oppføringer, men ikke offisiell areal- eller markedsserie.

Konklusjon: Island-gaten er ikke lukket, men gapet er nå bekreftet bedre. Neste reelle steg er direkte MAST/Tún/Hagstofa-/departementsvei eller en Eurostat/FiBL-kryssjekk med tydelig metodeflagg.

## Kvalitetsport Lukket Lett: Sverige KRAV

KRAV-sporet er nå hentet ned som individuelle rapporter, ikke bare indeks:

- `research/evidence-pack/okologisk-norden-2026-04-29/downloads/se-krav-effektrapport-2025.pdf`
- `research/evidence-pack/okologisk-norden-2026-04-29/downloads/se-krav-ekobarometer-2025-april.pdf`
- `research/evidence-pack/okologisk-norden-2026-04-29/downloads/se-krav-ekobarometer-2024-april.pdf`
- fem øvrige Ekobarometer-rapporter 2023-2024

Lett analyse er gjort for 2024 KRAV-spesifikke nøkkeltall: 2 762 KRAV-sertifiserte lantbrukare, 375 652 ha KRAV-sertifisert jordbruksmark, 649 livsmedelsförädlare, 627 restauranter og 8 012 registrerte artikler i Mitt KRAV. Disse er lagt inn som private-label-rader og skal ikke blandes med Jordbruksverkets offisielle all-økologisk-statistikk.

## Kvalitetsport Delvis Lukket: Sverige Offentlig Innkjøp

Ekomatcentrum-sporet er ryddet slik at den tidligere år/tittel-usikkerheten ikke lenger blokkerer all svensk offentlig innkjøpsbruk:

- `research/evidence-pack/okologisk-norden-2026-04-29/downloads/se-ekomatcentrum-ekomatsligan-2024-page.html`
- `research/evidence-pack/okologisk-norden-2026-04-29/downloads/se-ekomatcentrum-emc-marknadsrapport-2023.pdf`
- `research/evidence-pack/okologisk-norden-2026-04-29/downloads/se-ekomatcentrum-emc-marknadsrapport-2022.pdf`
- `research/evidence-pack/okologisk-norden-2026-04-29/downloads/se-ekomatcentrum-ekomatligan-2025-page.html`

Ekomatsligan 2024-siden brukes for 2023: 34,2 % økologisk andel i offentlig sektor, 4,3 mrd. SEK økologiske innkjøp og 12,5 mrd. SEK totale offentlige matinnkjøp. EMC marknadsrapport 2023 brukes for 2022: 37 % økologisk andel i offentlig sektor. KRAV Ekobarometer 2023 gir kommunal Matilda Foodtech-andel for 2022: 35,7 % økologisk og 19,6 % KRAV. Ekomatsligan 2025 er kontrollert, men er foreløpig event-/programside, ikke publisert tallrapport.

## Hovedfunn

Vi har god kontroll på areal- og kontrollstatistikk for Danmark, Sverige, Finland og Norge. Island er fortsatt svakere på areal og marked, men kontrollsystemet og operatør-/sertifikatsporet er nå vesentlig bedre dekket gjennom ESA, Tún og TRACES.

Kunnskapsdybden er sterkest i Sverige og Danmark fordi de har tydelige offisielle statistikkflater for areal, produksjon og markeds-/kanalrapporter. Finland er god på samlet sektorstatus og kontrollsystem, men markedstallene er i hovedsak Pro Luomu-estimater. Norge er nå styrket med full Landbruksdirektoratet-rapport for 2025 og Debio-kontroll for 2024. Island mangler fortsatt et godt direkte datasett for nåværende areal, produksjon og marked, etter at offentlig Hagstofa/PxWeb-landbruksgren og Statice 2024-sider er sjekket uten øko-split.

## Landstatus

| Land | Dybde nå | Sterke kilder | Svakheter |
| --- | --- | --- | --- |
| Norge | Høy | Debio 2024, Landbruksdirektoratet 2025 PDF | Mer detaljert tabelluttrekk kan gjøres for produkt- og kanalnivå hvis runtime trenger det. |
| Danmark | Høy | SGAV/Landbrugsstyrelsen 2024, Organic Denmark 2025 | Små interne tallavvik må sjekkes før canonical import |
| Sverige | Høy | Jordbruksverket 2024, Ekologiska Årsrapporten 2024, KRAV enkelt­rapporter, Ekomatcentrum/Ekomatsligan | KRAV-effekt/forbrukerpåstander trenger tematisk koding; offentlig innkjøp må brukes med presist scope |
| Finland | Høy/medium | Pro Luomu 2024, Ruokavirasto 2024 | Marked er sektor-estimat; Luomuinstituutti ikke analysert |
| Island | Medium kontroll og aktørkart / lav areal-marked | ESA country profile og official controls; Tún/TRACES current register; Hagstofa/PxWeb gap-sjekk; Lífrænt Ísland-kart; EEA historisk andel; islandsk 2040-policyplan | Mangler nåværende arealserie, produksjon/marked |

## Organisasjonsdekning

Vi har nå sett på og mappet øko-organisasjoner og rapportflater:

- Norge: Debio analysert; Økologisk Norge og NORSØK står i neste kø.
- Danmark: Organic Denmark analysert; Økologisk Landsforening lastet ned og aktørmappet.
- Sverige: Organic Sweden/Ekologiska Lantbrukarna/KRAV/Ekomatcentrum analysert på årsrapportnivå. KRAV Effektrapport og Ekobarometer-rapportene er hentet og lett analysert. Ekomatcentrum/Ekomatsligan er ryddet til egne offentlig-innkjøpsrader.
- Finland: Pro Luomu og Ruokavirasto analysert; Luomuinstituutti står i neste kø.
- Island: MAST/Tún-rollene er verifisert via ESA; direkte Tún-side og TRACES API er hentet og normalisert. Hagstofa/PxWeb er sjekket som gap-dokumentasjon. VOR / Lífrænt Ísland er mappet fra policyplanen og hjemmesiden/produsentkartet, men trenger fortsatt årsrapport/gjennomføringsdata hvis det finnes.

## Kvalitetsvurdering

Tallene kan brukes internt nå, men ikke alle bør inn i canonical data uten flagg.

- Klar for intern analyse: NO Debio 2024, NO Landbruksdirektoratet 2025 PDF, DK SGAV 2024, SE Jordbruksverket 2024, FI Ruokavirasto 2024, FI Pro Luomu 2024, IS ESA 2023, IS Tún/TRACES 2026 certificate-status.
- Klar med forbehold: DK Organic Denmark market report, SE Ekologiska Årsrapporten 2024, SE KRAV private-label-rader og SE Ekomatcentrum offentlig-innkjøpsrader når scope vises eksplisitt.
- Ikke klar for canonical import uten videre sjekk: IS areal/marked; KRAV effekt-/forbrukerpåstander før tematisk koding; svenske 39 % måltids-/volumpåstander dersom de blandes med verdiandel. TRACES kan brukes som egen current-register-serie, men ikke som areal-/markedserstatning.

## Neste arbeidspakke

1. Finn islandsk nåværende MAST/Hagstofa/Tún-/departementsarealserie og markedsdata; direkte Tún/TRACES-operatørsporet og offentlig Hagstofa/PxWeb-sjekk er gjennomført uten å lukke areal-/markedsgapet.
2. Temakod KRAV Effektrapport og Ekobarometer-rapportene for effekt, forbrukertillit, beredskap, biodiversitet, skolemelk og produktcase.
3. Hent Økologisk Norge, NORSOK og Luomuinstituutti-publikasjoner for kunnskaps-/praksislaget.
4. Reconcile DK småavvik før ekstern publisering: 295,233 vs 295,223 ha og 11.4 vs 11.1 farm-share.
5. Bruk Ekomatcentrum/KRAV offentlig-innkjøpsrader hardt bare når scope vises i UI/notat: offentlig sektor-verdiandel, kommunal andel, KRAV-andel og måltids-/volumkontekst er ulike mål.
6. Koble de nye core-series-filene til eventuelle runtime-flater først etter at visningslogikken håndterer `import_status` og `comparability`.
