# Self-sufficiency seafood-adjusted method note

Dato: 2026-05-15  
Gap: G3  
Status: NIBIO 2024-rader cellelokalisert, sjømat-scenarioformel låst, proxy eksportenergi-input opprettet, sluttresultat sperret

## Beslutning

G3 skal ikke lukkes med ett tall. Selvforsyning skal deles i minst tre indikatorfamilier:

1. `official_unadjusted_agriculture`
2. `official_feed_corrected_agriculture`
3. `seafood_export_adjusted_scenario`

De tre svarer paa ulike spoersmaal og skal ikke presenteres som samme maal.

Scenariofamilien for `seafood_export_adjusted_scenario` er nå valgt som et energi-/kaloribasert retensjonsscenario:

- `seafood_export_retention_0pct`
- `seafood_export_retention_25pct`
- `seafood_export_retention_50pct`

Dette er scenario-spesifikasjoner, ikke beregnede selvforsyningsprosenter. Resultatfelt skal først fylles når sjømateksport er omregnet til energi med eksplisitt art-/produktmiks, spiselig andel og kilde.

## Proxy-input 2026-05-15

Et første proxy-panel er opprettet for å teste beregningskjeden:

- `research/data/nordic/self-sufficiency/no-seafood-export-energy-inputs-2024.csv`

Panelet bruker Norges sjømatråds 2024-årsoppsummering for eksportvolum per hovedart/-produkt og Matvaretabellen for energi per 100 g spiselig del. Det dekker 2 183 197 tonn av total eksport på om lag 2,8 mill. tonn og summerer til 2 785,216 Tcal som proxy. 25 og 50 prosent retensjon gir henholdsvis 696,304 og 1 392,608 Tcal.

Dette er ikke et sluttresultat fordi:

- produktmiks er ikke fullstendig splittet
- spiselig andel er delvis proxy
- tørkede/saltede produkter bruker foreløpig rå torsk som energiproxy
- eksportenergi er bare koblet til en foreløpig engros-denominator kandidat
- importert fiskefôr er fortsatt ikke korrigert

## Denominator-kandidat 2026-05-15

Et foreløpig denominator-panel er opprettet:

- `research/data/nordic/self-sufficiency/no-food-energy-denominator-candidate-2024.csv`

Kandidaten bruker Helsedirektoratets `Utviklingen i norsk kosthold 2025`, kapittel 5/tabell 7: 2024 matforsyningsstatistikk på engrosnivå er `11,1 MJ/person/dag`. Dette er kombinert med SSB-befolkning ved start og slutt av 2024 (`5 550 203` og `5 594 340`) som mean-population proxy (`5 572 271,5`). Beregnet denominator er `5 395,807 Tcal/år`.

Status: `warn_user`, ikke sluttresultat. Den må omtales som engros matforsyning, ikke faktisk energiinntak. Den erstatter likevel forrige åpne denominator-gate og gjør neste G3-gate mer presis: HS-til-energi/yield-mapping er nå hovedblocker.

## SSB-HS produktmiks 2026-05-15

Et første primærstatistisk produktmiksuttrekk er opprettet:

- `research/data/nordic/self-sufficiency/no-seafood-export-product-mix-ssb-hs-2024.csv`

Uttrekket bruker SSB tabell `08801` for eksport 2024, `Mengde 1 (M1)`, summert over alle land for HS-familiene `03`, `1504`, `1604`, `1605` og `230120`. Valgte sjømatrelaterte HS-familier summerer til `2 589 296 tonn`.

Foreloepig scopefordeling:

| Scope | Tonn 2024 | G3-bruk |
|---|---:|---|
| hel/sløyd fisk og skalldyr | 1 862 431,964 | må mappes til art + spiselig andel |
| filet/fiskekjøtt | 343 155,770 | må mappes til produktform + energifaktor |
| prosessert/konservert fisk | 102 763,078 | trenger produktspesifikk energi/yield |
| spiselige biprodukter/rogn | 57 220,444 | må vurderes separat |
| fiskeolje | 105 185,395 | scopebeslutning; ikke direkte matenergi før end use er låst |
| fiskemel/pellets utjenlig til menneskeføde | 99 633,442 | ekskluder fra direkte matenergi med mindre feed/oil-scenario legges til |
| prepared seafood | 16 924,890 | trenger energimapping |
| manuell review | 1 981,017 | må klassifiseres før eventuell bruk |

Dette erstatter ikke energiberegningen. Det flytter neste blocker fra "hent produktmiks" til "map HS-radene til art, produktform, spiselig yield og energifaktor".

## HS-til-energi/yield-kandidat 2026-05-15

Et første HS-til-energi/yield-panel er opprettet:

- `research/data/nordic/self-sufficiency/no-seafood-hs-energy-yield-mapping-candidate-2024.csv`
- `research/data/nordic/self-sufficiency/no-seafood-hs-manual-review-2024.csv`
- `research/data/nordic/self-sufficiency/no-seafood-hs-scope-decisions-2024.csv`
- `research/data/nordic/self-sufficiency/no-seafood-hs-yield-review-2024.csv`

Panelet mapper `2 309 198,600 tonn` av HS-produktmiksen til art, produktform, Matvaretabellen-energifaktor og foreløpig spiselig yield. Kandidatenergien summerer til `3 203,326 Tcal`. 25 og 50 prosent retensjon gir henholdsvis `800,832 Tcal` og `1 601,663 Tcal`, tilsvarende ca. `14,842` og `29,683` prosent av engros-denominator-kandidaten (`5 395,807 Tcal/år`).

Status: `exclude`. Panelet ekskluderer `203 769,019 tonn` fiskeolje og non-food fiskemel fra direkte matenergi og lar `52 560,981 tonn` stå til manuell review. De ni åpne HS-radene er skilt ut i egen review-kø, med alle rader fortsatt `exclude` til byprodukt-/organmiks, edible meal-produktmiks eller permanent ekskludering er metodegodkjent. Flere store rader bruker proxy-yield, særlig laks/ørret, makrellsesong, lodde som sild-proxy, mindre arter mappet via proxy og tørket/saltet produktform.

Scope-beslutning for core G3 er nå eksplisitt: HS `1504` fiskeoljer og HS `230120` non-food fiskemel/pellets holdes utenfor direkte matenergi. To rader som labeles `egnet til menneskeføde` (`03057900`, `03099000`) er flyttet fra scope-exclusion til manuell review. Proxy-yield-reviewen viser at `1 780 683,461 tonn` og `2 728,075 Tcal` av kandidatenergien fortsatt bygger på proxyvalg som må reviewes før resultatpromotering.

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

Valgte metodebeslutninger:

- Matmengde måles i energi/kalorier, ikke kg.
- Sjømat behandles som en hypotetisk beredskapsreserve bare i scenarioet, ikke i offisiell selvforsyningsgrad.
- Importert fiskefôr korrigeres ikke i første scenario.
- Eksportandeler som hypotetisk holdes i Norge settes til 0, 25 og 50 prosent.
- Import/eksport av jordbruksmat og sjømat holdes atskilt i kildelaget.

Anbefalt startformel for scenario:

```text
scenario_energy_available =
  official_domestic_food_energy
  + retained_seafood_export_energy
  - imported_feed_dependency_adjustment_if_chosen

retained_seafood_export_energy =
  seafood_export_energy * retention_assumption_pct
```

Start med energi/kalorier, ikke kg, fordi NIBIO-metoden er energibasert. Kjør de tre retensjonsantakelsene over som scenarioer for sjømateksport holdt tilbake i Norge i en krise. Ikke korriger for importert fiskefôr i første scenario før fiskefôrråvarer og metodebeslutning er låst.

## Foreloepige indikatorer

| scenario_id | Bruk | Status |
|---|---|---|
| `official_unadjusted_total_incl_fish` | NIBIO/engrosforbruk uten fôrkorrigering | cell_locator_locked |
| `official_feed_corrected_total_incl_fish` | fôrkorrigert selvforsyning inkl. fisk; husdyrkraftfôr korrigert | cell_locator_locked |
| `seafood_export_retention_0pct` | kontrollscenario uten tilbakeholdt sjømateksport | scenario_formula_locked |
| `seafood_export_retention_25pct` | moderat beredskapsretensjon | scenario_formula_locked; hs_energy_mapping_candidate_created; denominator_candidate_created |
| `seafood_export_retention_50pct` | høy beredskapsretensjon | scenario_formula_locked; hs_energy_mapping_candidate_created; denominator_candidate_created |

## Stop-regel

Ikke bruk formuleringer som "nesten selvforsynt med fisk" eller "sjømatjustert selvforsyning" uten scenarioformel, enhet, eksportantakelse og kilde.

## Neste handling

1. Review `research/data/nordic/self-sufficiency/no-seafood-hs-yield-review-2024.csv`: lås spiselig andel for laks/ørret, makrellsesong, tørket/saltet produktform og lodde-proxy.
2. Lukk review-køen i `research/data/nordic/self-sufficiency/no-seafood-hs-manual-review-2024.csv` eller dokumenter permanent ekskludering for de `52 560,981 tonn`.
3. Avklar om engros-denominator (`11,1 MJ/person/dag`) er riktig denominator for scenarioet eller om NIBIO/Helsedirektoratet har et bedre direkte uttrekk.
4. Beregn output for 0/25/50 prosent retensjon i `research/data/nordic/self-sufficiency/self-sufficiency-seafood-adjusted-scenarios-2026-05-15.csv` først etter at HS-til-energi/yield-mapping er låst.
