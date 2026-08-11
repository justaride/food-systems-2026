---
tittel: Food Systems 2026 — completion register
dato: 2026-07-15
sist_kontrollert: 2026-08-11
status: kanonisk intern status
gate: internal
scope: kunnskapsbase, whitepaper, roadmap, research-status og videreføring
eier: prosjektledelsen
---

# Food Systems 2026 — completion register

Dette er prosjektets kanoniske statusregister fra 2026-07-15. Registeret avgjør
om arbeid er ferdig, må syntetiseres, krever mennesker eller nye kilder, er et
ekte kunnskapshull, eller tilhører en senere horisont.

Registeret er **ikke** en ny faktakilde. Påstander, tall og aktørkoblinger følger
fortsatt claim-lock, PCQ, source-locator og
[CITABLE-KNOWLEDGE-BASE-STATUS](../../../research/CITABLE-KNOWLEDGE-BASE-STATUS.md).

## Statusspråk

| Status | Betydning | Kan lukkes av lokal syntese? |
|---|---|---|
| complete | Avgrenset leveranse er kontrollert ferdig på oppgitt nivå. Det betyr ikke automatisk ekstern publiserbarhet. | Nei, bare vedlikehold |
| synthesis-needed | Underlaget finnes lokalt, men må samles, oppdateres eller propagere til kanonisk leveranse. | Ja |
| human-gated | Krever vedtak, intervju, partnerrespons, workshop, juridisk vurdering eller annen menneskelig handling. | Nei |
| source-gated | Krever ny primærkilde, registeruttrekk, innsyn, betalt kilde eller ny kildekontroll. | Ikke fra lokalt materiale alene |
| true-C | Ingen kontrollert åpen og harmonisert måling finnes per angitt kontrolltidspunkt, eller data er strukturelt ikke offentlig. Hullet bevares som funn. | Nei |
| future | Bevisst lagt etter kontraktsleveransen eller avhengig av senere finansiering og produktvalg. | Ikke i nåværende closeout |

## Kort dom

- R13- og R14-maskineriet er ferdig på internt mottaks- og kontrollnivå.
- Lokal hovedsyntese finnes nå som kanonisk v2-manus, roadmap v0.2-draft,
  continuation plan og 13-felts navigasjonsstruktur. Hovedrestansen er
  godkjenning, publikasjonsuttrekk, samlet readback og de eksplisitte
  menneskeportene.
- Intervjuer, nordisk partnervalidering, formelle mandatvedtak, event,
  pilotforankring og personvern kan ikke simuleres av lokal analyse.
- Type-C-hull skal dateres og forvaltes som kunnskapsinfrastruktur, ikke fylles
  med estimater for å få en komplett figur.

## Operativ oppfølging 2026-08-11

[Prosjektvurderingen og faseberedskapen 2026-08-11](./food-systems-phase-readiness-2026-08-11.md)
er siste samlede readback under dette registeret. Det tilhørende
[informasjonsgapregisteret](../../../research/_status/information-gap-register-2026-08-11.jsonl)
og den [operative lukkingsplanen](../mandates/gap-closure-operating-plan-2026-08-11.md)
er arbeidsflater, ikke nye sannhetsregistre.

- Prosjektet er **GO** for intern beslutningsstøtte og målrettet validering,
  **betinget GO** for appraisal/intervju/partnerreadback etter eier- og
  rettighetsport, og **NO-GO** for ukvalifisert ekstern publisering,
  observatoriumsdrift, effektpåstander og automatiske sannhetsoppdateringer.
- Produksjonsappen er verifisert på funksjonell SHA `67b13ac`; `/api/data-status`
  er grønn med `dbOk=true` og `pageGatesOk=true`. `origin/main` står på
  `a15eec5`, der eneste senere delta er et datert Coolify-ressurssnapshot.
- `/api/library-analysis/status` svarer fortsatt HTTP 503 med `total=0`.
  Draft-PR #342 dokumenterer manglende `LibraryAnalysisRecord`, schema-/ledger-
  drift, manglende minst privilegert migrasjonscredential og manglende godkjent
  off-node backup/restore-bevis. PR-en er ikke et mergesignal selv med grønn CI.
- Innhentingen 5. august har i dagens filreadback 135 staged filer, 128
  ekstraksjonsposter, 125 unike ikke-tomme URL-er og 335 finding-poster; 1
  ekstraksjonspost mangler URL-lokator og én register-URL forekommer i tre poster.
  Siste rensede
  produksjonskjøring registrerte 55 `SourceDoc` og 91 `SourceCitation`, hvorav
  90 ble satt `citable_external` og 1 `internal_context`. Commit-overskriftens
  eldre 165/279-oppsummering er ikke kanonisk; nivåene er heller ikke appraisal
  eller publiseringsgodkjenning.
- Det nordiske prosjektlandskapet har 40 verifiserte hovedprofiler, 22
  kandidat-/disposisjonsrader og 100 kilder. 17 profiler har kvalitativ,
  etnografisk eller deltakende metode, men registeret har 0 uavhengig
  evaluerte kvalitative funn.
- Fem P0-gater styrer videre fase: organisatorisk hjem/eier, formell closeout,
  off-node backup/restore, produksjonsmigrering av kunnskapslaget og vedtatt
  personvern-/rettighets-/publiseringspolicy. Å skrive planene lukker ikke disse
  menneske- og produksjonsportene.

## Operativ oppfølging 2026-07-21

[Gap-lukkingsprogrammet 2026-07-21](../../../research/_plans/gap-program-2026-07-21/GAP-LUKKINGSPROGRAM-2026-07-21.md)
er en arbeidskø under dette registeret, ikke et nytt sannhetsregister. Første
readback gir følgende statusgrense:

- 22 gap er inventert, men ingen nye gap er dokumentert lukket av programmet
  ennå.
- T3 har 15 tallceller med kildekandidater og én eksplisitt åpen Samkaup-rad.
  Kandidatene mangler fortsatt komplett PCQ, modelltilpasning, periode-/scope-
  avklaring, eventuell valutaomregning og kontrollert import.
- T4 er en datert kandidatsyntese. Den lukker ikke True-C-radene: kontrollen
  skiller nå mellom måleprogram, publisert baseline, kort tidsserie,
  kontrahert lagerkapasitet og faktisk beholdning.
- Utkast finnes for seks gap-ID-er (`T1`, `T2`, `T6`, `T7`, `T10`, `Q1`). Et
  utkast, brev eller en sprintplan er ikke lik ekstern utsendelse, mottatt svar
  eller gjennomført menneskelig vurdering.
- Q1 har tre teknisk kontrollerte pilotartefakter, men alle tre avventer
  fulltekstlesing og komplett disposisjon fra en navngitt menneskelig reviewer.
  Topp-50-køen åpnes først etter at piloten faktisk er godkjent.
- T2-tabellen har nå fire svenske og fem danske desk-kontrollerte rader med
  primærkilde og claim-grense. De er ikke partnerbekreftet, og ingen e-post er
  sendt.
- Q2 og Q3 er skilt: 89 rader står i review-kø, men dry-run av de mekaniske
  reparasjonsløpene foreslår bare 17 URL-oppdateringer; lokal- og PDF-løpet
  foreslår 0. Ingen reparasjon er anvendt i databasen.
- Q4-auditen viser at 521 av 2 376 eksternt klare/med-note-siteringer har en
  varig kopi, mens 1 855 trenger arkiv. Gaten feiler med 1 872 blokkerende
  ID-er; ingen Wayback-/snapshot- eller databasejobb er kjørt.
- Live statuspropagering er oppdatert til 2 703 `SourceCitation` og 244 516
  `FieldCitation`. Vanlig og strict source-audit passerer, men akademisk
  beredskap er fortsatt `NOT READY`: appraisal står 0/417 og identitetsparitet
  har 18 avvik. Matsvinnloven-reparasjonen er bare dry-run; destruktiv apply er
  deaktivert og krever separat kontrollert autorisasjon.
- T5–T9 er ikke kjørbare batcher. De 270 sjømatradene er et frosset
  prosjektutvalg som mangler felles entity resolution og domenevis
  aktivitetsdefinisjon; N/P/K-løpet har cellekontrakt og kildeshortlist, men
  ingen ferdig fylte Type A-celler; og finansielle tall kan bare brukes som
  aktivitetssignal, ikke som proxy for realisert alt-proteinvolum.
- T11–T16 er kontrollert H2/H3-design. Importskjelett, baseline-audit,
  punktestimater, legacy-modell og kausalitetsmal er byggesteiner, ikke
  operative nordiske pipelines, subsektor-tidsserier, full massebalanse,
  validert indeks, reviewede case eller kanalfordeling.

## Complete

| ID | Avgrenset leveranse | Bevis | Bruksgrense / vedlikehold |
|---|---|---|---|
| C-01 | R13 mottak og triage: 50 av 50 prompter er indeksert. | [R13 intake-index](../../../research/_status/food-tg-r13/r13-intake-index-2026-06-25.md) | Intern mottaksstatus. Ingen rad åpner ekstern claim alene. Batch 01–13 er konsistent mottaksført; den eldre 8/50-handoveren er tydelig supersedert. |
| C-02 | R14 mottak og kontroll: 13 av 13 decision-batcher, 7 av 7 PCQ-notater, datareviews og actor-gate-pakker finnes. | [R14 intake-index](../../../research/_status/food-tg-r14/r14-intake-index-2026-07-03.md) | Claim-lock-kandidater og actor-gate-pakker stopper ved sine oppgitte porter. |
| C-03 | Fem pilotbriefer er ferdige som workshop-start dossiers. | [Pilot-brief status](../../../research/_status/pilot-brief-evidence-packs-2026-07-02.md) og [pilot-brief index](../../../research/evidence-pack/pilot-briefs/README.md) | Ferdig desk-underlag, ikke partnergodkjente pilotforslag eller effektbevis. |
| C-04 | Finance note v2.0 er kontrollert mot programkilder 2026-07-02. | [Finance note](../../../research/evidence-pack/finance-note.md) | Søknad, partnergrunnlag og finansieringsvalg er egne menneskeporter. Frister må oppdateres før bruk. |
| C-05 | Intern forståelsesindeks og datert Type-C-syntese finnes. | [Forståelsesindeks](../../../research/forstaelse/INDEX.md) og [Det Norge ikke måler](../../../research/forstaelse/det-norge-ikke-maaler.md) | Begge er interne navigasjons- og prioriteringsflater, ikke faktastemme. |
| C-06 | Obsidian-baseline er dokumentert som internt cockpit-kart med 764 markdown-noter og 31 canvas-flater. | [Obsidian assessment](../reviews/obsidian-kunnskapskart-assessment-2026-07-03.md) | Dette er den historiske baselinen. Den utvidede, revaliderte arbeidskopien står i C-11. |
| C-07 | Outsider-feltkart er implementert som én sentral feltoversikt og 13 lenkede domene-MOC-er. | [Feltkart – kunnskapsbasen](../../../Food%20Systems%20Obsidian/1%20Oversikt%20og%20navigasjon/Feltkart%20%E2%80%93%20kunnskapsbasen.md) | Kontroll er grønn for 14/14 frontmatter/seksjoner, 13 sentrallenker, 13 backlinks og 14 Notater-seksjoner. |
| C-08 | Kanonisk v2-mastermanus er ferdig som intern syntese: 740 linjer med metode, Norge/Norden, sirkularitet/NPK, kjente hull og roadmap/videreføring. | [Food Systems 2026 synthesis v2](../../../research/whitepaper/food-systems-2026-synthesis-v2.md) | Status er intern-syntese-til-godkjenning og ekstern_sitering: false. Stale-claim-scan og diff-check er grønne; [I]/[H]-porter består. |
| C-09 | Roadmap v0.2 er ferdig som kontrollert lokal M16-draft. | [Roadmap v0.2 draft](../mandates/roadmap-food-tg-2026-2029-v0.2-draft.md) | Ikke godkjent roadmap, partnerposisjon, pilotportefølje eller effektbevis. Formell port står i H-03. |
| C-10 | Continuation plan er ferdig som kontrollert lokal M18-draft. | [Continuation plan](../mandates/continuation-plan-food-tg-2026.md) | Autoriserer ikke videre drift. Organisatorisk hjem, eier, budsjett, finansiering og publiseringsnivå er åpne beslutninger. |
| C-11 | Utvidet Obsidian-vault er integrert med 786 markdown-noter, 32 canvas-flater, ny startsti og visuelt kunnskapsatlas. | [Matsystemets kunnskapsatlas](../../../Food%20Systems%20Obsidian/0%20Kart/Matsystemets%20kunnskapsatlas.canvas), [Welcome](../../../Food%20Systems%20Obsidian/Welcome.md) og [Leseguide](../../../Food%20Systems%20Obsidian/1%20Oversikt%20og%20navigasjon/Leseguide%20for%20nye%20lesere.md) | `vault:check`, review-preflight, review-samples og review-closeout er grønne; atlaset er visuelt kontrollert i Obsidian. Kartet er navigasjon, ikke evidens. |
| C-12 | Én operativ ferdigstillingskø peker til eier, gate, gaps og nærmeste handling uten å duplisere kildetekst. | [Arbeidskø – ferdigstilling](../../../Food%20Systems%20Obsidian/2%20Intern/Arbeidsk%C3%B8%20%E2%80%93%20ferdigstilling.md) | Menneske-, kilde- og true-C-rader blir stående åpne til faktisk bevis finnes. |
| C-13 | R13-statushygiene er lukket. | [R13 intake-index](../../../research/_status/food-tg-r13/r13-intake-index-2026-06-25.md) og [historisk continuation-handover](../../../research/_status/food-tg-r13/HANDOVER-r13-continuation-2026-06-27.md) | Intake viser 50/50 og batch 01–13; historisk 8/50-tekst er bevart, men merket supersedert. |
| C-14 | Gjeldende HHI-/CR3-versjoner er propagert på aktive flater og kontrollert. | [CA-004](../../../research/CITABLE-ACCEPTANCE-TESTS.md) og [citable status](../../../research/CITABLE-KNOWLEDGE-BASE-STATUS.md) | Omsetnings-HHI 3 327, CR3 96,6 % og butikkantall 93,4 % holdes atskilt. `audit:citable` og `gate:overclaim` er grønne; 3 445 brukes bare som tydelig historisk/butikkantalls-proxy. |
| C-15 | Adoption Track og executive brief er oppdatert som interne derivater av v2. | [Adoption Track v2.0](../../../research/evidence-pack/adoption-track.md) og [Executive brief](../../../research/whitepaper/executive-brief.md) | Begge er eksplisitt ikke-publiserbare og kan ikke åpne menneske-, pilot-, funding- eller publiseringsporter. |
| C-16 | Innhentingssesjonen 2026-08-05 er hentet, verifisert og kjørt gjennom en renset produksjonsimport. | [START-HER](../../../research/innhenting-2026-08-05/START-HER.md), ekstrakt-/verdict-filer og [prod-run 31022133733](https://github.com/justaride/food-systems-2026/actions/runs/31022133733) | Filreadback: 135 staged filer, 128 ekstraksjonsposter, 125 unike ikke-tomme URL-er og 335 finding-poster; 1 ekstraksjonspost mangler URL-lokator og én register-URL forekommer i tre poster. Siste rensede kjøring registrerte 55 `SourceDoc` og 91 `SourceCitation`. Dette er teknisk inntak/readiness, ikke samlet appraisal eller ny ekstern syntese. |
| C-17 | Det reviderte nordiske prosjektlandskapet er verifisert, reproduserbart og tilgjengelig i produksjon. | [Rapport](../../../research/landscape/report-2026-08-10.md), [metode](../../../research/landscape/README.md) og [produksjonsflate](https://food-systems.naturalstateproject.com/prosjektlandskap) | 40 hovedprofiler, 22 kandidat-/disposisjonsrader og 100 kilder støtter intern prioritering. 0 uavhengig evaluerte kvalitative funn holder effektclaims og automatisk DB-promotering stengt. |

## Synthesis-needed

| ID | Restanse | Lokalt underlag | Definition of done | Neste handling |
|---|---|---|---|---|
| S-01 | Propagere kanonisk v2 til publikasjonsuttrekk | [Synthesis v2](../../../research/whitepaper/food-systems-2026-synthesis-v2.md), [Whitepaper README](../../../research/whitepaper/README.md) og tre app-kapitler | App-kapitlene er sporbare, konsistente utdrag fra godkjente deler av v2 og utgjør ikke en parallell sannhetskilde. | Faglig gjennomgang av v2, så kapittelmapping, app-readback og eventuell PDF-kontroll. |
| S-03 | Propagere kontrollert sirkularitet til app | [Synthesis v2 kapittel 8](../../../research/whitepaper/food-systems-2026-synthesis-v2.md) og [detached section 7](../../../research/whitepaper/section-7-circular-food-systems.md) | App-uttrekket følger v2 og nyeste waste-/VK4-grenser; original section 7 står kun som proveniens. | Gjør utdrag etter v2-godkjenning; behold realisert/modellert/kapasitet/plan/potensial. |
| S-04 | Avstemme augustinntaket fra staging til eksplisitt finding-disposisjon | [Innhentingsmanifest](../../../research/innhenting-2026-08-05/INNHENTING-MANIFEST.jsonl), [verifisering](../../../research/innhenting-2026-08-05/verifisering/worklist.jsonl) og [IG-018](../../../research/_status/information-gap-register-2026-08-11.jsonl) | Alle 335 finding-poster har eksplisitt status gjennom staged, importert, citation-ready, appraised og publiserbar; nivåene er ikke slått sammen og eldre 165/279-oppsummering er supersedert. | Bygg datert, generert readback etter at `LibraryAnalysisRecord` er operativt; propager bare faktiske statusendringer hit. |

## Human-gated

| ID | Gate | Hva mangler faktisk | Eier / beslutningsforum | Stopplinje |
|---|---|---|---|---|
| H-01 | Mission 1 — stakeholderintervjuer | Planlagte intervjuer, dokumentert samtykke/bruksrett og godkjente sitater. | Gabriel + Cathrine / relevante intervjuobjekter | Sekundærkilder kan ikke fremstilles som egne stakeholderstemmer. |
| H-02 | Mission 2 — nordisk partnervalidering | Dokumentert respons på landdata, metode og tolkning fra svenske/danske/finske/islandske partnere etter valgt scope. | Prosjektledelse + navngitte nordiske partnere | Intern sammenligning er ikke ekstern partnergodkjenning. |
| H-03 | Charter, scope og leveransetolkning | Formell eierbekreftelse av scope, H1/H2, chair/co-chair, godkjenningsdato, roadmap v0.2, continuation plan, organisatorisk hjem og geografisk ambisjon. | JT/Cathrine/Einar/Gabriel etter [decision log](../mandates/decision-log-food-tg.md) | Kontrollerte interne drafts og operativ sprintstart er ikke formelt TG-vedtak eller autorisasjon av videre drift. |
| H-04 | M17 offentlig event | Event-go, dato, format, vertskap, talere, publiseringsnivå og gjennomføring. | JT/Einar/Thea/prosjektledelse | Forberedt eventretning er ikke gjennomført event. |
| H-05 | Mission 3/6, pilot- og fundingforankring | Workshop, pilot-eier, dataeier, off-taker, budsjett, partnercommitment og søknadsvalg. | Transition Group og aktuelle partnere | Pilotbrief og funding-match er ikke pilot eller finansiering. |
| H-06 | Actor-gate | Datert aktiv status, faktisk volum, kontrakter, marginer, sluttbruk og andre ikke-offentlige felt per aktør. | Dataeier/aktør etter R14-spørsmålspakker | Kapasitet, plan, registerforekomst og proxy skal ikke bli realisert volum. |
| H-07 | Personvern, publisering og juridisk risiko | Policy for person-/styredata, berettiget interesse, retting, kildebruk, injurierisiko og publiseringsnivå. | Prosjekteier + kvalifisert juridisk vurdering | Ingen bred offentlig personflate før policy er vedtatt. |

## Source-gated

| ID | Kildearbeid | Nåstatus | Gate / neste steg |
|---|---|---|---|
| K-01 | FI/IS 2025-finansielle rader | SE/DK 2025 er importert. FI/IS har 2020–2024 og oppfyller fireårsminimum. Arbeidskøen har 15 tallceller med kildekandidater og én åpen Samkaup-rad, men ingen kontrollerte FI/IS-2025-rader er lagt inn. | Lukk selskaps-, scope-, regnskapsperiode-, valuta- og feltsemantikk per rad; fullfør PCQ; valider mot `CompanyFinancial`; importer bare med locator/readback og uendret databaseidentitet. |
| K-02 | Aktivitetssignaler for havbruk og villfisk | Et prosjektutvalg med 120 havbruks- og 150 villfisk-org.nr. finnes. Det er ikke et komplett nasjonalt univers. Lokalitet-/tillatelsestreff finnes for deler av havbruksutvalget, men faktisk biomasse og villfisklanding er ikke systematisk koblet. | Frys utvalget; kjør Actor→Company→register-ID-preflight; velg domenevis aktivitetssignal og periode; dry-run/review før konfidens oppgraderes. |
| K-03 | Offentlig innkjøp og lokale markeder | Regionale/proxy-artefakter finnes, men nasjonal markedsandel, oppdaterte kanaldata og sammenlignbar kommunal omsetnings-HHI mangler. | Doffin/DFØ/KS, årsmeldinger, eventuelt innsyn eller kommersiell kilde. |
| K-04 | Lange omsetningsandeler og PPP-prisnivå | Deler finnes, men den gamle gap-listens 10–15-årsserie og full PPP-sammenligning er ikke verifisert som ferdig i closeout. | Reåpnes bare hvis en definert whitepaper-claim trenger dem. |
| K-05 | Portable kilder for seks R2-forståelsesnotater | Notatene har runtime-citationmarkører uten portable URL-er eller lokale locatorer. | Re-hent primærkilder og skriv source-locator før fakta kan gjenbrukes. Inntil da er notatene karantene. |
| K-06 | Uavhengig evaluering av prioriterte prosjektutfall | Prosjektlandskapet har 20 uavhengige kilder, men 0 uavhengig evaluerte kvalitative funn. Eier-/prosjektutfall står korrekt som rapporterte. | Kjør claim-for-claim evalueringssøk for topp-prosjektene; kontroller konsortium/domeneuavhengighet og oppgrader bare den konkrete claimkoblingen. |

## True-C

Detaljene, kontrolltidspunktet og neste sjekk står i
[Det Norge ikke måler](../../../research/forstaelse/det-norge-ikke-maaler.md).

| ID | Kontrollert hull | Statusgrense |
|---|---|---|
| T-01 | Nasjonal direkte målt SOC-baseline for jordbruksjord | JordVAAK hadde implementerings- og metodeutvikling i 2023; den landsdekkende systematiske overvåkingen ble lansert i 2026. Ingen nasjonal direkte målt baseline er publisert; modellert inventar er ikke målt SOC. |
| T-02 | Nasjonal anleggsvis massebalanse for oppdrettsslam | Modellert, innsamlet og behandlet volum finnes ikke koblet i én åpen, revidert serie. |
| T-03 | Nasjonal realisert N/P/K-retur fra norsk biorest/digestat | Anleggs-/FoU-målinger finnes; aggregert nasjonalt system og SPCR 120-ekvivalent mangler. |
| T-04 | Pollinatortrend og bred insektbiomasse i jordbrukslandskap | Insektovervåkingen har gått siden 2020, men tidsserien er fortsatt for kort for robust trend. Miljødirektoratets 2026-readback omtaler den kraftige nedgangen 2020–2023 som sannsynlig tilfeldig variasjon, ikke som en etablert årlig trend. En bred, robust biomasseserie for jordbrukslandskapet er ikke identifisert. |
| T-05 | Åpen nodekapasitet for havn, kaldkjede, sentrallager og beredskapslager | Kornberedskap må skille kontrahert mål fra faktisk lager: 82 500 tonn kapasitet er kontrahert mot 2029, mens rapportert beholdning ved utgangen av 2025 var 30 000 tonn. Sammenlignbare åpne kapasitetsserier for øvrige fysiske noder er ikke identifisert i prosjektets kontroll. |
| T-06 | Harmoniserte nordiske serier for flere systemmål | Nasjonale kilder finnes, men felles metode for forkorrigert selvforsyning, digestat og leddmatrise er ikke etablert i underlaget. |

## Future

| ID | Senere horisont | Hvorfor ikke nå | Startbetingelse |
|---|---|---|---|
| F-01 | Temporale kanter og automatisk endringsovervåking | Krever produkt-/skjemadesign og vedvarende drift, ikke closeout-syntese. | M16–M18 levert, eier og driftsbudsjett avklart. |
| F-02 | Materialstrømlag v1 (H2) og full N/P/K-balanse (H3) | Kilde-shortlist og legacy-proxy finnes, men ingen Type A-celle er ferdig fylt; full balanse avhenger også av T-02/T-03 og modellvalg. | H2-celleledger med primærlokator/PCQ og separat indeks-spec; full balanse først ved H3-vedtak og finansiering. |
| F-03 | Offentlig produkt, API og eksterne brukere | Publiseringsnivå, personpolicy, vedlikehold og support er ikke vedtatt. | H-03 og H-07 lukket; operativ eier og finansiering på plass. |
| F-04 | Full nordisk aktør- og styreparitet | Generisk importskjelett og read-only baseline-audit finnes, men ingen operasjonell SE/DK-MVK-pipeline eller nordisk styreinnhentingsadapter. Registertilgang, legal-ID-regler, lisens og personvern varierer per land. | Geografisk ambisjon vedtatt; celler/univers fryst; tilgang og ressurs avklart; kandidat-only pilot kontrollert. |
| F-05 | Subsektor-HHI som tidsserie | Norsk dagligvare har én tidsserie og flere subsektorer har punktestimater, men målseriene for fôr, kjøtt, emballasje og grossist er ikke etablert. | Marked, geografi, nevner og konsolideringsregler vedtatt; minst tre harmoniserte år for pilotserie. |
| F-06 | Kausalitets-caseklasse | Evidensgradert mal finnes, men 0 case er utfylt eller reviewet og ingen validator finnes. | Ett pilotcase med navngitt metodereview; deretter maskinlesbart skjema og validator. |
| F-07 | Kanalfordeling lokalmat | Samlet direktesalg er kontrollert, men offentlig kanalfordeling, taksonomi, nasjonal nevner, kildeavtale og budsjett mangler. | Beslutningsnotat for output/kilde/lisens/pris/partner; finansiert tilgang eller dokumentert institusjonsavklaring. |

## Oppdateringsregel

1. En rad flyttes bare når definition of done er dokumentert med fil, dato og
   kontroll.
2. Human-gated flyttes ikke fordi et utkast er skrevet.
3. Source-gated flyttes ikke fordi en mulig URL er kjent; kilde må være hentet,
   lest og kontrollert.
4. True-C flyttes bare når et nytt måleregime eller en konkret åpen locator
   faktisk finnes. Estimat eller proxy endrer ikke status.
5. Nye statusnotater skal peke hit i stedet for å opprette parallelle
   sannhetsregistre.
