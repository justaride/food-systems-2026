---
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

## Kuraterte innganger

- [[Feltkart – kunnskapsbasen]] — faglig kart for nye og erfarne lesere
- [[Leseguide for nye lesere]] — 10-, 30- og 90-minutters lesestier
- [[Kunnskapsstatus]] — dekningsprofil, ferskhet og kjente ukjente
- [[Ordliste og begreper]] — prosjektets arbeidsord i klart språk

## Dynamiske oversikter

```dataview
TABLE rute, status, siterbarhet
FROM "1 Oversikt og navigasjon"
WHERE type = "seksjon"
SORT file.name ASC
```
## Notater

_Utvikles gjennom prosjektet._
