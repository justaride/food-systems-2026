# Koherens & produsentseparasjon — Implementasjonsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Start by creating an isolated worktree via superpowers:using-git-worktrees.

**Goal:** Make Food Systems 2026 self-explanatory to an outsider, and structurally separate the ~38 925 agricultural producers out of `Company` into a dedicated `Producer` table.

**Architecture:** Four phases. Phase 1 (UI coherence) and Phase 2 (content diacritics) are low-risk, no-DB, independently shippable. Phase 3 (schema + idempotent SQL migration) moves producers to `Producer`; the migration reuses each row's `id` verbatim so foreign-key *values* never change — only the FK target table. Phase 4 updates the query layer and pages, then verifies and ships to prod.

**Tech Stack:** Next.js 16 (App Router, server components), TypeScript, Prisma 7 → PostgreSQL (client generated to `src/generated/prisma/`), Tailwind. Tests: `node:test` + `tsx`, pure unit / file-content tests (no DB in tests). Prod schema reaches the DB only via idempotent `prisma/migrations/*/migration.sql` re-applied on every Coolify deploy by `scripts/apply-prod-migrations.sh`.

**Spec:** `docs/superpowers/specs/2026-05-20-koherens-og-produsentseparasjon-design.md`

---

## Reference facts (measured 2026-05-20, local DB)

- `Company`: 38 976 rows. 38 925 are producers (`valueChainStage = 'production'`); 51 are curated companies (all other stages). `valueChainStage` is the only reliable selector — `registrySource` is null for all but 10, `isResearchConstruct` is false for all.
- Only 2 FK columns reference producers: `Subsidy.companyId` (179 310 rows → producer, 1 → company) and `DeliveryVolume.supplierId` (60 308 → producer, 2 → company). The other 14 FK columns referencing `Company` have **zero** producer rows. `DeliveryVolume.buyerId` is always a curated company.
- Producer rows have only `name`, `orgNr`, `country`, `metadata` populated (0 have `hqCity`/`naceCode`/`legalForm`/`employees`).

---

# PHASE 1 — UI coherence (no DB, low risk)

### Task 1: Branch and worktree

**Files:** none (git only)

- [ ] **Step 1: Create an isolated worktree and branch**

Per superpowers:using-git-worktrees, create a worktree off `main` on branch `food-tg/koherens-produsentseparasjon-2026-05-20`. All subsequent work happens there.

- [ ] **Step 2: Confirm clean baseline**

Run: `npm run lint && npm run build`
Expected: both succeed. If `build` fails on a pre-existing issue, note it and continue — do not fix unrelated breakage.

---

### Task 2: Extract nav config and fix Norwegian characters

The sidebar nav is defined inline in `Sidebar.tsx` as `navGroups` with ASCII-stripped Norwegian ("Moter", "soknader", "Okonomi"). Extract it to a data module so it is testable, then fix the characters.

**Files:**
- Create: `src/lib/data/nav.ts`
- Create: `tests/lib/nav-labels.test.ts`
- Modify: `src/components/layout/Sidebar.tsx:6-72` (remove inline `navGroups`, import it)

- [ ] **Step 1: Write the failing test**

Create `tests/lib/nav-labels.test.ts`:

```ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { navGroups } from '../../src/lib/data/nav'

describe('nav labels', () => {
  it('has no ASCII-stripped Norwegian characters', () => {
    const broken = ['Moter', 'soknader', 'Okonomi', 'Aktorer', 'eiertraer',
      'Kryssstyrer', 'Leverandorrelasjoner', 'primaerleveranser', 'spormal',
      'Nokkelpersoner', 'Sok pa tvers']
    const text = navGroups.flatMap(g => g.items.flatMap(i => [i.name, i.description])).join(' | ')
    for (const token of broken) {
      assert.ok(!text.includes(token), `nav still contains stripped token "${token}"`)
    }
  })

  it('every item has a name, href and description', () => {
    for (const group of navGroups) {
      for (const item of group.items) {
        assert.ok(item.name && item.href && item.description, `incomplete item: ${JSON.stringify(item)}`)
      }
    }
  })
})
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `node --import=tsx --test tests/lib/nav-labels.test.ts`
Expected: FAIL — `Cannot find module '../../src/lib/data/nav'`.

- [ ] **Step 3: Create `src/lib/data/nav.ts` with corrected characters**

Move the `navGroups` array out of `Sidebar.tsx` into this file, exporting it, with every Norwegian character restored. Apply exactly these corrections (display strings only — **`href` values are unchanged**, they are real route paths):

| Field | Before | After |
|---|---|---|
| item name | `Moter` | `Møter` |
| Møter description | `Motesammendrag og referater` | `Møtesammendrag og referater` |
| Tidslinje description | `Faser og soknader` | `Faser og søknader` |
| Eierskap description | `Konsernstrukturer og eiertraer` | `Konsernstrukturer og eiertrær` |
| Styremedlemmer description | `Kryssstyrer og nettverk` | `Krysstyrer og nettverk` |
| Forsyningskjede description | `Leverandorrelasjoner, primaerleveranser og selvhandel` | `Leverandørrelasjoner, primærleveranser og selvhandel` |
| Havbruk description | `Lokaliteter og soknader (Fiskeridir)` | `Lokaliteter og søknader (Fiskeridir)` |
| Sirkularitet description | `R-stige, 10 spormal, looper og caser` | `R-stige, 10 spørsmål, looper og caser` |
| item name | `Okonomi` | `Økonomi` |
| item name | `Aktorer` | `Aktører` |
| Personer description | `Nokkelpersoner og roller` | `Nøkkelpersoner og roller` |
| item name | `Sok` | `Søk` |
| Søk description | `Sok pa tvers av alt` | `Søk på tvers av alt` |

Keep the existing TypeScript shape. Add an exported type:

```ts
export type NavItem = { name: string; href: string; description: string }
export type NavGroup = { label?: string; items: NavItem[] }
export const navGroups: NavGroup[] = [ /* ...the groups... */ ]
```

(Group structure is reorganised in Task 3 — for this task keep the existing 7-group structure, only fix characters.)

- [ ] **Step 4: Update `Sidebar.tsx` to import the nav config**

In `src/components/layout/Sidebar.tsx`, delete the inline `navGroups` const (lines 6-72) and add at the top:

```ts
import { navGroups } from '@/lib/data/nav'
```

- [ ] **Step 5: Run the test, verify it passes**

Run: `node --import=tsx --test tests/lib/nav-labels.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/data/nav.ts tests/lib/nav-labels.test.ts src/components/layout/Sidebar.tsx
git commit -m "fix(nav): restore Norwegian characters, extract nav config to data module"
```

---

### Task 3: Reorganize navigation groups

Entities (Selskaper, Personer, Aktører, Søk) are currently misfiled under the "Bibliotek" group. Apply the grouping approved in the spec (§3b).

**Files:**
- Modify: `src/lib/data/nav.ts`
- Modify: `tests/lib/nav-labels.test.ts`

- [ ] **Step 1: Add a structural test**

Append to `tests/lib/nav-labels.test.ts`:

```ts
describe('nav structure', () => {
  it('Søk is reachable from the top group, not Bibliotek', () => {
    const top = navGroups.find(g => !g.label)
    assert.ok(top?.items.some(i => i.href === '/sok'), 'Søk should be in the top (unlabelled) group')
  })
  it('Bibliotek group no longer contains entity pages', () => {
    const bib = navGroups.find(g => g.label === 'Bibliotek')
    const entityHrefs = ['/selskap', '/personer', '/aktorer', '/sok']
    for (const href of entityHrefs) {
      assert.ok(!bib?.items.some(i => i.href === href), `${href} should not be under Bibliotek`)
    }
  })
  it('has a Produsenter group with the producer register', () => {
    const prod = navGroups.find(g => g.label === 'Produsenter & støtte')
    assert.ok(prod?.items.some(i => i.href === '/produsenter'), 'expected /produsenter in Produsenter group')
  })
})
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `node --import=tsx --test tests/lib/nav-labels.test.ts`
Expected: FAIL on the three new structural tests.

- [ ] **Step 3: Rewrite `navGroups` to the approved structure**

In `src/lib/data/nav.ts`, set `navGroups` to exactly this structure (keep the corrected descriptions from Task 2):

```ts
export const navGroups: NavGroup[] = [
  { items: [
    { name: 'Oversikt', href: '/', description: 'Fase, fremdrift, neste steg' },
    { name: 'Søk', href: '/sok', description: 'Søk på tvers av alt' },
  ]},
  { label: 'Intern', items: [
    { name: 'Team', href: '/team', description: 'Medlemmer og roller' },
    { name: 'Møter', href: '/moter', description: 'Møtesammendrag og referater' },
    { name: 'Kommunikasjon', href: '/kommunikasjon', description: 'E-post og korrespondanse' },
    { name: 'Mandat', href: '/mandat', description: 'Food TG scope, claims og validering' },
    { name: 'Metodikk', href: '/metodikk', description: 'Ten Step, KPIs og deep research-prompter' },
    { name: 'Tidslinje', href: '/tidslinje', description: 'Faser og søknader' },
  ]},
  { label: 'Selskap & eierskap', items: [
    { name: 'Selskaper', href: '/selskap', description: 'Selskapsdata og regnskap' },
    { name: 'Eierskap', href: '/eierskap', description: 'Konsernstrukturer og eiertrær' },
    { name: 'Styremedlemmer', href: '/styremedlemmer', description: 'Krysstyrer og nettverk' },
    { name: 'Personer', href: '/personer', description: 'Nøkkelpersoner og roller' },
    { name: 'Eiendommer', href: '/eiendommer', description: 'Selskapseiendommer og lokaler' },
  ]},
  { label: 'Matsystem', items: [
    { name: 'Verdikjede', href: '/verdikjede', description: 'Nordisk verdikjedeanalyse (jord til bord)' },
    { name: 'Forsyningskjede', href: '/forsyningskjede', description: 'Leverandørrelasjoner, primærleveranser og selvhandel' },
    { name: 'Havbruk', href: '/havbruk', description: 'Lokaliteter og søknader (Fiskeridir)' },
    { name: 'Sirkularitet', href: '/sirkularitet', description: 'R-stige, 10 spørsmål, looper og caser' },
    { name: 'Økonomi', href: '/okonomi', description: 'Finansielle trender og sammenligning' },
  ]},
  { label: 'Produsenter & støtte', items: [
    { name: 'Produsentregister', href: '/produsenter', description: 'Jordbruksforetak fra register (rådata)' },
    { name: 'Subsidier', href: '/subsidier', description: 'Tilskudd per kommune, ordning og mottaker' },
  ]},
  { label: 'Nordisk', items: [
    { name: 'Sammenligning', href: '/sammenligning', description: 'Nordisk sammenligning' },
    { name: 'Politikk', href: '/politikk', description: 'Nordisk matpolitikk-sammenligning' },
    { name: 'Kart', href: '/kart', description: 'Butikker og kommunegrenser' },
    { name: 'Media', href: '/media', description: 'Medieomtale og narrativer' },
  ]},
  { label: 'Kunnskap', items: [
    { name: 'Innsikt', href: '/innsikt', description: 'Forskning, kartlegging, analyse' },
    { name: 'Forskningsrunder', href: '/forskningsrunder', description: 'Food Research Process 20. april 2026' },
    { name: 'Akademia', href: '/masteroppgaver', description: 'Master- og PhD-avhandlinger' },
    { name: 'Graf', href: '/graf', description: 'Kunnskapsgraf og koblinger' },
    { name: 'Aktører', href: '/aktorer', description: 'Prioritering, asks og relasjoner' },
  ]},
  { label: 'Bibliotek', items: [
    { name: 'Rapporter', href: '/rapporter', description: 'Offentlige og bransjeanalyser' },
    { name: 'Bibliotek', href: '/bibliotek', description: 'Fulltekst forskningsdokumenter' },
    { name: 'Kilder', href: '/kilder', description: 'Dokumenter og referanser' },
  ]},
]
```

Note: `/produsenter` is created in Task 17. The nav link will 404 until then — acceptable within the same plan.

- [ ] **Step 4: Run the test, verify it passes**

Run: `node --import=tsx --test tests/lib/nav-labels.test.ts`
Expected: PASS (all tests).

- [ ] **Step 5: Mark the "Intern" group visually**

In `src/components/layout/Sidebar.tsx`, find where `group.label` is rendered (around line 93-96). When `group.label === 'Intern'`, append a small muted "internt" badge next to the label so internal-only sections are visibly distinct (the app is heading toward external sharing). Example:

```tsx
{group.label && (
  <p className="px-3 mb-1 text-[10px] uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
    {group.label}
    {group.label === 'Intern' && (
      <span className="rounded bg-stone-100 px-1 text-[9px] normal-case text-stone-500">internt</span>
    )}
  </p>
)}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/data/nav.ts tests/lib/nav-labels.test.ts src/components/layout/Sidebar.tsx
git commit -m "feat(nav): reorganize groups, mark internal section"
```

---

### Task 4: Fix content diacritics in the Food TG mandate data

`src/lib/data/food-tg-mandate.ts` and `src/app/mandat/MandatContent.tsx` contain hand-typed strings with inconsistently stripped ø/æ/å (e.g. `Forelopig`, `Kjor`, `sporsmal`, `Miljodirektoratet`, `tverrgaende`). There is no slugify function — it is data-at-rest. Fix is a direct text correction.

**Files:**
- Modify: `src/lib/data/food-tg-mandate.ts`
- Modify: `src/app/mandat/MandatContent.tsx` (line ~228: `"Kjor sprinten..."`)
- Create: `tests/lib/food-tg-mandate-diacritics.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/lib/food-tg-mandate-diacritics.test.ts`:

```ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

describe('food-tg-mandate diacritics', () => {
  const files = [
    'src/lib/data/food-tg-mandate.ts',
    'src/app/mandat/MandatContent.tsx',
  ]
  // Word-boundary patterns for known stripped forms. Each MUST be absent.
  const strippedPatterns = [
    /\bForelopig\b/, /\btverrgaende\b/, /\bKjor\b/, /\bMiljodirektoratet\b/,
    /\bsporsmal\b/, /\bforelopig\b/, /\blaase\b/, /\bsidestroem\b/,
    /\bforproteiner\b/, /\bForaktor/, /\bkjoper\b/, /\bvaere\b/, /\bgjor\b/,
  ]
  for (const file of files) {
    it(`${file} has no known stripped Norwegian tokens`, () => {
      const text = readFileSync(file, 'utf8')
      for (const pat of strippedPatterns) {
        assert.ok(!pat.test(text), `${file} still contains ${pat}`)
      }
    })
  }
})
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `node --import=tsx --test tests/lib/food-tg-mandate-diacritics.test.ts`
Expected: FAIL — multiple stripped tokens found.

- [ ] **Step 3: Correct the strings**

In `src/lib/data/food-tg-mandate.ts` and `src/app/mandat/MandatContent.tsx`, restore Norwegian characters in every string literal. Read each file end to end and fix each occurrence — common corrections: `Forelopig`→`Foreløpig`, `tverrgaende`→`tverrgående`, `Kjor`→`Kjør`, `Miljodirektoratet`→`Miljødirektoratet`, `sporsmal`→`spørsmål`, `mote`→`møte`, `laase`→`låse`, `ma`→`må`, `pa`→`på`, `gjor`→`gjør`, `kjoper`→`kjøper`, `sidestroem`→`sidestrøm`, `forproteiner`→`fôrproteiner`, `Foraktor`→`Fôraktør`, `vaere`→`være`, `ravare`→`råvare`, `lofter`→`løfter`. Verify against the rendered `/mandat` page (Task 20 browser check). Do **not** change identifiers, keys, or claim codes (`CL-A-020` etc.) — only human-readable display text.

- [ ] **Step 4: Run the test, verify it passes**

Run: `node --import=tsx --test tests/lib/food-tg-mandate-diacritics.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/data/food-tg-mandate.ts src/app/mandat/MandatContent.tsx tests/lib/food-tg-mandate-diacritics.test.ts
git commit -m "fix(mandat): restore stripped Norwegian characters in mandate content"
```

---

### Task 5: Fix the "Phase 4-5" inconsistency in phase data

`src/lib/data/phases.ts` uses English `weeks` values (`'Phase 4-5'`, `'Phase 1-3'`) rendered on the homepage next to Norwegian text.

**Files:**
- Modify: `src/lib/data/phases.ts` (line 19 `'Phase 1-3'`, line 31 `'Phase 4-5'`, and any other `weeks` values)

- [ ] **Step 1: Normalise every `weeks` value to Norwegian**

Read `src/lib/data/phases.ts`. For each phase object, change the `weeks` field from English `Phase N-M` to Norwegian `Uke N-M` (the field is literally "weeks"). Confirmed values: line 19 `'Phase 1-3'` → `'Uke 1-3'`, line 31 `'Phase 4-5'` → `'Uke 4-5'`. Check the other two phase objects and apply the same `Phase`→`Uke` correction if present.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/lib/data/phases.ts
git commit -m "fix(phases): use Norwegian Uke labels instead of English Phase"
```

---

### Task 6: Make the sidebar phase indicator dynamic

`Sidebar.tsx:130` hardcodes `1 / 4`, contradicting the homepage's computed active phase. Feed it from `getPhases()` via the layout.

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Make the layout fetch phases and pass them to Sidebar**

In `src/app/layout.tsx`, make `RootLayout` async and fetch phases:

```tsx
import { getPhases } from '@/lib/queries/project'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const phases = await getPhases()
  const activeIndex = phases.findIndex(p => p.status === 'pagar')
  // ...
  return (
    // ...
    <Sidebar activePhase={activeIndex >= 0 ? activeIndex + 1 : 1} totalPhases={phases.length} />
    // ...
  )
}
```

- [ ] **Step 2: Accept the props in Sidebar**

In `src/components/layout/Sidebar.tsx`, change the component signature and the footer block (currently lines 126-137):

```tsx
export function Sidebar({ activePhase, totalPhases }: { activePhase: number; totalPhases: number }) {
```

Replace the hardcoded `<span className="text-stone-600 font-medium">1 / 4</span>` with:

```tsx
<span className="text-stone-600 font-medium">{activePhase} / {totalPhases}</span>
```

- [ ] **Step 3: Verify build and the number**

Run: `npm run build`
Expected: succeeds. The sidebar "Fase" value now equals the homepage's active phase.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/components/layout/Sidebar.tsx
git commit -m "fix(sidebar): drive phase indicator from getPhases, single source of truth"
```

---

### Task 7: Build the homepage front door

The homepage (`src/app/page.tsx`) opens straight into "Aktiv fase" with the phase name as the `<h1>`. Add an intro section above it.

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add the intro section above the phase banner**

In `src/app/page.tsx`, inside the returned `<div className="space-y-5">`, insert this block as the **first child**, before the `Aktiv fase` banner. Also change the phase banner's `<h1>` (line 35) to an `<h2>` so the page has a single, correct top-level heading.

```tsx
<header className="space-y-3">
  <h1 className="text-xl font-bold text-stone-900">Food Systems 2026</h1>
  <p className="text-sm text-stone-600 max-w-2xl">
    Kunnskapsbase som kartlegger selskapsstrukturer, eierskap, makt og forsyningskjeder
    i den norske og nordiske matsektoren — underlaget for NCH-transisjonsgruppens
    leveranse mot juni 2026.
  </p>
  <p className="text-sm text-stone-500">
    Ny her?{' '}
    <Link href="/innsikt" className="text-emerald-700 underline hover:text-emerald-800">
      Begynn med Innsikt
    </Link>{' '}
    — datadrevet status på markedsstruktur, selvforsyning og funn.
  </p>
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
</header>
```

`Link` is already imported in `page.tsx` (line 1).

- [ ] **Step 2: Verify build and the page**

Run: `npm run build`
Expected: succeeds. Load `/` — the page opens with the project name and one-sentence description; the phase banner follows below.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(home): add front-door intro, new-here link and glossary"
```

---

# PHASE 2 — Producer separation: schema & migration (DB, higher risk)

### Task 8: Investigate and resolve the 3 outlier rows

Before migrating, resolve the 1 `Subsidy` row and 2 `DeliveryVolume` rows whose FK points at a non-producer company. Per spec decision: treat them as producers if they are farms/primary producers.

**Files:** none yet (investigation only — output feeds Task 10)

- [ ] **Step 1: Identify the 3 outlier entities**

Run against the local DB:

```sql
-- the 1 Subsidy outlier
SELECT DISTINCT c.id, c."orgNr", c.name, c."valueChainStage", c."legalForm"
FROM "Subsidy" s JOIN "Company" c ON s."companyId" = c.id
WHERE c."valueChainStage" IS DISTINCT FROM 'production';
-- the 2 DeliveryVolume outliers
SELECT DISTINCT c.id, c."orgNr", c.name, c."valueChainStage", c."legalForm"
FROM "DeliveryVolume" dv JOIN "Company" c ON dv."supplierId" = c.id
WHERE c."valueChainStage" IS DISTINCT FROM 'production';
```

- [ ] **Step 2: Classify and record orgNrs**

For each of the (up to 3) entities: if it is a farm / primary producer (a `GÅRD`, `SAMDRIFT`, an individual person, a small `SLAKTERI`, etc.), record its `orgNr` — it will be reclassified to a producer in Task 10. **If any entity is a genuine curated company** (one of the 51, e.g. a NorgesGruppen-type firm), STOP and flag to the user: the migration design assumes all suppliers/subsidy recipients are producers, and a real exception needs a design decision before proceeding.

Write the confirmed orgNr list into Task 10's migration SQL.

---

### Task 9: Add the `Producer` model to the Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `tests/lib/producer-schema.test.ts`

- [ ] **Step 1: Write the failing schema test**

Create `tests/lib/producer-schema.test.ts` (mirrors the existing `provenance-schema.test.ts` pattern):

```ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

describe('Producer schema', () => {
  const schema = readFileSync('prisma/schema.prisma', 'utf8')
  it('defines a Producer model', () => {
    assert.match(schema, /model Producer \{/)
  })
  it('Subsidy references Producer, not Company', () => {
    const block = schema.slice(schema.indexOf('model Subsidy'), schema.indexOf('model Subsidy') + 600)
    assert.match(block, /producerId\s+String/)
    assert.match(block, /producer\s+Producer/)
    assert.ok(!/companyId/.test(block), 'Subsidy must not keep companyId')
  })
  it('DeliveryVolume supplier is a Producer', () => {
    const block = schema.slice(schema.indexOf('model DeliveryVolume'), schema.indexOf('model DeliveryVolume') + 700)
    assert.match(block, /supplier\s+Producer\s+@relation\("DeliverySupplier"/)
  })
})
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `node --import=tsx --test tests/lib/producer-schema.test.ts`
Expected: FAIL — no `Producer` model.

- [ ] **Step 3: Add the `Producer` model**

In `prisma/schema.prisma`, add after the `Company` model block:

```prisma
model Producer {
  id           String           @id
  orgNr        String           @unique
  name         String
  country      String           @default("NO")
  municipality String?
  metadata     Json?
  subsidies    Subsidy[]
  deliveries   DeliveryVolume[] @relation("DeliverySupplier")

  @@index([country])
}
```

- [ ] **Step 4: Repoint `Subsidy`**

In the `Subsidy` model: replace `companyId String` with `producerId String`, and `company Company @relation(fields: [companyId], references: [id])` with `producer Producer @relation(fields: [producerId], references: [id])`. Replace `@@index([companyId])` with `@@index([producerId])`. Keep the `scheme` and `year` indexes.

- [ ] **Step 5: Repoint `DeliveryVolume` supplier**

In the `DeliveryVolume` model: change `supplier Company @relation("DeliverySupplier", fields: [supplierId], references: [id])` to `supplier Producer @relation("DeliverySupplier", fields: [supplierId], references: [id])`. `buyer`/`buyerId` stay as `Company?`.

- [ ] **Step 6: Drop the obsolete `Company` back-relations**

In the `Company` model, remove the `subsidies Subsidy[]` line and the `deliveriesFrom DeliveryVolume[] @relation("DeliverySupplier")` line. Keep `deliveriesTo DeliveryVolume[] @relation("DeliveryBuyer")`.

- [ ] **Step 7: Regenerate the client and run the test**

Run: `npm run db:generate && node --import=tsx --test tests/lib/producer-schema.test.ts`
Expected: client regenerates; test PASSES. (TypeScript elsewhere will not compile yet — fixed in Phase 3. Do not run `npm run build` here.)

- [ ] **Step 8: Commit**

```bash
git add prisma/schema.prisma tests/lib/producer-schema.test.ts
git commit -m "feat(schema): add Producer model, repoint Subsidy and DeliveryVolume [skip-migration]"
```

(The `[skip-migration]` tag keeps the CI guard green for this commit; the migration file lands in Task 10.)

---

### Task 10: Write the idempotent migration SQL

Prod applies every `migration.sql` on every deploy, so this must be fully idempotent.

**Files:**
- Create: `prisma/migrations/20260520_producer_separation/migration.sql`
- Create: `tests/lib/producer-migration.test.ts`

- [ ] **Step 1: Write the failing idempotency test**

Create `tests/lib/producer-migration.test.ts`:

```ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

describe('producer separation migration', () => {
  const sql = readFileSync('prisma/migrations/20260520_producer_separation/migration.sql', 'utf8')
  it('creates the Producer table idempotently', () => {
    assert.match(sql, /CREATE TABLE IF NOT EXISTS "Producer"/)
  })
  it('guards the data move so it runs once', () => {
    assert.match(sql, /IF EXISTS \(SELECT 1 FROM "Company" WHERE "valueChainStage" = 'production'/)
  })
  it('copies rows without clobbering on re-apply', () => {
    assert.match(sql, /ON CONFLICT \("id"\) DO NOTHING/)
  })
  it('drops old company FKs before deleting producer rows from Company', () => {
    const dropSub = sql.indexOf('DROP CONSTRAINT IF EXISTS "Subsidy_companyId_fkey"')
    const del = sql.indexOf('DELETE FROM "Company"')
    assert.ok(dropSub > -1 && del > -1 && dropSub < del, 'FK drops must precede the Company delete')
  })
})
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `node --import=tsx --test tests/lib/producer-migration.test.ts`
Expected: FAIL — migration file does not exist.

- [ ] **Step 3: Write the migration**

Create `prisma/migrations/20260520_producer_separation/migration.sql`. Replace `<ORGNR_LIST>` with the comma-separated quoted orgNrs from Task 8 (or remove the reclassification statement entirely if Task 8 found no outliers needing it):

```sql
-- Producer separation: move agricultural producers out of "Company" into "Producer".
-- Idempotent — re-applied on every Coolify deploy by apply-prod-migrations.sh.

-- 1. Producer table -------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Producer" (
  "id"           TEXT NOT NULL,
  "orgNr"        TEXT NOT NULL,
  "name"         TEXT NOT NULL,
  "country"      TEXT NOT NULL DEFAULT 'NO',
  "municipality" TEXT,
  "metadata"     JSONB,
  CONSTRAINT "Producer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Producer_orgNr_key" ON "Producer" ("orgNr");
CREATE INDEX IF NOT EXISTS "Producer_country_idx" ON "Producer" ("country");

-- 2. Additive column on Subsidy ------------------------------------------
ALTER TABLE "Subsidy" ADD COLUMN IF NOT EXISTS "producerId" TEXT;

-- 3. One-time data move (guard skips it once producers have left Company) -
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Company" WHERE "valueChainStage" = 'production') THEN

    -- 3a. Reclassify Task-8 outliers so they migrate as producers.
    UPDATE "Company" SET "valueChainStage" = 'production'
    WHERE "orgNr" IN (<ORGNR_LIST>);

    -- 3b. Copy producer rows into Producer (id reused verbatim).
    INSERT INTO "Producer" ("id", "orgNr", "name", "country", "metadata")
    SELECT "id", "orgNr", "name", "country", "metadata"
    FROM "Company" WHERE "valueChainStage" = 'production'
    ON CONFLICT ("id") DO NOTHING;

    -- 3c. Backfill Subsidy.producerId.
    UPDATE "Subsidy" s SET "producerId" = s."companyId"
    WHERE s."producerId" IS NULL
      AND EXISTS (SELECT 1 FROM "Producer" p WHERE p."id" = s."companyId");

    -- 3d. Drop the Company-targeting FKs so the delete can proceed.
    ALTER TABLE "Subsidy" DROP CONSTRAINT IF EXISTS "Subsidy_companyId_fkey";
    ALTER TABLE "DeliveryVolume" DROP CONSTRAINT IF EXISTS "DeliveryVolume_supplierId_fkey";

    -- 3e. Remove migrated producers from Company.
    DELETE FROM "Company" WHERE "valueChainStage" = 'production';

  END IF;
END $$;

-- 4. Finalise Subsidy -----------------------------------------------------
ALTER TABLE "Subsidy" DROP CONSTRAINT IF EXISTS "Subsidy_companyId_fkey";
ALTER TABLE "Subsidy" DROP COLUMN IF EXISTS "companyId";
ALTER TABLE "Subsidy" ALTER COLUMN "producerId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "Subsidy_producerId_idx" ON "Subsidy" ("producerId");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Subsidy_producerId_fkey') THEN
    ALTER TABLE "Subsidy" ADD CONSTRAINT "Subsidy_producerId_fkey"
      FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- 5. Finalise DeliveryVolume.supplierId (values unchanged, target changes)-
ALTER TABLE "DeliveryVolume" DROP CONSTRAINT IF EXISTS "DeliveryVolume_supplierId_fkey";
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DeliveryVolume_supplierId_producer_fkey') THEN
    ALTER TABLE "DeliveryVolume" ADD CONSTRAINT "DeliveryVolume_supplierId_producer_fkey"
      FOREIGN KEY ("supplierId") REFERENCES "Producer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
```

If Task 8 found no outliers, delete statement 3a entirely.

- [ ] **Step 4: Run the test, verify it passes**

Run: `node --import=tsx --test tests/lib/producer-migration.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add prisma/migrations/20260520_producer_separation tests/lib/producer-migration.test.ts
git commit -m "feat(db): add idempotent producer-separation migration"
```

---

### Task 11: Apply the migration locally and verify

**Files:** none (DB operation + verification)

- [ ] **Step 1: Snapshot pre-migration counts**

Run against the local DB and record the numbers:

```sql
SELECT
  (SELECT count(*) FROM "Company") AS companies,
  (SELECT count(*) FROM "Company" WHERE "valueChainStage"='production') AS producers_in_company,
  (SELECT count(*) FROM "Subsidy") AS subsidies,
  (SELECT count(*) FROM "DeliveryVolume") AS deliveries;
```

Expected baseline: companies 38 976, producers_in_company 38 925, subsidies 179 311, deliveries 60 310.

- [ ] **Step 2: Apply the migration**

Run: `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f prisma/migrations/20260520_producer_separation/migration.sql`
Expected: completes with no error.

- [ ] **Step 3: Verify post-migration counts**

```sql
SELECT
  (SELECT count(*) FROM "Company") AS companies,
  (SELECT count(*) FROM "Producer") AS producers,
  (SELECT count(*) FROM "Subsidy" WHERE "producerId" IS NULL) AS subsidies_null_fk,
  (SELECT count(*) FROM "DeliveryVolume" dv LEFT JOIN "Producer" p ON dv."supplierId"=p.id WHERE p.id IS NULL) AS deliveries_orphan_supplier;
```

Expected: companies 51, producers 38 925 (+ up to 3 outliers reclassified in Task 8), subsidies_null_fk 0, deliveries_orphan_supplier 0.

- [ ] **Step 4: Verify idempotency — re-apply**

Run the same `psql ... -f` command a second time.
Expected: completes with no error; the counts from Step 3 are unchanged.

- [ ] **Step 5: Verify the schema matches Prisma**

Run: `npm run db:check-drift`
Expected: no drift between `prisma/schema.prisma` and the database.

- [ ] **Step 6: Commit**

No code change — record verification in the task checklist. If anything failed, do not proceed; fix the migration (Task 10) and re-run.

---

# PHASE 3 — Query layer and pages

### Task 12: Create the `producers.ts` query module

**Files:**
- Create: `src/lib/queries/producers.ts`

- [ ] **Step 1: Write the query module**

Create `src/lib/queries/producers.ts`:

```ts
import { prisma } from '@/lib/db'
import { isPrismaDataUnavailable } from './prisma-errors'

export type ProducerListRow = {
  id: string
  orgNr: string
  name: string
  country: string
  municipality: string | null
  subsidyCount: number
  deliveryCount: number
}

export async function getProducerCount(): Promise<number> {
  try {
    return await prisma.producer.count()
  } catch (error) {
    if (isPrismaDataUnavailable(error)) return 0
    throw error
  }
}

export async function getProducers(opts?: { take?: number; skip?: number; search?: string }): Promise<ProducerListRow[]> {
  const { take = 100, skip = 0, search } = opts ?? {}
  try {
    const rows = await prisma.producer.findMany({
      where: search
        ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { orgNr: { contains: search } }] }
        : undefined,
      orderBy: { name: 'asc' },
      take,
      skip,
      include: { _count: { select: { subsidies: true, deliveries: true } } },
    })
    return rows.map(r => ({
      id: r.id, orgNr: r.orgNr, name: r.name, country: r.country, municipality: r.municipality,
      subsidyCount: r._count.subsidies, deliveryCount: r._count.deliveries,
    }))
  } catch (error) {
    if (isPrismaDataUnavailable(error)) return []
    throw error
  }
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: no errors in `src/lib/queries/producers.ts` (errors elsewhere are fixed in later tasks).

- [ ] **Step 3: Commit**

```bash
git add src/lib/queries/producers.ts
git commit -m "feat(queries): add producers query module"
```

---

### Task 13: Decouple the company query layer and pages from Subsidy/DeliveryVolume

`Company` now holds ~51 rows and no longer has `subsidies` / `deliveriesFrom` relations (Task 9 removed them). The chunked-paging / `includeAll` / 55k-bind-cap logic in `getCompanies()` is also obsolete. Update `companies.ts` and every consumer of the dropped relations.

**Files:**
- Modify: `src/lib/queries/companies.ts`
- Modify: `src/lib/queries/ownership.ts`
- Modify: `src/app/selskap/[id]/page.tsx` (and any `[id]` content component)
- Modify: `src/app/selskap/SelskaperContent.tsx`
- Modify: `src/app/eierskap/EierskapContent.tsx`

- [ ] **Step 1: Remove chunked paging and the `includeAll` branch**

In `src/lib/queries/companies.ts`:
- In `runCompanyQuery`, replace the chunked `fetchPage` loop (lines ~66-79) with a single `return prisma.company.findMany({ where, include, orderBy: { name: 'asc' } })`.
- Drop the `includeAll` parameter from `runCompanyQuery` and `getCompanies` and the `trackedOnly` filter — with only curated companies left, `where` no longer needs the tracked-relation `OR`. `getCompanies` returns all `Company` rows.
- Remove the comment on lines ~67-68 about the 55k bind-parameter cap.

- [ ] **Step 2: Remove the `subsidies` relation from `companies.ts`**

- In `getCompanies`, remove `subsidies: true` from `baseCount` (line ~44). Update the `NormalizedCompanyRow` type and `normalizeCompanyRow` (lines ~82-104) to drop the `subsidies` count field.
- In `getCompanyById`, remove `subsidies: { orderBy: { year: 'desc' } }` from `baseInclude` (line ~151).

- [ ] **Step 3: Sweep for remaining `Company`→Subsidy/Delivery references**

Run: `grep -rn "subsidies\|deliveriesFrom" src/lib/queries src/app`

Fix every hit so nothing reads `Company.subsidies` or `Company.deliveriesFrom` (do **not** touch `subsidies.ts` / `subsidies-agg.ts` — those are the producer-side queries handled in Task 15):
- `src/app/selskap/[id]/page.tsx` and its content component — remove the per-company subsidy section. Curated companies no longer carry subsidies; producer subsidies live at `/subsidier` and `/produsenter`.
- `src/lib/queries/ownership.ts` and `src/app/eierskap/EierskapContent.tsx` — remove the per-konsern subsidy aggregation ("Tilskudd inn" / "Tilskudd i trær"). The fresh-eyes review already showed these as "—" / `0` for curated companies, so this removes dead columns, not data.
- `src/app/selskap/SelskaperContent.tsx` — remove any display of `_count.subsidies`.

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: succeeds with no references to the removed `Company` relations.

- [ ] **Step 5: Commit**

```bash
git add src/lib/queries/companies.ts src/lib/queries/ownership.ts "src/app/selskap" "src/app/eierskap"
git commit -m "refactor(company): decouple Company query layer and pages from Subsidy/DeliveryVolume"
```

---

### Task 14: Update `graph.ts` so producers are no longer graph nodes

**Files:**
- Modify: `src/lib/queries/graph.ts`

- [ ] **Step 1: Confirm the company query is now curated-only**

In `src/lib/queries/graph.ts`, the `prisma.company.findMany({ select: { id, name, orgNr } })` at line ~243 now returns only the ~51 curated companies — no change needed to that line. Verify no code path adds `Producer` rows as nodes. Leave producers out of the graph entirely (spec §out-of-scope: producers are leaf nodes, no graph view).

- [ ] **Step 2: Verify `graph.ts` type-checks**

Run: `npx tsc --noEmit 2>&1 | grep "queries/graph.ts" || echo "graph.ts clean"`
Expected: `graph.ts clean`.

- [ ] **Step 3: Commit (only if changes were made)**

```bash
git add src/lib/queries/graph.ts
git commit -m "refactor(graph): producers excluded — Company is curated-only"
```

---

### Task 15: Update subsidy queries to read from `Producer`

`subsidies.ts` and `subsidies-agg.ts` join `Subsidy.companyId` → `Company`. After the migration, `Subsidy` has `producerId` → `Producer`.

**Files:**
- Modify: `src/lib/queries/subsidies.ts`
- Modify: `src/lib/queries/subsidies-agg.ts`

- [ ] **Step 1: Repoint `subsidies.ts`**

In `src/lib/queries/subsidies.ts`: change every `groupBy(['companyId'])` to `groupBy(['producerId'])`; change the `prisma.company.findMany({ where: { id: { in: companyIds } } })` at line ~54 to `prisma.producer.findMany({ where: { id: { in: producerIds } } })`; rename local `companyId`/`companyIds` variables to `producerId`/`producerIds`.

- [ ] **Step 2: Repoint `subsidies-agg.ts`**

In `src/lib/queries/subsidies-agg.ts`: change every `groupBy(['companyId', ...])` / `groupBy(['companyId'])` to use `producerId` (lines ~26, 89, 150, 195). Change the two `prisma.company.findMany(...)` calls (lines ~96-99, 157-160) to `prisma.producer.findMany(...)`. **Note:** these selected `Company.valueChainStage` for stage-coverage — `Producer` has no `valueChainStage` (all producers are one stage). Simplify `getSubsidiesBySchemeAndStage` and `getSubsidyStageCoverage` to treat all subsidy recipients as a single "produsent" stage; remove the per-stage split. In `getTopSubsidyRecipients` (line ~204), change the `Company.findMany` select (it used `_count` of `shareholders`/`boardMembers`/`parentOf`/`childOf` — `Producer` has none of those) to select `id, name, orgNr, municipality, metadata` plus `_count: { select: { subsidies: true, deliveries: true } }`.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -E "subsidies(-agg)?.ts" || echo "subsidy queries clean"`
Expected: `subsidy queries clean`.

- [ ] **Step 4: Update `/subsidier` content if shapes changed**

If the `getSubsidiesBySchemeAndStage` / `getSubsidyStageCoverage` / `getTopSubsidyRecipients` return shapes changed, update `src/app/subsidier/SubsidierContent.tsx` to match. Run `npm run build` and fix any type errors in `SubsidierContent.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/queries/subsidies.ts src/lib/queries/subsidies-agg.ts src/app/subsidier/SubsidierContent.tsx
git commit -m "refactor(subsidies): read recipients from Producer instead of Company"
```

---

### Task 16: Update `supply-chain.ts` company counting

`getSupplyChainDataQuality()` does `prisma.company.count()` and `groupBy(['valueChainStage'])` — these counted all 38 976 rows.

**Files:**
- Modify: `src/lib/queries/supply-chain.ts`

- [ ] **Step 1: Repoint the company-count code**

In `src/lib/queries/supply-chain.ts`, in `getSupplyChainDataQuality` (around lines 669-675): `prisma.company.count()` now returns ~51 (curated companies) — correct, keep it but ensure the surrounding labels say "kartlagte selskaper", not a register total. The `groupBy(['valueChainStage'])` no longer includes a `production` bucket; add `prisma.producer.count()` as a separate "produsenter" figure. Update `companyStageCoverage` / `knownStageCount` (lines ~792, 798) so they describe the curated set, and surface the producer count as its own labelled metric.

- [ ] **Step 2: Verify and update the page**

Run: `npm run build`
Fix any type errors in `src/app/forsyningskjede/ForsyningskjedeContent.tsx` arising from the changed `SupplyChainDataQuality` shape. Ensure the page labels the producer count as register data, distinct from curated companies.

- [ ] **Step 3: Commit**

```bash
git add src/lib/queries/supply-chain.ts src/app/forsyningskjede/ForsyningskjedeContent.tsx
git commit -m "refactor(supply-chain): count curated companies and producers separately"
```

---

### Task 17: Create the `/produsenter` page

**Files:**
- Create: `src/app/produsenter/page.tsx`
- Create: `src/app/produsenter/ProdusenterContent.tsx`

- [ ] **Step 1: Create the page**

Create `src/app/produsenter/page.tsx`:

```tsx
import { getProducers, getProducerCount } from '@/lib/queries/producers'
import { ProdusenterContent } from './ProdusenterContent'

export const metadata = { title: 'Produsentregister - Food Systems 2026' }

export default async function ProdusenterPage() {
  const [producers, total] = await Promise.all([getProducers({ take: 100 }), getProducerCount()])
  return <ProdusenterContent producers={producers} total={total} />
}
```

- [ ] **Step 2: Create the content component**

Create `src/app/produsenter/ProdusenterContent.tsx` as a client component with a heading "Produsentregister", an explicit "rådata"-style note that this is the raw agricultural register (jordbruksforetak / enkeltpersonforetak from Landbruksdirektoratet, subsidy recipients and delivery suppliers — distinct from the curated `/selskap` companies), the `total` count, a name/orgNr search box, and a table of `producers` (name, orgNr, municipality, subsidyCount, deliveryCount). Follow the visual style of `src/app/selskap/SelskaperContent.tsx` (stone/emerald Tailwind palette, card layout).

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: succeeds. `/produsenter` loads and lists producers.

- [ ] **Step 4: Commit**

```bash
git add src/app/produsenter
git commit -m "feat(produsenter): add producer register page"
```

---

### Task 18: Clean up the `/selskap` page

**Files:**
- Modify: `src/app/selskap/page.tsx`
- Modify: `src/app/selskap/SelskaperContent.tsx`

- [ ] **Step 1: Remove the `?all=1` / "55 000+" affordances**

In `src/app/selskap/page.tsx`, drop the `params.all` / `includeAll` handling — call `getCompanies()` with no args. In `src/app/selskap/SelskaperContent.tsx`: delete the `Vis alle 55 000+ selskaper` link (line ~117) and the `Vis kun kartlagte` toggle (line ~110); fix the description (lines ~100-101) to one accurate sentence — e.g. `` `${companies.length} kartlagte selskaper med regnskap, styre, eierskap og relasjoner.` `` — and remove the "inkl. jordbruksforetak fra subsidieregisteret" copy (producers now live at `/produsenter`).

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: succeeds. `/selskap` shows the curated companies with no "55 000+" link.

- [ ] **Step 3: Commit**

```bash
git add src/app/selskap/page.tsx src/app/selskap/SelskaperContent.tsx
git commit -m "refactor(selskap): drop 55k register affordances, curated companies only"
```

---

### Task 19: Number-consistency pass

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/graf/page.tsx` (verify only)
- Modify: `src/app/eierskap/EierskapContent.tsx` (verify only)

- [ ] **Step 1: Audit and fix homepage KPIs**

In `src/app/page.tsx`, the `FOOD_SYSTEM_KPIS` array (lines 8-13) is hardcoded. Confirm each value is still accurate and add a scope label where a metric differs across pages: `Selvforsyningsgrad` `current: '44%'` — keep, the description already cites Meld. St. 11; `Matsvinn` `'390 000 t'` — append the scope to its `description` so it does not read as contradicting `/verdikjede`'s nordic 3,8 mill t (e.g. description `'Spiselig mat kastet i Norge årlig'`).

- [ ] **Step 2: Verify graf counts**

Load `/graf`. The `company` type-count card now shows ~51 and `isolerte noder` is near zero (producers are gone from the graph). No code change expected — confirm visually. If `graf/page.tsx` has any hardcoded copy implying a large register, correct it.

- [ ] **Step 3: Verify eierskap counts**

Load `/eierskap`. Confirm the "Selskaper" figure (was 20) and tree counts read sensibly against the curated set. No code change expected unless a hardcoded number is wrong.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/app/graf/page.tsx src/app/eierskap/EierskapContent.tsx
git commit -m "fix(coherence): consistent company counts and scoped metric labels"
```

---

# PHASE 4 — Verification and production rollout

### Task 20: Full verification

**Files:** none

- [ ] **Step 1: Run the full test suite**

Run: `npm run test`
Expected: all tests pass, including the new `nav-labels`, `food-tg-mandate-diacritics`, `producer-schema`, `producer-migration` tests.

- [ ] **Step 2: Lint and build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 3: Browser smoke test**

Start `npm run dev` and load each page, checking for the spec's success criteria:
`/` (front-door intro present, h1 = project name, sidebar "Fase" matches banner), `/sok`, `/selskap` (curated only, no "55 000+"), `/produsenter` (register, labelled rådata), `/graf` (isolated nodes near zero, company count ~51), `/subsidier`, `/forsyningskjede`, `/mandat` (no stripped characters), `/eierskap`. Confirm no console errors.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: address issues found in verification"
```

---

### Task 21: Production rollout

The prod DB has prior migration drift; roll out carefully.

**Files:** none

- [ ] **Step 1: Confirm CI is green**

Push the branch. Confirm the `Schema migration guard` workflow passes — the branch both changes `prisma/schema.prisma` and adds `prisma/migrations/20260520_producer_separation/migration.sql`, which satisfies the guard.

- [ ] **Step 2: Snapshot prod counts before merge**

Against the prod DB, run the Task 11 Step 1 count query and record the numbers.

- [ ] **Step 3: Merge and let the deploy hook apply the migration**

Merge to `main`. Coolify's `post_deployment_command` (`scripts/apply-prod-migrations.sh`) applies `20260520_producer_separation/migration.sql` automatically.

- [ ] **Step 4: Verify prod post-deploy**

Run the Task 11 Step 3 count query against prod. Expected: `Company` ~51, `Producer` ~38 925, `subsidies_null_fk` 0, `deliveries_orphan_supplier` 0. Load the prod site and smoke-test the same pages as Task 20 Step 3.

- [ ] **Step 5: Finish the branch**

Per superpowers:finishing-a-development-branch, complete the merge/cleanup.

---

## Self-review notes

- **Spec coverage:** WA1 front door → Task 7. WA2 producer separation → Tasks 8-18. WA3 nav (diacritics/reorg/phase indicator) → Tasks 2, 3, 5, 6. WA4 number consistency → Tasks 18, 19. WA5 content diacritics → Task 4. Migration design, risks, prod runbook → Tasks 10, 11, 21. Success criteria → Task 20 Step 3.
- **Sequencing:** Phase 1/2 (Tasks 1-7) are independent of the DB migration and can ship first. Task 9 commits with `[skip-migration]`; Task 10 adds the migration file so the branch as a whole satisfies the CI guard. Phase 3 depends on Phase 2 being applied locally (Task 11).
- **Known adaptation:** the repo's tests never touch a database, so DB-facing tasks (11, 13-19) verify via SQL count assertions, `npm run build`, `db:check-drift`, and the browser smoke test rather than unit tests. File-content tests are used where the repo pattern supports them (nav, diacritics, schema, migration).
- **Decoupling sweep:** Task 13 Step 3 greps for every consumer of the dropped `Company.subsidies` / `deliveriesFrom` relations, so the producer migration cannot leave a dangling reference in `companies.ts`, `ownership.ts`, the `/selskap` pages or `/eierskap`.
- **Deliberate substitution (not a placeholder):** `<ORGNR_LIST>` in Task 10 is filled from Task 8's live-DB investigation; the plan instructs exactly how, or to delete the statement if no outliers exist.

---

# ADDENDUM (2026-05-20) — Dual-target FK design

**This addendum SUPERSEDES Tasks 9, 10, 13, 15, 16 above.** Tasks 2-8, 11, 12, 14, 17-21 are unaffected.

## Task 8 outcome (investigation complete)

The 3 outlier rows reference two **genuine curated companies**, not farms:

- **Yara International ASA** (`orgNr 986228608`, `valueChainStage='inputs'`) — recipient of **1** `Subsidy` row: a 283 MNOK Enova "Grønn ammoniakk Porsgrunn" tech grant (2022).
- **Felleskjøpet Agri SA** (`orgNr 911608103`, `valueChainStage='inputs'`) — supplier on **2** `DeliveryVolume` rows: 2024 grain self-trade (supplier = buyer = Felleskjøpet), source Landbruksdirektoratet.

Baseline counts confirmed on local DB: Company 38 976 · producers (`valueChainStage='production'`) 38 925 · Subsidy 179 311 · DeliveryVolume 60 310.

**Decision (user, 2026-05-20): dual-target FKs.** `Subsidy` and `DeliveryVolume` each keep a nullable FK to `Company` and gain a nullable FK to `Producer`; exactly one is set per row. Yara and Felleskjøpet stay in `Company` (they are `valueChainStage='inputs'`, so the producer-population query naturally excludes them). **No `<ORGNR_LIST>` reclassification** — statement 3a of the original Task 10 is dropped entirely.

## Task 9 (revised) — Prisma schema, dual FK

`tests/lib/producer-schema.test.ts`:

```ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

describe('Producer schema', () => {
  const schema = readFileSync('prisma/schema.prisma', 'utf8')
  it('defines a Producer model', () => {
    assert.match(schema, /model Producer \{/)
  })
  it('Subsidy keeps companyId and adds producerId (both optional)', () => {
    const block = schema.slice(schema.indexOf('model Subsidy'), schema.indexOf('model Subsidy') + 800)
    assert.match(block, /companyId\s+String\?/)
    assert.match(block, /producerId\s+String\?/)
    assert.match(block, /company\s+Company\?/)
    assert.match(block, /producer\s+Producer\?/)
  })
  it('DeliveryVolume keeps supplier (Company) and adds supplierProducer (Producer)', () => {
    const block = schema.slice(schema.indexOf('model DeliveryVolume'), schema.indexOf('model DeliveryVolume') + 900)
    assert.match(block, /supplier\s+Company\?\s+@relation\("DeliverySupplier"/)
    assert.match(block, /supplierProducer\s+Producer\?\s+@relation\("DeliverySupplierProducer"/)
  })
})
```

`Producer` model (add after `Company`):

```prisma
model Producer {
  id           String           @id
  orgNr        String           @unique
  name         String
  country      String           @default("NO")
  municipality String?
  metadata     Json?
  subsidies    Subsidy[]
  deliveries   DeliveryVolume[] @relation("DeliverySupplierProducer")

  @@index([country])
}
```

`Subsidy` changes: `companyId String` → `companyId String?`; add `producerId String?`; `company Company @relation(...)` → `company Company? @relation(fields: [companyId], references: [id])`; add `producer Producer? @relation(fields: [producerId], references: [id])`; add `@@index([producerId])` (keep the `companyId`, `scheme`, `year` indexes).

`DeliveryVolume` changes: `supplierId String` → `supplierId String?`; add `supplierProducerId String?`; `supplier Company @relation("DeliverySupplier", ...)` → `supplier Company? @relation("DeliverySupplier", fields: [supplierId], references: [id])`; add `supplierProducer Producer? @relation("DeliverySupplierProducer", fields: [supplierProducerId], references: [id])`; add `@@index([supplierProducerId])`. `buyerId`/`buyer` and the `@@unique([supplierOrgNr, commodity, year])` are unchanged.

`Company` model is **UNCHANGED** — it keeps `subsidies Subsidy[]`, `deliveriesFrom DeliveryVolume[] @relation("DeliverySupplier")`, `deliveriesTo DeliveryVolume[] @relation("DeliveryBuyer")` (Company still has 1 subsidy + 2 deliveriesFrom). The original Task 9 Step 6 (drop Company back-relations) is **dropped**.

Commit message keeps the `[skip-migration]` tag.

## Task 10 (revised) — idempotent migration, dual FK

`prisma/migrations/20260520_producer_separation/migration.sql`:

```sql
-- Producer separation (dual-target FK). Idempotent — re-applied on every Coolify deploy.
-- Producers move to "Producer"; Subsidy/DeliveryVolume keep their Company FK and gain a
-- nullable Producer FK so rows referencing curated companies (Yara, Felleskjøpet) survive.

CREATE TABLE IF NOT EXISTS "Producer" (
  "id"           TEXT NOT NULL,
  "orgNr"        TEXT NOT NULL,
  "name"         TEXT NOT NULL,
  "country"      TEXT NOT NULL DEFAULT 'NO',
  "municipality" TEXT,
  "metadata"     JSONB,
  CONSTRAINT "Producer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Producer_orgNr_key" ON "Producer" ("orgNr");
CREATE INDEX IF NOT EXISTS "Producer_country_idx" ON "Producer" ("country");

ALTER TABLE "Subsidy"        ADD COLUMN IF NOT EXISTS "producerId" TEXT;
ALTER TABLE "DeliveryVolume" ADD COLUMN IF NOT EXISTS "supplierProducerId" TEXT;
ALTER TABLE "Subsidy"        ALTER COLUMN "companyId"  DROP NOT NULL;
ALTER TABLE "DeliveryVolume" ALTER COLUMN "supplierId" DROP NOT NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Company" WHERE "valueChainStage" = 'production') THEN
    INSERT INTO "Producer" ("id", "orgNr", "name", "country", "metadata")
    SELECT "id", "orgNr", "name", "country", "metadata"
    FROM "Company" WHERE "valueChainStage" = 'production'
    ON CONFLICT ("id") DO NOTHING;

    UPDATE "Subsidy" s SET "producerId" = s."companyId", "companyId" = NULL
    WHERE s."companyId" IS NOT NULL
      AND EXISTS (SELECT 1 FROM "Producer" p WHERE p."id" = s."companyId");

    UPDATE "DeliveryVolume" dv SET "supplierProducerId" = dv."supplierId", "supplierId" = NULL
    WHERE dv."supplierId" IS NOT NULL
      AND EXISTS (SELECT 1 FROM "Producer" p WHERE p."id" = dv."supplierId");

    DELETE FROM "Company" WHERE "valueChainStage" = 'production';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Subsidy_producerId_idx" ON "Subsidy" ("producerId");
CREATE INDEX IF NOT EXISTS "DeliveryVolume_supplierProducerId_idx" ON "DeliveryVolume" ("supplierProducerId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Subsidy_producerId_fkey') THEN
    ALTER TABLE "Subsidy" ADD CONSTRAINT "Subsidy_producerId_fkey"
      FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DeliveryVolume_supplierProducerId_fkey') THEN
    ALTER TABLE "DeliveryVolume" ADD CONSTRAINT "DeliveryVolume_supplierProducerId_fkey"
      FOREIGN KEY ("supplierProducerId") REFERENCES "Producer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- Enforce the dual-FK invariant: exactly one of the two FK columns is set per row.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Subsidy_recipient_exactly_one') THEN
    ALTER TABLE "Subsidy" ADD CONSTRAINT "Subsidy_recipient_exactly_one"
      CHECK (("companyId" IS NULL) <> ("producerId" IS NULL));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DeliveryVolume_supplier_exactly_one') THEN
    ALTER TABLE "DeliveryVolume" ADD CONSTRAINT "DeliveryVolume_supplier_exactly_one"
      CHECK (("supplierId" IS NULL) <> ("supplierProducerId" IS NULL));
  END IF;
END $$;
```

The two `CHECK` constraints enforce the exactly-one-of-two invariant for all future inserts (the idempotent data-move guard only fires once). Prisma's `migrate diff` does not manage bare `CHECK` constraints, so they do not register as drift in Task 11 Step 5. They are added *after* the data move so existing rows already comply. The `producer-migration.test.ts` should also assert `/Subsidy_recipient_exactly_one/` and `/DeliveryVolume_supplier_exactly_one/` are present.

The existing `Subsidy_companyId_fkey` / `DeliveryVolume_supplierId_fkey` are **not dropped** — after the `UPDATE`s set producer references to `NULL`, the only non-NULL `companyId`/`supplierId` values point at curated companies that are NOT deleted, so those FKs stay valid. Task 11 Step 5 (`db:check-drift`) is the gate: if Prisma reports drift (e.g. an `onDelete` mismatch because `companyId`/`supplierId` became optional), add the corrective `DROP CONSTRAINT … / ADD CONSTRAINT …` DDL to this migration and re-apply until drift-clean.

`tests/lib/producer-migration.test.ts`:

```ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

describe('producer separation migration', () => {
  const sql = readFileSync('prisma/migrations/20260520_producer_separation/migration.sql', 'utf8')
  it('creates the Producer table idempotently', () => {
    assert.match(sql, /CREATE TABLE IF NOT EXISTS "Producer"/)
  })
  it('guards the data move so it runs once', () => {
    assert.match(sql, /IF EXISTS \(SELECT 1 FROM "Company" WHERE "valueChainStage" = 'production'/)
  })
  it('copies producer rows without clobbering on re-apply', () => {
    assert.match(sql, /ON CONFLICT \("id"\) DO NOTHING/)
  })
  it('keeps Subsidy.companyId and adds producerId (dual FK)', () => {
    assert.match(sql, /ADD COLUMN IF NOT EXISTS "producerId"/)
    assert.ok(!/DROP COLUMN[^\n]*"companyId"/.test(sql), 'companyId must NOT be dropped')
  })
  it('keeps DeliveryVolume.supplierId and adds supplierProducerId', () => {
    assert.match(sql, /ADD COLUMN IF NOT EXISTS "supplierProducerId"/)
  })
})
```

## Task 11 expected post-migration counts (revised)

`Company` 51 · `Producer` 38 925 · `Subsidy.companyId IS NOT NULL` = 1 (Yara) · `Subsidy.producerId IS NOT NULL` = 179 310 · rows with neither = 0 · `DeliveryVolume.supplierId IS NOT NULL` = 2 (Felleskjøpet) · `DeliveryVolume.supplierProducerId IS NOT NULL` = 60 308 · supplier-side rows with neither = 0.

## Tasks 13, 15, 16 (revised notes)

- **Task 13:** `Company` keeps its `subsidies`/`deliveriesFrom` relations, so do **NOT** remove subsidy displays from the `/selskap` pages or `/eierskap`. Task 13 reduces to: remove the obsolete chunked-paging / `includeAll` / `trackedOnly` / 55k-bind-cap logic from `getCompanies()` in `companies.ts` (Company is now ~51 rows; a single `findMany` suffices). The `[id]` page and `EierskapContent` subsidy sections stay.
- **Task 15:** subsidy queries (`subsidies.ts`, `subsidies-agg.ts`) repoint recipient grouping/joins from `companyId`/`Company` to `producerId`/`Producer`. Filter `producerId IS NOT NULL` where a producer-recipient join is needed — the lone `companyId` subsidy (Yara's Enova grant) is legitimately excluded from the producer-subsidy aggregations on `/subsidier`.
- **Task 16:** unchanged in intent — `prisma.company.count()` (~51) and `prisma.producer.count()` (38 925) reported separately. DeliveryVolume supplier counting now spans `supplierProducerId` (60 308) + `supplierId` (2).

## 2026-05-25 Close-out

Plan fully implemented and shipped via PR #62 (`food-tg/koherens-produsentseparasjon-2026-05-20` → main, merge commit `c67c412`) and follow-up PR #63 (`food-tg/fix-producer-migration-leaf`, merge `d0a79fb`).

Phase 1 (UI coherence) and Phase 2 (Producer-table separation with dual-target FKs) both delivered. Producer-related routes live in production:
- `/produsenter` — 55k producers visible
- `/styremedlemmer`, `/selskap`, `/rapporter` — HTTP 200, no regressions from the FK split

Verified 2026-05-25: `npm run db:audit` passes, `npm test` 246/246 pass.

Plan is closed.
