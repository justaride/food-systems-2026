# R12-VALUE-005 - Nordisk ledd-sammenligning

**Dato:** 2026-06-24  
**Prompt:** Lag nordisk sammenligning av ledd-profiler: hvilke land kan lære hva av hverandre.  
**Gate:** source-shortlist  
**Status:** Research-underlag. Ingen claims, ingen DB-writes, ingen whitepaper/deck-stemme.

## Kort dom

Det finnes gode nasjonale primærkilder for deler av ledd-profilene i Norden, men batchen fant ikke en harmonisert nordisk matrise som trygt kan rangere landene på samme indikatorer. Output bør derfor løftes som source-shortlist og datakontrakt: Norge har tydelig selvforsynings-/forkorrigeringsanker, Finland har tydelig produksjon/forbruk-indikator, Sverige har bred jordbruksstatistisk sammenstilling og forsyningsgradskilder, mens Danmark har sterke produksjons- og kornbalansestatistikker, men ikke samme åpne selvforsyningsmetode i dette uttrekket.

## Sterkeste kilde

Natural Resources Institute Finland (Luke), `Ratio between domestic production and consumption`: `https://www.luke.fi/en/statistics/indicators/finlands-cap-impact-indicators/ratio-between-domestic-production-and-consumption`

## Svakeste punkt

Metoder og indikatornivå er ikke harmonisert. Et land kan ha sterke produksjonsdata uten samme selvforsyningsbegrep, og en selvforsyningsindikator kan være produktspesifikk, energibasert, importkorrigert eller marked/balansebasert.

## Funn-tabell

| Land / ledd | Aar/periode | Lokator | Kildeklasse | Verdistatus | Caveat |
|---|---:|---|---|---|---|
| Norge - selvforsyning/engrosforbruk | 2024 forelopig / 2025 rapport | Helsedirektoratet 2025; NIBIO | A | Metodeberegnet realisert indikator | Energibasert engros; forkorrigert metode må skilles. |
| Norge - markedsbalanser landbruk | 2025 / 2026 rapport | Landbruksdirektoratet Markedsrapport 2025 | A | Realisert marked/prognosefelt | Ikke komplett kapasitets- eller sårbarhetsprofil. |
| Sverige - jordbruksstatistikk | 2025 sammenstilling | Jordbruksverket Jordbruksstatistisk sammanställning 2025 | A | Realisert statistikk | Bred statistikk, men ikke direkte samme indikator som norsk forkorrigert selvforsyning. |
| Sverige - forsyningsgrad animalier | 2024/2025 | Jordbruksverket `På tal om jordbruk och fiske` mars 2025 | A | Markedsbalanse/forsyningsgrad | Sektor-/produktspesifikk; ikke total matsystemscore. |
| Finland - produksjon/forbruk | Oppdateres av Luke | Luke CAP impact indicator | A | Produktvis selvforsyningsindikator | Høy/low per produkt; ikke samme beregning som norsk energibasert indikator. |
| Danmark - korn og planteproduksjon | 2025 / oppdatert 2026 | Statistics Denmark crop production/statbank | A | Realisert produksjon/balanse | Sterk produksjonsstatistikk; batchen fant ikke direkte dansk parallell til norsk forkorrigert indikator. |
| Island/Faeroyene/Aland/Greenland - nordiske oyer | 2022 Nordregio | Nordregio/Nordic Council source | B | Sekundær/avledet sammenligning | Relevante som øy-case, ikke direkte nasjonalstatistisk A-matrise. |
| Harmonisert nordisk leddprofil | Ikke funnet | Trenger felles datakontrakt | C | Datagap | Må bygges med felt for metode, enhet, år, scope og kildeklasse per celle. |

## Tomme celler

- Harmonisert nordisk `self-sufficiency`-serie med samme metode for alle land.
- Felles leddprofil for `primary production / processing / distribution` på samme år, enhet og scope.
- Felles indikator for importerte innsatsvarer per produksjonsgren.
- Felles offentlig kilde for grossist-/distribusjonsledd på tvers av nordiske land.

## Ikke si

- Ikke ranger nordiske land på selvforsyning uten metodebro.
- Ikke si at Danmark mangler data; si at denne batchen ikke fant samme indikatorform.
- Ikke bland produktvis selvforsyning, energibasert selvforsyning og forsyningsgrad.
- Ikke bruk øy-case som representant for nasjonal fastlandsprofil.
- Ikke gjør source-shortlist til ferdig policyanbefaling.

## Anbefalt gate

`source-shortlist`. Neste steg bør være en datakontrakt med ett minimumsfeltsett per land: `indicator_name`, `method_definition`, `unit`, `food_scope`, `value_status`, `source_class`, `gap_type`, `year`, `locator`.

## Kilder hentet

- Helsedirektoratet, selvforsyningsgrad 2025: `https://www.helsedirektoratet.no/rapporter/utviklingen-i-norsk-kosthold-2025/matvarer/selvforsyningsgrad`
- NIBIO, selvforsyningsgrad og engrosforbruk: `https://www.nibio.no/tema/landbruksokonomi/selvforsyningsgrad-og-engrosforbruk`
- Landbruksdirektoratet, Markedsrapport 2025: `https://www.landbruksdirektoratet.no/nb/nyhetsrom/rapporter/markedsrapport-2025`
- Jordbruksverket, Jordbruksstatistisk sammanställning 2025: `https://jordbruksverket.se/om-jordbruksverket/jordbruksverkets-officiella-statistik/jordbruksverkets-statistikrapporter/statistik/2025-06-19-jordbruksstatistisk---sammanstallning-2025`
- Jordbruksverket, På tal om jordbruk och fiske mars 2025: `https://jordbruksverket.se/download/18.448459fe1958aa6ee5927c4c/1742369994661/Pa-tal-om-jordbruk-och-fiske-mars-2025-tga.pdf`
- Luke, Ratio between domestic production and consumption: `https://www.luke.fi/en/statistics/indicators/finlands-cap-impact-indicators/ratio-between-domestic-production-and-consumption`
- Statistics Denmark, crop production: `https://www.dst.dk/en/Statistik/emner/erhvervsliv/landbrug-gartneri-og-skovbrug/vegetabilsk-produktion`
- Nordregio/Norden, Food self-sufficiency in Nordic islands: `https://www.norden.org/en/news/self-sufficiency-food-production-nordic-islands`
