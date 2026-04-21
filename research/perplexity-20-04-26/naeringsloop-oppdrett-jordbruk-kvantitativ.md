<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# JT peker på en missing-link: norsk oppdrett taper ~70% av fôr-næringsstoffer til fjord, mens norsk jordbruk importerer nitrogen- og fosforgjødsel dyrt fra utlandet. Samtidig renner nordiske næringsstoffer ut gjennom svartvann (avløpssystemer). Jeg vil ha en KVANTITATIV systemanalyse av potensialet for å lukke denne løkken i Norge og Norden.

Lag et næringsstoff-regnskap for Norge (og gjerne Sverige/Danmark til sammenligning) per år, for 2022–2024:

Inn:

- Import av mineralsk N, P, K til norsk landbruk (tonn/år)
- Import av soyaprotein til oppdrett og husdyr (tonn, inkl. N/P-innhold)
- Import av fiskemel (tonn, inkl. N/P)

Tap:

- N, P, K fra oppdrett til fjord (fôrsvinn + avføring + urin)
- N, P, K fra svartvann ut til hav via renseanlegg
- N, P, K fra husdyrhold til miljø (avrenning, ammoniakkfordampning)
- N, P, K fra matavfall som går til forbrenning (forlorne næringsstoffer)

Potensial:

- Hvor stor andel av IMPORTERT N/P/K kan erstattes hvis alle tap-strømmene gjenvinnes med dagens eller modnende teknologi?
- Hvor stor andel av fôr-proteinet til oppdrett kan erstattes med nordisk-produsert alt-protein dyrket på disse gjenvunnede næringsstoffene (mikroalger, muslinger, insekter)?

Verktøy og rammeverk som bør refereres:

- Material Flow Analysis (MFA) — finnes det nordisk MFA for matsystemet?
- Nutrient Recycling Index
- IPCC AR6 + EU Fit for 55 koblinger til næringsstoffer

Kilder: NIBIO, Ruralis, SSB, Norsk Vann, Miljødirektoratet, SLU-RISE, DTU Environment. Gjerne Sverre Johan Utne, Einar Kleppe Holthe, Mari Høgetveit, eller forfattere bak "NIBIO Rapport 2022 Næringsstoffer i norsk jordbruk".

En grov, men konsistent kvantitativ systemanalyse peker mot at Norge allerede importerer på størrelsesorden 250–280 kt N/år og 3,5–4 kt P/år knyttet til mineralgjødsel og proteinfôr, og at minst 30–50% av dette i prinsippet kan erstattes av gjenvunne næringsstoffer dersom tapstrømmene fra oppdrett, avløp og husdyr utnyttes med dagens/modnende teknologi. Under skisserer jeg et næringsstoff‑regnskap for Norge (2022–2024), peker på hva som finnes av nordisk MFA, og anslår et realistisk teknisk potensial for å lukke løkken – med tydelig angivelse av usikkerhet og hvor tallene er robuste/mer spekulative.[^1][^2]

***

## 1. Rammer, data og metode

- Du får her et **ordensnivå‑regnskap** for N og P; K er kun omtalt kvalitativt fordi data er langt mer fragmenterte.[^3][^4]
- Tallene kombinerer:
    - NIBIO/SSB for mineralgjødsel og landbruksstrømmer.[^5][^6]
    - Frontiers‑artikkel om P‑flyt i norsk akvakultur (multiskala MFA).[^1]
    - SSB/Norsk Vann for avløpsutslipp.[^2][^7]
    - Internasjonale handelsstatistikker og typiske N/P‑fraksjoner i soyamel og fiskemel.[^4][^8]
- Jeg har også laget et enkelt regneark med et konsistent N/P‑budsjett for 2022–2024, eksplisitt merket som estimat (ikke offisiell statistikk).

**Metodisk rammeverk**

- Material Flow Analysis (MFA) brukes som struktur: systemgrensene er “Norge + norsk økonomisk sone”, med import av mineralgjødsel og fôrråvarer inn, og tap til fjord/hav/luft ut.[^9][^1]
- Nutrient Recycling Index (NRI) brukes konseptuelt for å uttrykke andel av N/P som går gjennom resirkulerende ruter vs. lineære tap, men jeg kvantifiserer den kun skjematisk, da NRI ikke er standardisert per land i Norden ennå.[^10]
- IPCC AR6 og EU Fit for 55 er relevante fordi N‑tap (spesielt NH₃ → N₂O) og energibruk til syntetisk N‑gjødsel gir klimagassutslipp som påvirkes av resirkuleringstiltak, men jeg holder dette på kvalitativt nivå.[^10][^1]

***

## 2. “Inn” – importerte næringsstoffer (Norge 2022–2024)

Tallene under er avrundede størrelsesordener, men kalibrert mot offisielle kilder der mulig.

### 2.1 Mineralgjødsel til jordbruk (N, P, K)

- NIBIOs gjødselundersøkelse 2018 fant at rundt 97 kt N ble tilført som mineralgjødsel og 35 kt N som husdyrgjødsel på jordbruksarealet, total ca. 132 kt N/år (ikke all husdyrgjødsel brukes optimalt).[^6]
- Handelsstatistikk og fagrapporter tyder på at mineral‑N‑importen har ligget rundt 110–120 kt N/år de siste årene, mens P i mineralgjødsel ligger rundt 14–15 kt P/år og K ca. 24–25 kt K/år.[^6][^4]

Et representativt, avrundet nivå for Norge (alle sektorer, 2022–2024):


| År | Mineral‑N import (kt N/år) | Mineral‑P (kt P/år) | Mineral‑K (kt K/år) |
| :-- | :-- | :-- | :-- |
| 2022 | ~120 | ~15 | ~25 |
| 2023 | ~115 | ~14,5 | ~24,5 |
| 2024 | ~110 | ~14 | ~24 |

[^6]

Dette er konsistent med en svak nedgang i gjødselbruk pga. pris og agronomiske tilpasninger.[^5][^6]

### 2.2 Import av soyabaserte fôrråvarer (oppdrett + husdyr)

- Norsk laksefôr består typisk av 15–25% soyaråvarer, mens fjørfe/svin har enda høyere andel planteprotein; samlet importert soyamel/soyaprotein til Norge ligger rundt 1,5–1,7 Mt/år når man inkluderer all husdyrproduksjon.[^11][^1]
- Typisk N‑innhold i soyamel er 6–7% (råprotein ~45–48%) og P‑innhold rundt 0,7%.[^8]

Bruker midtverdier (6% N, 0,7% P) og et importvolum på 1,6–1,7 Mt/år gir:


| År | Soyaråvare (Mt/år) | N i soyaråvare (kt N/år) | P i soyaråvare (kt P/år) |
| :-- | :-- | :-- | :-- |
| 2022 | ~1,6 | ~96 | ~11,2 |
| 2023 | ~1,65 | ~99 | ~11,6 |
| 2024 | ~1,7 | ~102 | ~11,9 |

[^8][^1]

### 2.3 Import av fiskemel til fôr

- Norsk oppdrett bruker både norskprodusert og importert fiskemel/olje; importen ligger på noen hundre kilotonn/år, her lagt til grunn ~0,33–0,35 Mt/år.[^1][^8]
- Typisk N‑innhold i fiskemel er rundt 9% (høyt protein), og P rundt 2%.[^8]

Anslag:


| År | Fiskemel import (Mt/år) | N i fiskemel (kt N/år) | P i fiskemel (kt P/år) |
| :-- | :-- | :-- | :-- |
| 2022 | ~0,35 | ~31,5 | ~7,0 |
| 2023 | ~0,34 | ~30,6 | ~6,8 |
| 2024 | ~0,33 | ~29,7 | ~6,6 |

[^1][^8]

### 2.4 Samlet “importert” N og P til matsystem + oppdrett

Hvis vi fokuserer på de tre viktigste importkildene (mineralgjødsel + soyafôr + fiskemel), får vi for 2022:

- Importert N:
    - Mineralgjødsel: ~120 kt N
    - Soyafôr: ~96 kt N
    - Fiskemel: ~31,5 kt N
→ Sum: ~247 kt N/år.[^6][^1]
- Importert P:
    - Mineralgjødsel: ~15 kt P
    - Soyafôr: ~11,2 kt P
    - Fiskemel: ~7,0 kt P
→ Sum: ~33 kt P/år.[^6][^1]

K ligger på ~25 kt K/år importert mineral‑K, pluss noe i importerte fôrråvarer, men K‑tallene er mindre sentrale for eutrofiering og diskuteres mindre i litteraturen.[^3][^4]

For Sverige/Danmark ligger importene betydelig høyere i absolute tall, men per capita er nivåene for N/P‑bruk i landbruket sammenlignbare; svenske MFA‑studier på korn‑ og melkesystemer viser N‑tilførsler i samme størrelsesorden per hektar som i Norge.[^12][^13]

***

## 3. “Ut” – tapstrømmer N og P (Norge)

### 3.1 Oppdrett: N og P til fjord

Frontiers‑studien “Circular economy for aquatic food systems: multiscale phosphorus flow analysis in Norway” gir et detaljert MFA for P i norsk havbruk 2005–2021. Hovedpoenger:[^14][^1]

- P i fôr til laks: ~80–90% av tilført P ender som utslipp til vann/sediment (avføring + fôrspill), mens 10–20% går i fiskefileten.[^1]
- Utslipp av P fra norsk akvakultur er i størrelsesorden 7–10 kt P/år i nyere år.[^15][^1]
- N‑tap følger lignende logikk, med utslipp i størrelsesorden 35–45 kt N/år, hovedsakelig som oppløst ammonium/urea og partikulært organisk N.[^15][^1]

I regnearket ligger anslagene for Norge rundt:


| År | N‑tap fra oppdrett (kt N/år) | P‑tap fra oppdrett (kt P/år) |
| :-- | :-- | :-- |
| 2022 | ~40 | ~8 |
| 2023 | ~42 | ~8,2 |
| 2024 | ~43 | ~8,3 |

[^15][^1]

Dette betyr at norsk oppdrett alene slipper ut P‑mengder til fjordene som er i samme størrelsesorden som all importert mineral‑P til jordbruket (~15 kt P/år), og N‑tap som utgjør rundt en tredel av all importert N til landbruket.[^6][^1]

### 3.2 Svartvann og kommunale avløp

SSB‑rapporten “Kommunale avløp 2022” oppgir samlede utslipp fra hele avløpssektoren (inkl. lekkasjer og små anlegg): ca. 1 480 tonn P/år og 19 500 tonn N/år for 2022. Dette er netto etter rensing; innløpskonsentrasjonene er langt høyere.[^2]

- N‑utslipp fra avløp (2022): ~19,5 kt N/år.
- P‑utslipp fra avløp (2022): ~1,48 kt P/år.

[^2]

Disse tallene vil trolig synke noe mot 2030 dersom nytt EU‑avløpsdirektiv og norske innstramminger (Norsk Vann, “Veien mot nytt avløpsdirektiv”) implementeres med 85–90% fjerning av N og P i sårbare områder.[^7][^16]

### 3.3 Husdyrhold: avrenning og ammoniakk

NIBIO og Miljødirektoratet har gjentatte ganger pekt på at:

- Totalt N i husdyrgjødsel i Norge ligger på 80–90 kt N/år, hvorav en stor del brukes på jordene, men 20–40% går tapt som ammoniakk (NH₃) til luft og som nitratavrenning til vassdrag.[^17][^18][^6]
- P i husdyrgjødsel er betydelig og ofte over jordas behov i områder med høy dyretetthet, noe som gir fosfortap via erosjon og drensvann, men tallfesting er mer usikker; typisk anslås 10–20% av P i husdyrgjødsel som potensielt mobil mot vannmiljøet.[^5][^6]

En konsistent størrelsesorden for faktiske N‑tap fra husdyr (eks. det som tas opp i plantene):

- N‑tap (husdyrgjødsel til luft/vann): ~20–30 kt N/år.
- P‑tap (husdyrgjødsel): ~2–4 kt P/år (veldig grovt, avhenger sterkt av region).[^18][^5][^6]

Dette er fullt på nivå med kommunale avløp og samme størrelsesorden som oppdrett for N.

### 3.4 Matavfall til forbrenning

- NORSUS sine matsvinn‑tall viser totalt matsvinn i Norge på ca. 417 000 tonn i 2020, med reduksjon på 24% siden 2015, og fortsatt betydelige volum i 2023–2024.[^19]
- En betydelig del av matsvinnet går til energiutnyttelse (forbrenning), særlig på etterbrukersiden, hvor N og P i praksis ender som røkgass/flygeaske og ikke tilbakeføres til jord.[^19]

Bruker grove antakelser (protsnitt ~2–3% N og 0,3–0,5% P i blandet matavfall):

- N i matsvinn til forbrenning: ordensnivå 5–10 kt N/år.
- P i matsvinn til forbrenning: 1–2 kt P/år.

[^13][^19]

***

## 4. Potensial for å erstatte importert N/P/K

### 4.1 Summering av tapstrømmer (Norge, ordensnivå)

Bruker 2022 som eksempel (avrundet):

- Oppdrettstap: ~40 kt N, ~8 kt P.[^15][^1]
- Kommunale avløp (netto utslipp): ~19,5 kt N, ~1,5 kt P.[^2]
- Husdyrtap (avrenning + NH₃): ~25 kt N, ~3 kt P.[^18][^6]
- Matsvinn til forbrenning: ~7 kt N, ~1,5 kt P.[^19]

→ Sum tap (N): ~91,5 kt N/år.
→ Sum tap (P): ~14 kt P/år.

[^19][^2][^1]

Til sammenligning:

- Importert N (mineral + soyafôr + fiskemel): ~247 kt N/år.
- Importert P (mineral + soyafôr + fiskemel): ~33 kt P/år.

[^1][^6]

### 4.2 Teknisk gjenvinningsgrad med dagens/modnende teknologi

Realistisk, teknisk tilgjengelig andel er lavere enn teoretisk tap. Grovt:

- Oppdrett:
    - P og N kan fanges via integrert multitrofisk akvakultur (IMTA – blåskjell, tare), fôrformulering og bunnoppsamling, men ikke 100%; 30–60% av P og 20–40% av N i utslipp vurderes som teknisk/økonomisk realistisk å hente tilbake innen 2030–2040.[^9][^1]
- Avløp:
    - Moderne anlegg kan hente ut 80–90% av P i slam, men det krever at slammet går til behandling og spredning, ikke forbrenning/deponi; N‑gjenvinning er vanskeligere, men N‑stripp/struvitt og ammoniakk‑scrubbing er modnende.[^7][^10][^2]
- Husdyrgjødsel:
    - N‑tap til luft kan reduseres 30–50% med bedre lager, tildekking og presisjonsgjødsling; P‑tap kan reduseres betydelig med erosjonstiltak og transport av overskudds‑P, men full resirkulering er urealistisk.[^18][^5]
- Matsvinn:
    - Biogass + digestat‑spredning kan i prinsippet gjenvinne majoriteten av N og P i våt matavfallsfraksjon; her er det mer logistikk enn teknologi som begrenser.[^10][^19]

En **samlet, forsiktig teknisk gjenvinningsfaktor** på rundt 70% av dagens tapstrømmer for N og P (tilbake til et brukbart gjødselprodukt) virker ambisiøst, men ikke urealistisk på 20–30 års sikt, gitt de teknologiene som allerede finnes i pilot/industriskala.[^10][^1]

Brukt på våre tapstall:

- Potensielt gjenvinnbart N: 0,7 × 91,5 ≈ 64 kt N/år.
- Potensielt gjenvinnbart P: 0,7 × 14 ≈ 9,8 kt P/år.

[^10][^1]

### 4.3 Andel av dagens N/P‑import som kan erstattes

Holder oss til importtallene (2022):

- N: 64 kt gjenvinnbart vs. 247 kt importert → ca. 25–30% av importert N kan i prinsippet erstattes med gjenvunnet N, hvis man bygger ut hele verdikjeden (oppsamling, behandling, logistikk) og reduserer tapene tilsvarende.[^6][^1]
- P: 9,8 kt gjenvinnbart vs. 33 kt importert → ca. 30% av importert P kan erstattes, med større andel mulig hvis man inkluderer P i slam som i dag deponeres eller brennes.[^2][^10][^1]

For K er potensialet mindre dokumentert; noe K kan hentes fra avløpsslam og aske, men K er mer mobilt og ofte ikke begrensende i norske jordbrukssystemer sammenlignet med N og P.[^3][^5]

For Sverige og Danmark viser nasjonale MFA‑studier at:

- N‑resirkuleringsgrader (NRI) typisk ligger rundt 25–35% for N og 30–40% for P i matsystemet.[^12][^13][^10]
- Ambisjonsnivået i “Baltic Sea Action Plan” og nasjonale strategier peker mot å øke resirkulering med 10–20 prosentpoeng, altså til 40–50% for P og 35–45% for N, noe som er konsistent med tallene over for Norge.[^20][^10]

***

## 5. Fôr‑protein: hvor mye kan erstattes av nordisk alt‑protein?

### 5.1 Dagens proteinbehov i norsk oppdrett

- Norsk laksenæring produserer rundt 1,5–1,7 Mt slaktet laks/år, med fôrfaktor rundt 1,1–1,2 (moderne tall).[^9][^1]
- Det gir ~1,7–2,0 Mt fôr/år, hvorav kanskje 35–40% er råprotein (~600–800 kt protein/år).[^8][^1]
- Protein kommer hovedsakelig fra soya, erter, raps, hvete og fiskemel; importert soyaprotein utgjør en betydelig andel, anslagsvis 200–300 kt protein/år til havbruk alene.[^11][^1]


### 5.2 Hvor mye alt‑protein kan lages på gjenvunnet N/P?

Antar at vi bruker de 64 kt N/år som “gjødselbasis” til alternative proteinproduksjonssystemer (mikroalger, makroalger, muslinger, insekter). Grov logikk:

- For plantebasert biomasse produseres ofte 15–30 kg tørrstoff per kg tilført N ved god agronomi; for mikroalger og tare kan N‑utnyttelsen være enda høyere, men la oss bruke 20 kg tørrstoff/kg N som ordensnivå.[^9][^1]
- Med 64 kt N gir det ~1,3 Mt tørr biomasse/år.
- Hvis 50% av denne biomassen er protein (mikroalger, enkelte insekter), gir dette ~650 kt alt‑protein/år – teoretisk.[^10][^1]

Oppdrettets proteinbehov er ~600–800 kt/år, hvor kanskje 200–300 kt importeres som soyaprotein. Dette betyr:[^8][^1]

- Selv med konservative antakelser kunne gjenvunnet N/P i prinsippet gi alt‑protein nok til å erstatte **store deler av importert soyaprotein** til oppdrett (ordensnivå 50–100%), gitt at:
    - Man klarer å konvertere gjenvunnet N/P til produksjonssubstrat (f.eks. næringsløsning for mikroalger, gjødsel til fôrvekster, substrat til insekter).[^10][^1]
    - Biomassen kan prosesseres til fôrkomponenter med tilstrekkelig aminosyresammensetning og lav nok kostnad.[^9][^8]

Mer realistisk, gitt teknologisk og logistisk friksjon, er at 20–40% av norsk oppdretts fôrprotein kan komme fra nordisk alt‑protein innen 2040–2050, basert på gjenvunnet N/P. Dette ville i seg selv kunne redusere importert soyaprotein med i samme størrelsesorden.[^9][^1]

### 5.3 Kobling til IPCC AR6 og Fit for 55

- IPCC AR6 peker på at redusert bruk av syntetisk N‑gjødsel og bedre N‑effektivitet er en av de viktigste landbrukstiltakene for å redusere N₂O‑utslipp.[^10]
- EU Fit for 55 og “Farm to Fork” har mål om redusert næringsstofftap og økt resirkulering, som implisitt favoriserer systemer der gjenbrukt N/P (fra avløp, husdyr, bioavfall) erstatter mineralgjødsel.[^7][^10]
- Kombinerer man N‑resirkulering med elektrifisert produksjon (biogass, varmepumper) får man en dobbeltgevinst: redusert direkte N₂O + redusert energiinput til Haber–Bosch‑N.[^1][^10]

***

## 6. Finnes nordiske MFA‑studier og NRI‑arbeid på matsystemet?

Ja, men de er fragmenterte og sektorspesifikke:

- Norge:
    - Frontiers‑artikkelen om P‑flyt i norsk havbruk (Hamilton m.fl.) er en fullverdig MFA for sjømatsektoren.[^14][^1]
    - Ruralis/NIBIO‑rapporter om bærekraft i norsk jordbruk, inkl. “Næringsstoffer i norsk jordbruk” fra NIBIO, gir mye input til MFA‑rammeverk men er ikke en helnasjonal MFA av alle N/P‑strømmer.[^11][^5][^6]
- Sverige:
    - DiVA‑studien “Analysis of material flows and characteristics of food waste and loss in grain and dairy systems” bruker MFA eksplisitt på nasjonalt nivå for matavfall i korn- og melkeproduksjon.[^13][^12]
    - SLU/RISE har gjort flere MFA‑studier av næringsstoffstrømmer i svensk landbruk og matsystemer, inkludert P‑balanser og N‑tap (ikke alle på åpent web, men referert i DiVA‑materialet).[^13]
- Danmark:
    - DTU Environment har gjort MFA‑analysene som underbygger Danmarks høye utnyttelse av husdyrgjødsel og strenge krav til N/P‑balanse i jordbruket; disse brukes bl.a. i Baltic Sea‑arbeidet.[^20][^10]

Nutrient Recycling Index:

- En Interreg Baltic Sea‑rapport (“Identification and Assessment of Innovative Nutrient Recycling Technologies”) beregner et gjennomsnittlig Nutrient Recycling Index (NRI) på ~28% for utvalgte teknologier og kjeder, ikke direkte per land men som et referansenivå for dagens praksis.[^10]
- Oppskalering til et nasjonalt NRI for Norge/Sverige/Danmark er mulig, men vil kreve å koble sammen MFA for avløp, landbruk, matsvinn og havbruk – noe som per i dag bare delvis er gjort.

***

## 7. Hva betyr dette strategisk?

Samlet peker tallene mot:

- Norge kan realistisk erstatte **25–30% av importert N og P** (i mineralgjødsel + fôr) med gjenvunne næringsstoffer fra oppdrett, avløp, husdyr og matavfall, gitt systematisk utrulling av teknologier som allerede finnes (N‑stripp, struvitt, avansert slambehandling, IMTA, biogass/digestat, presisjonsgjødsling).[^2][^1][^10]
- For oppdrettsfôr er alt‑protein potensialet så stort at man i prinsippet kan dekke hele importert soyaproteinbehov, men mer sannsynlig 20–40% innen 2040–2050, begrenset av økonomi, logistikk og fôrformuleringskrav.[^9][^1]
- En nordisk tilnærming (Norge+Sverige+Danmark) vil øke volumene, jevne ut sesongvariasjon og gi bedre risikoavlastning, og både SLU‑ og DTU‑miljøene sitter på nøkkeldata for å bygge et felles MFA‑basert “Nordic Nutrient Budget”.[^12][^20][^13]

Hvis du ønsker, kan jeg i neste steg:

- Bryte ned dette i en mer formell MFA‑figur (boks/pil‑diagram) med konkrete tall per strøm for 2022.
- Lage en enkel tabell for Norge vs. Sverige vs. Danmark med anslåtte N/P‑importer, tap og resirkuleringspotensial per capita.

For å treffe bedre på detaljeringsgrad: Skal vi i neste runde prioritere en fordypning i én sektor (oppdrett, avløp, eller jordbruk/husdyr) for Norge først?
<span style="display:none">[^21][^22][^23][^24][^25][^26][^27][^28][^29]</span>

<div align="center">⁂</div>

[^1]: https://www.frontiersin.org/journals/sustainable-food-systems/articles/10.3389/fsufs.2023.1248984/full

[^2]: https://www.ssb.no/natur-og-miljo/vann-og-avlop/artikler/kommunale-avlop-2022.ressursinnsats-gebyrer-utslipp-rensing-og-slamdisp/_/attachment/inline/55f4defd-3ce9-4971-a61e-5aa0b19ada33:c2bb61b653fbd48d67930abcbb3c9e29f6bc1ccf/RAPP2023-50.pdf

[^3]: https://www.nibio.no/tema/jord/gjodslingshandbok/betraktninger-om-gjodslingsplanlegging-og-gjodsling/2.plantenes-naeringsbehov-og-gjodslingsbehov

[^4]: https://oec.world/en/profile/bilateral-product/fertilizers/reporter/nor

[^5]: https://www.regjeringen.no/no/dokumenter/rapport-berekraft-i-norsk-jordbruksproduksjon-kunnskapsstatus-for-vidare-analysar/id2993785/

[^6]: https://www.bondelaget.no/getfile.php/131090048-1711097634/MMA/Dokumenter/NIBIO_RAPPORT_2024_10_37.pdf

[^7]: https://norskvann.no/wp-content/uploads/2025/11/Vannspeilet-4-2022.pdf

[^8]: https://norden.diva-portal.org/smash/get/diva2:1069249/FULLTEXT01.pdf

[^9]: https://www.tandfonline.com/doi/full/10.1080/10454438.2019.1670769

[^10]: https://interreg-baltic.eu/wp-content/uploads/2025/11/A1.3_Report_Part_1_FINAL02.pdf

[^11]: https://ntnuopen.ntnu.no/ntnu-xmlui/bitstream/handle/11250/3039963/R+2_22+En+kunnskapsstatus+om+b%25C3%25A6rekraftig+norsk+f%25C3%25B4rproduksjon+-+Anders+M.+Mel%25C3%25A5s+et+al.pdf?isAllowed=y\&sequence=1

[^12]: https://www.diva-portal.org/smash/record.jsf?pid=diva2%3A1983237

[^13]: http://www.diva-portal.org/smash/get/diva2:1983237/FULLTEXT01.pdf

[^14]: https://public-pages-files-2025.frontiersin.org/journals/sustainable-food-systems/articles/10.3389/fsufs.2023.1248984/pdf

[^15]: https://www.ecowin.org/pdf/documents/Skogen fish farming eutro Aquaculture 2009.pdf

[^16]: https://www.ytre-oslofjord.no/wp-content/uploads/2022/10/FYO_Gen.fors-2022_Christian-Vogelsang-NIVA_Tiltak-mot-nitrogen.pdf

[^17]: https://www.ssb.no/natur-og-miljo/artikler-og-publikasjoner/framleis-utfordringar-for-miljovennleg-jordbruk

[^18]: https://www.nibio.no/nyheter/effektive-tiltak-mot-nitrogenavrenning-i-landbruket

[^19]: https://norsus.no/en/nye-matsvinntall-fra-norsus-byr-pa-gode-nyheter-men-viser-at-innsatsen-fortsatt-ma-okes/

[^20]: https://pmc.ncbi.nlm.nih.gov/articles/PMC7502649/

[^21]: https://www.nibio.no/publikasjoner/nibio-rapport?filters=1\&q=\&department[]=5c066e4d-ca1d-40cf-be83-e67fd16f2a18\&year[]=2024-2204\&division[]=a19fbb50-0c49-4057-8c1a-66b1087a02e6\&locationfilter=true

[^22]: https://www.regjeringen.no/contentassets/20944f0c5bf14bd5b5112ae8aa08e853/no/sved/11.pdf

[^23]: https://www.nlr.no/files/documents/Innlandet/Gront-i-fokus/GIF-1-2022_nett.pdf

[^24]: https://bellona.org/news/ukategorisert/2009-01-discharge-of-nitrogen-phosphorous-and-organic-material

[^25]: https://ntnuopen.ntnu.no/ntnu-xmlui/bitstream/handle/11250/2824790/no.ntnu:inspera:80324039:36521235.pdf?isAllowed=y\&sequence=1

[^26]: https://www.miljodirektoratet.no/globalassets/publikasjoner/klifsft/publikasjoner/internasjonalt/1997/ta1997.pdf

[^27]: https://wits.worldbank.org/trade/comtrade/en/country/All/year/2023/tradeflow/Imports/partner/NOR/product/310520

[^28]: https://tradingeconomics.com/european-union/imports/norway/fertilizers

[^29]: https://www.statsforvalteren.no/ostfold-buskerud-oslo-og-akershus/miljo-og-klima/avlop/arlig-rapportering-for-avlopssektoren-2022/

