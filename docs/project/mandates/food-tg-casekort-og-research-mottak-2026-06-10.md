---
tittel: Food TG Casekort og Research-mottak 2026-06-10
status: Aktiv intern
eier: Gabriel
dato: 2026-06-10
scope: Casekort v0.1 og mottakslogg for Deep Research-output knyttet til 09.06-/10.06-casegrunnlaget.
relaterte_filer:
  - docs/project/mandates/food-tg-case-shortlist-addendum-2026-06-09.md
  - docs/project/mandates/food-tg-deep-research-source-intake-2026-06-10.md
  - docs/project/mandates/food-tg-deep-research-prompt-pack-2026-06-10.md
  - docs/project/mandates/source-shortlist-food-tg.md
  - docs/project/mandates/primary-check-queue-food-tg-v0.1.md
  - docs/project/mandates/food-tg-claim-lock-table-2026-05.md
  - docs/project/mandates/actor-validation-pack-food-tg-v0.1.md
  - docs/project/mandates/food-tg-dokumentask-og-actor-ask-pack-2026-06-10.md
  - docs/project/mandates/food-tg-0906-sprintboard-go-no-go-2026-06-10.md
  - docs/project/mandates/food-tg-deep-research-results-intake-2026-06-10.md
  - docs/project/mandates/food-tg-primarkilde-og-datakontroll-ledger-2026-06-10.md
  - docs/project/mandates/food-tg-research-intake-decision-pack-2026-06-10.md
  - docs/project/analysis/case-avsjekk/mottak-deep-research-1206-2026-06-13.md
---

# Food TG Casekort og Research-mottak 2026-06-10

Dette dokumentet er mottakspunktet for nye Deep Research-outputer i 09.06-/10.06-sprinten. Det kombinerer casekort v0.1, mottakslogg, importregler og neste handling per case, slik at nye rapporter ikke blir løse arbeidsnotater.

For samlet prioritering, go/no-go og deck-readiness brukes `food-tg-0906-sprintboard-go-no-go-2026-06-10.md`. For mottatte resultater fra 10.06 brukes `food-tg-deep-research-results-intake-2026-06-10.md` som detaljert resultatlogg før nye kildekandidater eventuelt legges inn i source-shortlist eller PCQ. For 72t kilde-/datakontroll brukes `food-tg-primarkilde-og-datakontroll-ledger-2026-06-10.md`, og for samlet beslutning brukes `food-tg-research-intake-decision-pack-2026-06-10.md`.

## Bruksregel

Dette er et internt kontroll- og sorteringsdokument. Det gir ikke ekstern valideringsstatus, åpner ikke outreach og kopierer ikke raw Deep Research-output inn i repoet. Nye outputer skal først kjøres gjennom valideringsprompten i `food-tg-deep-research-prompt-pack-2026-06-10.md` før de kan påvirke source shortlist, primary-check queue, actor validation pack eller claim-lock.

Raw output blir foreløpig referert med filsti, dato og prompt-ID. Import av hele filer til repoet krever separat beslutning.

## Statusnøkkel

| Status | Betydning | Bruk |
|---|---|---|
| `deckklart internt` | Kan brukes i intern slide eller casekort med tydelig caveat. | Intern beslutningspakke, ikke ekstern faktastemme. |
| `needs-source` | Sentral dokumenteier, avtaletekst eller primærkilde mangler. | Dokumentask og source-shortlist/PCQ. |
| `needs-primary-check` | Krever primærkilde, regulatorisk tekst, fulltekst eller institusjonsrapport. | PCQ-oppdatering før claimbruk. |
| `needs-data` | Krever tall med definisjon, år, geografi, enhet, metode og kildeeier. | Datagap eller mini-ledger. |
| `needs-actor-validation` | Krever aktørbekreftelse, rolle, bruksrett eller sitatsjekk. | Actor validation pack. |
| `benchmark-only` | Nyttig som læring/designkrav, men ikke bevis for norsk/nordisk pilot. | Intern deck, casekort og valideringsspørsmål. |
| `watchlist` | Interessant, men ikke nok til aktivt casekort uten ny kilde. | Lavere prioritet. |
| `parkert` | Skal ikke videreføres uten ny informasjon. | Hold utenfor deck og aktiv sprint. |

## Slik brukes filen når output kommer tilbake

1. Registrer outputfil, dato og hvilken caseprompt som ble brukt.
2. Kjør valideringsprompten fra `food-tg-deep-research-prompt-pack-2026-06-10.md`.
3. Fyll mottaksraden med nye kilder, claim-effekt, PCQ-effekt, actor-ask og importbeslutning.
4. Bestem importbeslutning: source-shortlist, PCQ, claim-lock-delta, actor validation pack, casekort, ingen import eller parkering.
5. Oppdater relevante kontrollfiler først etter at mottaksraden viser hva kilden faktisk beviser og ikke beviser.
6. Behold alle utrygge claims i hold-tilbake-språk til primærkilde, dataeier, dokumenteier eller aktørrespons finnes.
7. Bruk `food-tg-dokumentask-og-actor-ask-pack-2026-06-10.md` når neste handling er intern dokumentask, bruksrettsavklaring eller forberedelse av senere aktørspørsmål.

## Importregler

| Funn i output | Standard håndtering | Kontrollfil |
|---|---|---|
| Primærkilde funnet | Vurder source-shortlist-oppdatering med tittel, eier, dato, URL, dokumenttype og bruksverdi. | `source-shortlist-food-tg.md` |
| Claim fortsatt uverifisert | Behold eller skjerp PCQ-rad; ikke løft status. | `primary-check-queue-food-tg-v0.1.md` |
| Claim svekket eller motbevist | Noter claim-lock-effekt og oppdater casekortets stoppspråk. | `food-tg-claim-lock-table-2026-05.md` |
| Aktørrolle eller bruksrett trengs | Legg inn dokumentask eller samtalespørsmål før outreach. | `actor-validation-pack-food-tg-v0.1.md` |
| Benchmark uten norsk bevis | Bruk `benchmark-only` og formuler designlæring, ikke pilotbevis. | Casekort og deck-outline. |
| Ingen dokumenteier eller primærkilde | Sett `needs-source`, `watchlist` eller `parkert`. | PCQ og casekort. |

## Mottakslogg

| DRO-ID | Case | Outputfil | Dato mottatt | Prompt brukt | Koblet SRC/PCQ | Foreslått status | Nye primærkilder | Nye sekundærkilder | Claim-effekt | PCQ-effekt | Actor-ask | Importbeslutning | Neste handling |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DRO-0906-001 | Brasil/kaffe | `/Users/gabrielfreeman/Downloads/deep-research-report (7).md` | 2026-06-10 | Master + caseprompt 1 + valideringsprompt | `SRC-0906-001`, `SRC-0906-003`; `PCQ-0906-001`, `PCQ-0906-003` | MOU/prosjekt: `needs-primary-check`; import/EUDR-kaffe: intern hypotese med caveat | Nordic Innovation, WCEF, Natural State, Nordic Innovation Annual Report, EU EUDR, CONAB, Norsk Kaffeinformasjon, WITS/Comtrade, Nordic Approach, Fuglen, ICP, Gruten må hentes og locator-sjekkes. | Ingen sekundærkilde importert; se `DRR-0906-001`. | MOU-/partner-/kaffeprosjektclaim svekkes fordi avtaletekst og prosjektfil ikke ble funnet. Brazil low-risk under EUDR skal ikke brukes. | Behold `PCQ-0906-001`/`003`; legg til primærsjekk for agreement text, coffee workstream og import/EUDR-data. | Natural State/NCH/Nordic Innovation/Exchange4Change; Fuglen, Nordic Approach eller Norsk Kaffeinformasjon bare som aktørspor. | Registrer i resultat-intake; ingen source-shortlist-import før kildeåpning. | Be om MOU/annex/participant list; bygg eventuelt kaffe som import-/EUDR-case uten MOU-claim. |
| DRO-0906-002 | Elfenbenskysten/kakao | `/Users/gabrielfreeman/Downloads/_EUDR-_sporbarhetscase Deep Research.md` | 2026-06-10 | Master + caseprompt 2 + valideringsprompt | `SRC-0906-002`; `PCQ-0906-002` | Relasjon: `needs-primary-check`; EUDR/sporbarhet: intern bruk med caveat; reststrøm: `watchlist` | Natural State/LEAD-signal, EU EUDR, Cote d'Ivoire government, Conseil du Cafe-Cacao, FAO, World Bank, ICCO, WITS, Fazer, WCF, Rainforest Alliance, Barry Callebaut må hentes og locator-sjekkes. | Ingen sekundærkilde importert; se `DRR-0906-002`. | Signert MOU/avtale er fortsatt ikke funnet. Direkte nordisk råkakaoimportclaim svekkes; EUDR-/sporbarhetsrelevans styrkes som intern kontekst. | Behold `PCQ-0906-002`; legg til skille mellom relasjonsdokument, EUDR-kilder og nordisk verdikjede/produktkoder. | Natural State/NCH/LEAD Ivory Coast; Conseil du Cafe-Cacao; Fazer/Toms/Cloetta/sertifiseringsaktører ved senere gate. | Registrer i resultat-intake; ikke løft relasjonsclaim. | Få MOU/LOI eller avkreftelse; hent primærdokumenter for nasjonalt sporbarhetssystem og nordisk verdikjededata. |
| DRO-0906-003 | Valio/Finland | `/Users/gabrielfreeman/Downloads/“importfritt fôr”-case.md`; `/Users/gabrielfreeman/Downloads/oyafritt dairy-feed governance-case.md` | 2026-06-10 | Master + caseprompt 3 + valideringsprompt | `SRC-0906-006`; `PCQ-0906-006` | `deckklart internt` med caveat som soyafri governance; `needs-data`; `needs-actor-validation` | Valio soy policy, Valio 2018, Valio Sustainability Review 2024, Valio fôrråvareartikkel, Valio GMO/kvalitet, Luke, NESA, Ruokavirasto, MMM, Tulli/Uljas, A-Rehu må hentes og locator-sjekkes. | DRR-0906-004 er duplikat/konsistenssjekk, ikke egen kilde. | Importfritt fôr er svekket; soyafri governance og grasbasert fôrsystem styrkes som intern formulering. | Skjerp `PCQ-0906-006` mot fôrstandard, aggregert fôrkurv, importandel, CN-koder og leverandørrolle. | Valio sustainability/primary production; A-Rehu; Luke/Ruokavirasto/Tulli. | Slå sammen begge outputer i én mottaksrad; ingen raw import. | Be Valio om fôrkapittel/kvalitetsmanual og aggregert fôrkurv 2022-2025. |
| DRO-0906-004 | Bama/grøntgrossist/adoption | `/Users/gabrielfreeman/Downloads/Bama-case”.md` | 2026-06-10 | Master + caseprompt 4 + valideringsprompt | `SRC-0906-004`; `PCQ-0906-004` | `deckklart internt som C-gate`; `needs-actor-validation`; `needs-data` | BAMA årsrapport/bærekraft/Åpenhetsloven/Code of Conduct, Konkurransetilsynet, Menon, SØA, OFG/Grøntinnsikt, Landbruksdirektoratet, SINTEF, Gartnerhallen, Coop/Avisomo må hentes og locator-sjekkes. | Ingen sekundærkilde importert; se `DRR-0906-005`. | BAMA-blokkering, marginer og misbruk/dominans svekkes som offentlig claim. Distribusjon/adoption-gate styrkes. | Behold `PCQ-0906-004`; konkretiser produkt-/månedstall og juridisk primærsjekk. | BAMA/Gartnerhallen, Konkurransetilsynet, CEA-/veksthusaktører og alternative kanaler. | Endre foretrukket casenavn til distribusjon/adoption-gate; ikke importer kilder før sjekk. | Aktørvalidere onboarding/volum/kvalitetskrav og hente import-/norskandel per produkt/måned. |
| DRO-0906-005 | Spillvarme/drivhus/akvaponikk | `/Users/gabrielfreeman/Downloads/Green Mountain–Hima.md` | 2026-06-10 | Master + caseprompt 5 + valideringsprompt | `SRC-0906-005`; `PCQ-0906-005` | Hima: `deckklart internt` med datagap; Frövi: `benchmark-radar`; Wiig/Kviamarka/Varde: `needs-primary-check`; Polar: parkert som matcase | Green Mountain/Hima, WA3RM/Frövi, Nevel, Time kommune, Statsforvalteren, Drangedal/Sweco, Varde Kommune, NVE må hentes og locator-sjekkes. | Ingen sekundærkilde importert; se `DRR-0906-006`. | Nasjonalt TWh-claim holdes tilbake. Operativt Hima-case styrkes; flere plan-/scenario-case må ikke omtales som drift. | Skjerp `PCQ-0906-005` mot operativ status, GWh/år, tur/retur-temp, reservevarme, off-taker og økonomi. | Green Mountain/Hima; Wiig/Green Horizon/Klepp/Enova; Varde/atNorth; RegEnergy/FoodVentures/Nevel/Billerud. | Lag mini-ledger i videre arbeid; ingen source-import før primærkildeåpning. | Be om Hima driftsdata; drep/valider Wiig; hold Varde/Polar som radar til endelige dokumenter finnes. |
| DRO-0906-006 | 100% Fish/marint restråstoff | `/Users/gabrielfreeman/Downloads/100% Fish_Iceland Ocean Cluster.md` | 2026-06-10 | Master + caseprompt 6 + valideringsprompt | `PCQ-B-005`; marint restråstoff-case | `benchmark-only`; `deckklart internt` med claim-lock; `needs-data` | IOC/100% Fish, Matís, Statistics Iceland/PxWeb, SINTEF/FHF 2024, FHF 901844, Nofima, SUPREME, Mattilsynet, NCE Seafood/IOC må hentes og locator-sjekkes. | Ingen sekundærkilde importert; se `DRR-0906-007`. | Bokstavelig 100 prosent utnyttelse, norsk pilotbevis og høyverdiandel-claim svekkes. Norsk SINTEF/FHF-baseline styrkes. | Knytt til `PCQ-B-005`; skill total utnyttelse, human konsum, høyverdi og fraksjon/off-taker. | IOC/100% Fish; SINTEF/Kontali/FHF; Matís/Statistics Iceland; norske sjømataktører. | Bruk som benchmark-only; ikke source-import før egne kildesjekker. | Ekstraher islandsk PxWeb og be SINTEF/FHF om fraksjons-/høyverdiuttrekk. |
| DRO-0906-007 | Skottland/Polen | `/Users/gabrielfreeman/Downloads/Food TG-case.md` | 2026-06-10 | Master + caseprompt 7 + valideringsprompt | `SRC-0906-007`, `SRC-0906-008`; `PCQ-0906-007` | Skottland: `benchmark-kandidat` + `needs-primary-check`; Polen: `watchlist` + `needs-data` | Zero Waste Scotland, IBioIC/SBMT, Ricardo, Scottish Government, Scottish Ocean Cluster/Seafood Scotland, Scottish Parliament, Statistics Poland/GUS, PROM, NIK, CDR/SIR, EMFAF må hentes og locator-sjekkes. | Ingen sekundærkilde importert; se `DRR-0906-008`. | Skottland styrkes som benchmarkkandidat, men ikke ferdig Food TG-case. Polen svekkes som direkte sidestrømcase og forblir watchlist. | Oppdater `PCQ-0906-007` med separat Skottland-/Polen-løp og fulltekst/data dictionary/kill-test. | ZWS/IBioIC/Seafood Scotland; GUS/PROM/CDR/SIR/EMFAF hvis Polen holdes levende. | Skille Skottland og Polen i videre import; ikke slå sammen. | Hent ZWS fulltekst og SBMT-data dictionary; kill-test Polen på aktør/lokasjon/volum/output. |

## Mottak 12.06/13.06: case-avsjekk og kjørte prompts

Råmottaket fra `Food - Deep Research Process 12.06.26` er sikret i `research/external/dro-1206/`, og fire smale case-avsjekk-prompter er kjørt etterpå. Dette er en kontrollimport av resultatene, ikke ekstern publisering.

| Mottak-ID | Case/prompt | Outputfil | Dato | Koblet SRC/PCQ | Status | Claim-effekt | PCQ/source-effekt | Importbeslutning | Neste handling |
|---|---|---|---|---|---|---|---|---|---|
| CAP-1306-001 | `P-FISH-1` + `P-SKOT-2` | `docs/project/analysis/case-avsjekk/deep-research-fish-p-fish-1-p-skot-2-2026-06-13.md` | 2026-06-13 | `PCQ-B-005`, `SRC-B-027`, `SRC-A-017`, `SRC-0906-012`, nye `SRC-1306-*` | Delvis lukket | Styrker norsk volum-/struktur- og verdimiksfortelling med caveat; svekker alle råfraksjonspris-/marginclaims. | SSB 08801, SINTEF/FHF, ZWS og Nofima går til source-shortlist som kontrollerte kildekandidater; råfraksjonspriser står `needs-data`. | Importer som `deckklart internt med caveat`; ikke bruk HS-enhetsverdier som råstoffpris. | PCQ-B-005 runde-7-delta; eventuelt `P-FISH-1B` bare for råfraksjonspris hvis JT trenger det. |
| CAP-1306-002 | `P-DIST-1` | `docs/project/analysis/case-avsjekk/deep-research-dist-p-dist-1-2026-06-13.md` | 2026-06-13 | `PCQ-0906-004`, `SRC-0906-004`, nye `SRC-1306-*` | Delvis lukket | Styrker C-gate som bred adoption-/kanal-/pris-/kapitalgate; svekker BAMA-/grossistblokkeringsclaim. | Menon 177/2024, SINTEF vertical farming og OFG 2025 blir source-kandidater; månedlig importvindu og avtalevilkår står åpne. | Importer som intern RP-06-ledgerkandidat med `ikke aktøranklage`. | Eventuell `P-DIST-1B` begrenses til SSB månedstall for salat/tomat/agurk/vårløk/urter. |
| CAP-1306-003 | `P-FISH-2` | `docs/project/analysis/case-avsjekk/deep-research-fish-p-fish-2-2026-06-13.md` | 2026-06-13 | `PCQ-B-005`, `SRC-0906-014` | Stoppsignal, ikke lukket | Svekker direkte Island-Norge-utnyttelsesclaims til Strand et al. 2024 er funnet og lest. | SJA09114/SINTEF holdes som separate datakilder; Strand-artikkelen blir konkret PCQ-gate. | Importer som kontrollert gapnotat, ikke som lukket researchresultat. | Finn fulltekst av Strand et al. 2024 og kjør P-FISH-2 på nytt med definisjonstabell. |
| CAP-1306-004 | `P-VALIO-1` | `docs/project/analysis/case-avsjekk/deep-research-valio-p-valio-1-2026-06-13.md` | 2026-06-13 | `PCQ-0906-006`, `SRC-0906-006`, nye `SRC-1306-*` | Lukket for datasettgrunnlag | Styrker `soyafri != importfri` med autorisert finsk kildegrunnlag; Valio-spesifikk fôrkurv forblir aktørgate. | Ruokavirasto, Luke PxWeb og Tulli/Uljas kan inn som source-kandidater; Comtrade-preview kan erstattes etter claim-lock. | Importer som `deckklart internt for nasjonal systemramme`; ikke som Valio-spesifikk faktastemme. | Hold DASK/AASK for Valio fôrkurv/PFAD/A-Rehu uendret. |

## Casekort v0.1

### DRO-0906-001: Brasil/kaffe

| Felt | Status |
|---|---|
| Hypotese | Brasil/kaffe kan bli et importverdikjede- og EUDR-case; relasjons-/MOU-sporet overlever bare hvis avtaletekst, prosjekttekst eller dokumenteier finnes. |
| Mulig intern bruk nå | Intern hypotese om kaffeimport, opprinnelse, sporbarhet og EUDR-eksponering; MOU/partnerrolle kun som dokumentask. |
| Hovedrisiko | EUDR-/kaffekilder kan forveksles med bevis for MOU, partnerrolle eller Food TG-effekt. |
| Kildebehov | MOU/avtaletekst, roadmap/annex, partsliste, dato, scope, kontaktpunkt og bruksrett; separat kildepakke for kaffeimport/EUDR. |
| Databehov | Kaffeimport per opprinnelse, HS-koder, sporbarhet, farm/plot-data, volum, eventuell reststrøm og baseline/kontrafaktisk. |
| Aktør-/dokumentask | Natural State/NCH/Nordic Innovation/Exchange4Change først; Fuglen, Nordic Approach, Norsk Kaffeinformasjon eller importør bare som data-/caseaktør hvis rolle avklares. |
| Claim-lock ikke si | Ikke si at Brasil-MOU eller offentlig Brazil coffee project finnes, at Fuglen/Norsk Kaffeinformasjon er partner, at Brazil er low-risk under EUDR, eller at kaffegrut/biogass gir dokumentert Food TG-effekt. |
| Stoppsignal | Ingen avtaletekst, dokumenteier, partsliste, dato eller bruksrett. |
| Neste beslutning | Overlever som relasjonscase bare hvis dokument eller dokumenteier finnes; ellers parker MOU-claim og bygg kaffe som import-/EUDR-case med egne kilder. |

### DRO-0906-002: Elfenbenskysten/kakao

| Felt | Status |
|---|---|
| Hypotese | Kakao/Cote d'Ivoire kan bli EUDR-/sporbarhetscase; relasjon/MOU krever signert dokument, motpart eller dokumenteier. |
| Mulig intern bruk nå | Internt kildekart for EUDR, sporbarhet, avskogingsrisiko, Conseil du Cafe-Cacao-spor og nordiske aktørkjeder med tydelig caveat. |
| Hovedrisiko | Policy- og EUDR-kontekst kan bli brukt som bevis for avtale eller nordisk partnerrolle. |
| Kildebehov | MOU/avtale/LOI, organisasjonsnavn, motpart, dato, tematisk scope, bruksrett, EUDR primærkilder og nasjonal traceability-dokumentasjon. |
| Databehov | Nordisk verdikjede utover råbønneimport, HS1801-1806, leverandørkjeder, sporbarhetsdekning og eventuell reststrømslokasjon/volum/pilotstatus. |
| Aktør-/dokumentask | Natural State/NCH/LEAD Ivory Coast; Conseil du Cafe-Cacao; Fazer/Toms/Cloetta eller sporbarhetsaktør bare etter senere gate. |
| Claim-lock ikke si | Ikke si at NCH/Natural State har signert avtale med organisasjon i Cote d'Ivoire, at kakao er caseklart, at nordisk direkte råbønneimport er stor, eller at kakaoreststrømmer er skalert case. |
| Stoppsignal | Manglende organisasjonsnavn, avtaletekst, dato, scope eller kontaktpunkt. |
| Neste beslutning | Hold relasjon som hypotese til dokument finnes; modn EUDR/sporbarhet separat hvis primærkilder og nordisk aktørkjede kan låses. |

### DRO-0906-003: Valio/Finland

| Felt | Status |
|---|---|
| Hypotese | Valio kan være et soyafritt dairy-feed governance-case med dokumenterte import-gap, ikke et importfritt-meieri-bevis. |
| Mulig intern bruk nå | Intern slide med caveat: soyafri melkefôr-governance, grasbasert system, kontrollpunkter og avgrensning mot importerte suppleringsråvarer. |
| Hovedrisiko | "Soyafri" blir overtolket som "importfri" eller som dokumentert finsk selvforsyning i fôr. |
| Kildebehov | Valio soy policy/2018-beslutning/2024-review/fôrartikler, Luke, NESA, Ruokavirasto, MMM, Tulli/Uljas og eventuell A-Rehu-rolle. |
| Databehov | Fôrstandard, råvarekurv, tørrstoff/protein/energi, importandel, lokal proteinandel, år, geografi, definisjon og leverandørkrav. |
| Aktør-/dokumentask | Valio sustainability/primary production, A-Rehu bare for bekreftet leverandørrolle, Luke/Ruokavirasto/Tulli for datagrunnlag. |
| Claim-lock ikke si | Ikke si at Valio eller Finland produserer melk uten importert fôr, at Valios fôr er 100 prosent finsk, eller at soyafri betyr importfri. |
| Stoppsignal | Ingen fôrstandard, ingen aggregert fôrkurv eller bare generelle sustainability-sider uten år/geografi/definisjon. |
| Neste beslutning | Bruk som intern soyafri governance-case; fôrråvare-/selvforsyningscase krever Valio-data og finsk importstatistikk. |

### DRO-0906-004: Bama/grøntgrossist/adoption

| Felt | Status |
|---|---|
| Hypotese | Distribusjon/adoption-gate for norsk frukt og grønt kan forklare hvorfor lokal produksjon og sirkulære løsninger trenger kundekanal, volum, kvalitet og logistikk. |
| Mulig intern bruk nå | Trygg C-gate om markedsstruktur, grossist-/distribusjonssystemer, kaldkjede, produksjonsplanlegging og kanaltilgang. |
| Hovedrisiko | Bama omtales som blokkerende aktør eller tillegges marginer uten primærkilde og juridisk aktsomt språk. |
| Kildebehov | BAMA-rapporter, Konkurransetilsynet, Menon, SØA, OFG/Grøntinnsikt, Landbruksdirektoratet, SINTEF og Gartnerhallen. |
| Databehov | Produkt-/månedstall for CEA-relevante varer, importandel, norskandel, pris/verdi per kg, kanalstruktur, onboardingkrav og kvalitetskrav. |
| Aktør-/dokumentask | BAMA/Gartnerhallen, alternative kanaler, CEA-/veksthusaktører, tilsyn eller markedsekspert. |
| Claim-lock ikke si | Ikke si at BAMA blokkerer vertical farming/akvaponikk/lokal produksjon, har bestemte marginer eller misbruker juridisk dominans uten primærkilde. |
| Stoppsignal | Margin-, blokkerings- eller reputasjonelt sensitivt claim uten primærkilde. |
| Neste beslutning | Navngi som "distribusjon/adoption-gate for norsk frukt og grønt"; BAMA/Gartnerhallen kan være dokumenterte noder, ikke anklagebærende case. |

### DRO-0906-005: Spillvarme/drivhus/akvaponikk

| Felt | Status |
|---|---|
| Hypotese | Spillvarme kan bli benchmark-radar for lokal matproduksjon når case skilles på operativ status, varmekilde, nyttiggjort varme, temperatur og off-taker. |
| Mulig intern bruk nå | Hima som operativt datasenter-til-akvakultur-case med datagap; Frövi som industriell benchmark; Wiig/Kviamarka/Varde/Polar som radar eller primary-check. |
| Hovedrisiko | Elektrisk kapasitet, planstatus eller generelt potensial blandes med faktisk nyttiggjort varme til matproduksjon. |
| Kildebehov | Green Mountain/Hima, WA3RM/Frövi, Time kommune, Klepp/Enova, Statsforvalteren/Hå, Drangedal/Sweco, Varde Kommune og NVE. |
| Databehov | MW/GWh, temperaturprofil, sesong, reservevarme, CAPEX/OPEX, eier, mottaker, matproduksjon og systemgrense. |
| Aktør-/dokumentask | Green Mountain/Hima først; deretter Wiig/Green Horizon/Klepp/Enova, Varde/atNorth eller RegEnergy/FoodVentures hvis benchmark brukes. |
| Claim-lock ikke si | Ikke oppgi bestemt norsk TWh-tall, ikke si Frövi er datasentervarme, ikke si Wiig/Varde er operative uten driftsbevis, og ikke si elektrisk kapasitet er nyttiggjort varme. |
| Stoppsignal | Kun datasenterkapasitet eller planomtale uten nyttiggjort varme, temperaturprofil og matkobling. |
| Neste beslutning | Lag mini-ledger med Hima som første rad; hold plan-/pipelineprosjekter som radar til primærdokument eller aktørdata finnes. |

### DRO-0906-006: 100% Fish/marint restråstoff

| Felt | Status |
|---|---|
| Hypotese | 100% Fish/Iceland Ocean Cluster kan gi designkrav for fraksjonskart, produktkaskade og clusterlogikk, mens norsk baseline må bygges på SINTEF/FHF. |
| Mulig intern bruk nå | Sterkt benchmark-only-card og trygt språk for å skille total utnyttelse, human konsum, høyverdi og norsk overførbarhet. |
| Hovedrisiko | Islandsk benchmark brukes som bevis for norsk pilotstatus eller direkte overførbarhet. |
| Kildebehov | IOC/100% Fish claim-metode, Matís, Statistics Iceland/PxWeb, SINTEF/FHF 2024, FHF 901844, Nofima, SUPREME, Mattilsynet og norske aktørdata. |
| Databehov | Islandsk nåtidsdata, norsk fraksjonsdata, råstoffvekt vs produktvekt, sluttbruk, høyverdiandel, kvalitet, logistikk, lovlig sluttbruk og off-taker. |
| Aktør-/dokumentask | Icelandic Ocean Cluster/100% Fish, SINTEF/FHF eller relevant sjømataktør med bruksrett. |
| Claim-lock ikke si | Ikke si at Island bruker 100 prosent av hver fisk, at 100% Fish beviser norsk pilotklarhet, eller at total utnyttelse er høyverdiandel. |
| Stoppsignal | Bruk av islandsk benchmark som norsk effektbevis uten norsk fraksjons- og aktørdata. |
| Neste beslutning | Bruk som benchmark/designkrav; norsk case krever PCQ-B-005, fraksjonsuttrekk og aktør-/regulatorisk validering. |

### DRO-0906-007: Skottland/Polen

| Felt | Status |
|---|---|
| Hypotese | Skottland kan bli bioressurs-/sjømatbenchmark; Polen forblir governance-/statistikk-/matsvinn-watchlist til konkret aktør/lokasjon/volum/output finnes. |
| Mulig intern bruk nå | Skottland som benchmark-kandidat med fulltekst- og datatilgangsgate; Polen som kill-test/watchlist. |
| Hovedrisiko | Polen omtales som stor sidestrømsmulighet eller Skottland som dokumentert Food TG-case uten primærdata. |
| Kildebehov | ZWS 2025 fulltekst, SBMT data dictionary/lisens, Scottish Ocean Cluster-prosjektarkiv; GUS/PROM/CDR/SIR/EMFAF hvis Polen får konkret spor. |
| Databehov | Sektor, volum, fraksjon, sluttbruk, lokasjon, aktør, år, geografi og policykontekst. |
| Aktør-/dokumentask | Skotsk havbruk-/fiskeri-/bioressurskilde; polsk institusjonskilde bare ved konkret case. |
| Claim-lock ikke si | Ikke si at Polen er stor sidestrømsmulighet, at Skottland er ferdig Food TG-case, eller at fangst-/produksjonsvolum er sidestrømvolum. |
| Stoppsignal | Manglende fulltekst, ingen konkret A/B/C-kobling eller ingen masse-/aktørdata. |
| Neste beslutning | Prioriter ZWS/SBMT/Seafood Scotland; parker Polen som direkte case hvis kill-test ikke finner aktør, lokasjon, volum og output. |

## Caseanalyse v0.2 etter 72t-ledger

Denne tabellen oppdaterer casekortene med beslutningseffekt fra `food-tg-primarkilde-og-datakontroll-ledger-2026-06-10.md`. Den erstatter ikke mottaksradene; den gjør dem klare for intern deck- og beslutningspakke.

| Case | Trygg intern bruk nå | Hva kan ikke sies | Sterkeste kilde | Svakeste ledd | Datagap | Aktør-/dokumentask | Go/no-go | Neste beslutning |
|---|---|---|---|---|---|---|---|---|
| Brasil/kaffe | WCEF/Nordic Night, coffee/cocoa som use cases, kaffeimport/EUDR som kildejakt. | Ikke si at NCH/Natural State har Brasil-kaffe-MOU, at Fuglen/NKI er partnere, eller at Brazil er low-risk under EUDR. | Nordic Innovation Nordic Night, WCEF Nordic Stage, EU EUDR/country classification. | Ingen avtale, annex, partsliste eller prosjekttekst. | Kaffeimport per opprinnelse, CONAB/Comtrade-metode, aktørrolle og bruksrett. | `DASK-0906-001`, `DASK-0906-003`; senere `AASK-0906-001`. | No-go for relasjonscase; videre som import-/EUDR-kontekst. | Hvis MOU/annex ikke finnes etter intern dokumentask, parker relasjonsclaim og behold kaffe som kilde-/dataarbeid. |
| Elfenbenskysten/kakao | Cote d'Ivoire sporbarhet, EUDR-standard-risk og kakao som sporbarhetskontekst. | Ikke si at Natural State/NCH/LEAD har dokumentert kakaoavtale, eller at nordisk råkakaoimport er caseklart. | Government of Cote d'Ivoire traceability article, EU EUDR, FAO/WCF/WITS som spor. | Natural State/LEAD-relasjon bygger ikke på avtaletekst. | Dekret/fulltekst, Conseil du Cafe-Cacao-data, HS1801-1806 og nordisk aktørkjede. | `DASK-0906-002`; senere `AASK-0906-002`. | Go internt for EUDR/sporbarhet; no-go for relasjonscase. | Få MOU/LOI eller avkreftelse; hvis ikke, behold bare EUDR-/sporbarhetscase. |
| Valio/Finland | Soyafri dairy-feed governance, finsk import-gap og fôrdatakrav. | Ikke si importfritt fôr, 100 prosent finsk fôr eller at A-Rehu er generell Valio-leverandør. | Valio soy policy, Luke import-dependency, Ruokavirasto feed stats. | Fôrkurv og importandel for Valio-melkegårder er ikke dokumentert. | Aggregert fôrkurv 2022-2025, importandel, CN-koder og auditmetode. | `DASK-0906-004`, `AASK-0906-003`. | Go internt som smal governance-slide. | Be Valio/finske kilder om standard og fôrkurv; ellers hold case som soyafri governance med data-gap. |
| Distribusjon/adoption-gate | Bred C-gate om markedstilgang, avsetning, logistikk, grossistledd, kvalitetskrav og produktdata. | Ikke si BAMA blokkerer, tar høye marginer, misbruker makt eller hindrer vertical farming. | Konkurransetilsynet 2025, SINTEF vertical farming, OFG/Grøntinnsikt 2025, Menon/SØA som caveat. | BAMA-spesifikke vilkår, marginer og onboarding er ikke offentlig dokumentert. | Produkt-/månedstall, CEA-relevante varer, grossist-/leverandørkrav og juridisk formulering. | `DASK-0906-005`, `AASK-0906-004`. | Go internt som bred adoption-gate; no-go for BAMA-anklage. | Bruk casenavnet distribusjon/adoption-gate for norsk frukt og grønt. |
| Spillvarme/drivhus/akvaponikk | Hima/Green Mountain som operativt datasenter-til-akvakulturcase med datagap; Frövi som industriell benchmark. | Ikke si nasjonalt TWh, at Wiig/Kviamarka/Varde er operative, at Frövi er datasenter, eller at Polar er matcase. | Green Mountain heat reuse, WA3RM/Frövi, Time/Statsforvalteren/Varde/Drangedal som radar. | Målt GWh, temperatur, økonomi, reservevarme og faktisk produksjonsvolum mangler. | Hima drift 2025-2026, Wiig/Klepp/Enova kill-test, Varde endelig plan, Frövi meterte data. | `DASK-0906-006`, `AASK-0906-005`. | Go internt for Hima; benchmark/watchlist for øvrige. | Løft bare Hima i deck; bygg mini-ledger for resten. |
| 100% Fish/marint restråstoff | 100% Fish/IOC som designbenchmark og SINTEF/FHF som norsk restråstoffbaseline. | Ikke si bokstavelig 100 prosent, norsk pilotbevis eller høyverdiandel uten fraksjonsdata. | SINTEF/Kontali/FHF 2024, Statistics Iceland, IOC/Matís som benchmark. | IOC claim-metode, norsk høyverdiandel og fraksjon/sluttbruk er åpne. | PxWeb Island, SINTEF/FHF fraksjon/sluttbruk, raw/product weight og actor/off-taker. | `DASK-0906-007`, `AASK-0906-006`. | Go internt som benchmark/designkrav. | Lag benchmarkkort med claim-lock og norsk datagap. |
| Skottland/Polen | Skottland som bioresource/seafood benchmark-kandidat; Polen som kill-test/watchlist. | Ikke si at Skottland er dokumentert Food TG-case uten fulltekst; ikke si Polen er stor sidestrømsmulighet uten aktør/volum/output. | Zero Waste Scotland, Scottish Fish Farm Production Survey 2024, GUS/PROM som watchlist. | ZWS fulltekst/SBMT dictionary og polsk casebevis mangler. | Skotsk data dictionary, Scottish Ocean Cluster arkiv, polsk aktør/lokasjon/volum/output. | `DASK-0906-008`, `DASK-0906-009`, senere `AASK-0906-007`. | Videre validering for Skottland; Polen watchlist/parkering. | Hent ZWS/SBMT først; parker Polen hvis ingen konkret materialstrøm finnes. |

## Kontrollsjekk før oppdatering av andre filer

| Spørsmål | Må være ja før oppdatering |
|---|---|
| Er outputen kjørt gjennom valideringsprompten? | Ja |
| Har hver ny kilde tittel, eier, dato, URL og dokumenttype? | Ja |
| Står det tydelig hva kilden beviser og ikke beviser? | Ja |
| Er claim-effekt skilt fra PCQ-effekt og actor-ask? | Ja |
| Er benchmark skilt fra norsk/nordisk pilotbevis? | Ja |
| Er "ikke si" og stoppsignal oppdatert hvis output svekker claimet? | Ja |

## Neste arbeid

1. Bruk `food-tg-deep-research-results-intake-2026-06-10.md` som detaljlogg for de åtte mottatte outputene.
2. Hent og locator-sjekk primærkildekandidater før source-shortlist får nye rader.
3. Koble hvert dokument- eller aktørbehov til `food-tg-dokumentask-og-actor-ask-pack-2026-06-10.md`.
4. Oppdater PCQ, claim-lock eller actor validation pack bare når mottaksraden viser konkret kontrollhandling.
5. Bruk casekortene som intern deck- og decision-pack-kilde, men behold ekstern faktastemme lukket til kilde, data og bruksrett er dokumentert.
