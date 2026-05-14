---
tittel: "Sirkularitet-sprint 2026-05 — sprint-mappe"
status: aktiv
eier: Gabriel
dato: 2026-04-30
plan: /Users/gabrielboen/.claude/plans/la-oss-lage-en-snazzy-kahan.md
formaal: "Arbeidsmappe for nordisk sirkularitetsrapport. Trekker fra hele plattformen, leverer HTML-rapport + MD-appendiks."
neste_handling: "Fase 1.5 — utvide baseline med facts fra evidence-matrix, claim-register, dossiers og Eurostat øko-CSVer."
---

# Sirkularitet-sprint 2026-05

Arbeidsmappe for **Nordisk sirkularitetsrapport** — analyserapport bestilt av Jan Thomas (29.04 samtale) som skal vise:

1. Foregangsområder per land (NO, SE, DK, FI, IS)
2. Cognitive dissonance — politikk vs data
3. 3–5 fokusområder for transition-gruppa
4. Avgrensning mot Nordic Vision 2030

Full plan: `~/.claude/plans/la-oss-lage-en-snazzy-kahan.md`

## Status — alle faser ferdige (v1.0 utkast)

| Fase | Status | Output |
|---|---|---|
| **Fase 1: Baseline-konsolidering** | ✅ Ferdig | `nordisk-circularity-baseline-v0.3.json` (~120 facts) |
| **Fase 2: 8 tematiske dypdykk** | ✅ Ferdig | `batch-01` til `batch-08` |
| **Fase 3: Innsiktsmotor T1-T5** | ✅ Ferdig (T3 åpen) | `innsiktsmotor.md` (12 motsigelser, cross-tab, 15 spørsmål, Vision 2030-alignment) |
| **Fase 4: Cognitive dissonance + foregangsområder** | ✅ Ferdig | `syntese-fase-4.md` (7 cases, 5 fokusområder med score) |
| **Fase 5: HTML-rapport + MD-appendiks** | ✅ Ferdig | `public/reports/nordisk-sirkularitetsrapport-2026-05.html` + `docs/project/mandates/nordisk-sirkularitetsrapport-appendiks-2026-05.md` |

## Hovedleveranser

1. **HTML-rapport:** `/Users/gabrielboen/Documents/Food Systems 2026/public/reports/nordisk-sirkularitetsrapport-2026-05.html` — 8 seksjoner, 5 fokusområder, 7 dissonance-cases, lesbar i nettleser.
2. **MD-appendiks:** `/Users/gabrielboen/Documents/Food Systems 2026/docs/project/mandates/nordisk-sirkularitetsrapport-appendiks-2026-05.md` — full kildedokumentasjon, krysslinker til claim-register, kontroversielle påstander, v1.1-plan.

## Status etter v1.2 — alle 8 v1.2-faser ferdige

✅ v1.0 — alle 5 faser ferdig
✅ v1.1 — A1-A5 research lukket, APA7-light innført, soya-laundering nedgradert, FI-fôr verifisert som Valio-soya-fase-ut
✅ **v1.2 — alle 8 faser ferdige (2026-04-30)**

| v1.2 Phase | Status | Output |
|---|---|---|
| **Phase 1: Claim-audit** | ✅ | `research/v1-2/claim-audit.md` (87 påstander; 59% direkte primær, 14% svake) |
| **Phase 2: Primærsjekker A5** | ✅ | `research/v1-2/phase2-primaersjekker.md` (IFRO/KU + EUR-Lex + Stortingsproposisjon) |
| **Phase 3: Forbruksbasert matfotavtrykk** | ✅ delvis | `research/v1-2/phase3-matfotavtrykk.md` (NO 13, SE&lt;6, DK/FI 8 t/cap) |
| **Phase 4: Marine indikatorer** | ✅ | `research/v1-2/phase4-marine-indikatorer.md` (HELCOM HOLAS 3 + JRN-AFWG 2024) |
| **Phase 5: Subsidier per land** | ✅ | `research/v1-2/phase5-subsidier-per-land.md` (5 land + struktur-analyse) |
| **Phase 6: Substansutbygging** | ✅ | `research/v1-2/phase6-foregangsomrader-substans.md` + integrert i HTML §5 |
| **Phase 7: Selvkritikk** | ✅ | `research/v1-2/phase7-selvkritikk.md` + ny §9 i HTML |
| **Phase 8: T3 ekstern-vs-intern diff** | ✅ | `research/v1-2/phase8-T3-ekstern-vs-intern-diff.md` + integrert i §8 |

🟢 **Rapport status:** Klar for ekstern lansering (krever bruker-godkjenning før touchpoint).
🟢 **HTML-rapport:** v1.2-merket, 914 linjer, ~76KB, 5 fokusområder med Substansutbygging-blokker, 7 CD-cases, 9 seksjoner inkl. Selvkritikk.

## Tidlige innsikter (allerede synlige fra v0.2-prosessen)

**Disse motsi-kandidatene dukket opp bare ved å konsolidere data — Fase 3 T2/T4 skal forsterke dette:**

1. **NO øko-melk: tilbud-flaskehals, ikke etterspørsel.** Landbruksdirektoratet 2025 sier eksplisitt "ikke nok øko-melk for å møte etterspørsel" (80% utnyttelse) + 88% øko-egg utnyttelse — direkte motsatt av "lav etterspørsel"-narrativen. Politiske virkemidler rettet mot forbruker treffer feil rot.
2. **SE øko-melk faller -39% siden 2021-peak.** Sverige er fortsatt nordisk leder på UAA-andel (16,7%), men marked retraherer kraftig. "Foregangs-status" må kvalifiseres med markedstrend.
3. **NO EUDR-soya-blindspot.** Regjeringen 2026-01-09: soya IKKE inkludert i delvis EØS-gjennomføring. 92% fiskefôr importert. NO kan bli "soya-laundering" for EU-eksponerte verdikjeder.
4. **NO matsvinn-asymmetri.** Detaljhandel -42% siden 2015. Husholdning -5%. Bransjeavtale virker bare i ledd den dekker.
5. **FI vs DK matsvinn 6x forskjell** kan delvis være metode-divergens — viktigste nordiske samarbeid kan være MÅLEMETODE, ikke REDUKSJON.

## Innhold i mappen

- `README.md` (denne fila) — sprint-oversikt
- `nordisk-circularity-baseline-v0.1.json` — konsolidert datafundament
- *(kommer)* 8 tema-notater
- *(kommer)* `innsiktsmotor.md`
- *(kommer)* utkast til rapport

## Kjente datagaps (fra baseline v0.1)

1. **FI fase-ut av importert fôr i melkeproduksjon** (kritisk — kjerneeksempel fra Jan Thomas)
2. **Regenerativt landbruk per land** (distinkt fra øko)
3. **NO offentlig innkjøp øko-andel** (sammenligning mot DK København 84%)
4. **Subsidier per land** (kun NO godt dekket)
5. **IS marint restråstoff-detaljer** utover 100% Fish-programmet
6. **Cognitive dissonance-base — politiske påstander per land** (kritisk)

## Neste konkrete handling

**v0.3-utvidelse:**
- `docs/project/mandates/claim-register-food-tg.md` — hent CL-A/B/C-claims
- `docs/project/mandates/dossier-b-marine-nutrient-loops.md` — full marin
- `docs/project/mandates/dossier-b-process-sidestreams-okara-bsg.md` — okara/BSG
- `public/data/food-systems/policy-landscape.json` — UTP, beredskap, markedsmakt
- `research/data/nordic/core-series/organic_market_retail_annual.csv` — detaljhandel
- `research/norden/nordic-vision-2030-indicator-map-2026-04-29.csv` — Vision 2030 alignment
- `research/norden/nordic-vision-2030-indicator-gap-2026-04-29.md` — gap mot NMR

**Verifiser FI fôr-fase-ut** — kritisk åpent gap. Direkte nedlasting fra Luke/stat.fi/Valio. Hvis ikke verifiserbart, må Jan Thomas konfronteres: hvor kommer denne påstanden fra?

**Start Fase 2 dypdykk batch 1: importert fôr** — den har mest data og mest cognitive dissonance-kraft i v0.2.
