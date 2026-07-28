# Library Analysis URL Text Repair Plan

Generated: 2026-07-20T03:39:23.430Z

Dette er en kontrollert plan for aa reparere URL-backed lavtekst-rader ved aa oppdatere Document.content og Document.wordCount med refetchet PDF/HTML/tekst-uttrekk. Den lager ikke claim-kandidater, endrer ikke citation-readiness, og publiserer ingenting eksternt.
Hver oppdatering er bundet til Document.updatedAt, wordCount og content fra denne planen. Apply avbryter hele batchen dersom en target-rad har endret seg etter planlegging.

Full radliste: `research/_status/library-analysis-url-text-repair-plan.json`

## Sammendrag

| Metric | Count |
|---|---:|
| Total rows | 24 |
| Update rows | 19 |
| Total word gain | 215981 |
| Clears low-text rows | 19 |

### Action

| Value | Count |
|---|---:|
| skip_no_document | 5 |
| update | 19 |

### Content Kind

| Value | Count |
|---|---:|
| html | 11 |
| pdf | 13 |

### Repair Batch

| Value | Count |
|---|---:|
| existing_short_summary_review | 19 |
| url_backed_text_extraction | 5 |

## Prioritert utvalg

Rows shown below: 24 of 24

| Action | Kind | Existing words | Extracted words | New words | Gain | Batch | Title | URL | Reason |
|---|---|---:|---:|---:|---:|---|---|---|---|
| update | pdf | 142 | 33187 | 33350 | 33208 | existing_short_summary_review | Sammendrag: Skjervheim Bernes & Flo (NHH, 2016) — Paraplykjedenes overtakelse av distribusjonen | https://beccle.no/files/2016/09/Paraplykjedenes-overtakelse-av-distribusjonen-i-dagligvaremarkedet.pdf | Document.content can be updated from URL text (142 -> 33350 words). |
| update | pdf | 79 | 28826 | 28929 | 28850 | existing_short_summary_review | Salling Group AS erhvervelse af dele af Coop Danmark AS | https://kfst.dk/media/edgjum43/20250326-salling-groups-erhvervelse-af-dele-af-coop-danmark-a.pdf | Document.content can be updated from URL text (79 -> 28929 words). |
| update | pdf | 131 | 26023 | 26180 | 26049 | existing_short_summary_review | Sammendrag: Nilsen & Paulsen (NHH, 2025) — Pristransmisjon for kakao og kaffe | https://www.nhh.no/contentassets/398b849b83b24d43995c73b0919b01f8/nilsen_paulsen_pass-through-av-ravarepriser-for-kakao--og-kaffeprodukter.pdf | Document.content can be updated from URL text (131 -> 26180 words). |
| update | pdf | 143 | 23885 | 24053 | 23910 | existing_short_summary_review | Sammendrag: Fretheim & Rodnova (NHH, 2020) — Etableringshindringer i dagligvaremarkedet | https://www.nhh.no/contentassets/4c75bee2502f412fad66c9ad9ab96154/fretheimrodnova-etableringshindringer-var-2020_isf_mro-2.pdf | Document.content can be updated from URL text (143 -> 24053 words). |
| update | pdf | 143 | 22933 | 23098 | 22955 | existing_short_summary_review | Sammendrag: Skulstad & Svensson (NHH, 2024) — ICAs fall i Norge | https://www.nhh.no/contentassets/36d52bb70566431483b8cda67cf6f995/icas-fall-i-norge---skulstad--svensson-v24.pdf | Document.content can be updated from URL text (143 -> 23098 words). |
| update | pdf | 131 | 21049 | 21218 | 21087 | existing_short_summary_review | Sammendrag: Meile (NHH, 2020) — Uniform Pricing i norsk dagligvare | https://www.nhh.no/contentassets/4c75bee2502f412fad66c9ad9ab96154/thesis_food_ng_meile_uniform_pricing_public_version.pdf | Document.content can be updated from URL text (131 -> 21218 words). |
| update | pdf | 137 | 19481 | 19645 | 19508 | existing_short_summary_review | Sammendrag: Martens & Norum (NHH, 2020) — Importvernets påvirkning på leverandørkonsentrasjon | https://www.nhh.no/contentassets/4c75bee2502f412fad66c9ad9ab96154/importvern_til_godkjenning---sensurert-adobe.pdf | Document.content can be updated from URL text (137 -> 19645 words). |
| update | pdf | 133 | 10821 | 11001 | 10868 | existing_short_summary_review | Sammendrag: Huynh & Mortensen (Aalborg Universitet, 2025) — Salling Group vs. Coop Danmark | https://projekter.aau.dk/projekter/files/783577089/Afgangsprojekt_HD1_Analyse_af_Salling_Group_AS_og_Coop_Danmark_AS.pdf | Document.content can be updated from URL text (133 -> 11001 words). |
| update | pdf | 73 | 7226 | 7329 | 7256 | existing_short_summary_review | Hagar management report 2024-25 | https://www.hagar.is/media/fgpfwir5/fr%C3%A9ttatilkynning-hagar-4f-2024-25-ensk.pdf | Document.content can be updated from URL text (73 -> 7329 words). |
| update | html | 142 | 6453 | 6626 | 6484 | existing_short_summary_review | Prop. 33 L (2019–2020) – Chapter 2: Bakgrunnen for lovforslaget | https://www.regjeringen.no/no/dokumenter/prop.-33-l-20192020/id2681097/?ch=2 | Document.content can be updated from URL text (142 -> 6626 words). |
| update | pdf | 78 | 5045 | 5151 | 5073 | existing_short_summary_review | The structure of the retail sector in Iceland | https://www.bifrost.is/media/1/skra_0016984.pdf | Document.content can be updated from URL text (78 -> 5151 words). |
| update | pdf | 75 | 4113 | 4234 | 4159 | existing_short_summary_review | Retail Foods Annual Denmark DA2025-0002 | https://apps.fas.usda.gov/newgainapi/api/Report/DownloadReportByFileName?fileName=Retail+Foods+Annual_The+Hague_Denmark_DA2025-0002.pdf | Document.content can be updated from URL text (75 -> 4234 words). |
| update | html | 133 | 2004 | 2151 | 2018 | existing_short_summary_review | Untitled | https://research.slu.se/en/publications/supermarket-food-waste-prevention-and-management-with-the-focus-o/ | Document.content can be updated from URL text (133 -> 2151 words). |
| update | html | 131 | 1624 | 1767 | 1636 | existing_short_summary_review | Untitled | https://research.slu.se/en/publications/sustainability-of-food-waste-prevention-through-food-consumption/ | Document.content can be updated from URL text (131 -> 1767 words). |
| update | html | 138 | 950 | 1113 | 975 | existing_short_summary_review | Sammendrag: Adlers (SLU, 2022) - Svensk selvforsyning av kjott og korn | https://stud.epsilon.slu.se/17609/ | Document.content can be updated from URL text (138 -> 1113 words). |
| update | html | 137 | 577 | 739 | 602 | existing_short_summary_review | Sammendrag: Khandaker (SLU, 2021) - Lantmannen-kornkjeden under pandemi | https://stud.epsilon.slu.se/17412/ | Document.content can be updated from URL text (137 -> 739 words). |
| update | html | 146 | 571 | 739 | 593 | existing_short_summary_review | Sammendrag: Nielsen & Andersen (CBS, 2016) - Pris- og kvalitetsoppfatning | https://research.cbs.dk/en/studentProjects/danish-grocery-retail-does-preference-structure-influence-the-per/ | Document.content can be updated from URL text (146 -> 739 words). |
| update | html | 129 | 510 | 658 | 529 | existing_short_summary_review | Sammendrag: Calundan (Aalborg Universitet, 2019) - Strategisk analyse av Salling Group | https://projekter.aau.dk/strategisk-analyse-og-vaerdiansaettelse-af-salling-group-ae25861c.html | Document.content can be updated from URL text (129 -> 658 words). |
| update | html | 136 | 204 | 357 | 221 | existing_short_summary_review | Kunnskapsgrunnlag om kundeprogrammene i dagligvaremarkedet (SIFO 1-2026) | https://hdl.handle.net/ | Document.content can be updated from URL text (136 -> 357 words). |
| skip_no_document | html | 0 | 1486 | 0 | 0 | url_backed_text_extraction | Konkurrensverket rapport 2025:5 — Utvärdering av lagen om förbud mot otillbörliga handelsmetoder | https://www.konkurrensverket.se/informationsmaterial/rapportlista/utvardering-av-lagen-om-forbud-mot-otillborliga-handelsmetoder/ | No linked Document id; URL text repair requires a deterministic document target. |
| skip_no_document | pdf | 0 | 7994 | 0 | 0 | url_backed_text_extraction | KFST Evaluering af foedevarehandelsloven 2024 | https://kfst.dk/media/3wxbfqqe/20241120-evaluering-af-foedevarehandelsloven-2024.pdf | No linked Document id; URL text repair requires a deterministic document target. |
| skip_no_document | pdf | 0 | 4075 | 0 | 0 | url_backed_text_extraction | Elintarvikemarkkinavaltuutetun toimintakertomus 2024 | https://www.ruokavirasto.fi/globalassets/etmv/etmv-toimintakertomus-2024.pdf | No linked Document id; URL text repair requires a deterministic document target. |
| skip_no_document | html | 0 | 702 | 0 | 0 | url_backed_text_extraction | Handlingsplan for en sirkulaer okonomi 2024-2025 | https://www.regjeringen.no/no/dokumenter/handlingsplan-for-en-sirkular-okonomi/id3029477/ | No linked Document id; URL text repair requires a deterministic document target. |
| skip_no_document | html | 0 | 1892 | 0 | 0 | url_backed_text_extraction | Naermaste konkurrent-analys: 290 kommuner | https://www.konkurrensverket.se/informationsmaterial/rapportlista/dagligvaruhandelns-etablering-i-kommunerna/ | No linked Document id; URL text repair requires a deterministic document target. |
