# Media source review round 2

Dato: 2026-04-29  
Input: P2, P3 og 2026-watch fra `media-source-candidates-2026-04-29.csv`  
Output: 25 nye snapshots etter round 1, pluss review-kø med 54 beslutningsrader.

## Status etter videre henting

Samlet arbeidsflate naa:

- 54 kandidater i kildekøen
- 39 snapshots i `research/bibliotek/media/snapshots/`
- 25 rader klare for human review
- 5 PDF-rader som maa gjennom PDF-katalog/SourceDoc foer import
- 8 rader som allerede finnes i corpus og bor brukes som anker for utvidelse
- 7 valgfrie kontekstrader
- 5 metadata-only/manuell tilgang-rader
- 2 blokkerte fetch-rader som trenger alternativ URL eller manuell kilde
- 3 watch-2026-rader, hvorav 2 har snapshot og 1 er metadata-only/paywall

Review-køen ligger her:

`research/bibliotek/media/media-source-review-queue-2026-04-29.csv`

## Nye funn per land

### Norge

Norge har naa bedre balanse mellom markedsmakt, prispress, beredskap, sirkularitet og innovasjon:

- NORSUS/Matvett-sporet gir en konkret matsvinnflate med 2024-faktaark og sektorinndeling.
- Nofima gir to innovasjons-/forbrukerinnsiktskilder rundt upcycled food.
- NHH-priskunnskap og NHH/S-WoBA medieoppmerksomhet gjoer prisjournalistikk til et eget markedsmekanisme-spor.

Importlogikk: velg maks 2-3 nye Norge-entries naa, ellers blir Norge igjen overrepresentert.

### Sverige

Sverige er styrket med sirkularitet og innovasjon, ikke bare konkurranse:

- RISE: sirkulaer mat i offentlige maaltider.
- IVL/FOCUSE: urbane sirkulaere matsystemer.
- Circularity Gap Sweden og SmartBuilt/Gottsunda gir benchmark/case-lag, men disse er kontekst, ikke direkte mediaintensitet.

Importlogikk: prioriter ett myndighets-/policyentry og ett sirkularitets-/innovasjonsentry.

### Danmark

Danmark har naa tydeligere konfliktlinje:

- KFST: fusjonskontroll og digital/algoritmisk prissetting.
- Dansk Erhverv: bransjens motfortelling om at stigende matpriser skyldes produsentpriser og loenn, ikke ren dagligvareprofitt.
- Food Nation/New Food: sirkularitet og emballasje/food-sector cases, men disse er mer profilering/case enn systemkritikk.

Importlogikk: ta med KFST prisverktøy/algoritme og Dansk Erhverv som counter-frame. Vent med trade-media-case til sirkularitetsgap er tydeligere.

### Finland

Finland er styrket med prispress og markedsstruktur:

- KKV/FCCA: prisoverforing og marginstruktur i matkjeden.
- PTY: markedsandeler og duopolstruktur.
- Kesko: corporate respons pa prispress og markedsandeler.
- Interreg FoodShift: kommunal sirkularitet/procurement-case.

Blokkert: MDPI/Turku-kilden svarte `403`; finn DOI/NVA/annen aapen kilde foer eventuell import.

Importlogikk: minst ett primært KKV/PTV-entry foer Kesko-corporate respons, slik at finsk profil ikke blir aktørstyrt.

### Island

Island er fortsatt svakeste land for faktisk redaksjonelt dagligvaremediegrunnlag, men har naa en bedre primaerkilde for markedsstruktur:

- Samkeppniseftirlitid/competitiveness indicators gir direkte grocery concentration evidence for hovedstadsregionen, med HHI ned fra om lag 4 500 i 2009 til om lag 2 900 i 2020, fortsatt over terskel for hoy konsentrasjon.
- Samkeppniseftirlitid/Festi-Lyfja gir adjacent retail concentration evidence og bor brukes varsomt som stotte, ikke hovedbevis.
- Hagar 2024/25 og Bifrost PDF gir markedsleder/retailstruktur-kontekst.
- Geothermal GEOFOOD og Novia gir sirkularitet/innovasjon, men er lavere prioritet enn direkte dagligvarekonsentrasjon.

Blokkert: USDA Iceland Exporter Guide API svarte `500`.

Importlogikk: bruk `is-samkeppnisvisar-grocery-hhi-2021` som primær islandsk konsentrasjonskilde etter review, og hold Festi/Lyfja som adjacent støtte. Hagar/Bifrost maa fortsatt gjennom PDF-katalog og verdi-/årskontroll.

### Nordisk tverrsnitt

Nye nordiske kilder styrker sirkularitet/beredskap som tverrtema:

- Nordic Circular Hotspot: nordisk circular food framing.
- Circularity Gap Norway/Sweden: benchmark, ikke medieomtale.
- Matsentralen: overskuddsmat, mathjelp og food waste governance.
- Springer/open-access: food-energy integration som akademisk systemramme.
- Circular Households: husholdningspilot.

Importlogikk: bruk nordiske tverrkilder til theme-/methodenotat eller supportingSources, ikke nødvendigvis egne `MediaEntry`-rader per kilde.

## Beslutningsregler for neste import

1. Importer aldri `metadata_only_manual` uten manuell tilgang eller eksplisitt beslutning.
2. Importer aldri `watch_2026` i 2016-2025 historikk. Bruk dem bare i separat watchlist eller metodekommentar.
3. `pdf_catalog_before_import` maa kobles mot PDF-katalog/SourceDoc foer `media-corpus.ts` oppdateres.
4. `blocked_fetch_needs_alternate` maa ha ny URL eller manuell dokumentasjon.
5. `ready_for_human_review` betyr ikke automatisk import; det betyr at kilden har nok snapshot til koding.

## Anbefalt importpakke v0.3

For en balansert neste app-utvidelse:

- Norge: `no-nhh-media-attention-2025`, `no-riksrevisjonen-matsikkerhet-2024`, eventuelt `no-norsus-matsvinn-2024`
- Sverige: `se-konkurrensverket-food-knowledge-2025`, `se-regeringen-livsmedelsstrategi-2025`, `se-rise-circular-food-2025`
- Danmark: `dk-kfst-price-policy-2025`, `dk-dansk-erhverv-food-prices-2024`, etter PDF-katalog `dk-kfst-salling-coop-pdf-2025`
- Finland: `fi-kkv-food-market-study-2023`, `fi-pty-grocery-market-2024`, `fi-kesko-price-cuts-2025`
- Island: `is-samkeppnisvisar-grocery-hhi-2021`, eventuelt `is-bifrost-retail-sector` etter PDF-katalog og år/verdi-kontroll
- Nordisk: bruk `nordic-matsentralen-reports-2024` og `nordic-hotspot-beyond-bean-2023` som supportingSources/theme context

Dette gir en mer balansert pakke enn aa bare fylle pa med alle tilgjengelige snapshots.
