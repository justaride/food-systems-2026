# Norge/FSD-indikatoraudit mot vårt eksisterende datagrunnlag

<!-- FSD_AUDIT_SUMMARY: {"indicators":60,"indicatorCrosswalkRows":60,"internalControlRows":4,"sources":31,"missingNorwayValues":18,"comparisonCounts":{"no_match":49,"same_theme_different_measure":8,"blocked_source":2,"complementary_only":2,"internal_conflict":3},"dispositionCounts":{"external_reference_only":28,"needs_primary_check":26,"dual_series":8,"no_import":2}} -->

**Tilgangsdato:** 2026-08-10

**FSD-eksport snapshot:** 2026-04-20

**Omfang:** 60 indikatorer fra Norway-profilen, 60 indikator-krysskoblinger og 4 eksplisitte interne kontrollrader.

## Konklusjon

FSD Norway-profilen er en bred sammenstillings- og benchmarkflate, ikke én norsk primærstatistikk. Profilen viser **29 av 60 indikatorer vurdert**, mens **14 indikatorer mangler tilstrekkelige Norge-data**. Benchmark-statusen er FSDs avledede sammenligning mot globalt benchmark/target og skal ikke lagres som norsk observasjon.

In governance terms, this is an **external benchmark surface**, **not a Norwegian primary series**, and **not production data**.

Dette auditpasset finner ingen grunnlag for blind import. De mest nyttige videre seriene er enten:

- en **dual series** for FSDs matbalanse-tilgjengelighet versus vår produksjon/selvforsyning;
- en **ekstern referanse** for kostnad/affordability av sunt kosthold;
- en separat **primærkontroll** av FSD/FAOSTAT GHG-serier;
- en eksplisitt intern konfliktlogg for selvforsyning, HHI, matsvinn og illustrerte flyter.

## Hva Norway-profilen faktisk måler

Profilens 60 indikatorer fordeler seg over FSD-temaene Governance, Resilience, Diets, Nutrition, and Health, Environment, Natural Resources, and Production og Livelihoods, Poverty, and Equity. Den tilgjengelige Norge-profilen har 12 «Benchmark Met», 11 «Close», 2 «Moderately Close», 1 «Far» og 3 «Very Far» blant de 29 vurderte.

Eksempler på målte størrelser:

| FSD-indikator | Råverdi | Visning | Enhet/år | Benchmark |
| --- | --- | --- | --- | --- |
| Food supply variability | 52 | 52 | kcal/capita/day / 2023 | Very Far |
| Cost of a healthy diet | 4.55 | 4.6 | PPP dollar/capita/day / 2024 | No benchmark |
| Population who cannot afford a healthy diet | 1.4 | 1.4 | % / 2024 | Benchmark Met |
| Fruit availability | 311.8630136986301 | 311.8630136986301 | g/capita/day / 2023 | Close |
| Vegetable availability | 401.0410958904109 | 401.0410958904109 | g/capita/day / 2023 | Benchmark Met |
| Food systems greenhouse gas emissions | 15024.7239 | 15024.7239 | kT CO2eq / 2022 | Moderately Close |
| Food systems greenhouse gas emissions change | 92.4859751192078 | 92.4859751192078 | % change relative to 2000-2010 country average baseline, scaled to 0 = 100 for interpretability / 2022 | Close |
| Greenhouse gas emissions intensity for milk | 0.6518 | 0.6518 | kg CO2eq/kg product / 2022 | Close |
| Greenhouse gas emissions intensity for beef | 16.3718 | 16.3718 | kg CO2eq/kg product / 2022 | Close |
| Unemployment | 4.42 | 4.42 | % working age population / 2020 | Far |

Råverdien og visningsverdien er lagret separat. For eksempel beholdes FSDs **4.55 PPP dollar/capita/day** som råverdi, mens visningsfeltet blir **4.6** etter den registrerte significant-figures-regelen. Visningsverdien skal aldri brukes i beregning eller differanse.

### Komplett indikatorliste

| Register-ID | FSD-ID | Indikator | Tema | Råverdi | Enhet/år | Status |
| --- | --- | --- | --- | --- | --- | --- |
| fsd-nor-66 | 66 | Civil society participation index | Governance | 0.985 | ikke oppgitt / 2023 | Benchmark Met |
| fsd-nor-190 | 190 | Urban population living in cities signed onto the Milan Urban Food Policy Pact | Governance | 0 | % / 2025 | No benchmark |
| fsd-nor-92 | 92 | Legal recognition of the right to food | Governance | mangler | ikke oppgitt / mangler | No benchmark |
| fsd-nor-201 | 201 | National food system transformation pathway | Governance | mangler | ikke oppgitt / mangler | No benchmark |
| fsd-nor-119 | 119 | Government effectiveness index | Governance | 1.79993534088135 | ikke oppgitt / 2023 | Benchmark Met |
| fsd-nor-146 | 146 | Food safety capacity | Governance | 100 | ikke oppgitt / 2020 | Benchmark Met |
| fsd-nor-202 | 202 | Health-related food environment policies | Governance | mangler | ikke oppgitt / mangler | No benchmark |
| fsd-nor-277 | 277 | Government accountability index | Governance | 1.834 | ikke oppgitt / 2023 | Benchmark Met |
| fsd-nor-176 | 176 | Open budget index | Governance | 80.0560747663551 | ikke oppgitt / 2023 | Benchmark Met |
| fsd-nor-136 | 136 | Public access to information (SDG 16.10.2) | Governance | mangler | ikke oppgitt / mangler | No benchmark |
| fsd-nor-225 | 225 | Disaster costs as share of GDP | Resilience | 0.0000353613119268926 | ikke oppgitt / 2020 | No benchmark |
| fsd-nor-94 | 94 | Dietary sourcing flexibility index | Resilience | 0.815378890680208 | ikke oppgitt / 2020 | Close |
| fsd-nor-155 | 155 | Mobile phone subscriptions | Resilience | 110.6788541 | Number per 100 people / 2022 | Benchmark Met |
| fsd-nor-241 | 241 | Social capital index | Resilience | 0.893955055298912 | ikke oppgitt / 2021 | Benchmark Met |
| fsd-nor-208 | 208 | Minimum species diversity | Resilience | 5.87634133878385 | % agricultural land / 2020 | Very Far |
| fsd-nor-169 | 169 | Conserved plant genetic resources (SDG 2.5.1a) | Resilience | 2246 | ikke oppgitt / 2024 | No benchmark |
| fsd-nor-166 | 166 | Conserved animal genetic resources (SDG 2.5.1b) | Resilience | 19 | ikke oppgitt / 2025 | No benchmark |
| fsd-nor-68 | 68 | Extreme coping strategies | Resilience | mangler | ikke oppgitt / mangler | No benchmark |
| fsd-nor-107 | 107 | Food price volatility | Resilience | 0.500588496620377 | ikke oppgitt / 2024 | Close |
| fsd-nor-179 | 179 | Food supply variability | Resilience | 52 | kcal/capita/day / 2023 | Very Far |
| fsd-nor-69 | 69 | Cost of a healthy diet | Diets, Nutrition, and Health | 4.55 | PPP dollar/capita/day / 2024 | No benchmark |
| fsd-nor-889 | 889 | Population who cannot afford a healthy diet | Diets, Nutrition, and Health | 1.4 | % / 2024 | Benchmark Met |
| fsd-nor-30 | 30 | Fruit availability | Diets, Nutrition, and Health | 311.8630136986301 | g/capita/day / 2023 | Close |
| fsd-nor-32 | 32 | Vegetable availability | Diets, Nutrition, and Health | 401.0410958904109 | g/capita/day / 2023 | Benchmark Met |
| fsd-nor-188 | 188 | Access to safe water (SDG 6.1.1) | Diets, Nutrition, and Health | 99.06248474 | % / 2024 | Close |
| fsd-nor-229 | 229 | Ultra-processed food sales | Diets, Nutrition, and Health | 1629.31540219002 | USD/capita / 2024 | Very Far |
| fsd-nor-164 | 164 | Nitrogen use efficiency | Environment, Natural Resources, and Production | 11.9368 | % / 2023 | No benchmark |
| fsd-nor-59 | 59 | Cereals yield | Environment, Natural Resources, and Production | 0.4219600000000001 | tonnes/ha / 2024 | No benchmark |
| fsd-nor-113 | 113 | Fruit yield | Environment, Natural Resources, and Production | 0.8662200000000001 | tonnes/ha / 2024 | No benchmark |
| fsd-nor-279 | 279 | Vegetable yield | Environment, Natural Resources, and Production | 2.55969 | tonnes/ha / 2024 | No benchmark |
| fsd-nor-88 | 88 | Cow's milk yield | Environment, Natural Resources, and Production | 7069 | 100 g/animal / 2024 | No benchmark |
| fsd-nor-43 | 43 | Beef yield | Environment, Natural Resources, and Production | 28.2 | kg/animal / 2024 | No benchmark |
| fsd-nor-152 | 152 | Minimum dietary diversity for women (SDG 2.2.4) | Diets, Nutrition, and Health | mangler | % / mangler | No benchmark |
| fsd-nor-22 | 22 | All five food groups consumption | Diets, Nutrition, and Health | mangler | % / mangler | No benchmark |
| fsd-nor-248 | 248 | Soft drink consumption | Diets, Nutrition, and Health | mangler | % / mangler | No benchmark |
| fsd-nor-162 | 162 | NCD-Protect | Diets, Nutrition, and Health | mangler | ikke oppgitt / mangler | No benchmark |
| fsd-nor-163 | 163 | NCD-Risk | Diets, Nutrition, and Health | mangler | ikke oppgitt / mangler | No benchmark |
| fsd-nor-284 | 284 | Zero fruit or vegetable consumption for adults | Diets, Nutrition, and Health | mangler | % / mangler | No benchmark |
| fsd-nor-105 | 105 | Fisheries health index | Environment, Natural Resources, and Production | 60.3255689041972 | ikke oppgitt / 2021 | Benchmark Met |
| fsd-nor-109 | 109 | Food systems greenhouse gas emissions | Environment, Natural Resources, and Production | 15024.7239 | kT CO2eq / 2022 | Moderately Close |
| fsd-nor-1103 | 1103 | Food systems greenhouse gas emissions change | Environment, Natural Resources, and Production | 92.4859751192078 | % change relative to 2000-2010 country average baseline, scaled to 0 = 100 for interpretability / 2022 | Close |
| fsd-nor-122 | 122 | Greenhouse gas emissions intensity for cereals (excluding rice) | Environment, Natural Resources, and Production | 0.1995 | kg CO2eq/kg product / 2022 | No benchmark |
| fsd-nor-127 | 127 | Greenhouse gas emissions intensity for rice | Environment, Natural Resources, and Production | mangler | kg CO2eq/kg product / mangler | No benchmark |
| fsd-nor-124 | 124 | Greenhouse gas emissions intensity for milk | Environment, Natural Resources, and Production | 0.6518 | kg CO2eq/kg product / 2022 | Close |
| fsd-nor-121 | 121 | Greenhouse gas emissions intensity for beef | Environment, Natural Resources, and Production | 16.3718 | kg CO2eq/kg product / 2022 | Close |
| fsd-nor-90 | 90 | Cropland area change | Environment, Natural Resources, and Production | 0.0617322403207508 | % change / 2022 | Close |
| fsd-nor-114 | 114 | Functional integrity | Environment, Natural Resources, and Production | 75.60844100262159 | ikke oppgitt / 2015 | Benchmark Met |
| fsd-nor-19 | 19 | Agricultural water withdrawal | Environment, Natural Resources, and Production | 0.214987277 | % / 2022 | Close |
| fsd-nor-196 | 196 | Pesticide use | Environment, Natural Resources, and Production | 0.78 | kg/ha / 2023 | Close |
| fsd-nor-205 | 205 | Prevalence of undernourishment (SDG 2.1.1) | Diets, Nutrition, and Health | 0 | % / 2024 | Benchmark Met |
| fsd-nor-203 | 203 | Population experiencing food insecurity (SDG 2.1.2) | Diets, Nutrition, and Health | 7.8 | % / 2024 | Close |
| fsd-nor-143 | 143 | Minimum dietary diversity for children (SDG 2.2.4) | Diets, Nutrition, and Health | mangler | % / mangler | No benchmark |
| fsd-nor-64 | 64 | Zero fruit or vegetable consumption for children | Diets, Nutrition, and Health | mangler | % population 6-23 months / mangler | No benchmark |
| fsd-nor-236 | 236 | Share of agriculture in GDP (SDG 2.a.1) | Livelihoods, Poverty, and Equity | 1.637871 | % GDP / 2023 | No benchmark |
| fsd-nor-275 | 275 | Unemployment | Livelihoods, Poverty, and Equity | 4.42 | % working age population / 2020 | Far |
| fsd-nor-273 | 273 | Underemployment | Livelihoods, Poverty, and Equity | 4 | % working age population / 2021 | Moderately Close |
| fsd-nor-243 | 243 | Social protection coverage | Livelihoods, Poverty, and Equity | mangler | % population / mangler | No benchmark |
| fsd-nor-242 | 242 | Social protection adequacy | Livelihoods, Poverty, and Equity | mangler | % welfare of beneficiary households / mangler | No benchmark |
| fsd-nor-183 | 183 | Child labor | Livelihoods, Poverty, and Equity | mangler | % children 5-17 / mangler | No benchmark |
| fsd-nor-240 | 240 | Female agricultural landowners (SDG 5.a.1) | Livelihoods, Poverty, and Equity | mangler | % female land owners / mangler | No benchmark |

## Overlapp mot vårt datagrunnlag

| FSD-indikator | Status | Disposisjon | Hovedgrunn |
| --- | --- | --- | --- |
| Food price volatility | same_theme_different_measure | dual_series | FSD måler prisvolatilitet med en modellert/avledet variasjonsindikator; intern 3,1 % er en bestemt mat-KPI-periode. Samme tema, ulik statistikk. |
| Food supply variability | blocked_source | no_import | FSD-indikatoren er beregnet standardavvik i kcal/capita/day over foregående fem år. Intern flows.json er eksplisitt illustrativ og har ikke samme måleenhet, observasjonsstatus eller tidsserie. |
| Cost of a healthy diet | complementary_only | external_reference_only | FSD er en internasjonalt sammenlignbar affordability-modell i PPP-dollar eller et estimat av befolkningsandel; våre kostholdsdata er normative/tematiske og har ingen legitim norsk differanse. |
| Population who cannot afford a healthy diet | complementary_only | external_reference_only | FSD er en internasjonalt sammenlignbar affordability-modell i PPP-dollar eller et estimat av befolkningsandel; våre kostholdsdata er normative/tematiske og har ingen legitim norsk differanse. |
| Fruit availability | same_theme_different_measure | dual_series | FSD måler tilgjengelig mengde fra nasjonal matbalanse (produksjon + import + lager minus anvendelser) i g/capita/day. Våre tall måler produksjon og selvforsyning; geografi/år er delvis sammenfallende, men enhet og denominator er ikke det. |
| Vegetable availability | same_theme_different_measure | dual_series | FSDs 401,04 g/capita/day er matbalanse-tilgjengelighet, mens intern 49 % er selvforsyning. De kan ikke subtraheres eller konverteres uten felles denominator og metode. |
| Cereals yield | same_theme_different_measure | dual_series | FSD er FAOSTAT-avling per hektar eller per dyr for siste tilgjengelige år. Intern verdi er total norsk produksjon i tonn og mangler felles denominator. |
| Fruit yield | same_theme_different_measure | dual_series | FSD er FAOSTAT-avling per hektar eller per dyr for siste tilgjengelige år. Intern verdi er total norsk produksjon i tonn og mangler felles denominator. |
| Vegetable yield | same_theme_different_measure | dual_series | FSD er FAOSTAT-avling per hektar eller per dyr for siste tilgjengelige år. Intern verdi er total norsk produksjon i tonn og mangler felles denominator. |

FSD «Availability of fruits/vegetables» er den tydeligste tematiske overlappen, men ikke en eksakt overlapp: FSD måler nasjonal matbalanse-tilgjengelighet i gram per capita per dag, mens våre 4 % frukt og 49 % grønnsaker er selvforsyningsgrader og value-chain har produksjonston. Det er derfor riktig å beholde **dual_series**, ikke velge en vinner ved navnlikhet.

### Eksakt og delvis overlapp

Dette passet finner **ingen exact_overlap** og **ingen partial_overlap** blant de 60 FSD-indikatorene. De åtte relevante treffene er derfor klassifisert som **same_theme_different_measure**: de deler tema med våre norske serier, men mangler samsvar i enhet, denominator, scope eller målemetode. Det er en viktig negativ konklusjon: FSD-tallene kan ikke gjøres til «våre» tall ved ren navnematching.

## Interne konflikter som ikke skal skjules

| Kontroll | Status | Konflikt | Neste steg |
| --- | --- | --- | --- |
| Intern kontroll: norsk selvforsyning | internal_conflict | 44 % er 2023-serien i ssb_landbruk/chart; 41,3 % og 34,9 % er 2024 value-chain-serier med annen kilde-/scopebeskrivelse. 34,9 % er feed-korrigert og skal ikke avrundes inn i 41,3 %. | Velg ikke kanonisk verdi ennå. Reproduser NIBIO/SSB-beregningen, dokumenter fisk-/fôrbehandling og versjoner seriene separat. |
| Intern kontroll: dagligvarekonsentrasjon | internal_conflict | 3445 − 3327 = 118, men differansen er ikke en tidsendring: denominatoren er butikkantall versus omsetningsandel. HHI-tallene er derfor ikke samme indikator. | Bruk 3327 som omsetnings-HHI og 3445 som butikkantalls-HHI med eksplisitt etikett; ikke publiser én som erstatning for den andre. |
| Intern kontroll: matsvinn | internal_conflict | 451 600 − 390 000 = 61 600 tonn, men år, avgrensning (spiselig versus total/estimert) og metode er ikke like. 407 100 tonn er i tillegg en separat value-chain-baseline. | Lås scopeordliste (spiselig/total, år, ledd), hent Matvett/NORSUS-tabellene og hold alle serier separate til reconciliert. |
| Intern kontroll: illustrerte verdikjedestrømmer | blocked_source | Visualiseringsvekter har ikke empirisk enhet eller fullstendig observasjonsgrunnlag. | Hold utenfor alle kvantitative benchmarker og eksporterte datapunkter. |

Spesielt:

- Selvforsyning er 44 % i eksisterende chart/SSB-data mot 41,3 % og 34,9 % i nyere value-chain-data. Dette er ikke en avrundingsfeil; år, kilde og fôr-/fiskescope må avklares.
- HHI 3445 er butikkantallsbasert, mens 3327 er omsetningsbasert. Differansen 118 er ikke en tidsserieendring.
- Matsvinn 390 000 tonn og 451 600 tonn har ulikt år og scope; 407 100 tonn ligger i tillegg som en separat value-chain-baseline.
- **flows.json** er en illustrativ prototype. Den kan ikke brukes som observerte tonn, kroner, handelsvolum eller frekvens.

## Rangering for videre bruk

Krysskoblingsstatusene er reproduserbare fra JSONL-registeret:

~~~json
{
  "comparisonCounts": {
    "no_match": 49,
    "same_theme_different_measure": 8,
    "blocked_source": 2,
    "complementary_only": 2,
    "internal_conflict": 3
  },
  "dispositionCounts": {
    "external_reference_only": 28,
    "needs_primary_check": 26,
    "dual_series": 8,
    "no_import": 2
  }
}
~~~

Anbefalt praksis er:

1. **Ta videre som dual series:** frukt-/grønnsakstilgjengelighet mot intern selvforsyning/produksjon, og yield mot produksjonsvolum.
2. **Bruk eksternt:** cost of a healthy diet og population who cannot afford a healthy diet, inntil vi har norsk husholdnings-/forbruksprimærkilde med samme definisjon.
3. **Primærkontroller først:** FAOSTAT food-system GHG og intensitetsserier; ikke sammenlign med intern nordisk seed uten Norge- og scope-samsvar.
4. **Ikke importer:** FSD benchmark-status som norsk verdi, illustrerte flyter og råserier uten definisjon/denominator.

## Kilde- og lisensregler

FSD-siden, FSD metadataeksporten, FSD full dataeksporten, underliggende primærkilder og interne kilder ligger som separate rader i source ledger. FSDs egen nedlastingsveiledning sier at sitat bør peke til underliggende primærkilde, samtidig som FSD bør krediteres som distribusjonsflate. Dette auditsettet bruker derfor **citable_with_note** for FSD-aggregert materiale: direkte locator, tilgangsdato og hash finnes, men FSDs beregningslag og underliggende primærdata må fortsatt beskrives.

FAOSTAT-kilder er merket med lisensnotat om CC-BY-4.0 der dette er oppgitt, men lisens må kontrolleres per datasett før redistribusjon. Interne JSON/TS-filer er **internal_context**, ikke ekstern primærkilde.

## Datagap og neste primærkontroller

- Hent og arkiver FAOSTAT-uttrekk for Food Balances, Food Supply Variability, CAHD, GT og EI med samme Norge-år som FSD.
- Reproduser selvforsyningsseriene fra NIBIO/SSB og dokumenter inklusjon av fisk, importert kraftfôr og eventuell sjømateksportjustering.
- Reconciler matsvinn med eksplisitt scopeordliste (spiselig/total, husholdning/verdikjede, år).
- Hold omsetnings-HHI og butikkantalls-HHI som ulike metrikker, med hver sin kilde og denominator.
- Kontroller indikatorer med utilstrekkelige data før de eventuelt går fra **needs_primary_check** til **candidate_import**.

## Artefakter og reproduksjon

- Register: [norway-fsd-indicators-2026-08-10.jsonl](./norway-fsd-indicators-2026-08-10.jsonl)
- Krysskobling: [norway-fsd-crosswalk-2026-08-10.jsonl](./norway-fsd-crosswalk-2026-08-10.jsonl)
- Kildelog: [norway-fsd-source-ledger-2026-08-10.jsonl](./norway-fsd-source-ledger-2026-08-10.jsonl)
- Snapshotmanifest: [norway-fsd-snapshot-manifest-2026-08-10.json](./norway-fsd-snapshot-manifest-2026-08-10.json)
- Validering: **npm run landscape:norway-fsd:validate**

Ingen Prisma-, API- eller produksjonsdatabasefiler inngår i denne fasen.

### Eksterne metodereferanser

- [Food Systems Dashboard – Norway](https://www.foodsystemsdashboard.org/countries/nor)
- [FSD data sources and methodology](https://www.foodsystemsdashboard.org/information/data-sources-and-methodology)
- [FSD downloads and citation guidance](https://www.foodsystemsdashboard.org/downloads?default-indicator=69)
- [FAOSTAT Cost and Affordability of a Healthy Diet](https://www.fao.org/faostat/en/#data/CAHD)
- [FAOSTAT Food Balance Sheets](https://www.fao.org/faostat/en/#data/FBS)
- [FAOSTAT GHG emissions totals](https://www.fao.org/faostat/en/#data/GT)
- [FAOSTAT GHG emissions intensity](https://www.fao.org/faostat/en/#data/EI)

_Rapporten er generert fra de tre JSONL-artiklene og kan kontrolleres med validatoren._
