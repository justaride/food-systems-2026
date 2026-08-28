# Visual Atlas Reconciliation Design

**Date:** 2026-08-29

**Status:** Approved in chat for specification

**Source branch:** `codex/visual-system-atlas-v1` at `d35b2065a3b67785aa53c1bed954649e70baacde`

**Target baseline:** `origin/main` at `3f4726854fd10240093d4cd67285c033894a0df3`
**Implementation branch:** `codex/reconcile-visual-atlas-2026-08-29`

## Goal

Reconcile the stale visual-atlas branch and its dirty working tree without merging obsolete code, losing unique evidence, weakening current governance, or changing production. The result must be a small set of reviewable local commits based on current `origin/main`, plus an explicit disposition for everything that is not integrated.

## Evidence baseline

- The source branch is 16 commits ahead and 403 commits behind `origin/main`.
- Its working tree has 7 modified tracked paths and 228 untracked files.
- A whole-branch merge produces about 50 conflict paths, including a deploy workflow that has since been retired.
- Across the four large citation, database, library-analysis, and research-sync commits, 268 of 328 changed files are already byte-identical on `main`. Most remaining paths have newer main-side implementations.
- Of the 228 untracked files, 201 are already byte-identical on `main`, 8 differ from main, and 19 are absent from main.
- The local landscape and Norway/FSD validators pass in the source checkout, but the local general landscape schema is older than the stricter model now on `main`.
- The FSD full export is 88,884,423 bytes and compresses to about 7.7 MB with gzip. Git LFS is not configured.

## Non-goals and hard boundaries

- No merge, push, pull request, deployment, database write, external contact, paid service, or production mutation.
- Do not reset, clean, rebase, delete, stage, or overwrite the source checkout.
- Do not treat a dated research note, machine-verified preview, modelled value, or internal synthesis as publication-ready evidence.
- Do not replace the current project-landscape schema, validator, report, source registry, or qualitative evidence model with the older dirty versions.
- Do not restore retired Coolify SHA mutation or deployment behavior.
- Do not add the 88.9 MB raw CSV directly to Git.

## Reconciliation model

### Track 1: Preserve branch history without merging it

The source branch remains intact as the immutable recovery source. Commits that are historically useful but unsuitable for current `main` are recorded in the reconciliation ledger rather than replayed.

Archive-only candidates:

- `2ef226d`: 101 night-session and triage artifacts at repository root.
- `d9f94cf`: branch-strategy advice that predates the later canonical merge into `main`.
- `5e4285b`: large Fisheries Directorate snapshots and derived files.
- `e8a3237`: large Brreg/Mattilsynet activity snapshots and derived files.

These remain recoverable from the branch. No claim is made that they are current or publication-ready.

### Track 2: Selective document and research salvage

Review the following cleanly applicable commits path by path, not as blind cherry-picks:

- `0b60f52`: AI autonomy policy and QA validation report.
- `ec1c0d5`: dated total-review report.
- `41aa2d7`: dated project status and phase-2 drafts.
- `4c89ea5`: primary-source matrix and captured public pages.
- `d35b206`: ownership-layer analysis, subscription assessment, unsent access-request draft, and Nordic registry plan.

For each file:

1. retain its original date, status, caveats, and authorship;
2. check whether a newer canonical document supersedes it;
3. place historical material under the existing project documentation topology when moving it is safe;
4. keep drafts explicitly unsent and non-authoritative;
5. run the research-artifact and link/provenance checks before committing.

If a newer current policy or status document conflicts with one of these files, the older file is parked in the ledger rather than integrated.

### Track 3: Semantic vault correction

Do not replay `6d64394` wholesale. It combines current-worthy factual corrections with old visual-atlas navigation and generated vault state.

Port only independently justified corrections into the current main-side files:

- distinguish store-count shares from turnover shares and keep HHI 3,445 separate from turnover HHI 3,327;
- mark the unsupported nutrient-recovery, aquaculture nutrient, biorest, Matsentralen, and REKO quantities as unavailable or unverified rather than usable claims;
- preserve the warning that Nordic HHI ranking needs harmonised market definitions;
- reconcile duplicate Dagrofa and REMA vault nodes only if current generators and registries confirm the canonical target identities.

Navigation links to visual-atlas-only nodes are not ported unless those targets already exist on current `main`.

TDD contract:

1. add failing assertions to the existing vault tests for the corrected claim language and canonical duplicate set;
2. verify the tests fail against the current baseline for the intended reason;
3. make the minimal content/generator changes;
4. run the focused tests and the full vault suite.

### Track 4: Norway/FSD refit onto the current landscape model

Integrate only the FSD-specific layer. Preserve the current `main` versions of the general landscape README, projects, longlist, sources, search log, schema, report, validator, renderer, and tests.

FSD-specific candidate files:

- `research/landscape/norway-fsd-indicators-2026-08-10.jsonl`
- `research/landscape/norway-fsd-crosswalk-2026-08-10.jsonl`
- `research/landscape/norway-fsd-source-ledger-2026-08-10.jsonl`
- `research/landscape/norway-fsd-report-2026-08-10.md`
- `research/landscape/norway-fsd-snapshot-manifest-2026-08-10.json`
- `research/landscape/snapshots/norway-fsd-profile-2026-08-10.json`
- `research/landscape/snapshots/fsd-metadata-export-2026-04-20.csv`
- a gzip-compressed form of `fsd-full-export-2026-04-20.csv`
- `scripts/build-norway-fsd-crosswalk.ts`
- `scripts/fetch-norway-fsd-snapshot.ts`
- `scripts/lib/parse-rfc4180.ts`
- `scripts/validate-norway-fsd-crosswalk.ts`
- one additive `landscape:norway-fsd:validate` package script.

The compressed snapshot contract must record both compressed-artifact SHA-256 and decompressed raw SHA-256. A clean checkout must be able to validate the tracked snapshot without network access. The existing FSD source/readiness distinctions remain unchanged: FSD is an external benchmark surface, not a Norwegian primary series and not production data.

TDD contract:

1. add failing landscape tests for the tracked compressed snapshot, raw-hash verification, 60 indicator rows, 64 crosswalk rows, 31 sources, and report reproducibility marker;
2. verify the tests fail because the FSD layer is absent;
3. add the minimal gzip-aware reader and FSD files;
4. verify both the existing current landscape suite and the FSD suite pass together;
5. rerun the deterministic generator and require a clean diff for generated FSD outputs.

### Track 5: Dirty-tree disposition

| Dirty material | Disposition |
|---|---|
| 201 untracked files identical to main | Already integrated; do not copy or stage |
| Five chart-metrics newline-only changes | Generated/noise; do not integrate |
| Older differing landscape core files | Superseded by the stricter main model; do not copy |
| FSD-specific bundle | Refit through Track 4 |
| Citation-readiness preview with 80 generated rows | Preserve as a generated review candidate; do not promote or commit as canonical evidence |
| Six additional raw HTML/TXT source captures | Separate evidence-intake review with rights, locator, hash, and manifest checks |
| `f-test-folketall-trend-import-urbaniseringsgrad.png` | Local QA artifact; do not integrate |
| Two additive package scripts | Keep only the FSD validation script; current main already owns general landscape scripts |

### Track 6: Ignore-rule repair

Reconstruct only rules that remain meaningful on current `main`:

- root-level malformed page exports (`/--*.png`);
- the local deletion/tarball holding directory (`/masterhjerne/_to_delete/`);
- reproducible large register downloads, but only when the corresponding source package is retained and the regeneration path is documented.

The existing `.private-archive/` rule on `main` is already sufficient and must not be duplicated.

## Commit structure

The implementation branch should use separate, independently reviewable commits:

1. `docs(reconcile): record visual-atlas disposition`
2. `docs(research): salvage dated governed research artifacts`
3. `fix(vault): retain source-bounded claim corrections`
4. `feat(landscape): add governed Norway FSD crosswalk`
5. `chore(gitignore): retain local and reproducible bulk exclusions`

If a track fails its own acceptance gate, omit that commit and record the blocker in the disposition ledger. Do not weaken a gate to keep the track.

## Verification gates

Focused gates:

- existing and new vault tests;
- existing project-landscape tests and validator;
- Norway/FSD tests, validator, decompression/hash check, and deterministic regeneration;
- research-artifact audit for every salvaged research file;
- `git diff --check` after each candidate commit.

Final local candidate gate:

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm run landscape:report
npm run landscape:validate
npm run test:landscape
npm run landscape:norway-fsd:validate
npm run audit:research-artifacts -- --base=origin/main
git diff --check origin/main...HEAD
git status --short --branch
```

A failure is reported as a blocker for that track. Local green status does not authorise push, merge, deployment, data import, external publication, or authenticated-UI claims.

## Deliverables

- a clean isolated candidate branch based on current `origin/main`;
- a reconciliation ledger covering all 16 commits, 7 modified tracked paths, and 228 untracked files;
- zero changes in the source checkout;
- reviewable local commits only for tracks that pass their gates;
- a final recommendation listing what can become a PR, what remains archived, and what still requires owner, rights, or publication authority.
