---
tags: ""
farge: #1D4ED8
rolle: Makt og struktur
type: klynge
status: generert
kilde: scripts/obsidian-vault/sync.ts
siterbarhet: intern
---

# Klynge – Selskap og eierskap

> Del av [[HUB – Kunnskapsdatabasen]] · Rolle: **Makt og struktur** · Farge: `#1D4ED8`

## Seksjoner

- [[Selskaper]] `/selskap` — Selskapsdata og regnskap for aktørene i norsk/nordisk matsektor
- [[Eierskap]] `/eierskap` — Konserndossier og datakvalitet
- [[Styremedlemmer]] `/styremedlemmer` — Krysstyrer og nettverk
- [[Personer]] `/personer` — Nøkkelpersoner og roller på tvers av selskaper
- [[Eiendommer]] `/eiendommer` — Selskapseiendommer og lokaler

## Dynamiske oversikter

```dataview
TABLE rute, status, siterbarhet
FROM "3 Selskap og eierskap"
WHERE type = "seksjon"
SORT file.name ASC
```
## Notater

_Utvikles gjennom prosjektet._
