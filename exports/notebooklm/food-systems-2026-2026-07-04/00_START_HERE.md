# START HERE - NotebookLM Operating Brief

Export date: 2026-07-04
Packet type: control
Status label: internal context
Allowed use: Use first. This source controls interpretation, tone, labels, and deck behavior.

## What This Source Is For

Orient NotebookLM to Food Systems 2026 as a source-grounded Nordic food-system knowledge base. The goal is sharp, evidence-aware presentation work, not generic sustainability copy.

## Core Claims Or Working Propositions

- Food Systems 2026 maps structure, power, supply chains, circular loops, policy and evidence gaps across Norwegian and Nordic food systems.
- The Obsidian vault is a navigation layer; the research/status artifacts are the evidence and gate layer.
- Never flatten PCQ, source-shortlist, actor-gated, internal-only or do-not-visualize-yet material into external claims.
- Use sharp tensions: capacity is not realized volume; utilized is not high-value; local identity is not resilience without mechanism; market concentration is structure, not intent.

## Evidence Table

| Signal | Use | Boundary |
| --- | --- | --- |
| citable | Can support external-facing statements when the quoted caveat is preserved. | Still cite the packet/source and keep method limits visible. |
| PCQ | Primary-claim qualification candidate. | Do not publish until locator, method and caveat are checked. |
| source-shortlist | Use as lead list, method map or source candidate. | Not a claim and not a chart basis. |
| actor-gated | Use as interview/validation question. | Do not answer as desk-research fact. |
| internal context | Use for orientation and synthesis. | Do not cite externally. |
| do-not-visualize-yet | Use as a warning label. | Do not make charts, rankings, maps or deck figures from this material. |

## Known Caveats

- NotebookLM outputs are source-grounded drafts, not verification.
- Generated slide decks and infographics may be factually or visually inaccurate and need human review.
- If a source says a claim is parked, blocked or actor-gated, keep it parked, blocked or actor-gated.

## Deck Angles

- Lead with a specific system tension, then show the evidence and the missing cell.
- Use one slide per decision: what we know, why it matters, what remains blocked.
- Prefer a limitation-aware claim over broad "circular food systems are important" framing.

## Bad Generic Framing To Avoid

- Do not write a generic green-transition deck.
- Do not imply the project has complete Nordic coverage.
- Do not turn capacity, ambition or pilots into realized system outcomes.

## Source Paths Included

- CLAUDE.md
- .claude/source-attribution-policy.md
- research/CITABLE-KNOWLEDGE-BASE-STATUS.md
- research/_status/food-tg-r13/r13-intake-index-2026-06-25.md

## Source Excerpts

### CLAUDE.md

````markdown
# Food Systems 2026

Knowledge base and analysis app for Norwegian and Nordic food systems. Maps corporate structures, power dynamics, supply chains, and policy landscape across the food retail and production sector.

## Essentials

- Package manager: `npm`
- Dev: `npm run dev`
- Test: `npm run test`
- Build: `npm run build`
- Lint: `npm run lint`
- Metrics refresh: `npm run compute-metrics` (chart metrics only, DB-free; this is what the build runs). For the full refresh incl. konsern-audit + coverage profiles (needs the DB), use `npm run compute-metrics:full` and commit the regenerated `public/data/coverage/profiles.json` + `data/konsern-coverage.json`.
- Database import: `npm run db:import`
- Deploy: Coolify on Hetzner via GitHub `justaride`; never Vercel
- Build note: `npm run build` runs Prisma generate + DB-free chart-metric computation before the Next.js build. The build must NOT depend on a live DB (the build container can't reach prod Postgres) — DB-derived artifacts are committed and refreshed separately via `compute-metrics:full`.

## Operating Discipline

- State assumptions and scope before non-trivial edits; ask when the task can reasonably mean more than one thing.
- Keep changes traceable to the request. Avoid adjacent refactors, speculative flexibility, and new documentation unless explicitly asked.
- For research, report, or public-facing claims, route language through the claim-lock, source-locator, and validation-gate documents before treating it as externally usable.
- Define verification before claiming completion: targeted tests/lint/build for code, the citable sequence in `research/CITABLE-KNOWLEDGE-BASE-STATUS.md` for external knowledge-base status, and `git diff --check` for docs/process edits.

## Agent Guardrails

For non-trivial work, state assumptions, scope, and verification target before editing. Prefer the smallest change that satisfies the request. Do not refactor adjacent code, rewrite unrelated prose, or clean unrelated files unless explicitly asked.

If a request has multiple plausible interpretations that would change data, claims, code behavior, or deployment impact, ask before editing. Work from current repo state and package scripts, not stale plan notes.

## Verification Defaults

- Code/UI: run focused tests when available, then `npm run test`, `npm run lint`, and `npm run build` when affected
- Data/imports: run the relevant `db:import:*` command or dry-run script, then `npm run db:audit`
- Source, claims, and whitepaper work: read `.claude/source-attribution-policy.md`, then run `npm run audit:citable` or `npm run gate:overclaim` as relevant
- Research binaries/artifacts: run `npm run audit:research-artifacts -- --base=origin/main`

## Behavioral guidelines

Apply to every task — the "why"; linked skills/guides are the "how". Full text + worked TS examples: [.claude/karpathy-guidelines.md](.claude/karpathy-guidelines.md). Bias toward caution on non-trivial work; use judgment on trivial fixes.

1. **Think before coding** — State assumptions; if a request is ambiguous, surface interpretations and ask rather than guess. → brainstorming skill
2. **Simplicity first** — Minimum code that solves the stated problem; no speculative abstraction or unrequested config. → code-conventions.md
3. **Surgical changes** — Every changed line traces to the request; match surrounding style; don't refactor or delete code you weren't asked to touch. → code-conventions.md
4. **Goal-driven execution** — Turn tasks into verifiable success criteria, then loop to green. → test-driven-development + verification-before-completion skills

## Task-Specific Guides

Read only the guide that matches the task.

- [Project Context](.claude/project-context.md)
- [Database Schema](.claude/database.md)
- [Data Imports](.claude/data-imports.md)
- [Research Workflows](.claude/research-workflows.md)
- [Company Registry](.claude/company-registry.md)
- [Code Conventions](.claude/code-conventions.md)
- [Source Attribution Policy](.claude/source-attribution-policy.md)
````

### .claude/source-attribution-policy.md

````markdown
# Source Attribution Policy

> Datert: 2026-05-18
> Gjelder: nye importer, nye DB-fakta, whitepaper-eksport og brukerflater som viser faktiske påstander.

## Formål

Alle faktiske påstander som importeres, vises i appen eller brukes i juni-2026-whitepaperet skal kunne spores til en navngitt kilde med lokator, aksessdato og klassifisert proveniens. Eldre data kan merkes som legacy i en overgangsfase, men skal ikke passere som whitepaper-klare uten eksplisitt kildegrunnlag.

## SourceClass

| Klasse | Bruk | Minimumskrav |
|---|---|---|
| `primary` | Original publisering, årsrapport, offentlig vedtak, lovtekst, registerutskrift eller myndighetsdata | URL, `accessedAt`, og lokal kopi når kilden er brukt til en sentral påstand |
| `secondary` | Analyse, media, bransjeartikkel eller rapport som tolker primærdata | URL, `accessedAt`, tydelig avsender og publiseringsdato hvis tilgjengelig |
| `synthesis` | Prosjektets egen sammenstilling av flere navngitte kilder | Underlagskilder må være koblet; syntesen er ikke selv primærbevis |
| `internal_construct` | Forskningskonstrukt laget for analysemodellering, for eksempel syntetisk eiendomsgren | Må ha forklaring, ansvarlig import og lenke til intern syntese eller beslutningsnotat |
| `registry_snapshot` | Maskinell eller manuell snapshot fra offentlig register/API | URL/API-endepunkt, `accessedAt`, lokal JSON/PDF/HTML-kopi og SHA-256 når mulig |
| `legacy_unsourced` | Historisk rad uten tilstrekkelig kilde | Tillatt bare som overgangsstatus; blokkeres fra whitepaper-eksport og nye importer |

## VerificationStatus

| Status | Betydning |
|---|---|
| `unverified` | Kilden er registrert, men feltet er ikke kontrollert manuelt eller maskinelt |
| `machine_verified` | Feltet er avstemt mot strukturert ekstern kilde eller registersnapshot |
| `human_verified` | Feltet er kontrollert av navngitt reviewer med dato |
| `disputed` | Kildene spriker eller feltet trenger faglig vurdering |
| `rejected` | Feltet er vurdert som feil, blokkert eller uegnet for bruk |

## AccessedAt

- `accessedAt` skal lagres som ISO-8601 med dato-presisjon: `YYYY-MM-DD`.
- Nye kilder uten aksessdato skal avvises av import-helper eller audit.
- Hvis en kilde har både publiseringsdato og aksessdato, skal begge bevares der modellen støtter det. Aksessdato erstatter ikke publiseringsdato.

## Lokatorer

For alle nye ikke-interne kilder kreves minst én av:

- `url`
- `localPath`
- `sourceDocId`
- `documentId`

For sentrale whitepaper-påstander skal en ekstern URL normalt ha lokal arkivkopi eller en koblet `Document`/`SourceDoc`.

## Internal Synthesis

`synthesis` eller eksisterende `internal_synthesis` er gyldig når prosjektet sammenstiller flere navngitte kilder, lager et register, eller formulerer en analyse basert på dokumenterte underlagskilder.

Det er ikke gyldig som erstatning for manglende primærkilde til:

- regnskapstall
- eierandeler
- styre- og rolleinformasjon
- subsidiebeløp
- registerstatus for selskaper
- konkrete juridiske eller regulatoriske vedtak

## Forskningskonstrukter

Forskningskonstrukter er entiteter som finnes i analysemodellen, men ikke nødvendigvis som juridisk registrerte selskaper. Eksempler er syntetiske orgnummer eller interne eiendomsgrener som brukes for å modellere struktur.

Slike entiteter skal:

- merkes med `isResearchConstruct = true`
- ha `orgNrFormat = 'research_construct'`
- ha en `internal_construct` eller `synthesis`-citation
- ikke vises som ordinær registerverifisert virksomhet

Standardspørringer til rapporter og whitepaper skal ekskludere forskningskonstrukter med mindre de er eksplisitt valgt inn.

## Hva betyr verifisert

Et felt er verifisert når verdien er kontrollert mot kilden som faktisk dokumenterer feltet.

- Brønnøysund Enhetsregisteret kan verifisere selskapsidentitet, adresse, organisasjonsform, NACE, status og roller der API-et har feltet.
- Enhetsregisteret skal ikke brukes som kilde for omsetning eller EBITDA dersom slike verdier ikke finnes i responsen.
- Regnskapstall krever årsrapport, Regnskapsregisteret-utskrift, OffentligData financial statement, Proff eller tilsvarende eksplisitt regnskapskilde med lovlig tilgang.
- Rolledata skal bruke separat rollekilde/snapshot, ikke bare generell selskapsmetadata.

## Valutakonvertering til NOK

NOK-konverterte regnskapstall er ikke verifisert bare fordi kildevaluta-tallet er funnet. Begge ledd må dokumenteres:

1. source-currency value fra primærkilde, for eksempel `net sales SEK 84,057m`
2. valutametode og valutakilde, for eksempel Norges Bank årsgjennomsnitt for samme regnskapsår

Standardregel for kalenderårsregnskap:

- Bruk Norges Banks offisielle valutakurser, årsgjennomsnitt, med NOK som kvoteringsvaluta.
- Lagre kurskilde som egen `SourceCitation` eller som eksplisitt `notes`/underlagskilde i citationen.
- Arkiver JSON/CSV fra Norges Bank API når valutakursen brukes i whitepaper-klare tall.
- Bevar originalverdien i kildevaluta i citation-notat eller eget felt når modellen støtter det.
- Avrund bare etter beregning, og dokumenter om DB-feltet bruker MNOK, hele NOK eller annen enhet.

For avvikende regnskapsår, for eksempel Hagar 2024/25, skal man ikke bruke kalenderår 2024 uten særskilt beslutning. Bruk enten:

- gjennomsnitt for faktisk regnskapsperiode hvis API/metode støtter det, eller
- kildevaluta direkte i rapport/UI inntil korrekt FX-metode er etablert.

Hagar 2024/25-pilot: Norges Bank daglige observasjoner for ISK/NOK 2024-03-01 til 2025-02-28 ble hentet 2026-05-18. Serien hadde 250 observasjoner og ga aritmetisk gjennomsnitt 7.85668 NOK per 100 ISK, dvs. 0.0785668 NOK per 1 ISK. Dette gir ca. 14,168.9 MNOK for Hagar sales 180,342 m.ISK. Serien er arkivert som `research/evidence-pack/fx-rates/norges-bank/EXR-B-ISK-NOK-SP-2024-03-01_2025-02-28-2026-05-18.json`.

Observerte Norges Bank-årsgjennomsnitt for 2024, hentet 2026-05-18:

| Valuta | API-observasjon | Enhet | NOK per 1 |
|---|---:|---|---:|
| SEK | 101.74 | NOK per 100 SEK | 1.0174 |
| DKK | 155.89 | NOK per 100 DKK | 1.5589 |
| EUR | 11.6276 | NOK per 1 EUR | 11.6276 |
| ISK | 7.79 | NOK per 100 ISK | 0.0779 |

## Wayback og lokal arkivering

Wayback- eller annen ekstern arkivlink kreves når:

- kilden er en webside som kan endres uten versjonert PDF eller DOI
- kilden er media, bransjeweb, pressemelding eller organisasjonsside brukt til sentral påstand
- samme URL tidligere har vært ustabil, omdirigert eller blokkert
- kilden inngår i whitepaperet og ikke har stabil offentlig arkivversjon

Wayback er normalt ikke nødvendig når:

- DOI eller annen persistent akademisk identifikator peker til kilden
- lokal PDF/JSON/HTML-kopi med SHA-256 er tilstrekkelig og lisensmessig forsvarlig
- kilden er et internt forskningskonstrukt med dokumentert beslutningsnotat

## Git og rå evidensfiler

Git-repoet skal bære metadata, manifests, tekstuttrekk, URL-er, access dates og SHA-256. Store rådokumenter skal ligge i lokal eller ekstern artifact storage.

Nye PR-er skal ikke legge til:

- `research/**/*.pdf`
- `docs/**/*.pdf`
- `research/evidence-pack/registry-sources/**/documents/**`
- tracked filer på 50 MB eller mer

Guardrail:

```bash
npm run audit:research-artifacts -- --base=origin/main
```

Denne sjekken blokkerer nye råfiler i branch-diffen og tracked filer over størrelsesgrensen, men lar eksisterende legacy-PDFer under grensen forbli inntil egen migrering til artifact storage.

## Legacy-regler

Eksisterende fritekstverdier i `source`-felt kan beholdes midlertidig, men skal klassifiseres og ryddes gradvis.

- `web research`, `manual`, rene domenenavn og registeretiketter uten URL/dato skal flagges.
- `legacy_unsourced` skal være eksplisitt, ikke implisitt fravær av kilde.
- Nye import-scripts skal ikke introdusere nye legacy-kilder.
- Whitepaper-eksport skal feile dersom påstanden bygger på `legacy_unsourced`, `disputed` eller `rejected`.

## Minimum for ny import

Nye importer skal levere:

1. `sourceClass`
2. `citationText`
3. `accessedAt`
4. minst én lokator (`url`, `localPath`, `sourceDocId`, `documentId`)
5. `verificationStatus`, minst `unverified`
6. `fieldPath` når citationen bare gjelder et bestemt felt

Hvis kilden er lokal fil, skal SHA-256 beregnes før den brukes i whitepaper eller som registersnapshot.
````

### research/CITABLE-KNOWLEDGE-BASE-STATUS.md

````markdown
# Citable Knowledge Base Status

Date: 2026-06-10
Branch: `codex/food-tg-mandat-2026-06-09`
Base before current quality-pass commit: `f302ab3 docs: prepare next citable quality tranche`

## Purpose

This file is the current operational status for making the Food Systems 2026
knowledge base usable as a citable external knowledge base. It replaces older
snapshot interpretation for this workstream. Historical audit counts should be
treated as stale unless repeated here.

## 2026-06-10 Strict-Gate Re-Greening (supersedes all verification sections below)

Running the operator sequence on `codex/food-tg-mandat-2026-06-09` found the
strict source gate had **regressed to red** since the 2026-05-20 snapshot: three
enforced violations in `db:audit:strict-sources` / `audit:citations` §13. The
non-strict `db:audit`, `audit:citable-reports`, tests, lint, and build all
stayed green; the regression was data/code drift after the 2026-05-26 gate
change (`9e68918`) and the 2026-06-03 KS/Re:Source import, not from any docs
commit on this branch.

The three blocker groups and their fixes:

- **A — 1 `CompanyOwnership` label-only row.** NorgesGruppen → BAMA Gruppen (46%)
  carried a bare `Brønnøysund` source that missed the resolver's
  `bronnoysund + arsrapport` annual-report case. Set the source to
  `Brønnøysund årsrapport 2024` so the existing resolver returns the BAMA 2024
  annual-report URL. Applied to the DB **and** to the seed-of-truth
  `scripts/import-company-ownership.ts` so it survives re-import and reaches
  prod on the next `db:import`.
- **B — 4 `BusinessRelationship` `Bransjeanalyse` rows** (Skretting→Lerøy/SalMar/
  Mowi feed, Yara→Felleskjøpet fertilizer). `Bransjeanalyse` was the only vague
  industry-label not in `BLOCKED_BUSINESS_RELATIONSHIP_SOURCE_LABELS`; added it
  so those rows carry the same honest blocked-unverified locator as their
  siblings (`Bransjedata`, `BioMar`, …). This also cleared the 4 P0 rows that
  had appeared in the readiness queue.
- **C — 11 internal-exception report `Document` rows** (`internal_synthesis` /
  `composite_source` / `internal_register` / `blocked_source`, each with
  `supportingSources`). The report-URL check (#11) already honoured these
  provenance exceptions, but the Document locator check (§13) did not — a
  coherence gap. Extracted #11's exact predicate into a shared
  `reportQualifiesAsProvenanceException()` used by **both** checks so they
  cannot drift; §13 now exempts Documents whose linked report is a reviewed
  provenance exception. No fabricated locators.

Verification after the fixes (all green):

| Command | Result | Notes |
|---|---:|---|
| `npm test` | passed | 446 tests across 111 suites, 0 fail (incl. new `Bransjeanalyse` resolver test). |
| `npm run lint` | passed | ESLint clean. |
| `npm run db:audit` | passed | Enforced integrity checks pass. |
| `npm run db:audit:strict-sources` / `audit:citations` | passed | Strict gate exits 0; the three §13 violations are gone. |
| `npm run audit:citable` | passed | Full chain (`db:audit` + strict + citable-reports + readiness) exits 0. |
| `npm run research:citation-readiness-queue` | passed | Down to 1 row: P0 0, P1 0, **P2 1**, P3 0 (the intentionally-blocked `agrianalyse-bondens-andel-2025`). |
| `npm run research:citable-acceptance-pack` | passed | 7 of 12 cite-ready, 5 fail-closed blocked. |
| `npm run build` | passed | Prisma + metrics + Next.js build; timestamp/property-count metric diffs reverted (pre-existing drift, not this fix). |
| `git diff --check` | passed | No whitespace errors. |

Current strict citation coverage (supersedes the PR #60/#61 counts below):

- `SourceCitation=2699`
- `citable_external=154`
- `citable_with_note=2433`
- `internal_context=112`
- `blocked_unsourced=0`
- `FieldCitation=244517`
- external blocking citation issues `0`

## Standard Operator Sequence

Run this sequence before claiming the knowledge base is externally citable:

```bash
npm test
npm run lint
npm run db:audit
npm run db:audit:strict-sources
npm run audit:citable-reports
npm run research:citation-readiness-queue
npm run research:citable-acceptance-pack
npm run build
```

Current note: PR #60 and PR #61 are merged to `main`. `npm run
db:audit:strict-sources` now passes after citation coverage remediation and the
post-merge internal-marker fix. The readiness queue now tracks 1 P2 residual
report row: the intentionally blocked `agrianalyse-bondens-andel-2025` source.
The 10 internal/composite/register reports without a single URL are reviewed
sourceUrl exceptions because they have explicit `provenanceType` and
`supportingSources` bibliographies. These are not strict external-citation
blockers.

## Current Main Verification After PR #60 And PR #61

This section supersedes the historical milestone counts below.

| Command | Result | Notes |
|---|---:|---|
| `git status --short --branch` | expected clean after commit | Branch is `main`; rerun after checkout to verify no local drift. |
| `npm test` | passed | 176 tests passed across 40 suites. |
| `npm run lint` | passed | ESLint completed without reported issues. |
| `npm run db:refresh:source-citation-readiness` | passed | 2,698 `SourceCitation` rows scanned, 0 rows to update. |
| `npm run db:audit` | passed | Enforced integrity checks passed; warnings remain documented below. |
| `npm run db:audit:strict-sources` | passed | Strict source/citation gate exits 0. |
| `npm run audit:citable` | passed | `db:audit`, strict `audit:citations`, citable report audit, and queue export all completed with exit 0. |
| `npm run research:citable-acceptance-pack` | passed | Regenerated acceptance artifacts; 7 of 12 answers are cite-ready and 5 are fail-closed blocked. |
| `npm run graph:audit` | passed | 41,072 nodes, 1,641 edges, 0 orphan board-member graph rows, 187 board-member profile gaps, 34.8 percent edge confidence. |
| `npm run build` | passed | Prisma generation, chart metric computation, TypeScript, and Next.js production build passed; timestamp-only chart-metric diffs were cleaned afterwards. |
| `git diff --check` | passed | No whitespace errors reported. |

Current strict citation coverage:

- `SourceCitation=2698`
- `citable_external=153`
- `citable_with_note=2433`
- `internal_context=112`
- `blocked_unsourced=0`
- `FieldCitation=244517`
- external blocking citation issues `0`

Post-merge DB note: syncing `main` and applying the source-citation backfill
added 83 `SourceCitation` rows and 213 `FieldCitation` rows from existing
locators only. A follow-up strict audit found 36 internal
`source:blocked-unsourced/...` marker citations that had been backfilled as
primary/blocked rows. PR #61 fixed the backfill rule and refresh repair path;
the local repair moved those 36 rows to `internal_context`.

Current residual work queue:

- Citation readiness queue: P0 0, P1 0, P2 1, P3 0.
- Remediation backlog: 472 findings total: 0 HIGH, 1 MEDIUM finding, and
  471 LOW findings. SourceDoc locator findings are 0. The former five HIGH
  URL-health blockers are closed in `research/URL-HEALTH-REVIEW.csv` as
  browser-verified tool blocks, citable mirror/local evidence cases, or both;
  the original source URLs were not replaced. The former 18 MEDIUM
  HTML-to-Markdown rows are closed by Markdown companions. Four of the former
  five scanned-PDF MEDIUM rows are closed by `research/PDF-OCR-REVIEW.csv`;
  the remaining MEDIUM row is the 1 KB RASTECH PDF that OCR skipped as likely
  corrupt.
- Graph quality: technical graph audit passes. Board-member graph orphans are
  0 after fallback person nodes; 187 board-member rows still lack full
  `PersonProfile` pages. Edge-confidence coverage is 34.8 percent.

Continuation verification after residual URL/HTML/OCR review:

- `npm test` passed with 181 tests across 42 suites.
- `npm run lint` passed.
- `npm run db:audit:strict-sources` passed.
- `npm run audit:citable` passed and kept the readiness queue at P0 0, P1 0,
  P2 1, P3 0.
- `npm run research:citable-acceptance-pack` passed with 7 of 12 cite-ready and
  5 blocked.
- `npm run graph:audit` passed with 41,072 nodes, 1,641 edges, 0 orphan
  board-member rows, 187 board-member profile gaps, and 34.8 percent edge
  confidence coverage.
- `npm run build` passed with the known worktree multiple-lockfile warning;
  timestamp-only chart-metric diffs were cleaned afterwards.
- `git diff --check` passed.

## Baseline Commands

| Command | Result | Notes |
|---|---:|---|
| `npm install` | passed | 746 packages installed in the fresh worktree, 0 vulnerabilities reported. |
| `npm test` | passed | 100 tests passed. |
| `npm run db:generate` | passed | Required in the fresh worktree because `src/generated/prisma` is ignored. |
| `npm run db:audit` | passed with warnings | All enforced integrity checks passed. |
| `npm run db:audit:strict-sources` | failed as expected | 3 enforced source violations, matching the known strict-source groups after local ignored evidence files were synced into the worktree. |
| `npm run graph:audit` | passed | Technical graph integrity passed. Practical graph coverage remains weak. |

Fresh-worktree setup note: the first `db:audit` failed because the generated
Prisma client was absent. After `npm run db:generate`, the next audit failed
because ignored local `.env`, `.env.local`, and local research evidence files
were not present in the worktree. Those local setup files were copied/synced
from the original checkout without changing tracked source files.

## Milestone Verification After Tasks 1-4

| Command | Result | Notes |
|---|---:|---|
| `npm test` | passed | 122 tests passed across 27 suites. |
| `npm run lint` | passed | ESLint completed without reported issues. |
| `npm run db:audit` | passed with warnings | Integrity gates passed; quality warnings remain. |
| `npm run db:audit:strict-sources` | failed as expected | Same 3 strict-source groups remain; no new blocker group was introduced. |
| `npm run graph:audit` | passed | 40,885 nodes, 1,076 edges, 39,976 isolated nodes, 0.6 percent edge confidence. |
| `npm run build` | passed | Build completed; Next.js warned about multiple lockfiles/root inference in the worktree. |
| `git diff --check` | passed | No whitespace errors reported. |

## Milestone Verification After Tasks 5-7

| Command | Result | Notes |
|---|---:|---|
| `npm run db:backfill:source-citations` | passed | Dry-run wrote `research/citation-backfill-preview-2026-05-20.csv` and left counts unchanged at `SourceCitation=71`, `FieldCitation=1286`. |
| `npm run db:backfill:source-citations:apply` | passed | Created 2,544 `SourceCitation` rows and 243,018 `FieldCitation` rows from existing locators only. |
| second `npm run db:backfill:source-citations:apply` | passed | Historical checkpoint idempotence check: 0 source citations and 0 field citations to create. Counts stayed at `SourceCitation=2615`, `FieldCitation=244304` before the later post-merge backfill added more rows. |
| `npm test -- tests/lib/citation-audit.test.ts tests/lib/source-quality-audit.test.ts` | passed | Full test runner reported 131 tests passing. |
| `npm run db:audit` | passed with warnings | New `Citation Coverage` section is present; standard mode remains non-failing. |
| `npm run db:audit:strict-sources` | failed as expected | Now fails on 5 enforced groups: the 3 source-label groups plus citation coverage blockers. |
| `npm run research:citation-readiness-queue` | passed | Wrote `research/citation-readiness-queue-2026-05-20.csv` with 2,184 rows: 2,174 P0 and 10 P2. |

## Milestone Verification After Task 8

| Command | Result | Notes |
|---|---:|---|
| `npm test -- tests/lib/row-source-locators.test.ts tests/lib/source-quality-audit.test.ts` | passed | Full test runner reported 138 tests passing. |
| `npm run research:source-gap-queue` | passed | Wrote `research/_status/strict-source-gap-queue.json` with 0 groups and 0 rows. |
| `npm run research:citation-readiness-queue` | passed | Wrote `research/citation-readiness-queue-2026-05-20.csv` with 1,974 rows: 1,964 P0 and 10 P2. |
| `npm run db:audit` | passed with warnings | Source Quality Coverage is now 100 percent direct URL/DOI/internal/resolved locator for `CompanyFinancial`, `BusinessRelationship`, and `CountryMetric`; citation coverage warnings remain. |
| `npm run db:audit:strict-sources` | failed as expected | Source-label strict groups are closed. The strict gate now fails only on 2 citation coverage violations: 1,963 externally relevant blocked `FieldCitation` rows and 10 external blocking audit issues. |
| `npm run lint` | passed | ESLint completed without reported issues. |
| `npm run build` | passed | Prisma generation, chart metric computation, TypeScript, and Next.js production build passed; Next.js repeated the known multiple-lockfile/worktree-root warning. |
| `git diff --check` | passed | No whitespace errors reported. |

[Excerpt clipped for NotebookLM retrieval quality. See source path for full file.]
````

### research/_status/food-tg-r13/r13-intake-index-2026-06-25.md

````markdown
# Food TG R13 — intern mottaks-/triageindeks

Denne indeksen grupperer Runde 13-prompter etter mottaksstatus. Den bygger på `research/_status/food-tg-r13/report-batch-*.md` og `research/_status/food-tg-r13/decisions/batch-*.jsonl`. Ingen batch-output endres her — indeksen er kun et triagekart.

> **Slik fylles den:** etter hver fullført batch legges hver prompt-ID inn i riktig(e) gruppe(r) nedenfor med kolonnene `ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt`. En prompt kan stå i flere grupper når den har både en hovedgate og en stop-regel (f.eks. PCQ + må ikke visualiseres ennå). Oppdater også Kontrollstatus og Hurtigoppsummering.

## Kontrollstatus

- **Promptrader indeksert:** 50 / 50
- **Decision-batcher funnet:** batch-01 (R13-GAP-001, R13-GAP-005, R13-WASTE-001, R13-GAP-002), batch-02 (R13-GAP-004, R13-GAP-006, R13-GAP-003, R13-WASTE-002), batch-03 (R13-WASTE-003, R13-WASTE-004, R13-WASTE-005, R13-WASTE-007), batch-04 (R13-WASTE-006, R13-WASTE-008, R13-PROT-006, R13-PROT-007), batch-05 (R13-PROT-001, R13-PROT-002, R13-PROT-003, R13-PROT-004), batch-06 (R13-PROT-005, R13-AKTOR-001, R13-AKTOR-002, R13-AKTOR-003), batch-07 (R13-AKTOR-004, R13-AKTOR-005, R13-AKTOR-006, R13-AKTOR-007), batch-08 (R13-AKTOR-008, R13-PROT-008, R13-INNO-001, R13-INNO-002), batch-09 (R13-INNO-003, R13-INNO-004, R13-INNO-005, R13-INNO-006), batch-10 (R13-INNO-007, R13-OKO-001, R13-OKO-002, R13-OKO-003), batch-11 (R13-OKO-004, R13-OKO-005, R13-OKO-006, R13-OKO-007), batch-12 (R13-LAND-001, R13-LAND-002, R13-LAND-003, R13-LAND-004), batch-13 (R13-LAND-005, R13-LAND-006)
- **Batcher ikke funnet som decision/report-fil:** batch-13 (ikke startet)
- **Arbeidsregel:** alle rader er interne mottaks-/triageposter; ingen rad åpner ekstern claim, DB-skriving, `safe_for_ai_context`, whitepapertekst eller deckstemme.
- **Overlapp:** samme prompt kan ligge i flere grupper når den både har en hovedgate og en stop-regel.

## Hurtigoppsummering

| Gruppe | Antall | Bruk |
|---|---:|---|
| PCQ-ready | 14 | klar for primary-check queue / kontrollert uttrekk før eventuell claim-lock |
| source-shortlist | 24 | klar som kilde-/metodekandidat, ikke claim |
| claim-lock candidate | 1 | kun svært smal formulering kan vurderes etter PCQ |
| actor-gate | 8 | krever aktørdata, verifikasjon, kontrakt, avregning eller aktiv-status |
| forstaelse | 4 | bakgrunn/hypotese/mental modell; ikke faktastemme |
| internal only | 3 | intern modell, datakontrakt, funding-fit eller uttakskø |
| parkert | 1 | hele eller sentrale claims stoppet inntil ny locator/aktor/data finnes |
| må ikke visualiseres ennå | 46 | ikke lag ekstern figur/radar/rangering/deckuttak før gate og tomme celler vises |

## PCQ-ready

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-001 | 01 | Kritiske importnoder | PCQ | SSB 08801 gir Type-A importtidsserie 2020–2024 (volum+verdi separat) for soya/fiskeolje/kaffe/kakao; fosfat ≈0 råimport (P via NPK); fôrprotein-total er Type-C metodeluke. | importer (PCQ; speil holdt ute) | research/external/r13/R13-GAP-001-kritiske-importnoder.md |
| R13-GAP-005 | 01 | Verifisering av 7 parkerte R12-claims | PCQ | 3 løftbare m/caveat (REKO 2022, andelslandbruk 93/2023, Rest-konkurs 2024), 1 delvis (fiskeolje), 3 parkert/nedgradert (ASKO 70 %, SOIL-score, Plantagon). | claim-lock-kandidat for smale rader; verifiser per claim | research/external/r13/R13-GAP-005-parkerte-claims-verifisering.md |
| R13-WASTE-001 | 01 | Marint restråstoff R-stige | PCQ | SINTEF/FHF fulltekst: ~1,1 mill. t, 89 % utnyttet, men kun ~15 % humant konsum vs 66 % fôr / ~19 % energi — utnyttet ≠ høyverdi. | importer (PCQ) | research/external/r13/R13-WASTE-001-marint-restrastoff-rstige.md |
| R13-WASTE-002 | 02 | Oppdrettsslam massebalanse | PCQ | Offentlige tall er modellerte utslipp (535 412 t slam / 14 000 t P, 2019); innsamlet/behandlet kun fragmenter; åpne merder samler ~0. Ingen 3-kolonners anleggsbalanse i åpne kilder. | vent — parkert til actor/primærdata (se også parkert) | research/external/r13/R13-WASTE-002-oppdrettsslam-massebalanse.md |
| R13-WASTE-004 | 03 | Husholdnings- og detaljmatsvinn | PCQ | NORSUS/Matvett OR.16.24 (husholdning 2023: 193 200 tonn) og OR.28.25 (dagligvare 2024: 43 600 tonn); bransjeavtale og matsvinnlov primærkilder. A-klasse med C-gap (husholdning 2024 mangler, matindustri kun t.o.m. 2022). | importer med synlige caveater og tomme 2024-celler | research/external/r13/R13-WASTE-004-husholdning-detalj-matsvinn.md |
| R13-WASTE-005 | 03 | Digestat NPK-retur | PCQ | Sverige A (SPCR 120 2023: Tot-N ~5,1 / P ~0,60 / K ~2,1 kg/tonn); Norge B/C — ingen nasjonal aggregering, strukturelt hull. | aktørspørsmål til Biogass Norge/NIBIO | research/external/r13/R13-WASTE-005-digestat-npk-retur.md |
| R13-PROT-006 | 04 | Soya/SPC-erstatning i fôr | PCQ | SPC dominerer (~21 % av fôr 2020, Nofima/FHF A-kilde). Fiskemjøl ned fra 65 % (1990) til 12 % (2020). All SPC ProTerra/RTRS-sertifisert via Denofa. Ingen offentlig ressursregnskap etter 2020. | vent — hent nyere Nofima/FHF ressursregnskap 2022/2023 | research/external/r13/R13-PROT-006-soya-erstatning-for.md |
| R13-PROT-007 | 04 | Proteinselvforsyning Norge | PCQ | Rå 41,3 % / fôrkorrigert 34,9 % (2024, energibasis, A). Protein-gram-serie mangler offisiell beregning (C). Fôrkorrigert ekskluderer fiskefôr — strukturelt hull. | vent — aktørspørsmål til NIBIO om protein-gram-serie og akvakulturfôr-korreksjon | research/external/r13/R13-PROT-007-proteinselvforsyning.md |
| R13-AKTOR-006 | 07 | Eierskap og founders i sirkulær/altprotein/CEA | PCQ | Brreg rolledata (A) for 8 aktører: Invertapro, NorInsect, Vestkorn, NoMy, Avisomo, Onna, Vertical Agri. Rest AS bekreftet slettet (konkurs 2024-09-05). Gruten AS ikke funnet. Aksjonærregister C-celle systematisk. | vent — Proff Forvalt/Skatteetaten for aksjonærdata; dsm-firmenich årsrapport for Vestkorn | research/external/r13/R13-AKTOR-006-eierskap-founders.md |
| R13-OKO-001 | 10 | Økologisk areal og produksjon i Norge | PCQ | Norsk øko-areal stabilt ~4,3–4,5 % (2024, inkl. karens), vedvarende nedgang i produsentantall siden 2011–2012. 10%-mål 2032 krever dobling. Øko-salg +17,6 % 2025, men norsk melkeproduksjon faller. Import-vs-norsk andel: C. | **importer** med synlige tomme celler (godkjent/karens-skille; import/norsk) — Debio statistikkhefte 2025 er sterkeste A-kilde | research/external/r13/R13-OKO-001-okologisk-areal-produksjon.md |
| R13-OKO-003 | 10 | Jordhelse og karbon i jord: måleprogrammer og baseline | PCQ | Norge mangler nasjonal SOC-baseline for jordbruksjord. JordVAAK oppstartet 2026, første analyse tidligst ~2036. UNFCCC-karbontall er Tier 1/2-modellert, ikke direkte målt. 39 % av jordbruksareal mangler jordsmonnskart. | vent — JordVAAK tidligst 2029; NIBIO jordsmonnskart (61 % dekning) kan brukes som proxy med caveat | research/external/r13/R13-OKO-003-jordhelse-karbon.md |
| R13-OKO-007 | 11 | Policy-mål for økologi og bærekraft: nasjonale mål, EU F2F og måloppnåelse | PCQ | Riksrevisjonen (jun. 2025): klimamål IKKE i rute. Jordvernmål nådd 2025 (1 763 daa, foreløpig). Øko-areal 4,6 % mot 10 %-mål 2032. Selvforsyning ~40 % mot vedtatt mål 50 %. EU F2F ikke EØS-innlemmet. | **importer** med synlige tomme celler (matsvinn ekskl. primærjordbruk; selvforsyningsprognose; pollinatorbestandsmål) | research/external/r13/R13-OKO-007-policy-mal-okologi.md |
| R13-LAND-001 | 12 | Makt- og eierkonsentrasjon — dagligvare, grossist, foredling og fôr | PCQ | KT Dagligvarerapport 2024 (A): NG 43,5 %, Coop 29,2 %, REMA 23,9 %, Bunnpris 3,3 %. Nortura ~65–70 % rødkjøtt, Tine ~72,9 % melk (2023, A). Grossistprosenter: C. Fiskefôr 2024: C. Kraftfôrandel: C. | **importer** med synlige C-celler (grossistprosenter, fiskefôr, Tine 2024, kraftfôrandel) — KT-rapporten er sterkeste A-kilde | research/external/r13/R13-LAND-001-makt-eierkonsentrasjon.md |
| R13-LAND-002 | 12 | Vertikal integrasjon og kontroll i norsk matsystem | PCQ | 28 integrasjonskoblinger dokumentert fra årsrapporter: NG (ASKO, UNIL, BAMA 46 %), Coop (industri, logistikk), Reitan (Norsk Kylling 100 %, Stange Gård 95 %), Nortura, Tine, Mowi (rogn-til-pakke), FK (Norgesmøllene 2025). 6 tomme celler. | **importer** med 6 navngitte PCQ-tomme celler (Fjordland, Banan II, REMA Distr., Pronofa, Nova Sea, Kaffebrenneriet) | research/external/r13/R13-LAND-002-vertikal-integrasjon.md |

[Excerpt clipped for NotebookLM retrieval quality. See source path for full file.]
````

