# Data Quality Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the critical audit findings into small, testable data-quality hardening slices instead of continuing ad hoc source cleanup.

**Architecture:** Start with guardrails that prevent new malformed research queues, then use those queues to close strict source gaps, and finally improve graph usefulness by linking documents, insights, companies, and people. Each slice must leave a measurable command behind.

**Tech Stack:** Next.js 16, TypeScript, Node test runner, Prisma 7, PostgreSQL, npm.

---

## File Structure

- Create: `src/lib/download-backlog-validation.ts` for reusable validation of `research/evidence-pack/download-backlog*.csv`.
- Create: `tests/lib/download-backlog-validation.test.ts` for RED/GREEN coverage of invalid comment rows, invalid statuses, duplicate target paths, and clean rows.
- Create: `scripts/validate-download-backlogs.ts` as the command-line gate for all download-backlog CSVs.
- Modify: `package.json` to add `research:validate-download-backlogs`.
- Modify: malformed `research/evidence-pack/download-backlog*.csv` files only when the validator identifies deterministic format problems.
- Later slices:
  - Modify: `src/lib/row-source-locators.ts`, `tests/lib/row-source-locators.test.ts`, and targeted import scripts to close strict source gaps.
  - Modify: `scripts/link-insights-to-docs.ts`, `scripts/link-companies-to-docs.ts`, and tests or review artifacts to increase graph edge coverage.

## Task 1: Guardrail For Download-Backlog CSV Quality

- [x] **Step 1: Write failing tests**

Create `tests/lib/download-backlog-validation.test.ts` with tests that require:

```ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { validateDownloadBacklogCsv } from '../../src/lib/download-backlog-validation'

describe('download backlog validation', () => {
  it('rejects section headings parsed as CSV rows', () => {
    const result = validateDownloadBacklogCsv(
      'priority,status,country,theme,doc_type,institution,title,year,url,url_type,current_local_status,target_path,next_action,source_basis\n' +
        '# === SECTION ===,,,,,,,,,,,,,\n',
      'research/evidence-pack/download-backlog-demo.csv',
    )

    assert.equal(result.valid, false)
    assert.match(result.issues[0].message, /section heading/)
  })

  it('rejects unknown status values', () => {
    const result = validateDownloadBacklogCsv(
      'priority,status,country,theme,doc_type,institution,title,year,url,url_type,current_local_status,target_path,next_action,source_basis\n' +
        'P1,vertical farming,NO,theme,report,Inst,Title,2026,https://example.com,landing_html,not_downloaded,research/x.pdf,fetch,seed\n',
      'research/evidence-pack/download-backlog-demo.csv',
    )

    assert.equal(result.valid, false)
    assert.match(result.issues[0].message, /invalid status/)
  })

  it('accepts canonical active rows', () => {
    const result = validateDownloadBacklogCsv(
      'priority,status,country,theme,doc_type,institution,title,year,url,url_type,current_local_status,target_path,next_action,source_basis\n' +
        'P1,url_only,NO,theme,report,Inst,Title,2026,https://example.com,landing_html,not_downloaded,research/x.pdf,fetch,seed\n',
      'research/evidence-pack/download-backlog-demo.csv',
    )

    assert.equal(result.valid, true)
    assert.deepEqual(result.issues, [])
  })
})
```

Run:

```bash
npm test -- tests/lib/download-backlog-validation.test.ts
```

Expected: fails because `src/lib/download-backlog-validation.ts` does not exist.

- [x] **Step 2: Implement the validator**

Create `src/lib/download-backlog-validation.ts` with:

- required header equality for the 14 canonical columns
- allowed `priority`: `P0`, `P1`, `P2`, `P3`
- allowed `status`: `downloaded`, `url_only`, `missing_metadata_only`, `requires_manual`, `exa_fetched`
- allowed blank `status` only when the entire row is blank, not for active rows
- rejection of rows where `priority` starts with `#`
- duplicate URL and target-path warnings for active rows
- row-numbered issues

Run:

```bash
npm test -- tests/lib/download-backlog-validation.test.ts
```

Expected: test file passes.

- [x] **Step 3: Add command-line gate**

Create `scripts/validate-download-backlogs.ts` that loads every `research/evidence-pack/download-backlog*.csv`, runs `validateDownloadBacklogCsv`, prints row-numbered issues, and exits 1 on errors.

Modify `package.json`:

```json
"research:validate-download-backlogs": "tsx scripts/validate-download-backlogs.ts"
```

Run:

```bash
npm run research:validate-download-backlogs
```

Expected before data cleanup: fails and lists the malformed backlog rows found in the audit.

- [x] **Step 4: Clean deterministic CSV format defects**

For each `download-backlog*.csv` file, remove section-heading pseudo-rows such as:

```csv
# === EIENDOMSMAKT — underliggende kilder ===,,,,,,,,,,,,,
```

Do not delete real source rows. Do not change `url_only`, `downloaded`, or `missing_metadata_only` rows unless the validator identifies a column shift caused by malformed CSV structure.

Run:

```bash
npm run research:validate-download-backlogs
```

Expected: no invalid header, section-heading, or invalid-status errors remain. Duplicate URL/target warnings may remain if they represent deliberate duplicates and are reported as warnings only.

## Task 2: Strict Source-Gap Work Queue

- [x] **Step 1: Refresh strict baseline**

Run:

```bash
npm run db:audit:strict-sources
```

Result: strict audit remains non-zero until the remaining source gaps close, but the smallest row classes were isolated first. After the ownership/property corrections below, the remaining strict categories are:

- `CompanyFinancial.source`: 131 label-only rows
- `BusinessRelationship.source`: 39 label-only rows
- `CountryMetric.source`: 213 label-only rows
- `Shareholder.source`: 28 missing rows
- `BoardMember.source`: 146 missing rows
- `Shareholder.verifiedAt`: 28 missing rows
- `BoardMember.verifiedAt`: 146 missing rows

- [x] **Step 2: Close smallest high-value row classes**

Prioritize rows where a direct official locator already exists or can be matched mechanically:

1. `CompanyOwnership.source` 2 label-only rows
2. `CompanyProperty.source` 19 label-only rows

Result:

- `CompanyOwnership.source` is now 12/12 direct URL/resolved locator. The two Reitan rows were not only missing locators; they mixed direct and indirect ownership, so the importer and live DB were corrected to use REMA 1000 Norge AS as the direct parent.
- `CompanyProperty.source` is now 86/86 direct URL/resolved locator. Several office rows also had stale addresses, so official contact/source pages and the live DB were corrected for ICA, Axfood, Kesko, Samkaup, and Reitan Retail.
- Regression coverage was added before changing import/source-locator behavior.

- [x] **Step 3: Export strict source-gap queue**

Create a grouped work queue so remaining source problems are not handled ad hoc.

Run:

```bash
npm run research:source-gap-queue
```

Result: wrote `research/_status/strict-source-gap-queue.json` with 168 groups and 557 unresolved row-level issues.

- [x] **Step 4: Continue with person/source provenance**

Next priority rows:

1. `Shareholder` 28 missing source rows and 28 missing `verifiedAt` rows
2. `BoardMember` 146 missing source rows and 146 missing `verifiedAt` rows
3. `CompanyFinancial.source` annual-report label-only rows
4. `CountryMetric.source` estimates/derived metrics
5. `BusinessRelationship.source` vague `Bransjedata` rows

For each class, add or extend a failing test before changing locators or import scripts.

Status note: a targeted dry-run of `scripts/enrich-offentligdata.ts --companies-only --dry-run` against the Norwegian companies with missing board provenance shows BRREG can verify many Norwegian board-role rows. This should be run as a separate DB update slice because it also refreshes company metadata and may add registry roles. Nordic non-Norwegian companies still need separate registry/annual-report source strategies.

2026-05-19 continuation result:

- BRREG company-role enrichment was run for the Norwegian companies with missing board provenance.
- Added a guarded pruning helper and `db:prune:unverified-board-members` so only completely unsourced seed `BoardMember` rows are removed, and only when direct BRREG-sourced replacements exist.
- Pruned 40 unverified Norwegian seed board-member rows. `BoardMember.source` and `BoardMember.verifiedAt` missing counts fell from 146 to 106.
- `research:source-gap-queue` now writes 168 groups / 517 rows, down from 557 rows.
- A shareholder locator diagnostic found 0/28 missing shareholder rows mechanically resolvable with the current locator set, so shareholder provenance still needs a separate official annual-report / registry sourcing slice.

2026-05-19 later continuation result:

- Added annual-report provenance resolution for checked Nordic board-member rows and ran `db:backfill:board-member-provenance`, updating 54 board-member rows. `BoardMember.source` and `BoardMember.verifiedAt` missing counts fell from 106 to 52.
- Added checked shareholder provenance mappings and reran `db:backfill:shareholder-provenance`, reducing missing shareholder source/verification rows from 28 to 22.
- Added exact `CountryMetric` source locators only where local documents or official statistics endpoints were verified: internal market-share derivation, Totalkalkylen/SSB, PTY Finnish grocery statistics, Regjeringen R15-2023 / NielsenIQ, SSB arealstatistikk, LUKE foreign-trade PXWeb, and Swedish food-waste per-capita statistics.
- Deliberately left ambiguous or mismatched labels unresolved, including `Nielsen/Dagligvarehandelen`, Swedish `Konkurrensverket 2023`, Icelandic estimate/proxy labels, and shared labels where the metric type did not match the checked source.
- `research:source-gap-queue` now writes 154 groups / 416 rows, down from 168 groups / 557 rows at the first queue baseline.

2026-05-19 latest continuation result:

- Added a narrow Brønnøysund Regnskapsregisteret resolver for Norwegian `CompanyFinancial` rows whose source is exactly `Regnskap YYYY` or `Proff.no YYYY`; the resolver uses the row's accounting year and does not map annual-report/consolidated group labels.
- Added checked Matvett/NORSUS source locators for the exact Norwegian food-waste labels `Matvett/SSB 2021`, `Matvett/Eurostat 2021`, `Matvett/SSB 2023`, `Matvett/Eurostat 2023`, `Matvett/SSB 2025 est.`, and `Matvett 2025 est.`.
- Left older/broader food-waste labels such as `ForMat 2016` unresolved until a direct, checked source URL or document reference is selected.
- `npm test -- tests/lib/row-source-locators.test.ts` now passes all 93 tests.
- `research:source-gap-queue` now writes 145 groups / 394 rows. `CountryMetric.source` improved to 252/414 direct/resolved locators, and `CompanyFinancial.source` improved to 24/151 direct/resolved locators.
- `db:audit:strict-sources` still intentionally exits non-zero with 7 enforced violations: `CompanyFinancial.source` 127 label-only, `BusinessRelationship.source` 33 label-only, `CountryMetric.source` 162 label-only, `Shareholder.source` 22 missing, `BoardMember.source` 52 missing, plus matching `verifiedAt` gaps for `Shareholder` and `BoardMember`.

2026-05-19 further continuation result:

- Added checked `CountryMetric` locators for `LUKE/Eurostat 2021`, `LUKE/Eurostat 2023`, and `PTY/NielsenIQ 2023`.
- Deliberately left `Umhverfisstofnun/Eurostat 2021` and `Umhverfisstofnun/Eurostat 2023` unresolved: the live Eurostat `env_wasfw` API returned no Iceland values for the checked filters, and the checked Umhverfisstofnun 2022 report has a different total kg/inhabitant level than the runtime rows.
- Added a checked `BusinessRelationship` locator for the exact Gartnerhallen SA -> BAMA Gruppen AS `gartnerhallen.no` row, while keeping the non-BAMA Gartnerhallen relationship unresolved.
- Added official annual-report locators for checked `CompanyFinancial` rows: Mowi 2020-2023, Yara 2020-2023, Austevoll Seafood 2022-2023, and Axfood 2020-2023.
- `npm test -- tests/lib/row-source-locators.test.ts` now passes all 94 tests.
- `research:source-gap-queue` now writes 127 groups / 373 rows. `CompanyFinancial.source` improved to 38/151 direct/resolved locators, `CountryMetric.source` improved to 258/414, and `BusinessRelationship.source` improved to 18/50.
- `db:audit:strict-sources` still intentionally exits non-zero with 7 enforced violations: `CompanyFinancial.source` 113 label-only, `BusinessRelationship.source` 32 label-only, `CountryMetric.source` 156 label-only, `Shareholder.source` 22 missing, `BoardMember.source` 52 missing, plus matching `verifiedAt` gaps for `Shareholder` and `BoardMember`.

2026-05-19 current continuation result:

- Added checked historical annual-report locators for high-volume `CompanyFinancial` rows:
  - Norwegian groups: NorgesGruppen 2020-2023, Coop Norge 2021-2023, Reitan Retail 2021-2023, Orkla 2020-2023, Nortura 2020-2023, TINE 2020-2023, Felleskjøpet 2020-2023, BAMA 2020-2023, SalMar 2020-2023, and Lerøy 2020-2023.
  - Nordic groups: Coop Danmark 2020-2023, Coop Sverige/KF 2020-2024, Dagrofa 2020-2023, Hagar 2020-2023, ICA Gruppen 2020-2023, Kesko 2020-2023, Nofima 2020-2023, Salling Group 2020-2023, and SOK/S Group 2020-2023.
- Left `Coop Norge Årsrapport 2020` and `Reitan Retail Årsrapport 2020` unresolved because no sufficiently exact official URL was found in this pass.
- Deliberately left remaining `CompanyFinancial` estimates unresolved. These include ASKO aggregate estimates, retailer-market-share derived REMA/Lidl/Samkaup/Festi estimates, and `Estimat basert på bransjedata` rows for BAMA/Skretting.
- Rechecked the remaining `CountryMetric` and `BusinessRelationship` queue. The rest is not safely closable as pure resolver rules in the same way: several candidate labels are broad (`Nielsen/Dagligvarehandelen`, `Bransjedata`, `Sjømatrådet`), estimated (`*. est.`), composite (`SSB/Sjømatrådet`, `Årsrapporter 2024, Konkurransetilsynet verdikjedestudie`), or value-mismatched against the first direct source candidates (`Konkurrensverket 2023`, older ForMat/Matvett labels).
- `npm test -- tests/lib/row-source-locators.test.ts` passes all 94 tests.
- `research:source-gap-queue` now writes 87 groups / 298 rows. `CompanyFinancial.source` improved to 113/151 direct/resolved locators, with 38 label-only rows left.
- `db:audit:strict-sources` still intentionally exits non-zero with 7 enforced violations: `CompanyFinancial.source` 38 label-only, `BusinessRelationship.source` 32 label-only, `CountryMetric.source` 156 label-only, `Shareholder.source` 22 missing, `BoardMember.source` 52 missing, plus matching `verifiedAt` gaps for `Shareholder` and `BoardMember`.

2026-05-19 shareholder provenance continuation result:

- Added checked direct shareholder locators for 10 remaining rows: BioMar/Schouw, Cermaq/Mitsubishi, Coop Sverige/KF, Dagrofa/NorgesGruppen, Nofima state/stiftelse ownership, Norges Sjømatråd state ownership, Skretting/Nutreco-SHV, Kavli foundation ownership, and Matvett/DLF.
- Ran `db:backfill:shareholder-provenance`; result was 10 updated, 40 already current, and 12 unresolved.
- `research:source-gap-queue` now writes 87 groups / 288 rows, down from 298 rows.
- `Shareholder.source` and `Shareholder.verifiedAt` improved to 50/62 rows with source/verification, with 12 rows left unresolved.
- Remaining shareholder gaps are not safe mechanical mappings yet: Dagrofa KFI/købmænd, Festi Fasteign/Lífeyrissjóður, Gartnerhallen producer ownership, Grilstad Holding, Lantmännen Cerealia AB, Schwarz/Lidl Finland, Schwarz/Lidl Sweden, Oda Midco/Softbank/Kinnevik, Samkaup/Drangar, and Too Good To Go ApS.
- `db:audit:strict-sources` still intentionally exits non-zero with 7 enforced violations: `CompanyFinancial.source` 38 label-only, `BusinessRelationship.source` 32 label-only, `CountryMetric.source` 156 label-only, `Shareholder.source` 12 missing, `BoardMember.source` 52 missing, plus matching `verifiedAt` gaps for `Shareholder` and `BoardMember`.

2026-05-19 checked shareholder correction result:

- Rechecked the 12 remaining shareholder gaps against direct/current sources and separated stale data from missing provenance.
- Corrected stale seed and live DB rows where the checked source contradicted the old value or owner label:
  - Dagrofa KFI/købmænd changed from 42.0/9.1 to 42.5/8.6 per Dagrofa annual report 2024.
  - Gartnerhallen owner label changed from `1 200 frukt- og grøntprodusenter` to `Over 1000 norske grøntprodusenter`.
  - Lantmännen Cerealia AS owner label changed from `Lantmännen Cerealia AB (Sverige)` to `Lantmännen ek för`, based on the GLEIF direct-parent record.
  - Too Good To Go Norge AS owner label changed from `Too Good To Go ApS (Danmark)` to `Too Good To Go Holding ApS (Danmark)`.
  - Festi shareholder rows changed to the two checked 2024 top holders: `Lífeyrissjóður starfsmanna ríkisins` 12.9% and `Lífeyrissjóður verzlunarmanna` 12.5%.
- Added checked shareholder locators for Dagrofa KFI/købmænd, Gartnerhallen, Grilstad, Lantmännen, Too Good To Go, Lidl Sverige/Finland, Samkaup/Drangar, and the corrected Festi rows.
- Ran `db:correct:shareholder-source-data`; result was 7 stale rows corrected.
- Ran `db:backfill:shareholder-provenance`; result was 11 updated, 50 already current, and 1 unresolved.
- `research:source-gap-queue` now writes 87 groups / 277 rows, down from 288 rows.
- `Shareholder.source` and `Shareholder.verifiedAt` improved to 61/62 rows with source/verification; the only remaining shareholder gap is `Oda: Oda Midco AS / Softbank, Kinnevik m.fl.` because current checked sources do not support that broad 100% owner label as a safe single mapping.
- `db:audit:strict-sources` still intentionally exits non-zero with 7 enforced violations: `CompanyFinancial.source` 38 label-only, `BusinessRelationship.source` 32 label-only, `CountryMetric.source` 156 label-only, `Shareholder.source` 1 missing, `BoardMember.source` 52 missing, plus matching `verifiedAt` gaps for `Shareholder` and `BoardMember`.

2026-05-19 checked board-member correction result:

- Rechecked the 52 remaining `BoardMember` gaps by company. Several were stale rosters, not just missing provenance.
- Added direct annual-report URL support to the board-member provenance resolver for checked Festi and SOK/S Group sources.
- Corrected stale Festi seed/live rows from the old mixed list to the 2024 annual-report board/CEO list: Guðjón Karl Reynisson, Sigurlína Ingvarsdóttir, Guðjón Auðunsson, Hjörleifur Pálsson, Margrét Guðmundsdóttir, and Ásta S. Fjeldsted.
- Corrected stale SOK seed/live rows from the old mixed list to the 2024 SOK Executive Board list: Hannu Krook, Harri Miettinen, Kim Biskop, Nermin Hairedin, Katri Harra-Salonen, Antti Heikkinen, Veli-Matti Liimatainen, Antti Määttä, and Juha Riikola.
- Ran `db:correct:board-member-source-data`; result was 14 stale rows replaced with 15 checked rows.
- `research:source-gap-queue` now writes 87 groups / 263 rows, down from 277 rows.
- `BoardMember.source` and `BoardMember.verifiedAt` improved to 516/554 rows with source/verification; 38 board-member rows remain unresolved.
- Remaining board-member gaps are grouped under Coop Sverige AB, Dagrofa A/S, Lidl Suomi Ky, Lidl Sverige KB, REMA 1000 A/S, and Samkaup hf. These should be handled as roster-correction/registry-source slices, not blind company-level mappings.
- `db:audit:strict-sources` still intentionally exits non-zero with 7 enforced violations: `CompanyFinancial.source` 38 label-only, `BusinessRelationship.source` 32 label-only, `CountryMetric.source` 156 label-only, `Shareholder.source` 1 missing, `BoardMember.source` 38 missing, plus matching `verifiedAt` gaps for `Shareholder` and `BoardMember`.

2026-05-19 checked CompanyFinancial 2020 annual-report locator result:

- Added checked official 2020 annual-report locators for the two remaining generic `Årsrapport 2020` company-financial rows: Coop Norge SA and Reitan Retail/REITAN.
- Left ASKO aggregate estimates and market-share-derived estimates unresolved; those need data-correction or estimate-policy decisions, not blind annual-report URL mappings.
- `research:source-gap-queue` now writes 86 groups / 261 rows, down from 263 rows.
- `CompanyFinancial.source` improved to 115/151 rows with direct/resolved locators; 36 label-only company-financial rows remain.
- `db:audit:strict-sources` still intentionally exits non-zero with 7 enforced violations: `CompanyFinancial.source` 36 label-only, `BusinessRelationship.source` 32 label-only, `CountryMetric.source` 156 label-only, `Shareholder.source` 1 missing, `BoardMember.source` 38 missing, plus matching `verifiedAt` gaps for `Shareholder` and `BoardMember`.

2026-05-19 checked Oda shareholder correction result:

- Replaced the stale/broad Oda investor label `Oda Midco AS / Softbank, Kinnevik m.fl.` with the checked direct shareholder-register row for `Oda` / org.nr. `932256134`: `AGP Advokater AS` 100%.
- Added the checked Oda shareholder locator and kept the old broad Oda investor label explicitly unresolved in resolver tests.
- Ran `db:correct:shareholder-source-data`; result was 1 stale Oda row updated, 7 checked rows already current, and 0 skipped.
- Ran `db:backfill:shareholder-provenance`; result was 1 Oda row updated, 61 rows already current, and 0 unresolved.
- `research:source-gap-queue` now writes 85 groups / 260 rows, down from 261 rows.
- `Shareholder.source` and `Shareholder.verifiedAt` are now fully closed at 62/62 rows with source/verification.
- `db:audit:strict-sources` still intentionally exits non-zero, now with 5 enforced violations: `CompanyFinancial.source` 36 label-only, `BusinessRelationship.source` 32 label-only, `CountryMetric.source` 156 label-only, `BoardMember.source` 38 missing, and `BoardMember.verifiedAt` 38 missing.

2026-05-19 final checked board-member provenance result:

- Closed the remaining `BoardMember` source/verification gaps as checked roster-correction slices, not blind company-level mappings.
- Added/kept checked direct board-member source locators for Dagrofa A/S, REMA 1000 A/S, Lidl Suomi Ky, Samkaup hf, Coop Sverige AB, and Lidl Sverige KB.
- Corrected stale board/management rosters in seed data and live DB for Dagrofa, REMA 1000 A/S, Lidl Suomi, Samkaup, Coop Sverige, and Lidl Sverige.
- Source labels now distinguish official annual reports, official leadership/board pages, the Lidl Sweden sustainability report, and the Swedish public company register view via Krafman.
- Ran `db:correct:board-member-source-data` after a dry-run; final run replaced 57 old rows with 64 checked rows and skipped 0 rows.
- `research:source-gap-queue` now writes 84 groups / 222 rows, down from 85 groups / 260 rows before the Oda and final board-member closures.
- `BoardMember.source` and `BoardMember.verifiedAt` are now fully closed at 565/565 rows with direct/resolved source locators and verification timestamps.
- `db:audit:strict-sources` still intentionally exits non-zero, now with only 3 enforced violations: `CompanyFinancial.source` 36 label-only, `BusinessRelationship.source` 32 label-only, and `CountryMetric.source` 156 label-only.

2026-05-19 checked historical food-waste correction result:

- Rechecked the old Norwegian `ForMat 2016` and `Matvett/Østfoldforskning 2018` food-waste rows against the original reports instead of adding blind source mappings.
- Corrected stale 2015 and 2017 food-waste seed/live rows to the checked report figures:
  - 2015: Husholdninger 217480, Dagligvare 60177, Matindustri 74404, Grossist 3067, Totalt 355000, and Totalt 68.7 kg/capita.
  - 2017: Husholdninger 224004, Dagligvare 51212, Matindustri 93897, Grossist 5953, Servering 9578, Totalt 385000, and Totalt 73 kg/capita.
- Removed obsolete 2015/2017 `Jordbruk` food-waste rows because they were not supported by the checked historical reports.
- Added `db:correct:food-waste-source-data`; dry-run reported 13 checked upserts and 2 obsolete deletes, and the live run completed with 13 upserted and 2 deleted.
- Added a regression test that keeps the checked historical food-waste seed values and direct report URLs from drifting back to the old label-only rows.
- Fixed `db:audit:strict-sources` row-context parity for `CountryMetric` so scoped source resolvers receive `country`, `metricType`, `category`, `year`, `source`, and `metadata`, matching the source-gap queue exporter.
- `research:source-gap-queue` now writes 80 groups / 210 rows, down from 84 groups / 222 rows before the historical food-waste correction.
- `CountryMetric.source` improved to 273/415 rows with direct/resolved locators; the strict audit now reports 142 label-only country-metric rows instead of the previous overcount of 144.

Current remaining strict-source blockers after historical food-waste correction and audit-context fix:

- `CompanyFinancial.source`: 36/151 label-only.
- `BusinessRelationship.source`: 32/50 label-only.
- `CountryMetric.source`: 142/415 label-only.

Current source-queue assessment:

- The remaining `CompanyFinancial` rows are mostly estimates: ASKO aggregate estimates, Skretting/BAMA broad bransjedata estimates, and Lidl/REMA/Samkaup/Festi market-share-derived rows. The single ASKO 2024 `Årsrapport 2024` row is not safe to close as a simple annual-report mapping because the checked public figures indicate the seeded value needs a data-correction slice.
- The remaining `BusinessRelationship` rows are mostly broad relationship labels (`Bransjedata`, `BioMar`, `Sjømatrådet`, `TGTG Partnerliste 2024`) or one-off web labels that need row-specific evidence checks before mapping.
- The remaining `CountryMetric` rows include broad market labels, estimates, composite labels, and several value-mismatched candidates. They should be handled as checked source/data-correction slices, not as bulk label-to-URL mappings.

## 2026-05-25 Close-out

The three blockers identified above were fully closed via the citable knowledge base hardening work merged in PR #62 (`food-tg/koherens-produsentseparasjon-2026-05-20`) and follow-up citable commits on main (`080b567`, `a88f8f1`, `f302ab3`, `69c432a`, `c82c831`).

Verified 2026-05-25 against current main (`ee9c805`):

- `npm run db:audit:strict-sources`: passes. `CompanyFinancial.source` 151/151 (100.0%), `BusinessRelationship.source` 50/50 (100.0%), `CountryMetric.source` 415/415 (100.0%), all other strict-source fields 100%.
- `npm run db:audit`: passes. All 14 audit sections green.
- `npm test`: 223 tests passed, 0 failures.
- Citation Coverage: `SourceCitation` 2698 rows (153 citable_external, 2433 citable_with_note, 112 internal_context, 0 blocked_unsourced); `FieldCitation` 244517 rows with 0 external blocking issues.

Plan is fully closed.

## Task 3: Graph Usefulness And Evidence Links

- [x] **Step 1: Refresh graph baseline**

Run:

```bash
npm run graph:audit
```

Result: graph integrity is clean, but usefulness is weak. Current baseline is 40,885 nodes, 955 edges, 839 connected nodes, 40,046 isolated nodes, 6/955 edges with confidence, 230 company-name duplicate groups, and 213 orphan board-member graph cases.

- [x] **Step 2: Link document-backed entities before UI work**

Use existing linker scripts and review CSVs to populate `InsightDocumentRef` and `CompanyDocumentRef` only where the match is deterministic or manually approved.

Verification command:

```bash
npm run graph:audit
```

Expected: connected node count rises and missing endpoint edges remain 0.

Result:

- Fixed the insight review/apply scripts so review CSV paths resolve from the active checkout instead of a hardcoded user directory.
- Added stale review-document ID remapping by exact unique title, because accepted review rows pointed at document IDs from an older DB snapshot.
- Applied accepted insight-document review rows: 13 `InsightDocumentRef` rows inserted; 4 accepted rows skipped because the reviewed document title was missing or ambiguous in the current DB.
- Added deterministic-only mode and internal-artifact filtering for tracked company document links, then inserted 108 `CompanyDocumentRef` rows.
- `graph:audit` now reports 40,885 nodes, 1,076 edges, 909 connected nodes, 39,976 isolated nodes, `company-ref: 108`, `insight-ref: 13`, and 0 missing endpoint edges.

## Task 4: Verification Closeout

- [x] **Step 1: Run focused tests**

```bash
npm test -- tests/lib/download-backlog-validation.test.ts tests/lib/row-source-locators.test.ts tests/lib/source-quality-audit.test.ts tests/lib/source-gap-queue.test.ts
```

- [x] **Step 2: Run standard gates**

```bash
npm test
npm run lint
npm run build
```

- [x] **Step 3: Run data gates**

```bash
npm run research:validate-download-backlogs
npm run research:source-gap-queue
npm run db:audit:strict-sources
npm run graph:audit
```

Expected: any remaining non-zero gate must be explicitly documented as the next blocker, not treated as complete.

Fresh 2026-05-19 verification:

- `npm test`: 93 tests passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run research:validate-download-backlogs`: passed with 0 errors and 40 duplicate URL/path warnings.
- `npm run research:source-gap-queue`: wrote 154 groups / 416 rows.
- `npm run graph:audit`: passed graph integrity with 0 missing endpoint edges.
- `npm run db:audit:strict-sources`: still exits non-zero with 7 enforced source violations and is the next blocker.

Remaining strict-source blockers:

- `CompanyFinancial.source`: 131/151 label-only.
- `BusinessRelationship.source`: 33/50 label-only.
- `CountryMetric.source`: 180/414 label-only.
- `Shareholder.source`: 22/62 missing.
- `BoardMember.source`: 52/553 missing.
- `Shareholder.verifiedAt`: 22/62 missing.
- `BoardMember.verifiedAt`: 52/553 missing.

Fresh 2026-05-19 current verification:

- `npm test`: 94 tests passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run research:validate-download-backlogs`: passed with 0 errors and 40 duplicate URL/path warnings.
- `npm run research:source-gap-queue`: wrote 87 groups / 288 rows.
- `npm run graph:audit`: passed graph integrity with 0 missing endpoint edges. Current graph: 40,885 nodes, 1,076 edges, 909 connected nodes, 39,976 isolated nodes, 176 orphan board-member graph cases.
- `npm run db:audit:strict-sources`: still exits non-zero with 7 enforced source violations and is the remaining blocker.

Previous remaining strict-source blockers before shareholder correction:

- `CompanyFinancial.source`: 38/151 label-only.
- `BusinessRelationship.source`: 32/50 label-only.
- `CountryMetric.source`: 156/414 label-only.
- `Shareholder.source`: 12/62 missing.
- `BoardMember.source`: 52/553 missing.
- `Shareholder.verifiedAt`: 12/62 missing.
- `BoardMember.verifiedAt`: 52/553 missing.

Fresh 2026-05-19 shareholder-correction verification:

- `npm test`: 94 tests passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run research:validate-download-backlogs`: passed with 0 errors and 40 duplicate URL/path warnings.
- `npm run research:source-gap-queue`: wrote 87 groups / 277 rows.
- `npm run graph:audit`: passed graph integrity with 0 missing endpoint edges. Current graph: 40,885 nodes, 1,076 edges, 909 connected nodes, 39,976 isolated nodes, 176 orphan board-member graph cases.
- `npm run db:audit:strict-sources`: still exits non-zero with 7 enforced source violations and is the remaining blocker.

Current remaining strict-source blockers after shareholder correction:

- `CompanyFinancial.source`: 38/151 label-only.
- `BusinessRelationship.source`: 32/50 label-only.
- `CountryMetric.source`: 156/414 label-only.
- `Shareholder.source`: 1/62 missing.
- `BoardMember.source`: 52/553 missing.
- `Shareholder.verifiedAt`: 1/62 missing.
- `BoardMember.verifiedAt`: 52/553 missing.

Fresh 2026-05-19 board-member correction verification:

- `npm test -- tests/lib/board-member-provenance.test.ts`: 96 tests passed.
- `npm test`: 96 tests passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run research:validate-download-backlogs`: passed with 0 errors and 40 duplicate URL/path warnings.
- `npm run research:source-gap-queue`: wrote 87 groups / 263 rows.
- `npm run graph:audit`: passed graph integrity with 0 missing endpoint edges. Current graph: 40,885 nodes, 1,076 edges, 909 connected nodes, 39,976 isolated nodes, 177 orphan board-member graph cases.
- `npm run db:audit:strict-sources`: still exits non-zero with 7 enforced source violations and is the remaining blocker.
- `git diff --check`: passed.

Current remaining strict-source blockers after board-member correction:

- `CompanyFinancial.source`: 36/151 label-only.
- `BusinessRelationship.source`: 32/50 label-only.
- `CountryMetric.source`: 156/414 label-only.
- `BoardMember.source`: 38/554 missing.
- `BoardMember.verifiedAt`: 38/554 missing.

Current remaining strict-source blockers after final board-member closure:

- `CompanyFinancial.source`: 36/151 label-only.
- `BusinessRelationship.source`: 32/50 label-only.
- `CountryMetric.source`: 156/414 label-only.

Fresh 2026-05-19 historical food-waste/audit-context verification:

- `npm test`: 100 tests passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run research:validate-download-backlogs`: passed with 0 errors and 40 duplicate URL/path warnings.
- `npm run research:source-gap-queue`: wrote 80 groups / 210 rows.
- `npm run graph:audit`: passed graph integrity with 0 missing endpoint edges. Current graph: 40,885 nodes, 1,076 edges, 909 connected nodes, 39,976 isolated nodes, 187 orphan board-member graph cases.
- `npm run db:audit:strict-sources`: still exits non-zero with 3 enforced source violations and is the remaining blocker.
- `git diff --check`: passed.

Current remaining strict-source blockers after historical food-waste/audit-context verification:

- `CompanyFinancial.source`: 36/151 label-only.
- `BusinessRelationship.source`: 32/50 label-only.
- `CountryMetric.source`: 142/415 label-only.
