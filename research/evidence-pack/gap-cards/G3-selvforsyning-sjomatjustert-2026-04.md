# G3 - Selvforsyningsgrad: sjømatjustert metode

Status: staged method card, eksportenergi mangler
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
