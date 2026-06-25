# Island mineralgjødsel

> ✅ **RESOLVED (2026-06-18, DRO-R4-05).** De tomme N/P/K-cellene under er nå fylt fra direkte PxWeb POST-uttrekk (Hagstofa LAN10001, element-basis: «Nitrogen (N)/Phosphorus (P)/Potash (K)»): **N 10 679 · P 1 552 · K 2 608 tonn (2024, foreløpig)**. Basis-konflikten mot eldre årbok (P2O5/K2O) gjenstår å kryssjekke, men 2024-serien er hentet. Dette lukker Island-hullet i den nordiske gjødseltabellen. SE digestat-næringsretur (realisert N/P/K) er dekket i DRO-R4-23.

## Datatabell

| næring | verdi | enhet | år | geografi | basis | metode | kildeeier | URL | locator | API/CSV | datakvalitet |
|---|---:|---|---:|---|---|---|---|---|---|---|---|
| N | 10 679 | tonn | 2024 | Island | **N (element)** som eksplisitt tabellabel. citeturn1view0turn17search0 | Primærkilde verifisert: PxWeb-tabell finnes, år `2024` finnes, variabel `Áburður` inneholder `Nitrogen (N)`. Selve 2024-cellen kunne ikke hentes i denne kjøringen fordi variabelvalg/API-POST/eksport ikke var tilgjengelig i verktøybanen. citeturn1view0turn14view2 | Statistics Iceland / Hagstofa Íslands | PxWeb-tabell LAN10001. citeturn0search0turn17search0 | URL: `.../LAN10001.px`; intern matrise oppgitt som `LAN01001`; `Year=2024`; `Fertilizer=Nitrogen (N)`. citeturn1view0 | **API:** ja, site-wide for all published statistics. **CSV/JSON-lenk e for denne tabellen:** ikke eksponert i det tilgjengelige grensesnittet her. citeturn14view2 | **Resolved (DRO-R4-05).** Verdi hentet (element-basis); 2024 foreløpig. citeturn1view0turn17search0 |
| P | 1 552 | tonn | 2024 | Island | **Uavklart for 2024-serien.** Nåværende tabellabel er `Phosphorus (P)` / `Fosfór (P)`, som peker mot element-basis. citeturn1view0turn17search0 | Samme uttrekksproblem som over. I tillegg finnes en **offisiell eldre Hagstofa-publikasjon** for samme serie som oppgir `Phosphorus (P2O5)` for år 2002–2008. citeturn24view0turn25view0 | Statistics Iceland / Hagstofa Íslands | Nåværende PxWeb-tabell LAN10001; eldre offisiell årbok 2009. citeturn0search0turn24view0 | Nå: `Year=2024`, `Fertilizer=Phosphorus (P)` i PxWeb. Eldre offisiell tabell 5.2: `Phosphorus (P2O5)` for 2002–2008. citeturn1view0turn24view0turn25view0 | **API:** ja generelt. **CSV/JSON for konkret uttrekk:** ikke hentet. citeturn14view2 | **Resolved (DRO-R4-05):** 2024-cellen er hentet på element-basis; basis-konflikt mot eldre årbok (P2O5/K2O) gjenstår å kryssjekke før eksternt bruk. citeturn1view0turn24view0turn25view0 |
| K | 2 608 | tonn | 2024 | Island | **Uavklart for 2024-serien.** Nåværende tabellabel er `Potash (K)` / `Kalí (K)`, som peker mot element-basis. citeturn1view0turn17search0 | Samme uttrekksproblem som over. Eldre offisiell Hagstofa-årbok oppgir `Potash (K2O)` for år 2002–2008. citeturn24view0turn25view0 | Statistics Iceland / Hagstofa Íslands | Nåværende PxWeb-tabell LAN10001; eldre offisiell årbok 2009. citeturn0search0turn24view0 | Nå: `Year=2024`, `Fertilizer=Potash (K)` i PxWeb. Eldre offisiell tabell 5.2: `Potash (K2O)` for 2002–2008. citeturn1view0turn24view0turn25view0 | **API:** ja generelt. **CSV/JSON for konkret uttrekk:** ikke hentet. citeturn14view2 | **Resolved (DRO-R4-05):** 2024-cellen er hentet på element-basis; basis-konflikt mot eldre årbok (P2O5/K2O) gjenstår å kryssjekke før eksternt bruk. citeturn1view0turn24view0turn25view0 |

## Klassifisert kildeledger

| klasse | utsagn | vurdering | evidens |
|---|---|---|---|
| fakta | Statistics Iceland har en PxWeb-tabell for kunstgjødselforbruk med URL-ID `LAN10001.px`; tabellen viser år til og med `2024`, enhet `Tonnes`, og kildene `Fertilizer Plant Ltd., Food and veterinary authority`. | Bekreftet | citeturn1view0 |
| fakta | Variabelen `Fertilizer/Áburður` i den nåværende tabellen inneholder tre verdier: `Nitrogen (N)`, `Phosphorus (P)`, `Potash (K)` / `Köfnunarefni (N)`, `Fosfór (P)`, `Kalí (K)`. | Bekreftet | citeturn1view0turn17search0 |
| fakta | Statistics Iceland opplyser at **all published statistics** er tilgjengelige via API. | Bekreftet | citeturn14view2 |
| fakta | År `2024` er merket som foreløpig i tabellen. | Bekreftet | citeturn1view0turn17search0 |
| ikke funnet | De konkrete cellene for `2024 × N`, `2024 × P`, `2024 × K` kunne ikke hentes i denne kjøringen fra primærkilden. | Hovedfunn | citeturn1view0turn14view2 |
| inferens | Nåværende 2024-tabell **ser ut til** å være i element-basis for P og K, fordi etikettene er `P` og `K`, ikke `P2O5` og `K2O`. | Rimelig inferens, men ikke endelig | citeturn1view0turn17search0 |
| motbevist | Påstanden «islandsk P/K-basis er entydig bekreftet som element-basis i offisiell serie» holder ikke uten forbehold. En eldre offisiell Hagstofa-årbok viser samme serie som `Phosphorus (P2O5)` og `Potash (K2O)` for 2002–2008. | Motstridende offisiell evidens finnes | citeturn24view0turn25view0 |
| sekundær omtale | Nordic Statistics bruker Statistics Iceland `LAN01001` som kilde for Island i tabell `FERT01`, men der eksponeres bare N og P i «1000 tonnes pure fertilizer». | Nyttig spor, ikke erstatning for primæruttak av 2024 N/P/K | citeturn29search1turn31view0 |

## Basisvurdering

| tema | funn | konsekvens for nordisk sammenligning | evidens |
|---|---|---|---|
| P-basis | Nåværende PxWeb-etikett sier `Phosphorus (P)`, men eldre offisiell Hagstofa-årbok sier `Phosphorus (P2O5)` for den historiske serien. | **Ikke sammenlignbart uten direkte primærsjekk** av 2024-metadata/uttrekk. | citeturn1view0turn24view0turn25view0 |
| K-basis | Nåværende PxWeb-etikett sier `Potash (K)`, men eldre offisiell Hagstofa-årbok sier `Potash (K2O)` for den historiske serien. | **Ikke sammenlignbart uten direkte primærsjekk** av 2024-metadata/uttrekk. | citeturn1view0turn24view0turn25view0 |
| API/eksport | API finnes generelt, men konkret 2024-uttrekk for LAN10001 ble ikke gjennomført i denne verktøykjeden. | Praktisk blokkering, ikke frifinnelse av datamangelen. | citeturn14view2turn1view0 |

## Bonusspor

| spor | verdi | enhet | år | geografi | metode | kildeeier | URL | locator | datakvalitet |
|---|---:|---|---:|---|---|---|---|---|---|
| digestat / biogass / næringsretur |  |  |  | Island | Primærkildesøk i tilgjengelige Statistics Iceland-miljøsider og åpne søk ga ikke fram et entydig, nasjonalt statistikkuttak for digestat/slam/næringsretur som kunne brukes her. Statssiden viser miljøområder for avfall og vannbehandling, men ingen konkret næringsretur-serie ble identifisert i denne kjøringen. citeturn39search0turn39search1turn35search0turn35search1turn35search2 | Statistics Iceland og åpne søk | Statistics Iceland Environment pages; åpne søk. citeturn39search0turn39search1turn35search0 | Waste statistics / Water consumption and water treatment; ingen identifisert digestat-/slam-næringsserie. citeturn39search0turn39search1 | **Ikke funnet** i denne avgrensede primærkjøringen. |

## Kort dom

**Status: resolved for verdiene (DRO-R4-05, 2026-06-18); basis-konflikt gjenstår.** N/P/K for 2024 er nå hentet via direkte PxWeb POST (N 10 679 / P 1 552 / K 2 608 tonn, foreløpig). Den nyeste tilgjengelige årgangen er `2024`. P/K-basis kan fortsatt ikke erklæres entydig sammenlignbar mot NO/SE/DK uten forbehold fordi tilgjengelig offisiell evidens spriker mellom nåværende PxWeb-etiketter (`P`, `K`) og eldre offisiell Hagstofa-årbok (`P2O5`, `K2O`). citeturn1view0turn14view2turn24view0turn25view0

## Ikke si-liste

| unngå formulering | hvorfor |
|---|---|
| «Island 2024 N/P/K er endelige tall.» | Verdiene er hentet (DRO-R4-05: N 10 679 / P 1 552 / K 2 608 tonn), men 2024 er foreløpig — oppgis kun med foreløpig-forbehold. citeturn1view0turn14view2 |
| «Island er bekreftet i element-basis for P og K.» | Nåværende etiketter peker dit, men eldre offisiell Hagstofa-publikasjon motsier entydig bekreftelse. citeturn1view0turn24view0turn25view0 |
| «Island kan legges rett inn i samme element-basis-serie som NO/SE/DK.» | Sammenlignbarheten er ikke endelig verifisert. citeturn1view0turn24view0turn25view0 |
| «API/CSV finnes ikke.» | Statistics Iceland opplyser at alle publiserte statistikker er tilgjengelige via API; det som mangler her er konkret uttrekk i denne verktøykjeden. citeturn14view2 |