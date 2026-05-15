# G3 - Selvforsyningsgrad: sjømatjustert metode

Status: staged method card, proxy eksportenergi-input opprettet, sluttresultat sperret
Gap-ID: G3
Lane: hurtig-plukk
Dato: 2026-04-29

## Hva kan brukes nå

- NIBIO er primær inngang for norsk selvforsyningsgrad og engrosforbruk.
- Foreløpige NIBIO-beregninger for 2024 viser 35 prosent for norskproduserte jordbruksråvarer korrigert for import av kraftfôr til husdyr.
- NIBIO presiserer at modellen for matforsyningsstatistikk bygger på `Produksjon + Import - Eksport = Forbruk`, og at tallene kan beregnes i både kilo og energi.
- NIBIO peker eksplisitt på at metoden per i dag korrigerer for import av kraftfôr til husdyr, men ikke import av fôr til fisk eller andre innsatsfaktorer. Det er derfor ikke metodisk trygt å bruke ett "sjømateksport-justert" tall uten å definere formelen først.
- NIBIOs 2025-artikkel viser at selvforsyning ofte omtales som 40-50 prosent over tid, og at 2023 ble oppgitt til 47 prosent, men også at regnestykket kan settes opp på ulike måter.

## Kilder

- NIBIO, Selvforsyningsgrad og engrosforbruk: https://www.nibio.no/tema/landbruksokonomi/selvforsyningsgrad-og-engrosforbruk
- NIBIO, "Ikkje lett å bli klok på sjølvforsyning": https://www.nibio.no/om-nibio/forskning-nytter/divisjon-for-kart-og-statistikk/forskning-nytter-kart-og-statistikk-2024/ikkje-lett-a-bli-klok-pa-sjolvforsyning
- Lokal eksisterende kildepeker: `research/_plans/DESK-RESEARCH-PLAN.md`
- Lokal policyflate som må revideres mot NIBIO 2024: `public/data/food-systems/policy-landscape.json`

## Foreslått metodevalg

G3 bør ikke presenteres som ett fasitsvar før vi velger indikator:

| Indikator | Bruk | Risiko |
|---|---|---|
| Fôrkorrigert jordbruksandel | Politisk mål og NIBIO 2024-tall | Utelater fiskefôr og bredere innsatsfaktorimport |
| Inkludert fisk/sjømat | Viser Norges samlede biomasse/eksportstyrke | Kan gi kunstig høy beredskapsfortelling fordi mye sjømat eksporteres |
| Ekskludert fisk | Bedre for daglig norsk matforsyning | Mister sjømatens reelle mat- og eksportrolle |
| Sjømateksport-justert scenario | Kan svare på møtespørsmålet direkte | Må bygges som scenario, ikke hentes som standardindikator |

## Må fortsatt tettes

- Laste ned og lese NIBIOs `Engrosforbruk av mat 1999-2024`-regneark.
- Velge formel for sjømateksport-justert scenario: for eksempel beredskapsorientert innenlandsk tilgjengelig energi dersom en gitt andel sjømateksport holdes i Norge.
- Oppdatere lokale flater som fortsatt bruker 47 prosent uten å skille år, metode og fôrkorrigering.

## Dypning 2026-04-29

Lokale og eksterne spor peker mot at vi bør bruke disse tallene som foreløpig hovedanker:

- 2024 selvforsyningsgrad: 41,3 prosent.
- 2023 selvforsyningsgrad: 46,6 prosent.
- 2024 selvforsyningsgrad korrigert for importert kraftfôr: 34,9 prosent.
- Politisk mål: 50 prosent selvforsyningsgrad korrigert for import av fôrråvarer.

Viktig korrigering: `public/data/food-systems/policy-landscape.json` har fortsatt eldre/uklare formuleringer om 47 prosent og "bruttoselvforsyning ~93% inkl. fiskeeksport". Den flaten bør revideres før den brukes i rapport/app.

Kildeanker lokalt:

- `research/bibliotek/beredskap/nibio-selvforsyning-2026.md`.
- `research/bibliotek/beredskap/nibio-selvforsyning-metode.md`.
- `src/lib/data/insights.ts`, post om fall fra 41,6/41,3-ish til 34,9 må kontrolleres mot NIBIO/Helsedirektoratet før publisering.

## Akseptansegate

Kortet kan oppgraderes til integrerbart når vi har én valgt hovedindikator, ett scenario for sjømateksport, og en tydelig note som forklarer hvorfor 34,9 prosent, 41,3 prosent, 47 prosent og "nær 100 prosent med fisk" ikke er samme mål.

## Oppdatering 2026-05-15

Metodevalg er nå låst i `research/_plans/self-sufficiency-seafood-adjusted-method-note-2026-05-15.md`:

- Hovedanker: NIBIO `Totalt inkl. fisk`, `Nøkkeltall`, celler `AB5=41,3` og `AB6=34,9`.
- Scenariofamilie: energi-/kaloribasert retensjon av sjømateksport.
- Scenarioantakelser: 0, 25 og 50 prosent av sjømateksportens energi hypotetisk holdt i Norge.
- Fiskefôrkorreksjon: ikke inkludert før fiskefôrråvarer og metodebeslutning er låst.

CSV er oppdatert med scenario-spesifikasjoner:

- `research/data/nordic/self-sufficiency/self-sufficiency-seafood-adjusted-scenarios-2026-05-15.csv`

Dette lukker metodebeslutningen, men ikke resultatberegningen. Neste datagate er å hente sjømateksport 2024 med art-/produktmiks og omregne til energi med dokumentert spiselig andel.

## Proxy-input 2026-05-15

Første beregningsinput er opprettet:

- `research/data/nordic/self-sufficiency/no-seafood-export-energy-inputs-2024.csv`

Panelet bruker Sjømatrådets 2024-årsoppsummering for hovedvolumene og Matvaretabellen for energifaktorer. Det gir en toppart-/produktproxy på 2 785,216 Tcal sjømateksportenergi og retensjonsproxyer på 696,304 Tcal (25 prosent) og 1 392,608 Tcal (50 prosent).

## Denominator-kandidat 2026-05-15

Foreloepig denominator er opprettet:

- `research/data/nordic/self-sufficiency/no-food-energy-denominator-candidate-2024.csv`

Helsedirektoratet 2025 oppgir 2024 engros energi i matforsyningsstatistikken til `11,1 MJ/person/dag`. Med SSB start-/sluttbefolkning for 2024 gir dette en mean-population proxy på `5 572 271,5` personer og en denominator-kandidat på `5 395,807 Tcal/år`.

Status forblir `exclude`/ikke rapportklar: top-species energiinputet er fortsatt bare et testgrunnlag, spiselig yield er delvis proxy, og denominator må omtales som engros matforsyning heller enn faktisk energiinntak.

## SSB-HS produktmiks 2026-05-15

Primærstatistisk produktmiksuttrekk er opprettet:

- `research/data/nordic/self-sufficiency/no-seafood-export-product-mix-ssb-hs-2024.csv`

Uttrekket summerer SSB tabell `08801` for eksport 2024 over HS `03`, `1504`, `1604`, `1605` og `230120`. Valgt sjømatrelatert HS-scope gir `2 589 296 tonn`, inkludert `105 185,395 tonn` fiskeolje og `99 633,442 tonn` fiskemel/pellets som ikke skal behandles som direkte matenergi uten egen scopebeslutning.

Neste blocker er ikke lenger å finne produktmiks, men å mappe HS-radene til art, produktform, spiselig yield og Matvaretabellen-/annen energifaktor. G3 forblir `exclude`.

## HS-til-energi/yield-kandidat 2026-05-15

Første energimapping er opprettet:

- `research/data/nordic/self-sufficiency/no-seafood-hs-energy-yield-mapping-candidate-2024.csv`
- `research/data/nordic/self-sufficiency/no-seafood-hs-manual-review-2024.csv`
- `research/data/nordic/self-sufficiency/no-seafood-hs-scope-decisions-2024.csv`
- `research/data/nordic/self-sufficiency/no-seafood-hs-yield-review-2024.csv`

Panelet mapper `2 309 198,600 tonn` til kandidatenergi og summerer til `3 203,326 Tcal`. Retensjonskandidater er `800,832 Tcal` ved 25 prosent og `1 601,663 Tcal` ved 50 prosent. Mot engros-denominator-kandidaten (`5 395,807 Tcal/år`) tilsvarer dette ca. `14,842` og `29,683` prosentpoeng brutto tillegg i scenario-testen.

Status forblir `exclude`: `203 769,019 tonn` fiskeolje og non-food fiskemel er holdt utenfor direkte matenergi, `52 560,981 tonn` krever manuell review, og flere yield-/produktformvalg er fortsatt proxy. De ni manuelle HS-radene er nå skilt ut i egen kø med `exclude` på hver rad til byprodukt-/organmiks, edible meal-produktmiks eller permanent ekskludering er metodegodkjent.

Core scope er strammet: `1504` fiskeoljer og `230120` non-food fiskemel/pellets er eksplisitt ekskludert fra direkte matenergi, mens `03057900` og `03099000` er flyttet til manuell review fordi SSB-labelene sier `egnet til menneskeføde`. Proxy-yield-reviewen viser at `2 728,075 Tcal` av kandidatenergien fortsatt krever review før G3 kan løftes fra `exclude`.
