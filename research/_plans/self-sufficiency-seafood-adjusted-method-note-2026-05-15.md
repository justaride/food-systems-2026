# Self-sufficiency seafood-adjusted method note

Dato: 2026-05-15  
Gap: G3  
Status: metode-scaffold, ikke ferdig scenario

## Beslutning

G3 skal ikke lukkes med ett tall. Selvforsyning skal deles i minst tre indikatorfamilier:

1. `official_unadjusted_agriculture`
2. `official_feed_corrected_agriculture`
3. `seafood_export_adjusted_scenario`

De tre svarer paa ulike spoersmaal og skal ikke presenteres som samme maal.

## Metodekrav

Foer scenarioet kan fylles med tall maa vi velge:

- om matmengde maales i kg, energi eller protein
- om sjømat behandles som innenlandsk tilgjengelig mat, eksportvare eller beredskapsreserve
- om importert fiskefôr skal korrigeres
- hvilke eksportandeler som hypotetisk holdes i Norge
- hvordan import/eksport av jordbruksmat og sjømat holdes atskilt

## Foreloepige indikatorer

| scenario_id | Bruk | Status |
|---|---|---|
| `official_unadjusted_agriculture` | NIBIO/engrosforbruk uten fôrkorrigering | source-found |
| `official_feed_corrected_agriculture` | politisk relevant fôrkorrigert jordbruksandel | source-found |
| `seafood_export_adjusted_scenario` | beredskapsscenario for sjømatjustering | method_decision_needed |

## Stop-regel

Ikke bruk formuleringer som "nesten selvforsynt med fisk" eller "sjømatjustert selvforsyning" uten scenarioformel, enhet, eksportantakelse og kilde.

## Neste handling

1. Hent eller laas NIBIO-regneark for engrosforbruk 1999-2024.
2. Velg energi- eller kg-basert scenario.
3. Fyll `research/data/nordic/self-sufficiency/self-sufficiency-seafood-adjusted-scenarios-2026-05-15.csv`.
4. Revider eldre app-/policytekst som blander 34,9, 41,3, 47 og fiskebasert "naer 100".
