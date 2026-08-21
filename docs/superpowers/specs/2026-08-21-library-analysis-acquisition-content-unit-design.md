# Kontrollert kildeinntak og innholdsenheter for library-analysis

- **Dato:** 2026-08-21
- **Status:** Designretning godkjent av Gabriel 2026-08-21; skriftlig spesifikasjon venter eksplisitt review
- **Overordnet valideringsdesign:** `docs/superpowers/specs/2026-08-20-automated-library-analysis-validation-design.md`
- **Kandidatarkitektur:** `docs/superpowers/specs/2026-08-18-autonomous-ai-candidate-layer-design.md`
- **Planleggingsgrunnlag:** privat populasjonssnapshot `library-analysis-population:00a9ab5b9105442d0c6ce9a84102a5ca681a0949d331bd635277febacd789dcb`
- **Styringsprofil:** KI-validert intern beslutningsstøtte med `automatedOnly=true` og `externalReady=false`

## 1. Formål

Denne spesifikasjonen etablerer det reproducerbare innløpet mellom library-
analysis-populasjonen og de separate KI-workflowene for analyse og validering.
Den skal:

1. gjøre alle maskinelt tilgjengelige kilder om til stabile, siterbare
   `CandidateContentUnit`-er;
2. bevare eksakte råbytes, uttrekksmetadata, hasher, lokatorer og verktøyversjoner;
3. dele store kilder deterministisk uten å gjøre en modell eller tokenizer til
   kildeautoritet;
4. gi hver populasjonsrad én eksplisitt inntaksdisposisjon;
5. holde råmateriale og uttrekt tekst privat og utenfor Git;
6. stoppe uleselige, tvetydige eller ubundne inputs før modellkjøring;
7. rette den observerte hashbindingen i dagens content-unit-inntak før pilot.

Spesifikasjonen omfatter kildeinntak, tekstuttrekk, normalisering, logisk
segmentering, deterministisk chunking, private manifester og content-unit-
inntak. Den omfatter ikke selve analyseprompten, validatorprompten,
produksjonsmigrasjonen eller aktivering av kandidatroller.

## 2. Verifisert utgangspunkt

Det forseglede planleggingssnapshotet inneholder 1 627 rader:

| Disposisjon | Antall | Betydning |
|---|---:|---|
| `eligible` | 1 534 | Eksakt bundet `Document.content` er lesbart i databasen |
| `superseded` | 17 | Styrt retained history med aktiv etterfølger |
| `blocked_input` | 76 | Mangler et verifisert innholdslag i snapshotet |

De 76 blokkerte radene består av:

- 66 `SourceDoc`-rader med ekstern URL; to har også DOI;
- fire eksterne rapporter med URL; to har også DOI;
- én masteroppgave med URL og DOI;
- to interne rapport-/synteseposter med til sammen 27 støttekildereferanser;
- to eksisterende CSV-filer i repository;
- én eksisterende PPTX-fil i repository.

Antallene er planleggingsbevis for dette snapshotet, ikke hardkodede
systemgrenser. En ny populasjon må telles og forsegles på nytt.

Den nåværende content-unit-builderen har en kontraktfeil: den sammenligner
råhashen til `Document.content` både med snapshotets `contentHash` og med
`sourceVersionHash`. Den korrekte kontrakten er:

```text
contentHash       = sha256(Document.content)
sourceVersionHash = sha256([Document.summary, Document.content]
                           .filter(Boolean)
                           .join("\n\n"))
```

Disse hashene kan være like når sammendrag mangler, men skal ikke kreves å
være like. Inntaket må lese og verifisere både `summary` og `content`.

## 3. Låste beslutninger

1. Det eksisterende populasjonssnapshotet er immutable og blir aldri
   tilbakeskrevet etter kildehenting.
2. Nye inputbindinger lagres i et separat, immutable og hashbundet
   `LibraryAnalysisAcquisitionResolutionManifest`.
3. Resolution-manifestet refererer eksakt populasjonshash og kan ikke brukes
   mot en annen populasjon.
4. Kontrollerte eksterne hentinger bruker HTTPS, manuelle redirects,
   `credentials=omit`, begrenset størrelse og eksplisitt timeout.
5. Råbytes, uttrekt tekst og private kjøreartefakter lagres utenfor repository.
6. Git kan bare inneholde schema, kode, tester, workflowdefinisjoner og
   sanitiserte kontrollkvitteringer uten råkildetekst.
7. `sourceVersionHash`, råmaterialhash, normalisert teksthash og content-unit-
   hash er separate, navngitte bindinger.
8. Canonical content units overlapper ikke. Nabokontekst settes sammen i
   run-inputen uten å duplisere evidenslokatorene.
9. Kildehenting eller uttrekk kan aldri reparere `Document.content` eller andre
   kanoniske produksjonsdata som en sideeffekt.
10. KI kan analysere metadata og et kildegrunnlag, men kan ikke late som en
    manglende intern rapporttekst er tilgjengelig.
11. Ingen kandidatdatabase skrives før kandidatmigrasjon, roller og writer-
    attestasjon er separat autorisert og verifisert.
12. Alle automatiske outputs forblir kandidater med `automatedOnly=true` og
    `externalReady=false`.

## 4. Vurderte tilnærminger

### 4.1 Anbefalt: adapter over eksisterende kontrakter

Bygg en smal adapter som leser det forseglede snapshotet og gjenbruker:

- kontrollert HTTPS-henting og `source-acquisition-receipt`;
- eksisterende PDF-verktøy og locatorprofiler;
- kandidatlagets `CandidateContentUnit`-kontrakt og append-only writer;
- eksisterende private snapshot-/atomic-write-mønster.

Adapteren legger til resolution-manifest, formatspesifikke extractors og en
deterministisk chunker. Dette gir minst ny kode og beholder allerede testede
sikkerhetsgrenser.

### 4.2 Avvist: reparer produksjonsdokumenter først

Å hente tekst og skrive den til `Document.content` før analysen ville gjøre
legacy-tabellen til et skjult stagingområde. Det blander kildeinntak,
kanoniske endringer og kandidatproduksjon, og krever rollback/backup for hver
kilde. Det er ikke nødvendig for den interne kandidatprofilen.

### 4.3 Avvist: transient henting inne i modellkjøringen

Direkte URL-henting fra analyseworker ville gjøre modellinput avhengig av
nettverkstidspunkt, redirects og senere sideendringer. Uten et separat
råmaterial- og extraction-manifest kan kjøringen ikke reproduseres eller
etterprøves. Modellen skal derfor aldri være fetcher eller extractor.

## 5. Arkitektur og komponenter

### 5.1 `LibraryAnalysisAcquisitionPlan`

En deterministisk plan bygges fra et validert populasjonssnapshot. Hver rad får
nøyaktig én route:

- `database_document`;
- `controlled_https`;
- `repository_csv`;
- `repository_pptx`;
- `database_derived_record`;
- `superseded`;
- `unresolvable`.

Planen inneholder bare identiteter, forventede lokatorer, route, policyversjon
og populasjonsbinding. Den inneholder ikke råtekst. Sorteringen er stabil på
`sourceKind` og `sourceKey`, og planhashen beregnes fra canonical JSON.

### 5.2 `ControlledSourceAcquirer`

For `controlled_https` gjenbrukes den eksisterende receipt-generatoren med:

- bare `https://` uten credentials eller fragment;
- manuell redirect-kjede, maksimalt fem hopp;
- `GET`, `credentials=omit` og eksplisitt brukeragent;
- 60 sekunders request-timeout;
- maksimalt 100 MiB per response;
- samsvar mellom observert body-lengde og eventuell `Content-Length`;
- endelig URL, HTTP-status, MIME, byteantall og SHA-256;
- bounded retry for transportfeil, men aldri for deterministiske 4xx-feil.

Det eksisterende batchverktøyet som krever forhåndskjent hash og to fysiske
arkivkopier brukes ikke direkte. For automated-only kjøreinntak er én
innholdsadressert privat arbeidskopi tilstrekkelig. To-copy recovery for en
senere kanonisk kilderegistrering forblir en separat port.

### 5.3 Privat artifact store

Standardrot er:

```text
~/.local/share/foodsystems/library-analysis-runs/<run-id>/
```

Krav:

- rot og mellomkataloger har mode `0700`;
- filer opprettes eksklusivt med mode `0600`;
- ferdig forseglede rå-, tekst- og manifestfiler settes til `0400`;
- atomisk rename brukes først etter fsync og hashverifisering;
- innholdsadresserte filnavn bruker SHA-256, ikke URL eller dokumenttittel;
- symlinks, traversal, eksisterende mål og filer utenfor roten avvises;
- logger viser kilde-ID, status og hasher, aldri råtekst eller secrets.

### 5.4 `SourceExtractor`

Extractor velges fra observerte bytes og MIME, ikke bare filendelse.

| Input | Primærmetode | Logisk enhet | Stoppregel |
|---|---|---|---|
| HTML | versjonert DOM-/tekstuttrekk uten script, style, SVG og head | `web_section` | tom eller navigasjonsdominert tekst blir blokkert |
| PDF | `pdftotext` med bevart sidegrense | `pdf_page` | korrupt eller tekstløs PDF blir `ocr_required` |
| Plain text/JSON | streng UTF-8-dekoding og formattilpasset normalisering | `document_section` eller `database_record` | ugyldig encoding/schema blokkeres |
| CSV | RFC 4180-kompatibel parsing med eksplisitt delimiter og encoding | `sheet_range` | inkonsistent kolonneform eller binær payload blokkeres |
| PPTX | ZIP/XML-lesing i faktisk slideorden, med slide-ID og tekstnoder | `slide` | korrupt pakke eller ulovlige eksterne relasjoner blokkeres |
| Databasepost | canonical JSON fra eksplisitt felt-allowlist | `database_record` | ukjent felt eller driftet schema blokkeres |

OCR er ikke en skjult fallback. Dersom piloten finner tekstløse PDF-sider,
opprettes en separat, versjonert OCR-profil med bildehash, engine/build,
språkprofil og sidevis confidence. Fram til den profilen er implementert får
kilden terminal inntaksstatus `blocked_input:ocr_required`.

### 5.5 `NormalizedTextManifest`

Hvert vellykket uttrekk skriver et manifest med:

- source key og source kind;
- route og acquisition-receipt-hash;
- råmaterialets SHA-256 og størrelse;
- extractor-navn, build/versjon og config-hash;
- normaliseringspolicy og policyversjon;
- normalisert teksthash og tegn-/byteantall;
- logiske enheter med type, ordinal, locator, offsets og enhetshash;
- warnings og eksplisitte kvalitetsflagg.

Normalisering konverterer CRLF/CR til LF og erstatter ugyldige Unicode-
sekvenser med en deterministisk feil, ikke et erstatningstegn. Formatspesifikk
fjerning av markup registreres som extractorlogikk. Generell whitespace skal
ikke kollapses på tvers av avsnitt eller tabellceller.

### 5.6 `DeterministicContentChunker`

Chunkeren mottar én logisk enhet og produserer ikke-overlappende, ordnede
content units:

1. behold enheten hel når den er høyst 12 000 Unicode code points;
2. ellers del først ved avsnittsgrense;
3. hvis et avsnitt er for langt, del ved setningsgrense;
4. hvis én setning fortsatt er for lang, bruk en hard code-point-grense;
5. ingen chunk kan være tom eller overstige 12 000 code points;
6. sammenføyning i ordinal rekkefølge skal rekonstruere den normaliserte
   logiske enheten eksakt.

Canonical chunks har ingen overlap. Analysekoordinatoren kan legge forrige og
neste unit i samme input-envelope når kontekst trengs. Evidens peker fortsatt
til den ene eksakte, ikke-overlappende uniten som bærer påstanden.

Locatorformatet binder formatlokator og normaliserte offsets, for eksempel:

```text
database:Document:<id>:content#chars=0-11984
https:<source-key>#page=12&chars=0-8341
repository:<source-key>#slide=7&chars=0-2014
repository:<source-key>#rows=101-175&chars=0-9450
```

Offsetslutt er eksklusiv. Locator-hash beregnes med eksisterende
`candidateAnalysisEvidenceLocatorHash`.

### 5.7 `LibraryAnalysisAcquisitionResolutionManifest`

Resolution-manifestet bindes til:

- schema- og workflowversjon;
- eksakt population snapshot ID og population hash;
- acquisition-plan-hash;
- extraction-/chunk-policyhash;
- full sortert radliste;
- samlet manifesthash.

Hver populasjonsrad får nøyaktig én inntaksdisposisjon:

- `content_units_ready` med én eller flere unit-referanser;
- `superseded` med retained-history-binding;
- `blocked_input` med en typed, stabil reason code;
- `failed_retryable` med attempt og bounded retry-grense;
- `quarantined` ved hash-, path-, MIME- eller schemabrudd.

Tillatte blocker-koder inkluderer minst:

```text
missing_locator
http_not_found
http_forbidden
transport_exhausted
response_too_large
unsupported_media_type
corrupt_payload
empty_extraction
ocr_required
identity_ambiguous
source_version_drift
derived_record_missing_dependencies
```

Et resolution-manifest er komplett bare når antall disposisjoner er identisk
med snapshotets populasjonstotal og hver `sourceKind + sourceKey` forekommer
nøyaktig én gang.

## 6. Ruting av det nåværende snapshotet

### 6.1 1 534 databasedokumenter

Inntaket leser `id`, `summary` og `content` i en `REPEATABLE READ`, read-only
transaksjon. Det verifiserer:

1. `sha256(content) == snapshot.contentHash`;
2. composite-hashen av `summary + content` er lik `sourceVersionHash`;
3. source key, document-ID og locator følger den eksakte bindingen;
4. verdiene ikke endrer seg mellom snapshot og inntak.

Sammendrag og innhold behandles som separate logiske enheter med felles
`sourceVersionHash`. Dermed kan begge brukes som input uten at råtekst-hashen
blandes med dokumentversjon-hashen.

### 6.2 71 eksterne kilder

De 66 `SourceDoc`-radene, fire eksterne rapportene og masteroppgaven går
gjennom `controlled_https`. DOI brukes som fallback-lokator når primær URL
mangler eller gir en deterministisk ikke-finnbar respons; både DOI-redirect og
endelig URL registreres.

En HTML-landingsside som bare lenker til en PDF blir ikke behandlet som
rapportens fulltekst. En deterministisk same-origin PDF-kandidat kan følges
bare når policyen kan bevise én entydig dokumentlenke; ellers blir raden
`blocked_input:identity_ambiguous`.

### 6.3 To interne rapport-/synteseposter

Disse behandles som `database_derived_record`, ikke som ekstern primærevidens.
En canonical JSON-representasjon bygges fra en eksplisitt allowlist av
rapportmetadata og sorterte `supportingSources`. De 27 referansene blir
avhengigheter og analyseres gjennom egne kilder der de kan løses.

Metadataenheten kan brukes til å analysere rapportens deklarerte omfang og
kildegraf. Den kan ikke brukes som bevis for påstander som bare ville stått i
en manglende rapporttekst. En slik påstand blir F1/F2 eller
`blocked_input:derived_record_missing_dependencies`.

### 6.4 To CSV-filer

Repositoryfilene bindes til faktisk fil-SHA-256 og eksisterende source key.
Headeren gjentas i hver `sheet_range`-payload, men hashgrunnlaget skiller
header, radintervall og originalfil. Rekkefølge og tomme celler bevares.

CSV-filene er interne metadata-/arbeidskilder. De får ikke automatisk høyere
evidensnivå eller ekstern claim-status fordi de er lesbare.

### 6.5 Én PPTX-fil

PPTX-filen bindes til faktisk ZIP-payloadhash. Slides leses etter
presentasjonsrekkefølgen i pakken, og hver slide får eget ordinal, slide-ID,
teksthash og locator. Speaker notes kan tas med som en separat logisk enhet når
de faktisk finnes og relasjonen er intern i pakken.

Bilder, diagrammer og figurer uten maskinlesbar tekst blir registrert som
`non_text_content_present`; modellen får ikke dikte innhold fra filnavn eller
alt-tekst som mangler.

## 7. Content-unit-identitet og inntak

For hver chunk beregnes ID deterministisk fra:

```text
sourceKind
sourceKey
sourceVersionHash
unitType
ordinal
locator
contentHash
chunkPolicyHash
```

`sourceVersionHash` representerer hele den kildematerialversjonen som uniten
tilhører. `contentHash` representerer bare den eksakte normaliserte teksten i
uniten. Replay av samme manifest skal returnere samme unit-ID og `created=false`.

Content-unit-builderen må støtte to moduser:

- **private emit:** skriver et fullstendig, hashbundet request-/intakemanifest
  uten databasekontakt;
- **candidate intake:** bruker bare den attesterte intake-writeren etter at
  kandidatdatabasen og rollen er separat autorisert.

Ingen content-unit-rad inneholder råtekst i kandidatdatabasen. Råteksten
refereres gjennom privat locator og verifiseres mot unitens content hash når
analyseworker bygger input-envelope.

## 8. Dataflyt

```text
sealed population snapshot
        |
        v
deterministic acquisition plan
        |
        +--> database read-only snapshot
        +--> controlled HTTPS receipts + private raw bytes
        +--> repository file hash verification
        |
        v
format-specific extraction
        |
        v
normalized text manifests
        |
        v
deterministic, non-overlapping content units
        |
        v
sealed acquisition resolution manifest
        |
        +--> private emit + token/cost estimate
        |
        `--> attested candidate intake (separate authorization gate)
```

Analyse- og validatorworkflowene kan bare starte når de har samme population-
og resolution-hash i sine input-envelopes.

## 9. Feilhåndtering, retries og stopplinjer

- Nettverksfeil retryes maksimalt tre ganger med bounded backoff og ny attempt-
  kvittering.
- HTTP 401, 403, 404 og 410 retryes ikke automatisk i samme kjøring.
- HTTP 429 og 5xx kan retryes innenfor samme tre-attempt-grense.
- Redirect til HTTP, credentials, fragment eller mer enn fem hopp avvises.
- Endret bodyhash mellom attempts beholdes som driftbevis og kan ikke
  overskrive en allerede forseglet kopi.
- MIME/payload-uoverensstemmelse gir karantene, ikke beste-gjetning-parser.
- Korrupt PDF, CSV eller PPTX gir eksplisitt blocker og ingen modellinput.
- Uventet repository-filhash stopper bare den berørte kilden og markerer
  snapshotbindingen stale.
- Ukjent schemafelt i private manifester avvises fail-closed.
- Ingen feilbane logger raw bytes, uttrekt tekst, database-URL eller tokens.
- En delvis batch kan forsegles som checkpoint, men ikke som komplett
  resolution-manifest.

## 10. Pilot og innføringsrekkefølge

### Fase A: kontraktretting og private manifests

1. rett den observerte `contentHash`/`sourceVersionHash`-feilen med witnessed
   RED og GREEN;
2. implementer acquisition-plan og resolution-schema;
3. implementer private artifact-store-kontrakter og atomic sealing;
4. implementer private emit uten kandidatdatabase.

### Fase B: extractors og chunking

1. database document + summary;
2. HTML/plain text;
3. PDF med sidebinding;
4. CSV;
5. PPTX;
6. database-derived report records;
7. deterministisk chunker og content-unit-manifest.

### Fase C: kontrollert pilot

Piloten skal minst inneholde:

- ett databasedokument med sammendrag;
- ett svært stort databasedokument;
- én HTML-kilde;
- én PDF;
- én CSV;
- én PPTX;
- én intern derived report record;
- én forventet blocker.

Første pilot stopper etter private emit og publiserer bare antall, hasher,
blockers og tokenestimat. Ingen modell eller kandidatdatabase aktiveres som en
sideeffekt.

### Fase D: full acquisition-resolution

Etter grønn pilot behandles hele snapshotet i bounded batcher. Output er ett
komplett resolution-manifest med alle 1 627 disposisjoner. Først da kan analyse-
og validatorpiloten få et eksakt inputgrunnlag.

### Fase E: kandidatintak og KI-kjøring

Denne fasen krever separat godkjenning av:

- kandidatdatabasemigrasjon;
- backup/restore-bevis;
- kandidatrolle-bootstrap, enable og verify;
- eksakt writer-attestasjon;
- modellprovider, budsjettramme og secrets-path;
- pilotens stop/go-regler.

## 11. Token- og kostnadskontroll

Før modellkjøring beregner private emit:

- tegn, bytes, ord og content-unit-antall per kilde;
- estimert inputtokenintervall med eksplisitt estimatorversjon;
- estimert tokens per analysepass og validatorpass;
- forventet cache/reuse og maksimal retryeksponering;
- batchgrenser per modellens faktiske context window.

Estimatet skal rapporteres som intervall, ikke eksakt faktura. Det observerte
korpuset tilsier omtrent 13–17 millioner inputtokens for ett fullstendig pass
og omtrent 30–50 millioner modell-tokens for analyse pluss separat validering.
Ingen fullkorpuskjøring starter uten en forseglet cost envelope og eksplisitt
budsjettgrense.

## 12. Teststrategi

Implementeringen følger witnessed RED → GREEN for hver kontrakt.

### 12.1 Hash og identitet

- `contentHash` og `sourceVersionHash` verifiseres separat;
- sammendragstomt dokument kan ha like hasher uten særregel;
- sammendragsendring gjør source version stale uten å endre rå content hash;
- unit-ID og resolution-hash er stabile på replay;
- duplikat source key, locator eller ordinal avvises;
- endret chunkpolicy gir ny unit-identitet.

### 12.2 Henting og privat lagring

- HTTPS-only, credentials/fragment-forbud og redirectgrense;
- 2xx, 4xx, 5xx, 429, timeout og body-size-grense;
- `Content-Length`-avvik og MIME/payload-avvik;
- exclusive create, mode `0700`/`0600`/`0400`, fsync og atomic rename;
- symlink, traversal og overwrite-forsøk;
- logger og feilmeldinger inneholder ikke råtekst eller secrets.

### 12.3 Extraction

- HTML uten script/style/head og med beholdte avsnitt;
- PDF-sideorden, tom side, korrupt PDF og scanned-only PDF;
- CSV med quotes, linjeskift, tomme celler, BOM og inkonsistente rader;
- PPTX slideorden, notes, tom slide, korrupt ZIP og ekstern relasjon;
- derived record allowlist, sorterte dependencies og ukjent schemafelt;
- extractor-output må kunne rehashes fra den forseglede private teksten.

### 12.4 Chunking og fullstendighet

- code-point-grense, ikke UTF-16-index eller provider-tokenizer;
- avsnitt-, setnings- og hard fallback-delinger;
- ingen tomme, overlappende eller for store chunks;
- eksakt rekonstruksjon av hver normalisert logiske enhet;
- korrekt locator og eksklusiv end-offset;
- alle snapshotrader har nøyaktig én inntaksdisposisjon;
- `content_units_ready + superseded + blocked + failed + quarantined` er lik
  populasjonstotalen.

### 12.5 Integrasjon

- private emit bruker ingen kandidatdatabase;
- candidate intake bruker bare attestert intake-writer;
- samme population-/resolution-hash kreves av analyse og validator;
- blocked input kan ikke lekke inn i run-input-envelope;
- `automatedOnly=true` og `externalReady=false` kan ikke overstyres av
  acquisition-output.

## 13. Forventet implementeringsflate

Detaljplanen skal presisere flaten, men forventet scope er:

- ny library-analysis acquisition-plan-/resolution-modul under
  `src/lib/knowledge/`;
- ny privat artifact-store- og extraction-modul med små formatadaptere;
- ny deterministisk content-unit-chunker;
- utvidelse av `scripts/knowledge/ingest-library-analysis-content-units.ts`;
- ny CLI for plan, private acquisition/extraction og private emit;
- gjenbruk av `scripts/knowledge/generate-source-acquisition-receipt.ts`;
- eventuell intern refaktorering av eksisterende URL/PDF-profilkode for å
  dele testbare extractors, uten å endre legacy-repairatferd;
- package scripts for plan/check/execute/emit med eksplisitte sideeffektporter;
- fokuserte unit-, fixture-, CLI- og integrasjonstester;
- én sanitert statuskvittering etter faktisk pilot, uten råkildetekst.

Ingen Prisma-migrasjon, production deploy, tracked råkilde, web-runner-
utvidelse eller `LibraryAnalysisRecord`-reparasjon inngår i denne pakken.

## 14. Akseptansekriterier

Arbeidspakken er lokalt ferdig når:

1. dagens hashbinding er rettet og bevist med et dokument som har sammendrag;
2. plan og resolution-manifest er deterministiske og schema-validerte;
3. alle fem inputrutene har vellykkede og negative testfixtures;
4. private filer er atomiske, hashverifiserte og korrekt rettighetsbeskyttet;
5. chunks er ikke-overlappende, rekonstruerbare og høyst 12 000 code points;
6. private pilot emit dekker alle påkrevde formatklasser og én blocker;
7. pilotens populasjons-, plan-, resolution- og unit-hasher kan readbackes;
8. pilotens token-/kostnadsintervall er forseglet før modellvalg;
9. relevant test, typecheck, lint og artifact audit er grønne;
10. worktree inneholder ingen råkildebytes, uttrekt privat tekst eller secrets;
11. ingen database, rolle, deploy eller ekstern status er endret;
12. handoveren skiller lokalt bevis fra senere migrasjon, kjøring og release.

## 15. Stopplinje

En grønn acquisition-resolution betyr at systemet har reproduserbart,
hashbundet og maskinlesbart input. Det betyr ikke at innholdet er sant,
menneskelig reviewet, rettighetsklarert eller eksternt publiserbart.

Kilder som fortsatt ikke kan leses, identifiseres eller ekstraheres etter de
bounded maskinelle forsøkene skal få en eksplisitt terminal blocker. KI skal
ikke fylle manglende bytes, slides, tabellceller eller rapportsider med
antakelser. Analyse og separat validering starter først etter at innløpet har
bevist eksakt hvilke bytes og content units de faktisk får bruke.
