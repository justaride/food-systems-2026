---
tittel: G-R5-A1 — Norge-Brasil to-motstroms claim-lock
status: Datasok v0.1 — SSB-repull fullfort; Scope 3 delvis claim-lock, ingrediensspesifikk tom celle
eier: Gabriel
dato: 2026-06-18
scope: >
  Re-pull av SSB-08801 HS 0305/klippfisk-bacalhau for Brasil, samt primarkildekontroll av Scope 3
  og Brasil-soya i norsk/europeisk laksefor hos Mowi, Skretting og BioMar. Ingen aktorkontakt.
relaterte_filer:
  - docs/project/mandates/food-tg-research-runde5-dybdeplan-codex-2026-06-18.md
  - research/forstaelse/forstaelse-r4-18-2026-06-18.md
  - research/external/r2/SSB-08801-norge-brasil-uttrekk-2026-06-16.md
  - research/external/r4/deep-research-r4-10-2026-06-18.md
  - research/external/r4/DRO-R4-AKTORGATE-MARKORER-2026-06-18.md
bruksregel: >
  Denne fila apner ikke claim alene. SSB-tallene kan ga til PCQ/claim-lock som primarstatistikk.
  Scope 3 kan bare siteres pa nivaene kildene faktisk oppgir: selskaps-/forravare-/metodeniva.
  Ikke skriv at offentlige kilder oppgir tonn CO2e for "brasiliansk soy i norsk for" uten ny kilde.
---

# G-R5-A1 — Norge-Brasil to-motstroms claim-lock

## Kort dom

**SSB-repull er vellykket og lofter bacalhau/klippfisk-leddet fra forstaelse til claim-lock-kandidat.**

For Brasil er en ren torskekode for smal. Den smale **klippfisk/bacalhau-kurven** bor i stedet summere torsk, sei, lange, brosme og "klippfisk i.e.n."-kodene i HS 0305. Da viser SSB-08801 eksport fra Norge til Brasil:

| ar | verdi Brasil | mengde Brasil | Brasil-andel verdi | Brasil-andel kg | datakvalitet |
|---|---:|---:|---:|---:|---|
| 2023 | 1 322 166 824 NOK | 19 061 303 kg | 22,2 % | 22,8 % | endelig |
| 2024 | **1 080 035 156 NOK** | **15 564 950 kg** | **18,7 %** | **19,6 %** | revidert |
| 2025 | 1 136 697 944 NOK | 14 665 540 kg | 17,2 % | 20,3 % | forelopig |

Kontroll: Regjeringen.no oppgir i 2024 at Norge eksporterer ca. **19 000 tonn** klippfisk til Brasil til **1,3 mrd. NOK** per ar, og at mesteparten er sei/pollock. Det stemmer best med SSB 2023 og forklarer hvorfor torsk-alene-koden (`03055121`) underforteller Brasil-aksen.

**Scope 3-delen kan bare delvis claim-lockes.** Mowi oppgir total Scope 3 og peker pa sourcing av forravarer som hoveddriver; Mowi dokumenterer brasiliansk SPC/soy-sporbarhet og 100 % ProTerra/deforestation-free. BioMar oppgir feed carbon footprint og verifiserte soy-LCA-faktorer for ProTerra-soyprodukter. Skretting oppgir Scope 3-arbeidsplan og soyklassifisering. Ingen av de apne selskapskildene gir en ferdig rad for **tonn CO2e allokert til brasiliansk soy i norsk for**. Den cellen ma derfor sta tom/C til aktor- eller produktspesifikk LCA foreligger.

---

## Datatabell

Kolonner iht. R5-mandat: `metrikk | verdi | enhet | ar | geografi | metode | kildeeier | URL | locator | datakvalitet`.

| metrikk | verdi | enhet | ar | geografi | metode | kildeeier | URL | locator | datakvalitet |
|---|---:|---|---:|---|---|---|---|---|---|
| Klippfisk/bacalhau-kurv eksport til Brasil, verdi | 1 080 035 156 | NOK | 2024 | Norge -> Brasil | SSB-08801; `ImpEks=2`, `Land=BR`, `ContentsCode=Verdi`, sum av 10 klippfiskkoder | SSB | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data?lang=no&outputFormat=json-stat2 | API POST; basket `clipfish_only`; HTTP 200; se kodekurv under | Primar, revidert |
| Klippfisk/bacalhau-kurv eksport til Brasil, mengde | 15 564 950 | kg | 2024 | Norge -> Brasil | Samme som over, `ContentsCode=Mengde1` | SSB | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data?lang=no&outputFormat=json-stat2 | API POST; basket `clipfish_only`; HTTP 200 | Primar, revidert |
| Brasil-andel av norsk klippfisk/bacalhau-kurv, verdi | 18,7 | prosent | 2024 | Brasil av norsk eksport til alle land | Brasil-sum / sum alle landkoder i SSB-08801 | SSB + egen aritmetikk | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data?lang=no&outputFormat=json-stat2 | 1 080 035 156 / 5 786 981 602 = 18,66 % | Primar + avledet |
| Brasil-andel av norsk klippfisk/bacalhau-kurv, mengde | 19,6 | prosent | 2024 | Brasil av norsk eksport til alle land | Brasil-sum / sum alle landkoder i SSB-08801 | SSB + egen aritmetikk | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data?lang=no&outputFormat=json-stat2 | 15 564 950 / 79 575 393 = 19,56 % | Primar + avledet |
| Klippfisk/bacalhau-kurv eksport til Brasil, verdi | 1 322 166 824 | NOK | 2023 | Norge -> Brasil | Samme kurv som 2024 | SSB | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data?lang=no&outputFormat=json-stat2 | API POST; basket `clipfish_only`; HTTP 200 | Primar, endelig |
| Klippfisk/bacalhau-kurv eksport til Brasil, mengde | 19 061 303 | kg | 2023 | Norge -> Brasil | Samme kurv som 2024 | SSB | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data?lang=no&outputFormat=json-stat2 | API POST; basket `clipfish_only`; HTTP 200 | Primar, endelig |
| Klippfisk/bacalhau-kurv eksport til Brasil, verdi | 1 136 697 944 | NOK | 2025 | Norge -> Brasil | Samme kurv som 2024 | SSB | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data?lang=no&outputFormat=json-stat2 | API POST; basket `clipfish_only`; HTTP 200 | Primar, forelopig |
| Klippfisk/bacalhau-kurv eksport til Brasil, mengde | 14 665 540 | kg | 2025 | Norge -> Brasil | Samme kurv som 2024 | SSB | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data?lang=no&outputFormat=json-stat2 | API POST; basket `clipfish_only`; HTTP 200 | Primar, forelopig |
| Bred hvitfisk-/bacalhau-relevant kurv, verdi | 1 087 845 609 | NOK | 2024 | Norge -> Brasil | Klippfiskkurv + torrfisk/saltfisk/hvitfisk-kontrollkurv | SSB | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data?lang=no&outputFormat=json-stat2 | API POST; basket `whitefish_basket`; HTTP 200 | Primar, kontroll |
| Bred hvitfisk-/bacalhau-relevant kurv, mengde | 15 624 388 | kg | 2024 | Norge -> Brasil | Samme som over | SSB | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data?lang=no&outputFormat=json-stat2 | API POST; basket `whitefish_basket`; HTTP 200 | Primar, kontroll |
| Klippfisk til Brasil, markedsbenchmark | 19 000 | tonn per ar | 2024 | Norge -> Brasil | Pressemelding/nyhet, ikke API-serie | Regjeringen.no / SMK | https://www.regjeringen.no/en/whats-new/brazil-a-growing-market-for-norwegian-seafood/id3074796/ | linje 183: 19 000 tonn, NOK 1,3 mrd, mest sei/pollock | Offentlig sekundar/kommunikasjon, kontroll |
| Mowi total Scope 3 | 2 423 089 | tCO2e | 2025 | Mowi konsern | CSRD/ESRS GHG-rapportering | Mowi | https://mowi.com/wp-content/uploads/2025/05/Mowi-Annual-Report-2025.pdf | tekstuttrekk linje 15501-15505 | Selskapsrapport, revisor-/rapportniva |
| Mowi Scope 3 FLAG | 545 232 | tCO2e | 2025 | Mowi konsern | CSRD/ESRS GHG-rapportering | Mowi | https://mowi.com/wp-content/uploads/2025/05/Mowi-Annual-Report-2025.pdf | tekstuttrekk linje 15502 | Selskapsrapport |
| Mowi feed raw materials som Scope 3-hoveddriver |  |  | 2025 | Mowi konsern | Kvalitativ driverforklaring | Mowi | https://mowi.com/wp-content/uploads/2025/05/Mowi-Annual-Report-2025.pdf | tekstuttrekk linje 1478-1483 | Selskapsrapport; ingen tonn allokert til soy |
| Mowi Europe feed self-sufficiency og norsk feed plant |  |  | 2026 | Valsneset, Norge + Kyleakin, Skottland | Policyopplysning | Mowi | https://mowi.com/wp-content/uploads/2026/03/Mowi-Sustainable-Feed-Policy.pdf | tekstuttrekk linje 25-27 | Selskaps-policy |
| Mowi brasiliansk soy/SPC sporbarhet | 100 | prosent deforestation-/conversion-free Brazilian soy suppliers | 2026 | Mowi leverandorkjede, Brasil | ProTerra/sertifiserings- og policykrav | Mowi | https://mowi.com/wp-content/uploads/2026/03/Mowi-Sustainable-Feed-Policy.pdf | tekstuttrekk linje 46-58, 191-202, 339-341 | Selskaps-policy; ikke CO2e-allokering |
| BioMar total feed carbon footprint | 1,86 | tCO2e per tonn feed | 2024 | BioMar globalt | BioSustain LCA, cradle-to-feed-gate | BioMar | https://www.biomar.com/media/vrbj10qk/biomar-global-sustainability-report-2024.pdf | tekstuttrekk linje 897-917 | Selskapsrapport; global, ikke Norge-only |
| BioMar Scope 3-andel | 97,8 | prosent av totale utslipp | 2024 | BioMar globalt | GHG scope breakdown | BioMar | https://www.biomar.com/media/vrbj10qk/biomar-global-sustainability-report-2024.pdf | tekstuttrekk linje 1041-1059 | Selskapsrapport |
| BioMar ProTerra SPC ny footprint | 1,16 | kg CO2e per kg SPC | 2024 | ProTerra-soy/aquafeed | ProTerra Environmental Footprint / BioSustain LCA | BioMar / ProTerra | https://www.biomar.com/media/vrbj10qk/biomar-global-sustainability-report-2024.pdf | tekstuttrekk linje 1069-1139 | Selskapsrapport; ingrediens-LCA, ikke Mowi/Norge-tonn |
| Skretting soy Class A+B etter intern deforestation-free-mal | 97 | prosent av globale soy-kjop | 2025 | Skretting globalt | Selskapets soyklassifisering | Skretting | https://www.skretting.com/siteassets/global/sustainability/pdfs/20260522-skretting-impact-report-2025.pdf?v=49bbb2 | tekstuttrekk linje 1516-1543, 1555-1578 | Selskapsrapport; ikke Norge-/Brazil-CO2e |
| Skretting Scope 3 tiltaksplan |  |  | 2025 | Skretting globalt | Scope 3 action plan, LCA-data fra leverandorer | Skretting | https://www.skretting.com/siteassets/global/sustainability/pdfs/20260522-skretting-impact-report-2025.pdf?v=49bbb2 | tekstuttrekk linje 2384-2430, 2499-2512 | Selskapsrapport; metode/gap |
| Ingrediensspesifikk tonn CO2e for brasiliansk soy i norsk for |  | tCO2e | 2024/2025 | Norsk laksefor / Brasil-soy | Ikke funnet i apne selskapsrapporter |  |  | Tom celle: ingen Mowi/Skretting/BioMar-kilde oppgir ferdig allokert tCO2e | C/gap |

---

## SSB-metode

**Tabell:** SSB 08801, "Utenrikshandel med varer, etter varenummer (HS) og land 1988-2025", PxWebApi v2-beta, json-stat2.

**Endepunkt:**

- Metadata: `https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/metadata?lang=no&outputFormat=json-stat2`
- Data: `https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data?lang=no&outputFormat=json-stat2`

**Metadata verifisert 2026-06-18:**

| dimensjon | kode | betydning |
|---|---|---|
| `ImpEks` | `2` | Eksport |
| `Land` | `BR` | Brasil |
| `ContentsCode` | `Verdi` | Verdi (kr) |
| `ContentsCode` | `Mengde1` | Mengde 1 (M1), kg for kodene under |
| `Tid` | `2015`...`2025` | ar |

Tabellen har ingen praktisk "world total"-landrad i dette uttrekket. Verdenssummen i denne pakken er derfor summert over alle landkoder i `Land`-dimensjonen.

### Hovedkurv: klippfisk/bacalhau

`clipfish_only`:

- `03055121_2012` — klippfisk av atlanterhavstorsk
- `03055129_2012` — klippfisk av torsk, unntatt atlanterhavstorsk
- `03055913_2012` — sei, klippfisk (2012-2016)
- `03055922_2012` — brosme, klippfisk (2012-2016)
- `03055930_2012` — lange, klippfisk (2012-2016)
- `03055992_2012` — klippfisk, i.e.n. (2012-2016)
- `03055313_2017` — sei, klippfisk (2017-)
- `03055320_2017` — lange, klippfisk (2017-)
- `03055332_2017` — brosme, klippfisk (2017-)
- `03055908_2017` — klippfisk, i.e.n. (2017-)

### Kontrollkurv: bred hvitfisk/bacalhau-relevant

`whitefish_basket` legger til torrfisk-/stockfish-koder, saltet torsk og saltede hvitfiskkoder. 2024-forskjellen mot hovedkurven er liten for Brasil: +7,81 mill. NOK og +59 438 kg, drevet av `03056200_1988` (torsk saltet/i saltlake, ikke torket eller roykt).

### 2024 toppkoder, Brasil

| kode | varetekst | verdi NOK | kg |
|---|---|---:|---:|
| `03055313_2017` | Sei, klippfisk | 452 127 605 | 9 530 225 |
| `03055121_2012` | Klippfisk av atlanterhavstorsk | 377 102 759 | 2 628 550 |
| `03055129_2012` | Klippfisk av torsk, unntatt atlanterhavstorsk | 108 085 213 | 875 600 |
| `03055332_2017` | Brosme, klippfisk | 103 916 580 | 1 937 150 |
| `03055320_2017` | Lange, klippfisk | 38 802 999 | 593 425 |

**Implikasjon:** `03055121` alene er godt for torsk/bacalhau av atlanterhavstorsk, men ikke godt nok for Brasil-markedet som helhet.

---

## Scope 3 og Brasil-soya

### Mowi

Mowi er sterkeste apne kilde for norsk/europeisk forproduksjon fordi policyen eksplisitt oppgir feed plant pa Valsneset i Norge og Kyleakin i Skottland, og at Mowi er nesten selvforsynt med for i Europa. Mowi oppgir ogsa total Scope 3:

| metrikk | 2025 | 2024 |
|---|---:|---:|
| Scope 3 Energy/Industry | 1 877 857 tCO2e | 1 742 469 tCO2e |
| Scope 3 FLAG | 545 232 tCO2e | 513 349 tCO2e |
| Total Scope 3 | 2 423 089 tCO2e | 2 255 818 tCO2e |

Mowi sier at hovedbidraget til Scope 3 er sourcing av forravarer, og at Mowi Feed reduserte FLAG-utslipp per tonn produsert for. Policyen dekker 100 % av soy-leverandorer, volum og sourcing-regioner, peker ut Brasil som eneste hoyrisikoregion for deforestation/conversion, og sier at brasilianske leverandorer er tredjepartssertifisert (ProTerra). Policyen sier ogsa at Mowi arbeider med SPC-leverandorer fra Brasil for a redusere karbonfotavtrykket, men den publiserer ikke et tonn CO2e-tall allokert til brasiliansk soy i norsk for.

### Skretting

Skretting Impact Report 2025 viser at selskapet arbeider med Scope 3-reduksjon gjennom leverandordata, sourcing-regioner og LCA i formulering. Rapporten sier samtidig at datadekningen for store commodities som soy, wheat og rapeseed fortsatt henger etter. Skretting oppgir 97 % global soy compliance mot et mellommal for deforestation-free soy, men oppgir ikke norsk/Brasil-spesifikk CO2e-allokering.

### BioMar

BioMar Global Sustainability Report 2024 oppgir 1,86 tCO2e per tonn produsert for og at Scope 3 utgjor 97,8 % av selskapets totale utslipp. Rapporten gir den tydeligste ingrediens-LCA-peker: ProTerra-soyprodukter i BioMar/ProTerra-arbeidet har nye footprintverdier, inkludert SPC pa 1,16 kg CO2e/kg mot eldre 7,24 kg CO2e/kg. Dette er relevant for "brasiliansk ProTerra-soy i aquafeed", men er ikke en Mowi/Norge-volumallokert Scope 3-rad.

---

## Kildeledger

| # | kilde | type | URL | locator | bruk |
|---|---|---|---|---|---|
| 1 | SSB tabell 08801, metadata | primarstatistikk | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/metadata?lang=no&outputFormat=json-stat2 | HTTP 200, 2026-06-18; dimensjoner `Varekoder`, `ImpEks`, `Land`, `ContentsCode`, `Tid` | Kode- og enhetsbekreftelse |
| 2 | SSB tabell 08801, data | primarstatistikk | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data?lang=no&outputFormat=json-stat2 | HTTP 200, 2026-06-18; POST med kodekurver over | Bacalhau/klippfisk-serie |
| 3 | Regjeringen.no, "Brazil - a growing market for Norwegian seafood" | offentlig nyhet/kontroll | https://www.regjeringen.no/en/whats-new/brazil-a-growing-market-for-norwegian-seafood/id3074796/ | linje 183 i webuttrekk | Kontroll mot 19 000 tonn / NOK 1,3 mrd og sei/pollock |
| 4 | Mowi Annual Report 2025 | selskapsrapport | https://mowi.com/wp-content/uploads/2025/05/Mowi-Annual-Report-2025.pdf | tekstuttrekk linje 1478-1483, 1702-1729, 7668-7686, 7735-7747, 7907-7928, 15501-15505 | Scope 3, feed raw materials, Brasil-SPC, soy-sporbarhet |
| 5 | Mowi Sustainable Salmon Feed Policy, last update 31.03.2026 | selskapspolicy | https://mowi.com/wp-content/uploads/2026/03/Mowi-Sustainable-Feed-Policy.pdf | tekstuttrekk linje 25-58, 191-202, 339-341, 422-433 | Norsk/europeisk forproduksjon, Brasil high-risk region, ProTerra |
| 6 | Skretting Impact Report 2025 | selskapsrapport | https://www.skretting.com/siteassets/global/sustainability/pdfs/20260522-skretting-impact-report-2025.pdf?v=49bbb2 | tekstuttrekk linje 1516-1578, 2384-2430, 2499-2512 | Soyklassifisering, Scope 3 action plan, datagap |
| 7 | BioMar Global Sustainability Report 2024 | selskapsrapport | https://www.biomar.com/media/vrbj10qk/biomar-global-sustainability-report-2024.pdf | tekstuttrekk linje 732-753, 897-917, 1041-1059, 1069-1139 | Feed CF, Scope 3-andel, ProTerra soy/SPC LCA |
| 8 | DRO-R4-10 | intern research | research/external/r4/deep-research-r4-10-2026-06-18.md | "Kort dom" og "Konklusjon" | Overclaim-vern: ingen ekstern tostroms-analyse |
| 9 | FORST-R4-18 | intern forstaelse | research/forstaelse/forstaelse-r4-18-2026-06-18.md | hele notatet | Syntese som skulle re-pulles for claim-lock |

---

## Tomme celler og caveats

| felt | status | hvorfor |
|---|---|---|
| Tonn CO2e for "brasiliansk soy i norsk for" | **Tom celle / C** | Mowi, Skretting og BioMar publiserer Scope 3-/LCA-nivaer, men ikke ferdig volumallokert ingrediensrad for Brasil-soy i norsk for. |
| Mowi brasiliansk SPC-volum i kg/tonn | Tom celle | Mowi oppgir sporbarhets-/sertifiseringskrav og leverandorstat, men ikke apent totalvolum for brasiliansk SPC i 2025. |
| Skretting Norge-specific soy footprint | Tom celle | Skretting-rapporten er global og sier commodity-LCA-dekning fortsatt er ujevn. |
| BioMar Norge-specific soy/SPC footprint | Tom celle | BioMar oppgir global feed CF og ProTerra soy footprintverdier, ikke norsk volumallokert utslipp. |
| "Tostroms bilateral akse" som ekstern forskningsclaim | C / ikke funnet | R4-10 bekreftet at ingen ekstern kilde analyserer soya inn + bacalhau ut i samme ramme. |
| 2025 SSB | Forelopig | 2025 brukes som indikasjon, ikke endelig utviklingsdom. |

---

## Adversariell verifikasjon

1. **URL/API-spotcheck:** SSB metadata og data svarte HTTP 200. Mowi, Skretting og BioMar PDF-er ble lastet fra selskapenes egne domener og tekstuttrukket lokalt. Regjeringen.no-siden var live og oppgir dato 18.11.2024.
2. **Kodekontroll:** SSB-metadata bekreftet `ImpEks=2` som eksport, `Land=BR` som Brasil, `Verdi` som NOK og `Mengde1` som kg for varekodene. Varetekstene for klippfiskkodene ble lest fra SSB-metadata.
3. **Aritmetikk:** 2024 Brasil-verdiandel for klippfiskkurven: `1 080 035 156 / 5 786 981 602 = 18,66 %`, avrundet 18,7 %. 2024 mengdeandel: `15 564 950 / 79 575 393 = 19,56 %`, avrundet 19,6 %.
4. **Kurvtest:** Torsk-alene (`03055121`) gir 2024 Brasil `377 102 759 NOK / 2 628 550 kg`. Det er sant for atlanterhavstorsk, men underforteller Brasil-markedet. Hovedkurven inkluderer sei, som er storste Brasil-kode i 2024.
5. **Benchmark mot regjeringen.no:** Offentlig 2024-nyhet oppgir 19 000 tonn / NOK 1,3 mrd per ar og mest pollock/sei. Dette avviker fra SSB 2024, men matcher SSB 2023 godt. Mulige forklaringer: arssnitt/kommunikasjonsavrunding/kurvdefinisjon. Ikke bruk pressemeldingen som erstatning for SSB-serien.
6. **Scope 3-overclaim:** Mowi total Scope 3 og BioMar ProTerra-SPC footprint kan ikke multipliseres til "norsk Brasil-soy tCO2e" uten publisert volum og allokeringsgrense. Dette er eksplisitt tom celle.
7. **Koblings-overclaim:** Ingen kilde her sier at soya inn og bacalhau ut er en etablert ekstern tostroms-analyse. Formulering utad ma vaere: "prosjektegen syntese basert pa primarstatistikk og selskapsrapporter".

## Beslutning for videre kontrollstakk

- **SSB-klippfisk/bacalhau:** klar til PCQ/claim-lock med caveat om kurvdefinisjon og 2025 forelopig.
- **Scope 3:** total-/driver-/metodetall kan siteres, men ingrediensspesifikk CO2e for brasiliansk soy i norsk for blir **C/gap** inntil aktor- eller produktspesifikk LCA oppgir volumallokert tall.
- **Claim-status for FORST-R4-18:** kan lofte bacalhau-leddet og selskapsrapportert Scope 3-kontekst, men ikke late som hele tostromsrammen er en ekstern kilde.
