---
tittel: Food TG R13 — Batch 02 rapport
dato: 2026-06-27
goal: docs/project/mandates/food-tg-research-runde13-goal-codex-2026-06-25.md
batch: "02 (R13-GAP-004, R13-GAP-006, R13-GAP-003, R13-WASTE-002)"
regel: Internt research-underlag. Ingen claims, ingen DB-skriving, ingen safe_for_ai_context, ingen whitepaper-/deck-stemme.
status: Mottatt — komplett (4/4)
relaterte_filer:
  - docs/project/mandates/food-tg-research-runde13-promptpack-2026-06-25.md
  - docs/project/mandates/food-tg-research-runde13-goal-codex-2026-06-25.md
  - research/_status/food-tg-r13/decisions/batch-02.jsonl
  - research/_status/food-tg-r13/r13-intake-index-2026-06-25.md
---

# Food TG R13 — Batch 02 rapport

Komplett batch 02 fra goal-codex: lukking av resterende R12-batch-07-hull (GAP-004, GAP-003), type-C-eskalering (GAP-006) og oppdrettsslam-massebalanse (WASTE-002).

## Oppsummering

| Beslutning | Antall | IDer |
|---|---:|---|
| enrich | 2 | R13-GAP-004, R13-GAP-003 |
| actor-gate | 1 | R13-GAP-006 |
| park | 1 | R13-WASTE-002 |

Gater: GAP-004 + GAP-003 → source-shortlist; GAP-006 → forstaelse; WASTE-002 → PCQ (men importDecision vent / park). Ingen output åpner claim, skriver DB eller bruker whitepaper-/deck-stemme.

## Mottaksrad-tabell

| ID | Tittel | Kildeklasse | Hulltype | Gate | Import­beslutning | Sterkeste kilde | Svakeste punkt |
|---|---|---|---|---|---|---|---|
| R13-GAP-004 | Alternative nordiske fôrproteiner | A with C gaps | Type A | source-shortlist | aktørspørsmål | Solar Foods pressemelding okt 2025; Volare €26M-melding | Realisert fôr-grade årsvolum ikke oppgitt for noen rendyrket nordisk aktør — alt er kapasitet/plan/input |
| R13-GAP-006 | Type-C-eskalering + actor-gate-kø | C (arbeidskart) | meta (reklassifiserer A/B/C) | forstaelse | aktørspørsmål | R12 intake-indeks 2026-06-24 + per-hull reklassifisering | Intern triagesyntese, ikke ny primær; hvert A-kall må bekreftes ved faktisk uttrekk |
| R13-GAP-003 | Transport/lager-sårbarhet (mat, Norden) | A with C gaps | Type A | source-shortlist | importer | Riksrevisjonen Dok. 3 (2023–2024) matsikkerhet/beredskap | Node-tonnasje/dagsdekning ikke åpent publisert (C); flere primær-PDF-er ikke tekstuttrekt (B) |
| R13-WASTE-002 | Oppdrettsslam massebalanse | A with C gaps | Type B | PCQ | vent (park) | Miljødirektoratet tilsynsaksjon 2024 (publ. 2025) | Ingen kilde gir modellert/innsamlet/behandlet for samme anlegg samme år |

## Per-target outcome

### R13-GAP-004 — Alternative nordiske fôrproteiner
**enrich → source-shortlist (aktørspørsmål).** Korrigerte R12-feil: Invertapro driver melbillelarve (Tenebrio molitor), ikke BSF. Enorm Biofactory (DK) konkurs 30.10.2025 — 10 000 t/år var designkapasitet som aldri ble realisert. Solar Foods Factory 01 nådde 160 t/år-mål sent 2025, men Solein er mat, ikke fôr. La til Volare (FI, BSF, Skretting-offtake) og Enifer/PEKILO (FI, mycoprotein). **Realisert fôr-grade tonnasje er fortsatt ikke oppgitt for noen rendyrket nordisk aktør** — alle store tall er kapasitet/plan/input.

### R13-GAP-006 — Type-C-eskalering og actor-gate-kø
**actor-gate → forstaelse.** R12s C-hull splittet tre veier: de fleste er blandet — en desk-researchbar A-kjerne (SSB/Doffin/register-uttrekk, struktur, organisering) rundt en hard B (aktør/kontrakt/aktiv-status) eller ekte C (sluttbruk, realisert volum, harmonisert nordisk serie, klassifiserte lagerdata). Bygde 35-rads eskaleringstabell, konsoliderte Type-B-hull til en 14-posters actor-gate-kø, og bevarte ekte-Type-C som funn. Tre lette web-sjekker bekreftet locatorer uten å konvertere C til A.

### R13-GAP-003 — Transport- og lager-sårbarheter (mat, Norden)
**enrich → source-shortlist (importer).** Bygde på R12-RES-005, snevret til kun matrelevante noder, med de overordnede beredskapskildene R12 manglet (Totalberedskapskommisjonen NOU 2023:17, Riksrevisjonen 2023–2024, DSB strømrasjonering, Meld. St. 9 (2024–2025), Kystverket, svensk SOU 2024:8 / Livsmedelsverket / Jordbruksverket). Sterkeste tallfestede matnoder: NO ~60 % import/fôravhengighet og 34–40 % fôrjustert selvforsyning (A); matkorn-beredskapslager 82 500 t (~3 mnd) innen 2029 (A). Kaldkjede-/havne-/lagertonnasje per node forblir C-celler (beredskaps-/forretningssensitivt).

### R13-WASTE-002 — Oppdrettsslam massebalanse
**park → PCQ (vent).** Offentlige tall er hovedsakelig modellerte utslipp (535 412 t slam / 14 000 t P, 2019); innsamlet og behandlet finnes kun som fragmenter, og åpne merder (~95 % av biomassen) samler ~0 under normal drift. **Ingen kilde kobler modellert/innsamlet/behandlet per anlegg per år** → parkert til actor/primærdata foreligger.

## Kontroller

- `git diff --check`: ren.
- `npm run audit:research-artifacts -- --base=origin/main`: 0 violations.
- JSON-validitet `decisions/batch-02.jsonl`: 4/4 gyldige linjer.

## Neste

- Batch 01–02 komplett (8/50 mottaksført). Batch 03 (`R13-WASTE-003`, `R13-WASTE-004`, `R13-WASTE-005`, `R13-WASTE-007`) er neste i goal-codex-rekkefølgen.
