# lib/data strategic plan — what (not) to migrate

Date: 2026-05-26
Forutsetning: PR #76 (seed-flytting) er merget. Etter den inneholder `src/lib/data/` 20 filer / ~6 000 linjer.

## Konklusjon først

**Det meste av det som er igjen skal _ikke_ migreres til DB.** Filene serverer to legitime formål: kode-konstanter (kategori B) og canonical-source-of-truth som DB speiler (kategori C). Eneste reelle gevinst er å **strippe `insights.ts`** fra 1 757 → ~50 linjer.

## Etter inspeksjon av `queries/project.ts`

`getFreshCanonicalRows` (linje 39–52) er nøkkelen til å forstå pattern:

```ts
// Hvis DB ikke har current canonical rows → returner canonical
// Hvis DB matcher canonical → returner DB-rader (kan ha mer metadata)
if (!hasCurrentCanonicalRows) return canonicalRows
return canonicalRows.map(canonical => rowsById.get(getKey(canonical)) ?? canonical)
```

Dette betyr at `phases.ts`, `kpis.ts`, `ten-step-start.ts`, `evidence-pack.ts` er **canonical-in-code**: koden definerer sannheten, DB speiler. Migrering til DB-only ville snu retningen og fjerne typesikkerhet + reviewability. Beholdes.

## Per-fil anbefaling

### Kategori B — kode-konstanter (behold)

`nav.ts`, `food-tg-mandate.ts`, `food-tg-control-layer.ts`, `r-ladder.ts`, `circular-leverage.ts`, `country-chart-data.ts`, `verdikjede.ts`, `property-companies.ts`, `circularity-questions.ts`, `circularity-actor-map.ts`, `media-landscape.ts`

→ Disse er **kode**, ikke data. Hører hjemme i `src/lib/data/`. Ingen endring.

### Kategori C — canonical/fallback (behold med ett unntak)

| Fil | Linjer | Pattern | Anbefaling |
|---|---|---|---|
| `phases.ts` | 52 | canonical (`getFreshCanonicalRows`) | Behold |
| `kpis.ts` | 39 | canonical | Behold |
| `ten-step-start.ts` | 89 | canonical | Behold |
| `evidence-pack.ts` | 94 | canonical | Behold |
| `team.ts` | 67 | enkel fallback | Behold |
| `applications.ts` | 63 | enkel fallback | Behold |
| `meetings.ts` | 364 | DB-fallback + UI-bruk | Behold |
| `communications.ts` | 3 | type-only | Behold |
| **`insights.ts`** | **1 757** | **emergency-only fallback** | **Strip** |

## Den ene reelle endringen: `insights.ts`

`getRecentInsights(limit = 3)` faller tilbake til `fallbackInsights` kun ved Prisma-feil. Selv da brukes bare topp 3 etter dato. Av 122 entries blir 119 aldri vist — heller ikke i fallback-tilfellet.

**Forslag:** strip til 3–5 representative entries så fallback-rendering ikke crasher. Spar ~1 700 linjer.

Edge case: hvis utviklere har brukt `insights.ts` som referanse for hva slags innhold som skal i DB, dokumenter dette i en kort kommentar på toppen. Selve seed-dataen ligger nå uansett i prod-DB (kjøres ikke fra TS-fil).

## Implementeringsskritt (én PR)

1. Verifiser at ingen scripts importerer fra `insights.ts` (recon viste 0 utenom `queries/project.ts`)
2. Reduser `insights` til 3 entries med varierte `type`-verdier, så fallback-rendering dekker UI-varianter
3. Behold typen `Insight` + export-shape — bare innholdet endres
4. Verifiser: `npm test`, `npm run build`, simuler DB-feil for å sjekke fallback fungerer (eller skip — fallback er nedgraderings-håndtering, ikke kritisk path)

## Hva som ikke gjøres

- Ingen migrering av canonical-filer til DB-only (ville snu pattern, ikke gevinst)
- Ingen omstrukturering av `src/lib/data/` mappenavnet (kategori B-filer trives der)
- Ingen endring i fallback-pattern i `queries/project.ts`

## Resultat hvis utført

`src/lib/data/` etter PR #76 og insights-strip: 20 filer / ~4 300 linjer. Et lite, fokusert utvalg av canonical-data og kode-konstanter. Ingen videre arbeid nødvendig her.
