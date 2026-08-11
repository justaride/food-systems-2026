# Source-registration release authorization

Status: controlled pre-human-validation contract for one exact registration batch.

This layer replaces self-asserted command-line authorization with a canonical Ed25519-signed envelope. The registration runner must verify the envelope with the one pinned tracked public key before any apply path becomes reachable. A caller-supplied operator string, acknowledgement, hash flag or owner-scope reference is not authorization by itself.

## What the signature means

The signer is the pinned local Codex/AI operator `codex-ai:food-systems-2026-local-operator` for this bounded project step. It authorizes at most the exact 10 `Document` creates, 10 `LibraryAnalysisRecord` creates and one trigger-protected `ControlledMutationAudit` append named by the frozen operation. The signed mutation also requires acknowledgement `REGISTER_10_LOCKED_OFFICIAL_SOURCES_PLAN_631FEF2595BF` and database role `foodsystems`.

The envelope deliberately records all of the following as `false`:

- human approval;
- Gabriel's review of the exact hashes;
- independent expert validation;
- rights-holder approval;
- lifecycle or source-analysis promotion;
- external-use approval;
- any other database write.

The signing key is a dedicated local file, readable by the workstation owner, and is not hardware-backed or independently held. The signature therefore proves possession of this bounded local operator key and exact byte bindings. It is not an independent human, legal, rights, expert or production approval.

This control assumes a non-compromised local workstation. A same-UID attacker could replace locally writable runtime files between checks, alter a running process or copy the local private key. The closure checks and post-run hashes are drift and fail-closed controls, not hardware-backed isolation from that attacker.

## Exact signed bindings

The signed body binds:

- semantic plan, plan file, before-snapshot, database identity and target set;
- final apply-contract, dependency-state, operation key and complete code-binding state;
- exact source database name, database target attestation and database catalog attestation;
- full logical content digest for all public data relations;
- backup bytes/hash, metadata, structural-restore receipt, migration ledger and target fingerprint;
- the complete logical-restore companion file hash and completion time, plus the nested logical-clone rehearsal file hash, self-hash, operation key, runtime-attestation hash and completion time;
- the logical-comparison proof hash, exact source/restored content digests, post-rehearsal clone full-state match, post-rehearsal source match, and successful clone drop/absence;
- restore runner, backup verifier, backup-contract helper, logical-digest implementation, `psql` binary and its runtime closure;
- the ordered structural-restore, rehearsal and companion completion times, with each evidence timestamp fresh and not future-dated;
- pinned AI operator identity, exact database role, exact acknowledgement, nonce, issue time, activation time and expiry.

The final contract and dependency hashes are signed only after the implementation is frozen. The authorization envelope itself is not embedded in the semantic contract, so this creates no hash cycle.

## Verification behavior

`verifySourceRegistrationReleaseAuthorization({ authorizationPath, expected, now? })` is Node-builtins-only and fails closed when:

- the envelope or pinned public key is not the exact expected byte hash;
- the envelope is non-canonical JSON, has unknown fields or uses another key/algorithm;
- the Ed25519 signature is invalid;
- any signed or caller-expected binding differs;
- the envelope is not active, is expired, has excessive lifetime, or uses stale, future-dated or out-of-order structural/companion/rehearsal evidence;
- the authorization file is not a canonical outside-repository mode-`0400` or mode-`0600` regular single-link file;
- the body contains a private absolute path;
- the authority or mutation boundary claims more than the exact pre-human-validation registration.

The verifier returns a path-free validated object. The registration transaction must then re-check the signed target, catalog and full logical content state while all public tables are locked, immediately before mutation. Signature verification does not replace that locked compare-and-swap.

## Key material

Only the Ed25519 public key is tracked:

`knowledge/keys/source-registration-2026-08-03-codex-operator-ed25519-v1.public.pem`

Its tracked file SHA-256 and SPKI-derived key ID are pinned in the verifier. The private key remains outside the repository in a private operator-controlled location and must never be printed, committed, copied into an authorization envelope or passed in process arguments.

## Replay and later gates

The envelope is short-lived and contains a unique nonce and authorization ID. A successful exact apply must store the authorization envelope hash, key ID, nonce hash, contract/dependency/operation hashes and trigger-protected audit semantics in the same transaction. Replay is allowed only as an exact receipted no-op against the current database state; partial or drifted state remains a conflict. No global single-use or consumption claim is made until an independently held external anchor exists.

Registration does not mean the sources have been fully read, fact-checked, rights-cleared, mapped into claims, promoted into coverage or validated by people. Those remain separate later lifecycle gates.
