# Whole-corpus processing

This directory is the controlled work surface for processing every source identity in the active Food Systems 2026 corpus. It records what exists, what can be opened, what has actually been processed, what still needs Gabriel's review, and what later needs independent, partner, rights-holder, rights, publication or coverage decisions.

It does not treat a file, word count, stored summary, search hit or technical extraction as researched knowledge.

## Current baseline

The baseline observed on 2026-08-02 is bound to an exact metadata-only snapshot of the live database:

| Boundary                                         | Current result |
| ------------------------------------------------ | -------------: |
| Active source identities                         |          1,555 |
| Identity/content-set parity failures             |              0 |
| Retained-history rows, separate and non-additive |             17 |
| Repository files present                         |          1,526 |
| Private recovery captures recorded               |             11 |
| Identities without a source locator or bytes     |             18 |
| Content-hash-bound identities                    |          1,537 |
| Deduplicated full-text processing units          |          1,467 |
| Full-text AI analyses complete                   |              0 |
| Source roles confirmed by Gabriel                |              0 |
| Owner reviews complete                           |              0 |
| External-use-ready sources                       |              0 |
| Coverage promotions allowed                      |              0 |

The 1,555 identities remain distinct even when content hashes or normalized paths match. Duplicate queues reduce repeated processing work; they do not automatically delete, merge or resolve source identity.

## Processing chain

```text
exact source identity and bytes
  -> technical availability and text qualification
  -> full-text AI processing with bound inputs and outputs
  -> structured source analysis and cross-checking
  -> Gabriel's source-role confirmation and owner review
  -> any required independent, partner or rights-holder validation
  -> separate rights and publication decisions
  -> separate coverage assessment
  -> compiled database, wiki, Obsidian, app and MCP projections
```

Each arrow requires evidence of its own. A later state is never inferred from an earlier one.

The bounded acquisition and recursive discovery rules are in [SOURCE-DISCOVERY-PROTOCOL.md](SOURCE-DISCOVERY-PROTOCOL.md). Exact network receipt and two-copy archive controls are in the [controlled source-acquisition workflow](workflows/controlled-source-acquisition-v1.md). The detailed reading and reconciliation rules are in [SOURCE-ANALYSIS-PROTOCOL.md](SOURCE-ANALYSIS-PROTOCOL.md). The independent review axes are defined in [REVIEW-LAYER-CONTRACT.md](../review/REVIEW-LAYER-CONTRACT.md).

## Generated register

The main generated surfaces are:

- `corpus-processing-register.v1.jsonl` — one fail-closed lifecycle record per active identity;
- `corpus-processing-summary.v1.json` and `corpus-processing-report.v1.md` — compact machine and human readouts;
- `corpus-full-text-processing-queue.v1.jsonl` — 1,467 content-addressed processing units;
- `corpus-role-classification-queue.v1.jsonl` and `corpus-owner-review-queue.v1.jsonl` — all 1,555 identities pending Gabriel's decisions;
- duplicate, missing-file and private-recovery queues — unresolved operational work without automatic promotion;
- `corpus-live-inventory-snapshot.v1.json` — exact source-kind, identity and content-hash boundary from the live inventory;
- `corpus-processing-generation-manifest.v1.json` — input and output hashes for portable reproduction.
- `corpus-processing-state-events.v1.jsonl`, its separate prefix-anchor chain and `corpus-processing-current-state.v1.jsonl` — the fail-closed event source and derived current state; non-empty projection requires a trusted anchor verifier. See [CORPUS-PROCESSING-CURRENT-STATE.md](CORPUS-PROCESSING-CURRENT-STATE.md).

The portable summary intentionally says that live database and private-archive checks were not performed in that run. Those checks are explicit operational commands and are not persisted as timeless facts.

The one-time post-registration bootstrap replacement is specified in [CORPUS-PRE-LIVE-REBASELINE.md](CORPUS-PRE-LIVE-REBASELINE.md). Its default is a read-only, self-hashed plan. Apply is permitted only after the exact receipted ten-source database after-state and exact exported ledger exist, while the event log is still empty and no trusted history exists. It preserves the old bootstrap in a sealed lineage record and does not promote readiness or coverage.

## Controlled acquisition and PDF technical batch

Thirteen acquisition receipts bind exact credential-free HTTPS fetches to protected, physically separate primary and replica copies. Three receipts cover previously identified sources. Ten cover newly discovered official sources that are deliberately still `unregistered_source_candidate`: they have no database identity and receive no coverage or analysis credit.

The current PDF batch covers all fifteen unique byte streams: 772 pages and 272,545 extracted words. All fifteen pass technical extraction, with 35 warning pages, including one blank page and twenty low-text pages, and no technical failures. Three established sources are identity-verification candidates. Two sources have legacy aliases that do not match the recovered documents. The ten newly acquired sources are blocked pending controlled database registration. The resulting twelve nontechnical blockers are explicit, and source analysis remains disallowed for every unit.

These numbers measure receipt, archive and extraction controls only. They do not mean that any source has completed identity verification, AI analysis, owner review, rights clearance, publication approval or coverage assessment.

## Commands

Portable checks, suitable for the normal repository gate:

```bash
npm run knowledge:processing-contracts:check
npm run knowledge:corpus:check
npm run knowledge:pdf-pages:check
npm run knowledge:source-analysis-input:check
```

The rebaseline plan is expected to fail before the locked database apply and exact ledger export. Saving, applying and recovering a plan are controlled operations described in the rebaseline contract; no rebaseline apply has been run by this implementation work.

Controlled acquisition is separately gated. A check-only run validates a declared batch, existing receipts and both private copies without fetching or overwriting anything. Network execution requires the explicit `--execute-network` flag described in the workflow; a successful fetch still creates no database row.

Explicit live checks:

```bash
npm run knowledge:corpus:check:live

export FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT=/path/to/private/corpus
export FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT=/path/to/private/corpus/replica
npm run knowledge:corpus:check:private
npm run knowledge:pdf-pages:check:private
npm run knowledge:source-analysis-input:check:private
npm run knowledge:corpus:rebaseline:plan
```

Private source bytes and normalized full text stay outside Git. Tracked artifacts contain hashes, counts, portable locators and processing state, not private absolute paths or source text.

## Known stoplines

- Eleven recovered captures still need rights decisions for intended uses.
- Eighteen identities have neither a source locator nor recoverable bytes.
- Two recovered PDFs have identity/alias mismatches.
- Ten newly acquired official PDFs require controlled database registration before identity verification can start.
- All fifteen qualified PDF units remain blocked from source analysis until their exact identity and lifecycle prerequisites are satisfied.
- All machine-proposed source roles remain provisional until Gabriel signs an exact role-confirmation receipt.
- Sápmi remains a separate, overlapping, non-additive scope and cannot receive substantive credit without a rights-holder-led route.
- Exhaustiveness can be claimed only against explicit, repeatable search universes and stopping rules. Processing the current 1,555 identities is necessary, but it is not proof that every relevant Nordic source has been found.
