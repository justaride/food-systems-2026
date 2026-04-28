---
tittel: "Food TG analysefabrikk - runde 2 recovery prompts"
status: Utført internt
eier: Gabriel
sist_oppdatert: 2026-04-28
neste_handling: Recovery er gjennomført; bruk worker-handoffs og mini-verifikasjon som faktisk runde 2-underlag.
relaterte_filer:
  - docs/project/mandates/analysefabrikk-runde-2-prompts-2026-04-28.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-master-merge-runde-2.md
  - docs/project/mandates/track-brief-a-feed-import.md
  - docs/project/mandates/track-brief-b-sidestreams-nutrients.md
  - docs/project/mandates/evidence-matrix-food-tg.md
  - docs/project/mandates/claim-register-food-tg.md
---

# Food TG analysefabrikk - runde 2 recovery prompts

## 1. Hvorfor recovery

Master merge runde 2 mottok og integrerte `2A`, `2C`, `2E` og `2F`, men fant ikke handoff-filer for:

- `2B` A-importdata
- `2D` B-prosess-sidestrømmer

Disse to hullene bør lukkes før neste full runde. Uten dem står to sentrale områder fortsatt for svakt:

Status 2026-04-28: recovery-handoffene er nå opprettet som `2026-04-28-worker-2b-importdata-recovery.md`,
`2026-04-28-worker-2d-prosess-sidestroemmer-recovery.md` og
`2026-04-28-mini-verifikasjon-2b-2d-recovery.md`. Promptene under beholdes som historikk og gjenkjøringsgrunnlag.

| Manglende batch | Hvorfor den blokkerer |
|---|---|
| `2B` A-importdata | Soya/SPC/fiskemel/Denofa/laksefôr/EUDR-tall kan ikke integreres eller brukes i scope/roadmap uten definisjon, år, enhet og kilde. |
| `2D` B-prosess-sidestrømmer | Okara, bryggerimask, sjømatrestråstoff og logistikk/demand-side for B1 kan ikke løftes fra hypotese til valideringsklart pilotspor. |

## 2. Master recovery prompt

```markdown
Du er master session for Food TG analysefabrikk runde 2 recovery.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les:
- docs/project/mandates/analysefabrikk-handoffs/2026-04-28-master-merge-runde-2.md
- docs/project/mandates/analysefabrikk-runde-2-recovery-prompts-2026-04-28.md
- docs/project/mandates/evidence-matrix-food-tg.md
- docs/project/mandates/claim-register-food-tg.md

Din jobb:
1. Sjekk først om 2B/2D-handoffene finnes under andre navn i `docs/project/mandates/analysefabrikk-handoffs/`.
2. Hvis de finnes, normaliser og merge dem.
3. Hvis de ikke finnes, start/rerun worker 2B og 2D med promptene under.
4. Ikke integrer tall eller sidestrømclaims uten tydelig kilde, definisjon, år, geografi og enhet.
5. Lag recovery-merge-logg:
   docs/project/mandates/analysefabrikk-handoffs/2026-04-28-master-merge-runde-2-recovery.md

Klassifiser funn som:
- integrer nå
- needs-primary-check
- needs-actor-validation
- archive/reject
```

## 3. Worker 2B recovery - A-importdata

```markdown
Du er Worker 2B recovery: A-importdata for Food TG analysefabrikk.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les:
- docs/project/mandates/analysefabrikk-runde-2-recovery-prompts-2026-04-28.md
- docs/project/mandates/track-brief-a-feed-import.md
- docs/project/mandates/evidence-matrix-food-tg.md
- docs/project/mandates/claim-register-food-tg.md

Scope:
- Soya, soyamel, soyaproteinkonsentrat/SPC, fiskemel, Denofa, laksefôrvolum, kraftfôr/laksefôr-skille, EUDR-Norge.

Start fra:
- research/bibliotek/forskningsrunde-2026-04-20-r2/p09-soyaimport-norden-2026-04-20.md
- research/bibliotek/forskningsrunde-2026-04-20-r2/p12-fiskemel-verdikjede-global-2026-04-20.md
- research/norden/verdikjede/04-innsatsvarer.md
- research/regulatory/eu-eudr-avskogingsforordningen-2025.md
- research/bibliotek/akademia/nmbu/foods-of-norway-novel-feed-2024.md

Bruk `rg` bredt for:
- `Denofa`
- `soyaprotein`
- `SPC`
- `soya`
- `soy`
- `fiskemel`
- `fishmeal`
- `laksefôr`
- `aquafeed`
- `BioMar`
- `Skretting`
- `Mowi Feed`
- `Cargill`
- `EUDR`

Ikke rediger canonical docs.

Lever handoff med:

## 1. Tallregister

| Tema | Tall | År | Geografi | Enhet | Definisjon | Kilde | Status |
|---|---:|---|---|---|---|---|---|

Status skal være `citation-ready`, `needs-primary-check` eller `reject`.

## 2. Definisjonsrydding

Forklar forskjellen mellom:
- soyabønner
- soyamel
- soyaproteinkonsentrat/SPC
- kraftfôr
- laksefôr
- fiskemel
- fiskeolje

## 3. Claim-effekt

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-A-001 |  |  |
| CL-A-002 |  |  |
| CL-A-020 |  |  |
| CL-C-011 |  |  |

## 4. Røde flagg

List opp tall som ikke må brukes eksternt ennå.

## 5. Masteranbefaling

Hva kan integreres nå, og hva må sjekkes først?
```

## 4. Worker 2D recovery - B-prosess-sidestrømmer

```markdown
Du er Worker 2D recovery: B-prosess-sidestrømmer for Food TG analysefabrikk.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les:
- docs/project/mandates/analysefabrikk-runde-2-recovery-prompts-2026-04-28.md
- docs/project/mandates/track-brief-b-sidestreams-nutrients.md
- docs/project/mandates/evidence-matrix-food-tg.md
- docs/project/mandates/claim-register-food-tg.md

Scope:
- Okara, plantebaserte sidestrømmer, sjømatrestråstoff, bryggerimask, logistikk, batchkvalitet, holdbarhet, demand-side og nåværende destinasjon.

Start fra:
- research/perplexity-20-04-26/havre-okara-sidestroemmer-dybdeanalyse.md
- research/bibliotek/forskningsrunde-2026-04-20-r2/p22-sidestrom-til-mat-prosjekter-2026-04-20.md
- research/bibliotek/akademia/pubmed/falch-e-2026-maximizing-the-utilization-of-seafood.md
- research/bibliotek/akademia/pubmed/javourez-u-2021-waste-to-nutrition-a-review.md
- research/norden/verdikjede/07-sjoemat.md
- research/norden/verdikjede/07b-sjomatfor-saarbarhet.md

Perplexity- og forskningsrunde-kilder er L4. De skal brukes som kildejakt/hypotese, ikke som siterbar evidens.

Bruk `rg` bredt for:
- `okara`
- `havre`
- `oat`
- `sidestream`
- `sidestrøm`
- `bryggerimask`
- `spent grain`
- `restråstoff`
- `sjømat`
- `seafood side`
- `Hailia`
- `Agrain`
- `Oatly`
- `Volare`

Ikke rediger canonical docs.

Lever handoff med:

## 1. Kandidatliste B1

| Strøm | Mulig bruk | Kilde | Relevans | Evidens | Status | Neste handling |
|---|---|---|---:|---:|---|---|

## 2. Datakrav per strøm

| Strøm | Volum | Batchstabilitet | Temperatur | Holdbarhet | Renhet | Nåværende destinasjon | Logistikk | Kjøper/demand-side |
|---|---|---|---|---|---|---|---|---|

## 3. Claim-effekt

| Claim | Effekt | Begrunnelse |
|---|---|---|
| CL-B-014 |  |  |
| CL-B-021 |  |  |
| CL-B-009 |  |  |

## 4. Aktørvalidering

Hvem må kontaktes for hver strøm?

## 5. Røde flagg

Hva er fortsatt estimatpreget, L4-basert eller for aktøravhengig?

## 6. Masteranbefaling

Hva kan integreres nå, og hva må sjekkes først?
```

## 5. Mini-verifikasjon etter recovery

Når 2B og 2D er mottatt, bør master kjøre en liten verifikasjonsgate:

```markdown
Du er Verification session for runde 2 recovery.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Sjekk:
1. Har alle nye tall år, geografi, enhet, definisjon og kilde?
2. Er L4-kilder tydelig merket som hypoteser/kildejakt?
3. Er source IDs unike?
4. Er EV-/CL-koblinger reelle og ikke legacy-IDer?
5. Er ingen claim markert Validert eksternt?
6. Er 2B/2D-funnene enten integrerbare, needs-primary-check eller needs-actor-validation?

Lever kort rapport med:
- godkjent for merge
- må sjekkes først
- bør avvises
```

## 6. Etter recovery

Når recovery er gjennomført, bør neste store arbeid ikke være mer arkivlesing. Neste steg bør være:

1. **Actor validation pack v0.1** basert på alle `needs-actor-validation`.
2. **Primary-check queue** basert på alle `needs-primary-check`.
3. **Decision memo v0.2** med tydeligere hva som er robust, usikkert og aktøravhengig.
