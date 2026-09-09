# Runtime-closure repair, 9 September 2026

## Verified drift

The existing Node runtime closure failed closed at loader alias 20. Its sealed
manifest resolved `/opt/homebrew/opt/llhttp/lib/libllhttp.9.4.dylib` to
`/opt/homebrew/Cellar/llhttp/9.4.2/lib/libllhttp.9.4.2.dylib`, which is no
longer present. The active alias resolves to
`/opt/homebrew/Cellar/llhttp/9.4.3/lib/libllhttp.9.4.3.dylib`.

The active llhttp object was measured directly: 77,664 bytes and SHA-256
`78cd1d7e5016246878a00dbaf76300628e5f48aa2174bf2e83fe1b31dc3e5691`.
All other 24 Node closure objects matched their previously sealed path, byte
count and SHA-256. The bound PostgreSQL toolset closure also rehashed
successfully, so its 2026-08-20 manifest and the macOS dyld-cache binding are
unchanged.

## New seal and continuity

`knowledge/corpus/source-registration/node-runtime-closure-darwin-arm64-2026-09-09.v1.json`
is a new manifest. The 2026-08-20 manifest is retained as historical evidence.
The new manifest has SHA-256
`b9bad9ea977d12717cf7425ef111081a4fd7a0711e1bb730bea2f9feaf3bbbe4` and
domain-separated closure SHA-256
`792c27dd5a2aa754a4966bfd0d480b20d83fbaff50e5de011df9a173eec6982e`.

The verifier keeps its exact object count, loader-alias count, object-byte
total, system-dylib references, environment refusals and bound PostgreSQL
closure checks. Active apply and logical-restore entrypoints bind the new
manifest path, manifest hash, closure hash and verifier hash
`37e3940892ac60caa8cbaf9235fc54580495354309c5b5fcfea3204978ce7a33`.
No Homebrew, symlink or system-cache state was changed by this repair.

## Reproducible checks

Run the closure checks with the loader-influencing environment removed:

```sh
env -u NODE_OPTIONS -u NODE_PATH -u NODE_EXTRA_CA_CERTS \
  -u NODE_PRESERVE_SYMLINKS -u NODE_PRESERVE_SYMLINKS_MAIN \
  node --import=tsx --test tests/lib/node-runtime-closure.test.ts \
  tests/lib/psql-runtime-closure.test.ts
```

The positive Node test rehashes all 25 Homebrew objects and verifies all 30
loader aliases. The negative tests retain caller-binding and environment
refusals. This attests only this macOS darwin-arm64 runtime; Linux CI remains a
separate platform decision.

## Launcher topology check

The worktree dependency tree and generated Prisma client are now lexical
symlinks to private, external regular directories. Their physical paths retain
the normal `node_modules` and `src/generated/prisma` layout, so Node can
resolve transitive packages from the generated client after resolving either
root symlink. The locked launcher accepts both as
`resolved_external_symlink`; each physical tree is outside the repository and
the guard still refuses a regular local root, a symlinked physical root, or any
internal link that leaves the canonical tree.

The verified external tree has 48,140 entries, 43,278 regular files, 44
internal symlinks, 830,707,739 regular-file bytes, and tree SHA-256
`5dccfb316d0cb2d3cbdd22f8ffa816cf0e1396f12c4711b8088f01552a83a7d8`.
This setup moved the existing dependency directory without reinstalling or
changing package bytes. After `prisma generate` recreated the client locally,
the generated directory was likewise moved without changing its inode or
contents. Its verified external tree has 80 entries, 78 regular files, no
internal symlinks, 6,447,791 regular-file bytes, and tree SHA-256
`4b8f9de7f87b930789255eea579ecfc33057c97fcc6940d9d5ece1f97b82e684`.
Neither setup step changed Homebrew, global package state, or the dyld cache.

`npm run build` invokes `prisma generate`, whose configured output is the
lexical repository path. It can recreate that path as a local directory, so a
build that regenerates Prisma must be followed by re-establishing the reviewed
external generated-client symlink before invoking the trusted runtime
entrypoints. The verifier intentionally detects that state instead of treating
the regenerated local directory as trusted.
