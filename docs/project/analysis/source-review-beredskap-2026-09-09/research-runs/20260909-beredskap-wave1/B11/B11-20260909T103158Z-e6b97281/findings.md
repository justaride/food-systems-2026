# B11 findings — Gjenvunnet fosfor (C3)

programRunId: `20260909-beredskap-wave1`  
packageId: `B11`  
runId: `B11-20260909T103158Z-e6b97281`  
planCommit: `5c3d735712f3b5fe929ba8043ee57a74cb318e1a`  
researchBaselineCommit: `4026a90d62edf129d4323f7f0971ace716b03983`  
terminalStatus: `waiting_owner`  
human_verified: false  

## Scope and stop rule

Avgrensning: én produktstrøm (Hias-struvitt), mottakerjord/vekst/sesong, N/P/K holdt skilt.  
Stoppregel fulgt: ingen nasjonal NPK-total; ingen likestilling av produkt-P og planteopptak; ingen effekt uten samme jord/vekst/sesong; usendt dataeier-/måleskjema levert i privat artefaktrot.

## Q1 — Dose-/prosentkonflikt (erratum eller rådata)?

**Svar (presist stopp):** Konflikten er reprodusert og ikke avklart.

- Discussion i NORSØK 4(10) 2019 (R3-NPK-S004 s. 27) hevder **130 %** avlingsøkning for no-manure + struvitt.
- Table 5 (s. 20) gir totaler **240 → 410 kg DM/daa** for samme kontrast; diagnostisk regning `(410-240)/240*100 = 70.8333…` (ikke effektestimat for C3-leveranse).
- Methods (s. 10) definerer husdyrgjødseldoser som **0/110/220 kg N ha−1**, mens Table 5-header printer **kg N /m2**.
- Organic Eprints 36472-landing har **ingen** erratum/corrigendum/rettelse; orgprints-PDF har annen raw-SHA enn round-003-frys, men **identisk** pdftotext for konfliktsidene.

**Kjent:** intern kildeinkonsistens (videreført fra R3-NPK-O006).  
**Ukjent:** forfatterkorrigert prosent og doseenhet / rådata.  
**Neste steg:** usendt forespørsel til NORSØK/NIBIO-forfattere (B11-F22); ingen kontakt sendt.

## Q2 — Disponibelt parti, kvalitet, anvendt plantetilgjengelig P, erstattet mineralvare?

**Svar (presist stopp / delvis oppdatering):**

| Variabel | Status i inspiserte kanaler |
|---|---|
| 2025 årsproduksjon | **Kjent (operator):** 29 850 kg produkt; 12 % P; 3 582 kg P; 6,9 % av 52 026 kg Tot-P; månedlig 0–4 998 kg (B11-S001 s. 14). |
| Disponibel beholdning per parti/lager/dato | **Ukjent** (parti/batch count 0 i 2025-ekstrakt). |
| Produktkvalitetsidentitet | **Delvis:** Mattilsynet 083386; P 134 g/kg TS m.m. (Debio/S003). Udattert deklarasjon ≠ batch-COA. |
| Anvendt plantetilgjengelig P på én byggåker/sesong | **Ukjent** |
| Faktisk erstattet navngitt mineralvare | **Ukjent** |

Potteforsøk (NIBIO) og engforsøk (NORSØK) brukes **ikke** som substitusjonsfaktor.

**Neste steg:** usendt intake B11-F01–F15 til Hias + navngitt mottaker.

## Q3 — Avstemming slam, struvitt, tap, kjemikalier, energi, nasjonal/nordisk baseline uten dobbelttelling?

**Svar (presist stopp):** Metode- og datakrav uoppfylt.

- 2025-rapporten omtaler slam/biomasse til jordbruk (klasse II) **separat** fra struvittproduksjon; ingen før/etter massebalanse for samme avløps-P med tap.
- Energiblobber på anleggsnivå erstatter ikke leverbar P under navngitt energi-/Mg-/transportavbrudd.
- Ingen paret nordisk mottaker-/leverandørtest; norske tall er ikke nordisk merverdi.
- Ingen nasjonal NPK-total er beregnet (stoppregel).

**Neste steg:** B11-F16–F21 (massebalanse, forstyrrelse, nordisk par) via eier/metode — usendt.

## Gap dispositions (alle `semanticGapClosed: false`)

- **NEW-NPK-01** — remains_open_waiting_owner_and_measurement  
- **R3-NPK-G001** — remains_open_waiting_owner  
- **R3-NPK-G002** — remains_open_waiting_owner_and_measurement  
- **R3-NPK-G003** — remains_open_waiting_method_and_owner  
- **R3-NPK-G004** — remains_open_waiting_owner  
- **R3-NPK-G005** — remains_open_waiting_method_and_owner  
- **R3-NPK-G006** — remains_open_waiting_owner_source_correction  

## Begrensninger / motsigelser

- Kildeuavhengighet: Hias publiserer operatørdata og leverte forsøksmateriale; NIBIO/NORSØK er ikke fire uavhengige replikasjoner (jf. round-003).
- 12 % P (årsrapport, produktmasse) vs 134 g P/kg TS (deklarasjon) må ikke slås sammen ukritisk.
- Ingen e-post/kontakt, ingen publisering, ingen endring av research-plan/ eller prior rounds.

## Usendt artefakt

Privat: `/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a0855c-d619-77d1-8f50-54d1006d6b0e/research-runs/20260909-beredskap-wave1/B11/B11-20260909T103158Z-e6b97281/intake/B11-unsent-owner-measurement-intake.json` (SHA-256 5e933ffd6115d29fec8f1c80794497c7a849eb51ec82269e056f06ae54632a9e).

## Authority

Alle kandidater `human_verified: false`. Ingen kanonisk promotering eller readiness-endring.
