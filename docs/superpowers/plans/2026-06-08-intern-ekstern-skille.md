# Intern/ekstern-skille + dekning-merking opprydding — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the app's internal working surfaces visually distinct from reader-facing content, and stop the "0% verifisert" coverage badge from misreading "not tracked" (0/0) as a red failure.

**Architecture:** Two new presentational primitives (`InternalSection` collapsible + `InternalBanner`) built on the existing `PageFraming`/`StatusLegend` visual language; a surgical display-level fix in the pure `badge-model.ts` (the only logic change, fully TDD-tested); and moving the coverage legend into `CoverageOverview` so it travels with the box. No auth/middleware (none exists); the split is visual only.

**Tech Stack:** Next.js (App Router) + React server/client components, TypeScript, Tailwind. Tests: Node's built-in runner via `node --import=tsx --test` over `tests/**/*.test.ts` (no vitest/jest, no testing-library — React components are verified by `build`/`lint`, not unit-rendered).

**Spec:** [`docs/superpowers/specs/2026-06-08-intern-ekstern-skille-design.md`](../specs/2026-06-08-intern-ekstern-skille-design.md)

**Verification commands (used throughout):**
- Single test file: `node --import=tsx --test tests/lib/coverage/badge-model.test.ts`
- Full suite: `npm run test`
- Lint: `npm run lint`
- Typecheck/build: `npm run build`

---

## File Structure

**New:**
- `src/components/ui/InternalSection.tsx` — collapsible "internal working surface" wrapper (closed by default).
- `src/components/ui/InternalBanner.tsx` — top-of-page banner for wholly-internal pages.

**Modified:**
- `src/lib/coverage/badge-model.ts` — `total === 0` → "ikke sporet" (neutral); real low verification → `warn` not `bad`.
- `tests/lib/coverage/badge-model.test.ts` — extend with the two new behaviors.
- `src/components/coverage/CoverageOverview.tsx` — add a "Hva betyr merkene?" legend.
- `src/app/hvitbok/proveniens/page.tsx` — trim the now-duplicated badge explanation.
- `src/app/kilder/KilderContent.tsx` — add `InternalBanner`.
- (Phase 2) `ForskningsrunderContent.tsx`, `EierskapContent.tsx`, `VerdikjedeContent.tsx`, `AktorerContent.tsx`, `aktorer/[slug]/page.tsx`.

---

# Phase 1 — Foundation + `/kilder` (the shippable "mal")

## Task 1: Badge fix — `total === 0` → "ikke sporet", and de-red real low verification

**Files:**
- Modify: `src/lib/coverage/badge-model.ts:28-33`
- Test: `tests/lib/coverage/badge-model.test.ts`

- [ ] **Step 1: Add the two failing tests**

Append these two `it(...)` blocks inside the existing `describe('coverageBadgeModel', ...)` in `tests/lib/coverage/badge-model.test.ts` (before the closing `})` on the last line):

```ts
  it('total === 0 → verification chip is neutral "ikke sporet" (not red 0%)', () => {
    const m = coverageBadgeModel(
      profile({
        verification: { total: 0, humanVerified: 0, machineVerified: 0, needsReview: 0, humanVerifiedPct: 0, rollup: 'needs_review' },
      }),
    )
    assert.equal(m.verification.label, 'ikke sporet')
    assert.equal(m.verification.tone, 'neutral')
  })
  it('real low verification (needs_review, total > 0) → warn, not bad', () => {
    const m = coverageBadgeModel(
      profile({
        verification: { total: 179311, humanVerified: 0, machineVerified: 0, needsReview: 179311, humanVerifiedPct: 0, rollup: 'needs_review' },
      }),
    )
    assert.equal(m.verification.label, '0% verifisert')
    assert.equal(m.verification.tone, 'warn')
  })
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --import=tsx --test tests/lib/coverage/badge-model.test.ts`
Expected: FAIL — the `needs_review` case currently returns `tone: 'bad'` and a `'0% verifisert'` label for `total: 0`.

- [ ] **Step 3: Implement the fix**

In `src/lib/coverage/badge-model.ts`, replace the current verification chip block (lines 28-33):

```ts
  const v = profile.verification
  const verification: Chip = {
    label: `${v.humanVerifiedPct}% verifisert`,
    tone: v.rollup === 'human_grade' ? 'good' : v.rollup === 'needs_review' ? 'bad' : 'warn',
    title: `Rollup: ${v.rollup} (${v.humanVerified}/${v.total})`,
  }
```

with:

```ts
  const v = profile.verification
  const verification: Chip =
    v.total === 0
      ? {
          label: 'ikke sporet',
          tone: 'neutral',
          title: 'Verifisering spores ikke for dette datasettet (0 rader).',
        }
      : {
          label: `${v.humanVerifiedPct}% verifisert`,
          tone: v.rollup === 'human_grade' ? 'good' : 'warn',
          title: `Andel poster en person har kvalitetssjekket: ${v.humanVerified} av ${v.total}.`,
        }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --import=tsx --test tests/lib/coverage/badge-model.test.ts`
Expected: PASS (all 4 tests). The pre-existing `machine_grade → warn` test still passes (machine_grade is not `human_grade`, so it maps to `warn`).

- [ ] **Step 5: Run the full coverage suite to confirm nothing else broke**

Run: `node --import=tsx --test tests/lib/coverage/badge-model.test.ts tests/lib/coverage/classify.test.ts tests/lib/coverage/guard.test.ts tests/lib/coverage/build-profile.test.ts`
Expected: PASS. (The audit gate logic in `classify.ts` is untouched; `rollup` is unchanged, only the badge's display reads `total`.)

- [ ] **Step 6: Commit**

```bash
git add src/lib/coverage/badge-model.ts tests/lib/coverage/badge-model.test.ts
git commit -m "fix(coverage): show 'ikke sporet' for 0/0 datasets; de-red real low verification"
```

---

## Task 2: `InternalSection` component (collapsible, closed by default)

**Files:**
- Create: `src/components/ui/InternalSection.tsx`

- [ ] **Step 1: Create the component**

```tsx
import type { ReactNode } from 'react'

type InternalSectionProps = {
  label: string
  summary?: string
  children: ReactNode
}

const DEFAULT_SUMMARY = 'Internt arbeidsgrunnlag — ikke ferdig formidling. Tall kan endres.'

export function InternalSection({ label, summary = DEFAULT_SUMMARY, children }: InternalSectionProps) {
  return (
    <details className="group rounded-lg border border-stone-200 bg-stone-50/80">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-sm font-semibold text-stone-700 [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true">🛠</span>
        <span>Internt: {label}</span>
        <span className="font-normal text-xs text-stone-500">{summary}</span>
        <span className="ml-auto text-xs text-stone-400">
          <span className="group-open:hidden">vis ▸</span>
          <span className="hidden group-open:inline">skjul ▾</span>
        </span>
      </summary>
      <div className="border-t border-stone-200 p-4">{children}</div>
    </details>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: build succeeds (component compiles; no consumers yet). If `build` is slow, `npx tsc --noEmit` is an acceptable faster check.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/InternalSection.tsx
git commit -m "feat(ui): add InternalSection collapsible (closed by default)"
```

> Note: this is a presentational server component. The repo's test runner (`node --test` over `*.test.ts`) does not render React, so verification is build/lint + the manual check in Task 5, by repo convention. No unit test file.

---

## Task 3: `InternalBanner` component (top-of-page, for wholly-internal pages)

**Files:**
- Create: `src/components/ui/InternalBanner.tsx`

- [ ] **Step 1: Create the component**

```tsx
type InternalBannerProps = {
  note?: string
}

const DEFAULT_NOTE =
  'Datakvalitet, kurasjon og kildekontroll — internt arbeidsgrunnlag, ikke ferdig formidling. Tall og status kan endres.'

export function InternalBanner({ note }: InternalBannerProps) {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">🛠 Intern arbeidsflate</p>
      <p className="mt-1 text-xs leading-relaxed text-amber-950">{note ?? DEFAULT_NOTE}</p>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/InternalBanner.tsx
git commit -m "feat(ui): add InternalBanner for wholly-internal pages"
```

---

## Task 4: Coverage legend travels with the box

**Files:**
- Modify: `src/components/coverage/CoverageOverview.tsx:33-41`
- Modify: `src/app/hvitbok/proveniens/page.tsx:9-14`

- [ ] **Step 1: Add the legend inside `CoverageOverview`**

In `src/components/coverage/CoverageOverview.tsx`, replace the closing of the rows block and Card (current lines 33-41):

```tsx
      <div className="space-y-2">
        {data.profiles.map((p) => (
          <div key={p.datasetId} className="flex items-center justify-between gap-3 border-b border-stone-100 pb-2 last:border-0">
            <span className="text-sm text-stone-700">{p.label}</span>
            <CoverageBadge profile={p} />
          </div>
        ))}
      </div>
    </Card>
```

with:

```tsx
      <div className="space-y-2">
        {data.profiles.map((p) => (
          <div key={p.datasetId} className="flex items-center justify-between gap-3 border-b border-stone-100 pb-2 last:border-0">
            <span className="text-sm text-stone-700">{p.label}</span>
            <CoverageBadge profile={p} />
          </div>
        ))}
      </div>
      <details className="mt-3 border-t border-stone-100 pt-2">
        <summary className="cursor-pointer text-xs text-stone-500">Hva betyr merkene?</summary>
        <div className="mt-2 space-y-1 text-[11px] leading-relaxed text-stone-500">
          <p><strong>Tid:</strong> øyeblikksbilde = ett enkelt år · flere år = spredte år · tidsserie = minst fem sammenhengende år.</p>
          <p><strong>Geografi:</strong> NO/DK = ett land · Norden (5) = alle fem · «NO → nordisk ⚠» = kun norske data bak en nordisk-presentert figur.</p>
          <p><strong>Verifisering:</strong> andel poster en person har kvalitetssjekket manuelt. «ikke sporet» = datasettet har ingen verifiseringsdata (0 rader).</p>
          <p><strong>«Beregnet … (local)»</strong> = beregnet mot lokal database, ikke produksjon.</p>
        </div>
      </details>
    </Card>
```

- [ ] **Step 2: Trim the now-duplicated explanation on the proveniens page**

In `src/app/hvitbok/proveniens/page.tsx`, replace the paragraph (lines 9-14):

```tsx
      <p className="text-sm text-stone-600">
        Faktisk datadekning bak figurene i hvitboken — temporal rekkevidde, geografisk omfang og
        verifiseringsgrad, beregnet direkte fra databasen (ikke kuratert). Et øyeblikksbilde-merke
        betyr at tallet er ett enkelt år, ikke en tidsserie; «NO → nordisk» betyr at kun norske data
        ligger bak en nordisk-presentert figur.
      </p>
```

with:

```tsx
      <p className="text-sm text-stone-600">
        Faktisk datadekning bak figurene i hvitboken — beregnet direkte fra databasen (ikke kuratert).
        Se «Hva betyr merkene?» i oversikten under for forklaring av tids-, geografi- og verifiseringsmerkene.
      </p>
```

- [ ] **Step 3: Typecheck + lint**

Run: `npm run build && npm run lint`
Expected: both succeed.

- [ ] **Step 4: Commit**

```bash
git add src/components/coverage/CoverageOverview.tsx src/app/hvitbok/proveniens/page.tsx
git commit -m "feat(coverage): carry badge legend inside CoverageOverview; dedupe on proveniens"
```

---

## Task 5: `/kilder` gets the internal banner (+ manual visual check)

**Files:**
- Modify: `src/app/kilder/KilderContent.tsx:8` (import) and `:177-178` (banner placement)

- [ ] **Step 1: Add the import**

In `src/app/kilder/KilderContent.tsx`, after line 8 (`import { CoverageOverview } from '@/components/coverage/CoverageOverview'`), add:

```tsx
import { InternalBanner } from '@/components/ui/InternalBanner'
```

- [ ] **Step 2: Place the banner at the top of the returned tree**

In the same file, find the start of the returned JSX (currently line 177-178):

```tsx
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
```

Insert the banner as the first child of the outer `div`:

```tsx
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <InternalBanner note="Kilderegister og nedlastings-/kurasjonsstatus — internt arbeidsgrunnlag, ikke ferdig formidling. Tall og status kan endres." />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
```

- [ ] **Step 3: Typecheck + lint**

Run: `npm run build && npm run lint`
Expected: both succeed.

- [ ] **Step 4: Manual visual check (the only end-to-end verification for the UI changes)**

Run: `npm run dev`, open `http://localhost:3000/kilder`. Confirm:
1. The amber "🛠 Intern arbeidsflate" banner sits at the top.
2. The "Dekningsoversikt" box now has a "Hva betyr merkene?" toggle that expands the legend.
3. Any dataset with 0 rows shows a neutral grey "ikke sporet" chip — not a red "0% verifisert".
4. Also open `http://localhost:3000/hvitbok/proveniens` and confirm the legend shows there too and the intro is the trimmed one-liner.

- [ ] **Step 5: Commit**

```bash
git add src/app/kilder/KilderContent.tsx
git commit -m "feat(kilder): mark Kunnskapsgrunnlag as internal working surface"
```

---

**End of Phase 1.** At this point the foundation is shippable and testable: the badge fix is covered by tests, the primitives exist, the legend travels with the box, and `/kilder` demonstrates the pattern. **Stop here and review before Phase 2 if desired.**

---

# Phase 2 — Roll the skille out to the other 5 "nei" pages (stageable; one commit each)

Each task is the same mechanical move: import a primitive, wrap the page's internal block(s). The wrapper code is given in full; the only per-file work is locating the named JSX block (a `Read` step) and wrapping it. Do them in any order; each is an independent commit. Run `npm run build && npm run lint` after each before committing.

## Task 6: `/forskningsrunder`

**File:** `src/app/forskningsrunder/ForskningsrunderContent.tsx`

- [ ] **Step 1:** Read the file. Add `import { InternalBanner } from '@/components/ui/InternalBanner'` and `import { InternalSection } from '@/components/ui/InternalSection'` near the existing imports.
- [ ] **Step 2:** Place `<InternalBanner note="Forskningsrunde-arbeidsflate: kildebacklog og nedlastingsstatus. Internt, ikke ferdig formidling." />` as the first child of the page's outermost returned `<div>`.
- [ ] **Step 3:** Wrap the "Neste steg for full kontroll" block (the one containing the CSV path `research/evidence-pack/…` and the `npm run db:import:research-20260420` command — audit ref `ForskningsrunderContent.tsx:514-521, 659`) in:

```tsx
<InternalSection label="datainntak & arbeidsinstruksjoner">
  {/* the existing "Neste steg for full kontroll" block, unchanged */}
</InternalSection>
```

- [ ] **Step 4:** `npm run build && npm run lint` → both pass.
- [ ] **Step 5:** Commit: `git commit -am "feat(forskningsrunder): mark internal working surface"`

## Task 7: `/eierskap`

**File:** `src/app/eierskap/EierskapContent.tsx`

- [ ] **Step 1:** Read the file. Add `import { InternalBanner } from '@/components/ui/InternalBanner'`.
- [ ] **Step 2:** Place `<InternalBanner note="Eierskap-kartlegging med datakvalitet-score og Brønnøysund-ferskhet — internt arbeidsgrunnlag, ikke en vurdering av selskapene." />` as the first child of the outermost returned `<div>`.
- [ ] **Step 3:** Relabel the data-quality column for clarity. Find the `Score` column header (audit ref `EierskapContent.tsx:101`) and change the visible text from `Score` to `Datakvalitet`, and add a `title` on the header cell: `title="0–10: hvor komplett kartleggingen er, ikke en vurdering av selskapet."`. Find the "Min. score:" slider label (audit ref `:82-84`) and change its visible text to `Min. datakvalitet:`.
- [ ] **Step 4:** `npm run build && npm run lint` → both pass.
- [ ] **Step 5:** Commit: `git commit -am "feat(eierskap): frame as internal QA; relabel Score → Datakvalitet"`

## Task 8: `/verdikjede`

**File:** `src/app/verdikjede/VerdikjedeContent.tsx`

- [ ] **Step 1:** Read the file. Add `import { InternalSection } from '@/components/ui/InternalSection'`.
- [ ] **Step 2:** Wrap the data-coverage / "Matflyt som grafisk uttak" / "Interessante uttak" overview panel (audit ref `VerdikjedeContent.tsx:380-471`) — the block below the reader-facing stage cards — in:

```tsx
<InternalSection label="datadekning & arbeidsflate">
  {/* the existing overview/coverage/"arbeidsflate" panel, unchanged */}
</InternalSection>
```

Leave the reader-facing value-chain stage cards (above this block) untouched and open.
- [ ] **Step 3:** `npm run build && npm run lint` → both pass.
- [ ] **Step 4:** Commit: `git commit -am "feat(verdikjede): collapse internal coverage/workbench panel"`

## Task 9: `/aktorer`

**File:** `src/app/aktorer/AktorerContent.tsx`

- [ ] **Step 1:** Read the file. Add `import { InternalBanner } from '@/components/ui/InternalBanner'`.
- [ ] **Step 2:** Place `<InternalBanner note="Intern interessent-/påvirkningsanalyse: stance, makt/interesse-score og «asks» er teamets arbeidsvurderinger, ikke eksterne fakta." />` as the first child of the outermost returned `<div>` — this page is wholly internal (named external actors with stance/asks), so a page-level banner is the right move rather than per-section collapse.
- [ ] **Step 3:** `npm run build && npm run lint` → both pass.
- [ ] **Step 4:** Commit: `git commit -am "feat(aktorer): mark as internal influence analysis"`

## Task 10: `/aktorer/[slug]`

**File:** `src/app/aktorer/[slug]/page.tsx`

- [ ] **Step 1:** Read the file. Add `import { InternalBanner } from '@/components/ui/InternalBanner'` and `import { InternalSection } from '@/components/ui/InternalSection'`.
- [ ] **Step 2:** Place `<InternalBanner note="Intern aktørprofil: påvirkningsvurdering, ikke ekstern fakta-profil." />` at the top of the returned tree.
- [ ] **Step 3:** Wrap the "Commitment Snapshot" / "Intern eier" / "Ønsket stance" / "Notater" block (audit ref `aktorer/[slug]/page.tsx:140-175`) in:

```tsx
<InternalSection label="påvirkningsarbeid (asks, eier, ønsket stance)">
  {/* the existing Commitment Snapshot / Intern eier / Notater block, unchanged */}
</InternalSection>
```

- [ ] **Step 4:** `npm run build && npm run lint` → both pass.
- [ ] **Step 5:** Commit: `git commit -am "feat(aktorer): mark internal influence sections on detail page"`

---

## Final verification (after whichever phase you stop at)

- [ ] Run full suite: `npm run test` → all pass (incl. the 2 new badge tests).
- [ ] `npm run lint` → clean.
- [ ] `npm run build` → succeeds.
- [ ] Spot-check `/kilder`, `/hvitbok/proveniens`, and any Phase-2 pages touched in `npm run dev`.
- [ ] Open a PR from `codex/intern-ekstern-skille` (per the spec→plan→PR workflow).
