---
tittel: "Food TG analysefabrikk - runde 2 prompts"
status: Utført internt
eier: Gabriel
sist_oppdatert: 2026-04-28
neste_handling: Start én master session og seks worker sessions etter promptene under.
relaterte_filer:
  - docs/project/mandates/analysefabrikk-food-tg-arbeidsprosess-2026-04-28.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-master-merge-prompts-12-15.md
  - docs/project/mandates/source-shortlist-food-tg.md
  - docs/project/mandates/evidence-matrix-food-tg.md
  - docs/project/mandates/claim-register-food-tg.md
---

# Food TG analysefabrikk - runde 2 prompts

## 1. Formål

Runde 2 følger masterkøen etter `2026-04-28-master-merge-prompts-12-15.md`. Målet er å gjøre seks usikre områder mer beslutningsklare før neste master-merge:

1. A-juridisk fôrsubstrat.
2. A-importdata.
3. B-matsvinn tall.
4. B-prosess-sidestrømmer.
5. B-næringsstoffløkker.
6. C-norsk governance.

Runde 2 skal ikke oppjustere noen claim til `Validert eksternt`. Den skal produsere bedre source cards, primærkildekontroll, tallregister, juridiske forbehold og aktørvalideringsspørsmål.

## 2. Anbefalt kjøring

Kjør alle seks workers parallelt hvis kapasitet finnes. Hvis ikke, kjør to puljer:

| Pulje | Sessions | Hvorfor |
|---|---|---|
| Pulje 1 | A-juridisk, A-importdata, B-matsvinn tall | lukker mest kritiske primærkilde-/tallrisikoer |
| Pulje 2 | B-prosess, B-næringsstoff, C-governance | bygger aktør- og adoption-gate |

Alle workers skal levere til master, ikke redigere canonical docs direkte.

## 3. Master prompt runde 2

```markdown
Du er master session for Food TG analysefabrikk runde 2.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les først:
- docs/project/mandates/analysefabrikk-food-tg-arbeidsprosess-2026-04-28.md
- docs/project/mandates/analysefabrikk-runde-2-prompts-2026-04-28.md
- docs/project/mandates/analysefabrikk-handoffs/2026-04-28-master-merge-prompts-12-15.md
- docs/project/mandates/source-shortlist-food-tg.md
- docs/project/mandates/evidence-matrix-food-tg.md
- docs/project/mandates/claim-register-food-tg.md

Din jobb:
1. Start/koordiner seks worker sessions fra runde-2-promptene.
2. Ikke dyples alt selv.
3. Mottak worker-handoffs og klassifiser hvert funn som:
   - integrer nå
   - needs-primary-check
   - needs-actor-validation
   - archive/reject
4. Normaliser alle funn til SRC-ID, EV-ID, CL-ID og status.
5. Oppdater canonical docs bare etter kvalitetssjekk.
6. Lag master merge-logg i:
   docs/project/mandates/analysefabrikk-handoffs/2026-04-28-master-merge-runde-2.md

Viktige regler:
- Ingen claims markeres Validert eksternt.
- L4/Perplexity/forskningsrunde kan bare brukes som kildejakt eller hypoteser.
- Juridiske og regulatoriske funn må ha tydelig primærkilde eller stå som needs-primary-check.
- Tall må ha definisjon, år, geografi, enhet og kilde.

Start med å bekrefte de seks worker-batchene og hva du forventer tilbake fra hver.
```

## 4. Worker prompt 2A - juridisk fôrsubstrat

```markdown
Du er Worker 2A: A-juridisk fôrsubstrat for Food TG analysefabrikk.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les:
- docs/project/mandates/analysefabrikk-food-tg-arbeidsprosess-2026-04-28.md
- docs/project/mandates/analysefabrikk-runde-2-prompts-2026-04-28.md
- docs/project/mandates/track-brief-a-feed-import.md
- docs/project/mandates/evidence-matrix-food-tg.md
- docs/project/mandates/claim-register-food-tg.md

Scope:
- TSE/ABP-regler, kategori 3-materiale, tidligere matvarer, swill, insekt-substrater og Mattilsynet/EU/EØS-relevans.
- Start fra eksisterende kilder:
  - research/bibliotek/forskningsrunde-2026-04-20-r2/p10-eu-tse-novel-food-regulering-2026-04-20.md
  - research/bibliotek/akademia/pubmed/van-der-fels-klerx-hj-2024-framework-for-evaluation-of-food.md
  - research/bibliotek/akademia/pubmed/van-leeuwen-spj-2024-a-novel-approach-to-identify.md
  - research/bibliotek/forskningsrunde-2026-04-20-r2/p19-bsf-substrat-sidestrommer-2026-04-20.md

Du skal finne primærkilder i repoet hvis de finnes. Bruk rg på EU-regelverk, Mattilsynet, TSE, ABP, category 3, insect, feed, former foodstuffs.

Ikke rediger canonical docs.

Lever handoff med:
1. Source cards for alle solide primær-/sekundærkilder.
2. Legal-gate for CL-A-011 og CL-A-021.
3. Liste over lovlige/ulovlige/uavklarte substratkategorier, med forbehold.
4. Hva må spørres Mattilsynet om.
5. Hva master kan integrere nå vs. hva som må juridisk sjekkes.
```

## 5. Worker prompt 2B - A-importdata

```markdown
Du er Worker 2B: A-importdata for Food TG analysefabrikk.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les:
- docs/project/mandates/analysefabrikk-food-tg-arbeidsprosess-2026-04-28.md
- docs/project/mandates/analysefabrikk-runde-2-prompts-2026-04-28.md
- docs/project/mandates/track-brief-a-feed-import.md
- docs/project/mandates/evidence-matrix-food-tg.md
- docs/project/mandates/claim-register-food-tg.md

Scope:
- Soya, soyamel, soyaproteinkonsentrat, fiskemel, Denofa, laksefôrvolum, kraftfôr/laksefôr-skille, EUDR-Norge.
- Start fra:
  - research/bibliotek/forskningsrunde-2026-04-20-r2/p09-soyaimport-norden-2026-04-20.md
  - research/bibliotek/forskningsrunde-2026-04-20-r2/p12-fiskemel-verdikjede-global-2026-04-20.md
  - research/norden/verdikjede/04-innsatsvarer.md
  - research/regulatory/eu-eudr-avskogingsforordningen-2025.md
  - research/bibliotek/akademia/nmbu/foods-of-norway-novel-feed-2024.md

Bruk rg for å finne Denofa, soyaprotein, soya, fiskemel, fishmeal, feed, fôr, Mowi, BioMar, Skretting, Cargill, EUDR.

Ikke rediger canonical docs.

Lever handoff med:
1. Tallregister med år, enhet, geografi, definisjon og kilde.
2. Skille mellom soyabønner, soyamel, soyaproteinkonsentrat, kraftfôr og laksefôr.
3. Hvilke tall er citation-ready, hvilke er needs-primary-check.
4. Claim-effekt for CL-A-001, CL-A-002, CL-A-020, CL-C-011.
5. Røde flagg for overclaiming.
```

## 6. Worker prompt 2C - B-matsvinn tall

```markdown
Du er Worker 2C: B-matsvinn tall og virkemidler for Food TG analysefabrikk.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les:
- docs/project/mandates/analysefabrikk-food-tg-arbeidsprosess-2026-04-28.md
- docs/project/mandates/analysefabrikk-runde-2-prompts-2026-04-28.md
- docs/project/mandates/track-brief-b-sidestreams-nutrients.md
- docs/project/mandates/evidence-matrix-food-tg.md
- docs/project/mandates/claim-register-food-tg.md

Scope:
- Matsvinnutvalget, Matvett/NORSUS, SSB/Eurostat, bransjeavtalen, sektorfordeling, mål, virkemidler, definisjoner.
- Start fra:
  - research/evidence-pack/offentlig/matsvinnutvalget-2024.pdf
  - research/bibliotek/sirkularitet/nordisk-matsvinn-rapport-2024.md
  - research/bibliotek/sirkularitet/matsvinn-tidsserier-norden.md
  - research/norden/verdikjede/06-matsvinn-sirkulaer.md
  - research/perplexity-20-04-26/kpi-sirkularitet-offentlig-privat.md
  - research/perplexity-20-04-26/matstroemmer-norden-kvantitativ.md

Perplexity-kilder skal bare brukes til kildejakt, ikke som evidens.

Ikke rediger canonical docs.

Lever handoff med:
1. Citation-ready tall med side/seksjon hvis mulig.
2. Definisjoner: matsvinn, matavfall, spiselig/ikke-spiselig, ledd i verdikjeden.
3. Virkemidler og datakrav fra Matsvinnutvalget.
4. Claim-effekt for CL-B-001, CL-B-002, CL-B-008, CL-B-022, CL-C-012, CL-C-015.
5. Hva må valideres med Matvett/NORSUS/SSB.
```

## 7. Worker prompt 2D - B-prosess-sidestrømmer

```markdown
Du er Worker 2D: B-prosess-sidestrømmer for Food TG analysefabrikk.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les:
- docs/project/mandates/analysefabrikk-food-tg-arbeidsprosess-2026-04-28.md
- docs/project/mandates/analysefabrikk-runde-2-prompts-2026-04-28.md
- docs/project/mandates/track-brief-b-sidestreams-nutrients.md
- docs/project/mandates/evidence-matrix-food-tg.md
- docs/project/mandates/claim-register-food-tg.md

Scope:
- Okara, plantebaserte sidestrømmer, sjømatrestråstoff, bryggerimask, demand-side, logistikk, kvalitet, holdbarhet og nåværende destinasjon.
- Start fra:
  - research/perplexity-20-04-26/havre-okara-sidestroemmer-dybdeanalyse.md
  - research/bibliotek/forskningsrunde-2026-04-20-r2/p22-sidestrom-til-mat-prosjekter-2026-04-20.md
  - research/bibliotek/akademia/pubmed/falch-e-2026-maximizing-the-utilization-of-seafood.md
  - research/bibliotek/akademia/pubmed/javourez-u-2021-waste-to-nutrition-a-review.md
  - research/norden/verdikjede/07-sjoemat.md
  - research/norden/verdikjede/07b-sjomatfor-saarbarhet.md

Perplexity-/forskningsrunde-kilder er L4 og skal behandles som hypoteser.

Ikke rediger canonical docs.

Lever handoff med:
1. Kandidatliste for B1 prosess-sidestrømmer.
2. Hvilke data trengs per strøm: volum, batchstabilitet, temperatur, holdbarhet, renhet, pris/logistikk, nåværende destinasjon.
3. Hvilke aktører bør valideres.
4. Claim-effekt for CL-B-014, CL-B-021, CL-B-009.
5. Røde flagg: hvor claims er estimatpreget eller aktøravhengige.
```

## 8. Worker prompt 2E - B-næringsstoffløkker

```markdown
Du er Worker 2E: B-næringsstoffløkker for Food TG analysefabrikk.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les:
- docs/project/mandates/analysefabrikk-food-tg-arbeidsprosess-2026-04-28.md
- docs/project/mandates/analysefabrikk-runde-2-prompts-2026-04-28.md
- docs/project/mandates/track-brief-b-sidestreams-nutrients.md
- docs/project/mandates/evidence-matrix-food-tg.md
- docs/project/mandates/claim-register-food-tg.md

Scope:
- RecoLab/Helsingborg, NSVA, norske avløpsanlegg, svartvann, N/P/K, biorest, digestat, gjødselregelverk og overføringsverdi.
- Start fra:
  - research/bibliotek/forskningsrunde-2026-04-20-r2/p26-helsingborg-recolab-2026-04-20.md
  - research/bibliotek/akademia/pubmed/stoknes-k-2016-efficiency-of-a-novel-food.md
  - research/bibliotek/akademia/pubmed/zamanzadeh-m-2017-biogas-production-from-food-waste.md
  - research/bibliotek/akademia/pubmed/feng-l-2023-developing-a-biogas-centralised-circular.md
  - research/perplexity-20-04-26/npk-tap-svartvann-norden.md

Perplexity-kilder er L4 og skal bare brukes til kildejakt.

Ikke rediger canonical docs.

Lever handoff med:
1. Source cards for solide RecoLab/NSVA/avløp/gjødsel-kilder hvis funnet.
2. Tallregister for N/P/K bare hvis definisjon og kilde er tydelig.
3. Benchmark-/pilotgate for CL-B-016 og CL-B-023.
4. Hvilke norske aktører/anlegg bør valideres.
5. Hva er for tungt/uklart til første TG-pilot.
```

## 9. Worker prompt 2F - C-norsk governance

```markdown
Du er Worker 2F: C-norsk governance for Food TG analysefabrikk.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les:
- docs/project/mandates/analysefabrikk-food-tg-arbeidsprosess-2026-04-28.md
- docs/project/mandates/analysefabrikk-runde-2-prompts-2026-04-28.md
- docs/project/mandates/track-brief-c-adoption.md
- docs/project/mandates/evidence-matrix-food-tg.md
- docs/project/mandates/claim-register-food-tg.md

Scope:
- Norsk governance/adoption: Lov om god handelsskikk, Dagligvaretilsynet, Konkurransetilsynet, UTP, PPWR/EØS, offentlige innkjøp, rapporteringsvern, håndheving.
- Start fra:
  - research/norden/regulatory-policy-landscape-nordic.md
  - research/regulatory/eu-utp-directive-2019-633.md
  - research/regulatory/eu-utp-evaluering-desember-2025.md
  - research/regulatory/eu-ppwr-emballasjeforordningen-2025.md
  - research/analyse/offentlig-innkjop-nordisk.md
  - research/bibliotek/konkurransetilsynet/
  - research/evidence-pack/tilsyn/

Ikke rediger canonical docs.

Lever handoff med:
1. Norsk C-adoption-gate med primærkilder.
2. Hvilke claims styrkes/svekkes: CL-C-001, CL-C-002, CL-C-005, CL-C-006, CL-C-010, CL-C-012, CL-C-014, CL-C-015.
3. Hva er EU-regel, hva er norsk/EØS-implementering, hva er fortsatt uavklart.
4. Hvilke myndigheter/aktører må valideres.
5. Hva kan brukes i decision memo uten å overselge.
```

## 10. Master merge-output runde 2

Master skal etter workers levere:

```markdown
# Master merge - runde 2

## Integrert nå

| Funn | Source-ID | EV-ID | CL-ID | Status |
|---|---|---|---|---|

## Needs-primary-check

| Funn | Hvorfor | Neste handling |
|---|---|---|

## Needs-actor-validation

| Funn | Aktør | Spørsmål |
|---|---|---|

## Ikke integrert

| Funn | Hvorfor |
|---|---|

## Oppdaterte canonical docs

- ...

## Neste masterkø

1. ...
```

