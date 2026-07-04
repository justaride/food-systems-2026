# Mottakslogg: regenerativ-praksis / biodynamisk (2026-07-01)

- Worktree/branch: `.worktrees/master-research-plan-2026-07-01` / `codex/master-research-plan-2026-07-01`.
- Celle: `regenerativ-praksis / biodynamisk`.
- Kandidater: 12.
- Kildepass: Biodynamisk.no/Demeter-/gårdsoversikt, Brreg for BdF/Fokhol/Skjønhaugbruket og aktørsider for Sverdstad/Camphill-noder.
- Gate: actor-gate. Importen dokumenterer biodynamisk felt-/gårdskandidat og institusjonsnoder; den dokumenterer ikke oppdatert Demeter-status, areal, produksjonsvolum eller sertifiseringsstabilitet etter RVUD/Demeter-overgangsfasen.
- Review-koe: `research/_status/mvk-review-koe-2026-07-01.csv`.
- Usikkerhet: `research/_status/mvk-usikkerhetslogg-2026-07-01.md`.
- Importstatus: kjørt 2026-07-01. Første forsøk stoppet på dublett for `STIFTELSEN FOKHOL GÅRD`; kandidatfilen ble rettet fra `fokhol-gard` til eksisterende `stiftelsen-fokhol-gard` og importen ble kjørt idempotent på nytt. Netto batchstatus: 12 kandidater, 8 nye aktører og 4 tidligere eksisterende beriket; siste idempotente kjøring rapporterte 6 nye og 6 eksisterende fordi `demeter-norge` og `alm-ostre` ble opprettet før første stopp.
