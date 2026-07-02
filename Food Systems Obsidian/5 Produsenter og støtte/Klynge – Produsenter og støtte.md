---
farge: #B45309
rolle: Primærledd
type: klynge
status: generert
kilde: scripts/obsidian-vault/sync.ts
siterbarhet: intern
---

# Klynge – Produsenter og støtte

> Del av [[HUB – Kunnskapsdatabasen]] · Rolle: **Primærledd** · Farge: `#B45309`

## Seksjoner

- [[Produsentregister]] `/produsenter` — Jordbruksforetak fra register (rådata)
- [[Subsidier]] `/subsidier` — Tilskudd per kommune, ordning og mottaker

## Dynamiske oversikter

```dataview
TABLE rute, status, siterbarhet
FROM "5 Produsenter og støtte"
WHERE type = "seksjon"
SORT file.name ASC
```
## Notater

_Utvikles gjennom prosjektet._
