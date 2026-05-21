# Food TG Claim-Lock Table 2026-05

**Status:** Intern publikasjonskontroll
**Dato:** 2026-05-21
**Scope-status:** Venter scope- eller minimumsvedtak.
**Bruksregel:** Denne tabellen styrer hva som kan skrives i decision pack, deck, nettside og senere whitepaper. Den erstatter ikke `claim-register-food-tg.md`; den er et smalere kontrollag for publiserbar tekst.

Ingen claim i denne filen er `Validert eksternt`. `klar` betyr bare at claimet kan brukes med oppgitt kilde, caveat og status. `klar-med-forbehold` betyr at det kan brukes internt eller i kontrollert ekstern tekst med tydelig forbehold. `krever-bekreftelse` betyr at claimet ikke skal skrives i faktastemme.

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

## Neste arbeid

1. Oppdater tabellen etter hver primary-check og aktørrespons.
2. Legg inn faktisk `sourceCitationIds` eller locator når claimet flyttes nær ekstern bruk.
3. Bruk denne filen som gate før `food-tg-public-language-bank-v0.1.md`, decision deck og roadmap skrives.
