# Food TG Claim-Lock Table 2026-05

**Status:** Intern publikasjonskontroll
**Dato:** 2026-05-21
**Scope-status:** Venter scope- eller minimumsvedtak.
**Bruksregel:** Denne tabellen styrer hva som kan skrives i decision pack, deck, nettside og senere whitepaper. Den erstatter ikke `claim-register-food-tg.md`; den er et smalere kontrollag for publiserbar tekst.

Ingen claim i denne filen er `Validert eksternt`. `klar` betyr bare at claimet kan brukes med oppgitt kilde, caveat og status. `klar-med-forbehold` betyr at det kan brukes internt eller i kontrollert ekstern tekst med tydelig forbehold. `krever-bekreftelse` betyr at claimet ikke skal skrives i faktastemme.

## Wageningen/SRC-B-035 Claim-Gate 2026-05-28

`SRC-B-035` kan brukes som internt metodeanker for Wageningen/Elbersen-score, men det lukker ikke effekt, aktør, juridisk bruk, LCA, KPI eller ekstern validering. Når kilden brukes i Food TG-tekst, må claim-ID, konkret locator, caveat state og åpen valideringsgate stå sammen.

| Claim | Tillatt Wageningen-bruk | Blokkert språk |
|---|---|---|
| `CL-B-008` | Kaskade og høyverdig bruk per fraksjon, lovlig sluttbruk og systemgrense. | Én universell rangering eller klimaeffekt. |
| `CL-B-009` | Designgate for råvarekvalitet, hygiene, stabilisering, lovlig sluttbruk og off-taker. | Pilotklarhet basert på volum eller WUR-score. |
| `CL-B-021` | Kandidat-/benchmarklogikk for okara/BSG og marint restråstoff. | Valgt første pilot eller aktørbekreftet strøm. |
| `CL-B-022` | Valideringsspørsmål for baseline, tidsvindu, destinasjon og kontrafaktisk. | Dokumentert matsvinneffekt eller app-bevis. |
| `CL-B-023` | Benchmark/sekundærspor for nutrient loops med produktstatus, marked og massebalanse som port. | Lettvekts første pilot eller N/P/K-effekt. |
| `CL-C-015` | Datastandard for definisjon, år, geografi, enhet, kilde, dataeier, frekvens, baseline og systemgrense. | WUR-score som KPI-effekt. |

## Statusnøkkel

| Status | Betydning | Ekstern bruk |
|---|---|---|
| `klar` | Primærkilde eller sterkt kildeanker finnes, og claimet er avgrenset. | Kan brukes med kilde, dato, definisjon og caveat. |
| `klar-med-forbehold` | Godt internt grunnlag, men metode, geografi, scope eller aktørdata må forklares. | Kan brukes med tydelig forbehold. |
| `krever-bekreftelse` | Trenger primary-check, aktørvalidering eller juridisk avklaring. | Ikke faktastemme. |
| `maa-harmoniseres` | Claimet finnes i flere versjoner eller blander datalag. | Ikke ekstern bruk før harmonisert. |
| `hold-tilbake` | Mangler kilde, blander datalag eller overdriver pilot/effekt. | Skal ikke brukes. |

## Publikasjonsklarhet per hovedclaim

| Claim | Foreslått publikasjonsformulering | Status | Kildeanker | Må alltid sies | Ikke si | Neste port |
|---|---|---|---|---|---|---|
| `CL-C-011` EUDR, soya og Norge/EU | EUDR gjør soya til et viktig EU-sporbarhets- og compliance-tema, men norsk/EØS-status og praktisk betydning for norske aktører må formuleres separat. | `klar-med-forbehold` | `EV-C-017`, `EV-A-021`, `PCQ-C-001` | Skill EU-scope, norsk rett, eksport til EU og innenlandsk norsk bruk. Bruk absolutte statusdatoer. | "EUDR gjelder direkte i Norge for soya." | Endelig norsk forskrift/EØS-status, Tolletaten/SSB-metode og aktørpraksis. |
| `CL-A-020` alternative fôrproteiner | Encelle-/gjærprotein og andre alternative fôrproteiner er relevante roadmap-spor for importsubstitusjon dersom modenhet, kost, LCA, råvaretilgang, regulatorisk vei og kjøperkrav bekreftes. | `klar-med-forbehold` | `EV-A-001`, `EV-A-018`, `EV-A-019`, `EV-A-021`, `EV-A-022` | Dette er scoping og roadmap-relevans, ikke dokumentert kommersiell substitusjon. | "Teknologien er pilotklar", "dette erstatter soya nå", "bransjen er validert". | NMBU/Foods of Norway, fôraktører, SSB/Tolletaten og regulatorisk sjekk. |
| `CL-A-021` insektprotein på sidestrømmer | Insektprotein kan være en integrert A/B-kandidat først etter juridisk substratgate, risikovurdering, aktørkapasitet og demand-side. | `krever-bekreftelse` | `EV-A-003`, `EV-A-013`, `EV-A-014`, `EV-A-015`, `EV-A-016` | Kjøkken-/matavfall, gjødsel og slam er ikke pilotklare substrater under dagens hovedregel. | "Insektprotein på matavfall er klart", "kategori 3 er nok", "substratet er lovlig". | Mattilsynet/EU/EØS, konkret substratliste, insektaktør og kjøper. |
| `CL-B-008` kaskade og høyverdig bruk | Kaskadebruk må vurderes per fraksjon, lovlig sluttbruk og lokale systemgrenser. | `klar-med-forbehold` | `EV-B-005`, `EV-B-014`, `EV-B-022` | Forebygging, redistribusjon og fôr/ingredienser kan stå sterkt, men rangering er ikke universell. | "Én rangering gjelder alle strømmer", "høyverdig er alltid best". | Fraksjonsspesifikk LCA, regulatorisk status og off-taker. |
| `CL-B-009` designkrav for sidestrømmer | Høyverdig bruk krever låst råvarekvalitet, stabilisering, hygiene, lovlig sluttbruk, sporbarhet og off-taker. | `klar-med-forbehold` | `EV-B-006`, `EV-B-018`, `EV-B-019`, `EV-B-020`, `EV-B-022`, `EV-B-024` | Råvarevolum alene er ikke nok til pilot. | "Stor strøm = god pilot", "volum beviser verdi". | Råvareeier, Mattilsynet/fagekspert, logistikk og kjøper. |
| `CL-B-014` okara/BSG | Okara og bryggerimask er konkrete benchmark og betingede kandidatstrømmer, men norsk/nordisk volum, food-grade, holdbarhet og off-taker må valideres. | `klar-med-forbehold` | `EV-B-011`, `EV-B-018`, `EV-B-019` | Svenske benchmark er læring, ikke norsk pilotbevis. | "Okara/BSG er pilotklart", "nordisk volum er kjent". | Råvareeier, hygiene-/food-grade-gate, stabilisering og off-taker. |
| `CL-B-016` RecoLab/nutrient-loop benchmark | RecoLab/Helsingborg er et relevant nordisk benchmark for kildeseparert avløp og næringsgjenvinning. | `klar-med-forbehold` | `EV-B-013`, `EV-B-015` | Brukes som benchmark; N/P/K, produktstatus og regulatorisk status må låses før tallclaims. | "Kan kopieres som norsk Food TG-pilot", "N/P/K-effekt er dokumentert for oss". | NSVA/Helsingborg, N/P/K-massebalanse, regelverk og norsk overføringsverdi. |
| `CL-B-021` første prosess-sidestrømspilot | En ren prosess-sidestrøm kan bli første B-kandidat hvis råvareeier, hygiene, stabilisering, logistikk, lovlig sluttbruk og kjøper bekreftes. | `krever-bekreftelse` | `EV-B-005`, `EV-B-006`, `EV-B-011`, `EV-B-018`, `EV-B-019`, `EV-B-020`, `EV-B-022`, `EV-B-024`, `EV-C-025`, `EV-ACT-005` | Status er kandidat, ikke pilotklarhet. | "Første pilot er valgt", "aktørene er med", "volumet er klart". | Scope/minimumsvedtak, råvareeierdata, lovlig sluttbruk og off-taker. |
| `CL-B-022` matsvinnkvalitet | Matsvinnkvalitet kan være en rask adoption-kandidat hvis partner dokumenterer baseline, kategori, tidsvindu, destinasjon og rutineendring. | `klar-med-forbehold` | `EV-B-002`, `EV-B-004`, `EV-B-005`, `EV-B-014`, `EV-C-010`, `EV-B-021`, `EV-B-022`, `EV-B-023` | "Måltider reddet" er ikke effektbevis uten baseline og kontrafaktisk. | "Matsvinnkvalitet er dokumentert effekt", "appen alene beviser reduksjon". | Matvett, TGTG, dagligvare/HORECA/offentlig kjøkken og dataeier. |
| `CL-B-023` nutrient loops som sekundærspor | Nutrient loops bør brukes som benchmark og sekundærspor før eventuell pilot. | `klar-med-forbehold` | `EV-B-008`, `EV-B-010`, `EV-B-013`, `EV-B-015`, `EV-B-016`, `EV-B-017`, `EV-B-024` | Tung infrastruktur, regelverk og produktmarked gjør dette lite egnet som første lettvekts-pilot. | "VA/biogass er første Food TG-pilot", "KPI-er er sammenlignbare uten systemgrenser". | Produktstatus, marked, massebalanse, regelverk og systemgrenser. |
| `CL-C-001` adoption som gate | Adoption må forstås som samspill mellom regulering, håndheving, marked, data, drift og governance. | `klar-med-forbehold` | `EV-C-001`, `EV-C-013`, `EV-C-015`, `EV-B-022`, `EV-C-020`, `EV-C-021`, `EV-C-022`, `EV-C-023`, `EV-C-024`, `EV-C-025` | Bruk som gate for A/B, ikke bred policyagenda. | "Markedsmakt forklarer alt", "regelverket beviser adoption". | Aktørintervjuer og konkret kobling til A/B-kandidat. |
| `CL-C-002` offentlig innkjøp | Offentlig innkjøp kan fungere som testarena hvis mål, kontrakt, kjøkkenpraksis, data og leverandørmarked er på plass. | `krever-bekreftelse` | `EV-C-002`, `EV-C-016`, `EV-C-018`, `EV-C-019` | Innkjøp er demand-side-mulighet, ikke dokumentert effekt. | "Offentlige innkjøp vil drive skala", "kommuner er klare". | DFØ/kommunalt kjøkken/leverandørdialog. |
| `CL-C-006` håndheving og rapporteringsvern | Regulering påvirker adoption først når håndheving, rapporteringsvern og faktisk bruk fungerer. | `klar-med-forbehold` | `EV-C-005`, `EV-C-013`, `EV-C-014`, `EV-C-015`, `EV-C-021`, `EV-C-022`, `EV-C-023` | Kilden viser struktur- og rapporteringsrisiko, ikke direkte sirkulær-effekt. | "Overføring til Konkurransetilsynet gir effekt", "leverandører er blokkert". | Konkret aktørdata og oppdatert myndighetspraksis. |
| `CL-C-015` KPI/datastandard | Alle KPI-er må ha definisjon, år, geografi, enhet, kilde, dataeier, frekvens, baseline og systemgrense før de brukes som styring. | `klar` | `EV-C-011`, `EV-A-018`, `EV-A-021`, `EV-B-014`, `EV-C-016`, `EV-C-017`, `EV-C-021`, `EV-C-023`, `EV-C-025` | KPI-er er datagate, ikke effektbevis. | "KPI-er viser måloppnåelse", "score betyr effekt". | Dataeier per A/B/C-kandidat. |
| `CL-C-016` norsk matsvinnlov | Norsk matsvinnlov er vedtatt som LOV-2025-06-20-103, men ikrafttredelse, forskrifter og operative plikter må sjekkes før bruksclaims. | `klar-med-forbehold` | `EV-C-026` | Bruk Lovdata/paragraf og ikrafttredelsesforbehold. | "Loven er operativ plikt nå" uten ikrafttredelse/forskrift. | Lovdata, forskrift og ikrafttredelsesvedtak. |
| `CL-C-017` Danmark Green Tripartite | Danmark Green Tripartite er et nordisk policy-benchmark, men sammenligning må inkludere bunnfradrag, implementering og utslippsbaseline. | `klar-med-forbehold` | `EV-C-027` | 60 prosent bunnfradrag og avtale-/lovstatus må med. | "750 DKK/t er faktisk effektiv sats i 2035" uten fradrag. | Endelig lovtekst, praktisk implementering og felles baseline. |
| `CL-C-018` svensk styringsgap | Sverige kan brukes som styringsgap-case når claimet knyttes til Riksrevisionens avgrensede utslippskategorier. | `klar-med-forbehold` | `EV-C-028` | 68 prosent gjelder organogen jord + drøvtygger-fordøyelse i 2023, ikke alt. | "Sverige mangler virkemidler for alt jordbruk". | Regeringens skrivelse og felles DK/SE/NO-baseline. |

## Påstander som skal holdes tilbake

| Formulering | Status | Riktig håndtering |
|---|---|---|
| EUDR gjelder direkte i Norge for soya. | `hold-tilbake` | Skill EU-scope, norsk/EØS-status og norske aktørers EU-eksport. |
| `210610` er SPC. | `hold-tilbake` | Bruk som bred proteinkonsentratkode, ikke soyaspesifikk SPC. |
| `23099040` er norsk laksefôr eller SPC. | `hold-tilbake` | Bruk som fiskefôr/prepared feed med metodeforbehold. |
| Denofa/Skretting viser norsk bransjesnitt. | `hold-tilbake` | Bruk som actor-/benchmarkdata. |
| Okara/BSG er pilotklart. | `hold-tilbake` | Bruk som benchmark og betinget kandidat. |
| Matsvinnkvalitet er dokumentert effekt. | `hold-tilbake` | Bruk som adoption-hypotese inntil baseline/kontrafaktisk finnes. |
| Marint restråstoff er første B-pilot. | `hold-tilbake` | Bruk som norsk høyverdi-benchmark og fraksjonsspor. |
| RecoLab/VA kan kopieres som norsk Food TG-pilot. | `hold-tilbake` | Bruk som benchmark for governance, produktstatus og massebalanse. |
| KPI-er viser effekt/måloppnåelse. | `hold-tilbake` | Bruk KPI som datagate før effekt. |

## 09.06 samtaleclaims som skal holdes tilbake

Disse formuleringene kommer fra 09.06-samtalen eller nærliggende casehypoteser. De kan brukes som researchspørsmål, men ikke som faktastemme før source shortlist, PCQ og actor validation pack har dokumentert kilde, status og bruksrett.

| Formulering | Status | Riktig håndtering |
|---|---|---|
| Nordic Circular Hotspot, WCEF eller Natural State har en Brasil-MOU om kaffe. | `hold-tilbake` | Bruk som `SRC-0906-001`/`PCQ-0906-001` dokumentask til avtaletekst, partsliste, dato, scope og bruksrett er funnet. |
| Nordic Circular Hotspot har avtale med en organisasjon i Elfenbenskysten om kakao. | `hold-tilbake` | Bruk som `SRC-0906-002`/`PCQ-0906-002` dokumentask til organisasjonsnavn, motpart, avtaletekst og kontaktpunkt er bekreftet. |
| Kaffe/Brasil eller kakao/Elfenbenskysten er klare Food TG-case. | `hold-tilbake` | `DRR-0906-001`/`002` styrker import-/EUDR- og sporbarhetskontekst, men relasjonsclaims løftes først etter MOU/prosjekttekst og actor-/bruksrettsavklaring. |
| Fuglen eller Norsk Kaffeinformasjon er bekreftet prosjektpartner. | `hold-tilbake` | Bruk som mulig kontaktgruppe i actor validation pack, ikke som partnerclaim. |
| Bama har høye vinterimportmarginer eller blokkerer vertical farming/akvaponikk. | `hold-tilbake` | `DRR-0906-005` støtter bred distribusjon/adoption-gate, ikke BAMA-anklage. Krever primærkilde, aktørdata og juridisk aktsomt språk før BAMA-spesifikke claims. |
| Valio eller Finland produserer melk uten importert fôr. | `hold-tilbake` | `DRR-0906-003`/`004` svekker importfritt språk. Trygg intern formulering er soyafri dairy-feed governance med dokumenterte import-gap og `needs-data`. |
| Spillvarme i Norge kan oppgis med bestemt TWh-tall for matproduksjon. | `hold-tilbake` | `DRR-0906-006` gir caseledger-spor, men ikke nasjonalt TWh-claim. Må ha energidefinisjon, lokasjon, temperaturprofil, nyttiggjort varme, eier, økonomi og systemgrense. |
| Danmark har besluttet å redusere svineproduksjon. | `hold-tilbake` | Bruk Danmark som policy-benchmark med primærkilder; skill svin, nitrogen, areal, eksport og Green Tripartite. |
| Polen er en stor sidestrømsmulighet for Food TG. | `hold-tilbake` | `DRR-0906-008` holder Polen som watchlist/kill-test til rapport eller primærdata viser aktør, lokasjon, volum, output og barrierer. |
| Skottland er et dokumentert havbruk-/bioressurs-benchmark for Food TG. | `hold-tilbake` | `DRR-0906-008` gjør Skottland til benchmark-kandidat, men ikke dokumentert Food TG-case før ZWS/SBMT/fulltekst og aktørdata er sjekket. |
| Bacalhau Norge-Brasil er et hovedcase. | `hold-tilbake` | Bruk bare som mulig handels-/relasjonsstøtte hvis handelsdata og Brasil-kobling er relevant for A-sporet. |
| Kaffegrut/biogass eller kaffeverdikjede gir dokumentert utslippskutt for Food TG. | `hold-tilbake` | Behandle som uvalidert B-/C-hypotese til konkret prosjekt, metode, baseline og kontrafaktisk finnes. |
| 100% Fish beviser at norsk sjømat kan løftes direkte til første høyverdi-case. | `hold-tilbake` | `DRR-0906-007` styrker benchmark/designkrav, men svekker bokstavelig 100 prosent, norsk pilotbevis og høyverdiandel-claim uten SINTEF/FHF-fraksjonsdata og aktørvalidering. |
| Kunstgjødselhistorie/Yara/Hydro forklarer Food TGs nutrient-loop-case. | `hold-tilbake` | Bruk kun som kontekst hvis presis primær-/fagkilde finnes; ikke la historielinjen erstatte konkrete nutrient-loop-data. |

## Desk-research-delta 2026-06-12 for 09.06-radene

Desk-research-runden 12.06 (kilder: `SRC-0906-011` til `SRC-0906-015`; logg: `docs/project/analysis/desk-research-logg-dro-0906-2026-06-12.md`) endrer håndteringen av enkelte 09.06-rader. Hold-tilbake-statusen står; deltaene gjelder hva som nå kan sies internt med kilde.

| 09.06-rad | Delta 12.06 |
|---|---|
| Brasil-MOU om kaffe | Uendret hold-tilbake for relasjonsclaim. NYTT: import-/EUDR-konteksten kan brukes internt med tall: Brasil-andel 45–48 % av norsk råkaffeimport 2022–2025, importverdi fra verden ~doblet 2024→2025 (`SRC-0906-011`, internt til autorisert re-trekk). |
| Elfenbenskysten-avtale om kakao | Uendret hold-tilbake for relasjonsclaim. NYTT: «nordiske land importerer kakao direkte fra CI» er motbevist for alle kakaokapitler 1801–1806 (2024); trygg formulering er indirekte eksponering via EU-prosessering/merkevarer. |
| Valio/Finland uten importert fôr | Uendret hold-tilbake. NYTT: nasjonal ramme kan tallfestes internt: Finland importerer ~216 000 t rapsmel/år og 87–144 000 t soyamel/år (2022–2024) — «soyafri ≠ importfri» er kvantifisert på systemnivå. |
| Spillvarme TWh-claim | Uendret hold-tilbake for nasjonalt tall. NYTT: Enova-primærkilden for Wiig/Green Horizon er bekreftet (4 MW initielt, 50–70 °C); driftsstatus fortsatt udokumentert — ikke si «operativt» om Wiig. |
| Skottland som dokumentert benchmark | Uendret hold-tilbake for «dokumentert case». NYTT: ZWS-hovedkilden er fulltekstkontrollert, men datert 31.03.2020 med 2019-survey — all bruk krever aktualitetscaveat. Prisskillet mixed/segregert (£62–173 vs. £250–520/t, 2019) kan brukes internt som høyverdi-argument med årstall. |
| Polen som stor sidestrømsmulighet | Uendret hold-tilbake; watchlist bekreftet ved hurtig kill-test 12.06. |

## Case-avsjekk-delta 2026-06-13

Case-avsjekkpromptene fra 13.06 (`CAP-1306-*`) styrker enkelte interne formuleringer, men åpner ikke ekstern faktastemme. Claim-lock-effekten er å skille datasettgrunnlag, proxypris, aktørgate og benchmark enda tydeligere.

| Claimområde | Delta 13.06 | Claim-lock-effekt |
|---|---|---|
| Marint restråstoff / 100% Fish | SINTEF/FHF 2024 og P-FISH-1 lukker intern norsk volum-/fraksjonsbaseline og norsk-skotsk strukturkontrast; SSB 08801 gir produkt-/eksportverdi, ikke råfraksjonspris. | Tillat intern formulering om volum, utnyttelse, hvitfiskgap og struktur med caveat. Hold tilbake råfraksjonspris, margin, kausalitet mellom struktur og verdi, og direkte Island-Norge-utnyttelsesclaim. |
| Skottland separering | P-SKOT-2 kan brukes som struktur-/separeringsbenchmark sammen med ZWS/Enscape 2019-surveyen. | All bruk må ha årstall og aktualitetscaveat. Ikke si at ZWS-tallene beskriver dagens skotske strømmer eller at de beviser norsk økonomisk premium. |
| Distribusjon/adoption | P-DIST-1 dokumenterer at flere norske CEA-/veksthus-/lokalproduksjonsaktører har oppnådd kanal, og at barrierene er sammensatte. | Tillat intern C-gate/ledger-språk. Hold tilbake BAMA-/Gartnerhallen-blokkering, marginer, onboardingvilkår og juridisk dominans uten primærkilde/aktørgate. |
| Valio/Finland | P-VALIO-1 gir autorisert nasjonal finsk fôrsektor-, Luke- og Uljas-ramme. Det lukker ikke Valios egen fôrkurv. | Tillat intern systemformulering: soyafri governance er ikke importfri fôrkjede. Hold tilbake Valio-andeler, Valio-fôrkurv, PFAD/A-Rehu-generalisering og GM-soya-tall uten manuell avlesning. |

## DRR-0906 ikke-si-konsolidering 2026-06-12

Konsoliderte ikke-si-punkter fra de åtte DRR-rapportene (`research/external/dro-0906/`) som ikke allerede dekkes av radene over. Samme bruksregel som «Påstander som skal holdes tilbake».

| Formulering | Status | Riktig håndtering |
|---|---|---|
| Brasil er lavrisiko under EUDR. | `hold-tilbake` | EU-annekset lister Brasil verken som lav- eller høyrisiko; gjeldende veiledning gir standard risk. Bruk «standard risk» med kildedato. |
| Côte d'Ivoire er high-risk under EUDR. | `hold-tilbake` | EU country classification gir standard risk (3 % kontrollnivå). |
| EUDR gjelder fullt for kakao/kaffe i 2025. | `hold-tilbake` | Anvendelse 30.12.2026 (store/mellomstore) og 30.06.2027 (mikro/små); sjekk konsolidert lovtekst ved bruk. |
| Sertifisering alene beviser EUDR-compliance. | `hold-tilbake` | Sertifisering er sporbarhetsstøtte, ikke DDS-oppfyllelse per leveranse. |
| Menon-rapporten beviser utestengelse fra grossisttjenester. | `hold-tilbake` | Menon fant ingen rapportert tilgangsnekt og kunne ikke konkludere uten interne avtaler. Negativfunnet skal refereres presist. |
| BAMA er juridisk dominerende / misbruker stillingen. | `hold-tilbake` | SØA peker på mulig dominans som problemstilling, ikke rettslig konklusjon. Juridisk aktsomt språk påkrevd. |
| Frövi er datasenterspillvarme. | `hold-tilbake` | Frövi er industriell spillvarme fra papir-/kartongproduksjon (Billerud). Bruk som industri→drivhus-benchmark. |
| Wiig Gartneri-anlegget er operativt. | `hold-tilbake` | Plan-/forstudie- og Enova-kilder finnes; ferdigattest/driftsbevis er ikke funnet. |
| Kviamarka har 492 GWh/år nyttiggjort spillvarme. | `hold-tilbake` | 492 GWh/år er anslått energiforbruk med datasenter, ikke varmeleveranse. |
| Hima produserer 8 000 tonn ørret/år nå. | `hold-tilbake` | 8 000 t/år er skaleringsmål; anlegget er i vekstfase. Testet varmekapasitet er 1,75 MW. |
| Polar DC/Varde er matproduksjonscase. | `hold-tilbake` | Polar har ingen varmemottaker; Varde er i §25-høring (frist 25.06.2026) uten navngitt drivhusoperatør. Benchmark-radar. |
| Island utnytter 100 % av fisken / >90 % betyr høyverdi. | `hold-tilbake` | Matís: 100 % er teoretisk, ikke realistisk. Total utnyttelse ≠ høyverdiandel; norsk baseline er 89 % total, ~15 % human konsum-andel av produktvolum (SINTEF/FHF 2024). |
| A-Rehu er Valios generelle fôrleverandør. | `hold-tilbake` | Dokumentert kun for Startti-kalvedrikkefôr (Varkaus); generell rolle er needs-actor-validation. |
| ZWS-tallene beskriver dagens skotske biproduktstrømmer. | `hold-tilbake` | Survey-data fra 2019, publisert 2025. Bruk med årstall og aktualitetscaveat. |

## Runde 2-delta 2026-06-16 (primæruttrekk)

Primæruttrekkene 16.06 (SSB 08801, DST `GOEDSALG`, WUR Energiemonitor 2024, NSVA Miljörapport 2024, dansk rettsstatus, Oslo øko-innkjøp) er konsolidert i `docs/project/mandates/food-tg-runde2-konsolidering-2026-06-16.md` og lagret i `research/external/r2/`. Deltaet åpner tre nye claims på primærkilde og skjerper forbehold på fire eksisterende. Ingen claim er `Validert eksternt`.

### Nye claims

| Claim | Foreslått publikasjonsformulering | Status | Kildeanker | Må alltid sies | Ikke si | Neste port |
|---|---|---|---|---|---|---|
| `CL-A-022` Norge–Brasil soya/klippfisk-akse | Norge importerer hoveddelen av soyabønnene fra Brasil (~60–80 % av volum 2015–2024) og eksporterer klippfisk/bacalhau tilbake til Brasil — to motstrømmer i samme akse; SSB tabell 08801 er autoritativ. | `klar-med-forbehold` | SSB 08801; Denofa; Felleskjøpet 2025 (jf. `research/external/r2/SSB-08801-norge-brasil-uttrekk-2026-06-16.md`) | Oppgi år og HS-kode; 2025 er foreløpig; «Verden» inkluderer reeksport; verdi i NOK. | «Norge importerer bare brasiliansk soya» (også US/CA/PL); «andelen er stabil» (2025 foreløpig ~42 %). | HS6-full-sum ved behov; NOK→USD for verdisammenligning. |
| `CL-B-024` Nordisk mineralgjødselforbruk N/P/K | Mineralgjødselforbruket i Norden er stort og N-dominert (NO 91 646 t N, SE 219 100 t N, DK 238 846 t N; DK P 16 859 t / K 53 265 t, element-basis) — referansegrunnlag for hvor mye gjenvunnet næring måtte erstatte. | `klar` | NIBIO; SCB; DST `GOEDSALG` (jf. `research/external/r2/STATBANK-dk-island-gjodsel-2026-06-16.md`) | Skill salg/forbruk/produksjon; oppgi gjødselår; P/K i element-basis (ikke P2O5/K2O). | «Gjenvunnet næring kan erstatte all virgin mineral-N»; bland ikke land med ulik definisjon. | Island-verdier (POST-spørring klar); harmonisert nordisk tabell. |
| `CL-C-019` Nederland glastuinbouw energimiks | Nederlandsk veksthus er en gass-/WKK-drevet gjennomstrømningsmodell (fornybarandel 15,1 % i 2024, under nasjonalt snitt), med voksende geotermi og økende ekstern CO2-avhengighet — benchmark for mekanisme, ikke nordisk mal. | `klar-med-forbehold` | WUR Energiemonitor 2024 (Rapport 2025-150, edepot.wur.nl/702373); CBS (jf. `research/external/r2/NL-glastuinbouw-energimiks-2026-06-16.md`) | Benchmark-kontekst (NL), ikke nordisk bevis; oppgi år; WKK gjør sektoren til netto strømeksportør. | «Nederlandsk veksthus = sirkulær mal»; «modellen er fossiluavhengig»; WUR/Moerman som effektbevis. | Nordisk overføringsverdi-vurdering. |

### Oppdaterte forbehold på eksisterende claims

| Claim | Delta 16.06 | Skjerpet forbehold |
|---|---|---|
| `CL-B-016` RecoLab/nutrient-loop benchmark | Realiserte tonn nå kjent og minimale: 2024 = 497 kg struvitt + 629 kg ammoniumsulfat; resten av slam/gråvann returnert til hovedstrøm (NSVA Miljörapport 2024). | Må si: realisert distriktsvis gjenvinning er svært liten (prosesstall ≠ realisert tonn). Ikke si: «RecoLab gjenvinner betydelige årlige N/P/K-tonn». |
| `CL-B-023` nutrient loops som sekundærspor | Bekreftet at Norge ikke har nasjonal realisert aggregat for fiskeslam; SINTEF 89 %-restråstoff er biprodukt, ikke slam. | Ikke si: «SINTEF 89 % viser næringsgjenvinning fra slam». |
| `CL-C-002` offentlig innkjøp | Oslo målt øko-andel 2,5 % (2018); 50 %-mål fjernet i matplan 2023; metrikk byttet til kjøttreduksjon/svinn/plantebasert. | Må si: Norge har byttet styringsmål bort fra øko-andel; København-sammenligning rammer virkemiddelvalg, ikke norsk «underprestasjon». |
| `CL-C-017` Danmark Green Tripartite | CO2e-avgift verifisert IKKE vedtatt lov per 16.06.2026 — fortsatt politisk aftale; sats 300→750 DKK/t (60 % bunnfradrag → effektivt 120/300), start 2030; ingen lovpålagt buskapsreduksjon. | Ikke si: «Danmark har en CO2-avgift på landbruk (nå)» (avtalt, virkning 2030); «Danmark har vedtatt buskapsreduksjon». |

### Hold-tilbake-rader som runde 2 berører

| Eksisterende rad | Delta 16.06 |
|---|---|
| «Bacalhau Norge-Brasil er et hovedcase» | Uendret som «hovedcase». NYTT: handelsstøtte for A-sporet kan tallfestes internt på SSB-primær — Brasil ~60–80 % av norsk soyaimport-volum 2015–2024; klippfisk til Brasil ~11 % av norsk klippfiskeksport 2024 (SSB 08801). |
| «Danmark har besluttet å redusere svineproduksjon» | Bekreftet hold-tilbake: ingen lovpålagt buskapsreduksjon per 16.06.2026 (kun valgkamputspill mars 2026). |
| «Kunstgjødselhistorie/Yara forklarer nutrient-loop-case» | Uendret. NYTT: nordisk mineral-N-forbruk er nå primærtallfestet (jf. `CL-B-024`) som referanseramme — bruk tall, ikke historielinje. |

## Runde 3-delta 2026-06-17 (datahull-lukking)

Runde-3-uttrekkene (DRO-R3-01..04, arkivert i `research/external/r3/`) ga få nye tall, men avklarte hull og **korrigerer ett tidligere forbehold**. Konsolidert i `docs/project/mandates/food-tg-runde3-mottak-2026-06-17.md`.

### Korreksjon til `CL-A-022` (2025-soya)

Det foreløpige 2025-fallet i Brasils soyaandel (~42 %) er **ikke et dokumentert skifte**. SSB 2025 er foreløpig (endelig mai 2027), og detaljceller kan revideres betydelig. Selskapskilder viser ingen Brasil-exit: Denofa 2024 = 68 % Brasil / 12 % Romania / 10 % Polen / 10 % Canada; Felleskjøpet 2024 og 2025 = Brasil/USA/Canada/Polen. Ingen primærkilde for Paraguay/Argentina som nye hovedland.

**Oppdatert «ikke si» for `CL-A-022`:** «Brasil-andelen falt i 2025» som etablert faktum; «EUDR har flyttet norske kjøp bort fra Brasil» (dokumentasjonen gjelder sporbarhet/sertifisering i en fortsatt Brasil-ledet kjede, ikke utfasing).

### Nye deckklare fakta (med forbehold)

| Felt | Tall | Kilde | Status |
|---|---|---|---|
| Norsk biorest produsert | 218 000 t avvannet + 370 000 t flytende (2022); 84 % spredd på jordbruksareal | Landbruksdirektoratet rapport 17/2024 (Biogasstatistikk 2022) | deckklart internt |
| Norsk fiskeslam, realiserte enkeltanlegg | Cermaq Forsan ~260 t TS/år (biogass); Norcem Kjøpsvik ~40 t (energi); IVAR Minorga ~4 200–4 600 t blandet gjødsel/år 2022–24 (eksport Vietnam) | Sterner; Heidelberg; IVAR årsrapporter | deckklart internt (anleggsnivå) |
| Denofa opprinnelsesmiks 2024 | 68 % Brasil, 12 % Romania, 10 % Polen, 10 % Canada | Denofa due diligence 2024 | deckklart internt |

### Bekreftede hull (styrker potensial-vs-realisert-narrativet)

| Hull | Status etter runde 3 |
|---|---|
| Realisert digestat-N/P/K-retur (DK/FI/NO/IS) | Bekreftet **reelt data-arkitektur-hull** — ingen nasjonal næringsretur-statistikk utenom Sverige. Norge har biorest-mengde + 84 % jordbruksbruk, men ikke N/P/K-tonn. |
| Norsk fiskeslam-aggregat per sluttbruk | Bekreftet **finnes ikke** (Fiskeridir/SSB/Miljødir/Mattilsynet). Beste offisielle spor: Miljødir 2018 ~1 000 t TS fiskeslam til 2 biogassanlegg. |
| Island mineralgjødsel N/P/K | Fortsatt `needs-data` — verdiene ikke uttrukket (eksport-blokkert). NYTT forbehold: basis-konflikt (nåværende PxWeb-etikett `P`/`K` vs. eldre Hagstofa-årbok `P2O5`/`K2O`) — basis må verifiseres før Island legges i element-basis-serien. |

## R14 GAP-005-delta 2026-07-04 (smal claim-lock)

R14 åpner bare én GAP-005-rad som kontrollert statusclaim i denne runden. REKO- og andelslandbrukstallene beholdes som historiske kandidater fordi de ikke skal leses som nåtidsstatus, og VK4-GAP-007/næringsstoffgap holdes fortsatt tilbake til N/P/K-massebalanse finnes per strøm.

| Claim | Foreslått publikasjonsformulering | Status | Kildeanker | Må alltid sies | Ikke si | Neste port |
|---|---|---|---|---|---|---|
| `CL-R14-GAP-005-REST` Restaurant Rest konkursstatus | Restaurant Rest AS (org.nr. 919 972 696) er et norsk matsvinn-til-gourmet-case der R13/Forvalt-lokator dokumenterer konkurs åpnet 2024-09-05; Brreg Enhetsregisteret bekrefter org.nr./navn og slettedato 2025-06-18 ved oppslag 2026-07-04. | `klar-med-forbehold` | `research/external/r13/R13-GAP-005-parkerte-claims-verifisering.md`; `research/_status/food-tg-r14/claim-lock-kandidater.md`; Brreg Enhetsregisteret API `https://data.brreg.no/enhetsregisteret/api/enheter/919972696` (accessed 2026-07-04). | Bruk kun som status-/casehendelse med dato, org.nr. og kildeport. Skill Forvalt-konkursdato fra vanlig Enhetsregister-oppslag, som viser slettet enhet men ikke konkursdato. | "Konkursen beviser miljøeffekt, teknologisvikt, etterspørselssvikt eller at matsvinn-til-gourmet ikke fungerer." | Før ekstern publisering: legg inn direkte Konkursregister-/Forvalt-utskrift eller Brreg-kunngjøringslocator som `sourceCitationId` hvis tilgjengelig. |

### R14-kandidater som ikke åpnes her

| Kandidat | Håndtering | Stopplinje |
|---|---|---|
| REKO-tall 2022 | Beholdes som historisk claim-lock-kandidat: "REKO Norge oppga i 2022 over 140 ringer, om lag 500 000 kunder og over 600 produsenter." | Ikke bruk som dagens/2025/2026-tall, ikke som unike eller betalende kunder. |
| Andelslandbruk 93 / 2023 | Beholdes som historisk claim-lock-kandidat: "Landbruksdirektoratet/Økologisk Norge brukte 93 andelslandbruk i drift som 2023-anker." | Ikke bruk som dagens aktivstatus per gård; actor-gate må lukkes først. |
| VK4-GAP-007 næringsstoffgap | Ikke åpnet. Krever primær N/P/K-massebalanse per strøm og skille mellom modellert, realisert, potensial og plan. | Ikke si at 25-30 % er dokumentert norsk realisert gjenvinningspotensial. |

## Neste arbeid

1. Oppdater tabellen etter hver primary-check og aktørrespons.
2. Legg inn faktisk `sourceCitationIds` eller locator når claimet flyttes nær ekstern bruk.
3. Bruk `food-tg-deep-research-source-intake-2026-06-10.md` som 10.06-kildeinntak for `SRC-0906-*`/`PCQ-0906-*`; intake styrker arbeidsgrunnlaget, men åpner ingen claim-lock-rad alene.
4. Bruk `food-tg-deep-research-prompt-pack-2026-06-10.md` for videre casevis Deep Research og post-research validering; prompt-output kan styrke eller svekke arbeidsgrunnlag, men åpner ikke claim alene.
5. Bruk `food-tg-casekort-og-research-mottak-2026-06-10.md` som mottaks- og importgate før nye Deep Research-funn påvirker claim-lock, PCQ eller actor validation pack.
6. Bruk `food-tg-deep-research-results-intake-2026-06-10.md` som resultatlogg for de åtte mottatte outputene; den skjerper hold-tilbake-språk, men åpner ingen claim alene.
7. Oppdater 09.06-radene etter `SRC-0906-*`, `PCQ-0906-*` og actor validation pack har ny dokumentasjon.
8. Bruk denne filen som gate før `food-tg-public-language-bank-v0.1.md`, decision deck og roadmap skrives.
