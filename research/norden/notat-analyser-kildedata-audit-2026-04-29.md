# Kilde- og datagap-audit: notatanalyser om bærekraft i nordiske matsystemer

Dato: 2026-04-29  
Scope: tidligere notatanalyser om Norden, Sverige, Finland, Danmark, Norge og Island, vurdert mot lokal database, kildearkiv og datakilder i Food Systems 2026.  
Status: lokal audit med ekstern primærkildeverifisering for P1-kilder som er seedet i denne runden.

Oppdatert 2026-04-29 etter videre arbeid:

- `src/lib/data/reports.ts` har fått rene `Report`-poster for NNR2023, NORMO 2025, Solutions Menu og den faktiske Karlstad-deklarasjonen om matberedskap.
- `norden-policy-2024` er harmonisert med eksplisitt tittel: `Policy tools for sustainable and healthy eating: Enabling a food transition in the Nordic countries`.
- Fire NNR-bakgrunnsartikler med verifiserte DOI-er er lagt inn som `Report`: Meltzer m.fl. 2024 (`10.29219/fnr.v68.10489`), Harwatt m.fl. 2024 (`10.29219/fnr.v68.10539`), Trolle m.fl. 2024 (`10.29219/fnr.v68.10792`) og Jackson/Holm 2024 (`10.29219/fnr.v68.10450`).
- NNR-implementeringsartikkelen `From evidence to action` fra 2025 er lagt inn som `Report` med DOI `10.1017/S0029665125100682`.
- Danmarksposten `danmark-groent-danmark-co2-avgift-2024` er lagt inn som `Report` og koblet til lokal note om `Aftale om Grønt Danmark`.
- Evidas `Biogasstatus for 2024` er lagt inn som dansk `Report`, med `CountryMetric`-seeds for 649 mill. Nm3 biogass til distribusjonssystemet, 38 prosent biogassandel, 57 gasstilkoblede anlegg og 1,47 Mt CO2-fortrengning.
- IFRO/KU-rapporten `Status of Danish imports of sustainable and deforestation- and conversion-free soy` er lagt inn som dansk `Report`, med `CountryMetric`-seeds for soyamelimport, dyrefôrandel, sertifiserings-/sporbarhetsandel og tre 2023-scenarier for klimaavtrykk.
- Biogas Danmark `Biogas Outlook 2024` er lagt inn som dansk `Report`, med `CountryMetric`-seeds for 45 prosent biogassandel av samlet dansk gassforbruk i 2023, Frozen Policy-/Green Policy-produksjonsscenarioer, netto klimaeffekt, fosforgjenvinning og redusert nitrogenutvasking.
- Svensk Riksrevisionens `RiR 2025:24` er lagt inn som `Report` og brukt til svenske `CountryMetric`-seeds for jordbrukets utslipp, LULUCF-bidrag og sentrale utslippskilder.
- Naturvårdsverkets 2024-statistikk for svensk livsmedelsavfall er lagt inn som `Report`, med `CountryMetric`-seeds for total fast avfall i butiks-/konsumentledd, kg per person og fordeling mellom hushold, handel/distribusjon og servering/offentlige måltider.
- Jordbruksverkets svenske forbruksstatistikk til og med 2024 er lagt inn som `Report`, med `CountryMetric`-seeds for frukt/grønt, kjøtt, melk, ost, leskedrikker, sjokolade/konfekt og energitilførsel.
- Finlands nasjonale kostråd 2024 (`Kestavaa terveytta ruoasta`) er lagt inn som `Report` med ISBN og offisiell Julkari-kilde; tabell-/metrikkuttrekk gjenstår.
- Luke sin 2024-veikartkilde for klimasmart matproduksjon på finske torvjorder er lagt inn som `Report`, med `CountryMetric`-seeds for torvjorders utslippsandel, arealandel, to reduksjonsbaner til 2050 og foreløpige kostnadsintervaller.
- Suomen Biokierto ja Biokaasu ry sin 2024-publikasjon om finsk biogassproduksjon 2030/2035/2040 er lagt inn som `Report`, med `CountryMetric`-seeds for 10 TWh teknisk-økonomisk potensial, 52 pipeline-prosjekter, 1,2 TWh planlagt kapasitet, 650 mill. euro investeringsverdi, 2,7 mill. tonn sidestrømbehandling og 2030/2035/2040-produksjonsbaner.
- Statistics Finland sin offisielle 2024-statistikk for biogass er lagt inn som `Report`, med `CountryMetric`-seeds for 3 359 TJ produsert, 3 046 TJ forbrukt, 313 TJ faklet og 14 prosent vekst i gårdsbaserte landbruksavfallsanlegg.
- Valios ESRS-baserte Sustainability Report 2024 er lagt inn som `Report`, med `CountryMetric`-seeds for utslippsreduksjon i finsk melkeverdikjede, Valio-skala, Carbo-kalkulatorbruk, regenerativt jordbruksareal og mål om 2 mill. tonn gjødsel til biogass i 2035.
- `src/lib/data/sustainability-country-metrics.ts` er opprettet med `CountryMetric`-seeds: NNR2023 kostholdsanbefalinger, NORMO 2025 landvise adult diet frequency- og adult/child overweight-obesity-indikatorer, danske policy- og biogassindikatorer, svenske jordbruksutslipps-/matsvinn-/forbruksindikatorer og finske torvjord-/biogass-/Valio-indikatorer.
- `scripts/import-ts-data.ts` er utvidet slik at disse bærekraftsindikatorene upsertes sammen med eksisterende `CountryMetric`-data når `npm run db:import:ts` kjøres.
- `scripts/import-ts-data.ts` er samtidig gjort mer robust for møtedokumenter: gamle rader som hadde `slug`, men manglet `filePath`, oppdateres nå i stedet for å kollidere på unik `slug`.
- De gamle mismatch-postene `karlstad-declaration-2024` og `nordic-food-alert-2025` er ikke fjernet i denne runden; de beholdes som eksplisitte feilfil-/mismatch-markører til PDF-/map-opprydding tas separat.
- `npm run db:import:ts` er kjørt og fullført etter Danmark-soya/Biogas Danmark-tillegget: 129 statiske rapporter og 155 landindikatorer ble importert/upsertet.
- Verifisering etter videre Nordic Vision-arbeid: `npx tsc --noEmit` og `npm run db:audit` passerte; NORMO Appendix 6 er arkivert i `research/data/nordic/normo-2025/raw/`, normalisert CSV har 55 landvise rader, matsvinnsnapshot har 47 runtime-rader, `sustainability-country-metrics.ts` har 162 unike seed-nøkler, og databasen har nå 175 `Report`-rader og 414 `CountryMetric`-rader.

## Kort konklusjon

Notatene er svært relevante for prosjektet. De gir et samlet nordisk bærekraftslag som kan kobles til de eksisterende flatene for verdikjede, rapporter, kilder, selskaper, landdata og sammenligning. De viktigste bidragene er:

- en felles nordisk ramme for klima, matsvinn, sidestrømmer, kosthold, beredskap og sirkularitet
- tydelige landprofiler der hvert land har egne styrker og flaskehalser
- en god første liste over policy- og forskningsrapporter som bør ligge som siterbare kilder i databasen
- en praktisk prioritering av hva som bør hentes inn som strukturerte data, ikke bare som tekst

Samtidig bør notatene ikke brukes som siterbare primærkilder i seg selv. De bør brukes som navigasjon og analyseutkast. De enkelte tallene må bindes til rapporter, offisiell statistikk eller fagfellevurderte artikler før de løftes inn i canonical analyse eller offentlig leveranse.

## Hva vi allerede har godt dekket

### 1. Grunnleggende datamodell og integritet

`npm run db:audit` ble kjørt 2026-04-29 og passerte. Relevante tabeller finnes allerede:

- `Report` for rapporter, policyutredninger og synteserapporter
- `SourceDoc` for kildeposter og originale kildedokumenter
- `Document` for fulltekst, lokale notater og importerte dokumenter
- `CountryMetric` for harmoniserte tallserier per land
- `Actor`, `Company`, `PersonProfile` og relasjonstabeller for aktører

DB-status fra audit:

- `Document`: 1169
- `SourceDoc`: 313
- `Report`: 175
- `Company`: 55 438
- `CountryMetric`: 414
- alle sentrale referanse- og relasjonskontroller passerte

Det betyr at infrastrukturen er klar for å absorbere denne notatpakken som kilder, rapporter og landindikatorer.

### 2. Nordiske hovedkilder som allerede finnes lokalt

Vi har allerede flere av de viktigste kildene som notatene bygger på eller peker mot:

- Stockholm Resilience Centre, `Nordic Food Systems for Improved Health and Sustainability` fra 2019, ligger som report og lokal PDF.
- Nordisk ministerråd / Nordregio `Policy tools for sustainable and healthy eating` er harmonisert som `Report` og `SourceDoc` med felles lokal PDF-`Document`.
- Nordisk food waste / matsvinn-kilder finnes både som report, PDF og lokale notater; `Breaking Barriers` er harmonisert som `Report` og `SourceDoc` med felles lokal PDF-`Document`.
- EAT-korpus finnes lokalt, inkludert EAT-Lancet 2025-pakken og flere EAT-rapporter.
- Det finnes lokale notater for NNR2023, NORMO 2025, Karlstad-deklarasjonen og flere akademiske NNR-bakgrunnsartikler; NNR2023 er DB-lenket til full PDF-`Document`, og NORMO 2025 har nå arkivert Appendix 6-uttrekk.
- `research/norden/nordic-source-registry.csv` er allerede en sterk operativ katalog for statistikkilder per land.

### 3. Norge er klart sterkest dekket

For Norge har vi allerede et solid kildegrunnlag:

- Matvett/NORSUS matsvinnkilder
- Matsvinnutvalget 2024
- Bransjeavtalen om matsvinn
- SSB-tabeller for avfall, landbruk og matrelaterte indikatorer
- NIBIO/selvforsyning som identifisert kildeområde
- Landbrukets klimaplan og norske klimapolitiske dokumenter
- soya-, oppdretts- og fôrrelaterte kilder i lokal research

Matsvinnstatusen er særlig god: lokale originalfiler og rapportstatus skiller tydelig mellom fullstendige PDF-er, metodekilder, faktaark, CSV-er og manglende oppdateringer.

### 4. Strukturerte nordiske datakilder er delvis på plass

`research/norden/nordic-source-registry.csv` dekker allerede mange kilder vi trenger for landindikatorer:

- Eurostat: HICP, prisnivå, handel, organisk areal og flere matrelaterte tabeller
- FAOSTAT: food balances og supply indicators
- SSB: norsk landbruk, priser, handel, avfall, utslipp, areal og næring
- StatBank Danmark: priser, handel, økologi, avfall, CVR og jordbruksdata
- SCB og Jordbruksverket Sverige: forbruk, priser, avfall, produksjon, handel og virksomheter
- Luke, StatFin og Finnish Customs: food balances, handel, priser og jordbruksdata
- Statistics Iceland og MAST: matforsyning, handel, avfall, akvakultur og virksomheter

Dette gjør at vi kan gå videre fra rapportnivå til faktisk målepanel per land.

## Hva som er delvis dekket, men ikke dataklart

### 1. NNR2023 og tilhørende vitenskapelige reviews

Notatene peker riktig på NNR2023 som et av de viktigste nordiske rammeverkene. Lokale notater finnes, men status bør oppgraderes:

- NNR2023 ligger nå som egen `Report`; det som gjenstår er eventuell lokal fulltekst-/PDF-snapshot og mer detaljert metrikktrekk.
- Bakgrunnsartiklene bør enten importeres som `Report` eller kobles som `SourceDoc`/`Document`:
  - Meltzer m.fl. om utfordringer og muligheter for bærekraftige dietter i Norden
  - Harwatt/Benton m.fl. om miljømessig bærekraft i nordisk-baltisk matproduksjon og forbruk
  - Trolle/Meinilä m.fl. om implementering av bærekraft i nasjonale kostråd
  - Jackson/Holm om sosiale og økonomiske dimensjoner

Disse er svært relevante fordi de gir forskningsmessig ryggdekning for kostholdsdelen av notatene.

Status etter oppdatering: Meltzer, Harwatt, Trolle/Meinilä og Jackson/Holm er nå seedet i `Report`. Det som gjenstår er eventuelt lokal fulltekst/PDF-snapshot og mer detaljert tabelluttrekk.

### 2. NORMO 2025

NORMO 2025 er relevant fordi den viser faktisk utvikling i kosthold, overvekt og fysisk aktivitet i Norden. Første landtabelluttrekk er nå på plass: Appendix 6 er arkivert, 55 landvise rader er normalisert, og DB har 57 NORMO-`CountryMetric`-rader når de to nordiske summary-radene tas med.

Anbefalt DB-bruk:

- `Report`: `normo-2025-nordic-monitoring`, lenket til lokal note-`Document`
- `CountryMetric`: indikatorer per land for voksenkosthold, overvekt/fedme hos voksne og overvekt/fedme hos barn
- `Document`: lokal analyse-/ekstraktnote; full PDF-arkiv gjenstår bare hvis ekstern sitatbruk krever det

### 3. Karlstad-deklarasjonen

Karlstad-deklarasjonen er relevant for koblingen mellom bærekraft, matberedskap og robusthet. Vi har lokal note og PDF, men DB har en datakvalitetsfeil:

- `karlstad-declaration-2024` ser ut til å være knyttet til en UNESCO biosphere reserve-rapport, ikke selve Karlstad-deklarasjonen.
- Dette bør rettes før rapporten brukes i analyse eller på nettsted.

Anbefaling: opprett eller korriger en egen `Report` for Karlstad-deklarasjonen med riktig tittel, URL og tags: `nordisk`, `matberedskap`, `robusthet`, `matsystem`, `skog`, `jordbruk`, `fiskeri`.

### 4. Landprofilene fra notatene

Landanalysene er analytisk nyttige, men må kildebindes før de blir canonical:

- Danmark: Green Tripartite, CO2-avgift, soyaimport, biogass, plantefond og matavfall.
- Sverige: jordbrukets utslipp, Livsmedelsstrategin 2.0, matsvinn, biogass, kjøttforbruk og Østersjøavrenning.
- Finland: torvmyr/organogene jordarter, Luke, Valio, biogasspipeline, kostråd 2024 og selvforsyning.
- Norge: matsvinn, selvforsyning, oppdrettsfôr, soya, jordbruksklima, Oslofjorden og biogass.
- Island: importavhengighet, geotermiske drivhus, fiskeriets råstoffutnyttelse, Matís, våtmarker og matsvinnsdata.

Noe av dette finnes som lokale notater, men ikke nødvendigvis som report/source records med strukturerte indikatorer.

### 5. Sidestrømmer og sirkularitet

Dette er strategisk relevant for oss, men datadekningen er ujevn. Vi har noen sirkularitetskilder og JSON-flater, men mangler et robust nordisk tallgrunnlag for:

- matindustrielle sidestrømmer per land
- myse, slaktebiprodukter, fiskerester, bryggerimask, kornrester og grønnsaksavfall
- biogass-råstoff og produksjon per land
- næringsstoffgjenvinning av nitrogen og fosfor
- slam fra akvakultur og landbasert oppdrett
- verdihierarki: humant konsum, fôr, ingrediens, gjødsel, biogass, forbrenning

Dette bør bli en egen datainnsamlingspakke hvis vi skal bruke "sirkulære matsystemer" som et bærende spor.

## Hva vi mangler og bør hente inn

### P1: Må hentes eller ryddes før ekstern bruk

1. `nordic-food-alert-2025` må kontrolleres. DB-posten er flagget med mismatch og ser ikke ut til å være matrelatert slik ID-en tilsier.
2. NNR2023 er DB-lenket til full PDF; NORMO 2025 har første landtabelluttrekk i `CountryMetric`. Det som gjenstår er eventuell NORMO fulltekst/PDF-snapshot og utvidelse til aktivitet, sosial ulikhet og barnas fullstendige dietttabeller hvis scope krever det.
3. Karlstad-deklarasjonen har nå korrekt `Report`, men den gamle mismatch-ID-en bør ryddes eller merkes tydeligere i kilde-/PDF-kartet.
4. Danmark: soyaimport/fysisk sporbarhet og Biogas Danmark-outlook er nå strukturert på rapport- og metrikknivå; det som gjenstår er offisiell Energi-/Danmarks Statistik-tabell, detaljert substratfordeling og aktørkoblinger.
5. Norge: Landbruksdirektoratet matsvinn jordbruk 2024, SSB avfallshåndtering og NIBIOs bærekraftsanalyse bør hentes inn hvis vi trenger ekstern detaljering utover eksisterende runtime-serie.
6. Island: matpolitikk/handlingsplan, Matís/Umhverfisstofnun-matsvinn, Statistics Iceland food flow og Ocean Cluster-råstoffutnyttelse bør verifiseres og struktureres; 2024 per-capita matsvinn ligger nå bare som estimat.
7. Offisielle landkilder for matsvinn per verdikjedeledd utenfor Norge må fortsatt kompletteres, særlig Danmark, Finland og Island; snapshot dekker per-capita total, ikke full verdikjede.
8. Offisielle landkilder for jordbrukets klimagassutslipp bør harmoniseres videre på tvers av land, særlig metan, lystgass og organisk jord/torv.
9. Import- og fôrdata: soya, proteinfôr, akvakulturfôr og risikoråvarer må bygges videre som eget datalag før alle notatpåstandene brukes eksternt.
10. Actor/Company-dekning må kobles til rapportene: Valio, Biogas Danmark, Luke, Matís, Iceland Ocean Cluster m.fl.

### P2: Bør hentes for å gjøre analysen skarpere

1. Danmark: Concito, Klimarådet, Green Tripartite implementation, IFRO/KU soya-rapport, Biogas Danmark, One/Third.
2. Sverige: Riksrevisionen 2025, Naturvårdsverket livsmedelsavfall 2024, Jordbruksverket forbruk, Mistra Food Futures og Livsmedelsstrategin 2.0.
3. Finland: Luke food balance og matsvinn, land-use climate plan, StatFin-anleggstypeuttak for biogass og Actor/Company-kobling for Valio/Suomen Lantakaasu.
4. Island: Matís, Government of Iceland Food Policy/action plan, Statistics Iceland food flow, EEA Iceland profile, Iceland Ocean Cluster, geotermisk drivhusdata.
5. Norden: Solutions Menu 2018, Healthy and Sustainable Food Systems project outputs, Nordregio food environments/behaviour work.

### P3: Bør bli aktør- og selskapsdekning

Noen aktører bør inn som `Actor` eller kobles tydeligere til eksisterende selskaps- og rapportdata:

- Luke
- Matís
- Mistra Food Futures
- Stockholm Resilience Centre
- Nordic Food Policy Lab
- CONCITO
- Danish Council on Climate Change / Klimarådet
- Naturvårdsverket
- Jordbruksverket
- Valio
- Arla
- Danish Crown
- Biogas Danmark
- Iceland Ocean Cluster
- Kerecis
- S-Group
- Salling Group
- Matvett/NORSUS

## Relevans for oss

### Høyest strategisk verdi

Notatpakken er mest verdifull for tre ting:

1. Nordisk sammenligning: den gir en klar profil av hva hvert land er best og svakest på.
2. Sirkularitet: den flytter prosjektet fra matsvinn alene til næringsstoffer, sidestrømmer, fôr, biogass og arealbruk.
3. Policy og investering: den viser hvilke virkemidler som faktisk er i spill, fra dansk jordbruksskatt til norsk bransjeavtale og finsk biogass.

### Mest aktuelle produktflater

Dette kan brukes direkte i:

- `/sammenligning` eller tilsvarende nordisk landflate
- `/rapporter` som prioriterte rapportkort
- `/kilder` som kildepakke for nordiske matsystemer
- `/verdikjede` som bærekraftslag per ledd
- fremtidig sirkularitetsflate for sidestrømmer, biogass og næringsstoffer
- beslutningsnotater om hvor prosjektet bør hente nye data først

### Viktigste avgrensning

Notatene inneholder mange tall og påstander som er plausible, men kildene må normaliseres. En trygg arbeidsregel:

- notat = analyse/hypotese
- rapport/fagartikkel/offisiell statistikk = siterbar kilde
- strukturert tabell/API = datagrunnlag for visualisering
- lokal PDF/notat uten primærkobling = intern bakgrunn til kontroll er gjort

## Anbefalt databasearbeid

### Steg 1: Rydd datakvalitetsfeil

- Korriger `karlstad-declaration-2024`.
- Kontroller og korriger `nordic-food-alert-2025`.
- `norden-policy-2024` er harmonisert og DB-koblet til lokal PDF; neste arbeid er å bruke kilden i analysen, ikke å reparere metadata.

### Steg 2: Lag rapportpakke for nordisk bærekraft

Importer/promoter disse som `Report`:

- NNR2023
- NORMO 2025
- Policy tools for sustainable and healthy eating
- Solutions Menu
- Karlstad-deklarasjonen
- Meltzer m.fl. NNR scoping review
- Harwatt/Benton m.fl. environmental sustainability review
- Trolle/Meinilä m.fl. implementation review
- Jackson/Holm social/economic sustainability review
- Nordic food waste / matsvinnrapport

### Steg 3: Lag landindikatorer

Prioriter `CountryMetric`-indikatorer for:

- jordbrukets andel av territorielle utslipp
- jordbrukets metan og lystgass
- organisk jord/torvutslipp
- matsvinn kg/person og tonn totalt
- matsvinn per verdikjedeledd
- kjøttforbruk per capita
- rødt kjøtt per uke hvis tilgjengelig
- meieri per capita
- frukt/grønt og belgvekster per capita
- selvforsyningsgrad, med og uten fôrimport
- biogassproduksjon og råstoffmix
- soya/proteinfôrimport

### Steg 4: Lag en sirkularitetsdatapakke

Egen datapakke bør dekke:

- sidestrømstype
- land
- verdikjedeledd
- volum
- nåværende bruk
- høyere verdi-bruk
- modenhet
- primærkilde
- mulig aktør/klynge

Dette vil gjøre notatpakken operativ for analyse, ikke bare tekstlig oppsummering.

## Arbeidsregel for videre bruk

Bruk notatene som triagekart. Ikke importer påstandene direkte. For hver påstand som skal inn i database eller offentlig analyse:

1. finn primærkilden
2. legg primærkilden inn som `Report` eller `SourceDoc`
3. legg lokal fil eller snapshot i `Document`
4. trekk ut tall til `CountryMetric` når mulig
5. merk usikre tall med `needs_primary_check`
6. koble aktører til `Actor`/`Company`

## Konklusjon

Vi har nok grunnlag til å gjøre notatpakken til en sterk nordisk bærekraftsmodul, men ikke uten kildeopprydding. Den mest verdifulle neste innsatsen er ikke å skrive mer analyse, men å gjøre følgende:

- rydde de to identifiserte rapport-mismatchene
- promotere de viktigste nordiske rapportene til `Report`
- trekke ut 10-15 harmoniserte landindikatorer
- bygge en egen kildekø for sidestrømmer, biogass og næringsstoffer

Da kan prosjektet svare bedre på tre spørsmål: hva Norden faktisk har fått til, hvor de største matsystemutfordringene ligger per land, og hvilke sirkulære løsninger som bør prioriteres videre.
