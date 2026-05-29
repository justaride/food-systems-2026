# Food Systems Plattform Videreutvikling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gjøre Food Systems-plattformen tryggere for demo, bred intern deling og senere semi-ekstern lesing ved å lukke P0-tekniske lekkasjer, rydde norsk UI-språk og bygge en tydeligere leserreise.

**Architecture:** Arbeidet går i tre lag: først teknisk P0-stabilisering som kan testes lokalt, deretter leser- og språkstyring på eksisterende flater, til slutt rapport-/whitepaper-orienterte innganger. Eksisterende kunnskapsbase, claim-status og Food TG-gate-språk beholdes; ingen claim løftes til ekstern validert status gjennom denne UI-planen.

**Tech Stack:** Next.js 16, React 19, TypeScript, Node test runner, Markdown kontrollfiler, lokal nettleser-QA, `npm test`, `npm run lint`, `npm run build`.

---

## Startstatus

**Dato:** 2026-05-27
**Branch:** `codex/felles-nettverkskart`
**Kravgrunnlag:** `docs/project/analysis/outside-user-platform-review-2026-05-27.md`
**Arbeidsregel:** Behold skillet mellom intern arbeidsflate og leser-/beslutningsflate. Ikke skjul usikkerhet, men gjør den lesbar.

## Prioritert Rekkefølge

1. P0: fiks synlig `/metodikk` hydration/runtime-problem.
2. P0: rydd teknisk semantisk/hybrid søkefallback så bruker ikke ser rå `OPENAI_API_KEY`/embedding-detaljer.
3. P0: språk- og tegnrydding i synlige UI-flater med størst demonstrisiko.
4. P0/P1: legg tydeligere leserreise på startsiden.
5. P1: legg "hva svarer denne siden på?" på tunge sider.
6. P1/P2: felles statuslegend, grafspørsmål, karttilgjengelighet og relaterte dokumenter.

## File Map

Create:

- `docs/superpowers/plans/2026-05-27-plattform-videreutvikling.md`
- `tests/lib/emergence-simulation.test.ts`

Modify:

- `docs/project/analysis/outside-user-platform-review-2026-05-27.md`
- `src/components/charts/EmergenceVisualization.tsx`
- `src/lib/emergence-simulation.ts`
- `src/lib/queries/search.ts`
- `src/app/sok/SokContent.tsx`
- `src/app/bibliotek/BibliotekContent.tsx`
- `src/app/page.tsx`
- selected visible UI copy files found by `rg "Sok|Aapne|pa tvers|sirkulaer|primaer|hoey|faerre" src`

## Task 1: Save Review And Plan

**Files:**
- Create: `docs/superpowers/plans/2026-05-27-plattform-videreutvikling.md`
- Keep: `docs/project/analysis/outside-user-platform-review-2026-05-27.md`

- [x] **Step 1: Confirm current branch and dirty state**

Run:

```bash
git status --short --branch
```

Expected: branch is `codex/felles-nettverkskart`; dirty state only contains this plan, today's platform review, and intentional implementation edits.

- [x] **Step 2: Verify the review contains the P0/P1/P2 backlog**

Run:

```bash
rg -n "P0|P1|P2|hydration|semantisk|Sok|leserreise" docs/project/analysis/outside-user-platform-review-2026-05-27.md
```

Expected: review contains the prioritized backlog and enough route-level evidence to drive implementation.

- [x] **Step 3: Verify plan whitespace**

Run:

```bash
git diff --check -- docs/superpowers/plans/2026-05-27-plattform-videreutvikling.md docs/project/analysis/outside-user-platform-review-2026-05-27.md
```

Expected: no whitespace errors.

## Task 2: P0 Fix Metodikk Hydration

**Files:**
- Create: `src/lib/emergence-simulation.ts`
- Create: `tests/lib/emergence-simulation.test.ts`
- Modify: `src/components/charts/EmergenceVisualization.tsx`

- [x] **Step 1: Write failing deterministic simulation test**

Create `tests/lib/emergence-simulation.test.ts`:

```ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createInitialAgents, getConcentration, stepAgents } from '../../src/lib/emergence-simulation'

describe('emergence simulation', () => {
  it('creates the same initial agents for the same seed', () => {
    assert.deepEqual(createInitialAgents(80, 20260527), createInitialAgents(80, 20260527))
  })

  it('creates valid agents inside the grid', () => {
    const agents = createInitialAgents(80, 20260527)

    assert.equal(agents.length, 80)
    assert.ok(agents.every(agent => agent.x >= 0 && agent.x < 40))
    assert.ok(agents.every(agent => agent.y >= 0 && agent.y < 40))
    assert.ok(agents.every(agent => agent.company >= 0 && agent.company < 5))
    assert.ok(agents.every(agent => agent.size === 1))
  })

  it('steps deterministically without using ambient Math.random', () => {
    const agents = createInitialAgents(80, 20260527)

    assert.deepEqual(stepAgents(agents, 11), stepAgents(agents, 11))
  })

  it('computes one concentration bucket per company', () => {
    const concentration = getConcentration(createInitialAgents(80, 20260527))

    assert.equal(concentration.length, 5)
    assert.equal(concentration.reduce((sum, value) => sum + value, 0), 80)
  })
})
```

- [x] **Step 2: Run test and verify red**

Run:

```bash
npm test tests/lib/emergence-simulation.test.ts
```

Expected: FAIL because `src/lib/emergence-simulation.ts` does not exist yet.

- [x] **Step 3: Move simulation logic into deterministic helper**

Create `src/lib/emergence-simulation.ts` with exported `Agent`, `GRID`, `CELL`, `COMPANIES`, `createInitialAgents`, `stepAgents`, and `getConcentration`. Use a local seeded PRNG inside the helper; do not call ambient `Math.random()` during initial render.

- [x] **Step 4: Wire component to helper**

Modify `src/components/charts/EmergenceVisualization.tsx` so initial state calls `createInitialAgents()`, manual/animated steps call `stepAgents(prev, nextStep)`, and local constants come from the helper. Keep canvas/UI behavior unchanged.

- [x] **Step 5: Verify green**

Run:

```bash
npm test tests/lib/emergence-simulation.test.ts
npm run lint
npm run build
```

Expected: test, lint and build pass. If build regenerates chart metric timestamp noise only, note it before staging.

## Task 3: P0 Productize Search Fallback

**Files:**
- Modify: `src/lib/queries/search.ts`
- Modify: `src/app/sok/SokContent.tsx`

- [ ] **Step 1: Add test or focused assertion for warning copy**

Add or update a Node test so semantic fallback warnings do not expose `OPENAI_API_KEY`, raw embeddings counts, or implementation internals to UI copy.

- [ ] **Step 2: Replace raw diagnostic language**

Use product copy:

```text
Semantisk søk er ikke aktivert i denne versjonen. Viser nøkkelordtreff.
```

For hybrid:

```text
Hybrid søk bruker nøkkelord i denne versjonen. Semantisk rangering er ikke aktivert.
```

- [ ] **Step 3: Strengthen empty search state**

Add example queries and mode explanation to `/sok` when `hasSearched` is false.

- [ ] **Step 4: Verify**

Run:

```bash
npm test tests/lib/search*.test.ts
npm run lint
```

If no search-specific test file exists, run:

```bash
npm test
```

## Task 4: P0 UI Language And Diacritics Sweep

**Files:**
- Modify: `src/app/bibliotek/BibliotekContent.tsx`
- Modify: `src/app/media/page.tsx`
- Modify: `src/lib/data/ten-step-start.ts`
- Modify: `src/lib/data/verdikjede.ts`
- Modify: other files confirmed by focused `rg`

- [ ] **Step 1: Locate visible ASCII-stripped Norwegian copy**

Run:

```bash
rg -n "Sok|Aapne|pa tvers|sirkulaer|primaer|hoey|faerre|forstaa|maal|oeko|noekkel|aktor" src/app src/components src/lib/data
```

- [ ] **Step 2: Replace only user-visible copy**

Keep IDs, slugs, tags and enum values stable. Replace visible labels, descriptions, placeholders and body copy with proper Norwegian characters.

- [ ] **Step 3: Verify no targeted visible tokens remain**

Run:

```bash
rg -n "Sok i|Aapne|pa tvers|sirkulaer|primaer|hoey|faerre|forstaa|maal" src/app src/components src/lib/data
npm test
npm run lint
```

Expected: remaining matches, if any, are stable IDs/slugs/tags or intentionally quoted source text.

## Task 5: P0/P1 Guided Reader Start

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add four clear reader entries**

Add a compact first-screen reader journey with:

```text
Forstå prosjektet
Se hovedfunn
Kontroller kilder
Forbered whitepaper
```

Each entry must link to an existing route and use status-aware copy.

- [ ] **Step 2: Keep internal dashboard density**

Do not remove Evidence Pack, Ten Step, phase status or recent insight blocks. The new reader journey sits above those as a routing aid.

- [ ] **Step 3: Verify desktop/mobile layout**

Run local app and check `/` at desktop and mobile width. No card nesting, no overlapping text, no horizontal overflow.

## Task 6: P1 Page-Framing Pass

**Files:**
- Modify: `src/app/innsikt/*`
- Modify: `src/app/forsyningskjede/*`
- Modify: `src/app/sammenligning/*`
- Modify: `src/app/graf/*`
- Modify: `src/app/mandat/*`
- Modify: `src/app/bibliotek/*`

- [ ] **Step 1: Add "Hva svarer denne siden på?" framing**

For each heavy page, add 2-3 lines, three key takeaways and one caveat. Use existing data and status language only.

- [ ] **Step 2: Verify claim safety**

Run:

```bash
npm run audit:citable-reports
npm test
```

Expected: no page copy implies external validation unless a claim has documented support.

## Task 7: P1/P2 Shared Status Legend And Accessibility

**Files:**
- Create or modify a shared status/legend component if an existing local component is not sufficient.
- Modify selected pages using claim-status language.
- Modify `/kart` heading/accessibility if confirmed by browser QA.

- [ ] **Step 1: Reuse existing status language**

Use repo terms: `Utført internt`, `Siterbar med forbehold`, `Blokkert`, `Validert eksternt`, `Proxy`, `Illustrativ`.

- [ ] **Step 2: Improve map heading/accessibility**

Add a clear H1 or `sr-only` H1 to `/kart`, and check marker labels do not dominate the first DOM text readout.

- [ ] **Step 3: Verify with browser QA**

Check `/kart`, `/graf`, `/selskap`, `/mandat`, `/sok`, `/bibliotek` in desktop and mobile.

## Final Verification Gate

Run before calling this plan complete:

```bash
git status --short
npm test
npm run lint
npm run build
git diff --check
```

Then run browser QA on at least:

```text
/
/metodikk
/sok
/bibliotek
/innsikt
/mandat
/kart
```

Completion requires no visible Next/React error, no raw technical semantic-search leakage, no targeted P0 ASCII-stripped visible copy, no horizontal overflow and no accidental claim-status promotion.
