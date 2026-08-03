# Repository trusted-verification appender v1

This contract governs one narrow repository-side operation: after the
root-controlled external ledger has already appended and sealed an exact
request, append that request's trusted-verification record to the repository
anchor log and regenerate the two derived files that change because the
checkpoint is now trusted.

The operation never writes the external authority. It creates no lifecycle
event, source analysis, identity decision, human approval, rights decision,
publication permission, coverage promotion or research-completeness claim.

## Fixed v1 eligibility

Production planning and apply fail closed unless the repository has exactly:

- 1,565 active identity rows;
- a zero-byte event log and a valid zero-event manifest;
- one and only one anchor record;
- that record as sequence-one genesis with a null predecessor;
- no existing trusted-verification pair; and
- the exact immutable baseline, processing register and baseline-generation
  manifest bound by the prepared request and latest external ledger record.

The historical 1,555-row genesis is explicitly ineligible. It must not be
anchored. Source registration, private recovery, exact ledger export and the
controlled pre-live rebaseline must first create the 1,565-row empty genesis.

The code exposes a named `test_only_fixture` identity-count policy solely so a
temporary repository fixture can exercise the transaction. It is accepted only
when `NODE_ENV=test`, is sealed into the plan, and cannot be selected by the
CLI. It is not production authority.

## Read-only plan

The external writer must already have appended the prepared request. The
request file is supplied by an absolute, normalized path outside the
repository. It must remain a one-link, non-symlink regular file with mode
`0400` or `0600`.

```bash
node --import tsx scripts/knowledge/append-corpus-trusted-verification.ts \
  --plan \
  --request=/absolute/path/outside/repository/request.json \
  > /absolute/path/outside/repository/trusted-verification-plan.json
```

Planning reads the fixed external authority at
`/private/var/db/food-systems-corpus-anchor`; no CLI option can redirect that
authority. The root-owned ledger and head are read with their existing secure
loader. The request must be the exact latest external append and still match
the repository's pending candidate and baseline inputs.

The exported plan, apply and recovery boundaries also load that fixed authority
internally in production. A caller-supplied external snapshot loader is
accepted only together with the sealed `test_only_fixture` policy while
`NODE_ENV=test`; supplying one to the production policy fails closed.

The self-hashed plan binds:

- raw request-file hash and size, request self-hash and request ID;
- raw external ledger and head hashes and sizes, record count and latest seals;
- candidate, verification and proposed two-record anchor-log seals;
- immutable baseline inputs;
- all current-state generator inputs plus this appender, the external verifier
  and generic transaction implementations;
- the complete sorted compare-and-swap set and its set hash;
- the exact ordered three output bindings and file modes; and
- byte-exact unchanged current-state rows and conflict queue.

Absolute request and plan paths are not serialized.

## Apply

Apply requires the canonical plan file, the same request file and the full
strong acknowledgement derived from all 64 hex characters of the plan hash.

```bash
node --import tsx scripts/knowledge/append-corpus-trusted-verification.ts \
  --apply \
  --request=/absolute/path/outside/repository/request.json \
  --plan-file=/absolute/path/outside/repository/trusted-verification-plan.json \
  --ack=APPLY_CORPUS_TRUSTED_VERIFICATION_FULL_64_HEX
```

Immediately before any target rename, apply reopens the request, reloads the
fixed external snapshot, validates the external append with the real external
verifier, rebuilds the proposal and requires byte equality with the sealed
plan. The generic repository transaction then rechecks every compare-and-swap
input.

Exactly these tracked files are replaced, in this order:

1. `corpus-processing-state-event-history-anchors.v1.jsonl`;
2. `corpus-processing-current-state-summary.v1.json`; and
3. `corpus-processing-current-state-generation-manifest.v1.json`.

The generation manifest is the final commit marker. The current-state JSONL,
conflict queue, event log, event manifest, baseline and processing register are
not rewritten and must remain byte-exact.

After the marker is installed, confirmation reads the normal repository state
without an anchor override. Both the anchor-chain reader and current-state
builder use `createCorpusExternalAnchorVerifier` against the exact external
snapshot. A permissive `() => true` verifier is never a production path.

## Recovery

A simulated or real interruption leaves the generic transaction journal and
durable transaction data for explicit recovery. Use the full generic recovery
acknowledgement printed by the transaction error or derived from the journal
self-hash:

```bash
node --import tsx scripts/knowledge/append-corpus-trusted-verification.ts \
  --recover \
  --request=/absolute/path/outside/repository/request.json \
  --plan-file=/absolute/path/outside/repository/trusted-verification-plan.json \
  --ack=RECOVER_CORPUS_REPOSITORY_BUNDLE_FULL_64_HEX
```

Before generic recovery is allowed, the request and external snapshot must
still match the plan. An existing journal must match the plan's authorization
hash, transaction kind and ID, final marker, ordered paths, output modes and
every before- and after-binding. Since v1 preserves each output's mode, both
the journaled before-mode and after-mode must equal the plan. If the commit
marker is installed, recovery confirms the
fully rebuilt, externally verified normal current state before cleaning the
journal. A partial transaction is rolled back by the generic writer; unknown
or tampered states remain untouched for inspection.

## Evidence boundary

The appender proves that the repository checkpoint is the exact checkpoint
recorded by the controlled external project-identity ledger. It does not prove
that any source has been read, understood, human-reviewed, rights-cleared or
made complete. Those remain later, separately evidenced gates.
