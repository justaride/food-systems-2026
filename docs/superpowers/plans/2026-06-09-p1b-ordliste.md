# P1b — delt ordliste («forklar ordforrådet») Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One shared glossary (data + reusable component) that explains stats terms, project jargon, and badge/status codes — replacing the two ad-hoc glossaries — plus a small jargon-translation pass.

**Architecture:** A pure data module `glossary/terms.ts` (the audit-testable source of truth) and a `Glossary` client component generalized from the existing `InsightGlossary`. The two current glossaries migrate to it; `/aktorer` gains the status category; a handful of jargon strings are translated/expanded in place.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind. Tests: `node --import=tsx --test` over `tests/**/*.test.ts` (logic/data only; client components verified by tsc/lint + visual).

**Spec:** [`docs/superpowers/specs/2026-06-09-p1b-ordliste-design.md`](../specs/2026-06-09-p1b-ordliste-design.md)

**Verification commands:**
- Glossary data test: `node --import=tsx --test tests/lib/glossary-terms.test.ts`
- Full suite: `npm run test`
- Lint: `npm run lint`
- Typecheck: `npx tsc --noEmit` (ignore the known pre-existing `tests/lib/insight-link-scripts.test.ts` error)

---

## File Structure
- **New:** `src/lib/glossary/terms.ts` (data + types), `src/components/ui/Glossary.tsx` (reusable collapsible), `tests/lib/glossary-terms.test.ts`.
- **Modify:** `src/app/page.tsx`, `src/app/innsikt/InnsiktContent.tsx`, `src/app/aktorer/AktorerContent.tsx`, `src/app/aktorer/[slug]/page.tsx`, `src/app/bibliotek/BibliotekContent.tsx`, `src/app/styremedlemmer/InterlockContent.tsx`, `src/app/personer/PersonerContent.tsx`, `src/app/selskap/[id]/page.tsx`, `src/app/havbruk/HavbrukContent.tsx`, `src/app/sammenligning/SammenligningContent.tsx`.
- **Delete:** `src/components/ui/InsightGlossary.tsx`.

---

## Task 1: Glossary data source (TDD)

**Files:**
- Create: `src/lib/glossary/terms.ts`
- Test: `tests/lib/glossary-terms.test.ts`

- [ ] **Step 1: Write the failing test** at `tests/lib/glossary-terms.test.ts`:

```ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { GLOSSARY_TERMS } from '../../src/lib/glossary/terms'

const CATEGORIES = ['statistikk', 'prosjekt', 'status'] as const

describe('GLOSSARY_TERMS', () => {
  it('every term has a valid category', () => {
    for (const t of GLOSSARY_TERMS) {
      assert.ok((CATEGORIES as readonly string[]).includes(t.category), `bad category ${t.category} on ${t.term}`)
    }
  })
  it('each category has at least one term', () => {
    for (const c of CATEGORIES) {
      assert.ok(GLOSSARY_TERMS.some((t) => t.category === c), `no terms in ${c}`)
    }
  })
  it('terms are unique within each category', () => {
    for (const c of CATEGORIES) {
      const terms = GLOSSARY_TERMS.filter((t) => t.category === c).map((t) => t.term)
      assert.equal(new Set(terms).size, terms.length, `duplicate term in ${c}`)
    }
  })
})
```

- [ ] **Step 2: Run it; verify FAIL.** Run: `node --import=tsx --test tests/lib/glossary-terms.test.ts`
Expected: FAIL — cannot find module `src/lib/glossary/terms`.

- [ ] **Step 3: Create `src/lib/glossary/terms.ts`:**

```ts
export type GlossaryCategory = 'statistikk' | 'prosjekt' | 'status'

export type GlossaryTerm = {
  term: string
  definition: string
  reading?: string
  category: GlossaryCategory
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // statistikk — moved verbatim from InsightGlossary
  { term: 'HHI', category: 'statistikk', definition: 'Herfindahl-Hirschman Index — sum av kvadrerte markedsandeler. Viser konsentrasjon i markedet.', reading: '< 1500 lavt · 1500–2500 moderat · > 2500 høyt konsentrert' },
  { term: 'Gini', category: 'statistikk', definition: 'Gini-koeffisient — mål på ulikhet i fordeling. Her brukt på butikktilgang per innbygger.', reading: '0 = perfekt likhet · 1 = maksimal ulikhet' },
  { term: 'CR3', category: 'statistikk', definition: 'Concentration Ratio 3 — samlet markedsandel for de tre største aktørene.', reading: '> 70% indikerer oligopol' },
  { term: 'Zipf', category: 'statistikk', definition: 'Zipfs lov — empirisk fordeling der antall ≈ konstant / rang. Brukes til å sjekke om butikknettverket følger naturlig urban-fordeling.', reading: 'R² nær 1 og helling ≈ −1 = følger Zipf' },
  { term: 'Lorenz-kurve', category: 'statistikk', definition: 'Visuell fremstilling av ulikhet. Diagonalen = perfekt likhet; jo lengre kurven bøyer ut, jo større ulikhet.' },
  // prosjekt — 6 from the forside Nøkkelbegreper + 3 new
  { term: 'Food TG', category: 'prosjekt', definition: 'Food Transition Group, prosjektets arbeidsgruppe.' },
  { term: 'Ten Step', category: 'prosjekt', definition: 'Ti-stegs metodikk for å drive transisjonsgruppen.' },
  { term: 'Evidence Pack', category: 'prosjekt', definition: 'Standardsettet av leveransedokumenter.' },
  { term: 'Spor A/B/C', category: 'prosjekt', definition: 'De tre scope-sporene: fôr/import, sidestrømmer, governance.' },
  { term: 'Claim-koder', category: 'prosjekt', definition: 'CL = claim, EV = evidence, SRC = kilde, med spor og nummer.' },
  { term: 'Forskningsrunder', category: 'prosjekt', definition: 'Avgrensede runder med kunnskapsinnhenting.' },
  { term: 'SourceDoc', category: 'prosjekt', definition: 'Kilde-lag i databasen med proveniens; et bibliotek-dokument kan finnes uten et eget SourceDoc-lag.' },
  { term: 'Backlog', category: 'prosjekt', definition: 'Kilder identifisert i en forskningsrunde, men ikke ennå registrert eller nedlastet.' },
  { term: 'Exa', category: 'prosjekt', definition: 'Søke-API brukt til å hente kilder automatisk.' },
  // status — badge codes
  { term: 'Stance', category: 'status', definition: 'Aktørens holdning til prosjektet (teamets vurdering, ikke aktørens egen uttalelse).', reading: 'champion = forkjemper · supportive = støttende · neutral = nøytral · skeptical = skeptisk · opposed = motstander' },
  { term: 'Prioritet (P1–P3)', category: 'status', definition: 'Intern prioritering av aktør for oppfølging.', reading: 'P1 = viktigst · P3 = lavest' },
  { term: 'Researchstatus', category: 'status', definition: 'Hvor sikkert et tall er.', reading: 'Primærsnapshot = bekreftet fra primærkilde på ett tidspunkt · Proxy/modell = indirekte indikator · Trenger primærsjekk = må verifiseres mot primærkilde' },
  { term: 'Innsiktstype', category: 'status', definition: 'Kilde-/dokumenttype bak en innsikt.', reading: 'Notat · Transkripsjon · Arbeidsdok · Strategi · Duplikat = overlapper en annen oppføring' },
]
```

- [ ] **Step 4: Run it; verify PASS.** Run: `node --import=tsx --test tests/lib/glossary-terms.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit.**

```bash
git add src/lib/glossary/terms.ts tests/lib/glossary-terms.test.ts
git commit -m "feat(glossary): shared term source (statistikk/prosjekt/status)"
```

---

## Task 2: `Glossary` component (generalized from InsightGlossary)

**Files:**
- Create: `src/components/ui/Glossary.tsx`

- [ ] **Step 1: Create the component** (same visual language as the current `InsightGlossary`, now driven by category + defaultOpen):

```tsx
'use client'

import { useState } from 'react'
import { GLOSSARY_TERMS, type GlossaryCategory } from '@/lib/glossary/terms'

export function Glossary({
  category,
  title = 'Begrepsforklaringer',
  defaultOpen = false,
}: {
  category: GlossaryCategory
  title?: string
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const entries = GLOSSARY_TERMS.filter((t) => t.category === category)
  if (entries.length === 0) return null
  const summary = entries.map((e) => e.term).join(' · ')

  return (
    <div className="rounded-lg border border-stone-200 bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-stone-50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">{title}</span>
          <span className="text-[10px] text-stone-400">{summary}</span>
        </div>
        <svg
          className={`w-4 h-4 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <dl className="px-4 pb-4 pt-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 border-t border-stone-100">
          {entries.map((entry) => (
            <div key={entry.term} className="text-xs">
              <dt className="font-semibold text-stone-800 mb-0.5">{entry.term}</dt>
              <dd className="text-stone-600 leading-relaxed">{entry.definition}</dd>
              {entry.reading && (
                <dd className="text-[10px] text-stone-400 mt-1 font-mono">{entry.reading}</dd>
              )}
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify.** Run: `npx tsc --noEmit` (no new errors) and `npm run lint` (passes).

- [ ] **Step 3: Commit.**

```bash
git add src/components/ui/Glossary.tsx
git commit -m "feat(ui): reusable Glossary component over shared terms"
```

---

## Task 3: Migrate both glossaries; delete InsightGlossary

**Files:**
- Modify: `src/app/innsikt/InnsiktContent.tsx` (import line 11, usage line 245)
- Modify: `src/app/page.tsx` (the Nøkkelbegreper `<details>` block, lines 65-81)
- Delete: `src/components/ui/InsightGlossary.tsx`

- [ ] **Step 1: Migrate `/innsikt`.** In `src/app/innsikt/InnsiktContent.tsx`:
  - Replace the import line `import { InsightGlossary } from '@/components/ui/InsightGlossary'` with `import { Glossary } from '@/components/ui/Glossary'`.
  - Replace the usage `<InsightGlossary />` with `<Glossary category="statistikk" defaultOpen />`.

- [ ] **Step 2: Migrate the forside.** In `src/app/page.tsx`, add the import near the other imports at the top:

```tsx
import { Glossary } from '@/components/ui/Glossary'
```

Then replace this entire block (the Nøkkelbegreper `<details>`):

```tsx
        <details className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm">
          <summary className="cursor-pointer font-medium text-stone-700">Nøkkelbegreper</summary>
          <dl className="mt-2 space-y-1.5 text-stone-600">
            <div><dt className="inline font-medium text-stone-800">Food TG</dt>
              <dd className="inline"> — Food Transition Group, prosjektets arbeidsgruppe.</dd></div>
            <div><dt className="inline font-medium text-stone-800">Ten Step</dt>
              <dd className="inline"> — ti-stegs metodikk for å drive transisjonsgruppen.</dd></div>
            <div><dt className="inline font-medium text-stone-800">Evidence Pack</dt>
              <dd className="inline"> — standardsettet av leveransedokumenter.</dd></div>
            <div><dt className="inline font-medium text-stone-800">Spor A/B/C</dt>
              <dd className="inline"> — de tre scope-sporene: fôr/import, sidestrømmer, governance.</dd></div>
            <div><dt className="inline font-medium text-stone-800">Claim-koder</dt>
              <dd className="inline"> — CL = claim, EV = evidence, SRC = kilde, med spor og nummer.</dd></div>
            <div><dt className="inline font-medium text-stone-800">Forskningsrunder</dt>
              <dd className="inline"> — avgrensede runder med kunnskapsinnhenting.</dd></div>
          </dl>
        </details>
```

with:

```tsx
        <Glossary category="prosjekt" title="Nøkkelbegreper" defaultOpen />
```

- [ ] **Step 3: Delete the old component.** Run: `git rm src/components/ui/InsightGlossary.tsx`

- [ ] **Step 4: Verify no dangling references.** Run: `rg -n "InsightGlossary" src` → expected: NO results.

- [ ] **Step 5: Typecheck + lint.** Run: `npx tsc --noEmit` (no new errors) and `npm run lint` (passes).

- [ ] **Step 6: Commit.**

```bash
git add -A
git commit -m "refactor(glossary): migrate innsikt + forside to shared Glossary; drop InsightGlossary"
```

---

## Task 4: Status glossary on `/aktorer` (+ detail)

**Files:**
- Modify: `src/app/aktorer/AktorerContent.tsx`
- Modify: `src/app/aktorer/[slug]/page.tsx`

- [ ] **Step 1: `/aktorer` list.** Read `src/app/aktorer/AktorerContent.tsx`. Add `import { Glossary } from '@/components/ui/Glossary'`. Place `<Glossary category="status" title="Statusforklaringer" />` as a sibling near the top of the returned content — directly after the page header/intro and before the actor list/cards (where the stance/priority badges appear). Keep it collapsed (no `defaultOpen`).

- [ ] **Step 2: `/aktorer/[slug]` detail.** Read `src/app/aktorer/[slug]/page.tsx`. Add the same import and place `<Glossary category="status" title="Statusforklaringer" />` near the top of the returned profile (after the header, before the stance/priority/relations sections).

- [ ] **Step 3: Verify.** Run: `npx tsc --noEmit` (no new errors) and `npm run lint` (passes).

- [ ] **Step 4: Commit.**

```bash
git add src/app/aktorer/AktorerContent.tsx src/app/aktorer/\[slug\]/page.tsx
git commit -m "feat(aktorer): add status glossary near stance/priority badges"
```

---

## Task 5: Jargon translate/expand in place (#8)

**Files:**
- Modify: `src/app/bibliotek/BibliotekContent.tsx`, `src/app/styremedlemmer/InterlockContent.tsx`, `src/app/personer/PersonerContent.tsx`, `src/app/selskap/[id]/page.tsx`, `src/app/havbruk/HavbrukContent.tsx`, `src/app/sammenligning/SammenligningContent.tsx`

Apply EXACTLY these display-text changes. Do NOT touch variable/type/key names (`fts`, `interlockScore`, `Interlock` types, etc.).

- [ ] **Step 1: FTS → Fulltekst.** In `src/app/bibliotek/BibliotekContent.tsx`:
  - The label map value `fts: 'FTS',` → `fts: 'Fulltekst',` (change ONLY the string value, keep the `fts:` key).
  - In the help text, `FTS søker i dokumentinnhold når serverlaget svarer.` → `Fulltekst-søket søker i dokumentinnhold når serverlaget svarer.`

- [ ] **Step 2: Interlock → Krysstyre (display labels only).**
  - `src/app/styremedlemmer/InterlockContent.tsx`: `<Card title="Interlock-score">` → `<Card title="Krysstyre-score">`.
  - `src/app/selskap/[id]/page.tsx`: the visible text `Interlock-score {interlockSummary.interlockScore}` → `Krysstyre-score {interlockSummary.interlockScore}` (keep the `interlockSummary.interlockScore` expression).
  - `src/app/personer/PersonerContent.tsx`: the stat label `Interlocking` (`<div ...>Interlocking</div>`) → `Kryssverv`.

- [ ] **Step 3: Expand abbreviations on first use.**
  - `src/app/havbruk/HavbrukContent.tsx`: the stat-card label `MTB totalt` → `MTB (maks tillatt biomasse)`. (Leave the table column header `MTB (tonn)` as-is — it now reads clearly given the stat-card expansion.)
  - `src/app/sammenligning/SammenligningContent.tsx`: the chart title `title="EMV-andel foredling"` → `title="Egne merkevarer (EMV), andel foredling"`.

- [ ] **Step 4: Sanity-check identifiers untouched.** Run:

```bash
rg -n "interlockScore|interlockSummary|fts:" src/app/styremedlemmer src/app/selskap src/app/bibliotek
```
Expected: the identifiers `interlockScore`, `interlockSummary`, and the `fts:` key still present (only the human-readable strings changed).

- [ ] **Step 5: Typecheck + lint.** Run: `npx tsc --noEmit` (no new errors) and `npm run lint` (passes).

- [ ] **Step 6: Commit.**

```bash
git add -A
git commit -m "fix(i18n): translate/expand FTS, Interlock, MTB, EMV in display text"
```

---

## Final verification

- [ ] Full suite: `npm run test` → all pass, `fail 0` (3 new glossary tests vs the branch base).
- [ ] `npm run lint` → clean; `npx tsc --noEmit` → only the known pre-existing `insight-link-scripts.test.ts` error.
- [ ] `rg -n "InsightGlossary" src` → no results (fully replaced).
- [ ] Spot-check in `npm run dev`: forside (Nøkkelbegreper open, 9 prosjekt-terms), `/innsikt` (statistikk open), `/aktorer` (Statusforklaringer with stance/P1–P3), `/bibliotek` ("Fulltekst" search mode), `/styremedlemmer` ("Krysstyre-score"), `/havbruk` ("MTB (maks tillatt biomasse)").
- [ ] Open a PR from `codex/p1b-ordliste`.
