# Self-sufficiency seafood-adjusted method note

Dato: 2026-05-15  
Gap: G3  
Status: NIBIO 2024-rader cellelokalisert, sjømat-scenario ikke ferdig

## Beslutning

G3 skal ikke lukkes med ett tall. Selvforsyning skal deles i minst tre indikatorfamilier:

1. `official_unadjusted_agriculture`
2. `official_feed_corrected_agriculture`
3. `seafood_export_adjusted_scenario`

De tre svarer paa ulike spoersmaal og skal ikke presenteres som samme maal.

## Lokale verdier som kan brukes internt

NIBIO-ankere for 2024 kan brukes som cellelokalisert primærgrunnlag for analyse, men ikke som ferdig sjømatjustert scenario:

| scenario_id | 2024-verdi | Enhet | Bruk |
|---|---:|---|---|
| `official_unadjusted_total_incl_fish` | 41,3 | prosent | ukorrigert total selvforsyningsgrad inkl. fisk, energibasis |
| `official_feed_corrected_total_incl_fish` | 34,9 | prosent | total selvforsyningsgrad inkl. fisk, korrigert for importert kraftfôr til husdyrproduksjon |

Supplerende referanser:

- 2023 ukorrigert selvforsyning: 46,6 prosent.
- Politisk mål: 50 prosent, korrigert for import av fôrråvarer.

## Primærlocator låst

- NIBIO-side: `https://www.nibio.no/tema/landbruksokonomi/selvforsyningsgrad-og-engrosforbruk`
- Vedlegg: `Engrosforbruk av mat 1999-2024` / `Engrosforbruk per innbygger 1999-2024.xlsx`
- Ark: `Nøkkeltall`
- Radgruppe: `Totalt inkl. fisk`
- Årskolonne: `AB = 2024`
- Celle `AB5`: `41,3`, label `Selvforsyningsgrad 1`
- Celle `AB6`: `34,9`, label `Selvforsyningsgrad 2`
- Definisjon rad 17: `Selvforsyningsgrad 1 = (forbruk-import)/forbruk`
- Definisjon rad 18: `Selvforsyningsgrad 2 = (produksjon-eksport)/forbruk`, korrigert for import av kraftfôr til husdyrproduksjon

Merk: radgruppen er `Totalt inkl. fisk`. Den fôrkorrigerte raden korrigerer for importert kraftfôr til husdyrproduksjon, ikke fiskefôr.

## Metodekrav

Foer scenarioet kan fylles med tall maa vi velge:

- om matmengde maales i kg, energi eller protein
- om sjømat behandles som innenlandsk tilgjengelig mat, eksportvare eller beredskapsreserve
- om importert fiskefôr skal korrigeres
- hvilke eksportandeler som hypotetisk holdes i Norge
- hvordan import/eksport av jordbruksmat og sjømat holdes atskilt

Anbefalt startformel for scenario:

```text
scenario_energy_available =
  official_domestic_food_energy
  + retained_seafood_export_energy
  - imported_feed_dependency_adjustment_if_chosen

retained_seafood_export_energy =
  seafood_export_energy * retention_assumption_pct
```

Start med energi/kalorier, ikke kg, fordi NIBIO-metoden er energibasert. Kjør minst tre retensjonsantakelser: 0 prosent, 25 prosent og 50 prosent av sjømateksport holdt tilbake i Norge i en krise. Ikke korriger for importert fiskefôr i første scenario før fiskefôrråvarer og metodebeslutning er låst.

## Foreloepige indikatorer

| scenario_id | Bruk | Status |
|---|---|---|
| `official_unadjusted_total_incl_fish` | NIBIO/engrosforbruk uten fôrkorrigering | cell_locator_locked |
| `official_feed_corrected_total_incl_fish` | fôrkorrigert selvforsyning inkl. fisk; husdyrkraftfôr korrigert | cell_locator_locked |
| `seafood_export_adjusted_scenario` | beredskapsscenario for sjømatjustering | method_decision_needed |

## Stop-regel

Ikke bruk formuleringer som "nesten selvforsynt med fisk" eller "sjømatjustert selvforsyning" uten scenarioformel, enhet, eksportantakelse og kilde.

## Neste handling

1. Hent eller laas NIBIO-regneark for engrosforbruk 1999-2024.
2. Velg energi- eller kg-basert scenario.
3. Fyll `research/data/nordic/self-sufficiency/self-sufficiency-seafood-adjusted-scenarios-2026-05-15.csv`.
4. Revider eldre app-/policytekst som blander 34,9, 41,3, 47 og fiskebasert "naer 100".
