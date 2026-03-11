# Nordisk offentlig kildemappe for Food Systems 2026

**Oppdatert:** 11. mars 2026  
**Formål:** Kartlegge de viktigste offentlige og åpne kildene som bør analyseres for `Food Systems 2026` på tvers av Norge, Danmark, Sverige, Finland og Island.  
**Prosjektlogikk:** Vi prioriterer kilder som kan støtte prosjektets hovedspor:

1. pris og inflasjon  
2. selvforsyning og matsikkerhet  
3. importavhengighet og handelsstrømmer  
4. markedsstruktur, eierskap og konkurranse  
5. geografi, butikktilgang og lokal sårbarhet  
6. matsvinn, avfall og sirkularitet  
7. regulering, beredskap og offentlige virkemidler

## Avgrensing

Dette er ikke en katalog over hver eneste kommunale eller regionale åpne datasett i Norden. Det er en prosjektstyrt kildemappe over de **nasjonale, offentlige og åpne** kildene som mest sannsynlig må analyseres i whitepaper-, baseline- og dashboardarbeidet.

Der markedstall ikke finnes i offisiell statistikk, bør offentlige foretaksopplysninger og regulatoriske dokumenter brukes som valideringslag. Slike sekundærkilder er nevnt til slutt, men hovedvekten under er på primærkilder.

## Hva som må analyseres først

### Prioritet 1: bygg et nordisk basislag

| Spor | Primærkilder | Hva vi må hente ut |
|---|---|---|
| Pris og kjøpekraft | Eurostat HICP, Eurostat comparative price levels, nasjonale statistikkbanker | Matinflasjon, prisnivå, prisgap mellom land, tidsserier siden minst 2015 |
| Selvforsyning og matbalanser | NIBIO, Luke, Jordbruksverket, StatBank Denmark, Statistics Iceland, FAOSTAT | Kalorisk og varebasert selvforsyning, produksjon vs. konsum, kritiske varegrupper |
| Handel og sårbarhet | SSB utenrikshandel, SCB, Statistics Denmark, Statistics Finland, Statistics Iceland | Importandel per varegruppe, eksportavhengighet, opprinnelsesland, utvikling over tid |
| Markedsstruktur | Konkurransemyndigheter, selskapsregistre, åpne foretaksdata | Eierstruktur, butikk-/foretakstetthet, lokal konsentrasjon, regulatoriske inngrep |
| Geografi og tilgang | Geodata-portaler og foretaksregistre | Kommuner/regioner, butikkpunkter, reisetid, nærhet til havn/logistikk |
| Matsvinn og sirkularitet | Miljømyndigheter, matmyndigheter, avfallsstatistikk | Matsvinn per ledd, avfallsstrømmer, emballasje, organisk avfall, sidestrømmer |

### Prioritet 2: regulatorisk og beredskapsmessig sammenlikning

| Spor | Primærkilder | Hva vi må hente ut |
|---|---|---|
| Dagligvare- og konkurranseregulering | Konkurransetilsynet, KFST, Konkurrensverket, KKV, Samkeppniseftirlitið | Fusjonsvedtak, sektorundersøkelser, dominansterskler, UTP-håndheving |
| Beredskap og forsyning | NIBIO, Ruokavirasto/Food Market Ombudsman, svenske og danske matmyndigheter, islandske mat- og miljømyndigheter | Lagring, beredskapsmål, hjemmemarked vs. eksport, kritiske avhengigheter |

## Tverrnasjonale kilder som alltid bør inngå

| Kilde | Lenke | Relevans for prosjektet |
|---|---|---|
| Eurostat HICP metadata | [ec.europa.eu/eurostat/cache/metadata/en/prc_hicp_esms.htm](https://ec.europa.eu/eurostat/cache/metadata/en/prc_hicp_esms.htm) | Sammenliknbar matinflasjon mellom land |
| Eurostat comparative price levels | [ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20241219-1](https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20241219-1) | Prisnivåforskjeller og “Norway premium” |
| FAOSTAT food balance sheets | [fao.org/statistics/highlights-archive/highlights-detail/food-balance-sheets-2010-2023/en](https://www.fao.org/statistics/highlights-archive/highlights-detail/food-balance-sheets-2010-2023/en) | Felles matbalanseverk for alle land, inkl. Island |
| Nordic Statistics | [norden.org/en/statistics](https://www.norden.org/en/statistics) | Ferdig sammenstilte nordiske indikatorer og inngang til nasjonale statistikkinstitusjoner |
| State of the Nordic Region | [nordregio.org/research/state-of-the-nordic-region](https://nordregio.org/research/state-of-the-nordic-region/) | Regionalt sammenlikningslag og nordisk kontekst |

## Land for land

### Norge

| Tema | Kilde | Lenke | Hva vi bør hente ut | Prioritet |
|---|---|---|---|---|
| Offisiell statistikk | StatBank / SSB | [ssb.no/en/statbank1](https://www.ssb.no/en/statbank1) | KPI, PPI, handel, foretak, detaljhandel, jordbruk, fiskeri | Høy |
| Utenrikshandel | SSB utenrikshandel med varer | [ssb.no/en/utenriksokonomi/utenrikshandel/statistikk/utenrikshandel-med-varer](https://www.ssb.no/en/utenriksokonomi/utenrikshandel/statistikk/utenrikshandel-med-varer) | Import/eksport per varegruppe, land og tidsserie | Høy |
| Selvforsyning | NIBIO | [nibio.no/en/about-eng/research-matters/division-of-survey-and-statistics/research-matters-survey-and-statistics-2024/the-challenge-of-food-self-sufficiency](https://www.nibio.no/en/about-eng/research-matters/division-of-survey-and-statistics/research-matters-survey-and-statistics-2024/the-challenge-of-food-self-sufficiency) | Selvforsyningsgrad, metode, varegruppesvakheter | Høy |
| Jordbruks- og matforvaltning | Landbruksdirektoratet | [landbruksdirektoratet.no](https://www.landbruksdirektoratet.no/) | Produksjon, tilskudd, importvern, matsvinn i jordbruket, sektorrapporter | Høy |
| Foretak og enheter | Brønnøysundregistrene | [brreg.no/en/use-of-data-from-the-bronnoysund-register-centre/datasets-and-api/data-about-organisations](https://www.brreg.no/en/use-of-data-from-the-bronnoysund-register-centre/datasets-and-api/data-about-organisations/) | Org.nr., underenheter, næringskoder, adresser, kjedekartlegging | Høy |
| Åpne data-portal | data.norge.no | [data.norge.no/en](https://data.norge.no/en) | Søk etter supplerende datasett fra direktorater og kommuner | Medium |
| Geodata | Geonorge / Kartverket | [kartkatalog.geonorge.no/metadata/administrative-enheter-kommuner/f8838df0-0686-42e2-b8a6-629c5d293dda](https://kartkatalog.geonorge.no/metadata/administrative-enheter-kommuner/f8838df0-0686-42e2-b8a6-629c5d293dda) | Kommunegrenser, grunnkart, stedfesting av butikker og logistikk | Høy |
| Fiskeri | Fiskeridirektoratet | [fiskeridir.no/statistikk-tall-og-analyse/data-og-statistikk-om-yrkesfiske/apne-data-elektronisk-rapportering-ers](https://www.fiskeridir.no/statistikk-tall-og-analyse/data-og-statistikk-om-yrkesfiske/apne-data-elektronisk-rapportering-ers) | Fangst, landinger, yrkesfiske, åpent ERS-datasett | Medium |
| Konkurranse | Konkurransetilsynet | [konkurransetilsynet.no/anticompetitive-practices-may-have-led-to-higher-grocery-prices/?lang=en](https://konkurransetilsynet.no/anticompetitive-practices-may-have-led-to-higher-grocery-prices/?lang=en) | Prisjeger-saken, marginstudier, markedsgranskning | Høy |
| Avfall og sirkularitet | Miljødirektoratet | [miljodirektoratet.no](https://www.miljodirektoratet.no/) | Avfall, gjenvinning, organisk avfall, emballasje | Medium |
| Ernæring / matdata | Mattilsynet / Matvaretabellen | [mattilsynet.no/en/food-and-beverages/matvaretabellen/download-the-norwegian-food-composition-table](https://www.mattilsynet.no/en/food-and-beverages/matvaretabellen/download-the-norwegian-food-composition-table) | Næringsprofil, produktkategorier, evt. kostholds-/substitusjonsspor | Lav |

### Danmark

| Tema | Kilde | Lenke | Hva vi bør hente ut | Prioritet |
|---|---|---|---|---|
| Offisiell statistikk | StatBank Denmark | [statbank.dk](https://www.statbank.dk/) | KPI, landbruk, handel, produksjon, detalj, organisk produksjon | Høy |
| Landbruk, fiskeri, akvakultur | Styrelsen for Fødevarer, Landbrug og Fiskeri / LFST | [lfst.dk/english](https://lfst.dk/english) | Fiskeri, akvakultur, tilskudd, plante- og landbruksdata | Høy |
| Matforvaltning | Styrelsen for Fødevarer, Landbrug og Fiskeri | [en.foedevarestyrelsen.dk](https://en.foedevarestyrelsen.dk/) | Mattrygghet, kostråd, matsvinn, kontrollsystemer | Medium |
| Konkurranse | Danish Competition and Consumer Authority (KFST) | [en.kfst.dk](https://en.kfst.dk/) | UTP, fusjonsvedtak, analyser av matpriser og kjeder | Høy |
| Nylig strukturinngrep | Salling/Coop-saken | [en.kfst.dk/nyheder/kfst/english/decisions/2025/20250326-salling-group-acquires-33-stores-from-coop-danmark](https://en.kfst.dk/nyheder/kfst/english/decisions/2025/20250326-salling-group-acquires-33-stores-from-coop-danmark) | Lokale konkurransevurderinger og butikkstruktur | Høy |
| Foretak | Virk / CVR | [virk.dk](https://virk.dk/) | Foretaksinformasjon, juridiske enheter, lokasjoner | Høy |
| Geodata | Danish Geodata Agency | [eng.gst.dk](https://eng.gst.dk/) | Eiendom, marine data, geodata for spatial analyse | Medium |
| Matkontroll på virksomhetsnivå | findsmiley.dk | [findsmiley.dk](https://findsmiley.dk/) | Offentlig register over matvirksomheter og kontrollrapporter | Medium |

### Sverige

| Tema | Kilde | Lenke | Hva vi bør hente ut | Prioritet |
|---|---|---|---|---|
| Offisiell statistikk | SCB Statistical Database | [statistikdatabasen.scb.se/pxweb/en/ssd](https://www.statistikdatabasen.scb.se/pxweb/en/ssd/) | KPI, HIKP, handel, konsum, foretak, regionale serier | Høy |
| API / åpne data | Statistics Sweden Open Data | [scb.se/en/services/open-data-api](https://www.scb.se/en/services/open-data-api/) | Reproduserbare uttrekk via API | Høy |
| Jordbruk og konsum | Jordbruksverket offisiell statistikk | [jordbruksverket.se/om-jordbruksverket/jordbruksverkets-officiella-statistik](https://jordbruksverket.se/om-jordbruksverket/jordbruksverkets-officiella-statistik) | Jordbruksøkonomi, produksjon, areal, matforbruk og næringsinnhold | Høy |
| Matforbruk | Jordbruksverket konsumstatistikk | [jordbruksverket.se/om-jordbruksverket/jordbruksverkets-officiella-statistik/jordbruksverkets-statistikrapporter/statistik/2025-12-11-livsmedelskonsumtion-och-naringsinnehall.--uppgifter-till-och-med-2024](https://jordbruksverket.se/om-jordbruksverket/jordbruksverkets-officiella-statistik/jordbruksverkets-statistikrapporter/statistik/2025-12-11-livsmedelskonsumtion-och-naringsinnehall.--uppgifter-till-och-med-2024) | Totalforsyning/forbruk og energiinnhold | Høy |
| Matdata / open data | Livsmedelsverket | [livsmedelsverket.se/en/about-us/open-data](https://www.livsmedelsverket.se/en/about-us/open-data/) | Matdatabasen, produkt- og ernæringsdata | Medium |
| Konkurranse | Konkurrensverket | [konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2024-5_summary.pdf](https://www.konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2024-5_summary.pdf) | Dagligvareundersøkelser, etableringsbarrierer, prisatferd | Høy |
| Geodata | Lantmäteriet | [www2.lantmateriet.se/en/geodata/geodata-portal](https://www2.lantmateriet.se/en/geodata/geodata-portal/) | Geodata, regionale analyser, butikk- og tilgjengelighetskart | Medium |
| Åpne geodata | SCB open geodata | [scb.se/en/services/open-data-api/open-geodata](https://www.scb.se/en/services/open-data-api/open-geodata/) | Lokalitet, grid, avgrensninger, befolkningsnære romlige data | Medium |
| Foretak | Skatteverket selskapsopplysninger | [skatteverket.se/servicelankar/otherlanguages/inenglishengelska/individualsandemployees/retrievecompanyinformation.4.b1014b415f3321c0de1cd9.html](https://www.skatteverket.se/servicelankar/otherlanguages/inenglishengelska/individualsandemployees/retrievecompanyinformation.4.b1014b415f3321c0de1cd9.html) | Offentlig selskapsinfo per virksomhet; nyttig til kjedevalidering | Medium |
| Matsvinn / avfall | Naturvårdsverket | [naturvardsverket.se/en/topics/waste](https://www.naturvardsverket.se/en/topics/waste) | Matsvinn, avfallsstrømmer, ressurseffektivitet | Medium |

### Finland

| Tema | Kilde | Lenke | Hva vi bør hente ut | Prioritet |
|---|---|---|---|---|
| Offisiell statistikk | Statistics Finland / StatFin | [pxdata.stat.fi/pxweb/pxweb/en](https://pxdata.stat.fi/pxweb/pxweb/en/) | Priser, handel, husholdning, regional statistikk, foretak | Høy |
| API og åpne grensesnitt | Statistics Finland Open Data | [stat.fi/en/services/statistical-data-services/open-data-and-interfaces](https://stat.fi/en/services/statistical-data-services/open-data-and-interfaces) | API-basert datahenting og åpne geodata | Høy |
| Åpen dataportal | avoindata.fi | [avoindata.fi/en](https://www.avoindata.fi/en) | Supplerende nasjonale datasett på tvers av myndigheter | Medium |
| Jordbruk, mat og selvforsyning | Luke statistics | [luke.fi/en/statistics](https://www.luke.fi/en/statistics) | Produksjon, matbalanser, selvforsyning, korn, melk, bioøkonomi | Høy |
| Selvforsyning | Luke indikator | [luke.fi/en/statistics/indicators/finlands-cap-impact-indicators/ratio-between-domestic-production-and-consumption](https://www.luke.fi/en/statistics/indicators/finlands-cap-impact-indicators/ratio-between-domestic-production-and-consumption) | Varevis selvforsyning og metodikk | Høy |
| Matmyndighet og registerdata | Finnish Food Authority / Ruokavirasto | [ruokavirasto.fi/en/about-us/published-datasets](https://www.ruokavirasto.fi/en/about-us/published-datasets/) | Tilsynsdata, støttedata, romlige datasett, plante/dyr/mat | Høy |
| Matmarked og forsyningskjede | Food Market Ombudsman | [ruokavirasto.fi/en/food-market-ombudsman/food-market-ombudsman](https://www.ruokavirasto.fi/en/food-market-ombudsman/food-market-ombudsman/) | Handelspraksis, forsyningskjede, maktforhold | Høy |
| Konkurranse | KKV / FCCA | [kkv.fi/en](https://www.kkv.fi/en/) | Dagligvaremarked, §4a-dominans, saker og presedens | Høy |
| Foretak | YTJ / PRH open data | [ytj.fi/en/index/opendata.html](https://ytj.fi/en/index/opendata.html) | Foretak, registeropplysninger, digitale regnskapsdata | Høy |
| Geodata | National Land Survey / Paikkatietoikkuna | [maanmittauslaitos.fi/en/e-services/geodata-portal-paikkatietoikkuna](https://www.maanmittauslaitos.fi/en/e-services/geodata-portal-paikkatietoikkuna) | Romlige lag, grenser, infrastruktur, regional analyse | Medium |

### Island

| Tema | Kilde | Lenke | Hva vi bør hente ut | Prioritet |
|---|---|---|---|---|
| Offisiell statistikk | Statistics Iceland PXWeb | [px.hagstofa.is/pxen/pxweb/en](https://px.hagstofa.is/pxen/pxweb/en/) | Priser, handel, foretak, jordbruk, fiskeri, nasjonalregnskap | Høy |
| Jordbruk og fiskeri | Statistics Iceland, næringsdatabasen | [px.hagstofa.is/pxen/pxweb/en/Atvinnuvegir](https://px.hagstofa.is/pxen/pxweb/en/Atvinnuvegir/) | Produksjon, fangst, verdi, jordbruksøkonomi | Høy |
| Mat- og veterinærforvaltning | MAST / Matvælastofnun | [mast.is/en](https://www.mast.is/en) | Mattrygghet, inn- og utførsel, akvakultur, recalls, tilsyn | Høy |
| Konkurranse | Icelandic Competition Authority | [samkeppni.is/en](https://www.samkeppni.is/en/) | Konkurranseforhold, markedskonsentrasjon, sektorvurderinger | Høy |
| Geodata | National Land Survey of Iceland | [lmi.is/is/moya/page/licence-for-national-land-survey-of-iceland-free-data](https://www.lmi.is/is/moya/page/licence-for-national-land-survey-of-iceland-free-data) | Frie geodata, basisdata og stedfesting | Medium |
| Geoportal | Lýsigagnagátt | [gatt.lmi.is/geonetwork/srv/eng/catalog.signin](https://gatt.lmi.is/geonetwork/srv/eng/catalog.signin) | Metadataportal for romlige datasett fra islandske offentlige aktører | Medium |
| Miljø og sirkularitet | Umhverfis- og orkustofnun | [uos.is/en](https://uos.is/en) | Avfall, sirkulær økonomi, miljøindikatorer | Medium |
| Selskapsregister | Ísland.is / Register of Companies | [island.is/en/life-events/starting-a-company](https://island.is/en/life-events/starting-a-company) | Offentlig informasjon om registrering, selskapsstruktur og adgang til foretaksdata | Medium |

## Sekundære, men offentlige valideringskilder

| Type | Eksempler | Hvorfor de trengs |
|---|---|---|
| Årsrapporter og børsmeldinger | ICA Gruppen, Axfood, Kesko, Salling Group, Coop-systemene, Orkla, Atria, HKScan | Markedsandeler, segmentering, investeringer og marginer |
| Kjedenes butikkfinnere | ICA, Willys, Coop, Rema 1000, Lidl, Salling, Kronan m.fl. | Butikkpunkter og nettverkskart når offentlige butikkregistre er svake |
| Offentlige kontrollregistre | `findsmiley.dk`, nasjonale mattilsynsregistre, virksomhetsregistre | Validering av aktive lokasjoner og virksomhetstype |
| Offentlige anbuds- og innkjøpsdata | nasjonale anskaffelsesportaler, TED, kommunale kontraktspubliseringer | Offentlig matinnkjøp, storkjøkken og institusjonsmarked |
| Parlaments- og utredningsdokumenter | regjeringer, storting/riksdag/folketing/alþingi | Politikkendringer, beredskap, konkurranse og matsvinn |

## Hvilke arbeidsstrømmer dette bør bli til

### 1. Prisarbeidsstrøm

- Hent HICP og nasjonale KPI-serier for mat fra alle fem land.
- Legg til Eurostat price level indices for å måle nivåforskjell, ikke bare inflasjon.
- Dokumenter seriebrudd og ulik base/metodikk.

### 2. Selvforsynings- og beredskapsstrøm

- Bygg en felles tabell for selvforsyning, produksjon og konsum.
- Normaliser til noen få sammenliknbare varegrupper: korn, meieri, kjøtt, fisk, frukt/grønt, fôr.
- Skill tydelig mellom kalorisk selvforsyning, varebasert selvforsyning og eksportstyrke.

### 3. Markedsmakt- og foretaksstrøm

- Hent offentlige foretaksregistre og bruk dem til kjede- og underenhetskartlegging.
- Kombiner med konkurransemyndighetenes saker og sektorrapporter.
- Beregn lokal konsentrasjon der butikkpunkter kan identifiseres.

### 4. Geografi- og sårbarhetsstrøm

- Last ned administrative grenser og tilgjengelige punktdata for butikker, havner, produksjon og logistikk.
- Koble mot reisetid, befolkning og importknutepunkt.
- Bruk dette til food desert-, beredskaps- og forsyningsanalyse.

### 5. Sirkularitetsstrøm

- Bygg et minimumssett for matsvinn, organisk avfall, emballasje og sidestrømmer.
- Vurder offentlig tilgjengelige data først; bruk bransjekilder kun som sekundær støtte.

## Viktige hull i offentlig data

Dette vil sannsynligvis **ikke** være fullt ut tilgjengelig som offisiell, åpen data i alle land:

- eksakte markedsandeler per kjede og kommune
- butikknivå-omsetning
- grossistpriser og innkjøpsbetingelser
- leverandørmarginer og kjedespesifikke prisserier
- proprietære logistikkdata

For disse hullene bør vi bruke:

1. offentlige selskapsregistre  
2. konkurransevedtak og sektorrapporter  
3. offentlige årsrapporter og børsinnrapporteringer  
4. kjedenes egne butikkfinnere og offentlige kontrollregistre  
5. eventuelle innsynsbegjæringer der det finnes sakshåndtering eller reguleringsmateriale

## Anbefalt neste steg i prosjektet

1. Lås en felles indikatorliste på tvers av land før mer datainnhenting skjer.  
2. Lag en land-for-land backlog over konkrete tabeller/API-kall under hver portal.  
3. Prioriter først `Norge + Danmark + Sverige + Finland + Island` på identiske indikatorer, ikke dybdedykk i ett land av gangen.  
4. Bygg et “source registry” i CSV eller JSON med feltene `country`, `theme`, `source_name`, `url`, `format`, `update_frequency`, `priority`, `owner`, `status`.  
5. Legg til Grønland, Færøyene og Åland som egen utvidelse dersom prosjektets nordiske scope fortsatt skal inkludere arktiske/selvstyrte områder.

## Metode

### Kilder

- Eksisterende prosjektmateriale i repoet, spesielt `research/source-scouting-2026-03-10.md`, `research/norden/nordisk-komparativ-analyse.md` og `research/norden/regulatorisk-kartlegging.md`.
- Offisielle og åpne nettressurser kontrollert 11. mars 2026.

### Begrensninger

- Flere portaler er kartlagt på portalnivå, ikke på tabellnivå.
- Danmark er i forvaltningsendring fra 1. januar 2026, så relevant innhold ligger både på `foedevarestyrelsen.dk` og `lfst.dk`.
- Islandsk og finsk åpen data er mer fragmentert og krever ofte kombinasjon av statistikkportal + sektormyndighet + geoportal.
