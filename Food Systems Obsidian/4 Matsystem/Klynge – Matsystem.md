---
tags: ""
farge: #15803D
rolle: Verdikjede
type: klynge
status: generert
kilde: scripts/obsidian-vault/sync.ts
siterbarhet: intern
---

# Klynge – Matsystem

> Del av [[HUB – Kunnskapsdatabasen]] · Rolle: **Verdikjede** · Farge: `#15803D`

## Seksjoner

- [[Verdikjede]] `/verdikjede` — Nordisk verdikjedeanalyse
- [[Forsyningskjede]] `/forsyningskjede` — Leverandørrelasjoner, primærleveranser og selvhandel
- [[Havbruk]] `/havbruk` — Lokaliteter og søknader fra Fiskeridirektoratet
- [[Sirkularitet]] `/sirkularitet` — R-stige, 10 spørsmål, looper og caser
- [[Økonomi]] `/okonomi` — Finansielle trender og sammenligning på tvers av aktørene

## Dynamiske oversikter

```dataview
TABLE rute, status, siterbarhet
FROM "4 Matsystem"
WHERE type = "seksjon"
SORT file.name ASC
```
## Notater

_Utvikles gjennom prosjektet._
