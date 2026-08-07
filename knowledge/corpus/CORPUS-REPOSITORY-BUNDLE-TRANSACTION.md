# Corpus repository bundle transaction

This module is the shared filesystem transaction primitive for a domain-specific corpus writer. It makes a multi-file repository change recoverable and fail-closed; it does not decide whether an anchor, event, analysis or lifecycle transition is valid.

`src/lib/knowledge/corpus-repository-bundle-transaction.ts` provides:

- exact compare-and-swap bindings for every existing input and `lstat`-based absence guards for every sealed-absent path;
- portable path validation, conservative case/Unicode-alias rejection, canonical root resolution, static symlink-ancestor rejection and one-link regular-file reads using `O_NOFOLLOW`;
- a self-hashed mode-`0600` journal written through a durable temporary file, mode-`0700` transaction data, durable staged outputs and exact backups;
- a second caller-owned domain revalidation before any target rename;
- deterministic rename order with a changed final commit marker installed last;
- explicit `committed` and `committed_after_recovery` outcomes, plus strongly acknowledged crash recovery;
- rollback that consumes journaled backups directly and can resume after a crash without leaving untracked restore files;
- a mandatory `confirmCommittedState` callback before a completed transaction or completed recovery may discard its journal and backups.

Every caller must seal a domain authorization artifact and pass its hash as `authorizationSha256`. The caller must include the complete repository compare-and-swap and absence set, reproduce all proposed output bytes, perform every database/external-ledger check in `revalidate`, and implement `confirmCommittedState` so an all-after repository bundle is not confused with domain-level completion. A no-op completion callback is permitted only in isolated unit tests.

The transaction is not one filesystem-wide atomic rename and it does not roll back a database, private archive or external ledger. Each target rename is atomic and durable individually; the journal makes an interrupted bundle classifiable and recoverable. The output paths and transaction-data directory must be on one filesystem.

## Exclusive-writer boundary

Apply and recovery require an exclusive maintenance window under a trusted local account. The repository root and all output ancestors must remain controlled and must not be renamed or replaced during the operation. Node's path-based filesystem API can reject static symlink and hardlink states but cannot provide `openat2`-style protection against a malicious concurrent same-account ancestor swap on macOS. The fixed journal prevents cooperating writers from starting a second transaction; it is not a hostile same-user sandbox.

`tests/lib/corpus-repository-bundle-transaction.test.ts` exercises successful commit, pre-commit rollback, CAS and absence drift, torn initial journal cleanup, staging/prepared/partial/post-marker crashes, recovery idempotence, domain completion confirmation, journal/data tampering, unreadable modes, unchanged markers, reserved paths, dangling symlinks, hardlinks, root symlinks and path aliases.
