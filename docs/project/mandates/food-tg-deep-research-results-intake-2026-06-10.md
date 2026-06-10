---
tittel: Food TG Deep Research Results Intake 2026-06-10
status: Aktiv intern
eier: Gabriel
dato: 2026-06-10
scope: Kontrollert mottak av Deep Research-resultater fra Downloads etter 09.06-/10.06-casepromptene.
relaterte_filer:
  - docs/project/mandates/food-tg-casekort-og-research-mottak-2026-06-10.md
  - docs/project/mandates/food-tg-deep-research-prompt-pack-2026-06-10.md
  - docs/project/mandates/food-tg-dokumentask-og-actor-ask-pack-2026-06-10.md
  - docs/project/mandates/food-tg-0906-sprintboard-go-no-go-2026-06-10.md
  - docs/project/mandates/source-shortlist-food-tg.md
  - docs/project/mandates/primary-check-queue-food-tg-v0.1.md
  - docs/project/mandates/food-tg-claim-lock-table-2026-05.md
---

# Food TG Deep Research Results Intake 2026-06-10

Dette dokumentet registrerer nye Deep Research-resultater som eksterne arbeidsnotater. Raw filer blir liggende i `Downloads` og kopieres ikke inn i repoet. Innholdet under er et kontrollert mottak: hva outputen peker mot, hva den svekker, hvilke primærkilder som bør vurderes senere, og hvilken importbeslutning som gjelder før source-shortlist, PCQ, claim-lock eller actor validation pack endres.

## Bruksregel

1. Bruk denne filen som arbeidslogg for outputene, ikke som siterbar kilde.
2. Løft ingen claim til ekstern faktastemme kun basert på Deep Research-output.
3. Skill alltid mellom dokumentert aktør-/myndighetskilde i outputen og outputens egen analyse.
4. Nye primærkildekandidater må hentes, åpnes og locator-sjekkes før de legges inn som siterbar kilde.
5. Hvis outputen svekker et claim, oppdater claim-lock-språk og casekort før deck-språk.
6. Hvis outputen bare gir benchmark, bruk `benchmark-only` eller `benchmark-kandidat`.
7. Hvis aktørrolle, bruksrett, sitat eller datatilgang trengs, gå via dokumentask/actor-ask.

## Resultatlogg

| DRR-ID | Outputfil i Downloads | Knyttet DRO | Knyttet PCQ/SRC/DASK | Kontrollstatus | Importbeslutning | Neste handling |
|---|---|---|---|---|---|---|
| DRR-0906-001 | `/Users/gabrielfreeman/Downloads/deep-research-report (7).md` | `DRO-0906-001` Brasil/kaffe | `PCQ-0906-001`, `PCQ-0906-003`; `SRC-0906-001`, `SRC-0906-003`; `DASK-0906-001`, `DASK-0906-003` | `needs-actor-validation` + `needs-primary-check` | Registrer som resultatmottak; behold MOU-/kaffeprosjekt-claim i hold-tilbake. Vurder primærkildekandidater senere, ikke importer output. | Be Natural State/NCH/Nordic Innovation om avtale, annex, deltakerliste eller kaffe-workstream; bygg eventuelt separat import-/EUDR-kaffecase uten MOU-claim. |
| DRR-0906-002 | `/Users/gabrielfreeman/Downloads/_EUDR-_sporbarhetscase Deep Research.md` | `DRO-0906-002` Elfenbenskysten/kakao | `PCQ-0906-002`; `SRC-0906-002`; `DASK-0906-002` | Relasjon: `needs-primary-check`; EUDR/sporbarhet: `deckklart internt` med caveat; reststrøm: `watchlist` | Registrer som resultatmottak; skjerp skillet mellom MOU-relasjon og EUDR-/kakao-sporbarhet. | Først få MOU/LOI eller skriftlig avkreftelse fra Natural State/NCH/LEAD Ivory Coast; deretter hente Conseil du Cafe-Cacao-dokumenter og nordisk verdikjededata. |
| DRR-0906-003 | `/Users/gabrielfreeman/Downloads/“importfritt fôr”-case.md` | `DRO-0906-003` Valio/Finland | `PCQ-0906-006`; `SRC-0906-006`; `DASK-0906-004` | `deckklart internt` med caveat for soyafri governance; `needs-data`; importfritt-claim svekket | Registrer som hovedresultat for Valio. Oppdater claim-lock-effekt: ikke bruk "importfritt fôr". | Be Valio om fôrstandard/kvalitetshåndbok og aggregert fôrkurv 2022-2025; trekk Ruokavirasto/Tulli-data for fôrimport. |
| DRR-0906-004 | `/Users/gabrielfreeman/Downloads/oyafritt dairy-feed governance-case.md` | `DRO-0906-003` Valio/Finland | `PCQ-0906-006`; `SRC-0906-006`; `DASK-0906-004` | Duplikat/parallelldokument som bekrefter DRR-0906-003-retning | Ikke egen caseimport. Bruk som konsistenskontroll for Valio-raden. | Slå sammen funn i Valio-mottaksrad og behold ett casekort. |
| DRR-0906-005 | `/Users/gabrielfreeman/Downloads/Bama-case”.md` | `DRO-0906-004` Bama/grøntgrossist/adoption | `PCQ-0906-004`; `SRC-0906-004`; `DASK-0906-005` | `deckklart internt som C-gate`; `needs-actor-validation`; `needs-data`; ikke modent som BAMA-anklage | Registrer som resultatmottak. Endre foretrukket casenavn til "distribusjon/adoption-gate for norsk frukt og grønt". | Aktørvalidere BAMA/Gartnerhallen/alternative kanaler og hente produkt-/månedstall for CEA-relevante varer. |
| DRR-0906-006 | `/Users/gabrielfreeman/Downloads/Green Mountain–Hima.md` | `DRO-0906-005` spillvarme/drivhus/akvaponikk | `PCQ-0906-005`; `SRC-0906-005`; `DASK-0906-006` | Hima: `deckklart internt` med datagap; Frövi: `benchmark-radar`; Wiig/Kviamarka/Varde: `needs-primary-check`; Polar: parkert som matcase | Registrer som resultatmottak. Skjerp mini-ledger og ikke-si-liste om elektrisk kapasitet vs nyttiggjort varme. | Hent driftsdata fra Green Mountain/Hima; drep/valider Wiig via Klepp/Enova; hold Varde/Polar som benchmark/radar. |
| DRR-0906-007 | `/Users/gabrielfreeman/Downloads/100% Fish_Iceland Ocean Cluster.md` | `DRO-0906-006` 100% Fish/marint restråstoff | `PCQ-B-005`; `DASK-0906-007` | `benchmark-only` + `deckklart internt` med claim-lock; `needs-data` for høyverdiandel | Registrer som resultatmottak. Bruk 100% Fish som designbenchmark, ikke norsk pilotbevis. | Ekstraher Statistics Iceland-data; be IOC om claim-metode; be SINTEF/Kontali/FHF om fraksjons- og høyverdiuttrekk. |
| DRR-0906-008 | `/Users/gabrielfreeman/Downloads/Food TG-case.md` | `DRO-0906-007` Skottland/Polen | `PCQ-0906-007`; `SRC-0906-007`, `SRC-0906-008`; `DASK-0906-008`, `DASK-0906-009` | Skottland: `benchmark-kandidat` + `needs-primary-check`; Polen: `watchlist` + `needs-data` | Registrer som resultatmottak. Skill Skottland og Polen i videre arbeid. | Hent ZWS 2025 fulltekst og SBMT-data dictionary; kill-test Polen med GUS/PROM/CDR/SIR og EMFAF-prosjekter. |

## Casevis kontrollnotat

### DRR-0906-001: Brasil/kaffe

**Hva outputen styrker:** Brasil/kaffe er troverdig som importverdikjede- og EUDR-spor. Norge har relevante importdata, og det finnes aktør- og institusjonsspor rundt Nordic Night/WCEF, Nordic Circular Hotspot, Natural State, Exchange4Change, Fuglen, Nordic Approach, Norsk Kaffeinformasjon og CONAB.

**Hva outputen svekker:** Offentlig MOU-/avtaletekst, coffee-specific annex, prosjektfil eller pilotmemo ble ikke funnet. Det er dermed ikke grunnlag for å si at Brasil-kaffe er et dokumentert Natural State/NCH-prosjekt.

**Primærkildekandidater å hente før shortlist:** Nordic Innovation eventside for Nordic Night; WCEF Nordic Stage; Nordic Innovation Annual Report 2025; Natural State Market Development; EU EUDR guidance/FAQ/annex; CONAB Parque Cafeeiro; Norsk Kaffeinformasjon importtabell; WITS/Comtrade; Nordic Approach EUDR-artikkel; Fuglen origin-materiale; ICP/Joh. Johannson Brazil project.

**Ikke si:** Ikke si at Natural State/NCH har offentlig Brasil-kaffe-MOU, at Fuglen/Norsk Kaffeinformasjon er bekreftede partnere, at Brazil er low-risk under EUDR, eller at kaffegrut/biogass er validert norsk Food TG-pilot.

**Importbeslutning:** Oppdater mottakslogg og PCQ-effekt. Ikke legg kilder inn i source-shortlist før hver URL/PDF er hentet og locator-sjekket.

### DRR-0906-002: Elfenbenskysten/kakao

**Hva outputen styrker:** Kakao/Cote d'Ivoire er en sterk EUDR-/sporbarhets- og avskogingscasekandidat for intern analyse. Outputen peker til EU-regler, country classification, myndighetsomtalt sporbarhetssystem, produsentkort, Conseil du Cafe-Cacao, FAO/World Bank/ICCO, og nordiske aktørspor som Fazer.

**Hva outputen svekker:** Signert MOU, avtaletekst, LEAD Ivory Coast-bekreftelse og offentlig prosjektarkiv ble ikke funnet. Direkte nordisk råkakaoimport fra Cote d'Ivoire ser svakt ut i åpne HS180100-tabeller; nordisk relevans må bygges på merkevare-/leverandørkjeder og bearbeidede produkter.

**Primærkildekandidater å hente før shortlist:** Natural State LinkedIn-post; Nordic Innovation/NCH-sider; EU EUDR pages og country classification; Cote d'Ivoire government portal om traceability/produsentkort; FAO PROMIRE/Sustainable Cocoa Initiative; World Bank; ICCO produksjonsstatistikk; WITS/Comtrade; Fazer Annual Review 2024; WCF CFI action plans; Rainforest Alliance; Barry Callebaut.

**Ikke si:** Ikke si at signert MOU finnes, at WCEF/NCH har dokumentert Cote d'Ivoire-kakaoprosjekt, at nordiske land importerer store mengder råkakao direkte fra Cote d'Ivoire, eller at kakaoreststrømmer er skalert pilotcase.

**Importbeslutning:** Oppdater mottakslogg med todelt status: relasjon/MOU forblir `needs-primary-check`, mens EUDR/sporbarhet kan brukes internt med caveat og kildeport.

### DRR-0906-003 og DRR-0906-004: Valio/Finland

**Hva outputene styrker:** Valio er et godt internt governance-case for soyafri melkefôrpraksis i Finland, grasbasert fôringssystem, kvalitets-/fôringsprinsipper, gårdsbesøk, GMO-/fôropprinnelseskontroll og importavgrensning.

**Hva outputene svekker:** "Importfritt fôr" er tydelig svekket. Valio-kildene peker på importert rapsmel, vitaminer/mineraler og nasjonalt gap i supplerende planteprotein.

**Primærkildekandidater å hente før shortlist:** Valio soy policy; Valio 2018 soy decision; Valio Sustainability Review 2024; Valio fôrråvareartikkel 2020; Valio GMO/kvalitetsmanual-artikkel; Valio biodiversity; Valio sustainability bonus 2026; Valio Startti; A-Rehu/Atria; Luke import/input-analyse; NESA/Luke 2026; Ruokavirasto feed statistics/import; MMM Rehut; Tulli/Uljas.

**Ikke si:** Ikke si at Valio bruker importfritt fôr, at Valios fôr er 100 prosent finsk, at soyafri betyr importfri, eller at A-Rehu er dokumentert generell Valio-melkekufôrleverandør.

**Importbeslutning:** Slå sammen de to Valio-outputene i én mottaksrad. Oppdater claim-effekt: soyafri governance kan være intern slide med caveat; importfritt språk skal ut.

### DRR-0906-005: Bama/grøntgrossist/adoption

**Hva outputen styrker:** Distribusjon, grossistledd, kaldkjede, produksjonsplanlegging, sortimentskrav og kundekanaler er en plausibel og kildeunderbygget C-gate for ny lokal produksjon. BAMA er dokumentert sentral node i frukt-/grøntverdikjeden.

**Hva outputen svekker:** Outputen finner ikke offentlig primærkilde for at BAMA blokkerer hydroponi/vertical farming/lokal produksjon, og ikke offentlig primærkilde for produktspesifikke BAMA-/grossistmarginer.

**Primærkildekandidater å hente før shortlist:** BAMA årsrapport 2023; BAMA bærekraftsrapport 2023; BAMA Åpenhetsloven 2024; BAMA Code of Conduct; Konkurransetilsynet Dagligvarerapport 2022 og 2025; SØA EMV/vertikal integrasjon; Menon 177/2024; OFG/Grøntinnsikt 2025; Landbruksdirektoratet Markedsrapport 2025; SINTEF/Landbruksdirektoratet vertical farming; Gartnerhallen årsrapport 2024; Coop/Avisomo som kontrollbenchmark.

**Ikke si:** Ikke si at BAMA blokkerer, har konkrete marginer, misbruker dominerende stilling, eller at Menon beviser utestengelse.

**Importbeslutning:** Oppdater casenavn i mottak/sprintboard til "distribusjon/adoption-gate for norsk frukt og grønt" med BAMA/Gartnerhallen som sentrale noder, ikke som anklagebærende case.

### DRR-0906-006: Green Mountain-Hima/spillvarme

**Hva outputen styrker:** Green Mountain-Hima på Rjukan er sterkeste operative datasenter-til-matproduksjon-case i denne runden. Outputen skiller også nyttige benchmark: Frövi som industriell spillvarme-til-drivhus, Polar som kost-nyttebenchmark, Varde/Krageris som planbenchmark, og Wiig/Kviamarka som plan-/forstudiespor.

**Hva outputen svekker:** Ett samlet nordisk trendclaim eller et bestemt TWh-claim for datasentervarme til matproduksjon er ikke støttet. Flere prosjekter er plan, scenario eller ikke datasenterbasert.

**Primærkildekandidater å hente før shortlist:** Green Mountain heat reuse/Hima-sider og pressemelding; WA3RM/Frövi; Nevel; Time kommune forstudie; Statsforvalteren/Hå/Kviamarka; Drangedal/Sweco Polar DRA02 kost-nytteanalyse; Varde Kommune §25-utkast og prosjektinfo; NVE kost-nyttekrav.

**Ikke si:** Ikke si at nordiske datasentre leverer et bestemt TWh-volum til matproduksjon, at Frövi er datasentervarme, at Wiig er operativt uten ferdigattest/driftsbevis, at Kviamarka 492 GWh er nyttiggjort varme, eller at Polar DC er matproduksjonscase.

**Importbeslutning:** Oppdater mottak med caseledger-logikk. Hima kan brukes internt med datagap; resten holdes som benchmark/radar eller primary-check.

### DRR-0906-007: 100% Fish/Iceland Ocean Cluster

**Hva outputen styrker:** 100% Fish/Iceland Ocean Cluster er nyttig designbenchmark for clusterlogikk, fraksjonskart, produktkaskade og høyere verdimiks. SINTEF/FHF 2024 gir sterk norsk baseline for marint restråstoff.

**Hva outputen svekker:** Bokstavelig 100 prosent utnyttelse, islandsk claim som norsk pilotbevis og høyverdiandel som automatisk følger av total utnyttelse er svekket. Norsk baseline viser høy total utnyttelse, men høyverdiandel må skilles ut.

**Primærkildekandidater å hente før shortlist:** IOC/100% Fish-presentasjoner; Matís whitefish by-products; Statistics Iceland/PxWeb; SINTEF/FHF 2024; FHF prosjektarkiv 901844; Nofima barriererapport/OptiBruk; SUPREME; Mattilsynet ABP/hydrolysert protein; NCE Seafood/IOC MoU 2017.

**Ikke si:** Ikke si at Island bruker 100 prosent av hver fisk, at 100% Fish er norsk pilot, at >90 prosent totalutnyttelse er høyverdiandel, eller at norsk 2024-baseline er lavere gammel IOC/McKinsey-graf.

**Importbeslutning:** Oppdater mottak og PCQ-B-005-effekt. Bruk som benchmark-only med claim-lock.

### DRR-0906-008: Skottland/Polen

**Hva outputen styrker:** Skottland er en seriøs benchmark-kandidat for bioressurskartlegging, seafood-sidestrømmer, bioeconomy policy og aktørplattform. Polen har statistikk-, matsvinn- og governance-verdi.

**Hva outputen svekker:** Polen er ikke modent som direkte sidestrømvaloriseringscase uten aktør/lokasjon/volum/output. Skottland er heller ikke ferdig Food TG-case uten fulltekstkontroll, datatilgang og aktørvalidering.

**Primærkildekandidater å hente før shortlist:** Zero Waste Scotland fish processing by-products; ZWS Biorefining Potential; Scottish Bioresource Mapping Tool/IBioIC; Ricardo method notes; ZWS beer/whisky/fish sector study; Scottish Government CE strategy 2026, aquaculture vision, Blue Economy review og fish farm survey; Scottish Ocean Cluster/Seafood Scotland; Scottish Parliament answer; Statistics Poland/GUS; PROM; NIK; CDR/SIR agro-food waste; EMFAF Poland.

**Ikke si:** Ikke si at Skottland er dokumentert Food TG-case, at Scottish Ocean Cluster beviser faktisk 100 prosent utnyttelse, at fangstvolum er sidestrømvolum, eller at Polen er stor sidestrømsmulighet uten konkrete materialstrømmer.

**Importbeslutning:** Oppdater mottak og sprintboard med separat løp: Skottland som benchmark-kandidat, Polen som watchlist/kill-test.

## Konsolidert importbeslutning

| Kontrollfil | Beslutning nå | Begrunnelse |
|---|---|---|
| `food-tg-casekort-og-research-mottak-2026-06-10.md` | Oppdater alle syv mottaksrader med outputfil, status, claim-effekt, PCQ-effekt og neste handling. | Outputene er mottatt og kan sorteres mot eksisterende DRO-struktur. |
| `food-tg-0906-sprintboard-go-no-go-2026-06-10.md` | Oppdater nå-status og neste handling. | Sprintboardet skal vise at research er mottatt og hva som er go/no-go-retning. |
| `primary-check-queue-food-tg-v0.1.md` | Legg inn referanse til denne intakefilen og skjerp 09.06-radene ved behov. | PCQ forblir åpen; flere funn peker mot konkrete primærsjekker. |
| `source-shortlist-food-tg.md` | Legg inn referanse, men ikke nye siterbare kilder i samme pass. | Kildekandidatene må hentes og locator-sjekkes først. |
| `food-tg-claim-lock-table-2026-05.md` | Legg inn referanse og skjerp hold-tilbake-språk der outputen svekker claim. | Valio/importfritt, BAMA-blokkering, 100% Fish, MOU og spillvarme claims må fortsatt holdes lukket. |
| `actor-validation-pack-food-tg-v0.1.md` | Ingen ny outreach; bruk eksisterende AASK/DASK-struktur. | Outputene peker på aktører, men outreach krever separat gate. |
| Raw Deep Research-filer | Ikke importer. | De er arbeidsnotater i Downloads inntil separat beslutning. |

## Prioritert neste arbeid

1. Kjør dokumentask for Brasil/NCH/Natural State og Cote d'Ivoire/LEAD først, fordi relasjonsclaims enten modnes raskt eller bør parkeres.
2. Lås trygg Valio-formulering: soyafri governance, ikke importfritt fôr.
3. Endre BAMA-sporet til distribusjon/adoption-gate og hent produkt-/månedstall for utvalgte CEA-relevante varer.
4. Bygg mini-ledger for Hima, Frövi, Wiig, Kviamarka, Varde og Polar med operativ status, energitype, nyttiggjort varme, temperatur, off-taker og datagap.
5. Bruk 100% Fish som benchmark-only mens norsk fraksjons- og høyverdidata trekkes fra SINTEF/FHF og eventuelle aktører.
6. Fulltekstkontroller Skottland-kildene før Polen får mer tid. Polen forblir watchlist med kill-test.
