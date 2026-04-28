---
tittel: "Insight Pack Outline Food TG v0.1"
status: Utkast internt
eier: Master session
dato: 2026-04-28
neste_handling: "Bruk som disposisjon for Jan Thomas/Cathrine-review eller første workshopgrunnlag etter at syntesen er kontrollert."
relaterte_filer:
  - docs/project/mandates/research-synthesis-food-tg-v0.1.md
  - docs/project/mandates/opportunity-radar-food-tg-v0.1.md
  - docs/project/mandates/claim-strength-report-food-tg-v0.1.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-master-merge-runde-4-triangulation.md
---

# Insight Pack Outline Food TG v0.1

## Formål

Gi Jan Thomas, Cathrine og Food TG et kort, kontrollert beslutningsgrunnlag som skiller mellom hva vi kan si nå, hva som må valideres, og hva som kan drepe hvert spor.

## Foreslått struktur

| Slide | Tittel | Hovedpoeng |
|---:|---|---|
| 1 | Food TG scope etter runde 4 | A+B som hovedspor, C som gate. Dette er valideringssprint, ikke pilotcommitment. |
| 2 | Dette kan vi si nå | EUDR EU-scope, SSB/HS som importbaseline, okara/BSG som benchmark, matsvinnkvalitet som adoption-case, marint/nutrient loops som benchmark. |
| 3 | Dette må vente | EUDR-Norge, SPC/laksefôrmetode, okara/BSG-pilotklarhet, KPI-effekt, actor commitment. |
| 4 | Spor A: fôr/import/sporbarhet | Fire datalag: SSB/HS, Fiskeridirektoratet totalfôr, Denofa/Skretting actor-data, EUDR/compliance. |
| 5 | Spor B: to første kandidater | Okara/BSG som teknisk kandidat; matsvinnkvalitet som rask adoption-/fallback-case. |
| 6 | Benchmark, ikke første pilot | Marint restråstoff og nutrient loops gir læring om fraksjoner, kvalitet, N/P/K og governance. |
| 7 | C-gate | Lov, kjøper, data, drift, governance og markedsmakt per kandidat. |
| 8 | Opportunity radar | Topp 10 med rangering og status: integrer, benchmark, hypotese, primary-check eller actor-validation. |
| 9 | Claim strength | Høy/medium/lav per claim og hvilke formuleringer som må svekkes. |
| 10 | Valideringssprint | P1-kontakter og spørsmål som må låses før decision memo v0.3. |

## Slide 2 - Dette kan vi si nå

- Food TG bør gå videre med A+B, med C som tverrgående gate.
- EUDR gjør soya til EU-sporbarhets- og compliance-tema; Norge/EØS må formuleres separat.
- SSB 08801 er importbaseline, men ikke fôrbruk eller substitusjonseffekt.
- Okara/BSG er konkrete svenske benchmark, ikke pilotklare strømmer.
- Matsvinnkvalitet i butikk/HORECA er sterkest som rask adoption-case hvis baseline og driftsaktør finnes.
- Marint restråstoff og nutrient loops er benchmark/sekundærspor.

## Slide 3 - Dette må vente

- Direkte Norge-claim om EUDR og soya.
- SPC/laksefôrvolum uten metode.
- Bransjesnitt fra Denofa/Skretting.
- Pilotklar okara/BSG.
- Effekt fra matsvinncase uten kontrafaktisk.
- N/P/K- eller KPI-effekt uten dataeier og systemgrense.
- Alle statusløft til `Validert eksternt`.

## Valideringssprint P1

| Kontakt | Hva må låses |
|---|---|
| Landbruksdirektoratet / Miljødirektoratet | EUDR Norge/EØS, soya-scope, varekoder, DDS/Traces/EORI. |
| SSB/Tolletaten | `210610`, `23099040`, SPC og prepared fish feed. |
| Denofa / Skretting / Sjømat Norge | Actor-data, fôrsammensetning, opprinnelse, sitatsjekk. |
| NMBU/Foods of Norway | Modenhet, kost, LCA, regulatorisk vei og pilotformat for alternative proteiner. |
| Mattilsynet/fagekspert + okara/BSG-råvareeier | Lovlig sluttbruk, hygiene, holdbarhet, Novel Food, off-taker. |

## Designregel

Ingen slide bør vise en mulighet uten statusfelt:

```text
Integrer nå / needs-primary-check / needs-actor-validation / benchmark / hypotese / archive-reject
```
