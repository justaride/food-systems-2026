# Controlled source-registration dry-run contract v1

## Purpose

This contract prepares one exact, hash-sealed and **read-only** registration plan for the ten official PDF candidates declared in `knowledge/corpus/source-registration/source-registration-batch-2026-08-02.v1.json`. It does not register a source. It does not verify source identity, start source analysis, clear rights, authorize publication or promote coverage.

The active project objective authorizes the bounded dry-run inspection. It does **not** establish that Gabriel has reviewed the resulting plan hash, and it does not authorize a later operator to apply it.

## Inputs that must agree

The generator fails closed unless all of these exact layers agree:

1. the source-registration batch and its pinned acquisition, extraction and input-generation batch file hashes;
2. each acquisition-batch source, acquisition-receipt file hash and domain-separated internal receipt seal;
3. each extraction target, qualification-receipt file hash and internal receipt seal;
4. each page-map file hash and internal page-map seal;
5. each source-analysis input-manifest file hash, generation-manifest output binding and internal manifest seal;
6. the raw PDF, raw extracted page text and normalized page text in both explicitly supplied private roots, including exact hash, byte size and mode;
7. a live database snapshot read under `RepeatableRead` after `SET TRANSACTION READ ONLY` proves `transaction_read_only=on`.

The private roots must be explicit absolute directories, mode `0700`, distinct directories and must contain distinct regular files at mode `0400`. Their absolute paths, device numbers and inode numbers are never written to the plan. Source text is read only to validate hashes and derive the intended `Document.content` hash; source text is never stored in the plan.

## Planned identities and rows

For a target `Document.id`, the canonical corpus identity is `document:<Document.id>`. The lifecycle source ID is derived deterministically as `source.` plus the first 24 lowercase hexadecimal characters of the SHA-256 of that identity. The `LibraryAnalysisRecord.id` is derived independently from the same identity.

The plan contains exact projections for:

- one provisional `Document` row whose omitted `content` value is bound to the exact normalized-page bytes joined with the declared v1 page boundary;
- one inventory-only `LibraryAnalysisRecord` with `not_started` analysis and `not_reviewed` owner state;
- one portable private-recovery row with rights still `pending_not_cleared`.

The full `Document.content` and any existing analytical text are represented only by hashes, sizes and safe metadata. Database-created timestamps are fixed to the plan observation timestamp for a future exact plan, while equality classification ignores historical `createdAt` and `updatedAt` values.

## Database classification

The read-only transaction searches `Document` by `id`, `slug`, `filePath` and `url`. It searches `LibraryAnalysisRecord` by planned row ID, `sourceKey`, `documentId`, `canonicalPath` and content hash.

Each target is classified as:

- `pending`: no relevant database rows collide;
- `already_registered`: exactly one `Document` and one `LibraryAnalysisRecord` match every planned target field;
- `conflict`: any duplicate, non-exact, mixed or partial state is observed, or the private-recovery register has a non-exact identity/path/hash collision.

Existing source or analysis text is not copied into the snapshot. Row fingerprints include hashes of the complete observed rows, so drift remains detectable without storing their text.

## Apply boundary and required future gates

There is no apply implementation. `--apply` terminates immediately before archive or database inspection. A future, separately reviewed writer must not reuse the dry-run as authority. It must require all of the following:

1. explicit operator authorization bound to the exact current plan hash; the current broad project scope is not that authorization;
2. a fresh backup using metadata version 2 and a successful restore receipt version 1, both bound to the same database identity and exact target fingerprint;
3. a `Serializable` transaction, advisory lock and compare-and-swap re-read of the exact before-snapshot;
4. atomic insertion of the exact `Document`, `LibraryAnalysisRecord` and append-only `ControlledMutationAudit` rows;
5. an audit binding the contract, plan, before/after/dependency snapshots, database identity, target fingerprint, backup, restore, operator, authorization and writable non-MCP role;
6. post-registration append of the exact portable private-recovery rows and a **fresh** controlled-private acquisition receipt for each canonical lifecycle source ID; the pre-registration HTTPS receipt cannot satisfy this gate;
7. an exact after-snapshot, corpus inventory rebaseline and provisional lifecycle initialization.

Identity remains provisional after registration. Source analysis, external use and coverage promotion remain false.

## Dry-run invocation

```text
node --import=tsx scripts/knowledge/generate-source-registration-plan.ts \
  --dry-run \
  --primary-corpus-root=<explicit-private-primary-root> \
  --replica-corpus-root=<explicit-private-replica-root> \
  --output=knowledge/corpus/source-registration/source-registration-dry-run-plan-2026-08-03.v1.json
```

The output path is repository-relative and is created exclusively; an existing plan is never overwritten. Regenerate a new plan whenever any file binding, private byte stream or database snapshot changes.
