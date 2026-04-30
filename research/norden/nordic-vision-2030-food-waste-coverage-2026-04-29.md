# Nordic Vision 2030: matsvinn-dekning i Food Systems 2026

**Dato:** 2026-04-29  
**Status:** Runtime snapshot fra `CountryMetric`, ikke ny ekstern primærinnhenting.  
**Datafil:** `research/data/nordic/food-waste/normalized/nordic-food-waste-countrymetric-snapshot.csv`  
**Meta:** `research/data/nordic/food-waste/normalized/nordic-food-waste-countrymetric-snapshot.meta.json`

## Kort konklusjon

Prosjektet har allerede en brukbar nordisk matsvinn-proxy for Vision 2030: alle fem nordiske land har `foodWastePerCapita.Totalt` for 2020 og 2022, og Norge/Island har nyere 2024-estimat. Det er nok til en intern sammenligning av nivå og retning.

Det er ikke nok til en ekstern sterk påstand om verdikjedeledd per land. Norge er klart sterkest strukturert, Sverige har gode 2024-ledddata for butiks- og konsumentleddet, mens Danmark, Finland og Island fortsatt mangler harmonisert leddvis tonnasje i runtime.

## Dekning per land

| Land | Runtime-rader | Siste per-capita total | Tonnasje totalt | Leddvis dekning | Bruk nå |
|---|---:|---|---|---|---|
| Danmark | 2 | 73 kg/capita, 2022, Miljøstyrelsen 2023 | Nei | Nei | Bruk til 2020/2022 nivå, ikke leddclaim |
| Finland | 2 | 101 kg/capita, 2022, LUKE/Eurostat 2023 | Nei | Nei | Bruk til 2020/2022 nivå, ikke leddclaim |
| Island | 3 | 84 kg/capita, 2024, Umhverfisstofnun 2025 est. | Nei | Nei | Bruk som foreløpig nivå med estimat-forbehold |
| Norge | 30 | 82 kg/capita, 2024, Matvett 2025 est. | Ja | Ja | Sterkest runtime-dekning; bruk som metodebenchmark |
| Sverige | 10 | 127 kg/capita, 2022, Naturvårdsverket 2023 | Delvis | Ja, 2024 for butikk-/konsumentledd | Bruk 2024-ledddata, men ikke total all-chain 2024 |

## Operativ vurdering

| Spørsmål | Status |
|---|---|
| Kan vi vise nordisk matsvinn per person? | Ja, for 2020/2022 på alle fem land. |
| Kan vi vise siste år likt for alle land? | Nei. Norge og Island har 2024-estimat; Sverige har 2024 ledddata; Danmark/Finland står på 2022. |
| Kan vi vise verdikjedeledd på tvers av land? | Ikke ennå. Norge har komplett intern serie; Sverige har detaljert butikk-/konsumentledd; DK/FI/IS trenger primæruttrekk. |
| Kan dette brukes i Vision 2030-brief? | Ja, som intern indikasjon under responsible consumption/production og matsvinn. Ikke presenter som full harmonisert nordisk offisiell indikator. |

## Neste kontrollerte steg

1. Hent primærtabeller for Danmark og Finland fra Miljøstyrelsen/Luke/Eurostat med leddfordeling dersom briefen trenger nordisk verdikjedesammenligning.
2. Avklar Island-kilden bak 2024-estimatet før ekstern bruk.
3. Skill `foodWastePerCapita.Totalt` fra svenske 2024 butiks-/konsumentledddata i visualiseringer; de må ikke blandes som samme scope.
4. Bruk `Breaking Barriers` som nordisk policy-/barrierekilde, men bruk landenes primærkilder for tall.
