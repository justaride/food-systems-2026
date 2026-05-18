# Data Readiness Status — Baseline

> Baseline-tag: `data-readiness-baseline`
> Lock-dato: 2026-04-27
> Forrige merge: `d5fc85b` (PR #9 Sirkulær-mat)

Lock-status før utførelse av data-readiness-arbeidsplanen. Mål: dokumentere hva som er bekreftet grønt og hvilke unntak som er kjente, slik at videre arbeid kan reverseres til denne baselinen ved behov.

## Akademisk kildeføring - status 2026-05-18

Denne statusen gjelder worktree `akademisk-kildehandtering-fase0`, etter første gjennomføring av `research/AKADEMISK-KILDEHANDTERING-PLAN.md`.

### Implementert

| Område | Status |
|---|---|
| Policy | `.claude/source-attribution-policy.md` etablert |
| Canonical citations | `SourceCitation` og `FieldCitation` lagt til med locator-/confidence-checks |
| Verification metadata | `CompanyFinancial`, `Shareholder`, `BoardMember`, `Subsidy`, `Actor`, `BusinessRelationship`, `PersonProfile` har additive verifiseringsfelt |
| Research constructs | `Company.isResearchConstruct`, `orgNrFormat`, `registrySource`, `registryVerifiedAt` lagt til |
| Document archive metadata | `Document` og `SourceDoc` har `accessedAt` og `archivedUrl` |
| Insight citation transition | `Insight.sourceLabel` og `primaryCitationId` lagt til additivt; legacy `source` beholdes |
| Import helper | `scripts/lib/import-helpers.ts` validerer citation, bygger stabil citation-id og skriver `FieldCitation` idempotent |
| Source-string guard | `npm run audit:source-strings` etablert med baseline og ny-funn-blokkering |
| Registry backfill | 10 Brønnøysund entity snapshots og 23 rolle-snapshots lagret med SHA-256 |
| Pilot citations | 119 `Company` field citations, 890 `BoardMember` field citations og 19 `PersonProfile` role field citations opprettet |
| Finans-kildekontroll | `research/company-financial-citation-proposals-2026-05-18.csv` laget med 14 lokale årsrapportkandidater for manuell verdi-/sidetabellkontroll |
| Finans-kildeledger | `research/source-discovery-ledger-2026-05-18.md`, `research/citation-import-action-queue-2026-05-18.csv` og `research/citation-application-packet-2026-05-18.csv` skiller importklare, betingede og blokkerte kildefunn |
| Kildearkiv | Årsrapport-PDFer, tekstuttrekk og SHA-256-manifest er samlet under `research/evidence-pack/arsrapporter/` |
| Hagar aksjonærliste | Offisiell top-20 shareholder side er arkivert som HTML/CSV/TXT under `research/evidence-pack/shareholders/`; observert 2026-05-18, kilde sist oppdatert 2026-05-14 |
| Registry source queue | `research/nordic-registry-source-acquisition-queue-2026-05-18.csv` oppretter separat svensk/dansk/finsk/islandsk kildeinnhentingskø |
| Registry source front doors | `research/evidence-pack/registry-sources/registry-source-manifest-2026-05-18.csv` arkiverer/verifiserer registerinnganger og tilgangsblokker for SE/DK/FI/IS |
| Citation packet preflight | `npm run audit:citation-application-packet` validerer packet-struktur og nekter godkjenning av rader med `apply_allowed=no` |
| Conditional decision queue | `research/citation-conditional-decision-queue-2026-05-18.md` isolerer de opprinnelig betingede radene som krever verdi-/navne-/modellbeslutning før import |
| BAMA shareholder normalization | `SH-BAMA-2024` anvendt lokalt: tre shareholder-rader normalisert til juridiske kildenavn og field-citert |
| NorgesGruppen financial exact values | `CF-NG-2024` anvendt lokalt: `revenueNok=118006` og `operatingResult=4842` med field citations |
| NorgesGruppen shareholder normalization | `SH-NG-2024` anvendt lokalt: juridisk eiernavn normalisert og `Brødrene Lorentzen AS` opprettet med field citations |
| Kesko shareholder normalization | `SH-KESKO-2024` anvendt lokalt: share-only `ownershipPct=7.54`, vote share beholdt i citation notes, og field citations opprettet |
| Reitan shareholder normalization | `SH-REITAN-2024` anvendt lokalt: direkte eier `REITAN AS` 100% valgt for `Shareholder`, familie-kontrollag beholdt i citation notes, og field citations opprettet |
| Axfood shareholder normalization | `SH-AXFOOD-2024` anvendt lokalt: top shareholder-rader korrigert til årsrapportens navn/prosenter og field citations opprettet |
| Coop Danmark shareholder split | `SH-COOP-DK-2024` anvendt lokalt: 100%-raden splittet til `OK a.m.b.a.` 50.82% og `Coop amba` 49.18% med field citations |
| ICA shareholder normalization | `SH-ICA-2024` anvendt lokalt: share-only eierprosenter oppdatert, `ICA retailers` opprettet, vote shares beholdt i citation notes, og field citations opprettet |
| Axfood financial FX normalization | `CF-AXFOOD-2024` anvendt lokalt: NOK MNOK-verdier beregnet med Norges Bank 2024 SEK/NOK annual average og field citations opprettet |
| ICA financial FX normalization | `CF-ICA-2024` anvendt lokalt: NOK MNOK-verdier beregnet med Norges Bank 2024 SEK/NOK annual average og field citations opprettet |
| Kesko financial FX normalization | `CF-KESKO-2024` anvendt lokalt: `revenueNok=138602.2` og `operatingResult=6738.2` beregnet med Norges Bank 2024 EUR/NOK annual average og field citations opprettet |
| Coop Danmark financial FX normalization | `CF-COOP-DK-2024` anvendt lokalt: `revenueNok=52407.1` og `operatingResult=988.3` beregnet med Norges Bank 2024 DKK/NOK annual average og actual EBIT etter særlige poster |
| Salling financial FX normalization | `CF-SALLING-2024` anvendt lokalt: NOK MNOK-verdier beregnet med Norges Bank 2024 DKK/NOK annual average og field citations opprettet |
| Coop Norge financial exact values | `CF-COOP-NO-2024` anvendt lokalt: `revenueNok=64595` og `operatingResult=671` fra årsrapportens MNOK-tabell med field citations |
| Reitan Retail financial exact values | `CF-REITAN-2024` anvendt lokalt: `revenueNok=109326` og `operatingResult=3769`; systemwide/distribution sales beholdt i citation notes |
| ASKO Norge statutory financial values | `CF-ASKO-2024` anvendt lokalt: `revenueNok=524.19` og `operatingResult=21.48` fra Brønnøysund Regnskapsregisteret JSON-snapshot |
| Hagar fiscal 2024/25 financial values | `CF-HAGAR-2024` anvendt lokalt: `revenueNok=14168.9`, `operatingResult=819.4`, `ebitda=1157.9`, `fiscalYearLabel=2024/25`, `reportingCurrency=ISK` og Norges Bank fiscal-period FX med 9 field citations |
| Hagar current weekly shareholders | `SH-HAGAR-2026` anvendt lokalt: offisiell top-20-liste med `sourceBasis=current_weekly_top20`, observert 2026-05-18, kilde oppdatert 2026-05-14, 20 shareholder-rader og 140 field citations |
| Hagar historical financial values | `CF-HAGAR-2020` til `CF-HAGAR-2023` anvendt lokalt: offisielle Hagar-årsrapporter 2020/21-2023/24, Norges Bank fiscal-period ISK/NOK FX og 36 nye field citations |
| Hagar historical source archive | `research/evidence-pack/arsrapporter/hagar-historical/`, `research/hagar-historical-financial-sources-2026-05-18.*` og `research/hagar-historical-fx-reconciliation-2026-05-18.*` opprettet/verifisert |
| Nordic registry detail pass | Sverige/Bolagsverket API-dokumentasjon, Danmark/Virk offentlige dokumenter, Finland/Kesko PRH open-data og Island/Hagar Skatturinn lookup er arkivert i egne SE/DK/FI/IS research-filer |

### Verifiserte tall

| Måling | Resultat |
|---|---:|
| `SourceCitation` for Brønnøysund entity snapshots | 10 |
| `SourceCitation` for Brønnøysund rolle-snapshots | 23 |
| `BoardMember` machine-verified rows | 178 av 328 |
| `BoardMember` field citations fra rolle-snapshots | 890 |
| `PersonProfile` role field citations | 19 |
| Duplicate `FieldCitation`-grupper | 0 |
| Brønnøysund role snapshots på disk | 23 |
| CompanyFinancial citation proposal rows | 14 |
| Citation action queue rows | 26 |
| Citation application packet rows | 26 |
| Citation application blocked rows | 0 |
| Citation application conditional rows | 0 |
| Citation application applied rows | 22 |
| Citation application registry queue rows | 4 |
| BAMA shareholder FieldCitation rows | 6 |
| NorgesGruppen financial FieldCitation rows | 2 |
| NorgesGruppen shareholder FieldCitation rows | 4 |
| Kesko shareholder FieldCitation rows | 2 |
| Kesko financial FieldCitation rows | 2 |
| Coop Danmark financial FieldCitation rows | 2 |
| Reitan shareholder FieldCitation rows | 2 |
| Reitan financial FieldCitation rows | 2 |
| Axfood shareholder FieldCitation rows | 6 |
| Coop Danmark shareholder FieldCitation rows | 4 |
| ICA shareholder FieldCitation rows | 6 |
| Axfood financial FieldCitation rows | 2 |
| ICA financial FieldCitation rows | 2 |
| Salling financial FieldCitation rows | 2 |
| Coop Norge financial FieldCitation rows | 2 |
| ASKO financial FieldCitation rows | 2 |
| Hagar financial FieldCitation rows | 45 |
| Hagar shareholder FieldCitation rows | 140 |
| Annual-report source manifest rows | 13 |
| Hagar historical annual-report source rows | 4 |
| Hagar historical FX reconciliation rows | 4 |
| Hagar shareholder snapshot rows | 20 |
| Nordic registry acquisition rows | 8 |
| Denmark CVR/Virk detailed manifest rows | 118 |
| Finland/Iceland registry trace rows | 14 |
| Sweden Bolagsverket detailed queue rows | 6 |
| Checked target `FieldCitation` rows before financial/shareholder import | 0 |
| Source-string taxonomy rows | 378 |
| Source-string rows needing action | 365 |
| Nye action-needed source strings mot baseline | 0 |

### Kjørte gates

| Sjekk | Status |
|---|---|
| `npm test` | ✓ 92 tester passerte etter Hagar historical financial-idempotens |
| `npm run lint` | ✓ ingen lint-feil |
| `npm run audit:citation-application-packet` | ✓ 26 rader; 0 blocked, 0 conditional, 22 applied, 4 registry queue |
| `DOTENV_CONFIG_PATH=../../.env npm run db:audit` | ✓ 221320 records; referensiell integritet passerte; CompanyFinancial-dekning 151/151; Shareholder FieldCitation-dekning 35/83 |
| `DOTENV_CONFIG_PATH=../../.env npm run audit:source-strings -- --baseline research/source-string-taxonomy-baseline.csv --fail-on-new-action-needed` | ✓ 378 taxonomy rows; 365 action-needed baseline rows; 0 nye action-needed rows |
| `DOTENV_CONFIG_PATH=../../.env npx prisma migrate status` | ✓ database schema up to date, 12 migrations |
| `npm run build` | ✓ Next.js production build passerte |

### Gjenværende datadekning etter audit

| Dekningspunkt | Status |
|---|---|
| `CompanyFinancial` med `FieldCitation` eller legacy source-felt | 151/151 (100.0%) |
| `BoardMember` med `SourceCitation`/`FieldCitation`-dekning | 178/328 (54.3%) |
| `Company` med eksplisitt `isResearchConstruct` | 38976/38976 (100.0%) |
| `PersonProfile roles[]` med `FieldCitation` | 19/97 (19.6%) |
| `Shareholder` med `FieldCitation`-dekning | 35/83 (42.2%) |

### Kjente manuelle avvik etter rollebackfill

Brønnøysund-rollebackfillen matchet 178 rader maskinelt. 44 norske Brønnøysund-eligible styre-/lederroller står igjen fordi lokal rad ikke matchet aktiv rolle i snapshotet eller trenger forbedret matcher/manuell kontroll. Eksempler på rester:

- Orkla: Stein Erik Hagen (`styreleder`)
- BAMA: Rune Dalsaune (`styremedlem`)
- Nortura: Erlend Rønning (`styremedlem`)
- TINE: Anne Berit Løset (`styremedlem`)
- REMA 1000: Trond Bentestuen (`CEO`)
- Oda, Norges Sjømatråd, Too Good To Go Norge, Holdbart og Austevoll har delvis restdekning
- Unil, REMA Distribusjon Norge, Lantmännen Cerealia, Kavli Holding, Grilstad, BioMar, Gartnerhallen, Cermaq Norway og Norsk Kylling hadde ingen sikre rolle-treff i denne passeringen

I tillegg står 106 nordiske styre-/lederroller igjen som manual-only inntil svenske, danske, finske og islandske rolle-/foretaksregistre kobles inn.

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

## Akademisk kildejakt 2026-05-18

Kildejakt for selskaps-, eier- og regnskapstall er startet og dokumentert i `research/source-discovery-ledger-2026-05-18.md`.

Maskinlesbar oppfølgingskø er lagt i `research/citation-import-action-queue-2026-05-18.csv`.

Årsrapportkildene som brukes i køen er gjort varige i `research/evidence-pack/arsrapporter/source-manifest-2026-05-18.csv`, med URL, lokal PDF, SHA-256, tekstuttrekk, tekststørrelse og citation-readiness. Tekstlokatorene i køen peker nå til `research/evidence-pack/arsrapporter/text/` i stedet for midlertidige `/tmp`-filer.

Foreløpig konklusjon:

- Primærkilder er lokalisert for Axfood, ICA Gruppen, Kesko, Coop Danmark, Coop Norge, NorgesGruppen, Reitan Retail, Salling Group, Hagar og ASKO.
- BAMA 2024-rapport er arkivert lokalt, bekrefter eierandelene 46/34/20 og er anvendt lokalt med juridiske kildenavn og field citations.
- Hagar har en offisiell oppdatert aksjonærliste; snapshot observert 2026-05-18, sist oppdatert 14. mai 2026, er arkivert i `research/evidence-pack/shareholders/` og er anvendt lokalt som `current_weekly_top20` med 20 shareholder-rader.
- ASKO Norge AS er sjekket mot Brønnøysund Regnskapsregisteret og anvendt lokalt. API-et bekrefter 2024-selskapsregnskap med driftsinntekter 524,186,809 NOK, ikke 95 mrd.; den tidligere DB-verdien var et definisjons-/enhetsavvik.
- Valutapolicy er lagt til i `.claude/source-attribution-policy.md`, med Norges Bank 2024-årsgjennomsnitt for SEK, DKK, EUR og ISK arkivert lokalt under `research/evidence-pack/fx-rates/norges-bank/`.
- `research/fx-reconciliation-2026-05-18.csv` viser at Axfood, ICA, Kesko, Coop Danmark, Salling og Hagar nå er rekalkulert/anvendt med Norges Bank-FX der valutakonvertering trengs.
- Hagar 2020-2023 historiske finansforslag står fortsatt som `proposal_requires_human_value_check`; bare 2024-raden er anvendt som fiscal 2024/25.
- Gjenstående eksternt arbeid er ikke Hagar-blockere: nordisk registerinnhenting på selskapsnivå er fortsatt manuell/API/betalt, og BoardMember-/PersonProfile-dekning har fortsatt gap.
- Offisielle registerkilder er identifisert og delvis arkivert for Sverige, Danmark, Finland og Island. Oppfølgingskøen ligger i `research/nordic-registry-source-acquisition-queue-2026-05-18.csv`, og frontdoor-/access-evidence ligger i `research/evidence-pack/registry-sources/registry-source-manifest-2026-05-18.csv`; Sverige må fortsatt behandles som manuell/betalt kildeinnhenting, og Danmark trenger browser/API-rute fordi vanlig `curl` får Cloudflare 403.

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
