# Root anchor writer installation and removal runbook

## Current state and authority boundary

The writer package is reviewable source only. It has **not** been installed, run as root or used to bind a corpus candidate. No file has been created under `/usr/local/libexec`, `/private/var/db/food-systems-corpus-anchor` or `/private/var/db/food-systems-corpus-anchor-requests` by this work.

Installation is a separate administrator action. It creates a project-controlled integrity boundary, not independent notarization, a human source review, rights approval or research-completeness evidence. The writer never opens or modifies the repository. It writes only the fixed external ledger directory and never appends the internal `history_anchor_trusted_verification` record.

The package contains only a single Node ES module using `node:` built-ins, its canonical install manifest and its checksums:

| Source artifact                                                      | Audited SHA-256                                                    |         Size |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ | -----------: |
| `scripts/knowledge/root-anchor-writer/corpus-anchor-root-writer.mjs` | `ee639f614331c38d2d29c82655fab7f8757f8af9bf6b15b3c9cfa52015043b2e` | 57,106 bytes |
| `scripts/knowledge/root-anchor-writer/install-manifest.v1.json`      | `647d830a46e8f42ded64d516760552b0d9a46236b695dce0e222b2a279379fa0` |  1,879 bytes |

Any source edit invalidates these values. Re-run tests and regenerate the manifest and `SHA256SUMS`; never install a package with stale hashes.

## Fixed production paths

- trusted Node runtime: `/usr/local/bin/node`;
- writer: `/usr/local/libexec/food-systems-corpus-anchor-writer/corpus-anchor-root-writer.mjs`;
- installed manifest: `/usr/local/libexec/food-systems-corpus-anchor-writer/install-manifest.v1.json`;
- external ledger root: `/private/var/db/food-systems-corpus-anchor`;
- administrator request-intake root: `/private/var/db/food-systems-corpus-anchor-requests`.

The `/var/...` alias is forbidden because `/var` is a symlink on macOS. The writer also rejects caller-selected roots, symlinked parents, non-root ownership, group/world-writable secure parents, multiple hard links and unexpected files. The request root is separately root-owned mode `0700`; every accepted request is a direct-child, root-owned, one-link regular file with mode `0400`, and the administrator must pin the SHA-256 of its exact bytes on the append command.

## Gate 0 — trusted Node runtime

Do not use the current Homebrew Node installation for a root command. In the development environment it is under `/opt/homebrew`, is owned by the interactive user and dynamically loads Homebrew libraries. Running it as root would defeat the separation.

Before installation, an administrator must independently provision Node 20 or newer as a real, root-owned, non-symlink executable at `/usr/local/bin/node`, with no group/world-writable path component. Runtime installation and vendor verification are outside this package. Stop if that independent prerequisite is not satisfied.

Read-only prerequisite checks:

```bash
/usr/bin/stat -f '%Su %Sg %Lp %HT %N' /usr/local/bin/node
/usr/bin/readlink /usr/local/bin/node
/usr/local/bin/node --version
```

The required result is owner `root`, a regular executable with no non-root write bit, no hard-link alias and no `readlink` target. The writer repeats these checks at every invocation and requires `process.execPath` to equal `/usr/local/bin/node` exactly.

## Gate 1 — source review and package audit

Run these as the normal project user from the candidate worktree root:

```bash
cd scripts/knowledge/root-anchor-writer
/usr/bin/shasum -a 256 -c SHA256SUMS
/usr/local/bin/node --test corpus-anchor-root-writer.test.mjs
```

The checksum result must report both artifacts as `OK`; all built-in adversarial tests must pass. Also run the repository compatibility test from the repository root with the normal project toolchain:

```bash
cd ../../..
node --import=tsx --test tests/lib/corpus-anchor-root-writer-compatibility.test.ts
```

Review the complete writer and manifest before authorizing installation. The checksum file is an audit convenience, not an external signature; preserve the accepted hashes separately if rollback detection beyond the host is required.

## Gate 2 — preflight the fixed targets

No installed target may be a symlink. If the libexec package directory already exists, stop and inspect it rather than overwriting it. If the ledger root already exists, it must be a root-owned `0755` directory containing either no files or exactly the two validated `0444` ledger files. A lock, temporary file, partial ledger or unfamiliar entry is a stop condition. If the request root already exists, it must be a root-owned `0700` directory. Do not adopt or reuse any request file until its owner, mode, link count, direct-child path and exact bytes have been reviewed.

Read-only preflight:

```bash
/usr/bin/stat -f '%Su %Sg %Lp %HT %N' /usr/local /usr/local/libexec 2>/dev/null
/usr/bin/stat -f '%Su %Sg %Lp %HT %N' /usr/local/libexec/food-systems-corpus-anchor-writer 2>/dev/null
/usr/bin/stat -f '%Su %Sg %Lp %HT %N' /private/var/db/food-systems-corpus-anchor 2>/dev/null
/usr/bin/stat -f '%Su %Sg %Lp %HT %N' /private/var/db/food-systems-corpus-anchor-requests 2>/dev/null
/bin/ls -la /private/var/db/food-systems-corpus-anchor 2>/dev/null
/bin/ls -la /private/var/db/food-systems-corpus-anchor-requests 2>/dev/null
```

Do not use `/tmp`, `$HOME`, a glob or an unresolved environment variable as an installation or ledger target.

## Gate 3 — installation commands

The following commands are the proposed administrator transaction. They are documentation only and were not executed by this work. Start at the candidate worktree root, and run them only after explicit administrator approval and Gates 0–2.

```bash
cd scripts/knowledge/root-anchor-writer
sudo /usr/bin/install -d -o root -g wheel -m 0755 /usr/local/libexec
sudo /usr/bin/install -d -o root -g wheel -m 0755 /usr/local/libexec/food-systems-corpus-anchor-writer
sudo /usr/bin/install -o root -g wheel -m 0555 corpus-anchor-root-writer.mjs /usr/local/libexec/food-systems-corpus-anchor-writer/corpus-anchor-root-writer.mjs
sudo /usr/bin/install -o root -g wheel -m 0444 install-manifest.v1.json /usr/local/libexec/food-systems-corpus-anchor-writer/install-manifest.v1.json
sudo /usr/bin/install -d -o root -g wheel -m 0755 /private/var/db/food-systems-corpus-anchor
sudo /usr/bin/install -d -o root -g wheel -m 0700 /private/var/db/food-systems-corpus-anchor-requests
```

If either fixed root already contains data, do not run its `install -d` command until ownership, mode and content have been independently validated. The writer will never repair, truncate or adopt an unvalidated directory.

Post-install byte and metadata checks:

```bash
sudo /usr/bin/shasum -a 256 /usr/local/libexec/food-systems-corpus-anchor-writer/corpus-anchor-root-writer.mjs /usr/local/libexec/food-systems-corpus-anchor-writer/install-manifest.v1.json
sudo /usr/bin/stat -f '%Su %Sg %Lp %HT %l %N' /usr/local/libexec/food-systems-corpus-anchor-writer/corpus-anchor-root-writer.mjs /usr/local/libexec/food-systems-corpus-anchor-writer/install-manifest.v1.json /private/var/db/food-systems-corpus-anchor /private/var/db/food-systems-corpus-anchor-requests
```

The hashes must equal Gate 1. The writer must be root-owned `0555`, the manifest root-owned `0444`, both regular files with one hard link, the ledger root root-owned `0755`, and the request root root-owned `0700`.

## Gate 4 — installed check

Invoke Node with an empty environment and absolute paths. This avoids inherited `NODE_OPTIONS`, dynamic loader variables and a user-controlled `PATH`:

```bash
sudo /usr/bin/env -i HOME=/var/root PATH=/usr/bin:/bin:/usr/sbin:/sbin /usr/local/bin/node --no-addons --disable-proto=throw /usr/local/libexec/food-systems-corpus-anchor-writer/corpus-anchor-root-writer.mjs check
```

Before the first append, the expected status is `initialized: false`, `recordCount: 0`. The same check also requires the fixed request-intake root to be present with exact root ownership and mode `0700`. A missing or unsafe request root, existing lock or unexpected ledger entry fails closed.

## Gate 5 — one controlled append

Do not prepare the old corpus genesis. First complete the controlled registration, post-apply rebaseline and explicit empty event-manifest/genesis initialization. The prepared request must bind that exact candidate plus the exact baseline, processing register and baseline-generation-manifest bytes.

Prepare and save exactly one canonical request as the normal project user. The administrator must review those exact bytes, install a byte-identical copy as a direct child of the fixed request root with owner `root`, mode `0400` and one hard link, and independently pin its exact SHA-256. The project user cannot write into the mode-`0700` intake directory. Then re-run `--check-request` against the original byte-identical saved file only after the external append; that check remains read-only and does not append the repository verification.

Example administrator intake, where the source path and final filename are replaced only after exact review:

```bash
sudo /usr/bin/install -o root -g wheel -m 0400 /absolute/reviewed/path/corpus-anchor-request.v1.json /private/var/db/food-systems-corpus-anchor-requests/corpus-anchor-request.v1.json
sudo /usr/bin/shasum -a 256 /private/var/db/food-systems-corpus-anchor-requests/corpus-anchor-request.v1.json
sudo /usr/bin/stat -f '%Su %Sg %Lp %HT %l %N' /private/var/db/food-systems-corpus-anchor-requests/corpus-anchor-request.v1.json
```

The administrator must preserve the returned hash outside the request file and use it literally, with the `sha256:` prefix, in the append command. Do not calculate a new hash after the approval decision without repeating the review.

The administrator append command is:

```bash
sudo /usr/bin/env -i HOME=/var/root PATH=/usr/bin:/bin:/usr/sbin:/sbin /usr/local/bin/node --no-addons --disable-proto=throw /usr/local/libexec/food-systems-corpus-anchor-writer/corpus-anchor-root-writer.mjs append --request=/private/var/db/food-systems-corpus-anchor-requests/corpus-anchor-request.v1.json --expected-request-sha256=sha256:<64-lowercase-hex-from-administrator-review>
```

The request filename and hash placeholder are illustrative; the root path is fixed and cannot be replaced. The writer:

1. validates its own installed hash and runtime boundary;
2. requires the administrator-pinned hash, then reads the fixed-root direct-child request with `O_NOFOLLOW` and verifies its root owner, `0400` mode, one-link identity, stable inode and exact bytes;
3. creates the root-owned `0600` lock with `O_EXCL | O_NOFOLLOW`;
4. validates the complete existing ledger/head and compare-and-swap precondition;
5. rejects replayed request, candidate or verification hashes;
6. writes and `fsync`s new `0444` temporary ledger/head files;
7. atomically replaces ledger, then head, with directory `fsync`s;
8. reopens and verifies the complete chain and exact latest request;
9. removes only its own unchanged lock after successful post-verification.

It does not open the repository and does not append the emitted internal verification. After success, run the installed `check` command again, then run the normal-user `--check-request` workflow documented in `ROOT-CONTROLLED-EVENT-HISTORY-ANCHOR-LEDGER.md`.

## Crash or stale-lock stopline

A crash after the first atomic replacement can leave a lock, a `.tmp` file or a ledger/head mismatch. These are deliberate fail-closed states. The writer does not automatically delete, roll back or “repair” them.

If the lock exists:

```bash
sudo /usr/bin/stat -f '%Su %Sg %Lp %HT %l %N' /private/var/db/food-systems-corpus-anchor/.corpus-event-history-anchors.append.lock
sudo /bin/cat /private/var/db/food-systems-corpus-anchor/.corpus-event-history-anchors.append.lock
sudo /bin/ls -la /private/var/db/food-systems-corpus-anchor
```

Stop. Confirm independently that the recorded process is no longer running, preserve byte-for-byte copies and hashes of every ledger/head/lock/temp artifact, and perform an audited recovery review. Do not remove the lock merely to make `check` pass. Recovery tooling is intentionally not included in v1.

## Check procedure before uninstall

First run Gate 4 and record the output. Then preserve the exact external ledger path, file hashes, modes and latest head. Uninstalling the executable does not revoke or delete existing evidence.

Read-only preservation check:

```bash
sudo /usr/bin/shasum -a 256 /private/var/db/food-systems-corpus-anchor/corpus-event-history-anchors.v1.jsonl /private/var/db/food-systems-corpus-anchor/corpus-event-history-anchors-head.v1.json
sudo /usr/bin/stat -f '%Su %Sg %Lp %HT %l %N' /private/var/db/food-systems-corpus-anchor /private/var/db/food-systems-corpus-anchor/corpus-event-history-anchors.v1.jsonl /private/var/db/food-systems-corpus-anchor/corpus-event-history-anchors-head.v1.json
```

## Exact uninstall — executable only

These commands remove only the installed writer and its installed manifest. They do **not** remove the external ledger, lock, request-intake root, reviewed request files, Node runtime or any repository file:

```bash
sudo /bin/rm -f /usr/local/libexec/food-systems-corpus-anchor-writer/corpus-anchor-root-writer.mjs
sudo /bin/rm -f /usr/local/libexec/food-systems-corpus-anchor-writer/install-manifest.v1.json
sudo /usr/bin/rmdir /usr/local/libexec/food-systems-corpus-anchor-writer
```

Do not add `/private/var/db/food-systems-corpus-anchor` or `/private/var/db/food-systems-corpus-anchor-requests` to those commands. If the libexec directory is not empty, `rmdir` must fail and the remaining entry must be reviewed; do not replace it with recursive deletion.

Post-uninstall proof that ledger data remains:

```bash
sudo /usr/bin/stat -f '%Su %Sg %Lp %HT %N' /private/var/db/food-systems-corpus-anchor
sudo /bin/ls -la /private/var/db/food-systems-corpus-anchor
sudo /usr/bin/stat -f '%Su %Sg %Lp %HT %N' /private/var/db/food-systems-corpus-anchor-requests
sudo /bin/ls -la /private/var/db/food-systems-corpus-anchor-requests
```
