# Corpus and evidence health

This directory is the Gate 1 observatory for the repository, evidence corpus and research operations. It is deliberately separate from `knowledge/coverage/`.

Corpus health answers whether material can be found, traced, appraised, archived, reconciled and operated for a named use. It does **not** answer whether the Nordic food system has been researched completely. No health record may create or promote a coverage cell, and the four health profiles are non-additive. There is no overall health percentage.

## Four intended-use profiles

- `health_profile.internal_discovery`: finding and inspecting internal material with caveats;
- `health_profile.internal_analysis`: reproducible internal analysis on a reconciled lineage;
- `health_profile.external_evidence_support`: evidence suitable to support external claims;
- `health_profile.observatory_operations`: repeatable operation, monitoring and recovery.

Passing a lower profile never implies passing a higher one. Technical citation integrity does not replace appraisal. A URL does not replace an exact locator or durable archive. A draft, queue, dry-run or generated note does not become evidence merely because it is indexed.

## Whole-corpus processing baseline

Gate 1 now reads the manifest-bound corpus-processing register as the declared whole-corpus baseline. It validates every lifecycle record and independently derives its permissions instead of trusting old review labels. The current baseline contains 1,555 unique active identities. Of these, 1,537 bind exact source-content hashes representing 554,322,179 bytes; 11 known files are missing from the repository and 18 identities have no file locator. Content deduplication produces 1,467 processing units.

These are inventory and integrity facts only. Current full-text lifecycle completion is 0/1,555. Gabriel's owner review is 0/1,555. Owner-confirmed source roles, independent expert validations, partner validations, rights-holder validations, rights clearances, publication approvals, external-use permissions and separate coverage approvals are all zero. AI can perform and document the processing work, but it cannot silently turn that work into Gabriel's decision or another person's independent, partner or rights-holder validation.

The tracked PDF batch contains fifteen technically qualified PDF units, zero technical failures and 772/772 expected pages. Technical extraction emitted 272,545 words, with 35 warning pages and twelve open identity blockers: two legacy-alias scope blockers and ten unregistered-source candidate blockers. These numbers prove only that the tracked extraction artifacts cross-bind correctly. They do not mean that AI has read or analyzed the documents, that the ten candidates are registered corpus sources, that Gabriel has reviewed them, or that rights, publication or coverage gates have passed. Portable tracked validation is complete; live verification of private archive roots was not performed and requires explicit private-root inputs.

The canonical review contract has eight independent layers: AI processing, owner review, independent expert validation, partner validation, rights-holder validation, rights clearance, publication and coverage promotion. The five legacy Gate 2C statuses retain an unclassified human-review component. Only the machine-checked part of `machine_checked_human_review_pending` maps to AI processing. A legacy human-status label creates zero canonical human approvals until named signer identity, gate role, authority or qualifications, affiliation, conflict declaration and exact scope are evidenced.

The health generator binds and validates these inputs before it may report the counts:

- corpus-processing summary, generation manifest and full lifecycle register;
- lifecycle TypeScript contract and JSON Schema;
- canonical review-layer contract and JSON Schema;
- PDF extraction summary and generation manifest, whose own checker validates the full tracked page-map, receipt and blocker bundle.

Any hash mismatch, unexpected schema field, invalid lifecycle, mismatched derived permission or changed Gate 2C mapping fails closed.

## Generated artifacts

- `corpus-health-source-snapshots.v1.json` binds repository files and the read-only database query to hashes;
- `corpus-health-source-snapshot-history.v1.jsonl` preserves every assessment's immutable source-snapshot set;
- `corpus-health-assessments.v1.jsonl` is an append-only assessment ledger;
- `corpus-health-current.v1.json` is a hash-bound pointer, not a mutable truth row;
- `corpus-health-summary.v1.json` is a compact machine readout;
- `corpus-health-report.v1.md` is the human-readable Gate 1 report;
- `corpus-health-generation-manifest.v1.json` hashes generated outputs.

Thresholds are `proposed` until a named human adoption receipt is added. A generator may calculate a current machine verdict and receipt-resolve an exactly reproducible machine-observable conflict, such as migration-name and checksum parity. It cannot adopt thresholds or assert owner, independent expert, partner or rights-holder approval. A machine receipt cannot close evidence-appraisal, rights, publication, production-parity or human-governance gates, and publication never automatically promotes subject coverage.

## Commands

```bash
npm run knowledge:health:generate
npm run knowledge:health:check
npm run knowledge:library-history:check
```

Generation uses a repeatable-read, transaction-level read-only database snapshot. The database locator is redacted; only a salted-free SHA-256 identity, migration ledger hash, query hash and result hash are stored. `--check` recomputes the full bundle against the base commit pinned in the generation manifest, so committed generated outputs remain verifiable while later source or database drift still fails closed.

Historical assessments are immutable. If observations change, create a new assessment that names the prior assessment in `supersedesId`; never rewrite the old event.

The retained-library-history check is a separate read-only control. It requires exact live inventory/materialization parity, verifies every additional persisted row by row ID, identity, content hash, live counterpart and non-external usage boundary, and runs inside a repeatable-read transaction marked `READ ONLY`. Passing it records an accepted, contract-bound history tension; it does not approve deletion, relinking, appraisal or external use. Metadata-only projection updates remain a separate freshness queue.
