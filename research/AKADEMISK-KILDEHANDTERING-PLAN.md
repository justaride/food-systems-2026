# Akademisk kildeføring, original kildeverk og verifisering — Plan

> Datert: 2026-05-19
> Status: validert og revidert etter repo-sjekk 2026-05-19
> Baseline: bygger videre på `DATA-READINESS-SLUTTRAPPORT.md` (2026-04-27), `REPORT-SOURCEURL-GAP-13.md`, `verify-data-integrity.ts`, og eksisterende `provenanceType`-mønster. Tall fra 2026-04-27 er historiske; gjeldende baseline må tas fra `npm run db:audit` og DB-spørringer før implementering.

## 0. Oppdatert status 2026-05-19

`verify-data-integrity.ts --strict-sources` er nå utvidet fra ren referensiell integritet til konkret kildekvalitetskontroll på radnivå. Audit skiller mellom manglende kilde, fritekstetikett og direkte/resolvert locator (`https://`, DOI, `document:`, `report:`, `source:` osv.). Etter siste pass løses også eierandeler der raden kan forankres i importert årsrapport, direkte transaksjonsmelding eller direkte offentlig rolledata, et voksende utvalg eiendoms-/anleggsrader kan løses til offisielle selskapssider, verifiserte 2024-finansrader uten importert dokument kan løses til direkte offisiell årsrapportlenke eller smalt verifisert resultat-/bulletinside fra utgiver, norske 2020-2024 markedsandeler og HHI er korrigert mot Konkurransetilsynets direkte rapport, Finland 2024 markedsandel/HHI er forankret i PTYs egen side, fire nordiske partnerhandelsserier kan løses til live statistikkbank-API-er, og `BoardMember`/`Shareholder` har nå eksplisitte radnivåfelter for `source`, `sourceUrl` og `verifiedAt`. `Shareholder` er i tillegg backfilled for den konservative første puljen der eierandelen kan knyttes til importert årsrapport, direkte offisiell årsrapport-URL eller verifisert transaksjonsmelding.

Fersk strict-baseline 2026-05-19:

| Område | Direkte/resolvert kilde | Status |
|---|---:|---|
| `Subsidy.source` | 179311/179311 | Bestått; Landbruksdirektoratet/Enova-rader kan løses til direkte kilder |
| `DeliveryVolume.source` | 60310/60310 | Bestått; løses til Landbruksdirektoratets åpne CSV-er |
| `AquacultureSite.source` | 50/50 | Bestått; løses til Fiskeridirektoratets `pub-aqua` API |
| `AquacultureApplication.source` | 8/8 | Bestått; løses til Fiskeridirektoratets `aqua-portal` API |
| `CompanyProperty.source` | 67/86 | Delvis bestått etter reimport av `session5`; Brønnøysund-rader, offisielt dokumenterte Mowi-, SalMar-, Skretting- og Yara-anlegg, verifiserte nordiske hovedkontorrader, Brønnøysund-verifiserte norske underenheter for Coop Norge, Nortura, TINE, Felleskjøpet, BioMar, Grilstad, Norsk Kylling, REMA Distribusjon og Lantmännen Cerealia, flere offisielle ASKO-selskapssider inkludert korrigerte ASKO Hedmark/Oslofjord-rader, samt BAMA Liertoppen/Terminalen 18 fra BAMA årsrapport 2024 løses til direkte kilder |
| `BusinessRelationship.source` | 11/50 | Delvis bestått; årsrapport-, Konkurrensverket-, KFST-, Matsentralen- og Bransjeavtalen-rader er løst der direkte kilde finnes |
| `CompanyFinancial.source` | 20/151 | Svakt; importerte 2024-årsrapporter har dokumentkobling, 9 ytterligere 2024-rader løses til verifiserte offisielle årsrapport-PDF-er/utgiverlenker, og Dagrofa 2024 + SOK/S Group 2024 løses til offisielle resultat-/bulletinsider fra utgiver. 131 rader er fortsatt label-only |
| `CountryMetric.source` | 201/414 | Svakt; 213 rader har fortsatt bare kildeetikett. Rader med `metadata.sourceUrl`, eksakte offisielle 2025-etiketter for Konkurransetilsynet, KFST og Konkurrensverket, korrigerte norske 2020-2024 markedsandeler/HHI, Finland 2024 markedsandel/HHI fra PTY, samt partnerhandelsserier fra SSB 08801, SCB `ImpExpKNTotMan`, StatBank `SITC2R4` og Statistics Iceland `UTA06201` løses nå direkte. Luke partnerhandelsrader holdes tilbake fordi gjeldende endpoint-sjekk ga HTTP 400 |
| `CompanyOwnership.source` | 10/12 | Delvis bestått; årsrapport- og transaksjonsmeldingsrader er løst, inkludert NorgesGruppen -> ASKO, NorgesGruppen -> BAMA og NorgesGruppen -> Dagrofa der importert årsrapport/BAMA-rapport matcher. To Reitan/Norsk Kylling/Distribusjon-rader mangler fortsatt radnær kilde |
| `Shareholder.source` | 34/62 | Delvis bestått etter konservativ backfill; rader for NorgesGruppen, Coop Norge, Reitan Retail, ICA Gruppen, Axfood, Salling Group, Coop Danmark, Kesko, Hagar, Austevoll, Mowi, SalMar, Lerøy, Yara, Orkla, Nortura, TINE, Felleskjøpet, BAMA og ASKO er forankret i importert årsrapport eller direkte offisiell årsrapport-URL. I tillegg er City Gross, Nova Sea, NTS, Orkla Food Ingredients og Lilleborg forankret i verifiserte transaksjonsmeldinger. 28 rader står igjen uten radkilde |
| `BoardMember.source` | 447/593 | Delvis bestått etter målrettet Brønnøysund-sync og forkortet-navn matching; 447 roller har direkte `https://data.brreg.no/enhetsregisteret/api/enheter/{orgNr}/roller` og `verifiedAt`, mens 146 nordiske eller eldre/importerte roller fortsatt mangler radkilde |

Dokumentlaget er fortsatt prosjektets sterkeste del: 1063/1063 `Document.filePath` løser lokalt, 566/1063 har URL, og aktive `SourceDoc`-rader har 115/191 URL + 148/191 dokumentkobling. URL-sjekk 2026-05-19 ga HTTP 200 for de distinkte shareholder-locatorene som ble brukt i backfill, inkludert de nye transaksjonsmeldingene, BAMA-rapporten og PTYs offisielle Finland-side, og de offisielle Dagrofa/SOK-resultatsidene er åpnet mot utgiver. Strict-audit feiler fortsatt med 9 håndhevede kildebrudd: 131 `CompanyFinancial`, 2 `CompanyOwnership`, 19 `CompanyProperty`, 39 `BusinessRelationship`, 213 `CountryMetric`, 28 `Shareholder` og 146 `BoardMember` mangler fortsatt direkte kilde eller verifikasjonstidspunkt der feltet finnes. Finanspasset er bevisst konservativt: estimatrader, historiske rader, Coop Sverige/KF 2024-raden og rader der bare generisk `Regnskap 2024` finnes, er ikke oppgradert uten direkte originalkilde som faktisk matcher radens tall. Flere av de siste eiendomsradene ser ut til å ha stale eller konfliktende adresse-/orgnr-data mot primærkilde, særlig ICA Gruppen, Axfood, Kesko, Orkla, Reitan Retail, Coop Sverige, Samkaup, Lidl og enkelte ASKO-/BAMA-/Lerøy-rader. Prosjektet bør derfor ikke behandle selskaps-, eierskaps-, styre- eller finansdata som whitepaper-klare uten eksplisitt filtrering til rader med direkte/resolvert kilde.

## 1. Mål

Et hvert datapunkt som vises i appen eller benyttes i juni-2026-whitepaperet skal kunne:

1. Spores tilbake til en navngitt primærkilde med URL, aksessdato og lokal arkivkopi.
2. Klassifiseres som primær, sekundær, syntese, eller intern konstruksjon.
3. Verifiseres uavhengig — enten manuelt eller automatisk mot en myndighetsregistrering.
4. Vises med klikkbar fotnote i sluttbrukergrensesnittet.

Det skal være maskinelt umulig å importere et nytt faktum uten å oppfylle disse fire kravene.

### 1.1 Canonical citation readiness fra 2026-05-20

All ekstern bruk skal styres av fire canonical readiness-nivåer:

| Readiness | Bruksregel |
|---|---|
| `citable_external` | Kan brukes eksternt uten ekstra forbehold når direkte locator, tilgangs-/verifikasjonsdato og feltkobling finnes. |
| `citable_with_note` | Kan brukes eksternt når kilde-, metode- eller presisjonsforbehold vises sammen med claimet. |
| `internal_context` | Kan brukes til intern analyse, struktur og hypoteser, men ikke som dokumenterende ekstern evidens. |
| `blocked_unsourced` | Skal ikke brukes i ekstern rapportering, graf, presentasjon, eksport eller siterbart svar. |

Legacy-koder fra eldre planarbeid mappes slik:

| Legacy-kode | Canonical readiness |
|---|---|
| `db-linked` | `citable_external` når feltkoblingen og verifikasjonsmetadata er komplett; ellers `citable_with_note` |
| `repo/static` | `citable_with_note` når lokal fil/metode er tydelig; ellers `internal_context` |
| `internal_synthesis` / `internal-synthesis` | `internal_context` |
| `needs-primary-check` | `blocked_unsourced` frem til primærkilde eller gjeldende URL er kontrollert |
| `not-citable-input` | `blocked_unsourced` |

Fail-closed regel: If a claim has no external-ready citation, the system must either exclude it from external output or display it as internal context. It must not silently promote internal synthesis to source evidence.

## 2. Dagens status mot akademisk standard

### 2.1 Sterkt fundament (lag 1 — dokumenter/rapporter/avhandlinger)

| Modell | Strukturerte kildefelt | Vurdering |
|---|---|---|
| `Report` | `provenanceType`, `supportingSources Json[]`, `sourceUrl`, `doi`, `isbn`, `issn`, `publisher`, `year` | God mal, men ikke komplett utfylt i dagens DB |
| `Thesis` | `doi`, `isbn`, `publisher`, `accessDate`, `institution`, `degree`, `url`, `authors`, `year` | Sterk |
| `SourceDoc` | `author`, `year`, `doi`, `publisher`, `url`, `sourceType` | Solid |
| `Document` | `url`, `author`, `year`, `metadata Json` | Moderat — `metadata` brukes som catch-all |

Historisk status fra Data-Readiness-Sluttrapport 2026-04-27:
- 108 Reports klassifisert med `provenanceType` (97 external_report, 5 internal_synthesis, 3 internal_register, 3 composite_source)
- 86 Theses har URL etter backfill (36 DOI, 79 publisher)
- 307 SourceDocs med sourceType
- 0 HIGH severity gjenværende i db:audit

Gjeldende repo/DB-status 2026-05-19 etter `npm run db:audit`:
- 129 Reports totalt: 118 med `sourceUrl`, 11 uten enkel `sourceUrl`
- `provenanceType` er satt på 36 Reports: 18 external_report, 6 external_article, 5 internal_synthesis, 3 internal_register, 3 composite_source, 1 blocked_source
- 93 Reports har fortsatt `provenanceType = null`, selv om mange har `sourceUrl`
- 78 Theses, alle med URL; 36 har DOI/persistent ID; 78 har publisher
- 193 SourceDocs i gjeldende DB, hvorav 191 er aktive; 115 aktive rader har URL og 148 aktive rader er koblet til `Document`
- `db:audit` passer referensiell integritet; `db:audit:strict-sources` måler nå kildedekning per felt for sentrale selskaps-, styre-, person-, register- og regnskapsdata

### 2.2 Kritiske svakheter (lag 2 — selskaps/person-data)

| Modell | Source-status | Akademisk konsekvens |
|---|---|---|
| `Shareholder` | Har `source`, `sourceUrl`, `verifiedAt`; 34/62 rader fylt | Delvis verifiserbart, men 28 rader er fortsatt uten radkilde |
| `BoardMember` | Har `source`, `sourceUrl`, `verifiedAt`; 447/593 rader fylt | Delvis verifiserbart via Brønnøysund roller, men 146 importerte/nordiske/eldre roller er fortsatt uten radkilde |
| `PersonProfile` | Bare `metadata Json?` | Biografi-påstander uten sitering |
| `CompanyFinancial` | `source String?` (valgfri, fri tekst) | Vanlig: "Brønnøysund / offentligdata MCP 2026-03" — månedspresisjon, ingen URL/aksessdato |
| `Subsidy` | `source String?` | Tilskuddsdata uten lenke til vedtak |
| `CompanyOwnership` | `source String` (påkrevd, men fri tekst) | Eierandeler dokumentert som streng, ikke som lenke |
| `CompanyProperty` | `source String?` + `metadata Json?` | Vanlig: "asko.no (Sentrallager)" — domene uten URL/dato |
| `BusinessRelationship` | `source String?` + `metadata Json?` | Forretningsforhold svakt sourced |
| `Actor` | Bare `metadata Json?` | Aktørprofiler uten strukturert kilde |

### 2.3 Strukturell svakhet i Insight-domenet

`Insight.source` er en obligatorisk men fri-form `String` (linje 117 i schema). Verdier i praksis er typisk fagintern ID, ikke akademisk sitering. `InsightDocumentRef` og `SourceRef` finnes som strukturer, men brukes ujevnt.

### 2.4 Skille mellom konstrukter og registrerte entiteter

`scripts/import-research-20260420.ts` linje 62-87 oppretter syntetiske entiteter:
```typescript
{ name: 'NorgesGruppen Eiendom AS', orgNr: 'NO-961483584-EIE', ... }
{ name: 'Joh. Johannson Eiendom AS', orgNr: 'NO-JJ-EIE', ... }
{ name: 'Bokveien 112 AS', orgNr: 'NO-BOKV112', ... }
```

Disse er **ikke** ekte Brønnøysund-registreringer — de er forskningskonstrukter for å modellere eiendomsgrener. De importeres uten flagg som skiller dem fra registrerte selskaper. En akademisk leser kan ikke vite hvilke entiteter som har juridisk eksistens og hvilke som er analyseapparat.

### 2.5 Mønstre i import-scripts

| Kildeangivelses-nivå | Verifisert mønster | Eksempel |
|---|---|---|
| Kildeetikett med år/måned, men uten URL | Flere import-scripts | `'Broennoysund / offentligdata MCP 2026-03'` |
| Domenenavn uten full URL/dato | Flere import-scripts | `'asko.no (Sentrallager)'` |
| Tekstuell referanse uten resolvbar kilde | Flere import-scripts | `'Johannson family holding'` |
| Manglende eller tomme radkilder i import | Systematisk | `BoardMember`-rosters, `Shareholder`-rader uten årsrapport/registerkilde, hardkodede personnavn |

Merk: tidligere anslag i prosent er ikke pålitelig nok som styringstall. Før Fase 1 må `scripts/audit-source-string-taxonomy.ts` etablere en reproduserbar baseline for alle fritekst-`source`-verdier og alle modeller som helt mangler kildefelt.

Røde flagg observert:
- `'web research 2026-03'` brukt i mowi-tree, salmar-tree — ikke verifiserbart
- Eksakte eierandeler uten kildelenke: `'92.5% av Kverva AS'` (observert i person-/SalMar-import, ikke i `import-research-20260420.ts`)
- Styremedlem-arrays uten kilde i session5-supply-chain, asko-tree
- `metadata: { annualRentNOK_2024: 'included in Johannson 120m bundle' }` — vague kvalifisering for kvantitativ påstand

### 2.6 UI-lag (kildevisning til leser)

| Side | Kildevisning | Verifiserbar? |
|---|---|---|
| `/kilder` | Eksellent | Ja, fullt kilderegister |
| `/rapporter` | Bra — viser `supportingSources` + `provenanceType` | Ja |
| `/innsikt` | Bra — `SourceChip` per innsikt | Delvis |
| `/bibliotek` | Bra — full metadata, refsFrom/refsTo | Ja |
| `/forsyningskjede` | Bra — `ChartFrame` med `EvidenceStatusBadge` + `SourceFootnote` | Ja |
| `/mandat` | Bra — `evidenceStatus` med note | Ja |
| `/moter` | Bra — `ExpandableSources` | Ja |
| `/selskap/[id]` | **Svak** — omsetning, EBITDA, styre vises uten synlig kilde | **Nei** |
| `/sirkularitet` | Delvis — sources i datamodell, svak rendering | Delvis |
| `KnowledgeGraph` | Svak — node-valg viser ikke prominently kildeforankring | Delvis |

### 2.7 Verifiserings-metadata (helt fraværende på data-lag)

- `verifiedAt` finnes nå på `Shareholder` og `BoardMember`, men dekningen er bare 34/62 og 447/593; øvrige modeller mangler fortsatt gjennomgående `verifiedAt`, `verifiedBy`, `lastVerified`, `peerReviewed` eller `confidenceScore`
- `MediaEntryCoding.confidence Int` er **eneste** sted med strukturert kvalitetsscore — bevis at det er teknisk mulig, men ikke utbredt
- CSV-baserte review-workflows (preview-food-research-process-intake.ts) gir audit-log i fil, ikke i DB
- Ingen sign-off, ingen flerøyne-prinsipp registrert noe sted

### 2.8 Ekstern kryssvalidering

- `enrich-offentligdata.ts` henter Brønnøysund live, men kun for berikelse — ingen avstemming av eksisterende verdier
- Ingen Proff.no API-integrasjon for finansiell kryssjekk
- Ingen automatisk reconciliation: importert omsetning vs. registret omsetning
- Ingen plausibilitetsregler: sum av ownership ≤ 100%, CEO-roller eksklusive, etc.

### 2.9 Arkiv-integritet

- 196 av 571 URL-er i URL-MANIFEST.csv er nedlastet (34%)
- 290 URL-er (51%) er "untracked/inactive"
- SHA-256 finnes allerede i `research/pdf-katalog.json` og enkelte download-logger, men ikke konsekvent koblet til URL-manifest, DB-citations og UI
- Ingen systematisk archive.org/Wayback-policy eller felt for `archivedUrl` i citation-laget
- Ingen tydelig versjonering når URL-er endres eller lokal kopi byttes
- Manuell dedupliseringsprosess (`99_Exact_Duplicates`-mappe i arkiv-sortert)

### 2.10 Samlet poengsetting mot akademisk standard

| Krav | Akademisk minimum | Status | Poeng |
|---|---|---|---|
| Primærkilder sitert med DOI/URL/dato | Påkrevd | Sterk for Report/Thesis, svak for Company-domene | 5/10 |
| Reproduksjon fra fakta til original | Påkrevd | Sterk for Documents, svak for finansielle/styre/person | 4/10 |
| Skille primær/sekundær/syntese | Påkrevd | `provenanceType` finnes på Report, men 93 Reports mangler feltet i gjeldende DB og mønsteret er ikke utbredt | 4/10 |
| Skille verifisert/ikke-verifisert | Påkrevd | Delvis innført for `Shareholder` og `BoardMember`, men mangler fortsatt som gjennomgående kontrakt | 3/10 |
| Tamper-evidence på lagret kilde | Anbefalt | SHA-256 finnes i arkivkatalog/logg, men ikke som gjennomgående citation-kontrakt | 2/10 |
| Manuell peer-review-spor | Påkrevd | CSV-workflow finnes, ikke i DB | 3/10 |
| Kryssvalidering mot myndighetsregister | Anbefalt | Brønnøysund-integrasjon for berikelse, ikke avstemming | 4/10 |
| Klikkbar sitering i sluttbruker-UI | Påkrevd for whitepaper | Delvis — `/selskap` "mørk" | 5/10 |
| **Samlet** | | | **4.5/10** |

Vurdering: Prosjektet har et sterkt arkiv- og dokumentfundament, og de første radnivåfeltene for eiere/styrer er nå i bruk. Likevel er Report-provenance bare delvis utfylt i gjeldende DB, og korpus-laget rundt selskaper, personer, styrer og historiske finansrader ligger fortsatt under akademisk standard. Whitepaper-publisering må derfor enten avgrenses til felt med dokumentert kildegrunnlag, eller vente til citation-laget og feltverifisering er etablert.

---

## 3. Metodisk plan

Seks faser, 8-12 uker. Hver fase produserer konkrete leveranser som kan kjøres i `db:audit` for å måle fremgang.

### Fase 0 — Konsolidering og policy (uke 1)

Mål: Etablere felles språk, reproduserbar baseline og deretter synlig dashboard.

**Leveranser:**

1. **`.claude/source-attribution-policy.md`**: Skriftlig policy som definerer:
   - Hva som teller som primærkilde, sekundærkilde, syntese, intern konstruksjon
   - Påkrevd format på `accessedAt` (ISO-8601, dato-presisjon)
   - Når `internal_synthesis` er gyldig og når det ikke er det
   - Hvordan forskningskonstrukter (syntetiske OrgNr) skal merkes
   - Hva som kvalifiserer som "verifisert"
   - Regler for når en URL trenger Wayback-snapshot
2. **Utvid `verify-data-integrity.ts`** med kildedekning per modell:
   - `% CompanyFinancial med FieldCitation eller eksplisitt legacy-status`
   - `% BoardMember med kobling til SourceCitation`
   - `% Company med isResearchConstruct eksplisitt satt`
   - `% PersonProfile roles[] med FieldCitation eller legacy-status per rolle`
3. **Dashboard på `/admin/kvalitet`**: Live oversikt over kildedekning, oppdatert mot DB. Dette er Fase 0b etter at audit-scriptet har stabile tall; ikke bygg dashboard først.
4. **Klassifiser eksisterende `source`-strenger**: Kjør en analyse-skript som grupperer alle distinct `source`-verdier i `CompanyFinancial.source`, `CompanyOwnership.source` osv., og produser en CSV for manuell taksonomi-bygging.

### Fase 1 — Schema-utvidelse (uke 1-2)

Mål: Gjøre verifisering og strukturert kildeføring obligatorisk på schema-nivå.

**Migrasjon 1 — Universell `SourceCitation` og `FieldCitation`:**

```prisma
enum SourceClass {
  primary
  secondary
  dataset
  internal_synthesis
  media
  unknown
}

enum VerificationStatus {
  verified
  partially_verified
  needs_review
  failed
}

enum CitationReadiness {
  citable_external
  citable_with_note
  internal_context
  blocked_unsourced
}

model SourceCitation {
  id                 String             @id @default(cuid())
  sourceClass        SourceClass
  citationReadiness  CitationReadiness  @default(blocked_unsourced)
  citationText       String             // formell sitering (APA-style/CSL)
  url                String?
  localPath          String?            // lokal arkivkopi i research/evidence-pack/
  archivedUrl        String?            // web.archive.org/archive.today snapshot der policy krever det
  accessedAt         DateTime           // påkrevd for alle nye kilder
  captureMethod      String             @default("manual") // manual | script | api_snapshot | imported_archive
  contentHash        String?            // SHA-256 av PDF/HTML/JSON når lokalPath finnes
  hashAlgorithm      String             @default("sha256")
  sourceDocId        String?
  documentId         String?
  verifiedAt         DateTime?
  verifiedBy         String?
  verificationStatus VerificationStatus @default(needs_review)
  confidence         Int?               // 0-100; audit krever 0-100 hvis satt
  notes              String?
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  sourceDoc     SourceDoc? @relation(fields: [sourceDocId], references: [id])
  document      Document?  @relation(fields: [documentId], references: [id])
  fieldCitations FieldCitation[]

  @@index([url])
  @@index([localPath])
  @@index([sourceClass])
  @@index([verificationStatus])
  @@index([sourceDocId])
  @@index([documentId])
}

model FieldCitation {
  id           String @id @default(cuid())
  citationId   String
  entityType   String  // 'CompanyFinancial' | 'Shareholder' | ...
  entityId     String
  fieldPath    String? // 'revenue' | 'ownershipPct' | null = hele record

  citation     SourceCitation @relation(fields: [citationId], references: [id])

  @@index([citationId])
  @@index([entityType, entityId])
}
```

Viktig enforcement-presisering: `FieldCitation` er en polymorf kobling, så databasen kan ikke alene garantere at `entityType/entityId` peker på en faktisk rad. Derfor må `verify-data-integrity.ts` utvides til å validere alle `FieldCitation`-targets, og raw SQL CHECK/`db:audit` må håndheve at nye external-ready citations har minst én av `url`, `localPath`, `sourceDocId` eller `documentId`. Legacy-rader uten kilde skal få `citationReadiness=blocked_unsourced` og blokkeres fra whitepaper-eksport.

**Migrasjon 2 — Source/verifiseringsfelt på modeller som mangler eller bare har midlertidig legacy-felt:**

| Modell | Nye felt |
|---|---|
| `Shareholder` | `source`, `sourceUrl`, `verifiedAt` er lagt inn som midlertidige radfelt; gjenstår: `verificationStatus String?`, `confidence Int?` og kobling til `FieldCitation` |
| `BoardMember` | `source`, `sourceUrl`, `verifiedAt` er lagt inn som midlertidige radfelt; gjenstår: `verificationStatus String?`, `effectiveFrom DateTime?`, `effectiveTo DateTime?` og kobling til `FieldCitation` |
| `PersonProfile` | `lastVerifiedAt DateTime?` + rolleelementer må kunne kobles til `FieldCitation` via `fieldPath` (`roles[0]`, `roles[1]`, osv.) |
| `Actor` | `lastVerifiedAt DateTime?`, `verificationStatus String?` |
| `CompanyFinancial` | `verifiedAt DateTime?`, `verificationStatus String?` (behold `source` midlertidig for legacy-visning) |
| `Subsidy` | `verifiedAt DateTime?`, `verificationStatus String?` |
| `BusinessRelationship` | `verifiedAt DateTime?`, `verificationStatus String?` |

Ikke spre `sourceUrl/accessedAt` som parallelle fritekstfelt på alle modeller med mindre UI-et trenger en midlertidig cache. Den kanoniske kilden skal være `SourceCitation` + `FieldCitation`; ellers oppstår to sannheter som kan divergere.

**Migrasjon 3 — Skille konstrukter fra registrerte entiteter:**

```prisma
model Company {
  ...
  isResearchConstruct Boolean   @default(false)
  orgNrFormat         String    @default("bronnoysund") // 'bronnoysund' | 'nordic_prefix' | 'research_construct' | 'unknown'
  registrySource      String?   // f.eks. 'data.brreg.no'
  registryVerifiedAt  DateTime?
  ...
}
```

**Migrasjon 4 — Insight strukturert sitering:**

Endre `Insight.source String` til `Insight.sourceLabel String` (label for visning), og introduser `Insight.primaryCitationId String?` som peker til `SourceCitation`. Feltet kan være nullable for legacy-rader i første migrasjon, men import-helper og `db:audit` skal blokkere nye Insights uten enten `primaryCitationId` eller minst én `SourceRef`/`InsightDocumentRef` som kan løses til en `SourceCitation`.

**Migrasjon 5 — Aksessdato og arkivlink på `Document` og `SourceDoc`:**

Legg til `accessedAt DateTime?` og `archivedUrl String?` på `Document` og `SourceDoc` så vi kan registrere Wayback-snapshots.

### Fase 2 — Backfill kritisk underlag (uke 2-4)

Mål: Få eksisterende data opp på den nye standarden.

**Scripts:**

1. **`scripts/backfill-bronnoysund-citations.ts`**:
   - For hver `Company` med 9-sifret `orgNr`: hent live data fra `https://data.brreg.no/enhetsregisteret/api/enheter/{orgNr}`
   - Lagre responsen som JSON i `research/evidence-pack/bronnoysund-snapshots/{orgNr}-{YYYY-MM-DD}.json`
   - Beregn SHA-256 av JSON-en
   - Opprett `SourceCitation` med `sourceClass=primary`, URL, `accessedAt`, `localPath`, `contentHash`
   - Knytt bare felt som faktisk finnes i Enhetsregisteret til denne citationen, f.eks. `Company.legalForm`, `Company.naceCode`, `Company.employees`, `Company.registryVerifiedAt`
   - Ikke bruk Enhetsregisteret som kilde for `CompanyFinancial.revenueNok`/EBITDA hvis verdiene ikke finnes i responsen
   - Kjør idempotent: oppdater siteringer hver kvartal

   Rolledata skal hentes separat fra Brønnøysund roller-API (`/enheter/{orgNr}/roller`) og lagres som egen `SourceCitation`/snapshot. Regnskapsdata må avstemmes mot OffentligData financial statement, Regnskapsregisteret-utskrift eller annen eksplisitt regnskapskilde.

2. **`scripts/flag-research-constructs.ts`**:
   - Identifiser alle Company-rader der `orgNr` ikke matcher 9-siffer regex eller starter med `NO-X-`
   - Sett `isResearchConstruct = true` og `orgNrFormat = 'research_construct'`
   - Krev at slike entiteter har en `internal_synthesis`-citation eller flagges som "missing_provenance"

3. **`scripts/backfill-annual-report-citations.ts`**:
   - For hver `CompanyFinancial` med `source` som matcher `*annual report YYYY*` eller `*aarsrapport YYYY*`:
     - Søk i `research/evidence-pack/arsrapporter/` etter PDF som matcher selskap + år
     - Opprett SourceCitation pekende til lokal sti + URL hvis kjent
     - SHA-256 på PDF-en

4. **`scripts/backfill-person-role-sources.ts`**:
   - Bruk Brønnøysund-rolledata til å opprette `FieldCitation` per rolle (`fieldPath = roles[n]`) og per `BoardMember`-rad
   - For interlocking-direktører: kryss-sjekk mot `BoardMember`-citation og flagg konflikter til review

5. **`scripts/audit-vague-sources.ts`**:
   - Finn alle records med source-verdier som matcher: `web research`, `manual`, kun domenenavn, kun "research"
   - Produser CSV for manuell opprydning
   - Mål: 0 vague sources etter uke 4

### Fase 3 — Import-disiplin (uke 3-5)

Mål: Forhindre regress. Ingen nye data uten kilde.

**Leveranser:**

1. **`scripts/lib/import-helpers.ts`** — felles helper:

```typescript
export type RequiredCitation = {
  sourceClass: 'primary' | 'secondary' | 'dataset' | 'internal_synthesis' | 'media' | 'unknown'
  accessedAt: string  // ISO-8601
  citationText: string
  url?: string
  localPath?: string
  sourceDocId?: string
  documentId?: string
  verifiedAt?: string
  confidence?: number
  archivedUrl?: string
  contentHash?: string
}

export async function upsertWithCitation<T>(
  prisma: PrismaClient,
  entityType: string,
  upsertFn: () => Promise<T & { id: string }>,
  citation: RequiredCitation, // validate: at least one locator field for external-ready use
  fieldPath?: string
): Promise<T> {
  const entity = await upsertFn()
  const citationRecord = await prisma.sourceCitation.upsert(...)
  await prisma.fieldCitation.create({ ... entityType, entityId: entity.id, fieldPath })
  return entity
}
```

Tving alle import-scripts gjennom denne. TypeScript-typing gjør citation påkrevd.

2. **Source-string guard som npm-script først, hook senere**:
   - Regex-blokker: `source:\s*['\"]web research`, `source:\s*['\"]manual`, `source:\s*['\"][a-z]+\.no(?!\/)['\"]` (kun domene)
   - Legg til `npm run audit:source-strings` som kan kjøres i CI og manuelt
   - Ikke forutsett `.husky/pre-commit`; repoet har ikke `.husky/` i gjeldende state. Hook kan legges til senere hvis prosjektet faktisk tar i bruk Husky.
   - Scriptet må skille mellom legacy-funn og nye diff-funn, ellers blir det umulig å jobbe før hele backfillen er ferdig

3. **Reskriving av eksisterende import-scripts** (én per uke, prioritert etter datavolum):
   - Uke 3: `import-norgesgruppen-tree.ts`, `import-asko-corporate-tree.ts`
   - Uke 4: `import-coop-tree.ts`, `import-reitan-tree.ts`, `import-orkla-tree.ts`
   - Uke 5: `import-mowi-tree.ts`, `import-salmar-tree.ts`, `import-leroy-tree.ts`, `import-seafood-holdings-tree.ts`
   - Uke 5: `import-tine-tree.ts`, `import-nortura-tree.ts`, `import-felleskjopet-tree.ts`, `import-bama-tree.ts`, `import-kavli-tree.ts`
   - Følges av: `import-research-20260420.ts`, `import-session5-supply-chain.ts`, `import-nordic-deepening.ts`

4. **Oppdater `.claude/data-imports.md`**: Ny seksjon "Source attribution requirements" som forklarer `upsertWithCitation`-mønsteret.

### Fase 4 — Evidence-pack-fundament (uke 4-6)

Mål: Lokalt arkiv = tamper-evident sannhetskilde.

**Leveranser:**

1. **`scripts/archive-source.ts`**:
   - Input: liste over URL-er fra URL-MANIFEST eller direkte
   - Første steg: les eksisterende `research/pdf-katalog.json`, `research/download-log-*.jsonl` og evidence-pack `_logs` for å gjenbruke allerede beregnede SHA-256-hasher
   - For hver URL:
     - HEAD-sjekk for content-type og last-modified
     - Last ned til `research/evidence-pack/{theme}/{slug}.{ext}`
     - Beregn SHA-256
     - Send POST til `https://web.archive.org/save/{url}` (Wayback SPN-API) bare når policy krever snapshot; DOI-er, stabile offentlige PDF-er og lokale interne konstruksjoner kan ha annen arkivstrategi
     - Lagre `manifest.jsonl`-linje: `{url, localPath, sha256, contentType, contentLength, archivedUrl, archivedAt}`
   - Idempotent: hopper over hvis SHA-256 matcher eksisterende

2. **`scripts/verify-source-integrity.ts`** (kjør månedlig):
   - Iterer alle filer registrert i manifest.jsonl
   - Re-beregn SHA-256
   - Sammenlign mot lagret verdi
   - Flagg endringer som mulig korrupsjon eller manipulert kilde
   - Skriv resultat til `research/integrity-check-{YYYY-MM-DD}.log`

3. **`scripts/export-bibliography.ts`**:
   - Iterer Report, Thesis, SourceDoc
   - Generer `research/bibliography.bib` (BibTeX) og `research/bibliography.ris` (RIS)
   - Bruk Citation Style Language (CSL) — APA 7. utgave som standard
   - Vedlegg til whitepaper-eksport

4. **`research/EVIDENCE-PACK-MANIFEST.md`**: Oppdatert dokumentasjon av arkiv-strukturen, hvordan filer er navngitt, hva sjekksumene betyr, hvordan Wayback-fallback fungerer.

### Fase 5 — UI-sitering (uke 5-8)

Mål: Hver synlig påstand har klikkbar fotnote.

**Leveranser:**

1. **Felles `<Citation />`-komponent**:

```tsx
<Citation id="cit-abc123" inline />
// renderer: superscript [1] eller [Brønnøysund 2024]
// hover/tap: tooltip med URL, accessedAt, archivedUrl-fallback
```

```tsx
<CitationBibliography page="/selskap/norgesgruppen" />
// rendrer en fotnoteliste på bunnen av siden
```

2. **Reskriving av `/selskap/[id]/page.tsx`**:
   - Hver omsetnings-verdi, EBITDA, ansattantall får inline `<Citation />`
   - Hver styremedlem-rad får kildelink
   - Hver eierandel får kildelink
   - Bunntekst "Kilder" lister alle siteringer på siden numerisk
   - "Eksport som forskningsnote" → genererer Markdown med fotnoter

3. **Standardisert chart-fotnoter**:
   - `ChartFrame` har allerede `contract.sourceRefs` og `SourceFootnote`; utvid eksisterende `VisualizationDataContract` i stedet for å introdusere et parallelt `citationIds`-system
   - Nye chart-kontrakter må kunne mappe `sourceRefs` til `SourceCitation` der datapunktet bygger på DB-fakta
   - Tooltips på chart-data viser kilde for det spesifikke datapunktet
   - PR-mal eller audit-script blokker chart-endringer uten `sourceRefs`/citation-mapping

4. **Knowledge graph "Verifiser node"-panel**:
   - Når en node velges, sidebar viser alle SourceCitations knyttet til entiteten
   - "Åpne primærkilde"-knapp åpner URL eller lokal PDF
   - "Verifisert" / "Tvil" / "Avvis"-status synlig som badge

5. **Sirkularitet og innsikt-siden**:
   - Loop og gap-rendering oppdateres til å vise sources synlig, ikke kun i datamodellen

### Fase 6 — Verifiserings-workflow (uke 7-10)

Mål: Innebygd peer-review i datapipelinen.

**Leveranser:**

1. **`/admin/review/[entityType]/[id]`-side**:
   - Vis entitet sammen med alle koblede SourceCitations
   - Før bygging må prosjektet avklare identitet: enten enkel lokal reviewer-konfig (`REVIEWER_ID`) eller faktisk auth/User-modell. Dagens repo har ikke auth/User-schema.
   - Knapp "Verifisert" → setter `verifiedAt`, `verifiedBy = reviewerId`
   - Knapp "Tvil" → setter `confidence < 50` med begrunnelse
   - Knapp "Avvis" → soft-delete med begrunnelse, tags `quarantined`
   - Audit-log skrives til ny `ReviewAction`-modell

2. **`ReviewAction`-modell**:

```prisma
model ReviewAction {
  id           String   @id @default(cuid())
  entityType   String
  entityId     String
  action       String   // 'verified' | 'doubted' | 'rejected'
  reviewerId   String
  reason       String?
  createdAt    DateTime @default(now())

  @@index([entityType, entityId])
  @@index([reviewerId])
}
```

3. **Automatisk avstemming `scripts/reconcile-bronnoysund.ts`** (ukentlig):
   - For hvert CompanyFinancial: sammenlign mot eksplisitt regnskapskilde (OffentligData financial statement, Regnskapsregisteret-utskrift, årsrapport eller Proff der lisens/tilgang tillater)
   - Brønnøysund Enhetsregisteret alene er ikke nok for revenue/EBITDA-avstemming; det gir primært entity-, adresse-, NACE-, ansatt- og statusfelt
   - Hvis avvik > 5% på revenue eller ebitda: flagg for review
   - Lagre resultat i `ReconciliationLog`:

```prisma
model ReconciliationLog {
  id              String   @id @default(cuid())
  entityType      String
  entityId        String
  fieldPath       String
  localValue      String
  externalValue   String
  externalSource  String   // 'offentligdata_financial_statement' | 'regnskapsregisteret' | 'annual_report' | 'proff'
  diffPct         Float
  resolved        Boolean  @default(false)
  createdAt       DateTime @default(now())

  @@index([resolved])
}
```

4. **Plausibilitetssjekker i `verify-data-integrity.ts`**:
   - Sum ownershipPct per parentCompanyId ≤ 100% (warning)
   - Person kan ikke ha to overlappende CEO-roller i forskjellige selskaper (warning)
   - BoardMember-tidsrom uten overlapping ved samme selskap (warning)
   - Subsidiebeløp må være positivt (error)
   - CompanyFinancial.revenue må være numerisk og ikke negativ (error)
   - Datoer må være ≤ 2026-12-31 (error)

5. **Whitepaper-eksport med fotnoter**:
   - `scripts/export-whitepaper.ts`:
     - Input: liste over Reports/Insights som skal inn i whitepaperet
     - Output: Markdown med numererte fotnoter, BibTeX-vedlegg
     - Sjekksumliste over alle siterte filer som vedlegg
     - Validering: ingen påstand uten fotnote

---

## 4. Anbefalt første sprint (uke 1)

Konkret, kjørbar plan for de første 5 dagene. Revidert etter validering: første sprint skal etablere korrekt baseline og enforcement, ikke love full dashboard/backfill før schema-kontrakten er på plass.

| Dag | Oppgave | Estimert tid |
|---|---|---|
| Mandag | Skriv `.claude/source-attribution-policy.md` med definisjon av `SourceClass`, `VerificationStatus`, legacy-regler og Wayback-policy | 3 timer |
| Mandag | `scripts/audit-source-string-taxonomy.ts` — grupper eksisterende `source`-strenger og modeller uten citation-dekning | 3 timer |
| Tirsdag | Utvid `verify-data-integrity.ts` med read-only kildedekning per modell og FieldCitation target-validering (før migration kan checks returnere "ikke implementert") | 4 timer |
| Tirsdag | Lag migrasjon 1 (SourceClass, VerificationStatus, SourceCitation, FieldCitation) + Prisma generate | 4 timer |
| Onsdag | Lag migrasjon 3 (`isResearchConstruct`, `orgNrFormat`, registry-felt) + `scripts/flag-research-constructs.ts` dry-run | 4 timer |
| Torsdag | Bygg `scripts/lib/import-helpers.ts` og `npm run audit:source-strings`; koble én lavrisiko import til helperen som pilot | 6 timer |
| Fredag | `scripts/backfill-bronnoysund-citations.ts` pilot for 10 selskaper: kun entity-/rollefelter, lag JSON snapshots og SourceCitations | 4 timer |
| Fredag | Sprint-review: kjør `npm run db:audit`, taxonomy-script og source-string guard; oppdater `research/DATA-READINESS-STATUS.md` med faktisk baseline | 2 timer |

## 5. Suksesskriterier per fase

| Fase | Suksesskriterie | Måles ved |
|---|---|---|
| 0 | Policy publisert og audit-baseline reproduserbar; dashboard kan komme som Fase 0b | `npm run db:audit` + source-taxonomy-rapport viser kildedekning per modell |
| 1 | Schema-migrasjoner kjørt, alle modeller har felt for sitering | `npx prisma migrate status` viser ingen pending |
| 2 | 100% av Company med 9-sifret orgNr har Brønnøysund-citation | db:audit-rapport |
| 3 | 0 nye import-endringer introduserer vague source-strenger | `npm run audit:source-strings` fanger forsøk |
| 4 | 100% nedlastede filer har SHA-256; Wayback/arkiv-fallback der policy krever det | manifest.jsonl-completeness |
| 5 | `/selskap/[id]` viser inline fotnote for alle synlige fakta | manuell QA + automatisk skanning av HTML |
| 6 | Ukentlig reconciliation-job kjører automatisk, < 50 unresolved logs | `ReconciliationLog`-query |

## 6. Eierskap

Foreslått ansvarsfordeling:

| Område | Lead |
|---|---|
| Policy + dashboard | gabriel |
| Schema-migrasjoner | gabriel |
| Brønnøysund-backfill | gabriel + research-assistent |
| Import-disiplin og helper-scripts | gabriel |
| Evidence-pack-arkivering (Wayback + SHA-256) | research-assistent |
| UI-sitering (`<Citation />`-komponent og selskap-side) | frontend-utvikler |
| Verifiserings-workflow og reconciliation | gabriel + research-assistent |
| Whitepaper-eksport | gabriel før juni 2026 |

## 7. Risikoer

| Risiko | Sannsynlighet | Mitigering |
|---|---|---|
| Wayback Machine rategrenser | Middels | Batch over flere dager, fallback til archive.today |
| Brønnøysund-API endrer felt-navn | Lav | Snapshot rå JSON, ikke kun strukturert respons |
| Historiske data uten kildelenker er for store til å backfille manuelt | Høy | Aksepter at noen data tagges `blocked_unsourced` og ekskluderes fra whitepaper |
| Tidsbruk på reskriving av import-scripts | Høy | Prioriter etter datavolum og hvor data brukes i UI |
| Forskningskonstrukter (synthetic orgNr) ekskluderes feilaktig fra rapporter | Middels | Eksplisitt opt-in i hver rapport-query (`includeResearchConstructs: false` default) |

## 8. Kobling til eksisterende dokumenter

Denne planen bygger på og utvider:

- `research/DATA-READINESS-SLUTTRAPPORT.md` — etablerer baseline 2026-04-27
- `research/REPORT-SOURCEURL-GAP-13.md` — etablerer `provenanceType`-mønsteret som mal
- `research/RESEARCH-AUDIT.md` — gir kategori-vis dybdevurdering
- `scripts/verify-data-integrity.ts` — utvides i Fase 0 og Fase 6
- `.claude/data-imports.md` — oppdateres i Fase 3 med nye krav

## 9. Neste steg

1. Diskuter denne planen — bekreft scope, fase-rekkefølge, eierskap
2. Beslutt om vi kjører Fase 0-1 før juni-whitepaperet (anbefales) eller etter
3. Lag GitHub-issues per fase med konkrete oppgaver
4. Start uke 1 ved å skrive `.claude/source-attribution-policy.md`
