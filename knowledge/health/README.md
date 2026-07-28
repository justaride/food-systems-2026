# Corpus and evidence health

This directory is the Gate 1 observatory for the repository, evidence corpus and research operations. It is deliberately separate from `knowledge/coverage/`.

Corpus health answers whether material can be found, traced, appraised, archived, reconciled and operated for a named use. It does **not** answer whether the Nordic food system has been researched completely. No health record may create or promote a coverage cell, and the four health profiles are non-additive. There is no overall health percentage.

## Four intended-use profiles

- `health_profile.internal_discovery`: finding and inspecting internal material with caveats;
- `health_profile.internal_analysis`: reproducible internal analysis on a reconciled lineage;
- `health_profile.external_evidence_support`: evidence suitable to support external claims;
- `health_profile.observatory_operations`: repeatable operation, monitoring and recovery.

Passing a lower profile never implies passing a higher one. Technical citation integrity does not replace appraisal. A URL does not replace an exact locator or durable archive. A draft, queue, dry-run or generated note does not become evidence merely because it is indexed.

## Generated artifacts

- `corpus-health-source-snapshots.v1.json` binds repository files and the read-only database query to hashes;
- `corpus-health-source-snapshot-history.v1.jsonl` preserves every assessment's immutable source-snapshot set;
- `corpus-health-assessments.v1.jsonl` is an append-only assessment ledger;
- `corpus-health-current.v1.json` is a hash-bound pointer, not a mutable truth row;
- `corpus-health-summary.v1.json` is a compact machine readout;
- `corpus-health-report.v1.md` is the human-readable Gate 1 report;
- `corpus-health-generation-manifest.v1.json` hashes generated outputs.

Thresholds are `proposed` until a named human adoption receipt is added. A generator may calculate a current machine verdict and receipt-resolve an exactly reproducible machine-observable conflict, such as migration-name and checksum parity. It cannot adopt thresholds or assert human, partner or rights-holder approval, and a machine receipt cannot close evidence-appraisal, production-parity or human-governance gates.

## Commands

```bash
npm run knowledge:health:generate
npm run knowledge:health:check
npm run knowledge:library-history:check
```

Generation uses a repeatable-read, transaction-level read-only database snapshot. The database locator is redacted; only a salted-free SHA-256 identity, migration ledger hash, query hash and result hash are stored. `--check` recomputes the full bundle against the base commit pinned in the generation manifest, so committed generated outputs remain verifiable while later source or database drift still fails closed.

Historical assessments are immutable. If observations change, create a new assessment that names the prior assessment in `supersedesId`; never rewrite the old event.

The retained-library-history check is a separate read-only control. It requires exact live inventory/materialization parity, verifies every additional persisted row by row ID, identity, content hash, live counterpart and non-external usage boundary, and runs inside a repeatable-read transaction marked `READ ONLY`. Passing it records an accepted, contract-bound history tension; it does not approve deletion, relinking, appraisal or external use. Metadata-only projection updates remain a separate freshness queue.
