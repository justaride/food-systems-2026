# Root-controlled event-history anchor ledger

## What this boundary proves

This is the smallest supported separation between the user-writable repository and the corpus event-history trust decision. A root-owned append ledger can retain the exact hash of each anchor candidate and its prepared repository verification. The prepared evidence also binds the exact bytes of the corpus baseline, processing register and baseline-generation manifest. The controlled current-state command accepts a repository verification only when the complete external chain is valid and its exact latest head matches both the repository's latest candidate/verification pair and those three current baseline inputs.

This mechanism is **project-identity control**, represented by `controlled_project_identity`. It is not independent third-party notarization, a cryptographic signature, human review of source content, rights approval, or evidence of research completeness. A host administrator can still replace both the root-owned ledger and its head; detecting that stronger threat requires separately preserved or independently signed evidence that does not exist yet.

No current genesis candidate is prepared or written by this implementation. The registration plan explicitly requires a new corpus inventory and lifecycle initialization after the ten-source database mutation. A normal initialization with a new baseline `observedAt` also requires a new event manifest and therefore a new genesis candidate, because the current-state generator requires those timestamps to agree. The old candidate itself does **not** prove which baseline bytes exist; it binds only the event log and event manifest. Reusing it with another same-timestamp baseline would therefore be possible without the additional baseline bindings introduced here. The first prepared request must be made only against the explicit post-registration baseline, register, baseline-generation manifest and whichever event genesis that initialization validly produces.

## Tracked components and non-mutation rule

- `src/lib/knowledge/corpus-event-history-external-ledger.ts` defines and validates prepared requests, append records, the full chain, the latest-head sidecar, secure filesystem reads and the current-state verifier callback.
- `knowledge/schema/corpus-event-history-external-anchor-ledger.schema.v1.json` is the structural schema. Runtime domain hashes and cross-record checks remain mandatory.
- `scripts/knowledge/manage-corpus-external-anchor-ledger.ts` supports `--prepare`, `--check-external`, `--check-request` and `--verify-current-state`.

The tracked script never creates, changes or deletes the external ledger. It also never appends the prepared verification to the repository anchor log. There is deliberately no `--append`, `--install`, `sudo`, authentication or ownership-changing mode. Running user-controlled repository code as root would collapse the boundary this ledger is meant to create.

## External filesystem contract

The external root must be an absolute canonical path outside the repository. Every path component must be a real root-owned directory, never a symlink, and no component may be group- or world-writable. The external root mode is exactly `0755` so the normal project process can read proofs but cannot write them.

On macOS, `/var` is a symlink and is therefore rejected. Use the canonical `/private/var/...` spelling shown below; accepting the convenient alias would weaken the no-symlink rule.

The fixed files are:

| Path inside external root                   | Required state                                                                                 |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `corpus-event-history-anchors.v1.jsonl`     | root-owned regular file, one hard link, mode `0444`, canonical JSONL                           |
| `corpus-event-history-anchors-head.v1.json` | root-owned regular file, one hard link, mode `0444`, canonical pretty JSON                     |
| `.corpus-event-history-anchors.append.lock` | absent for every read; a separately controlled writer uses an exclusive root-owned `0600` lock |

The verifier opens files with no-follow semantics, checks identity and size before and after reading, rejects an active or stale lock, validates every domain-separated self-hash and predecessor, hashes the complete ledger bytes, and requires the head to match the exact count, first record, latest record, latest candidate and latest verification. Every external record carries the prepared baseline, register and baseline-generation-manifest path/hash/size bindings unchanged. A partial append, stale head, replacement race, truncation, duplicate binding, baseline substitution or rollback to a head that no longer matches the repository fails closed.

## Controlled append protocol

The root administrator needs a separately installed and reviewed writer outside this user-writable checkout. That writer is not part of the current implementation. Its transaction must:

1. create the fixed lock exclusively and refuse an existing lock;
2. re-read and validate the complete ledger and head after locking;
3. compare the prepared request's `externalHeadPrecondition` with the exact current head, or require both ledger files to be absent when the precondition is `null`;
4. reject a repeated request, candidate or verification hash;
5. append one canonical record with a contiguous sequence, predecessor hash and non-regressing timestamp;
6. build a new head over the complete new ledger bytes;
7. write root-owned `0444` temporary files, make them durable and replace ledger then head while holding the lock;
8. re-read the resulting pair and remove the lock only after exact verification succeeds.

The compare-and-swap head plus exclusive lock protects concurrent writers. A crash between ledger and head replacement leaves a mismatch or lock and therefore stops readers; recovery is a separate root-controlled operation, never an automatic project-side rewrite.

After the external append, `--check-request` verifies that the saved request is exactly the new external head and emits the already prepared `verificationRecord`. A separate controlled repository append writer must then compare the request's exact repository prefix, append only that one canonical record, and update the event checkpoint transactionally. Copying a hash into the repository without the successful external check does not create trust.

## User-side commands after rebaseline

All commands are read-only except that `--prepare` emits a request to standard output. Use the canonical root-owned path chosen by the administrator.

The preceding bootstrap replacement and its stoplines are defined in [CORPUS-PRE-LIVE-REBASELINE.md](CORPUS-PRE-LIVE-REBASELINE.md). The next request must use the rebaseline outputs; it binds the exact new baseline, processing register, baseline-generation manifest and new genesis candidate. An old candidate or request is not reusable.

Prepare the first request only after the new genesis exists and the administrator has created an empty secure external directory:

```bash
npx tsx scripts/knowledge/manage-corpus-external-anchor-ledger.ts \
  --prepare \
  --external-root=/private/var/db/food-systems-corpus-anchor \
  --verified-at=2026-08-04T12:00:00Z \
  --expect-empty-external
```

For later checkpoints, omit `--expect-empty-external`; the request then carries the exact current head as its compare-and-swap precondition.

Check the externally installed ledger:

```bash
npx tsx scripts/knowledge/manage-corpus-external-anchor-ledger.ts \
  --check-external \
  --external-root=/private/var/db/food-systems-corpus-anchor
```

After the separate writer has appended a saved canonical request, check the request without changing the repository:

```bash
npx tsx scripts/knowledge/manage-corpus-external-anchor-ledger.ts \
  --check-request \
  --external-root=/private/var/db/food-systems-corpus-anchor \
  --request=/absolute/path/to/saved-request.json
```

After the exact emitted verification has been appended through the controlled repository writer, verify the tracked current-state projection with the root-controlled callback:

```bash
npx tsx scripts/knowledge/manage-corpus-external-anchor-ledger.ts \
  --verify-current-state \
  --external-root=/private/var/db/food-systems-corpus-anchor
```

The ordinary portable current-state command intentionally has no external verifier. Once any trusted-verification record exists, it fails closed unless it is invoked through the controlled callback, including for an externally verified empty genesis.
