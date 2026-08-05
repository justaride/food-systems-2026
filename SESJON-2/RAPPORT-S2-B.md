# S2-B — rollekvitteringer

**Dato:** 2026-08-04  
**Status:** IMPLEMENTERT OG DATABASEFRITT TESTET  
**Worktree:** `.worktrees/sesjon2-rollekvittering`  
**Gren:** `codex/sesjon2-role-classification-receipts`
**Canonical integrasjon:** `codex/nordic-knowledge-canonical-v1` commit `462bb2f`

## Resultat

S2-B har nå en separat kvitteringsmekanisme for rolleklassifisering. Den
skriver ikke faktiske beslutninger eller køkvitteringer i denne sesjonen.

Mekanismen binder hver fremtidig kvittering til:

- hele policyblokken `decidedBy`, `decidedByDetail`, `decidedAt`, `confidence`,
  `reasoning`, `queueRowSha256` og `policyVersion`;
- identitet, queue-row-bytes og canonical source-content hash;
- fail-closed asymmetri: `ai` kan ikke flytte en identitet inn i
  `primary_evidence`;
- tre distinkte, bevarte og enstemmige panelstemmer for `ai_panel`;
- queue-row drift, policy drift, duplikat, unknown identity og manglende
  begrunnelse.

## Filer

- `knowledge/schema/corpus-role-classification-receipt.schema.v1.json`
- `scripts/knowledge/corpus-role-classification-receipts.ts`
- `knowledge/corpus/CORPUS-ROLE-CLASSIFICATION-RECEIPTS-CONTRACT.md`
- `tests/lib/corpus-role-classification-receipts.test.ts`
- `knowledge/corpus/corpus-role-classification-receipt-templates.v1.json`
- package scripts for `--write-templates`, `--validate-receipts` og
  `--check-status`

## Verifikasjon

- Databasefrie tester: **7/7 pass**.
- Målrettet TypeScript-kompilering: **0 feil**.
- Template-generatoren materialiserte 1 555 hashbundne templates; dette er
  ikke faktiske beslutningskvitteringer.
- `--check-status`: 1 555 køerader, 0 receipts, 1 555 unresolved,
  `bulkReceiptWriteAllowed: false`.
- Ingen kø, register, database eller evidence-pack ble skrevet.

## Gjenstående gate

S2-E har nå levert en separat agentmåling, men den gir bare 6/9 treff på
`high`-`proposedRole` og 12/25 rolletreff totalt. Ingen farlig bevegelse inn i
`primary_evidence` ble observert, men utvalget er for lite og treffsikkerheten
for lav til å åpne autonom bulk. `high` kan brukes som prioriteringssignal og
for eksplisitt strengere behandling; alle bulkrolleendringer krever fortsatt
`ai_panel` eller owner. De 268 faktiske kvitteringene er ikke skrevet.
