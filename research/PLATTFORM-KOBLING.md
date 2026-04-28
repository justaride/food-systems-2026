# Plattform-kobling — seed ↔ arkiv

> AUTO-GENERERT av `scripts/audit-platform-linkage.ts` — ikke rediger manuelt.
> Generert: 2026-04-28T13:01:31.005Z
> Basert på: `seed-pdf-map.json` (generert 2026-04-28T13:01:23.072Z)

Denne rapporten kobler seed-entries i `src/lib/data/{theses,reports,sources}.ts` mot faktiske filer i `research/`. PDF-kobling leses fra den kanoniske mappen `seed-pdf-map.json` (generert av `build-seed-pdf-map.ts`). MD-kobling utledes via filnavn/id-heuristikk.

## Sammendrag

| Type | Total | Lokal PDF | Lokal MD | Ingen match |
|---|---:|---:|---:|---:|
| Theses | 78 | 44 | 62 | 10 |
| Reports | 108 | 60 | 35 | 33 |
| SourceDocs | 164 | 42 | 6 | 122 |

**Foreldreløse PDF-er:** 262 (se seksjon 4)

## 1. Theses → lokal fil (78)

| ID | Tittel | Forfattere | URL | Lokal PDF | Lokal MD | Conf |
|---|---|---|---|---|---|---|
| `jacobsen-jansson-2022` | Norway — the Black Sheep in the Scandinavian Grocery Industry | Jacobsen & Jansson | ✓ | `evidence-pack/akademia/jacobsen-jansson-2022-black-sheep.pdf` | `bibliotek/akademia/masteroppgaver/jacobsen-jansson-2022.md` | high |
| `nguyen-hartmann-2024` | Restrictive covenants in the Norwegian grocery market: an empirical study | Nguyen & Hartmann | ✓ | `evidence-pack/akademia/nguyen-hartmann-2024.pdf` | `bibliotek/akademia/masteroppgaver/nguyen-hartmann-2024.md` | high |
| `drager-vagene-2017` | Markedskonsentrasjon i Skandinavia | Drager & Vagene | ✓ | `evidence-pack/akademia/drager-vagene-2017.pdf` | `bibliotek/akademia/masteroppgaver/drager-vagene-2017.md` | high |
| `martens-norum-2020` | Importvernets pavirkning pa konsentrasjonen i leverandorleddet | Martens & Norum | ✓ | `evidence-pack/akademia/martens-norum-2020.pdf` | `bibliotek/akademia/masteroppgaver/martens-norum-2020.md` | high |
| `barbakken-hausken-2006` | Det norske dagligvaremarkedet: relasjoner mellom detaljist og produsent | Barbakken & Hausken | ✓ | — | `bibliotek/akademia/masteroppgaver/barbakken-hausken-2006.md` | none |
| `fretheim-rodnova-2020` | Etableringshindringer i dagligvaremarkedet: Lokale reguleringer som etableringshindring | Fretheim & Rodnova | ✓ | `evidence-pack/akademia/fretheim-rodnova-2020.pdf` | `bibliotek/akademia/masteroppgaver/fretheim-rodnova-2020.md` | high |
| `selmani-forre-2023` | Hvorfor mislyktes Lidl med a etablere seg pa det norske markedet? | Selmani & Forre | ✓ | `evidence-pack/akademia/selmani-forre-2023.pdf` | `bibliotek/akademia/masteroppgaver/selmani-forre-2023.md` | high |
| `skulstad-svensson-2024` | ICAs fall i Norge | Skulstad & Svensson | ✓ | `evidence-pack/akademia/skulstad-svensson-2024.pdf` | `bibliotek/akademia/masteroppgaver/skulstad-svensson-2024.md` | high |
| `sandanger-2012` | Horisontal konkurranse i dagligvaremarkedet: Bruken av egne merkevarer | Sandanger | ✓ | `evidence-pack/akademia/sandanger-2012.pdf` | `bibliotek/akademia/masteroppgaver/sandanger-2012.md` | high |
| `skjervheim-flo-2016` | Paraplykjedenes overtakelse av distribusjonen i dagligvaremarkedet | Skjervheim Bernes & Flo | ✓ | `evidence-pack/akademia/skjervheim-flo-2016.pdf` | — | high |
| `gangstoe-2019` | Hemmelige kontrakter i dagligvaremarkedet | Gangstoe | ✓ | `evidence-pack/akademia/gangstoe-2019-uib.pdf` | `bibliotek/akademia/masteroppgaver/gangstoe-2019.md` | high |
| `kronqvist-2010` | Consumer-owned retail cooperative in duopoly with horizontally differentiated goods | Kronqvist | ✓ | — | `bibliotek/akademia/masteroppgaver/kronqvist-2010.md` | none |
| `meile-2020` | Uniform Pricing in Norwegian Grocery Retail | Meile | ✓ | `evidence-pack/akademia/meile-2020.pdf` | `bibliotek/akademia/masteroppgaver/meile-2020.md` | high |
| `huynh-mortensen-2025` | Analyse af Salling Group A/S og Coop Danmark A/S | Huynh & Mortensen | ✓ | `evidence-pack/akademia/huynh-mortensen-2025.pdf` | `bibliotek/akademia/masteroppgaver/huynh-mortensen-2025.md` | high |
| `nilsen-paulsen-2025` | Pass-through av ravarepriser for kakao- og kaffeprodukter | Nilsen & Paulsen | ✓ | `evidence-pack/akademia/nilsen-paulsen-2025.pdf` | `bibliotek/akademia/masteroppgaver/nilsen-paulsen-2025.md` | high |
| `halseth-phd-2024` | Competition and Grocery Retail Formats: Empirical Evidence from a Horizontal Acquisition in Norway | Halseth | ✓ | — | `bibliotek/akademia/masteroppgaver/halseth-phd-2024.md` | none |
| `ulsaker-phd-2016` | On Vertical Restraints: Essays in Industrial Organzation | Ulsaker | ✓ | `evidence-pack/akademia/ulsaker-phd-thesis.pdf` | — | high |
| `hebrok-phd-2020` | Food Waste: A practice-oriented design for sustainability approach | Hebrok | ✓ | `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Marie+Hebrok.pdf` | `bibliotek/akademia/masteroppgaver/hebrok-phd-2020.md` | high |
| `eriksson-phd-2015` | Supermarket food waste: Prevention and management | Eriksson | ✓ | — | `bibliotek/akademia/masteroppgaver/eriksson-phd-2015.md` | none |
| `albizzati-phd-2021` | Sustainability Assessment of Food Waste Management | Albizzati | ✓ | `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Paola_Federica_Albizzati_thesis.pdf` | `bibliotek/akademia/masteroppgaver/albizzati-phd-2021.md` | high |
| `brancoli-phd-2021` | Prevention and valorisation of surplus bread | Brancoli | ✓ | `evidence-pack/akademia/brancoli-phd-2021.pdf` | `bibliotek/akademia/masteroppgaver/brancoli-phd-2021.md` | high |
| `sundin-phd-2024` | Sustainability of food waste prevention through food consumption | Sundin | ✓ | `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/sundin-n-20240612.pdf` | `bibliotek/akademia/masteroppgaver/sundin-phd-2024.md` | high |
| `lehtokunnas-phd-2023` | Enacting a Circular Economy | Lehtokunnas | ✓ | `evidence-pack/akademia/lehtokunnas-phd-2023.pdf` | `bibliotek/akademia/masteroppgaver/lehtokunnas-phd-2023.md` | high |
| `sundqvist-phd-2025` | Navigating a Transformative Governance Maze | Sundqvist | ✓ | `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Sundqvist_Henna_Accessible_Summary_03_05_2025.pdf` | `bibliotek/akademia/masteroppgaver/sundqvist-phd-2025.md` | low |
| `sorensen-phd-2016` | Organic food conversion in Danish public kitchens | Sorensen | ✓ | `evidence-pack/akademia/sorensen-phd-2016-danish-public-kitchens.pdf` | `bibliotek/akademia/masteroppgaver/sorensen-phd-2016.md` | high |
| `esposito-2022` | Nar matsvinn blir et politikkomrade | Esposito | ✓ | — | `bibliotek/akademia/masteroppgaver/esposito-2022.md` | none |
| `deljanin-2015` | Market's imperfections — Building a concerned market for food waste | Deljanin | ✓ | — | `bibliotek/akademia/masteroppgaver/deljanin-2015.md` | none |
| `kayhan-ronnback-2019` | Dynamics in the Swedish Grocery Retail Industry | Kayhan & Ronnback | ✓ | `evidence-pack/akademia/kayhan-ronnback-2019.pdf` | `bibliotek/akademia/masteroppgaver/kayhan-ronnback-2019.md` | high |
| `burgherr-2019` | Food waste in Reykjavik — comparison 2015 vs 2018 | Burgherr | ✓ | — | `bibliotek/akademia/masteroppgaver/burgherr-2019.md` | none |
| `sigurdardottir-2017` | Predicting Household Food Waste Reduction | Sigurdardottir | ✓ | `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Lokaverkefni_ _Predicting Household Food Waste Reduction_ An expl` | `bibliotek/akademia/masteroppgaver/sigurdardottir-2017.md` | medium |
| `stein-2022` | Sustainable food procurement in public catering: UK vs DK/SE | Stein | ✓ | — | `bibliotek/akademia/masteroppgaver/stein-2022.md` | none |
| `steien-2016` | Matsikkerhet i Norge — er forsyningsberedskapen tilstrekkelig? | Steien | ✓ | — | `bibliotek/akademia/masteroppgaver/steien-2016.md` | none |
| `orlova-2019` | Kan et forbud mot prisdiskriminering fremme etablering av nettaktorer i dagligvaremarkedet? | Orlova | ✓ | `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Lina-Orlova_Masteroppgave2019.pdf` | `bibliotek/akademia/masteroppgaver/orlova-2019.md` | low |
| `morken-2015` | Effekter av innkjopssamarbeid i det norske dagligvaremarkedet | Morken | ✓ | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Effekter-av-innkjopssamarbeid-i-det-norske-dagligvaremarkedet-m` | `bibliotek/akademia/masteroppgaver/morken-2015.md` | medium |
| `simonsen-2017` | Digitaliseringen av norsk dagligvarehandel | Simonsen | ✓ | — | `bibliotek/akademia/masteroppgaver/simonsen-2017.md` | none |
| `granlund-lindskog-2024` | The Status of Operational Technology Cybersecurity within The Norwegian Food Supply Sector | Granlund & Lindskog | ✓ | — | `bibliotek/akademia/masteroppgaver/granlund-lindskog-2024.md` | none |
| `sandbraaten-2023` | Hvordan kan Norge vri matkonsumet gronnere? | Sandbraaten | ✓ | — | `bibliotek/akademia/masteroppgaver/sandbraaten-2023.md` | none |
| `tallaksen-2022` | Mot baerekraftige kostholdsendringer | Tallaksen | ✓ | — | `bibliotek/akademia/masteroppgaver/tallaksen-2022.md` | none |
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
| `minkeviciute-2019` | Assessment of Grocery eCommerce in Scandinavia | Minkeviciute | ✓ | `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/806685_Master_Thesis_Assessment_of_Grocery_eCommerce_in_Scandin` | `bibliotek/akademia/masteroppgaver/minkeviciute-2019.md` | medium |
| `nielsen-andersen-2016` | Danish Grocery Retail: Does Preference Structure Influence the Perception of Price and Quality? | Nielsen & Andersen | ✓ | — | `bibliotek/akademia/masteroppgaver/nielsen-andersen-2016.md` | none |
| `syroegina-2016` | Retailer\'s role in reducing food waste: Case study of Finnish retailers | Syroegina | ✓ | — | `bibliotek/akademia/masteroppgaver/syroegina-2016.md` | none |
| `mattila-2024` | Impacts of data-driven demand forecasting in reducing food waste and CO2 emissions in campus restaurants | Mattila | ✓ | `evidence-pack/akademia/mattila-2024.pdf` | — | high |
| `makela-2023` | Managing waste in food supply chains with supply chain collaboration and integration | Makela | ✓ | `evidence-pack/akademia/makela-2023.pdf` | `bibliotek/akademia/masteroppgaver/makela-2023.md` | high |
| `johannsson-2011` | Food Security in Iceland: Present Vulnerabilities, Possible Solutions | Johannsson | ✓ | `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/OrriJohannsson FoodSecurity Final.pdf` | `bibliotek/akademia/masteroppgaver/johannsson-2011.md` | low |
| `naess-2024` | To-rolle-plattformer og egne merkevarer: en analyse av konkurranse- og velferdseffekter | Naess | ✓ | — | `bibliotek/akademia/masteroppgaver/naess-2024.md` | none |
| `ortiz-cuadra-2023` | Learning for Crisis: Improving food security in Uppsala County through participative localized food production | Ortiz Cuadra | ✓ | `evidence-pack/akademia/ortiz-cuadra-2023.pdf` | `bibliotek/akademia/masteroppgaver/ortiz-cuadra-2023.md` | high |
| `stahl-2024` | Politics You Can Eat: Insights from the Implementation of Sodertalje Municipality\'s Food Supply Strategy | Stahl | ✓ | `evidence-pack/akademia/stahl-2024.pdf` | `bibliotek/akademia/masteroppgaver/stahl-2024.md` | high |
| `sedwall-2025` | Hybrid Supply Chain Models in Swedish Grocery Retail | Sedwall et al. | ✓ | `evidence-pack/akademia/sedwall-2025.pdf` | — | high |
| `zakeri-lei-2024` | AI in the Swedish Food System: Exploring Adoption, Challenges, and Opportunities in Primary Production | Zakeri & Lei | ✓ | `evidence-pack/akademia/zakeri-lei-2024.pdf` | `bibliotek/akademia/masteroppgaver/zakeri-lei-2024.md` | high |
| `duong-2025` | Common Grocery Self-Service Checkout Failures That Customers Can Resolve Without Employee Assistance | Duong | ✓ | `evidence-pack/akademia/duong-2025.pdf` | `bibliotek/akademia/masteroppgaver/duong-2025.md` | high |
| `rislakki-2024` | Promoting the Planetary Health Diet in Grocery Retail: Comparison of Retail Chains in Finland | Rislakki | ✓ | `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Dynamics-in-the-Swedish-Grocery-Retail-Industry.pdf` | `bibliotek/akademia/masteroppgaver/rislakki-2024.md` | low |
| `hagan-2025` | The Impact of Food Loss and Waste Reduction Practices on Consumer Grocery Store Choice | Hagan | ✓ | — | `bibliotek/akademia/masteroppgaver/hagan-2025.md` | none |
| `segersven-2024` | Development of risk management and resilience of supply chains in Finnish food industry companies post-COVID-19 | Segersven | ✓ | — | — | none |
| `lund-beijer-2026` | Impact of food retail market power on small food producers in Sweden: Challenges and opportunities | Lund University / Beijer Institute | ✓ | — | — | none |
| `rey-verge-2005` | The Economics of Vertical Restraints | Patrick Rey (University of Toulouse, IDEI/GREMAQ) & Thibaud Vergé (University of Southampton) | ✓ | `evidence-pack/akademia/rey-verge-2005.pdf` | — | high |
| `desilva-2023` | Circular value creation in the Swedish seafood processing industry | De Silva | ✓ | — | — | none |
| `slu-house-crickets-2025` | Integrating house crickets in circular food systems | SLU doctoral candidate | ✓ | — | — | none |
| `bojo-2023` | Circular food systems: a content and discourse analysis | Bojö | ✓ | — | — | none |
| `mirza-2016` | Circular economy in the food and retail industry: a case study of ICA | Mirza | ✓ | — | — | none |
| `van-straten-2025` | Circular business models in Finnish food companies | Van Straten | ✓ | — | — | none |
| `bueso-bordils-2021` | Circular economy mapping on Bornholm island | Bueso Bordils | ✓ | — | — | none |
| `nmbu-circular-vegetables-2022` | Barriers and drivers to a circular economy for vegetables in the Norwegian food sector | NMBU master candidate | ✓ | — | — | none |

## 2. Reports → lokal fil (108)

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
| `se-konkurrensverket-2024-5` | Konkurrensverket Rapport 2024:5 | Konkurrensverket | ✓ | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Konkurrensverket - rapport 2024 5 summary (2024).pdf` | — | low |
| `dt-samarbeidsklima-2025` | Samarbeidsklima-undersokelsen 2025 | Dagligvaretilsynet | ✓ | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Rapport+om+samarbeidsklimaet+lokalmat-+og+drikke+produsenter+i+` | — | low |
| `menon-funksjonelt-skille-2026` | Funksjonelt og regnskapsmessig skille | Menon Economics | ✓ | `evidence-pack/offentlig/menon-funksjonelt-skille-2026.pdf` | `bibliotek/offentlig/menon-funksjonelt-skille-2026.md` | high |
| `coop-2024` | Coop Aarsresultat 2024 | Coop Norge SA | ✓ | `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Coop_Norge_SA_årsrapport_2024_HR_1.pdf` | `bibliotek/bransje/arsrapporter/coop-2024.md` | low |
| `nordisk-sammenligning-2024` | Nordisk sammenligning 2024 | Diverse (ICA, Axfood, Kesko) | — | — | `bibliotek/bransje/arsrapporter/nordisk-sammenligning-2024.md` | none |
| `norgesgruppen-2024-25` | NorgesGruppen Aarsrapport 2024 | NorgesGruppen ASA | ✓ | `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/V2024-4-Offentlig-versjon-Coop-Norge-SA-Norgesgruppen-ASA-Rema-` | `bibliotek/bransje/arsrapporter/norgesgruppen-2024-25.md` | low |
| `reitan-2024-25` | Reitan Retail / REMA 1000 (2024/2025) | Reitan Retail AS | ✓ | `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/V2024-4-Offentlig-versjon-Coop-Norge-SA-Norgesgruppen-ASA-Rema-` | `bibliotek/bransje/arsrapporter/reitan-2024-25.md` | medium |
| `verdibutikker-utfordrere` | Verdibutikkene — Normal og Europris |  | — | — | `bibliotek/bransje/arsrapporter/verdibutikker-utfordrere.md` | none |
| `asko-infrastruktur-2025` | ASKO — Infrastruktur og Logistikkmakt | ASKO / NorgesGruppen | ✓ | — | `bibliotek/bransje/logistikk/asko-infrastruktur-2025.md` | none |
| `dagligvarerapporten-2025` | Dagligvarerapporten 2025 | Virke Handel | ✓ | — | `bibliotek/bransje/organisasjoner/dagligvarerapporten-2025.md` | none |
| `dlf-leverandor-2025` | DLF leverandorposisjoner 2025 | DLF | ✓ | — | `bibliotek/bransje/organisasjoner/dlf-leverandør-2025.md` | none |
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
| `beredskap-island-melmolle-2025` | Islands melmolle og matsuverenitet | Kornax / Iceland Review / RUV | ✓ | — | `evidence-pack/beredskap/beredskap-island-melmolle-2025.md` | none |
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
| `oversikt-bransje-statistikk-beredskap` | Bransjestatistikk og beredskapstall | Diverse kilder (Nielsen, SSB, dagligvaretilsynet) | ✓ | — | — | none |
| `oversikt-nordisk-mat-tenkere` | Nordiske mat-tenkere og paavirkernettverk | Egenkartlegging | — | — | — | none |
| `oversikt-nordisk-matmakt-historikk` | Nordisk matmaktkonsentrasjon — historikk | Egenkartlegging / diverse kilder | — | — | — | none |
| `oversikt-nou-stortingsdok-juridisk` | NOU-er og stortingsdokumenter — juridisk oversikt | Stortinget / regjeringen | — | — | — | none |
| `oversikt-offentlig-rapportlogg` | Offentlig rapportlogg — matsektor | Diverse offentlige instanser | — | — | — | none |
| `oversikt-sirkularitet-dyp` | Sirkularitet i nordisk mat — dypanalyse | Egenkartlegging / nordiske kilder | — | — | — | none |
| `oversikt-tenketanker-ngo` | Tenketanker og NGO-er i nordisk matdebatt | Egenkartlegging | — | — | — | none |
| `oversikt-akademia-dyp-research` | Akademisk forskning paa nordisk dagligvare — oversikt | Egenkartlegging | ✓ | — | — | none |
| `oversikt-nordisk-avhandlingsregister` | Nordisk avhandlingsregister — matpolitikk | Egenkartlegging | — | — | — | none |
| `asko-barekraft-2024` | Bærekraft i ASKO 2024 | ASKO Norge AS | ✓ | `evidence-pack/arsrapporter/asko-barekraft-2024.pdf` | — | high |
| `axfood-annual-report-2024` | Axfood Annual and Sustainability Report 2024 | Axfood AB | ✓ | `evidence-pack/arsrapporter/axfood-annual-report-2024.pdf` | — | high |
| `coop-norge-2024` | Coop Norge ÅRS- og bærekraftsrapport 2024 | Coop Norge SA | ✓ | `evidence-pack/arsrapporter/coop-norge-2024.pdf` | — | high |
| `hagar-2024-25` | Hagar plc — Management Report 2024/25 and Q4 Results | Hagar hf. | ✓ | `evidence-pack/arsrapporter/hagar-2024-25.pdf` | `bibliotek/bransje/arsrapporter/hagar-2024-25.md` | high |
| `ica-gruppen-annual-report-2024` | ICA Gruppen Annual Report 2024 | ICA Gruppen AB | ✓ | `evidence-pack/arsrapporter/ica-gruppen-annual-report-2024.pdf` | — | high |
| `kesko-annual-report-2024` | Kesko Annual Report 2024 | Kesko Oyj | ✓ | `evidence-pack/arsrapporter/kesko-annual-report-2024.pdf` | — | high |
| `salling-group-2024` | Salling Group Annual Report 2024 — Every Day Better | Salling Group A/S | ✓ | `evidence-pack/arsrapporter/salling-group-2024.pdf` | `bibliotek/bransje/arsrapporter/salling-group-2024.md` | high |
| `is-samkeppni-annual-report-2024` | Samkeppniseftirlitið Ársskýrsla 2024 | Samkeppniseftirlitið | ✓ | `evidence-pack/nordisk/is-samkeppni-annual-report-2024.pdf` | — | high |
| `dk-salling-coop-decision-2025` | Salling Group A/S erhvervelse af dele af Coop Danmark A/S (Konkurrencerådsafgørelse 26. marts 2025) | Konkurrence- og Forbrugerstyrelsen | ✓ | `evidence-pack/nordisk/dk-salling-coop-decision-2025.pdf` | — | high |
| `salling-coop-danmark-2025` | Analyse af Salling Group A/S og Coop Danmark A/S — Erhvervsøkonomisk metode | Aalborg Universitet (HD 1. del, Gruppe 16) | ✓ | `evidence-pack/nordisk/salling-coop-danmark-2025.pdf` | — | high |
| `konkurrensverket-summary-2024` | Summary of the Swedish Competition Authority\'s inquiry into the food industry 2023–2024 | Konkurrensverket | ✓ | `evidence-pack/nordisk/konkurrensverket-summary-2024.pdf` | — | high |
| `finland-food-market-ombudsman-2023` | Elintarvikemarkkinavaltuutetun toimintakertomus 2023 | Elintarvikemarkkinavaltuutettu (Food Market Ombudsman) | ✓ | `evidence-pack/nordisk/finland-food-market-ombudsman-2023.pdf` | — | high |
| `finland-food2030` | Food2030 — Government Report on Food Policy: Finland feeds us and the world | Finnish Ministry of Agriculture and Forestry | ✓ | `evidence-pack/nordisk/finland-food2030.pdf` | — | high |
| `karlstad-declaration-2024` | UNESCO Biosphere Reserves — A Path to Local Holistic Sustainability (Nord 2024:023) | Nordic Council of Ministers — Working Group for Biological Diversity | ✓ | `evidence-pack/nordisk/karlstad-declaration-2024.pdf` | — | high |
| `nordic-food-alert-2025` | Beyond Zero — Nordic Architecture on the Road Towards Renewed Practices (Nord 2025:010) | Nordic Council of Ministers — Ministry of the Environment Finland | ✓ | `evidence-pack/nordisk/nordic-food-alert-2025.pdf` | — | high |
| `dagligvaretilsynet-aarsrapport-2021` | Dagligvaretilsynet — Årsrapport 2021 | Dagligvaretilsynet | ✓ | `evidence-pack/offentlig/dagligvaretilsynet-aarsrapport-2021.pdf` | — | high |
| `dagligvaretilsynet-aarsrapport-2022` | Dagligvaretilsynet — Årsrapport 2022 | Dagligvaretilsynet | ✓ | `evidence-pack/offentlig/dagligvaretilsynet-aarsrapport-2022.pdf` | — | high |
| `dagligvaretilsynet-aarsrapport-2023` | Dagligvaretilsynet — Årsrapport 2023 | Dagligvaretilsynet | ✓ | `evidence-pack/offentlig/dagligvaretilsynet-aarsrapport-2023.pdf` | — | high |
| `dagligvaretilsynet-aarsrapport-2024` | Dagligvaretilsynet — Årsrapport 2024 | Dagligvaretilsynet | ✓ | `evidence-pack/offentlig/dagligvaretilsynet-aarsrapport-2024.pdf` | — | high |
| `emv-kartlegging-2023` | Kartlegging av egne merkevarer og vertikal integrasjon i dagligvaremarkedet | Samfunnsøkonomisk analyse AS (oppdrag fra NFD) | ✓ | `evidence-pack/offentlig/emv-kartlegging-2023.pdf` | — | high |
| `eu-utp-report-2024` | Implementing the prohibition of unfair trading practices to strengthen the position of farmers and operators in the agricultural and food su | European Commission | ✓ | `evidence-pack/offentlig/eu-utp-report-2024.pdf` | — | high |
| `eu-utp-staff-working-doc-2024` | Unfair Trading Practices (UTP) — Overview tables on Member States\' transposition choices and enforcement activities (SWD(2024) 106 final) | European Commission | ✓ | `evidence-pack/offentlig/eu-utp-staff-working-doc-2024.pdf` | — | high |
| `nou-2013-6-god-handelsskikk` | NOU 2013:6 God handelsskikk i dagligvarekjeden | Regjeringen (Handelslovutvalget) | ✓ | `evidence-pack/offentlig/nou-2013-6-god-handelsskikk.pdf` | `bibliotek/nou/nou-2013-6-god-handelsskikk.md` | high |
| `agrianalyse-bondens-andel-2025` | Bondens andel av forbrukerkronen 2025 | AgriAnalyse | — | `evidence-pack/akademia/agrianalyse-bondens-andel-2025.pdf` | — | high |
| `pubmed-van-der-fels-klerx-2024` | Framework for evaluation of food safety in circular food systems | Wageningen University / RIVM | ✓ | — | — | none |
| `pubmed-van-leeuwen-2024` | A novel approach to identify knowledge gaps on food safety in circular food systems | Wageningen University / RIVM | ✓ | — | — | none |
| `pubmed-zamanzadeh-2017` | Biogas production from food waste via co-digestion and digestion | NMBU / NIBIO | ✓ | `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Response of food waste anaerobic digestion to the dimensions of m` | — | medium |
| `pubmed-hiis-2024` | Unlocking bacterial potential to reduce farmland N2O emissions | NMBU | ✓ | — | — | none |
| `pubmed-recanati-2019` | Assessing the role of CAP for more sustainable and healthier food systems in Europe | BCFN Foundation / Universita degli Studi di Milano | ✓ | — | — | none |
| `pubmed-szulecka-2024` | Food waste governance architectures in four European countries | Wageningen / div. europeiske univ. | ✓ | — | — | none |
| `pubmed-javourez-2021` | Waste-to-nutrition: a review of current and emerging conversion pathways | University College Dublin | ✓ | — | — | none |
| `pubmed-sigala-2025` | Reducing food waste in the HORECA sector using AI-based waste tracking technology | SINTEF / NTNU | ✓ | `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Policy commitment_ Reducing food waste for a green Nordic Region ` | — | low |
| `pubmed-wohner-2020` | Environmental and economic assessment of food-packaging systems with a focus on food waste | FH Campus Wien / Universitat fur Bodenkultur | ✓ | — | — | none |
| `matsvinnutvalget-2024` | Matsvinnutvalgets anbefalinger | Matsvinnutvalget | ✓ | `evidence-pack/offentlig/matsvinnutvalget-2024.pdf` | — | high |
| `van-zanten-circularity-2023` | Circularity in Europe strengthens the sustainability of the global food system | Wageningen University | ✓ | — | — | none |
| `pty-finnish-grocery-trade-2024` | Finnish Grocery Trade Statistics 2024 | PTY (Finnish Grocery Trade Association) | ✓ | `evidence-pack/nordisk/pty-finnish-grocery-trade-statistics-2024.pdf` | — | medium |
| `coop-danmark-2024` | Coop Danmark arsrapport 2024 | Coop Danmark A/S | ✓ | `evidence-pack/arsrapporter/coop-danmark-2024.pdf` | `bibliotek/bransje/arsrapporter/coop-danmark-2024.md` | high |
| `norgesgruppen-halvarsrapport-h1-2025` | NorgesGruppen halvarsrapport H1 2025 | NorgesGruppen ASA | ✓ | `evidence-pack/arsrapporter/norgesgruppen-halvarsrapport-2025.pdf` | — | medium |
| `kfst-foedevarehandelslov-evaluering-2024` | KFST Evaluering af foedevarehandelsloven 2024 | Konkurrence- og Forbrugerstyrelsen | ✓ | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/KFST - 20241120 evaluering af foedevarehandelsloven 2024 (2024)` | — | medium |
| `konkurrensverket-2025-5-livsmedelsutredning` | Konkurrensverket rapport 2025:5 — livsmedelsutredningen | Konkurrensverket | ✓ | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Konkurrensverket - rapport 2025 5 (2024).pdf` | — | low |
| `etmv-toimintakertomus-2024` | Elintarvikemarkkinavaltuutettu toimintakertomus 2024 | Elintarvikemarkkinavaltuutettu / Finnish Food Market Ombudsman | ✓ | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Ruokavirasto - etmv toimintakertomus 2024 (2024).pdf` | — | high |
| `dt-samarbeidsklima-2023` | Samarbeidsklimaet i Dagligvarebransjen 2023 | Dagligvaretilsynet | ✓ | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Dagligvaretilsynet - Rapport om Samarbeidsklimaet i Dagligvareb` | — | medium |
| `plantefonden-projects-2023-2025` | Plantefonden — projekter og bevillinger 2023-2025 | Plantefonden / Foedevare-, Landbrugs- og Fiskeristyrelsen | ✓ | — | — | none |
| `kbh-food-strategy-madhus` | Koebenhavns Madhus — maaltidstrategi og status | Koebenhavns Madhus / Koebenhavns Kommune | ✓ | — | — | none |
| `motiva-food-procurement-2026` | Guide for Responsible Procurement of Food (Motiva, januar 2026) | Motiva Oy | ✓ | — | — | none |
| `arla-farmahead-check-2024` | Arla FarmAhead Check — Sustainability Incentive Model 2024 | Arla Foods amba | ✓ | — | — | none |
| `sodertaelje-diet-green-planet` | Soedertaelje — Diet for a Green Planet | Soedertaelje Kommun / DIVA Portal | ✓ | — | `evidence-pack/akademia/sodertaelje-diet-green-planet-2023.md` | none |

## 3. SourceDocs → lokal fil (164)

| ID | Tittel | Filnavn | URL | Lokal PDF | Lokal MD | Conf |
|---|---|---|---|---|---|---|
| `src-1` | Den store NI-soknaden (avslatt). Full prosjektbeskrivelse, partnere, budsjett, handlingsplan | Just now (12.Revise-Gab) Nordic Circular Food systems - V.2.md | — | — | — | none |
| `src-2` | Oslo Innovasjonsprogram-soknad med bakgrunn fra Cecilie, ideer, mal | 1. Food system_ Oslo Innovasjons program 2025.md | — | — | — | none |
| `src-3` | Mote 9. mars med aksjonspunkter fra Einar/Martin | 9, mars 2026 FOOD.md | — | — | — | none |
| `src-4` | Lengre samtale om strategi, data, verdikjeder, transition groups og nordisk merverdi | Speaker 1.md | — | — | — | none |
| `src-5` | Samtale om a finne dokumenter, bakgrunnsmateriale og starte arbeidet | Speaker 1 (1).md | — | — | — | none |
| `src-6` | Samme som 9. mars-notater med ekstra kontekst | Untitled document.md | — | — | — | none |
| `src-7` | Cathrines 20-siders drofting: TG-metodikk, governance, branding, tjenester | 2026 1401 DROFTING TRANSITION GROUPS.pdf | — | `evidence-pack/offentlig/src-73.pdf` | — | low |
| `src-8` | Revidert 10-step start, vurderingskriterier, felles prosesser | 2026 TRANSITION GROUP OVERVIEW WORKING DOC.pdf | — | — | — | none |
| `src-9` | Martin videresender NCH 2025-soknaden (Michel Bajuk justert) | Natural State Mail - NCH application 2025.pdf | — | — | — | none |
| `src-10` | Cathrine deler droftingsdokumentet med Gabriel | Natural State Mail - DROFTING TG.pdf | — | — | — | none |
| `src-11` | Kopi av Oslo-soknaden | 1. Food system_ Oslo Innovasjons program 2025 (1).md | — | — | — | none |
| `src-12` | Dokumenterte massiv maktforskyvning fra produsent til kjedenes paraplyorganisasjoner. | nou-2011-4-sammendrag.md | ✓ | `evidence-pack/offentlig/nou-2011-4-mat-makt-avmakt.pdf` | — | low |
| `src-13` | Foreslår nye hovedmål for inntektsmåling og analyserer primærprodusentens kår. | nou-2022-14-sammendrag.md | ✓ | — | — | none |
| `src-14` | Nyeste status på markedsandeler, marginer og etableringshindringer. | dagligvarerapport-2024.md | ✓ | `evidence-pack/tilsyn/dagligvarerapport-2024.pdf` | `bibliotek/konkurransetilsynet/dagligvarerapport-2024.md` | high |
| `src-15` | Dokumenterer det operative forholdet mellom kjeder og leverandører. | samarbeidsklima-2025.md | ✓ | `evidence-pack/tilsyn/dagligvaretilsynet-samarbeidsklima-2025.pdf` | — | high |
| `src-16` | Kritisk analyse av systemets sårbarhet og manglende kriseplanlegging. | beredskap-2023.md | ✓ | — | — | none |
| `src-17` | Finansielle resultater og strategisk retning for markedslederen. | norgesgruppen-2024-25.md | ✓ | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Konkurrensverket - rapport 2025 5 (2024).pdf` | — | low |
| `src-18` | Samvirkemodellens resultater og vekst for Extra. | coop-2024.md | ✓ | — | — | none |
| `src-19` | Analyserer produktivitet og marginer i skandinavisk kontekst. | jacobsen-jansson-2022.md | ✓ | `evidence-pack/akademia/jacobsen-jansson-2022-black-sheep.pdf` | — | high |
| `src-20` | Forklarer prissettingens dynamikk og medias rolle som regulator. | foros-media-2025.md | ✓ | `evidence-pack/akademia/akademia-nhh-foros-media-2025.pdf` | — | high |
| `src-21` | Analyse av digital makt og personlig prising i kundeprogrammer. | sifo-kundeprogram-2026.md | ✓ | `evidence-pack/akademia/sifo-kundeprogram-2026.pdf` | `bibliotek/akademia/sifo/sifo-kundeprogram-2026.md` | high |
| `src-22` | Dokumenterer etableringshindringer gjennom strategisk bruk av eiendom. | nguyen-hartmann-2024.md | ✓ | `evidence-pack/akademia/nguyen-hartmann-2024.pdf` | `bibliotek/akademia/masteroppgaver/nguyen-hartmann-2024.md` | high |
| `src-23` | Systemisk blikk på sårbarhet og transformasjonsbehov i Norden. | stockholm-resilience-2019.md | ✓ | `evidence-pack/tenketank/stockholm-resilience-2019.pdf` | `bibliotek/tenketanker/stockholm-resilience-2019.md` | high |
| `src-24` | Regulering av markedsmakt med automatisk dominans-presumsjon over 30%. | kkv-4a-dominans.md | ✓ | — | — | none |
| `src-25` | Analyse av inflasjon og markedsmakt i det svenske matmarkedet. | konkurrensverket-2024-5.md | ✓ | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Dagligvaretilsynet - Rapport om Samarbeidsklimaet i Dagligvareb` | — | low |
| `src-26` | Definerer nasjonalt mål om 50% selvforsyning innen 2030. | meld-st-11-selvforsyning.md | ✓ | `evidence-pack/offentlig/meld-st-11-selvforsyning-2024.pdf` | — | medium |
| `src-27` | Status for regjeringens 10-punktsplan for dagligvarebransjen. | meld-st-4-dagligvare.md | ✓ | — | — | none |
| `src-28` | Dybdeanalyse av maktforskyvning gjennom eierskap i produksjonsleddet. | soa-emv-2023.md | ✓ | — | — | none |
| `src-29` | Offisielle markedstall for norsk dagligvarebransje. | dagligvarerapporten-2025.md | ✓ | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Konkurrensverket - rapport 2025 5 (2024).pdf` | — | low |
| `src-30` | Dokumenterer infrastruktur og logistikkens rolle i verdikjeden. | asko-infrastruktur-2025.md | ✓ | — | — | none |
| `src-31` | Metodisk grunnlag for å vurdere matsikkerhet i energi og volum. | nibio-selvforsyning-metode.md | ✓ | — | — | none |
| `src-32` | Kvantifiserer ressurstap i hele verdikjeden. | matsvinn-2024.md | ✓ | — | — | none |
| `src-33` | Dokumenterer Norges prisposisjon sammenlignet med EU. | price-levels-2024.md | ✓ | — | — | none |
| `src-34` | Politiske ytterpunkter i debatten om importvern og markedsmakt. | civita-manifest-debatt.md | — | — | — | none |
| `src-35` | Sosial bærekraft og etisk handel i matsystemet. | fivh-etikk-2025.md | ✓ | — | — | none |
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
| `src-53` | Historisk analyse av matbørsenes effekt på prisstrategier. | matbors-historie.md | — | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Dagligvaretilsynet-tildelingsbrev-2025.pdf` | — | low |
| `src-54` | Finansielle resultater for REMA 1000 og Reitan Retail. | reitan-2024-25.md | ✓ | `arkiv-sortert/Food Research Process 20.04.26/06_Company_And_Annual_Reports/Reitan Retail 2025_Oppslag.pdf` | — | medium |
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
| `src-73` | Nature Food-artikkel som modellerer europeisk sirkularitet og viser at CFS reduserer globalt arealbruk 71% og GHG 29%. | van-zanten-nature-food-2023.md | ✓ | `evidence-pack/offentlig/src-73.pdf` | — | high |
| `src-74` | Oppdatert planetaert referansekoshold med sterkere vekt paa regenerativt landbruk og sirkulaer biomasse. | eat-lancet-2025.md | ✓ | — | — | none |
| `src-75` | EUs groenne innkjoepskriterier for mat: oekologisk, lavutslipp, redusert matsvinn i offentlige kontrakter. | jrc-spp-2025.md | — | `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Food-for-Thought-Green-Public-Procurement-and-Organic-Food.pdf` | — | low |
| `src-76` | Identifiserer 12 nordiske intervensjonspunkter for matsystemtransformasjon inkl. 4 pilarer. | nkj-white-paper-2024.md | — | — | — | none |
| `src-77` | Kartlegger lokal markedskonsentrasjon i Norge paa postnummernivaet. Median HHI=1.0 (monopol). | halseth-nhh-2023.md | — | — | — | none |
| `src-78` | Svensk analyse av lokal konkurranse: 102 av 290 kommuner mangler discounter. | konkurrensverket-2024-4.md | ✓ | `evidence-pack/nordisk/konkurrensverket-2024-4-dagligvaruhandelns-etablering.pdf` | — | medium |
| `src-79` | Dansk fusjonsanalyse med drive-time HHI-metodikk for dagligvare. | kfst-fusjon-2024.md | — | `evidence-pack/nordisk/kfst-salling-coop-2025-full.pdf` | — | medium |
| `src-80` | 7-domene komposittindeks for food access i UK. Kombinerer GIS, kvalitet og oekonomi. | cdrc-priority-places.md | ✓ | — | — | none |
| `src-81` | Finsk husholdningsundersoekelse: median 700m til naermeste dagligvarebutikk. | statistics-finland-hbs-2012.md | — | — | — | none |
| `src-82` | Arlig markedsandelskartlegging for svensk dagligvare. | ecr-dagligvarukartan-2024.md | — | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Konkurrensverket - rapport 2025 5 (2024).pdf` | — | low |
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
| `src-127` | Metodologisk notat som etablerer STROBE+GRADE-rammeverk for evidensregister, kildeinventar og klaimgradering i FS2026-arbeidet. Definerer 8  | evidensnotat-2026-04-20.md | — | — | — | none |
| `src-128` | Dybdeanalyse av hvordan eiendom (servitutter, eksklusive leieavtaler, internleie, sale-leaseback) fungerer som strukturell konkurransebarrie | eiendomsmakt-dagligvaremarkedet-norden-2026-04-20.md | — | — | — | none |
| `src-129` | Analyse av hvorfor Lov om god handelsskikk leverer under potensial: narrow lovdesign, dialogbasert handheving, strukturell avhengighet, fryk | makt-fryktkultur-enforcement-2026-04-20.md | — | — | — | none |
| `src-130` | Diskursanalyse 2020-2026: to narrative poler (beredskap og kjoepekraft), manglende temaer (distribusjon i krise, importavhengighet, sirkular | framstillinger-mat-makt-beredskap-2026-04-20.md | — | — | — | none |
| `src-131` | REKO, D2C, subscription, kooperativer og digitale nisjer paa tvers av NO/SE/DK/FI. Penetrasjonsindeks, revenue-tall for Cheffelo (SEK 1,188  | alternative-distribusjonskanaler-norden-2026-04-20.md | — | — | — | none |
| `src-132` | 5,5 millioner offentlige maaltider daglig i Norden, med detaljert kartlegging av Sverige (3m/dag), Finland (850k elever), Danmark (Koebenhav | nordisk-horeca-offentlige-maaltider-2026-04-20.md | — | — | — | none |
| `src-133` | 7-dimensjonal etableringsbarrieremodell fra nordiske failures: Lidl NO (2008), ICA NO (2014), Mat.se/Mathem/Oda-rekonstruksjon (2024), Coop. | nordiske-dagligvarecase-mislyktes-2026-04-20.md | — | — | — | none |
| `src-134` | 10 shortlistede benchmarks: Soer-Korea PAYT, Frankrike Garot-lov, TGTG, REKO, Plantefonden, Singapore novel foods, PeelPioneers, Agrain, Koe | nordiske-internasjonale-benchmarkcase-2026-04-20.md | — | — | — | none |
| `src-135` | Norsk sirkulaer-matinnovasjon: Greve Biogass (Den Magiske Fabrikken), Alginor ASA, Pelagia (Hordafor NOK 477m 2021), Biomega, Hofseth Biocar | norges-matrevolusjon-sirkular-innovasjon-2026-04-20.md | — | `arkiv-sortert/Food Research Process 20.04.26/00_Working_Files/Research-Report-Norges-matrevolusjon-2026.pdf` | — | low |
| `src-136` | Samlet PDF-bakgrunnsdokument som inneholder hovedresultater fra forskningsrunden 20. april 2026. | research-report-2026-04-20.pdf | — | `arkiv-sortert/Food Research Process 20.04.26/00_Working_Files/Research-Report-Norges-matrevolusjon-2026.pdf` | — | medium |
| `src-137` | Primaerkilde for internleie NOK 120m (Johannson) + NOK 48m (Bjercke) 2024. Dokumenterer eiendomsgren-struktur. | norgesgruppen-registreringsdokument-2025.pdf | ✓ | `evidence-pack/arsrapporter/norgesgruppen-halvarsrapport-2025.pdf` | — | low |
| `src-138` | Dokumenterer ~2,077 millioner kvm bygningsmasse, NOK 2 mrd omsetning, og REBUS-overfoeringen desember 2023. | reitan-eiendom-2024.pdf | ✓ | `evidence-pack/arsrapporter/reitan-retail-2024.pdf` | — | low |
| `src-139` | Lovforslaget som eksplisitt ikke regulerer buyer power, hylleavgifter eller forhandlingsmakt direkte. | prop-33-l-2019-2020.pdf | ✓ | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Regjeringen - stm201920200033000engpdfs (2024).pdf` | — | low |
| `src-140` | Lovforslaget som flytter handheving til Konkurransetilsynet fra 30. april 2026 og styrker skriftlighetskrav. | prop-4-l-2025-2026.pdf | ✓ | `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/prp202520260004000dddpdfs.pdf` | — | low |
| `src-141` | Svensk evaluering av livsmedelmarkedet med 4 sanksjonsavgifter per 31. oktober 2025. | konkurrensverket-2025-5-livsmedel.pdf | ✓ | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Konkurrensverket - rapport 2025 5 (2024).pdf` | — | low |
| `src-142` | 1 klage siden foedevarehandelsloven traadte i kraft, senere trukket. 0 vedtak. | kfst-evaluering-foedevarehandelsloven-2024.pdf | ✓ | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/KFST - 20241120 evaluering af foedevarehandelsloven 2024 (2024)` | — | medium |
| `src-143` | 40% av frukt/baer-respondenter peker paa ensidige kontraktsendringer som stoerste problem. Drikkevare: betalingstid. | etmv-toimintakertomus-2024.pdf | ✓ | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Ruokavirasto - etmv toimintakertomus 2024 (2024).pdf` | — | high |
| `src-144` | Handlingsplan for sirkulaer oekonomi med kobling til matsvinn og verdikjeder. | meld-st-25-2024-2025-sirkular.pdf | ✓ | `evidence-pack/offentlig/meld-st-4-2024-2025-dagligvare.pdf` | — | medium |
| `src-145` | Lansering av ny tiltakspakke for bedre konkurranse i dagligvaremarkedet. | press-id3101561-2025.pdf | ✓ | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Dagligvaretilsynet-tildelingsbrev-2025.pdf` | — | low |
| `src-146` | Signering av nasjonale avtaler om beredskapslager for matkorn. | press-id3046671-2024.pdf | ✓ | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Regjeringen - arsrapport dagligvaretilsynet 2024 (2024).pdf` | — | low |
| `src-147` | Norsk lokalmat 2025: NOK 13,55 mrd totalt, NOK 938m direkte salg, Bondens Marked NOK 76,4m. | lokalmatrapport-2025.pdf | ✓ | — | — | none |
| `src-148` | Omsetning SEK 1,188 mrd 2025, ~17 millioner maaltider. 2024-fordeling: NO 505,5 MSEK / SE 403,1 MSEK / DK 149,6 MSEK. | cheffelo-q4-2025.pdf | ✓ | `arkiv-sortert/Food Research Process 20.04.26/06_Company_And_Annual_Reports/Cheffelo_Arsredovisning_Hallbarhetsrapport_2025_SE.pdf` | — | low |
| `src-149` | Koebenhavns matstrategi — grunnlag for Madhus-modellen (87,8% oekologisk, 70k maaltider/dag). | kbh-food-strategy-2019.pdf | ✓ | — | — | none |
| `src-150` | Finsk nasjonal veileder for ansvarlig matinnkjoep i offentlig sektor. | motiva-responsible-food-procurement-2026.pdf | ✓ | — | — | none |
| `src-151` | DKK 675m ramme, DKK 394m committed, 116 prosjekter 2023-2025. | plantefonden-projects-2025.pdf | ✓ | — | — | none |
| `src-152` | 8000 gaarder, 7 land, 99% melkedekning. EUR 337m utbetalt 2024. -9,9% CO2/kg melk fra 2020-basislinjen. | arla-farmahead-2024.pdf | ✓ | — | — | none |
| `src-153` | CSV-inventar over alle 89 underliggende kilder sitert i forskningsrunden 20. april 2026, med nedlastingsstatus og lokal sti. | forskningsrunde-2026-04-20-backlog.csv | — | — | — | none |
| `src-154` | Campusforsok ved Turku som reduserte plateavfall med 30 % gjennom kampanjer og kompostering av kjokkenavfall (7,5 m³/aar) til jordbruk. | mdpi-2071-1050-13-11-6231-turku-circular-food.pdf | ✓ | — | — | none |
| `src-155` | Rammeverk for nested sirkularitet analysert paa tre finske landbruksregioner: husdyr dominerer naeringsflyt; internasjonal forhandel skaper  | nested-circularity-finland-2023.pdf | ✓ | — | — | none |
| `src-156` | System-dynamikk-modell for den norske hvitfiskverdikjeden med scenarier for teknologi, forbrukeratferd og regulering. | jcleprod-norwegian-seafood-sd-2025.pdf | ✓ | — | — | none |
| `src-157` | Fosforutslipp fra norsk akvakultur doblet 2005-2021; utnyttelsesgrad bare 19 %. Fytase, IMTA og slaminnsamling kan redusere utslipp, men lok | frontiers-phosphorus-aquaculture-norway-2023.pdf | ✓ | — | — | none |
| `src-158` | Rapport som viser at 56 % av husholdningers og 79 % av retail/horeca sitt matsvinn i Danmark er unngaaelig. Mulig besparelse €150-250m aarli | ellen-macarthur-denmark-circular-2015.pdf | ✓ | — | — | none |
| `src-159` | LCA-basert kvantifisering av 716 000 tonn unngaaelig matsvinn i Danmark: husholdning 36 %, grossist/retail 23 %, prosess 19 %, primaer 14 %. | mst-denmark-food-waste-978-87-93529-80-9-2017.pdf | ✓ | — | — | none |
| `src-160` | Produktivitet og distribusjon har forbedret seg i svensk matverdikjede, men markedskonsentrasjon, ujevn forhandlingsstyrke og hoyt matsvinn  | slu-eriksson-food-chain-sustainability-2016.pdf | ✓ | — | — | none |
| `src-161` | Syntese av 8 sirkulaer-muligheter i Norden. To gjelder mat: prediktiv styring for etterspurselsprognose/logistikk og digitale plattformer fo | nordic-council-low-carbon-circular-transition-2022.pdf | ✓ | — | — | none |
| `src-162` | Policy-rapport som prioriterer avfallsforebygging fremfor resirkulering. Framhever Too Good To Go (NO) og ResQ (FI) som digitale plattformer | nordic-council-waste-prevention-nord2025-007.pdf | ✓ | — | — | none |
| `src-163` | 35-45 % av fisk spises typisk globalt; 100 % Fish-initiativet i Island naaet ~90 % utnyttelse via kollagen og biprodukter. Fem-trinns klynge | iceland-ocean-cluster-seafood-circular-2022.pdf | ✓ | — | — | none |
| `src-164` | Handlingsplan som understreker okt sirkulaer ressursutnyttelse i matverdikjeden og oppdatert regelverk for rest-raavarer. | regjeringen-handlingsplan-sirkulaer-okonomi-2024-2025.pdf | ✓ | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Konkurrensverket - rapport 2025 5 (2024).pdf` | — | low |

## 4. Foreldreløse PDF-er (262)

PDF-filer i `research/` som ikke er koblet til noen seed-entry. Kandidater for innlegging i `src/lib/data/{reports,theses}.ts` eller eksklusjon via `seed-pdf-map.overrides.json`.

- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/2022-68-EMV-og-innovasjon-i-dagligvare-1.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/20250326-salling-groups-erhvervelse-af-dele-af-coop-danmark-a.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Aarsrapport-Dagligvaretilsynet-2023.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Aarsrapport-Dagligvaretilsynet-2024.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Afgangsprojekt_HD1_Analyse_af_Salling_Group_AS_og_Coop_Danmark_AS.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Dagligvare_ Forskjeller i innkjøpspriser ytterligere redusert - Konkurransetilsynet.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Dagligvaretilsynet - Dagligvaretilsynet Hringssvar om endringer i lov om god handelsskikk handheving (2024).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Dagligvaretilsynet-tildelingsbrev-2024.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Dagligvaretilsynet-tildelingsbrev-2026.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Del-2.-Kartlegging-av-marginer-ved-bruk-av-informasjon-pa-produktniva.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Forbyr praksis som motvirker konkurranse i dagligvaremarkedet - regjeringen.no.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Havforskningsinstituttet - 23 2018 Framtidsrettet mat 1408 (2024).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/KFST - fremtidens detailhandel (2024).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Konkurransetilsynet - Konkurransetilsynets Dagligvarerapport 2024 25 (2024).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Konkurransetilsynet - Konkurransetilsynets dagligvarerapport 2022 (2024).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Konkurransetilsynet - betaling for hylleplass (2024).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Konkurransetilsynets-Dagligvarerapport-2024-25.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/NORDIC_FOOD_MARKETS.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Ny rapport om krav til åpenhet i dagligvarebransjen - regjeringen.no.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Nye tiltak for bedre konkurranse i dagligvarebransjen - regjeringen.no.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Oslo-Economics-Konkurransen-i-dagligvaremarkedet-betydelig-bedre-enn-sitt-rykte.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Paivittaistavarakauppa-ry-2024-EN.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Paraplykjedenes-overtakelse-av-distribusjonen-i-dagligvaremarkedet.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Rapport+om+Samarbeidsklimaet+i+Dagligvarebransjen+2023.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Rapport+om+samarbeidsklimaet+i+Dagligvarebransjen.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Rapport+om+samarbeidsklimaet+i+dagligvarebransjen+2024_Final_17.10.24.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Rapport-marginstudie.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Regjeringen - horingsnotat om forslag til endringer i lov om god handelsskikk (2024).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Regjeringen - konkurransetilsynet kt tildelingsbrev for 2026 (2024).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Regjeringen - nou201120110004000dddpdfs (2024).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/SAMKEPPNISEFTIRLITID_arsskyrlsla_2024_LOK_02.10.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/SINTEF - l1.1 delrapport 1 kvantifisering av utslipp (2024).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/SINTEF - rapport industriell fremstilling av norske forravarer signed (2024).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Svak konkurranse – som fortjent - Civita.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Utredning-om-prisjusteringsvinduer-2023.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/cibus_interim_report_q3_2025.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/cibus_nordic_annual_report_2025.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/cibus_year-end_report_2025.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/dagligvare_rapport.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/fretheimrodnova-etableringshindringer-var-2020_isf_mro-2.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/fréttatilkynning-hagar-4f-2024-25-ensk.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/utredning-av-funksjonelt-og-regnskapsmessig-skille-i-verdikjeden-for-mat-og-dagligvarer.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/100 millioner brød har blitt kastet siden… _ Framtiden i våre hender.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Circular economy butterfly diagram.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Consumer food waste prevention - Food Safety - European Commission.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Det er mye penger å tjene på matsvinn _ Framtiden i våre hender.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/EU actions against food waste - Food Safety - European Commission.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Efficiency of a novel “Food to waste to food” system including anaerobic digestion of food waste and cultivation of vegetables on digestate in a bubble-insulated greenhouse - ScienceDirect.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Endelig er matsvinnloven her! _ Framtiden i våre hender.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Food Redistribution in the Nordic Region.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Food Waste - Food Safety - European Commission.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Food-waste-reduction-corporate-responsibility-and-national-policies-2024.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Growing_vegetables_in_the_circular_econo.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Home - Foodsharing Copenhagen.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Home • PeelPioneers.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/NIBIO - NIBIO POP 2020 6 43 (2024).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/NORSUS - Mobiplast okonomiske konsekvenser av posevalg (2024).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/NORSUS - OR 48.23 Biorest fra marine rastoffer og husdyrgjodsel (2024).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/NPHarvest – We recover value from your wastewater.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Norways-Food-Waste-Reduction-Governance-2022.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Regjeringen - rapport co2 handtering i norsk landbasert industri frem mot 2050 (2024).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Resource-Recovery-surplus-bread-thesis.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Revised Waste Framework Directive enters into force - Environment.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Vi har et enormt skjult matsvinn _ Framtiden i våre hender.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Zero waste solutions in hospitality  technology alignment and agile management practices for responsible consumption and production of food.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/rapport-fra-matsvinnutvalget-anbefalinger-til-helhetlige-tiltak-og-virkemidler-31.12.23.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/2023-Danish-Action-Plan-for-Plant-based-Foods.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Agrifoodtech funding is flat. The real story is where it isn't_.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/BioMar _ Powered by Partnership. Driven by Innovation_.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/DUG Foodtech Declared Bankrupt, Assets Now Open for Acquisition - vegconomist - the vegan business magazine.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Danish insect ag firm ENORM declared bankrupt.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Enifer - Ingredients for a sustainable food chain.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Enorm - larvae for green development of the agricultural and food industry.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Five reasons why vertical farming is still the future, despite all the recent business failures.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Foodrise_ Rising up for fair and resilient food systems.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/French insect protein producer Ÿnsect enters judicial liquidation _ PetfoodIndustry.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Hailia - Enabling the Blue Food Revolution.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Hooked Foods - Enkelt, Gott & Näringsrikt. 100% Veganskt såklart, för allas bästa!.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Hooked Foods files for bankruptcy after seven-year push to crack plant-based seafood _ PPTI News.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Industry Consolidation_ 40+ Major Alternative Protein Companies Have Shut or Been Acquired in Past Year.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Infarm closes Copenhagen operations amid ongoing ‘strategy shift’.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Insect producer seeks reconstruction in the face of bankruptcy _ The Fish Site.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Lessons from vertical farming bankruptcies, layoffs, and closures in 2023.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Mycoprotein Producer Mycorena’s Bankruptcy_ Setback or Fresh Start_.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Mycorena Files for Bankruptcy, Seeks New Ownership to Continue Pioneering Mycoprotein Ingredients - vegconomist - the vegan business magazine.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Naplasol acquires Mycorena to boost the mycelium and alt-protein market - Tech.eu.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/PROMYC, mycoproteins.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Plantagon's Fall_ Lessons for AgTech Innovators.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Protix - Join the future of food today.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Stockeld Dreamery Shuts Down, Citing a Decline in the Plant-Based Category - vegconomist - the vegan business magazine.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Sweden's Hooked Foods Closes Down After Seven Years of Operations - vegconomist - the vegan business magazine.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Swedish foodtech startup restructures through acquisition after bankruptcy filing - ArcticStartup.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Swedish vertical farming company Plantagon International bankrupt.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/The Nordic alternative protein research ecosystem - GFI Europe.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Vegan Cheese Startup Stockeld Dreamery Shuts As Plant-Based Decline Foils Funding Plans.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/Ynsect_ how the world leader in insects ended up in receivership — ONEI.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/approval insect novel food - Food Safety - European Commission.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/06_Company_And_Annual_Reports/2021 Impact Report ENG.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/06_Company_And_Annual_Reports/2022 Impact Report ENG.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/06_Company_And_Annual_Reports/2023 Impact Report ENG-NA.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/06_Company_And_Annual_Reports/2024 Environmental Footprint Report ENG.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/06_Company_And_Annual_Reports/2024 Impact Report - Too Good To Go - US_CA.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/06_Company_And_Annual_Reports/2025-Cargill-Annual-Report.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/06_Company_And_Annual_Reports/Annual report 2024.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/06_Company_And_Annual_Reports/Matsmart-Ars-och-hallbarhetsredovisning-2024.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/06_Company_And_Annual_Reports/NCE Heidner Biocluster - Norges ledende næringsklynge innen bioøkonomi og bærekraftig matproduksjon.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/06_Company_And_Annual_Reports/Slik får vi sunn og bærekraftig mat _ Framtiden i våre hender.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/06_Company_And_Annual_Reports/barekraft-i-asko-2024.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/06_Company_And_Annual_Reports/kesko-annual-report-2024.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/06_Company_And_Annual_Reports/ng_ars--og-barekraftsrapport-2024.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/1-s2.0-S0959378025000019-main.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/1-s2.0-S2772801325000028-main.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/1-s2.0-S2949750726000040-main.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/1-s2.0-S3050835525000087-main.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/1-s2.0-S305083552600001X-main.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/250221_icagruppen_annual_report_2024.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/978-952-03-2923-5.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Aarsrapport-Daglegvaretilsynet-2022.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Bama og Coop må slutte å motarbeide frukt-… _ Framtiden i våre hender.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Bilgic2025tht_VoR.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Chen_Q_et_al_2021.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Falasconi_etal_2025_Sustainability_Who_cleans.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Framtiden i våre hender åpner matbutikk! _ Framtiden i våre hender.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Gapet i klimapolitikken _ Framtiden i våre hender.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/HDR_Afgangsprojekt_maj_2024.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/HDR___Afgangsprojekt___Gruppe_25.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Hybrid-Supply-Chain-Models-in-Swedish-Grocery-Retail.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/JRC92892_qms_h08_lcind_deliverable5_final_20141125.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Learning-for-Crisis-Uppsala-County-Food-Security.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/MASTER-EMILIAEPOSITO-.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Master's Thesis Peppi Segersven.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Master's Thesis_Mäkelä_Mika.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Meningsbryteren _ Framtiden i våre hender.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Nordic-Bankruptcy-Statistics-Report-2024.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Nordmenn vil spise sunnere og mer… _ Framtiden i våre hender.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Ny forskning viser at vi kan mangedoble… _ Framtiden i våre hender.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/PhD_Thesis_Nina_N_rgaard_S_rensen_print_final.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Philippe_Schuler.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Plantefonden_Handlingsplan_2026.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Politics-you-can-Eat-Sodertalje-Food-Supply-Strategy.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/SLU Future Food _ slu.se.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/SRC_Report Nordic Food Systems_ June 2019 adapted.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/SUSFOOD STRATEGIC SCENE review report 2018-final.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Susanne_Helen_Gangstøe_Masteroppgave.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Til bøndene fra staten_ Er du sikker på at… _ Framtiden i våre hender.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/URN_NBN_fi_jyu-202404243036.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/Virkninger-av-kostholdstiltak_Menon-Economics-2006.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/about-oecd-environmental-performance-reviews-brochure-2022-web.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/adlers_s_220222.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/cellar_1fefebb0-1b4e-11ee-806b-01aa75ed71a1.0001.02_DOC_2.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/cellar_1fefebb0-1b4e-11ee-806b-01aa75ed71a1.0001.02_DOC_3.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/cellar_1fefebb0-1b4e-11ee-806b-01aa75ed71a1.0001.02_DOC_4.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/cellar_1fefebb0-1b4e-11ee-806b-01aa75ed71a1.0001.02_DOC_5.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/cheffelo-publicerar-trading-update-for-q1-2026.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/coop-danmark-aarsrapport-2024.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/drager-og-vagene.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/energies-18-04093.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/etmv-toimintakertomus-2023-liitteineen.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/h_khandaker_210712.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/hse_ethesis_14678.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/inns-202122-322s.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/luke-luobio_51_2025.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/luke-luobio_83_2023.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/luke_luobio_53_2020.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/master_Duong_Linh_2025.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/masteroppgave__mats_b._simonsen.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/ng_arsrapport-2025-web.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/nikolaev-g-20230724.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/nilsen_paulsen_pass-through-av-ravarepriser-for-kakao--og-kaffeprodukter.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/no.ntnu_inspera_238079456_47063854.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/nord2020-048.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/nord2024-007.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/nord2024-034.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/nou201120110004000dddpdfs.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/nou201320130006000dddpdfs.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/pdf  MARK STEIN  PhD  24  OCT  22.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/prp201920200033000dddpdfs.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/rapport-gront-rammeverk-ng-2023.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/rapport-gront-rammeverk-ng-2024.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/rapport-gront-rammeverk-ng-2025.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/rapport_2024-4.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/rapport_2024-5.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/stm202420250004000dddpdfs.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/stm202420250025000dddpdfs.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/sturen-f-230831.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/sustainability-18-00459.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/sustainability-18-00475-v2.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/sustainability-18-00495-v3.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/sustainability-18-00530-v3.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/sustainability-18-00543-v2.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/sustainability-18-00545.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/sustainability-18-00546.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/sustainability-18-00548.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/sustainability-18-00549-v2.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/sustainability-18-00551-v2.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/temanord2021-504.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/thesis_food_ng_meile_uniform_pricing_public_version.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/tjostheim--hasle_offentlig-versjon.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/virksomhetsanalysenorgessjomatrad.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/“Resilience Science Must-Knows”_ Landmark report shows how decision-makers can manage global crises - Stockholm Resilience Centre.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/Billund Aquaculture _ Bankruptcy _ Factsheet 201509.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/Billund Aquaculture to declare bankruptcy amid financial challenges - RASTECH MagazineRASTECH Magazine.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/Forsiden - NCCE.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/Forskningsrådet - et samfunnsloft for barekraftig for 21nov (2024).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/Forskningsrådet - pa vei mot barekraftig for 20 grep for 2026 (2024).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/Havforskningsinstituttet - Kap 3 Miljoeffeter som folge av utslipp av loste neringssalter fra fiskeoppdrett (2024).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/Ikkje lett å bli klok på sjølvforsyning - Nibio.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/Klimakrisen presser norske bønder _ Framtiden i våre hender.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/Lite kunnskap om hva laksen spiser _ Nofima.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/Mat og produksjon - Norsk Bonde- og Småbrukarlag _ Norsk Bonde- og Småbrukarlag.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/Matkjedene skviser bonden _ Framtiden i våre hender.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/Matsikkerhet-i-Norge-forsyningsberedskap-masteroppgave-2016.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/Milepæl for norsk beredskap - regjeringen.no.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/Mittenzwei-mfl-2026-Scenarioanalyse-av-norsk-jordbruk-i-2050.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/Norsk sjømatnæring – fra subsidiesluk til pengemaskin _ Nofima.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/Ruralis - aas utnyttelse av forressurser i norsk lakseoppdrett i 2020 sluttkonferanse (2024).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/SINTEF - leveranse l2.1 effekter av organisk utslipp fra havbruk nina (2024).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/Security of supply in Finland - Huoltovarmuuskeskus.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/importvern_til_godkjenning---sensurert-adobe.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/kvotesystemet_i_kyst_og_havfisket.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/livsmedelsberedskap-for-en-ny-tid-sou-20248.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/matsikkerhet-og-beredskap-pa-landbruksomradet.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/myndighetenes-arbeid-med-fiskehelse-og-fiskevelferd-i-havbruksnaringen.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/reduksjon-av-klimagassutslepp-fra-jordbruket.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/tilskudd-til-klimatiltak.pdf`
- `arkiv-sortert/Food Research Process 20.04.26/99_Exact_Duplicates/2023-Danish-Action-Plan-for-Plant-based-Foods (1).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/99_Exact_Duplicates/Årsrapport+Dagligvaretilsynet+2024 (1).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/99_Exact_Duplicates/Årsrapport+Dagligvaretilsynet+2024 (2).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/99_Exact_Duplicates/Årsrapport+for+Daglegvaretilsynet+2022. (1).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/99_Exact_Duplicates/Årsrapport_Dagligvaretilsynet+2023 (1).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/99_Exact_Duplicates/FULLTEXT02 (1).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/99_Exact_Duplicates/HDR___Afgangsprojekt___Gruppe_25 (1).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/99_Exact_Duplicates/Reitan Retail 2025_Oppslag (1).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/99_Exact_Duplicates/Susanne_Helen_Gangstøe_Masteroppgave (1).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/99_Exact_Duplicates/Utredning-om-prisjusteringsvinduer-2023 (1).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/99_Exact_Duplicates/about-oecd-environmental-performance-reviews-brochure-2022-web (1).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/99_Exact_Duplicates/coop-danmark-aarsrapport-2024 (1).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/99_Exact_Duplicates/dagligvare_rapport (1).pdf`
- `arkiv-sortert/Food Research Process 20.04.26/99_Exact_Duplicates/dagligvare_rapport (2).pdf`
- `evidence-pack/arsrapporter/norgesgruppen-2024.pdf`
- `pdf-downloads-20-04-26/1-s2.0-S0044848617322998-main.pdf`
- `pdf-downloads-20-04-26/1-s2.0-S0044848625013481-main.pdf`
- `pdf-downloads-20-04-26/1-s2.0-S2451943X24000486-main.pdf`
- `pdf-downloads-20-04-26/9789264268265-en.pdf`
- `pdf-downloads-20-04-26/Aquaculture Nutrition - 2025 - Mahmud - Exploring Protein‐Based Fishmeal Alternatives for Aquaculture Feeds in Bangladesh.pdf`
- `pdf-downloads-20-04-26/Characteristics_and_stability_of_consumer_food-buy.pdf`
- `pdf-downloads-20-04-26/Economic feasibility of biochar for carbon stock enhancement in Finnish agricultural soils.pdf`
- `pdf-downloads-20-04-26/Exploring sustainable alternatives in aquaculture feeding_ The role of insects - ScienceDirect.pdf`
- `pdf-downloads-20-04-26/Insect-based livestock feeds are unlikely to become economically viable in the near future - ScienceDirect.pdf`
- `pdf-downloads-20-04-26/Reviews in Aquaculture - 2018 - Nogales‐Mérida - Insect meals in fish nutrition.pdf`
- `pdf-downloads-20-04-26/What does it take to close the loop_ Lessons from a successful citrus waste valorisation business _ British Food Journal _ Emerald Publishing.pdf`
- `pdf-downloads-20-04-26/brochure-utp-directive_en.pdf`
- `pdf-downloads-20-04-26/brt-2023-chapter-4-compliance-implementation-and-preparing-proposals_en.pdf`
- `pdf-downloads-20-04-26/fphys-13-1028992.pdf`
- `pdf-downloads-20-04-26/ijfd.8.1.61_Hagolani_Albov.pdf`
- `pdf-downloads-20-04-26/main.pdf`
- `pdf-downloads-20-04-26/nl-20200417-029.pdf`
- `pdf-downloads-20-04-26/no.ntnu_inspera_142433913_96959685.pdf`
- `pdf-downloads-20-04-26/qmr-06-2020-0073.pdf`
- `pdf-downloads-20-04-26/sf-20260417-0601.pdf`
- `pdf-downloads-20-04-26/stm201920200027000dddpdfs.pdf`
- `pdf-downloads-20-04-26/sustainability-13-10471-v2.pdf`
