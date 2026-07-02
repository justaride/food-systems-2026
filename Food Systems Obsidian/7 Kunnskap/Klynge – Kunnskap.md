---
tags: ""
farge: #DB2777
rolle: Analyse og innsikt
type: klynge
status: generert
kilde: scripts/obsidian-vault/sync.ts
siterbarhet: intern
---

# Klynge – Kunnskap

> Del av [[HUB – Kunnskapsdatabasen]] · Rolle: **Analyse og innsikt** · Farge: `#DB2777`

## Seksjoner

- [[Innsikt]] `/innsikt` — Forskning, kartlegging og analyse
- [[Forskningsrunder]] `/forskningsrunder` — Food Research Process, bl
- [[Akademia]] `/masteroppgaver` — Master- og PhD-avhandlinger med relevans for feltet
- [[Graf]] `/graf` — Kunnskapsgraf og koblinger
- [[Aktører]] `/aktorer` — Prioritering, asks og relasjoner

## Dynamiske oversikter

```dataview
TABLE rute, status, siterbarhet
FROM "7 Kunnskap"
WHERE type = "seksjon"
SORT file.name ASC
```
## Notater

_Utvikles gjennom prosjektet._
