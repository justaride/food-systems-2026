# Gjennomgangsunderlag S2-C

## Scope

Dette er et billig underlag for en uavhengig, skrivebeskyttet gjennomgang av
trusted entrypoint. Gjennomgangen skal bruke worktree
`.worktrees/sesjon2-launcher`, ikke den skitne hoved-worktree-en.

## Implementert, fil for fil

1. `knowledge/corpus/SOURCE-REGISTRATION-TRUSTED-ENTRYPOINT.md` beskriver
   purpose, FD-konvolutter, rekkefølge, runtime-pins, post-child grense og
   begrensninger.
2. `scripts/knowledge/run-trusted-source-registration-apply.mjs` importerer
   kun innebygde Node-moduler. Den validerer canonical JSON, avlenkede
   mode-`0400` descriptors, launcher-inode, exact purpose, PID, miljø, sealed
   runtime manifests, tree bindings, runtime self-hash og post-child drift.
3. `tests/lib/source-registration-trusted-entrypoint.test.ts` speiler
   accepted, missing/misidentified descriptor, mode/link-count, descriptor
   drift, PID/purpose, inner-hash, environment, direct child, post-child
   drift og FD5-unread attack cases.

## Pre-import runtime boundary

- launcher: mode `0400`, one link, private mode-`0700` `/tmp` parent, current
  owner, FD3 identity and bytes;
- public FD4: exact envelope, purpose, database role/target,
  authorization/operation and DDL pins;
- runtime: active Node and sealed Node/PostgreSQL/extension manifests,
  declared manifest objects, complete dependency/generated-client tree
  bindings and resolved local import closure;
- environment: all required forbidden prefixes and Node flags rejected;
- secret FD5: only after every earlier condition has passed;
- child probe: actual builtins-only parent→child handoff uses FD3/FD4/FD5;
  output release requires full byte-identical reattestation, also on failure.

## Bevisst avvik og begrensning

The logical-restore companion code was not imported or duplicated. The new
purpose is isolated in its own builtins-only module so a companion capability
cannot be replayed for source registration. The external bootstrap that copies
the launcher and prepares descriptors remains an operational handoff; this
commit does not create private files or unlock apply. The future apply-child
spawn is intentionally not wired because that would cross the explicit
S2-C/contract boundary and could make `--apply` reachable before independent
review.

## Svakeste punkter

- A same-UID process or preloaded module can act before these JavaScript checks;
  this is a stated limitation, not a hardware isolation claim.
- The exact apply child and its existing runtime-envelope adapter still need
  independent review before mutation authority can be exposed; the tested
  child is only a no-database probe.
- Generated Prisma output and `src/generated/version.json` are local ignored
  prerequisites for the broad baseline checks; they are not tracked deliverables.

## Foreslått sjekkliste

- Confirm exact SHA-256 constants against the existing sealed manifests.
- Confirm FD3 device/inode continuity and FD4/FD5 `nlink === 0` around reads.
- Tamper each public pin and confirm FD5 read counter stays zero.
- Confirm purpose separation from `logical_restore_companion`.
- Confirm all forbidden prefixes and Node flags fail before private input use.
- Confirm post-child drift fails even when the child status is non-zero.
- Run the locked launcher with a clean environment and confirm unchanged
  `APPLY_TRUSTED_ENTRYPOINT_REQUIRED`.
- Review any future child adapter separately; do not approve this worktree as
  production mutation authority based on the database-free tests alone.

## Uavhengig review — resultat og lukking av funn

Den første uavhengige reviewen ga `NO-GO` på to konkrete punkter:

1. singleton-innholdet i FD3-parenten ble kontrollert etter descriptor-lesing;
2. `requireTrustedSourceRegistrationEntrypoint` kontrollerte ikke at de
   innsendte descriptor-argumentene faktisk var FD3/FD4/FD5.

Begge er rettet i `codex/sesjon2-trusted-launcher`:

- `assertParentSingleton()` kjøres både før og etter FD3-lesing;
- trusted entrypoint avviser alle andre descriptor-numre;
- parent-proben gjør bare ikke-hemmelig preflight og lar barnet håndheve den
  faste FD3/FD4/FD5-grensen etter `spawnSync(stdio)`.

Den samme uavhengige revieweren har deretter vurdert funnene som lukket:
descriptor-binding `PASS`, singleton før/etter `PASS`, public `--apply` og
produksjonsmutasjon fortsatt lukket. Den databasefrie runtime-gaten er bekreftet
med den separate kjøringen:

```text
node --import=tsx --test tests/lib/source-registration-trusted-entrypoint.test.ts
9/9 pass
node --check scripts/knowledge/run-trusted-source-registration-apply.mjs
PASS
git diff --check
PASS
npx tsc --noEmit
0 errors
```

Dette er review- og testbevis for den databasefrie grensen, ikke autorisasjon
til å koble inn apply-runneren. `--apply` skal fortsatt returnere
`APPLY_TRUSTED_ENTRYPOINT_REQUIRED`.
