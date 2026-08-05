# Gjennomgangsunderlag S2-B

## Review scope

Gjennomgå kun worktree `.worktrees/sesjon2-rollekvittering` på grenen
`codex/sesjon2-role-classification-receipts`. Den kanoniske worktree-en og
hovedutsjekken skal ikke brukes som skriveflate.

## Kontrollpunkter

- Schemaet må dekke hele policyens §5-blokk uten ekstra autoritetsfelt.
- Queue-row hash må beregnes fra eksakt canonical row og avvise drift.
- AI-downgrade ut av `primary_evidence` skal kunne godtas bare med høy
  confidence og reasoning.
- AI-promotion inn i `primary_evidence` skal avvises fail-closed.
- `ai_panel` skal kreve tre distinkte agent-ID-er, tre begrunnelser og
  enstemmig foreslått rolle.
- Owner receipts skal kreve navngitt owner detail.
- Bulk-268 skal kunne valideres databasefritt, men ingen bulkbeslutning skal
  skrives uten separat kalibrering og owner gate.
- Template-skriving skal aldri skape en receipt eller endre kø/register.

## Bevisst avgrensning

Ingen faktisk receipt-fil, queue-row, registerrad eller databaseoperasjon ble
skrevet. `corpus-role-classification-receipt-templates.v1.json` er kun
forberedende, hashbundne input-templates.
