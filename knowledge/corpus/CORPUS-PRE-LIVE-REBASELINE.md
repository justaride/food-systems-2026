# Controlled pre-live corpus rebaseline

## Purpose and stopline

This is a one-time bootstrap replacement for the narrow interval after the locked ten-source registration has been applied and the exact live library ledger has been exported, but before any corpus lifecycle event or trusted anchor verification exists.

It does not perform the database registration, export the ledger, read source contents for analysis, mutate either private archive, verify source identity, create a lifecycle event, complete owner review, clear rights, authorize external use or promote coverage. Do not run an apply now. The default mode is a read-only plan printed to standard output.

The runner refuses to plan unless all of these are simultaneously true:

- the database is observed in a repeatable-read, read-only transaction at exactly 1,549 `Document`, 1,582 `LibraryAnalysisRecord` and one receipted `ControlledMutationAudit` row;
- the locked registration has exactly ten document targets, ten library-analysis targets, no dependent target rows and one self-consistent apply audit;
- the tracked library ledger is an exact export of all 1,565 active live rows;
- the old event log is exactly zero bytes, its manifest reports zero events, and its anchor log contains exactly one unverified genesis candidate with no trusted verification or external binding;
- the old baseline, live snapshot, ledger descriptor, register, generation manifests, current-state projection, event manifest and anchor log still match their sealed hashes;
- no previous rebaseline history, final rebaseline manifest or interrupted transaction journal exists.

If any event, trusted verification, external anchor binding, previous rebaseline history or unexplained file drift exists, this protocol is no longer the right operation and fails closed.

## Read-only plan

After the separately controlled source-registration apply and exact ledger export, create a plan without redirecting it over a tracked file:

```bash
export DATABASE_URL='postgresql://read-capable-role@host/database'
export FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT=/absolute/path/to/primary/corpus
export FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT=/absolute/path/to/replica/corpus

npm run knowledge:corpus:rebaseline:plan > /absolute/path/outside/repository/rebaseline-plan.json
```

Planning reads database metadata and the exact private registration targets only to verify the receipted after-state. It does not change the database, the private archives or tracked files. The emitted plan binds its own full SHA-256, an honest fresh `newObservedAt`, the source-registration plan and audit, the database observation, every compare-and-swap input, every proposed output, the historical bootstrap and the current exported ledger.

The receipt, exact target rows, core counts and all database inputs used to reconstruct the 1,565-row active inventory are read through one caller-owned `RepeatableRead` transaction after `SET TRANSACTION READ ONLY`. The tracked exported ledger is then compared with the captured rows row-for-row through the existing parity contract and bound by its exact file hash. The protocol does not describe two separate database reads as one snapshot.

Every file-shaped source-registration code binding carried by the receipted audit is also added to the rebaseline compare-and-swap set. Non-file runtime and generated-client-tree attestations remain sealed inside the audit-bound operation key and are recomputed during the mandatory pre-commit observation.

The acknowledgement printed to standard error contains the complete plan hash. A shortened hash, reconstructed plan, edited plan or acknowledgement copied from another run is rejected.

## Apply and recoverable transaction

Apply is intentionally separate and requires both the saved sealed plan and its exact acknowledgement:

```bash
npm run knowledge:corpus:rebaseline:apply -- \
  --plan-file=/absolute/path/outside/repository/rebaseline-plan.json \
  --ack=APPLY_CORPUS_PRE_LIVE_REBASELINE_PLAN_FULL_64_HEX_SHA
```

Before changing a tracked target, apply reproduces every proposed byte, rechecks every existing output through compare-and-swap, requires the history and final manifest paths to remain absent, re-observes the same database state read-only, and stages both the new bytes and durable backups. The journal binds old and new file modes as well as byte hashes; existing modes are preserved, new tracked files use `0644`, the journal and backups use `0600`, and transaction data is held in a `0700` directory. A self-hashed exclusive transaction journal is then changed from `staging` to `prepared` and made durable.

Each file replacement is atomic by itself. The bundle is explicitly described as a recoverable journaled transaction, not as one filesystem-wide atomic rename. Parent directories are synchronized after staging, journal replacement, every target rename, rollback and cleanup. The final rebaseline manifest is installed last.

Apply or recovery must run in an exclusive repository maintenance window: no other process may edit the bound inputs or outputs, and consumers must not read the tracked corpus bundle while renames are in progress. The exclusive journal prevents a second rebaseline writer, but it does not turn several tracked paths into one atomic filesystem snapshot. A consumer may treat the new bundle as committed only after the final manifest exists and all of its bindings verify.

If an ordinary in-process failure occurs, the runner restores the exact old bytes before returning the error. If the process or host stops between renames, the hidden journal and backups remain. A later apply refuses to continue and prints the exact recovery acknowledgement that is required. After confirming that no apply process is still running, recovery is explicit:

```bash
npm run knowledge:corpus:rebaseline:recover -- \
  --ack=RECOVER_CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_FULL_64_HEX_JOURNAL_SHA
```

Recovery accepts only two unambiguous states:

- if the final manifest and every output exactly match the journal, it preserves the completed bundle and removes only transaction files;
- otherwise, if every changed target is exactly either its sealed old or sealed new value and the final manifest is not installed, it restores every old value and removes newly created targets.

An unexpected third value, altered backup, manifest-with-incomplete-bundle, symlink or unknown transaction file stops recovery for manual inspection. Recovery never guesses.

## New tracked bootstrap

A successful apply produces a fresh baseline and live snapshot at one new `observedAt`, regenerates the processing register, queues, reports and manifests, creates an empty zero-byte event log and matching empty manifest, creates one new unverified genesis candidate, and regenerates the current-state projection. It also writes one sealed rebaseline-history record that retains the exact old bootstrap lineage, including the historical ledger descriptor that existed before the post-registration export.

The two legacy 1,555-row generators remain byte-for-byte unchanged so their old generation manifests continue to verify before this one-time transition. `build-corpus-pre-live-rebaseline-overlays.ts` supplies the proposed 1,565-row inputs in memory and records its own exact path, hash, size and compatibility rule in both new generation manifests. The compatibility baseline changes only the legacy generator's hard-coded assertion value; the new manifest binds the true 1,565-row baseline, all generated counts use 1,565, and the overlay is itself part of the final compare-and-swap dependency set.

The new state remains fail-closed:

- all identities remain provisional;
- source analysis remains disallowed;
- owner review and rights clearance remain incomplete;
- external use and coverage promotion remain false;
- the genesis candidate is not trusted and has no external binding.

The new rebaseline manifest is a commit receipt for the tracked bundle. It is not a lifecycle event, trusted timestamp, independent validation or completeness claim.

## External anchor next step

Only after the rebaseline has completed should the first external request be prepared with `manage-corpus-external-anchor-ledger.ts --prepare`. That request must bind the exact new baseline, new processing register, new corpus-generation manifest and new genesis candidate. The old genesis candidate or an earlier external request must not be reused.

See [ROOT-CONTROLLED-EVENT-HISTORY-ANCHOR-LEDGER.md](ROOT-CONTROLLED-EVENT-HISTORY-ANCHOR-LEDGER.md) for the separate external trust boundary.
