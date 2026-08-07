# Pending corpus-event writer v1

This contract controls the first half of one corpus lifecycle-event append. It
accepts exactly one already sealed canonical event, verifies the repository's
current externally trusted head, replays the proposed event and all of its
evidence in memory, and atomically installs only:

1. the extended event log;
2. the matching sealed event manifest; and
3. one new unverified history-anchor candidate, installed last.

The anchor log is the transaction commit marker. The candidate binds the exact
new event-log and manifest bytes. It is a request for external verification,
not a trusted verification.

## Deliberate two-phase stopline

The writer does **not** publish the hypothetical current-state rows, summary,
conflict queue or generation manifest. Those canonical files remain byte-exact
at the previous trusted checkpoint. Their old generation manifest is therefore
deliberately stale while a candidate is pending, and ordinary consumers fail
closed. After the root-controlled external ledger appends the exact prepared
request, a separate event-checkpoint finalizer must append the verification and
publish the derived projection as one transaction.

There is no `allow pending` path in the normal current-state generator. The
special proposed replay API is in-memory only, requires a real verifier for all
earlier trusted pairs, requires the proposed head to remain untrusted, and has
no writer.

V1 permits only `technical_text_extracted`, `identity_verified` and
`source_analysis_applied`. It rejects
`source_role_owner_confirmed_ready_package`, because that event requires a
separately installed human-authentication verifier. Protected owner,
source-role, independent, partner, rights-holder, rights, publication and
coverage axes must remain byte-semantically unchanged in the hypothetical
projection. External use and coverage promotion remain false.

## Production authority and eligibility

Production always reads the fixed root-controlled authority at
`/private/var/db/food-systems-corpus-anchor`. Exported build, apply and recovery
functions cannot redirect it. A caller-supplied snapshot is accepted only with
a plan sealed as `test_only_fixture` while `NODE_ENV=test`; the CLI exposes no
test override.

The repository must have exactly 1,565 active identities, a latest externally
trusted checkpoint, no pending candidate, a byte-current canonical projection,
and exact baseline/register bindings matching the external authority. The old
1,555 genesis is not eligible.

The input event must be an absolute, normalized, outside-repository, non-symlink
mode-`0400` or `0600` single-link file no larger than 8 MiB. It contains exactly
one canonical JSONL event. The event must extend both the global and target
identity chains and bind the exact pre-state. Evidence replay resolves tracked
artifacts and controlled private bytes; the plan records hashes, sizes and
portable locators, never source text or absolute private paths.

## Plan, apply and recovery

Planning is read-only:

```bash
PLAN_FILE="$(mktemp /absolute/path/outside/repository/pending-event-plan.XXXXXX)"
node --import=tsx scripts/knowledge/append-corpus-pending-event.ts \
  --plan \
  --event=/absolute/path/outside/repository/event.jsonl \
  > "$PLAN_FILE"
```

`mktemp` creates the required single-link mode-`0600` plan file. Keep the
reported path in `PLAN_FILE` for apply or recovery; do not replace it through a
normal mode-`0644` shell redirection.

The self-hashed plan binds the raw event file, fixed external snapshot,
repository baseline, previous canonical bundle, hypothetical projection and
resolved evidence, complete sorted compare-and-swap set, exact three outputs
and preserved file modes. Planning never creates an event or repairs a payload;
the supplied event must already be sealed and valid.

Apply requires the byte-identical plan, event and full 64-hex acknowledgement:

```bash
node --import=tsx scripts/knowledge/append-corpus-pending-event.ts \
  --apply \
  --event=/absolute/path/outside/repository/event.jsonl \
  --plan-file="$PLAN_FILE" \
  --ack=APPLY_CORPUS_PENDING_EVENT_FULL_64_HEX
```

Immediately before the first rename, the writer reopens the event, reloads the
fixed external authority, replays all evidence, reconstructs the complete plan
and rechecks every compare-and-swap input. The generic durable transaction
installs the anchor last. A normal error rolls back. A process interruption
leaves the self-hashed journal and backups for explicit recovery with the exact
generic recovery acknowledgement:

```bash
node --import=tsx scripts/knowledge/append-corpus-pending-event.ts \
  --recover \
  --event=/absolute/path/outside/repository/event.jsonl \
  --plan-file="$PLAN_FILE" \
  --ack=RECOVER_CORPUS_REPOSITORY_BUNDLE_FULL_64_HEX
```

Recovery authenticates transaction kind, plan authorization, ordered paths,
before/after hashes and modes. A fully installed anchor marker is retained only
after the pending repository state, unchanged canonical projection, event
input, external authority and hypothetical evidence replay all reproduce the
plan. Partial known states roll back; unknown bytes remain for inspection.

Plan, apply and recovery require an exclusive maintenance window under the
trusted local project account. The path, descriptor, compare-and-swap and
replay barriers detect ordinary drift and persistent substitution; they are not
presented as a hostile same-account filesystem sandbox.

## Evidence boundary

A committed pending checkpoint proves only that one event package is
structurally and evidentially reproducible and awaits external checkpoint
verification. It does not prove human review, rights clearance, publication
permission, coverage completeness or that every Nordic food-system source has
been researched.
