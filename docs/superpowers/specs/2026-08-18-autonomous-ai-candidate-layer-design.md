# Autonomt KI-kandidatlag med menneskestyrt promotering

- **Dato:** 2026-08-18
- **Status:** Design godkjent i samtale; skriftlig spec avventer endelig brukergjennomgang
- **Beslutning:** Streng kontroll skal ligge ved autoritetsheving, kanonisering og publisering, ikke ved maskinell lesing og kandidatproduksjon.
- **Første implementeringsskive:** Kontrollkontrakt, kandidatdatamodell, append-only skriving, tekniske fullmaktsgrenser, kompatibilitet med eksisterende bibliotekanalyse og verifikasjon.
- **Senere skiver:** Analyseadaptere og pilot, kontrollrom/review, deretter promotering.

## 1. Bakgrunn

Food Systems har allerede et modent kontrollapparat for kildeidentitet, AI-lesing, review, rettigheter, publisering og dekningspåstander. Prinsippet er riktig: en maskinell analyse skal ikke bli til godkjent kunnskap eller ekstern faktastemme uten tilstrekkelig autoritet og evidens.

Den nåværende implementeringen plasserer imidlertid flere av de strengeste portene før eller inne i selve analysearbeidet. Det gir høy trygghet, men hindrer den autonome analysemodellen prosjektet nå trenger: KI-prosesser skal kunne lese hele materialet, lage flere analyser, sammenligne resultater, oppdage konflikter og bygge en stor review-kø. Mennesker kommer inn senere for å vurdere og eventuelt promotere resultatene.

Dagens friksjon kommer særlig fra disse kontraktene:

- eksakt kildeidentitet kreves før full KI-analyse,
- menneskelig bekreftet kilderolle kreves før en analysepakke kan bli `ready_for_owner`,
- én sammenhengende og nøyaktig trinnrekkefølge kreves for hver KI-kjøring,
- autoritativt forankrede hendelser brukes både for maskinframdrift og myndighetsbærende beslutninger,
- den kjørbare fulltekstarbeidsflyten er hovedsakelig PDF- og sideorientert,
- maskinelle begreper som `approved_internal` kan leses som menneskelig godkjenning selv når `humanReviewed = 0`.

Dette designet bevarer fail-closed kontroll for promotering og ekstern bruk, men flytter menneske- og rettighetsportene ut av analysebanen.

## 2. Styrende prinsipp

> KI kan lese, analysere, sammenligne og lagre sporbare kandidatresultater autonomt. Bare et autorisert menneskelig vedtak kan åpne en promotering, og bare en kontrollert promoteringstjeneste kan endre kanoniske data.

Dette innebærer to forskjellige former for strenghet:

1. **Analyse er åpen, sporbar og reversibel.** Maskinelle resultater kan produseres i stor skala så lenge input, metode, avstamning og begrensninger bevares.
2. **Autoritetsheving er smal, eksplisitt og fail-closed.** En kandidat får aldri høyere myndighetsstatus gjennom konfidens, gjentakelse, modellkonsensus eller videre maskinell bruk.

Konfidens er en vurdering av sannsynlighet. Autoritet er en beslutning om hva systemet tillater. De to skal aldri representeres av samme felt.

## 3. Mål

Designet skal gjøre det mulig å:

- analysere lesbart materiale også når identiteten er foreløpig eller uavklart,
- kjøre flere modeller, workflows, forsøk og retries mot samme materiale,
- bruke kandidatresultater som input til nye autonome KI-analyser,
- bevare full historikk og proveniens uten overskriving,
- lagre maskinresultater direkte i en avgrenset kandidatdel av produksjonsdatabasen,
- bygge prioriterte review-køer for mennesker som kommer inn senere,
- hindre KI teknisk fra å godkjenne, kanonisere, publisere eller åpne dekningspåstander,
- vise maskinframdrift, menneskelig review og publiseringsberedskap som uavhengige dimensjoner,
- gjenbruke eksisterende bibliotek- og corpusarbeid uten å gi historiske maskinresultater falsk menneskestatus.

## 4. Ikke-mål

Denne arkitekturen skal ikke:

- automatisk publisere eller åpne ekstern faktastemme,
- la modellkonsensus erstatte menneskelig review,
- fjerne krav til eksakt identitet eller lokator når en konkret promotering trenger det,
- avgjøre rettigheter, personvern, juridiske forhold eller Sápmi-relaterte rettighetsspørsmål maskinelt,
- omskrive alle eksisterende kanoniske modeller i første leveranse,
- gjøre `/masterhjerne` til et nytt manuelt statusregister,
- behandle «venter på menneske» som en teknisk systemfeil,
- love full produksjonsutrulling i samme endring som kandidatfundamentet opprettes.

## 5. Beslutninger som er låst

1. Kandidatresultater skal kunne skrives direkte til en avgrenset del av produksjonsdatabasen.
2. Kandidatdata er append-only. Korreksjoner skjer gjennom nye versjoner eller supersederende beslutninger, ikke overskriving.
3. KI-legitimasjon skal ikke ha skriverettigheter til reviewvedtak, kanoniske data, coverage eller publication.
4. Menneskelig review skjer senere og er ikke en forutsetning for analyse eller maskinell kryssanalyse.
5. Kildeidentitet, evidensnivå, reviewstatus og promoteringsstatus er uavhengige akser.
6. Det nåværende `LibraryAnalysisRecord` beholdes midlertidig som kompatibilitets- og visningslag, ikke som framtidig autoritetsmodell.
7. Første domenepilot er melk/kjøtt. NPK blir neste pilot for datasett- og tallorienterte kilder.
8. Implementering skal skje fra en isolert gren basert på oppdatert `origin/main`.

## 6. Regler som flyttes

| Nåværende plassering | Ny grense |
|---|---|
| Eksakt identitet før full analyse | Lesbare, hashbundne bytes er nok for kandidatproduksjon. Identitetsnivå følger resultatet og begrenser senere promotering. |
| Eierbekreftet kilderolle før `ready_for_owner` | KI kan ferdigstille en reviewpakke med foreløpig kilderolle. Mennesket bekrefter eller endrer rollen under review. |
| Ekstern trust anchor for maskinell livssyklusframdrift | Maskinhendelser lagres append-only med teknisk signatur og proveniens. Ekstern/human trust beholdes for myndighetsbærende vedtak og promotering. |
| Ett lineært, komplett KI-løp | Workflow-definerte kjøringer kan være parallelle, partielle, gjentatte og modellspesifikke. Krav vurderes per workflow og outputtype. |
| PDF-side som primær analyseform | En generell `ContentUnit` dekker side, avsnitt, slide, celleområde, tidskode, databasepost og datasettsegment. |
| `approved_internal` som maskinell status | Maskinell brukbarhet, menneskelig review og promoteringsmyndighet får separate felter og begreper. |

Ingen regel fjernes uten erstatning. Strenge krav flyttes til den operasjonen de faktisk skal beskytte.

## 7. Arkitektur

Systemet deles i tre logiske lag.

### 7.1 Kandidatlaget

Kandidatlaget mottar maskinelle analyser og er eneste skriveområde for autonome KI-workers. Det inneholder:

- normaliserte innholdsenheter,
- analysekjøringer og kjøringshendelser,
- maskinproduserte artefakter,
- kandidatpåstander og strukturerte funn,
- evidenskoblinger,
- avstamningskoblinger mellom kandidatresultater,
- reconciliation snapshots og konflikter.

Kandidatlaget kan leses av nye KI-kjøringer, reviewflater og intern søk/utforsking. All visning skal merke innholdet som maskinprodusert kandidat med synlig identitetssikkerhet, evidensnivå og reviewstatus.

### 7.2 Reviewlaget

Reviewlaget inneholder menneskelige beslutninger og kommentarer. KI kan lese reviewbeslutninger når det er nødvendig for videre arbeid, men kan ikke opprette, endre eller slette dem.

Et reviewvedtak bindes til:

- eksakt kandidat-ID og kandidatversjon,
- eksakt innholdshash og relevante evidensreferanser,
- reviewprofil og avgrenset formål,
- reviewer-identitet og myndighetsgrunnlag,
- tidspunkt og eventuelle begrensninger.

Review er ikke publisering. Et akseptert funn kan fortsatt mangle rettigheter, ekstern evidenspresisjon eller riktig publiseringsprofil.

### 7.3 Det kanoniske laget

Eksisterende kanoniske modeller for claims, entities, relasjoner, coverage og publication beholdes. De kan bare endres gjennom en separat promoteringstjeneste med egne legitimasjoner.

Promoteringstjenesten:

1. leser en bestemt kandidat og et bestemt menneskelig vedtak,
2. velger riktig målprofil,
3. revaliderer identitet, evidens, rettigheter og andre nødvendige gates,
4. låser målraden eller målsettet,
5. utfører en atomisk kanonisk endring,
6. skriver en uforanderlig promoteringskvittering.

## 8. Komponenter og ansvar

Navnene under er logiske kontraktnavn. Implementeringsplanen kan tilpasse de endelige Prisma-/SQL-navnene til repository-konvensjonene, men kan ikke slå sammen fullmaktsaksene eller ansvarsgrensene.

### 8.1 `ContentUnit`

Representerer den minste stabile enheten en analyse kan sitere eller bruke som input.

Støttede typer i målarkitekturen:

- `pdf_page`
- `document_section`
- `web_section`
- `slide`
- `sheet_range`
- `transcript_segment`
- `database_record`
- `dataset_slice`
- `media_segment`

Hver enhet har stabil intern ID, kilde-/materialreferanse, innholdshash, type, ordinal eller lokator, tilgjengelig normalisert tekst/data og separat identitetssikkerhet. Råtekst trenger ikke kopieres inn i alle kandidatposter.

### 8.2 `AnalysisRun`

Representerer ett konkret analyseforsøk. Metadata er uforanderlig etter opprettelse:

- workflow-ID og workflowversjon,
- modellleverandør, modellnavn og tilgjengelig modell-/buildidentitet,
- konfigurasjons- og prompt-hash,
- input-envelope-hash og eksplisitte inputreferanser,
- oppretter/worker-identitet,
- idempotensnøkkel,
- forsøknummer og eventuell foregående kjøring,
- formål og tillatt outputprofil.

Kjøringsstatus lagres som append-only `AnalysisRunEvent`, ikke som fritt redigerbar sannhet.

### 8.3 `AnalysisRunEvent`

Tillatte hendelser:

- `queued`
- `started`
- `checkpoint`
- `candidate_completed`
- `partial_completed`
- `failed`
- `blocked_input`
- `quarantined`
- `superseded`

En avledet read model gir nåværende maskinstatus. Hendelsesvalideringen skal hindre ulovlige overganger, men ikke kreve at alle workflows følger samme globale trinnrekkefølge.

Read modellen mapper blant annet `candidate_completed` til `candidate_complete` og `partial_completed` til `partial`; hendelsesnavn og avledet status er bevisst separate kontrakter.

### 8.4 `AnalysisArtifact`

Holder strukturerte eller blob-refererte maskinoutputs, for eksempel sammendrag, tabeller, klassifiseringer, entity-kandidater, gaps og risikoflagg. Artefakten bindes til eksakt kjøring og innholdshash.

### 8.5 `CandidateAssertion`

Representerer én reviewbar kandidatenhet. Eksempler:

- `claim`
- `classification`
- `entity_link`
- `relationship`
- `quantitative_observation`
- `coverage_signal`
- `gap`
- `contradiction`
- `source_role_suggestion`

Felt omfatter type, strukturert payload, maskinell konfidens, begrunnelse, begrensninger, identitetssikkerhet, evidensnivå og opphavskjøring. Konfidens kan aldri åpne en promoteringsport.

### 8.6 `EvidenceLink`

Knytter en kandidat til én eller flere `ContentUnit`-er. Koblingen lagrer locator, relevant utdragshash, relasjonstype og om evidensen støtter, motsier eller bare kontekstualiserer kandidaten.

Lokatorfravær gjør normalt kandidaten `partial`; det stopper ikke produksjon av kandidaten. En konkret promoteringsprofil kan senere kreve `exact_locator`.

### 8.7 `CandidateDependency`

Bygger proveniensgrafen når en kandidat bruker andre kandidater som input. Hver kant angir relasjonen, inputversjonen og hvordan oppstrøms begrensninger er arvet.

En avledet kandidat kan få høyere maskinell kvalitet gjennom ny evidens, men kan ikke arve eller produsere menneskelig autoritet.

### 8.8 `ReconciliationSnapshot`

En uforanderlig maskinell sammenstilling av flere kandidatpåstander. Den kan vise konsensus, uenighet, datagap, anbefalt kandidat og behov for ny kjøring. En anbefaling er fortsatt `candidate`.

### 8.9 `HumanReviewDecision`

Tillatte resultater:

- `accepted`
- `accepted_with_edits`
- `rejected`
- `deferred`
- `rerun_requested`

Et vedtak endrer ikke den opprinnelige kandidaten. `accepted_with_edits` oppretter en eksplisitt menneskelig kuratert representasjon eller patch som promoteringsgrunnlag. Senere beslutninger superseder tidligere beslutninger uten å slette dem.

### 8.10 `PromotionDecision`

Representerer en gjennomført eller avvist autoritetsheving. Den bindes til kandidat, reviewvedtak, målprofil, målrader, policyversjon, precondition-hasher og resultat. Den kan ikke opprettes av en KI-worker.

## 9. Uavhengige statusakser

En kandidat skal aldri ha ett samlet «godkjent»-felt. Minst disse aksene holdes separate:

### 9.1 Maskinstatus

`queued | running | candidate_complete | partial | failed | blocked_input | quarantined | superseded`

### 9.2 Menneskelig reviewstatus

`not_requested | queued | in_review | accepted | accepted_with_edits | rejected | deferred`

### 9.3 Promoteringsstatus

`candidate | internal_curated | external_eligible | published | revoked`

Promoteringsstatus lagres per kandidat og målprofil, ikke som ett globalt felt på kandidaten. Samme kandidat kan for eksempel være `internal_curated` for en navngitt intern analyseprofil og samtidig fortsatt være `candidate` for ekstern bruk. Et samlet statusfelt skal ikke kunne skjule denne forskjellen.

### 9.4 Identitetssikkerhet

`exact | provisional | unresolved`

### 9.5 Evidensnivå

`exact_locator | partial_locator | no_locator`

### 9.6 Rettighets- og valideringsakser

Ekspertvalidering, partnervalidering, rights-holder-validering, personvern, juridisk vurdering, arkivrettigheter, publisering og coverage forblir separate akser i tråd med `knowledge/review/REVIEW-LAYER-CONTRACT.md`.

## 10. Dataflyt

### 10.1 Registrering og normalisering

1. Kildemateriale registreres med tilgjengelige metadata og innholdshash.
2. Lesbart materiale deles i `ContentUnit`-er.
3. Identitetssikkerhet beregnes separat.
4. Manglende menneskelig review, kilderolle eller rettighetsbeslutning påvirker ikke analyseeligibility.

`blocked_input` skal normalt bare brukes når bytes/data mangler, ikke kan leses trygt, ikke kan hashes, bryter en eksplisitt sikkerhetspolicy eller ikke kan bindes til en stabil inputreferanse.

### 10.2 Planlegging

En scheduler oppretter `AnalysisRun` basert på en versjonert workflow. Idempotensnøkkelen skal minst omfatte input-envelope, workflowversjon, modell-/konfigurasjonsidentitet og formål. En identisk replay kan gjenbrukes eller avvises kontrollert, mens et eksplisitt nytt forsøk får egen run-ID.

### 10.3 Kjøring og kandidatproduksjon

Workers append-er kjøringshendelser og resultater. Workflowen definerer hvilke outputtyper og valideringer som kreves for `candidate_complete`. En manglende optional del kan gi `partial` uten å forkaste øvrige funn.

### 10.4 Reconciliation og rekursiv KI-bruk

Nye KI-kjøringer kan lese tidligere kandidater og reconciliation snapshots. Alle kandidat-inputs må registreres som `CandidateDependency`. Avledede resultater viser hele avstamningen og arver svakeste relevante myndighetsbegrensning.

Maskinell konsensus kan påvirke prioritet og konfidens, men aldri review- eller promoteringsstatus.

### 10.5 Reviewkø

Kandidater kan legges i kø etter risiko, verdi, konfliktgrad, evidensnivå, domene og ønsket målprofil. Reviewkøen er en arbeidskø, ikke en feilrapport. Store mengder `queued` eller `not_requested` er forventet når KI ligger foran menneskelig kapasitet.

### 10.6 Menneskelig review

Revieweren ser:

- kandidaten og alternative analyser,
- evidenskoblinger og locator-presisjon,
- identitetssikkerhet,
- modell-/workflowproveniens,
- oppstrøms kandidatavstamning,
- konflikter og begrensninger,
- hvilken målprofil som eventuelt ønskes.

Vedtaket er eksplisitt og begrenset til kandidaten og reviewprofilen.

### 10.7 Promotering

Promotering kjøres som separat kommando eller tjenesteoperasjon. Policyen revaliderer alle forutsetninger mot nåværende data. Endret kildehash, supersedert reviewvedtak eller drift i målraden gir avvisning eller ny review, ikke stille overskriving.

## 11. Målspesifikke gates

### 11.1 Kandidat og videre maskinell analyse

Krever:

- stabil og lesbar input,
- innholdshash,
- autorisert worker,
- versjonert workflow,
- gyldig outputformat og proveniens.

Krever ikke menneskelig review, eksakt bibliografisk identitet, rettigheter for publisering eller bekreftet kilderolle.

### 11.2 `internal_curated`

Krever:

- menneskelig `accepted` eller `accepted_with_edits`,
- kandidat og evidens som fortsatt matcher reviewvedtaket,
- eksplisitt intern bruksprofil,
- dokumenterte begrensninger når identitet eller locator ikke er eksakt.

Intern kuratering gir ikke automatisk ekstern bruk.

### 11.3 `external_eligible`

Krever målprofilens fulle gates. For påstander vil dette normalt omfatte eksakt identitet, tilstrekkelig lokator, riktig kilderolle, menneskelig review, rettigheter og relevante privacy/legal/rights-holder-vurderinger.

### 11.4 `published` og coverage

Publisering krever egen autorisert beslutning og målkontekst. Coverage krever separat coveragebeslutning og kan ikke avledes automatisk fra publisering. Syntesekilder skal ikke bli primær evidens gjennom promotering.

## 12. Databasefullmakter

Fullmaktsgrensen skal håndheves både i applikasjonskode og PostgreSQL.

| Rolle | Kan lese | Kan skrive |
|---|---|---|
| `candidate_worker` | Tillatte kilde-/innholdsenheter, egne og nødvendige kandidatdata | Nye runs, run-events, artifacts, assertions, evidence links og dependencies |
| `candidate_reconciler` | Kandidatlaget | Nye reconciliation snapshots og konfliktmarkører |
| `review_operator` | Kandidatlaget og reviewhistorikk | Nye reviewvedtak og reviewkommentarer |
| `promotion_service` | Kandidat, review, policy og kanoniske mål | Kontrollert kanonisk transaksjon og promoteringskvittering |
| `application_reader` | Avtalte read models | Ingen myndighetsbærende skriving |

Krav:

- KI-workerens databasebruker får ingen grants til kanoniske skriveoperasjoner.
- Ferdige kandidatposter kan ikke oppdateres eller slettes.
- Kjøringsstatus avledes fra append-only events eller endres bare via smal CAS-/stored-procedure-kontrakt.
- Reviewvedtak og promoteringskvitteringer er immutable.
- Service-legitimasjoner er separate; applikasjonsinstrukser alene skal ikke være sikkerhetsgrensen.
- Privilegietester kjøres mot en disponibel PostgreSQL-instans og forsøker eksplisitt de forbudte operasjonene.

## 13. Feil, konflikter og karantene

### 13.1 Partielle resultater

Manglende locator, enkeltseksjoner eller optional output gir `partial` når resten av analysen fortsatt er gyldig. Kandidaten kan brukes videre maskinelt med synlige begrensninger.

### 13.2 Identitetskonflikt

KI kan fortsette analyse mot de eksakte bytes den faktisk har lest. Konflikten blir egen kandidat/risikoflagg. Promotering som krever sterkere identitet forblir blokkert.

### 13.3 Motstridende analyser

Begge resultater beholdes. Reconciler lager konfliktgruppe og prioriterer den for review eller ny analyse. Systemet velger ikke stilltiende én sannhet.

### 13.4 Worker- eller schemafeil

Feilen avslutter bare den aktuelle kjøringen. Gyldige, allerede append-ede hendelser og artefakter bevares. Ugyldige payloads får ikke `candidate_complete`.

### 13.5 Gjentatte feil

En workflow, modellkonfigurasjon eller kilde kan settes i karantene etter policy. Karantene er smalt avgrenset og stopper ikke andre køer.

### 13.6 Kildedrift

Nye bytes gir ny innholdshash og ny analysekjede. Gamle kandidater og reviewvedtak beholdes. Avledede read models markerer potensielt foreldede beslutninger. Ingen gammel aksept overføres automatisk til ny kildeversjon.

### 13.7 Promoteringskonflikt

Promotering bruker lås og compare-and-swap mot kandidat-, review-, policy- og målhash. Drift avviser hele transaksjonen. Ingen delvis kanonisk endring tillates.

## 14. Integrasjon med eksisterende system

### 14.1 Corpus-protokollene

`knowledge/corpus/SOURCE-ANALYSIS-PROTOCOL.md` og `knowledge/corpus/workflows/source-analysis-v1.md` oppdateres slik at kandidatproduksjon kan skje før menneskelig kilderollebekreftelse og før alle promoteringsgates er lukket.

De eksisterende strenge artefaktene kan fortsatt brukes som høysikker inputprofil. De blir én analyseprofil, ikke den eneste lovlige banen for all maskinell lesing.

### 14.2 Corpus-livssyklusen

`src/lib/knowledge/corpus-processing-lifecycle.ts` skal ikke lenger bruke menneskelig source-role confirmation som forutsetning for at en maskinell reviewpakke er ferdig. Maskinstatus, reviewstatus og promotering skilles.

Den eksisterende trust-anchor-kjeden beholdes for autoritetsbærende hendelser. Vanlige maskinkjøringer føres i kandidatledgeren og får ikke menneskelig autoritet av å være teknisk attestert.

### 14.3 Source-analysis-input-manifest

`src/lib/knowledge/source-analysis-input-manifest.ts` utvides eller suppleres med en generell analyse-input-kontrakt. Eksakt identity-verified manifest forblir nødvendig for workflows som krever det, men foreløpige og uavklarte identiteter kan bruke en kandidatprofil så lenge bytes og innholdshash er stabile.

### 14.4 Bibliotekanalyse

`LibraryAnalysisRecord` og `src/lib/library-analysis-processing.ts` gir eksisterende dekning og kan fungere som overgangskilde/read model.

Migreringsregler:

- eksisterende maskinresultater importeres som kandidater,
- `humanReviewed = 0` forblir menneskelig urevidert,
- `approved_internal` mappes til maskinell brukbarhet, ikke `accepted`,
- eksisterende menneskelige eksterne vedtak bevares og bindes til eksakt historisk innhold der bindingen kan dokumenteres,
- uavklarbare historiske vedtak merkes for kontroll; autoritet gjettes ikke.

### 14.5 `/masterhjerne`

`src/app/masterhjerne/page.tsx` og `src/lib/data/masterhjerne.ts` skal lese en generert, datert og SHA-bundet kontrollsnapshot. Kontrollrommet viser minst:

- maskinkø, aktive kjøringer og kandidatgjennomstrømning,
- partielle/feilede/karantene kjøringer,
- kandidater per identitets- og evidensnivå,
- reviewkø, konflikter og alder,
- promoteringsstatus per målprofil,
- produksjons-/snapshotidentitet og siste oppdatering.

Pending review vises som kapasitet og backlog, ikke som rødt systemhavari. Ekstern readiness kan fortsatt være rød eller stengt.

## 15. API- og tjenestegrenser

Implementasjonen skal ha fokuserte grensesnitt, ikke én generell «skriv analyse»-operasjon.

Minstekontrakter:

- opprett immutable `AnalysisRun`,
- append validert `AnalysisRunEvent`,
- append artifact/assertion/evidence/dependency,
- les kandidatgraph og lineage,
- opprett reconciliation snapshot,
- les prioritert reviewkø,
- registrer human review decision gjennom autentisert reviewflate,
- forespør promotering gjennom separat autorisert kommando,
- les kontrollsnapshot.

Worker-endepunkter skal avvise review- og promoteringsfelter som ukjente felter, ikke ignorere dem.

## 16. Innføring i fire leveranser

### Leveranse 1: Kontrollkontrakt og kandidatfundament

Omfatter:

- oppdatert terminologi og autoritetsrekkefølge,
- datamodeller og framoverkompatibel migrering,
- append-only repository/tjenestelag,
- databasegrants og immutable-kontroller,
- machine-readable kontrollsnapshot-kontrakt,
- kompatibilitetsmapping for `LibraryAnalysisRecord`,
- tester som beviser tillatte og forbudte operasjoner.

Ingen autonom produksjonskjøring åpnes før denne leveransen er migrert, verifisert og runtime-identiteten er bevist.

### Leveranse 2: Autonome analyseadaptere og pilot

Omfatter:

- eksisterende PDF- og bibliotekprosesser,
- generell `ContentUnit`-normalisering,
- parallelle runs, retries og reconciliation,
- melk/kjøtt-pilot med hele materialet candidate-only,
- NPK-pilot etter at datasettadapteren er klar.

Mennesker skal ikke være nødvendig for å holde analysepipeline i gang.

### Leveranse 3: Review og kontrollrom

Omfatter:

- prioritert reviewkø,
- evidens- og lineagevisning,
- konfliktbehandling,
- menneskelige beslutninger,
- oppgradert `/masterhjerne`.

### Leveranse 4: Promotering

Omfatter:

- målspesifikke promoteringsprofiler,
- autorisert promoteringstjeneste,
- atomiske kanoniske transaksjoner,
- promoteringskvitteringer,
- revocation og stale-håndtering.

Hver leveranse får egen implementeringsplan og releasebevis. Denne specen er den overordnede arkitekturen; første plan skal bare dekke leveranse 1.

## 17. Testing og verifikasjon

### 17.1 Datamodell og validering

- gyldige og ugyldige statuser,
- append-only og supersederingsregler,
- ukjente felt avvises,
- candidate/review/promotion kan ikke konflateres,
- identitet og evidens beholdes som separate akser.

### 17.2 Databasefullmakter

Mot disponibel PostgreSQL:

- worker kan opprette alle tillatte kandidatobjekter,
- worker kan ikke oppdatere eller slette ferdige kandidater,
- worker kan ikke skrive reviewvedtak,
- worker kan ikke skrive kanoniske claims/entities/coverage/publication,
- reviewer kan ikke promotere direkte,
- bare promotion service kan utføre kontrollert kanonisk transaksjon.

### 17.3 Parallellitet og retries

- to modeller kan analysere samme input samtidig,
- identiske idempotente retries dupliserer ikke resultatet,
- eksplisitt nytt forsøk bevarer begge kjøringer,
- out-of-order worker-events kan ikke korrumpere read model,
- karantene er workflow-/kildespesifikk.

### 17.4 Proveniens og rekursiv analyse

- alle kandidater binder eksakt run og input-envelope,
- kandidatbaserte analyser lager full `CandidateDependency`-graf,
- oppstrøms begrensninger følger avledet resultat,
- konsensus kan ikke endre reviewstatus,
- sykliske dependencies avvises.

### 17.5 Review og promotering

- review bindes til eksakt kandidatversjon,
- nye bytes gjør gammel review stale for ny versjon,
- ingen promotering uten menneskelig vedtak,
- målprofilens gates revalideres ved commit,
- CAS-drift gir null kanoniske delendringer,
- publication og coverage forblir separate.

### 17.6 Kompatibilitet og migrering

- historiske `LibraryAnalysisRecord` importeres uten falsk menneskestatus,
- eksisterende leseflater fungerer under overgang,
- rollback stopper ny skriving uten å miste historiske data,
- genererte snapshots oppdager drift i CI.

### 17.7 Verifikasjonsnivå per leveranse

Lokale tester er ikke produksjonsbevis. Produksjonsåpning krever separat kjede: migrering, CI, review, merge, deploy, runtime-SHA, databaseprivilegier, API og autentisert UI. Ingen ekstern menneske- eller rettighetsgate skal omtales som fullført uten faktisk kvittering.

## 18. Observability og kontrollsnapshot

Kontrollsnapshoten skal genereres fra autoritative datakilder og inneholde:

- schema-/snapshotversjon,
- generated-at,
- source commit og runtime commit når tilgjengelig,
- database-/datasettidentitet,
- tellergrunnlag og eventuelle lesefeil,
- maskinstatusfordeling,
- reviewstatusfordeling,
- promoteringsstatus per målprofil,
- identitets- og evidensfordeling,
- køalder, konflikter og karantener,
- eksplisitt `externalReady` som separat avledet verdi.

En sunn autonom pipeline kan ha stor menneskelig backlog og samtidig være `operational: true`, `reviewComplete: false`, `externalReady: false`.

## 19. Første pilot

Melk/kjøtt velges fordi domenet allerede har aktører, verdikjeder, selskapsdata og forskningsmateriale som kan teste både claims, entities, relasjoner og konflikter.

Piloten skal:

- analysere hele valgt materialsett uten menneskeport i analysebanen,
- kjøre minst to workflow-/modellvarianter på et definert delsett,
- produsere claims, entity-links, quantitative observations, gaps og contradictions,
- bruke kandidatresultater i minst én ny kryssanalyse,
- bygge reviewkø uten å promotere automatisk,
- demonstrere at KI-legitimasjonen ikke kan endre kanoniske data.

NPK følger som separat datasettpilot for tabeller, enheter, tidsserier, metodefelter og kvantitative konflikter.

## 20. Suksesskriterier

Designet er realisert når:

1. KI kan analysere `exact`, `provisional` og `unresolved` materiale med stabile bytes.
2. Parallelle kjøringer, retries og konflikter bevarer full historikk.
3. Alle kandidatresultater har kilde-, modell-, workflow- og inputproveniens.
4. Kandidater kan brukes i videre KI-analyse med komplett lineage og uten autoritetsheving.
5. KI-legitimasjon kan ikke teknisk skrive til review- eller kanoniske tabeller.
6. Ingen promotering lykkes uten riktig menneskelig vedtak og målspesifikke gates.
7. Eksisterende bibliotekanalyse migreres uten å gjøre maskinell status til human review.
8. Kontrollrommet skiller maskinframdrift, reviewkø og ekstern readiness.
9. Melk/kjøtt-piloten produserer en reviewbar kandidatbase uten automatisk promotering.
10. Drift, tester og releasebevis kan dokumentere nøyaktig hva KI gjorde, hva mennesker besluttet og hva som faktisk ble kanonisert.

## 21. Risikoer og mottiltak

### Kandidatlaget blir en skjult kanon

**Risiko:** Interne brukere eller KI-er behandler hyppig brukte kandidater som fakta.

**Mottiltak:** Tydelig candidate-merking, separat statusakse, lineage, bruksprofil og forbud mot å presentere kandidatlaget som eksternt klart.

### Rekursive analyser vasker bort usikkerhet

**Risiko:** Flere analyseledd gjør en svak kilde til en tilsynelatende sterk syntese.

**Mottiltak:** Obligatorisk dependency-graf, arv av begrensninger og eksplisitt skille mellom konfidens og autoritet.

### Produksjonstilgang blir for bred

**Risiko:** Worker-legitimasjon kan misbrukes til myndighetsbærende endringer.

**Mottiltak:** Separate databasebrukere, minste privilegium, immutable triggers, negative privilegietester og separat promotion service.

### Reviewkøen blir uhåndterlig

**Risiko:** KI produserer flere kandidater enn mennesker kan gjennomgå.

**Mottiltak:** Risikobasert prioritering, reconciliation, deduplisering, supersedering og køalder som observability-metrikk. Stor backlog er ikke i seg selv systemfeil.

### Migreringen gir historiske data falsk status

**Risiko:** `approved_internal` tolkes som human acceptance.

**Mottiltak:** Eksplisitt mapping til maskinell brukbarhet, `not_requested`/`queued` review og ingen autoritetsgjetting.

### Arkitekturen blir for stor for én leveranse

**Risiko:** Schema, workers, UI og promotering blandes i én risikabel endring.

**Mottiltak:** Fire separate leveranser. Første implementeringsplan dekker bare kontrollkontrakt og kandidatfundament.

## 22. Relevante eksisterende filer

Første implementeringsplan må minst forholde seg til:

- `prisma/schema.prisma`
- `knowledge/review/REVIEW-LAYER-CONTRACT.md`
- `knowledge/corpus/SOURCE-ANALYSIS-PROTOCOL.md`
- `knowledge/corpus/workflows/source-analysis-v1.md`
- `src/lib/knowledge/corpus-processing-lifecycle.ts`
- `src/lib/knowledge/source-analysis-input-manifest.ts`
- `src/lib/library-analysis-processing.ts`
- `scripts/process-library-analysis.ts`
- `src/app/masterhjerne/page.tsx`
- `src/lib/data/masterhjerne.ts`
- relevante migreringer, API-er og kontrakttester.

Eksakte filer for leveranse 1 bestemmes i implementeringsplanen etter en ny kontroll av `origin/main`.

## 23. Avsluttende kontrollregel

Den nye modellen skal gjøre KI mer autonom uten å gjøre KI mer autoritativ.

Det er tillatt at maskinen arbeider langt foran menneskene. Det er ikke tillatt at maskinen flytter grensen for hva som er godkjent, kanonisk eller publiserbart.
