# Visual-atlas replacement round implementation plan

> **Authority boundary:** This plan prepares internal, candidate-only replacements. It does not authorize deletion of raw captures, publication, promotion, review completion, or coverage claims.

**Goal:** Replace six parked browser captures with five compact, provenance-preserving Markdown source notes and a machine-readable manifest, while preserving the original captures and keeping every artifact behind a human gate.

**Architecture:** A JSON manifest is the single machine-readable inventory. Five Markdown notes outside the importer-scanned `research/` tree carry bounded metadata, rights context, source locators, and short factual summaries without copied wrappers or article full text. One focused Node test-runner file enforces coverage, provenance, file type, authority, bounded size, and no-fulltext/no-deletion invariants. The existing retention/rights matrix is then updated with preparation status and linked to a dated receipt.

**Tech stack:** Markdown, JSON, TypeScript, Node.js test runner.

**Baseline:** Work from branch `codex/visual-atlas-retention-matrix-2026-08-31`, based on `origin/main` at `eb3e68cc5285f9c8f173b0f7fc1998f56691e55f`, with the retention matrix commit `8f8886e8c63dc6cbfc8ffe95d45b8eef0cb25c69` already present.

**Out of scope:** Deleting or modifying any source capture; copying raw HTML/TXT into Git; changing corpus-health snapshots; database refreshes; publication; deployment; push or PR creation.

---

### Task 1: Build the candidate-only replacement package

**Files:**
- Create: `tests/lib/visual-atlas-retention-replacements.test.ts`
- Create: `research/_status/visual-atlas-replacement-manifest-2026-08-31.json`
- Create: `docs/project/reconciliation/visual-atlas-replacements-2026-08-31/estate-coop-union-2015.md`
- Create: `docs/project/reconciliation/visual-atlas-replacements-2026-08-31/ambio-fish-sludge-2017.md`
- Create: `docs/project/reconciliation/visual-atlas-replacements-2026-08-31/frontiers-phosphorus-flow-norway-2023.md`
- Create: `docs/project/reconciliation/visual-atlas-replacements-2026-08-31/riksdagen-prop-2025-26-205.md`
- Create: `docs/project/reconciliation/visual-atlas-replacements-2026-08-31/forskrift-2023-12-11-2037.md`

**Step 1: Write the failing manifest and note contract test**

Create a focused test that expects:

- manifest-level `schemaVersion: 1`, `authority: "candidate_only"`, `rightsStatus: "human_gate"`, `deletionAuthorized: false`, and `publicationReady: false`;
- exact one-time coverage of source IDs `U01`, `U03`, `U04`, `T07`, `U05`, and `U06` across five replacement entries, with `U05` and `U06` sharing the regulation note;
- exact input path and SHA-256 provenance:
  - `U01`: `research/innhenting-2026-08-05/staging/brod-2017-ambio-fish-sludge-pmc.html`, `7757de89f940ab5853a20b78f63f613f5c0eaae64e8431e3fd9b30ce19487656`;
  - `U03`: `research/innhenting-2026-08-05/staging/estatenyheter-coop-union-2015.md`, `2a42785baf986bf27da0d7abd0d158f79f644f7f95415721ba88c84a6599756e`;
  - `U04`: `research/innhenting-2026-08-05/staging/frontiers-p-flow-norway-2023.html`, `a53c3e5cd5e2a2a21feff75f650338bbd7c96d5d663b4bc08d8907589a17c014`;
  - `T07`: `research/bibliotek/primaerkilder-2026-08-05/riksdagen-prop-2025-26-205-beredskapslager.html`, Git blob `4a34f10cdda13d14e02aaa079bf2b682efd7aefe`, SHA-256 `d8c828f4ee8df48f800b914cac3dea9c69079e8e5ae6cd0a2dd66a2d5574340a`;
  - `U05`: `research/innhenting-2026-08-05/staging/lovdata-forskrift-2023-12-11-2037.html`, `ec09e81c924a3ef8da8a39783247208b980ad82258ddb98aa3dd87b122d3e6b2`;
  - `U06`: `research/innhenting-2026-08-05/staging/lovdata-forskrift-2023-12-11-2037.txt`, `b1983e65a2dcf3c76e85f23b7bba772cb26df635ba6afcdf12d823f860c85e22`;
- every replacement path exists, is Markdown, and contains explicit `authority: internal_only`, `publication_ready: false`, `rights_status: human_gate`, source URL, and corresponding input hashes;
- no replacement note contains `<html`, `<script`, `dataLayer`, `Frontiers in Sustainable Food Systems About us About us`, or the Estate full-text phrase `Eiendommen brukes i dag til hovedkontor`;
- every raw input path remains unchanged and is never designated for deletion.

Run:

```bash
node --import=tsx --test tests/lib/visual-atlas-retention-replacements.test.ts
```

Expected: FAIL because the manifest and notes do not exist yet.

**Step 2: Create the manifest**

Create `research/_status/visual-atlas-replacement-manifest-2026-08-31.json` with five entries. Each entry must include its source IDs, exact raw input path(s), SHA-256 value(s), replacement path, canonical source URL, `disposition: "replacement_candidate"`, `authority: "internal_only"`, `rightsStatus: "human_gate"`, `publicationReady: false`, and `deletionAuthorized: false`. Add the T07 Git blob identity. Do not call it generated unless a named repository generator produced it; use `preparedAt: "2026-08-31"`.

**Step 3: Create five bounded source notes**

Each note must:

- state the internal-only, human-gated, not-publication-ready status at the top;
- preserve exact source title, publisher/issuer, date where verified, canonical URL, DOI/PMCID where applicable, raw input path, and SHA-256;
- clearly separate verified metadata, a short paraphrased factual summary, rights/licence context, and unresolved human checks;
- contain source locators sufficient for a human to reopen the authoritative source;
- avoid HTML wrappers, navigation text, article full text, abstracts, long quotations, and inferred facts presented as verified;
- avoid claiming independent human review or coverage completion.

Source-specific requirements:

- Estate: use title `Coop selger stort til Union`, author Dag-Jørgen Saltnes, publication timestamp `2015-07-08T11:58:00.000Z`, canonical URL `https://www.estatenyheter.no/aktuelt/coop-selger-stort-til-union/199604`, and only a short paraphrase that Coop sold a 52,300 m² Grorud property to Union Real Estate Fund. State that no open licence was verified and human permission/quotation review remains required.
- Ambio: preserve DOI `10.1007/s13280-017-0927-5`, PMCID `PMC5639799`, the exact title/authors extracted from local citation metadata, and the explicit CC BY 4.0 status found in the capture. Do not copy the abstract or article body.
- Frontiers: preserve DOI `10.3389/fsufs.2023.1248984`, the exact title and authors from source metadata, and distinguish the article's CC BY 4.0 licence from Frontiers site chrome, code, branding, and third-party material. Do not reuse the existing oversized scraped wrapper as a replacement.
- Riksdagen: preserve the proposition title and official URL `https://www.riksdagen.se/sv/dokument-och-lagar/dokument/proposition/beredskapslager-i-livsmedelskedjan_hd03205/`; describe the official-act copyright boundary and retain any locator/date caveat visible in the source record. Do not invent or normalize a duration claim that is not directly verified.
- Lovdata: one note covers both the HTML and TXT captures for `Forskrift om forbud mot negative servitutter som begrenser etablering av dagligvarevirksomhet`; preserve the Lovdata URL and issuer/date metadata, summarize the affected provisions without reproducing the captured wrapper, and state that statutory text and Lovdata's database/interface rights are separate layers.

**Step 4: Run focused verification**

Run:

```bash
node --import=tsx --test tests/lib/visual-atlas-retention-replacements.test.ts
git diff --check
git status --short
```

Expected: focused test PASS; diff check clean; only the planned files changed.

**Step 5: Commit Task 1**

```bash
git add tests/lib/visual-atlas-retention-replacements.test.ts \
  research/_status/visual-atlas-replacement-manifest-2026-08-31.json \
  docs/project/reconciliation/visual-atlas-replacements-2026-08-31
git commit -m "docs: prepare bounded visual atlas replacements"
```

---

### Task 2: Record preparation status without promoting authority

**Files:**
- Modify: `tests/lib/visual-atlas-retention-replacements.test.ts`
- Modify: `docs/project/reconciliation/visual-atlas-retention-rights-matrix-2026-08-31.md`
- Create: `docs/project/reconciliation/visual-atlas-replacement-preparation-receipt-2026-08-31.md`

**Step 1: Extend the test with governance expectations**

Add failing assertions that the retention matrix links the manifest and receipt and marks all six items `replacement_candidate_prepared` while retaining `human_gate` and `deletionAuthorized: false`. Assert that the receipt records the manifest path, all six IDs, the original baseline and retention-matrix commit, and explicitly states no deletion, publication, push, PR, deployment, or corpus-health refresh occurred.

Run:

```bash
node --import=tsx --test tests/lib/visual-atlas-retention-replacements.test.ts
```

Expected: FAIL because the matrix and receipt do not yet satisfy the contract.

**Step 2: Add the preparation receipt**

Create a concise receipt that records:

- scope and authority boundary;
- baseline `eb3e68cc5285f9c8f173b0f7fc1998f56691e55f` and retention-matrix commit `8f8886e8c63dc6cbfc8ffe95d45b8eef0cb25c69`;
- paths to the manifest and five notes;
- exact six-ID coverage;
- focused test command and its result;
- negative evidence: no source capture deleted or modified, no publication/status promotion, no DB/corpus-health workflow, no push/PR/merge/deploy.

Do not pre-fill the final Task 2 commit SHA inside the commit itself. Record it in the implementation report after commit.

**Step 3: Update the retention/rights matrix**

Add a dated `Replacement preparation` section that links the manifest and receipt. For each of U01, U03, U04, T07, U05, and U06, record `replacement_candidate_prepared`, the replacement path, `human_gate`, `publication_ready=false`, and `deletion_authorized=false`. Preserve the original disposition and rights analysis; do not relabel any item as cleared, reviewed, canonical, or publishable.

**Step 4: Run focused and repository verification**

Run:

```bash
node --import=tsx --test tests/lib/visual-atlas-retention-replacements.test.ts
npm test
git diff --check
git status --short
```

Expected: focused test PASS; repository suite has no new failures relative to the established 2529 passed / 0 failed / 1 skipped baseline; diff check clean; only planned Task 2 files changed.

**Step 5: Commit Task 2**

```bash
git add tests/lib/visual-atlas-retention-replacements.test.ts \
  docs/project/reconciliation/visual-atlas-retention-rights-matrix-2026-08-31.md \
  docs/project/reconciliation/visual-atlas-replacement-preparation-receipt-2026-08-31.md
git commit -m "docs: record visual atlas replacement preparation"
```

---

### Final verification and integration gate

After both tasks pass task review, run an independent final review against this plan. Then use the finishing-a-development-branch workflow to present integration options. Do not push, create a PR, merge, delete source material, run the DB-backed corpus-health workflow, or deploy without a new explicit authorization.
