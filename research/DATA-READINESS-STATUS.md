# Data Readiness Status — Baseline

> Baseline-tag: `data-readiness-baseline`
> Lock-dato: 2026-04-27
> Forrige merge: `d5fc85b` (PR #9 Sirkulær-mat)

Lock-status før utførelse av data-readiness-arbeidsplanen. Mål: dokumentere hva som er bekreftet grønt og hvilke unntak som er kjente, slik at videre arbeid kan reverseres til denne baselinen ved behov.

## Grønne sjekker

| Sjekk | Status | Kommentar |
|---|---|---|
| `npm run lint` | ✓ | ingen lint-feil |
| `npx tsc --noEmit` | ✓ | ingen typefeil |
| `npm run db:audit` | ✓ | 240 879 records, alle integritetssjekker passer; 11 klassifiserte provenance-varsler |
| `npm run db:verify` | — | ikke kjørt på baseline; kan kjøres ved behov |
| `npm run build` | — | ikke kjørt på baseline; full Next.js build kjøres før deploy |

## Record-tall (db:audit, baseline)

| Entitet | Antall |
|---|---:|
| `Subsidy` | 179 312 |
| `Company` | 55 431 |
| `BoardMember` | 1 696 |
| `PersonProfile` | 1 354 |
| `Document` | 1 163 |
| `SourceDoc` | 307 |
| `CompanyFinancial` | 303 |
| `CountryMetric` | 243 |
| `Actor` | 191 |
| `ActorRelationship` | 157 |
| `Report` | 154 |
| `CompanyOwnership` | 150 |
| `BusinessRelationship` | 121 |
| `CompanyProperty` | 120 |
| `Shareholder` | 91 |
| `Thesis` | 86 |
| **Sum** | **240 879** |

## Kjente unntak (varsel, ikke feil)

11 rapporter har eksplisitt `provenanceType`-klassifisering uten kanonisk `sourceUrl`. Disse er klassifiserte som varsel i `db:audit`, ikke feil — de har resolvbare `supportingSources` eller er bevisst flagget som blokkert.

| ID | Type | Notat |
|---|---|---|
| `agrianalyse-bondens-andel-2025` | `blocked_source` | Publikasjon ikke funnet i AgriAnalyse-arkivet 2025; lokal PDF er HTML feil-lagret som PDF |
| `merkevarer-historie` | `internal_synthesis` | Lokalt faktaark Orkla/TINE |
| `nordisk-sammenligning-2024` | `composite_source` | Bygger på ICA, Axfood, Kesko årsrapporter |
| `verdibutikker-utfordrere` | `composite_source` | Normal + Europris regnskapsdata |
| `oversikt-nordisk-matmakt-historikk` | `internal_synthesis` | Egenkartlegging |
| `oversikt-sirkularitet-dyp` | `internal_synthesis` | Lokalt notat med 20+ kilder |
| `oversikt-tenketanker-ngo` | `internal_synthesis` | Landskapskartlegging |
| `oversikt-offentlig-rapportlogg` | `internal_register` | Register over offentlige rapporter |
| `oversikt-nordisk-avhandlingsregister` | `internal_register` | 70 avhandlinger fra flere repositorier |
| `oversikt-nordisk-mat-tenkere` | `internal_synthesis` | Person/miljø-kartlegging |
| `oversikt-nou-stortingsdok-juridisk` | `internal_register` | NOU-er, meldinger, EU-direktiv |

Detaljert vurdering per case: [REPORT-SOURCEURL-GAP-13.md](REPORT-SOURCEURL-GAP-13.md).

## Commits siden forrige merge

| SHA | Beskrivelse |
|---|---|
| `6716042` | chore(research): regenerate auto-catalogues after provenance work |
| `2069db5` | chore: thesis URL backfill + intake source-path resolver fix |
| `55c716f` | feat(reports): add provenance type system + classify 13 sourceUrl-gap reports |

## Migration state

- `20260427_report_provenance` — applikert lokalt og i repo

## KI-bruksprofil (låst 2026-04-27)

Mål-arkitekturen er optimalisert for følgende KI-bruk, i prioritert rekkefølge:

| Prioritet | Bruksprofil | Eksempel-spørsmål |
|---|---|---|
| **1 (primær)** | RAG / citation Q&A | "Hva sier kildene om EMV-konsentrasjon?" |
| **2 (sekundær)** | Tematisk analyse | "Hovedstrømninger i nordisk matpolitikk?" |
| **3 (gratis)** | Aktør-/relasjonsspørring | "Reitan-systemets styreverv?" |

**Konsekvenser for IA:**

- **Chunk-level provenance** kreves — ikke nok å vite hvilket dokument; må kunne sitere ned til avsnitt/seksjon
- **Embeddings** beregnes på chunk-nivå (kortere tekstbiter, ikke hele dokumenter)
- **Tags + kategorier** må være konsistente og dekkende — KI-prioritering har høy ROI
- **Sitatevennlig output**: hver chunk må kunne kobles tilbake til original kilde + sidetall hvis tilgjengelig
- **Provenance-type** styrer KI-bruksregler:
  - `external_report` / `external_article` → kan siteres direkte
  - `composite_source` → må flagges som sammenstilling (gi underlagskilder også)
  - `internal_synthesis` / `internal_register` → kan brukes som bakgrunn, ikke siteres som primærkilde
  - `blocked_source` → ekskluderes fra KI-svar (eller vises kun med advarsel)

## Fase B-status (parallell undersøkelse)

Ferdig 2026-04-27. Fire parallelle inventeringer + konsolidert backlog:

| Inventering | Verktøy | Resultat |
|---|---|---|
| URL-helse | `inventory-urls.ts` | 173 unike URL-er, 98 % HTTPS, 98 % på prioritet ≥ 4.0 — full HTTP-sjekk gjenstår |
| Fildekning | `compute-file-coverage.ts` | 578 funn (1 HIGH, 376 MEDIUM, 201 LOW) |
| PDF-kvalitet | `check-pdf-quality.ts` | 50 problemer (5 scanned, 44 low-text, 1 oversized) av 398 PDFer |
| HTML-triage | `triage-html.ts` | 5 HTML-er, alle trenger MD-ekstraksjon (3 HIGH, 2 MEDIUM) |
| Konsolidering | `build-remediation-backlog.ts` | 633 funn i `REMEDIATION-BACKLOG.csv` med fiksgrupper |

**Rotårsak-analyse:** 376 MEDIUM-funnene er dominert av tre systematiske mønstre:

- Gruppe A (191): stale `incoming/food-research-process-2026-04-20/` paths — filer finnes på `arkiv-sortert/`, kun path-remap trengs
- Gruppe B (60): `external/`-paths uten lokal fil — DB-only, policy-beslutning trengs
- Gruppe C (8): `generated/meetings/` slettede filer — gjenskape eller slett DB-rader

## Fase C-status (kanonisering)

Komplett 2026-04-27.

| Subtask | Status | Resultat |
|---|---|---|
| Gruppe A: stale incoming/ → SHA-mapped paths | ✓ Ferdig | 190 av 191 Documents oppdatert (1 manual review) |
| Gruppe N: HTML→MD-ekstraksjon (5 snapshots) | ✓ Ferdig | Pandoc 3.8.2.1, 251–1023 ord per fil |
| MD-linking til Report.supportingSources | ✓ Ferdig | 3 referrerte MDer linket; 2 unreferenced (project status) |
| Gruppe B/C policy (94 Documents) | ✓ Ferdig | Schema-migrasjon + 25 prefix-fixed + 13 demoted + 56 nulled. 0 data lost |
| Gruppe I: OCR for scanned PDFs | ✓ Ferdig | 2 Documents kraftig forbedret (47→8034, 81→30606 ord). Idempotent via OCR-companion-filer |
| #6: provenance til Thesis/Document/SourceDoc | ✓ Type-scaffolding | ThesisProvenanceType lagt til; Document/SourceDoc utsatt — eksisterende felt diskriminerer godt |
| Original: semantisk dedup (~0.92 embedding) | Utsatt | Krever embeddings-API-nøkkel; Document.embedding feltet tomt for 0 av 1163 |

## Fase D-status (validering)

Komplett 2026-04-27.

| Subtask | Status | Output |
|---|---|---|
| Sluttrapport | ✓ Ferdig | `research/DATA-READINESS-SLUTTRAPPORT.md` |
| KI-aksept-tester | ✓ Ferdig | 10 starter-tester i `research/KI-ACCEPTANCE-TESTS.md` (bruker justerer) |
| URL-helse-batch | ✓ Ferdig | 173 URLer sjekket: 145 ok, 15 dead, 7 blocked, 6 andre. Detaljer i `research/URL-HEALTH.md` |
| Månedlig auto-revisjon | ✓ Schedulert | Routine `trig_018MyacxvMxDw1Zs9k6XFJMM` kjører 1. i hver måned 02:00 UTC |

## REMEDIATION-BACKLOG (etter all Fase B+C-arbeid)

Total: **345 funn** (31 HIGH, 125 MEDIUM, 189 LOW). HIGH-severity domineres av URL-helse-funn (alle på prioritet ≥4.5):

| Fix-gruppe | HIGH | MEDIUM | LOW | Kommentar |
|---|---:|---:|---:|---|
| P: dead URLs | 15 | 0 | 0 | Top: nibio.brage.unit.no DNS, uib.no/persons, regjeringen.no NOU 2013:6 |
| Q: blocked URLs (403/451) | 7 | 0 | 0 | Manuell verifisering |
| T: other URL issues | 3 | 0 | 0 | eur-lex 202, diva-portal 429 rate-limit |
| R: timeout URLs | 2 | 0 | 0 | Tregt server-respons |
| S: server-error URLs | 1 | 0 | 0 | 5xx |
| N: needs MD extraction | 3 | 2 | 0 | Allerede ekstraherte; 3 HIGH er linket |
| F: orphan files | 0 | 0 | 142 | arkiv-sortert/ rå-arkiv (akseptabelt) |
| E: missing SourceDoc | 0 | 118 | 0 | Innhold i DB; manuell review trengs |
| J: low-text PDFs | 0 | 0 | 44 | Document.content har sannsynligvis tekst |
| Andre | 0 | 5 | 3 | OCR-kandidater, duplicates, oversized |

## Neste fase fra denne baselinen

1. **Definér KI-bruksprofil** — RAG/Q&A, tematisk analyse, sammendrag, utforskende søk? Påvirker IA-regler og hvilke felt som er obligatoriske
2. **Utvid provenance-mønster** til `Thesis`, `Document`, `SourceDoc`
3. **KI-prioriterings-rangering** (1-5) per Document/Report
4. **Fase B** parallell-undersøkelse: URL-helse + fildekning + PDF-kvalitet + HTML-triage → samlet `REMEDIATION-BACKLOG.csv`
5. **Fase C** kanonisering: semantisk dedup + IA-anvendelse + HTML→MD-ekstraksjon
6. **Fase D** validering: 5-10 KI-aksept-tester + utvidet `db:audit` + sluttrapport

## Rollback

Hele arbeidet etter baselinen kan tilbakestilles via:

```
git reset --hard data-readiness-baseline
```

Database-rollback krever også manuell SQL hvis `provenanceType`/`supportingSources` skal fjernes — men disse kolonnene er ikke-destruktive (kun additive), så normalt trenger man bare git-rollback.
