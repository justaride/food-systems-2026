# P1a — Mechanical clarity sweep (æøå + red≠error) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore stripped æ/ø/å in Norwegian display strings and recolor three badges where red wrongly signals an error.

**Architecture:** Pure mechanical edits. One TDD-backed logic change (a badge tone in the pure `badge-model.ts`), two CSS-class recolors, and a find-and-correct sweep of display-text literals across 13 files. No new functionality, no behavior change beyond text/color.

**Tech Stack:** Next.js/React/TypeScript/Tailwind. Tests: `node --import=tsx --test` over `tests/**/*.test.ts`.

**Spec:** [`docs/superpowers/specs/2026-06-09-p1a-mekanisk-sveip-design.md`](../specs/2026-06-09-p1a-mekanisk-sveip-design.md)

**Verification commands:**
- Badge test: `node --import=tsx --test tests/lib/coverage/badge-model.test.ts`
- Full suite: `npm run test`
- Lint: `npm run lint`
- Typecheck: `npx tsc --noEmit` (ignore the known pre-existing error in `tests/lib/insight-link-scripts.test.ts`)

---

## Task 1: Temporal "ukjent periode" → warn, not red (TDD)

**Files:**
- Modify: `src/lib/coverage/badge-model.ts` (the `'unknown'` case of `temporalChip`, ~line 16)
- Test: `tests/lib/coverage/badge-model.test.ts`

- [ ] **Step 1: Add a failing test.** Append this `it(...)` inside the existing `describe('coverageBadgeModel', ...)` block (before its closing `})`):

```ts
  it('unknown temporal period → warn, not bad (no false red)', () => {
    const m = coverageBadgeModel(profile({ temporal: { kind: 'unknown' } }))
    assert.equal(m.temporal.label, 'ukjent periode')
    assert.equal(m.temporal.tone, 'warn')
  })
```

- [ ] **Step 2: Run it; verify FAIL.** Run: `node --import=tsx --test tests/lib/coverage/badge-model.test.ts`
Expected: FAIL — the `'unknown'` case currently returns `tone: 'bad'`.

- [ ] **Step 3: Implement.** In `src/lib/coverage/badge-model.ts`, in `temporalChip`, change the `'unknown'` case from:

```ts
    case 'unknown':
      return { label: 'ukjent periode', tone: 'bad' }
```

to:

```ts
    case 'unknown':
      return { label: 'ukjent periode', tone: 'warn' }
```

(Change ONLY `tone`. Leave the label and every other case untouched.)

- [ ] **Step 4: Run it; verify PASS.** Run: `node --import=tsx --test tests/lib/coverage/badge-model.test.ts`
Expected: PASS (all tests).

- [ ] **Step 5: Commit.**

```bash
git add src/lib/coverage/badge-model.ts tests/lib/coverage/badge-model.test.ts
git commit -m "fix(coverage): unknown temporal period is warn, not red"
```

---

## Task 2: Recolor the two false-red badges

**Files:**
- Modify: `src/app/metodikk/prompts/PromptsContent.tsx` (the language badge, ~line 213)
- Modify: `src/app/eiendommer/EiendommerContent.tsx` (the "Selvleie" badge, ~line 413)

- [ ] **Step 1: Recolor the language "NO" badge.** In `src/app/metodikk/prompts/PromptsContent.tsx`, find the language badge whose ternary is `prompt.language === 'no' ? 'bg-red-50 text-red-600' : 'bg-sky-50 text-sky-600'`. Change ONLY the `'no'` branch from `'bg-red-50 text-red-600'` to `'bg-stone-100 text-stone-600'`. Leave the `'bg-sky-50 text-sky-600'` (EN) branch and the `{prompt.language === 'no' ? 'NO' : 'EN'}` text unchanged.

- [ ] **Step 2: Recolor the "Selvleie" badge.** In `src/app/eiendommer/EiendommerContent.tsx`, find the badge rendering `Selvleie` with class `bg-rose-50 text-rose-700 border border-rose-200`. Change those classes to `bg-amber-50 text-amber-800 border border-amber-200`. Leave the sibling `Ekstern` badge (`bg-stone-100 text-stone-500 border border-stone-200`) and the `Selvleie` text unchanged.

- [ ] **Step 3: Verify.** Run: `npx tsc --noEmit` (no new errors in these two files) and `npm run lint` (passes). Do NOT run `npm run build`.

- [ ] **Step 4: Commit.**

```bash
git add src/app/metodikk/prompts/PromptsContent.tsx src/app/eiendommer/EiendommerContent.tsx
git commit -m "fix(ui): recolor NO-language and Selvleie badges off error-red"
```

---

## Task 3: Restore æ/ø/å in display strings (find-and-correct sweep)

**Files (modify, display text only — never identifiers/routes/keys/classes):**
`src/app/moter/page.tsx`, `src/app/tidslinje/page.tsx`, `src/app/team/page.tsx`, `src/components/ui/StatusBadge.tsx`, `src/components/layout/Header.tsx`, `src/app/kommunikasjon/KommunikasjonContent.tsx`, `src/app/metodikk/page.tsx`, `src/app/metodikk/prompts/PromptsContent.tsx`, `src/app/politikk/PolitikkContent.tsx`, `src/app/personer/PersonerContent.tsx`, `src/app/masteroppgaver/MasteroppgaverContent.tsx`, `src/app/sirkularitet/SirkularitetContent.tsx`, `src/app/verdikjede/VerdikjedeContent.tsx`, `src/app/rapporter/RapporterContent.tsx`, `src/lib/data/ten-step-start.ts`

Apply EXACTLY these corrections. Match on the quoted string content (the strings are unique within their file); line numbers are approximate. Change ONLY the listed display text.

- [ ] **Step 1: Apply corrections — moter/page.tsx**
  - `Moter` → `Møter` (the h1)
  - `Kuraterte motesammendrag` → `Kuraterte møtesammendrag`
  - ` moter. Primarunderlag` → ` møter. Primærunderlag` (the same paragraph: `moter`→`møter`, `Primarunderlag`→`Primærunderlag`)
  - the standalone eyebrow label `Primarunderlag` → `Primærunderlag`
  - `oppfolginger` → `oppfølginger`
  - `Avklart i motet` → `Avklart i møtet`
  - `Oppfolging` → `Oppfølging` (the h4)
  - `Fokus og nokkelfunn` → `Fokus og nøkkelfunn`

- [ ] **Step 2: Apply corrections — small single-string files**
  - `src/app/tidslinje/page.tsx`: `Soknader og nokkelhendelsr` → `Søknader og nøkkelhendelser`
  - `src/app/team/page.tsx`: `Organisasjon og nokkelpersoner` → `Organisasjon og nøkkelpersoner`
  - `src/components/ui/StatusBadge.tsx`: `label: 'Avslatt'` → `label: 'Avslått'` (do NOT touch the key `'avslatt'` or `className`)
  - `src/components/layout/Header.tsx`: `name: 'Moter'` → `name: 'Møter'` (do NOT touch `href: '/moter'`)
  - `src/app/kommunikasjon/KommunikasjonContent.tsx`: `Apne dokument` → `Åpne dokument`
  - `src/app/metodikk/page.tsx`: `Apne mandat-flate` → `Åpne mandat-flate`
  - `src/app/personer/PersonerContent.tsx`: `Ingen personer matcher soket` → `Ingen personer matcher søket`

- [ ] **Step 3: Apply corrections — PromptsContent.tsx**
  - `Operativ ko:` → `Operativ kø:`
  - `label: 'Boker og akademisk'` → `label: 'Bøker og akademisk'`
  - `label: 'Naeringspublikasjoner'` → `label: 'Næringspublikasjoner'`
  - (do NOT touch the `description:` fields on the same objects — they are not rendered)

- [ ] **Step 4: Apply corrections — PolitikkContent.tsx**
  - `` `Mal: ${entry.target_pct}%` `` → `` `Mål: ${entry.target_pct}%` ``
  - `` `Mal: ${entry.target_gwh} GWh` `` → `` `Mål: ${entry.target_gwh} GWh` ``
  - `Soknadsfrister:` → `Søknadsfrister:`
  - the `<th>` `Omrade` → `Område`
  - `Detaljer per omrade` → `Detaljer per område`
  - each `<span>` label `Ar: ` → `År: ` (two occurrences: main block + EU block)
  - each `<span>` label `Mal: ` → `Mål: ` (three occurrences: one main + two EU/main — apply to every `>Mal: <`-style label span)
  - (verify by grep afterward that no `Mal`/`Ar`/`Omrade`/`Soknad` display strings remain in this file)

- [ ] **Step 5: Apply corrections — content field-labels & links**
  - `src/app/masteroppgaver/MasteroppgaverContent.tsx`: `gjenstar` → `gjenstår` (two occurrences), `nokkelfunn` → `nøkkelfunn` (in the paragraph), and the `Nokkelfunn` field label → `Nøkkelfunn`
  - `src/app/sirkularitet/SirkularitetContent.tsx`: `Forsokte losninger` → `Forsøkte løsninger`; `Sammenlignbar losning` → `Sammenlignbar løsning`
  - `src/app/verdikjede/VerdikjedeContent.tsx`: `Nokkelfunn` → `Nøkkelfunn`; `Nokkelaktorer` → `Nøkkelaktører`
  - `src/app/rapporter/RapporterContent.tsx`: `Nokkelfunn` → `Nøkkelfunn`; `Apne i biblioteket` → `Åpne i biblioteket`

- [ ] **Step 6: Apply corrections — ten-step-start.ts (data strings)**
  - `output: 'Moterytme, sprintplan, beslutningslogg'` → `output: 'Møterytme, sprintplan, beslutningslogg'`
  - In the `description` on the next entry: `moterytme` → `møterytme`, `Faa` → `Få`, `gjennomgaaande` → `gjennomgående`. **Leave the Nynorsk words `ikkje`, `eige`, `veke` exactly as they are** — they are intentional, not errors.

- [ ] **Step 7: Sanity-check no identifier changed.** Run:

```bash
rg -n "href='/moter'|href=\"/moter\"|'avslatt'|'soknad'|'pagaende'" src/app/moter src/components/ui/StatusBadge.tsx src/components/layout/Header.tsx src/app/kilder
rg -n "\bMoter\b|\bSoknad|nokkel|\bApne\b|Operativ ko\b|>Omrade<|>Mal: <|>Ar: <|gjenstar\b" src/app src/components src/lib/data/ten-step-start.ts
```
Expected: the FIRST command still shows the unchanged route/keys (`/moter`, `'avslatt'`, `'soknad'`). The SECOND command returns NOTHING (all display-text mojibake fixed). If the second command returns any hit, fix that string too (unless it is a route/key/English word — then leave it).

- [ ] **Step 8: Typecheck + lint.** Run: `npx tsc --noEmit` (no new errors) and `npm run lint` (passes).

- [ ] **Step 9: Commit.**

```bash
git add -A
git commit -m "fix(i18n): restore æ/ø/å in Norwegian display strings"
```

---

## Final verification

- [ ] Full suite: `npm run test` → all pass, `fail 0` (one new test vs the branch base).
- [ ] `npm run lint` → clean.
- [ ] `npx tsc --noEmit` → only the known pre-existing `insight-link-scripts.test.ts` error.
- [ ] Spot-check in `npm run dev`: `/moter` (h1 "Møter"), `/politikk` (headers "Område/Mål/År"), `/metodikk/prompts` ("NO" badge no longer red, "Operativ kø"), `/eiendommer` ("Selvleie" amber).
- [ ] Open a PR from `codex/p1a-mekanisk-sveip`.
