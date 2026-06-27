---
tittel: Food TG R13 — Batch 01 rapport
dato: 2026-06-27
goal: docs/project/mandates/food-tg-research-runde13-goal-codex-2026-06-25.md
batch: "01 (R13-GAP-001, R13-GAP-005, R13-WASTE-001, R13-GAP-002)"
regel: Internt research-underlag. Ingen claims, ingen DB-skriving, ingen safe_for_ai_context, ingen whitepaper-/deck-stemme.
status: Mottatt — komplett (4/4)
relaterte_filer:
  - docs/project/mandates/food-tg-research-runde13-promptpack-2026-06-25.md
  - docs/project/mandates/food-tg-research-runde13-goal-codex-2026-06-25.md
  - research/_status/food-tg-r13/decisions/batch-01.jsonl
  - research/_status/food-tg-r13/r13-intake-index-2026-06-25.md
---

# Food TG R13 — Batch 01 rapport

Komplett batch 01 fra goal-codex: `R13-GAP-001`, `R13-GAP-005`, `R13-WASTE-001`, `R13-GAP-002`.

## Oppsummering

| Beslutning | Antall | IDer |
|---|---:|---|
| enrich | 4 | R13-GAP-001, R13-GAP-005, R13-WASTE-001, R13-GAP-002 |
| park | 0 | — |
| actor-gate | 0 | — |

Tre fikk gate **PCQ**, én (`R13-GAP-002`) **source-shortlist**. Ingen output åpner claim, skriver DB eller bruker whitepaper-/deck-stemme.

## Mottaksrad-tabell

| ID | Tittel | Kildeklasse | Hulltype | Gate | Import­beslutning | Sterkeste kilde | Svakeste punkt |
|---|---|---|---|---|---|---|---|
| R13-GAP-001 | Kritiske importnoder | A with C gaps | Type A (soya/fiskeolje/kaffe/kakao/fosfat hentet); Type C (fôrprotein-total) | PCQ | importer | SSB tabell 08801, PxWeb-uttak 2026-06-27 | Fôrprotein-total ikke ett HS-nummer; reell fosfor-avhengighet undervurderes (P via NPK/fôr) |
| R13-GAP-005 | Verifisering av 7 parkerte R12-claims | A with C gaps | Type A/B/C per claim | PCQ | claim-lock-kandidat | Restaurant Rest konkurs (Brreg) + andelslandbruk 93 i drift 2023 (Landbruksdir./Øko. Norge) | ASKO/HORECA 70 % er omstridt aktøranslag uten uavhengig primær; SOIL-score ukjent proveniens |
| R13-WASTE-001 | Marint restråstoff R-stige | A with C gaps | Type C | PCQ | importer | SINTEF/FHF Analyse marint restråstoff 2024 (rapport 2025:00517) | Eksport rapportert som verdi (NOK), ikke volum per R-nivå; biogass-tonnasje avledet |
| R13-GAP-002 | Lokale verdikjeder og forsyningssikkerhet | B with C gaps | Type B | source-shortlist | vent | Fagfellevurdert SFSC-redundans-litteratur (EU4Advice 2024; MDPI 2021) + FFI 26/010 | Ingen kilde kvantifiserer bidrag til norsk forsyningssikkerhet; sterkeste fagkilder paywalled/403 i sesjon |

## Per-target outcome

### R13-GAP-001 — Kritiske importnoder
**Utfall: enrich → PCQ.** SSB tabell 08801 (PxWeb v1 API, uttak 2026-06-27) ga komplett Type-A primær importtidsserie 2020–2024 med volum (tonn) og verdi (NOK) i separate kolonner for soya (HS 1201/2304/1507), fiskeolje (1504 + 150420), kaffe (0901/090111) og kakao (1801/1803/1804/1805). De to R12-tomme cellene er nå synlig løst:
- **Fosfat:** råfosfat-import (HS 2510) er ≈0 (22 t i 2024); fosfor kommer i praksis inn via sammensatt NPK-gjødsel (HS 3105, ~35 000 t 2024) og fôrtilsetninger.
- **Fôrprotein-total:** vist som ekte metodisk/Type-C-luke fordi ingen enkelt HS-node fanger den; supplert med Landbruksdirektoratets kraftfôrstatistikk (415 970 t importerte proteinråvarer, 2025).

Comtrade ble forsøkt som speil, men returnerte 0 rader uten abonnementsnøkkel → ingen B-tall ført inn (speil ble ikke primær — som krevd).

### R13-GAP-005 — Verifisering av 7 parkerte R12-claims
**Utfall: enrich → PCQ (claim-lock-kandidat for de smaleste radene).** Hver claim verifisert uavhengig:
- **Kan løftes med caveat:** REKO-tall (Feb-2022-snapshot), andelslandbruk (93 i drift 2023), Restaurant Rest (konkurs åpnet 2024-09-05).
- **Delvis / vent:** fiskeolje art/sluttbruk — vent på Nofima-primær.
- **Parkert/nedgradert:** ASKO/HORECA 70 % (omstridt konkurrent-anslag fra Servicegrossistene under alternativ markedsdefinisjon; NorgesGruppen selv oppgir ~36 % — ingen uavhengig primær for 70 %); SOIL-score (ingen sporbar proveniens, *ikke* IPBES); Plantagon (svensk konkursfirma, ingen norsk relevans for NO-geo).

### R13-WASTE-001 — Marint restråstoff R-stige
**Utfall: enrich → PCQ.** SINTEF/FHF «Analyse marint restråstoff» hentet i fulltekst fra primærkilde: nyeste utgave (2024-data, rapport 2025:00517, ISBN 978-82-14-07469-7, datert 2025-06-02) + foregående år (2023-data, rapport 2024:00583). Begge klasse A. Nøkkelfunn for overclaim-vakt: 2024 ~1,094 mill. tonn tilgjengelig restråstoff, ~976 000 t (89 %) «utnyttet» — men kun ~15 % av produktvolum til humant konsum, mens fôr tar 66 % og biogass/energi ~19 %. **Høy utnyttelsesgrad ≠ høyverdi.** Tomme celler bevart: eksportvolum per R-nivå (rapportert kun som NOK-verdi), Danmark-biogass-eksportvolum, fritt laksblod (34 300 t tapt som prosessvann), pelsdyrfôr.

### R13-GAP-002 — Lokale verdikjeder og forsyningssikkerhet
**Utfall: enrich → source-shortlist (importDecision: vent).** Bygde på R12-RES-004 med fagfellevurdert mekanisme-litteratur (SFSC-redundans) + eksplisitt motevidens (lokal produksjon alene gir ikke robusthet). Bunnlinje: «lokal → forsyningssikkerhet» holder kun via tre navngitte mekanismer — redundans (parallell uavhengig forsyningsvei), desentraliserte lagre/infrastruktur (FFI), og lokal ressursutnyttelse som kutter innsatsvare-import (NIBIO) — og ingen er kvantifisert mot norsk forsyningssikkerhet. Sterkeste fagkilder (FFI-PDF kryptert, MDPI/ScienceDirect 403, Springer paywall) var utilgjengelige som fulltekst → forblir internt underlag, ikke claim.

## Kontroller

- `git diff --check`: ren.
- `npm run audit:research-artifacts -- --base=origin/main`: 0 violations.
- JSON-validitet `decisions/batch-01.jsonl`: 4/4 gyldige linjer.

## Neste

- Batch 01 komplett. Batch 02 (`R13-GAP-004`, `R13-GAP-006`, `R13-GAP-003`, `R13-WASTE-002`) kjørt — se `report-batch-02.md`.
- Resten av goal-codex-batchene (03–13) ikke startet.
