# Trusted source-registration entrypoint v1

## Status and purpose

This document describes the database-free trust boundary prepared for the
future `source_registration_apply` entrypoint. The public
`launch-locked-source-registration-apply.mjs --apply` quarantine remains
unchanged and still returns `APPLY_TRUSTED_ENTRYPOINT_REQUIRED`. This work
does not authorize a mutation, construct a database client, or read a private
corpus.

The purpose string is the exact domain value:

```text
source_registration_apply
```

It is present in both capability envelopes and is checked with exact equality.
The purpose is also included in the domain-separated runtime self-hash. A
capability prepared for another purpose therefore fails both the envelope
identity check and the hash-bound purpose check.

## Descriptor contract

The external clean bootstrap passes three descriptors to the copied launcher.
The descriptors are passed in this order and are never replaced by named
files after the handoff:

| FD | Envelope | Required properties |
| --- | --- | --- |
| 3 | The copied launcher's own inode | The executing file is a regular mode-`0400` file, owned by the current UID, with one link, in a mode-`0700` directory directly below `/tmp`; FD3 has the same device/inode/mode/owner identity and bytes. |
| 4 | Public pins | Canonical UTF-8 JSON, mode `0400`, unlinked, single descriptor, exact format/version/purpose, launcher SHA-256, runtime pins, database role/target pin, authorization/operation pins and DDL catalog pin. |
| 5 | Secret input | Canonical UTF-8 JSON, mode `0400`, unlinked, single descriptor, exact format/version/purpose and exactly `DATABASE_URL`, `FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT` and `FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT`. |

FD4 has the exact top-level shape `{approval,database,ddl,format,
launcherSha256,purpose,runtime,version}`. FD5 has the exact top-level shape
`{format,inputs,purpose,version}`. Private values are held in memory only;
they are never placed in arguments, output or a tracked receipt.

## Verification order

The copied builtins-only parent performs these checks before the first FD5
read:

1. Reject inherited `NODE_*`, `OPENSSL_*`, `PRISMA_*`, `TSX_*`,
   `DOTENV_CONFIG_*`, `DYLD_*` and `LD_*` variables, the explicit Node
   execution flags, inherited database/private-input variables, a missing
   FD mapping, a wrong bootstrap PID or a wrong purpose.
2. Verify the executing launcher path, mode, owner, link count, parent
   directory, the parent directory's singleton entry and FD3 device/inode
   identity and bytes before and after the descriptor read.
3. Read FD4 only after FD3 is valid. Verify its unlinked mode-`0400` identity
   and bytes before parsing canonical JSON, then verify exact format, purpose,
   role and every public SHA-256 pin.
4. Verify the runtime self-hash and compare the public runtime pins with the
   current active runtime attestation.
5. Read FD5 last. Recheck its unlinked mode-`0400` identity and bytes around
   the read, then validate its exact purpose and input names.

The implementation exposes the read boundary so the database-free test suite
can prove that a deliberately failing launcher, purpose, descriptor or runtime
check leaves FD5 untouched.

## Runtime pins

The attestation binds the active Node executable, Node version, the complete
resolved `node_modules` tree, the generated Prisma-client tree, the local
source runtime binding and the sealed PostgreSQL toolset and extension
closures. The three repository manifests are byte-pinned to the existing
2026-08-03 seals; their closure hashes are not regenerated here:

- Node runtime closure: `464410ef7bbe3c4da7468973f47a43442b51ef7ff3455d810dcf8f3b7ae4e434`;
- PostgreSQL toolset closure: `2f102d12bb738a5ec935e52a76cb6b156e58d86ef8e56a2bef3711c087de7bf0`;
- PostgreSQL extension closure: `3b5540bc6b1d6fd25335b0f094470ee8da5214f09f04feabb583a06aa3b7487c`.

The sealed manifest bytes and every declared runtime object are rehashed. A
different Node version, binary, closure object, dependency tree, generated
client tree or local binding fails closed.

## Child continuity and post-child boundary

The database-free `--trusted-child-probe` child demonstrates the handoff. It
inherits the exact caller-frozen public pins, active Node binary identity,
trusted parent PID and domain-separated runtime self-hash. It enters through
the same FD3/FD4/FD5 protocol; direct child execution without those
descriptors is refused before private input use. The parent starts the probe
with captured stdout and re-attests the complete runtime in a `finally`
barrier, including when the child returns a failure status.

A future apply child must use this same continuity boundary. The exported
probe runner is intentionally database-free and does not invoke the apply
runner.

The parent must capture child output and publish no child stdout until it has
recomputed the complete runtime attestation. It must perform that reattestation
after both successful and failed child exits. Any runtime change, signal or
non-zero child status is a fail-closed outcome. The current revision provides
the reattestation boundary and leaves the public mutation path quarantined for
independent review.

## Explicit limits

This is a drift, accident and fail-closed control for a non-compromised
workstation. It does not claim to stop a same-UID attacker who can replace
locally writable files between checks, alter the running process, or access a
locally available signing key. It does not establish hardware-backed
isolation, external key custody or protection against a preloaded module that
executes before this JavaScript begins. Those remain separate review and
operational gates.
