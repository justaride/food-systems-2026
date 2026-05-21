---
tittel: Food TG Source Shortlist v0.1
status: Utført internt
eier: Gabriel
sist_oppdatert: 2026-04-28
neste_handling: Brukes som inntak til evidence-matrix-food-tg.md (Phase 2)
relaterte_filer:
  - research/KI-PRIORITY.md
  - research/PLATTFORM-KOBLING.md
  - research/DATA-READINESS-SLUTTRAPPORT.md
  - docs/project/mandates/research-dossiers/baerekraftsutfordringer-input-2026-04-28/
endringslogg:
  - 2026-04-28 (kveld) Lagt til 8 kilder fra nordisk bærekraftsanalyse-runde — A-018/A-019 (NIBIO bærekraft, IFRO/KU soya), B-032 (Matvett+NORSUS faktaark 2024), C-027/C-028 (Riksrevisionen, Concito), BASE-006 til BASE-009 (NIBIO selvforsyning, EEA Country Profiles, Luke balance sheet, og research-dossiers-arkiv).
---

# Food TG Source Shortlist v0.1

Kortliste over 30-50 kilder som skal bære Insight Pack v0.1. Filtrert ned fra forskningskorpuset til kilder som kan siteres, brukes som beslutningsgrunnlag eller peke til manuell verifikasjon.

## Kildekontroll 2026-04-27

Phase 1.1-script ble kjørt før shortlisting:

- `npm run compute-ki-priority`: 186 enheter prioritert (108 reports + 78 theses).
- `npm run inventory-urls`: 184 URL-forekomster, 173 unike URL-er.
- `npm run check-pdf-quality`: 399 PDF-er sjekket; 349 ok, 44 low-text, 5 scanned, 1 oversized.
- `npm run build-remediation-backlog`: 345 funn, hvorav 31 høy, 125 medium og 189 lav.
- `npm run compute-file-coverage`: 270 file-coverage-funn; 118 medium missing SourceDoc og 152 lav.

## Sportagger

- `A-feed` — sirkulært fôr, importavhengighet, alternative proteiner
- `B-sidestream` — sidestrømmer, matsvinn, næringsstoffløkker, svartvann
- `C-adoption` — policy, innkjøp, marked, standarder, datakrav
- `baseline` — verdikjede, systemkart, importtall, beredskap
- `actor` — aktørkartlegging og selskapsdossiers
- `finance` — funding, finansieringsordninger
- `policy` — regulatorikk, EU/nordisk lovverk

## Kvalitetstagger

- `primær` — primærkilde (rapport, datasett, fagpublikasjon)
- `sekundær` — solid sekundærkilde (review, fagartikkel, OECD-rapport)
- `intern syntese` — egen analyse i repoet
- `uvalidert` — researchnotat eller indikasjon, må ikke siteres

## Kilder per spor

### Spor A — Sirkulært fôr og importavhengighet

| ID | Filsti / referanse | Kvalitetstag | Sportag(er) | Notat |
|---|---|---|---|---|
| SRC-A-001 | research/bibliotek/akademia/nmbu/foods-of-norway-novel-feed-2024.md | primær | A-feed, baseline | NMBU/Foods of Norway-studie om mikrobielt protein som erstatning for soyaprotein i laksefôr. |
| SRC-A-002 | research/bibliotek/akademia/internasjonalt/nordic-protein-shift-research-2024.md | sekundær | A-feed, finance | GFI Europe-kartlegging av nordisk alternativ-protein-forskning og finansiering. |
| SRC-A-003 | research/bibliotek/akademia/pubmed/van-der-fels-klerx-hj-2024-framework-for-evaluation-of-food.md | sekundær | A-feed, B-sidestream, policy | Fagfellevurdert mattrygghetsrammeverk for sirkulære matsystemer, inkludert sidestrømmer til insektoppdrett. |
| SRC-A-004 | research/bibliotek/akademia/pubmed/van-leeuwen-spj-2024-a-novel-approach-to-identify.md | sekundær | A-feed, B-sidestream, policy | Fagfellevurdert ramme for kunnskapshull ved swill/tidligere matvarer til fôr og avløpsbaserte ressurser. |
| SRC-A-005 | research/evidence-pack/forskningsinstitutt/hi-risikorapport-fiskeoppdrett-2025.md | primær | A-feed, baseline | Havforskningsinstituttet-kilde for miljø- og risikokontekst i norsk oppdrett. |
| SRC-A-006 | research/norden/verdikjede/04-innsatsvarer.md | intern syntese | A-feed, baseline | Nordisk innsatsvareanalyse med fôr, soya/proteinavhengighet, gjødsel og kritiske importpunkter. |
| SRC-A-007 | research/bibliotek/forskningsrunde-2026-04-20-r2/p09-soyaimport-norden-2026-04-20.md | uvalidert | A-feed, baseline | Arbeidsnotat om soyaimportvolum, opprinnelse, sluttbruk og avskogsrisiko; tall må primærkildesjekkes. |
| SRC-A-008 | research/bibliotek/forskningsrunde-2026-04-20-r2/p12-fiskemel-verdikjede-global-2026-04-20.md | uvalidert | A-feed, baseline | Arbeidsnotat om global fiskemelverdikjede, nordisk import og etiske risikopunkter. |
| SRC-A-009 | research/bibliotek/forskningsrunde-2026-04-20-r2/p10-eu-tse-novel-food-regulering-2026-04-20.md | uvalidert | A-feed, policy | Arbeidsnotat om EU TSE, insektfôr, kategori 3-materiale og regulatoriske flaskehalser. |
| SRC-A-010 | research/bibliotek/forskningsrunde-2026-04-20-r2/p13-ax-framtidens-foder-2026-04-20.md | uvalidert | A-feed, actor, finance | Dossier om Axfoundations "Framtidens foder" som mulig pilot-/benchmarkcase. |
| SRC-A-011 | research/bibliotek/forskningsrunde-2026-04-20-r2/p17-volare-selskapsdossier-2026-04-20.md | uvalidert | A-feed, actor, finance | Selskapsdossier for Volare/Finnprotein med teknologi, finansiering og regulatorisk status. |
| SRC-A-012 | research/bibliotek/forskningsrunde-2026-04-20-r2/p19-bsf-substrat-sidestrommer-2026-04-20.md | uvalidert | A-feed, B-sidestream, policy | Arbeidsnotat om nordiske BSF-substrater, volum, ernæringskvalitet og EU-regulatoriske grenser. |
| SRC-A-013 | https://www.denofa.no/soya/ og https://www.denofa.no/soya/produkter/ | primær | A-feed, baseline, actor | Denofa actor-primary source for årlig soyabønneimport til Fredrikstad, opprinnelse og produkter; brukes med tydelig actor-forbehold. |
| SRC-A-014 | https://www.fiskeridir.no/statistikk-tall-og-analyse/data-og-statistikk-om-akvakultur/statistiske-publikasjon-innen-akvakultur, `Nøkkeltall fra norsk havbruksnæring 2024`, tabell 43 | primær | A-feed, baseline | Institusjonskilde for omsetning av fôr i norsk oppdrettsnæring 2020-2024, i tonn. |
| SRC-A-015 | https://www.skretting.com/no/baerekraft/baerekraftsrapport/impact-report-2024-skretting-norway/use-of-vegetable-raw-materials-2024/ | primær | A-feed, actor, baseline | Actor-specific fôrsammensetning, SPC-andel og sertifisering for Skretting Norge; ikke bransjeproxy. |
| SRC-A-016 | https://eumofa.eu/fishmeal-and-fish-oil-2025-edition | sekundær | A-feed, baseline | EU/global fiskemel-kontekst: produksjon, handel og sluttbruk, inkludert akvakulturandel. |
| SRC-A-017 | SSB Statistikkbanken tabell 08801: https://www.ssb.no/statbank/table/08801/ og API https://data.ssb.no/api/v0/no/table/08801/ | primær | A-feed, baseline, C-adoption | Offisiell norsk importstatistikk etter varenummer, import/eksport, land, statistikkvariabel og år. Runde-5 API-uttrekk 2026-05-21 dekker 2020-2025 for soyabønner, soyakaker/-mel/reststoff, soyaolje, proteinkonsentrater, prepared fish feed og fiskemel/fiskepellets. Bruk som handelsstatistikk, ikke faktisk fôrbruk; SPC/prepared-feed-metode krever fortsatt SSB/Tolletaten/fôraktøravklaring. |
| SRC-A-018 | NIBIO: «Bærekraft i norsk jordbruksproduksjon — del 1 og 2» (2024); https://nibio.brage.unit.no/ | primær | A-feed, baseline, policy | NIBIO-utredning bestilt av LMD (levert oktober 2024) som dekker bærekraft i jordbruksproduksjon, fôrkjede, gjødseleffektivitet og selvforsyning. Brukes som offisiell norsk baseline; faktiske kapittelhenvisninger må sjekkes mot brage-PDF før sitering. |
| SRC-A-019 | Københavns Universitet / IFRO 2025: dansk soyaimport-analyse; https://ifro.ku.dk/english/news/2025/danish-soy-import/ | primær | A-feed, policy | IFRO/KU-rapport (2025) som dokumenterer at 1,2–1,7 mill. tonn dansk soyaimport per år er kun 6 % fysisk sporbar; sourcing fra DCF-områder kan kutte 54 % av utslippene fra brasiliansk soya. Sentralt for EUDR-eksposisjon i Spor A og dossier-a. |

### Spor B — Sidestrømmer, matsvinnkvalitet og næringsstoffløkker

| ID | Filsti / referanse | Kvalitetstag | Sportag(er) | Notat |
|---|---|---|---|---|
| SRC-B-001 | research/norden/verdikjede/06-matsvinn-sirkulaer.md | intern syntese | B-sidestream, C-adoption, policy | Nordisk komparativ analyse av matsvinn, behandling, redistribusjon, biogass, emballasje og policy. |
| SRC-B-002 | research/bibliotek/sirkularitet/nordisk-matsvinn-rapport-2024.md | sekundær | B-sidestream, policy | Nordisk matsvinnrapport brukt som støtte for nivå, tiltak og policykontekst. |
| SRC-B-003 | research/bibliotek/sirkularitet/matsvinn-tidsserier-norden.md | sekundær | B-sidestream, baseline | Tidsseriegrunnlag for matsvinn i Norden og sammenlignbarhet mellom land. |
| SRC-B-004 | research/bibliotek/akademia/masteroppgaver/eriksson-phd-2015.md | primær | B-sidestream, C-adoption | PhD med kvantitativ kartlegging av matsvinn i svenske supermarkeder og vurdering av håndteringsalternativer. |
| SRC-B-005 | research/bibliotek/akademia/masteroppgaver/albizzati-phd-2021.md | primær | B-sidestream, policy | PhD/LCA-kilde for rangering av matsvinnshåndtering på tvers av forebygging, redistribusjon, fôr og avfall. |
| SRC-B-006 | research/bibliotek/akademia/pubmed/javourez-u-2021-waste-to-nutrition-a-review.md | sekundær | B-sidestream | Review om hvordan reststrømmer kan oppgraderes til ernæringsprodukter fremfor lavverdig behandling. |
| SRC-B-007 | research/bibliotek/akademia/pubmed/falch-e-2026-maximizing-the-utilization-of-seafood.md | sekundær | B-sidestream, A-feed | Review/oversiktskapittel om høyverdiutnyttelse av sjømatressurser, sidestrømmer og bifangst. |
| SRC-B-008 | research/bibliotek/akademia/pubmed/stoknes-k-2016-efficiency-of-a-novel-food.md | primær | B-sidestream | Nordisk/norsk demonstrasjon av "food to waste to food" med biogass, digestat og ny matproduksjon. |
| SRC-B-009 | research/bibliotek/akademia/pubmed/zamanzadeh-m-2017-biogas-production-from-food-waste.md | primær | B-sidestream | Norsk/Dansk relevant studie om biogass fra matavfall og samråtning med husdyrgjødsel. |
| SRC-B-010 | research/bibliotek/akademia/pubmed/feng-l-2023-developing-a-biogas-centralised-circular.md | sekundær | B-sidestream, policy | Review om biogass-sentrert sirkulær bioøkonomi og hvordan energi- og næringsstoffsystemer kobles. |
| SRC-B-011 | research/perplexity-20-04-26/havre-okara-sidestroemmer-dybdeanalyse.md | uvalidert | B-sidestream, actor | Dybdenotat om havre-okara, volum, nåværende destinasjon, aktører og R9-potensial. |
| SRC-B-012 | research/bibliotek/forskningsrunde-2026-04-20-r2/p22-sidestrom-til-mat-prosjekter-2026-04-20.md | uvalidert | B-sidestream, actor | Kartlegging av nordiske prosjekter som oppgraderer sidestrømmer til mat for mennesker. |
| SRC-B-013 | research/bibliotek/forskningsrunde-2026-04-20-r2/p26-helsingborg-recolab-2026-04-20.md | uvalidert | B-sidestream, actor, policy | Case study av RecoLab/H+ og tre-rørsmodellen for næringsgjenvinning fra svartvann. |
| SRC-B-014 | research/evidence-pack/offentlig/matsvinnutvalget-2024.pdf | primær | B-sidestream, C-adoption, policy, baseline | Norsk utvalgsrapport om matsvinn med tiltak, rapporteringskrav, virkemidler, databehov og modellert potensial. Sterk beslutningskilde, men effektanslag må brukes med usikkerhetsforbehold. |
| SRC-B-015 | https://nsva.se/vatten-och-avlopp/ditt-avlopp/tre-ror-ut/ | primær | B-sidestream, actor, policy | NSVA primærkilde for Tre rør ut/Oceanhamnen: kildesortert avløpssystem med separate strømmer for svartvann, gråvann og matavfall. |
| SRC-B-016 | https://www.recolab.se/utvecklingsanlaggning/ og https://www.recolab.se/vanliga-fragor/ | primær | B-sidestream, actor | RecoLab primærkilde for utviklingsanlegg, prosess, produkter, dimensjonering, relative effekter og kostindikasjoner. |
| SRC-B-017 | https://www.eawag.ch/fileadmin/Domain1/Abteilungen/sandec/schwerpunkte/sesp/Lighthouse/helsingborg_synthesis_report.pdf | sekundær | B-sidestream, actor, policy | Eawag synteserapport om Tre-Rör-Ut/Helsingborg med driftsskala, governance, kost og begrensninger. |
| SRC-B-018 | https://www.ssb.no/natur-og-miljo/vann-og-avlop/statistikk/utslipp-og-rensing-av-kommunalt-avlop | primær | B-sidestream, baseline | SSB kommunalt avløp/slam 2024; norsk baseline for avløpsslam, slamdisponering og biogassformål. |
| SRC-B-019 | https://www.nibio.no/tema/jord/organisk-avfall-som-gjodsel/avlopsslam | primær | B-sidestream, baseline, policy | NIBIO fagkilde for avløpsslam, N/P/K-innhold, P-ressurs og plantetilgjengelighetsforbehold. |
| SRC-B-020 | Mattilsynet/Lovdata: gjødselvareforskrift og gjødselbrukforskrift 2025 | primær | B-sidestream, policy | Gjeldende regelverksgrunnlag for gjødselvarer, avløpsslam, hygienisering, arealbegrensninger, P-grenser og fremmedlegemer. |
| SRC-B-021 | https://veas.nu/uploads/2025/04/Veas-Baerekraftrapport-2024.pdf | primær | B-sidestream, actor, baseline | VEAS 2024 som norsk sentralanlegg-benchmark for N/P-rensing, biorest, ammoniumsulfat og biogass. |
| SRC-B-022 | https://www.hias.no/avlop/struvitt/ | primær | B-sidestream, actor | HIAS struvitt/Bio-P som norsk fosforgjenvinningscase med produktdeklarasjon og Mattilsynet-registrering. |
| SRC-B-023 | https://dmfas.no/assets/dokumenter/dmf_arsrapport2024_nett_oppslag.pdf | primær | B-sidestream, actor | Den Magiske Fabrikken som norsk digestat-/biogjødselcase for biorestmarked, matavfall/husdyrgjødsel og landbruksavsetning. |
| SRC-B-024 | https://www.axfoundation.se/en/projects/over-n-oat-residues | primær | B-sidestream, actor | Axfoundation Over & Oat som svensk okara-benchmark: 0,2 liter pressrest per liter havredrikk, ca. 25 000 tonn/år i Sverige og nåværende avsetning til fôr/gjødsel/biogass. Brukes som benchmark, ikke pilotbevis. |
| SRC-B-025 | https://chalmersindustriteknik.se/en/project/over-oat/ | primær/sekundær | B-sidestream, actor | Chalmers Industriteknik Over & Oat-prosjektkilde for okara, verdikjede-/forretningsmodell, partnere og prosjektperiode 2023-2026. Brukes som prosjektbenchmark; pilotstatus krever råvareeier, hygiene, stabilisering og off-taker. |
| SRC-B-026 | https://www.ri.se/en/food/project/brewers-spent-grain-as-food-ingredient | primær | B-sidestream, actor | RISE Brewed & Renewed-prosjekt om bryggerimask som matingrediens; svensk benchmark for volum, fuktbarriere og pilotmål. Brukes som benchmark, ikke norsk/nordisk pilotbevis. |
| SRC-B-027 | https://www.sintef.no/publikasjoner/publikasjon/019cb816e9d8-613672ba-42ff-40f5-8c4a-d11bcb98a574/ | primær | B-sidestream, baseline | SINTEF Analyse marint restråstoff 2024 som norsk sjømatrestråstoff-baseline for volum, utnyttelse og uutnyttet restråstoff. |
| SRC-B-028 | research/bibliotek/akademia/masteroppgaver/hebrok-phd-2020.md | primær | B-sidestream, C-adoption | PhD om husholdningsmatsvinn som hverdagspraksis; viser at informasjonstiltak alene er svakt og at rutiner, planlegging og designintervensjoner må forstås sammen. |
| SRC-B-029 | research/bibliotek/akademia/masteroppgaver/brancoli-phd-2021.md | primær | B-sidestream, C-adoption, market power | PhD om matsvinn i svensk brødverdikjede; dokumenterer take-back-avtaler, overproduksjonsinsentiver og høyere verdiutnyttelse av overskuddsbrød. |
| SRC-B-030 | research/bibliotek/akademia/masteroppgaver/sundin-phd-2024.md | primær | B-sidestream, baseline, C-adoption | PhD som kvantifiserer husholdningsmatsvinn og klimaeffekt; nyttig for å unngå overclaiming av matsvinnreduksjon uten kostholdsendring. |
| SRC-B-031 | src/lib/data/theses.ts (`slu-house-crickets-2025`) og https://pub.epsilon.slu.se/id/document/20453027 | primær | A-feed, B-sidestream, policy | SLU-avhandling om hus-sirisser i sirkulære matsystemer: crop residues til protein og frass-gjødsel. Lokal PDF-/dokumentspeiling mangler fortsatt. |
| SRC-B-032 | Matvett/NORSUS faktaark om matsvinn i Norge 2024 (sektorvise + samlet); https://www.matvett.no/uploads/documents/Faktaark-om-matsvinn-i-Norge-2024-alle-sektorer.pdf og https://norsus.no/wp-content/uploads/7.-OR.27.25-Faktark-om-matsvinn-i-Norge-2024-1.pdf | primær | B-sidestream, baseline, C-adoption | Matvett+NORSUS-faktaark for 2024-året: 407 100 tonn totalt matsvinn, 73,4 kg/innbygger, 24 % reduksjon siden 2015 (uten jordbruk), sektorvise tall for matindustri, grossist, dagligvare, KBS, restaurant og husholdninger. Klimaavtrykk -28 %, økonomisk tap -30 %. |
| SRC-B-035 | research/evidence-pack/akademia/wur-elbersen-agri-residues-2022.pdf og https://doi.org/10.18174/563389 | primær | B-sidestream, C-adoption, methodology | Wageningen Food & Biobased Research-rapport som gir et circular evaluation framework for agri-residues. Nyttig metodekilde for å score sirkularitet, miljø, samfunnsøkonomi og implementerbarhet før sidestrømmer løftes til pilotclaim. |

### Spor C — Adoption mechanisms

| ID | Filsti / referanse | Kvalitetstag | Sportag(er) | Notat |
|---|---|---|---|---|
| SRC-C-001 | research/norden/regulatory-policy-landscape-nordic.md | intern syntese | C-adoption, policy | Komparativt policykart for nordisk matregulering, UTP, Farm to Fork, EUDR, PPWR og matsvinnmål. |
| SRC-C-002 | research/analyse/offentlig-innkjop-nordisk.md | intern syntese | C-adoption, policy | Komparativ oversikt over offentlige matinnkjøp i Norden og transformativ etterspørselsmakt. |
| SRC-C-003 | research/regulatory/eu-farm-to-fork-strategy-2020.md | primær | C-adoption, policy | EU-strategi som politisk ramme for bærekraftige matsystemer og etterspørsels-/tilbudsvirkemidler. |
| SRC-C-004 | research/regulatory/eu-utp-directive-2019-633.md | primær | C-adoption, policy | EU-direktiv om urimelig handelspraksis i matforsyningskjeden. |
| SRC-C-005 | research/regulatory/eu-utp-evaluering-desember-2025.md | primær | C-adoption, policy | EU-evaluering av UTP-direktivet som grunnlag for håndhevings- og regelverksdiskusjon. |
| SRC-C-006 | research/regulatory/eu-ppwr-emballasjeforordningen-2025.md | primær | C-adoption, policy | EU PPWR-kilde for emballasje, avfall og sirkulære krav som påvirker matsystemet. |
| SRC-C-007 | research/regulatory/eu-eudr-avskogingsforordningen-2025.md | primær | C-adoption, policy, A-feed | EUDR-kilde relevant for soya, avskogsrisiko og importerte fôrråvarer. |
| SRC-C-008 | research/bibliotek/akademia/pubmed/szulecka-j-2024-food-waste-governance-architectures-in.md | sekundær | C-adoption, B-sidestream, policy | Fagartikkel om matsvinnstyring og governance-arkitekturer i Norden. |
| SRC-C-009 | research/bibliotek/akademia/pubmed/parra-lopez-c-2026-enabling-the-circular-food-economy.md | sekundær | C-adoption, B-sidestream | Fagartikkel om digitalisering, sporbarhet og EU-policy som muliggjørere for sirkulær matøkonomi. |
| SRC-C-010 | research/bibliotek/akademia/masteroppgaver/lehtokunnas-phd-2023.md | primær | C-adoption, B-sidestream | PhD om hvordan sirkulærøkonomi realiseres i hverdagspraksis i butikker, husholdninger og biogassanlegg. |
| SRC-C-011 | research/perplexity-20-04-26/kpi-sirkularitet-offentlig-privat.md | uvalidert | C-adoption, baseline | Arbeidsnotat om operative KPI-er for sirkularitet i offentlige og private matsystemaktører. |
| SRC-C-012 | research/bibliotek/forskningsrunde-2026-04-20-r2/p42-barriereanalyse-sirkulaer-mat-2026-04-20.md | uvalidert | C-adoption, policy | Arbeidsnotat som rangerer økonomiske, regulatoriske, kulturelle og strukturelle barrierer. |
| SRC-C-013 | Lovdata/regjeringen.no: lov om god handelsskikk og myndighetsoverføring 2026-04-30 | primær | C-adoption, policy | Norsk rettslig baseline for god handelsskikk og overføring av håndheving fra Dagligvaretilsynet til Konkurransetilsynet fra 30.04.2026. |
| SRC-C-014 | research/evidence-pack/tilsyn/dagligvaretilsynet-samarbeidsklima-2025.pdf | primær | C-adoption, policy, actor | Norsk tilsynsundersøkelse om samarbeidsklima, rapporteringsfrykt, kontakt med tilsyn og praktiske barrierer. |
| SRC-C-015 | research/evidence-pack/offentlig/dagligvaretilsynet-aarsrapport-2023.pdf og research/evidence-pack/offentlig/dagligvaretilsynet-aarsrapport-2024.pdf | primær | C-adoption, policy | Årsrapporter som dokumenterer tilsynets dialogmodell, få formelle saker og kapasitets-/håndhevingskontekst. |
| SRC-C-016 | research/evidence-pack/tilsyn/dagligvarerapport-2024.pdf og tilhørende Konkurransetilsynet-kilder | primær | C-adoption, policy, market power | Norsk konkurranse-/markedsstrukturgrunnlag for dagligvare, konsentrasjon, marginstudier og håndhevingsverktøy. |
| SRC-C-017 | DFØ/Anskaffelser.no: bærekraftig kjøp av mat og måltidstjenester | primær | C-adoption, policy, procurement | Primærkilde for offentlig innkjøp som mulig demand-side mekanisme, miljøkrav, matsvinnkrav og kontraktsoppfølging. |
| SRC-C-018 | European Commission EUDR-side, EUR-Lex 2023/1115 og 2025/2650, regjeringen.no/Miljødirektoratet høringer/statussider, Landbruksdirektoratet EUDR-side/FAQ og EØS-notater | primær | C-adoption, policy, A-feed | EUDR-kildepakke for EU-scope, soya, avskogingsfri dokumentasjon, due diligence, EU-frister og norsk/EØS-status. Oppdatert 2026-05-21: Landbruksdirektoratet sier EUDR ikke er innlemmet i EØS/norsk rett ennå og at jordbruksvarer som storfekjøtt og soya holdes utenfor delvis norsk gjennomføring; Miljødirektoratet sier forskriftsutkastet er til departementsbehandling og norsk ikrafttredelse ikke er avgjort. Endelig Lovdata/EØS-/Traces-status og aktørpraksis må fortsatt sjekkes. |
| SRC-C-019 | research/bibliotek/akademia/masteroppgaver/sorensen-phd-2016.md | primær | C-adoption, policy, procurement | PhD om Danmarks Organic Action Plan 2020 og offentlige kjøkken; viser at innkjøpsskifte krever politisk forankring, rådgivere, opplæring og meny-/driftsendring. |
| SRC-C-020 | research/bibliotek/akademia/masteroppgaver/lindstrom-2021.md | primær | C-adoption, policy, procurement | PhD om grønn offentlig anskaffelse, organisk areal og pris-/etterspørselsmekanismer i Sverige. |
| SRC-C-021 | research/bibliotek/akademia/masteroppgaver/sundqvist-phd-2025.md | primær | C-adoption, policy, packaging | PhD om matemballasjeregulering som styringslabyrint med konflikt mellom sirkularitet, matsikkerhet og barrier properties. |
| SRC-C-022 | research/bibliotek/akademia/masteroppgaver/halseth-phd-2024.md | primær | C-adoption, market power | NHH/BECCLE PhD med empirisk DiD-analyse av Coop/ICA-oppkjøp og lokale konkurranse-/format-effekter i norsk dagligvare. |
| SRC-C-023 | research/bibliotek/akademia/masteroppgaver/ulsaker-2016.md | primær | C-adoption, market power, pricing | PhD om vertikale restriksjoner, assortimentsvalg, prisdannelse og profitfordeling i verdikjeder. |
| SRC-C-024 | research/bibliotek/akademia/masteroppgaver/nguyen-hartmann-2024.md | primær | C-adoption, market power, property | Masteroppgave om eksklusive/restriktive eiendomsklausuler i norsk dagligvare, lokal konsentrasjon og etableringsbarrierer. |
| SRC-C-025 | research/bibliotek/akademia/masteroppgaver/martens-norum-2020.md | primær | A-feed, C-adoption, market power | Masteroppgave om importvern, leverandørkonsentrasjon og bilateralt maktforhold mellom kjeder og leverandører. |
| SRC-C-026 | research/bibliotek/akademia/masteroppgaver/skjervheim-bernes-flo-2016.md | primær | C-adoption, logistics, market power | Masteroppgave om kjedenes overtakelse av grossist-/distribusjonsledd og hvordan distribusjonskontroll kan fungere som etableringsbarriere. |
| SRC-C-027 | Riksrevisionen 2025: «Statens insatser för jordbrukets klimatomställning»; https://www.riksrevisionen.se/granskningar/granskningsrapporter/2025/statens-insatser-for-jordbrukets-klimatomstallning.html | primær | C-adoption, policy | Svensk riksrevisjonsrapport som dokumenterer at det mangler styrmedel for ~68 % av jordbrukets klimagassutslipp (organogen jord + drøvtygger-fordøyelse 2023), og at regjeringen ikke har redovisat plan for hvordan jordbrukets klimapåvirkning skal begrenses for å nå klimamålet. Sentral for adoption/policy-spor og som benchmark for nordisk policysammenligning. |
| SRC-C-028 | Concito Q&A om Green Tripartite Agreement (Danmark 2024); https://concito.dk/en/node/3817 + relaterte WRI-/Carbon Brief-analyser | sekundær | C-adoption, policy | Concito-tenketankens analyse av dansk Green Tripartite Agreement (juni 2024 + november-utvidelsen): klimaskatt på husdyr 300 DKK/t (2030) → 750 DKK/t (2035) med 60 % rabatt, Green Land Fund 43 mrd DKK, 250 000 ha ny skog, 140 000 ha tilbakevæting. Brukes som referanse for hva en hybrid skatte-/incentivpakke kan se ut som. |
| SRC-C-029 | Klimaaftalen for landbruget juni 2024 og politisk avtale om implementering av et Grønt Danmark november 2024 | primær | C-adoption, policy, climate | Danske primærkilder for Green Tripartite/landbrukets klimavirkemidler. Brukes som hovedkilde for klimaavgift, arealtiltak og implementeringsmodell; Concito bør bare brukes som tolkningshjelp. |
| SRC-C-030 | Riksrevisionen 2025 og Livsmedelsstrategin 2.0 | primær | C-adoption, policy, climate | Svenske primærkilder for styringsgap og matstrategi. Brukes til å skille svensk policyretning fra dansk avgifts-/trepartsmodell; tall og scope må sjekkes mot rapportmetodikk. |
| SRC-C-031 | Lovdata LOV-2025-06-20-103 §§ 2, 4, 5, 6 og 14 og Prop. 130 L (2024-2025): https://lovdata.no/dokument/NL/lov/2025-06-20-103 og https://www.regjeringen.no/no/dokumenter/prop.-130-l-20242025/id3096529/ | primær | C-adoption, policy, food_waste_law | Norske primærkilder for matsvinnloven. Brukes til å korrigere dato/status: Prop. 130 L ble fremmet 10. april 2025, loven er LOV-2025-06-20-103 av 20. juni 2025, og Lovdata § 14 sier at loven gjelder fra den tid Kongen bestemmer. |

### Regulatoriske primærkilder fra runde 2

| ID | Filsti / referanse | Kvalitetstag | Sportag(er) | Notat |
|---|---|---|---|---|
| SRC-REG-001 | https://www.mattilsynet.no/for/insekter-til-bruk-i-for | primær | A-feed, B-sidestream, policy | Mattilsynet-veiledning om insekter til fôr, tillatte arter, substratkrav, forbud mot kjøkken-/matavfall, gjødsel og slam, og PAP til fisk/svin/fjørfe. |
| SRC-REG-002 | https://www.mattilsynet.no/sirkulaerokonomi-og-baerekraftig-for/regelverksarbeid-om-forsubstrat-til-insekter | primær | A-feed, policy | Mattilsynet-notat om dagens og mulig fremtidig regelverksarbeid for insektsubstrater: catering waste, tidligere matvarer med kjøtt/fisk og fiskeslam. |
| SRC-REG-003 | EUR-Lex 1069/2009 og 142/2011 | primær | A-feed, B-sidestream, policy | EU ABP-regelverk for animaliebiprodukter, kategori 3, catering waste-definisjon og grensen mellom tidligere matvarer og forbudt fôr. |
| SRC-REG-004 | EUR-Lex 2017/893 og regjeringens EØS-notat om TSE/insektsmel i fiskefôr | primær | A-feed, policy | Rettsgrunnlag for at PAP fra oppdrettede insekter ble åpnet i akvakulturfôr under vilkår. |
| SRC-REG-005 | EUR-Lex 2021/1372 og regjeringens EØS-notat om TSE-lettelser | primær | A-feed, policy | Rettsgrunnlag for lettelser i fôringsforbudet og PAP fra insekter til svin/fjørfe under artsbarriere og kontrollkrav. |
| SRC-REG-006 | https://www.efsa.europa.eu/en/efsajournal/pub/4257 | primær | A-feed, policy | EFSA 2015 risikoprofil for insekter som mat/fôr; sentral for føre-var-logikk, substratrisiko og datakrav. |

### Baseline / actor / finance / policy

| ID | Filsti / referanse | Kvalitetstag | Sportag(er) | Notat |
|---|---|---|---|---|
| SRC-BASE-001 | research/DATA-READINESS-SLUTTRAPPORT.md | intern syntese | baseline | Status for datagrunnlag, proveniens, dokumentdekning og kildeberedskap. |
| SRC-BASE-002 | research/PLATTFORM-KOBLING.md | intern syntese | baseline | Kobling mellom seed-data, lokale filer og plattformstruktur. |
| SRC-BASE-003 | research/RESEARCH-MISSIONS.md | intern syntese | baseline | Oversikt over gjennomførte research-spor og gjenstående gap. |
| SRC-BASE-004 | research/VERDIKJEDE-KARTLEGGING-PLAN.md | intern syntese | baseline | Plananker for verdikjede- og systemkartlegging. |
| SRC-BASE-005 | research/norden/verdikjede/10-kryss-analyse.md | intern syntese | baseline, C-adoption | Tverrgående analyse på tvers av nordisk verdikjede og systemgaps. |
| SRC-BASE-006 | NIBIO selvforsyningsberegning (foreløpige tall 2024 + serier); https://www.nibio.no/tema/landbruksokonomi/selvforsyningsgrad-og-engrosforbruk | primær | baseline, A-feed | Offisiell norsk selvforsyningsstatistikk. Foreløpig 2024: 35 % korrigert for kraftfôrimport (under regjeringens 50 %-mål), 45 % uten korreksjon. Brukes som baseline for Spor A og som referanse for Norden-sammenligning. |
| SRC-BASE-007 | EEA Country Profiles 2025 (Danmark, Norge, Sverige, Finland, Island); https://www.eea.europa.eu/en/europe-environment-2025/countries | sekundær | baseline, policy | EEA Europe Environment-rapport 2025 med landsprofiler. Inneholder klimagassutslipp, avfallshåndtering, sirkulærøkonomi, mat- og jordbruksdata per nordisk land. Bra som strukturert sammenligningsgrunnlag, men sekundær (basert på nasjonale primærkilder). |
| SRC-BASE-008 | Luke Balance Sheet for Food Commodities 2024 (Finland, foreløpige tall); https://www.luke.fi/en/statistics/balance-sheet-for-food-commodities-statistics-discontinued/balance-sheet-for-food-commodities-2024-preliminary-and-2023-final-figures | primær | baseline | Finsk forbruksstatistikk per matvaregruppe (kjøtt 78,2 kg/capita 2024, melk 130 kg, havre, fjærfe). Brukes til Norden-sammenligning av forbruksendringer over tid. Statistikkserien er utfaset hos Luke; nye Finland-tall finnes via separate Luke-publikasjoner. |
| SRC-BASE-009 | docs/project/mandates/research-dossiers/baerekraftsutfordringer-input-2026-04-28/ | uvalidert | baseline, A-feed, B-sidestream, C-adoption | Internt input-korpus med syv research-notater (Norden + 5 land + Norge data-landskap) som kartlegger hele matverdikjeden. Brukes som idé-/hypotese- og kildejakt-grunnlag, ikke som siterbar evidence. Se `README.md` i mappen for metode og bruksforbehold. |
| SRC-ACT-001 | src/lib/data/actors.ts | intern syntese | actor | Strukturert aktørgrunnlag i applikasjonen; nyttig som operativ aktørliste, ikke siterbar kilde. |
| SRC-ACT-002 | research/interviews/aktorkart-systematisk-2026.md | intern syntese | actor | Systematisk aktørkart for intervjuer og valideringsplan. |
| SRC-ACT-003 | research/bibliotek/forskningsrunde-2026-04-20-r2/p16-nordiske-do-tanks-stiftelser-2026-04-20.md | uvalidert | actor, finance | Arbeidsnotat om nordiske do-tanks, stiftelser og potensielle støttemiljøer. |
| SRC-ACT-004 | research/bibliotek/forskningsrunde-2026-04-20-r2/p15-axel-johnson-systemet-2026-04-20.md | uvalidert | actor, finance | Arbeidsnotat om Axel Johnson/Axfoundation-systemet som mulig partner- og fundingnode. |
| SRC-ACT-005 | research/bibliotek/forskningsrunde-2026-04-20-r2/p49-phd-prosjekter-norden-2026-04-20.md | uvalidert | actor, A-feed, B-sidestream, research-front | Arbeidsnotat som kartlegger nordiske PhD-/postdoc-/prosjektspor for sirkulær mat, fôr, biomasse og sidestrømmer; brukes som kontakt- og hypotesekart, ikke som effektbevis. |
| SRC-FIN-001 | research/evidence-pack/finance-note.md | intern syntese | finance | Eksisterende finance note; må utvides med konkrete programfrister og eligibility. |
| SRC-FIN-002 | research/external/notion/funding-map.md | intern syntese | finance | Notion-speilet funding map; brukes som operativ bruttoliste, ikke som ekstern dokumentasjon. |
| SRC-POL-001 | research/whitepaper/executive-brief.md | intern syntese | policy, baseline | Executive brief om nordisk markedsstruktur og transition levers; må vris mot Circular Food-scope. |

## Kilder som krever manuell sjekk før ekstern bruk

| ID | Hvorfor manuell sjekk | Eier | Frist |
|---|---|---|---|
| SRC-A-007 | L4-soyaimportvolum er erstattet av SSB 08801 (`SRC-A-017`) for offisiell varekodeserie. Behold L4-notatet kun som kildejakt. | Gabriel | 29.04 |
| SRC-A-008 | Fiskemelvolum er delvis erstattet av SSB 08801 (`SRC-A-017`) for importserie; faktisk bruk i norsk fôr og aktørfordeling må fortsatt sjekkes mot aktører/FAO/IFFO/Eurostat ved behov. | Gabriel | 29.04 |
| SRC-A-009 | EU TSE/ABP-tolkninger må kontrolleres mot gjeldende EU- og Mattilsynet-tekst. | Gabriel | 29.04 |
| SRC-REG-001 til SRC-REG-005 | Juridiske hovedregler er hentet fra primærkilder, men konkrete substrater og pilotdesign må kontrolleres mot gjeldende konsolidert tekst, EØS-/Lovdata-status og Mattilsynet. | Gabriel | 29.04 |
| SRC-A-010 | AX-prosjektets volum, funding og produktstatus må bekreftes mot Axfoundation eller offentlig prosjektdokumentasjon. | Gabriel/Cathrine | 30.04 |
| SRC-A-011 | Volare-finansiering, kapasitet og kundestatus må valideres mot selskapet/offentlige selskapsdata. | Gabriel/Cathrine | 30.04 |
| SRC-A-013 | Denofa-tallet kan brukes som actor-tall, men må ikke behandles som total norsk soyaimport uten SSB/HS-serie. | Gabriel | 29.04 |
| SRC-A-014 | Fôrtallet gjelder omsetning av fôr i oppdrettsnæringen, ikke bare laks; definisjon må beholdes i ekstern tekst. | Gabriel | 29.04 |
| SRC-A-015 | Skretting-data er actor-spesifikk og må krysses med BioMar/Cargill/Mowi/Sjømat Norge før bransjeclaim. | Gabriel | 30.04 |
| SRC-A-016 | EUMOFA gir global/EU fiskemelkontekst, men norsk import/bruk per aktør må sjekkes separat. | Gabriel | 30.04 |
| SRC-A-017 | SSB-seriene kan brukes som offisiell importbaseline per varekode, men SPC/prepared fish feed, artsfordelt laksefôr, 2024/2025-revisjoner og kobling til faktisk fôrbruk krever metode-/aktørsjekk før sterke beslutningsclaims. | Gabriel | 29.04 |
| SRC-B-011 | Havre-okara-volumer er modellert/estimert og må bekreftes mot produsenter eller industriaktører. | Gabriel | 30.04 |
| SRC-B-013 | RecoLab-tall for tilkoblingsgrad, N/P/K og sluttprodukter må kontrolleres mot NSVA/Helsingborg-kilder. | Gabriel | 30.04 |
| SRC-B-014 | Matsvinnutvalgets effekt- og tiltakspotensial er modellert med usikkerhet/dobbelttellingsrisiko; konkrete tall må brukes med sidetall og forbehold. | Gabriel | 29.04 |
| SRC-B-015 til SRC-B-017 | RecoLab/Oceanhamnen kan brukes som benchmark, men 2026-driftsskala, absolutt N/P/K-massebalanse, K-gjenvinning og produktstatus må valideres med NSVA/Recolab. | Gabriel | 30.04 |
| SRC-B-020 | Gjødselvare- og gjødselbruksregelverk er primærkildegrunnlag, men tolkning for konkrete produkter/piloter må sjekkes med Mattilsynet/Landbruksdirektoratet eller juridisk kompetanse. | Gabriel | 30.04 |
| SRC-B-021 til SRC-B-023 | Norske nutrient-loop-case kan brukes som benchmark, men produktmarked, kvalitet, volumdefinisjoner og aktørstatus må valideres per case. | Gabriel | 30.04 |
| SRC-B-024 til SRC-B-025 | Okara-tallene er svenske benchmark/prosjekttall; nordisk/norsk total og pilotvolum krever produsentvalidering. | Gabriel | 30.04 |
| SRC-B-026 | Bryggerimask-tallene er svenske benchmark/prosjekttall; norsk/nordisk volum, matgrade-status og logistikk må valideres med bryggeri-/mataktører. | Gabriel | 30.04 |
| SRC-B-027 | SINTEF gir sterk norsk baseline, men konkrete pilotfraksjoner, høyverdiutnyttelse og aktøravsetning må valideres med SINTEF/FHF/industri. | Gabriel | 30.04 |
| SRC-B-028 til SRC-B-030 | PhD-kildene er sterke for mekanismer og forbehold, men må ikke brukes som direkte norsk pilotvolum eller effektbevis uten nasjonale data. | Gabriel | 30.04 |
| SRC-B-031 | SLU-avhandlingen er relevant for A/B, men lokal PDF-/dokumentspeiling og regulatorisk overføring til norske/nordiske substrater må sjekkes før ekstern bruk. | Gabriel | 30.04 |
| SRC-C-011 | KPI-listen må krysses mot faktiske rapporteringskrav hos SSB, Eurostat/JRC og private aktører. | Gabriel | 30.04 |
| SRC-C-012 | Barriereanalysen er syntetisk og må støttes av primær-/sekundærkilder før den brukes i decision memo. | Gabriel | 30.04 |
| SRC-C-013 til SRC-C-017 | Norske governance-kilder kan brukes som policy-/markedsstrukturgrunnlag, men effekt på sirkulære leverandører, innkjøpspraksis og overgang til Konkurransetilsynet må valideres med aktører. | Gabriel | 30.04 |
| SRC-C-018 | EU-frister, EU-råvarescope og norsk høringsstatus om delvis EØS-innlemmelse kan brukes med presis avgrensning. Endelig Lovdata/EØS-komité/Storting, SPC/prepared-feed-varekoder og praktisk TRACES-/DDS-tilgang må primærsjekkes mot norske myndigheter. | Gabriel | 29.04 |
| SRC-C-019 til SRC-C-026 | Avhandlingene styrker adoption-/markedsmekanismer, men overføring til sirkulær mat krever aktørvalidering og tydelig skille mellom organisk innkjøp, emballasje, dagligvaremakt og konkrete pilotbarrierer. | Gabriel | 30.04 |
| SRC-ACT-005 | Arbeidsnotatet om nordiske PhD-prosjekter er uvalidert og skal kun brukes som forskningsfront-/kontaktliste til hver prosjektstatus er primærsjekket. | Gabriel | 30.04 |
| SRC-A-018 | NIBIO bærekraft-utredning er primærkilde, men eksakt kapittel-/sidehenvisning (eks. tall for fôrkjedeavhengighet, gjødseleffektivitet) må sjekkes mot brage-PDF før sitering. | Gabriel | 30.04 |
| SRC-A-019 | IFRO/KU soya-rapport 2025 — verifiser den 6 %-fysisk-sporbare-andelen mot publisert tabell og krysslås opp mot RTRS/ProTerra-sertifiseringsmodellene før sterk EUDR-claim. | Gabriel | 30.04 |
| SRC-B-032 | Matvett+NORSUS-faktaark for 2024 er primær, men sektorvise nedgangstall (kjøttvarer -62,5 %, ost -62 %) må sjekkes mot full rapport før de brukes som hovedclaims. | Gabriel | 30.04 |
| SRC-B-035 | Wageningen-rammeverket er sterkt som metodekilde, men case-eksemplene er Ghana, Costa Rica og Nederland. Overføring til nordiske sidestrømmer krever lokal råvare-, regelverks- og aktørvalidering. | Gabriel | 15.05 |
| SRC-C-027 | Riksrevisionens granskning er primær for Sverige, men direkte overføring til norsk policy-debatt krever tydelig avgrensning (CAP-kontekst, organogen jord-andel, etappmål). | Gabriel | 30.04 |
| SRC-C-028 | Concito Q&A er sekundær — primærkilden er Klimaaftalen for landbruget (juni 2024) + den utvidede politiske avtalen (november 2024). Bruk Concito som tolkningshjelp, ikke som hovedhjemmel. | Gabriel | 30.04 |
| SRC-C-029 | Danske Green Tripartite-claims må primærsjekkes mot Klimaaftalen og november-implementeringsavtalen før KI/report; bruk ikke Concito alene som hjemmel. | Gabriel | 15.05 |
| SRC-C-030 | Svenske styringsgap-claims må sjekkes mot Riksrevisionens metode og Livsmedelsstrategin 2.0-tekst før nordisk policykontrast brukes eksternt. | Gabriel | 15.05 |
| SRC-C-031 | Matsvinnloven kan brukes som norsk policy-/adoption-kilde, men operative pliktclaims må ha eksplisitt ikrafttredelses- og forskriftsstatus. Ikke bruk gammel desember-2024-formulering. | Gabriel | 15.05 |
| SRC-BASE-006 | NIBIO 2024-tall er foreløpige; endelige tall publiseres senere. Selvforsyningsdefinisjonen (med/uten kraftfôrkorreksjon) må alltid spesifiseres ved sitering. | Gabriel | 30.04 |
| SRC-BASE-007 | EEA Country Profiles er sekundær. For tunge claims på utslipp/avfall må det krysslås mot nasjonale primærkilder (Miljødirektoratet, Naturvårdsverket, Statistics Denmark, Statistics Finland, Hagstofa Íslands). | Gabriel | 30.04 |
| SRC-BASE-008 | Luke Balance Sheet er utfaset; sjekk Luke for erstatningsstatistikk (Statistics Finland eller andre Luke-publikasjoner) før den brukes til 2025+. | Gabriel | 30.04 |
| SRC-BASE-009 | Research-dossiers-arkivet er Claude.ai-syntese — kan inneholde feiltolkninger eller hallusinerte referanser. Bruk som rutekart, ikke som karakterprøve. | Gabriel | løpende |

## Notert kildegap

| Tema | Hva mangler | Konsekvens for Insight Pack |
|---|---|---|
| Finansiering | Konkret shortlist med programnavn, frister, eligibility og match til to prosjektideer. | Decision memo kan anbefale retning, men ikke love finansierbarhet før funding map er skjerpet. |
| Aktørvalidering | Ingen ekstern respons fra Volare, AX, Mattilsynet, RecoLab, grossister eller fôraktører er dokumentert ennå. | Alle actor-/pilotclaims må stå som `Utført internt`, ikke `Validert eksternt`. |
| Primærdata for sidestrømmer | Volum per industriaktør/anlegg for okara, bryggerimask, fiskeinnmat, biorest og svartvann er delvis estimert. | Spor B kan beskrive potensial og hypoteser, men bør ikke tallfeste pilotvolum uten manuell sjekk. |
| Regulering for fôrsubstrater | Gjeldende og kommende EU/Mattilsynet-praksis for tidligere matvarer, insekter og avløpsnæring må låses. | Spor A kan ellers overselge regulatorisk handlingsrom. |
| KPI-kobling | Broen mellom sirkularitet, ernæring, klima og biodiversitet er ikke ferdig operasjonalisert. | Roadmap-metrikk må holdes foreløpig til Phase 2-3 har valgt claims og EV-IDer. |
