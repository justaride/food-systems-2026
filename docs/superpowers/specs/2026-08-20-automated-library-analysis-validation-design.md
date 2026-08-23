# KI-validert library-analysis for intern beslutningsstøtte

- **Dato:** 2026-08-20
- **Status:** Designretning godkjent av Gabriel 2026-08-20; skriftlig spesifikasjon venter eksplisitt review
- **Overordnet kandidatdesign:** `docs/superpowers/specs/2026-08-18-autonomous-ai-candidate-layer-design.md`
- **Sikkerhetsforutsetning:** `docs/superpowers/specs/2026-08-19-autonomous-ai-candidate-semantic-attestation-design.md`
- **Styringsbeslutning:** KI skal analysere, kvalitetssikre og ferdigstille alt maskinelt gjennomførbart library-analysis-arbeid. Resultatet er intern beslutningsstøtte med `automatedOnly=true`; det gir ikke menneskelig review, ekstern claim-autoritet eller publiseringsklarhet.

## 1. Formål

Denne spesifikasjonen erstatter den human-gated gjennomføringsmodellen for
`IG-006` med en automatisert analyse- og valideringsprosess for intern bruk.
Prosessen skal behandle hele det daterte library-analysis-populasjonsuttrekket,
bevare full proveniens, avvise risikable resultater automatisk og gjøre alle
rester eksplisitte.

«Ferdig» betyr her:

1. Hver rad i det forseglede populasjonsuttrekket har én entydig maskinell
   disposisjon.
2. Alle analyserte resultater er bundet til eksakte inputbytes eller records,
   workflow, prompt, modell, konfigurasjon og outputhash.
3. Alle kandidatpåstander har kontrollerbar evidenskobling, eller er avvist.
4. F1–F5-funn, avvisninger, manglende input og usikkerhet er synlige i status.
5. Bare lavrisikokandidater som passerer både analyse- og validatorløpet kan
   gjenbrukes som intern KI-kontekst.
6. Menneskelig review, rettigheter, partner-/aktørbekreftelse, kanonisering,
   coverage, ekstern claim-bruk og publisering forblir egne, uoppfylte porter.

Ferdig betyr ikke at alle kilder får et positivt resultat. `blocked_input`,
`partial`, `quarantined` og `superseded` er gyldige sluttresultater når de er
eksplisitte, begrunnede og hashbundet til populasjonen.

## 2. Bakgrunn og observerte svakheter

Den eksisterende `LibraryAnalysisRun`-piloten beviser at modellkort kan bindes
til en kilde og lagres append-only. Den nåværende akseptansegaten kontrollerer
imidlertid hovedsakelig form:

- kortet følger schemaet;
- en claim har tekst, et ikke-tomt evidensfelt og en locator;
- `sourcePath` peker ikke på en annen fil;
- modellen kan ikke gi seg selv `safe_for_external_claims`.

Den kontrollerer ikke at evidensutdraget faktisk bærer hele claimen. I
pilotmaterialet forekommer eksempelvis evidensutdrag som bare inneholder
`3.1 million litres`, selv om claimen også sier at volumet utgjorde 28 prosent.
Et ikke-tomt utdrag er derfor ikke det samme som semantisk grounding.

Produksjonsrunneren kopierer dessuten `scripts/`, men ikke alle modulene under
`src/lib` som scriptet importerer. Å kopiere den første manglende modulen løser
ikke hovedproblemet: web-runneren inneholder heller ikke et komplett,
rettighetsstyrt fulltekstgrunnlag for hele library-analysis-populasjonen.

Det eksisterende autonome kandidatlaget har riktig myndighetsmodell, men er
foreløpig ureleaset. Før det kan brukes må den semantiske
attestasjonsspesifikasjonen gjennomføres, kandidatgrenen integreres mot aktuell
`origin/main`, og migrasjon/roller verifiseres i riktig rekkefølge.

## 3. Låste beslutninger

1. KI-resultater skrives som kandidater, aldri som menneskelig review.
2. Kandidathistorikk er append-only; ny analyse eller retting oppretter ny run
   eller eksplisitt supersession.
3. Analyse og validering er to separate, hashbundne workflows.
4. Validatoren får kildegrunnlaget og det forseglede kandidatuttrekket, men
   arver ikke analysatorens frie begrunnelse eller skjulte arbeidskontekst.
5. Modell-/providerseparasjon registreres som metadata, ikke omtales som
   uavhengig review.
6. Deterministiske kontroller kjøres før og etter den semantiske KI-validatoren.
7. Maskinell gjenbruk representeres som `reusable_for_ai_context`, ikke
   `approved_internal`, `accepted` eller `internal_curated`.
8. Ingen maskinell kjøring kan opprette `HumanReviewDecision`,
   `PromotionDecision`, kanoniske claims, publication- eller coverage-status.
9. `externalReady` forblir `false` i automated-only-modus.
10. Faktisk modellfeilrate kan ikke hevdes uten et uavhengig referansegrunnlag.
    Systemet publiserer automatiske funn-, avvisnings- og uenighetsrater med
    korrekt avgrensning.

## 4. Ikke-mål

Denne leveransen skal ikke:

- simulere en navngitt reviewer eller skrive `reviewer="AI"`;
- sette `humanReviewed`, `reviewComplete` eller tilsvarende menneskeporter til
  grønt på grunnlag av KI-kjøringer;
- automatisk godkjenne eksterne claims, aktørroller, partnerskap eller effekt;
- avgjøre rettigheter, lisens, personvern eller juridisk publiseringsgrunnlag;
- gjøre modellkonsensus til sannhet eller autoritet;
- kopiere hele privatkorpuset inn i Git eller webapplikasjonens runner-image;
- fylle manglende fulltekst, målinger eller kilder med modellantakelser;
- omskrive `LibraryAnalysisRecord` til et nytt autoritativt sannhetsregister;
- lukke øvrige prosjektgap som krever intervjuer, eierbeslutninger, partnere,
  rights-holder eller eksterne kilder.

## 5. Arkitektur

### 5.1 Forutsetning: attestert kandidatfundament

Analysejobben kan ikke åpnes før kandidatfundamentet har:

- identisk Candidate Canonical JSON v1 i TypeScript og PostgreSQL;
- eksplisitt UTF-8-nøkkelorden og korrekt bevaring av JSON `null`;
- et repo-forankret sikkerhetsmanifest;
- attestasjon av eksakt writer-ABI, funksjonsbody, eier, ACL og triggergraf;
- fail-closed bootstrap, enable og verify;
- separate `candidate_worker`- og `candidate_reconciler`-legitimasjoner;
- ingen skriverett til human review, promotion eller kanoniske mål.

Dette er en teknisk sikkerhetsforutsetning, ikke en ekstern kvalitetsgodkjenning.

### 5.2 Populasjonssnapshot

Hver fullkorpuskjøring starter med et immutable populasjonssnapshot. Det skal
minst inneholde:

- snapshot-ID og tidspunkt;
- sortert liste over `sourceKind` og `sourceKey`;
- kildeversjon/content hash;
- tilgjengelig inputtype og locator;
- identitetssikkerhet;
- om bytes/records er lesbare og autorisert tilgjengelige for intern analyse;
- snapshotets samlede SHA-256.

Antall rader leses ved kjøring. Tallet 1 770 er siste kjente readback, ikke en
hardkodet kontrakt.

Alle snapshotrader må ende i nøyaktig én av disse disposisjonene:

- `candidate_complete`;
- `partial`;
- `blocked_input`;
- `quarantined`;
- `failed` med bounded retry-status;
- `superseded` med eksplisitt erstatterbinding.

En run kan ikke erklæres fullført dersom en snapshotrad mangler disposisjon.

### 5.3 Inntak og `ContentUnit`

Analyseinput skal komme fra hashbundne `CandidateContentUnit`-er. Prioritert
inntaksrekkefølge er:

1. Eksakt, normalisert dokumentinnhold fra databasen når dette er den
   autoritative interne kopien.
2. Privat, innholdsadressert artifact storage med verifisert locator og hash.
3. Kontrollerte repository-filer når de faktisk er lovlig lagret og med i
   runtime-scope.
4. Ellers `blocked_input`; en URL eller filsti uten tilgjengelige bytes er ikke
   analysert innhold.

Worker-imagen skal være en separat, smal jobb-/CLI-artifact med bare nødvendig
kode og kontrollert kildetilgang. Web-runneren skal ikke gjøres til generell
forskningsarbeider ved å kopiere inn hele `src/` og privatkorpuset.

### 5.4 Workflow A: analyse

Analysatoren produserer candidate-only output:

- sammendrag;
- korte funn;
- atomiske candidate assertions;
- kvantitative observasjoner med verdi, enhet, periode og geografi;
- evidenslenker til konkrete `ContentUnit`-er;
- implikasjoner og begrensninger;
- gaps, motsigelser og risikoflagg;
- anbefalt maskinbruk: `candidate_only`, `reusable_for_ai_context` eller
  `quarantined`.

Analysatoren kan foreslå `reusable_for_ai_context`, men forslaget har ingen
effekt før validatorworkflowen og de deterministiske reglene er ferdige.

### 5.5 Workflow B: semantisk validering

Validatoren er en ny `CandidateAnalysisRun` med eget:

- workflow- og prompt-ID;
- workflow-, prompt- og config-hash;
- modellprovider, modellnavn og modellversjon;
- input-envelope som omfatter kildens `ContentUnit`-er og eksakt
  analysemanifest/payloadhash;
- `CandidateDependency` til assertions som vurderes.

Validatoren gjennomfører minst fire pass:

1. **Claim-dekomponering:** Del sammensatte claims i atomiske proposisjoner,
   slik at ett utdrag ikke kan godkjenne en større påstand enn det bærer.
2. **Støtte og motsigelse:** Finn støtte, motbevis og begrensninger i hele den
   leverte inputen.
3. **Tallkontroll:** Sammenlign alle tall, enheter, perioder, kategorier og
   geografier med eksakt evidens.
4. **Utelatelses- og risikopass:** Let eksplisitt etter forbehold,
   metodebegrensninger, utvalgsproblemer og kontekst som kan endre betydningen.

Validatoren skriver F1–F5-funn som egne candidate assertions eller typed
validation artifacts. Den skriver aldri human review eller promotion.

### 5.6 Validatorseparasjon

Statusmetadata skal uttrykke faktisk separasjonsnivå:

- `same_model_same_prompt` — ugyldig for endelig automated validation;
- `same_model_distinct_prompt`;
- `different_model_same_provider`;
- `different_provider`.

Minimum for en avsluttet automated-only validering er
`same_model_distinct_prompt`, separate runs og separate input-envelopes. Et
sterkere nivå er ønskelig, men gir fortsatt ikke uavhengig menneskelig review.

## 6. F1–F5 og stoppregler

### 6.1 Feiltaksonomi

| Klasse | Maskinell definisjon | Standardutfall |
|---|---|---|
| F1 fabrikasjon | En atomisk proposisjon mangler støtte i de leverte inputenhetene, eller motsies av dem. | `quarantined` |
| F2 feilkobling | Kilde, content unit, locator, excerpt eller hash peker utenfor eller avviker fra faktisk input. | `quarantined` |
| F3 feilekstraksjon | Tall, enhet, periode, kategori, fortegn eller geografi avviker fra evidensen. | `quarantined` for claims; ellers minst `partial` |
| F4 feilklassifisering | Foreslått maskinbruk eller status er mer permissiv enn identitet, evidens eller risikoregler tillater. | Maskinbruk nedgraderes og resultatet merkes `quarantined` eller `partial` |
| F5 utelatelse | Vesentlig forbehold, metodebegrensning, motbevis eller kontekst er utelatt slik at meningen kan endres. | `partial`; `quarantined` når utelatelsen påvirker en claim eller høyrisikoklasse |

### 6.2 Deterministiske kontroller

Følgende skal ikke overlates til modellskjønn:

- schema og ukjente felt;
- content-, payload-, locator-, workflow-, prompt- og config-hasher;
- at evidenskoblingen eies av runens input-envelope;
- at sitert excerpt finnes i eller er hashbundet til riktig content unit;
- eksakt parsing av tall, prosent, valuta, dato og enhet når formatet er
  maskinlesbart;
- status-/machine-use-allowlist;
- at høyrisikoflagg ikke kan gi `reusable_for_ai_context`;
- at `safe_for_external_claims`, review-, promotion-, publication- og
  coverage-felt er urepresenterbare på workerskriveflaten;
- at terminalmanifestet dekker alle outputs og disposisjoner.

### 6.3 Bruksregel etter validering

`reusable_for_ai_context` krever samtidig:

- `candidate_complete` analyse og validatorrun;
- ingen åpen F1, F2 eller F3;
- ingen F4 som peker mot mer permissiv bruk;
- ingen material F5;
- stabil, lesbar og hashbundet input;
- minst `partial_locator` for ikke-claim syntese og `exact_locator` for
  candidate claims;
- ingen actor gate, rights/privacy/legal-gate, personpåstand, helse-/kausal
  claim eller ekstern effekt-/partnerpåstand;
- full arv av oppstrøms begrensninger.

Alt annet blir `candidate_only`, `partial`, `blocked_input` eller
`quarantined`. Ingen av disse utfallene er en skjult review-kø.

## 7. Målinger og kalibreringsspråk

Uten en uavhengig referansefasit kan systemet ikke hevde en sann, statistisk
modellfeilrate. Følgende målinger kan publiseres som automatiske
tillitsmetadata:

- analyserte rader / populasjon;
- rader med lesbart input og `blocked_input`;
- kandidat- og validatorgjennomstrømning;
- deterministisk avvisningsrate;
- validatorens F1–F5-funnrate per dataklasse;
- analyse–validator-uenighetsrate;
- andel `candidate_complete`, `partial`, `quarantined` og `failed`;
- locator- og hashintegritet;
- rate for `reusable_for_ai_context`;
- modell-, workflow-, prompt- og policyversjon for hver måling.

Feltnavn og brukerflater skal bruke `automatedFindingRate`,
`automatedRejectionRate` og `analysisValidatorDisagreementRate`, ikke
`modelErrorRate`, `accuracy` eller «uavhengig verifisert».

Den styrte kalibreringsfilen får en ny schema-versjon som skiller:

- `mode: automated_only`;
- automatiske runder og deres populasjonshash;
- eventuelle senere, separate human-reference-runder;
- automatisk funnrate fra faktisk referansebasert feilrate.

## 8. Status, API og UI

`/api/library-analysis/status` og den interne AI-kunnskapsflaten skal vise
minst:

```text
automatedOnly: true
automatedValidationState: not_started | running | complete | degraded
populationSnapshotId
populationHash
populationTotal
disposedTotal
candidateComplete
partial
blockedInput
quarantined
failed
reusableForAiContext
automatedFindingsByClass: { F1, F2, F3, F4, F5 }
automatedFindingRateByDataClass
analysisValidatorDisagreementRate
validatorSeparationLevel
humanReviewed
reviewComplete
externalClaimEligible
externalReady
```

Regler:

- `automatedValidationState=complete` krever `disposedTotal=populationTotal`
  og ingen uavklart terminalfeil.
- `humanReviewed` telles bare fra gyldige menneskelige receipts.
- `reviewComplete` beskriver bare en eksplisitt human-review-scope og kan ikke
  bli grønn av automated-only-runden.
- `externalReady` forblir `false` uten separat, gyldig ekstern
  promoteringskjede.
- Query-, kontrakt- eller snapshotfeil gir `degraded`, null maskinell
  gjenbruksautoritet og tydelige blockers.

UI skal ikke bruke «godkjent», «verifisert» eller «reviewet» om KI-resultater.
Tillatte formuleringer er blant annet «automatisk validert kandidat»,
«gjenbrukbar intern KI-kontekst», «karantenesatt» og «mangler lesbart input».

## 9. Forholdet til `LibraryAnalysisRecord` og IG-006

`LibraryAnalysisRecord` beholdes som legacy/read-model under overgangen.
Historiske verdier projiseres slik kandidatkontrakten allerede beskriver:

- `approved_internal` blir høyst maskinell `reusable_for_ai_context`;
- `humanReviewed=0` forblir null menneskelig review;
- historiske reviewmarkører uten komplett autoritetsbinding blir
  `legacyAuthorityState=unclassified`;
- eksterne bruksregler blir ikke maskinell eller menneskelig autoritet.

`IG-006` omrammes fra human-gated kalibrering til automated-only intern
validering. Gapet kan lukkes for den navngitte interne målprofilen når
fullkorpuskjøringen og alle maskinelle releaseporter er bevist. Det skal ikke
lukkes som menneskelig appraisal eller ekstern evidensgodkjenning.

Eventuelle avhengige gap må lese denne målprofilen eksplisitt. Et gap som
krever ekstern metode-, aktør-, partner- eller rights-holder-validering forblir
åpent selv om IG-006 er internt maskinelt ferdig.

## 10. Feilhåndtering og retries

- Uleselige eller utilgjengelige bytes gir `blocked_input`, ikke syntetisk
  analyse.
- Schema-, hash- og bindingfeil avviser hele det atomiske outputmanifestet.
- Transiente modell-/transportfeil kan retryes bounded med ny run-ID,
  predecessor og attempt.
- Identisk idempotensnøkkel lager ikke duplikathistorikk.
- Gjentatt deterministisk feil setter workflow-/kildekombinasjonen i
  karantene.
- Ny kildehash oppretter ny kjede; gammel automated validation blir stale.
- Motstridende analyser beholdes og avstemmes som candidate reconciliation.
- En batch kan rapportere fremdrift, men kan ikke rapportere `complete` før
  hver snapshotrad har terminal disposisjon.

## 11. Innføring

### Leveranse A: integrasjon og sikkerhetsforutsetning

- integrer kandidatgrenen mot aktuell `origin/main`;
- løs konflikter uten å miste nyere library-analysis-, migrasjons- eller
  statusarbeid;
- implementer semantisk attestasjonsspec;
- kjør candidate contract-, writer-, PostgreSQL-, recovery- og migrasjonsporter;
- opprett PR og merge først etter separat autorisasjon.

### Leveranse B: analyse-/validatorkontrakter og worker

- versjoner analyse- og validatorworkflow/prompt;
- bygg populasjonssnapshot og `ContentUnit`-inntak;
- bygg smal worker-artifact og scheduler/batchkontrakt;
- implementer deterministiske gates og F1–F5-output;
- legg til kontrollsnapshot og statusfelter.

### Leveranse C: tre-kilders pilot

- regenerer de tre eksisterende pilotene gjennom kandidatlaget;
- krev atomiske claims og fullstendige evidensutdrag;
- kjør separat validator og deterministiske kontroller;
- publiser kun automated-only målinger;
- stopp dersom en kritisk feil kan passere som `reusable_for_ai_context`.

### Leveranse D: begrenset representativ batch

- forsegl et stratifisert snapshot på tvers av kildetype, tekstgrunnlag og
  risikoklasse;
- kjør analyse, validator og reconciliation;
- verifiser alle terminaldisposisjoner og statusreadback;
- juster bare versjonerte regler; aldri omskriv gamle runs.

### Leveranse E: fullkorpus

- forsegl aktuell library-analysis-populasjon;
- kjør bounded batcher til hver rad har terminal disposisjon;
- regenerer kontrollsnapshot og status;
- dokumenter alle `blocked_input`, karantener, feil og stale kjeder;
- behold eksterne porter stengt.

### Leveranse F: releasebevis

For hver produksjonsendring skilles:

1. lokal TDD og full relevant regresjon;
2. commit og branchstatus;
3. PR og hosted CI;
4. merge-SHA;
5. databasebackup og migrasjon;
6. kandidatrolle-bootstrap/enable/verify;
7. deploy og runtime-SHA;
8. faktisk batch-run og kontrollsnapshot;
9. API-readback og autentisert intern UI;
10. menneskelig/ekstern authority, som fortsatt er separat og normalt rød.

## 12. Teststrategi

Implementeringen følger witnessed RED → GREEN per avgrenset oppgave.

### 12.1 Kontrakt og semantikk

- ufullstendig evidensutdrag kan ikke godkjenne en sammensatt claim;
- atomisk claim-dekomponering dekker alle tall og kvalifikatorer;
- feil kilde, locator, excerpt og hash gir F2;
- tall-, enhets-, periode- og geografiavvik gir F3;
- oversett forbehold gir F5 og minst `partial`;
- høyrisiko kan ikke bli `reusable_for_ai_context`;
- ukjente authority-felt avvises før databasekontakt.

### 12.2 Fullkorpus og status

- populasjonssnapshot er deterministisk og hashstabilt;
- hver rad har nøyaktig én terminal disposisjon;
- summerte disposisjoner er lik populasjonstotalen;
- queryfeil gir `degraded` og null maskinell gjenbruk;
- ny kildehash gjør tidligere run stale;
- automatiske rater omtales ikke som faktisk accuracy/error rate;
- `automatedValidationState=complete` kan sameksistere med
  `reviewComplete=false` og `externalReady=false`.

### 12.3 Sikkerhet og fullmakter

- worker kan bare bruke de attesterte kandidat-writerne;
- validator kan ikke skrive human review eller promotion;
- negative calls bevarer alle kandidattabeller;
- candidate roles kan ikke skrive `LibraryAnalysisRecord`, claims, coverage,
  publication eller reviewtabeller;
- semantic-attestation-mutasjoner feiler før LOGIN;
- produksjonsjobben bruker kandidatcredential, ikke app- eller migrasjonsrollen.

### 12.4 Integrasjon og release

- Prisma generate/validate og migrasjonsidempotens;
- candidate contract-/writer-/role-/snapshot-suite;
- relevante library-analysis-tester;
- status-API og UI-copy;
- lint, typecheck, build og `git diff --check`;
- full `npm test` etter repoets runtime-/loggregler;
- research artifact audit;
- produksjonsreadback mot eksakt runtime-SHA.

## 13. Forventet implementeringsflate

Detaljplanen skal redusere og presisere denne flaten før kodeendring:

- eksisterende semantic-attestation-filer i kandidatfundamentet;
- nye versjonerte analyse- og validatorworkflow/prompt-filer under
  `knowledge/corpus/workflows/`;
- kandidatkontrakt/writer bare der nye typed validation artifacts eller
  assertions krever det;
- ny populasjonssnapshot-/inntaksmodul;
- ny analyse-/validatorjobb og batchkoordinator;
- kandidatkontrollsnapshot og schema;
- `src/lib/queries/library-analysis.ts` og
  `src/app/api/library-analysis/status/route.ts`;
- intern AI-kunnskapsflate og copy;
- styrt kalibreringsfil i ny schema-versjon;
- completion-register og IG-006-rad uten å endre eksterne NO-GO-grenser;
- fokuserte kontrakt-, DB-, status-, UI- og release-tester.

Den eksisterende web-runneren skal ikke få generell kandidat-write authority.

## 14. Akseptansekriterier

### 14.1 Lokalt implementert

- kandidatfundamentets semantiske attestasjon er implementert og verifisert;
- analyse- og validatorworkflow er separate og hashbundet;
- piloten kan ikke godkjenne de kjente ufullstendige evidensutdragene;
- F1–F5 og deterministiske blockers gir riktige terminaldisposisjoner;
- automatiske og menneskelige statusakser er separate;
- relevant test-, type-, lint-, build- og auditmatrise er grønn;
- tracked scope er rent og dokumentert.

### 14.2 Teknisk produksjonsklar

- branch er integrert mot aktuell `origin/main`;
- PR/CI/merge er bevist;
- produksjonsbackup og migrasjon er bevist;
- kandidatroller er aktivert og verifisert med riktig runtime-identitet;
- worker kjører med smal kandidatcredential;
- tre-kilders pilot har terminale automated-only resultater;
- status-API og autentisert UI viser samme snapshot og hash.

### 14.3 Intern fullkorpus-ferdig

- alle snapshotrader har terminal disposisjon;
- ingen åpen F1/F2/F3 kan være `reusable_for_ai_context`;
- alle automatiske funn, avvisninger og uenigheter er rapportert;
- `automatedOnly=true` og `automatedValidationState=complete` er bevist;
- `humanReviewed` gjenspeiler bare faktiske receipts;
- `reviewComplete` og `externalReady` er fortsatt false uten separat authority;
- completion-registeret beskriver nøyaktig hvilken intern målprofil som er
  lukket, og hvilke eksterne porter som forblir åpne.

## 15. Stopplinje

KI kan ferdigstille all maskinelt tilgjengelig analyse, kontroll, feildeteksjon,
disposisjon, rapportering og intern gjenbruk. KI kan ikke gjøre fraværende
bytes tilgjengelige, produsere et uavhengig referansegrunnlag ved å kontrollere
seg selv, avgjøre rettigheter eller utstede menneskelig/ekstern autoritet.

Prosjektet skal derfor aldri bruke en grønn automated-only status til å si at
materialet er menneskelig reviewet, eksternt verifisert, rights-cleared,
partnergodkjent eller publiseringsklart.
