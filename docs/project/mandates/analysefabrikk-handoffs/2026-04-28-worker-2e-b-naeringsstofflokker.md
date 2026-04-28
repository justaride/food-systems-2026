---
tittel: "Worker handoff - 2E B-naeringsstofflokker"
status: "Worker handoff"
worker: "2E"
dato: 2026-04-28
scope: "RecoLab/Helsingborg, NSVA, norske avlopsanlegg, svartvann, N/P/K, biorest, digestat, gjodselregelverk og overforingsverdi"
canonical_docs_redigert: false
---

# Worker handoff - 2E B-naeringsstofflokker

## 1. Scope

- Tildelt batch: B-naeringsstofflokker for Food TG analysefabrikk runde 2.
- Filer lest:
  - `docs/project/mandates/analysefabrikk-food-tg-arbeidsprosess-2026-04-28.md`
  - `docs/project/mandates/analysefabrikk-runde-2-prompts-2026-04-28.md`
  - `docs/project/mandates/track-brief-b-sidestreams-nutrients.md`
  - `docs/project/mandates/evidence-matrix-food-tg.md`
  - `docs/project/mandates/claim-register-food-tg.md`
  - `docs/project/mandates/source-shortlist-food-tg.md`
  - `research/bibliotek/forskningsrunde-2026-04-20-r2/p26-helsingborg-recolab-2026-04-20.md`
  - `research/bibliotek/forskningsrunde-2026-04-20-r2/p27-norske-avlopsanlegg-naeringsgjenvinning-2026-04-20.md`
  - `research/bibliotek/forskningsrunde-2026-04-20-r2/p24-biorest-som-gjodsel-2026-04-20.md`
  - `research/bibliotek/forskningsrunde-2026-04-20-r2/p28-kildeseparering-globalt-2026-04-20.md`
  - `research/bibliotek/forskningsrunde-2026-04-20-r2/p29-gjodselkrise-importavhengighet-2026-04-20.md`
  - `research/bibliotek/forskningsrunde-2026-04-20-r2/p46-biogass-fra-matavfall-norden-2026-04-20.md`
  - `research/bibliotek/akademia/pubmed/stoknes-k-2016-efficiency-of-a-novel-food.md`
  - `research/bibliotek/akademia/pubmed/zamanzadeh-m-2017-biogas-production-from-food-waste.md`
  - `research/bibliotek/akademia/pubmed/feng-l-2023-developing-a-biogas-centralised-circular.md`
  - `research/perplexity-20-04-26/npk-tap-svartvann-norden.md`
- Eksterne kilder sjekket for primær-/naerprimærgrunnlag: NSVA, RecoLab, EU Commission, Eawag, SSB, NIBIO, Mattilsynet, Lovdata, VEAS, HIAS, Den Magiske Fabrikken.
- Filer ikke funnet lokalt: ingen lokale primærfiler for NSVA/RecoLab massebalanse eller N/P/K inn-ut; Stoknes fulltekst-PDF finnes i `research/arkiv-sortert/.../Efficiency of a novel ... ScienceDirect.pdf`.
- Arbeidstype: source-card, primærkildejakt, tallregister, pilotgate.

## 2. Kort konklusjon

1. RecoLab/Oceanhamnen kan oppgraderes fra L4-hypotese til solid benchmarkcase for systembeskrivelse, driftsskala og relative effekter. Kildene dokumenterer tre separate strømmer, vakuumtoaletter, RecoLab som behandlingsanlegg, ca. 900 brukere i 2024, ambisjon 2 500, struvitt/ammoniumsulfat og relative effekter på biogass/P/N.
2. RecoLab gir fortsatt ikke citation-ready absolutte N/P/K-massebalanser. Tallene "3 ganger fosfor" og "7 ganger nitrogen" er relative per person mot konvensjonelt renseanlegg, ikke tonn/år. K-claimet bør være ekstra forsiktig: Eawag beskriver at KCl blandes inn i NPK-pellets, som indikerer at K i sluttproduktet ikke nødvendigvis er gjenvunnet fra svartvann.
3. RecoLab styrker CL-B-016 som nordisk referansecase, men svekker bruken som første TG-pilot dersom piloten skal være rask, lett og operativ. Dette er infrastruktur, governance, regelverk og VA-økonomi, ikke en lavterskel sidestrømspilot.
4. Norsk overføringsverdi bør ikke lete etter en "norsk RecoLab-kopi" først. Bedre benchmarkdesign er å sammenligne RecoLab med tre norske funksjonelle motstykker: VEAS for sentral N- og P-rensing/ressursutnyttelse, HIAS for Bio-P/struvitt, og Den Magiske Fabrikken/Greve-Lindum for biogjødsel/digestatmarked.
5. Gjødselregelverket er endret fra 1. februar 2025. Master bør erstatte "gjødselvareforskrift 2022" med gjeldende gjødselvareforskrift og gjødselbrukforskrift, og markere juridiske tolkninger som `needs-primary-check` inntil Mattilsynet/Landbruksdirektoratet er sjekket.
6. Perplexity-kilder bør bare brukes til kildejakt. Flere konkrete tall derfra kan erstattes med SSB, NIBIO, VEAS, HIAS, RecoLab/Eawag og Mattilsynet/Lovdata.

## 3. Source cards / triage rows

### W2E-SRC-001 - NSVA: Tre rør ut i Oceanhamnen

| Felt | Verdi |
|---|---|
| Filsti/URL | https://nsva.se/vatten-och-avlopp/ditt-avlopp/tre-ror-ut/ |
| Arkivlag | L1 |
| Spor | B-sidestream, actor, policy |
| Kildetype | primær/aktør |
| Relevansscore | 5 |
| Evidensscore | 5 |
| Siterbarhet | Høy |
| Status | citation-ready for systembeskrivelse |
| Neste handling | Bruk som primærkilde for hva systemet er; spør NSVA om oppdatert 2026 driftsskala og N/P/K massebalanse. |

Beslutningsfunn:
1. NSVA beskriver Oceanhamnen som et kildesorterende avløpssystem med tre separate ledninger: vakuumrør for toalett, rør for BDT/gråvann og rør for matavfall.
2. Formålet er mer biogass, næringsgjenvinning og energieffektiv rensing av legemiddelrester.
3. Kilden sier ikke nok om absolutte N/P/K-tonn, produktkjøpere eller norsk overførbarhet.

### W2E-SRC-002 - RecoLab: Utvecklingsanläggning og FAQ

| Felt | Verdi |
|---|---|
| Filsti/URL | https://www.recolab.se/utvecklingsanlaggning/ og https://www.recolab.se/vanliga-fragor/ |
| Arkivlag | L1 |
| Spor | B-sidestream, actor |
| Kildetype | primær/aktør |
| Relevansscore | 5 |
| Evidensscore | 5 |
| Siterbarhet | Høy |
| Status | citation-ready for prosess og produkter; source-card for kost |
| Neste handling | Bruk til prosessbeskrivelse; valider kost, produktstatus og 2026 skala med aktør. |

Beslutningsfunn:
1. RecoLab oppgir at utviklingsanlegget er dimensjonert for 2 000 pe og håndterer svartvann, gråvann og matavfall fra Oceanhamnen.
2. Prosessen omfatter anaerob behandling, struvittekstraksjon, ammoniakkstripping og ammoniumsulfat.
3. FAQ oppgir at systemet gir tre ganger mer fosfor og syv ganger mer nitrogen til rene fraksjoner, ca. 60 prosent mer biogass, ca. 50 prosent gråvannsgjenvinning og 25-50 kg CO2/person/år lavere klimapåvirkning. Dette er relative/indikative tall, ikke massebalanse.
4. FAQ oppgir byggekost for RecoLab: 83 mill. SEK for bygg/skall og 60 mill. SEK for utstyr.

### W2E-SRC-003 - Eawag Lighthouse Synthesis Report: Tre-Rör-Ut in Helsingborg, Sweden

| Felt | Verdi |
|---|---|
| Filsti/URL | https://www.eawag.ch/fileadmin/Domain1/Abteilungen/sandec/schwerpunkte/sesp/Lighthouse/helsingborg_synthesis_report.pdf |
| Arkivlag | L2 |
| Spor | B-sidestream, actor, policy |
| Kildetype | solid sekundær/fagsyntese |
| Relevansscore | 5 |
| Evidensscore | 5 |
| Siterbarhet | Høy |
| Status | citation-ready |
| Neste handling | Bruk som hovedkilde for driftsskala, governance, kost og begrensninger. |

Beslutningsfunn:
1. Rapporten oppgir at Tre-Rör-Ut har vært operativt siden februar 2020 og i 2024 betjente ca. 900 personer, med mål om 2 500, 340 leiligheter og 32 000 m2 kontor.
2. Rapporten sier at kalibrering/finjustering av biogass- og næringsgjenvinningskomponentene ikke var ferdig, men at vakuum- og gråvannssystemene var i full drift og uten rapporterte større hendelser eller brukerakseptproblemer.
3. Rapporten beskriver produkter: biogass som kjøretøygass, struvitt som fosfatgjødsel, ammoniumsulfat som nitrogengjødsel, avvannet slam til landbruk, og NPK-pellets der KCl blandes inn.
4. Rapporten oppgir governance-barrierer: ansvarsdeling, tilkoblingspunkter, tariffer, marked/supplier base, og at kommunen kunne pålegge nybygg å koble seg til via tomtekontrakter.
5. 2017-analyse anslo merkostnad rundt 940 SEK per capita/år sammenlignet med konvensjonelt sentralt system, men detaljerte totalkostnader var ikke tilgjengelige.

### W2E-SRC-004 - EU Commission: Helsingborg 3 Pipe Wastewater System / Green City Accord

| Felt | Verdi |
|---|---|
| Filsti/URL | https://environment.ec.europa.eu/topics/urban-environment/european-green-capital-award/inspiration/helsingborg-3-pipe-wastewater-system_en og https://environment.ec.europa.eu/topics/urban-environment/green-city-accord/green-city-accord-good-practices/helsingborg-recolab_en |
| Arkivlag | L1/L2 |
| Spor | B-sidestream, policy |
| Kildetype | EU-offentlig casebeskrivelse |
| Relevansscore | 4 |
| Evidensscore | 4 |
| Siterbarhet | Høy |
| Status | citation-ready for relative performance |
| Neste handling | Bruk som supplerende kilde, ikke alene for N/P/K. |

Beslutningsfunn:
1. EU-kilden oppgir 60-70 prosent mer biogass per person per år enn konvensjonelt renseanlegg.
2. Samme kilde oppgir 3 ganger mer fosfor og 7 ganger mer nitrogen per person per år enn normalt renseanlegg.
3. Den dokumenterer ikke absolutt N/P/K-massebalanse eller dagens produktmarked.

### W2E-SRC-005 - NSVA: återvunna pellets fra matavfall og toalettvann

| Felt | Verdi |
|---|---|
| Filsti/URL | https://www.mynewsdesk.com/se/nsva/pressreleases/aer-aatervunna-pellets-fraan-matavfall-och-toalettvatten-framtidens-melodi-3285556 |
| Arkivlag | L1 |
| Spor | B-sidestream, actor |
| Kildetype | primær/aktørpressemelding |
| Relevansscore | 4 |
| Evidensscore | 3 |
| Siterbarhet | Medium |
| Status | source-card; needs-actor-validation for resultater |
| Neste handling | Bruk til produkt-/feltforsøksspor, men be om rapporten "Kretslopp från stad till land". |

Beslutningsfunn:
1. NSVA oppgir at produkter fra Tre rör ut kan bli odlingspellets og er testet i felt over tre dyrkingssesonger.
2. Når Oceanhamnen er fullt utbygd og prosessene justert, kan råvarer for gjødselproduksjon produseres som struvitt, ammoniumsulfat og biogjødsel.
3. Pressemelding er ikke tilstrekkelig for agronomisk effekt eller markedsaksept.

### W2E-SRC-006 - SSB: Kommunalt avløp 2024 / avløpsslam til landbruket

| Felt | Verdi |
|---|---|
| Filsti/URL | https://www.ssb.no/natur-og-miljo/vann-og-avlop/statistikk/utslipp-og-rensing-av-kommunalt-avlop og https://www.ssb.no/natur-og-miljo/vann-og-avlop/statistikk/utslipp-og-rensing-av-kommunalt-avlop/artikler/63-000-tonn-avlopsslam-til-landbruket |
| Arkivlag | L1 |
| Spor | B-sidestream, baseline |
| Kildetype | primær/statistikk |
| Relevansscore | 5 |
| Evidensscore | 5 |
| Siterbarhet | Høy |
| Status | citation-ready |
| Neste handling | Bruk for norsk baseline; hent Statistikkbanken-tabeller hvis anleggsspesifikke tall trengs. |

Beslutningsfunn:
1. 2024: 138 073 tonn tørrstoff kommunalt avløpsslam disponert totalt.
2. SSB-artikkel: 63 000 tonn TS, eller 46 prosent, gikk til landbruket; 7 prosent til grøntareal og 24 prosent til jordprodusenter.
3. I tillegg gikk 39 000 tonn TS kommunalt avløpsslam til biogassformål.
4. Dette er norsk slam-/avløpsbaseline, ikke svartvannskildeseparasjon.

### W2E-SRC-007 - NIBIO: Avløpsslam

| Felt | Verdi |
|---|---|
| Filsti/URL | https://www.nibio.no/tema/jord/organisk-avfall-som-gjodsel/avlopsslam |
| Arkivlag | L1/L2 |
| Spor | B-sidestream, baseline, policy |
| Kildetype | fag-/instituttkilde |
| Relevansscore | 5 |
| Evidensscore | 5 |
| Siterbarhet | Høy |
| Status | citation-ready |
| Neste handling | Bruk for norsk N/P/K i slam og forbehold om P-plantetilgjengelighet. |

Beslutningsfunn:
1. NIBIO oppgir at 50-60 prosent av norsk avløpsslam tilføres jordbruksarealer, med store regionale forskjeller.
2. Typisk næringsinnhold i avløpsslam er 20-40 kg total-N, 7-35 kg total-P og 1-3 kg K per tonn tørrstoff.
3. NIBIO oppgir at ca. 2 000 tonn P renses fra norsk avløp hvert år og havner i slammet, mot 8 000-9 000 tonn P i årlig norsk mineralgjødselforbruk.
4. NIBIO advarer om lav plantetilgjengelighet for P i norsk avløpsslam, særlig ved jern-/aluminiumsfelling.

### W2E-SRC-008 - Mattilsynet/Lovdata: gjødselvareforskrift og gjødselbrukforskrift 2025

| Felt | Verdi |
|---|---|
| Filsti/URL | https://www.mattilsynet.no/planter-og-dyrking/gjodsel-jord-og-dyrkingsmedier/veileder-til-gjodselvareforskriften?noJS=true, https://lovdata.no/dokument/SF/forskrift/2025-01-29-116, https://lovdata.no/dokument/SF/forskrift/2025-01-29-115 |
| Arkivlag | L1 |
| Spor | B-sidestream, policy |
| Kildetype | primær/rettskilde og veileder |
| Relevansscore | 5 |
| Evidensscore | 5 |
| Siterbarhet | Høy for rettstekst; Medium for tolkning |
| Status | citation-ready for regelstatus; needs-primary-check for juridisk tolkning |
| Neste handling | Juridisk sjekk før master formulerer "lovlig/ulovlig" sluttbruk. |

Beslutningsfunn:
1. Mattilsynets veileder sier at gjødselvareforskriften og gjødselbrukforskriften erstattet tidligere forskrift fra 1. februar 2025.
2. Gjødselvareforskriften omfatter produksjon, omsetning/import og råvarer/gjødselvarer; gjødselbrukforskriften regulerer lagring og bruk.
3. Ferdig gjødselvare skal ha samlet glass/metall/plast over 2 mm lavere enn 5 g/kg TS; fra 1. januar 2026 skal plast være lavere enn 2,5 g/kg TS.
4. Gjødselbrukforskriften har særlige krav for avløpsslam: uhygienisert slam er ikke tillatt; avløpsslam kan ikke brukes på eng, gartneri eller areal for grønnsaker, poteter, bær/frukt; karenstider og P-grenser gjelder.
5. Mattilsynet oppgir at gjødselbrukregelverket håndheves av flere myndigheter, med kommunen som primær tilsynsmyndighet og Mattilsynet for matlovshjemlede bestemmelser.

### W2E-SRC-009 - VEAS: bærekraftrapport/årsrapport 2024

| Felt | Verdi |
|---|---|
| Filsti/URL | https://veas.nu/uploads/2025/04/Veas-Baerekraftrapport-2024.pdf og https://veas.nu/arsrapporter/arsrapport-2024/ |
| Arkivlag | L1 |
| Spor | B-sidestream, actor, baseline |
| Kildetype | primær/aktør |
| Relevansscore | 5 |
| Evidensscore | 5 |
| Siterbarhet | Høy |
| Status | citation-ready for VEAS 2024; needs-actor-validation for fremtidige planer |
| Neste handling | Bruk som norsk sentralanlegg-benchmark mot RecoLab. |

Beslutningsfunn:
1. VEAS behandlet 101,5 mill. m3 avløpsvann i 2024.
2. Rensegrad 2024: 79,0 prosent N inkl. overløp og 92,0 prosent P inkl. overløp.
3. VEAS produserte 45 005 tonn Veas-jord, stabilisert/hygienisert/avvannet biorest, og nær all biorest ble omsatt i landbruket.
4. VEAS produserte 5 121 tonn ammoniumsulfatløsning i 2024, med konsentrasjon 36-40 prosent, solgt som gjødsel eller råstoff til gjødselproduksjon/andre renseprosesser.
5. VEAS produserte 10,6 mill. Nm3 biogass, tilsvarende 61,95 GWh; 92 prosent ble oppgradert til LBG.

### W2E-SRC-010 - HIAS: Bio-P og struvitt

| Felt | Verdi |
|---|---|
| Filsti/URL | https://www.hias.no/avlop/renseanlegg/renseprosessen/biologisk-rensetrinn, https://www.hias.no/avlop/struvitt/, https://www.hias.as/post/hias-starter-gj%C3%B8dselproduksjon-med-fosfor-fra-avl%C3%B8psvannet |
| Arkivlag | L1 |
| Spor | B-sidestream, actor |
| Kildetype | primær/aktør |
| Relevansscore | 5 |
| Evidensscore | 4 |
| Siterbarhet | Høy for produktdata; Medium for fremtidige estimater |
| Status | source-card; citation-ready for varedeklarasjon |
| Neste handling | Prioriter HIAS som norsk P-gjenvinningsbenchmark. |

Beslutningsfunn:
1. HIAS beskriver patentert biologisk renseprosess med bakterier på plastbrikker for fosforfjerning og videre slam-/struvittlinje.
2. HIAS oppgir at Hias Struvitt er registrert hos Mattilsynet nr. 083386, varetype mineralgjødsel, bruksområde PK-gjødsel.
3. Varedeklarasjonen oppgir TS 97,7 prosent, ammonium-N 54,7 g/kg TS, P 134 g/kg TS og K 0,38 g/kg TS.
4. Aktørkilde fra 2023 sier at rundt halvparten av fosforet fra avløpsvannet skal bli struvitt og at total fosforgjenvinning estimeres til rundt 95 prosent. Dette bør valideres med HIAS for faktisk 2024/2025 drift før claim-bruk.

### W2E-SRC-011 - Den Magiske Fabrikken: biogjødsel og biogass 2024

| Felt | Verdi |
|---|---|
| Filsti/URL | https://dmfas.no/assets/dokumenter/dmf_arsrapport2024_nett_oppslag.pdf og https://dmfas.no/assets/produktdatablad/24.07-produktblad-biogjodsel.pdf |
| Arkivlag | L1 |
| Spor | B-sidestream, actor |
| Kildetype | primær/aktør |
| Relevansscore | 4 |
| Evidensscore | 4 |
| Siterbarhet | Høy for aktørdata |
| Status | source-card |
| Neste handling | Bruk som norsk digestat-/biogjødselmarked, ikke som svartvanncase. |

Beslutningsfunn:
1. DMF årsrapport 2024 oppgir 69 000 tonn matavfall, 73 000 tonn husdyrgjødsel, 47 000 tonn substrat/flytende industriavfall, 182 000 tonn biogjødsel til landbruket og 110 GWh biogass.
2. Produktdatablad juli 2024 oppgir råvaremiks ca. 50 prosent matavfall og 50 prosent husdyrgjødsel; biogassubstratet hygieniseres ved minimum 70 grader C i 1 time.
3. Produktdatabladet oppgir N-tot 4,09 kg/m3, NH4-N 3,08 kg/m3, P-Al 0,52 kg/m3, K-Al 0,21 kg/m3, TS 4,2 prosent og kvalitetsklasse I.
4. Dette er sterk norsk biorest-/digestatbenchmark, men ikke direkte overførbart til avløpsslam eller svartvann uten regelverks- og råvaredifferensiering.

### SRC-B-008 - Stoknes et al. 2016: Food-to-waste-to-food

| Felt | Verdi |
|---|---|
| Filsti | `research/bibliotek/akademia/pubmed/stoknes-k-2016-efficiency-of-a-novel-food.md`; fulltekst-PDF i `research/arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/...ScienceDirect.pdf` |
| Arkivlag | L2/L3 |
| Spor | B-sidestream |
| Kildetype | fagfellevurdert primærstudie |
| Relevansscore | 4 |
| Evidensscore | 4 |
| Siterbarhet | Høy for konseptbevis |
| Status | source-card |
| Neste handling | Bruk kun som proof-of-concept for digestat->dyrking, ikke som storskala drift eller regelverksbevis. |

Beslutningsfunn:
1. Demonstrerer norsk/urban pilot der matavfall blir biogass og digestat, og digestat brukes som gjødsel og hovedsubstrat i drivhus.
2. Rapportert 80 prosent lavere energibehov enn konvensjonelle drivhus og kommersielle avlinger basert på digestat.
3. Ikke relevant som RecoLab-/svartvannbevis, og for gammelt/casebasert til å bære TG-pilot alene.

### SRC-B-009 - Zamanzadeh et al. 2017: biogass fra matavfall og husdyrgjødsel

| Felt | Verdi |
|---|---|
| Filsti | `research/bibliotek/akademia/pubmed/zamanzadeh-m-2017-biogas-production-from-food-waste.md`; PDF `research/evidence-pack/akademia/pubmed/zamanzadeh-m-2017-biogas-production-from-food-waste.pdf` |
| Arkivlag | L2 |
| Spor | B-sidestream |
| Kildetype | fagfellevurdert primærstudie |
| Relevansscore | 4 |
| Evidensscore | 4 |
| Siterbarhet | Høy |
| Status | citation-ready for prosessfunn |
| Neste handling | Bruk som biogassprosesskilde, ikke som N/P/K-gjenvinnings- eller regelverkskilde. |

Beslutningsfunn:
1. Mesofil matavfallsdigester ga høyest metanutbytte, ca. 480 ml CH4/g VS.
2. Mesofil samråtning av matavfall og kugjødsel ga 26 prosent mer metan enn summen av de separate mono-utråtningene.
3. Studien støtter at prosessdesign og råvaremiks betyr mye, men sier lite om sluttbruk av digestat og gjødselmarked.

### SRC-B-010 - Feng et al. 2023: biogass-sentrert sirkulær bioøkonomi

| Felt | Verdi |
|---|---|
| Filsti | `research/bibliotek/akademia/pubmed/feng-l-2023-developing-a-biogas-centralised-circular.md` |
| Arkivlag | L3 |
| Spor | B-sidestream, policy |
| Kildetype | review, metadata_only lokalt |
| Relevansscore | 3 |
| Evidensscore | 3 |
| Siterbarhet | Medium |
| Status | needs-primary-check |
| Neste handling | Les fulltekst før ekstern bruk; kan foreløpig bare støtte systemramme internt. |

## 4. Tallregister

Bare tall med tydelig definisjon og kilde er tatt med. Perplexity-estimater for samlet svartvann N/P/K i Norge/Norden er ikke tatt inn som evidens.

| Tall | Definisjon | Kilde | Status | Bruk |
|---|---|---|---|---|
| ca. 900 personer; ultimate 2 500; 340 leiligheter; 32 000 m2 kontor | RecoLab/Tre-Rör-Ut driftsskala og planlagt skala i Eawag-rapport 2024 | W2E-SRC-003 | citation-ready | Bruk for å korrigere "2 500 boliger" til "ca. 900 personer i drift, mål 2 500 personer" inntil NSVA bekrefter 2026-status. |
| 2 000 pe | RecoLab utviklingsanlegg dimensjonert kapasitet | W2E-SRC-002 | citation-ready | Bruk som teknisk dimensjoneringsnivå, ikke faktisk tilkobling. |
| 60-70 prosent mer biogass per person; 3x P; 7x N | Relative effekter per person sammenlignet med konvensjonelt renseanlegg | W2E-SRC-004, W2E-SRC-002 | citation-ready, men relativt | Bruk som benchmarkeffekt med eksplisitt "per person" og "relativt". Ikke oversett til tonn. |
| RecoLab bygg 83 mill. SEK og utstyr 60 mill. SEK | Bygg/skall og utstyrskost ifølge RecoLab FAQ | W2E-SRC-002 | source-card | Bruk som kostindikasjon, må valideres før beslutningsnotat. |
| ca. 940 SEK per capita/år merkostnad | 2017-estimat for moderat kostnadsøkning sammenlignet med konvensjonelt sentralt system | W2E-SRC-003 | citation-ready med forbehold | Bruk i pilotgate som kost-/governancebarriere. |
| 20-40 kg total-N, 7-35 kg total-P, 1-3 kg K per tonn TS | Typisk næringsinnhold i norsk avløpsslam | W2E-SRC-007 | citation-ready | Norsk slambenchmark. Ikke svartvann. |
| ca. 2 000 tonn P/år | Fosfor renset fra norsk avløp årlig og havner i avløpsslam | W2E-SRC-007 | citation-ready | Nasjonal P-ressurs i avløpsslam. |
| 8 000-9 000 tonn P/år | Årlig norsk forbruk av P i mineralgjødsel | W2E-SRC-007 | citation-ready | Sammenligning, ikke substitusjonsclaim uten plantetilgjengelighetsforbehold. |
| 138 073 tonn TS slam disponert totalt i 2024 | Mengde kommunalt avløpsslam disponert totalt | W2E-SRC-006 | citation-ready | Norsk baseline. |
| 63 000 tonn TS / 46 prosent til landbruk i 2024 | Kommunalt avløpsslam til landbruk | W2E-SRC-006 | citation-ready | Norsk baseline for eksisterende landbruksspredning. |
| 7 prosent til grøntareal; 24 prosent til jordprodusenter | Disponering av kommunalt avløpsslam i 2024 | W2E-SRC-006 | citation-ready | Baseline for destinasjon. |
| 39 000 tonn TS til biogassformål | Kommunalt avløpsslam brukt til biogassformål i 2024 | W2E-SRC-006 | citation-ready | Baseline, men sjekk overlapp/definisjon før summering. |
| 79,0 prosent N-rensegrad og 92,0 prosent P-rensegrad | VEAS 2024, inkl. overløp | W2E-SRC-009 | citation-ready | Norsk sentralanleggbenchmark. Dette er rensing/fjerning, ikke nødvendigvis gjenvinning. |
| 45 005 tonn Veas-jord | Stabiliseret/hygienisert/avvannet VEAS-biorest produsert i 2024 | W2E-SRC-009 | citation-ready | Norsk biorest/slamproduktbenchmark. |
| 5 121 tonn ammoniumsulfatløsning, 36-40 prosent | VEAS 2024 produktmengde og konsentrasjon | W2E-SRC-009 | citation-ready for produktmasse | Ikke omregn til N uten varedeklarasjon/kjemisk definisjon fra VEAS. |
| 10,6 mill. Nm3 biogass / 61,95 GWh | VEAS 2024 biogassproduksjon | W2E-SRC-009 | citation-ready | Energibenchmark, ikke nutrient benchmark. |
| HIAS Struvitt: TS 97,7%; NH4-N 54,7 g/kg TS; P 134 g/kg TS; K 0,38 g/kg TS | Varedeklarasjon for Hias Struvitt | W2E-SRC-010 | citation-ready | Norsk struvittproduktbenchmark. |
| ca. 95 prosent total P-gjenvinning (estimert) | HIAS aktøruttalelse 2023 om forventet total fosforgjenvinning | W2E-SRC-010 | needs-actor-validation | Må bekreftes som faktisk driftstall før claim. |
| DMF 2024: 69 000 tonn matavfall; 73 000 tonn husdyrgjødsel; 182 000 tonn biogjødsel; 110 GWh biogass | Den Magiske Fabrikken årsrapport 2024 | W2E-SRC-011 | citation-ready for aktørdata | Relevant for digestat/biogjødsel, ikke avløp/svartvann. |

## 5. Benchmark-/pilotgate for CL-B-016 og CL-B-023

### CL-B-016 - RecoLab/Helsingborg som nordisk referansecase

Anbefalt effekt: `styrker` + `nyanserer`.

Kan integreres nå:
1. RecoLab er et solid nordisk referansecase for kildesortert avløp i ny bydel: svartvann, gråvann og matavfall holdes atskilt og behandles ved RecoLab.
2. Caseverdien er sterkere enn claim-registeret antyder fordi tilkoblingsstatus, systemarkitektur, prosess, produkter og governance nå har bedre kilder enn L4-notatet.

Må fortsatt stå som gate:
1. Faktisk 2026 tilkoblingsgrad: Eawag 2024 sier ca. 900 personer, ultimate 2 500. RecoLab-siden sier 2 000 pe dimensjonert. NSVA må bekrefte dagens antall pe/boliger/kontor.
2. N/P/K-massebalanse: relativt 3x P og 7x N kan brukes, men ikke tonn/år eller prosentgjenvinning uten NSVA/Ekobalans/Run4Life-rapport.
3. Sluttprodukt: struvitt og ammoniumsulfat er dokumentert; NPK-pellets blander inn KCl, så K må ikke presenteres som gjenvunnet uten massebalanse.
4. Juridisk status: svensk sertifisering/End-of-waste passer ikke automatisk i Norge. Må kobles til Mattilsynet/Lovdata.
5. Overføring: nybygg/områdeutvikling er enklere enn retrofit. Governance, eierskap og tariffer var en eksplisitt utfordring i Eawag-rapporten.

### CL-B-023 - RecoLab + norsk avløpsanlegg som pilot

Anbefalt effekt: `styrker` som benchmark-/sekundærpilot, `svekker` som første fysiske TG-pilot.

Pilotgate:
1. Første steg bør være en sammenlignende benchmark, ikke infrastrukturpilot: RecoLab vs. VEAS vs. HIAS vs. Den Magiske Fabrikken.
2. Minimumsdata før TG kan velge pilot: N/P/K inn, N/P/K i produkt, produktklassifisering, jordbruksbruk, marked/kjøper, kost/OPEX, kontaminanter, tillatelser og aktørenes driftsansvar.
3. Norsk pilot bør trolig være "data- og aktørvalidering av næringsstoffløkker" eller "produkt-/regelverksgate for gjenvunnet N/P" heller enn ny svartvanninfrastruktur.
4. No-go for første TG-pilot hvis målet er rask aktivering: manglende N/P/K-massebalanse, usikker produktlovlighet, uavklart mottakermarked eller behov for ny VA-infrastruktur.

## 6. Claim-effekt

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-B-016 | styrker + nyanserer | RecoLab har nå solide primær-/sekundærkilder for system, produkter, driftsskala og relativ N/P-effekt. Men absolutte N/P/K-strømmer, produktmarked og juridisk status mangler fortsatt. |
| CL-B-023 | styrker benchmark, svekker første pilot | RecoLab + norsk anlegg er egnet som sammenlignende benchmark. Som første TG-pilot er det tungt, infrastrukturelt og regulatorisk krevende. |
| CL-B-011 | styrker | Stoknes 2016 dokumenterer food-to-waste-to-food med digestat og ny matproduksjon som konseptbevis, men ikke storskala systemløsning. |
| CL-B-013 | nyanserer | Zamanzadeh og VEAS/DMF viser at biogass kan koble energi og næring, men prosess/råvaremiks og sluttprodukt er avgjørende. |
| CL-C-015 | styrker forbehold | SSB/NIBIO/VEAS/HIAS viser at data finnes, men ikke i ett enkelt KPI-format for svartvann. KPI-er må avgrenses etter strøm og produkt. |

## 7. Uttrekk

| Type | Uttrekk | Bruk |
|---|---|---|
| Case | RecoLab/Tre rör ut: svartvann, gråvann og matavfall i tre separate rør til eget utviklingsanlegg. | CL-B-016 benchmark. |
| Tall | Eawag 2024: ca. 900 personer i drift; ultimate 2 500; 340 leiligheter; 32 000 m2 kontor. | Korriger 2 500-boliger-claim. |
| Tall | EU/Recolab: 60-70 prosent mer biogass, 3x P, 7x N per person vs. konvensjonelt renseanlegg. | Kun relativt benchmark, ikke massebalanse. |
| Tall | NIBIO: 20-40 kg N, 7-35 kg P, 1-3 kg K per tonn TS i avløpsslam. | Norsk slambenchmark. |
| Tall | SSB 2024: 138 073 tonn TS slam disponert; 63 000 tonn TS til landbruk. | Norsk baseline. |
| Tall | VEAS 2024: 79% N-rensing, 92% P-rensing; 45 005 tonn Veas-jord; 5 121 tonn ammoniumsulfatløsning. | Norsk sentralanleggbenchmark. |
| Tall | HIAS Struvitt: P 134 g/kg TS, NH4-N 54,7 g/kg TS, K 0,38 g/kg TS. | Norsk struvittproduktbenchmark. |
| Regulering | Ny gjødselvareforskrift og gjødselbrukforskrift fra 1. februar 2025. | Oppdater canonical regulatorikk. |
| Regulering | Gjødselbrukforskriften har særkrav for avløpsslam: hygienisering, arealbegrensning, karenstid, P-grense og meldeplikt. | Pilotgate for avløpsbaserte produkter. |

## 8. Norske aktører/anlegg som bør valideres

1. VEAS: faktisk N/P/K inn-ut, ammoniumsulfat-varedeklarasjon, Veas-jord næringsinnhold, marked/mottakere, planer for ny slambehandling og regionalt ressursanlegg.
2. HIAS IKS / Hias How2O: faktisk struvittvolum 2024/2025, total P-gjenvinning, driftserfaring, produktmarked og overføringsverdi til andre norske avløpsanlegg.
3. Den Magiske Fabrikken / Greve Biogass / Lindum: biogjødselkvalitet, mottakermarked, plast/fremmedlegemer, logistikk og bondeaksept. Relevant for digestat, ikke svartvann.
4. Oslo kommune EGE / Romerike biogassanlegg: matavfall->biogass/biorest, plastposeproblematikk, kvalitet og avsetning.
5. FREVAR, IVAR, Bergen Vann, Trondheim kommune/Høvringen, Mjøsanlegget: faktisk slam-/bioresthåndtering, N/P/K-data, om de har P-gjenvinningsløp eller bare slam til jord/jordprodusent.
6. Mattilsynet, Landbruksdirektoratet, Miljødirektoratet/Statsforvalter: lovlig sluttbruk, produktklassifisering, avløpsslam/biorest, hygienisering, fremmedlegemer, PFAS/miljøgifter og melde-/dispensasjonsløp.
7. NIBIO/NMBU/NORSØK/Norsk Vann/Biogass Norge: faglig kvalitetssikring av N/P/K, plantetilgjengelighet, agronomisk verdi og standardiserte KPI-er.
8. Grønn Vekst og landbruksrådgiving/NLR: praktisk avsetning, spredning, bondeaksept, jordtype/P-AL-barrierer og betalingsmodell.

## 9. Hva er for tungt/uklart til første TG-pilot

1. Å bygge eller kopiere RecoLab-infrastruktur i Norge. Dette krever nybygg/områdeutvikling, VA-eierskap, tariffer, ansvarsdeling og teknologileverandører.
2. Absolutte svartvann N/P/K-potensialer for Norge/Norden. Det finnes gode hypoteser, men de må bygges fra primærdata og massebalanser, ikke Perplexity.
3. K-gjenvinning. RecoLab-kilder dokumenterer P og N bedre enn K; KCl-tilsetning i pellets er et rødt flagg mot å påstå K-gjenvinning.
4. Juridisk eksport/import av svensk RecoLab-gjødselstatus til norsk kontekst. Regelverk og produktkategorier må sjekkes direkte.
5. Bruk av avløpsslam/biorest på matjord uten kontekst. Avløpsslam har særskilte arealbegrensninger, karenstider og P-grenser; plantetilgjengelighet for P er lav/varierende.
6. Produktmarked og bondeaksept for nye gjenvunne næringsprodukter. Dette avgjøres av kvalitet, lukt, logistikk, pris, deklarasjon, P-AL-status i jord og tillit.
7. KPI-er for "næringsstoffløkker" på tvers av svartvann, slam, biorest, matavfall og husdyrgjødsel. Første pilot bør avgrense én strøm og ett produkt.

## 10. Nye kandidater til masterkø

| Kilde | Hvorfor |
|---|---|
| Eawag `helsingborg_synthesis_report.pdf` | Beste enkeltkilde for RecoLab driftsskala, governance, kost og begrensninger. |
| NSVA `Tre rör ut` | Primærkilde for systembeskrivelse. |
| RecoLab `Utvecklingsanläggning` + `Vanliga frågor` | Primærkilde for prosess, produkter, dimensjonering og relative effekter. |
| EU Commission `Helsingborg 3 Pipe Wastewater System` | Offentlig kilde for 60-70% biogass, 3x P, 7x N. |
| SSB `Kommunalt avløp` 2024 | Norsk baseline for avløpsslam, utslipp/rensing og slamdisponering. |
| NIBIO `Avløpsslam` | Norsk fagkilde for N/P/K i slam og plantetilgjengelighet. |
| Mattilsynet veileder + Lovdata FOR-2025-01-29-116/115 | Gjeldende rettskildegrunnlag for gjødselprodukt og bruk. |
| VEAS Bærekraftrapport 2024 | Norsk sentralanleggbenchmark med N/P-rensing, biorest, ammoniumsulfat og biogass. |
| HIAS struvitt/Bio-P sider | Norsk P-gjenvinningscase med produktdeklarasjon. |
| DMF Årsrapport 2024 og produktdatablad biogjødsel | Norsk digestat-/biogjødselcase for biorestmarked og landbruk. |

