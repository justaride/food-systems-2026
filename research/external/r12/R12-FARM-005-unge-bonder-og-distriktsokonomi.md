# R12-FARM-005 - Unge bonder og distriktsokonomi

**Dato:** 2026-06-24
**Status:** Batch 09 output - underlag, ikke claim
**Gate:** source-shortlist
**Beslutning:** enrich

## Kort dom

Unge bonder og rekruttering kan kildeankres som aldersprofil, rekrutterings-/arbeidskraftutfordring og distriktsokonomisk output, men ikke som ett samlet effektmal for matsystemet. SSB tabell 05974 gir A-kilde for personlige brukere etter alder: i 2025 var 6 421 av 34 628 personlige brukere under 40 ar. Ruralis gir relevante forskningsankre for trender, avloserrekruttering og investerings-/distriktstiltak, men mange "hvorfor"-sporsmal er survey-/metodefelt og ma holdes som B/C.

## Sterkeste kilde

- SSB, Gardsbruk, jordbruksareal og husdyr / Statbank 05974, aksessert via PxWeb 2026-06-24: `https://www.ssb.no/statbank/table/05974`
- SSB, Gardsbruk, jordbruksareal og husdyr, aksessert 2026-06-24: `https://www.ssb.no/jord-skog-jakt-og-fiskeri/jordbruk/statistikk/gardsbruk-jordbruksareal-og-husdyr`
- Ruralis, Rekruttering av avlosere til jordbruket, rapport 1/24, aksessert 2026-06-24: `https://ruralis.no/wp-content/uploads/2024/02/rapport-1_24-rekruttering-av-avlosere-til-jordbruket-e-p--straete-et-al.pdf`
- Ruralis, Trender i norsk landbruk 2024 dokumentasjonsrapport, aksessert 2026-06-24: `https://ruralis.no/publikasjoner/?search=Trender+i+norsk+landbruk+2024`
- Ruralis, Evaluering av IBU-midler, rapport 3/26, aksessert 2026-06-24: `https://ruralis.no/wp-content/uploads/2026/03/r-3_26-hovedrapport-evaluering-ibu--k--mittenzwei-r--sand-m--forbord-v-w--faeraas-a-s--haugset-a--zahl-thanem.pdf`

## Svakeste punkt

SSB alderstabell viser hvem som er personlige brukere, ikke hvem som forsoker a etablere seg, hvem som lykkes, eller hvor robust distriktsokonomien blir. Rekruttering, optimisme, avlosertilgang, investeringer og lokal verdiskaping krever egne indikatorer og ofte survey-/programdata.

## Aldersuttrekk fra SSB 05974

| Ar | Under 40 ar | Personlige brukere totalt | Andel under 40 | Kildeklasse | Caveat |
|---:|---:|---:|---:|---|---|
| 2020 | 6 415 | 36 691 | 17,5 % | A | Region hele landet; personlige brukere, ikke alle landbrukseiendommer. |
| 2021 | 6 396 | 36 121 | 17,7 % | A | Samme definisjon. |
| 2022 | 6 385 | 35 925 | 17,8 % | A | Samme definisjon. |
| 2023 | 6 273 | 35 174 | 17,8 % | A | Tabellen er rettet for 2023/2024 i 2026. |
| 2024 | 6 301 | 34 741 | 18,1 % | A | Forelopig/rettet tall etter SSB-notat. |
| 2025 | 6 421 | 34 628 | 18,5 % | A | Siste ar er forelopige tall. |

## Funn-tabell

| Indikator / spor | Status | Kildeklasse | Hulltype | Caveat |
|---|---|---|---|---|
| Aldersprofil personlige brukere | SSB 05974 gir A-serie for aldersgrupper. | A | Type A | Ikke nok til a male rekruttering alene. |
| Antall jordbruksbedrifter og driftsform | SSB hovedstatistikk gir struktur for bruk/areal/husdyr. | A | Type A | Ikke aldersmotiv eller framtidsintensjon. |
| Avloser-/landbruksvikarrekruttering | Ruralis 1/24 gir kunnskap om behov, trivsel og utfordringer med a skaffe avlosere. | B forskningsrapport | Type A/B | Ikke det samme som rekruttering av nye gardbrukere, men viktig arbeidskraft/output. |
| Trender/optimisme og overtakelse | Ruralis Trender-sporet gir surveyindikatorer om produksjonsplaner, anbefaling til barn og framtidig drift. | B survey | Type A/B | Survey og svarutvalg ma ikke bli registerclaim. |
| IBU/investering og distriktsutvikling | Ruralis 3/26 evaluerer IBU som virkemiddel for langsiktig og lonnsom verdiskaping. | B evaluering | Type A/B | Virkemiddeleffekt er program-/metodeavhengig. |
| Distriktsokonomisk output | Ikke samlet i apen kilde i denne batchen. | C | Type C | Krever kobling mellom produksjon, sysselsetting, bosetting, investering og ringvirkninger. |

## Tomme celler

- Antall nye etablerte bonder per ar med alder, produksjonstype, region og overtakelsesform.
- Antall unge som onsker a bli bonde, men stopper pa kapital, jordtilgang, inntekt, avloser eller livskvalitet.
- Direkte kobling mellom matsystemstruktur og distriktsokonomisk output.
- Samlet indikator for rekrutteringskvalitet, ikke bare alder pa dagens bruker.
- Kausal effekt av IBU, avloserordninger eller samvirkenettverk pa unge bonder.

## Ikke si

- Ikke si at andel under 40 alene maler rekruttering.
- Ikke si at unge bonder oker eller faller som matsystemeffekt uten metodebro.
- Ikke bland personlige brukere, landbrukseiendommer, jordbruksbedrifter og nye etableringer.
- Ikke bruke Ruralis-survey som registerstatistikk.
- Ikke si at distriktsokonomi er dokumentert av alderstabellen alene.
- Ikke skjul at mange forklaringer er actor-/survey-/programdata.

## Anbefalt gate

`source-shortlist`. Bruk som alders- og rekrutteringsanker med synlige C-felt. Neste steg bor vaere en indikatorpakke som skiller `alder`, `nyetablering`, `overtakelse`, `arbeidskraft`, `kapital`, `jordtilgang`, `distriktsoutput` og `virkemiddeleffekt`.

