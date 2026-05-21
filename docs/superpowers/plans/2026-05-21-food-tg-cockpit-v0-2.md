# Food TG Cockpit v0.2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Food TG cockpit v0.2 on `/mandat` with fail-closed control-layer data, candidate cards, decision gates, document package, and reader journey surfaces.

**Architecture:** Keep `/mandat` as the single Food TG cockpit route. Add a focused `src/lib/data/food-tg-control-layer.ts` module for the new control-layer contract, update stale mandate summary fields in `src/lib/data/food-tg-mandate.ts`, and render the new cockpit sections in `src/app/mandat/MandatContent.tsx`.

**Tech Stack:** Next.js 16 app router, React 19, TypeScript, Node test runner with `tsx`, Tailwind utility classes, existing `Card` and `EvidenceStatusBadge` components.

---

## File Structure

- Create `tests/lib/food-tg-control-layer.test.ts`
  - Owns fail-closed tests for the Food TG control layer, candidate cards, decision gates, reader journey, and 2026-05-21 mandate status.
- Create `src/lib/data/food-tg-control-layer.ts`
  - Owns typed control documents, decision gates, candidate cards, reader journey surfaces, labels, and status safety helper.
- Modify `src/lib/data/food-tg-mandate.ts`
  - Update mandate summary date/status and validation lane date to match the approved 2026-05-21 control package.
- Modify `src/app/mandat/MandatContent.tsx`
  - Import the new data module and render cockpit sections without hardcoded Food TG content in JSX.

## Task 1: Add Fail-Closed Control-Layer Test

**Files:**
- Create: `tests/lib/food-tg-control-layer.test.ts`
- Reads: `src/lib/data/food-tg-control-layer.ts`
- Reads: `src/lib/data/food-tg-mandate.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/lib/food-tg-control-layer.test.ts` with this content:

```ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  foodTgCandidateCards,
  foodTgControlDocuments,
  foodTgDecisionGates,
  foodTgReaderJourneySurfaces,
  isExternallyValidatedFoodTgStatus,
} from '../../src/lib/data/food-tg-control-layer'
import { foodTgMandateSummary, foodTgValidationLanes } from '../../src/lib/data/food-tg-mandate'

const unsafePositivePattern = /\b(pilotklar|scope er besluttet|aktørene er med|eksternt validert)\b/i

describe('Food TG control layer', () => {
  it('keeps mandate status aligned with the 2026-05-21 decision package', () => {
    assert.equal(foodTgMandateSummary.date, '2026-05-21')
    assert.equal(foodTgMandateSummary.decisionDate, 'Venter scope- eller minimumsvedtak')
    assert.match(foodTgMandateSummary.externalValidation, /Ingen claims er validert eksternt per 2026-05-21/)

    const externalLane = foodTgValidationLanes.find((lane) => lane.id === 'validert-eksternt')
    assert.ok(externalLane)
    assert.equal(externalLane.items.length, 0)
    assert.match(externalLane.description, /Ingen claims er validert eksternt per 2026-05-21/)
  })

  it('defines the required control document package with blocking rules', () => {
    const expectedIds = [
      'decision-pack-v01',
      'insight-pack-outline-v03',
      'claim-lock-2026-05',
      'figure-model-note-audit-2026-05',
      'case-to-claim-index-2026-05',
      'source-locator-risk-audit-2026-05',
      'scope-decision-request-2026-05-21',
      'validation-sprint-log-2026-05',
      'baseline-freeze-2026-05-21',
    ]

    assert.deepEqual(foodTgControlDocuments.map((doc) => doc.id), expectedIds)

    for (const doc of foodTgControlDocuments) {
      assert.ok(doc.title)
      assert.ok(doc.kind)
      assert.ok(doc.status)
      assert.ok(doc.path.startsWith('docs/project/mandates/'))
      assert.ok(doc.path.endsWith('.md'))
      assert.ok(doc.use)
      assert.ok(doc.blocks.length > 0)
    }
  })

  it('defines six decision gates with governing documents and stop logic', () => {
    assert.deepEqual(foodTgDecisionGates.map((gate) => gate.id), [
      'scope',
      'claim',
      'figure',
      'case',
      'source',
      'validation',
    ])

    for (const gate of foodTgDecisionGates) {
      assert.ok(gate.title)
      assert.ok(gate.status)
      assert.ok(gate.governingDocument.startsWith('docs/project/mandates/'))
      assert.ok(gate.mustBeTrue)
      assert.ok(gate.blocks)
      assert.ok(gate.nextAction)
      assert.equal(isExternallyValidatedFoodTgStatus(gate.status), false)
    }
  })

  it('defines candidate cards with minimum data, gates, stop signals, and no unsafe status lift', () => {
    assert.deepEqual(foodTgCandidateCards.map((card) => card.id), ['A1', 'A-B', 'B1', 'B2', 'B3-C'])

    for (const card of foodTgCandidateCards) {
      assert.ok(card.title)
      assert.ok(card.role)
      assert.ok(card.canSay)
      assert.ok(card.cannotSay)
      assert.ok(card.minimumData.length >= 4)
      assert.ok(card.sourceGate)
      assert.ok(card.actorGate)
      assert.ok(card.cGate)
      assert.ok(card.stopSignal)
      assert.ok(card.nextAction)
      assert.ok(card.claimIds.length > 0)
      assert.equal(isExternallyValidatedFoodTgStatus(card.status), false)

      const positiveFields = [card.title, card.role, card.canSay, card.nextAction].join(' ')
      assert.ok(!unsafePositivePattern.test(positiveFields), `${card.id} contains unsafe positive language`)
    }
  })

  it('maps reader journey surfaces to existing routes with figure or risk notes', () => {
    assert.deepEqual(foodTgReaderJourneySurfaces.map((surface) => surface.route), [
      '/mandat',
      '/innsikt',
      '/forsyningskjede',
      '/verdikjede',
      '/sirkularitet',
      '/graf',
      '/sammenligning',
    ])

    for (const surface of foodTgReaderJourneySurfaces) {
      assert.ok(surface.title)
      assert.ok(surface.use)
      assert.ok(surface.readiness)
      assert.ok(surface.figureNote)
      assert.ok(surface.risk)
      assert.ok(surface.nextAction)
      assert.equal(isExternallyValidatedFoodTgStatus(surface.readiness), false)
    }
  })
})
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
node --import=tsx --test tests/lib/food-tg-control-layer.test.ts
```

Expected: FAIL because `../../src/lib/data/food-tg-control-layer` does not exist.

Do not change the test to make it pass. The missing module is the expected red state.

## Task 2: Implement Food TG Control-Layer Data

**Files:**
- Create: `src/lib/data/food-tg-control-layer.ts`
- Test: `tests/lib/food-tg-control-layer.test.ts`

- [ ] **Step 1: Create the data module**

Create `src/lib/data/food-tg-control-layer.ts` with this content:

```ts
import type { FoodTgTrack } from './food-tg-mandate'

export type FoodTgControlStatus =
  | 'klar'
  | 'klar-med-forbehold'
  | 'krever-bekreftelse'
  | 'maa-harmoniseres'
  | 'hold-tilbake'
  | 'venter-minimumsvedtak'
  | 'ikke-startet'
  | 'benchmark'
  | 'hypotese'
  | 'pilotkandidat'
  | 'sekundaerspor'

export type FoodTgControlDocument = {
  id: string
  title: string
  kind: string
  status: FoodTgControlStatus
  path: string
  use: string
  blocks: string[]
}

export type FoodTgDecisionGate = {
  id: 'scope' | 'claim' | 'figure' | 'case' | 'source' | 'validation'
  title: string
  status: FoodTgControlStatus
  governingDocument: string
  mustBeTrue: string
  blocks: string
  nextAction: string
}

export type FoodTgCandidateCard = {
  id: 'A1' | 'A-B' | 'B1' | 'B2' | 'B3-C'
  title: string
  track: FoodTgTrack
  role: string
  status: FoodTgControlStatus
  claimIds: string[]
  evidenceIds: string[]
  sourceIds: string[]
  canSay: string
  cannotSay: string
  minimumData: string[]
  sourceGate: string
  actorGate: string
  cGate: string
  stopSignal: string
  nextAction: string
}

export type FoodTgReaderJourneySurface = {
  route: string
  title: string
  use: string
  readiness: FoodTgControlStatus
  figureNote: string
  risk: string
  nextAction: string
}

export const foodTgControlStatusLabels: Record<FoodTgControlStatus, string> = {
  klar: 'Klar',
  'klar-med-forbehold': 'Klar med forbehold',
  'krever-bekreftelse': 'Krever bekreftelse',
  'maa-harmoniseres': 'Må harmoniseres',
  'hold-tilbake': 'Hold tilbake',
  'venter-minimumsvedtak': 'Venter minimumsvedtak',
  'ikke-startet': 'Ikke startet',
  benchmark: 'Benchmark',
  hypotese: 'Hypotese',
  pilotkandidat: 'Pilotkandidat',
  sekundaerspor: 'Sekundærspor',
}

export function isExternallyValidatedFoodTgStatus(status: FoodTgControlStatus): boolean {
  void status
  return false
}

export const foodTgControlDocuments: FoodTgControlDocument[] = [
  {
    id: 'decision-pack-v01',
    title: 'Food TG Decision Pack v0.1',
    kind: 'Intern beslutningspakke',
    status: 'klar-med-forbehold',
    path: 'docs/project/mandates/food-tg-decision-pack-v0.1.md',
    use: 'Internt pre-read for minimumsvedtak og valideringssprint.',
    blocks: ['Ekstern presentasjon', 'pilotløfte', 'validert roadmap'],
  },
  {
    id: 'insight-pack-outline-v03',
    title: 'Insight / Decision Pack Outline Food TG v0.3',
    kind: 'Produksjonskontrakt',
    status: 'klar-med-forbehold',
    path: 'docs/project/mandates/insight-pack-outline-food-tg-v0.3.md',
    use: 'Styrer decision-pack, reader journey og kontrollert redaksjonell produksjon.',
    blocks: ['Slide uten status', 'figur uten note', 'claim uten kontrollfil'],
  },
  {
    id: 'claim-lock-2026-05',
    title: 'Food TG Claim-Lock Table 2026-05',
    kind: 'Publikasjonskontroll',
    status: 'klar',
    path: 'docs/project/mandates/food-tg-claim-lock-table-2026-05.md',
    use: 'Styrer hva som kan sies, hva som må sies, og hva som ikke skal sies.',
    blocks: ['Faktastemme uten caveat', 'statusløft uten port', 'hold-tilbake-claims'],
  },
  {
    id: 'figure-model-note-audit-2026-05',
    title: 'Food TG Figure / Model Note Audit 2026-05',
    kind: 'Figur- og modellport',
    status: 'klar',
    path: 'docs/project/mandates/food-tg-figure-model-note-audit-2026-05.md',
    use: 'Sikrer at grafer, KPI-er, flows og modeller har dekningsnote.',
    blocks: ['KPI som effektbevis', 'graf som aktørforankring', 'flow uten systemgrense'],
  },
  {
    id: 'case-to-claim-index-2026-05',
    title: 'Food TG Case-to-Claim Index 2026-05',
    kind: 'Caseport',
    status: 'klar',
    path: 'docs/project/mandates/food-tg-case-to-claim-index-2026-05.md',
    use: 'Skiller benchmark, hypotese, kandidat og effektbevis.',
    blocks: ['Benchmark som pilotbevis', 'case uten status', 'overført effekt uten systemgrense'],
  },
  {
    id: 'source-locator-risk-audit-2026-05',
    title: 'Food TG Source Locator Risk Audit 2026-05',
    kind: 'Kildeport',
    status: 'klar',
    path: 'docs/project/mandates/food-tg-source-locator-risk-audit-2026-05.md',
    use: 'Låser locator, år, geografi, definisjon og caveat for high-risk claims.',
    blocks: ['Tall uten locator', 'regelverksclaim uten dato', 'actor-data som bransjesnitt'],
  },
  {
    id: 'scope-decision-request-2026-05-21',
    title: 'Food TG Scope Decision Request 2026-05-21',
    kind: 'Beslutningsforespørsel',
    status: 'venter-minimumsvedtak',
    path: 'docs/project/mandates/food-tg-scope-decision-request-2026-05-21.md',
    use: 'Ber JTO/Cathrine/Einar om scope- eller minimumsvedtak før P1-outreach.',
    blocks: ['Scope som låst', 'bred ekstern valideringsrunde', 'roadmap som beslutning'],
  },
  {
    id: 'validation-sprint-log-2026-05',
    title: 'Food TG Validation Sprint Log 2026-05',
    kind: 'Responslogg',
    status: 'ikke-startet',
    path: 'docs/project/mandates/food-tg-validation-sprint-log-2026-05.md',
    use: 'Operativ logg for primary-check og aktørrespons etter minimumsvedtak.',
    blocks: ['Validert eksternt uten responsdato', 'aktørsvar uten bruksrett', 'uavklart rolle'],
  },
  {
    id: 'baseline-freeze-2026-05-21',
    title: 'Food TG Baseline Freeze 2026-05-21',
    kind: 'Baselinekontroll',
    status: 'klar-med-forbehold',
    path: 'docs/project/mandates/food-tg-baseline-freeze-2026-05-21.md',
    use: 'Dokumenterer intern baseline før videre validering og produksjon.',
    blocks: ['Intern baseline som ekstern validering', 'grønn citation-baseline som pilotbevis'],
  },
]

export const foodTgDecisionGates: FoodTgDecisionGate[] = [
  {
    id: 'scope',
    title: 'Scope-port',
    status: 'venter-minimumsvedtak',
    governingDocument: 'docs/project/mandates/food-tg-scope-decision-request-2026-05-21.md',
    mustBeTrue: 'JTO/Cathrine/Einar har minst godkjent minimumsvedtak for valideringssprint.',
    blocks: 'A+B/C omtales som besluttet eller ekstern outreach sendes uten mandat.',
    nextAction: 'Loggfør minimumsvedtak før P1-outreach.',
  },
  {
    id: 'claim',
    title: 'Claim-port',
    status: 'klar',
    governingDocument: 'docs/project/mandates/food-tg-claim-lock-table-2026-05.md',
    mustBeTrue: 'Hver publiserbar setning har status, kildeanker, caveat og ikke-si-regel.',
    blocks: 'Interne claims blir ekstern faktastemme uten forbehold.',
    nextAction: 'Oppdater claim-lock etter hver primary-check og aktørrespons.',
  },
  {
    id: 'figure',
    title: 'Figur-port',
    status: 'klar',
    governingDocument: 'docs/project/mandates/food-tg-figure-model-note-audit-2026-05.md',
    mustBeTrue: 'Alle grafer, modeller, KPI-er og flows har dekningsnote og ikke-bevis.',
    blocks: 'KPI, Sankey, graf eller modell brukes som effektbevis.',
    nextAction: 'Fest figurnote til alle appflater som brukes i decision pack.',
  },
  {
    id: 'case',
    title: 'Case-port',
    status: 'klar',
    governingDocument: 'docs/project/mandates/food-tg-case-to-claim-index-2026-05.md',
    mustBeTrue: 'Alle cases er merket som benchmark, hypotese, kandidat eller sekundærspor.',
    blocks: 'Benchmark, svensk case eller nutrient loop selges som første pilot.',
    nextAction: 'Bruk kandidatkortene som primær case-status.',
  },
  {
    id: 'source',
    title: 'Kilde-port',
    status: 'klar',
    governingDocument: 'docs/project/mandates/food-tg-source-locator-risk-audit-2026-05.md',
    mustBeTrue: 'High-risk tall, regelverk og actor-data har locator, år, geografi, definisjon og caveat.',
    blocks: 'EUDR, varekoder, Denofa/Skretting eller benchmarkdata brukes uten metodeforbehold.',
    nextAction: 'Lås locator før ekstern tekst eller deck.',
  },
  {
    id: 'validation',
    title: 'Validerings-port',
    status: 'ikke-startet',
    governingDocument: 'docs/project/mandates/food-tg-validation-sprint-log-2026-05.md',
    mustBeTrue: 'Respons har dato, rolle, aktør, kilde og bruksrett.',
    blocks: 'Claims løftes til ekstern validering uten dokumentert respons.',
    nextAction: 'Start loggføring først etter scope- eller minimumsvedtak.',
  },
]

export const foodTgCandidateCards: FoodTgCandidateCard[] = [
  {
    id: 'A1',
    title: 'EUDR og fôrdata',
    track: 'A',
    role: 'Strategisk datagate for import, sporbarhet og metode',
    status: 'krever-bekreftelse',
    claimIds: ['CL-C-011', 'CL-A-020', 'CL-C-015'],
    evidenceIds: ['EV-C-017', 'EV-A-021'],
    sourceIds: ['PCQ-C-001', 'SRC-A-017'],
    canSay: 'EUDR og fôrdata er sterke datatema når EU-scope, norsk/EØS-status og varekodemetode holdes separat.',
    cannotSay: 'Ikke si at EUDR gjelder direkte i Norge for soya, eller at varekoder alene beviser SPC eller laksefôrvolum.',
    minimumData: ['EU/Norge/EØS-status', 'SSB/Tolletaten-metode', 'varenummerdefinisjon', 'bruksrett til datakilde'],
    sourceGate: 'Landbruksdirektoratet, Miljødirektoratet og SSB/Tolletaten må sjekkes før faktastemme.',
    actorGate: 'Fôraktører kan brukes som actor-data, ikke som bransjesnitt uten metode.',
    cGate: 'Regelverksstatus, dataeier og kjøperkrav må inn som stoppsignal.',
    stopSignal: 'Norsk gjennomføring eller varekodemetode kan ikke avklares raskt.',
    nextAction: 'Kjør primary-check for EUDR-Norge, HS/SSB-metode og databruk.',
  },
  {
    id: 'A-B',
    title: 'Alternative fôrproteiner',
    track: 'A',
    role: 'Roadmap-spor for importsubstitusjon og senere modningscase',
    status: 'klar-med-forbehold',
    claimIds: ['CL-A-020', 'CL-A-021'],
    evidenceIds: ['EV-A-001', 'EV-A-018', 'EV-A-019', 'EV-A-021', 'EV-A-022'],
    sourceIds: ['SRC-A-013', 'SRC-A-014', 'SRC-A-015', 'SRC-A-016'],
    canSay: 'Alternative fôrproteiner er relevante roadmap-spor dersom modenhet, kost, LCA, råvaretilgang, regulatorisk vei og kjøperkrav bekreftes.',
    cannotSay: 'Ikke si at encelle- eller gjærprotein erstatter soya nå, har dokumentert substitusjonseffekt eller er kommersielt modent for Food TG.',
    minimumData: ['modenhet', 'kost', 'LCA', 'volum', 'regulatorisk vei', 'kjøperkrav'],
    sourceGate: 'NMBU/Foods of Norway og primærkilder må skille FoU-relevans fra kommersiell modenhet.',
    actorGate: 'Denofa, Skretting, BioMar eller Sjømat Norge må bekrefte hva som kan brukes og siteres.',
    cGate: 'Kjøper, dataeier, regulatorisk vei og praktisk adopsjon må være tydelig.',
    stopSignal: 'Fôraktørene kan ikke dele brukbare data, eller modenhet ligger for langt unna pilotarbeid.',
    nextAction: 'Skille FoU-benchmark, roadmap-spor og mulig senere modningscase.',
  },
  {
    id: 'B1',
    title: 'Okara/BSG',
    track: 'B',
    role: 'Teknisk sidestrømskandidat med råvare-, hygiene- og off-taker-gate',
    status: 'hypotese',
    claimIds: ['CL-B-014', 'CL-B-021'],
    evidenceIds: ['EV-B-011', 'EV-B-018', 'EV-B-019', 'EV-B-020'],
    sourceIds: ['SRC-B-024', 'SRC-B-025', 'SRC-B-026'],
    canSay: 'Okara og bryggerimask er konkrete benchmark og betingede kandidatstrømmer etter råvare-, hygiene- og off-taker-gate.',
    cannotSay: 'Ikke si at norsk eller nordisk volum, food-grade-status, holdbarhet, Novel Food-avklaring eller kjøper er avklart.',
    minimumData: ['råvareeier', 'tonn per år', 'batchfrekvens', 'fukt/tørrstoff', 'mikrobiologi', 'stabilisering', 'off-taker'],
    sourceGate: 'Volum, kvalitet og lovlig sluttbruk må låses per råvarecase.',
    actorGate: 'Råvareeier, fagekspert/Mattilsynet og off-taker må bekrefte data og bruksrett.',
    cGate: 'Lovlig sluttbruk, kjøper, dataeier og driftseier må finnes.',
    stopSignal: 'Råvareeier, hygieneport, stabilisering eller kjøper kan ikke avklares.',
    nextAction: 'Kartlegg ett avgrenset okara- eller BSG-case med råvareeier og off-taker.',
  },
  {
    id: 'B2',
    title: 'Matsvinnkvalitet',
    track: 'B',
    role: 'Adoption-kandidat for quality-window og rutineendring',
    status: 'klar-med-forbehold',
    claimIds: ['CL-B-022', 'CL-C-012', 'CL-C-015'],
    evidenceIds: ['EV-B-002', 'EV-B-004', 'EV-B-021', 'EV-B-022', 'EV-B-023'],
    sourceIds: ['SRC-B-027', 'SRC-C-018'],
    canSay: 'Matsvinnkvalitet kan være en rask adoption-kandidat hvis partner dokumenterer baseline, kategori, tidsvindu, destinasjon og rutineendring.',
    cannotSay: 'Ikke bruk måltider reddet, appbruk eller mengde alene som effektbevis uten baseline og kontrafaktisk.',
    minimumData: ['partner', 'kategori', 'tidsvindu', 'baseline', 'destinasjon', 'rutineendring', 'kontrafaktisk', 'dataeier'],
    sourceGate: 'Baseline, kategori og kontrafaktisk må dokumenteres før effektord.',
    actorGate: 'Matvett, Too Good To Go, dagligvare, HORECA eller offentlig kjøkken må bekrefte data og bruksrett.',
    cGate: 'Driftseier, dataeier, kjøper/bruker og KPI-definisjon må finnes.',
    stopSignal: 'Partner mangler baseline, kategori, tidsvindu, rutineendring eller kontrafaktisk.',
    nextAction: 'Teste om data finnes for quality-window-kart og minimum pilotdesign uten pilotløfte.',
  },
  {
    id: 'B3-C',
    title: 'C-gate for A og B',
    track: 'C',
    role: 'Tverrgående gate for lov, kjøper, data, drift, governance og KPI',
    status: 'klar-med-forbehold',
    claimIds: ['CL-C-001', 'CL-C-002', 'CL-C-006', 'CL-C-015'],
    evidenceIds: ['EV-C-013', 'EV-C-015', 'EV-C-016', 'EV-C-021', 'EV-C-023', 'EV-C-025'],
    sourceIds: ['SRC-C-018'],
    canSay: 'C bør brukes som gate på tvers av A og B, ikke som et bredt separat policyspor nå.',
    cannotSay: 'Ikke hev kausal håndhevingseffekt, innkjøpseffekt eller markedseffekt uten aktørdata.',
    minimumData: ['lovlig vei', 'kjøper/off-taker', 'dataeier', 'driftseier', 'styringsarena', 'KPI-baseline'],
    sourceGate: 'Regelverk, håndheving, innkjøp og KPI må ha kilde, dato, geografi og systemgrense.',
    actorGate: 'Aktørintervjuer må kobles til konkret A- eller B-kandidat.',
    cGate: 'Ingen A/B-kandidat går videre uten lov, kjøper, data, drift og governance.',
    stopSignal: 'Ingen tydelig dataeier, kjøper eller styringsarena for valgt case.',
    nextAction: 'Bruk C-gate som obligatorisk stoppsignal i alle kandidatkort.',
  },
]

export const foodTgReaderJourneySurfaces: FoodTgReaderJourneySurface[] = [
  {
    route: '/mandat',
    title: 'Mandat',
    use: 'Intern mandatstatus, valideringslogikk, beslutningsporter og stoppsignaler.',
    readiness: 'klar-med-forbehold',
    figureNote: 'Scope er ikke endelig før beslutningslogg er oppdatert.',
    risk: 'Kan leses som beslutning hvis minimumsvedtak ikke vises tydelig.',
    nextAction: 'Hold Food TG cockpit som intern styringsflate.',
  },
  {
    route: '/innsikt',
    title: 'Innsikt',
    use: 'Leserinngang til innsikter og claimnære forklaringer.',
    readiness: 'klar-med-forbehold',
    figureNote: 'Readiness og kildechips styrer ekstern bruk.',
    risk: 'Innsiktstekst kan overleses som publikasjonsklar uten claim-lock.',
    nextAction: 'Koble high-risk innsikter til claim-lock før ekstern tekst.',
  },
  {
    route: '/forsyningskjede',
    title: 'Forsyningskjede',
    use: 'Datalag for primærflyt, import, relasjoner og returstrømmer.',
    readiness: 'klar-med-forbehold',
    figureNote: 'Flere datalag med ulik dekning må ikke blandes.',
    risk: 'Import, fôrbruk, actor-data og benchmark kan bli lest som samme datalag.',
    nextAction: 'Legg inn metodeforbehold for EUDR, HS/SSB og actor-data.',
  },
  {
    route: '/verdikjede',
    title: 'Verdikjede',
    use: 'Verdikjededekning og flow-skisse for hvor Food TG-kandidatene passer inn.',
    readiness: 'klar-med-forbehold',
    figureNote: 'Kjent matsvinn er ikke full nordisk total.',
    risk: 'Flow kan tolkes som full dekning eller effektbevis.',
    nextAction: 'Bruk som navigasjon, ikke som dokumentert reduksjon.',
  },
  {
    route: '/sirkularitet',
    title: 'Sirkularitet',
    use: 'R-stige, KPI og case-/gaplogikk for sirkulær effekt.',
    readiness: 'klar-med-forbehold',
    figureNote: 'KPI og cases er ikke effektbevis.',
    risk: 'Score eller KPI kan leses som måloppnåelse uten baseline.',
    nextAction: 'Koble KPI-er til definisjon, år, geografi, kilde og systemgrense.',
  },
  {
    route: '/graf',
    title: 'Graf',
    use: 'Navigasjon, relasjoner og datakvalitet på tvers av aktører og kilder.',
    readiness: 'klar-med-forbehold',
    figureNote: 'Graf er ikke aktørforankring.',
    risk: 'Relasjoner kan overtolkes som bekreftet samarbeid.',
    nextAction: 'Vis graf som utforskning og datakvalitet, ikke som validering.',
  },
  {
    route: '/sammenligning',
    title: 'Sammenligning',
    use: 'Nordisk kontekst og benchmark for policy, marked og sirkulær modenhet.',
    readiness: 'benchmark',
    figureNote: 'Rangering krever harmonisert definisjon, år og kildegrunnlag.',
    risk: 'Nordisk benchmark kan bli lest som direkte overførbarhet til norsk pilot.',
    nextAction: 'Bruk som kontekst med tydelig benchmark-status.',
  },
]
```

- [ ] **Step 2: Run the control-layer test**

Run:

```bash
node --import=tsx --test tests/lib/food-tg-control-layer.test.ts
```

Expected: FAIL only on the mandate summary and validation lane date assertions, because `food-tg-mandate.ts` still says `2026-04-28`.

## Task 3: Update Mandate Summary and Validation Lane Date

**Files:**
- Modify: `src/lib/data/food-tg-mandate.ts`
- Test: `tests/lib/food-tg-control-layer.test.ts`
- Test: `tests/lib/food-tg-mandate-diacritics.test.ts`

- [ ] **Step 1: Update `foodTgMandateSummary`**

In `src/lib/data/food-tg-mandate.ts`, replace the existing `foodTgMandateSummary` object with:

```ts
export const foodTgMandateSummary: FoodTgMandateSummary = {
  title: 'Food TG mandat og validering',
  date: '2026-05-21',
  decisionDate: 'Venter scope- eller minimumsvedtak',
  evidenceStatus: 'proxy',
  evidenceStatusNote:
    'Internt styringssignal fra decision pack, claim-lock, source-locator og validation sprint-logg. Ikke ekstern validering.',
  scope: 'Anbefalt arbeidsretning: Spor A+B, med C som tverrgående adoption-, regelverks- og datagate. Scope er ikke formelt bekreftet.',
  recommendation:
    'Be om minimumsvedtak for en begrenset valideringssprint før P1-outreach, pilotbriefs eller roadmap-språk.',
  decisionRule:
    'Etter sprint: modnes som kandidat, beholdes som roadmap, parkeres som benchmark, eller holdes tilbake hvis portene ikke åpner.',
  externalValidation: 'Ingen claims er validert eksternt per 2026-05-21.',
}
```

- [ ] **Step 2: Update validation lane date**

In `src/lib/data/food-tg-mandate.ts`, find the `foodTgValidationLanes` item with `id: 'validert-eksternt'` and replace its `description` with:

```ts
description: 'Ingen claims er validert eksternt per 2026-05-21.',
```

- [ ] **Step 3: Run tests to verify GREEN for data**

Run:

```bash
node --import=tsx --test tests/lib/food-tg-control-layer.test.ts
node --import=tsx --test tests/lib/food-tg-mandate-diacritics.test.ts
```

Expected: both commands PASS.

- [ ] **Step 4: Commit data layer**

Run:

```bash
git add tests/lib/food-tg-control-layer.test.ts src/lib/data/food-tg-control-layer.ts src/lib/data/food-tg-mandate.ts
git commit -m "feat: add food tg control layer"
```

## Task 4: Add Control-Layer Rendering Helpers to MandatContent

**Files:**
- Modify: `src/app/mandat/MandatContent.tsx`
- Reads: `src/lib/data/food-tg-control-layer.ts`

- [ ] **Step 1: Add imports**

In `src/app/mandat/MandatContent.tsx`, add this import after the existing `food-tg-mandate` import block:

```ts
import {
  foodTgCandidateCards,
  foodTgControlDocuments,
  foodTgControlStatusLabels,
  foodTgDecisionGates,
  foodTgReaderJourneySurfaces,
  type FoodTgControlStatus,
} from '@/lib/data/food-tg-control-layer'
```

- [ ] **Step 2: Add status styles and helper components**

In `src/app/mandat/MandatContent.tsx`, add this code after `documentStatusStyles`:

```tsx
const controlStatusStyles: Record<FoodTgControlStatus, string> = {
  klar: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'klar-med-forbehold': 'bg-sky-50 text-sky-700 border-sky-200',
  'krever-bekreftelse': 'bg-amber-50 text-amber-800 border-amber-200',
  'maa-harmoniseres': 'bg-orange-50 text-orange-800 border-orange-200',
  'hold-tilbake': 'bg-rose-50 text-rose-700 border-rose-200',
  'venter-minimumsvedtak': 'bg-amber-50 text-amber-800 border-amber-200',
  'ikke-startet': 'bg-stone-100 text-stone-600 border-stone-200',
  benchmark: 'bg-violet-50 text-violet-700 border-violet-200',
  hypotese: 'bg-stone-100 text-stone-600 border-stone-200',
  pilotkandidat: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  sekundaerspor: 'bg-slate-50 text-slate-700 border-slate-200',
}
```

Add these helper components after `DocumentStatus`:

```tsx
function ControlStatusPill({ status }: { status: FoodTgControlStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${controlStatusStyles[status]}`}>
      {foodTgControlStatusLabels[status]}
    </span>
  )
}

function InlineList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className="rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[11px] text-stone-600">
          {item}
        </span>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Run lint for import/type mistakes**

Run:

```bash
npm run lint
```

Expected: PASS or fail only on unused imports because sections are not rendered yet. If it fails only on unused imports, continue to Task 5 before fixing.

## Task 5: Render Cockpit Sections on `/mandat`

**Files:**
- Modify: `src/app/mandat/MandatContent.tsx`
- Reads: `src/lib/data/food-tg-control-layer.ts`

- [ ] **Step 1: Insert decision gate section**

In `MandatContent`, after the status count grid and before the track status cards, insert:

```tsx
      <section className="space-y-3">
        <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-stone-500">Kontrollag</p>
            <h2 className="text-sm font-semibold text-stone-800">Beslutningsporter før ekstern bruk</h2>
          </div>
          <p className="max-w-2xl text-xs leading-relaxed text-stone-500">
            Portene viser hva som stopper scope, claims, figurer, cases, kilder og validering fra å bli brukt for sterkt.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {foodTgDecisionGates.map((gate) => (
            <section key={gate.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <ControlStatusPill status={gate.status} />
                <span className="text-xs font-medium text-stone-500">{gate.title}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-stone-700">{gate.mustBeTrue}</p>
              <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
                <p className="text-[10px] uppercase tracking-wider text-stone-400">Stopper</p>
                <p className="mt-1 text-sm leading-relaxed text-stone-700">{gate.blocks}</p>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-stone-500">Neste handling: {gate.nextAction}</p>
              <code className="mt-2 block break-all rounded-md bg-stone-50 px-2 py-1 text-[11px] text-stone-500">
                {gate.governingDocument}
              </code>
            </section>
          ))}
        </div>
      </section>
```

- [ ] **Step 2: Insert candidate card section**

After the track status card grid and before "Minimum valideringslaner", insert:

```tsx
      <Card title="Kandidatkort">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {foodTgCandidateCards.map((card) => (
            <section key={card.id} className="rounded-lg border border-stone-200 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-stone-400">{card.id}</span>
                <TrackPill track={card.track} />
                <ControlStatusPill status={card.status} />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-stone-900">{card.title}</h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-stone-400">{card.role}</p>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Kan sies nå</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">{card.canSay}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Skal ikke sies</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">{card.cannotSay}</p>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-[10px] uppercase tracking-wider text-stone-400">Minimumsdata</p>
                <div className="mt-1">
                  <InlineList items={card.minimumData} />
                </div>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Kildegate</p>
                  <p className="mt-1 text-xs leading-relaxed text-stone-600">{card.sourceGate}</p>
                </div>
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Aktørgate</p>
                  <p className="mt-1 text-xs leading-relaxed text-stone-600">{card.actorGate}</p>
                </div>
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">C-gate</p>
                  <p className="mt-1 text-xs leading-relaxed text-stone-600">{card.cGate}</p>
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3">
                <p className="text-[10px] uppercase tracking-wider text-rose-700">Stoppsignal</p>
                <p className="mt-1 text-sm leading-relaxed text-rose-900">{card.stopSignal}</p>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-stone-500">Neste handling: {card.nextAction}</p>
              <div className="mt-3">
                <InlineList items={[...card.claimIds, ...card.evidenceIds, ...card.sourceIds]} />
              </div>
            </section>
          ))}
        </div>
      </Card>
```

- [ ] **Step 3: Replace the document card data source**

In the `Card title="Beslutningsgrunnlag"` block, replace the map over `foodTgDecisionDocuments` with a map over `foodTgControlDocuments`. Replace the document status component call with `ControlStatusPill`.

The mapped block should be:

```tsx
            {foodTgControlDocuments.map((doc) => (
              <div key={doc.id} className="border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-stone-800">{doc.title}</h3>
                  <ControlStatusPill status={doc.status} />
                </div>
                <p className="mt-1 text-xs text-stone-500">{doc.kind}</p>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">{doc.use}</p>
                <div className="mt-2">
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Stopper</p>
                  <InlineList items={doc.blocks} />
                </div>
                <code className="mt-2 block break-all rounded-md bg-stone-50 px-2 py-1 text-[11px] text-stone-500">{doc.path}</code>
              </div>
            ))}
```

Remove `foodTgDecisionDocuments` from the `food-tg-mandate` import if it is no longer used. Remove `DocumentStatus` and `documentStatusStyles` if they become unused.

- [ ] **Step 4: Insert reader journey section**

After the two-column document/rule block and before `Card title="Opportunity radar"`, insert:

```tsx
      <Card title="Reader journey og plattformflater">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {foodTgReaderJourneySurfaces.map((surface) => (
            <section key={surface.route} className="rounded-lg border border-stone-200 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={surface.route} className="text-sm font-semibold text-stone-900 underline decoration-stone-300 underline-offset-4 hover:text-stone-700">
                  {surface.title}
                </Link>
                <ControlStatusPill status={surface.readiness} />
                <code className="rounded bg-stone-50 px-1.5 py-0.5 text-[11px] text-stone-500">{surface.route}</code>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{surface.use}</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Figurnote</p>
                  <p className="mt-1 text-xs leading-relaxed text-stone-600">{surface.figureNote}</p>
                </div>
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Risiko</p>
                  <p className="mt-1 text-xs leading-relaxed text-stone-600">{surface.risk}</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-stone-500">Neste handling: {surface.nextAction}</p>
            </section>
          ))}
        </div>
      </Card>
```

- [ ] **Step 5: Run targeted tests and lint**

Run:

```bash
node --import=tsx --test tests/lib/food-tg-control-layer.test.ts
node --import=tsx --test tests/lib/food-tg-mandate-diacritics.test.ts
npm run lint
```

Expected: all commands PASS.

## Task 6: Build Verification and Implementation Commit

**Files:**
- Verify: `src/app/mandat/MandatContent.tsx`
- Verify: `src/lib/data/food-tg-control-layer.ts`
- Verify: `src/lib/data/food-tg-mandate.ts`
- Verify: `tests/lib/food-tg-control-layer.test.ts`

- [ ] **Step 1: Run build**

Run:

```bash
npm run build
```

Expected: exit code 0. If the build fails because of pre-existing environment, Prisma, or external service configuration, capture the exact failure and run the narrower passing verification commands from Task 5 before reporting status.

- [ ] **Step 2: Run whitespace check**

Run:

```bash
git diff --check
```

Expected: no output and exit code 0.

- [ ] **Step 3: Review changed files**

Run:

```bash
git status --short --branch
git diff --stat
```

Expected: only these tracked files should be modified or created:

- `tests/lib/food-tg-control-layer.test.ts`
- `src/lib/data/food-tg-control-layer.ts`
- `src/lib/data/food-tg-mandate.ts`
- `src/app/mandat/MandatContent.tsx`

The existing untracked screenshot PNG files should remain untracked and unmodified.

- [ ] **Step 4: Commit implementation**

Run:

```bash
git add tests/lib/food-tg-control-layer.test.ts src/lib/data/food-tg-control-layer.ts src/lib/data/food-tg-mandate.ts src/app/mandat/MandatContent.tsx
git commit -m "feat: implement food tg cockpit"
```

## Task 7: Optional Browser QA Checkpoint

**Files:**
- Verify: `/mandat` rendered in local app

- [ ] **Step 1: Start dev server**

Run:

```bash
npm run dev
```

Expected: local Next.js server starts and prints a localhost URL.

- [ ] **Step 2: Open `/mandat` in browser**

Use the in-app browser on the printed localhost URL, then navigate to `/mandat`.

Expected visible sections:

- Food TG styringsflate header with 2026-05-21 status
- Beslutningsporter før ekstern bruk
- Kandidatkort
- Beslutningsgrunnlag using the 2026-05-21 control documents
- Reader journey og plattformflater
- Existing opportunity radar, sprint, claim board and stoppsignaler

- [ ] **Step 3: Stop dev server**

Stop the local dev server before final status unless the user explicitly wants it left running.
