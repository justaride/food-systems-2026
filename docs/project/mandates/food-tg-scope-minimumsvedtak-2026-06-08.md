---
tittel: "Food TG — Scope-minimumsvedtak"
status: Operativt minimumsvedtak bekreftet for sprintstart 2026-06-15 — formell eierbekreftelse gjenstår
eier_for_beslutning: JTO / Cathrine / Einar
forberedt_av: Gabriel
dato: 2026-06-08
operativ_bekreftelse: 2026-06-15
valgt_alternativ: 2A
relaterte_filer:
  - docs/project/mandates/decision-memo-food-tg-scope-v0.3.md
  - docs/project/mandates/food-tg-scope-decision-request-2026-05-21.md
  - docs/project/mandates/decision-log-food-tg.md
  - docs/project/mandates/MANDATE-OPEN-FIELDS-STATUS-2026-05-26.md
  - docs/project/mandates/matsvinnkvalitet-validation-sprint-2026-06-15.md
  - docs/meetings/MØTEOVERSIKT.md
---

# Food TG — Scope-minimumsvedtak

> **Status 2026-06-15:** Valg **2A** er bekreftet som operativt minimumsvedtak for å starte intern valideringssprint med matsvinnkvalitet først. Dette gir ikke pilot-, volum- eller effektcommitment, og ingen claim løftes til `Validert eksternt` før primærsjekk eller aktørvalidering er dokumentert. Formell eierbekreftelse fra JTO/Cathrine/Einar og eventuell mandatesignering står fortsatt som egen port.

## 0. Operativ bekreftelse 2026-06-15

**Valgt alternativ:** 2A — A+B som foreløpig hovedscope, C som tverrgående adoption-, regelverks- og datagate.

**Umiddelbar konsekvens:**

- `decision-log-food-tg.md` føres med en operativ beslutningsrad for sprintstart.
- `food-tg-validation-sprint-log-2026-05.md` åpnes fra "venter scope-vedtak" til aktiv dag-0 sprintstatus.
- Første valideringspakke avgrenses til **matsvinnkvalitet** (`CL-B-022`, `CL-C-012`, `CL-C-014`, `CL-C-015`) og ber om baseline, kategori, tidsvindu, rutineendring, alternativ behandling og kontrafaktisk.

**Bevart gate:** Mandatfelt som krever formell eier-/teamavklaring fylles ikke automatisk av dette dokumentet. Chair/co-chair, komplett medlemsliste, signaturblokk og ekstern sitatbruk krever fortsatt eksplisitt avklaring.

## 1. Hvorfor dette må avklares nå

Scope-vedtaket er linchpinen i Food TG. Så lenge det er uavklart, henger alt det andre:

- **7 åpne mandatfelt** (godkjenningsdato, reviewdato, chair/co-chair, medlemsliste m.fl.) — «hovedårsaken er et uavklart scope-vedtak» (`MANDATE-OPEN-FIELDS-STATUS`).
- **Valideringssprinten** kan ikke formaliseres.
- **P1-outreach** står bevisst pauset («venter scope-vedtak»).
- **Eierbeslutning om metoden** (Wageningen/Moerman/R9) «krever beslutning etter minimumsvedtaket på scope».

Beslutningsforespørselen ble sendt 21.05 og står fortsatt som **«venter bekreftelse»**. Dette dokumentet gjør den klar til å lukkes med ett av to vedtaksnivåer.

## 2. Vedtakstekst til bekreftelse

### 2A. Anbefalt minimumsvedtak — låser opp mest

> **Food TG videreføres med Spor A+B som hovedscope og Spor C som tverrgående adoption-, regelverks- og datagate.** Gruppen igangsetter en **10 arbeidsdagers valideringssprint** før pilotcommitment. Dette regnes som **foreløpig scope**, ikke pilot-, volum- eller effektcommitment. Ingen claims løftes til «validert eksternt» før primærsjekk eller aktørvalidering er dokumentert med dato, kontakt, rolle og kildegrunnlag.

Dette er anbefalt fordi det låser opp mandatfeltene **og** gir lov til P1-validering, samtidig som statusdisiplinen holdes (jf. memo v0.3 §9–§10).

### 2B. Fallback — hvis dere ikke vil låse scope ennå

> **Food TG kan kjøre en begrenset valideringssprint på A+B/C-hypotesen uten at dette regnes som endelig scope- eller pilotcommitment.**

Dette gir lov til å kontakte P1-aktører som faglig validering, men lar mandatfelt 1/2/4/5 forbli formelt blokkert (scope er ikke låst). Bruk denne kun hvis 2A ikke er mulig nå.

## 3. Hva vedtaket låser opp

| Låses opp | Av 2A (full) | Av 2B (fallback) |
|---|---|---|
| Mandatfelt 1, 2 (godkjenningsdato, reviewdato) | ✅ | ❌ (krever låst scope) |
| Mandatfelt 4, 5 (chair/co-chair, medlemsliste) | ✅ (parallelt med aktørkartlegging) | ❌ |
| Mandatfelt 3 (geografisk minstekrav) | Kan settes nå uansett — forslag **4/5 land** | Kan settes nå uansett |
| Valideringssprint (formalisert) | ✅ | ✅ (begrenset) |
| P1-outreach / faglig validering | ✅ | ✅ |
| Eierbeslutning metode (Wageningen/R9) | ✅ (kan tas etter dette) | Delvis |

## 4. Hva vedtaket IKKE gjør (statusdisiplin)

Vedtaket gir **ikke** lov til (jf. memo v0.3 §8):

1. Å omtale scope som endelig låst utad, eller skrive roadmap som om pilotrekkefølgen er besluttet.
2. Pilot-, volum- eller effektcommitment for noen kandidat (okara/BSG, matsvinnkvalitet, marint restråstoff, nutrient loops).
3. Å løfte claim-status til «validert eksternt» uten dokumentert primærsjekk/aktørvalidering.
4. Å bruke et benchmark som effektbevis, eller formulere en hypotese som commitment.
5. Å omtale EUDR som direkte norsk soya-plikt (norsk forskriftsutkast 19.08.2025 ekskluderer soya) — bruk «EU-eksport-compliance for norske aktører».

## 5. Valideringssprint — rekkefølge (10 arbeidsdager)

Sprinten skal ikke selge inn pilot, men avklare hvilken kandidat som kan modnes med lavest overclaim-risiko.

| Prioritet | Avklaring | Status-merking |
|---:|---|---|
| **Start: matsvinnkvalitet** | Adoption-kandidat — baseline, kategori, tidsvindu, rutineendring, kontrafaktisk (jf. Møte 9 F3 + 02.06). | Hypotese + `needs-actor-validation` |
| EUDR / fôrdata | EU vs. Norge/EØS, varekoder, actor-data. | `needs-primary-check` |
| Alternative fôrproteiner | A-roadmap: modenhet, kost, LCA, råvaretilgang, industripartner. | Hypotese + `needs-actor-validation` |
| Okara / BSG | Teknisk B-kandidat: råvareeier, hygiene, stabilisering, off-taker. | Benchmark + `needs-actor-validation` |
| C-gate (alle) | Lov, kjøper, data, drift, governance, markedsmakt, KPI-minimum. | Datagate |

> Memo v0.3 §6 setter EUDR/fôrdata som desk-prioritet 1; Møte 9/02.06 peker på **matsvinnkvalitet først** som lettest å validere med aktør. Rekkefølge over følger sistnevnte — juster i møtet hvis ønskelig.

## 6. Loggføres etter bekreftelse

Når vedtaket er bekreftet skriftlig, føres tilsvarende rad i `decision-log-food-tg.md` (samme dag):

**Ved 2A (full):**
```markdown
| 2026-06-__ | Food TG videreføres med A+B som hovedscope og C som tverrgående gate. 10 arbeidsdagers valideringssprint (start: matsvinnkvalitet) kreves før pilotcommitment. | JTO/Cathrine/Einar | Scope følger møtene 13.04/20.04/21.04 + 02.06, decision memo v0.3 og Insight Pack v0.1. | Åpent hovedscope, valideringssprint, pilotrekkefølge | docs/meetings/MØTEOVERSIKT.md |
```

**Ved 2B (fallback):**
```markdown
| 2026-06-__ | Food TG kan kjøre en begrenset valideringssprint på A+B/C-hypotesen uten at dette regnes som endelig scope- eller pilotcommitment. | JTO/Cathrine/Einar | Prosjektet trenger aktørrespons for å avklare scope, men må unngå å overselge intern hypotese som beslutning. | Tillatelse til P1-validering, men ikke endelig hovedscope | docs/project/mandates/food-tg-scope-minimumsvedtak-2026-06-08.md |
```

Oppdater også `decision-log-food-tg.md`-raden «Hovedscope (A/B/C kombinasjon)» fra *Åpen* til vedtatt, og sett mandatfelt 1/2 (og 3 = 4/5 land) i `MANDATE-OPEN-FIELDS-STATUS`.

## 7. Bekreftelsesblokk

| Rolle | Navn | Valg (2A / 2B / endre) | Dato | Bekreftet |
|---|---|---|---|---|
| Project owner | Einar Holthe | | | ☐ |
| Prosjektleder/metodikk | Jan Thomas Ødegard | | | ☐ |
| Team Food | Cathrine Barth | | | ☐ |

**Valgt alternativ:** ☒ 2A (full A+B/C) · ☐ 2B (fallback sprint) · ☐ Endre — oppgi: ____________

**Operativ bekreftelse:** Gabriel 2026-06-15 for sprintstart. Formell eierbekreftelse/signatur fra JTO/Cathrine/Einar gjenstår.

---

*Forberedt 2026-06-08. Operativt bekreftet 2026-06-15 for å starte valideringssprint. Tas fortsatt inn i neste møte med Cathrine/JT/Einar for formell eierbekreftelse og eventuelle mandatfelt.*
