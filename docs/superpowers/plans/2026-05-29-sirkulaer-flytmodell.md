# Sirkulær flytmodell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strukturer de 25 sirkulær-loopenes fritekst-flyt til typede, evidens-graderte noder+kanter (sidecar `material-flows.json`), og vis dem i en ny `flyt`-fane via eksisterende graf-/Sankey-infrastruktur.

**Architecture:** Rene funksjoner i `src/lib/flows/` (types, parse, validate, adapter) + et idempotent bootstrap-script som parser `circularity-loops.json` → `material-flows.json`. Kurering løfter `illustrative`-skjeletter til `estimated` med kilder. En adapter mapper til `NetworkMap` (primær graf, evidens-farget kant) og en tynn `FlowSankey` (kvantifisert magnitude). En guard-test håndhever flyt-integritet i `npm test`.

**Tech Stack:** Next.js 16, TypeScript, Recharts (`<Sankey>`), `react-force-graph-2d` (via `NetworkMap`), Node innebygd testrunner (`node --import=tsx --test`).

**Spec:** `docs/superpowers/specs/2026-05-29-sirkulaer-flytmodell-design.md`

**Verifiserte fakta (lest fra koden):**
- `src/lib/data/r-ladder.ts` eksporterer `type RLevel = 'R0'..'R9'`, `type ValueChainSlot` (`primary|processing|distribution|retail|horeca|household|seafood|waste`), og `rLadderById: Record<RLevel, RLadderStep>`.
- `src/lib/data/circularity-actor-map.ts` eksporterer `CIRCULARITY_ACTOR_MAP: Record<string, { type:'actor'|'company'; href:string }>` (nøkkel = aktør-visningsnavn).
- `src/lib/network-map.ts` eksporterer `NetworkNode { id, label, type, href?, valueChainStage?, stage?, evidenceStatus?, … }` og `NetworkEdge { id?, source, target, type, label?, evidenceStatus?, estimatedValue?, … }`. `evidenceStatus` aksepterer `EvidenceStatus` ('observed'|'estimated'|'proxy'|'illustrative').
- `src/components/charts/FoodFlowSankey.tsx` tar `{ country?: string }` og bygger Sankey internt fra `value-chain.json` — IKKE data-prop-drevet (derav ny `FlowSankey`). Bruker Recharts `<Sankey>` med `SankeyData = { nodes:{name}[], links:{source,target,value}[] }`.
- `src/components/charts/SupplyChainGraph.tsx` wrapper `<NetworkMap … />` (fra `@/components/network/NetworkMap`) med props `nodes, edges, presets, defaultPresetId, typeConfig, edgeLabels, edgeColors, maxRenderNodes, selectedEdgeId, selectedNodeId, onNodeSelect, inspectorLinkLabel, emptyTitle, emptyMessage`.
- `circularity-loops.json` loop-felt: `id, name, country, maturity, trl, rLevel, volume (string), value_chain_step (string[]), flow (string, «→»-delt), actors (string[]), policy_support, theme, sources (string[])`. Top-nivå: `{ generated, description, existing_loops[], gaps[], actor_cases{…} }`.
- `src/app/sirkularitet/SirkularitetContent.tsx`: `type Tab` (linje ~116) inkluderer i dag `'matrix'|'effekt'|'maturity'|'kpi'|'questions'|'loops'|'gaps'|'actors'|'naeringsflyt'`; tab-knapper rendres fra en array (linje ~277).

**Konvensjon:** moduler under `src/lib/flows/*` importeres av tester → bruk **relative** importer for både type og verdi. Komponenter/scripts kan bruke `@/`. Test enkeltfil: `node --import=tsx --test <fil>`.

---

### Task 1: Flyt-typer

**Files:** Create `src/lib/flows/types.ts`

- [ ] **Step 1: Skriv typefilen**

```ts
// src/lib/flows/types.ts
import type { EvidenceStatus, VisualizationSourceRef } from '../visualization/types'
import type { RLevel, ValueChainSlot } from '../data/r-ladder'

export type FlowNodeType = 'actor' | 'company' | 'location' | 'category' | 'process'

export type FlowNode = {
  id: string
  type: FlowNodeType
  label: string
  ref?: string
  valueChainStep?: ValueChainSlot
}

export type FlowQuantity = { value: number; unit: string }

export type FlowEdge = {
  id: string
  fromId: string
  toId: string
  material: string
  process?: string
  rLevel?: RLevel
  quantity?: FlowQuantity
  year?: number
  evidenceStatus: EvidenceStatus
  sourceRefs: VisualizationSourceRef[]
}

export type LoopFlows = { loopId: string; nodes: FlowNode[]; edges: FlowEdge[] }
export type MaterialFlowsFile = { generated: string; description: string; loops: LoopFlows[] }

export type FlowIssueCode =
  | 'observed_without_citable_source'
  | 'sourced_status_without_source'
  | 'quantity_without_unit'
  | 'dangling_node_ref'
  | 'invalid_rlevel'
  | 'unknown_actor_ref'
  | 'unknown_loop_id'

export type FlowIssue = {
  code: FlowIssueCode
  severity: 'blocking' | 'warning'
  loopId: string
  edgeId?: string
  message: string
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: ingen NYE feil (kjent pre-eksisterende `TS1501` i `tests/lib/insight-link-scripts.test.ts` ignoreres).

- [ ] **Step 3: Commit**

```bash
git add src/lib/flows/types.ts
git commit -m "feat(flows): FlowEdge/LoopFlows types (reuse EvidenceStatus + r-ladder)"
```

---

### Task 2: `parseVolume` (TDD)

**Files:** Create `src/lib/flows/parse.ts`; Test `tests/lib/flows/parse-volume.test.ts`

- [ ] **Step 1: Skriv den feilende testen**

```ts
// tests/lib/flows/parse-volume.test.ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { parseVolume } from '../../../src/lib/flows/parse'

describe('parseVolume', () => {
  it('parses number + compound unit, ignoring parenthetical', () => {
    assert.deepEqual(parseVolume('8100 GWh/yr (175 plants)'), { value: 8100, unit: 'GWh/yr' })
  })
  it('parses percent', () => {
    assert.deepEqual(parseVolume('92.3% return rate'), { value: 92.3, unit: '%' })
  })
  it('parses tilde + thousands separator', () => {
    assert.deepEqual(parseVolume('~800,000 tonnes processed/year'), { value: 800000, unit: 'tonnes' })
  })
  it('parses currency-like unit', () => {
    assert.deepEqual(parseVolume('300 MNOK invested'), { value: 300, unit: 'MNOK' })
  })
  it('returns undefined when no number+unit is found', () => {
    assert.equal(parseVolume('market-driven'), undefined)
    assert.equal(parseVolume(undefined), undefined)
  })
})
```

- [ ] **Step 2: Kjør for å bekrefte feil**

Run: `node --import=tsx --test tests/lib/flows/parse-volume.test.ts`
Expected: FAIL — `Cannot find module '.../parse'`.

- [ ] **Step 3: Implementer (parseVolume i ny parse.ts)**

```ts
// src/lib/flows/parse.ts
import type { FlowQuantity } from './types'

export function parseVolume(input: string | undefined): FlowQuantity | undefined {
  if (!input) return undefined

  const pct = input.match(/~?\s*(\d+(?:[.,]\d+)?)\s*%/)
  if (pct) return { value: Number(pct[1].replace(',', '.')), unit: '%' }

  const m = input.match(/~?\s*(\d[\d.,]*)\s*([A-Za-zøæåØÆÅ%][A-Za-zøæåØÆÅ%]*(?:\/[A-Za-zøæåØÆÅ]+)?)/)
  if (!m) return undefined

  const value = Number(m[1].replace(/,/g, ''))
  if (!Number.isFinite(value)) return undefined

  return { value, unit: m[2].trim() }
}
```

- [ ] **Step 4: Kjør for å bekrefte pass**

Run: `node --import=tsx --test tests/lib/flows/parse-volume.test.ts`
Expected: PASS (5 tester).

- [ ] **Step 5: Commit**

```bash
git add src/lib/flows/parse.ts tests/lib/flows/parse-volume.test.ts
git commit -m "feat(flows): parseVolume (best-effort number+unit from free text)"
```

---

### Task 3: `parseLoopFlow` (TDD)

**Files:** Modify `src/lib/flows/parse.ts`; Test `tests/lib/flows/parse-loop-flow.test.ts`

- [ ] **Step 1: Skriv den feilende testen**

```ts
// tests/lib/flows/parse-loop-flow.test.ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { parseLoopFlow } from '../../../src/lib/flows/parse'

describe('parseLoopFlow', () => {
  it('splits flow on arrows into nodes + chained edges, illustrative + no overclaim', () => {
    const result = parseLoopFlow({
      id: 'dk-biogas',
      rLevel: 'R9',
      volume: '8100 GWh/yr (175 plants)',
      value_chain_step: ['waste', 'primary'],
      flow: 'Food waste → anaerobic digestion → Nature Energy → agriculture',
      sources: ['IEA Bioenergy DK 2024', 'SA-02'],
    })
    assert.equal(result.loopId, 'dk-biogas')
    assert.equal(result.nodes.length, 4)
    assert.equal(result.edges.length, 3)
    // Nature Energy is in CIRCULARITY_ACTOR_MAP → actor node with ref
    const ne = result.nodes.find((n) => n.label === 'Nature Energy')
    assert.equal(ne?.type, 'actor')
    assert.equal(ne?.ref, '/aktorer/nature-energy-shell')
    // first node defaults to category, carries first value_chain_step
    assert.equal(result.nodes[0].type, 'category')
    assert.equal(result.nodes[0].valueChainStep, 'waste')
    // every edge is illustrative, rLevel inherited, sources copied
    assert.ok(result.edges.every((e) => e.evidenceStatus === 'illustrative'))
    assert.ok(result.edges.every((e) => e.rLevel === 'R9'))
    assert.deepEqual(result.edges[0].sourceRefs, [{ label: 'IEA Bioenergy DK 2024' }, { label: 'SA-02' }])
    // only the first edge carries the parsed quantity
    assert.deepEqual(result.edges[0].quantity, { value: 8100, unit: 'GWh/yr' })
    assert.equal(result.edges[1].quantity, undefined)
  })

  it('produces no edges for an empty flow', () => {
    const result = parseLoopFlow({ id: 'x', flow: '' })
    assert.deepEqual(result, { loopId: 'x', nodes: [], edges: [] })
  })
})
```

- [ ] **Step 2: Kjør for å bekrefte feil**

Run: `node --import=tsx --test tests/lib/flows/parse-loop-flow.test.ts`
Expected: FAIL — `parseLoopFlow` ikke eksportert.

- [ ] **Step 3: Implementer (legg til i `src/lib/flows/parse.ts`)**

Legg til imports øverst (relative — verdi-importer):

```ts
import { rLadderById } from '../data/r-ladder'
import { CIRCULARITY_ACTOR_MAP } from '../data/circularity-actor-map'
import type { RLevel, ValueChainSlot } from '../data/r-ladder'
import type { FlowEdge, FlowNode, LoopFlows } from './types'
```

Legg til funksjonen:

```ts
export type RawLoop = {
  id: string
  rLevel?: string
  volume?: string
  value_chain_step?: string[]
  flow?: string
  sources?: string[]
}

function nodeIdFrom(label: string, index: number): string {
  const base = label
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || `node-${index}`
}

export function parseLoopFlow(loop: RawLoop): LoopFlows {
  const segments = (loop.flow ?? '').split('→').map((s) => s.trim()).filter(Boolean)
  const rLevel: RLevel | undefined = loop.rLevel && loop.rLevel in rLadderById ? (loop.rLevel as RLevel) : undefined
  const valueChainStep = loop.value_chain_step?.[0] as ValueChainSlot | undefined
  const sourceRefs = (loop.sources ?? []).map((label) => ({ label }))
  const quantity = parseVolume(loop.volume)

  const seen = new Set<string>()
  const nodes: FlowNode[] = segments.map((label, i) => {
    let id = nodeIdFrom(label, i)
    let k = 1
    while (seen.has(id)) id = `${nodeIdFrom(label, i)}-${k++}`
    seen.add(id)
    const link = CIRCULARITY_ACTOR_MAP[label]
    return {
      id,
      type: link ? (link.type === 'company' ? 'company' : 'actor') : 'category',
      label,
      ...(link ? { ref: link.href } : {}),
      ...(valueChainStep ? { valueChainStep } : {}),
    }
  })

  const edges: FlowEdge[] = []
  for (let i = 0; i < nodes.length - 1; i += 1) {
    edges.push({
      id: `${loop.id}-e${i}`,
      fromId: nodes[i].id,
      toId: nodes[i + 1].id,
      material: nodes[i].label,
      ...(rLevel ? { rLevel } : {}),
      ...(i === 0 && quantity ? { quantity } : {}),
      evidenceStatus: 'illustrative',
      sourceRefs,
    })
  }

  return { loopId: loop.id, nodes, edges }
}
```

- [ ] **Step 4: Kjør for å bekrefte pass**

Run: `node --import=tsx --test tests/lib/flows/parse-loop-flow.test.ts`
Expected: PASS (2 tester).

- [ ] **Step 5: Commit**

```bash
git add src/lib/flows/parse.ts tests/lib/flows/parse-loop-flow.test.ts
git commit -m "feat(flows): parseLoopFlow (arrow-split skeletons, illustrative, no overclaim)"
```

---

### Task 4: Bootstrap-script

**Files:** Create `scripts/bootstrap-material-flows.ts`; Modify `package.json`

- [ ] **Step 1: Skriv scriptet**

```ts
// scripts/bootstrap-material-flows.ts
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { parseLoopFlow, type RawLoop } from '../src/lib/flows/parse'
import type { LoopFlows, MaterialFlowsFile } from '../src/lib/flows/types'

const ROOT = process.cwd()
const LOOPS_PATH = join(ROOT, 'public/data/food-systems/circularity-loops.json')
const OUT_PATH = join(ROOT, 'public/data/food-systems/material-flows.json')

function main() {
  const loopsFile = JSON.parse(readFileSync(LOOPS_PATH, 'utf8')) as { existing_loops: RawLoop[] }
  const loops = loopsFile.existing_loops ?? []

  let existing: MaterialFlowsFile = { generated: '', description: '', loops: [] }
  if (existsSync(OUT_PATH)) {
    existing = JSON.parse(readFileSync(OUT_PATH, 'utf8')) as MaterialFlowsFile
  }
  const curatedById = new Map<string, LoopFlows>(existing.loops.map((l) => [l.loopId, l]))

  let added = 0
  const out: LoopFlows[] = []
  for (const loop of loops) {
    if (curatedById.has(loop.id)) {
      out.push(curatedById.get(loop.id)!) // NEVER overwrite a curated loop
    } else {
      out.push(parseLoopFlow(loop))
      added += 1
    }
  }

  const result: MaterialFlowsFile = {
    generated: existing.generated || '2026-05-29',
    description:
      'Strukturerte materialstrømmer per sirkulær-loop (nøklet på loopId mot circularity-loops.json). Bootstrap-skjeletter er illustrative; kuratering løfter evidens + tall.',
    loops: out,
  }
  writeFileSync(OUT_PATH, JSON.stringify(result, null, 2))
  console.log(`material-flows.json: ${out.length} loops total, ${added} new skeletons added, ${out.length - added} curated preserved`)
}

main()
```

- [ ] **Step 2: Legg til npm-script**

I `package.json`, ved siden av `compute-file-coverage` (~linje 91):

```json
    "bootstrap-material-flows": "tsx scripts/bootstrap-material-flows.ts",
```

- [ ] **Step 3: Kjør scriptet**

Run: `npm run bootstrap-material-flows`
Expected: `material-flows.json: 25 loops total, 25 new skeletons added, 0 curated preserved` (tallet på looper kan variere med datafila). Bekreft at `public/data/food-systems/material-flows.json` finnes med en `loops`-array.

- [ ] **Step 4: Re-kjør for å bekrefte idempotens**

Run: `npm run bootstrap-material-flows`
Expected: `… 0 new skeletons added, 25 curated preserved` (ingenting overskrives andre gang).

- [ ] **Step 5: Commit**

```bash
git add scripts/bootstrap-material-flows.ts package.json public/data/food-systems/material-flows.json
git commit -m "feat(flows): bootstrap-material-flows script (idempotent-additive) + generated sidecar"
```

---

### Task 5: `validateMaterialFlows` (TDD)

**Files:** Create `src/lib/flows/validate.ts`; Test `tests/lib/flows/validate.test.ts`

- [ ] **Step 1: Skriv den feilende testen**

```ts
// tests/lib/flows/validate.test.ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { validateMaterialFlows } from '../../../src/lib/flows/validate'
import type { LoopFlows, MaterialFlowsFile } from '../../../src/lib/flows/types'

function loop(edges: LoopFlows['edges']): MaterialFlowsFile {
  return {
    generated: 'x',
    description: 'x',
    loops: [{ loopId: 'L', nodes: [{ id: 'a', type: 'category', label: 'A' }, { id: 'b', type: 'category', label: 'B' }], edges }],
  }
}

describe('validateMaterialFlows', () => {
  it('passes a clean illustrative edge', () => {
    const issues = validateMaterialFlows(loop([{ id: 'e0', fromId: 'a', toId: 'b', material: 'A', evidenceStatus: 'illustrative', sourceRefs: [] }]))
    assert.deepEqual(issues, [])
  })
  it('blocks observed without a citable source', () => {
    const issues = validateMaterialFlows(loop([{ id: 'e0', fromId: 'a', toId: 'b', material: 'A', evidenceStatus: 'observed', sourceRefs: [{ label: 'x' }] }]))
    assert.deepEqual(issues.map((i) => i.code), ['observed_without_citable_source'])
  })
  it('passes observed with a citable source', () => {
    const issues = validateMaterialFlows(loop([{ id: 'e0', fromId: 'a', toId: 'b', material: 'A', evidenceStatus: 'observed', sourceRefs: [{ label: 'x', url: 'https://x' }] }]))
    assert.deepEqual(issues, [])
  })
  it('blocks estimated without any source', () => {
    const issues = validateMaterialFlows(loop([{ id: 'e0', fromId: 'a', toId: 'b', material: 'A', evidenceStatus: 'estimated', sourceRefs: [] }]))
    assert.deepEqual(issues.map((i) => i.code), ['sourced_status_without_source'])
  })
  it('blocks quantity without unit', () => {
    const issues = validateMaterialFlows(loop([{ id: 'e0', fromId: 'a', toId: 'b', material: 'A', quantity: { value: 1, unit: '' }, evidenceStatus: 'illustrative', sourceRefs: [] }]))
    assert.deepEqual(issues.map((i) => i.code), ['quantity_without_unit'])
  })
  it('blocks a dangling endpoint', () => {
    const issues = validateMaterialFlows(loop([{ id: 'e0', fromId: 'a', toId: 'ghost', material: 'A', evidenceStatus: 'illustrative', sourceRefs: [] }]))
    assert.deepEqual(issues.map((i) => i.code), ['dangling_node_ref'])
  })
  it('blocks an invalid rLevel', () => {
    const issues = validateMaterialFlows(loop([{ id: 'e0', fromId: 'a', toId: 'b', material: 'A', rLevel: 'R99' as never, evidenceStatus: 'illustrative', sourceRefs: [] }]))
    assert.deepEqual(issues.map((i) => i.code), ['invalid_rlevel'])
  })
  it('flags an unknown loopId when knownLoopIds is supplied', () => {
    const issues = validateMaterialFlows(loop([{ id: 'e0', fromId: 'a', toId: 'b', material: 'A', evidenceStatus: 'illustrative', sourceRefs: [] }]), new Set(['OTHER']))
    assert.ok(issues.some((i) => i.code === 'unknown_loop_id'))
  })
})
```

- [ ] **Step 2: Kjør for å bekrefte feil**

Run: `node --import=tsx --test tests/lib/flows/validate.test.ts`
Expected: FAIL — modul mangler.

- [ ] **Step 3: Implementer**

```ts
// src/lib/flows/validate.ts
import { rLadderById } from '../data/r-ladder'
import { CIRCULARITY_ACTOR_MAP } from '../data/circularity-actor-map'
import type { VisualizationSourceRef } from '../visualization/types'
import type { FlowIssue, MaterialFlowsFile } from './types'

const KNOWN_HREFS = new Set(Object.values(CIRCULARITY_ACTOR_MAP).map((l) => l.href))

function isCitable(refs: VisualizationSourceRef[]): boolean {
  return refs.some(
    (r) => r.citationReadiness === 'citable_external' || r.citationReadiness === 'citable_with_note' || !!r.url || !!r.path,
  )
}

export function validateMaterialFlows(file: MaterialFlowsFile, knownLoopIds?: Set<string>): FlowIssue[] {
  const issues: FlowIssue[] = []
  for (const loop of file.loops) {
    if (knownLoopIds && !knownLoopIds.has(loop.loopId)) {
      issues.push({ code: 'unknown_loop_id', severity: 'blocking', loopId: loop.loopId, message: `loopId "${loop.loopId}" not in circularity-loops.json` })
    }
    const nodeIds = new Set(loop.nodes.map((n) => n.id))
    for (const n of loop.nodes) {
      if (n.ref && !KNOWN_HREFS.has(n.ref)) {
        issues.push({ code: 'unknown_actor_ref', severity: 'warning', loopId: loop.loopId, message: `node ref "${n.ref}" not in CIRCULARITY_ACTOR_MAP` })
      }
    }
    for (const e of loop.edges) {
      if (!nodeIds.has(e.fromId) || !nodeIds.has(e.toId)) {
        issues.push({ code: 'dangling_node_ref', severity: 'blocking', loopId: loop.loopId, edgeId: e.id, message: `edge "${e.id}" endpoints must resolve to nodes in the same loop` })
      }
      if (e.quantity && !e.quantity.unit.trim()) {
        issues.push({ code: 'quantity_without_unit', severity: 'blocking', loopId: loop.loopId, edgeId: e.id, message: `edge "${e.id}" quantity requires a unit` })
      }
      if (e.rLevel && !(e.rLevel in rLadderById)) {
        issues.push({ code: 'invalid_rlevel', severity: 'blocking', loopId: loop.loopId, edgeId: e.id, message: `edge "${e.id}" has invalid rLevel "${e.rLevel}"` })
      }
      if (e.evidenceStatus === 'observed' && !isCitable(e.sourceRefs)) {
        issues.push({ code: 'observed_without_citable_source', severity: 'blocking', loopId: loop.loopId, edgeId: e.id, message: `edge "${e.id}" is observed but has no citable source` })
      }
      if ((e.evidenceStatus === 'estimated' || e.evidenceStatus === 'proxy') && e.sourceRefs.length === 0) {
        issues.push({ code: 'sourced_status_without_source', severity: 'blocking', loopId: loop.loopId, edgeId: e.id, message: `edge "${e.id}" is ${e.evidenceStatus} but has no source` })
      }
    }
  }
  return issues
}
```

- [ ] **Step 4: Kjør for å bekrefte pass**

Run: `node --import=tsx --test tests/lib/flows/validate.test.ts`
Expected: PASS (8 tester).

- [ ] **Step 5: Commit**

```bash
git add src/lib/flows/validate.ts tests/lib/flows/validate.test.ts
git commit -m "feat(flows): validateMaterialFlows integrity rules"
```

---

### Task 6: `toNetwork` adapter (TDD)

**Files:** Create `src/lib/flows/adapter.ts`; Test `tests/lib/flows/adapter-network.test.ts`

- [ ] **Step 1: Skriv den feilende testen**

```ts
// tests/lib/flows/adapter-network.test.ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { toNetwork } from '../../../src/lib/flows/adapter'
import type { LoopFlows } from '../../../src/lib/flows/types'

const loops: LoopFlows[] = [
  {
    loopId: 'L1',
    nodes: [
      { id: 'a', type: 'category', label: 'Matavfall', valueChainStep: 'waste' },
      { id: 'b', type: 'actor', label: 'Nature Energy', ref: '/aktorer/nature-energy-shell' },
    ],
    edges: [
      { id: 'L1-e0', fromId: 'a', toId: 'b', material: 'matavfall', rLevel: 'R9', quantity: { value: 8100, unit: 'GWh/yr' }, evidenceStatus: 'estimated', sourceRefs: [{ label: 'x' }] },
    ],
  },
]

describe('toNetwork', () => {
  it('maps loop nodes/edges to NetworkNode/NetworkEdge, namespaced by loopId, evidence-typed', () => {
    const { nodes, edges } = toNetwork(loops)
    assert.equal(nodes.length, 2)
    assert.deepEqual(
      nodes.map((n) => n.id),
      ['L1:a', 'L1:b'],
    )
    assert.equal(nodes[1].href, '/aktorer/nature-energy-shell')
    assert.equal(nodes[0].valueChainStage, 'waste')
    assert.equal(edges.length, 1)
    assert.deepEqual({ source: edges[0].source, target: edges[0].target }, { source: 'L1:a', target: 'L1:b' })
    assert.equal(edges[0].type, 'estimated') // edge type = evidenceStatus → color by evidence
    assert.equal(edges[0].evidenceStatus, 'estimated')
    assert.equal(edges[0].estimatedValue, 8100)
    assert.match(edges[0].label ?? '', /matavfall/)
    assert.match(edges[0].label ?? '', /R9/)
  })
})
```

- [ ] **Step 2: Kjør for å bekrefte feil**

Run: `node --import=tsx --test tests/lib/flows/adapter-network.test.ts`
Expected: FAIL — modul mangler.

- [ ] **Step 3: Implementer**

```ts
// src/lib/flows/adapter.ts
import type { NetworkEdge, NetworkNode } from '../network-map'
import type { LoopFlows } from './types'

export function toNetwork(loops: LoopFlows[]): { nodes: NetworkNode[]; edges: NetworkEdge[] } {
  const nodes: NetworkNode[] = []
  const edges: NetworkEdge[] = []
  const seen = new Set<string>()

  for (const loop of loops) {
    for (const n of loop.nodes) {
      const gid = `${loop.loopId}:${n.id}`
      if (seen.has(gid)) continue
      seen.add(gid)
      nodes.push({
        id: gid,
        label: n.label,
        type: n.type,
        stage: 'circular',
        valueChainStage: n.valueChainStep ?? null,
        ...(n.ref ? { href: n.ref } : {}),
      })
    }
    for (const e of loop.edges) {
      edges.push({
        id: e.id,
        source: `${loop.loopId}:${e.fromId}`,
        target: `${loop.loopId}:${e.toId}`,
        type: e.evidenceStatus, // color/group by evidence
        label: e.rLevel ? `${e.material} · ${e.rLevel}` : e.material,
        evidenceStatus: e.evidenceStatus,
        ...(e.quantity ? { estimatedValue: e.quantity.value } : {}),
      })
    }
  }
  return { nodes, edges }
}
```

- [ ] **Step 4: Kjør for å bekrefte pass**

Run: `node --import=tsx --test tests/lib/flows/adapter-network.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/flows/adapter.ts tests/lib/flows/adapter-network.test.ts
git commit -m "feat(flows): toNetwork adapter (NetworkNode/Edge, evidence-typed)"
```

---

### Task 7: `toSankey` adapter (TDD, syklus-sikker)

**Files:** Modify `src/lib/flows/adapter.ts`; Test `tests/lib/flows/adapter-sankey.test.ts`

- [ ] **Step 1: Skriv den feilende testen**

```ts
// tests/lib/flows/adapter-sankey.test.ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { toSankey } from '../../../src/lib/flows/adapter'
import type { LoopFlows } from '../../../src/lib/flows/types'

const q = (v: number) => ({ value: v, unit: 't/yr' })

describe('toSankey', () => {
  it('includes only quantified edges and dedupes nodes by label', () => {
    const loops: LoopFlows[] = [
      { loopId: 'L', nodes: [
        { id: 'a', type: 'category', label: 'A' },
        { id: 'b', type: 'category', label: 'B' },
        { id: 'c', type: 'category', label: 'C' },
      ], edges: [
        { id: 'e0', fromId: 'a', toId: 'b', material: 'A', quantity: q(10), evidenceStatus: 'estimated', sourceRefs: [{ label: 'x' }] },
        { id: 'e1', fromId: 'b', toId: 'c', material: 'B', evidenceStatus: 'illustrative', sourceRefs: [] }, // no quantity → excluded
      ] },
    ]
    const { nodes, links } = toSankey(loops)
    assert.deepEqual(nodes, [{ name: 'A' }, { name: 'B' }])
    assert.deepEqual(links, [{ source: 0, target: 1, value: 10 }])
  })

  it('drops a quantified edge that would create a cycle', () => {
    const loops: LoopFlows[] = [
      { loopId: 'L', nodes: [
        { id: 'a', type: 'category', label: 'A' },
        { id: 'b', type: 'category', label: 'B' },
      ], edges: [
        { id: 'e0', fromId: 'a', toId: 'b', material: 'A', quantity: q(5), evidenceStatus: 'estimated', sourceRefs: [{ label: 'x' }] },
        { id: 'e1', fromId: 'b', toId: 'a', material: 'B', quantity: q(5), evidenceStatus: 'estimated', sourceRefs: [{ label: 'x' }] }, // closes cycle → dropped
      ] },
    ]
    const { links } = toSankey(loops)
    assert.deepEqual(links, [{ source: 0, target: 1, value: 5 }])
  })
})
```

- [ ] **Step 2: Kjør for å bekrefte feil**

Run: `node --import=tsx --test tests/lib/flows/adapter-sankey.test.ts`
Expected: FAIL — `toSankey` ikke eksportert.

- [ ] **Step 3: Implementer (legg til i `src/lib/flows/adapter.ts`)**

```ts
export type SankeyData = { nodes: { name: string }[]; links: { source: number; target: number; value: number }[] }

function reaches(adj: Map<number, number[]>, from: number, to: number): boolean {
  const stack = [from]
  const visited = new Set<number>()
  while (stack.length) {
    const cur = stack.pop()!
    if (cur === to) return true
    if (visited.has(cur)) continue
    visited.add(cur)
    for (const next of adj.get(cur) ?? []) stack.push(next)
  }
  return false
}

export function toSankey(loops: LoopFlows[]): SankeyData {
  const nodes: { name: string }[] = []
  const idx = new Map<string, number>()
  const adj = new Map<number, number[]>()
  const links: { source: number; target: number; value: number }[] = []

  const addNode = (name: string): number => {
    const existing = idx.get(name)
    if (existing !== undefined) return existing
    nodes.push({ name })
    idx.set(name, nodes.length - 1)
    return nodes.length - 1
  }

  for (const loop of loops) {
    const labelById = new Map(loop.nodes.map((n) => [n.id, n.label]))
    for (const e of loop.edges) {
      if (!e.quantity) continue
      const s = addNode(labelById.get(e.fromId) ?? e.fromId)
      const t = addNode(labelById.get(e.toId) ?? e.toId)
      if (s === t) continue
      if (reaches(adj, t, s)) continue // would create a cycle → drop closing edge (Sankey is acyclic)
      links.push({ source: s, target: t, value: e.quantity.value })
      adj.set(s, [...(adj.get(s) ?? []), t])
    }
  }
  return { nodes, links }
}
```

- [ ] **Step 4: Kjør for å bekrefte pass**

Run: `node --import=tsx --test tests/lib/flows/adapter-sankey.test.ts`
Expected: PASS (2 tester).

- [ ] **Step 5: Commit**

```bash
git add src/lib/flows/adapter.ts tests/lib/flows/adapter-sankey.test.ts
git commit -m "feat(flows): toSankey adapter (quantified-only, acyclic-safe)"
```

---

### Task 8: `FlowSankey`-komponent

**Files:** Create `src/components/charts/FlowSankey.tsx`

- [ ] **Step 1: Skriv komponenten** (gjenbruker Recharts `<Sankey>`-mønsteret fra `FoodFlowSankey`, men tar `data` som prop)

```tsx
// src/components/charts/FlowSankey.tsx
'use client'

import { Sankey, Tooltip, ResponsiveContainer } from 'recharts'
import { EmptyState } from '@/components/ui/EmptyState'
import type { SankeyData } from '@/lib/flows/adapter'

export function FlowSankey({ data }: { data: SankeyData }) {
  if (data.links.length < 2) {
    return <EmptyState message="For få kvantifiserte kanter til et Sankey-diagram" />
  }
  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 720, height: 360 }}>
        <Sankey
          data={data}
          nodeWidth={10}
          nodePadding={14}
          margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
          link={{ stroke: '#d6d3d1', strokeOpacity: 0.4 }}
          node={{ fill: '#57534e', opacity: 0.9 }}
        >
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0]?.payload
              if (!d) return null
              if (d.source !== undefined && d.target !== undefined) {
                return (
                  <div className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs shadow-sm">
                    <p>{data.nodes[d.source]?.name} &rarr; {data.nodes[d.target]?.name}</p>
                    <p className="font-medium">{d.value?.toLocaleString()}</p>
                  </div>
                )
              }
              return (
                <div className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs shadow-sm">
                  <p className="font-medium">{d.name}</p>
                </div>
              )
            }}
          />
        </Sankey>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: ingen nye feil.

- [ ] **Step 3: Commit**

```bash
git add src/components/charts/FlowSankey.tsx
git commit -m "feat(flows): FlowSankey (data-prop Recharts Sankey)"
```

---

### Task 9: `MaterialFlowTab` + `flyt`-fane

**Files:** Create `src/components/charts/MaterialFlowTab.tsx`; Modify `src/app/sirkularitet/SirkularitetContent.tsx`

- [ ] **Step 1: Skriv `MaterialFlowTab`**

```tsx
// src/components/charts/MaterialFlowTab.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { NetworkMap, type NetworkTypeConfig } from '@/components/network/NetworkMap'
import { FlowSankey } from '@/components/charts/FlowSankey'
import { toNetwork, toSankey } from '@/lib/flows/adapter'
import type { MaterialFlowsFile } from '@/lib/flows/types'
import type { NetworkPreset } from '@/lib/network-map'

const TYPE_CONFIG: Record<string, NetworkTypeConfig> = {
  actor: { label: 'Aktør', color: '#0ea5e9', size: 7 },
  company: { label: 'Selskap', color: '#78716c', size: 7 },
  location: { label: 'Sted', color: '#8b5cf6', size: 6 },
  category: { label: 'Kategori', color: '#a8a29e', size: 6 },
  process: { label: 'Prosess', color: '#f59e0b', size: 6 },
}

const EVIDENCE_COLORS: Record<string, string> = {
  observed: '#059669',
  estimated: '#d97706',
  proxy: '#0284c7',
  illustrative: '#a8a29e',
}

const PRESETS: NetworkPreset[] = [
  {
    id: 'all',
    label: 'Alle strømmer',
    description: 'Alle materialstrømmer, farget etter evidensgrad.',
    edgeTypes: ['observed', 'estimated', 'proxy', 'illustrative'],
    showIsolated: true,
  },
]

export function MaterialFlowTab() {
  const [file, setFile] = useState<MaterialFlowsFile | null>(null)
  const [loopId, setLoopId] = useState<string>('all')

  useEffect(() => {
    fetch('/data/food-systems/material-flows.json')
      .then((r) => r.json())
      .then(setFile)
      .catch(() => setFile(null))
  }, [])

  const selectedLoops = useMemo(() => {
    if (!file) return []
    return loopId === 'all' ? file.loops : file.loops.filter((l) => l.loopId === loopId)
  }, [file, loopId])

  const network = useMemo(() => toNetwork(selectedLoops), [selectedLoops])
  const sankey = useMemo(() => toSankey(selectedLoops), [selectedLoops])

  if (!file || file.loops.length === 0) {
    return <EmptyState message="Ingen materialstrømmer ennå — kjør `npm run bootstrap-material-flows`." />
  }

  return (
    <div className="space-y-4">
      <Card className="bg-stone-50 border-stone-200">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
            Strukturerte materialstrømmer per loop. Kant-farge = evidensgrad
            <span className="text-emerald-700"> observed</span>,
            <span className="text-amber-700"> estimated</span>,
            <span className="text-sky-700"> proxy</span>,
            <span className="text-stone-500"> illustrative</span>. Sankey viser kun kvantifiserte strømmer.
          </p>
          <select
            value={loopId}
            onChange={(e) => setLoopId(e.target.value)}
            className="text-xs border border-stone-300 rounded-lg px-2 py-1 bg-white"
          >
            <option value="all">Alle looper ({file.loops.length})</option>
            {file.loops.map((l) => (
              <option key={l.loopId} value={l.loopId}>{l.loopId}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden" >
        <div className="h-[480px]">
          <NetworkMap
            nodes={network.nodes}
            edges={network.edges}
            presets={PRESETS}
            defaultPresetId="all"
            typeConfig={TYPE_CONFIG}
            edgeColors={EVIDENCE_COLORS}
            maxRenderNodes={500}
            inspectorLinkLabel="Åpne side"
            emptyTitle="Ingen strømmer"
            emptyMessage="Velg en annen loop, eller kjør bootstrap-scriptet."
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-2">Kvantifiserte strømmer (Sankey)</h3>
        <FlowSankey data={sankey} />
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Legg til `flyt`-fanen i `SirkularitetContent.tsx`**

(a) Legg til import øverst (ved de andre chart-importene):
```ts
import { MaterialFlowTab } from '@/components/charts/MaterialFlowTab'
```

(b) Utvid `Tab`-typen (linje ~116) — legg til `'flyt'`:
```ts
type Tab = 'matrix' | 'effekt' | 'maturity' | 'kpi' | 'questions' | 'loops' | 'gaps' | 'actors' | 'naeringsflyt' | 'flyt'
```

(c) Legg `'flyt'` i tab-knapp-arrayen (linje ~277, listen `(['matrix', …, 'naeringsflyt'] as Tab[])`) — legg `'flyt'` sist, og legg til en label-linje sammen med de andre `{t === '…' && \`…\`}`:
```tsx
            {t === 'flyt' && `Materialflyt`}
```

(d) Legg til render-blokken (ved siden av de andre `{tab === '…' && (…)}`):
```tsx
      {tab === 'flyt' && <MaterialFlowTab />}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: ingen nye feil. (Hvis `NetworkMap`/`NetworkTypeConfig`-props avviker fra bruken i `SupplyChainGraph.tsx`, juster propsene til å matche den filen — den er fasit for `NetworkMap`-kontrakten.)

- [ ] **Step 4: Commit**

```bash
git add src/components/charts/MaterialFlowTab.tsx src/app/sirkularitet/SirkularitetContent.tsx
git commit -m "feat(flows): materialflyt tab (NetworkMap + FlowSankey, evidence-colored)"
```

---

### Task 10: Kurer de whitepaper-relevante loopene (regelbasert førstepass)

**Files:** Modify `public/data/food-systems/material-flows.json`

Deterministisk, ærlig førstepass — ingen domeneskjønn, ingen `observed`:

- [ ] **Step 1: Finn målloopene**

Loopene referert av `src/lib/data/circular-leverage.ts` via `relatedLoopIds` (les fila; samle alle `relatedLoopIds`-verdier til et sett, ~10 unike).

- [ ] **Step 2: For hver målloop i `material-flows.json`, anvend reglene**

For hver kant i disse loopene som i dag er `evidenceStatus: 'illustrative'` OG hvor loopens `sourceRefs` er ikke-tom:
- sett `evidenceStatus: 'estimated'` (IKKE `observed` — det krever menneske-verifisert citerbar kilde).
- behold `sourceRefs` (allerede kopiert fra loopens `sources`).
Kanter uten kilder, og alle øvrige looper, forblir `illustrative`. Ikke sett `quantity` manuelt med mindre `volume` ga en trygg verdi (allerede satt av bootstrap).

- [ ] **Step 3: Verifiser at guard fortsatt passerer**

Run: `node --import=tsx --test tests/lib/flows/validate.test.ts` (enhetstest) — skal være grønn.
Run: `npm run bootstrap-material-flows` — skal nå rapportere `0 new skeletons added` (alt bevart), og IKKE overskrive kureringen.

- [ ] **Step 4: Commit**

```bash
git add public/data/food-systems/material-flows.json
git commit -m "chore(flows): curate whitepaper-relevant loops to estimated (sourced)"
```

---

### Task 11: Guard-test + full kjøring

**Files:** Create `tests/lib/flows/guard.test.ts`

- [ ] **Step 1: Skriv guard-testen**

```ts
// tests/lib/flows/guard.test.ts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { validateMaterialFlows } from '../../../src/lib/flows/validate'
import type { MaterialFlowsFile } from '../../../src/lib/flows/types'

const ROOT = process.cwd()

function readJson<T>(rel: string): T {
  return JSON.parse(readFileSync(join(ROOT, rel), 'utf8')) as T
}

describe('material-flows guard', () => {
  it('committed material-flows.json has no blocking integrity issues', () => {
    const file = readJson<MaterialFlowsFile>('public/data/food-systems/material-flows.json')
    const loopsFile = readJson<{ existing_loops: { id: string }[] }>('public/data/food-systems/circularity-loops.json')
    const knownLoopIds = new Set(loopsFile.existing_loops.map((l) => l.id))
    const blocking = validateMaterialFlows(file, knownLoopIds).filter((i) => i.severity === 'blocking')
    assert.deepEqual(blocking, [])
  })
})
```

- [ ] **Step 2: Kjør guard-testen**

Run: `node --import=tsx --test tests/lib/flows/guard.test.ts`
Expected: PASS (skjeletter er illustrative → ingen krav; kuraterte er estimated MED kilder → passerer).

- [ ] **Step 3: Kjør hele testsuiten**

Run: `npm test`
Expected: alle tester grønne. Coverage/flows-suitene (parse-volume, parse-loop-flow, validate, adapter-network, adapter-sankey, guard) skal alle passere; ingen pre-eksisterende suite skal feile pga. dette arbeidet (kjent urelatert `TS1501` i `tests/lib/insight-link-scripts.test.ts` påvirker ikke `npm test`).

- [ ] **Step 4: Sluttsjekk**

Run: `npx tsc --noEmit`
Expected: kun den pre-eksisterende `TS1501`-feilen; ingen nye.

- [ ] **Step 5: Commit**

```bash
git add tests/lib/flows/guard.test.ts
git commit -m "test(flows): guard over committed material-flows.json"
```

---

## Self-review (utført av planforfatter)

**1. Spec-dekning:**

| Spec-seksjon | Oppgave |
|---|---|
| 3.1 Flyt-modell + sidecar | Task 1 |
| 3.2 Bootstrap-parser + kurering | Task 2, 3, 4, 10 |
| 3.3 Adapter + visualisering | Task 6, 7, 8, 9 |
| 3.4 Integritets-guard | Task 5, 11 |
| §5 Juni-omfang (alle 25 + kurer ~10) | Task 4 (alle 25) + Task 10 (kurer leverage-loopene) |
| §6 Edge cases (sykler, ukvantifiserte, dinglende, illustrative, tom fil) | Task 7 (sykkel/ukvantifisert), Task 5 (dinglende), Task 3 (illustrative), Task 9 (tom-tilstand) |
| §7 Testing (test-først + guard) | Task 2,3,5,6,7,11 |

**2. Placeholder-skann:** Ingen TBD/TODO; alle kodesteg har komplett kode + eksakte kommandoer/forventet output. Tre spec-avvik er eksplisitt korrigert i planen (ValueChainSlot-navn; FlowSankey i stedet for direkte FoodFlowSankey; NetworkMap i stedet for SupplyChainGraph) — disse er trofaste mot designets «gjenbruk eksisterende viz».

**3. Type-konsistens:** `FlowNode/FlowEdge/LoopFlows/MaterialFlowsFile/FlowIssue` (Task 1) brukes uendret i parse (2,3), validate (5), adapter (6,7), guard (11). `SankeyData` defineres i adapter (Task 7) og konsumeres av FlowSankey (Task 8) + MaterialFlowTab (9). `toNetwork`/`toSankey` signaturer matcher MaterialFlowTab-bruken. `parseVolume` (2) brukes av `parseLoopFlow` (3) i samme fil. Relative-import-regelen holdt for alle test-importerte moduler (`flows/*`, med relative verdi-importer av `../data/r-ladder` og `../data/circularity-actor-map`).

**Merk for utfører:** `NetworkMap`-propsene i Task 9 er utledet fra `SupplyChainGraph.tsx`. Hvis `@/components/network/NetworkMap` har en litt annen signatur, er `SupplyChainGraph.tsx` fasit — juster `MaterialFlowTab`-propsene til å matche den (typecheck fanger avvik).
