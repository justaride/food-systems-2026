---
tittel: C4 Brreg financials og companyId-lenking
dato: 2026-07-03
status: R14 internt arbeidsunderlag
bruksregel: Ingen ekstern claim, ingen safe_for_ai_context, ingen whitepaper-/deck-stemme. Svakeste punkt styrer gate.
---

# C4 Brreg financials og companyId-lenking

## Kort dom

`npm run refresh:brreg-financials` ble kjørt bredt etter C1/C2-importene. Importeren ble hardnet under R14 slik at out-of-range tall og ekstremmarginer logges som `RANGE-SKIP` i stedet for å abortere batchen, og Regnskapsregisteret-kilder skrives med direkte URL.

Siste fullførte kjøring: 254 selskaper forsøkt, 233 med regnskap, 95 rader skrevet (45 nye, 50 oppdatert), 131 kuraterte rader beholdt, 6 holding-mødre hoppet over, 3 FX-skip, 4 range-skip, 13 uten innlevert regnskap og 2 Brreg 500-feil.

## Ikke si

- Ikke bruk range-skips eller FX-skips som nullregnskap.
- Ikke erstatt kuraterte konserntall med selskapstall for holdingmødre.
