# Corpus event-checkpoint finalizer v1

This contract controls Phase 2 of one corpus lifecycle-event checkpoint. Phase
1 has already installed exactly one sealed non-owner event, its matching event
manifest and one pending history-anchor candidate. The root-controlled external
ledger has then appended the exact prepared request for that candidate.

`scripts/knowledge/finalize-corpus-event-checkpoint.ts` accepts those fixed
inputs, proves that the repository still represents the exact Phase 1 result,
appends only the trusted verification already sealed in the externally appended
request, and publishes the resulting trusted current-state projection as one
recoverable repository transaction.

The finalizer never writes the external authority and never creates or repairs
an event, candidate, verification, evidence artifact or Phase 1 plan.

## Exact successor eligibility

Production planning, apply and committed-state confirmation fail closed unless
all of the following are true:

- the repository contains exactly one pending history-anchor candidate after
  the latest trusted pair;
- the pending candidate binds the current event log and event manifest;
- the current event log contains exactly one event beyond the preceding
  externally trusted checkpoint;
- that event is `technical_text_extracted`, `identity_verified` or
  `source_analysis_applied`;
- `source_role_owner_confirmed_ready_package` and every other owner or human
  decision event are rejected by this v1 finalizer;
- the supplied Phase 1 pending-event plan is canonical, self-hashed and binds
  the exact repository event log, event manifest, candidate, evidence replay
  and hypothetical projection now being finalized;
- the supplied request is canonical, self-hashed and binds that exact pending
  candidate and the immutable repository baseline inputs; and
- the fixed external ledger is exactly one record ahead of the repository's
  trusted-verification pairs, with the supplied request as its exact latest
  append.

The verification appended to the repository is byte-semantically the
verification already contained in that request. The finalizer does not create a
new timestamp, verifier decision or substitute successor.

## Three stable authorization files

Keep these three files at stable absolute paths outside the repository:

1. the externally appended request, for example
   `/absolute/secure/path/corpus-external-anchor-request.json`;
2. the Phase 1 plan produced by `append-corpus-pending-event.ts`, for example
   `/absolute/secure/path/corpus-pending-event-plan.json`; and
3. the finalizer plan produced below, for example
   `/absolute/secure/path/corpus-event-checkpoint-finalizer-plan.json`.

Each must remain a single-link, non-symlink regular file with mode `0600` and
unchanged bytes. Create the destination with `mktemp` before redirecting output
so shell defaults cannot create a mode-`0644` authorization file. Do not
regenerate, copy over, truncate, rename or replace the request or Phase 1 plan
after the external append. The finalizer plan seals their raw hashes, sizes and
internal self-hashes; absolute private paths are not serialized into it.

## Read-only plan

Planning reads the repository, the two stable predecessor files, the fixed
external authority and the event's evidence. It writes nothing inside the
repository:

```bash
FINALIZER_PLAN_FILE="$(mktemp /absolute/secure/path/corpus-event-checkpoint-finalizer-plan.XXXXXX)"
node --import=tsx scripts/knowledge/finalize-corpus-event-checkpoint.ts \
  --plan \
  --request=/absolute/secure/path/corpus-external-anchor-request.json \
  --pending-plan-file=/absolute/secure/path/corpus-pending-event-plan.json \
  > "$FINALIZER_PLAN_FILE"
```

Preserve the reported acknowledgement and the exact file at
`$FINALIZER_PLAN_FILE`. The self-hashed finalizer plan binds the raw request and
Phase 1 plan, fixed external ledger and head, immutable baseline inputs, current
pending repository bundle, resolved event evidence, complete sorted
compare-and-swap set, all proposed output bytes and modes, transaction order and
safety boundary.

## Proving the deliberately old projection

Phase 1 deliberately leaves four canonical projection files at the previous
trusted checkpoint while the event log, event manifest and anchor candidate are
one event ahead. The finalizer must prove that this is the intended stale state,
not unrelated drift.

It removes only the one pending event and candidate in memory, reconstructs the
exact preceding event-log prefix and event manifest, validates the preceding
anchor prefix with the real verifier for every earlier trusted pair, and
regenerates the preceding current-state rows, summary, conflict queue and
generation manifest. All four reconstructed outputs must equal the existing
canonical files byte for byte. A mismatch stops planning or apply.

Only after that proof does the finalizer append the externally verified record
in memory and run the normal trusted current-state generator for the complete
successor. The event log and event manifest are not rewritten in Phase 2; they
remain compare-and-swap inputs bound by both plans and the pending candidate.

## Apply

Apply requires the same request, Phase 1 plan and finalizer plan plus the full
64-hex acknowledgement derived from the finalizer plan hash:

```bash
node --import=tsx scripts/knowledge/finalize-corpus-event-checkpoint.ts \
  --apply \
  --request=/absolute/secure/path/corpus-external-anchor-request.json \
  --pending-plan-file=/absolute/secure/path/corpus-pending-event-plan.json \
  --plan-file="$FINALIZER_PLAN_FILE" \
  --ack=APPLY_CORPUS_EVENT_CHECKPOINT_FINALIZER_FULL_64_HEX
```

Immediately before the first target rename, apply reopens the stable inputs,
reloads the fixed external snapshot, reconstructs the old projection, replays
the event evidence, rebuilds the trusted successor and requires byte equality
with the sealed plan. The generic transaction then rechecks every
compare-and-swap input.

Exactly these tracked files are replaced, in this order:

1. `corpus-processing-state-event-history-anchors.v1.jsonl`;
2. `corpus-processing-current-state.v1.jsonl`;
3. `corpus-processing-current-state-summary.v1.json`;
4. `corpus-processing-state-conflict-queue.v1.jsonl`; and
5. `corpus-processing-current-state-generation-manifest.v1.json`.

The generation manifest is the final commit marker. Its installation means all
four earlier output renames have occurred; it does not by itself bypass the
required post-commit domain confirmation.

## Fixed external authority

Production always reads
`/private/var/db/food-systems-corpus-anchor`. No CLI option or plan field can
redirect that authority. The request must be the exact latest external append,
and the external ledger must remain exactly one record ahead until the
repository verification is committed. A copied hash, an unappended request or
a permissive verifier does not establish trust.

Planning and apply require an exclusive maintenance window under the trusted
local project account. The filesystem transaction protects against ordinary
drift, crashes and cooperating writers; it is not a hostile same-account
filesystem sandbox.

## Marker-aware recovery

A process interruption leaves the generic self-hashed journal, backups and
transaction data for explicit recovery:

```bash
node --import=tsx scripts/knowledge/finalize-corpus-event-checkpoint.ts \
  --recover \
  --request=/absolute/secure/path/corpus-external-anchor-request.json \
  --pending-plan-file=/absolute/secure/path/corpus-pending-event-plan.json \
  --plan-file="$FINALIZER_PLAN_FILE" \
  --ack=RECOVER_CORPUS_REPOSITORY_BUNDLE_FULL_64_HEX
```

Recovery first authenticates the finalizer plan and journal locally, including
transaction kind and ID, authorization hash, exact ordered paths, before/after
bindings, modes and final marker. It then distinguishes two cases:

- **Marker absent:** a known pre-marker partial transaction is rolled back from
  the journal and backups. This rollback must not depend on reading the request,
  Phase 1 plan, external authority or private evidence, even though their paths
  remain part of the CLI authorization surface.
- **Marker installed:** recovery treats the bundle as potentially committed and
  performs the full domain confirmation before cleanup. It reopens the stable
  request and Phase 1 plan, reloads the fixed external authority, replays the
  evidence and requires the normal trusted generator to reproduce the complete
  five-file successor exactly.

Unknown, tampered or non-reproducible states remain untouched with the journal
and transaction data preserved for inspection. Recovery never guesses whether
an external append should be repeated and never mutates the external ledger.

## Evidence and completion boundary

A successfully finalized checkpoint proves that one eligible lifecycle event
and its evidence package replayed deterministically, that its exact successor
was verified by the controlled external project-identity ledger, and that the
repository projection matches that trusted checkpoint.

It does **not** prove the event's substantive claims are true, that a person has
reviewed the source or analysis, that an owner or independent reviewer has
approved it, that a rights holder has validated use, that rights or publication
permission are cleared, that external use is allowed, or that coverage has been
promoted. It also does not prove that Nordic food-system coverage is complete or
that every relevant PDF, document, source, actor, relationship or flow has been
researched.
