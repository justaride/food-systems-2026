# Reader-layer Completeness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lukk det gjenstående gapet i reader-laget: spørsmålsstyrte graf-presets, `PageFraming` på 4 event-vendte sider, og kart-H1.

**Architecture:** Ren testet hjelpefunksjon `deriveGraphPreset` filtrerer node/edge-sett per preset; en client-wrapper `GraphPresetView` holder valgt preset og rendrer eksisterende `KnowledgeGraph` med filtrert sett. `KnowledgeGraph` røres ikke. `PageFraming` er en eksisterende komponent som gjenbrukes.

**Tech Stack:** Next.js (App Router), React (client components), TypeScript, `node:test` for enhetstester, Tailwind.

**Spec:** `docs/superpowers/specs/2026-06-08-reader-layer-completeness-design.md`

---

## File Structure

| Fil | Ansvar |
|---|---|
| `src/lib/graph/preset.ts` (ny) | Preset-katalog + ren `deriveGraphPreset`-filtrering |
| `tests/lib/graph/preset.test.ts` (ny) | TDD for `deriveGraphPreset` |
| `src/components/charts/GraphPresetView.tsx` (ny) | Client-wrapper: knapperad + valgt preset + `KnowledgeGraph` |
| `src/app/graf/page.tsx` (endre) | Bytt `KnowledgeGraph` → `GraphPresetView` |
| `src/app/verdikjede/VerdikjedeContent.tsx` (endre) | Legg til `PageFraming` |
| `src/app/sirkularitet/SirkularitetContent.tsx` (endre) | Legg til `PageFraming` |
| `src/app/eierskap/EierskapContent.tsx` (endre) | Legg til `PageFraming` |
| `src/app/kart/page.tsx` (endre) | `sr-only` H1 (+ kondensert framing hvis layout tillater) |

Datatyper (eksisterende, `src/lib/queries/graph.ts`):
- `GraphNode = { id: string; label: string; type: 'document'|'insight'|'thesis'|'company'|'source'|'actor'|'person'|'property'; href?; tags? }`
- `GraphEdge = { source: string; target: string; type: string; confidence?: number /* 0..1 */ }`

---

## Task 1: `deriveGraphPreset` + preset-katalog (TDD)

**Files:**
- Create: `src/lib/graph/preset.ts`
- Test: `tests/lib/graph/preset.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/lib/graph/preset.test.ts`:

```ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { deriveGraphPreset } from '../../../src/lib/graph/preset'
import type { GraphNode, GraphEdge } from '../../../src/lib/queries/graph'

const n = (id: string, type: GraphNode['type']): GraphNode => ({ id, label: id, type })
const e = (source: string, target: string, type = 'rel', confidence?: number): GraphEdge =>
  confidence === undefined ? { source, target, type } : { source, target, type, confidence }

describe('deriveGraphPreset', () => {
  it('sentrale: keeps the top-N nodes by degree and edges between them', () => {
    const nodes = ['A', 'B', 'C', 'D', 'E'].map((id) => n(id, 'company'))
    const edges = [e('A', 'B'), e('A', 'C'), e('A', 'D'), e('A', 'E'), e('B', 'C'), e('B', 'D')]
    // degrees: A=4, B=3, C=2, D=2, E=1 → top 2 = A,B
    const out = deriveGraphPreset(nodes, edges, 'sentrale', 2)
    assert.deepEqual(out.nodes.map((x) => x.id).sort(), ['A', 'B'])
    assert.deepEqual(out.edges, [e('A', 'B')])
  })

  it('eierskap: keeps company/person/property subgraph, drops actor', () => {
    const nodes = [n('c1', 'company'), n('p1', 'person'), n('a1', 'actor'), n('pr1', 'property')]
    const edges = [e('p1', 'c1', 'person-role'), e('a1', 'c1', 'company-link'), e('c1', 'pr1', 'owns-property')]
    const out = deriveGraphPreset(nodes, edges, 'eierskap')
    assert.deepEqual(out.nodes.map((x) => x.id).sort(), ['c1', 'p1', 'pr1'])
    assert.equal(out.edges.some((x) => x.source === 'a1' || x.target === 'a1'), false)
  })

  it('forsyning: keeps company/actor subgraph, drops person/property', () => {
    const nodes = [n('c1', 'company'), n('p1', 'person'), n('a1', 'actor'), n('pr1', 'property')]
    const edges = [e('p1', 'c1', 'person-role'), e('a1', 'c1', 'company-link'), e('c1', 'pr1', 'owns-property')]
    const out = deriveGraphPreset(nodes, edges, 'forsyning')
    assert.deepEqual(out.nodes.map((x) => x.id).sort(), ['a1', 'c1'])
    assert.deepEqual(out.edges, [e('a1', 'c1', 'company-link')])
  })

  it('evidensgap: keeps edges with low or unknown confidence + their endpoints', () => {
    const nodes = ['A', 'B', 'C', 'D'].map((id) => n(id, 'company'))
    const edges = [e('A', 'B', 'rel', 0.9), e('B', 'C', 'rel', 0.3), e('C', 'D', 'rel')]
    const out = deriveGraphPreset(nodes, edges, 'evidensgap')
    assert.deepEqual(out.edges.map((x) => `${x.source}-${x.target}`), ['B-C', 'C-D'])
    assert.deepEqual(out.nodes.map((x) => x.id).sort(), ['B', 'C', 'D'])
  })

  it('unknown preset returns the input unchanged', () => {
    const nodes = [n('A', 'company')]
    const edges = [e('A', 'A')]
    const out = deriveGraphPreset(nodes, edges, 'foo' as never)
    assert.deepEqual(out, { nodes, edges })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --import=tsx --test tests/lib/graph/preset.test.ts`
Expected: FAIL with `MODULE_NOT_FOUND` for `src/lib/graph/preset` (module not created yet).

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/graph/preset.ts`:

```ts
import type { GraphNode, GraphEdge } from '@/lib/queries/graph'

export type GraphPresetId = 'sentrale' | 'eierskap' | 'forsyning' | 'evidensgap'

export type GraphPreset = { id: GraphPresetId; label: string; hint: string }

export const GRAPH_PRESETS: GraphPreset[] = [
  { id: 'sentrale', label: 'Mest sentrale', hint: 'De mest tilkoblede nodene — start her for å unngå hele nettverket på én gang.' },
  { id: 'eierskap', label: 'Makt & eierskap', hint: 'Selskaper, personer og eiendom — eierstruktur og styrekryss.' },
  { id: 'forsyning', label: 'Forsyning', hint: 'Selskaper og aktører — forsynings- og forretningsrelasjoner.' },
  { id: 'evidensgap', label: 'Evidensgap', hint: 'Koblinger som mangler eller har lav kildekonfidens (< 0.5).' },
]

export const DEFAULT_GRAPH_PRESET: GraphPresetId = 'sentrale'

const SUBGRAPH_TYPES: Record<'eierskap' | 'forsyning', GraphNode['type'][]> = {
  eierskap: ['company', 'person', 'property'],
  forsyning: ['company', 'actor'],
}

const EVIDENCE_THRESHOLD = 0.5

function keepConnected(nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
  const withEdge = new Set<string>()
  for (const edge of edges) {
    withEdge.add(edge.source)
    withEdge.add(edge.target)
  }
  return nodes.filter((node) => withEdge.has(node.id))
}

export function deriveGraphPreset(
  nodes: GraphNode[],
  edges: GraphEdge[],
  presetId: GraphPresetId,
  topN = 80,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  if (presetId === 'sentrale') {
    const degree = new Map<string, number>()
    for (const edge of edges) {
      degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1)
      degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1)
    }
    const topIds = new Set(
      [...nodes]
        .sort((a, b) => (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0))
        .slice(0, topN)
        .map((node) => node.id),
    )
    const keptEdges = edges.filter((edge) => topIds.has(edge.source) && topIds.has(edge.target))
    const keptNodes = nodes.filter((node) => topIds.has(node.id))
    return { nodes: keepConnected(keptNodes, keptEdges), edges: keptEdges }
  }

  if (presetId === 'evidensgap') {
    const keptEdges = edges.filter((edge) => edge.confidence === undefined || edge.confidence < EVIDENCE_THRESHOLD)
    const endpoints = new Set<string>()
    for (const edge of keptEdges) {
      endpoints.add(edge.source)
      endpoints.add(edge.target)
    }
    return { nodes: nodes.filter((node) => endpoints.has(node.id)), edges: keptEdges }
  }

  const allowed = SUBGRAPH_TYPES[presetId]
  if (!allowed) return { nodes, edges }

  const allowedSet = new Set(allowed)
  const keptNodeIds = new Set(nodes.filter((node) => allowedSet.has(node.type)).map((node) => node.id))
  const keptEdges = edges.filter((edge) => keptNodeIds.has(edge.source) && keptNodeIds.has(edge.target))
  const keptNodes = nodes.filter((node) => keptNodeIds.has(node.id))
  return { nodes: keepConnected(keptNodes, keptEdges), edges: keptEdges }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --import=tsx --test tests/lib/graph/preset.test.ts`
Expected: PASS — 5 tests, 0 fail.

- [ ] **Step 5: Commit**

```bash
git add src/lib/graph/preset.ts tests/lib/graph/preset.test.ts
git commit -m "feat(graf): deriveGraphPreset helper + preset-katalog (TDD)"
```

---

## Task 2: `GraphPresetView` client-wrapper

**Files:**
- Create: `src/components/charts/GraphPresetView.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/charts/GraphPresetView.tsx`:

```tsx
'use client'

import { useMemo, useState } from 'react'
import { KnowledgeGraph } from '@/components/charts/KnowledgeGraph'
import {
  deriveGraphPreset,
  GRAPH_PRESETS,
  DEFAULT_GRAPH_PRESET,
  type GraphPresetId,
} from '@/lib/graph/preset'
import type { GraphNode, GraphEdge } from '@/lib/queries/graph'

export function GraphPresetView({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const [preset, setPreset] = useState<GraphPresetId>(DEFAULT_GRAPH_PRESET)
  const view = useMemo(() => deriveGraphPreset(nodes, edges, preset), [nodes, edges, preset])
  const activeHint = GRAPH_PRESETS.find((p) => p.id === preset)?.hint

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {GRAPH_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreset(p.id)}
            title={p.hint}
            aria-pressed={preset === p.id}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              preset === p.id
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-stone-500">
        {activeHint} <span className="text-stone-400">— viser {view.nodes.length} noder.</span>
      </p>
      <KnowledgeGraph nodes={view.nodes} edges={view.edges} />
    </div>
  )
}
```

- [ ] **Step 2: Typecheck the new component compiles**

Run: `npx tsc --noEmit 2>&1 | grep -i "GraphPresetView" || echo "no type errors in GraphPresetView"`
Expected: `no type errors in GraphPresetView` (or no output referencing the file).

- [ ] **Step 3: Commit**

```bash
git add src/components/charts/GraphPresetView.tsx
git commit -m "feat(graf): GraphPresetView client-wrapper med preset-knapperad"
```

---

## Task 3: Wire `GraphPresetView` into `/graf`

**Files:**
- Modify: `src/app/graf/page.tsx` (import block + the `<KnowledgeGraph .../>` render at the bottom of the main `<section>`)

- [ ] **Step 1: Swap the import**

In `src/app/graf/page.tsx`, replace the line:

```tsx
import { KnowledgeGraph } from '@/components/charts/KnowledgeGraph'
```

with:

```tsx
import { GraphPresetView } from '@/components/charts/GraphPresetView'
```

- [ ] **Step 2: Swap the render**

In the same file, replace:

```tsx
        <KnowledgeGraph nodes={interactiveNodes} edges={interactiveEdges} />
```

with:

```tsx
        <GraphPresetView nodes={interactiveNodes} edges={interactiveEdges} />
```

- [ ] **Step 3: Verify build compiles**

Run: `npx tsc --noEmit 2>&1 | grep -iE "graf/page|GraphPresetView|KnowledgeGraph" || echo "graf page typechecks"`
Expected: `graf page typechecks`.

- [ ] **Step 4: Visual verification**

Start dev on port 3001 (Cities sits on :3000):

```bash
npm run dev -- -p 3001
```

Open `http://localhost:3001/graf`. Confirm:
- A button row with **Mest sentrale · Makt & eierskap · Forsyning · Evidensgap** appears above the canvas.
- Default is **Mest sentrale** (highlighted), canvas shows a reduced, readable set (not the full hairball).
- Clicking each preset changes the canvas and the "viser N noder" count.

- [ ] **Step 5: Commit**

```bash
git add src/app/graf/page.tsx
git commit -m "feat(graf): bruk GraphPresetView med spørsmålsstyrte visninger"
```

---

## Task 4: `PageFraming` på `/verdikjede`

**Files:**
- Modify: `src/app/verdikjede/VerdikjedeContent.tsx` (add import; insert `<PageFraming>` right after the page header `<h1>`/description block, before the first data section — mirror the placement in `src/app/innsikt/InnsiktContent.tsx`)

> **Copy-merknad:** Teksten under er et utkast. Per spec gjennomgås den eksternvendte ordlyden av Gabriel/Cathrine før endelig commit; den er forbeholds-tro og innfører ingen nye claims.

- [ ] **Step 1: Add the import**

Add to the import block of `src/app/verdikjede/VerdikjedeContent.tsx`:

```tsx
import { PageFraming } from '@/components/ui/PageFraming'
```

- [ ] **Step 2: Insert the framing after the header**

Insert immediately after the page header block (the `<h1>Verdikjede</h1>` and its lead paragraph):

```tsx
<PageFraming
  title="Hva svarer denne siden på?"
  description={[
    'Siden viser den nordiske matverdikjeden ledd for ledd — fra primærproduksjon til avfall — med selskaper, datadekning og strømmer per ledd.',
    'Den brukes til å se hvor import, foredling, makt og sidestrømmer ligger i kjeden, ikke som komplett volum- eller verdiregnskap.',
  ]}
  takeaways={[
    'Hvert ledd kobler selskaper, datadekning og kjente funn.',
    'Materialflyt viser registrerte strømmer fra åpne kilder, ikke målte volum.',
    'Selvforsyning og flyt er analysegrunnlag, ikke beredskapsfasit.',
  ]}
  caveat="Internt kildegrunnlag med forbehold: kombinerer primærstatistikk, proxy og dokumentkoblinger, og er ikke ekstern validering."
/>
```

- [ ] **Step 3: Visual verification**

Open `http://localhost:3001/verdikjede`. Confirm the framing card renders at the top with title, three takeaways and caveat.

- [ ] **Step 4: Commit**

```bash
git add src/app/verdikjede/VerdikjedeContent.tsx
git commit -m "feat(verdikjede): PageFraming-inngang (utkast til copy-review)"
```

---

## Task 5: `PageFraming` på `/sirkularitet`

**Files:**
- Modify: `src/app/sirkularitet/SirkularitetContent.tsx` (add import; insert `<PageFraming>` after the page header, before the tab bar)

> **Copy-merknad:** utkast til copy-review (se Task 4).

- [ ] **Step 1: Add the import**

```tsx
import { PageFraming } from '@/components/ui/PageFraming'
```

- [ ] **Step 2: Insert the framing after the header (before the tab row)**

```tsx
<PageFraming
  title="Hva svarer denne siden på?"
  description={[
    'Siden vurderer sirkularitet i matsystemet via R-stigen (Potting 2017), eksisterende sirkulære looper, gap og materialflyt.',
    'Den brukes til å se hvor sirkularitet kan erstatte virgin råstoff, ikke som effekt- eller pilotbevis.',
  ]}
  takeaways={[
    'R-stigen klassifiserer hvert tiltak etter sirkularitetsgrad.',
    'Looper og gap viser hva som finnes og hva som mangler.',
    'Materialflyt og næringsflyt er modellert/registrert, ikke målt.',
  ]}
  caveat="Internt arbeidsgrunnlag med forbehold: benchmarks og hypoteser er ikke eksternt validert, og ingen case er pilotbevis."
/>
```

- [ ] **Step 3: Visual verification**

Open `http://localhost:3001/sirkularitet`. Confirm the framing renders above the tab row.

- [ ] **Step 4: Commit**

```bash
git add src/app/sirkularitet/SirkularitetContent.tsx
git commit -m "feat(sirkularitet): PageFraming-inngang (utkast til copy-review)"
```

---

## Task 6: `PageFraming` på `/eierskap`

**Files:**
- Modify: `src/app/eierskap/EierskapContent.tsx` (add import; insert `<PageFraming>` after the page header)

> **Copy-merknad:** utkast til copy-review (se Task 4).

- [ ] **Step 1: Add the import**

```tsx
import { PageFraming } from '@/components/ui/PageFraming'
```

- [ ] **Step 2: Insert the framing after the header**

```tsx
<PageFraming
  title="Hva svarer denne siden på?"
  description={[
    'Siden viser eierstruktur, konsern og maktkonsentrasjon i matsektoren — hvem som eier hva og hvor styreroller krysser.',
    'Den brukes til å forstå strukturell makt og konsentrasjon, ikke som påstand om ulovlig adferd.',
  ]}
  takeaways={[
    'Konserntre og eierandeler kobler selskaper til reelle eiere.',
    'Styrekryss/interlock viser konsentrasjon av innflytelse.',
    'Tallene bygger på offentlige registre med ulik oppdateringsferskhet.',
  ]}
  caveat="Internt kildegrunnlag med forbehold: bygger på register-/Brønnøysund-data med varierende ferskhet, og er ikke ekstern validering."
/>
```

- [ ] **Step 3: Visual verification**

Open `http://localhost:3001/eierskap`. Confirm the framing renders at the top.

- [ ] **Step 4: Commit**

```bash
git add src/app/eierskap/EierskapContent.tsx
git commit -m "feat(eierskap): PageFraming-inngang (utkast til copy-review)"
```

---

## Task 7: Kart-H1 (+ kondensert framing hvis layouten tillater)

**Files:**
- Modify: `src/app/kart/page.tsx`

> **NB:** `/kart` er en fullflate-kartside. Den faste leveransen er en `sr-only` H1 (P2 #9). Vurder under Step 1 om en synlig kondensert intro passer uten å bryte kart-layouten; hvis ikke, behold kun `sr-only` H1 og noter at inline-`PageFraming` på kart utgår (logges, ikke stille droppet).

- [ ] **Step 1: Inspect the page layout**

Read `src/app/kart/page.tsx` and `src/app/kart/layout.tsx`. Decide: full-bleed map → `sr-only` H1 only; har plass over kartet → legg også en kort synlig intro.

- [ ] **Step 2: Add the H1**

Add as the first element inside the page's returned root:

```tsx
<h1 className="sr-only">Matsystemkart — butikker, havbruk og matflyt i Norden</h1>
```

- [ ] **Step 3: Verify accessibility + build**

Run: `npx tsc --noEmit 2>&1 | grep -i "kart/page" || echo "kart page typechecks"`
Open `http://localhost:3001/kart` and confirm via the accessibility tree (Playwright snapshot or devtools) that an H1 now exists.

- [ ] **Step 4: Commit**

```bash
git add src/app/kart/page.tsx
git commit -m "fix(kart): sr-only H1 for tilgjengelighet (P2 #9)"
```

---

## Task 8: Full verifikasjon

- [ ] **Step 1: Tests**

Run: `npm run test`
Expected: all green, including the 5 new `preset.test.ts` tests.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: completes; `/graf`, `/verdikjede`, `/sirkularitet`, `/eierskap`, `/kart` all render. (Build kan kreve sandbox-disabled pga. `tsx` IPC.)

- [ ] **Step 4: Visual sweep (verify-skill)**

On `http://localhost:3001`: `/graf` (4 presets switch, default sentrale), `/verdikjede` + `/sirkularitet` + `/eierskap` (framing renders), `/kart` (H1 present). Capture one screenshot of `/graf` with a non-default preset active.

- [ ] **Step 5: Stop dev server + clean up**

```bash
kill %1 2>/dev/null || true
```

---

## Self-Review notes

- **Spec coverage:** Del 1 → Tasks 1–3; Del 2 → Tasks 4–6 (kart-framing kontingent i Task 7); Del 3 → Task 7. Verifikasjon → Task 8. ✅
- **Deferred (spec out-of-scope):** rapportmodus (P2 #11), relaterte-dok-gruppering (P2 #10) — ikke i planen, ved hensikt.
- **Edge-type-merknad:** `eierskap`/`forsyning` bruker node-type-subgraf (robust mot ukjent `relationType`-vokabular) i stedet for edge-type-allowlister; presist nok for visningene, og en senere edge-type-forfining kan legges til uten å endre `GraphPresetView`.
- **Copy-gate:** PageFraming-tekst (Tasks 4–6) er utkast; eksternvendt ordlyd gjennomgås av Gabriel/Cathrine før PR merges.
