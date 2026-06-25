# Food TG R13 big-step control ledger

**Dato:** 2026-06-25
**Status:** Intern kontroll-ledger etter PCQ- og actor-gate storsteg
**Bruksregel:** Ikke claim-lock, ikke DB, ikke figur, ikke deck og ikke whitepaper.

## Kort oppsummering

Dette steget opprettet åtte PCQ-only artefakter for de høyest prioriterte R13 PCQ-radene og seks actor-gate validation packets for alle actor-gate-radene. Artefaktene er kontrollflater: de viser kildegrunnlag, radvis uttrekk, tomme celler, dataminimum og stoppsignaler. Ingen rad er åpnet som claim-lock.

## PCQ-artefakter

| ID | Artefakt | Status | Bruksgrense |
|---|---|---|---|
| R13-GAP-001 | `pcq/R13-GAP-001-importnode-extraction-sheet-2026-06-25.md` | PCQ-only | ikke claim-lock |
| R13-OKO-001 | `pcq/R13-OKO-001-okoareal-mal-kort-2026-06-25.md` | PCQ-only | ikke claim-lock |
| R13-WASTE-001 | `pcq/R13-WASTE-001-rstige-metodetabell-2026-06-25.md` | PCQ-only | ikke claim-lock |
| R13-LAND-001 | `pcq/R13-LAND-001-strukturkart-ledger-2026-06-25.md` | PCQ-only | ikke claim-lock |
| R13-OKO-007 | `pcq/R13-OKO-007-policy-target-matrix-2026-06-25.md` | PCQ-only | ikke claim-lock |
| R13-WASTE-004 | `pcq/R13-WASTE-004-matsvinn-baseline-tabell-2026-06-25.md` | PCQ-only | ikke claim-lock |
| R13-LAND-002 | `pcq/R13-LAND-002-ownership-edge-ledger-2026-06-25.md` | PCQ-only | ikke claim-lock |
| R13-OKO-003 | `pcq/R13-OKO-003-soil-monitoring-gap-card-2026-06-25.md` | PCQ-only | ikke claim-lock |

## Actor-gate-pakker

| ID | Artefakt | Status | Bruksgrense |
|---|---|---|---|
| R13-GAP-006 | `actor-gate/R13-GAP-006-dataeier-per-hull-2026-06-25.md` | actor-gate | ikke lukket |
| R13-AKTOR-001 | `actor-gate/R13-AKTOR-001-markedshager-public-validation-2026-06-25.md` | actor-gate | ikke lukket |
| R13-AKTOR-002 | `actor-gate/R13-AKTOR-002-andelslandbruk-public-validation-2026-06-25.md` | actor-gate | ikke lukket |
| R13-AKTOR-004 | `actor-gate/R13-AKTOR-004-regenerative-praktikere-public-validation-2026-06-25.md` | actor-gate | ikke lukket |
| R13-AKTOR-005 | `actor-gate/R13-AKTOR-005-fro-genressurs-dataeier-2026-06-25.md` | actor-gate | ikke lukket |
| R13-AKTOR-007 | `actor-gate/R13-AKTOR-007-skogshage-permakultur-public-validation-2026-06-25.md` | actor-gate | ikke lukket |

## Senere claim-lock-vurdering

Kun smale delrader kan vurderes i en senere egen claim-lock-session etter ny kontroll:

- R13-GAP-001: enkeltstående HS/proxy-rader med kode, år, kg, verdi, opprinnelsesland og foreløpig/endelig status.
- R13-OKO-001: ett kanonisk arealtall etter SSB/Debio-avstemming og karensmerking.
- R13-WASTE-001: restråstoffstatus per sektor/enhet når R-stige-omkoding er synlig.
- R13-LAND-001: regulatorstøttede dagligvareandeler med KT-metode og caveat.
- R13-OKO-007: norsk 10 prosent økoarealmål som separat policymål.
- R13-WASTE-004: 2024 matsvinn-baseline med sektor, år, definisjon og metode.
- R13-LAND-002: datert ownership-edge per kobling når orgnummer/shareholder-felt er festet.
- R13-OKO-003: programstatus for JordVAAK/LSK som programfunn, ikke trendclaim.

## Fortsatt ikke visualiser

- Alle R13-rader står fortsatt i `må ikke visualiseres ennå`.
- PCQ-radene mangler metodekolonner, avstemmingsvalg, enhetsmerking eller tomme celler før figur.
- Actor-gate-radene mangler aktiv-status, dataeierbekreftelse, volum, dedupe eller publiserbar dekning.
- Forståelse/internal-rader er arbeidskart, ikke siterbar kilde.

## Neste anbefalte session

Neste session bør enten committe R13-scope hvis Gabriel ber eksplisitt om commit, eller kjøre en smal claim-lock-forberedelse på én til tre PCQ-delrader. Actor-gate bør ikke desk-researches videre før dataeier, kontaktvei eller registerfelt er avklart.

## Ikke gjort

- Ingen claim-lock ble åpnet.
- Ingen DB-skriving ble gjort.
- Ingen figurer, decktekst eller whitepaper-stemme ble laget.
- Ingen actor-gate ble lukket.
