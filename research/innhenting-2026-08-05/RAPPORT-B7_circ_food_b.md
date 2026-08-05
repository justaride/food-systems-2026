# RAPPORT — B7_circ_food_b (Sirkulær mat, Norden)

Innhentingssesjon 2026-08-05. 14 rader i manifestet, alle `landing_html`. Tema: circular-food (SE/DK/FI/IS).

## Sammendrag
- **Hentet:** 14/14 (13 fetched_full, 1 metadata_only)
- **Paywall:** 0
- **Død:** 0
- **Findings:** 26 (fordelt på 14 kilder)

## Per kilde
| Kilde | Land | Retrieval | Findings | Merknad |
|---|---|---|---|---|
| KTH PLENTY – klimarisiko mat/vann | SE | fetched_full | 1 (kval.) | Tall ligger i lenket Livsmedelsverket-rapport, ikke innhentet |
| KTH PLENTY – kommuner/resiliens (Andersson) | SE | fetched_full | 1 (kval.) | Rammeverk; PDF lenket, ikke hentet |
| KTH PLENTY – Invisible Pantry (Bartek) | SE | fetched_full | 1 (kval.) | Profilintervju, LCA-metode |
| Circular Gastronomy – marine kolonihager | SE | fetched_full | 3 | 25/75 % sjømat import, ~30 kolonihager DK, 18 mnd blåskjell |
| Circular Gastronomy – sitrusskall | SE | fetched_full | 2 | 5 t avokadosteiner, 20 t/mnd sitruskapasitet |
| Circular Gastronomy – kompostbrus | SE | fetched_full | 2 | ~2000 l/batch → ~6000 flasker |
| IVL FOCUSE | SE+ | fetched_full | 1 | Budsjett EUR 1 096 456, 2024-2026, 5 byer |
| New Food – Amcor/CRISP | DK | fetched_full | 3 | CRISP 2025-2028; CleanStream ~40 % PP; EU 55 %/2030 |
| FoodNavigator – Onnest fiskeoppdrett | DK | fetched_full | 2 | >95 % overlevelse (claim); oppstart 2028 |
| Food Nation DK – sirkularitet | DK | fetched_full | 3 | Carlsberg 60 % CO2, Peter Larsen <1 % næring |
| Interreg – Circular FoodShift | EE/LT/LV/FI | fetched_full | 2 | Budsjett EUR 0,50 mill; 43 kokker, 5 skoler |
| MDPI – Turku sirkulær campus | FI | **metadata_only** | 1 | Akamai 403; tittel/forf/abstract via Crossref |
| Geothermie-Schweiz – GEOFOOD | IS | fetched_full | 2 | 9 % geotermi til mat/industri IS; NL 5600 TJ |
| Novia – lokal mat/fiber Island | IS | fetched_full | 2 | Istex ~99 % ull; ikke selvforsynt grønnsaker |

## Felt dekket (fillsGap)
Hovedsakelig `materialstrommer`, `lokale_verdikjeder`, `nordisk_dybde`. Sekundært `beredskap_import`, `offentlig_innkjop`, `makt_eierskap`, `okologi_jordhelse`, `kvalitativt_lag`.

## Basis-fordeling
Nesten alt er **aktoropplysning** (konkurranse-cases, selskaps- og prosjektpastander) eller **ikke_oppgitt** (KTH-omtaler). Kun to kilder bærer **maalt**: Geothermie-Schweiz (rapportert energistatistikk for IS/NL) og MDPI Turku (eksperimentelt, men kun abstract innhentet — malte tall i fulltekst ikke tilgjengelig). Ingen volumtall har oppgitt systemgrense; markert "ikke oppgitt".

## Merknader / forbehold
- **MDPI Turku**: open access, men bot-blokkert (HTTP 403 via både WebFetch og curl). Metadata + abstract hentet via Crossref API. Fulltekst-tabeller (der de malte tallene ligger) gjenstår — kandidat for manuell nedlasting eller OPPDAGET-KØ.
- **Food Nation Denmark**: datering tvetydig — artikkelen refererer et mai-2022-event mens manifestet lister år 2024.
- Circular Gastronomy-casene er konkurransebidrag; alle tall er vinnernes egne opplysninger, ikke uavhengig malt.
- Onnest fiskeoppdrett er ikke bygget (oppstart 2028); tallene er ambisjoner/claims.
