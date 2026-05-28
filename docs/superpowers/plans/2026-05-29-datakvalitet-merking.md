# Datakvalitet-merking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gi plattform og hvitbok et beregnet evidens-/proveniens-primitiv (temporal/geografi/verifikasjon) som vises som badge og håndheves som en build-time overclaim-gate.

**Architecture:** Rene funksjoner i `src/lib/coverage/` beregner et `CoverageProfile` fra faktiske DB-rader (sann ved konstruksjon) og skriver `public/data/coverage/profiles.json` via et script i `compute-metrics`-kjeden. Hvitbok-embeds deklarerer `assertedScope`; en utvidelse av `report-claim-audit.ts` sammenligner påstand mot profil og returnerer blokkerende issues. En `CoverageBadge` + `/kilder`-oversikt + hvitbok proveniens-side synliggjør profilene.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Prisma 7 (`src/generated/prisma/client` + `@prisma/adapter-pg`), PostgreSQL/pgvector, Node innebygd testrunner (`node --import=tsx --test`).

**Spec:** `docs/superpowers/specs/2026-05-29-datakvalitet-merking-design.md`

**Konvensjoner (viktig for at testene skal laste):**
- Moduler som importeres (transitivt) av tester bruker **relative importer** (`../coverage/types`), ikke `@/`-alias. Gjelder: `src/lib/coverage/*`, `src/lib/citations/report-claim-audit.ts`, `src/lib/hvitbok/embeds.ts`.
- Scripts (`scripts/*.ts`, kjørt via `tsx`) og React-komponenter kan bruke `@/`-alias.
- Prisma i scripts: `import 'dotenv/config'` + `PrismaPg`-adapter (se Task 7-mønster).

---

### Task 1: Coverage-typer

**Files:**
- Create: `src/lib/coverage/types.ts`
- Modify: `src/lib/visualization/types.ts`

- [ ] **Step 1: Lag typefilen**

```ts
// src/lib/coverage/types.ts
export type TemporalCoverage =
  | { kind: 'snapshot'; year: number }
  | { kind: 'multi_year'; years: number[] }
  | { kind: 'time_series'; from: number; to: number; cadence: 'monthly' | 'yearly' }
  | { kind: 'unknown' }

export type GeographicScope = {
  countries: string[]
  presentedAs: 'no' | 'nordic'
  noAsNordicProxy: boolean
}

export type VerificationRollup = 'human_grade' | 'machine_grade' | 'needs_review' | 'mixed'

export type VerificationCoverage = {
  total: number
  humanVerified: number
  machineVerified: number
  needsReview: number
  humanVerifiedPct: number
  rollup: VerificationRollup
}

export type CoverageProfile = {
  datasetId: string
  label: string
  temporal: TemporalCoverage
  geographic: GeographicScope
  verification: VerificationCoverage
  sourceClass?: string // speiler Prisma SourceClass
  computedAt: string
  computedEnv: 'prod' | 'local'
}

export type AssertedScope = {
  datasetId: string
  geo?: 'no' | 'nordic'
  temporal?: 'point' | 'trend'
  verified?: boolean
}

export type CoverageClaim = {
  ref: string
  assertedScope: AssertedScope
}

export type DatasetSpec = {
  id: string
  label: string
  model: 'subsidy' | 'deliveryVolume' | 'companyFinancial' | 'countryMetric'
  presentedAs: 'no' | 'nordic'
  fixedCountries?: string[] // for modeller uten meningsfull country-kolonne
  metricType?: string // filter for countryMetric
}
```

- [ ] **Step 2: Koble `coverage` på `VisualizationDataContract`**

I `src/lib/visualization/types.ts`, legg til import øverst og felt på `VisualizationDataContract`:

```ts
import type { CoverageProfile } from '@/lib/coverage/types'
```

```ts
export type VisualizationDataContract = {
  question: string
  unit: string
  period: string
  evidenceStatus: EvidenceStatus
  sourceRefs: VisualizationSourceRef[]
  coverageNote?: string
  coverage?: CoverageProfile // NY: beregnet dekning (audit-sjekkbar sannhet)
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: ingen feil (filen kompilerer; `coverage`-feltet er valgfritt så ingen eksisterende bruk brytes).

- [ ] **Step 4: Commit**

```bash
git add src/lib/coverage/types.ts src/lib/visualization/types.ts
git commit -m "feat(coverage): add CoverageProfile types + wire onto VisualizationDataContract"
```

---

### Task 2: Klassifiseringsfunksjoner (TDD)

**Files:**
- Create: `src/lib/coverage/classify.ts`
- Test: `tests/lib/coverage/classify.test.ts`

- [ ] **Step 1: Skriv den feilende testen**

```ts
// tests/lib/coverage/classify.test.ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  classifyTemporal,
  coversNordic,
  deriveGeographicScope,
  rollupVerification,
} from '../../../src/lib/coverage/classify'

describe('classifyTemporal', () => {
  it('single year is a snapshot', () => {
    assert.deepEqual(classifyTemporal([2025, 2025]), { kind: 'snapshot', year: 2025 })
  })
  it('empty is unknown', () => {
    assert.deepEqual(classifyTemporal([]), { kind: 'unknown' })
  })
  it('one dominant year (>=95% of rows) is a snapshot despite a stray', () => {
    const years = [...Array(99).fill(2025), 2022]
    assert.deepEqual(classifyTemporal(years), { kind: 'snapshot', year: 2025 })
  })
  it('5+ contiguous distinct years is a time_series', () => {
    assert.deepEqual(classifyTemporal([2020, 2021, 2022, 2023, 2024, 2025]), {
      kind: 'time_series',
      from: 2020,
      to: 2025,
      cadence: 'yearly',
    })
  })
  it('sparse distinct years are multi_year', () => {
    assert.deepEqual(classifyTemporal([2020, 2022, 2024]), {
      kind: 'multi_year',
      years: [2020, 2022, 2024],
    })
  })
})

describe('coversNordic', () => {
  it('true only when all five Nordic codes are present (case-insensitive)', () => {
    assert.equal(coversNordic(['NO', 'SE', 'DK', 'FI', 'IS']), true)
    assert.equal(coversNordic(['no', 'se', 'dk', 'fi', 'is']), true)
    assert.equal(coversNordic(['NO']), false)
  })
})

describe('deriveGeographicScope', () => {
  it('flags NO-only presented as nordic', () => {
    const s = deriveGeographicScope(['NO'], 'nordic')
    assert.equal(s.noAsNordicProxy, true)
    assert.deepEqual(s.countries, ['NO'])
  })
  it('no proxy when full nordic', () => {
    assert.equal(deriveGeographicScope(['NO', 'SE', 'DK', 'FI', 'IS'], 'nordic').noAsNordicProxy, false)
  })
  it('no proxy when presented as no', () => {
    assert.equal(deriveGeographicScope(['NO'], 'no').noAsNordicProxy, false)
  })
})

describe('rollupVerification', () => {
  it('human_grade at/above threshold', () => {
    assert.equal(
      rollupVerification({ verified: 8, humanVerified: 0, machineVerified: 1, needsReview: 1, total: 10 }).rollup,
      'human_grade',
    )
  })
  it('empty totals are needs_review (never human_grade)', () => {
    assert.equal(
      rollupVerification({ verified: 0, humanVerified: 0, machineVerified: 0, needsReview: 0, total: 0 }).rollup,
      'needs_review',
    )
  })
  it('machine_grade when majority machine', () => {
    assert.equal(
      rollupVerification({ verified: 0, humanVerified: 0, machineVerified: 6, needsReview: 4, total: 10 }).rollup,
      'machine_grade',
    )
  })
})
```

- [ ] **Step 2: Kjør testen for å bekrefte at den feiler**

Run: `node --import=tsx --test tests/lib/coverage/classify.test.ts`
Expected: FAIL — `Cannot find module '../../../src/lib/coverage/classify'`.

- [ ] **Step 3: Implementer**

```ts
// src/lib/coverage/classify.ts
import type { GeographicScope, TemporalCoverage, VerificationCoverage, VerificationRollup } from './types'

export const NORDIC_SET = ['NO', 'SE', 'DK', 'FI', 'IS'] as const

export function coversNordic(countries: string[]): boolean {
  const set = new Set(countries.map((c) => c.toUpperCase()))
  return NORDIC_SET.every((c) => set.has(c))
}

export function classifyTemporal(years: number[], dominanceThreshold = 0.95): TemporalCoverage {
  const valid = years.filter((y) => Number.isFinite(y))
  if (valid.length === 0) return { kind: 'unknown' }

  const counts = new Map<number, number>()
  for (const y of valid) counts.set(y, (counts.get(y) ?? 0) + 1)
  const uniq = [...counts.keys()].sort((a, b) => a - b)

  if (uniq.length === 1) return { kind: 'snapshot', year: uniq[0] }

  const [domYear, domCount] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
  if (domCount / valid.length >= dominanceThreshold) return { kind: 'snapshot', year: domYear }

  const span = uniq[uniq.length - 1] - uniq[0] + 1
  if (span === uniq.length && uniq.length >= 5) {
    return { kind: 'time_series', from: uniq[0], to: uniq[uniq.length - 1], cadence: 'yearly' }
  }
  return { kind: 'multi_year', years: uniq }
}

export function deriveGeographicScope(countries: string[], presentedAs: 'no' | 'nordic'): GeographicScope {
  const uniq = [...new Set(countries.map((c) => c.toUpperCase()))].sort()
  return {
    countries: uniq,
    presentedAs,
    noAsNordicProxy: presentedAs === 'nordic' && !coversNordic(uniq),
  }
}

export type VerificationCounts = {
  verified: number
  humanVerified: number
  machineVerified: number
  needsReview: number
  total: number
}

export function bucketVerification(statusCounts: Record<string, number>): VerificationCounts {
  let verified = 0
  let humanVerified = 0
  let machineVerified = 0
  let needsReview = 0
  let total = 0
  for (const [status, n] of Object.entries(statusCounts)) {
    total += n
    const s = (status ?? '').toLowerCase()
    if (s === 'verified') verified += n
    else if (s === 'human_verified') humanVerified += n
    else if (s === 'machine_verified') machineVerified += n
    else needsReview += n // needs_review, null, unverified, partially_verified, … → konservativ bøtte
  }
  return { verified, humanVerified, machineVerified, needsReview, total }
}

export function rollupVerification(counts: VerificationCounts, humanGradeThreshold = 0.8): VerificationCoverage {
  const humanVerified = counts.verified + counts.humanVerified
  const pct = counts.total > 0 ? humanVerified / counts.total : 0
  let rollup: VerificationRollup
  if (counts.total === 0) rollup = 'needs_review'
  else if (pct >= humanGradeThreshold) rollup = 'human_grade'
  else if (counts.machineVerified / counts.total >= 0.5) rollup = 'machine_grade'
  else if (counts.needsReview / counts.total >= 0.5) rollup = 'needs_review'
  else rollup = 'mixed'
  return {
    total: counts.total,
    humanVerified,
    machineVerified: counts.machineVerified,
    needsReview: counts.needsReview,
    humanVerifiedPct: Math.round(pct * 1000) / 10,
    rollup,
  }
}
```

- [ ] **Step 4: Kjør testen for å bekrefte at den passerer**

Run: `node --import=tsx --test tests/lib/coverage/classify.test.ts`
Expected: PASS (alle describe-blokker grønne).

- [ ] **Step 5: Commit**

```bash
git add src/lib/coverage/classify.ts tests/lib/coverage/classify.test.ts
git commit -m "feat(coverage): pure classification (temporal/geographic/verification)"
```

---

### Task 3: Badge-modell (TDD)

**Files:**
- Create: `src/lib/coverage/badge-model.ts`
- Test: `tests/lib/coverage/badge-model.test.ts`

- [ ] **Step 1: Skriv den feilende testen**

```ts
// tests/lib/coverage/badge-model.test.ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { coverageBadgeModel } from '../../../src/lib/coverage/badge-model'
import type { CoverageProfile } from '../../../src/lib/coverage/types'

function profile(overrides: Partial<CoverageProfile> = {}): CoverageProfile {
  return {
    datasetId: 'x',
    label: 'X',
    temporal: { kind: 'snapshot', year: 2025 },
    geographic: { countries: ['NO'], presentedAs: 'nordic', noAsNordicProxy: true },
    verification: { total: 100, humanVerified: 5, machineVerified: 90, needsReview: 5, humanVerifiedPct: 5, rollup: 'machine_grade' },
    computedAt: '2026-05-29T00:00:00.000Z',
    computedEnv: 'local',
    ...overrides,
  }
}

describe('coverageBadgeModel', () => {
  it('snapshot + NO-as-nordic proxy + low verification → warn/bad/warn', () => {
    const m = coverageBadgeModel(profile())
    assert.equal(m.temporal.tone, 'warn')
    assert.equal(m.geo.tone, 'bad')
    assert.match(m.geo.label, /NO → nordisk/)
    assert.equal(m.verification.tone, 'warn')
  })
  it('time_series + full nordic + human_grade → good/good/good', () => {
    const m = coverageBadgeModel(
      profile({
        temporal: { kind: 'time_series', from: 2015, to: 2026, cadence: 'yearly' },
        geographic: { countries: ['NO', 'SE', 'DK', 'FI', 'IS'], presentedAs: 'nordic', noAsNordicProxy: false },
        verification: { total: 100, humanVerified: 90, machineVerified: 5, needsReview: 5, humanVerifiedPct: 90, rollup: 'human_grade' },
      }),
    )
    assert.equal(m.temporal.tone, 'good')
    assert.equal(m.geo.tone, 'good')
    assert.equal(m.verification.tone, 'good')
  })
})
```

- [ ] **Step 2: Kjør testen for å bekrefte at den feiler**

Run: `node --import=tsx --test tests/lib/coverage/badge-model.test.ts`
Expected: FAIL — `Cannot find module '.../badge-model'`.

- [ ] **Step 3: Implementer**

```ts
// src/lib/coverage/badge-model.ts
import type { CoverageProfile, TemporalCoverage } from './types'

export type ChipTone = 'neutral' | 'good' | 'warn' | 'bad'
export type Chip = { label: string; tone: ChipTone; title?: string }
export type CoverageBadgeModel = { temporal: Chip; geo: Chip; verification: Chip }

function temporalChip(t: TemporalCoverage): Chip {
  switch (t.kind) {
    case 'snapshot':
      return { label: `${t.year} · øyeblikksbilde`, tone: 'warn', title: 'Enkeltår — ikke en tidsserie' }
    case 'multi_year':
      return { label: `${t.years[0]}–${t.years[t.years.length - 1]} · flere år`, tone: 'neutral' }
    case 'time_series':
      return { label: `${t.from}–${t.to} · tidsserie`, tone: 'good' }
    case 'unknown':
      return { label: 'ukjent periode', tone: 'bad' }
  }
}

export function coverageBadgeModel(profile: CoverageProfile): CoverageBadgeModel {
  const g = profile.geographic
  const geo: Chip = g.noAsNordicProxy
    ? { label: 'NO → nordisk ⚠', tone: 'bad', title: 'Kun norske data presentert som nordisk' }
    : g.countries.length >= 5
      ? { label: `Norden (${g.countries.length})`, tone: 'good' }
      : { label: g.countries.join('/') || 'ukjent', tone: g.countries.length <= 1 ? 'warn' : 'neutral' }

  const v = profile.verification
  const verification: Chip = {
    label: `${v.humanVerifiedPct}% verifisert`,
    tone: v.rollup === 'human_grade' ? 'good' : v.rollup === 'needs_review' ? 'bad' : 'warn',
    title: `Rollup: ${v.rollup} (${v.humanVerified}/${v.total})`,
  }

  return { temporal: temporalChip(profile.temporal), geo, verification }
}
```

- [ ] **Step 4: Kjør testen for å bekrefte at den passerer**

Run: `node --import=tsx --test tests/lib/coverage/badge-model.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/coverage/badge-model.ts tests/lib/coverage/badge-model.test.ts
git commit -m "feat(coverage): pure badge model (chip labels + tones)"
```

---

### Task 4: `CoverageBadge`-komponent

**Files:**
- Create: `src/components/coverage/CoverageBadge.tsx`

- [ ] **Step 1: Skriv komponenten**

```tsx
// src/components/coverage/CoverageBadge.tsx
import type { CoverageProfile } from '@/lib/coverage/types'
import { coverageBadgeModel, type ChipTone } from '@/lib/coverage/badge-model'

const TONE_CLASS: Record<ChipTone, string> = {
  neutral: 'border-stone-200 bg-stone-50 text-stone-600',
  good: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warn: 'border-amber-200 bg-amber-50 text-amber-800',
  bad: 'border-rose-200 bg-rose-50 text-rose-700',
}

export function CoverageBadge({ profile, className = '' }: { profile: CoverageProfile; className?: string }) {
  const model = coverageBadgeModel(profile)
  const chips = [model.temporal, model.geo, model.verification]
  return (
    <span className={`inline-flex max-w-full flex-wrap items-center gap-1.5 text-xs ${className}`}>
      {chips.map((chip, i) => (
        <span
          key={i}
          title={chip.title}
          className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${TONE_CLASS[chip.tone]}`}
        >
          {chip.label}
        </span>
      ))}
    </span>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: ingen feil.

- [ ] **Step 3: Commit**

```bash
git add src/components/coverage/CoverageBadge.tsx
git commit -m "feat(coverage): CoverageBadge component (thin render of badge model)"
```

---

### Task 5: Datasett-register

**Files:**
- Create: `src/lib/coverage/datasets.ts`

- [ ] **Step 1: Skriv registeret**

Kuraterer *hvordan man måler*, ikke resultatet. Juni-omfang: registerdumpene + ett nordisk-presentert metrikk.

```ts
// src/lib/coverage/datasets.ts
import type { DatasetSpec } from './types'

export const DATASETS: DatasetSpec[] = [
  {
    id: 'produksjonstilskudd',
    label: 'Produksjonstilskudd (Landbruksdirektoratet)',
    model: 'subsidy',
    presentedAs: 'no',
    fixedCountries: ['NO'],
  },
  {
    id: 'leveransedata',
    label: 'Leveransevolum (Landbruksdirektoratet)',
    model: 'deliveryVolume',
    presentedAs: 'no',
    fixedCountries: ['NO'],
  },
  {
    id: 'selskaps-finanser',
    label: 'Selskapsfinanser (kuratert graf)',
    model: 'companyFinancial',
    presentedAs: 'no',
    fixedCountries: ['NO'],
  },
  {
    id: 'selvforsyning-nordisk',
    label: 'Selvforsyningsgrad (presentert nordisk)',
    model: 'countryMetric',
    metricType: 'selfSufficiency',
    presentedAs: 'nordic',
  },
]
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: ingen feil.

- [ ] **Step 3: Commit**

```bash
git add src/lib/coverage/datasets.ts
git commit -m "feat(coverage): dataset registry (June-scope datasets)"
```

---

### Task 6: `buildProfile` (TDD)

**Files:**
- Create: `src/lib/coverage/build-profile.ts`
- Test: `tests/lib/coverage/build-profile.test.ts`

- [ ] **Step 1: Skriv den feilende testen**

```ts
// tests/lib/coverage/build-profile.test.ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildProfile, type RawDatasetData } from '../../../src/lib/coverage/build-profile'
import type { DatasetSpec } from '../../../src/lib/coverage/types'

const spec: DatasetSpec = { id: 'produksjonstilskudd', label: 'Tilskudd', model: 'subsidy', presentedAs: 'nordic', fixedCountries: ['NO'] }

describe('buildProfile', () => {
  it('composes temporal/geographic/verification from raw rows', () => {
    const raw: RawDatasetData = {
      years: [...Array(99).fill(2025), 2022],
      countries: ['NO'],
      verificationStatusCounts: { needs_review: 90, machine_verified: 10 },
    }
    const p = buildProfile(spec, raw, '2026-05-29T00:00:00.000Z', 'prod')
    assert.deepEqual(p.temporal, { kind: 'snapshot', year: 2025 })
    assert.equal(p.geographic.noAsNordicProxy, true)
    assert.equal(p.verification.rollup, 'needs_review')
    assert.equal(p.computedEnv, 'prod')
    assert.equal(p.datasetId, 'produksjonstilskudd')
  })
})
```

- [ ] **Step 2: Kjør testen for å bekrefte at den feiler**

Run: `node --import=tsx --test tests/lib/coverage/build-profile.test.ts`
Expected: FAIL — `Cannot find module '.../build-profile'`.

- [ ] **Step 3: Implementer**

```ts
// src/lib/coverage/build-profile.ts
import { bucketVerification, classifyTemporal, deriveGeographicScope, rollupVerification } from './classify'
import type { CoverageProfile, DatasetSpec } from './types'

export type RawDatasetData = {
  years: number[]
  countries: string[]
  verificationStatusCounts: Record<string, number>
}

export function buildProfile(
  spec: DatasetSpec,
  raw: RawDatasetData,
  computedAt: string,
  computedEnv: 'prod' | 'local',
): CoverageProfile {
  return {
    datasetId: spec.id,
    label: spec.label,
    temporal: classifyTemporal(raw.years),
    geographic: deriveGeographicScope(raw.countries, spec.presentedAs),
    verification: rollupVerification(bucketVerification(raw.verificationStatusCounts)),
    computedAt,
    computedEnv,
  }
}
```

- [ ] **Step 4: Kjør testen for å bekrefte at den passerer**

Run: `node --import=tsx --test tests/lib/coverage/build-profile.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/coverage/build-profile.ts tests/lib/coverage/build-profile.test.ts
git commit -m "feat(coverage): buildProfile composition (pure)"
```

---

### Task 7: `compute-coverage`-script + npm-kjede

**Files:**
- Create: `scripts/compute-coverage.ts`
- Modify: `package.json` (linje 7 `compute-metrics`; ny `compute-coverage` ved linje 91)

- [ ] **Step 1: Skriv scriptet**

```ts
// scripts/compute-coverage.ts
import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { DATASETS } from '../src/lib/coverage/datasets'
import { buildProfile, type RawDatasetData } from '../src/lib/coverage/build-profile'
import type { CoverageProfile, DatasetSpec } from '../src/lib/coverage/types'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function tally(rows: Array<{ verificationStatus?: string | null }>): Record<string, number> {
  const vc: Record<string, number> = {}
  for (const r of rows) {
    const s = r.verificationStatus ?? 'null'
    vc[s] = (vc[s] ?? 0) + 1
  }
  return vc
}

async function rawFor(spec: DatasetSpec): Promise<RawDatasetData> {
  switch (spec.model) {
    case 'subsidy': {
      const rows = await prisma.subsidy.findMany({ select: { year: true, verificationStatus: true } })
      return {
        years: rows.map((r) => r.year).filter((y): y is number => y != null),
        countries: spec.fixedCountries ?? [],
        verificationStatusCounts: tally(rows),
      }
    }
    case 'deliveryVolume': {
      const rows = await prisma.deliveryVolume.findMany({ select: { year: true } })
      return { years: rows.map((r) => r.year), countries: spec.fixedCountries ?? [], verificationStatusCounts: {} }
    }
    case 'companyFinancial': {
      const rows = await prisma.companyFinancial.findMany({ select: { year: true, verificationStatus: true } })
      return { years: rows.map((r) => r.year), countries: spec.fixedCountries ?? [], verificationStatusCounts: tally(rows) }
    }
    case 'countryMetric': {
      const rows = await prisma.countryMetric.findMany({
        where: spec.metricType ? { metricType: spec.metricType } : undefined,
        select: { year: true, country: true },
      })
      return {
        years: rows.map((r) => Number(r.year)).filter((y) => Number.isFinite(y)),
        countries: rows.map((r) => r.country),
        verificationStatusCounts: {},
      }
    }
  }
}

async function main() {
  const computedEnv = process.env.COVERAGE_ENV === 'prod' ? 'prod' : 'local'
  const computedAt = new Date().toISOString()
  const profiles: CoverageProfile[] = []
  for (const spec of DATASETS) {
    const raw = await rawFor(spec)
    profiles.push(buildProfile(spec, raw, computedAt, computedEnv))
  }
  const outDir = join(process.cwd(), 'public', 'data', 'coverage')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'profiles.json'), JSON.stringify({ computedAt, computedEnv, profiles }, null, 2))
  console.log(`Wrote ${profiles.length} coverage profiles → public/data/coverage/profiles.json (env=${computedEnv})`)
  for (const p of profiles) {
    console.log(`  ${p.datasetId}: temporal=${p.temporal.kind} geo=${p.geographic.countries.join('/')} proxy=${p.geographic.noAsNordicProxy} verif=${p.verification.rollup}`)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    return prisma.$disconnect().finally(() => process.exit(1))
  })
```

- [ ] **Step 2: Legg til npm-script og kjede inn i `compute-metrics`**

I `package.json`, endre linje 7:

```json
    "compute-metrics": "tsx scripts/compute-chart-metrics.ts --country=all && npm run audit:konsern && npm run compute-coverage",
```

…og legg til (ved siden av `compute-file-coverage`, ~linje 91):

```json
    "compute-coverage": "tsx scripts/compute-coverage.ts",
```

- [ ] **Step 3: Kjør scriptet mot lokal DB**

Run: `npm run compute-coverage`
Expected: `Wrote 4 coverage profiles → public/data/coverage/profiles.json (env=local)` etterfulgt av én linje per datasett. (Krever `DATABASE_URL` i `.env`. `produksjonstilskudd`/`leveransedata` skal vise `temporal=snapshot`.)

- [ ] **Step 4: Verifiser output**

Run: `npx tsc --noEmit`
Expected: ingen feil. Bekreft at `public/data/coverage/profiles.json` finnes og inneholder `profiles`-array.

- [ ] **Step 5: Commit**

```bash
git add scripts/compute-coverage.ts package.json public/data/coverage/profiles.json
git commit -m "feat(coverage): compute-coverage script + compute-metrics chaining"
```

---

### Task 8: `assertedScope` på hvitbok-embeds + collector (TDD)

**Files:**
- Modify: `src/lib/hvitbok/embeds.ts`
- Test: `tests/lib/hvitbok-embeds.test.ts`

- [ ] **Step 1: Skriv den feilende testen**

```ts
// tests/lib/hvitbok-embeds.test.ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { collectAssertedScopesFrom, type EmbedDefinition } from '../../src/lib/hvitbok/embeds'

const fixture: Record<string, Record<string, EmbedDefinition>> = {
  kap1: {
    tall1: { kind: 'nokkeltall', label: 'X', value: '5', kilde: 'k', assertedScope: { datasetId: 'd1', geo: 'nordic' } },
    callout1: { kind: 'callout', variant: 'info', tekst: 'no scope' },
    viz1: { kind: 'viz', href: '/x', label: 'V', description: 'd', assertedScope: { datasetId: 'd2', temporal: 'trend' } },
  },
}

describe('collectAssertedScopesFrom', () => {
  it('flattens only embeds that declare assertedScope', () => {
    const claims = collectAssertedScopesFrom(fixture)
    assert.deepEqual(claims, [
      { ref: 'kap1/tall1', assertedScope: { datasetId: 'd1', geo: 'nordic' } },
      { ref: 'kap1/viz1', assertedScope: { datasetId: 'd2', temporal: 'trend' } },
    ])
  })
})
```

- [ ] **Step 2: Kjør testen for å bekrefte at den feiler**

Run: `node --import=tsx --test tests/lib/hvitbok-embeds.test.ts`
Expected: FAIL — `collectAssertedScopesFrom` finnes ikke (og `assertedScope` er ikke på typene).

- [ ] **Step 3: Implementer**

I `src/lib/hvitbok/embeds.ts`: legg til import øverst (relativ, fordi filen importeres av test):

```ts
import type { AssertedScope, CoverageClaim } from '../coverage/types'
```

Legg `assertedScope?: AssertedScope` på `NokkeltallEmbed` og `VizEmbed`:

```ts
export type NokkeltallEmbed = {
  kind: 'nokkeltall'
  label: string
  value: string
  enhet?: string
  kilde: string
  assertedScope?: AssertedScope
}
```

```ts
export type VizEmbed = {
  kind: 'viz'
  chartId?: string
  href: string
  label: string
  description: string
  assertedScope?: AssertedScope
}
```

Legg til nederst i filen (etter `getEmbed`):

```ts
export function collectAssertedScopesFrom(
  map: Record<string, Record<string, EmbedDefinition>>,
): CoverageClaim[] {
  const claims: CoverageClaim[] = []
  for (const [chapter, embeds] of Object.entries(map)) {
    for (const [token, def] of Object.entries(embeds)) {
      if ((def.kind === 'nokkeltall' || def.kind === 'viz') && def.assertedScope) {
        claims.push({ ref: `${chapter}/${token}`, assertedScope: def.assertedScope })
      }
    }
  }
  return claims
}

export function collectAssertedScopes(): CoverageClaim[] {
  return collectAssertedScopesFrom(chapterEmbeds)
}
```

- [ ] **Step 4: Kjør testen for å bekrefte at den passerer**

Run: `node --import=tsx --test tests/lib/hvitbok-embeds.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/hvitbok/embeds.ts tests/lib/hvitbok-embeds.test.ts
git commit -m "feat(coverage): assertedScope on hvitbok embeds + collector"
```

---

### Task 9: Overclaim-audit-koder (TDD)

**Files:**
- Modify: `src/lib/citations/report-claim-audit.ts`
- Test: `tests/lib/report-claim-audit.test.ts`

- [ ] **Step 1: Skriv de feilende testene (legg til i eksisterende describe)**

Legg til import øverst i testfilen:

```ts
import { auditCoverageClaims } from '../../src/lib/citations/report-claim-audit'
import type { CoverageProfile } from '../../src/lib/coverage/types'
```

Legg til denne hjelperen + describe-blokk i `tests/lib/report-claim-audit.test.ts`:

```ts
function coverageProfile(overrides: Partial<CoverageProfile> = {}): CoverageProfile {
  return {
    datasetId: 'd1',
    label: 'D1',
    temporal: { kind: 'snapshot', year: 2025 },
    geographic: { countries: ['NO'], presentedAs: 'nordic', noAsNordicProxy: true },
    verification: { total: 100, humanVerified: 5, machineVerified: 90, needsReview: 5, humanVerifiedPct: 5, rollup: 'machine_grade' },
    computedAt: '2026-05-29T00:00:00.000Z',
    computedEnv: 'local',
    ...overrides,
  }
}

describe('auditCoverageClaims', () => {
  it('blocks geographic overclaim (nordic claim, NO-only data)', () => {
    const issues = auditCoverageClaims(
      [{ ref: 'kap/figur', assertedScope: { datasetId: 'd1', geo: 'nordic' } }],
      [coverageProfile()],
    )
    assert.deepEqual(issues.map((i) => i.code), ['geographic_overclaim'])
    assert.equal(issues[0].severity, 'blocking')
  })
  it('blocks temporal overclaim (trend claim, snapshot data)', () => {
    const issues = auditCoverageClaims(
      [{ ref: 'kap/figur', assertedScope: { datasetId: 'd1', temporal: 'trend' } }],
      [coverageProfile()],
    )
    assert.deepEqual(issues.map((i) => i.code), ['temporal_overclaim'])
  })
  it('blocks verification overclaim (verified claim, not human_grade)', () => {
    const issues = auditCoverageClaims(
      [{ ref: 'kap/figur', assertedScope: { datasetId: 'd1', verified: true } }],
      [coverageProfile()],
    )
    assert.deepEqual(issues.map((i) => i.code), ['verification_overclaim'])
  })
  it('blocks when the datasetId has no profile (fail-closed)', () => {
    const issues = auditCoverageClaims([{ ref: 'kap/figur', assertedScope: { datasetId: 'ukjent', geo: 'nordic' } }], [])
    assert.deepEqual(issues.map((i) => i.code), ['coverage_profile_missing'])
  })
  it('passes a truthful weak claim', () => {
    const issues = auditCoverageClaims(
      [{ ref: 'kap/figur', assertedScope: { datasetId: 'd1', geo: 'no', temporal: 'point', verified: false } }],
      [coverageProfile()],
    )
    assert.deepEqual(issues, [])
  })
})
```

- [ ] **Step 2: Kjør for å bekrefte feil**

Run: `node --import=tsx --test tests/lib/report-claim-audit.test.ts`
Expected: FAIL — `auditCoverageClaims` er ikke eksportert.

- [ ] **Step 3: Implementer i `report-claim-audit.ts`**

Legg til imports øverst (relative):

```ts
import { coversNordic } from '../coverage/classify'
import type { CoverageClaim, CoverageProfile } from '../coverage/types'
```

Utvid `code`-unionen i `CitableReportAuditIssue` med fire nye verdier:

```ts
  code:
    | 't3_status_contradiction'
    | 'copenhagen_percentage_mismatch'
    | 'readme_line_count_quality_claim'
    | 'hhi_cr3_mislabel'
    | 'unresolved_weak_claim'
    | 'highlighted_numeric_claim_without_support'
    | 'geographic_overclaim'
    | 'temporal_overclaim'
    | 'verification_overclaim'
    | 'coverage_profile_missing'
```

Utvid `CitableReportAuditInput`:

```ts
export type CitableReportAuditInput = {
  html: string
  appendix: string
  claimAudit: string
  phase2: string
  selfCritique: string
  t3Diff: string
  readme: string
  coverageClaims?: CoverageClaim[]
  coverageProfiles?: CoverageProfile[]
}
```

Legg til funksjonen (eksportert, over `auditCitableReportDocuments`):

```ts
export function auditCoverageClaims(
  claims: CoverageClaim[] = [],
  profiles: CoverageProfile[] = [],
): CitableReportAuditIssue[] {
  const byId = new Map(profiles.map((p) => [p.datasetId, p]))
  const issues: CitableReportAuditIssue[] = []
  for (const { ref, assertedScope } of claims) {
    const profile = byId.get(assertedScope.datasetId)
    if (!profile) {
      issues.push({
        code: 'coverage_profile_missing',
        severity: 'blocking',
        message: `No coverage profile for datasetId "${assertedScope.datasetId}".`,
        evidence: ref,
      })
      continue
    }
    if (assertedScope.geo === 'nordic' && !coversNordic(profile.geographic.countries)) {
      issues.push({
        code: 'geographic_overclaim',
        severity: 'blocking',
        message: `Claims Nordic scope but coverage is ${profile.geographic.countries.join('/') || 'unknown'}.`,
        evidence: ref,
      })
    }
    if (assertedScope.temporal === 'trend' && (profile.temporal.kind === 'snapshot' || profile.temporal.kind === 'unknown')) {
      issues.push({
        code: 'temporal_overclaim',
        severity: 'blocking',
        message: `Claims a trend but coverage is ${profile.temporal.kind}.`,
        evidence: ref,
      })
    }
    if (assertedScope.verified === true && profile.verification.rollup !== 'human_grade') {
      issues.push({
        code: 'verification_overclaim',
        severity: 'blocking',
        message: `Claims verified but verification rollup is ${profile.verification.rollup}.`,
        evidence: ref,
      })
    }
  }
  return issues
}
```

Kall den på slutten av `auditCitableReportDocuments`, rett før `return issues`:

```ts
  issues.push(...auditCoverageClaims(input.coverageClaims, input.coverageProfiles))

  return issues
```

- [ ] **Step 4: Kjør for å bekrefte at alt passerer (inkl. de 3 eksisterende testene)**

Run: `node --import=tsx --test tests/lib/report-claim-audit.test.ts`
Expected: PASS — de 3 opprinnelige + de 5 nye. (De gamle bruker `baseInput` uten `coverageClaims`/`coverageProfiles` → `auditCoverageClaims([], [])` → ingen nye issues.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/citations/report-claim-audit.ts tests/lib/report-claim-audit.test.ts
git commit -m "feat(coverage): overclaim audit codes (geo/temporal/verification/missing)"
```

---

### Task 10: Koble profiler + embeds inn i audit-scriptet

**Files:**
- Modify: `scripts/audit-citable-reports.ts`
- Modify: `package.json` (ny `gate:overclaim`-script)

- [ ] **Step 1: Utvid scriptet**

Legg til imports (scriptet kjører via tsx → `@/`-alias OK):

```ts
import { collectAssertedScopes } from '@/lib/hvitbok/embeds'
import type { CoverageProfile } from '@/lib/coverage/types'
```

Legg til en loader-funksjon (over `main`):

```ts
async function readProfiles(): Promise<CoverageProfile[]> {
  try {
    const raw = await readText('public/data/coverage/profiles.json')
    const parsed = JSON.parse(raw) as { profiles?: CoverageProfile[] }
    return parsed.profiles ?? []
  } catch {
    return []
  }
}
```

Utvid `input`-objektet i `main` med to felt:

```ts
  const input: CitableReportAuditInput = {
    html: await readText('public/reports/nordisk-sirkularitetsrapport-2026-05.html'),
    appendix: await readText('docs/project/mandates/nordisk-sirkularitetsrapport-appendiks-2026-05.md'),
    claimAudit: await readText('research/v1-2/claim-audit.md'),
    phase2: await readText('research/v1-2/phase2-primaersjekker.md'),
    selfCritique: await readText('research/v1-2/phase7-selvkritikk.md'),
    t3Diff: await readText('research/v1-2/phase8-T3-ekstern-vs-intern-diff.md'),
    readme: await readText('research/norden/sirkularitet-sprint-2026-05/README.md'),
    coverageClaims: collectAssertedScopes(),
    coverageProfiles: await readProfiles(),
  }
```

- [ ] **Step 2: Legg til en eksplisitt gate-script for CI**

I `package.json` (ved siden av `audit:citable-reports`, ~linje 101):

```json
    "gate:overclaim": "npm run compute-coverage && npm run audit:citable-reports",
```

- [ ] **Step 3: Kjør gaten lokalt**

Run: `npm run gate:overclaim`
Expected: `compute-coverage` skriver profiler, deretter `Citable report audit passed: no issues found.` (ingen embeds har `assertedScope` ennå → ingen overclaim). Exit 0.

- [ ] **Step 4: Verifiser**

Run: `npx tsc --noEmit`
Expected: ingen feil.

- [ ] **Step 5: Commit**

```bash
git add scripts/audit-citable-reports.ts package.json
git commit -m "feat(coverage): feed profiles + asserted scopes into citable-report gate"
```

---

### Task 11: Dekningsoversikt i `/kilder`

**Files:**
- Create: `src/components/coverage/CoverageOverview.tsx`
- Modify: `src/app/kilder/KilderContent.tsx` (import + render etter header-blokken, ~linje 210)

- [ ] **Step 1: Lag oversiktskomponenten**

```tsx
// src/components/coverage/CoverageOverview.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { CoverageBadge } from '@/components/coverage/CoverageBadge'
import type { CoverageProfile } from '@/lib/coverage/types'

type ProfilesFile = { computedAt: string; computedEnv: string; profiles: CoverageProfile[] }

export function CoverageOverview() {
  const [data, setData] = useState<ProfilesFile | null>(null)

  useEffect(() => {
    fetch('/data/coverage/profiles.json')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
  }, [])

  if (!data || data.profiles.length === 0) return null

  return (
    <Card className="border-stone-200">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Datagrunnlag</p>
          <h2 className="text-sm font-semibold text-stone-800">Dekningsoversikt</h2>
        </div>
        <span className="text-[10px] text-stone-400">
          Beregnet {data.computedAt.slice(0, 10)} ({data.computedEnv})
        </span>
      </div>
      <div className="space-y-2">
        {data.profiles.map((p) => (
          <div key={p.datasetId} className="flex items-center justify-between gap-3 border-b border-stone-100 pb-2 last:border-0">
            <span className="text-sm text-stone-700">{p.label}</span>
            <CoverageBadge profile={p} />
          </div>
        ))}
      </div>
    </Card>
  )
}
```

- [ ] **Step 2: Monter i `KilderContent`**

Legg til import øverst i `src/app/kilder/KilderContent.tsx`:

```ts
import { CoverageOverview } from '@/components/coverage/CoverageOverview'
```

Rett etter header-`<div>`-blokken (som lukkes ~linje 210, før `{/* Research rounds banner */}`), legg til:

```tsx
      <CoverageOverview />
```

- [ ] **Step 3: Verifiser**

Run: `npx tsc --noEmit`
Expected: ingen feil.

- [ ] **Step 4: Commit**

```bash
git add src/components/coverage/CoverageOverview.tsx src/app/kilder/KilderContent.tsx
git commit -m "feat(coverage): coverage overview on /kilder"
```

---

### Task 12: Hvitbok proveniens-vedlegg

**Files:**
- Create: `src/app/hvitbok/proveniens/page.tsx`

- [ ] **Step 1: Lag siden (gjenbruker `CoverageOverview`)**

```tsx
// src/app/hvitbok/proveniens/page.tsx
import { CoverageOverview } from '@/components/coverage/CoverageOverview'

export const metadata = { title: 'Proveniens-vedlegg — Hvitbok' }

export default function ProveniensPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-stone-900">Proveniens-vedlegg</h1>
      <p className="text-sm text-stone-600">
        Faktisk datadekning bak figurene i hvitboken — temporal rekkevidde, geografisk omfang og
        verifiseringsgrad, beregnet direkte fra databasen (ikke kuratert). Et øyeblikksbilde-merke
        betyr at tallet er ett enkelt år, ikke en tidsserie; «NO → nordisk» betyr at kun norske data
        ligger bak en nordisk-presentert figur.
      </p>
      <CoverageOverview />
    </div>
  )
}
```

- [ ] **Step 2: Verifiser**

Run: `npx tsc --noEmit`
Expected: ingen feil.

- [ ] **Step 3: Sjekk ruten i dev (valgfritt, manuelt)**

Run: `npm run dev` og åpne `http://localhost:3000/hvitbok/proveniens`
Expected: «Proveniens-vedlegg» med dekningstabellen (krever at `profiles.json` er generert i Task 7).

- [ ] **Step 4: Commit**

```bash
git add src/app/hvitbok/proveniens/page.tsx
git commit -m "feat(coverage): hvitbok provenance appendix page"
```

---

### Task 13: Guard-test + full kjøring

**Files:**
- Create: `tests/lib/coverage/guard.test.ts`

- [ ] **Step 1: Skriv guard-testen**

```ts
// tests/lib/coverage/guard.test.ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { collectAssertedScopes } from '../../../src/lib/hvitbok/embeds'
import { DATASETS } from '../../../src/lib/coverage/datasets'
import { auditCoverageClaims } from '../../../src/lib/citations/report-claim-audit'

describe('coverage guard', () => {
  it('every annotated embed references a known datasetId', () => {
    const known = new Set(DATASETS.map((d) => d.id))
    for (const claim of collectAssertedScopes()) {
      assert.ok(
        known.has(claim.assertedScope.datasetId),
        `Unknown datasetId "${claim.assertedScope.datasetId}" in embed ${claim.ref}`,
      )
    }
  })

  it('no claim references a datasetId that cannot be checked (would fail-closed at build)', () => {
    // Speiler gatens fail-closed-regel uten å kreve at profiles.json finnes i testmiljøet:
    // hvis en embed er annotert, MÅ datasetId-en finnes i registeret (ellers coverage_profile_missing).
    const profilesFromRegistry = DATASETS.map((d) => ({
      datasetId: d.id,
      label: d.label,
      temporal: { kind: 'unknown' } as const,
      geographic: { countries: [], presentedAs: d.presentedAs, noAsNordicProxy: false },
      verification: { total: 0, humanVerified: 0, machineVerified: 0, needsReview: 0, humanVerifiedPct: 0, rollup: 'needs_review' as const },
      computedAt: '1970-01-01T00:00:00.000Z',
      computedEnv: 'local' as const,
    }))
    const missing = auditCoverageClaims(collectAssertedScopes(), profilesFromRegistry).filter(
      (i) => i.code === 'coverage_profile_missing',
    )
    assert.deepEqual(missing, [])
  })
})
```

- [ ] **Step 2: Kjør guard-testen**

Run: `node --import=tsx --test tests/lib/coverage/guard.test.ts`
Expected: PASS (ingen embeds annotert ennå → begge assertions trivielt grønne; testen blir meningsfull etter hvert som forfattere legger til `assertedScope`).

- [ ] **Step 3: Kjør hele testsuiten**

Run: `npm test`
Expected: alle tester passerer (coverage-tester + de eksisterende, inkl. utvidet report-claim-audit).

- [ ] **Step 4: Kjør full gate**

Run: `npm run gate:overclaim`
Expected: `Citable report audit passed: no issues found.` Exit 0.

- [ ] **Step 5: Commit**

```bash
git add tests/lib/coverage/guard.test.ts
git commit -m "test(coverage): registry/fail-closed guard over real embeds"
```

---

## Hvordan en forfatter aktiverer gaten (dokumentasjon, ikke en oppgave)

Når en hvitbok-figur skal hevde nordisk/tidsserie/verifisert rekkevidde, legg `assertedScope` på embeddet i `src/lib/hvitbok/embeds.ts`, f.eks.:

```ts
'selvforsyning-figur': {
  kind: 'nokkeltall',
  label: 'Selvforsyningsgrad',
  value: '45',
  enhet: '%',
  kilde: 'NIBIO 2024',
  assertedScope: { datasetId: 'selvforsyning-nordisk', geo: 'nordic', temporal: 'trend' },
},
```

Hvis `selvforsyning-nordisk`-profilen viser NO-only eller snapshot, blokkerer `npm run gate:overclaim` (CI) til påstanden nedjusteres eller dataene utvides. Knytt CI-sjekken til `gate:overclaim` før Coolify-deploy.

---

## Self-review (utført av planforfatter)

**1. Spec-dekning:**

| Spec-seksjon | Oppgave |
|---|---|
| 3.1 CoverageProfile-primitiv (+ VisualizationDataContract) | Task 1 |
| 3.2 Beregning (compute-coverage + register + prod/lokal) | Task 2, 5, 6, 7 |
| 3.3 Gaten (assertedScope + 4 audit-koder + integrasjon + fail-closed) | Task 8, 9, 10 |
| 3.4 Synliggjøring (CoverageBadge + /kilder + hvitbok-vedlegg) | Task 3, 4, 11, 12 |
| §5 Juni-omfang (hvitbok-siterte datasett) | Task 5 (register) + dok.-seksjon |
| §6 Edge cases (unknown, manglende datasetId, tomt datasett) | Task 2 (dominance/unknown), Task 9 (fail-closed), Task 13 (guard) |
| §7 Testing (test-først + guard) | Task 2, 3, 6, 8, 9, 13 |

**2. Placeholder-skann:** Ingen TBD/TODO; alle kodesteg har komplett kode og eksakte kommandoer med forventet output.

**3. Type-konsistens:** `CoverageProfile`, `AssertedScope`, `CoverageClaim`, `DatasetSpec` defineres i Task 1 og brukes uendret i Task 3/6/8/9. `coversNordic`/`classifyTemporal`/`rollupVerification`/`bucketVerification` (Task 2) konsumeres av `buildProfile` (Task 6) og `auditCoverageClaims` (Task 9) med samme signaturer. `VerificationCounts`-feltnavn (`verified/humanVerified/machineVerified/needsReview/total`) er identiske i classify-test, build-profile og rollup. Relative-import-regelen er holdt for alle test-importerte moduler.
