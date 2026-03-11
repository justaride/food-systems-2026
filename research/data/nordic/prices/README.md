# Nordic prices v1

Første operative uttrekk av nordiske prisserier fra identifiserte API-kilder.

## Innhold

- `raw-json/`
  Rå JSON- eller JSON-stat-svar per datasett, inkludert request-payload.
- `normalized/`
  Normaliserte CSV-filer i long-format per datasett.
- `manifest.csv`
  Oversikt over hvert uttrekk, status, dimensjoner, radtall og filbaner.
- `run-summary.json`
  Kort oppsummering av kjørte og bevisst utelatte datasett.

## Scope i denne versjonen

Denne `v1`-pakken fokuserer på sammenlignbare prisserier for:

- Eurostat HICP mat
- Eurostat prisnivåindeks mat
- Norge: SSB CPI, arkivbro og PPI
- Danmark: StatBank CPI, HICP og prisnivå
- Sverige: SCB CPI og PPI for matprodukter
- Finland: StatFin CPI, HICP og PPI for matprodukter

## Bevisst ikke inkludert i v1

- Islandske nasjonale prisrader som ikke er matfiltrerte i dagens register
- Luke og LPRIS10 som egne produsentpris-/varetabeller

Disse er dokumentert i `run-summary.json` og kan tas inn i en senere utvidelse.
