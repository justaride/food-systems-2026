# Datagap datainnhentingsplan 2026-04-29

Status: operativ plan for å finne, hente, verifisere og promotere mer data etter gapgjennomgangen 2026-04-29.

Formål: lukke åpne datagap med en sporbar metode som skiller mellom maskinlesbare primærdata, PDF-ekstraherte tall, bransjekilder, interne proxyer og ekstern validering.

## Startpunkt

Dagens `gap-master` viser:

| Status | Antall |
|---|---:|
| Open | 48 |
| Initial-card | 5 |
| Data-artifact | 1 |
| Partial-data-artifact | 1 |
| Partly-imported | 4 |

Kritiske gap er fortsatt alle åpne. B10 har dataartefakt. B11 har delvis dataartefakt for 2020-2024. A4, A6, A7, B12 og G3 har initial-card og bør være første videre datainnhenting.

Operativ kildemål-tracker: `research/_plans/data-source-targets-2026-04-29.csv`.

## Prinsipp

Hvert datapunkt skal ende i én av fire tilstander:

| Tilstand | Bruk |
|---|---|
| `integrerbar` | Maskinlesbar data, kilde, metode og kvalitetssjekk er på plass. |
| `delvis-integrerbar` | Delmengde kan brukes, men scope eller år mangler. |
| `proxy` | Beregnet internt og kan brukes med metodeforbehold. |
| `request-needed` | Offentlig data er ikke nok; vi må sende aktør-/FOI-/partnerforespørsel. |

Ingen rad flyttes til lukket status bare fordi vi har funnet en relevant kilde. Lukking krever et artefakt: CSV, evidence card, modellnotat, kildepakke eller validert svar.

## Dataflyt

1. Definer datakontrakt per gap før søk:
   - Målepunkt.
   - Enhet.
   - Geografi.
   - År.
   - Minimumskolonner.
   - Primærkildekrav.
   - Akseptansegate.
2. Søk lokalt først:
   - `research/`
   - `public/data/food-systems/`
   - `src/lib/data/`
   - `research/intake/`
   - `research/bibliotek/`
3. Hent fra offisielle maskinkilder:
   - SSB Statbank API v2: https://www.ssb.no/en/api/pxwebapi
   - SCB PxWebApi: https://www.scb.se/vara-tjanster/oppna-data/pxwebapi/
   - Statistics Denmark StatBank API: https://www.dst.dk/en/Statistik/hjaelp-til-statistikbanken/api
   - Statistics Finland StatFin/PxWeb: https://stat.fi/tup/avoin-data/pxweb_en.html
   - Eurostat PPP/data: https://ec.europa.eu/eurostat/web/purchasing-power-parities/information-data
   - OECD PPP: https://www.oecd.org/en/data/datasets/purchasing-power-parities.html
4. Bruk PDF-/rapportekstraksjon når maskindata ikke finnes:
   - Konkurransetilsynet, Dagligvarerapport 2024-25.
   - NORSUS/Matvett matsvinnfaktaark.
   - SINTEF marint restråstoff.
   - Landbruksdirektoratet biogass-/jordbruksdata.
   - Klimastatus, Klimakur, statsbudsjett og tiltaksrapporter.
5. Bruk bransje- og aktørkilder som støtte, ikke alene:
   - Biogass Norge.
   - dagligvarekjedenes års-/bærekraftsrapporter.
   - emballasje-/avfallsaktører.
   - forskningsinstitutter og klyngeaktører.
6. Hvis data fortsatt mangler, lag request-pakke:
   - Hvem skal spørres.
   - Nøyaktig tabell/variabel vi ber om.
   - Hvorfor offentlig data ikke dekker behovet.
   - Frist og fallback hvis ingen svarer.

## Bølge 1 - lukk hurtige datahull

Mål: gjøre Lane 2 mest mulig integrerbar før større modellbygging.

| Gap | Databehov | Første kilder | Artefakt | Akseptansegate |
|---|---|---|---|---|
| A4 | Biogassanlegg, husdyrgjødsel til biogass, virkemidler 2013-2024 | Landbruksdirektoratet biogass, Biogass Norge 2024, Miljødirektoratet/Enova ved behov | `research/data/nordic/biogas/` + oppdatert A4-kort | Årstall, anleggskategori, virkemiddel og kilde skilt tydelig. |
| A6 | Plastemballasje/gjenvinning for matemballasje | Eurostat packaging waste, nasjonale avfallsmyndigheter, bransjerapporter | `research/data/nordic/packaging/` + oppdatert A6-kort | Skille total plastemballasje fra matkontakt/matemballasje. |
| A7 | Status på Klimakur-/matsystemtiltak | Klimakur 2030, Klimastatus og -plan, statsbudsjett, etatsrapporter | `research/data/norway/climate-measures/` + tiltakstabell | Ett tiltak per rad med status, år, ansvarlig aktør og kilde. |
| B11 | Omsetningsandeler 2017-2019 og ev. Norden | Konkurransetilsynet eldre rapporter, Dagligvarefasiten/NielsenIQ, nasjonale konkurransemyndigheter | Utvid `no-grocery-market-share-2020-2024.csv` eller egen backlog | Ikke interpoler. Kun år-for-år-tall fra eksplisitt kilde. |
| B12 | PPP/prisnivå Norden | Eurostat PPP, OECD PPP, SSB/SCB/DST/StatFin KPI/matpriser | Oppdatert PPP-serie | Koble indeks/PPP/PLI riktig, med basisår og varegruppe. |
| G3 | Selvforsyning justert for sjømateksport | NIBIO selvforsyning, Helsedirektoratet matforsyningsstatistikk, SSB/Fiskeridirektoratet sjømateksport | Scenario-CSV + G3-kort | Minst to scenarioer: jordbruksmat og sjømatjustert. |

Prioritet i bølge 1:

1. A4 og G3 først: høy sannsynlighet for offentlige tall og lav metodekompleksitet.
2. B12 parallelt: allerede delvis grunnlag, trenger kildelåsing.
3. A7: krever mer tolking, men kan bli en ryddig tiltakstabell.
4. A6: start med total plastemballasje, men ikke overclaim matemballasje uten avgrensning.
5. B11: kun videre hvis eldre kilder er tilgjengelige; ellers lukk som 2020-2024 med eksplisitt avgrensning.

## Bølge 2 - kritiske leveransedata

Mål: lukke de kritiske datapunktene som blokkerer juni-leveransen.

| Gap | Databehov | Metode | Artefakt | Akseptansegate |
|---|---|---|---|---|
| A1 | Sammenlignbar Scope 3 for NorgesGruppen/ASKO, Coop og Reitan | Års-/bærekraftsrapporter, CDP hvis tilgjengelig, aktørrequest | Komparabilitetsmatrise | Basisår, scope, kategori og avgrensning eksplisitt for hver aktør. |
| A2 | Husholdningsmatsvinn-drivere | NORSUS/Matvett 2024, forbrukerundersøkelser, SIFO/NMBU-litteratur | Driverkort + datatabell | Skille målt svinn, selvrapportert atferd og forklaringsfaktorer. |
| A3 | Marint restråstoff volum og anvendelse | SINTEF restråstoff 2024, Fiskeridirektoratet, eksport/landingsdata | Verdikjedekart + volumtabell | Oppstått, utnyttet og uutnyttet restråstoff må skilles. |
| C5 | Norsk næringsstoff-resirkuleringsgap | NIBIO, Miljødirektoratet, gjødselvaredata, importstatistikk | Nutrient budget-notat | N/P/K-balanse med tydelige proxyer og usikkerhet. |
| C6 | Oppdrettsnæringsstoffer til fjord | Fôrdata, akvakulturstatistikk, utslippsfaktorer, forskning | Oppdrett N/P modelltabell | Tapstall må spores til kilde eller beregningsformel. |
| B3 | Nordic Data Validation | DK/SE/FI partnerkontakter + konkurranse-/statistikkmyndigheter | Partner-valideringspakke | Markedsandeler validert eller markert som pending per land. |

Bølge 2 skal ikke vente på at hele Norden er komplett. Den bør gi ett norsk robust minimum og en nordisk valideringskø.

## Bølge 3 - modell- og KPI-data

Mål: gjøre C- og G-modellgapene analytisk brukbare.

Arbeidspakker:

- KPI-register for R0-R9:
  - C1, C2, C3, C4, C9.
  - Output: `research/data/nordic/circular-kpi/kpi-register-2026-05.csv`.
  - Gate: hvert KPI-forslag har målepunkt, kilde, frekvens og "kan brukes/kan ikke brukes".
- Nutrient/MFA:
  - C5, C6, C7, C8, G1, G2.
  - Output: `research/evidence-pack/model-notes/nutrient-mfa-gap-note-2026-05.md`.
  - Gate: skille masseflyt, næringsstoffbalanse og matsvinnsdefinisjon.
- Sidestrømmer:
  - C10-C13 + G-01 til G-04.
  - Output: `research/data/nordic/sidestreams/sidestream-opportunity-register-2026-05.csv`.
  - Gate: volum, nåværende anvendelse, mulig oppgradering og kildegrad per rad.

## Bølge 4 - sosial og systemisk bredding

Mål: finne kildegrunnlag uten å forsinke hovedleveransen.

Arbeidspakker:

- F1-F4: helse, underernæring, matusikkerhet og prisbelastning.
  - Første kilder: Helsedirektoratet, FHI, SSB levekår/inntekt, NAV/SIFO der relevant.
  - Output: sosial bærekraft mini-matrix.
- G4-G9: regulering, beredskap, klima, urfolk/samisk perspektiv og karbonbinding.
  - Første kilder: regjeringen, Landbruksdirektoratet, NIBIO, EU/EFTA, Sametinget, forskningsrapporter.
  - Output: systemrisiko-kort per gap.

Gate: disse kan få `source-grounded` status, men skal ikke konkurrere med kritiske juni-blokkere før bølge 1-2 er ferdig.

## Datakontrakt for nye CSV-er

Alle nye datafiler bør minst ha:

| Kolonne | Formål |
|---|---|
| `gap_id` | Kobling til masterregister. |
| `country_code` | ISO-lignende landkode der relevant. |
| `year` | År eller periode. |
| `metric` | Målepunkt. |
| `value` | Tallverdi. |
| `unit` | Enhet. |
| `source_name` | Kort kildenavn. |
| `source_url` | Direkte kilde eller landingsside. |
| `source_type` | API, official_pdf, industry_report, actor_response, proxy. |
| `method_note` | Avgrensning, beregning eller ekstraksjonsmetode. |
| `quality_flag` | ok, partial, proxy, weak, request-needed. |

Gap-spesifikke brede tabeller er tillatt når de er mer lesbare, men de må fortsatt ha kilde- og metodefelt.

## Kvalitetssjekk før promotering

Hver ny datafil skal sjekkes for:

1. CSV-struktur: lik kolonnebredde på alle rader.
2. Nøkler: ingen duplikat på definert primærnøkkel.
3. Dekning: forventede år/land finnes eller er eksplisitt manglende.
4. Kilde: hver rad har kilde eller arver kilde tydelig fra tabellmetadata.
5. Enhet: ingen blanding av indeks, prosent, tonn, kroner eller kg uten felt for `unit`.
6. Metode: proxyer merkes som proxy, ikke primærstatistikk.
7. Masterstatus: `gap-master` oppdateres bare etter at datafil og evidence card peker på hverandre.

## Request-pakke når offentlig data ikke holder

Bruk denne malen for aktør-/partnerforespørsler:

| Felt | Innhold |
|---|---|
| Gap-ID | Hvilket gap forespørselen lukker. |
| Tabell vi ber om | Eksakte kolonner og år. |
| Minimumssvar | Hva som er nok til å bruke det. |
| Foretrukket format | CSV/XLSX, ikke bare PDF. |
| Konfidensialitet | Om svaret kan siteres, brukes aggregert eller kun validere intern modell. |
| Frist | Dato for når vi trenger svar. |
| Fallback | Hva vi gjør hvis ingen svarer. |

Prioriter request først for:

1. A1 Scope 3-komparabilitet hos kjedene.
2. B3 DK/SE/FI markedsandeler.
3. E1-E7 ekstern validering.
4. B10 omsetningsbasert lokal HHI hvis konkurransepolitisk bruk blir nødvendig.

## Konkret 10-dagers løp

Dag 1:

- Bruk `research/_plans/data-source-targets-2026-04-29.csv` som arbeidskø.
- Kjør lokal kilde-sweep for A4, A6, A7, B12, G3 og B11.
- Merk hvilke hull som er API-egnet, PDF-egnet og request-needed.

Dag 2-3:

- Hent A4, B12 og G3 til CSV.
- Oppdater A4/B12/G3-kort med datakvalitet.
- Marker integrerbare delmengder i `gap-master`.

Dag 4-5:

- Ekstraher A7 tiltakstabell.
- Start A6 total plastemballasje vs matemballasje-avgrensning.
- Kjør B11 eldre-kildejakt. Hvis 2017-2019 ikke finnes offentlig, skriv request/backlog-beslutning.

Dag 6-7:

- Bygg A1 Scope 3-matrise.
- Bygg A2 matsvinn-driverkort.
- Bygg A3 restråstoff-tabell.

Dag 8:

- Bygg C5/C6 nutrient budget minimumsmodell.
- Marker tydelig hvilke antakelser som er proxy.

Dag 9:

- Lag partner-/actor request-pakker for A1, B3 og E1-E7.
- Ikke marker som validert før svar foreligger.

Dag 10:

- Kjør full CSV-integritetssjekk.
- Oppdater `gap-master`, `gap-master-routing` og hovedplan.
- Lag statusrapport: integrerbar, delvis-integrerbar, proxy, request-needed, parkert.

## Neste konkrete arbeidsordre

Start med A4, G3 og B12 fordi disse har best sjanse for rask lukking fra offentlige kilder. Kjør samtidig en smal B11-kildejakt for 2017-2019. Ikke bruk mer tid på B10 før vi har bestemt om butikkantall-proxy er nok, eller om vi faktisk trenger omsetningsbasert kommune-HHI.
