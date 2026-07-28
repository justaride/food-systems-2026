# Appraisal-sprint + kvalitetskøer — kontrollert plan

**Dato:** 2026-07-21
**Gap:** Q1 (appraisal 0/417), Q2 (bibliotek-review-kø 89 / `approved_internal` 35), Q3 (17 mekaniske URL-reparasjonskandidater etter dry-run), Q5 (backlog-status-synk) og Q6 (identitetsparitet/interne avvik).
**Kontrollert nåstatus:** `academic-source-quality-status.json` (generert
2026-07-20) viser «external readiness: not_ready» og **0 av 417** komplette,
aktuelle appraisal-disposisjoner. Datamodell, migrasjoner, kontrollscript og tre
pilotartefakter finnes. Piloten er likevel **ikke gjennomført**: receipt-en fra
2026-07-19 dokumenterer filintegritet, tekst og rendering, mens alle tre
kildene fortsatt venter på fulltekstlesing og komplett disposisjon fra en
navngitt menneskelig reviewer. Dette er derfor først et godkjennings- og
produksjonssettingsløp, deretter et volumløp.

**Viktig prinsipp (fra auditens egen tekst):** en appraisal *oppgraderer aldri* siterbarhet automatisk. Den fyller vurderingslaget som gaten krever, men citation-gaten er separat og fail-closed. Sprinten fjerner altså en *blokker*, den åpner ikke claims av seg selv.

---

## Fase 0 — åpne appraisal-porten uten å simulere review

Før en topp-50-kø opprettes:

1. En navngitt reviewer leser hele `src-30`, `src-32` og `src-45` og fyller alle
   obligatoriske felt i pilotmanifestet. Maskingenererte metode-, bias- eller
   anvendbarhetsvurderinger teller ikke.
2. `review:evidence-appraisal:template-check` skal gå fra
   `readyForDatabaseDryRun: false` til `true`.
3. Kjør kontrollert database-dry-run, les hele planen og lås planens SHA-256.
4. Apply krever eksplisitt ack, uendret databaseidentitet, samme kildehash og
   godkjent plan. Etterkontroll må vise tre gyldige rader og null utilsiktede
   endringer.
5. Kjør academic-source-quality-audit på nytt. Tre appraisals gir ikke i seg
   selv ekstern siterbarhet; citation readiness og claim anchors er separate
   porter.

**Stopplinje 2026-07-21:** Fase 0 stopper ved punkt 1. Ingen database-apply er
autorisert av denne planen.

---

## Sprint 1 — de 50 viktigste kildene (2 uker)

**Utvalg (prioritert rekkefølge):**
1. Lag først en **deduplisert record-liste** (`Report`, `Thesis`, `SourceDoc`).
   Antallet `citable_external`-siteringer er ikke det samme som antall unike
   appraisal-mål og kan ikke brukes direkte som kø.
2. Prioriter recordene som faktisk ligger bak acceptance-packens 16
   nøkkelpåstander, med eksplisitt kobling til påstand og locator.
3. Fyll deretter med topp-scorende poster i `KI-PRIORITY` som brukes aktivt i
   kanonisk v2, forutsatt tilgjengelig fulltekst, stabil identitet og nåværende
   kildehash.
4. Hold commissioned reports, corporate self-reports og advocacy-kilder synlig
   adskilt fra peer-reviewed forskning; appraisal vurderer egnethet og risiko,
   ikke prestisje eller ønsket konklusjon.

**Per kilde (bruk `evidence-appraisal`-modellen fra piloten):**
- Fulltekst-basis (er hele kilden lest, ikke bare abstrakt?)
- Studiedesign / metode
- Risk of bias-vurdering
- Anvendbarhet (gjelder funnet norsk/nordisk kontekst?)
- Begrensninger
- Reviewer-proveniens + dato + kildehash-binding

**Kapasitet:** 50 fulltekstvurderinger er et planmål, ikke et forhåndsbekreftet
tidsestimat. Etter de tre pilotene må faktisk tidsbruk, dokumentlengde og behov
for andre-reviewer måles. Sprintmålet skaleres først da; ved 50 godkjente
disposisjoner tilsvarer dekningen omtrent 12 %, konsentrert der det betyr mest.

---

## Sprint 2+ — resten, i konfidensrekkefølge (H1 løpende)

Etter de 50: arbeid nedover den dedupliserte prioriteringslisten. Ukentlig
kapasitet settes fra målt pilotgjennomløp. `citable_external` og
`citable_with_note` er siteringsrader, ikke en bekreftet telling av unike verk;
de må mappes til appraisal-modellens 417 records før omfang kommuniseres.
Ekstern beredskap kan først bli READY når hele auditkontrakten er grønn — blant
annet databaseparitet, proveniens, locatorer, tilgangsdatoer, duplikater,
appraisal/exclusion og claim anchors.

---

## Parallelt: de tre andre kvalitetskøene

### Q2 · Bibliotek-review-kø (89) → godkjent (35 →)
Review-køen på 89 er allerede definert i ledgeren. **Ukentlig triage:** mål
først faktisk gjennomløp på en liten kontrollert batch, klassifiser (godkjenn
for KI-kontekst / behold intern bakgrunn / blokkér) og oppdater `reviewStatus`
bare etter readback. Deretter settes en realistisk ukekapasitet. Dette er tallet
`/masterhjerne` viser under «Bibliotekets KI-klargjøring».

Artifact-readback 2026-07-21 viser at køen ikke er én homogen reviewjobb:

- 24 rader er mekaniske URL-reparasjonskandidater;
- 57 krever kuratering av korte sammendrag;
- 8 krever manuelt kildeoppslag;
- ledgeren har 0 rader med datert, navngitt menneskereview-proveniens.

Godkjent-tallet 35 betyr `approved_internal`/`safe_for_ai_context`, ikke
ekstern claim-tillatelse.

### Q3 · Tekstreparasjon — dry-run avgrenset til 17 URL-kandidater
Repair-planene ligger i `research/_status/library-analysis-*-repair-plan.*`
(local-text, pdf-text, url-text). Kjør først audit/dry-run per batch, kontroller
at planen er aktuell mot live database og gjennomgå konflikter. Apply og
fjerning av `low_text_quality` skjer bare for poster med dokumentert bedre
tekst og bestått etterkontroll.

Gjeldende dry-runs 2026-07-21 er vesentlig smalere enn «reparer 89»:
local-text-planen har 71 kandidater, men 0 sikre oppdateringer; PDF-planen har
0; URL-planen har 24 kandidater, hvor 17 er planlagt oppdatert, 5 mangler
dokumentkobling og 2 er ikke lenger ekstraherbare. Maksimalt 17 flagg kan
derfor mekanisk klareres fra dette snapshotet. De øvrige
krever kuratering, lokatorarbeid eller ny kilde — ikke blind batch-apply.

### Q5 · Backlog-status-synk

Sammenlign R13/R14-intake-indeksene mot backlog-CSV-en og lag først en
deterministisk dry-run-plan. Ikke overskriv menneskeporter eller kildeporter når
mottaksstatus synkroniseres. Koble først til generatoren når statusreglene er
avstemt og en idempotent test og readback er grønn.

### Q6 · Identitetsparitet (18 avvik)

Kjør gjeldende paritetsaudit og hent den eksakte avvikslisten før endring.
Tidligere reparasjonsløp for managed YouTube og `matsvinnloven-2025` er relevant
proveniens, men er ikke bevis på at dagens mismatch har samme årsak eller at den
er lukket.

Live readback 2026-07-21 viser metadatafelt-paritet, men identitetsparitet er
fortsatt mismatch: én syntetisk database-only Thesis (`matsvinnloven-2025`), én
seed-only offisiell SourceDoc (`src-lov-2025-06-20-103`) og 17 eksplisitt
klassifiserte managed-runtime YouTube-SourceDocs. Det eksisterende
`repair:matsvinnloven-identity -- --dry-run` produserer en konsistent plan, men
apply er med vilje deaktivert og ville slette én Thesis-rad, karantenesette ett
Document og blokkere én bibliotekrad. Denne delen av Q6 er derfor en destruktiv
operatør-/backup-/restore-gate, ikke «én times rydding».

### Q4 · Arkivdekning — mål før backfill

`SourceDoc.archivedUrl = 0` er ikke et korrekt mål for hele siteringslaget.
Den nye read-only-auditen `audit:source-citation-archive-coverage` leser den
effektive kjeden fra SourceCitation, Document og SourceDoc uten nettverk eller
skriveoperasjoner. Live readback 2026-07-21:

- 2 703 SourceCitation-rader totalt; 2 376 er `citable_external` eller
  `citable_with_note`;
- 41 av 154 `citable_external` og 480 av 2 222 `citable_with_note` har varig
  arkivdekning;
- 113 + 1 742 = 1 855 eksternt brukbare rader trenger arkiv eller et
  eksisterende SHA-256-hashet lokalt snapshot;
- 17 ytterligere eksterne rader har en annen blokkerende lokal-filtilstand, så
  samlet arkivgate blokkerer 1 872 citation-ID-er;
- 231 grupper deler normalisert original-URL. Backfill skal derfor dedupliseres
  på locator før nettverkskall og aldri tolke radantall som antall unike verk.

Det eksisterende Wayback-backfill-scriptet gjør nettverkskall og kan skrive til
databasen. Det kjøres ikke før køen er deduplisert, prioritert, dry-runet og
eksplisitt godkjent.

---

## Effekt på /masterhjerne (målbart)

Sprinten er designet så framdriften vises direkte på den nye siden neste gang generatoren kjøres:

| Måltall (masterhjerne-seksjon) | I dag | Etter sprint 1 | Mål H1 |
|---|---|---|---|
| Appraisal-disposisjon (korpus) | 0 / 417 | opptil 50 / 417, etter godkjent pilot | hele auditkontrakten komplett |
| Bibliotek godkjent for KI | 35 (intern KI-kontekst) | måles etter kontrollbatch | review-kø disponert med navngitt review |
| Tekst-risikoflagg (`low_text_quality`) | 89 | opptil 17 mekaniske klareringer i gjeldende plan | alle poster disponert |
| Ekstern beredskap | NOT READY | NOT READY (nærmere) | **READY** bare når hele auditkontrakten er grønn |

`npm run compute-masterhjerne` etter hver uke → framdriften er synlig for hele teamet uten ny rapportskriving.

## Sjekkliste

- [ ] Navngitt reviewer fullfører fulltekstdisposisjon for `src-30`, `src-32` og `src-45`.
- [ ] Pilotens template-check, dry-run, plan-SHA og eksplisitte apply-beslutning er dokumentert.
- [ ] Etterkontroll viser tre gyldige appraisals uten automatisk oppgradering av citation readiness.
- [ ] Lag deduplisert kobling fra acceptance-pack og prioriterte siteringer til faktiske appraisal-records.
- [ ] Godkjenn sprint-1-listen først etter pilot-readback.
- [ ] Ukentlig review-kø-triage satt i kalender (Q2).
- [ ] Review 17-raders URL-tekstplan; readback før eventuell apply (Q3).
- [ ] Disponer de resterende lavtekst-radene som kuratering, kildeoppslag eller eksplisitt blokkert (Q2/Q3).
- [x] Hent eksakt identitetsdiff og kontrollert dry-run-plan (Q6).
- [ ] Skaff eksplisitt destruktiv autoritet, fersk backup og verifisert restore-receipt før identitetsdelen av Q6 i det hele tatt kan vurderes for apply.
- [x] Mål effektiv Q4-arkivdekning skrivefritt og skill radantall fra unike locatorer.
- [ ] Prioriter og dedupliser Q4-køen før Wayback-dry-run; ingen database-apply uten eksplisitt godkjenning.
- [ ] Backlog-synk-script (Q5) + koble til masterhjerne-generator.
- [ ] `npm run compute-masterhjerne` ukentlig for å vise framdrift.
