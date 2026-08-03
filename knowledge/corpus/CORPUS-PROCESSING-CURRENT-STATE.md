# Corpus processing current-state contract v1

Status: strict internal foundation

The immutable processing register is the baseline. The current-state register is a deterministic projection of that baseline plus a validated event chain. Append-only is an enforced workflow policy, not a claim that a local file can never be rewritten. Files or analysis artifacts appearing in the repository do not change lifecycle state by themselves.

## Current initialization

The initial event log is empty and the projection contains all 1,555 baseline identities at state version `0`. Every identity therefore remains at its baseline lifecycle state. This is an infrastructure milestone, not evidence that source analysis or research coverage is complete.

The generated surfaces are:

- `corpus-processing-state-events.v1.jsonl` — hash-chained source of accepted state changes;
- `corpus-processing-state-event-manifest.v1.json` — sealed event-log hash, count and high-water mark;
- `corpus-processing-state-event-history-anchors.v1.jsonl` — separate prefix candidates and trusted-verification records;
- `corpus-processing-current-state.v1.jsonl` — one derived, sealed row per baseline identity;
- `corpus-processing-current-state-summary.v1.json` — counts only from the validated projection;
- `corpus-processing-state-conflict-queue.v1.jsonl` — empty after a successful strict projection;
- `corpus-processing-current-state-generation-manifest.v1.json` — input/output hashes, written last.

## Four event types

1. `technical_text_extracted` validates the sealed PDF qualification receipt and sealed normalized-input manifest, then records text availability only.
2. `identity_verified` revalidates the exact acquisition receipt and raw source bytes, then validates the identity artifact against the current lifecycle, source, content, extraction and input-manifest bindings.
3. `source_analysis_applied` validates the analysis, identity and input artifacts, applies one explicitly bound execution to one identity, and stops at `cross_check`.
4. `source_role_owner_confirmed_ready_package` atomically validates Gabriel's source-role receipt through a separately configured trusted authentication verifier, validates a sealed ready package, then advances AI processing to `ready_for_owner`.

The fourth event does not equal owner approval. Owner review, independent validation, partner validation, rights-holder validation, rights clearance, publication and coverage promotion remain separate receipted lifecycle gates.

## Chain and conflict rules

Every event seals its canonical body and binds:

- the immutable baseline-row hash;
- the exact pre-state version, complete state hash and lifecycle hash;
- the global sequence and previous global event hash;
- the identity sequence and previous identity event hash;
- one record ID and one identity key.

Projection aborts before replacing any outputs if it encounters an invalid self-hash, stale pre-state, duplicate event, identity fork, global-chain break, global timestamp regression, orphan target, artifact file-hash mismatch, resolver value/byte mismatch, symlink escape, invalid artifact seal or lifecycle/permission inconsistency. A successful run therefore has an empty conflict queue; rejected input is not published as a partial current state.

## Append-prefix and trust-anchor boundary

The event manifest alone is not treated as proof of history. A separate anchor-record log alternates between:

1. `history_anchor_candidate`, which binds the exact event-log byte prefix, event count, event set, head hashes and event-manifest bytes; and
2. `history_anchor_trusted_verification`, which binds that exact candidate and must be accepted by a configured trusted verifier.

Every later candidate must extend the previously verified event prefix. Rewriting or truncating an earlier prefix breaks its recorded hash. A self-hashed candidate or a self-declared verification is still not trust: for every non-empty current checkpoint, replay requires the external verifier callback to accept every verification record in the chain. That verifier must recognize the exact checkpoint as authentic **and not superseded by a later trusted checkpoint**. The tracked command has no verifier configured and therefore fails closed on a non-empty log.

The current empty genesis has one explicit `history_anchor_candidate` and no trusted verification. That bootstrap exception is permitted only because there have never been live events and there are zero state changes. It is not external notarization, and the project does not claim that an independent third party currently preserves this anchor. A local full rollback to the bootstrap files cannot be disproved by self-hashes alone. Before the first live event, the genesis candidate must therefore receive separately preserved evidence and a trusted verification record; the trusted verifier then becomes the non-superseded-head authority. The new event checkpoint must receive its own verification before it can be projected.

## Hash and human-evidence boundaries

Baseline rows, lifecycle states, lifecycle receipts, current-state rows, events, shared executions, execution membership and ready packages use separate hash domains. A hash from one domain cannot be substituted for another.

Every lifecycle receipt is recomputed from its exact canonical body. Named human reviewers must also carry authentication evidence, and a human event remains candidate-only until a separately configured trusted verifier accepts the exact reviewer, receipt and event binding. A self-asserted name, an arbitrary evidence hash or a re-hashed receipt is not decision authority.

Content-hash evidence distinguishes:

- `repository_file_verified`;
- `private_capture_attestation_recorded`;
- `private_live_verified`;
- `unavailable`.

The eleven private recovery hashes remain `private_capture_attestation_recorded`. Portable generation does not misstate them as live private verification.

## Deduplicated execution

One technical or AI execution may be shared for identical source bytes, but state application is never shared implicitly. Each affected identity requires its own event with its own baseline and pre-state binding. `automaticFanOutAllowed` is always `false`.

## Commands

Initialize the event log exactly once:

```bash
npx tsx scripts/knowledge/generate-corpus-processing-current-state.ts --initialize-events
```

For an already existing **empty** genesis log created before the anchor contract, initialize only its unverified anchor candidate once:

```bash
npx tsx scripts/knowledge/generate-corpus-processing-current-state.ts --initialize-history-anchor
```

Generate the projection or verify that tracked outputs are current:

```bash
npx tsx scripts/knowledge/generate-corpus-processing-current-state.ts
npx tsx scripts/knowledge/generate-corpus-processing-current-state.ts --check
```

The initializer refuses to overwrite an existing event log, manifest or anchor-record log. The anchor-only initializer refuses non-empty logs and refuses to overwrite an anchor. Neither command creates a trusted verification. No real source event is included in the v1 initialization.

When an identity event references controlled private source bytes, replay also requires `FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT` or `FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT`, according to the event locator. The generator verifies the resolved bytes and never writes the private absolute path or source content into tracked current-state files.
