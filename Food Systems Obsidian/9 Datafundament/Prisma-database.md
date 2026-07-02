---
tags: ""
farge: #0891B2
type: datafundament
status: generert
kilde: scripts/obsidian-vault/sync.ts
siterbarhet: intern
---

# Prisma-database

> Datafundament-lag · Del av [[HUB – Kunnskapsdatabasen]]

Kjernedatabasen (Postgres via Prisma): selskaper, eierskap, styreverv, relasjoner, eiendommer.

## Innhold

- **13 kartlagte konsern**: NorgesGruppen, Austevoll, Lerøy, Reitan Retail, Coop, ASKO, SalMar, Nortura, Orkla, Felleskjøpet, BAMA, TINE, Mowi
- Kvalitet spores i `data/konsern-coverage.json` og `public/data/coverage/profiles.json`
- Skjema: `prisma/` · Importer: `npm run db:import` · Audit: `npm run db:audit`
- Merk: bygget er DB-fritt — DB-avledede artefakter committes og refreshes via `npm run compute-metrics:full`

## Mater disse seksjonene

- [[Selskaper]]
- [[Eierskap]]
- [[Styremedlemmer]]
- [[Personer]]
- [[Eiendommer]]
- [[Forsyningskjede]]
- [[Graf]]
## Notater

_Utvikles gjennom prosjektet._
