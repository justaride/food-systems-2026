# R13-GAP-006 - actor-gate validation packet

**Dato:** 2026-06-25
**Status:** actor-gate, ikke lukket
**Bruksregel:** Intern kontroll. Ikke publiser totalantall, kart eller nettverksgraf.

## Kort dom

R13-GAP-006 er en intern triage over R12/R13-hull, ikke en ekstern kilde. Den kan brukes til å finne riktig dataeier per hull, men den kan ikke fylle hullene selv. Lavfriksjonsvalidering er å splitte hvert hull i Type A desk-uttak, Type B actor-gate og ekte Type C.

## Dataeier- og valideringsrad

| Felt | Mulig dataeier | Offentlig lavfriksjon-lokator | Krever kontakt? | Godkjent evidensform | Stoppsignal |
|---|---|---|---|---|---|
| import-sluttbruk | importør, fôrprodusent, bransjeorgan | SSB 08801 som varekodeanker | ja | datert aktør-/bransjebekreftelse med sluttbruk | varekode alene er ikke sluttbruk |
| alternative fôrproteiner | produsent, kunde, myndighet | prosjekt-/kapasitetslokator | ja | årsvolum, produktform, godkjenning og kunde-/brukskategori | kapasitet er ikke realisert volum |
| REKO/andelslandbruk/markedshager | nettverk, gård, ringadministrator | nettverksliste/kart/API | ja | datert aktiv-status per aktør | karttreff er ikke aktiv-status |
| oppdrettsslam | operatør, avfallsmottak, myndighet | metode- og problemrapporter | ja | målt innsamlet/behandlet volum med TS/N/P | modellert potensial er ikke realisert serie |
| margin/avregning | bonde, kjøper, samvirke, regnskapsmiljø | ingen komplett åpen lokator | ja | avtale-/avregningsfelt med periode og scope | desk-estimat stopper |

## Kandidat-/dekningstabell

| Kandidat/node | Locator | Kildeklasse | Aktiv-status | Dekningscaveat | Tom celle |
|---|---|---|---|---|---|
| R12/R13 intake JSONL/MD | `research/_status/food-tg-r12/` og `food-tg-r13/` | intern | ukjent | triage, ikke primærkilde | dataeier per hull |
| SSB-lukkede HS-rader | R13-GAP-001 | A | ikke relevant | lukker vareimport, ikke sluttbruk | sluttbruk |
| aktørdatahull | R13 actor-gate backlog | B/C | ukjent | må valideres per aktør | volum/status |

## Før eventuell DASK/AASK

- Del hvert hull i felt, dataeier, periode, tilgangsstatus og publiserbarhet.
- Spør bare etter felt som faktisk kan flytte raden ut av actor-gate.
- Ikke estimer kontrakt, margin, lager, sluttbruk eller aktiv-status fra indirekte kilder.

## Ikke si

- Ikke si at actor-gate er lukket.
- Ikke publiser totalantall eller kart fra kandidatflate.
- Ikke gjør medlemskap, karttreff eller selvbeskrivelse til produksjons-/effektbevis.
