---
tags: ""
farge: #0F766E
rolle: Inngang
type: klynge
status: generert
kilde: scripts/obsidian-vault/sync.ts
siterbarhet: intern
---

# Klynge – Oversikt og navigasjon

> Del av [[HUB – Kunnskapsdatabasen]] · Rolle: **Inngang** · Farge: `#0F766E`

## Seksjoner

- [[Oversikt]] `/` — Fase, fremdrift, neste steg
- [[Brukerveiledning]] `/veiledning` — Slik bruker du plattformen
- [[Søk]] `/sok` — Søk på tvers av alt innhold: selskaper, dokumenter, personer, innsikt

## Dynamiske oversikter

```dataview
TABLE rute, status, siterbarhet
FROM "1 Oversikt og navigasjon"
WHERE type = "seksjon"
SORT file.name ASC
```
## Notater

_Utvikles gjennom prosjektet._
