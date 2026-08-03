# Private-recovery acquisition contract v1

This contract controls one narrow post-registration file operation. It may
preserve the existing 11 private-recovery candidates, append the exact 10 rows
already frozen in the locked source-registration plan, create 10 new
`controlled_private_access` receipts bound to the canonical lifecycle source
IDs, and create one final apply receipt. It does not write the database, run a
corpus rebaseline, initialize lifecycle state, store source text, or promote any
review/readiness field.

## Fixed prerequisite

The source-registration database operation must already be an exact receipted
after-state: 10 exact `Document` rows, 10 exact `LibraryAnalysisRecord` rows,
zero dependency rows and one self-consistent `ControlledMutationAudit`. Plan
generation uses the read-only
`inspectReceiptedSourceRegistrationAfterState` verifier. The acquisition plan
binds the complete audit with a domain-separated audit hash, its internal
summary seal, database identity, before/after snapshot seals, dependency seal,
target fingerprint and operation key.

The dry-run registration plan remains the source of all ten portable recovery
rows. Every target must still be `pending`, every private recovery action must
still be `pending_append`, and every conflict list must be empty. The old HTTPS
acquisition receipts are evidence of the earlier fetch, but cannot satisfy this
gate because their source IDs predate canonical lifecycle registration.

## Exact plan

The plan is a complete byte plan, not a list of intentions. It contains:

- the exact 11-row before register and its raw-file and semantic manifest seals;
- the exact 21-row after register, with the original 11 rows byte-semantically
  preserved and the 10 new rows appended in locked target order;
- both verified private-copy attestations for each target, using only portable
  paths, storage-root IDs, hashes, sizes and modes;
- each complete canonical controlled-private receipt, its internal receipt seal,
  exact output path, raw-file hash and size;
- one complete apply receipt used as the final commit marker, with both its
  internal seal and exact file seal;
- exact bindings for the source-registration plan, database audit, runtime,
  runner, both operation JSON Schemas, this contract, the upstream acquisition
  receipt schema and the three upstream runtimes used to validate the
  prerequisite.

The plan's domain-separated operation key binds every input, recovery snapshot,
copy attestation and controlled-private receipt. The plan has its own separate
domain-separated self-hash. Neither source text nor a private absolute path is
permitted anywhere in the tracked plan or receipts.

## Default and authorization behavior

No argument-free invocation can mutate state. The default is `--check`, which
is read-only and requires `DATABASE_URL` in the process environment plus
explicit private-root locations. Database credentials are never accepted as a
command-line flag and therefore are not exposed in the process argument list.
`--plan` is an explicit file write that freezes the exact plan after all
read-only prerequisites pass. `--apply` additionally requires both the exact
plan self-hash and the strong acknowledgement derived from that self-hash.

Operator-supplied database and private-root locations are never serialized.
Both private-root arguments must be raw absolute paths that resolve to their
own canonical real directories. Each root must be wholly outside the canonical
repository root: neither the repository nor a private root may contain the
other. The primary and replica roots must also be non-nested as well as distinct
directories. A repository-local `private/` folder is not a private archive for
this operation.
The only supported writer is the CLI in
`scripts/knowledge/manage-private-recovery-acquisition.ts`; calling its lower
level file writer without the CLI's live-input verifier is outside this
contract.

## Live compare-and-swap gates

Immediately after acquiring the exclusive project lock, apply must reverify:

1. the complete acquisition plan and every internal/file seal;
2. the source-registration plan bytes and semantic self-hash;
3. every implementation dependency hash;
4. the exact database audit in a read-only transaction;
5. both private corpus roots as distinct real mode-`0700` directories;
6. all 20 private PDF leaves as real, single-link, mode-`0400` files with the
   planned hash and size, with primary and replica resolving to distinct files;
7. the recovery register as either the exact 11-row before state or, only during
   an exact journal-bound resume/replay, the exact 21-row after state.

Before the register changes, the complete upstream receipted-after-state
inspector is used. During resume/replay, when that upstream inspector's old
11-row register binding can no longer pass by design, the same exported database
row inspector is run directly in a read-only transaction: all 10 Document rows,
all 10 LibraryAnalysisRecord rows, zero dependencies, the one audit, migration
ledgers, database identity, core counts and after-state fingerprint must still
match the sealed receipt. Exact private normalized pages are reconstructed only
for this comparison and are never serialized by this operation.

Existing intermediate or leaf symlinks are rejected. Tracked and private leaf
hard links are rejected. Output paths are portable and must remain inside the
canonical project root.

For every tracked or private leaf read, mode, link count, device, inode, size,
modification time and change time must match across the path check, opened file
descriptor and final path/descriptor checks. The canonical root and every
existing ancestor are checked again before the leaf descriptor closes. After
the first twenty private-copy reads, all twenty leaves are reopened, rehashed
and compared with their complete first-pass physical metadata in one collective
final barrier. Both private root directories are then reopened; canonical path,
mode, device, inode, link count, size, modification time and change time must
still match the initial observations, and the outside/non-nested boundary is
checked again. A hash match alone is not sufficient if file or root metadata
changed during the verification window.

Plan, apply and check require an exclusive maintenance window under a trusted
local account for both private roots. The path and descriptor barriers reject
static or persistent swaps. Node on macOS has no `openat2`-style API that can
make a path-based reader a hostile same-account sandbox if an attacker can swap
an ancestor and restore it entirely between checks; that operating boundary is
therefore explicit rather than presented as cryptographic proof.

## Durable mutation protocol

Apply creates and fsyncs a durable journal before the first output. It writes
the ten acquisition receipt files first, replaces the recovery register with an
atomic compare-and-swap rename, and writes the apply receipt last. Every file is
post-write re-read, and every affected directory is fsynced. New output files
use a same-directory staging file and an atomic no-overwrite link. The final
apply receipt is the only commit marker.

If execution stops after any durable step, exact partial outputs are not treated
as success. A retry may resume only when the durable journal names the exact
operation and plan-file hash, every present output has the planned bytes, and
all live inputs still pass. A conflicting byte, missing commit dependency,
foreign journal, unexpected link or unjournaled partial state fails closed.
An exact complete bundle is an idempotent receipted no-op and creates no second
receipt.

A process crash can leave the exclusive lock file. Removing it requires the
separate `--recover-stale-lock` mode, the same exact plan, a matching operation
key and proof that the recorded process no longer exists.

## Deliberate boundaries

All 10 appended rows retain:

- `repositoryAvailable: false`;
- `fullTextReviewed: false`;
- `rightsState: pending_not_cleared`.

The apply receipt declares zero database, corpus-register, lifecycle,
rebaseline, source-text and full-text-review mutations. Human identity,
analysis, rights, owner, expert and publication validation remain later gates.
Completion of this file operation is not research completeness and does not
permit coverage promotion or external use.
