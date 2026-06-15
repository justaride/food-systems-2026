---
tittel: Food TG — Master-handover: lukk alt gjenstående + plattform + uttak (2026-06-15)
status: Master-handover / komplett fullføringsplan for en kapabel agent
eier: Gabriel
dato: 2026-06-15
formål: Ett selvstendig dokument en agent (Gemini under protokollen, en ny Claude-økt, eller Gabriel manuelt) kan jobbe seg gjennom for å (1) lukke alt gjenstående analyse-/DB-arbeid, (2) sikre at funnene faktisk er oppdatert og fungerer i plattformen (ikke bare i docs), (3) vurdere hva mer som bør oppdateres, og (4) produsere de eksterne uttakene. Agent-agnostisk; sikkerhetsprotokollen er bakt inn.
relaterte_filer:
  - docs/project/status/food-tg-dybdeanalyse-handoff-2026-06-15.md
  - docs/project/status/food-tg-gemini-arbeidsplan-protokoll-2026-06-15.md
  - docs/project/status/food-tg-closeout-2026-06-14.md
  - docs/project/status/food-tg-lokal-kjoere-commit-guide-2026-06-14.md
  - docs/project/analysis/food-tg-maktkart-syntese-2026-06-14.md
  - docs/project/analysis/food-tg-ap2-kryssnode-hhi-funn-2026-06-15.md
  - src/lib/data/dybdeanalyse.ts
---

# Master-handover — drive alt i land

## 0. Hvordan bruke dette + hvem

Les `food-tg-dybdeanalyse-handoff-2026-06-15.md` først (full status: 8 lenser kjørt, primærsjekker, alle funn). Dette dokumentet legger til det *bredere* arbeidet: plattform-integrasjon, vurderinger og uttak. Det er **agent-agnostisk** — Gemini (under protokollen `...gemini-arbeidsplan-protokoll-2026-06-15.md`), en ny Claude-økt, eller manuelt arbeid kan følge det.

**Sikkerhetsmodell (ufravikelig, etter Gemini-episoden):** all agent-jobbing skjer på `gemini/<oppgave>`- eller `claude/<oppgave>`-branch fra siste main; aldri direkte på main; aldri push/merge uten din review; én oppgave + akseptansekriterium om gangen; obligatoriske gater (`npm test && npm run lint && npm run build && git diff --check`) + kort rapport per oppgave. Rør aldri DB-avledede artefakter utenom `compute-metrics:full`. Full protokoll: se Gemini-arbeidsplanen §2.

## 1. Forutsetning — commit den uncommittede batchen

Før noe nytt: commit denne øktens arbeid (kryss-node-HHI + Gemini-protokoll + §8-steg-3-lukking + gjenopprettet status).
```bash
git add docs/project/analysis/food-tg-ap2-kryssnode-hhi-funn-2026-06-15.md \
        docs/project/status/food-tg-gemini-arbeidsplan-protokoll-2026-06-15.md \
        docs/project/status/food-tg-master-handover-2026-06-15.md \
        docs/project/analysis/food-tg-maktkart-syntese-2026-06-14.md \
        docs/project/mandates/primary-check-queue-food-tg-v0.1.md \
        docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md \
        docs/project/status/food-tg-dybdeanalyse-handoff-2026-06-15.md
git commit -m "docs(ap2): kryss-node markeds-HHI + §8 steg 3 lukket + master-handover"
```

## 2. Arbeidsstrømmer

Seks strømmer. A–B er DB-/lokale; C–F er det utvidede plattform-/uttaks-arbeidet du etterspurte.

### Strøm A — Lokal lukking (DB) — *allerede fullt spesifisert*
Kjør stegene i `food-tg-closeout-2026-06-14.md` + `food-tg-lokal-kjoere-commit-guide-2026-06-14.md`:
vei 2-import → `dedupe-person-keys --commit` → AP-1-rekjøring → strict-source-opprydding (9 brudd) → operator-sekvens grønn → vei 1 eierandel-% (bestilt Aksjonærregister-uttrekk).
**Akseptanse:** `npm run db:audit:strict-sources` grønn; `npm run audit:citable` exit 0; AP-1-aggregat + `dybdeanalyse.ts ins-ap1-001` oppdatert til faktiske tall.

### Strøm B — Surface de nye funnene i plattformen *(ny — viktigst for «fungerer i plattformen»)*
I dag er bare 4 lenser surfacet i `/innsikt` (`src/lib/data/dybdeanalyse.ts`: AP-1/2/3/5). Følgende mangler i appen:

| Oppgave | Hva | Akseptanse |
|---|---|---|
| B1 | Legg til `/innsikt`-kort for **AP-6 havbruk**, **AP-7 pris-asymmetri**, **AP-2 kryss-node-HHI** i `dybdeanalyse.ts` (samme `DybdeanalyseFinding`-form: claimId, kortFunn, evidenceStatus, citationReadiness, coverageNote, notSay, docRefs). AP-4/AP-8 som `needs-data`-kort. | Kortene rendres i `/innsikt`; `npm run build` grønn; citationReadiness korrekt (kryss-node ordinal = `citable_with_note`, resten `internal_context`). |
| B2 | **`/havbruk`-siden** — vurder å vise AP-6-konsentrasjonen (CR4 57 %, HHI ~929) + land-RAS-fortynningen. | Siden viser konsentrasjonstall med kilde + forbehold, eller bevisst utelatt med begrunnelse. |
| B3 | **`/verdikjede`-siden** — vurder å vise kryss-node konsentrasjonsprofilen (foredling > retail > primær). Sjekk at `value-chain.json`-tallene stemmer (se §3 harmonisering). | Profilen synlig eller bevisst utelatt; ingen motstrid mot funnnotatet. |
| B4 | Etter strøm A: bekreft at `/graf`, `/styremedlemmer`, `/personer` reflekterer de nye styre-radene (AP-1-dekningsutvidelse) og at `/eierskap`/`/selskap` reflekterer eierandel-% (AP-5). | Sidene viser de nye dataene; `npm run graph:audit` grønn. |

**Claim-disiplin i surfacing:** bruk `citationReadiness` riktig (fail-closed) — kun `citable_external`/`citable_with_note` vises uten intern-flagg; resten bak `InternalBanner`. Ikke surface projeksjon (46,9 % AP-1) som realisert før DB-kjøringen.

### Strøm C — Figurer *(ny)*
Bare 3 figurer finnes (`fig-ap1-styreoverlapp-sektorbroer`, `fig-ap3-lorenz-tilskudd`, `fig-maktkart-konvergens`). Produser:

- C1: **Kryss-node konsentrasjonsprofil** — søylediagram HHI per node (meieri 6000 … sjømat 950) med 2500-terskel + samvirke-merking. Den sterkeste visuelle for hovedfunnet.
- C2: **AP-6 havbruk-konsentrasjon** (sjøbasert MTB-andeler + land-RAS-fortynning).
- C3: **AP-7 asymmetri** (opp- vs nedslag-gjennomslag).
- C4: **Oppdater `fig-maktkart-konvergens`** til å inkludere konsentrasjonsprofilen (foredling topper), ikke bare AP-1/AP-5-konvergensen.
**Akseptanse:** SVG-er i `docs/project/figures/food-tg-2026-06-15/`; referert fra respektive funnnotater; tall matcher funnnotatene eksakt.

### Strøm D — Plattform-health + data-harmonisering *(ny)*
- D1: Kjør full health: `npm run build`, `npm run graph:audit`, `npm run db:audit`, `npm run audit:citable`, `npm run research:citable-acceptance-pack`. Rapporter status; rett ev. drift (ikke skjul røde gater).
- D2: **Harmoniser retail-HHI-avviket:** `value-chain.json` har retail-HHI **3445** (NG 48,4/Coop 27,1/Reitan 18,0/Bunnpris 6,6), mens kryss-node-funnnotatet bruker **3327** (KT-andeler). Velg én autoritativ kilde (KT Dagligvarerapport anbefales), oppdater begge, dokumenter valget.
- D3: Sjekk om `konsern-coverage.json`-regenereringen (Gemini la til `measuredYear`/`childrenWithOlderFinancial`) har konsumenter i appen som må oppdateres (`/konsern`-relaterte surfacing, coverage-badges).
- D4: Sjekk `validate-against-brreg`-verktøyet (Gemini la det til): kjør det, vurder om avviksrapporten avdekker selskaper som bør orgnr-korrigeres (jf. de 3 utgåtte sjømat-orgnrene: NTS/SalmoNor/Hallvard Lerøy).

### Strøm E — Lukk gjenstående needs-data *(smalt)*
Per Gemini-arbeidsplanen Spor D + handoff §5: presise fôr-/egg-/foodservice-andeler (AP-2), fôr→oppdrett-PPI (AP-7), restråstoffvolum (AP-6), per-aktør volum↔margin (AP-4, DB). Alle krever ny datainnhenting; lavere prioritet enn A–D.

### Strøm F — Eksterne uttak (citable) *(ny — «hva bør produseres»)*
Når strøm A (operator-sekvens grønn) + eierandel-% + harmonisering er gjort:
- F1: **Maktkart-whitepaper-kapittel** — det samlende uttaket over CL-MAKTKART-001: vertikal konsernintegrasjon (struktur primærsjekket) + konsentrasjonsprofilen (foredling topper, samvirke). Route gjennom claim-lock/PCQ; kun `citable_external`/`citable_with_note`-claims; figur-pakken fra strøm C.
- F2: **Legg de nye claimene i citable-acceptance-pakken** (`research:citable-acceptance-pack`) som testbare spørsmål (kryss-node-HHI, AP-3 2024, AP-1-broer), så de fail-closed-testes.
- F3: Vurder en **kort policy-/innsikts-oppsummering** (1–2 sider) for ekstern deling av hovedfunnet «konsentrasjonen topper i foredling, ikke retail».

## 3. Vurderingspunkter (eksplisitt «vurder om …»)

Agenten skal aktivt vurdere og rapportere på:
1. Skal AP-6/AP-7/kryss-node også ha egne app-sider-elementer (ikke bare `/innsikt`-kort)? (B2–B3)
2. Bør `value-chain.json` og andre committede `public/data`-datasett oppdateres med de nye konsentrasjonstallene — og i så fall via `compute-metrics:full`, ikke for hånd? (D2–D3)
3. Er det claims i `dybdeanalyse.ts`/funnnotatene som nå er foreldet av nyere funn (f.eks. AP-2 «dagligvare-HHI delvis» → nå kryss-node komplett)? Harmoniser.
4. Trenger `fig-maktkart-konvergens` oppdatering for å speile det skjerpede hovedfunnet? (C4)
5. Bør de 3 utgåtte sjømat-orgnrene orgnr-korrigeres i import-skriptene før neste DB-import? (D4 / handoff §1)
6. Er det andre lenser/spor i `research/`/`docs/project/` som refererer gamle AP-tall og bør oppdateres? Søk på «10,94», «2024 ufullstendig», «kun retail har» o.l.
7. Skal CL-MAKTKART-001 løftes fra `klar-med-forbehold` til citable etter A+F — og hva er den eksakte gjenstående blokkeren da?

## 4. Akseptansekriterier — når er alt «i land»

- [ ] Uncommittet batch committet; main grønn (test/lint/build/diff-check).
- [ ] Strøm A: `db:audit:strict-sources` + `audit:citable` grønn; AP-1/AP-5 oppdatert med faktiske tall.
- [ ] Strøm B: alle 8 lenser (+ kryss-node) surfacet korrekt i `/innsikt`; relevante sider reflekterer funnene; `graph:audit` grønn.
- [ ] Strøm C: figur-pakke produsert + referert.
- [ ] Strøm D: health grønn; HHI-avvik harmonisert; ingen skjult drift.
- [ ] Strøm F: whitepaper-kapittel + acceptance-pack-spørsmål; CL-MAKTKART-001-status eksplisitt vurdert.
- [ ] Alle vurderingspunkter (§3) besvart i sluttrapporten.

## 5. Anbefalt rekkefølge

1. **§1 commit** → 2. **Strøm A** (lokal lukking — gir citable-porten grønn) → 3. **Strøm B + C** (surface + figurer — gjør funnene synlige i plattformen) → 4. **Strøm D** (health + harmonisering) → 5. **Strøm F** (uttak) → 6. **Strøm E** (smal needs-data, når tid).

Gjør hver som én branch + én commit + gater + review (§0). Da kommer du i mål uten å gjenta Gemini-rotet.
