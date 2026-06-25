# Domene-kartlegging sluttrapport 2026-06-25

## Stoppstatus

Stopp-aarsak: tids-/tokenbudsjett naer slutt; margin beholdt til rapport, verifikasjon og PR. Hard backstop ble ikke truffet.

- Nye noder importert lokalt: 37 / 250
- Berikede eksisterende noder: 0
- Droppet kildeloese noder: 0
- `machine_verified`: 23
- `unverified`: 14
- Flagget for menneske: 14

## Celleoppsummering

| Celle | Foer | Etter | Nye | Beriket | Status |
|---|---:|---:|---:|---:|---|
| lokale-verdikjeder / reko / NO | 6 / 140 | 20 / 140 | 14 | 0 | Mettet for kjoeringen |
| lokale-verdikjeder / andelslandbruk / NO | 7 / 93 | 20 / 93 | 13 | 0 | Mettet for kjoeringen |
| regenerativ-praksis / market-gardening / NO | 0 / 30 | 10 / 30 | 10 | 0 | Ikke mettet |

## Kilder brukt

- REKO Norge: offisiell kontekst for kart/Facebook-grupper og 130+ ringer.
- Spiselig REKO-liste oppdatert 27.11.2022: konkrete Facebook-lokatorer for 14 REKO-ringer. Alle er importert som `unverified` og flagget for menneske.
- Oekoguiden API categoryId `8467` (Andelslandbruk): 13 registerrader importert som `machine_verified`.
- Oekoguiden API categoryId `9952` (Markedshage): 10 registerrader importert som `machine_verified`.

## Gjenstaaende arbeidsliste

Sortert etter gap i `public/data/coverage/domene-profiles.json` etter denne kjoeringen:

1. `lokale-verdikjeder/reko`: 120 gap, men cellen har naadd kjoeringsgulvet `min(20, estimated_universe)`.
2. `lokale-verdikjeder/andelslandbruk`: 73 gap, men cellen har naadd kjoeringsgulvet.
3. `regenerativ-praksis/market-gardening`: 20 gap, ikke mettet. Neste pass maa hente minst 10 flere rene markedshage-/smaaskala-groentnoder eller dokumentere to torre gather-runder.
4. `regenerativ-praksis/jordhelse-karbon`: 20 gap.
5. `permakultur-fleraarige/skogshage-agroforestry`: 20 gap.
6. `permakultur-fleraarige/demonstrasjonssteder`: 20 gap.
7. `lokale-verdikjeder/bondens-marked`: 16 gap.
8. `regenerativ-praksis/raadgivning-nettverk`: 15 gap.
9. `permakultur-fleraarige/planteskoler-froeleverandoerer`: 15 gap.
10. `institusjon-finansiering/interesseorg-paraply`: 15 gap.
11. Remaining lower-gap cells are visible in `research/_status/domene-dekning-hull-2026-06-25.md`.

## Etterkontroll

- Review-koe: `research/_status/domene-review-koe-2026-06-25.csv`.
- Usikkerhetslogg: `research/_status/domene-usikkerhetslogg-2026-06-25.md`.
- Per-celle mottakslogger:
  - `research/_status/domene-mottakslogg-reko-2026-06-25.md`
  - `research/_status/domene-mottakslogg-andelslandbruk-2026-06-25.md`
  - `research/_status/domene-mottakslogg-market-gardening-2026-06-25.md`

## DB-sikkerhet

- Kjoert mot lokal DB med hostname `localhost`.
- Pre-import backup: `~/foodsystems-domene-backup-20260625-235012.sql`.
- Ingen Prisma-schemaendring og ingen prod-import.
