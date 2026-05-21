# `effekt`-fane på `/sirkularitet` — designspesifikasjon

**Dato:** 2026-04-29
**Status:** Godkjent for implementasjonsplanlegging
**Eier:** Gabriel Boen / JT (faglig redaktør)
**Relaterte dokumenter:**
- `docs/project/plans/DATAVISUALISERING-MASTERPLAN-2026-04-29.md` (Fase 5)
- `research/whitepaper/section-7-circular-food-systems.md`
- `research/bibliotek/sirkularitet-dyp.md`

---

## 1. Formål

Legge til en preskriptiv analytisk linse på `/sirkularitet` som svarer på beslutnings­spørsmålet **«Hvor har sirkulære tiltak størst effekt for klima, natur og forurensning i nordisk matsystem?»**.

Eksisterende faner på `/sirkularitet` er deskriptive — de kartlegger *hva som finnes hvor* (looper, gap, aktører, R-stige). Den nye fanen er normativ — den rangerer *hva som bør prioriteres*.

Brukerjobben er **eksekutiv-oversikt for Food TG-presentasjoner**: en stakeholder skal kunne se prioriteringen på 30 sekunder uten å gå inn i drilldowns.

## 2. Avgrensning

**I scope:**
- Ny fane med ID `effekt`, plassert som andre fane (etter `matrix`)
- Topp-10 redaktørkurert prioritering av sirkulære tiltak × land
- Tre kvalitative effekt-dimensjoner per rad: klima, natur, forurensning
- Ekspanderbar drilldown per rad med begrunnelse, barrierer, policy-løftestenger, suksesshistorier og kildehenvisninger
- Toggle for sortering på enkelt-dimensjon
- Eksplisitt `evidenceStatus`-merking per rad
- Metodikk-seksjon på bunnen av fanen

**Ikke i scope (YAGNI):**
- Numerisk LCA-komparator eller composite-score (mangler datagrunnlag)
- Admin-UI for inline redigering — endring skjer kun via PR mot `circular-leverage.ts`
- Brukerinnsendte forslag (lenke til GitHub-repo i metodikk-seksjon er nok)
- Versjonshistorikk i UI (git history er kilden)
- Filtrering på land eller tema (legges til i V2 hvis listen vokser over 10)
- Nye visualiseringer eller datagrunnlag for de andre eksisterende fanene

## 3. Informasjonsarkitektur

```
/sirkularitet
├─ NordicCircularityBenchmark (eksisterende, uendret)
└─ Faner i denne rekkefølgen:
   matrix · effekt (NY) · maturity · kpi · questions · loops · gaps · actors · naeringsflyt
```

`Tab`-typen i `SirkularitetContent.tsx` utvides med `'effekt'`. Ny knapp i fanerekka. Effekt-fanen rendres når `tab === 'effekt'`.

## 4. Datakontrakt

### 4.1 Ny fil: `src/lib/data/circular-leverage.ts`

```typescript
import type { EvidenceStatus, VisualizationSourceRef } from '@/lib/visualization/types'

export type EffectLevel = 'high' | 'medium' | 'low'
export type LeverageCountry = 'NO' | 'SE' | 'DK' | 'FI' | 'IS' | 'nordic'

export type CircularLeverage = {
  id: string
  rank: number
  country: LeverageCountry
  title: string
  shortTitle: string             // Brukes i aria-labels og for fremtidig tett-rangerings-visning
  effects: {
    klima: EffectLevel
    natur: EffectLevel
    forurensning: EffectLevel
  }
  aggregate: EffectLevel
  headline: string
  justification: string
  evidenceStatus: EvidenceStatus
  sourceRefs: VisualizationSourceRef[]
  barriers: string[]
  policyLevers: string[]
  relatedLoopIds?: string[]
  relatedGapIds?: string[]
  relatedActorCases?: string[]
  relatedQuestionIds?: string[]
}

export const circularLeverages: CircularLeverage[]
```

### 4.2 Initiell topp-10

| Rank | Land | Tittel | Klima | Natur | Forurensning | Aggregat |
|---|---|---|---|---|---|---|
| 1 | NO | Forebygging av husholdningssvinn | HØY | MED | LAV | HØY |
| 2 | SE | Reverser matsvinn-stagnasjon | HØY | LAV | LAV | HØY |
| 3 | NO | Lukke 11× biogass-gap til DK-nivå | HØY | MED | HØY | HØY |
| 4 | NO | Akvakultur-slam → biogass + P-gjenvinning | MED | HØY | HØY | HØY |
| 5 | NO | Offentlig innkjøp etter København-modell | HØY | HØY | MED | HØY |
| 6 | DK | CO₂-avgift kjøttproduksjon 2030 | HØY | MED | LAV | MED |
| 7 | nordic | Skala matredistribusjon (Matsentralen-modell) | MED | LAV | LAV | MED |
| 8 | SE | Helsingborg svartvann skaleres nordisk | LAV | HØY | HØY | MED |
| 9 | FI | Industrialiser alternativt protein | MED | HØY | MED | MED |
| 10 | IS | Kartlegg + valoriser fiskeri-svinn | LAV | HØY | HØY | MED |

Hver rad får en `evidenceStatus`-vurdering. Default er `illustrative` (rangering er pedagogisk modell). Rader hvor begrunnelsen hviler på publiserte tall (f.eks. NORSUS' 5–10× forebygging-prinsipp, biogass-gap 11×) merkes `estimated`.

**Merk:** Tabellen over angir kun rang, land, tittel og effekt-nivåer for å låse rangerings-rammen. Faktisk innhold for `headline`, `justification`, `barriers`, `policyLevers`, `sourceRefs` og alle `related*Ids` skrives som del av implementasjonsplanen, basert på prosjektets eksisterende research­dokumenter.

### 4.3 Eksisterende kontrakter som gjenbrukes

- `EvidenceStatus` og `VisualizationSourceRef` fra `src/lib/visualization/types.ts`
- `EvidenceStatusBadge` fra `src/components/visualization/EvidenceStatusBadge.tsx`
- `circularity-loops.json` for å resolvere `relatedLoopIds` og `relatedGapIds`
- `circularityQuestions` fra `src/lib/data/circularity-questions.ts` for `relatedQuestionIds`
- `CIRCULARITY_ACTOR_MAP` fra `src/lib/data/circularity-actor-map.ts` for `relatedActorCases`
- Eksisterende `Card`-komponent fra `src/components/ui/Card.tsx`

## 5. Visuell layout

### 5.1 Header-blokk

- H2 `"Hvor har sirkulære tiltak størst effekt?"`
- Subtekst: `"Topp 10 prioriteringer for nordisk matsystem · Kuratert basert på prosjektets research"`
- Høyre side: `EvidenceStatusBadge status="illustrative"` + tekst `"Oppdatert 2026-04-29"`. Datoen er en string-konstant i `circular-leverage.ts` (`export const lastUpdated = '2026-04-29'`) som oppdateres manuelt ved hver redaksjonell PR. Header-badge er alltid `illustrative` fordi listen som helhet er en pedagogisk modell — selv om enkeltrader kan ha sterkere evidens­status i sitt eget felt
- Toggle-bar under: `[Aggregat] [Klima] [Natur] [Forurensning]`. Aktiv knapp har mørk bakgrunn (mønsteret matcher eksisterende fane-knapper). Default = Aggregat.

### 5.2 Rad-komponent (kollapset)

```
[pil] [#rank] [land-pill] [tittel + headline]      [Klima-bar] [Natur-bar] [Forurensning-bar]
```

- Rang-tall: 0.7rem, semibold, grå-400
- Land-pill: gjenbruker `COUNTRY_FLAGS` fra `SirkularitetContent.tsx`
- Tittel: 0.85rem semibold; headline: 0.7rem grå-500 under tittel
- Effektbarer: tre stykker, 64px brede, 5px høye. Etiketter «Klima/Natur/Forurensning» over hver bar i 0.55rem opacity
- Bar-bredde: HØY=90 % · MED=60 % · LAV=30 %
- Bar-farge: klima rød (`#dc2626`), natur grønn (`#16a34a`), forurensning blå (`#3b82f6`) — matcher eksisterende app-palett
- Hele raden er klikkbar; pilen roterer 90° ved ekspansjon

### 5.3 Rad-komponent (ekspandert)

Under header-stripen, indentert til høyre for pilen:

1. **Begrunnelse** — 2–4 setninger akademisk syntese
2. **Barrierer** og **Policy-løftestenger** i to-kolonners grid (samme mønster som eksisterende `circularityQuestions`-rendering)
3. **Footer-rad** med tre grupper:
   - *Suksess­historier å lære fra* — pille-lenker (grønne). Strenger i `relatedActorCases` matches mot `data.actor_cases.success ∪ failure ∪ additional_success ∪ additional_failure` for å rendre intern lenke som scroller til actors-fanen og ekspanderer aktøren. Eksterne caser (f.eks. «UK WRAP») som *ikke* finnes i aktørdata, plasseres i `sourceRefs` i stedet og rendres som vanlig kildelenke
   - *Kilder* — fra `sourceRefs[]`. `path`-felt rendres som intern monospace-lenke (intet click-handler i V1, kun visuell henvisning); `href`-felt rendres som ekstern lenke
   - *Relaterte gap* — fra `relatedGapIds[]`. Rendres som lokal anker som bytter til gaps-fanen og scroller til element

Lenker bruker `<Link>` for interne ankere (samme `/sirkularitet`-rute, oppdaterer `tab`-state) og `<a target="_blank" rel="noreferrer">` for eksterne. Intern fane-bytting + scroll krever liten state-bro: `EffektRow` kaller en handler propet ned fra `SirkularitetContent` som setter `tab` og legger ID-en i `expandedIds` før neste render.

### 5.4 Sortering

- Default: stigende på `rank` (1 → 10), skjuler topp-rangering på `aggregate`
- Toggle på «Klima»: sorter synkende på `effects.klima` (`high` → `medium` → `low`); ties brytes av `rank`
- Tilsvarende for «Natur» og «Forurensning»
- Toggle på «Aggregat»: tilbake til `rank`

### 5.5 Metodikk-seksjon (bunn av fanen)

Et `Card` med samme stil som eksisterende kontekstkort på `matrix`-fanen, ekspanderbart:

- *Hvorfor ingen LCA*: kort tekst om van der Fels-Klerx-gate-kriterium og NORSUS-prinsipp
- *Hva vi vurderte*: 1–2 setninger om utelatte tiltak (kaffe, R4-emballasje, etc.)
- *Hvordan foreslå endring*: lenke til GitHub-repo (`https://github.com/justaride/food-systems-2026`) med en setning som forklarer at endring skjer via PR mot `src/lib/data/circular-leverage.ts`

## 6. Komponenttre

```
SirkularitetContent
├─ ...eksisterende
└─ tab === 'effekt' ?
   └─ <EffektTab data={data}>
      ├─ <EffektHeader />                  // tittel + badge + toggle
      ├─ <EffektList sortBy={dim} />
      │  └─ <EffektRow leverage={l} />     // kollapset/ekspandert tilstand
      │     ├─ <EffectBar dim="klima" level={...} />
      │     ├─ <EffectBar dim="natur" level={...} />
      │     ├─ <EffectBar dim="forurensning" level={...} />
      │     └─ <EffektRowExpanded />       // lazy-rendret bare når åpen
      └─ <EffektMethodologyCard />
```

Filplassering:
- `src/components/charts/EffektTab.tsx` (hovedkomponent)
- `src/components/charts/EffektRow.tsx` (rad)
- `src/components/charts/EffectBar.tsx` (bar-komponent, gjenbrukbar)

State:
- `sortDim: 'aggregate' | 'klima' | 'natur' | 'forurensning'` lokalt i `EffektTab`
- `expandedIds: Set<string>` — gjenbruker mønsteret fra `SirkularitetContent`

## 7. Editoriell arbeidsflyt

- Endring av rangering eller tilføyelse av rad skjer i `circular-leverage.ts` via PR
- TypeScript fanger glemte felt (alle pliktige felt er ikke-optionale)
- `evidenceStatus` må eksplisitt settes — ingen default
- Git-historikk på filen er den autoritative «hvem endret hva når»-loggen
- «Sist oppdatert»-dato i header settes manuelt i koden ved hver redaksjonell PR

## 8. Test­strategi

### 8.1 Type-check (eksisterende)
`npx tsc --noEmit` fanger feil i `effects`-objekt og `evidenceStatus`-verdier.

### 8.2 Lint (eksisterende)
`npm run lint` fanger ubrukte variabler og stilbrudd.

### 8.3 Ny smoke-test
Ny fil `src/lib/data/__tests__/circular-leverage.test.ts`:
- Hver `relatedLoopIds`-verdi må finnes som `id` i `circularity-loops.json` `existing_loops`
- Hver `relatedGapIds`-verdi må finnes som `id` i `circularity-loops.json` `gaps`
- Hver `relatedQuestionIds`-verdi må finnes i `circularityQuestions`
- Hver `relatedActorCases`-verdi må finnes i `actor_cases.success` ∪ `actor_cases.failure` ∪ `additional_success` ∪ `additional_failure`
- Hver rad har `rank` 1–10, ingen duplikater
- `aggregate` er konsistent med ekspectasjon (manuell, ingen formel — bare valider at det finnes)

### 8.4 Browser-sjekk
Manuell verifikasjon på `/sirkularitet`:
- Fane-bytting fungerer
- Toggle endrer sortering
- Ekspansjon/kollaps fungerer per rad
- Lenker til relaterte gap/loop scroller til riktig element i andre faner
- Eksterne kildelenker åpner i ny tab

## 9. Akseptkriterier

- Ny fane `effekt` synlig som andre fane på `/sirkularitet` etter `matrix`
- Topp-10 rader rendres med korrekt rang, land-pill, tittel, headline og tre effektbarer
- Toggle på enkelt-dimensjon endrer sortering uten å miste utvidet tilstand
- Klikk på rad ekspanderer drilldown med begrunnelse, barrierer, policy-løftestenger, kilder og lenker
- `evidenceStatus`-badge synlig i header på fanen (alltid `illustrative`). Per-rad-badge er ute av V1-scope, men feltet på datatypen er pliktig fra V1 slik at V2-rendering ikke krever datamigrering
- Smoke-test passerer (alle relaterte IDer finnes i kildedata)
- Type-check og lint passerer
- Browser-sjekk: fane-bytting, toggle, ekspansjon og lenker virker

## 10. Risiko og avveininger

- **Subjektivitet i rangering**: Pure editorial gir ingen falsk presisjon, men ranger­ingen er sårbar for kritikk. Mitigering: explicit `illustrative`-merking, full begrunnelse per rad, og lenking til kilder.
- **Drift mot loops/gaps-data**: Hvis IDer endres i `circularity-loops.json` uten å oppdatere `circular-leverage.ts`, blir lenker brudte. Mitigering: smoke-test fanger dette i CI.
- **Vedlikehold**: 10 rader krever periodisk oppdatering når research utvikler seg. Mitigering: «Sist oppdatert»-dato gjør gammel data synlig; metodikk-seksjon henviser til endrings-PR.
- **Utvidelse over 10**: V2-filtrering (per land/tema) er foreløpig ute av scope. Hvis listen vokser, må filtrering legges til før den blir uleselig.

## 11. Avhengigheter og blokkere

- **Ingen** — alle nødvendige typer, komponenter og data finnes allerede
- Ikke avhengig av Fase –1b prod-sync (datagrunnlaget er statisk i `circular-leverage.ts`)
- Ikke avhengig av andre faser i datavisualisering-masterplanen

## 12. Estimat

| Estimat | Dager |
|---|---:|
| Optimistisk | 1.5 |
| Mest sannsynlig | 2.5 |
| Pessimistisk | 4.5 |
| PERT | 2.7 |

Hovedinnsats:
- Skrive komplett topp-10 med begrunnelser og kildehenvisninger (~1 dag)
- Bygge `EffektTab`/`EffektRow`/`EffectBar`-komponenter (~0.5 dag)
- Smoke-test + type/lint-fix (~0.25 dag)
- Browser-sjekk og iterasjon (~0.25 dag)
