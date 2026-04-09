# Plattform-kobling — seed ↔ arkiv

> AUTO-GENERERT av `scripts/audit-platform-linkage.ts` — ikke rediger manuelt.
> Generert: 2026-04-09T13:36:07.238Z
> Basert på: `seed-pdf-map.json` (generert 2026-04-09T13:36:07.124Z)

Denne rapporten kobler seed-entries i `src/lib/data/{theses,reports,sources}.ts` mot faktiske filer i `research/`. PDF-kobling leses fra den kanoniske mappen `seed-pdf-map.json` (generert av `build-seed-pdf-map.ts`). MD-kobling utledes via filnavn/id-heuristikk.

## Sammendrag

| Type | Total | Lokal PDF | Lokal MD | Ingen match |
|---|---:|---:|---:|---:|
| Theses | 71 | 32 | 62 | 4 |
| Reports | 85 | 50 | 32 | 22 |
| SourceDocs | 126 | 24 | 6 | 102 |

**Foreldreløse PDF-er:** 0 (se seksjon 4)

## 1. Theses → lokal fil (71)

| ID | Tittel | Forfattere | URL | Lokal PDF | Lokal MD | Conf |
|---|---|---|---|---|---|---|
| `jacobsen-jansson-2022` | Norway — the Black Sheep in the Scandinavian Grocery Industry | Jacobsen & Jansson | ✓ | `evidence-pack/akademia/jacobsen-jansson-2022-black-sheep.pdf` | `bibliotek/akademia/masteroppgaver/jacobsen-jansson-2022.md` | high |
| `nguyen-hartmann-2024` | Restrictive covenants in the Norwegian grocery market: an empirical study | Nguyen & Hartmann | ✓ | — | `bibliotek/akademia/masteroppgaver/nguyen-hartmann-2024.md` | none |
| `drager-vagene-2017` | Markedskonsentrasjon i Skandinavia | Drager & Vagene | ✓ | `evidence-pack/akademia/drager-vagene-2017.pdf` | `bibliotek/akademia/masteroppgaver/drager-vagene-2017.md` | high |
| `martens-norum-2020` | Importvernets pavirkning pa konsentrasjonen i leverandorleddet | Martens & Norum | ✓ | `evidence-pack/akademia/martens-norum-2020.pdf` | `bibliotek/akademia/masteroppgaver/martens-norum-2020.md` | high |
| `barbakken-hausken-2006` | Det norske dagligvaremarkedet: relasjoner mellom detaljist og produsent | Barbakken & Hausken | ✓ | — | `bibliotek/akademia/masteroppgaver/barbakken-hausken-2006.md` | none |
| `fretheim-rodnova-2020` | Etableringshindringer i dagligvaremarkedet: Lokale reguleringer som etableringshindring | Fretheim & Rodnova | ✓ | `evidence-pack/akademia/fretheim-rodnova-2020.pdf` | `bibliotek/akademia/masteroppgaver/fretheim-rodnova-2020.md` | high |
| `selmani-forre-2023` | Hvorfor mislyktes Lidl med a etablere seg pa det norske markedet? | Selmani & Forre | ✓ | `evidence-pack/akademia/selmani-forre-2023.pdf` | `bibliotek/akademia/masteroppgaver/selmani-forre-2023.md` | high |
| `skulstad-svensson-2024` | ICAs fall i Norge | Skulstad & Svensson | ✓ | `evidence-pack/akademia/skulstad-svensson-2024.pdf` | `bibliotek/akademia/masteroppgaver/skulstad-svensson-2024.md` | high |
| `sandanger-2012` | Horisontal konkurranse i dagligvaremarkedet: Bruken av egne merkevarer | Sandanger | ✓ | — | `bibliotek/akademia/masteroppgaver/sandanger-2012.md` | none |
| `skjervheim-flo-2016` | Paraplykjedenes overtakelse av distribusjonen i dagligvaremarkedet | Skjervheim Bernes & Flo | ✓ | `evidence-pack/akademia/skjervheim-flo-2016.pdf` | — | high |
| `gangstoe-2019` | Hemmelige kontrakter i dagligvaremarkedet | Gangstoe | ✓ | `evidence-pack/akademia/gangstoe-2019-uib.pdf` | `bibliotek/akademia/masteroppgaver/gangstoe-2019.md` | high |
| `kronqvist-2010` | Consumer-owned retail cooperative in duopoly with horizontally differentiated goods | Kronqvist | ✓ | — | `bibliotek/akademia/masteroppgaver/kronqvist-2010.md` | none |
| `meile-2020` | Uniform Pricing in Norwegian Grocery Retail | Meile | ✓ | `evidence-pack/akademia/meile-2020.pdf` | `bibliotek/akademia/masteroppgaver/meile-2020.md` | high |
| `huynh-mortensen-2025` | Analyse af Salling Group A/S og Coop Danmark A/S | Huynh & Mortensen | ✓ | `evidence-pack/akademia/huynh-mortensen-2025.pdf` | `bibliotek/akademia/masteroppgaver/huynh-mortensen-2025.md` | high |
| `nilsen-paulsen-2025` | Pass-through av ravarepriser for kakao- og kaffeprodukter | Nilsen & Paulsen | ✓ | `evidence-pack/akademia/nilsen-paulsen-2025.pdf` | `bibliotek/akademia/masteroppgaver/nilsen-paulsen-2025.md` | high |
| `halseth-phd-2024` | Competition and Grocery Retail Formats: Empirical Evidence from a Horizontal Acquisition in Norway | Halseth | — | — | `bibliotek/akademia/masteroppgaver/halseth-phd-2024.md` | none |
| `ulsaker-phd-2016` | On Vertical Restraints: Essays in Industrial Organzation | Ulsaker | ✓ | `evidence-pack/akademia/ulsaker-phd-thesis.pdf` | — | high |
| `hebrok-phd-2020` | Food Waste: A practice-oriented design for sustainability approach | Hebrok | ✓ | — | `bibliotek/akademia/masteroppgaver/hebrok-phd-2020.md` | none |
| `eriksson-phd-2015` | Supermarket food waste: Prevention and management | Eriksson | ✓ | — | `bibliotek/akademia/masteroppgaver/eriksson-phd-2015.md` | none |
| `albizzati-phd-2021` | Sustainability Assessment of Food Waste Management | Albizzati | ✓ | — | `bibliotek/akademia/masteroppgaver/albizzati-phd-2021.md` | none |
| `brancoli-phd-2021` | Prevention and valorisation of surplus bread | Brancoli | ✓ | `evidence-pack/akademia/brancoli-phd-2021.pdf` | `bibliotek/akademia/masteroppgaver/brancoli-phd-2021.md` | high |
| `sundin-phd-2024` | Sustainability of food waste prevention through food consumption | Sundin | ✓ | — | `bibliotek/akademia/masteroppgaver/sundin-phd-2024.md` | none |
| `lehtokunnas-phd-2023` | Enacting a Circular Economy | Lehtokunnas | ✓ | `evidence-pack/akademia/lehtokunnas-phd-2023.pdf` | `bibliotek/akademia/masteroppgaver/lehtokunnas-phd-2023.md` | high |
| `sundqvist-phd-2025` | Navigating a Transformative Governance Maze | Sundqvist | ✓ | — | `bibliotek/akademia/masteroppgaver/sundqvist-phd-2025.md` | none |
| `sorensen-phd-2016` | Organic food conversion in Danish public kitchens | Sorensen | — | `evidence-pack/akademia/sorensen-phd-2016-danish-public-kitchens.pdf` | `bibliotek/akademia/masteroppgaver/sorensen-phd-2016.md` | high |
| `esposito-2022` | Nar matsvinn blir et politikkomrade | Esposito | ✓ | — | `bibliotek/akademia/masteroppgaver/esposito-2022.md` | none |
| `deljanin-2015` | Market's imperfections — Building a concerned market for food waste | Deljanin | ✓ | — | `bibliotek/akademia/masteroppgaver/deljanin-2015.md` | none |
| `kayhan-ronnback-2019` | Dynamics in the Swedish Grocery Retail Industry | Kayhan & Ronnback | ✓ | `evidence-pack/akademia/kayhan-ronnback-2019.pdf` | `bibliotek/akademia/masteroppgaver/kayhan-ronnback-2019.md` | high |
| `burgherr-2019` | Food waste in Reykjavik — comparison 2015 vs 2018 | Burgherr | ✓ | — | `bibliotek/akademia/masteroppgaver/burgherr-2019.md` | none |
| `sigurdardottir-2017` | Predicting Household Food Waste Reduction | Sigurdardottir | ✓ | — | `bibliotek/akademia/masteroppgaver/sigurdardottir-2017.md` | none |
| `stein-2022` | Sustainable food procurement in public catering: UK vs DK/SE | Stein | ✓ | — | `bibliotek/akademia/masteroppgaver/stein-2022.md` | none |
| `steien-2016` | Matsikkerhet i Norge — er forsyningsberedskapen tilstrekkelig? | Steien | ✓ | — | `bibliotek/akademia/masteroppgaver/steien-2016.md` | none |
| `orlova-2019` | Kan et forbud mot prisdiskriminering fremme etablering av nettaktorer i dagligvaremarkedet? | Orlova | ✓ | — | `bibliotek/akademia/masteroppgaver/orlova-2019.md` | none |
| `morken-2015` | Effekter av innkjopssamarbeid i det norske dagligvaremarkedet | Morken | ✓ | — | `bibliotek/akademia/masteroppgaver/morken-2015.md` | none |
| `simonsen-2017` | Digitaliseringen av norsk dagligvarehandel | Simonsen | ✓ | — | `bibliotek/akademia/masteroppgaver/simonsen-2017.md` | none |
| `granlund-lindskog-2024` | The Status of Operational Technology Cybersecurity within The Norwegian Food Supply Sector | Granlund & Lindskog | ✓ | — | `bibliotek/akademia/masteroppgaver/granlund-lindskog-2024.md` | none |
| `sandbraaten-2023` | Hvordan kan Norge vri matkonsumet gronnere? | Sandbraaten | ✓ | — | `bibliotek/akademia/masteroppgaver/sandbraaten-2023.md` | none |
| `tallaksen-2022` | Mot baerekraftige kostholdsendringer | Tallaksen | — | — | `bibliotek/akademia/masteroppgaver/tallaksen-2022.md` | none |
| `vangelsten-2017` | Mot et baerekraftig norsk matsystem: Effekt pa selvforsyningsgrad og norsk jordbruk ved redusert konsum av kjott | Vangelsten | ✓ | — | `bibliotek/akademia/masteroppgaver/vangelsten-2017.md` | none |
| `moe-2018` | Alternative Food Networks — the Case of CSA in Norway | Moe | ✓ | — | `bibliotek/akademia/masteroppgaver/moe-2018.md` | none |
| `jevne-schiotz-2021` | Digitaliseringsstrategier for alternative matsystemer, med utgangspunkt i REKO-ringen | Jevne & Schiotz | ✓ | — | `bibliotek/akademia/masteroppgaver/jevne-schiotz-2021.md` | none |
| `tesdal-2013` | Nokkelhull pa matvarer — private aktorers okonomiske interesser og konsekvensene for myndighetenes merkeordning | Tesdal | ✓ | — | — | none |
| `handlykken-2023` | Nudging som atferdsoekonomisk virkemiddel for forbrukeratferd i dagligvare | Handlykken | ✓ | — | `bibliotek/akademia/masteroppgaver/handlykken-2023.md` | none |
| `paschen-eriksen-2014` | Matpolitikk i Norge — fremdeles norsk? Norsk forvaltnings arbeid med politikkutvikling innenfor EOS | Paschen-Eriksen | ✓ | — | `bibliotek/akademia/masteroppgaver/paschen-eriksen-2014.md` | none |
| `hasle-tjostheim-2024` | Lavprissegmentets utvikling i det norske dagligvaremarkedet | Hasle & Tjostheim | ✓ | `evidence-pack/akademia/hasle-tjostheim-2024.pdf` | `bibliotek/akademia/masteroppgaver/hasle-tjostheim-2024.md` | high |
| `lindstrom-phd-2021` | Food for Thought: Essays on Green Public Procurement and the Market for Organic Food | Lindstrom | ✓ | `evidence-pack/akademia/lindstrom-phd-2021.pdf` | — | high |
| `adlers-2022` | Gar det att oka graden av sjalvforsorjning? Svensk notkotts- och spannmalsproduktion | Adlers | ✓ | `evidence-pack/akademia/adlers-2022.pdf` | `bibliotek/akademia/masteroppgaver/adlers-2022.md` | high |
| `nikolaev-2023` | Food supply chain resilience to pandemics: A rapid review | Nikolaev | ✓ | `evidence-pack/akademia/nikolaev-2023.pdf` | `bibliotek/akademia/masteroppgaver/nikolaev-2023.md` | high |
| `khandaker-2021` | The resilience of the food supply chain to pandemic COVID-19: grain industry in Sweden | Khandaker | ✓ | `evidence-pack/akademia/khandaker-2021.pdf` | `bibliotek/akademia/masteroppgaver/khandaker-2021.md` | high |
| `sturen-2023` | Sustainable bread supply chains in Sweden | Sturen | ✓ | `evidence-pack/akademia/sturen-2023.pdf` | `bibliotek/akademia/masteroppgaver/sturen-2023.md` | high |
| `tanderup-rasmussen-hansen-2023` | Fremtidens Coop — En virksomhed i forandring | Tanderup, Rasmussen & Hansen | ✓ | `evidence-pack/akademia/tanderup-rasmussen-hansen-2023.pdf` | `bibliotek/akademia/masteroppgaver/tanderup-rasmussen-hansen-2023.md` | high |
| `jorgensen-ahmadi-2024` | Rema 1000: Nokkelen til succes pa det danske detailmarked | Jorgensen & Ahmadi | ✓ | `evidence-pack/akademia/jorgensen-ahmadi-2024.pdf` | `bibliotek/akademia/masteroppgaver/jorgensen-ahmadi-2024.md` | high |
| `storm-teigland-2017` | The Business of Food Waste: A Case Study of REMA 1000 | Storm & Teigland | ✓ | — | `bibliotek/akademia/masteroppgaver/storm-teigland-2017.md` | none |
| `schuler-2017` | Food Loss and Waste in the Fresh Potato Supply Chain of Denmark | Schuler | ✓ | — | `bibliotek/akademia/masteroppgaver/schuler-2017.md` | none |
| `minkeviciute-2019` | Assessment of Grocery eCommerce in Scandinavia | Minkeviciute | ✓ | — | `bibliotek/akademia/masteroppgaver/minkeviciute-2019.md` | none |
| `nielsen-andersen-2016` | Danish Grocery Retail: Does Preference Structure Influence the Perception of Price and Quality? | Nielsen & Andersen | ✓ | — | `bibliotek/akademia/masteroppgaver/nielsen-andersen-2016.md` | none |
| `syroegina-2016` | Retailer\'s role in reducing food waste: Case study of Finnish retailers | Syroegina | ✓ | — | `bibliotek/akademia/masteroppgaver/syroegina-2016.md` | none |
| `mattila-2024` | Impacts of data-driven demand forecasting in reducing food waste and CO2 emissions in campus restaurants | Mattila | ✓ | `evidence-pack/akademia/mattila-2024.pdf` | — | high |
| `makela-2023` | Managing waste in food supply chains with supply chain collaboration and integration | Makela | ✓ | `evidence-pack/akademia/makela-2023.pdf` | `bibliotek/akademia/masteroppgaver/makela-2023.md` | high |
| `johannsson-2011` | Food Security in Iceland: Present Vulnerabilities, Possible Solutions | Johannsson | ✓ | — | `bibliotek/akademia/masteroppgaver/johannsson-2011.md` | none |
| `naess-2024` | To-rolle-plattformer og egne merkevarer: en analyse av konkurranse- og velferdseffekter | Naess | — | — | `bibliotek/akademia/masteroppgaver/naess-2024.md` | none |
| `ortiz-cuadra-2023` | Learning for Crisis: Improving food security in Uppsala County through participative localized food production | Ortiz Cuadra | ✓ | `evidence-pack/akademia/ortiz-cuadra-2023.pdf` | `bibliotek/akademia/masteroppgaver/ortiz-cuadra-2023.md` | high |
| `stahl-2024` | Politics You Can Eat: Insights from the Implementation of Sodertalje Municipality\'s Food Supply Strategy | Stahl | ✓ | `evidence-pack/akademia/stahl-2024.pdf` | `bibliotek/akademia/masteroppgaver/stahl-2024.md` | high |
| `sedwall-2025` | Hybrid Supply Chain Models in Swedish Grocery Retail | Sedwall et al. | ✓ | — | — | none |
| `zakeri-lei-2024` | AI in the Swedish Food System: Exploring Adoption, Challenges, and Opportunities in Primary Production | Zakeri & Lei | ✓ | `evidence-pack/akademia/zakeri-lei-2024.pdf` | `bibliotek/akademia/masteroppgaver/zakeri-lei-2024.md` | high |
| `duong-2025` | Common Grocery Self-Service Checkout Failures That Customers Can Resolve Without Employee Assistance | Duong | ✓ | `evidence-pack/akademia/duong-2025.pdf` | `bibliotek/akademia/masteroppgaver/duong-2025.md` | high |
| `rislakki-2024` | Promoting the Planetary Health Diet in Grocery Retail: Comparison of Retail Chains in Finland | Rislakki | ✓ | `evidence-pack/arsrapporter/reitan-retail-2024.pdf` | `bibliotek/akademia/masteroppgaver/rislakki-2024.md` | low |
| `hagan-2025` | The Impact of Food Loss and Waste Reduction Practices on Consumer Grocery Store Choice | Hagan | ✓ | — | `bibliotek/akademia/masteroppgaver/hagan-2025.md` | none |
| `segersven-2024` | Development of risk management and resilience of supply chains in Finnish food industry companies post-COVID-19 | Segersven | ✓ | — | — | none |
| `lund-beijer-2026` | Impact of food retail market power on small food producers in Sweden: Challenges and opportunities | Lund University / Beijer Institute | ✓ | — | — | none |
| `rey-verge-2005` | The economics of vertical restraints | Rey & Vergé | — | `evidence-pack/akademia/rey-verge-2005.pdf` | — | high |

## 2. Reports → lokal fil (85)

| ID | Tittel | Institusjon | URL | Lokal PDF | Lokal MD | Conf |
|---|---|---|---|---|---|---|
| `nou-2011-4` | Mat, makt og avmakt | Matkjedeutvalget | ✓ | `evidence-pack/offentlig/nou-2011-4-mat-makt-avmakt.pdf` | `bibliotek/nou/nou-2011-4-sammendrag.md` | high |
| `nou-2022-14` | Inntektsmaaling i jordbruket | Regjeringen | ✓ | `evidence-pack/offentlig/nou-2022-14.pdf` | `bibliotek/nou/nou-2022-14-sammendrag.md` | high |
| `matsystemutvalget-2026` | Matsystemutvalget — Status 2026 | Matsystemutvalget | ✓ | — | — | none |
| `meld-st-11-selvforsyning` | Strategi for auka sjoelvforsyning | Landbruks- og matdepartementet | ✓ | `evidence-pack/offentlig/meld-st-11-selvforsyning-2024.pdf` | `bibliotek/stortingsdok/meld-st-11-selvforsyning.md` | medium |
| `meld-st-4-dagligvare` | Status dagligvaretiltak (10-punktsplanen) | Naerings- og fiskeridepartementet | ✓ | — | `bibliotek/stortingsdok/meld-st-4-dagligvare.md` | none |
| `riksrevisjonen-matsikkerhet-2023` | Riksrevisjonen: Matsikkerhet og beredskap | Riksrevisjonen | ✓ | `evidence-pack/offentlig/riksrevisjonen-matsikkerhet-2023.pdf` | `bibliotek/offentlig/riksrevisjonen-matsikkerhet-2023.md` | high |
| `sou-2024-8-svensk-beredskap` | Livsmedelsberedskap for en ny tid | Statens offentliga utredningar (Sverige) | ✓ | `evidence-pack/nordisk/sou-2024-8-livsmedelsberedskap.pdf` | `bibliotek/nordisk/sou-2024-8-svensk-beredskap.md` | high |
| `kt-dagligvarerapport-2024` | Dagligvarerapport 2024-25 | Konkurransetilsynet | ✓ | `evidence-pack/tilsyn/dagligvarerapport-2024.pdf` | `bibliotek/konkurransetilsynet/dagligvarerapport-2024.md` | high |
| `kt-marginstudie-2024-del1` | Marginstudie Del 1 | Konkurransetilsynet | ✓ | `evidence-pack/tilsyn/marginstudie-2024-del1-offisiell.pdf` | — | high |
| `kt-marginstudie-2025-del2` | Marginstudie Del 2 | Konkurransetilsynet | ✓ | `evidence-pack/tilsyn/marginstudie-2025-del2-offisiell.pdf` | — | high |
| `kt-markedsundersokelser-2026` | Markedsundersokelser § 14 — Status | Konkurransetilsynet | ✓ | — | — | none |
| `kt-prisjeger-saken-2024` | Prisjeger-saken (4,9 mrd. NOK) | Konkurransetilsynet | ✓ | `evidence-pack/tilsyn/prisjeger-saken-2024-offentlig-versjon.pdf` | — | medium |
| `kt-innkjopspriser-2017-2023` | Kartlegging av innkjopspriser 2017-2023 | Konkurransetilsynet | ✓ | `evidence-pack/tilsyn/innkjopspriser-2017-2023.pdf` | — | high |
| `kt-prisjusteringsvinduer-2023` | Utredning om prisjusteringsvinduer | Konkurransetilsynet | ✓ | `evidence-pack/tilsyn/prisjusteringsvinduer-2023.pdf` | `bibliotek/konkurransetilsynet/prisjusteringsvinduer-2023.md` | high |
| `nordisk-food-markets-2005` | Nordic Food Markets — A Taste for Competition | De nordiske konkurransemyndighetene | ✓ | `evidence-pack/nordisk/nordic-food-markets-2005.pdf` | `bibliotek/konkurransetilsynet/nordic-food-markets-2005.md` | high |
| `kfst-salling-coop-2025` | Salling Group / Coop Danmark-oppkjop | KFST | ✓ | `evidence-pack/nordisk/kfst-salling-coop-2025-full.pdf` | — | high |
| `kkv-fi-4a-dominans` | KKV — Konkurranseloven § 4a (Dominans) | KKV | ✓ | — | — | none |
| `is-markedsstruktur-2024` | Island — Markedskonsentrasjon og vertikal integrasjon | Samkeppniseftirlitid | ✓ | — | `bibliotek/nordisk-konkurranse/is-markedsstruktur-2024.md` | none |
| `se-konkurrensverket-2024-5` | Konkurrensverket Rapport 2024:5 | Konkurrensverket | ✓ | `evidence-pack/nordisk/konkurrensverket-2024-4-dagligvaruhandelns-etablering.pdf` | — | low |
| `dt-samarbeidsklima-2025` | Samarbeidsklima-undersokelsen 2025 | Dagligvaretilsynet | ✓ | `evidence-pack/tilsyn/dagligvaretilsynet-samarbeidsklima-2025.pdf` | — | low |
| `menon-funksjonelt-skille-2026` | Funksjonelt og regnskapsmessig skille | Menon Economics | ✓ | `evidence-pack/offentlig/menon-funksjonelt-skille-2026.pdf` | `bibliotek/offentlig/menon-funksjonelt-skille-2026.md` | high |
| `coop-2024` | Coop Aarsresultat 2024 | Coop Norge SA | ✓ | `evidence-pack/arsrapporter/coop-danmark-2024.pdf` | `bibliotek/bransje/arsrapporter/coop-danmark-2024.md` | low |
| `nordisk-sammenligning-2024` | Nordisk sammenligning 2024 | Diverse (ICA, Axfood, Kesko) | — | — | `bibliotek/bransje/arsrapporter/nordisk-sammenligning-2024.md` | none |
| `norgesgruppen-2024-25` | NorgesGruppen Aarsrapport 2024 | NorgesGruppen ASA | ✓ | `evidence-pack/arsrapporter/norgesgruppen-2024.pdf` | `bibliotek/bransje/arsrapporter/norgesgruppen-2024-25.md` | low |
| `reitan-2024-25` | Reitan Retail / REMA 1000 (2024/2025) | Reitan Retail AS | ✓ | `evidence-pack/arsrapporter/reitan-retail-2024.pdf` | `bibliotek/bransje/arsrapporter/reitan-2024-25.md` | medium |
| `verdibutikker-utfordrere` | Verdibutikkene — Normal og Europris |  | — | — | `bibliotek/bransje/arsrapporter/verdibutikker-utfordrere.md` | none |
| `asko-infrastruktur-2025` | ASKO — Infrastruktur og Logistikkmakt | ASKO / NorgesGruppen | ✓ | — | `bibliotek/bransje/logistikk/asko-infrastruktur-2025.md` | none |
| `dagligvarerapporten-2025` | Dagligvarerapporten 2025 | Virke Handel | ✓ | — | `bibliotek/bransje/organisasjoner/dagligvarerapporten-2025.md` | none |
| `dlf-leverandor-2025` | DLF Leverandorperspektivet 2025 | DLF | — | — | `bibliotek/bransje/organisasjoner/dlf-leverandør-2025.md` | none |
| `merkevarer-historie` | Merkevarenes historie — Orkla og TINE |  | — | — | `bibliotek/bransje/organisasjoner/merkevarer-historie.md` | none |
| `nbs-systemkritikk` | NBS — Systemkritikk | Norsk Bonde- og Smaabrukarlag | ✓ | — | `bibliotek/bransje/organisasjoner/nbs-systemkritikk.md` | none |
| `menon-emv-innovasjon` | Menon — EMV og Innovasjon | Menon Economics | ✓ | — | `bibliotek/konsulentrapporter/menon-emv-innovasjon.md` | none |
| `oslo-economics-forsvar-2024` | Oslo Economics — Konkurransen bedre enn sitt rykte | Oslo Economics | ✓ | `evidence-pack/konsulentrapport/oslo-economics-forsvar-2024.pdf` | `bibliotek/konsulentrapporter/oslo-economics-forsvar-2024.md` | high |
| `soa-emv-2023` | SOA — EMV og Vertikal integrasjon | Samfunnsokonomisk Analyse | ✓ | — | `bibliotek/konsulentrapporter/soa-emv-2023.md` | none |
| `civita-manifest-debatt` | Civita vs. Manifest — Matmaktdebatten |  | ✓ | — | `bibliotek/tenketanker/civita-manifest-debatt.md` | none |
| `fivh-etikk-2025` | FIVH — Etikk og Baerekraft 2025 | Framtiden i vaare hender | ✓ | `evidence-pack/tenketank/fivh-etikk-2025.pdf` | `bibliotek/tenketanker/fivh-etikk-2025.md` | high |
| `norden-policy-2024` | Nordisk Ministerraad — Policyverktoey 2024 | Nordisk Ministerraad | ✓ | — | `bibliotek/tenketanker/norden-policy-2024.md` | none |
| `stockholm-resilience-2019` | Stockholm Resilience Centre — Nordic Food Systems | Stockholm Resilience Centre | ✓ | `evidence-pack/tenketank/stockholm-resilience-2019.pdf` | `bibliotek/tenketanker/stockholm-resilience-2019.md` | high |
| `beredskap-finsk-modell-hvk` | Finsk matberedskap — HVK-modellen | Huoltovarmuuskeskus (HVK) | ✓ | — | — | none |
| `beredskap-island-melmolle-2025` | Islands melmolle og matsuverenitet | Islands regjering / Samkeppniseftirlitid | — | — | — | none |
| `beredskap-nibio-selvforsyning-2026` | NIBIO: Norsk selvforsyningsgrad 2026 | NIBIO (Norsk institutt for biookonomi) | ✓ | `evidence-pack/offentlig/nibio-selvforsyning-2026.pdf` | `bibliotek/beredskap/nibio-selvforsyning-2026.md` | low |
| `beredskap-nibio-selvforsyning-metode` | NIBIO: Metode for selvforsyningsberegning | NIBIO (Norsk institutt for biookonomi) | ✓ | — | — | none |
| `sirkularitet-matsvinn-2024` | Matsvinn i Norden — status 2024 | Nordisk Ministerraad | ✓ | `evidence-pack/offentlig/matsvinnutvalget-2024.pdf` | — | low |
| `sirkularitet-definisjoner-wur-emf` | Sirkulaer okonomi i matsystemer — definisjoner | Wageningen University / Ellen MacArthur Foundation | ✓ | — | — | none |
| `juridisk-eiendomsmakt-lokal-konkurranse` | Eiendomsmakt og lokal konkurranse | Dagligvaretilsynet / juridisk analyse | ✓ | — | — | none |
| `juridisk-eudr-norge-2025` | EUDR og norsk dagligvare | EU / norsk implementering | ✓ | — | — | none |
| `akademia-sifo-retail-media-2025` | SIFO: Retail media og forbrukermakt | SIFO / OsloMet | ✓ | — | — | none |
| `akademia-sifo-kundeprogram-2026` | SIFO: Lojalitetsprogrammer og prisdata | SIFO / OsloMet | ✓ | `evidence-pack/akademia/akademia-sifo-kundeprogram-2026.pdf` | — | high |
| `akademia-nhh-butikkstruktur-2024` | NHH: Butikkstruktur og lokal konkurranse | NHH — Norges Handelshoyskole | ✓ | — | — | none |
| `akademia-nhh-foros-media-2025` | NHH/Foros: Vertikal integrasjon i media og dagligvare | NHH — Norges Handelshoyskole | ✓ | `evidence-pack/akademia/akademia-nhh-foros-media-2025.pdf` | — | high |
| `akademia-nhh-matbors-historie` | NHH: Matboersens historie og matprisdannelse | NHH — Norges Handelshoyskole | ✓ | — | — | none |
| `akademia-uib-kjopermakt` | UiB: Kjoepermakt i nordisk dagligvare | Universitetet i Bergen | ✓ | — | — | none |
| `oversikt-bransje-statistikk-beredskap` | Bransjestatistikk og beredskapstall | Diverse kilder (Nielsen, SSB, dagligvaretilsynet) | — | — | — | none |
| `oversikt-nordisk-mat-tenkere` | Nordiske mat-tenkere og paavirkernettverk | Egenkartlegging | — | — | — | none |
| `oversikt-nordisk-matmakt-historikk` | Nordisk matmaktkonsentrasjon — historikk | Egenkartlegging / diverse kilder | — | — | — | none |
| `oversikt-nou-stortingsdok-juridisk` | NOU-er og stortingsdokumenter — juridisk oversikt | Stortinget / regjeringen | — | — | — | none |
| `oversikt-offentlig-rapportlogg` | Offentlig rapportlogg — matsektor | Diverse offentlige instanser | — | — | — | none |
| `oversikt-sirkularitet-dyp` | Sirkularitet i nordisk mat — dypanalyse | Egenkartlegging / nordiske kilder | — | — | — | none |
| `oversikt-tenketanker-ngo` | Tenketanker og NGO-er i nordisk matdebatt | Egenkartlegging | — | — | — | none |
| `oversikt-akademia-dyp-research` | Akademisk forskning paa nordisk dagligvare — oversikt | Egenkartlegging | — | — | — | none |
| `oversikt-nordisk-avhandlingsregister` | Nordisk avhandlingsregister — matpolitikk | Egenkartlegging | — | — | — | none |
| `asko-barekraft-2024` | ASKO Bærekraftsrapport 2024 | ASKO Norge AS | — | `evidence-pack/arsrapporter/asko-barekraft-2024.pdf` | — | high |
| `axfood-annual-report-2024` | Axfood Annual Report 2024 | Axfood AB | — | `evidence-pack/arsrapporter/axfood-annual-report-2024.pdf` | — | high |
| `coop-norge-2024` | Coop Norge Årsrapport 2024 | Coop Norge SA | — | `evidence-pack/arsrapporter/coop-norge-2024.pdf` | — | high |
| `hagar-2024-25` | Hagar hf. Årsrapport 2024-25 | Hagar hf. | — | `evidence-pack/arsrapporter/hagar-2024-25.pdf` | `bibliotek/bransje/arsrapporter/hagar-2024-25.md` | high |
| `ica-gruppen-annual-report-2024` | ICA Gruppen Annual Report 2024 | ICA Gruppen AB | — | `evidence-pack/arsrapporter/ica-gruppen-annual-report-2024.pdf` | — | high |
| `kesko-annual-report-2024` | Kesko Annual Report 2024 | Kesko Oyj | — | `evidence-pack/arsrapporter/kesko-annual-report-2024.pdf` | — | high |
| `salling-group-2024` | Salling Group Annual Report 2024 | Salling Group A/S | — | `evidence-pack/arsrapporter/salling-group-2024.pdf` | `bibliotek/bransje/arsrapporter/salling-group-2024.md` | high |
| `is-samkeppni-annual-report-2024` | Samkeppniseftirlitið Annual Report 2024 | Samkeppniseftirlitið | — | `evidence-pack/nordisk/is-samkeppni-annual-report-2024.pdf` | — | high |
| `dk-salling-coop-decision-2025` | Salling Group A/S erhvervelse af dele af Coop Danmark A/S | Konkurrence- og Forbrugerstyrelsen | — | `evidence-pack/nordisk/dk-salling-coop-decision-2025.pdf` | — | high |
| `salling-coop-danmark-2025` | Analyse af Salling Group A/S og Coop Danmark A/S | Konkurrence- og Forbrugerstyrelsen | — | `evidence-pack/nordisk/salling-coop-danmark-2025.pdf` | — | high |
| `konkurrensverket-summary-2024` | Konkurrensverket — Summary 2024 | Konkurrensverket | — | `evidence-pack/nordisk/konkurrensverket-summary-2024.pdf` | — | high |
| `finland-food-market-ombudsman-2023` | Finland Food Market Ombudsman Report 2023 | Elintarvikemarkkinavaltuutettu (Food Market Ombudsman) | — | `evidence-pack/nordisk/finland-food-market-ombudsman-2023.pdf` | — | high |
| `finland-food2030` | Finland Food2030 Strategy | Finnish Government | — | `evidence-pack/nordisk/finland-food2030.pdf` | — | high |
| `karlstad-declaration-2024` | Karlstad Declaration 2024 | Nordic Council of Ministers | — | `evidence-pack/nordisk/karlstad-declaration-2024.pdf` | — | high |
| `nordic-food-alert-2025` | Nordic Food Alert 2025 | Nordic Council of Ministers | — | `evidence-pack/nordisk/nordic-food-alert-2025.pdf` | — | high |
| `dagligvaretilsynet-aarsrapport-2021` | Dagligvaretilsynet — Årsrapport 2021 | Dagligvaretilsynet | — | `evidence-pack/offentlig/dagligvaretilsynet-aarsrapport-2021.pdf` | — | high |
| `dagligvaretilsynet-aarsrapport-2022` | Dagligvaretilsynet — Årsrapport 2022 | Dagligvaretilsynet | — | `evidence-pack/offentlig/dagligvaretilsynet-aarsrapport-2022.pdf` | — | high |
| `dagligvaretilsynet-aarsrapport-2023` | Dagligvaretilsynet — Årsrapport 2023 | Dagligvaretilsynet | — | `evidence-pack/offentlig/dagligvaretilsynet-aarsrapport-2023.pdf` | — | high |
| `dagligvaretilsynet-aarsrapport-2024` | Dagligvaretilsynet — Årsrapport 2024 | Dagligvaretilsynet | — | `evidence-pack/offentlig/dagligvaretilsynet-aarsrapport-2024.pdf` | — | high |
| `emv-kartlegging-2023` | Kartlegging av EMV (Egne Merkevarer) 2023 | Dagligvaretilsynet | — | `evidence-pack/offentlig/emv-kartlegging-2023.pdf` | — | high |
| `eu-utp-report-2024` | EU UTP Directive — Implementation Report 2024 | European Commission | — | `evidence-pack/offentlig/eu-utp-report-2024.pdf` | — | high |
| `eu-utp-staff-working-doc-2024` | EU UTP Directive — Commission Staff Working Document 2024 | European Commission | — | `evidence-pack/offentlig/eu-utp-staff-working-doc-2024.pdf` | — | high |
| `nou-2013-6-god-handelsskikk` | NOU 2013:6 God handelsskikk i dagligvarekjeden | Regjeringen | ✓ | `evidence-pack/offentlig/nou-2013-6-god-handelsskikk.pdf` | `bibliotek/nou/nou-2013-6-god-handelsskikk.md` | high |
| `agrianalyse-bondens-andel-2025` | Bondens andel av forbrukerkronen 2025 | AgriAnalyse | — | `evidence-pack/akademia/agrianalyse-bondens-andel-2025.pdf` | — | high |

## 3. SourceDocs → lokal fil (126)

| ID | Tittel | Filnavn | URL | Lokal PDF | Lokal MD | Conf |
|---|---|---|---|---|---|---|
| `src-1` | Den store NI-soknaden (avslatt). Full prosjektbeskrivelse, partnere, budsjett, handlingsplan | Just now (12.Revise-Gab) Nordic Circular Food systems - V.2.md | — | — | — | none |
| `src-2` | Oslo Innovasjonsprogram-soknad med bakgrunn fra Cecilie, ideer, mal | 1. Food system_ Oslo Innovasjons program 2025.md | — | — | — | none |
| `src-3` | Mote 9. mars med aksjonspunkter fra Einar/Martin | 9, mars 2026 FOOD.md | — | — | — | none |
| `src-4` | Lengre samtale om strategi, data, verdikjeder, transition groups og nordisk merverdi | Speaker 1.md | — | — | — | none |
| `src-5` | Samtale om a finne dokumenter, bakgrunnsmateriale og starte arbeidet | Speaker 1 (1).md | — | — | — | none |
| `src-6` | Samme som 9. mars-notater med ekstra kontekst | Untitled document.md | — | — | — | none |
| `src-7` | Cathrines 20-siders drofting: TG-metodikk, governance, branding, tjenester | 2026 1401 DROFTING TRANSITION GROUPS.pdf | — | — | — | none |
| `src-8` | Revidert 10-step start, vurderingskriterier, felles prosesser | 2026 TRANSITION GROUP OVERVIEW WORKING DOC.pdf | — | — | — | none |
| `src-9` | Martin videresender NCH 2025-soknaden (Michel Bajuk justert) | Natural State Mail - NCH application 2025.pdf | — | — | — | none |
| `src-10` | Cathrine deler droftingsdokumentet med Gabriel | Natural State Mail - DROFTING TG.pdf | — | — | — | none |
| `src-11` | Kopi av Oslo-soknaden | 1. Food system_ Oslo Innovasjons program 2025 (1).md | — | — | — | none |
| `src-12` | Dokumenterte massiv maktforskyvning fra produsent til kjedenes paraplyorganisasjoner. | nou-2011-4-sammendrag.md | ✓ | `evidence-pack/offentlig/nou-2011-4-mat-makt-avmakt.pdf` | — | low |
| `src-13` | Foreslår nye hovedmål for inntektsmåling og analyserer primærprodusentens kår. | nou-2022-14-sammendrag.md | ✓ | — | — | none |
| `src-14` | Nyeste status på markedsandeler, marginer og etableringshindringer. | dagligvarerapport-2024.md | ✓ | `evidence-pack/tilsyn/dagligvarerapport-2024.pdf` | `bibliotek/konkurransetilsynet/dagligvarerapport-2024.md` | high |
| `src-15` | Dokumenterer det operative forholdet mellom kjeder og leverandører. | samarbeidsklima-2025.md | ✓ | `evidence-pack/tilsyn/dagligvaretilsynet-samarbeidsklima-2025.pdf` | — | high |
| `src-16` | Kritisk analyse av systemets sårbarhet og manglende kriseplanlegging. | beredskap-2023.md | ✓ | — | — | none |
| `src-17` | Finansielle resultater og strategisk retning for markedslederen. | norgesgruppen-2024-25.md | ✓ | `evidence-pack/arsrapporter/norgesgruppen-halvarsrapport-2025.pdf` | — | low |
| `src-18` | Samvirkemodellens resultater og vekst for Extra. | coop-2024.md | ✓ | — | — | none |
| `src-19` | Analyserer produktivitet og marginer i skandinavisk kontekst. | jacobsen-jansson-2022.md | ✓ | `evidence-pack/akademia/jacobsen-jansson-2022-black-sheep.pdf` | — | high |
| `src-20` | Forklarer prissettingens dynamikk og medias rolle som regulator. | foros-media-2025.md | ✓ | `evidence-pack/akademia/akademia-nhh-foros-media-2025.pdf` | — | high |
| `src-21` | Analyse av digital makt og personlig prising i kundeprogrammer. | sifo-kundeprogram-2026.md | ✓ | `evidence-pack/akademia/sifo-kundeprogram-2026.pdf` | `bibliotek/akademia/sifo/sifo-kundeprogram-2026.md` | high |
| `src-22` | Dokumenterer etableringshindringer gjennom strategisk bruk av eiendom. | nguyen-hartmann-2024.md | ✓ | — | — | none |
| `src-23` | Systemisk blikk på sårbarhet og transformasjonsbehov i Norden. | stockholm-resilience-2019.md | ✓ | `evidence-pack/tenketank/stockholm-resilience-2019.pdf` | `bibliotek/tenketanker/stockholm-resilience-2019.md` | high |
| `src-24` | Regulering av markedsmakt med automatisk dominans-presumsjon over 30%. | kkv-4a-dominans.md | ✓ | — | — | none |
| `src-25` | Analyse av inflasjon og markedsmakt i det svenske matmarkedet. | konkurrensverket-2024-5.md | ✓ | — | — | none |
| `src-26` | Definerer nasjonalt mål om 50% selvforsyning innen 2030. | meld-st-11-selvforsyning.md | ✓ | `evidence-pack/offentlig/meld-st-11-selvforsyning-2024.pdf` | — | medium |
| `src-27` | Status for regjeringens 10-punktsplan for dagligvarebransjen. | meld-st-4-dagligvare.md | ✓ | — | — | none |
| `src-28` | Dybdeanalyse av maktforskyvning gjennom eierskap i produksjonsleddet. | soa-emv-2023.md | ✓ | — | — | none |
| `src-29` | Offisielle markedstall for norsk dagligvarebransje. | dagligvarerapporten-2025.md | ✓ | `evidence-pack/offentlig/meld-st-4-2024-2025-dagligvare.pdf` | — | low |
| `src-30` | Dokumenterer infrastruktur og logistikkens rolle i verdikjeden. | asko-infrastruktur-2025.md | ✓ | — | — | none |
| `src-31` | Metodisk grunnlag for å vurdere matsikkerhet i energi og volum. | nibio-selvforsyning-metode.md | ✓ | — | — | none |
| `src-32` | Kvantifiserer ressurstap i hele verdikjeden. | matsvinn-2024.md | ✓ | — | — | none |
| `src-33` | Dokumenterer Norges prisposisjon sammenlignet med EU. | price-levels-2024.md | ✓ | — | — | none |
| `src-34` | Politiske ytterpunkter i debatten om importvern og markedsmakt. | civita-manifest-debatt.md | — | — | — | none |
| `src-35` | Sosial bærekraft og etisk handel i matsystemet. | fivh-etikk-2025.md | ✓ | `evidence-pack/tenketank/fivh-etikk-2025.pdf` | `bibliotek/tenketanker/fivh-etikk-2025.md` | high |
| `src-36` | Status for nye regulatoriske verktøy for å tøyle markedsmakt. | markedsundersokelser-status.md | ✓ | — | — | none |
| `src-37` | Vurderer EMVs effekt på konkurranse og innovasjonstakt. | menon-emv-innovasjon.md | ✓ | — | — | none |
| `src-38` | Teoretisk rammeverk for kjøpermakt og forbrukervelferd. | uib-kjøpermakt.md | ✓ | — | — | none |
| `src-39` | Gjennomgang av den finske modellen for beredskapslagring. | finsk-modell-hvk.md | ✓ | — | — | none |
| `src-40` | Systemkritikk fra produsentens ståsted om selvforsyning og import. | nbs-systemkritikk.md | ✓ | — | — | none |
| `src-41` | Systemkritiske teser om matpriser, ultraprosessering og selvforsyning. | nordstad-tesen.md | — | — | — | none |
| `src-42` | Juridisk vedtak om ulovlig informasjonsutveksling (prisjegere). | prisjeger-saken.md | ✓ | `evidence-pack/tilsyn/prisjeger-saken-2024-offentlig-versjon.pdf` | — | medium |
| `src-43` | Dokumenterer lekkasje fra det norske matsystemet til Sverige. | grensehandel-2025.md | ✓ | — | — | none |
| `src-44` | Historisk bevis på lønnsomhetsutvikling i verdikjeden. | marginstudie-2024-del1.md | ✓ | `evidence-pack/tilsyn/marginstudie-2024-del1-offisiell.pdf` | — | medium |
| `src-45` | Bransjebestilt forsvar for dagens markedskonkurranse. | oslo-economics-forsvar-2024.md | ✓ | `evidence-pack/konsulentrapport/oslo-economics-forsvar-2024.pdf` | `bibliotek/konsulentrapporter/oslo-economics-forsvar-2024.md` | high |
| `src-46` | Dokumenterer vekst for utfordrere utenfor det tradisjonelle triopolet. | verdibutikker-utfordrere.md | — | — | — | none |
| `src-47` | Offisielle tall for bondens økonomiske realitet. | totalkalkylen-2024.md | ✓ | — | — | none |
| `src-48` | Leverandørperspektiv på maktbalanse og logistikk-monopol. | dlf-leverandør-2025.md | ✓ | — | — | none |
| `src-49` | Nye sporbarhetskrav for fôrimport og kjøttproduksjon. | eudr-norge-2025.md | ✓ | — | — | none |
| `src-50` | Geografisk analyse av tilgang til mat og sårbarhet. | butikkstruktur-2024.md | — | — | — | none |
| `src-51` | Historisk oversikt over maktkampen mellom industri og kjeder. | merkevarer-history.md | — | — | — | none |
| `src-52` | Dokumenterer fysiske etableringsbarrierer i lokale markeder. | eiendomsmakt-lokal-konkurranse.md | — | — | — | none |
| `src-53` | Historisk analyse av matbørsenes effekt på prisstrategier. | matbors-historie.md | — | `evidence-pack/offentlig/meld-st-4-2024-2025-dagligvare.pdf` | — | low |
| `src-54` | Finansielle resultater for REMA 1000 og Reitan Retail. | reitan-2024-25.md | ✓ | `evidence-pack/arsrapporter/reitan-retail-2024.pdf` | — | low |
| `src-55` | Kartlegging av landbruk, husdyrhold og planteproduksjon i alle 5 nordiske land. 610 linjer. | 01-primaerproduksjon.md | — | — | — | none |
| `src-56` | Kartlegging av matforedlingsindustrien i alle 5 nordiske land. 353 linjer. | 02-foredling.md | — | — | — | none |
| `src-57` | Kartlegging av grossist- og distribusjonsinfrastruktur i alle 5 nordiske land. 739 linjer. | 03-distribusjon-logistikk.md | — | — | — | none |
| `src-58` | Kartlegging av gjodsel, for, fro, energi og maskiner for nordisk matproduksjon. 465 linjer. | 04-innsatsvarer.md | — | — | — | none |
| `src-59` | Kartlegging av foodservice-sektoren i alle 5 nordiske land. 403 linjer. | 05-horeca.md | — | — | — | none |
| `src-60` | Kartlegging av matsvinn og sirkularitet i hele verdikjeden i alle 5 land. 472 linjer. | 06-matsvinn-sirkulaer.md | — | — | — | none |
| `src-61` | Kartlegging av sjomatverdikjeden i hele Norden inkl. Faeroyene. 615 linjer. | 07-sjoemat.md | — | — | — | none |
| `src-62` | Kartlegging av forbruksmonstre og kostholdstrender i alle 5 land. 558 linjer. | 08-forbruk.md | — | — | — | none |
| `src-63` | Bedriftsdata for 14 norske mataktorer: org.nr, eierstruktur, aksjonaerer, styrer, regnskap, tilskudd, IP. Basert paa brreg.no API og offentl | 09-norsk-bedriftsdata.md | ✓ | — | — | none |
| `src-64` | Syntesedokument som analyserer maktkonsentrasjon, krysseierskap, flaskehalser, verdifordeling, systemrisiko og sirkulaerokonomi-gaps pa tver | 10-kryss-analyse.md | — | — | — | none |
| `src-65` | 10 primaerkilder: NOU 2013:6, Meld. St. 9/11/4, Prop. 33 L, markedsetterforskning, lov om god handelsskikk, konkurranseloven, finsk 4a, EU U | nou-stortingsdok-juridisk.md | ✓ | — | — | none |
| `src-66` | 12 kilder fra Konkurransetilsynet, Dagligvaretilsynet, KFST, SOA, Menon og Oslo Economics. Inkl. Prisjeger-vedtaket (4,9 mrd), marginstudien | konkurransetilsyn-konsulent.md | — | — | — | none |
| `src-67` | 16 kilder: Virke, NHO Mat og Drikke, Bondelaget, Sjoemat Norge, SSB, Eurostat, FAO, OECD, NIBIO, DSB, HVK Finland. 30+ noekkelmetrikker. | bransje-statistikk-beredskap.md | — | — | — | none |
| `src-68` | 27 akademiske kilder: Steen/Foros (NHH FOOD), Gabrielsen (UiB), SIFO dyrtid/referansebudsjett, Dobson (buyer power), OECD competition in foo | akademia-dyp-research.md | — | — | — | none |
| `src-69` | 17 kilder: Civita/Agenda/Manifest (politisk spekter), FIVH/Naturvernforbundet/Matvalget (miljo), SRC/Nordic Council/EAT/IPES-Food (systemniv | tenketanker-ngo.md | — | — | — | none |
| `src-70` | 22 kilder: Matvett matsvinn 407k tonn, matsvinnloven 2026, biogass-gap 11,6x (DK 8 TWh vs NO 0,7 TWh), fosfor-gjenvinning HIAS, insektprotei | sirkularitet-dyp.md | — | — | — | none |
| `src-71` | Destillering av 27+ forskningstraader fra meeting-4 (strategisk ledergruppe 16. mars). 7 seksjoner: hypoteser, konseptuelle gap, datainfrast | meeting-4-research-focus.md | — | — | — | none |
| `src-72` | Wageningen-rammeverk med 4 operative prinsipper for sirkulaere matsystemer og biomassehierarki. | sirkulaer-matsystem-rammeverk.md | ✓ | — | — | none |
| `src-73` | Nature Food-artikkel som modellerer europeisk sirkularitet og viser at CFS reduserer globalt arealbruk 71% og GHG 29%. | van-zanten-nature-food-2023.md | ✓ | — | — | none |
| `src-74` | Oppdatert planetaert referansekoshold med sterkere vekt paa regenerativt landbruk og sirkulaer biomasse. | eat-lancet-2025.md | ✓ | — | — | none |
| `src-75` | EUs groenne innkjoepskriterier for mat: oekologisk, lavutslipp, redusert matsvinn i offentlige kontrakter. | jrc-spp-2025.md | — | — | — | none |
| `src-76` | Identifiserer 12 nordiske intervensjonspunkter for matsystemtransformasjon inkl. 4 pilarer. | nkj-white-paper-2024.md | — | — | — | none |
| `src-77` | Kartlegger lokal markedskonsentrasjon i Norge paa postnummernivaet. Median HHI=1.0 (monopol). | halseth-nhh-2023.md | — | — | — | none |
| `src-78` | Svensk analyse av lokal konkurranse: 102 av 290 kommuner mangler discounter. | konkurrensverket-2024-4.md | ✓ | `evidence-pack/nordisk/konkurrensverket-2024-4-dagligvaruhandelns-etablering.pdf` | — | medium |
| `src-79` | Dansk fusjonsanalyse med drive-time HHI-metodikk for dagligvare. | kfst-fusjon-2024.md | — | `evidence-pack/nordisk/kfst-salling-coop-2025-full.pdf` | — | medium |
| `src-80` | 7-domene komposittindeks for food access i UK. Kombinerer GIS, kvalitet og oekonomi. | cdrc-priority-places.md | ✓ | — | — | none |
| `src-81` | Finsk husholdningsundersoekelse: median 700m til naermeste dagligvarebutikk. | statistics-finland-hbs-2012.md | — | — | — | none |
| `src-82` | Arlig markedsandelskartlegging for svensk dagligvare. | ecr-dagligvarukartan-2024.md | — | `evidence-pack/offentlig/meld-st-4-2024-2025-dagligvare.pdf` | — | low |
| `src-83` | Offisielle finske dagligvaretall: S Group 48.8%, K Group 33.7%. | pty-grocery-2024.md | — | `evidence-pack/nordisk/pty-finnish-grocery-trade-statistics-2024.pdf` | — | medium |
| `src-84` | Dansk dagligvaremarked: Salling 36.3%, Coop 29.5%, Aldi exit. | usda-gain-denmark-2024.md | — | `evidence-pack/arsrapporter/reitan-retail-2024.pdf` | — | low |
| `src-85` | Islandsk dagligvaremarked: Hagar ~48%, Festi ~28%, Drangar-fusjon. | usda-gain-iceland-2024.md | — | `evidence-pack/arsrapporter/reitan-retail-2024.pdf` | — | low |
| `src-86` | Akademisk analyse av norsk dagligvaremarked med HHI-beregning og prismekanismer. | nhh-food-steen-2024.md | — | — | — | none |
| `src-87` | PhD-avhandling: Coop/ICA rebranding av 554 butikker → 7-12.9% salgsfall for eksisterende discountere. | halseth-phd-2024.md | — | — | — | none |
| `src-88` | PhD SLU: 6-butikk studie av matsvinn i svensk dagligvare, 1.2% av omsetning. | eriksson-phd-2015.md | — | — | — | none |
| `src-89` | PhD SLU: 32% husholdningsavfall forebyggbart, men kun 0.5% av nasjonale utslipp. | sundin-phd-2024.md | — | — | — | none |
| `src-90` | PhD Tampere: Etnografi av sirkulaer oekonomi i praksis, multiple framtidsscenarier. | lehtokunnas-phd-2023.md | — | `evidence-pack/akademia/lehtokunnas-phd-2023.pdf` | `bibliotek/akademia/masteroppgaver/lehtokunnas-phd-2023.md` | high |
| `src-91` | Ekspertutvalg konkluderer at 75% reduksjon av matsvinn er mulig — langt over SDG 12.3 (50%). | matsvinnutvalget-2024.md | — | `evidence-pack/offentlig/matsvinnutvalget-2024.pdf` | — | high |
| `src-92` | Nordisk biooekonomivisjon med maal for 2030 inkl. sirkulaere matsystemer. | nmr-vision-2030.md | — | — | — | none |
| `src-93` | OECD-rapport om maalemetoder og verdsetting av matsvinn — utover SDG-maal. | oecd-flw-2025.md | — | — | — | none |
| `src-94` | Dokumenterer 500 000+ tonn smaapelagisk fisk fra Vest-Afrika til EU aarlig, inkl. norsk laksenaering. | greenpeace-feeding-monster-2021.md | ✓ | — | — | none |
| `src-95` | 123-144K tonn Vest-Afrika smaapelagisk fisk til norsk for i 2020 — 2.5-4M menneskers matforbruk. | feedback-blue-empire-2024.md | — | — | — | none |
| `src-96` | Industriinitiativ: 0.4% → 25% nye raavarer i norsk laksefor innen 2030. | ravareloeftet-2024.md | — | — | — | none |
| `src-97` | Foerste kommersielle laksefor helt uten fiskemel (MicroBalance FLX). | skretting-sustainability-2024.md | — | — | — | none |
| `src-98` | Nordisk forskningsprosjekt paa gjaer- og soppbasert protein fra skog- og matsidestroemmer. | nordicfeed-nordforsk.md | — | — | — | none |
| `src-99` | Norsk forskningsprosjekt: dyrke omega-3-rike alger fra industrielt CO2-utslipp for laksefor. | green-platform-mikroalger.md | — | — | — | none |
| `src-100` | Ratranskripsjon fra strategisk ledergruppemote med roller, leveranser, nordisk retning og Food/Cities-kobling. | Strategisk ledergruppe Marked 16 mars 2026.md | — | — | — | none |
| `src-101` | Product Requirements Document for EUDR compliance platform: supply chain traceability, satellite deforestation layers, Due Diligence Stateme | coffee-forest-prd.md | — | — | — | none |
| `src-102` | Forskningsoversikt over EUs avskogingsforordning med fokus på kaffeimport og compliance-krav. | coffee-forest-eudr-research.md | — | — | — | none |
| `src-103` | Nyeste NI-søknad for Nordic Circular Construction med oppdatert prosjektbeskrivelse, konsortium og Nordic Material Intelligence-rammeverk. | ni-soknad-ncc-fase-2.md | — | — | — | none |
| `src-104` | Møtenotater fra planlegging av studietur til Skottland: akvakulturinnovasjon, industriell symbiose, alternative fiskefôr, bioparker, biogass | biosirkel-studietur-zero-waste-scotland.md | — | — | — | none |
| `src-105` | Strategimøte om NCH nordisk-baltisk samarbeid. Bekrefter Mat og matsystemer som aktiv transition group. RIMI som baltisk dagligvarekobling.  | nordic-house-mote.md | — | — | — | none |
| `src-106` | 6 transition groups inkl. Mat og bioøkonomi (matsvinn, bioprodukter, sirkulære verdikjeder). Nordisk-baltisk ekspansjon, 10-årsplan, events  | nch-hovedside.md | — | — | — | none |
| `src-107` | Internt funding-verktøy med 9958 grants, 250 ordninger. Dekker NFR, Horizon Europe, SkatteFUNN, Doffin. NCH-strategi: NI 5M NOK, Interreg OK | nch-funding-map.md | — | — | — | none |
| `src-108` | Prosjekthub for Biosirkel-initiativet under Natural States markedsutvikling. Status: Aktivt. Prosjektnummer 78. | biosirkel-prosjekt.md | — | — | — | none |
| `src-109` | Kildeliste fra Fuglen Coffee-prosjektet med leverandørdata og compliance-referanser. | fuglen-sources.md | — | — | — | none |
| `src-110` | Kartlegging av matsvinnregulering i Norden: bransjeavtaler, EU-krav, matdonasjonslovgivning, sektoransvar. | SEC-MAT-01-regulering-matsvinn.md | — | — | — | none |
| `src-111` | Sirkulære matprosesser: sidestrømsvalorisering, biogass fra matavfall, insektprotein, fermentering, nordiske eksempler. | SEC-MAT-02-sirkuaere-prosesser-biookonomi.md | — | — | — | none |
| `src-112` | EU PPWR-forordningen og emballasje i matindustrien: gjenbrukskrav, resirkuleringsmål, nordiske pilotprosjekter. | SEC-MAT-03-emballasje-ppwr.md | — | — | — | none |
| `src-113` | Detaljert gjennomgang av lovverk knyttet til matsvinn: EU matsvinnforordning, norsk forskrift, rapporteringskrav, bransjeavtale mot matsvinn | SEC-MAT-REG-01-matsvinn-lovverk.md | — | — | — | none |
| `src-114` | Detaljanalyse av emballasjeregulering spesifikt for matsektoren: Grønt Punkt, retursystemer, SUP-direktiv, nordisk harmonisering. | SEC-MAT-REG-02-emballasje-matsektor.md | — | — | — | none |
| `src-115` | Analyse av dansk historisk CO2-avgift på landbruk (vedtatt 2024): 300 DKK/tonn CO2e fra 2030, 750 DKK fra 2035. Konsekvenser for nordisk mat | SEC-MAT-REG-03-danmark-co2-avgift.md | — | — | — | none |
| `src-116` | Analyse av nordisk kostholdspolitikk og matberedskap: NNR2023, selvforsyningsgrad, nordisk kostholdsmønster, beredskapslagre. | SEC-MAT-KOST-01-nordisk-kosthold-beredskap.md | — | — | — | none |
| `src-117` | Kartlegging av fremtidens matteknologi: presisjonsfermentering, cellulært landbruk, vertikal dyrking, AI i matproduksjon, nordiske startups. | SEC-MAT-TEK-01-matteknologi.md | — | — | — | none |
| `src-118` | Alternative proteiner i Norden: plantebasert, insektprotein, mikrobielt protein, microalger. Regulatorisk status og markedspotensial. | SEC-MAT-TEK-02-biotech-proteiner.md | — | — | — | none |
| `src-119` | Analyse av nordisk havbruk og fôrverdikjede: soyaavhengighet, alternative fôrkilder (insekt, mikroalger, encelleprotein), bærekraftssertifis | SEC-MAT-PROD-01-havbruk-for.md | — | — | — | none |
| `src-120` | Regenerativt landbruk i nordisk kontekst: karbonfangst i jord, redusert jordbearbeiding, agroskogbruk, norske og svenske pilotprosjekter. | SEC-MAT-PROD-02-regenerativt-landbruk.md | — | — | — | none |
| `src-121` | Teknisk dybdeanalyse av blå bioøkonomi: tang/tare-industri, sjømatrestråstoff, marin bioprospektering, nordiske verdikjeder. | SEC-MAT-PROD-03-blaa-biookonomi.md | — | — | — | none |
| `src-122` | 382-linjers sektoranalyse av mat/biomasse-verdikjeder i alle 5 nordiske land. Matsvinn >3.6M tonn/år, biogass (DK 8.1 TWh vs NO 0.47 TWh), R | SA-02-mat-og-biomasse.md | — | — | — | none |
| `src-123` | 14 dokumenterte kommunale food-circular cases: Den Magiske Fabrikken, Billund BioRefinery, REKO-ringer (274 ringer, 786k forbrukere). | C02-mat-biomasse-biogass.md | — | — | — | none |
| `src-124` | 447-linjers nordisk policy-syntese. Mat = 1 av 7 CEAP-prioriteter. Dekker EU Taxonomy, CSRD, nordiske handlingsplaner. | 15-nordic-policy-landscape.md | — | — | — | none |
| `src-125` | Analyse av Horizon Europe Cluster 6-kall. CIRCBIO-09: EUR 12M for food security + bioeconomy + climate. Direkte finansieringsmulighet. | 07-horizon-europe-call-analysis.md | — | — | — | none |
| `src-126` | NCH 4 transition groups: Cities, Corporations, Food, Textile. Food Systems og Circular Cities som søsterprosjekter med delt KPI-rammeverk. | 19-nordic-added-value.md | — | — | — | none |

## 4. Foreldreløse PDF-er (0)

PDF-filer i `research/` som ikke er koblet til noen seed-entry. Kandidater for innlegging i `src/lib/data/{reports,theses}.ts` eller eksklusjon via `seed-pdf-map.overrides.json`.

