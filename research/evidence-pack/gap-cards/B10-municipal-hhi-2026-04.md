# B10 - Municipal HHI: butikkantall-proxy for lokal konkurranse

Status: dataartefakt opprettet, butikkantall-proxy delvis integrerbar
Gap-ID: B10
Lane: hurtig-plukk
Dato: 2026-04-29

## Metode

Dette kortet bruker et første proxy-mål for lokal HHI:

- Butikkpunkt fra `public/data/food-systems/{land}/stores.json`.
- Kommunegrenser fra `public/data/food-systems/{land}/municipalities*.geojson`.
- Kjedetilknytning/forelder fra `src/lib/config/countries/*.ts`.
- HHI beregnet som sum av kvadrerte butikkandeler per forelder innen hver kommune.

Dette er ikke omsetningsbasert HHI. Det må merkes som `store-count proxy` helt til vi har omsetning per kommune/kjede.

## Beregningsstatus

| Land | Butikker | Assigned til kommune | Uassigned | Kommuner med butikker | Median HHI, kommuner med minst 3 butikker | Kommuner med minst 3 butikker og HHI >= 2500 |
|---|---:|---:|---:|---:|---:|---:|
| Norge | 3 849 | 3 849 | 0 | 357/357 | 4 275 | 287 |
| Sverige | 5 049 | 5 049 | 0 | 290/290 | 3 299 | 258 |
| Danmark | 3 869 | 3 855 | 14 | 98/98 | 2 305 | 30 |
| Finland | 2 860 | 1 703 | 1 157 | 247/320 | 3 469 | 152 |
| Island | 243 | 203 | 40 | 36/65 | 3 750 | 17 |

## Dataartefakter 2026-04-29

- `research/data/nordic/municipal-hhi/municipal-hhi-store-count-proxy-2026-04-29.csv` - 1 130 kommune-rader med butikkantall-proxy, parent-HHI, dominerende forelder, butikkdekning og datakvalitetsflagg.
- `research/data/nordic/municipal-hhi/municipal-hhi-store-count-proxy-summary-2026-04-29.csv` - 5 land-rader med dekningsstatus, uassigned butikkpunkt og median-HHI for kommuner med minst 3 butikker.

## Norske høy-HHI-kommuner i proxyen

| Kommune | Butikker | HHI | Dominerende forelder | Forelderandel |
|---|---:|---:|---|---:|
| Karlsøy | 6 | 10 000 | NorgesGruppen | 100,0 % |
| Lurøy | 6 | 10 000 | NorgesGruppen | 100,0 % |
| Tinn | 7 | 7 551 | NorgesGruppen | 85,7 % |
| Bremanger | 7 | 7 551 | NorgesGruppen | 85,7 % |
| Askvoll | 7 | 7 551 | NorgesGruppen | 85,7 % |
| Stor-Elvdal | 6 | 7 222 | NorgesGruppen | 83,3 % |
| Nore og Uvdal | 6 | 7 222 | NorgesGruppen | 83,3 % |
| Fjaler | 6 | 7 222 | NorgesGruppen | 83,3 % |
| Sirdal | 5 | 6 800 | NorgesGruppen | 80,0 % |
| Gulen | 5 | 6 800 | NorgesGruppen | 80,0 % |

## Kilder og sammenligning

- Lokale butikkdata: `public/data/food-systems/{no,se,dk,fi,is}/stores.json`.
- Lokale kommunegrenser: `public/data/food-systems/{no,se,dk,fi,is}/`.
- Konkurransetilsynets dagligvarerapport 2023 beskriver at 12 prosent av norske dagligvarebutikker opererer uten konkurrenter fra andre kjeder i nærområdet, og ytterligere 18 prosent bare møter én annen kjede.
- Lokal metodebakgrunn: `research/norden/food-access-hhi-metodikk.md`.
- Lokal forskningsoppsummering: `research/bibliotek/konkurransetilsynet/dagligvarerapport-2023.md`.

## Datakvalitet

- Norge, Sverige og Danmark er robuste nok som første proxy: nesten alle butikkpunkt blir assignet.
- Finland er ikke robust nok for konklusjoner på hele landet i denne kjøringen: 71 kommunegrense-features mangler gyldig geometri, og 1 157 butikkpunkt blir uassigned.
- Island er egnet som indikativt nivå, men 40 av 243 butikkpunkt blir uassigned og mange små kommuner har ingen butikker i OSM-uttrekket.
- `Unknown` parent forekommer særlig i Sverige/Danmark/Island fordi OSM inkluderer kiosker, bensinstasjonsbutikker og convenience-aktører som ikke er fullt mappet til dagligvareforeldre.

## Akseptansegate

Delvis integrerbart nå:

- Norge, Sverige og Danmark kan brukes som intern `store_count_proxy` med tydelig metodeforbehold.
- Finland og Island kan bare brukes indikativt i denne versjonen, eller ekskluderes fra nordisk kommune-HHI-sammenligning.

Full lukking krever fortsatt:

- Reparerte Finland-/Island-geometrier eller eksplisitt avgrensning.
- Omsetningsbasert kommune-HHI fra relevante kilder dersom analysen skal brukes konkurransepolitisk.
