# Spec: Codex-native library-analysis orchestration

**Dato:** 2026-08-21  
**Status:** Design for review  
**Scope:** Full KI-analyse og separat KI-validering av den forseglede
library-analysis-resolutionen uten ekstern modellrunner, kandidatdatabase eller
menneskelig kildegjennomgang.

## 1. Mål og styringsgrense

Codex skal arbeide gjennom alle `1,569` analyseklar kilder og `8,393`
content units fra den forseglede full-resolutionen. Luna-subagenter utfører
avgrenset semantisk analyse. Hovedagenten orkestrerer, re-verifiserer bytes og
hashbindinger, kjører deterministiske gates og utfører en separat
valideringspass.

`externalReady=false` betyr at resultatet ikke er godkjent for ekstern
publisering eller offentlig faktabruk. Det betyr ikke at en ekstern KI-tjeneste
skal brukes. Denne løsningen bruker bare modellene som er tilgjengelige inne i
den aktive Codex-oppgaven; repository-kode gjør ingen modell-API- eller
nettverkskall.

```text
automatedOnly=true
externalReady=false
externalApiUsed=false
candidateDatabaseWritten=false
productionDataMutated=false
humanSourceReviewRequired=false
```

## 2. Forseglet input

Køen må bindes til disse eksisterende verdiene:

- population hash:
  `00a9ab5b9105442d0c6ce9a84102a5ca681a0949d331bd635277febacd789dcb`
- acquisition plan hash:
  `db450c5c8b392ead8b99908360904e7a6cec89af674085c239a3f81f50f78b76`
- acquisition resolution hash:
  `1bc3d95b4629547c6b4372698adb816c8791a861f8efe379c1121125929ada91`
- content-unit manifest hash:
  `694a3bfeb66d666891998d05afc6fd7bf393f57e4e8be6d7dcf0d1a0b6576397`
- acquisition cost-envelope hash:
  `6869492cb0f99789ac986c324ebae1e91ea846e4085a70b496f1ad1ab1560638`
- merged private inventory hash:
  `b2a79f57cd9e225121e77028a5f78bf00c3a46941da4eeac2c3ee05d63b54079`

Analysekøen skal utledes fra resolution-rader med
`disposition=content_units_ready`, ikke fra den opprinnelige
population-eligibility. Det er nødvendig fordi `30` HTTPS-kilder og fem
repository/derived-kilder ble lesbare først i acquisition-fasen.

Før købygging skal alle unit-payloads leses tilbake fra den private roten og
verifiseres mot manifestets path, mode, byte size, code-point count og SHA-256.

## 3. Hvorfor eksisterende runner ikke kan brukes direkte

Den eksisterende `buildLibraryAnalysisRequestBatch` forventer at hver units
locator og content hash er identisk med én population-rads base-locator og
content hash. Acquisition-emitteren lager derimot chunk-spesifikke locators og
hashes. Runneren filtrerer også på opprinnelig `eligibility=eligible`, og mister
dermed kilder som ble resolved gjennom HTTPS, repository eller derived routes.

Validation-requesten inneholder bare assertion-ID og payload-hash. Den mangler
claim-tekst, evidence excerpt, locator og content-unit-binding, selv om
validatorprompten krever at disse vurderes. Validatorens `contentHashStatus`,
`locatorStatus` og separation er dessuten selvrapportert, og deterministiske
gates blir ikke re-kjørt etter validation-response.

Fullkjøringen skal derfor ikke bruke `--ingest-analysis` eller
`--ingest-validation`. De modusene krever candidate-worker-database og skriver
gjennom kandidat-writeren. Først bygges en ny read-only, acquisition-aware
agentkø og en privat resultatkjede.

## 4. Valgt arkitektur

Tre muligheter ble vurdert:

1. **Codex-orkestrert Luna-analyse med hovedagent-validering — valgt.** Gir
   semantisk analyse, parallelitet, separat modellpass når runtime-identitet kan
   bevises, og ingen ekstern runner.
2. **Bare deterministiske gates.** Sikkert, men dekker ikke betydning,
   motsigelser, klassifikasjon eller material omissions godt nok.
3. **Lokal eller ekstern modellservice.** Ikke valgt; det strider mot den
   godkjente gjennomføringsgrensen og er unødvendig.

Maksimal samtidighet er tre Luna-analysearbeidere pluss hovedagenten. Hver
arbeider får unike, disjunkte private jobbpakker. Subagenter kan bare levere
forsøk; de kan ikke publisere en terminal source-result, full merge, database-
rad eller tracked research-artefakt.

## 5. Privat køkontrakt

Kømanifestet bruker schema `library-analysis-agent-queue/v1` og inneholder:

```text
schema
queueId
queueHash
createdAt
runtimeCommit
populationSnapshotId
populationHash
acquisitionPlanHash
resolutionHash
contentUnitManifestHash
costEnvelopeHash
mergedInventoryHash
chunkPolicyHash
selectionHash
workflow: id, version, path, hash
analysisPrompt: id, version, path, hash
validationWorkflow: id, version, path, hash
validationPrompt: id, version, path, hash
executionPolicy:
  externalApiUsed=false
  candidateDatabaseWritten=false
  trackedSourceText=false
  maximumAttempts=3
  maximumConcurrentAnalyzers=3
  maximumCodePointsPerJob=48000
  maximumUnitsPerJob=4
sources:
  sourceKind
  sourceKey
  sourceVersionHash
  unitIds
  unitCount
  codePoints
  bytes
  sourceEnvelopeHash
jobs:
  jobId
  sourceKind
  sourceKey
  segmentOrdinal
  unitIds
  unitOrdinalStart
  unitOrdinalEnd
  codePoints
  bytes
  inputEnvelopeHash
```

Manifestet er privat fordi det inneholder source keys og private paths. En
senere tracked kvittering kan bare inneholde totals, policyversjoner, hashes og
gateflagg.

`queueHash` binder hele den immutable køen. `selectionHash` binder
source-/unit-utvalget uavhengig av tidspunkt og attempt-status. Mutable status
skal aldri skrives inn i queue-manifestet.

## 6. Jobbdeling og kontekst

Arbeid fordeles etter code points og units, ikke bare kildeantall. Nåværende
fordeling er:

| Kildestørrelse | Antall |
|---|---:|
| opptil 12k code points | 1,032 |
| 12k–48k | 361 |
| 48k–120k | 78 |
| 120k–500k | 80 |
| over 500k | 18 |

En kilde på høyst `48,000` code points og fire units blir normalt én jobb.
Større kilder deles i deterministiske, sammenhengende unit-segmenter. Units fra
forskjellige kilder blandes aldri i samme jobb.

Alle units i en jobb må få én coverage-status:

- `claims_extracted`
- `no_material_claim`
- `blocked`

Dette hindrer at en agent returnerer én claim og umerkelig hopper over resten
av inputen. `blocked` krever en typed reason. Manglende coverage er ugyldig
output.

Segmentclaims skal bindes til original content-unit-ID, chunk-locator og et
verbatim evidence excerpt. Claims kan ikke introduseres under source-merge;
merge kan bare normalisere ID-er, deduplisere eller splitte en allerede
evidensbundet claim.

## 7. Luna-analysepass

Hver Luna-agent får:

- én privat jobbfil;
- bare jobbens egne verified unit payloads;
- analyseworkflow og prompt med eksakte hashes;
- output-path for et unikt `attempt-NNN`;
- forbud mot nettverk, andre sources, database og tracked output.

Agentens response bruker et nytt segmentformat som minst inneholder:

```text
schema=library-analysis-agent-segment-response/v1
jobId
jobHash
model: provider, name, version
unitCoverage[]
claims[]:
  localOrdinal
  assertionType
  contentUnitId
  text
  evidence
  locator
  confidence
responseHash
```

Agenten setter ikke endelige claim-ID-er. Orkestratoren genererer dem
deterministisk fra source envelope, job hash, content unit og lokal ordinal.

Output behandles som ubetrodd. Den aksepteres bare dersom schema, jobbhash,
modellidentitet, unit-coverage, locator-eierskap, evidence containment,
kvantitative fakta og output-hash passerer. Ugyldig forsøk forsegles som
evidence, og neste `attempt-NNN` opprettes. Etter tre mislykkede forsøk blir
jobben terminalt `quarantined` med typed reason.

## 8. Source-merge

Når alle segmenter for én kilde er terminale, bygges ett
`library-analysis-source-result/v1`:

- source envelope og alle segmenthashene;
- exact unit coverage for hele kilden;
- deterministisk sorterte og dedupliserte atomic claims;
- alle evidence excerpts og locators;
- analysis state `complete`, `partial`, `failed` eller `quarantined`;
- model identities og attempts;
- source-result hash.

En source kan ha null candidate claims dersom alle units eksplisitt er
`no_material_claim`. Det er et gyldig, dekningsbundet resultat og skal ikke
tvinges til å lage en kunstig `coverage_signal` med irrelevant source-evidence.

## 9. Separat valideringspass

Hovedagenten validerer hvert source-result mot de samme verified unit-bytene.
Validatorinput må inneholde full claim-tekst, assertion type, evidence excerpt,
locator, unit-ID og claim/output-hasher; hashes alene er ikke nok.

For hver claim kjøres:

1. schema- og source-envelope-verifikasjon;
2. request/result/content/locator-hashkontroll;
3. evidence substring og exact locator-eierskap;
4. kvantitativ kontroll av verdi, fortegn, prosenttype, valuta, unit, periode,
   geografi, universe og metode;
5. modellvurdering av motsigelse, semantisk support, klassifikasjon,
   high-risk og material omission;
6. deterministic derivation av disposition.

Separation deklareres aldri bare fra agenttekst. Dersom runtime-receipts beviser
at Luna-analysemodellen og hovedagentens validator er forskjellige, og
deterministiske gates er kjørt, kan nivået være
`separate_model_plus_deterministic`. Hvis modellidentitet ikke kan bevises,
settes nivået konservativt til `same_model`, og resultatet blir minst `partial`
og `candidate_only`.

F1–F5 stopplinjene er:

- F1 eller F2: quarantine;
- claim-bearing F3: quarantine;
- F4: quarantine;
- material F5 som påvirker claim eller high-risk: quarantine;
- øvrig material F3/F5: partial, candidate-only;
- incomplete coverage, stale/missing hash eller invalid locator: aldri reusable.

Ingen ren KI-validering representerer human review, uavhengig ekstern
verifikasjon eller publication authority.

## 10. Checkpoint, resume og audit

Attempts bruker separate private røtter. Arbeidsfiler opprettes `0600` og
forsegles `0400`. Ferdige attempts gjenbrukes bare etter schema-, hash-, mode-
og recursive inventory-verifikasjon. Ufullstendige attempts overskrives aldri.

Køstatus utledes fra immutable attempt-receipts:

```text
pending -> assigned -> analysis_terminal -> validation_terminal
        -> source_terminal -> queue_terminal
```

En full queue er terminal bare når:

- alle `1,569` source identities finnes nøyaktig én gang;
- alle `8,393` units finnes nøyaktig én gang;
- jobbsettene er pairwise disjoint og komplett dekkende;
- hver jobb og source har terminal analysis-status;
- hver source har terminal validation-status;
- alle accepted outputs er lest tilbake og hash-verifisert;
- final merge og private inventory er forseglet.

## 11. Pilot før full kø

Før full dispatch kjøres en deterministisk semantic pilot på `10–12` sources,
maksimalt `100` units og omtrent `200k–300k` code points. Utvalget skal dekke:

- database documents i flere størrelsesklasser;
- minst én segmentert medium/stor kilde;
- controlled HTTPS/PDF;
- CSV;
- PPTX;
- derived record.

Piloten består bare dersom:

- alle jobber er hashbundet og coverage-komplette;
- ingen output inneholder out-of-scope source/unit;
- deterministic gates reproduserer samme resultat ved replay;
- analysis og validation er separate private pass;
- resume gjenbruker ferdige attempts og bevarer ufullstendige;
- ingen source text, private path eller identifier lekker til Git eller statuslogg;
- en forseglet pilot-receipt dokumenterer faktiske dispositions og gaps.

Ved grønn pilot fortsetter de samme tre Luna-agentene gjennom full kø i små
bølger. Hovedagenten validerer og forsegler hver bølge før neste dispatch.

## 12. Tester og akseptanse

Implementasjonen skal utvikles med witnessed RED → GREEN og dekke:

- acquisition-aware mapping av alle `1,569 / 8,393` identities;
- avvisning av chunk/path/hash/locator drift;
- deterministisk segmentering og komplett unit coverage;
- disjunkte agentassignments;
- response-schema, output hash og model receipt;
- evidence containment og quantitative gates;
- claim-dedup uten nye claims under merge;
- full assertion payload i validatorinput;
- programmatisk separation derivation;
- F1–F5 fail-closed disposition;
- attempt/resume, overwrite- og symlinkvern;
- private recursive audit og tracked-artifact leak guard.

Library-analysis-testene, TypeScript, målrettet ESLint,
`audit:research-artifacts` og `git diff --check` må være grønne. Den kjente,
scope-uavhengige corpus-health schemahash-baselinefeilen skal rapporteres
separat og ikke skjules eller repareres i denne fasen.

## 13. Ikke del av denne fasen

- kandidatdatabase, migrasjon, rolleaktivering eller candidate writer;
- ekstern modellservice, Ollama eller repository-initiert modell-API;
- human review eller rights-holder review;
- publication, coverage, promotion, canonical data eller production mutation;
- push, PR, merge eller deploy uten separat autorisasjon.
