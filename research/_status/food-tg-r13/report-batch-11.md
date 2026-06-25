# Food TG R13 Batch 11 report

**Dato:** 2026-06-25
**Goal:** Execute controlled Food TG Research OS Runde 13 batch 11.
**Batch:** `R13-OKO-005`, `R13-OKO-007`, `R13-OKO-004`, `R13-OKO-006`
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 4 | `R13-OKO-005`, `R13-OKO-007`, `R13-OKO-004`, `R13-OKO-006` |
| actor-gate | 0 | - |
| park | 0 | - |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R13-OKO-005 | Merkeordninger dokumenterer ulike krav, ikke netto miljøeffekt. | Mattilsynet/Debio; Nyt Norge kravsett | Miljøeffekt og auditdata mangler. | A rules; B explanation; C effect | Type A counts; Type B audit; Type C effect | source-shortlist | importer |
| R13-OKO-007 | Norge har 10 %-økomål innen 2032; øvrige bærekraftsmål må skilles. | LMD strategi 2025-2032 | Achievement-serier er blandet/B/C. | A policy; B achievement; C dashboard | Type A share PCQ; Type B progress; Type C F2F dashboard | PCQ | importer |
| R13-OKO-004 | Biodiversitetsproxyer viser press/nedgang, men ikke kausal driftspraksis. | Naturindeks; NIBIO 3Q | Åpent lavland er ikke alt jordbrukslandskap. | A monitoring; B proxy; C causal total | Type A extraction; Type B tables; Type C unified index | source-shortlist | importer |
| R13-OKO-006 | Beite/utmark har sterke statistikk- og metodeankre, men ikke kausalt metan-/karbontall. | NIBIO Beitestatistikk; SSB/MD metode | Beitekarbon/metan er systemgrensefølsomt. | A data/method; B project; C causal claims | Type A reconciliation; Type B pasture result; Type C ecology effect | source-shortlist | importer |

## Per-target outcome

### R13-OKO-005 - ENRICH

Output: `research/external/r13/R13-OKO-005-sertifisering-merkeordninger.md`

Outcome: Source-shortlist. Krav-/regelverkskartet kan brukes som kildekø; miljøeffekt må parkeres.

### R13-OKO-007 - ENRICH

Output: `research/external/r13/R13-OKO-007-policy-mal-okologi.md`

Outcome: PCQ. Policy-målene kan kontrolleres videre, men må ikke visualiseres som måloppnåelse ennå.

### R13-OKO-004 - ENRICH

Output: `research/external/r13/R13-OKO-004-biodiversitet-jordbruk.md`

Outcome: Source-shortlist. Biodiversitetsproxyer er relevante kilder, ikke kausale claims.

### R13-OKO-006 - ENRICH

Output: `research/external/r13/R13-OKO-006-beite-utmark-husdyr.md`

Outcome: Source-shortlist. Deskriptive areal-/dyre-/metanindikatorer er nyttige; kausale beiteclaims holdes tilbake.

## Stop-regler som ble brukt

- Merkeordning ble ikke gjort til miljøeffekt.
- EU Farm to Fork ble ikke gjort til norsk vedtatt mål.
- Biodiversitetsproxy ble ikke gjort til kausal driftsclaim.
- Metan-/karbonregnskap ble ikke gjort metodefritt.

## Må ikke visualiseres ennå

- `R13-OKO-005`: ingen merke-score uten auditdata og effektgrunnlag.
- `R13-OKO-007`: ingen måloppnåelsesgraf før achievement-seriene er PCQ-et.
- `R13-OKO-004`: ingen samlet biodiversitetsfigur uten proxy- og scopeetikett.
- `R13-OKO-006`: ingen beite/metan/karbonfigur uten metode og systemgrense.
