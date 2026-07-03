---
tittel: B1/B2 Brreg styredata og refresh
dato: 2026-07-03
status: R14 internt arbeidsunderlag
bruksregel: Ingen ekstern claim, ingen safe_for_ai_context, ingen whitepaper-/deck-stemme. Svakeste punkt styrer gate.
---

# B1/B2 Brreg styredata og refresh

## B1 styredata

Live DB-måling før R14-import viste 253 av 351 selskaper med styredata (72,1 %) og 239 av 289 norske selskaper med styredata (82,7 %). Den målrettede `extend-board-coverage-brreg.ts`-dry-runen for retail/processing/logistics/wholesale/seafood/inputs/production/property/foodservice fant seks in-scope selskaper uten styredata, men alle seks returnerte Brreg 404/not-found i rollerpasset. Ingen syntetiske styreverv ble opprettet.

## B2 Brreg-refresh

`npm run refresh:brreg` ble kjørt med eksplisitt `DATABASE_URL`: 254 norske org.nr. prosessert, 252 OK, 2 not found, 0 errors. Lilleborg-kanten er ikke en canvas-feil: `scripts/import-company-ownership.ts` fører Orkla -> Lilleborg som 0 % etter 100 % divestment til Solenis, effektiv 2024-06-12.

## Ikke si

- Ikke si at Orkla eier Lilleborg nå; 0 %-kanten er en divestment-markør.
- Ikke si at de seks 404-selskapene har manglende styredata som kan fylles fra Brreg uten org.nr.-rydding.
