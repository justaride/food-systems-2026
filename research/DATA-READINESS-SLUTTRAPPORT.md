# Data Readiness — Sluttrapport

> Datert: 2026-04-27
> Baseline: `data-readiness-baseline` (commit `a505961`)
> Sesjonsutfall: 15 commits, 633 → 262 funn (-371), 0 HIGH-severity gjenværende
> Ferdig: Fase A + Fase B + det meste av Fase C

## Sammendrag

Datakatalogen har gått fra "produksjon-klar med 13 sourceUrl-feil" til "KI-klar med klare provenance-regler og rensede koblinger". Alle systematiske rotårsaker fra Fase B er adressert.

| Indikator | Baseline | Sluttstatus |
|---|---:|---:|
| db:audit | grønn | grønn |
| File-coverage funn | 578 | 262 |
| HIGH severity | 1 | 0 |
| MEDIUM severity | 376 | 118 |
| LOW severity | 201 | 144 |
| missing_file_document | 259 | 0 |

## Hva er KI-klar (kan brukes direkte)

### Primærkilder for sitering

- **108 Reports i seed** med klassifisert `provenanceType` (97 `external_report`, 2 `external_article`, 3 `composite_source`, 5 `internal_synthesis`, 3 `internal_register`, 0 `blocked_source` aktiv)
- **86 Theses i DB** — alle har URL etter backfill; 36 har DOI, 79 har publisher
- **1 163 Documents** med innhold; 1 069 med gyldig filePath, 94 med null filePath (DB-only)
- **307 SourceDocs** med klassifisert `sourceType`
- **5 ekstraherte MD-er** (DLF + 2 Iceland Review + 2 status-snapshots) klare for sitering med chunk-level provenance

### Strukturerte data (KI-aktørspørringer "gratis")

- 55 431 Companies, 191 Actors, 1 354 PersonProfiles
- 150 CompanyOwnership, 121 BusinessRelationships, 120 CompanyProperty (selvleie-detect klar)
- 1 696 BoardMember med interlock-data
- 179 312 Subsidies + 303 CompanyFinancials + 243 CountryMetrics

### Sitatevennlige felt

Hver Report/Thesis har: tittel, år, kategori, tags, sammendrag (synthesis), keyFindings, supportingSources med URL-er og lokale fil-stier. Provenance avgjør sitatregler:

| Provenance | KI-bruk |
|---|---|
| `external_report`, `external_article` | Kan siteres direkte |
| `composite_source` | Må flagges som sammenstilling; gi underlagskilder |
| `internal_synthesis`, `internal_register` | Bruk som bakgrunn, ikke direkte sitat |
| `blocked_source` | Ekskludert fra KI-svar |

## Hva er begrenset

### Krever forsiktig bruk

| Kategori | Antall | Problem |
|---|---:|---|
| Scanned PDFs (Group I) | 5 | OCR ikke kjørt; `Document.content` har fallback-tekst, men kvalitet er lavere enn ekte OCR ville gitt |
| DB-only Documents (Group B/C) | 69 | Innhold i `Document.content`, men ingen lokal fil. Kan brukes for tematisk analyse, men ikke for "vis original PDF"-bruk |
| Lavtekst-PDF-er (Group J) | 44 | Få ord per MB. Akseptabelt hvis Document.content allerede har god tekst, men sjekk per case |
| Orphan files i arkiv-sortert/ | 142 | Ikke ingested til DB. Kan ligge som rå-arkiv eller ingestes hvis høy verdi |

### Krever manuell vurdering

- **13 Documents demoted til null filePath** (Group A-konflikt) — duplikat-Documents finnes; vurder merging
- **1 unfixable incoming/-Document** (`luke-luobio-53-2020`) — SHA ikke i pdf-katalog; manuell linking
- **1 broken supportingSource** — referanse til ikke-eksisterende fil
- **1 duplicate Documents** (Group H) — to Documents med samme SHA, velg canonical
- **118 missing SourceDoc filenames** — basenamene finnes ikke noe sted i research/; manuell sjekk

## Hva KI ikke skal bruke

| ID | Type | Begrunnelse |
|---|---|---|
| `agrianalyse-bondens-andel-2025` | `blocked_source` | Publikasjon ikke funnet i AgriAnalyse-arkivet 2025; lokal PDF er HTML-feillagring. Skal eksluderes inntil ekte underlag er funnet |

## Verktøy levert i denne sesjonen

| Verktøy | Formål |
|---|---|
| `npm run compute-ki-priority` | Score 1-5 per Report/Thesis basert på provenance + kategori + alder |
| `npm run inventory-urls` | Samle alle URL-er på tvers av entiteter |
| `npm run compute-file-coverage` | Diff filsystem mot DB; finn orphans/missing |
| `npm run check-pdf-quality` | Klassifiser PDF-er (ok/scanned/low-text/html-mis-saved) |
| `npm run triage-html` | Klassifiser HTML-snapshots (ok/needs-md-extraction/error) |
| `npm run build-remediation-backlog` | Konsolider funn med fix-grupper |
| `npm run remap-document-paths` | SHA-basert path-remap for stale Document.filePath |
| `npm run fix-stale-document-references` | Null/prefix-fix for filePath-konflikter |
| `npm run extract-html-to-md` | Pandoc-basert HTML→Markdown for KI-sitering |

Alle skripter har `--dry-run` (default) og `--apply` modus der det er aktuelt. Re-kjøres trygt; idempotente.

## Provenance-regler (entitetsnivå)

- **Report**: 6-typers `provenanceType` enum, persistert i DB. `external_*` uten URL = audit-feil; interne typer = varsel ved manglende supportingSource
- **Thesis**: type-scaffolding for 4-typers `provenanceType` enum (ikke persistert ennå); kan fylles ved behov
- **Document**: nullable `filePath` skiller "har lokal fil" fra "DB-only"; ingen separat provenance-felt foreløpig (kategori-feltet diskriminerer godt)
- **SourceDoc**: `sourceType` brukes som de facto provenance

## Anbefaling for neste analysefase

### Umiddelbart kjørbart

1. **URL-helse-batch** (1-2 timer): kjør `inventory-urls` output mot HTTP HEAD/GET, klassifiser ok/dead/blocked. Finnes 173 unike URL-er, 98 % på prioritet ≥ 4.0 — høy ROI.
2. **Manuell oppfølging av 4 spesielle case** (1 time): de 13 demoted Documents, 1 unfixable, 1 broken supportingSource, 1 duplicate.

### Krever brukerinput / oppsett

3. **Semantisk dedup** (#13): aktiver embeddings-pipeline (Document.embedding-feltet finnes allerede som `vector(1536)`). Krever API-nøkkel (OpenAI text-embedding-3-large eller lokalt). Kan kjøres som nattjobb som populerer embeddings + foreslår merge-kandidater ved cosine ≥ 0.92.
4. **Fase D KI-aksept-tester**: definér 5-10 konkrete spørsmål KI må svare riktig på (med forventet kildehenvisning). Disse kjøres som CI-test for å fange regresjoner i datasett-kvalitet.

### Lengre sikt

5. **Document-kategorisering**: hvis Fase B-funn viser at typed-Document-distinksjoner trengs (raw_import vs research_note vs primary_source), kan provenance utvides på Document-modellen.
6. **OCR for prioriterte scanned PDFs**: hvis 1-2 av de 5 scanned PDF-ene viser seg viktige for spesifikke KI-svar, installer Tesseract og kjør.
7. **Periodisk re-audit**: kjør hele inventory-pipelinen månedlig, eller etter hver `db:import`. Auto-flagger nye orphans og missing-references før de hoper seg opp.

## Rollback

Ved behov: `git reset --hard data-readiness-baseline`. Schema-endringen i `Document.filePath` (nullable) krever manuell SQL-rollback (`ALTER TABLE "Document" ALTER COLUMN "filePath" SET NOT NULL`), men det blokkerer hvis noen Document har null — så fyll inn sentinel først.

## Avhengigheter for KI-bruk

- pgvector er allerede installert (`@prisma/adapter-pg` + `pgvector`)
- `Document.embedding` feltet finnes som `vector(1536)`
- Pandoc 3.8.2.1 brukt for HTML→MD; Tesseract ikke installert (kan installeres via brew hvis OCR ønskes)
- ingen API-nøkkel påkrevd for nåværende state — alt kjører lokalt mot Postgres
