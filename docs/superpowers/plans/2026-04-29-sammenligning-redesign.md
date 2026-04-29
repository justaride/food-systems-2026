# /sammenligning Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebygg `/sammenligning` til en server-renderet 5-bolk nordisk komparativ analyse med Island synlig overalt og krysslenker til temasider.

**Architecture:** Server-side aggregering i `getSammenligningData()` leser `value-chain.json` + `chart-metrics.json` + `getCountryChartData()` for alle 5 land og returnerer ett typet objekt. `SammenligningContent.tsx` blir tynn orkestrator med 5 `BolkSection`-instanser. Nye gjenbrukbare komponenter under `src/components/sammenligning/`.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind, Recharts (eksisterende), Prisma (eksisterende). Ingen test-runner — verifisering via `npm run lint`, `npm run build`, og manuell røyktest med `npm run dev`.

**Spec:** `docs/superpowers/specs/2026-04-29-sammenligning-redesign-design.md`

---

## File Structure

**Create:**
- `src/lib/queries/sammenligning.ts` — server-side data aggregation + typer
- `src/components/sammenligning/DataGapBadge.tsx` — «N/M land mangler»-badge
- `src/components/sammenligning/InfoPopover.tsx` — «i»-ikon med år+kilde
- `src/components/sammenligning/KeyTakeaway.tsx` — stort tall + frase
- `src/components/sammenligning/PerCapitaToggle.tsx` — lokal toggle
- `src/components/sammenligning/ChartCard.tsx` — wrapper rundt `ComparisonBarChart`
- `src/components/sammenligning/ComparisonTable.tsx` — generisk tabell med flag-rad
- `src/components/sammenligning/BolkSection.tsx` — bolk-wrapper med heading/narrativ/grid
- `src/components/sammenligning/PolicyTimeline.tsx` — år-akse 2015–2030 med markører

**Modify (rewrite):**
- `src/app/sammenligning/page.tsx` — server-fetch + pass data ned
- `src/app/sammenligning/SammenligningContent.tsx` — orchestrator med 5 bolker

---

## Task 1: Datamodul-typer og JSON-loader

**Files:**
- Create: `src/lib/queries/sammenligning.ts`

- [ ] **Step 1: Opprett fil med typer og konstanter**

```ts
// src/lib/queries/sammenligning.ts
import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { CountryCode } from '@/lib/config/countries'
import { getCountryChartData } from '@/lib/queries/country-metrics'

const COUNTRY_CODES: CountryCode[] = ['no', 'se', 'dk', 'fi', 'is']

type ValueChainJson = {
  country: string
  year?: number
  population: number
  currency?: string
  selfSufficiency?: {
    caloric_pct?: number | null
    target_pct?: number | null
    target_year?: number | null
    source?: string | null
  } | null
  steps: Array<{
    id: string
    volume_tonnes?: number | null
    import_tonnes?: number | null
    import_value_bn?: number | null
    export_tonnes?: number | null
    export_value_bn?: number | null
    waste_tonnes?: number | null
    waste_per_capita_kg?: number | null
    waste_reduction_since_2015_pct?: number | null
    deposit_return_rate_pct?: number | null
    co2e_mt?: number | null
    production_value_bn?: number | null
    value_added_bn?: number | null
    turnover_bn?: number | null
    emv_share_pct?: number | null
    feed_import_pct?: number | null
    grain_reserve_months?: number | null
    employees?: number | null
    employment?: {
      agriculture_nace01?: number | null
      fisheries_aquaculture_nace03?: number | null
      food_manufacturing_nace10?: number | null
      beverages_nace11?: number | null
    } | null
    breakdown?: Record<string, unknown> | null
    retail_format?: {
      discount_pct?: number | null
      supermarket_pct?: number | null
      convenience_pct?: number | null
    } | null
    circularity?: {
      biogas_gwh?: number | null
      biogas_target_gwh?: number | null
      biogas_plants?: number | null
    } | null
    source?: string | null
  }>
  key_policies?: Array<{
    name: string
    year: number
    type: string
    target?: string | null
    summary?: string | null
  }>
  food_waste_by_category?: {
    description?: string
    categories?: Record<string, Record<string, number | null>>
    summary?: string
    sources?: string[]
  } | null
}

type ChartMetricsJson = {
  totalStores?: number | null
  parentCompany?: {
    data?: Array<{ name: string; share: number }>
    parentHHI?: number | null
    parentCR3?: number | null
  } | null
  lorenzCurve?: { gini?: number | null } | null
}

export type CountrySammenligning = {
  code: CountryCode
  population: number
  market: {
    hhi: number | null
    cr3: number | null
    gini: number | null
    totalStores: number | null
    emvSharePct: number | null
    retailFormatMix: { discount: number; supermarket: number; convenience: number } | null
    parents: Array<{ name: string; sharePct: number }>
    sourceYear: number | null
  }
  preparedness: {
    selfSufficiencyCaloricPct: number | null
    selfSufficiencyTargetPct: number | null
    selfSufficiencyTargetYear: number | null
    importTonnes: number | null
    importValueBn: number | null
    exportTonnes: number | null
    exportValueBn: number | null
    feedImportPct: number | null
    grainReserveMonths: number | null
    sourceYear: number | null
  }
  valueChain: {
    primaryVolumeTonnes: number | null
    seafoodExportValueBn: number | null
    processingTurnoverBn: number | null
    employmentByNace: { nace01: number | null; nace03: number | null; nace10: number | null; nace11: number | null }
    valueAddedByStep: Record<string, number | null>
    co2ePerStep: Record<string, number | null>
    sourceYear: number | null
  }
  circularity: {
    totalWastePerCapitaKg: number | null
    householdWastePerCapitaKg: number | null
    wasteReductionSince2015Pct: number | null
    biogasGwh: number | null
    biogasTargetGwh: number | null
    biogasPlants: number | null
    depositReturnRatePct: number | null
    foodWasteByCategory: Record<string, Record<string, number | null>> | null
    sourceYear: number | null
  }
  policies: Array<{ name: string; year: number; type: string; target: string | null }>
}

export type SammenligningData = {
  generatedAt: string
  countries: Record<CountryCode, CountrySammenligning | null>
}

async function readJson<T>(relPath: string): Promise<T | null> {
  try {
    const full = path.join(process.cwd(), 'public', 'data', 'food-systems', relPath)
    const raw = await fs.readFile(full, 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function getSammenligningData(): Promise<SammenligningData> {
  // Implementeres i Task 2
  return {
    generatedAt: new Date().toISOString(),
    countries: { no: null, se: null, dk: null, fi: null, is: null },
  }
}
```

- [ ] **Step 2: Verifiser type-check**

Run: `npx tsc --noEmit`
Expected: Ingen feil i `src/lib/queries/sammenligning.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/queries/sammenligning.ts
git commit -m "feat(sammenligning): add data types and JSON loader scaffolding"
```

---

## Task 2: Implementer `getSammenligningData()`

**Files:**
- Modify: `src/lib/queries/sammenligning.ts`

- [ ] **Step 1: Skriv fullstendig implementasjon**

Erstatt placeholder-`getSammenligningData()` med:

```ts
function findStep(steps: ValueChainJson['steps'], id: string) {
  return steps.find(s => s.id === id) ?? null
}

function buildCountry(
  code: CountryCode,
  vc: ValueChainJson | null,
  cm: ChartMetricsJson | null,
): CountrySammenligning | null {
  if (!vc) return null

  const primary = findStep(vc.steps, 'primary')
  const seafood = findStep(vc.steps, 'seafood')
  const processing = findStep(vc.steps, 'processing')
  const distribution = findStep(vc.steps, 'distribution')
  const retail = findStep(vc.steps, 'retail')
  const horeca = findStep(vc.steps, 'horeca')
  const household = findStep(vc.steps, 'household')
  const waste = findStep(vc.steps, 'waste')

  const sumImports = vc.steps.reduce((s, x) => s + (x.import_tonnes ?? 0), 0) || null
  const sumImportValue = vc.steps.reduce((s, x) => s + (x.import_value_bn ?? 0), 0) || null
  const sumExports = vc.steps.reduce((s, x) => s + (x.export_tonnes ?? 0), 0) || null
  const sumExportValue = vc.steps.reduce((s, x) => s + (x.export_value_bn ?? 0), 0) || null

  const valueAdded: Record<string, number | null> = {}
  const co2e: Record<string, number | null> = {}
  for (const s of vc.steps) {
    valueAdded[s.id] = s.value_added_bn ?? null
    co2e[s.id] = s.co2e_mt ?? null
  }

  const retailFormat = retail?.retail_format ?? null
  const formatMix = retailFormat
    ? {
        discount: retailFormat.discount_pct ?? 0,
        supermarket: retailFormat.supermarket_pct ?? 0,
        convenience: retailFormat.convenience_pct ?? 0,
      }
    : null

  const totalWastePerCapita = waste?.waste_per_capita_kg
    ?? (waste?.waste_tonnes && vc.population
        ? Math.round((waste.waste_tonnes * 1000) / vc.population)
        : null)

  return {
    code,
    population: vc.population,
    market: {
      hhi: cm?.parentCompany?.parentHHI ?? null,
      cr3: cm?.parentCompany?.parentCR3 ?? null,
      gini: cm?.lorenzCurve?.gini ?? null,
      totalStores: cm?.totalStores ?? null,
      emvSharePct: processing?.emv_share_pct ?? null,
      retailFormatMix: formatMix,
      parents: cm?.parentCompany?.data?.map(p => ({ name: p.name, sharePct: p.share })) ?? [],
      sourceYear: vc.year ?? null,
    },
    preparedness: {
      selfSufficiencyCaloricPct: vc.selfSufficiency?.caloric_pct ?? null,
      selfSufficiencyTargetPct: vc.selfSufficiency?.target_pct ?? null,
      selfSufficiencyTargetYear: vc.selfSufficiency?.target_year ?? null,
      importTonnes: sumImports,
      importValueBn: sumImportValue,
      exportTonnes: sumExports,
      exportValueBn: sumExportValue,
      feedImportPct: primary?.feed_import_pct ?? null,
      grainReserveMonths: primary?.grain_reserve_months ?? null,
      sourceYear: vc.year ?? null,
    },
    valueChain: {
      primaryVolumeTonnes: primary?.volume_tonnes ?? null,
      seafoodExportValueBn: seafood?.export_value_bn ?? null,
      processingTurnoverBn: processing?.turnover_bn ?? processing?.production_value_bn ?? null,
      employmentByNace: {
        nace01: primary?.employment?.agriculture_nace01 ?? null,
        nace03: seafood?.employment?.fisheries_aquaculture_nace03 ?? null,
        nace10: processing?.employment?.food_manufacturing_nace10 ?? null,
        nace11: processing?.employment?.beverages_nace11 ?? null,
      },
      valueAddedByStep: valueAdded,
      co2ePerStep: co2e,
      sourceYear: vc.year ?? null,
    },
    circularity: {
      totalWastePerCapitaKg: totalWastePerCapita,
      householdWastePerCapitaKg: household?.waste_per_capita_kg ?? null,
      wasteReductionSince2015Pct: waste?.waste_reduction_since_2015_pct ?? null,
      biogasGwh: waste?.circularity?.biogas_gwh ?? null,
      biogasTargetGwh: waste?.circularity?.biogas_target_gwh ?? null,
      biogasPlants: waste?.circularity?.biogas_plants ?? null,
      depositReturnRatePct: retail?.deposit_return_rate_pct ?? household?.deposit_return_rate_pct ?? null,
      foodWasteByCategory: vc.food_waste_by_category?.categories ?? null,
      sourceYear: vc.year ?? null,
    },
    policies: (vc.key_policies ?? []).map(p => ({
      name: p.name,
      year: p.year,
      type: p.type,
      target: p.target ?? null,
    })),
  }
}

export async function getSammenligningData(): Promise<SammenligningData> {
  const entries = await Promise.all(
    COUNTRY_CODES.map(async (code) => {
      const [vc, cm] = await Promise.all([
        readJson<ValueChainJson>(`${code}/value-chain.json`),
        readJson<ChartMetricsJson>(`${code}/chart-metrics.json`),
      ])
      return [code, buildCountry(code, vc, cm)] as const
    })
  )
  const countries = Object.fromEntries(entries) as Record<CountryCode, CountrySammenligning | null>
  return { generatedAt: new Date().toISOString(), countries }
}
```

- [ ] **Step 2: Verifiser type-check og kjør en throwaway-spike**

Run: `npx tsc --noEmit`
Expected: Ingen feil.

Run en rask sanity-spike:
```bash
npx tsx -e "import('./src/lib/queries/sammenligning').then(m => m.getSammenligningData()).then(d => console.log(JSON.stringify({no_hhi: d.countries.no?.market.hhi, is_stores: d.countries.is?.market.totalStores, no_pop: d.countries.no?.population}, null, 2)))"
```
Expected: HHI for NO ~3445, IS-butikker ~243, NO-pop ~5500000. Slett spike-output etterpå.

- [ ] **Step 3: Commit**

```bash
git add src/lib/queries/sammenligning.ts
git commit -m "feat(sammenligning): implement getSammenligningData with all 5 nordic countries"
```

---

## Task 3: Atomiske UI-primitiver

**Files:**
- Create: `src/components/sammenligning/DataGapBadge.tsx`
- Create: `src/components/sammenligning/InfoPopover.tsx`
- Create: `src/components/sammenligning/KeyTakeaway.tsx`

- [ ] **Step 1: `DataGapBadge.tsx`**

```tsx
type DataGapBadgeProps = { missing: number; total: number }

export function DataGapBadge({ missing, total }: DataGapBadgeProps) {
  if (missing === 0) return null
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
      <span aria-hidden>⚠</span>
      {missing} av {total} land mangler
    </span>
  )
}
```

- [ ] **Step 2: `InfoPopover.tsx`**

```tsx
'use client'

import { useState } from 'react'

type InfoPopoverProps = { year?: number | string | null; source?: string | null }

export function InfoPopover({ year, source }: InfoPopoverProps) {
  const [open, setOpen] = useState(false)
  if (!year && !source) return null
  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-label="Vis kilde"
        className="w-4 h-4 inline-flex items-center justify-center rounded-full bg-stone-100 text-stone-500 text-[10px] font-bold hover:bg-stone-200"
        onClick={() => setOpen(o => !o)}
        onBlur={() => setOpen(false)}
      >i</button>
      {open && (
        <span className="absolute right-0 top-5 z-10 w-64 p-2 text-[11px] leading-snug bg-white border border-stone-200 rounded shadow-lg text-stone-600">
          {year && <span className="block font-medium text-stone-700">År: {year}</span>}
          {source && <span className="block mt-1">{source}</span>}
        </span>
      )}
    </span>
  )
}
```

- [ ] **Step 3: `KeyTakeaway.tsx`**

```tsx
type KeyTakeawayProps = { headline: string; subline?: string }

export function KeyTakeaway({ headline, subline }: KeyTakeawayProps) {
  return (
    <div className="border-l-4 border-emerald-500 bg-emerald-50/40 px-4 py-3 my-4 rounded-r">
      <p className="text-base font-semibold text-stone-800">{headline}</p>
      {subline && <p className="text-xs text-stone-500 mt-0.5">{subline}</p>}
    </div>
  )
}
```

- [ ] **Step 4: Verifiser type-check**

Run: `npx tsc --noEmit`
Expected: Ingen feil.

- [ ] **Step 5: Commit**

```bash
git add src/components/sammenligning/
git commit -m "feat(sammenligning): add DataGapBadge, InfoPopover, KeyTakeaway primitives"
```

---

## Task 4: `PerCapitaToggle` og `ChartCard`

**Files:**
- Create: `src/components/sammenligning/PerCapitaToggle.tsx`
- Create: `src/components/sammenligning/ChartCard.tsx`

- [ ] **Step 1: `PerCapitaToggle.tsx`**

```tsx
'use client'

type PerCapitaToggleProps = {
  value: 'absolute' | 'per_capita'
  onChange: (v: 'absolute' | 'per_capita') => void
}

export function PerCapitaToggle({ value, onChange }: PerCapitaToggleProps) {
  return (
    <div className="inline-flex rounded border border-stone-200 text-[10px]">
      <button
        type="button"
        className={`px-2 py-0.5 ${value === 'absolute' ? 'bg-stone-700 text-white' : 'text-stone-500'}`}
        onClick={() => onChange('absolute')}
      >Absolutt</button>
      <button
        type="button"
        className={`px-2 py-0.5 ${value === 'per_capita' ? 'bg-stone-700 text-white' : 'text-stone-500'}`}
        onClick={() => onChange('per_capita')}
      >Per capita</button>
    </div>
  )
}
```

- [ ] **Step 2: `ChartCard.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { ComparisonBarChart } from '@/components/charts/ComparisonBarChart'
import { Card } from '@/components/ui/Card'
import { DataGapBadge } from './DataGapBadge'
import { InfoPopover } from './InfoPopover'
import { PerCapitaToggle } from './PerCapitaToggle'

type CountryRow = {
  country: string
  flag: string
  value: number | null
  population?: number
  label?: string
}

type ChartCardProps = {
  title: string
  description?: string
  unit?: string
  rows: CountryRow[]
  year?: number | string | null
  source?: string | null
  perCapitaEnabled?: boolean
  perCapitaUnit?: string
  defaultMode?: 'absolute' | 'per_capita'
}

export function ChartCard({
  title, description, unit, rows, year, source,
  perCapitaEnabled = false, perCapitaUnit, defaultMode = 'absolute',
}: ChartCardProps) {
  const [mode, setMode] = useState<'absolute' | 'per_capita'>(defaultMode)
  const isPerCap = perCapitaEnabled && mode === 'per_capita'

  const data = rows.map(r => {
    const raw = r.value
    const v = raw === null
      ? 0
      : isPerCap && r.population
        ? Number((raw / r.population).toFixed(2))
        : raw
    return {
      country: r.country,
      flag: r.flag,
      value: v,
      label: raw === null ? '—' : r.label,
    }
  })

  const missing = rows.filter(r => r.value === null).length
  const activeUnit = isPerCap ? (perCapitaUnit ?? unit) : unit

  return (
    <Card>
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-stone-700">{title}</h3>
            <InfoPopover year={year} source={source} />
          </div>
          {description && <p className="text-xs text-stone-400">{description}</p>}
        </div>
        <div className="flex flex-col items-end gap-1">
          {perCapitaEnabled && <PerCapitaToggle value={mode} onChange={setMode} />}
          <DataGapBadge missing={missing} total={rows.length} />
        </div>
      </div>
      <ComparisonBarChart title="" data={data} unit={activeUnit} />
    </Card>
  )
}
```

Merk: `ComparisonBarChart` kalles med `title=""` fordi tittel allerede vises i ChartCard-headeren. Det forhindrer dobbel heading.

- [ ] **Step 3: Verifiser type-check**

Run: `npx tsc --noEmit`
Expected: Ingen feil.

- [ ] **Step 4: Commit**

```bash
git add src/components/sammenligning/
git commit -m "feat(sammenligning): add ChartCard with per-capita toggle and data-gap badge"
```

---

## Task 5: `ComparisonTable` og `BolkSection`

**Files:**
- Create: `src/components/sammenligning/ComparisonTable.tsx`
- Create: `src/components/sammenligning/BolkSection.tsx`

- [ ] **Step 1: `ComparisonTable.tsx`**

```tsx
import { COUNTRY_LIST } from '@/lib/config/countries'
import type { CountryCode } from '@/lib/config/countries'

type Row = {
  label: string
  values: Partial<Record<CountryCode, string | number | null>>
}

type ComparisonTableProps = { rows: Row[]; caption?: string }

export function ComparisonTable({ rows, caption }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      {caption && <p className="text-xs text-stone-500 mb-2">{caption}</p>}
      <table className="w-full text-xs border-collapse">
        <thead className="bg-stone-50">
          <tr>
            <th className="text-left p-2 font-medium text-stone-600 sticky left-0 bg-stone-50"></th>
            {COUNTRY_LIST.map(c => (
              <th key={c.code} className="p-2 font-medium text-stone-600">
                <span className="mr-1">{c.flag}</span>{c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-stone-100">
              <th className="text-left p-2 font-normal text-stone-700 sticky left-0 bg-white">{row.label}</th>
              {COUNTRY_LIST.map(c => {
                const v = row.values[c.code]
                return (
                  <td key={c.code} className="p-2 text-stone-700 text-right tabular-nums">
                    {v === null || v === undefined ? <span className="text-stone-300">—</span> : v}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: `BolkSection.tsx`**

```tsx
import Link from 'next/link'
import { Card } from '@/components/ui/Card'

type BolkSectionProps = {
  number: number
  title: string
  question: string
  narrative: string
  takeaway?: React.ReactNode
  charts: React.ReactNode
  table?: React.ReactNode
  seeAlso: Array<{ href: string; label: string }>
}

export function BolkSection({ number, title, question, narrative, takeaway, charts, table, seeAlso }: BolkSectionProps) {
  return (
    <section className="mb-12">
      <header className="mb-4">
        <p className="text-[10px] uppercase tracking-wider text-stone-400">Bolk {number}</p>
        <h2 className="text-2xl font-semibold text-stone-800">{title}</h2>
        <p className="text-sm text-stone-500 mt-1 italic">{question}</p>
        <p className="text-sm text-stone-700 mt-2 max-w-3xl">{narrative}</p>
      </header>

      {takeaway}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {charts}
      </div>

      {table && <Card className="mb-6">{table}</Card>}

      {seeAlso.length > 0 && (
        <div className="text-xs text-stone-500">
          <span className="font-medium text-stone-600">Se også:</span>{' '}
          {seeAlso.map((l, i) => (
            <span key={l.href}>
              <Link href={l.href} className="text-emerald-700 hover:underline">{l.label}</Link>
              {i < seeAlso.length - 1 && <span className="text-stone-300"> · </span>}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 3: Verifiser type-check**

Run: `npx tsc --noEmit`
Expected: Ingen feil.

- [ ] **Step 4: Commit**

```bash
git add src/components/sammenligning/
git commit -m "feat(sammenligning): add ComparisonTable and BolkSection layout"
```

---

## Task 6: `PolicyTimeline`

**Files:**
- Create: `src/components/sammenligning/PolicyTimeline.tsx`

- [ ] **Step 1: Implementer komponent**

```tsx
import { COUNTRY_LIST } from '@/lib/config/countries'
import type { CountryCode } from '@/lib/config/countries'

type PolicyEntry = {
  country: CountryCode
  name: string
  year: number
  type: string
  target?: string | null
}

const TYPE_COLORS: Record<string, string> = {
  law: 'bg-rose-500',
  forskrift: 'bg-rose-400',
  voluntary: 'bg-amber-500',
  avtale: 'bg-amber-500',
  target: 'bg-sky-500',
  mål: 'bg-sky-500',
}

const YEAR_FROM = 2015
const YEAR_TO = 2030

export function PolicyTimeline({ policies }: { policies: PolicyEntry[] }) {
  const span = YEAR_TO - YEAR_FROM
  const ticks = Array.from({ length: span / 5 + 1 }, (_, i) => YEAR_FROM + i * 5)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-[10px] text-stone-500">
        {Object.entries(TYPE_COLORS).slice(0, 3).map(([k, c]) => (
          <span key={k} className="inline-flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${c}`} />{k}
          </span>
        ))}
      </div>

      {COUNTRY_LIST.map(c => {
        const rows = policies.filter(p => p.country === c.code).sort((a, b) => a.year - b.year)
        return (
          <div key={c.code} className="flex items-center gap-3">
            <div className="w-24 text-xs text-stone-700 shrink-0">
              <span className="mr-1">{c.flag}</span>{c.name}
            </div>
            <div className="relative flex-1 h-8 bg-stone-50 rounded">
              {ticks.map(t => (
                <span
                  key={t}
                  className="absolute top-0 bottom-0 border-l border-stone-200 text-[9px] text-stone-400 pl-0.5"
                  style={{ left: `${((t - YEAR_FROM) / span) * 100}%` }}
                >{t}</span>
              ))}
              {rows.map((p, i) => {
                const left = Math.min(99, Math.max(0, ((p.year - YEAR_FROM) / span) * 100))
                const color = TYPE_COLORS[p.type] ?? 'bg-stone-400'
                return (
                  <span
                    key={i}
                    title={`${p.name} (${p.year})${p.target ? ` — ${p.target}` : ''}`}
                    className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white ${color}`}
                    style={{ left: `${left}%` }}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Verifiser type-check**

Run: `npx tsc --noEmit`
Expected: Ingen feil.

- [ ] **Step 3: Commit**

```bash
git add src/components/sammenligning/PolicyTimeline.tsx
git commit -m "feat(sammenligning): add PolicyTimeline year-axis component"
```

---

## Task 7: Rewrite `page.tsx` og skall for `SammenligningContent.tsx`

**Files:**
- Modify: `src/app/sammenligning/page.tsx`
- Modify: `src/app/sammenligning/SammenligningContent.tsx`

- [ ] **Step 1: Erstatt `page.tsx`**

```tsx
// src/app/sammenligning/page.tsx
import { getSammenligningData } from '@/lib/queries/sammenligning'
import { SammenligningContent } from './SammenligningContent'

export default async function SammenligningPage() {
  const data = await getSammenligningData()
  return <SammenligningContent data={data} />
}
```

- [ ] **Step 2: Erstatt `SammenligningContent.tsx` med skall (5 tomme bolker)**

```tsx
// src/app/sammenligning/SammenligningContent.tsx
import Link from 'next/link'
import { BolkSection } from '@/components/sammenligning/BolkSection'
import type { SammenligningData } from '@/lib/queries/sammenligning'

type Props = { data: SammenligningData }

export function SammenligningContent({ data }: Props) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold text-stone-800">Nordisk sammenligning</h1>
        <p className="text-sm text-stone-500 mt-2 max-w-2xl">
          Markedsmakt, beredskap, verdikjede, sirkularitet og politikk på tvers av Norge, Sverige, Danmark, Finland og Island.
        </p>
        <p className="text-xs text-stone-400 mt-2">
          Kilder og metode: <Link href="/metodikk" className="text-emerald-700 hover:underline">/metodikk</Link>
        </p>
      </header>

      <BolkSection
        number={1}
        title="Markedsstruktur & makt"
        question="Hvor konsentrert er nordisk dagligvare?"
        narrative=""
        charts={null}
        seeAlso={[{ href: '/eierskap', label: 'Eierskap' }]}
      />
      <BolkSection
        number={2}
        title="Selvforsyning & beredskap"
        question="Hvor sårbar er hvert land for import-stopp?"
        narrative=""
        charts={null}
        seeAlso={[{ href: '/forsyningskjede', label: 'Forsyningskjede' }]}
      />
      <BolkSection
        number={3}
        title="Verdikjedevolum & verdiskaping"
        question="Hvor mye produseres, og hvem tjener pengene?"
        narrative=""
        charts={null}
        seeAlso={[
          { href: '/verdikjede', label: 'Verdikjede' },
          { href: '/havbruk', label: 'Havbruk' },
        ]}
      />
      <BolkSection
        number={4}
        title="Sirkularitet & matsvinn"
        question="Hvor langt er hvert land i sirkulær omstilling?"
        narrative=""
        charts={null}
        seeAlso={[{ href: '/sirkularitet', label: 'Sirkularitet' }]}
      />
      <BolkSection
        number={5}
        title="Politikk & regulering"
        question="Hvordan styres systemet ulikt?"
        narrative=""
        charts={null}
        seeAlso={[{ href: '/politikk', label: 'Politikk' }]}
      />

      <footer className="mt-16 pt-6 border-t border-stone-200 text-xs text-stone-500">
        <p>Sist generert: {new Date(data.generatedAt).toLocaleDateString('nb-NO')}</p>
        <p className="mt-1">Datagrunnlag har ujevn dekning på tvers av land — manglende verdier vises som «—» med varsel-badge.</p>
      </footer>
    </div>
  )
}
```

- [ ] **Step 3: Kjør lint og dev-server smoketest**

Run: `npm run lint`
Expected: Ingen feil.

Run: `npm run dev`, naviger til `/sammenligning`. Forventet: 5 bolker rendres med tomme grid, ingen "Laster data..."-flicker, header/footer synlig. Stop dev-server.

- [ ] **Step 4: Commit**

```bash
git add src/app/sammenligning/
git commit -m "refactor(sammenligning): server-side data + 5-bolk skeleton"
```

---

## Task 8: Bolk 1 — Markedsstruktur & makt

**Files:**
- Modify: `src/app/sammenligning/SammenligningContent.tsx`

- [ ] **Step 1: Importer komponenter og helpers**

Legg til øverst:

```tsx
import { ChartCard } from '@/components/sammenligning/ChartCard'
import { ComparisonTable } from '@/components/sammenligning/ComparisonTable'
import { KeyTakeaway } from '@/components/sammenligning/KeyTakeaway'
import { COUNTRY_LIST } from '@/lib/config/countries'
import type { CountryCode } from '@/lib/config/countries'
import type { CountrySammenligning } from '@/lib/queries/sammenligning'

function rowsFor<T>(
  data: SammenligningData,
  pick: (c: CountrySammenligning) => T | null,
): Array<{ country: string; flag: string; value: T | null; population: number; code: CountryCode }> {
  return COUNTRY_LIST.map(c => {
    const country = data.countries[c.code]
    return {
      country: c.name,
      flag: c.flag,
      value: country ? pick(country) : null,
      population: country?.population ?? 0,
      code: c.code,
    }
  })
}
```

- [ ] **Step 2: Erstatt Bolk 1-instansen med utfylt versjon**

```tsx
{(() => {
  const hhi = rowsFor(data, c => c.market.hhi)
  const cr3 = rowsFor(data, c => c.market.cr3)
  const gini = rowsFor(data, c => c.market.gini)
  const stores = rowsFor(data, c => c.market.totalStores)
  const emv = rowsFor(data, c => c.market.emvSharePct)
  const formatRows = COUNTRY_LIST.map(c => {
    const m = data.countries[c.code]?.market.retailFormatMix
    return { country: c.name, flag: c.flag, value: m ? m.discount : null, population: 0, code: c.code }
  })

  const hhiNo = data.countries.no?.market.hhi
  const hhiDk = data.countries.dk?.market.hhi

  return (
    <BolkSection
      number={1}
      title="Markedsstruktur & makt"
      question="Hvor konsentrert er nordisk dagligvare?"
      narrative="Norge har Nordens mest konsentrerte dagligvaremarked. HHI rundt 3445 ligger godt over Danmarks 2157 og signaliserer høy markedsmakt hos få aktører."
      takeaway={
        <KeyTakeaway
          headline={`HHI ${hhiNo ?? '—'} (NO høyest) vs ${hhiDk ?? '—'} (DK lavest)`}
          subline="Herfindahl-Hirschman-indeks for dagligvarekjeder"
        />
      }
      charts={
        <>
          <ChartCard title="HHI" description="Markedskonsentrasjon" rows={hhi} source="Konsentrasjons-data fra konkurranse­myndigheter og selskapsrapporter" />
          <ChartCard title="CR3" description="Topp 3 markedsandel" unit="%" rows={cr3} />
          <ChartCard title="Gini-koeffisient" description="Ulikhet i butikkstørrelse" rows={gini} />
          <ChartCard title="Antall butikker" rows={stores} />
          <ChartCard title="EMV-andel foredling" unit="%" rows={emv} />
          <ChartCard title="Discount-andel av detaljhandel" unit="%" rows={formatRows} description="Andel av butikker som er lavpris" />
        </>
      }
      table={
        <ComparisonTable
          caption="Største parent-aktører per land"
          rows={[
            {
              label: 'Topp 3 parents',
              values: Object.fromEntries(
                COUNTRY_LIST.map(c => {
                  const parents = data.countries[c.code]?.market.parents ?? []
                  return [c.code, parents.slice(0, 3).map(p => `${p.name} (${p.sharePct}%)`).join(', ') || null]
                })
              ) as Record<CountryCode, string | null>,
            },
          ]}
        />
      }
      seeAlso={[{ href: '/eierskap', label: 'Eierskap' }]}
    />
  )
})()}
```

- [ ] **Step 3: Kjør lint og dev-smoketest**

Run: `npm run lint`
Expected: Ingen feil.

Run: `npm run dev`, naviger til `/sammenligning`. Verifiser at Bolk 1 viser 6 charts inkl. IS, ingen `null`-eksceptions, tabell viser parent-aktører.

- [ ] **Step 4: Commit**

```bash
git add src/app/sammenligning/SammenligningContent.tsx
git commit -m "feat(sammenligning): wire up Bolk 1 — markedsstruktur & makt"
```

---

## Task 9: Bolk 2 — Selvforsyning & beredskap

**Files:**
- Modify: `src/app/sammenligning/SammenligningContent.tsx`

- [ ] **Step 1: Erstatt Bolk 2-instansen**

```tsx
{(() => {
  const ss = rowsFor(data, c => c.preparedness.selfSufficiencyCaloricPct)
  const importTon = rowsFor(data, c => c.preparedness.importTonnes)
  const exportTon = rowsFor(data, c => c.preparedness.exportTonnes)
  const feed = rowsFor(data, c => c.preparedness.feedImportPct)
  const reserve = rowsFor(data, c => c.preparedness.grainReserveMonths)

  const dk = data.countries.dk?.preparedness.selfSufficiencyCaloricPct
  const no = data.countries.no?.preparedness.selfSufficiencyCaloricPct

  return (
    <BolkSection
      number={2}
      title="Selvforsyning & beredskap"
      question="Hvor sårbar er hvert land for import-stopp?"
      narrative="Selvforsyningsgraden spenner fra ~47 % (NO) til ~300 % (DK). Finland skiller seg ut med 9 måneders kornreserve via HVK-modellen — de andre landene har minimale strategiske lagre."
      takeaway={
        <KeyTakeaway
          headline={`${dk ?? '—'} % DK vs ${no ?? '—'} % NO`}
          subline="Kalori-basert selvforsyning"
        />
      }
      charts={
        <>
          <ChartCard title="Selvforsyning (kalori)" unit="%" rows={ss} />
          <ChartCard
            title="Total import"
            description="Tonn (per capita aktiverbar)"
            unit="tonn"
            rows={importTon}
            perCapitaEnabled
            perCapitaUnit="tonn/innb"
          />
          <ChartCard
            title="Total eksport"
            unit="tonn"
            rows={exportTon}
            perCapitaEnabled
            perCapitaUnit="tonn/innb"
          />
          <ChartCard title="Fôr-import-andel" unit="%" rows={feed} />
          <ChartCard
            title="Kornreserve (måneder)"
            description="Strategisk lager"
            unit="mnd"
            rows={reserve}
          />
        </>
      }
      table={
        <ComparisonTable
          caption="Selvforsyning, mål og reservetid"
          rows={[
            {
              label: 'Kalori-SS (%)',
              values: Object.fromEntries(COUNTRY_LIST.map(c => [c.code, data.countries[c.code]?.preparedness.selfSufficiencyCaloricPct ?? null])) as Record<CountryCode, number | null>,
            },
            {
              label: 'Mål (%)',
              values: Object.fromEntries(COUNTRY_LIST.map(c => [c.code, data.countries[c.code]?.preparedness.selfSufficiencyTargetPct ?? null])) as Record<CountryCode, number | null>,
            },
            {
              label: 'Mål-år',
              values: Object.fromEntries(COUNTRY_LIST.map(c => [c.code, data.countries[c.code]?.preparedness.selfSufficiencyTargetYear ?? null])) as Record<CountryCode, number | null>,
            },
            {
              label: 'Kornreserve (mnd)',
              values: Object.fromEntries(COUNTRY_LIST.map(c => [c.code, data.countries[c.code]?.preparedness.grainReserveMonths ?? null])) as Record<CountryCode, number | null>,
            },
          ]}
        />
      }
      seeAlso={[{ href: '/forsyningskjede', label: 'Forsyningskjede' }]}
    />
  )
})()}
```

- [ ] **Step 2: Lint + dev-smoketest**

Run: `npm run lint && npm run dev` (manuell sjekk: Bolk 2 viser 5 charts, kornreserve-graf har gap-badge, per-capita-toggle på import/eksport fungerer).

- [ ] **Step 3: Commit**

```bash
git add src/app/sammenligning/SammenligningContent.tsx
git commit -m "feat(sammenligning): wire up Bolk 2 — selvforsyning & beredskap"
```

---

## Task 10: Bolk 3 — Verdikjedevolum & verdiskaping

**Files:**
- Modify: `src/app/sammenligning/SammenligningContent.tsx`

- [ ] **Step 1: Erstatt Bolk 3-instansen**

```tsx
{(() => {
  const vol = rowsFor(data, c => c.valueChain.primaryVolumeTonnes)
  const seafood = rowsFor(data, c => c.valueChain.seafoodExportValueBn)
  const turnover = rowsFor(data, c => c.valueChain.processingTurnoverBn)
  const empNace10 = rowsFor(data, c => c.valueChain.employmentByNace.nace10)
  const co2eRetail = rowsFor(data, c => c.valueChain.co2ePerStep.retail ?? null)

  const noProd = (() => {
    const v = data.countries.no?.valueChain.valueAddedByStep ?? {}
    return Object.values(v).reduce<number>((s, x) => s + (x ?? 0), 0)
  })()

  return (
    <BolkSection
      number={3}
      title="Verdikjedevolum & verdiskaping"
      question="Hvor mye produseres, og hvem tjener pengene?"
      narrative={`Norsk matsystem produserer rundt ${noProd.toFixed(0)} mrd NOK i samlet verdiskaping; sjømateksporten alene er flerfoldig over landbrukets bidrag.`}
      takeaway={
        <KeyTakeaway
          headline={`${noProd.toFixed(0)} mrd NOK total verdiskaping (NO)`}
          subline="Sum value-added per ledd"
        />
      }
      charts={
        <>
          <ChartCard
            title="Primærvolum"
            description="Råvarer i tonn"
            unit="tonn"
            rows={vol}
            perCapitaEnabled
            perCapitaUnit="tonn/innb"
          />
          <ChartCard title="Sjømat eksport-verdi" unit="mrd" rows={seafood} />
          <ChartCard title="Foredlings-omsetning" unit="mrd" rows={turnover} />
          <ChartCard title="Sysselsetting matforedling (NACE 10)" rows={empNace10} />
          <ChartCard
            title="CO₂e — detaljhandel"
            description="Tonn CO₂-ekvivalenter (mt). Kun NO har data per ledd."
            unit="mt"
            rows={co2eRetail}
          />
        </>
      }
      table={
        <ComparisonTable
          caption="Value-added per ledd (mrd, NO referanse)"
          rows={['primary', 'seafood', 'processing', 'distribution', 'retail', 'horeca'].map(step => ({
            label: step,
            values: Object.fromEntries(
              COUNTRY_LIST.map(c => [c.code, data.countries[c.code]?.valueChain.valueAddedByStep[step] ?? null])
            ) as Record<CountryCode, number | null>,
          }))}
        />
      }
      seeAlso={[
        { href: '/verdikjede', label: 'Verdikjede' },
        { href: '/havbruk', label: 'Havbruk' },
      ]}
    />
  )
})()}
```

- [ ] **Step 2: Lint + dev-smoketest**

Manuell verifisering: CO₂e-grafen viser data-gap-badge for SE/DK/FI/IS, primærvolum-toggle fungerer.

- [ ] **Step 3: Commit**

```bash
git add src/app/sammenligning/SammenligningContent.tsx
git commit -m "feat(sammenligning): wire up Bolk 3 — verdikjede & verdiskaping"
```

---

## Task 11: Bolk 4 — Sirkularitet & matsvinn

**Files:**
- Modify: `src/app/sammenligning/SammenligningContent.tsx`

- [ ] **Step 1: Erstatt Bolk 4-instansen**

```tsx
{(() => {
  const totalWaste = rowsFor(data, c => c.circularity.totalWastePerCapitaKg)
  const houseWaste = rowsFor(data, c => c.circularity.householdWastePerCapitaKg)
  const reduction = rowsFor(data, c => c.circularity.wasteReductionSince2015Pct)
  const biogas = rowsFor(data, c => c.circularity.biogasGwh)
  const plants = rowsFor(data, c => c.circularity.biogasPlants)
  const deposit = rowsFor(data, c => c.circularity.depositReturnRatePct)

  const noReduction = data.countries.no?.circularity.wasteReductionSince2015Pct

  return (
    <BolkSection
      number={4}
      title="Sirkularitet & matsvinn"
      question="Hvor langt er hvert land i sirkulær omstilling?"
      narrative="Norge har redusert matsvinn betydelig siden 2015, og pant-returrate over 90 % er Nordens høyeste. Biogass-utbygging varierer kraftig per innbygger."
      takeaway={
        <KeyTakeaway
          headline={`${noReduction !== null && noReduction !== undefined ? `${noReduction > 0 ? '−' : ''}${Math.abs(noReduction)}` : '—'} % matsvinn-reduksjon NO siden 2015`}
        />
      }
      charts={
        <>
          <ChartCard title="Total svinn (kg/capita)" unit="kg" rows={totalWaste} />
          <ChartCard title="Husholdningssvinn (kg/capita)" unit="kg" rows={houseWaste} />
          <ChartCard title="Svinn-reduksjon siden 2015" unit="%" rows={reduction} />
          <ChartCard
            title="Biogass-produksjon"
            unit="GWh"
            rows={biogas}
            perCapitaEnabled
            perCapitaUnit="GWh/innb"
          />
          <ChartCard title="Biogass-anlegg" rows={plants} />
          <ChartCard title="Pant-returrate" unit="%" rows={deposit} />
        </>
      }
      seeAlso={[{ href: '/sirkularitet', label: 'Sirkularitet' }]}
    />
  )
})()}
```

- [ ] **Step 2: Lint + dev-smoketest**

Manuell verifisering: alle 6 charts viser, IS-rader er synlige, gap-badges der relevant.

- [ ] **Step 3: Commit**

```bash
git add src/app/sammenligning/SammenligningContent.tsx
git commit -m "feat(sammenligning): wire up Bolk 4 — sirkularitet & matsvinn"
```

---

## Task 12: Bolk 5 — Politikk & regulering

**Files:**
- Modify: `src/app/sammenligning/SammenligningContent.tsx`

- [ ] **Step 1: Importer `PolicyTimeline`**

Legg til import:

```tsx
import { PolicyTimeline } from '@/components/sammenligning/PolicyTimeline'
```

- [ ] **Step 2: Erstatt Bolk 5-instansen**

```tsx
{(() => {
  const flat = COUNTRY_LIST.flatMap(c =>
    (data.countries[c.code]?.policies ?? []).map(p => ({ country: c.code, ...p }))
  )

  return (
    <BolkSection
      number={5}
      title="Politikk & regulering"
      question="Hvordan styres systemet ulikt?"
      narrative="Norden konvergerer på matsvinn, biogass og emballasje, men i ulikt tempo og med ulike virkemidler — fra bransjeavtaler til bindende lov."
      takeaway={
        <KeyTakeaway
          headline="2015–2030 — bransjeavtale → matsvinnlov → PFAS-forbud"
          subline="Politikkmiks varierer per land"
        />
      }
      charts={<div className="md:col-span-2"><PolicyTimeline policies={flat} /></div>}
      table={
        <ComparisonTable
          caption="Antall registrerte tiltak per land"
          rows={[
            {
              label: 'Lover',
              values: Object.fromEntries(COUNTRY_LIST.map(c => [c.code, (data.countries[c.code]?.policies ?? []).filter(p => p.type === 'law').length])) as Record<CountryCode, number>,
            },
            {
              label: 'Frivillige avtaler',
              values: Object.fromEntries(COUNTRY_LIST.map(c => [c.code, (data.countries[c.code]?.policies ?? []).filter(p => p.type === 'voluntary').length])) as Record<CountryCode, number>,
            },
          ]}
        />
      }
      seeAlso={[{ href: '/politikk', label: 'Politikk' }]}
    />
  )
})()}
```

- [ ] **Step 3: Lint + dev-smoketest**

Manuell verifisering: PolicyTimeline viser 5 land-rader med markører, hover viser navn+år.

- [ ] **Step 4: Commit**

```bash
git add src/app/sammenligning/SammenligningContent.tsx
git commit -m "feat(sammenligning): wire up Bolk 5 — politikk & regulering"
```

---

## Task 13: Tekstkorrektur, build-verifisering, opprydding

**Files:**
- Modify: alle nye filer + `src/app/sammenligning/SammenligningContent.tsx`

- [ ] **Step 1: Søk etter ASCII-fallbacks i sammenligning-filer**

Run: `grep -rn -E "(pa tvers|Arlig|manure|\bfor\b)" src/app/sammenligning src/components/sammenligning`

Sjekk hver treff manuelt. Erstatt:
- «pa tvers» → «på tvers»
- «Arlig» → «Årlig»
- «manure» → «husdyrgjødsel»
- isolert «for» som er ment dyrefôr → «fôr»

(De fleste «for»-treffene er trolig ekte engelske/norske preposisjoner — endre kun de som handler om dyrefôr.)

- [ ] **Step 2: Kjør full build**

Run: `npm run build`
Expected: Bygg passerer, ingen TypeScript-feil i ny kode, ingen ESLint-warnings i `src/app/sammenligning/` eller `src/components/sammenligning/`.

- [ ] **Step 3: Manuell røyktest**

Run: `npm run dev`. Naviger til `/sammenligning` og verifiser:

- Ingen "Laster data..."-flicker (server-rendret).
- Alle 5 bolker rendres med tittel, narrativ, key takeaway, charts, tabell, "Se også".
- Island er synlig som rad i alle charts og tabeller.
- Data-gap-badges vises på charts der noen land mangler verdier (CO₂e, kornreserve).
- Klikk «i»-ikon: popover med år+kilde åpnes/lukkes.
- Toggle "Per capita" på import/eksport/biogass: verdier endres, label fortsatt korrekt.
- "Se også"-lenker navigerer til riktige temasider.
- PolicyTimeline viser 5 rader med fargede markører fordelt på 2015–2030.

Stopp dev-server.

- [ ] **Step 4: Sluttcommit**

```bash
git add src/
git commit -m "chore(sammenligning): språkfix og build-verifisering" --allow-empty
```

(Allow-empty hvis steg 1 ikke fant noe — committen markerer da bare verifiseringspunktet.)

---

## Self-Review Notes

**Spec coverage:**
- ✔ Datalag (`getSammenligningData`) — Task 1–2
- ✔ Komponenter (8 nye) — Task 3–6
- ✔ Side-orchestrering — Task 7
- ✔ 5 bolker med innhold — Task 8–12
- ✔ Island synlig — `COUNTRY_LIST` brukes overalt; ingen `CHART_COUNTRIES`-filter
- ✔ Per-capita-toggle — `ChartCard.perCapitaEnabled`
- ✔ Data-gap-badge — `DataGapBadge` brukes i `ChartCard`
- ✔ Info-popover — `InfoPopover` med år+kilde
- ✔ Krysslenker — `seeAlso` per `BolkSection`
- ✔ FooterMetodikk — i `SammenligningContent` skall (Task 7)
- ✔ Språkfix — Task 13
- ✔ Verifisering — Task 13 (lint, build, manuell)

**Out-of-scope confirmasjoner:**
- Tidsserier, year-velger, land-toggle: ikke implementert. ✔
- Margins per ledd: ikke vist. ✔
- Geografisk visualisering: ikke i scope. ✔
- Test-runner-installasjon: ikke i scope. ✔

**Antagelser som kan svikte (flagg under implementering):**
- `feed_import_pct`, `grain_reserve_months`, `turnover_bn`, `value_added_bn`, `retail_format`, `deposit_return_rate_pct`, `waste_reduction_since_2015_pct` antas å ligge i `value-chain.json` med disse navnene. Hvis et felt ikke finnes returnerer `buildCountry()` `null` for det feltet — gap-badgen håndterer da visningen. Ingen krasj forventet.
- `parentCR3` brukes hvis det finnes i `chart-metrics.json`; ellers vises `null` og gap-badge.
- Hvis et land mangler `value-chain.json` eller `chart-metrics.json` returneres `null` for hele landet og det vises som «—» i alle charts.
