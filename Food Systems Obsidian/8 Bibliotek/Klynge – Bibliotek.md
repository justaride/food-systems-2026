---
tags: ""
farge: #334155
rolle: Kilder og leveranse
type: klynge
status: generert
kilde: scripts/obsidian-vault/sync.ts
siterbarhet: intern
---

# Klynge – Bibliotek

> Del av [[HUB – Kunnskapsdatabasen]] · Rolle: **Kilder og leveranse** · Farge: `#334155`

## Seksjoner

- [[Rapporter]] `/rapporter` — Offentlige rapporter og bransjeanalyser
- [[Hvitbok]] `/hvitbok` — Leveransedokumentet i kapitler
- [[Bibliotek]] `/bibliotek` — Fulltekst forskningsdokumenter
- [[Kilder]] `/kilder` — Dokumenter og referanser

## Dynamiske oversikter

```dataview
TABLE rute, status, siterbarhet
FROM "8 Bibliotek"
WHERE type = "seksjon"
SORT file.name ASC
```
## Notater

_Utvikles gjennom prosjektet._
