# AP-5 review handoff

AP-5 is implemented in the isolated branch
`codex/sesjon2-trusted-launcher`. The reviewable files are:

- `knowledge/corpus/SOURCE-REGISTRATION-TRUSTED-ENTRYPOINT.md`
- `scripts/knowledge/run-trusted-source-registration-apply.mjs`
- `tests/lib/source-registration-trusted-entrypoint.test.ts`
- `SESJON-2/RAPPORT-S2-C.md`

The implementation generalizes the FD3/FD4/FD5 trust ordering to the exact
purpose `source_registration_apply`, binds the existing sealed runtime
manifests, rejects direct execution and proves that an earlier failure does
not read FD5. The existing public launcher still returns
`APPLY_TRUSTED_ENTRYPOINT_REQUIRED` under a clean environment.

The five AP-5 questions, contract mapping, attack tests, deliberate limits and
verification results are recorded in `SESJON-2/RAPPORT-S2-C.md` and
`SESJON-2/GJENNOMGANGSUNDERLAG-S2-C.md`.

This handoff is not an apply authorization. No database, secret, private root,
Ed25519 key, rehearsal or mutation was used. The database-free boundary has
now passed an independent review after the FD3 singleton and fixed-descriptor
findings were corrected; the reviewer still gave no production sign-off. Any
future child adapter and `codeBindings` boundary must be reviewed separately
before an owner-approved change can make `--apply` reachable.
