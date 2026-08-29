# Final fix report — visual-atlas reconciliation

Date: 2026-08-29

Worktree: `/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/reconcile-visual-atlas-2026-08-29`

Branch: `codex/reconcile-visual-atlas-2026-08-29`

Commit message: `fix(reconcile): enforce final provenance boundaries`

## Status

All offline, in-scope final-review findings are implemented and locally verified. The candidate remains **BLOCKED**, not a PR candidate, solely because the governed DB-backed corpus-health bundle is stale relative to the changed Obsidian vault. That pre-existing boundary was not broadened: no database, network, CI, external system, or source-checkout write was used.

## Breaks named from actual schemas and data flow

1. The FSD builder hard-coded fruit, vegetable, beef, and other local tuples instead of resolving the loaded source documents. Several selectors treated `steps` as an object even though it is an array; the yield rows also cited the aggregate trade file, and beef's claimed value did not match that file.
2. The validator checked source shape and file existence but did not recompute internal-source hashes or bind each match's selector, value, year, and unit to actual JSON bytes. Unsupported TypeScript pseudo-origins could therefore appear as matches.
3. The dirty-tree ledger classified all 19 main-absent paths as parked, despite the 12-path FSD group having been reconstructed/integrated. It did not record byte-level provenance for the six untracked raw captures and conflated source newline-only metric noise with candidate build timestamp-only noise.
4. Refresh collision checks ran before fetching/staging, but not immediately before the first promotion rename, leaving a target-appearance TOCTOU window.
5. The I01 turnover HHI/CR3 note cited only the older narrative synthesis, not the current CA-004 and value-chain sources.

## RED evidence

Tests were added and observed failing before production or generated-data fixes:

| Command | RED result |
|---|---|
| `node --import=tsx --test tests/landscape/validate-norway-fsd-crosswalk.test.ts` | Exit 1 with six intended failures: exact local tuple set, accepted value drift, accepted year drift, accepted unit drift, accepted zeroed internal hash, and accepted unsupported selector/origin. |
| `node --import=tsx --test tests/landscape/norway-fsd-manifest-selection.test.ts` | Exit 1 because Fruit yield still cited the aggregate trade origin/selector rather than the value-chain array member. |
| `node --import=tsx --test tests/landscape/fetch-norway-fsd-snapshot.test.ts` | Exit 1 because the pre-promotion `promoteFreshSnapshotTransaction` boundary did not exist. |
| `node --import=tsx --test tests/lib/visual-atlas-reconciliation.test.ts` | Exit 1 because I01 did not cite CA-004 or the current value-chain artifact. |

## Minimal fixes

- Added a closed allowlist resolver for JSON origins and selectors. It understands exact object paths, `steps[id=…]`, and the `flows[*]` series, derives value/year/unit from the loaded source, and rejects unsupported origins/selectors or ambiguous array resolution.
- Replaced hard-coded local builder matches with source-derived matches. Fruit, vegetable, cereal, milk, and beef yields now point to exact value-chain array elements; unsupported sustainability TypeScript pseudo-matches were removed.
- Made validation recompute every internal ledger `contentHash` from actual bytes, require exact sourceRef/file binding, resolve every internal match through the closed selector contract, and compare value/year/unit.
- Added a final collision recheck in the promotion transaction's `beforePromote` hook, immediately before the first rename.
- Corrected the dirty-tree ledger's 12 + 6 + 1 split, added the six-file byte inventory below, and separated source newline-only from candidate timestamp-only wording.
- Added CA-004 and `steps[id=retail].concentration` to the I01 generator and generated note while preserving `siterbarhet: intern`, the claim lock, and the narrative source.

Governed FSD output was regenerated with `npx tsx scripts/build-norway-fsd-crosswalk.ts`. The vault note was regenerated through `scripts/obsidian-vault/build_innsiktskart.py` and the existing vault sync/check flow; unrelated generated vault drift was restored, leaving only I01 in scope. The raw FSD CSV remains absent.

## Source-checkout raw-capture inventory

Method: read-only `shasum -a 256` over each exact local file's bytes in `/Users/gabrielfreeman/Documents/Food Systems 2026` on 2026-08-29. All six are untracked, so the Git-object field is explicitly `no Git blob (untracked)`. No capture body was copied.

| Exact source-checkout path | Source URL | Locator | Local SHA-256 | Git object | rightsStatus |
|---|---|---|---|---|---|
| `research/innhenting-2026-08-05/staging/brod-2017-ambio-fish-sludge-pmc.html` | https://doi.org/10.1007/s13280-017-0927-5 | abstract + Table 3; field-trial results; Table 2 | `7757de89f940ab5853a20b78f63f613f5c0eaae64e8431e3fd9b30ce19487656` | no Git blob (untracked) | `human_gate` |
| `research/innhenting-2026-08-05/staging/estatenyheter-coop-union-2015.html` | http://www.estatenyheter.no/2015/07/08/coop-selger-stort-til-union/ | brødtekst avsn. 1–4 | `56e776c3c7b0faa93ed9869dc4f63a9d7b06379c35810a6e511be4d2e57a762e` | no Git blob (untracked) | `human_gate` |
| `research/innhenting-2026-08-05/staging/estatenyheter-coop-union-2015.md` | http://www.estatenyheter.no/2015/07/08/coop-selger-stort-til-union/ | brødtekst avsn. 1–4 | `2a42785baf986bf27da0d7abd0d158f79f644f7f95415721ba88c84a6599756e` | no Git blob (untracked) | `human_gate` |
| `research/innhenting-2026-08-05/staging/frontiers-p-flow-norway-2023.html` | https://doi.org/10.3389/fsufs.2023.1248984 | discussion; ref. 12 = SINTEF 2020:00342 | `a53c3e5cd5e2a2a21feff75f650338bbd7c96d5d663b4bc08d8907589a17c014` | no Git blob (untracked) | `human_gate` |
| `research/innhenting-2026-08-05/staging/lovdata-forskrift-2023-12-11-2037.html` | https://lovdata.no/dokument/SF/forskrift/2023-12-11-2037 | §§ 1–3 | `ec09e81c924a3ef8da8a39783247208b980ad82258ddb98aa3dd87b122d3e6b2` | no Git blob (untracked) | `human_gate` |
| `research/innhenting-2026-08-05/staging/lovdata-forskrift-2023-12-11-2037.txt` | https://lovdata.no/dokument/SF/forskrift/2023-12-11-2037 | §§ 1–3 | `b1983e65a2dcf3c76e85f23b7bba772cb26df635ba6afcdf12d823f860c85e22` | no Git blob (untracked) | `human_gate` |

Source preservation was reverified after all work:

- HEAD: `d35b2065a3b67785aa53c1bed954649e70baacde`
- `git status --porcelain=v1 -uall` SHA-256: `a23d8498dfebb5bb44998b7d80e87d310b0b6c94cf6c1a029c7fed3f0c6c0653`

## GREEN and final gate evidence

| Command or assertion | Exit | Evidence |
|---|---:|---|
| Focused combined Node tests | 0 | 23 passed, 0 failed: provenance, selector binding, hash/value/year/unit negatives, refresh transaction, gzip, future manifest, and vault assertion. |
| `node --import=tsx --test tests/landscape/validate-norway-fsd-crosswalk.test.ts` after the final test-only type guard | 0 | 12 passed, 0 failed. |
| `npx tsc --noEmit` | 0 | No diagnostics. An earlier gate found two test-only possibly-undefined accesses; explicit fixture guards fixed them and both focused/runtime tests and TypeScript were rerun. |
| `npm run lint` | 0 | ESLint clean. |
| `npm run build` | 0 | Prisma generation, all-country metric computation, Next.js compilation, TypeScript, static generation, and traces completed. |
| Build side-effect proof | 0 | Exactly `dk`, `fi`, `is`, `no`, and `se` chart-metrics differed from `HEAD`; JSON comparison after removing only the root `generated` field was identical for every file. Each timestamp changed, then only those five explicit paths were restored; no metric residue remained. |
| `npm run landscape:report` | 0 | Report and 17-row evidence manifest rendered. |
| `npm run landscape:validate` | 0 | 40 main, 22 candidates/dispositions, 100 sources, 20 independent sources, 50 qualitative findings, 16 search passes. |
| `npm run test:landscape` | 0 | 30 passed, 0 failed. |
| `npm run landscape:norway-fsd:validate` | 0 | 60 indicators, 64 crosswalk rows, 31 sources. |
| `npm run vault:check` | 0 | `vault:check ok`. |
| `npm run audit:research-artifacts -- --base=origin/main` | 0 | 35 added paths, 5,876 tracked files, 0 violations. |
| Deterministic FSD rebuild | 0 | All four governed outputs retained identical SHA-256 values before/after regeneration: indicators `2cc50625…`, crosswalk `7ca14b16…`, source ledger `ea484465…`, report `4965119a…`. |
| FSD gzip/raw contract | 0 | Compressed: 7,336,927 bytes / `cd37ea4ddd80df3a94424e5cb16540ea6c53e4697d9a0cfb8d4ea21741d103f3`; decompressed: 88,884,423 bytes / `d155d1e2269169760fbdb0904199c54e4af7439c7493b65c8b4ae999e434002a`; raw CSV absent. |
| Full `npm test` in a TTY, polled to terminal completion | 1 | 2,528 passed, 1 failed, 1 skipped, 2,530 total, 123,987 ms. The sole failure is the governed corpus-health blocker below; there are no new failures. |
| `git diff --check` before staging | 0 | No whitespace errors. |

## Known governed blocker and untouched artifacts

The sole full-suite failure is `tests/lib/corpus-health-foundation.test.ts` → `recomputes immutable content, source and generation-output hashes`:

```text
health.snapshot.obsidian_vault source hash
actual snapshot:   sha256:468aad8b5ca9092ceb946793ec641425ee9e78ae8ac3ad91d7f8ea7002f760ff
current vault hash: sha256:b671c4eb48327bc3821cea3e958f6fe41b819b3bc0a441e22fb6bf98c00dbb3d
```

The governed refresh unconditionally requires `DATABASE_URL` and regenerates a dependent bundle. It was neither authorized nor invoked. `git diff --name-only -- knowledge/health` is empty, proving this wave did not touch the seven governed outputs:

1. `knowledge/health/corpus-health-source-snapshots.v1.json`
2. `knowledge/health/corpus-health-source-snapshot-history.v1.jsonl`
3. `knowledge/health/corpus-health-assessments.v1.jsonl`
4. `knowledge/health/corpus-health-current.v1.json`
5. `knowledge/health/corpus-health-summary.v1.json`
6. `knowledge/health/corpus-health-report.v1.md`
7. `knowledge/health/corpus-health-generation-manifest.v1.json`

No `DATABASE_URL`, `knowledge:health:generate`, network, CI, or external action was invoked. A future owner-authorized DB-backed refresh must regenerate this exact bundle and rerun the complete suite before the branch can be called a PR candidate.

## Changed paths

- `.superpowers/sdd/2026-08-29-visual-atlas-reconciliation/final-fix-report.md`
- `Food Systems Obsidian/10 Innsiktskart/Innsikter/I01 Triopolet – 93,4 % av butikkene.md`
- `docs/project/reconciliation/visual-atlas-disposition-2026-08-29.md`
- `research/landscape/norway-fsd-crosswalk-2026-08-10.jsonl`
- `scripts/build-norway-fsd-crosswalk.ts`
- `scripts/fetch-norway-fsd-snapshot.ts`
- `scripts/lib/norway-fsd-internal-metrics.ts`
- `scripts/obsidian-vault/build_innsiktskart.py`
- `scripts/validate-norway-fsd-crosswalk.ts`
- `tests/landscape/fetch-norway-fsd-snapshot.test.ts`
- `tests/landscape/norway-fsd-manifest-selection.test.ts`
- `tests/landscape/validate-norway-fsd-crosswalk.test.ts`
- `tests/lib/visual-atlas-reconciliation.test.ts`

## Decision boundary

Local offline fixes: complete.

PR candidate: **BLOCKED** by the governed corpus-health refresh only.

Not proven or authorized: push, pull request, merge, deployment, runtime SHA, authenticated UI, data import, external publication, contact, purchase, or rights approval.
