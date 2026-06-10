# Food TG Videreutvikling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gjøre Food TG fra en sterk intern kunnskapsbase til et eksternt validert beslutningsgrunnlag med pilotshortlist, finansieringsnote, kommuniserbar innsikt og 1-3 års roadmap.

**Architecture:** Arbeidet styres som seks parallelle, men kontrollerte strømmer: styring, aktørvalidering, primærkilde-/nordisk gap-tetting, claim/evidence-oppdatering, pilot/finance/roadmap og kommunikasjonsleveranse. Alle statusløft går via `decision-log-food-tg.md`, `claim-register-food-tg.md`, `evidence-matrix-food-tg.md` og `actor-outreach-food-tg-v0.1.md`.

**Tech Stack:** Markdown styringsdokumenter, lokal researchmappe, Prisma/Next.js-kunnskapsbase, npm audit-/testscript, citation-ledgers, source ledgers og manuell aktørlogg.

---

**Dato:** 2026-05-21  
**Eier:** Gabriel, med JTO/Cathrine/Einar for beslutninger og ekstern forankring  
**Status:** Arbeidsplan klar for utførelse  
**Kildestatus:** Bygger på intern statusanalyse, møteoversikt, mandat, Insight Pack v0.1, claim register, evidence matrix, actor validation pack, primary-check queue og siste auditstatus.  

## 0. Bruksregel

Denne planen skal brukes som styringsdokument for neste arbeidsfase. Den erstatter ikke eksisterende planfiler; den binder dem sammen til en utførbar rekkefølge.

Ingen påstand løftes fra `Utført internt` til eksternt validert uten dokumentert aktørrespons, kilde, dato, rolle og bruksrett. Ingen pilot omtales som pilotklar før eier, datatilgang, regulatorisk gate, off-taker og finansieringsvei er vurdert.

## 1. Kort strategisk retning

Prosjektet skal gå videre med:

| Element | Beslutning for videre arbeid |
|---|---|
| Hovedscope | Spor A + B |
| Tverrgående gate | Spor C |
| Spor A | Sirkulært fôr, importavhengighet, alternative proteiner, soya/SPC/EUDR-presisjon |
| Spor B | Prosess-sidestrømmer, matsvinnkvalitet og næringsstoffløkker |
| Spor C | Regelverk, kjøper, data, drift, governance, markedsmakt og KPI-minimum |
| Hovedrisiko | Ekstern forankring mangler |
| Første port | 10 arbeidsdagers valideringssprint før pilotcommitment |
| Sluttleveranse | Decision pack, pilotshortlist, finance note, roadmap og presentasjonsgrunnlag |

## 2. Filkart og ansvar

### 2.1 Eksisterende filer som skal være styrende

| Fil | Rolle i arbeidet | Handling |
|---|---|---|
| `docs/meetings/MØTEOVERSIKT.md` | Møte- og beslutningsbakgrunn | Brukes som historisk kravgrunnlag |
| `docs/project/mandates/food-transition-group-mandate-2026-04-21.md` | Mandat | Sjekkes mot alle leveranser |
| `docs/project/mandates/tg-charter-food-2026.md` | Charter | Oppdateres etter scope-vedtak |
| `docs/project/mandates/decision-log-food-tg.md` | Beslutningslogg | Må oppdateres samme dag som beslutninger tas |
| `docs/project/mandates/decision-memo-food-tg-scope-v0.3.md` | Scope-begrunnelse | Brukes som grunnlag for formelt vedtak |
| `docs/project/mandates/food-tg-insight-pack-v0.1-2026-05-18.md` | Navigasjonslag for innsikt | Pre-read for valideringssprint |
| `docs/project/mandates/claim-register-food-tg.md` | Claim ledger | Oppdateres etter hver primærsjekk/aktørrespons |
| `docs/project/mandates/evidence-matrix-food-tg.md` | Evidence ledger | Oppdateres når kilder legges til eller styrkes |
| `docs/project/mandates/claim-strength-report-food-tg-v0.1.md` | Språk- og risikostyring | Brukes før ekstern tekst skrives |
| `docs/project/mandates/actor-validation-pack-food-tg-v0.1.md` | Aktørspørsmål | Brukes i intervjuer og e-post |
| `docs/project/mandates/actor-outreach-food-tg-v0.1.md` | Outreach og responslogg | Skal bli operativ logg for alle svar |
| `docs/project/mandates/primary-check-queue-food-tg-v0.1.md` | Primærkildesjekk | Oppdateres med status og kildelenker |
| `docs/project/mandates/nordic-coverage-gap-analysis-2026-05-11.md` | Nordisk gapstatus | Oppdateres etter nye DK/SE/FI/IS-kilder |
| `docs/project/mandates/opportunity-radar-food-tg-v0.1.md` | Mulighetsprioritering | Oppdateres etter validering |
| `docs/project/mandates/source-shortlist-food-tg.md` | Prioritert kildeliste | Oppdateres med importerte/avviste kilder |

### 2.2 Nye filer som skal opprettes i denne fasen

| Fil | Formål | Opprettes i task |
|---|---|---|
| `docs/project/mandates/food-tg-baseline-freeze-2026-05-21.md` | Fast statuspunkt før ekstern validering | Task 1 |
| `docs/project/mandates/food-tg-validation-sprint-log-2026-05.md` | Dag-for-dag logg for aktørvalidering | Task 3 |
| `docs/project/mandates/food-tg-validation-findings-v0.1.md` | Syntese av valideringssvar | Task 8 |
| `docs/project/mandates/nordic-coverage-gap-analysis-2026-06.md` | Oppdatert nordisk gapstatus | Task 7 |
| `docs/project/mandates/pilot-brief-a1-single-cell-protein-feed-2026.md` | Pilot-/roadmap-brief A1 | Task 10 |
| `docs/project/mandates/pilot-brief-b1-okara-bsg-2026.md` | Pilotbrief B1 | Task 10 |
| `docs/project/mandates/pilot-brief-b2-food-waste-quality-2026.md` | Pilotbrief B2 | Task 10 |
| `docs/project/mandates/finance-note-food-tg-v0.1.md` | Funding og finansieringsstrategi | Task 11 |
| `docs/project/mandates/roadmap-food-tg-2026-2029-v0.1.md` | 1-3 års roadmap | Task 12 |
| `docs/project/mandates/food-tg-decision-deck-outline-v0.1.md` | Struktur for 10-15 slides | Task 13 |
| `docs/project/mandates/food-tg-public-language-bank-v0.1.md` | Trygge formuleringer til ekstern bruk | Task 14 |

### 2.3 Kontrollag lagt til 2026-05-21

Disse filene er lagt inn som ekstra porter før Task 13 og Task 14. De endrer ikke scope-status og løfter ingen claims til eksternt validert.

| Fil | Rolle | Brukes før |
|---|---|---|
| `docs/project/mandates/food-tg-circular-cities-transfer-analysis-2026-05-21.md` | Læring fra Circular Cities om whitepaper-, modell- og claim-kontroll | Videre utvikling av Food TG kunnskapsprodukt |
| `docs/project/mandates/food-tg-claim-lock-table-2026-05.md` | Publikasjonsfilter for claims | Decision deck, språkbank, roadmap |
| `docs/project/mandates/food-tg-figure-model-note-audit-2026-05.md` | Figurnoter og modellbegrensninger | App-screenshots, figurer, deck |
| `docs/project/mandates/food-tg-case-to-claim-index-2026-05.md` | Skille benchmark, hypotese, kandidat og effektbevis | Pilotbriefs og valideringssprint |
| `docs/project/mandates/food-tg-source-locator-risk-audit-2026-05.md` | Locator- og kildeport for high-risk claims | Ekstern tekst og figurer |
| `docs/project/mandates/insight-pack-outline-food-tg-v0.3.md` | Produksjonskontrakt for decision/insight pack | Task 13 decision deck outline |
| `docs/project/mandates/food-tg-decision-pack-v0.1.md` | Intern beslutningspakke for minimumsvedtak og valideringssprint | Før kandidatkort, språkbank og eventuell P1-outreach |

## 3. Arbeidsstrømmer

| Strøm | Eier | Output | Statusport |
|---|---|---|---|
| S0 Styring og scope | JTO/Cathrine/Einar + Gabriel | Beslutning logget, charter oppdatert | `Besluttet internt` |
| S1 Aktørvalidering | JTO/Cathrine/Gabriel | Responslogg, valideringsfunn, bruksrett | eksternt validert kun per claim |
| S2 Primærkilder og nordisk dekning | Gabriel/Codex | Oppdatert PCQ, source shortlist, coverage matrix | `citable_with_note` eller `citable_external` |
| S3 Claim/evidence hygiene | Gabriel/Codex | Oppdatert claim register og evidence matrix | Ingen `blocked_unsourced` i ekstern bruk |
| S4 Pilot og finance | Gabriel/Cathrine/JTO | Pilotbriefs, finance note, go/no-go | `Pilotkandidat`, ikke `pilotklar`, før eier finnes |
| S5 Roadmap og kommunikasjon | Thea/Martin/Gabriel | Roadmap, deck, språkbank, event-prep | Publiseres først etter portgodkjenning |

## 4. Tidsplan

| Periode | Hovedmål | Leveranse |
|---|---|---|
| 2026-05-21 til 2026-05-22 | Lås intern baseline og scope-beslutning | Baseline freeze + Decision Log-rad |
| 2026-05-25 til 2026-06-05 | 10 arbeidsdagers valideringssprint | Responslogg + validation findings |
| 2026-05-25 til 2026-06-07 | Primærkilde- og nordisk gap-tetting parallelt | Oppdatert PCQ + nordisk coverage v2026-06 |
| 2026-06-08 til 2026-06-12 | Claim/evidence-oppdatering og go/no-go | Oppdatert claim register + opportunity radar |
| 2026-06-15 til 2026-06-19 | Pilotbriefs og finance note | Tre pilotbriefs + finance note |
| 2026-06-22 til 2026-06-26 | Roadmap og decision deck | Roadmap v0.1 + deck outline |
| 2026-06-29 til 2026-07-03 | Ekstern leveransepakke og eventklar tekst | Språkbank + publiseringspakke |

## 5. Første 10 arbeidsdager

| Dag | Dato | Hovedhandling | Output |
|---:|---|---|---|
| 1 | 2026-05-25 | Send P1-outreach og lås responslogg | Alle P1-kontakter sendt/logget |
| 2 | 2026-05-26 | Book samtaler og kjør SSB/Tolletaten/HS-sjekk | Møteplan + PCQ-A-001/A-002 status |
| 3 | 2026-05-27 | Første A-samtaler: NMBU/Foods of Norway, fôraktør | A-funn logget med bruksrett |
| 4 | 2026-05-28 | Første B-samtaler: Mattilsynet/fagekspert, okara/BSG | B-funn logget med bruksrett |
| 5 | 2026-05-29 | C-gate: Matvett/TGTG/Konkurransetilsynet/DFØ | C-funn logget |
| 6 | 2026-06-01 | Første nordiske gap-kilder importeres og vurderes | Source shortlist oppdatert |
| 7 | 2026-06-02 | Oppfølgingsspørsmål til manglende aktører | Andre kontaktforsøk logget |
| 8 | 2026-06-03 | Claim review: status per CL-ID | Claim register endringsliste |
| 9 | 2026-06-04 | Go/no-go pre-read til JTO/Cathrine/Einar | Validation findings draft |
| 10 | 2026-06-05 | Scope/pilot gate-møte | Beslutningslogg + neste port |

## 6. Statusspråk som skal brukes

| Status | Betydning | Når brukes den |
|---|---|---|
| `Utført internt` | Analyse, notat eller hypotese laget internt | Standardstatus for dagens kunnskapsbase |
| `Besluttet internt` | NCH/Natural State har tatt en skriftlig beslutning | Etter Decision Log-rad |
| eksternt validert | Ekstern aktør har bekreftet claim eller metode | Bare med dato, rolle, bruksrett og dokumentasjon |
| `Forpliktet eksternt` | Aktør har sagt ja til konkret rolle, pilot, data, workshop eller finansiering | Bare med dokumentert ask og svar |
| `Publisert/levert` | Ekstern leveranse er sendt, publisert eller presentert | Etter faktisk utsending/publisering |

## 7. Task 1: Baseline freeze

**Files:**
- Create: `docs/project/mandates/food-tg-baseline-freeze-2026-05-21.md`
- Modify: `docs/project/mandates/README.md`
- Read: `research/CITABLE-KNOWLEDGE-BASE-STATUS.md`

- [x] **Step 1: Kjør repo-status**

Run:

```bash
git status --short --branch
```

Expected: tracked worktree er rent eller bare planfilendringer finnes. Untracked screenshots kan stå urørt.

- [x] **Step 2: Kjør minimumsgater før baseline skrives**

Run:

```bash
npm run db:audit
npm run db:audit:strict-sources
npm run research:source-gap-queue
npm run research:citation-readiness-queue
npm run audit:citable-reports
```

Expected: alle kommandoer passerer; source-gap queue har 0 P0/P1-blokkere for ekstern bruk.

- [x] **Step 3: Skriv baseline freeze**

Lag filen `docs/project/mandates/food-tg-baseline-freeze-2026-05-21.md` med denne strukturen:

```markdown
# Food TG Baseline Freeze 2026-05-21

**Status:** Intern baseline før ekstern valideringssprint
**Scope:** Spor A+B med C som tverrgående gate
**Ikke statusløft:** Ingen claim er validert eksternt gjennom denne filen

## Auditstatus

| Gate | Resultat | Dato |
|---|---|---|
| db:audit | pass | 2026-05-21 |
| db:audit:strict-sources | pass | 2026-05-21 |
| research:source-gap-queue | pass | 2026-05-21 |
| research:citation-readiness-queue | pass | 2026-05-21 |
| audit:citable-reports | pass | 2026-05-21 |

## Bruk

Denne baseline brukes som startpunkt for valideringssprinten. Den dokumenterer intern kvalitet, ikke ekstern forankring.

## Kjente porter

- Scope må besluttes internt.
- P1-aktører må kontaktes.
- Claim register må oppdateres etter respons.
- Finance note og roadmap må skrives etter validering.
```

- [x] **Step 4: Legg baseline inn i mandat-README**

Legg en ny rad i `docs/project/mandates/README.md`:

```markdown
| `food-tg-baseline-freeze-2026-05-21.md` | Baseline freeze | Aktiv | Fast intern status før ekstern valideringssprint. |
```

- [x] **Step 5: Verifiser markdown og whitespace**

Run:

```bash
git diff --check
```

Expected: ingen whitespace-feil.

- [x] **Step 6: Commit**

Run:

```bash
git add docs/project/mandates/food-tg-baseline-freeze-2026-05-21.md docs/project/mandates/README.md
git commit -m "docs: freeze food tg baseline before validation"
```

## 8. Task 2: Scope-vedtak og styringslogg

**Status 2026-05-21:** Blokkert for full gjennomføring fordi scope ikke er bekreftet av JTO/Cathrine/Einar. For å holde statusdisiplin er det opprettet en beslutningsforespørsel og sprintlogg i `venter scope-vedtak`-modus. Ingen rad skal legges inn i beslutningsloggen som faktisk beslutning før skriftlig bekreftelse finnes.

**Files:**
- Modify: `docs/project/mandates/decision-log-food-tg.md`
- Modify: `docs/project/mandates/tg-charter-food-2026.md`
- Read: `docs/project/mandates/decision-memo-food-tg-scope-v0.3.md`

- [ ] **Step 1: Bekreft beslutning med JTO/Cathrine/Einar**

Beslutningen som skal bekreftes skriftlig:

```text
Food TG går videre med Spor A+B som hovedscope, med Spor C som tverrgående adoption-, regelverks- og datagate. Gruppen kjører en 10 arbeidsdagers valideringssprint før pilotcommitment. Ingen claims løftes til ekstern validert status før primærsjekk eller aktørvalidering er dokumentert.
```

- [ ] **Step 2: Loggfør beslutningen**

Legg rad i `decision-log-food-tg.md`:

```markdown
| 2026-05-21 | Food TG videreføres med A+B som hovedscope og C som tverrgående gate. 10 arbeidsdagers valideringssprint kreves før pilotcommitment. | JTO/Cathrine/Einar | Scope følger møtene 13.04, 20.04 og 21.04, samt decision memo v0.3 og Insight Pack v0.1. | Åpent hovedscope, valideringssprint, pilotrekkefølge | docs/meetings/MØTEOVERSIKT.md |
```

- [ ] **Step 3: Oppdater åpne mandatfelt**

I `decision-log-food-tg.md`, sett `Hovedscope (A/B/C kombinasjon)` til `Lukket` hvis beslutningen faktisk er bekreftet.

- [ ] **Step 4: Oppdater charterets scope**

I `tg-charter-food-2026.md`, sørg for at North Star og scope sier:

```markdown
Food TG prioriterer sirkulært fôr/importavhengighet og sidestrømmer/matsvinnkvalitet som hovedspor, med adoption, regelverk, data, drift og markedsstruktur som tverrgående gate.
```

- [ ] **Step 5: Verifiser**

Run:

```bash
rg "A\\+B|Spor A|Spor B|Spor C|Eksternt validert" docs/project/mandates/decision-log-food-tg.md docs/project/mandates/tg-charter-food-2026.md
git diff --check
```

Expected: scope er synlig i begge filer, og ingen whitespace-feil.

- [ ] **Step 6: Commit**

Run:

```bash
git add docs/project/mandates/decision-log-food-tg.md docs/project/mandates/tg-charter-food-2026.md
git commit -m "docs: log food tg scope decision"
```

## 9. Task 3: Valideringssprint-logg

**Status 2026-05-21:** Opprettet i `venter scope-vedtak`-modus fordi scope ikke er formelt bekreftet. P1-listen er klar, men ingen outreach skal sendes før beslutning eller minimumsvedtak er loggført.

**Files:**
- Create: `docs/project/mandates/food-tg-validation-sprint-log-2026-05.md`
- Modify: `docs/project/mandates/actor-outreach-food-tg-v0.1.md`

- [x] **Step 1: Opprett sprintloggen**

Lag filen med denne strukturen:

```markdown
# Food TG Validation Sprint Log 2026-05

**Status:** Operativ logg
**Periode:** 2026-05-25 til 2026-06-05
**Scope:** A+B med C-gate

## Kontaktstatus

| Dato | Aktør | Kontakt | Spor | Kanal | Status | Bruksrett | Berører | Neste handling |
|---|---|---|---|---|---|---|---|---|

## Samtalenotater

| Dato | Aktør | Hovedfunn | Avkreftet | Bekreftet | Kan siteres | Krever oppfølging |
|---|---|---|---|---|---|---|

## Daglig sprintstatus

| Dato | Sendt | Booket | Gjennomført | Nye kilder | Claim-effekt | Risiko |
|---|---:|---:|---:|---:|---|---|
```

- [x] **Step 2: Legg inn P1-kontaktliste**

Legg disse radene i `Kontaktstatus` som startliste med `Status` = `klar til sending`:

```markdown
| 2026-05-25 | Landbruksdirektoratet / Miljødirektoratet | navngis før sending | A/C | e-post | klar til sending | ikke avklart | CL-C-011, PCQ-C-001 | Send EUDR/Norge-avklaring |
| 2026-05-25 | Denofa | navngis før sending | A | e-post | klar til sending | ikke avklart | CL-A-020, CL-C-011 | Send soya/SPC/fôrdata-spørsmål |
| 2026-05-25 | Skretting Norge / BioMar | navngis før sending | A | e-post | klar til sending | ikke avklart | CL-A-020 | Send fôrsammensetning og alternative proteiner |
| 2026-05-25 | NMBU / Foods of Norway | navngis før sending | A | e-post | klar til sending | ikke avklart | CL-A-001, CL-A-002 | Send modenhetsgate for encelleprotein |
| 2026-05-25 | Mattilsynet / fagekspert | navngis før sending | B/C | e-post | klar til sending | ikke avklart | CL-B-021, PCQ-B-002 | Send okara/BSG food-grade spørsmål |
| 2026-05-25 | Okara/BSG råvareeier | navngis før sending | B | e-post | klar til sending | ikke avklart | CL-B-014, CL-B-021 | Be om volum/kvalitet/avsetning |
| 2026-05-25 | Matvett / Too Good To Go | navngis før sending | B/C | e-post | klar til sending | ikke avklart | CL-B-022, CL-C-012 | Send matsvinnkvalitet/adoption-spørsmål |
| 2026-05-25 | Konkurransetilsynet / DFØ | navngis før sending | C | e-post | klar til sending | ikke avklart | CL-C-002, CL-C-005, CL-C-006 | Send innkjøp/handelsskikk-gate |
```

- [x] **Step 3: Synk outreach-pakken**

I `actor-outreach-food-tg-v0.1.md`, legg til en kort seksjon etter bruksregelen:

```markdown
## Sprintstatus 2026-05

Operativ responslogg føres i `food-tg-validation-sprint-log-2026-05.md`. Denne filen beholder e-posttekstene og spørsmålsbankene.
```

- [x] **Step 4: Verifiser**

Run:

```bash
rg "klar til sending|Sprintstatus 2026-05|food-tg-validation-sprint-log" docs/project/mandates/food-tg-validation-sprint-log-2026-05.md docs/project/mandates/actor-outreach-food-tg-v0.1.md
git diff --check
```

Expected: alle P1-aktører finnes i sprintloggen.

- [x] **Step 5: Commit**

Run:

```bash
git add docs/project/mandates/food-tg-validation-sprint-log-2026-05.md docs/project/mandates/actor-outreach-food-tg-v0.1.md
git commit -m "docs: prepare food tg validation sprint log"
```

## 10. Task 4: Send P1-outreach

**Files:**
- Modify: `docs/project/mandates/food-tg-validation-sprint-log-2026-05.md`
- Read: `docs/project/mandates/actor-outreach-food-tg-v0.1.md`

- [ ] **Step 1: Velg faktisk kontaktperson per aktør**

Fyll `Kontakt` i sprintloggen før utsending. Hvis navn mangler, bruk rolle og organisasjon, for eksempel `fagansvarlig EUDR, Landbruksdirektoratet`.

- [ ] **Step 2: Send EUDR/Norge-spørsmål**

Bruk teksten i `actor-outreach-food-tg-v0.1.md` §3. Etter sending, endre status til:

```markdown
sendt 2026-05-25
```

- [ ] **Step 3: Send fôrdata-spørsmål**

Bruk teksten i §4 mot Denofa, Skretting/BioMar og Sjømat Norge. Loggfør kanal og dato.

- [ ] **Step 4: Send NMBU/Foods of Norway-spørsmål**

Bruk teksten i §5. Be eksplisitt om originalartikler/DOI og hva som ikke bør formuleres som kommersielt.

- [ ] **Step 5: Send okara/BSG-spørsmål**

Bruk teksten i §6. Send til Mattilsynet/fagekspert og minst én råvareeier eller prosjektaktør.

- [ ] **Step 6: Send matsvinnkvalitet/adoption-spørsmål**

Bruk teksten i §8. Loggfør om svaret kan brukes offentlig, internt eller bare som bakgrunn.

- [ ] **Step 7: Verifiser at alle utsendinger er logget**

Run:

```bash
rg "sendt 2026-05-25|sendt 2026-05-26" docs/project/mandates/food-tg-validation-sprint-log-2026-05.md
```

Expected: minst åtte `sendt`-rader.

- [ ] **Step 8: Commit**

Run:

```bash
git add docs/project/mandates/food-tg-validation-sprint-log-2026-05.md
git commit -m "docs: log first food tg validation outreach"
```

## 11. Task 5: Primærkilde-sjekk for A og C

**Status 2026-05-21:** Delvis gjennomført uten scope-vedtak. SSB 08801-tidsserie er kjørt for 2020-2025 og EUDR-status er oppdatert mot Landbruksdirektoratet/Miljødirektoratet. Aktørvalidering, Tolletaten/SSB-metode for SPC/prepared feed og endelig EØS-/forskriftsstatus gjenstår.

**Files:**
- Modify: `docs/project/mandates/primary-check-queue-food-tg-v0.1.md`
- Modify: `docs/project/mandates/evidence-matrix-food-tg.md`
- Modify: `docs/project/mandates/source-shortlist-food-tg.md`

- [x] **Step 1: Kjør SSB 08801-tidsserie for soya og fôrkoder**

Hent 2020-2025 for:

```text
12010000 Soyabønner
23040000 Soyamel/oljekake
15071000 Soyaolje, rå
15079000 Soyaolje, annen
210610 Protein concentrates, ikke soyaspesifikk
23099040 Prepared animal feed, kan skjule fiskefôr/SPC
```

- [x] **Step 2: Dokumenter metodebegrensning**

I `primary-check-queue-food-tg-v0.1.md`, oppdater PCQ-A-001 og PCQ-A-002 med:

```markdown
SSB 08801 brukes som handelsstatistikk per varenummer, ikke som direkte bransjeforbruk. SPC kan ikke tolkes sikkert uten Tolletaten/fôraktørvalidering. Actor-data fra Denofa/Skretting holdes separat fra nasjonal importserie.
```

- [x] **Step 3: Sjekk endelig EUDR/Norge-status**

Sjekk Landbruksdirektoratet, Miljødirektoratet og Lovdata for om forskriftsutkastet etter 2025-09-30 høring er endret. Oppdater PCQ-C-001 med dato og konklusjon.

- [x] **Step 4: Oppdater evidence matrix**

Legg til eller oppdater EV-rader for:

```text
SSB 08801 soya/fôrkoder
Landbruksdirektoratet EUDR høring/status
Miljødirektoratet EUDR status
Lovdata/forskrift hvis publisert
```

Alle rader skal ha kildekvalitet, geografi, år, siterbarhet og neste handling.

- [x] **Step 5: Oppdater source shortlist**

Merk kildene som `primary`, `A/C`, `citable_with_note` eller `needs-primary-check` etter faktisk funn.

- [x] **Step 6: Verifiser**

Run:

```bash
rg "SSB 08801|23099040|210610|EUDR|soya" docs/project/mandates/primary-check-queue-food-tg-v0.1.md docs/project/mandates/evidence-matrix-food-tg.md docs/project/mandates/source-shortlist-food-tg.md
git diff --check
```

Expected: metodebegrensning står eksplisitt i alle relevante dokumenter.

- [x] **Step 7: Commit**

Run:

```bash
git add docs/project/mandates/primary-check-queue-food-tg-v0.1.md docs/project/mandates/evidence-matrix-food-tg.md docs/project/mandates/source-shortlist-food-tg.md
git commit -m "docs: tighten feed import and eudr primary checks"
```

## 12. Task 6: Primærkilde-sjekk for B

**Status 2026-05-21:** Delvis gjennomført uten scope-vedtak og uten aktørsvar. Okara/BSG er låst som benchmark/hypotese, ikke pilotbevis. Råvareeierdata og Mattilsynet/fagekspert-gate gjenstår.

**Files:**
- Modify: `docs/project/mandates/primary-check-queue-food-tg-v0.1.md`
- Modify: `docs/project/mandates/evidence-matrix-food-tg.md`
- Modify: `docs/project/mandates/source-shortlist-food-tg.md`

- [x] **Step 1: Lås okara/BSG som benchmark, ikke pilotbevis**

I PCQ-B-001 til PCQ-B-004, sørg for at planen sier:

```markdown
Axfoundation/Chalmers og RISE brukes som svenske benchmark. Norsk eller nordisk pilotklarhet krever råvareeier, hygiene-/food-grade-vurdering, stabiliseringsmetode, off-taker og bruksrett.
```

- [ ] **Step 2: Hent eller loggfør råvareeierdata**

For hver råvareeier som svarer, loggfør:

```text
tonn/år
batchfrekvens
tørrstoff/fukt
temperatur
mikrobiologi
nåværende avsetning
transport/logistikk
mulig off-taker
om data kan siteres
```

- [ ] **Step 3: Avklar Mattilsynet/fagekspert-gate**

Oppdater PCQ-B-002 og PCQ-B-004 med om okara/BSG-sporet er:

```text
grønn: kan beskrives som mulig pilotkandidat
gul: kan beskrives som hypotesespor med avklaringsbehov
rød: må parkeres eller flyttes til fôr/biogass/benchmark
```

- [ ] **Step 4: Oppdater evidence matrix**

Alle nye kilder skal ha EV-ID, geografisk dekning, år, kildekvalitet, siterbarhet, og om de støtter claim eller bare benchmark.

- [ ] **Step 5: Verifiser**

Run:

```bash
rg "okara|bryggerimask|BSG|food-grade|benchmark|off-taker" docs/project/mandates/primary-check-queue-food-tg-v0.1.md docs/project/mandates/evidence-matrix-food-tg.md docs/project/mandates/source-shortlist-food-tg.md
git diff --check
```

Expected: B-sporet skiller tydelig mellom benchmark, hypotese og pilotkandidat.

- [ ] **Step 6: Commit**

Run:

```bash
git add docs/project/mandates/primary-check-queue-food-tg-v0.1.md docs/project/mandates/evidence-matrix-food-tg.md docs/project/mandates/source-shortlist-food-tg.md
git commit -m "docs: update sidestream primary checks"
```

## 13. Task 7: Nordisk gap-tetting

**Files:**
- Create: `docs/project/mandates/nordic-coverage-gap-analysis-2026-06.md`
- Modify: `docs/project/mandates/source-shortlist-food-tg.md`
- Modify: `docs/project/mandates/evidence-matrix-food-tg.md`

- [ ] **Step 1: Opprett ny coverage-fil**

Lag `nordic-coverage-gap-analysis-2026-06.md` med denne strukturen:

```markdown
# Nordic Coverage Gap Analysis 2026-06

**Status:** Oppdatert etter validerings- og kildegap-sprint
**Formål:** Vurdere om Food TG-grunnlaget er tilstrekkelig nordisk for ekstern bruk

## Dekningsmatrise

| Tema | NO | SE | DK | FI | IS | Nordic | Vurdering |
|---|---:|---:|---:|---:|---:|---:|---|

## Nye kilder importert eller vurdert

| Land | Kilde | Tema | Status | Bruk | Neste handling |
|---|---|---|---|---|---|

## Fortsatt svake celler

| Land | Tema | Risiko | Minimum før ekstern bruk |
|---|---|---|---|
```

- [ ] **Step 2: DK minimumskilder**

Vurder og loggfør minst disse DK-sporene:

```text
KFST/Salling-Coop eller dagligvare/konkurranse
Klimarådet eller Fødevarestyrelsen for matsystem/klima
SEGES eller DTU for fôr/bioøkonomi/sidestrømmer
Fødevareklyngen som aktør-/økosystemkilde
```

- [ ] **Step 3: SE minimumskilder**

Vurder og loggfør minst disse SE-sporene:

```text
SLU for matsystem/fôr/bioøkonomi
Jordbruksverket for selvforsyning/beredskap
RISE for sidestrømmer/bryggerimask/food-grade
Axfoundation som benchmark, ikke effektbevis
```

- [ ] **Step 4: FI minimumskilder**

Vurder og loggfør minst disse FI-sporene:

```text
NESA/Huoltovarmuuskeskus for beredskap
Luke Food Balance eller matsystemdata
VTT/Luke for alternative proteiner/bioøkonomi
Volare/Finnprotein som benchmark eller aktørspor
```

- [ ] **Step 5: IS minimumskilder**

Vurder og loggfør minst disse IS-sporene:

```text
MAST for mattrygghet/regulatorisk ramme
100% Fish eller islandsk sjømat restråstoff som benchmark
Háskóli Íslands eller offentlig beredskaps-/matkilde hvis tilgjengelig
```

- [ ] **Step 6: Oppdater matrix og shortlist**

Alle nye kilder skal få status:

```text
integrert
citable_with_note
internal_context
needs-primary-check
rejected
```

- [ ] **Step 7: Verifiser**

Run:

```bash
rg "DK|SE|FI|IS|KFST|SLU|Luke|NESA|MAST|Axfoundation|RISE" docs/project/mandates/nordic-coverage-gap-analysis-2026-06.md docs/project/mandates/source-shortlist-food-tg.md docs/project/mandates/evidence-matrix-food-tg.md
git diff --check
```

Expected: hvert land har minst én ny vurdert kilde eller en eksplisitt gjenværende svakhet.

- [ ] **Step 8: Commit**

Run:

```bash
git add docs/project/mandates/nordic-coverage-gap-analysis-2026-06.md docs/project/mandates/source-shortlist-food-tg.md docs/project/mandates/evidence-matrix-food-tg.md
git commit -m "docs: update nordic coverage gaps for food tg"
```

## 14. Task 8: Validation findings

**Files:**
- Create: `docs/project/mandates/food-tg-validation-findings-v0.1.md`
- Modify: `docs/project/mandates/actor-validation-pack-food-tg-v0.1.md`
- Modify: `docs/project/mandates/actor-outreach-food-tg-v0.1.md`

- [ ] **Step 1: Skriv funnfilen**

Lag `food-tg-validation-findings-v0.1.md` med denne strukturen:

```markdown
# Food TG Validation Findings v0.1

**Status:** Intern syntese etter valideringssprint
**Dekker:** A, B og C-gate
**Ikke dekker:** Formell pilotcommitment eller finansiering

## Sammendrag

| Spor | Status | Viktigste bekreftelse | Viktigste avkreftelse | Bruksrett |
|---|---|---|---|---|

## Aktørrespons

| Aktør | Dato | Rolle | Berører | Responsstatus | Bruksrett | Claim-effekt |
|---|---|---|---|---|---|---|

## Go/no-go per kandidat

| Kandidat | Go/no-go | Hvorfor | Må lukkes før pilot |
|---|---|---|---|
```

- [ ] **Step 2: Klassifiser hver respons**

Bruk bare disse verdiene:

```text
bekreftet
delvis bekreftet
avkreftet
kan ikke deles
ikke relevant
ikke svart etter to forsøk
```

- [ ] **Step 3: Klassifiser bruksrett**

Bruk bare disse verdiene:

```text
kan siteres
intern bruk
bakgrunn
krever sitatsjekk
ikke bruk
```

- [ ] **Step 4: Oppdater actor validation pack**

I `actor-validation-pack-food-tg-v0.1.md`, legg inn en kort statusseksjon:

```markdown
## Sprintresultat 2026-06

Resultater fra første valideringssprint er samlet i `food-tg-validation-findings-v0.1.md`. Denne filen er fortsatt spørsmåls- og valideringspakke.
```

- [ ] **Step 5: Verifiser**

Run:

```bash
rg "Go/no-go|bekreftet|bruksrett|food-tg-validation-findings" docs/project/mandates/food-tg-validation-findings-v0.1.md docs/project/mandates/actor-validation-pack-food-tg-v0.1.md
git diff --check
```

Expected: alle responskategorier og bruksrettskategorier er eksplisitte.

- [ ] **Step 6: Commit**

Run:

```bash
git add docs/project/mandates/food-tg-validation-findings-v0.1.md docs/project/mandates/actor-validation-pack-food-tg-v0.1.md docs/project/mandates/actor-outreach-food-tg-v0.1.md
git commit -m "docs: synthesize food tg validation findings"
```

## 15. Task 9: Claim og evidence update

**Files:**
- Modify: `docs/project/mandates/claim-register-food-tg.md`
- Modify: `docs/project/mandates/evidence-matrix-food-tg.md`
- Modify: `docs/project/mandates/claim-strength-report-food-tg-v0.1.md`
- Modify: `docs/project/mandates/opportunity-radar-food-tg-v0.1.md`

- [ ] **Step 1: Lag claim-diff før endring**

Run:

```bash
git diff -- docs/project/mandates/claim-register-food-tg.md docs/project/mandates/evidence-matrix-food-tg.md
```

Expected: enten tom diff eller kjente endringer fra valideringssprinten.

- [ ] **Step 2: Oppdater claim register per respons**

For hver berørte CL-ID, oppdater:

```text
status
evidence
valideringsbehov
trygg formulering
utrygg formulering
bruksrett
neste handling
```

- [ ] **Step 3: Ikke statusløft uten dokumentert bruksrett**

Hvis aktørrespons er muntlig eller uten sitatgodkjenning, bruk:

```text
intern bruk
bakgrunn
needs-actor-validation
```

- [ ] **Step 4: Oppdater claim strength**

For hver claim som endrer styrke, oppdater språkanbefaling:

```text
kan sies eksternt
kan sies med forbehold
intern hypotese
skal ikke brukes eksternt
```

- [ ] **Step 5: Oppdater opportunity radar**

Sorter kandidatene slik:

```text
1. Validert go-kandidat
2. Lovende, men trenger én konkret gate
3. Benchmark/læring
4. Parkeringsspor
```

- [ ] **Step 6: Verifiser**

Run:

```bash
rg "Eksternt validert|needs-actor-validation|kan sies eksternt|skal ikke brukes eksternt|go-kandidat|benchmark" docs/project/mandates/claim-register-food-tg.md docs/project/mandates/claim-strength-report-food-tg-v0.1.md docs/project/mandates/opportunity-radar-food-tg-v0.1.md
git diff --check
```

Expected: claim-status, språkrisiko og opportunity ranking er konsistente.

- [ ] **Step 7: Kjør citable gates**

Run:

```bash
npm run research:citation-readiness-queue
npm run audit:citable-reports
```

Expected: ingen nye P0/P1-blokkere for ekstern bruk.

- [ ] **Step 8: Commit**

Run:

```bash
git add docs/project/mandates/claim-register-food-tg.md docs/project/mandates/evidence-matrix-food-tg.md docs/project/mandates/claim-strength-report-food-tg-v0.1.md docs/project/mandates/opportunity-radar-food-tg-v0.1.md
git commit -m "docs: update food tg claims after validation"
```

## 16. Task 10: Pilotbriefs

**Files:**
- Create: `docs/project/mandates/pilot-brief-a1-single-cell-protein-feed-2026.md`
- Create: `docs/project/mandates/pilot-brief-b1-okara-bsg-2026.md`
- Create: `docs/project/mandates/pilot-brief-b2-food-waste-quality-2026.md`

- [ ] **Step 1: Skriv A1-brief**

Bruk denne strukturen:

```markdown
# Pilot Brief A1 - Encelle-/gjærprotein i fôr

**Status:** Pilotkandidat eller roadmap-spor etter validering
**Ikke claim:** Kommersiell skala er ikke bevist uten aktørdata

## Problem
Importavhengighet og råvaresporbarhet i oppdrettsfôr gjør alternative proteiner strategisk relevante.

## Valideringsgrunnlag
| Kilde/aktør | Hva støttes | Begrensning | Bruksrett |
|---|---|---|---|

## Pilotminimum
| Gate | Minimum |
|---|---|
| Faglig modenhet | NMBU/Foods of Norway eller tilsvarende faglig vurdering |
| Industri | Minst én fôraktør med krav til volum, pris og dokumentasjon |
| Regulering | Mattilsynet/EU-fôrregelverk vurdert |
| Data | Substitusjonsnivå, art, forsøksbetingelser og LCA/kost avklart |
| Beslutning | Go/no-go fra JTO/Cathrine/Einar |

## Første 6-12 uker
| Uke | Handling | Eier | Output |
|---|---|---|---|
```

- [ ] **Step 2: Skriv B1-brief**

Bruk samme struktur for `okara/BSG`, med gates:

```text
råvareeier
hygiene/food-grade
stabilisering
transport
off-taker
bruksrett
```

- [ ] **Step 3: Skriv B2-brief**

Bruk samme struktur for `matsvinnkvalitet`, med gates:

```text
baseline
kategori
tidsvindu
rutineendring
datadeling
kontrafaktisk
KPI-minimum
```

- [ ] **Step 4: Sett status på hver brief**

Bruk én av:

```text
pilotkandidat
roadmap-spor
benchmark
parkert
```

- [ ] **Step 5: Verifiser**

Run:

```bash
rg "Pilotminimum|Bruksrett|Go/no-go|pilotkandidat|benchmark|parkert" docs/project/mandates/pilot-brief-*.md
git diff --check
```

Expected: alle tre briefene har gates, status og begrensninger.

- [ ] **Step 6: Commit**

Run:

```bash
git add docs/project/mandates/pilot-brief-a1-single-cell-protein-feed-2026.md docs/project/mandates/pilot-brief-b1-okara-bsg-2026.md docs/project/mandates/pilot-brief-b2-food-waste-quality-2026.md
git commit -m "docs: draft food tg pilot briefs"
```

## 17. Task 11: Finance note

**Files:**
- Create: `docs/project/mandates/finance-note-food-tg-v0.1.md`
- Modify: `docs/project/mandates/source-shortlist-food-tg.md`

- [ ] **Step 1: Opprett finance note**

Lag filen:

```markdown
# Food TG Finance Note v0.1

**Status:** Intern finansieringsscreening
**Scope:** Finansiering for A/B-pilotkandidater og C-gate

## Finansieringslogikk

| Kandidat | Finansieringstype | Hvorfor |
|---|---|---|
| A1 encelle-/gjærprotein | FoU, industriell validering, nordisk samarbeid | Teknologi-/modenhetsrisiko |
| B1 okara/BSG | Pilot, prosess, matsikkerhet, ingrediensutvikling | Praktisk råvare-/off-taker-risiko |
| B2 matsvinnkvalitet | Adoption, data, drift, kommunal/offentlig innkjøp | Lavere CAPEX, høy praksisrisiko |

## Funding shortlist

| Program | Relevant for | Frist/status | Krav | Risiko | Neste handling |
|---|---|---|---|---|---|

## To anbefalte prosjektideer

| Prosjektide | Spor | Minimumspartnere | Første leveranse | Hvorfor finansierbar |
|---|---|---|---|---|
```

- [ ] **Step 2: Screen minimum fem funding-spor**

Vurder minst:

```text
Nordic Innovation
Interreg
Horizon Europe / CBE JU / EIT Food hvis relevant
Forskningsrådet
Innovasjon Norge
nasjonale bioøkonomi-/sirkularitetsordninger i DK/SE/FI
```

- [ ] **Step 3: Skill mellom grant og pilotpartner**

I finance note, marker hvert spor som:

```text
grant
industry co-funding
research consortium
public procurement/adoption
event/roadmap support
```

- [ ] **Step 4: Verifiser**

Run:

```bash
rg "Nordic Innovation|Interreg|Horizon|Forskningsrådet|Innovasjon Norge|grant|industry co-funding" docs/project/mandates/finance-note-food-tg-v0.1.md
git diff --check
```

Expected: minst fem finansieringsspor og to konkrete prosjektideer.

- [ ] **Step 5: Commit**

Run:

```bash
git add docs/project/mandates/finance-note-food-tg-v0.1.md docs/project/mandates/source-shortlist-food-tg.md
git commit -m "docs: draft food tg finance note"
```

## 18. Task 12: Roadmap 2026-2029

**Files:**
- Create: `docs/project/mandates/roadmap-food-tg-2026-2029-v0.1.md`
- Modify: `docs/project/mandates/tg-charter-food-2026.md`

- [ ] **Step 1: Opprett roadmap**

Lag filen:

```markdown
# Food TG Roadmap 2026-2029 v0.1

**Status:** Intern roadmap etter valideringssprint
**Scope:** A+B med C-gate

## Roadmap-prinsipp

Roadmapet viser hva TG kan gjøre, ikke hva aktører allerede har forpliktet seg til.

## Fase 1 - Validering og koalisjon, 2026

| Milepæl | Eier | Output | Gate |
|---|---|---|---|

## Fase 2 - Pilotdesign og finansiering, 2027

| Milepæl | Eier | Output | Gate |
|---|---|---|---|

## Fase 3 - Pilotgjennomføring og policy/adoption, 2028

| Milepæl | Eier | Output | Gate |
|---|---|---|---|

## Fase 4 - Skalering og nordisk læring, 2029

| Milepæl | Eier | Output | Gate |
|---|---|---|---|

## KPI-minimum

| KPI | Definisjon | Enhet | Dataeier | Frekvens | Første bruk |
|---|---|---|---|---|---|
```

- [ ] **Step 2: Legg inn M13-M18-kobling**

Roadmapet skal eksplisitt koble:

```text
M13 stakeholder recruitment
M14 activity plan
M15 workshops
M16 strategic roadmap
M17 public online event
M18 next steps
```

- [ ] **Step 3: Legg inn beslutningsporter**

Hver fase skal ha minst disse portene:

```text
ekstern validering
data/bruksrett
pilot owner
funding route
KPI minimum
publiseringsspråk
```

- [ ] **Step 4: Verifiser**

Run:

```bash
rg "M13|M14|M15|M16|M17|M18|KPI-minimum|pilot owner|funding route" docs/project/mandates/roadmap-food-tg-2026-2029-v0.1.md
git diff --check
```

Expected: alle kontrakts-/mandatmilepæler er representert.

- [ ] **Step 5: Commit**

Run:

```bash
git add docs/project/mandates/roadmap-food-tg-2026-2029-v0.1.md docs/project/mandates/tg-charter-food-2026.md
git commit -m "docs: draft food tg 2026 2029 roadmap"
```

## 19. Task 13: Decision deck outline

**Files:**
- Create: `docs/project/mandates/food-tg-decision-deck-outline-v0.1.md`

- [ ] **Step 1: Opprett deck outline**

Lag filen:

```markdown
# Food TG Decision Deck Outline v0.1

**Status:** Utkast til 10-15 slides
**Målgruppe:** JTO, Cathrine, Einar, NCH/Natural State, senere utvalgte aktører

| Slide | Tittel | Hovedbudskap | Bevis | Beslutning/ask |
|---:|---|---|---|---|
| 1 | Hvorfor Food TG nå | Nordisk matsystem trenger sirkulære intervensjoner som reduserer importavhengighet og verdi-/næringstap | Mandat + møter | Godkjenn scope |
| 2 | Scope | A+B med C-gate | Decision memo v0.3 | Bekreft avgrensning |
| 3 | Kunnskapsbase-status | Intern kildebase er sterk, ekstern forankring gjenstår | Auditstatus | Godkjenn valideringssprint |
| 4 | Spor A | Sirkulært fôr/importavhengighet | Track brief A | Velg A-spørsmål |
| 5 | Spor B | Sidestrømmer/matsvinnkvalitet | Track brief B | Velg B-spørsmål |
| 6 | C-gate | Lov, kjøper, data, drift, governance | Track brief C | Godkjenn gate |
| 7 | Valideringsfunn | Hva aktørene bekreftet/avkreftet | Findings v0.1 | Go/no-go |
| 8 | Pilotshortlist | A1/B1/B2 status | Pilotbriefs | Velg prioritet |
| 9 | Finansiering | To prosjektideer og funding-spor | Finance note | Velg fundingløp |
| 10 | Roadmap | 2026-2029 | Roadmap v0.1 | Godkjenn neste fase |
| 11 | Beslutninger | Hva må besluttes nå | Decision log | Eier og frist |
```

- [ ] **Step 2: Legg inn slide-regel**

Skriv:

```markdown
Ingen slide kan bruke claim som eksternt validert uten referanse til responslogg og bruksrett.
```

- [ ] **Step 3: Verifiser**

Run:

```bash
rg "Slide|Beslutning|Eksternt validert|responslogg" docs/project/mandates/food-tg-decision-deck-outline-v0.1.md
git diff --check
```

Expected: decket er beslutningsorientert, ikke rapportorientert.

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/project/mandates/food-tg-decision-deck-outline-v0.1.md
git commit -m "docs: outline food tg decision deck"
```

## 20. Task 14: Public language bank

**Files:**
- Create: `docs/project/mandates/food-tg-public-language-bank-v0.1.md`
- Modify: `docs/project/mandates/claim-strength-report-food-tg-v0.1.md`

- [ ] **Step 1: Opprett språkbank**

Lag filen:

```markdown
# Food TG Public Language Bank v0.1

**Status:** Trygge formuleringer for ekstern kommunikasjon
**Regel:** Brukes bare sammen med claim register og bruksrett

## Trygge formuleringer

| Tema | Trygg formulering | Krever kilde | Ikke si |
|---|---|---|---|
| Kunnskapsbase | Vi har etablert et internt, kildeforankret grunnlag for å prioritere valideringssamtaler. | Baseline freeze | Vi har en validert nordisk kunnskapsbase |
| Scope | Arbeidshypotesen er A+B med C som gate. | Decision memo | Dette er endelig TG-prioritet uten beslutning |
| Pilot | Dette er en pilotkandidat som må valideres. | Pilotbrief | Dette er pilotklart |
| Aktørrespons | Aktøren har bekreftet dette for intern bruk. | Responslogg | Aktøren støtter prosjektet |
```

- [ ] **Step 2: Legg inn stoppspråk**

Legg inn en seksjon:

```markdown
## Formuleringer som ikke skal brukes

- Validert nordisk kunnskapsbase
- Pilotklar løsning
- Aktørforankret roadmap
- Dokumentert effekt
- Bransjetall, hvis grunnlaget er actor-data
- EUDR gjelder norsk innenlandsk soya, hvis ikke endelig norsk rett sier det
```

- [ ] **Step 3: Synk med claim strength**

I `claim-strength-report-food-tg-v0.1.md`, pek til språkbanken som ekstern bruksregel.

- [ ] **Step 4: Verifiser**

Run:

```bash
rg "Trygge formuleringer|Formuleringer som ikke skal brukes|pilotklart|Validert nordisk" docs/project/mandates/food-tg-public-language-bank-v0.1.md docs/project/mandates/claim-strength-report-food-tg-v0.1.md
git diff --check
```

Expected: språkbanken hindrer overclaiming.

- [ ] **Step 5: Commit**

Run:

```bash
git add docs/project/mandates/food-tg-public-language-bank-v0.1.md docs/project/mandates/claim-strength-report-food-tg-v0.1.md
git commit -m "docs: add food tg public language bank"
```

## 21. Task 15: Sluttverifikasjon

**Files:**
- All changed files in `docs/project/mandates/`

- [ ] **Step 1: Kjør dokumentsøk etter risikotermer**

Run:

```bash
rg "pilotklar|validert nordisk|forankret roadmap|dokumentert effekt|bransjetall" docs/project/mandates
```

Expected: treff finnes bare i stoppspråk, risikoregler eller eksplisitte advarsler.

- [ ] **Step 2: Kjør repo-gater**

Run:

```bash
npm test
npm run lint
npm run build
npm run db:audit
npm run db:audit:strict-sources
npm run research:source-gap-queue
npm run research:citation-readiness-queue
npm run audit:citable-reports
git diff --check
```

Expected: alle passerer. Hvis build genererer timestamp-only diffs, vurder dem separat og ikke bland dem med faglige endringer.

- [ ] **Step 3: Kjør status**

Run:

```bash
git status --short --branch
```

Expected: bare planlagte endringer eller rent worktree etter commit.

- [ ] **Step 4: Lag kort handoff**

Oppdater denne planen eller lag en kort handoff med:

```markdown
## Handoff

- Sist fullførte task:
- Neste task:
- Åpne beslutninger:
- Åpne aktørsvar:
- Kommandoer kjørt:
- Stoppsignal:
```

- [ ] **Step 5: Commit**

Run:

```bash
git add docs/project/mandates
git commit -m "docs: complete food tg validation workplan artifacts"
```

## 22. Beslutningsporter

### Port A: Kan vi gå fra intern base til ekstern validering?

Ja hvis:

- Scope er besluttet internt.
- Baseline freeze er skrevet.
- Outreach-logg er opprettet.
- P1-aktører er valgt.

Nei hvis:

- Scope fortsatt er uavklart.
- JTO/Cathrine/Einar ikke eier outreach.
- Claims beskrives som eksternt validert uten respons.

### Port B: Kan vi lage pilotbriefs?

Ja hvis minst én kandidat har:

- ekstern faglig respons
- regulatorisk gate vurdert
- data/bruksrett vurdert
- eier- eller partnerhypotese
- tydelig go/no-go

Nei hvis:

- kandidaten bare har desk research
- råvareeier mangler
- hygiene eller lovlig sluttbruk er uklar
- off-taker mangler
- KPI-er mangler definisjon, enhet og dataeier

### Port C: Kan vi skrive roadmap?

Ja hvis:

- minst to pilot-/roadmap-kandidater er klassifisert
- finance note har minst to realistiske prosjektideer
- aktørforankring er dokumentert eller eksplisitt markert som manglende
- M13-M18 er mappet til konkrete handlinger

Nei hvis:

- roadmap impliserer forpliktelser som ikke finnes
- finance note bare nevner programmer uten krav/frister
- nordisk dekning ikke er merket med forbehold

### Port D: Kan vi bruke dette eksternt?

Ja hvis:

- språkbank er brukt
- claim register støtter alle hovedpåstander
- bruksrett er logget
- `audit:citable-reports` passerer
- eventuelle caveats er synlige

Nei hvis:

- slide/deck bruker interne hypoteser som fakta
- actor-data presenteres som bransjetall
- graphen brukes som bevislag
- benchmark brukes som effektbevis

## 23. Fast møteryme

| Møte | Frekvens | Deltakere | Agenda | Output |
|---|---|---|---|---|
| Tirsdag TG core | Ukentlig | JTO, Cathrine, Gabriel, Thea ved behov | Scope, aktører, beslutninger | Decision Log-oppdatering |
| Sprint standup | 2 ganger per uke under validering | Gabriel + outreach-eiere | Sendt, booket, svar, risiko | Sprintlogg oppdatert |
| Fredag portmøte | Ukentlig | JTO/Cathrine/Einar/Gabriel | Go/no-go, neste uke | Portbeslutning |
| Comms sync | Etter validation findings | Thea/Martin/Gabriel | Språk, deck, event | Deck outline/språkbank |

## 24. Eierkart

| Rolle | Eier ansvar | Ikke ansvar |
|---|---|---|
| Gabriel/Codex | Kunnskapsbase, audit, claim/evidence, dokumentproduksjon, syntese | Formell ekstern commitment uten menneskelig bekreftelse |
| JTO | TG-metodikk, relasjoner, beslutningsprosess, scopeforankring | Teknisk kildeledelse alene |
| Cathrine | Faglig prioritering, aktørdialog, pilotrelevans, sektorforankring | Repo-audit alene |
| Einar | Strategisk godkjenning, ressursprioritering, ekstern legitimitet | Detaljert claim-ledger |
| Thea/Martin | Kommunikasjon, event, prosjektside, publiseringsformat | Faglig validering alene |
| Eksterne aktører | Korrigere, bekrefte, avkrefte, dele data eller gi bruksrett | Eie prosjektets konklusjoner uten commitment |

## 25. Stoppsignaler

Stopp og avklar før videre arbeid hvis ett av disse skjer:

- EUDR omtales som direkte norsk soya-plikt uten endelig norsk rett eller tydelig EU-eksportforbehold.
- Denofa/Skretting-data brukes som bransjesnitt.
- Okara/BSG omtales som pilotklart uten råvareeier, hygiene, stabilisering og off-taker.
- Matsvinnkvalitet omtales som effektbevis uten baseline og kontrafaktisk.
- Marint restråstoff eller RecoLab gjøres til første pilot uten at det er besluttet.
- KPI-er brukes uten definisjon, år, geografi, enhet, datakilde og dataeier.
- En aktørrespons brukes eksternt uten bruksrett.
- Grafen brukes som kildebevis i stedet for dokumenterte kilder.
- Roadmap lover partnercommitment eller finansiering som ikke er logget.

## 26. Sluttkriterier for denne arbeidsfasen

Fasen er ferdig når:

- `decision-log-food-tg.md` har scope-vedtak.
- `food-tg-baseline-freeze-2026-05-21.md` finnes.
- `food-tg-validation-sprint-log-2026-05.md` har alle P1-kontakter og responsstatus.
- `food-tg-validation-findings-v0.1.md` oppsummerer bekreftet, avkreftet og uavklart.
- `claim-register-food-tg.md` og `evidence-matrix-food-tg.md` er oppdatert etter respons.
- `nordic-coverage-gap-analysis-2026-06.md` viser hva som fortsatt er svakt nordisk.
- Minst tre pilot-/roadmap-kandidater har brief.
- `finance-note-food-tg-v0.1.md` har minst fem funding-spor og to prosjektideer.
- `roadmap-food-tg-2026-2029-v0.1.md` kobler M13-M18 til eiere, gates og leveranser.
- `food-tg-public-language-bank-v0.1.md` hindrer overclaiming i ekstern kommunikasjon.
- Repo-gatene i Task 15 passerer.
