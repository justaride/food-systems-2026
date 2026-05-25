# Eierskap tree revisjon backlog

Sporing av eksisterende `scripts/import-*-tree.ts`-skript som bør reviewes
mot 2025/2026-kilder. Skriptene definerer konserntrærne som vises i
`/eierskap`. Pek til seneste tilgjengelig årsrapport / Brreg-status.

## Norske skript

| Skript | Konsern | Status | Sist verifisert | Neste sjekk |
|---|---|---|---|---|
| import-norgesgruppen-tree.ts | NorgesGruppen ASA | Aktiv | — | Mot Brreg/årsrapport 2024 |
| import-reitan-tree.ts | Reitan Retail | Aktiv | — | — |
| import-coop-tree.ts | Coop Norge | Aktiv | — | — |
| import-orkla-tree.ts | Orkla ASA | Aktiv | — | — |
| import-nortura-tree.ts | Nortura SA | Aktiv | — | — |
| import-tine-tree.ts | TINE SA | Aktiv | — | — |
| import-felleskjopet-tree.ts | Felleskjøpet Agri | Aktiv | — | — |
| import-mowi-tree.ts | Mowi ASA | Aktiv | — | — |
| import-salmar-tree.ts | SalMar ASA | Aktiv | — | — |
| import-leroy-tree.ts | Lerøy Seafood Group | Aktiv | — | — |
| import-seafood-holdings-tree.ts | Austevoll Seafood | Aktiv | — | — |
| import-bama-tree.ts | BAMA Gruppen | Aktiv | — | — |
| import-asko-corporate-tree.ts | ASKO (NorgesGruppen) | Aktiv | — | — |
| import-kavli-tree.ts | Kavli Holding | Aktiv | — | — |

> Merk: `rema1000-norge` (982254604) inngår i Reitan Retail-treet og har ikke eget import-skript.

## Prosess

1. Sjekk siste års Brreg-status for rotnoden (`npm run refresh:brreg` first)
2. Sammenlign datterselskap-listen i skriptet mot årsrapport 2024
3. Identifiser frafall (selskap solgt/likvidert) og tillegg (oppkjøp)
4. Oppdater skriptet og re-kjør import
5. Verifiser via `npm run audit:konsern` — endring i treeSize bør samsvare med revisjon

## Prioritering

Sorter etter `qualityScore` ascending fra `data/konsern-coverage.json` — verst først.
