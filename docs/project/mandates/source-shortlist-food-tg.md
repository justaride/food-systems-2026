---
tittel: Food TG Source Shortlist v0.1
status: Utført internt
eier: Gabriel
sist_oppdatert: 2026-04-27
neste_handling: Brukes som inntak til evidence-matrix-food-tg.md (Phase 2)
relaterte_filer:
  - research/KI-PRIORITY.md
  - research/PLATTFORM-KOBLING.md
  - research/DATA-READINESS-SLUTTRAPPORT.md
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

### Baseline / actor / finance / policy

| ID | Filsti / referanse | Kvalitetstag | Sportag(er) | Notat |
|---|---|---|---|---|
| SRC-BASE-001 | research/DATA-READINESS-SLUTTRAPPORT.md | intern syntese | baseline | Status for datagrunnlag, proveniens, dokumentdekning og kildeberedskap. |
| SRC-BASE-002 | research/PLATTFORM-KOBLING.md | intern syntese | baseline | Kobling mellom seed-data, lokale filer og plattformstruktur. |
| SRC-BASE-003 | research/RESEARCH-MISSIONS.md | intern syntese | baseline | Oversikt over gjennomførte research-spor og gjenstående gap. |
| SRC-BASE-004 | research/VERDIKJEDE-KARTLEGGING-PLAN.md | intern syntese | baseline | Plananker for verdikjede- og systemkartlegging. |
| SRC-BASE-005 | research/norden/verdikjede/10-kryss-analyse.md | intern syntese | baseline, C-adoption | Tverrgående analyse på tvers av nordisk verdikjede og systemgaps. |
| SRC-ACT-001 | src/lib/data/actors.ts | intern syntese | actor | Strukturert aktørgrunnlag i applikasjonen; nyttig som operativ aktørliste, ikke siterbar kilde. |
| SRC-ACT-002 | research/interviews/aktorkart-systematisk-2026.md | intern syntese | actor | Systematisk aktørkart for intervjuer og valideringsplan. |
| SRC-ACT-003 | research/bibliotek/forskningsrunde-2026-04-20-r2/p16-nordiske-do-tanks-stiftelser-2026-04-20.md | uvalidert | actor, finance | Arbeidsnotat om nordiske do-tanks, stiftelser og potensielle støttemiljøer. |
| SRC-ACT-004 | research/bibliotek/forskningsrunde-2026-04-20-r2/p15-axel-johnson-systemet-2026-04-20.md | uvalidert | actor, finance | Arbeidsnotat om Axel Johnson/Axfoundation-systemet som mulig partner- og fundingnode. |
| SRC-FIN-001 | research/evidence-pack/finance-note.md | intern syntese | finance | Eksisterende finance note; må utvides med konkrete programfrister og eligibility. |
| SRC-FIN-002 | research/external/notion/funding-map.md | intern syntese | finance | Notion-speilet funding map; brukes som operativ bruttoliste, ikke som ekstern dokumentasjon. |
| SRC-POL-001 | research/whitepaper/executive-brief.md | intern syntese | policy, baseline | Executive brief om nordisk markedsstruktur og transition levers; må vris mot Circular Food-scope. |

## Kilder som krever manuell sjekk før ekstern bruk

| ID | Hvorfor manuell sjekk | Eier | Frist |
|---|---|---|---|
| SRC-A-007 | Soyaimportvolum og opprinnelsesandeler må tilbake til handelsstatistikk/primærkilde før ekstern bruk. | Gabriel | 29.04 |
| SRC-A-008 | Fiskemelvolum, priser og opprinnelse må sjekkes mot FAO/IFO/handelsdata. | Gabriel | 29.04 |
| SRC-A-009 | EU TSE/ABP-tolkninger må kontrolleres mot gjeldende EU- og Mattilsynet-tekst. | Gabriel | 29.04 |
| SRC-A-010 | AX-prosjektets volum, funding og produktstatus må bekreftes mot Axfoundation eller offentlig prosjektdokumentasjon. | Gabriel/Cathrine | 30.04 |
| SRC-A-011 | Volare-finansiering, kapasitet og kundestatus må valideres mot selskapet/offentlige selskapsdata. | Gabriel/Cathrine | 30.04 |
| SRC-B-011 | Havre-okara-volumer er modellert/estimert og må bekreftes mot produsenter eller industriaktører. | Gabriel | 30.04 |
| SRC-B-013 | RecoLab-tall for tilkoblingsgrad, N/P/K og sluttprodukter må kontrolleres mot NSVA/Helsingborg-kilder. | Gabriel | 30.04 |
| SRC-C-011 | KPI-listen må krysses mot faktiske rapporteringskrav hos SSB, Eurostat/JRC og private aktører. | Gabriel | 30.04 |
| SRC-C-012 | Barriereanalysen er syntetisk og må støttes av primær-/sekundærkilder før den brukes i decision memo. | Gabriel | 30.04 |

## Notert kildegap

| Tema | Hva mangler | Konsekvens for Insight Pack |
|---|---|---|
| Finansiering | Konkret shortlist med programnavn, frister, eligibility og match til to prosjektideer. | Decision memo kan anbefale retning, men ikke love finansierbarhet før funding map er skjerpet. |
| Aktørvalidering | Ingen ekstern respons fra Volare, AX, Mattilsynet, RecoLab, grossister eller fôraktører er dokumentert ennå. | Alle actor-/pilotclaims må stå som `Utført internt`, ikke `Validert eksternt`. |
| Primærdata for sidestrømmer | Volum per industriaktør/anlegg for okara, bryggerimask, fiskeinnmat, biorest og svartvann er delvis estimert. | Spor B kan beskrive potensial og hypoteser, men bør ikke tallfeste pilotvolum uten manuell sjekk. |
| Regulering for fôrsubstrater | Gjeldende og kommende EU/Mattilsynet-praksis for tidligere matvarer, insekter og avløpsnæring må låses. | Spor A kan ellers overselge regulatorisk handlingsrom. |
| KPI-kobling | Broen mellom sirkularitet, ernæring, klima og biodiversitet er ikke ferdig operasjonalisert. | Roadmap-metrikk må holdes foreløpig til Phase 2-3 har valgt claims og EV-IDer. |
