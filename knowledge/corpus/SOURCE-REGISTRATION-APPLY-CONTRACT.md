# Controlled source-registration apply contract v1

## Status and narrow purpose

This is a separately reviewable, fail-closed writer for the exact ten pending targets in the locked source-registration plan. The default mode is read-only. The existence of the writer, a broad project instruction, an operator label or a valid backup does **not** authorize a mutation. This implementation has not been run with `--apply`.

`--apply` and the standalone `--rehearse-logical-clone` mode are deliberately quarantined in this revision. The launcher returns `APPLY_TRUSTED_ENTRYPOINT_REQUIRED` or `REHEARSAL_TRUSTED_ENTRYPOINT_REQUIRED` before reading their database credential or private inputs. Neither public mode has a supported execution path until the purpose-bound FD3/FD4/FD5 trust-anchor and execution-snapshot protocol used by the logical-restore companion has been generalized, tested and independently reviewed for that purpose. The trusted logical-restore companion may run only the fixed internal rehearsal child described below; that narrow nested path does not unquarantine either public launcher mode.

The only permitted first transaction is:

- create exactly 10 `Document` rows from the locked projections and reconstructed private normalized-page bytes;
- create exactly 10 inventory-only `LibraryAnalysisRecord` rows;
- append exactly 1 `ControlledMutationAudit` receipt in the same transaction.

It must write zero private-recovery rows, corpus-register rows, lifecycle events, citations or appraisals. Identity, rights, human review, source analysis, external use and coverage promotion all remain false after this transaction.

## Locked plan and database target

The runner accepts only:

- plan path `knowledge/corpus/source-registration/source-registration-dry-run-plan-2026-08-03.v1.json`;
- semantic plan SHA-256 `631fef2595bf8f9e897485c1f064654716a3bdb2591bbfb20227370d496a4e2f`;
- plan-file SHA-256 `7a8de0151ad9d0c77bb7bb47a01c3bd08922805e933a5b379aea3dd59b84def9`;
- before-snapshot SHA-256 `77ac2b8fb968b573f53448522d1bf121012d9b19f3ab8f131b23e599e53d44b5`;
- primary database identity UUID `90e3e24d-230f-42f7-b178-5bcd5b861e84`;
- exactly 10 pending targets, zero already-registered targets and zero conflicts.

The exact PostgreSQL target is independently sealed as database `foodsystems`, system identifier `7620055716543368057`, server address `127.0.0.1/32`, port `5432` and server-version number `160013`. Its target hash is `56afe01ba2f7acafa069c55e5cef1b7f380ae7d3a6f77b01da72509ce652ee5f`. Backup metadata must name the same source database.

The reviewed live catalog for `Document`, `LibraryAnalysisRecord`, `ControlledMutationAudit` and `DatabaseIdentity` is sealed by catalog-v2 hash `7d8bdb71153177983fbe5d191b06a1cb3d8635e5b0f91a1d0eff0a0e942f8e10`. The attestation includes database, relation, column and function owners and ACLs; role attributes; RLS and replica-identity settings; defaults and generated expressions; constraints; indexes; policies; rules; extensions; and every non-internal trigger, its enabled state and its function definition. It additionally binds the complete definitions and security properties of the two functions used by `Document.search_vector`: `public.immutable_to_tsvector_no(text)` and `public.immutable_array_to_string(text[])`. Apply refuses any scoped catalog drift.

The post-write comparison reads each `Document` as raw `to_jsonb` from PostgreSQL and requires the exact catalog-proven physical column set. This includes the Prisma-unsupported `embedding` value and the stored generated `search_vector` value; neither can be silently omitted by the ORM.

Any changed plan, implementation, source input, runtime, database target, catalog or database content requires a new review and new exact bindings. The runner never regenerates or overwrites the locked plan.

## Read-only modes

Both modes require explicit absolute private roots. No private absolute path is stored in tracked artifacts, output or the audit.

`--plan-only` is the default. It verifies the locked plan and self-hash, tracked inputs and internal seals, both private copies, reconstructed content hashes, exact database target and identity, the reviewed catalog, both migration-ledger representations, exact pre-plan counts, absence of target collisions, zero target dependencies and zero matching audit receipts. Its database work uses `RepeatableRead` plus `SET TRANSACTION READ ONLY`.

`--verify-release-evidence` additionally verifies one fresh metadata-v2 backup, one successful structural-restore receipt v1, one logical-restore companion receipt v1 and its exact nested logical-clone rehearsal receipt. It verifies archive and sidecar bytes, structural catalog, exact dump and metadata hashes, source database name, database identity, migration ledger, all core counts, target fingerprint, structural restore checks, the logical-comparison proof, source/restored full-content digests and counts, rehearsal rollback, post-rehearsal clone full-state match, post-rehearsal source match, clone drop and confirmed absence. Both logical evidence files must be canonical outside-repository mode-`0400` regular single-link files and must match their explicit file/self/proof pins. It then compares that evidence with the same live pre-plan state in a read-only transaction.

The structural backup verifier and helper are file-hash bound before use, copied byte-for-byte into a private temporary directory, executed from those exact copies, checked unchanged after execution and removed. Their child receives a fixed minimal environment without the database credential or launcher capability.

`pg_restore` is now covered together with `psql`, `createdb` and `dropdb` by the strong PostgreSQL toolset closure. Other host utilities invoked by the structural shell verifier (the shell, `awk`, `mktemp`, `grep`, `rm` and the available SHA-256 utility) remain an explicit operating-system toolchain trust boundary; they are not recursively closure-attested by this contract. Exact verifier/helper bytes plus the strong Node and PostgreSQL closures do not imply a complete host-utility closure.

Read-only example with operator-supplied private locations:

```text
node --import=tsx scripts/knowledge/apply-source-registration-plan.ts \
  --plan-only \
  --primary-corpus-root=<explicit-absolute-primary-private-root> \
  --replica-corpus-root=<explicit-absolute-replica-private-root>
```

## Sole mutation authority

An exact, fresh Ed25519-signed release-authorization envelope is one mandatory mutation authority, but it is intentionally insufficient while the trusted apply entrypoint remains quarantined. The verifier accepts only the pinned public key and key ID, a strict schema and the exact expected claim set. The signed body binds the plan, semantic contract, operation key, dependency state, code bindings, runtime attestation, database target, reviewed catalog, target set, live logical content state, backup and structural-restore evidence, logical-restore companion file/completion, nested rehearsal file/self hashes, rehearsal operation key/runtime/completion, logical-comparison proof, post-rehearsal source/clone match flags, the strong four-binary PostgreSQL toolset closure, the pinned Codex AI operator, exact database role `foodsystems`, validity window, unique authorization ID, exact acknowledgement and all false human/rights/readiness claims. The authorization ID is idempotent only against the exact current database receipt state; no global consumption claim is made before an independent external anchor exists.

The broad owner/project scope remains a truthful scope record only. The CLI `exact-plan-operator:` reference is a descriptive, hash-bound label only. Neither field grants authority, and neither can replace the signed envelope. The exact database role must equal PostgreSQL `current_user`, must not have MCP/read-only naming semantics and must prove the required table privileges.

The signed envelope with its embedded `signatureBase64` and the private signing key remain outside the repository. Only the public key, schema, verifier, contract and tests are tracked. Signing consumes controlled file-descriptor or environment inputs so private key bytes and private paths do not appear in arguments, output or receipts.

This is a drift, accident and fail-closed control for a non-compromised workstation. It is not hardware-backed adversarial isolation. A same-UID attacker could replace locally writable Homebrew files between checks, alter the running process, or copy the locally accessible signing key; post-run rehashing detects ordinary drift but does not eliminate that threat. Independent key custody, hardened execution and an external root anchor remain later gates.

## Pre-import runtime boundary

The former direct repository command is not an authorized apply entrypoint:

```text
node scripts/knowledge/launch-locked-source-registration-apply.mjs --apply <all-exact-pins>
```

It now fails closed before private input use. Direct runner apply is also refused. A future supported apply must start from an independently prepared, audited, mode-`0400` launcher copy in a fixed mode-`0700` `/tmp` directory. Its external bootstrap must start absolute Node in a clean pre-Node environment, pass the same executing inode as FD3, canonical unlinked public pins as FD4 and canonical unlinked purpose-bound secret input as FD5. The copied launcher must create and attest a private execution snapshot, match all caller-frozen pins and only then read FD5.

The logical-restore companion already uses this trusted path. Before its secret descriptor is read, the copied builtins-only launcher verifies and self-hashes:

- the exact Node version, platform, architecture, executable and recursively resolved Homebrew Mach-O runtime closure;
- the complete resolved external `node_modules` tree;
- the complete generated Prisma-client tree;
- the local project import closure for the launcher, apply runner, controlled logical-restore companion, receipt-pair recovery journal, controlled rehearsal command runner, logical database digest and runtime verifiers;
- the exact `psql`, `pg_restore`, `createdb` and `dropdb` executables and their recursive Homebrew loader closure plus the bound system dyld-cache closure.

Every inherited `NODE_*`, `OPENSSL_*`, `PRISMA_*`, `TSX_*`, `DOTENV_CONFIG_*`, `DYLD_*` and `LD_*` variable, and any Node execution flag cause the launcher to refuse. The runner does not auto-load the project `.env`. Launcher-only variables are recreated exactly for the unlinked, read-only attestation descriptor passed to the companion. The launcher recomputes the complete snapshot attestation after the child exits and refuses any drift. Protection against a preloaded module executing before this JavaScript begins is an external clean-bootstrap requirement; an in-process environment check cannot establish that fact retroactively.

The logical-restore companion is reachable only through the fixed launcher mode `--logical-restore-companion`. Before the `tsx` preload receives database URLs, private roots or evidence paths, the copied builtins-only parent requires every caller-frozen Node, `node_modules`, Prisma, launcher, local-closure, apply, rehearsal and PostgreSQL-toolset pin to equal the snapshot's attested bytes. It then launches only the fixed companion runner with an exact environment allowlist and a fresh unlinked mode-`0400` descriptor whose self-hashed envelope is purpose-bound to `logical_restore_companion`. The child checks descriptor continuity, parent PID, purpose, inner attestation self-hash, caller runtime pins and active Node binary before it reads evidence or constructs any database operation. This child envelope is a continuity and misuse guard, not independent authentication against a hostile same-UID process. Direct companion execution is refused. Companion stdout is withheld until the parent has re-attested the complete runtime after child exit.

The trusted companion does not invoke the quarantined standalone rehearsal launcher mode. Immediately before its nested rehearsal child, it re-verifies all companion tool bindings, fully recomputes the source-registration runtime attestation and requires the result and code bindings to equal the inherited snapshot. It then starts the exact rehearsal runner directly with the active absolute Node executable, the pinned `tsx` runtime configuration and all five exact rehearsal code pins. The child receives a newly created canonical, unlinked, mode-`0400` FD3 envelope containing only the inherited runtime attestation, the companion PID and the domain-separated envelope self-hash. The companion verifies descriptor mode, link count and file identity around the child; the existing rehearsal parser verifies the exact envelope shape, parent PID and both hashes before private work. Its exact environment contains the disposable clone URL, proof, private corpus roots and output path, but never the production source URL or restore-admin URL. The companion repeats the full runtime and tool re-attestation after the child, including on child failure. Database-free integration and attack tests cover the accepted envelope, missing or misidentified descriptors, wrong mode or link count, descriptor drift, wrong parent or purpose and an inner-hash-tampered runtime.

The two private companion receipts are published through a persistent, hash- and inode-bound pair journal. The rehearsal receipt is promoted first and the companion final is the sole commit marker. A later invocation that finds a committed pair preserves the receipts and journal, returns the fixed nonzero diagnostic `COMPANION_RECEIPTS_ALREADY_COMMITTED`, and never synthesizes a PASS; separate full release-evidence validation must establish whether that preserved pair is usable. Recovery removes only exact journal-owned uncommitted staging/orphan paths before replay; replacements and corrupt journals fail closed. The journal contains basenames, hashes and filesystem identities, never private absolute paths.

All declared runtime, generator-import, schema, authorization, restore, backup, test, package-lock and generated-tree bindings in the `codeBindings` envelope are folded into one code-bindings hash, then into the dependency-state hash and operation key. This explicitly includes the launcher integration test that proves the minimal environment, dotenv isolation and both strong runtime verifiers. Apply requires each declared current value as an explicit pin and rehashes it under lock.

## Mandatory apply gates

These gates remain the frozen specification for the future trusted apply path. In the current revision they are not reachable at all because the launcher quarantine runs first. Once the purpose-bound trusted entrypoint exists, `--apply` must remain unreachable unless every explicit gate matches:

1. acknowledgement `REGISTER_10_LOCKED_OFFICIAL_SOURCES_PLAN_631FEF2595BF`;
2. all locked plan, before-state, database identity, database target and catalog pins;
3. the current semantic apply-contract, code-bindings, dependency-state and operation-key hashes;
4. every declared current tracked file and test binding in the `codeBindings` envelope, plus its package-lock, generated-client, runtime-tree and executable bindings;
5. operator ID, separate owner-scope record, descriptive exact-plan label and exact database role;
6. a valid pinned-key Ed25519 release-authorization envelope with its embedded signature;
7. exact backup, structural-restore, logical-companion and nested-rehearsal paths plus dump bytes/hash, metadata hash, structural receipt hash, companion file hash, rehearsal file/self hashes, logical-comparison proof hash, migration-ledger hash and target-fingerprint hash;
8. ordered evidence no older than 24 hours, stable-re-read and semantically revalidated during preflight, under the transaction lock and after commit;
9. exact source artifacts, both mode-`0400` private copies and reconstructed content, reverified after lock acquisition.

No implicit flag, inherited environment authority, broad instruction or MCP database connection can substitute for these gates.

## Mandatory logical-clone surrogate rehearsal

The exact production target is not treated as rehearsable: any committed test write there would itself be the first exact mutation. Before authorization can be frozen, the controlled backup/restore lifecycle must therefore run the shared 10 + 10 + audit mutation core against its disposable logical clone while that clone still exists. The rehearsal uses `Serializable`, verifies all physical `Document` columns and the generated search vector, appends the surrogate audit inside the transaction, deliberately throws a dedicated rollback sentinel, and then proves in a separate read-only transaction that counts returned to baseline and all target and rehearsal-audit rows are absent.

This is explicitly a `logical_clone_surrogate`, not the exact production target. Its canonical private receipt records `exactProductionTargetExercised: false`, `productionAuthorizationUsed: false`, `transactionRolledBack: true` and `firstExactMutationRemainsLive: true`. The controlled runner launches the locked internal rehearsal command path through the nested FD3 trust handoff described above and binds the rehearsal runtime, schema, test, command runner, apply-runner hash, exact target-set hash, runtime attestation, logical-comparison proof and rehearsal receipt file/self hashes. The public standalone rehearsal flag remains quarantined. The companion then re-digests the clone and source, proves the clone still fully matches and the source has not moved, and only then proves clone drop/absence. An ad hoc import or a rehearsal after the clone has already been dropped is not acceptable evidence.

## Transaction, complete live-state CAS and replay behavior

Apply uses PostgreSQL `Serializable` and advisory transaction lock `6538086643221537792`. It discovers and locks every public table, partitioned table and materialized view with `SHARE ROW EXCLUSIVE`, then rejects any relation-inventory change. These locks block ordinary writes and relation-level DDL that needs an incompatible lock on an already discovered relation. They do not globally prevent a non-cooperating session from creating an unrelated schema object, function, sequence or relation. A declared operational DDL-quiescence window is therefore mandatory; scoped catalog and relation-inventory checks detect reviewed-scope drift but do not claim global DDL exclusion. The reviewed baseline contains 56 public data relations.

Under those scoped locks, the runner re-verifies code, runtime, private inputs, evidence, exact database target and reviewed catalog. Immediately before mutation it computes a deterministic logical digest over the public data-relation inventory, canonical row contents and sequence state with the exact bound `psql` runtime. Relation and function definitions are covered separately by the scoped catalog-v2 attestation; the logical content digest does not claim to hash all definitions. The full live content state must equal the state in the signed restored authorization; the reviewed baseline contains 555,189 rows across 56 relations and zero sequence rows. This is the final compare-and-swap boundary, not a count-only check.

It also requires the same primary identity, completed migration ledger, core counts and target fingerprint; all 10 target identities absent; zero dependencies; and zero matching receipts. Partial, already-present without receipt, duplicate, conflicting, drifting or mixed state aborts. Database uniqueness constraints remain a second fail-closed layer.

After exactly 10 + 10 creates, the runner re-reads every complete target row and zero-dependency state, seals the after-snapshot, constructs the mutation summary and appends one audit in the same transaction. It then performs a post-commit read-only receipt verification and repeats the runtime attestation.

An exact after-state with exactly one self-consistent receipt is a receipted no-op only when it also equals the exact current CLI authorization, signed authorization envelope, structural and logical evidence, proof hashes and code bindings. The signed envelope is re-read under lock, the comparison repeats after the audit append and after commit, and no second audit is created. Historical receipt inspection is explicitly read-only and does not itself authorize replay. An exact after-state without its receipt is a conflict, not a repair opportunity.

## Audit and receipt durability boundary

The receipt lives only in `ControlledMutationAudit.mutationSummary`; the runner creates no tracked receipt file. Its JSON shape is defined by `knowledge/schema/source-registration-apply-receipt.schema.v1.json` and enforced again by domain-separated runtime self-hashes.

The audit binds the contract, plan, exact authorization, code and runtime; database target and catalog; backup, restore and live-content state; database identity, ledgers and counts; target, row and dependency hashes; exact mutation totals; and all false readiness and promotion boundaries. A recursive computed boundary check refuses source-text fields, private absolute paths and credential-bearing text before sealing the receipt.

The current database audit is **trigger-protected append-only**, but it is not independently immutable. The database owner can alter the protective trigger or underlying state. The receipt therefore records `independentlyImmutable: false`, `ownerTamperable: true` and `externalRootAnchorRequired: true`. An external root anchor is still pending and remains a separate completion gate.

## Deliberate next gates

Registration alone does not make the sources researched, identity-verified, citable, rights-cleared, human-reviewed or coverage-complete. Portable private-recovery registration, controlled-private acquisition receipts, corpus rebaseline, lifecycle initialization, research extraction, claim review and external anchoring are later, separately evidenced operations. They must prove this exact receipt before proceeding.
