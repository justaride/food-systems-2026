# Visual Atlas Reconciliation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconcile the stale visual-atlas branch into a small, source-bounded set of local commits on current `origin/main` while preserving the source checkout unchanged.

**Architecture:** Work only in `codex/reconcile-visual-atlas-2026-08-29`, which is based on `origin/main` at `3f4726854fd10240093d4cd67285c033894a0df3`. Treat the old branch as a read-only evidence source: first create a complete disposition ledger, then salvage dated documents, port only current-worthy vault claim corrections, refit the FSD bundle behind an offline gzip/hash contract, and add only still-relevant ignore rules.

**Tech Stack:** Git worktrees, Markdown/JSON/JSONL, TypeScript, Node.js test runner, `tsx`, Node `crypto` and `zlib`, Python vault generator, npm verification scripts.

**Spec:** `docs/superpowers/specs/2026-08-29-visual-atlas-reconciliation-design.md`

## Global Constraints

- Source branch is read-only at `d35b2065a3b67785aa53c1bed954649e70baacde`; its status fingerprint is `a23d8498dfebb5bb44998b7d80e87d310b0b6c94cf6c1a029c7fed3f0c6c0653` from `git status --porcelain=v1 -uall`.
- No merge, push, pull request, deployment, database write, external contact, paid service, production mutation, or network-dependent acceptance test.
- Do not reset, clean, rebase, delete, stage, or overwrite the source checkout.
- Keep the current `main` landscape core files unchanged: `README.md`, projects, longlist, sources, search log, schema, general report, general validator, renderer, and existing tests.
- Do not restore `.github/workflows/coolify-sync-source-commit.yml` or retired SHA-mutation behavior.
- Do not add the 88,884,423-byte raw FSD CSV to Git; track a deterministic gzip artifact whose raw and compressed SHA-256 values are verified offline.
- Preserve dated, draft, unsent, internal, provisional, and publication-gated status labels verbatim or strengthen them; never weaken them.
- Every task ends with `git diff --check`, focused verification, an exact staged-path review, and one local commit.

---

## File Map

### Reconciliation control

- Create `docs/project/reconciliation/visual-atlas-disposition-2026-08-29.md`: the canonical ledger for all 16 source commits, 7 modified tracked paths, 228 untracked files, every integrated path, and every parked path.
- Modify that ledger in later task commits to replace `planned` with `integrated`, `parked`, or `blocked` and attach focused verification evidence.

### Historical documentation salvage

- Create `docs/project/history/visual-atlas-2026-08-05/AUTONOMIPOLICY-2026-08-04.md`.
- Create `docs/project/history/visual-atlas-2026-08-05/QA-VALIDERING-CODEX-PAUSEPUNKT-2026-08-03.md`.
- Create `docs/project/history/visual-atlas-2026-08-05/RAPPORT-TOTALGJENNOMGANG-2026-08-05.md`.
- Create `docs/project/history/visual-atlas-2026-08-05/STATUS-2026-08-05.md`.
- Create `docs/project/history/visual-atlas-2026-08-05/fase2-utkast/README.md`.
- Create `docs/project/history/visual-atlas-2026-08-05/fase2-utkast/innsyn-dfo-ks.md`.
- Create `docs/project/history/visual-atlas-2026-08-05/fase2-utkast/innsyn-dsb-landbruksdir.md`.
- Create `docs/project/history/visual-atlas-2026-08-05/fase2-utkast/mission1-klargjoring.md`.
- Create `research/bibliotek/primaerkilder-2026-08-05/PRIMERKILDE-MATRISE-2026-08-05.md`.
- Create `research/data/eierlag-2026-08-05/orphanRoots-analyse.md`.
- Create `research/data/eierlag-2026-08-05/proff-forvalt-vurdering.md`.
- Create `research/data/eierlag-2026-08-05/utkast-innsyn-aksjonarregister.md`.
- Create `research/data/nordisk-replikering-2026-08-05/nordisk-register-plan.md`.

The seven captured HTML pages from `4c89ea5` remain branch-only because their redistribution rights are not recorded. The ledger records URL, source commit, branch path, Git blob id, and `rightsStatus: human_gate`; it does not copy their bodies.

### Vault claim correction

- Create `tests/lib/visual-atlas-reconciliation.test.ts`: focused assertions for HHI basis, Nordic ranking caveat, unavailable quantities, and non-deletion of unresolved duplicate entities.
- Modify `scripts/obsidian-vault/build_innsiktskart.py`: source text for I01 and I10.
- Modify `src/lib/obsidian-vault-m2.ts`: source text and evidence list for I36.
- Modify `public/data/food-systems/circularity-loops.json`: replace Matsentralen and REKO volume strings with explicit unavailable/unverified status; do not alter current verified SPCR evidence.
- Modify the five generated vault notes named in the spec so tracked output matches the sources.
- Do not delete Dagrofa or REMA notes: `data/vault-export/companies.json` still contains separate identifiers (`DK-38714295`, `DK-DAGROFA`, and the AP-1/DB variants), so source-level identity reconciliation remains blocked.

### Norway/FSD refit

- Create `scripts/lib/snapshot-integrity.ts`: gzip read and dual-hash verification only.
- Create `tests/landscape/norway-fsd-snapshot.test.ts`: unit tests for compressed and raw hash enforcement.
- Create `tests/landscape/validate-norway-fsd-crosswalk.test.ts`: bundle counts, source/readiness boundaries, and report reproducibility tests.
- Create the FSD JSONL, report, manifest, profile, metadata CSV, and deterministic full-export gzip paths listed in the spec.
- Create `scripts/build-norway-fsd-crosswalk.ts`, `scripts/fetch-norway-fsd-snapshot.ts`, `scripts/lib/parse-rfc4180.ts`, and `scripts/validate-norway-fsd-crosswalk.ts` from the source bundle, refitted to the gzip contract and current `main` conventions.
- Modify `package.json` only to add `landscape:norway-fsd:validate`.

### Ignore rules

- Modify `.gitignore` for `/--*.png`, `/masterhjerne/_to_delete/`, and the uncompressed FSD full export.
- Do not duplicate `.private-archive/`.
- Do not add old Fisheries Directorate or activity-signal bulk exclusions because those packages remain archive-only and no current regeneration contract is integrated.

---

### Task 1: Create the complete disposition ledger

**Files:**
- Create: `docs/project/reconciliation/visual-atlas-disposition-2026-08-29.md`

**Interfaces:**
- Consumes: source SHA `d35b2065a3b67785aa53c1bed954649e70baacde`, target SHA `3f4726854fd10240093d4cd67285c033894a0df3`, the 16-commit list, and dirty-tree census from the approved spec.
- Produces: a stable Markdown table keyed by commit SHA or dirty-material category; later tasks update the `Final disposition`, `Candidate commit`, and `Verification` columns.

- [ ] **Step 1: Run the ledger absence check**

Run:

```bash
test ! -e docs/project/reconciliation/visual-atlas-disposition-2026-08-29.md
```

Expected: exit 0, proving no existing ledger will be overwritten.

- [ ] **Step 2: Add the ledger with all commit rows**

Use `apply_patch` to add a table containing these exact SHA keys once each:

```text
33b48cc 2ef226d 0b60f52 ec1c0d5 6d64394 5b12d82 eecaa6a 6a75fa9
b132dd5 d9f94cf 349b1db 41aa2d7 5e4285b e8a3237 4c89ea5 d35b206
```

Each row must record title, classification (`already_on_main`, `archive_only`, `selective_salvage`, `semantic_port`, or `reconstruct`), reason, intended task, final disposition, candidate commit, and verification. Add a dirty-tree table with exactly these categories: 7 tracked paths; 201 untracked files identical to main; 8 differing untracked files; 19 main-absent untracked files; five newline-only chart metrics; citation-readiness preview; FSD bundle; six extra raw captures; local QA screenshot.

- [ ] **Step 3: Add proof boundaries and recovery instructions**

Include this exact boundary text:

```markdown
This ledger proves only local reconciliation against the recorded Git objects. It does not prove push, pull request, merge, deployment, runtime SHA, authenticated UI, publication authority, or external-source rights.

Recovery source: `codex/visual-system-atlas-v1` at `d35b2065a3b67785aa53c1bed954649e70baacde`. Do not delete or rewrite that branch until every parked artifact has an owner-approved retention decision.
```

- [ ] **Step 4: Validate ledger completeness**

Run:

```bash
for sha in 33b48cc 2ef226d 0b60f52 ec1c0d5 6d64394 5b12d82 eecaa6a 6a75fa9 b132dd5 d9f94cf 349b1db 41aa2d7 5e4285b e8a3237 4c89ea5 d35b206; do
  test "$(rg -o "$sha" docs/project/reconciliation/visual-atlas-disposition-2026-08-29.md | wc -l | tr -d ' ')" = 1
done
rg -n '7 tracked|201|8 differing|19 main-absent|citation-readiness|FSD|six extra|QA screenshot' docs/project/reconciliation/visual-atlas-disposition-2026-08-29.md
git diff --check
```

Expected: every loop assertion passes; `rg` shows all dirty categories; `git diff --check` is silent.

- [ ] **Step 5: Review and commit only the ledger**

Run:

```bash
git add -- docs/project/reconciliation/visual-atlas-disposition-2026-08-29.md
git diff --cached --check
git diff --cached --name-only
git commit -m "docs(reconcile): record visual-atlas disposition"
```

Expected staged path: only `docs/project/reconciliation/visual-atlas-disposition-2026-08-29.md`.

---

### Task 2: Salvage dated governed documents without promoting them

**Files:**
- Create: the 13 Markdown paths in “Historical documentation salvage”.
- Modify: `docs/project/reconciliation/visual-atlas-disposition-2026-08-29.md`.

**Interfaces:**
- Consumes: exact Markdown bodies from commits `0b60f52`, `ec1c0d5`, `41aa2d7`, `4c89ea5`, and `d35b206`.
- Produces: history-scoped copies with a common preservation banner; research notes retain their original paths and explicit authority gates.

Use this exact source-to-target mapping while reading each source with `git show <commit>:<source>` and creating the target with `apply_patch`:

| Commit | Source | Target |
|---|---|---|
| `0b60f52` | `AUTONOMIPOLICY-2026-08-04.md` | `docs/project/history/visual-atlas-2026-08-05/AUTONOMIPOLICY-2026-08-04.md` |
| `0b60f52` | `QA-VALIDERING-CODEX-PAUSEPUNKT-2026-08-03.md` | `docs/project/history/visual-atlas-2026-08-05/QA-VALIDERING-CODEX-PAUSEPUNKT-2026-08-03.md` |
| `ec1c0d5` | `RAPPORT-TOTALGJENNOMGANG-2026-08-05.md` | `docs/project/history/visual-atlas-2026-08-05/RAPPORT-TOTALGJENNOMGANG-2026-08-05.md` |
| `41aa2d7` | `docs/project/STATUS-2026-08-05.md` | `docs/project/history/visual-atlas-2026-08-05/STATUS-2026-08-05.md` |
| `41aa2d7` | `docs/project/fase2-utkast-2026-08-05/README.md` | `docs/project/history/visual-atlas-2026-08-05/fase2-utkast/README.md` |
| `41aa2d7` | `docs/project/fase2-utkast-2026-08-05/innsyn-dfo-ks.md` | `docs/project/history/visual-atlas-2026-08-05/fase2-utkast/innsyn-dfo-ks.md` |
| `41aa2d7` | `docs/project/fase2-utkast-2026-08-05/innsyn-dsb-landbruksdir.md` | `docs/project/history/visual-atlas-2026-08-05/fase2-utkast/innsyn-dsb-landbruksdir.md` |
| `41aa2d7` | `docs/project/fase2-utkast-2026-08-05/mission1-klargjoring.md` | `docs/project/history/visual-atlas-2026-08-05/fase2-utkast/mission1-klargjoring.md` |
| `4c89ea5` | `research/bibliotek/primaerkilder-2026-08-05/PRIMERKILDE-MATRISE-2026-08-05.md` | same path |
| `d35b206` | `research/data/eierlag-2026-08-05/orphanRoots-analyse.md` | same path |
| `d35b206` | `research/data/eierlag-2026-08-05/proff-forvalt-vurdering.md` | same path |
| `d35b206` | `research/data/eierlag-2026-08-05/utkast-innsyn-aksjonarregister.md` | same path |
| `d35b206` | `research/data/nordisk-replikering-2026-08-05/nordisk-register-plan.md` | same path |

- [ ] **Step 1: Add a failing preservation check**

Run:

```bash
test -f docs/project/history/visual-atlas-2026-08-05/AUTONOMIPOLICY-2026-08-04.md
```

Expected: exit 1 because the history copy is absent.

- [ ] **Step 2: Add history-scoped project documents**

Use `apply_patch` with the exact old bodies and prepend this banner after each title:

```markdown
> Historical snapshot preserved from `codex/visual-system-atlas-v1`. Dated claims and repository/database status are not current. This file is not an active policy, release instruction, or authorization.
```

For every phase-2 draft, retain or strengthen `ikke sendt`, `human-gated`, sender approval, legal readback, and no-database-write wording.

- [ ] **Step 3: Add the research notes with explicit status blocks**

Use `apply_patch` with the exact old bodies. Add this block beneath each title without changing original dates or findings:

```markdown
> Reconciliation status (2026-08-29): preserved as dated internal research. Claims remain subject to current source, locator, rights, and publication gates. Draft requests are unsent; subscription recommendations do not authorize purchase.
```

Do not add the seven HTML bodies. In the disposition ledger, record each capture’s source URL, branch path, source commit `4c89ea5`, Git blob id from `git rev-parse 4c89ea5:<path>`, and `rightsStatus: human_gate`.

- [ ] **Step 4: Verify preservation and gates**

Run:

```bash
test "$(find docs/project/history/visual-atlas-2026-08-05 -type f -name '*.md' | wc -l | tr -d ' ')" = 8
test "$(find research/bibliotek/primaerkilder-2026-08-05 research/data/eierlag-2026-08-05 research/data/nordisk-replikering-2026-08-05 -type f -name '*.md' | wc -l | tr -d ' ')" = 5
rg -n 'Historical snapshot preserved' docs/project/history/visual-atlas-2026-08-05
rg -n 'ikke sendt|human-gated|unsent|avsender|godkjenning' docs/project/history/visual-atlas-2026-08-05/fase2-utkast research/data/eierlag-2026-08-05/utkast-innsyn-aksjonarregister.md
npm run audit:research-artifacts -- --base=origin/main
git diff --check
```

Expected: counts are 8 and 5; gate wording is present; research artifact audit reports zero violations; diff check is silent.

- [ ] **Step 5: Commit the governed salvage set**

Run:

```bash
git add -- docs/project/history/visual-atlas-2026-08-05 research/bibliotek/primaerkilder-2026-08-05/PRIMERKILDE-MATRISE-2026-08-05.md research/data/eierlag-2026-08-05 research/data/nordisk-replikering-2026-08-05 docs/project/reconciliation/visual-atlas-disposition-2026-08-29.md
git diff --cached --check
git diff --cached --name-status
git commit -m "docs(research): salvage dated governed research artifacts"
```

Expected: only the 13 salvaged Markdown files plus the ledger are staged; no HTML, PDF, database artifact, credential, or outbound action is present.

---

### Task 3: Port current-worthy vault claim corrections with TDD

**Files:**
- Create: `tests/lib/visual-atlas-reconciliation.test.ts`.
- Modify: `scripts/obsidian-vault/build_innsiktskart.py`.
- Modify: `src/lib/obsidian-vault-m2.ts`.
- Modify: `public/data/food-systems/circularity-loops.json`.
- Modify: `Food Systems Obsidian/10 Innsiktskart/Innsikter/I01 Triopolet – 93,4 % av butikkene.md`.
- Modify: `Food Systems Obsidian/10 Innsiktskart/Innsikter/I10 Hele Norden er høykonsentrert.md`.
- Modify: `Food Systems Obsidian/10 Innsiktskart/Innsikter/I36 Næringsgjenvinning er et prioritert gap.md`.
- Modify: `Food Systems Obsidian/10 Innsiktskart/Looper/Loop – Matsentralen redistribusjon (Norge).md`.
- Modify: `Food Systems Obsidian/10 Innsiktskart/Looper/Loop – REKO-ringer direktesalg (Finland-Sverige-Norge).md`.
- Modify: `docs/project/reconciliation/visual-atlas-disposition-2026-08-29.md`.

**Interfaces:**
- Consumes: CA-004’s authoritative turnover HHI `3327`/CR3 `96.6`, the separate store-count proxy `3445`, current R4 HHI caveats, and current source-gap findings.
- Produces: internal vault wording where incompatible bases are explicit and unsupported quantities are textually unavailable; no entity deletion occurs.

- [ ] **Step 1: Write the failing focused test**

Create `tests/lib/visual-atlas-reconciliation.test.ts` with this structure:

```ts
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path: string) => fs.readFileSync(path, "utf8");
const loops = JSON.parse(read("public/data/food-systems/circularity-loops.json"));
const loop = (id: string) => loops.existing_loops.find((row: { id: string }) => row.id === id);

test("vault distinguishes store-count proxy from turnover HHI", () => {
  const note = read("Food Systems Obsidian/10 Innsiktskart/Innsikter/I01 Triopolet – 93,4 % av butikkene.md");
  assert.match(note, /butikkantall.*3 445/is);
  assert.match(note, /omsetning.*3 327.*96,6 %/is);
});

test("Nordic HHI note refuses an unharmonised ranking", () => {
  const note = read("Food Systems Obsidian/10 Innsiktskart/Innsikter/I10 Hele Norden er høykonsentrert.md");
  assert.match(note, /kan ikke rangeres direkte/i);
  assert.doesNotMatch(note, /Norge er ikke unikt, men mest ekstremt/);
});

test("unsupported Matsentralen and REKO quantities are unavailable", () => {
  assert.match(loop("no-matsentralen").volume, /^Unavailable:/);
  assert.match(loop("fi-se-reko").volume, /^Unavailable:/);
  assert.doesNotMatch(loop("no-matsentralen").volume, /5,735|10\.2M/);
  assert.doesNotMatch(loop("fi-se-reko").volume, /274|786,000|500 MNOK/);
});

test("unresolved company identities are not deleted from generated state", () => {
  const companies = JSON.parse(read("data/vault-export/companies.json"));
  const ids = new Set(companies.map((row: { orgNr?: string }) => row.orgNr));
  assert.ok(ids.has("DK-38714295"));
  assert.ok(ids.has("DK-DAGROFA"));
});
```

- [ ] **Step 2: Run the focused test and confirm intended failures**

Run:

```bash
node --import=tsx --test tests/lib/visual-atlas-reconciliation.test.ts
```

Expected: the first three tests fail on old claim language; the duplicate-identity guard passes.

- [ ] **Step 3: Apply the minimal source corrections**

Use `apply_patch` to make these exact semantic changes:

```text
I01: label 93.4% / 3445 as the store-count proxy; label 3327 / 96.6% as the 2024 turnover series.
I10: remove “Norway ... most extreme”; state that country values cannot be ranked directly until year, market universe, operator grouping, and source method are harmonised.
I36: replace the 66,000 N, 14,000 P, 218,000/370,000 biorest and 84% spread quantities with “unavailable in the current claim-locked primary-source set”; retain the gap, not the quantities.
Matsentralen volume: “Unavailable: 2024 tonnes and meal count are not verified against a current primary source.”
REKO volume: “Unavailable: ring, user, and turnover counts are not verified against a current primary source.”
```

Apply each source change to its generated vault note. Preserve `siterbarhet: intern`, claim-lock warnings, and existing links. Do not copy the old SPCR warning: current `research/external/r4/` records stronger primary verification. Do not delete duplicate company notes or modify `data/vault-export`.

- [ ] **Step 4: Run focused and full vault verification**

Run:

```bash
node --import=tsx --test tests/lib/visual-atlas-reconciliation.test.ts
node --import=tsx --test tests/lib/obsidian-vault.test.ts tests/lib/obsidian-vault-export.test.ts
npm run vault:check
git diff --check
```

Expected: focused tests pass; existing vault suites pass; `vault:check` reports no unmanaged drift; diff check is silent.

- [ ] **Step 5: Record parked duplicate identity work and commit**

Update the ledger: claim corrections are `integrated`; Dagrofa/REMA deletion is `blocked` on canonical source identity reconciliation; SPCR downgrade is `parked` because newer current evidence supersedes the old caveat.

Run:

```bash
git add -- tests/lib/visual-atlas-reconciliation.test.ts scripts/obsidian-vault/build_innsiktskart.py src/lib/obsidian-vault-m2.ts public/data/food-systems/circularity-loops.json 'Food Systems Obsidian/10 Innsiktskart/Innsikter/I01 Triopolet – 93,4 % av butikkene.md' 'Food Systems Obsidian/10 Innsiktskart/Innsikter/I10 Hele Norden er høykonsentrert.md' 'Food Systems Obsidian/10 Innsiktskart/Innsikter/I36 Næringsgjenvinning er et prioritert gap.md' 'Food Systems Obsidian/10 Innsiktskart/Looper/Loop – Matsentralen redistribusjon (Norge).md' 'Food Systems Obsidian/10 Innsiktskart/Looper/Loop – REKO-ringer direktesalg (Finland-Sverige-Norge).md' docs/project/reconciliation/visual-atlas-disposition-2026-08-29.md
git diff --cached --check
git diff --cached --name-status
git commit -m "fix(vault): retain source-bounded claim corrections"
```

---

### Task 4: Add the governed Norway/FSD bundle with an offline gzip integrity contract

**Files:**
- Create: `scripts/lib/snapshot-integrity.ts`.
- Create: `tests/landscape/norway-fsd-snapshot.test.ts`.
- Create: all FSD-specific paths from “Norway/FSD refit”.
- Modify: `package.json`.
- Modify: `docs/project/reconciliation/visual-atlas-disposition-2026-08-29.md`.

**Interfaces:**
- Produces: `readVerifiedGzipSnapshot(path: string, expectedCompressedSha256: string, expectedRawSha256: string): Buffer`, consumed by the FSD builder and validator.
- Produces: `loadNorwayFsdBundle(directory: string): NorwayFsdBundle` and `validateNorwayFsdBundle(bundle: NorwayFsdBundle): NorwayFsdSummary` with summary counts `{ indicators: 60, crosswalk: 64, sources: 31 }`.

- [ ] **Step 1: Write the failing gzip integrity tests**

Create the test with a temporary deterministic gzip fixture:

```ts
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { gzipSync } from "node:zlib";

import { readVerifiedGzipSnapshot } from "../../scripts/lib/snapshot-integrity";

const sha256 = (value: Buffer) => createHash("sha256").update(value).digest("hex");

test("verified gzip snapshot enforces compressed and raw hashes", () => {
  const raw = Buffer.from("indicator,value\nA,1\n", "utf8");
  const compressed = gzipSync(raw, { level: 9 });
  const dir = mkdtempSync(path.join(tmpdir(), "fsd-snapshot-"));
  const file = path.join(dir, "fixture.csv.gz");
  writeFileSync(file, compressed);

  assert.deepEqual(readVerifiedGzipSnapshot(file, sha256(compressed), sha256(raw)), raw);
  assert.throws(() => readVerifiedGzipSnapshot(file, "0".repeat(64), sha256(raw)), /compressed SHA-256/);
  assert.throws(() => readVerifiedGzipSnapshot(file, sha256(compressed), "0".repeat(64)), /raw SHA-256/);
});
```

- [ ] **Step 2: Run the test and confirm the missing-module failure**

Run:

```bash
node --import=tsx --test tests/landscape/norway-fsd-snapshot.test.ts
```

Expected: failure because `scripts/lib/snapshot-integrity.ts` does not exist.

- [ ] **Step 3: Implement the minimal integrity reader**

Create:

```ts
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const sha256 = (value: Buffer) => createHash("sha256").update(value).digest("hex");

export function readVerifiedGzipSnapshot(
  filePath: string,
  expectedCompressedSha256: string,
  expectedRawSha256: string,
): Buffer {
  const compressed = readFileSync(filePath);
  const compressedSha256 = sha256(compressed);
  if (compressedSha256 !== expectedCompressedSha256) {
    throw new Error(`compressed SHA-256 mismatch: ${compressedSha256}`);
  }
  const raw = gunzipSync(compressed);
  const rawSha256 = sha256(raw);
  if (rawSha256 !== expectedRawSha256) {
    throw new Error(`raw SHA-256 mismatch: ${rawSha256}`);
  }
  return raw;
}
```

- [ ] **Step 4: Verify the integrity reader before bundle integration**

Run:

```bash
node --import=tsx --test tests/landscape/norway-fsd-snapshot.test.ts
git diff --check
```

Expected: one passing test and silent diff check. Continue directly with the bundle steps below before committing the complete feature.

- [ ] **Step 5: Write the failing bundle contract test**

Create `tests/landscape/validate-norway-fsd-crosswalk.test.ts`:

```ts
import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { loadNorwayFsdBundle, validateNorwayFsdBundle } from "../../scripts/validate-norway-fsd-crosswalk";

test("the governed Norway FSD bundle is complete and reproducible", () => {
  const bundle = loadNorwayFsdBundle(path.join(process.cwd(), "research", "landscape"));
  const summary = validateNorwayFsdBundle(bundle);
  assert.deepEqual(
    { indicators: summary.indicators, crosswalk: summary.crosswalk, sources: summary.sources },
    { indicators: 60, crosswalk: 64, sources: 31 },
  );
  assert.match(bundle.report, /<!-- FSD_AUDIT_SUMMARY: /);
  assert.match(bundle.report, /external benchmark surface/i);
  assert.match(bundle.report, /not a Norwegian primary series/i);
  assert.match(bundle.report, /not production data/i);
});
```

- [ ] **Step 6: Confirm the bundle is absent on the target branch**

Run:

```bash
node --import=tsx --test tests/landscape/validate-norway-fsd-crosswalk.test.ts
```

Expected: missing-module or missing-file failure for the FSD bundle.

- [ ] **Step 7: Add deterministic snapshot artifacts**

Use deterministic gzip compression (`gzip -n -9`) as a mechanical artifact-generation step for the source raw CSV. Track:

```text
research/landscape/snapshots/fsd-full-export-2026-04-20.csv.gz
compressed bytes: 7336927
compressed sha256: cd37ea4ddd80df3a94424e5cb16540ea6c53e4697d9a0cfb8d4ea21741d103f3
raw bytes: 88884423
raw sha256: d155d1e2269169760fbdb0904199c54e4af7439c7493b65c8b4ae999e434002a
```

Use `apply_patch` for the metadata CSV, profile JSON, and manifest. The manifest entry for the full export must use keys `compressedPath`, `compressedBytes`, `compressedSha256`, `rawBytes`, `rawSha256`, and `compression: "gzip -n -9"`; it must not reference a tracked raw CSV path.

- [ ] **Step 8: Add and refit the parser, builder, fetcher, validator, JSONL files, and report**

Use the source bundle as the content baseline, preserving all 60 indicator rows, 64 crosswalk rows, 31 source rows, citation-readiness values, and `external_reference_only`/`needs_primary_check`/`dual_series`/`no_import` dispositions.

Refit the builder and validator to read the full export as:

```ts
const fullExport = parseCsv(
  readVerifiedGzipSnapshot(fullExportPath, manifest.compressedSha256, manifest.rawSha256).toString("utf8"),
);
```

Refactor the validator so CLI execution remains under `main()` while tests import the two named functions. Ensure the fetcher writes a deterministic `.csv.gz` plus dual hashes after an explicitly invoked network fetch; tests and validation never call the fetcher.

- [ ] **Step 9: Add only the validation package script**

Modify `package.json`:

```json
"landscape:norway-fsd:validate": "tsx scripts/validate-norway-fsd-crosswalk.ts"
```

Do not modify the existing general landscape commands.

- [ ] **Step 10: Run focused and combined landscape verification**

Run:

```bash
node --import=tsx --test tests/landscape/norway-fsd-snapshot.test.ts tests/landscape/validate-norway-fsd-crosswalk.test.ts
npm run landscape:norway-fsd:validate
npm run landscape:validate
npm run test:landscape
```

Expected output includes:

```text
Norway FSD crosswalk validation passed: 60 indicators, 64 crosswalk rows, 31 sources.
Landscape validation passed: 40 main, 22 candidates/dispositions, 100 sources, 20 independent sources, 50 qualitative findings, 16 search passes.
```

- [ ] **Step 11: Prove deterministic regeneration**

Run the builder, then check only the governed outputs:

```bash
npx tsx scripts/build-norway-fsd-crosswalk.ts
git diff --exit-code -- research/landscape/norway-fsd-indicators-2026-08-10.jsonl research/landscape/norway-fsd-crosswalk-2026-08-10.jsonl research/landscape/norway-fsd-source-ledger-2026-08-10.jsonl research/landscape/norway-fsd-report-2026-08-10.md
git diff --check
```

Expected: builder succeeds; generated-output diff is empty; diff check is silent.

- [ ] **Step 12: Audit and commit the complete FSD feature**

Update the ledger with the artifact hashes, count results, and `integrated` status. Then run:

```bash
npm run audit:research-artifacts -- --base=origin/main
git add -- package.json scripts/lib/parse-rfc4180.ts scripts/lib/snapshot-integrity.ts scripts/build-norway-fsd-crosswalk.ts scripts/fetch-norway-fsd-snapshot.ts scripts/validate-norway-fsd-crosswalk.ts tests/landscape/norway-fsd-snapshot.test.ts tests/landscape/validate-norway-fsd-crosswalk.test.ts research/landscape/norway-fsd-indicators-2026-08-10.jsonl research/landscape/norway-fsd-crosswalk-2026-08-10.jsonl research/landscape/norway-fsd-source-ledger-2026-08-10.jsonl research/landscape/norway-fsd-report-2026-08-10.md research/landscape/norway-fsd-snapshot-manifest-2026-08-10.json research/landscape/snapshots/norway-fsd-profile-2026-08-10.json research/landscape/snapshots/fsd-metadata-export-2026-04-20.csv research/landscape/snapshots/fsd-full-export-2026-04-20.csv.gz docs/project/reconciliation/visual-atlas-disposition-2026-08-29.md
git diff --cached --check
git diff --cached --stat
git commit -m "feat(landscape): add governed Norway FSD crosswalk"
```

Expected: research artifact audit has zero violations; the raw 88.9 MB CSV is absent from staged paths.

---

### Task 5: Reconstruct only relevant ignore rules

**Files:**
- Modify: `.gitignore`.
- Modify: `docs/project/reconciliation/visual-atlas-disposition-2026-08-29.md`.

**Interfaces:**
- Consumes: archive-only status of the large registry packages and the tracked-gzip/raw-untracked FSD contract.
- Produces: narrow ignore behavior without hiding general research data or duplicating existing private-archive rules.

- [ ] **Step 1: Show the intended paths are not all ignored**

Run:

```bash
git check-ignore --no-index -q -- --probe.png; test $? -eq 1
git check-ignore --no-index -q -- masterhjerne/_to_delete/example.tar.gz; test $? -eq 1
git check-ignore --no-index -q -- research/landscape/snapshots/fsd-full-export-2026-04-20.csv; test $? -eq 1
```

Expected: all three checks confirm the rules are absent.

- [ ] **Step 2: Add the narrow rules**

Use `apply_patch`:

```gitignore
# Root-level malformed page image exports.
/--*.png

# Local deletion/tarball holding area; contents are recoverable outside Git.
/masterhjerne/_to_delete/

# FSD full export is tracked only as deterministic gzip with dual hashes.
/research/landscape/snapshots/fsd-full-export-2026-04-20.csv
```

- [ ] **Step 3: Verify inclusion and exclusion behavior**

Run:

```bash
git check-ignore --no-index -v -- --probe.png masterhjerne/_to_delete/example.tar.gz research/landscape/snapshots/fsd-full-export-2026-04-20.csv
test "$(rg -n '^/?\.private-archive/$' .gitignore | wc -l | tr -d ' ')" = 1
! rg -n 'fiskeridirektoratet-2026-08-05|aktivitetssignaler-2026-08-05' .gitignore
git diff --check
```

Expected: all three intended paths match; `.private-archive/` occurs once; no archive-only bulk-data rules were added.

- [ ] **Step 4: Commit ignore rules and ledger disposition**

Run:

```bash
git add -- .gitignore docs/project/reconciliation/visual-atlas-disposition-2026-08-29.md
git diff --cached --check
git diff --cached --name-only
git commit -m "chore(gitignore): retain local and reproducible bulk exclusions"
```

Expected staged paths: only `.gitignore` and the ledger.

---

### Task 6: Run the final candidate gate and prove source-checkout preservation

**Files:**
- No file changes expected.

**Interfaces:**
- Consumes: the five implementation commits after the specification commit.
- Produces: a local evidence summary and PR/park/block recommendation; no push or deployment action.

- [ ] **Step 1: Verify the source checkout is byte-for-byte untouched in Git status terms**

Run:

```bash
test "$(git -C '/Users/gabrielfreeman/Documents/Food Systems 2026' rev-parse HEAD)" = d35b2065a3b67785aa53c1bed954649e70baacde
test "$(git -C '/Users/gabrielfreeman/Documents/Food Systems 2026' status --porcelain=v1 -uall | shasum -a 256 | awk '{print $1}')" = a23d8498dfebb5bb44998b7d80e87d310b0b6c94cf6c1a029c7fed3f0c6c0653
```

Expected: both assertions pass.

- [ ] **Step 2: Run the complete local quality gate**

Run one command at a time and retain exit code plus concise output:

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

Expected: every command exits 0; final status shows the branch ahead of `origin/main` with no working-tree paths.

- [ ] **Step 3: Verify commit boundaries**

Run:

```bash
git log --reverse --format='%h %s' origin/main..HEAD
git diff --name-status origin/main...HEAD
git log --format='%s' origin/main..HEAD | rg -n 'docs\(reconcile\): record visual-atlas disposition|docs\(research\): salvage dated governed research artifacts|fix\(vault\): retain source-bounded claim corrections|feat\(landscape\): add governed Norway FSD crosswalk|chore\(gitignore\): retain local and reproducible bulk exclusions'
```

Expected: the specification commit, this plan commit, and the five planned implementation commits appear; no deployment workflow, raw full CSV, HTML capture, QA screenshot, citation preview, chart-metric noise, database artifact, or secret is listed.

- [ ] **Step 4: Deliver the decision boundary**

Report separately:

```text
PR candidate: only commits that passed their focused and final gates.
Archived: old branch history, night-session artifacts, obsolete branch strategy, large fisheries/activity datasets, already-main-equivalent files.
Blocked: duplicate entity deletion pending canonical identity repair; raw page captures pending rights/manifest intake; generated citation preview pending canonical evidence review.
Not proven or authorized: push, PR, merge, deployment, production SHA, authenticated UI, data import, external publication, contact, purchase.
```
