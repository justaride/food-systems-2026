# /eierskap Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/eierskap` from a thin viewer (180-line content + 229-line query) into an analytical entry point for ownership concentration, with a filtered konsern index and a 9-section detail dossier per konsern.

**Architecture:** Server-rendered tables sourced from a new `KONSERN_REGISTRY` (slug ↔ orgNr mapping) and a new `audit-konsern-coverage.ts` script that writes `data/konsern-coverage.json` during `compute-metrics`. Detail page is a single `/eierskap/{slug}` route reading `getKonsernDossier(slug)` server-side; sections are client components when interactive (M&A timeline filtering, board interlocks expand).

**Tech Stack:** Next.js 16 App Router, TypeScript, Prisma 7, Tailwind, `node:test`. Reuses existing `OwnershipTreeDiagram`, `Card`, `EvidenceStatusBadge`, `EmptyState` components.

**Spec:** `docs/superpowers/specs/2026-04-28-eierskap-rebuild-design.md`

**Current state (2026-05-25):** 8 ownership-tree roots exist in DB (NorgesGruppen, Reitan Retail, REMA 1000 Norge, Orkla, Mowi, SalMar, Austevoll Seafood, Axfood). Spec expected 12+ — Coop, Bama, Asko, Tine, Nortura, Leroy, Felleskjopet, Kavli are missing as trees (some exist as standalone Company entries). Registry will include all 12 spec entries; runtime queries skip absent trees gracefully.

---

## Milestone structure

- **Phase 1 (MVP foundation):** Tasks 1–4. Ships: registry, audit script, `konsern-coverage.json`, refactored index page. Standalone deliverable.
- **Phase 2 (detail dossier):** Tasks 5–9. Ships: `/eierskap/{slug}` route with all 9 sections.
- **Phase 3 (data freshness):** Tasks 10–11. Ships: BRREG refresh + cross-page `?konsern={slug}` filters.

Plan can be paused after each phase.

---

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `prisma/schema.prisma` | Modify | Add `lastBrregRefreshAt DateTime?` to `Company` |
| `prisma/migrations/<date>_add_last_brreg_refresh/migration.sql` | Create | Migration |
| `src/lib/queries/ownership.ts` | Modify | Add `KONSERN_REGISTRY`, slug helpers, `getKonsernIndex()`, `getKonsernDossier()` |
| `src/lib/queries/konsern.ts` | Create | Aggregate queries (financials, board, subsidies, properties, relationships per konsern) |
| `scripts/audit-konsern-coverage.ts` | Create | Generates `data/konsern-coverage.json` |
| `data/konsern-coverage.json` | Create (generated) | Per-konsern quality score + gap report |
| `scripts/refresh-brreg-tracked.ts` | Create | BRREG Enhetsregisteret refresh script |
| `tests/lib/konsern-coverage.test.ts` | Create | Scoring + gap detection tests |
| `tests/lib/konsern-slug.test.ts` | Create | Slug ↔ orgnr resolution tests |
| `src/app/eierskap/page.tsx` | Modify | Wire to new `getKonsernIndex()` |
| `src/app/eierskap/EierskapContent.tsx` | Modify | Replace with filterable table + aggregate strip |
| `src/app/eierskap/[slug]/page.tsx` | Create | Detail page route |
| `src/app/eierskap/[slug]/KonsernDossier.tsx` | Create | Detail page orchestrator with 9 sections |
| `src/app/selskap/[id]/page.tsx` | Modify | "Se konsern →" link to `/eierskap/{slug}` |
| `src/components/layout/Sidebar.tsx` | Modify | Update description |
| `src/app/eiendommer/page.tsx` + content | Modify | Add `?konsern={slug}` URL filter |
| `src/app/subsidier/page.tsx` + content | Modify | Add `?konsern={slug}` URL filter |
| `package.json` | Modify | Add `refresh:brreg`, `audit:konsern` scripts; wire `audit:konsern` into `compute-metrics` |
| `research/data-readiness/eierskap-tree-revisjon.md` | Create | Manual revisjon backlog |

---

## Phase 1: MVP Foundation

### Task 1: Prisma schema + migration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_last_brreg_refresh/migration.sql`

- [ ] **Step 1: Add field to `model Company`**

In `prisma/schema.prisma`, find the `Company` model and add after existing scalar fields:

```prisma
  lastBrregRefreshAt DateTime?
```

- [ ] **Step 2: Generate migration**

Run: `npx prisma migrate dev --name add_last_brreg_refresh --create-only`
Expected: new migration file in `prisma/migrations/<timestamp>_add_last_brreg_refresh/migration.sql` with an `ALTER TABLE "Company" ADD COLUMN "lastBrregRefreshAt" TIMESTAMP(3);` statement.

- [ ] **Step 3: Apply migration**

Run: `npx prisma migrate dev`
Expected: migration applied; `npx prisma generate` runs automatically.

- [ ] **Step 4: Verify**

Run: `npm test`
Expected: 246 passed / 0 failed (no behavioural change).

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/<timestamp>_add_last_brreg_refresh
git commit -m "feat(schema): add lastBrregRefreshAt to Company"
```

---

### Task 2: KONSERN_REGISTRY + slug helpers + tests

**Files:**
- Modify: `src/lib/queries/ownership.ts`
- Create: `tests/lib/konsern-slug.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/konsern-slug.test.ts`:

```ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  KONSERN_REGISTRY,
  slugForOrgNr,
  orgNrForSlug,
  isKnownKonsernRoot,
} from '../../src/lib/queries/ownership'

describe('KONSERN_REGISTRY', () => {
  it('maps NorgesGruppen orgnr 819731322 → slug "norgesgruppen"', () => {
    assert.equal(slugForOrgNr('819731322'), 'norgesgruppen')
  })
  it('maps slug "reitan-retail" → orgnr 914526647', () => {
    assert.equal(orgNrForSlug('reitan-retail'), '914526647')
  })
  it('returns null for unknown orgnr', () => {
    assert.equal(slugForOrgNr('000000000'), null)
  })
  it('returns null for unknown slug', () => {
    assert.equal(orgNrForSlug('notreal'), null)
  })
  it('isKnownKonsernRoot true for NorgesGruppen', () => {
    assert.equal(isKnownKonsernRoot('819731322'), true)
  })
  it('has unique slugs', () => {
    const slugs = Object.values(KONSERN_REGISTRY).map(c => c.slug)
    assert.equal(slugs.length, new Set(slugs).size)
  })
  it('has unique orgNrs', () => {
    const orgNrs = Object.keys(KONSERN_REGISTRY)
    assert.equal(orgNrs.length, new Set(orgNrs).size)
  })
})
```

- [ ] **Step 2: Run test to verify RED**

Run: `node --import=tsx --test tests/lib/konsern-slug.test.ts`
Expected: FAIL — KONSERN_REGISTRY not exported.

- [ ] **Step 3: Add registry + helpers to ownership.ts**

In `src/lib/queries/ownership.ts`, add near the top after existing imports:

```ts
export type KonsernConfig = {
  slug: string
  expectsMaActivity: boolean
}

export const KONSERN_REGISTRY: Record<string, KonsernConfig> = {
  '819731322': { slug: 'norgesgruppen', expectsMaActivity: true },
  '914526647': { slug: 'reitan-retail', expectsMaActivity: true },
  '936560288': { slug: 'coop',          expectsMaActivity: false },
  '910747711': { slug: 'orkla',         expectsMaActivity: true },
  '914224314': { slug: 'bama',          expectsMaActivity: false },
  '929228723': { slug: 'asko',          expectsMaActivity: false },
  '947942638': { slug: 'tine',          expectsMaActivity: false },
  '938752648': { slug: 'nortura',       expectsMaActivity: false },
  '964118191': { slug: 'mowi',          expectsMaActivity: true },
  '960514718': { slug: 'salmar',        expectsMaActivity: true },
  '975350940': { slug: 'leroy',         expectsMaActivity: true },
  '911608103': { slug: 'felleskjopet',  expectsMaActivity: false },
  '929975200': { slug: 'austevoll',     expectsMaActivity: true },
  '982254604': { slug: 'rema1000-norge', expectsMaActivity: false },
}

const SLUG_TO_ORGNR: Record<string, string> = Object.fromEntries(
  Object.entries(KONSERN_REGISTRY).map(([orgNr, cfg]) => [cfg.slug, orgNr])
)

export function slugForOrgNr(orgNr: string): string | null {
  return KONSERN_REGISTRY[orgNr]?.slug ?? null
}

export function orgNrForSlug(slug: string): string | null {
  return SLUG_TO_ORGNR[slug] ?? null
}

export function isKnownKonsernRoot(orgNr: string): boolean {
  return orgNr in KONSERN_REGISTRY
}
```

- [ ] **Step 4: Run tests to verify GREEN**

Run: `node --import=tsx --test tests/lib/konsern-slug.test.ts`
Expected: PASS (all 7 tests).

- [ ] **Step 5: Verify full test suite**

Run: `npm test`
Expected: 253 passed / 0 failed.

- [ ] **Step 6: Commit**

```bash
git add src/lib/queries/ownership.ts tests/lib/konsern-slug.test.ts
git commit -m "feat(eierskap): add KONSERN_REGISTRY and slug helpers"
```

---

### Task 3: audit-konsern-coverage script

**Files:**
- Create: `scripts/audit-konsern-coverage.ts`
- Create: `data/konsern-coverage.json` (generated)
- Create: `tests/lib/konsern-coverage.test.ts`
- Modify: `package.json` (add `audit:konsern` script; wire into `compute-metrics`)

- [ ] **Step 1: Write failing scoring test**

Create `tests/lib/konsern-coverage.test.ts`:

```ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { computeQualityScore, type KonsernAuditInput } from '../../scripts/lib/konsern-coverage-scoring'

const baseInput: KonsernAuditInput = {
  hasControllingOwner: false,
  ownershipEdgesWithSource: 0,
  ownershipEdgesTotal: 0,
  childrenWithLatestFinancial: 0,
  childrenTotal: 0,
  propertyCount: 0,
  relationshipCount: 0,
  daysSinceBrregRefresh: null,
  maEventCount: 0,
  expectsMaActivity: true,
}

describe('konsern quality score', () => {
  it('scores 0 when nothing is registered', () => {
    assert.equal(computeQualityScore(baseInput), 0)
  })
  it('scores 2 for controlling owner only', () => {
    assert.equal(computeQualityScore({ ...baseInput, hasControllingOwner: true }), 2)
  })
  it('full score 10 for complete data', () => {
    assert.equal(
      computeQualityScore({
        hasControllingOwner: true,
        ownershipEdgesWithSource: 5,
        ownershipEdgesTotal: 5,
        childrenWithLatestFinancial: 10,
        childrenTotal: 10,
        propertyCount: 3,
        relationshipCount: 4,
        daysSinceBrregRefresh: 30,
        maEventCount: 2,
        expectsMaActivity: true,
      }),
      10,
    )
  })
  it('gives +1 for ma-quiet konsern with no events', () => {
    const score = computeQualityScore({ ...baseInput, expectsMaActivity: false })
    assert.equal(score, 1)
  })
  it('no bonus for unregistered controlling owner', () => {
    assert.equal(
      computeQualityScore({ ...baseInput, hasControllingOwner: false, propertyCount: 1, relationshipCount: 1 }),
      2,
    )
  })
})
```

- [ ] **Step 2: Run test to verify RED**

Run: `node --import=tsx --test tests/lib/konsern-coverage.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Create scoring lib**

Create `scripts/lib/konsern-coverage-scoring.ts`:

```ts
export type KonsernAuditInput = {
  hasControllingOwner: boolean
  ownershipEdgesWithSource: number
  ownershipEdgesTotal: number
  childrenWithLatestFinancial: number
  childrenTotal: number
  propertyCount: number
  relationshipCount: number
  daysSinceBrregRefresh: number | null
  maEventCount: number
  expectsMaActivity: boolean
}

export function computeQualityScore(input: KonsernAuditInput): number {
  let score = 0
  if (input.hasControllingOwner) score += 2
  if (input.ownershipEdgesTotal > 0 && input.ownershipEdgesWithSource === input.ownershipEdgesTotal) score += 2
  if (input.childrenTotal > 0 && input.childrenWithLatestFinancial === input.childrenTotal) score += 2
  if (input.propertyCount >= 1) score += 1
  if (input.relationshipCount >= 1) score += 1
  if (input.daysSinceBrregRefresh !== null && input.daysSinceBrregRefresh < 90) score += 1
  if (input.maEventCount >= 1 || !input.expectsMaActivity) score += 1
  return score
}
```

- [ ] **Step 4: Run test to verify GREEN**

Run: `node --import=tsx --test tests/lib/konsern-coverage.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Create audit script**

Create `scripts/audit-konsern-coverage.ts`:

```ts
import 'dotenv/config'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { KONSERN_REGISTRY } from '../src/lib/queries/ownership'
import { computeQualityScore } from './lib/konsern-coverage-scoring'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type CoverageEntry = {
  slug: string
  rootCompanyId: string
  rootName: string
  rootOrgNr: string
  ownershipType: string | null
  controllingOwner: { name: string; pct: number | null; source: string | null } | null
  qualityScore: number
  metrics: {
    treeSize: number
    childrenWithLatestFinancial: number
    childrenWithoutFinancial: number
    childrenWithBoardMembers: number
    childrenWithoutBoardMembers: number
    ownershipEdgesWithSource: number
    ownershipEdgesWithoutSource: number
    propertyCount: number
    relationshipCount: number
    maEventCount: number
    maEventsWithDealValue: number
    daysSinceBrregRefresh: number | null
  }
  gaps: string[]
}

async function gatherTreeIds(rootId: string): Promise<string[]> {
  const ids = new Set<string>([rootId])
  let frontier = [rootId]
  while (frontier.length > 0) {
    const children = await prisma.companyOwnership.findMany({
      where: { parentCompanyId: { in: frontier } },
      select: { childCompanyId: true },
    })
    const nextFrontier: string[] = []
    for (const c of children) {
      if (!ids.has(c.childCompanyId)) {
        ids.add(c.childCompanyId)
        nextFrontier.push(c.childCompanyId)
      }
    }
    frontier = nextFrontier
  }
  return [...ids]
}

async function buildEntry(orgNr: string, cfg: { slug: string; expectsMaActivity: boolean }): Promise<CoverageEntry | null> {
  const root = await prisma.company.findUnique({ where: { orgNr } })
  if (!root) return null

  const treeIds = await gatherTreeIds(root.id)
  const ownershipEdges = await prisma.companyOwnership.findMany({
    where: { parentCompanyId: { in: treeIds } },
    select: { source: true, ownershipType: true, metadata: true, effectiveFrom: true },
  })
  const controllingShareholder = await prisma.shareholder.findFirst({
    where: { companyId: root.id, isControlling: true },
    select: { name: true, ownershipPct: true, source: true },
  })

  const currentYear = new Date().getFullYear()
  const latestYear = currentYear - 1
  const financials = await prisma.companyFinancial.findMany({
    where: { companyId: { in: treeIds }, year: latestYear },
    select: { companyId: true },
  })
  const childrenWithLatestFinancial = new Set(financials.map(f => f.companyId)).size

  const boardMembers = await prisma.boardMember.findMany({
    where: { companyId: { in: treeIds } },
    select: { companyId: true },
  })
  const childrenWithBoardMembers = new Set(boardMembers.map(b => b.companyId)).size

  const propertyCount = await prisma.companyProperty.count({ where: { companyId: { in: treeIds } } })
  const relationshipCount = await prisma.businessRelationship.count({
    where: { OR: [{ fromCompanyId: { in: treeIds } }, { toCompanyId: { in: treeIds } }] },
  })

  const maEvents = ownershipEdges.filter(e => {
    const meta = (e.metadata ?? {}) as Record<string, unknown>
    return typeof meta.dealType === 'string'
  })
  const maEventsWithDealValue = maEvents.filter(e => {
    const meta = (e.metadata ?? {}) as Record<string, unknown>
    return typeof meta.dealValue === 'number' || typeof meta.dealValue === 'string'
  }).length

  const daysSinceBrregRefresh = root.lastBrregRefreshAt
    ? Math.floor((Date.now() - root.lastBrregRefreshAt.getTime()) / (1000 * 60 * 60 * 24))
    : null

  const ownershipEdgesWithSource = ownershipEdges.filter(e => e.source && e.source.length > 0).length
  const ownershipEdgesWithoutSource = ownershipEdges.length - ownershipEdgesWithSource

  const qualityScore = computeQualityScore({
    hasControllingOwner: !!controllingShareholder,
    ownershipEdgesWithSource,
    ownershipEdgesTotal: ownershipEdges.length,
    childrenWithLatestFinancial,
    childrenTotal: treeIds.length - 1,
    propertyCount,
    relationshipCount,
    daysSinceBrregRefresh,
    maEventCount: maEvents.length,
    expectsMaActivity: cfg.expectsMaActivity,
  })

  const gaps: string[] = []
  if (!controllingShareholder) gaps.push('Mangler kontrollerende eier på rotnode')
  if (ownershipEdgesWithoutSource > 0) gaps.push(`${ownershipEdgesWithoutSource} ownership-kanter uten source`)
  const childrenWithoutFinancial = treeIds.length - 1 - childrenWithLatestFinancial
  if (childrenWithoutFinancial > 0) gaps.push(`${childrenWithoutFinancial} datterselskap uten siste års regnskap`)
  const childrenWithoutBoardMembers = treeIds.length - 1 - childrenWithBoardMembers
  if (childrenWithoutBoardMembers > 0) gaps.push(`${childrenWithoutBoardMembers} datterselskap uten styremedlemmer`)
  if (daysSinceBrregRefresh === null) gaps.push('Aldri Brreg-refreshet')
  else if (daysSinceBrregRefresh >= 90) gaps.push(`Brreg-refresh ${daysSinceBrregRefresh} dager gammel`)
  if (cfg.expectsMaActivity && maEvents.length === 0) gaps.push('Forventer M&A-aktivitet, ingen events registrert')

  return {
    slug: cfg.slug,
    rootCompanyId: root.id,
    rootName: root.name,
    rootOrgNr: root.orgNr ?? '',
    ownershipType: ownershipEdges[0]?.ownershipType ?? null,
    controllingOwner: controllingShareholder
      ? { name: controllingShareholder.name, pct: controllingShareholder.ownershipPct, source: controllingShareholder.source }
      : null,
    qualityScore,
    metrics: {
      treeSize: treeIds.length,
      childrenWithLatestFinancial,
      childrenWithoutFinancial,
      childrenWithBoardMembers,
      childrenWithoutBoardMembers,
      ownershipEdgesWithSource,
      ownershipEdgesWithoutSource,
      propertyCount,
      relationshipCount,
      maEventCount: maEvents.length,
      maEventsWithDealValue,
      daysSinceBrregRefresh,
    },
    gaps,
  }
}

async function main() {
  const entries: CoverageEntry[] = []
  const missing: string[] = []
  for (const [orgNr, cfg] of Object.entries(KONSERN_REGISTRY)) {
    const entry = await buildEntry(orgNr, cfg)
    if (entry) entries.push(entry)
    else missing.push(`${cfg.slug} (${orgNr})`)
  }

  // Also report orphan roots (not in registry)
  const allRoots: any = await prisma.$queryRaw`
    SELECT DISTINCT c.id, c."orgNr", c.name
    FROM "Company" c
    WHERE c.id IN (SELECT DISTINCT "parentCompanyId" FROM "CompanyOwnership")
    AND c.id NOT IN (SELECT DISTINCT "childCompanyId" FROM "CompanyOwnership")
  `
  const orphans = allRoots.filter((r: any) => !Object.keys(KONSERN_REGISTRY).includes(r.orgNr))

  const out = {
    generatedAt: new Date().toISOString(),
    entries: entries.sort((a, b) => a.qualityScore - b.qualityScore),
    missingFromData: missing,
    orphanRoots: orphans.map((r: any) => ({ id: r.id, orgNr: r.orgNr, name: r.name })),
  }

  const path = join(process.cwd(), 'data/konsern-coverage.json')
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(out, null, 2))
  console.log(`Wrote ${path}`)
  console.log(`  ${entries.length} konserner med data; ${missing.length} registry-entries mangler i DB`)
  console.log(`  ${orphans.length} orphan rotnoder (ikke i registry)`)
}

main().finally(() => prisma.$disconnect())
```

- [ ] **Step 6: Add npm scripts**

In `package.json`, add to `scripts`:

```json
    "audit:konsern": "tsx scripts/audit-konsern-coverage.ts",
```

And modify `compute-metrics` to also run audit:konsern:

```json
    "compute-metrics": "tsx scripts/compute-chart-metrics.ts --country=all && npm run audit:konsern",
```

- [ ] **Step 7: Run audit**

Run: `npm run audit:konsern`
Expected: `Wrote /Users/.../data/konsern-coverage.json` with entries for the 6-8 konserner that have ownership trees. Missing entries listed for Coop, Bama, Asko, Tine, Nortura, Leroy, Felleskjopet (those without trees).

- [ ] **Step 8: Verify**

Run: `npm test && npm run lint`
Expected: 254+ passed / 0 failed; lint clean.

- [ ] **Step 9: Commit**

```bash
git add scripts/audit-konsern-coverage.ts scripts/lib/konsern-coverage-scoring.ts tests/lib/konsern-coverage.test.ts data/konsern-coverage.json package.json
git commit -m "feat(eierskap): add konsern coverage audit and quality score"
```

---

### Task 4: Refactor /eierskap index to filterable table

**Files:**
- Modify: `src/lib/queries/ownership.ts` (add `getKonsernIndex()`)
- Modify: `src/app/eierskap/page.tsx`
- Modify: `src/app/eierskap/EierskapContent.tsx`
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Add `getKonsernIndex()` to ownership.ts**

In `src/lib/queries/ownership.ts`, add after KONSERN_REGISTRY exports:

```ts
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

type KonsernIndexRow = {
  slug: string
  rootCompanyId: string
  rootName: string
  qualityScore: number
  treeSize: number
  totalRevenue: number | null
  maEventsCount: number
  daysSinceBrregRefresh: number | null
  controllingOwner: { name: string; pct: number | null } | null
  ownershipType: string | null
  gaps: string[]
}

let coverageCache: any = null
function loadCoverage() {
  if (!coverageCache) {
    const path = join(process.cwd(), 'data/konsern-coverage.json')
    coverageCache = JSON.parse(readFileSync(path, 'utf-8'))
  }
  return coverageCache
}

export async function getKonsernIndex(): Promise<KonsernIndexRow[]> {
  const coverage = loadCoverage()
  const rows: KonsernIndexRow[] = []
  for (const entry of coverage.entries) {
    const treeIds = await gatherTreeIdsSync(entry.rootCompanyId)
    const currentYear = new Date().getFullYear()
    const financials = await prisma.companyFinancial.findMany({
      where: { companyId: { in: treeIds }, year: currentYear - 1 },
      select: { revenue: true },
    })
    const totalRevenue = financials.reduce<number | null>(
      (acc, f) => f.revenue != null ? (acc ?? 0) + f.revenue : acc,
      null,
    )
    rows.push({
      slug: entry.slug,
      rootCompanyId: entry.rootCompanyId,
      rootName: entry.rootName,
      qualityScore: entry.qualityScore,
      treeSize: entry.metrics.treeSize,
      totalRevenue,
      maEventsCount: entry.metrics.maEventCount,
      daysSinceBrregRefresh: entry.metrics.daysSinceBrregRefresh,
      controllingOwner: entry.controllingOwner ? {
        name: entry.controllingOwner.name,
        pct: entry.controllingOwner.pct,
      } : null,
      ownershipType: entry.ownershipType,
      gaps: entry.gaps,
    })
  }
  return rows.sort((a, b) => a.qualityScore - b.qualityScore)
}

async function gatherTreeIdsSync(rootId: string): Promise<string[]> {
  const ids = new Set<string>([rootId])
  let frontier = [rootId]
  while (frontier.length > 0) {
    const children = await prisma.companyOwnership.findMany({
      where: { parentCompanyId: { in: frontier } },
      select: { childCompanyId: true },
    })
    const nextFrontier: string[] = []
    for (const c of children) {
      if (!ids.has(c.childCompanyId)) { ids.add(c.childCompanyId); nextFrontier.push(c.childCompanyId) }
    }
    frontier = nextFrontier
  }
  return [...ids]
}
```

- [ ] **Step 2: Update page.tsx**

Replace `src/app/eierskap/page.tsx` content with:

```tsx
import { getKonsernIndex } from '@/lib/queries/ownership'
import { EierskapContent } from './EierskapContent'

export default async function EierskapPage() {
  const konserner = await getKonsernIndex()
  return <EierskapContent konserner={konserner} />
}
```

- [ ] **Step 3: Replace EierskapContent.tsx**

Replace `src/app/eierskap/EierskapContent.tsx` content with table + aggregate strip implementation. Full code skeleton:

```tsx
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

type KonsernIndexRow = {
  slug: string
  rootCompanyId: string
  rootName: string
  qualityScore: number
  treeSize: number
  totalRevenue: number | null
  maEventsCount: number
  daysSinceBrregRefresh: number | null
  controllingOwner: { name: string; pct: number | null } | null
  ownershipType: string | null
  gaps: string[]
}

const SCORE_COLOR = (score: number): string => {
  if (score <= 4) return 'bg-rose-100 text-rose-800 border-rose-200'
  if (score <= 7) return 'bg-amber-100 text-amber-800 border-amber-200'
  return 'bg-emerald-100 text-emerald-800 border-emerald-200'
}

function fmtRevenue(n: number | null): string {
  if (n === null) return '—'
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} mrd`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} mill`
  return n.toString()
}

function fmtDays(n: number | null): string {
  if (n === null) return 'Aldri'
  if (n < 30) return `${n} dager siden`
  if (n < 365) return `${Math.floor(n / 30)} mnd siden`
  return `${Math.floor(n / 365)} år siden`
}

export function EierskapContent({ konserner }: { konserner: KonsernIndexRow[] }) {
  const [search, setSearch] = useState('')
  const [minScore, setMinScore] = useState(0)

  const filtered = useMemo(() => {
    return konserner.filter(k => {
      if (k.qualityScore < minScore) return false
      if (search) {
        const s = search.toLowerCase()
        if (!k.rootName.toLowerCase().includes(s) && !(k.controllingOwner?.name.toLowerCase().includes(s) ?? false)) return false
      }
      return true
    })
  }, [konserner, search, minScore])

  const totals = useMemo(() => ({
    konserner: konserner.length,
    selskap: konserner.reduce((sum, k) => sum + k.treeSize, 0),
    gaps: konserner.reduce((sum, k) => sum + k.gaps.length, 0),
  }), [konserner])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Eierskap & konsernstrukturer</h1>
        <p className="text-sm text-stone-400 mt-1">
          {totals.konserner} sporede konserner · {totals.selskap} datterselskap kartlagt · {totals.gaps} åpne datakvalitet-gap
        </p>
      </div>

      <Card>
        <div className="flex gap-4 flex-wrap items-center">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Søk konsern eller eier..."
            className="px-3 py-1.5 border border-stone-200 rounded text-sm flex-1 min-w-[200px]"
          />
          <label className="text-xs text-stone-600 flex items-center gap-2">
            Min. score:
            <input type="range" min="0" max="10" value={minScore} onChange={e => setMinScore(Number(e.target.value))} />
            <span className="font-semibold text-stone-800 w-6">{minScore}</span>
          </label>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState message="Ingen konserner matcher filteret" />
      ) : (
        <Card className="!p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200 text-xs text-stone-600">
              <tr>
                <th className="text-left px-3 py-2">Konsern</th>
                <th className="text-left px-3 py-2">Kontr. eier</th>
                <th className="text-right px-3 py-2">Selskap i tre</th>
                <th className="text-right px-3 py-2">Omsetning</th>
                <th className="text-right px-3 py-2">M&amp;A</th>
                <th className="text-center px-3 py-2">Score</th>
                <th className="text-right px-3 py-2">Brreg</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(k => (
                <tr key={k.slug} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="px-3 py-2">
                    <Link href={`/eierskap/${k.slug}`} className="font-semibold text-emerald-700 hover:underline">
                      {k.rootName}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-stone-700">
                    {k.controllingOwner ? `${k.controllingOwner.name}${k.controllingOwner.pct !== null ? ` (${k.controllingOwner.pct}%)` : ''}` : <span className="text-stone-400">—</span>}
                  </td>
                  <td className="px-3 py-2 text-right">{k.treeSize}</td>
                  <td className="px-3 py-2 text-right text-stone-700">{fmtRevenue(k.totalRevenue)}</td>
                  <td className="px-3 py-2 text-right">{k.maEventsCount}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded border ${SCORE_COLOR(k.qualityScore)}`}>{k.qualityScore}</span>
                  </td>
                  <td className="px-3 py-2 text-right text-stone-500 text-xs">{fmtDays(k.daysSinceBrregRefresh)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Update sidebar description**

In `src/components/layout/Sidebar.tsx`, find the eierskap link line and update its description from "Konsernstrukturer og eiertrær" to "Konserndossier og datakvalitet".

- [ ] **Step 5: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 6: Run tests**

Run: `npm test`
Expected: all pass.

- [ ] **Step 7: Browser smoke test**

Run: `npm run dev` and open `http://localhost:3000/eierskap` (or 3002 if 3000 in use). Verify:
- Table renders with N rows (one per konsern in registry that has tree data)
- Aggregate strip shows correct totals
- Search filters rows in real-time
- Min-score slider hides low-score rows
- Each konsern link points to `/eierskap/{slug}` (404 until Task 5 lands)
- Sort default: lowest score first

- [ ] **Step 8: Commit**

```bash
git add src/lib/queries/ownership.ts src/app/eierskap/page.tsx src/app/eierskap/EierskapContent.tsx src/components/layout/Sidebar.tsx
git commit -m "feat(eierskap): refactor index to filterable konsern table"
```

---

**Phase 1 milestone:** `/eierskap` is now a filterable table of konserner sorted by data-quality score. `data/konsern-coverage.json` provides the audit trail. Detail pages are 404 until Phase 2 lands. Stop here if pausing.

---

## Phase 2: Detail dossier

### Task 5: Detail route shell + Section 1 (Header)

**Files:**
- Create: `src/app/eierskap/[slug]/page.tsx`
- Create: `src/app/eierskap/[slug]/KonsernDossier.tsx`
- Modify: `src/lib/queries/ownership.ts` — add `getKonsernDossier(slug)`

- [ ] **Step 1: Add `getKonsernDossier(slug)` to ownership.ts**

Returns a typed dossier object containing: konsern root metadata, full tree, controlling shareholder, latest aggregated financials, ma-events, board members per company, subsidies aggregated, properties aggregated, relationships, and the coverage entry. Use the `loadCoverage()` cache + per-konsern Prisma queries. Signature:

```ts
export async function getKonsernDossier(slug: string): Promise<KonsernDossierData | null>
```

Returns `null` if slug not in registry or root company not found in DB.

(Full type and implementation: ~150 lines. Engineer: lay out type fields based on what sections need; query each in parallel via Promise.all where independent.)

- [ ] **Step 2: Create route page**

Create `src/app/eierskap/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { getKonsernDossier } from '@/lib/queries/ownership'
import { KonsernDossier } from './KonsernDossier'

export default async function KonsernPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const dossier = await getKonsernDossier(slug)
  if (!dossier) notFound()
  return <KonsernDossier dossier={dossier} />
}
```

- [ ] **Step 3: Create KonsernDossier with Section 1**

Create `src/app/eierskap/[slug]/KonsernDossier.tsx` with Section 1 (Header) only:

```tsx
'use client'

import type { KonsernDossierData } from '@/lib/queries/ownership'

export function KonsernDossier({ dossier }: { dossier: KonsernDossierData }) {
  const { root, controllingOwner, ownershipType, metrics } = dossier
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-stone-900">{root.name}</h1>
        <div className="mt-2 flex flex-wrap gap-2 items-center">
          {ownershipType && <span className="text-xs px-2 py-0.5 rounded border bg-stone-100 border-stone-200 text-stone-700">{ownershipType}</span>}
          {controllingOwner && (
            <span className="text-sm text-stone-700">
              Kontrollerende eier: <strong>{controllingOwner.name}</strong>
              {controllingOwner.pct !== null && ` (${controllingOwner.pct}%)`}
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-6 text-sm">
          <Stat label="Selskap i tre" value={metrics.treeSize} />
          <Stat label="Sum omsetning" value={metrics.totalRevenue} format="currency" />
          <Stat label="Sum ansatte" value={metrics.totalEmployees} />
          <Stat label="Sist Brreg-refreshet" value={metrics.daysSinceBrregRefresh} format="days" />
        </div>
      </header>
      {/* Sections 2-9 added in Tasks 6-9 */}
    </div>
  )
}

function Stat({ label, value, format }: { label: string; value: number | null; format?: 'currency' | 'days' }) {
  return (
    <div>
      <div className="text-xs text-stone-500">{label}</div>
      <div className="text-base font-semibold text-stone-900">
        {value === null ? '—' : format === 'currency' ? `${(value / 1_000_000).toFixed(0)} mill` : format === 'days' ? `${value} dager siden` : value}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Type-check, lint, test**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: clean.

- [ ] **Step 5: Browser smoke test**

Open `http://localhost:3000/eierskap/norgesgruppen`. Verify header renders with root name, ownership type, controlling owner, and 4 stat numbers.

- [ ] **Step 6: Commit**

```bash
git add src/lib/queries/ownership.ts src/app/eierskap/[slug]/page.tsx src/app/eierskap/[slug]/KonsernDossier.tsx
git commit -m "feat(eierskap): add konsern detail route with header section"
```

---

### Task 6: Sections 2-3 (tree + M&A timeline)

**Files:**
- Modify: `src/app/eierskap/[slug]/KonsernDossier.tsx`

- [ ] **Step 1: Add Section 2 — Konsernstruktur**

Reuse `OwnershipTreeDiagram` from existing components. Pass the `dossier.tree` data. If `dossier.tree.nodeCount > 30`, add a toggle for flat table view (parent/child/pct/type/source).

- [ ] **Step 2: Add Section 3 — M&A-historikk**

Timeline of `dossier.maEvents`, sorted by `effectiveFrom` desc. Events without date listed last under "Udatert". Each event card: type badge, target name, value (formatted), source chip, notes.

- [ ] **Step 3: tsc + lint + browser**

Verify both sections render for NorgesGruppen.

- [ ] **Step 4: Commit**

```bash
git add src/app/eierskap/[slug]/KonsernDossier.tsx
git commit -m "feat(eierskap): add tree and M&A sections to dossier"
```

---

### Task 7: Sections 4-5 (aggregated economy + board interlocks)

**Files:**
- Create: `src/lib/queries/konsern.ts` (move aggregate query helpers here)
- Modify: `src/app/eierskap/[slug]/KonsernDossier.tsx`

- [ ] **Step 1: Build aggregate financial query**

In `src/lib/queries/konsern.ts`, export `getKonsernFinancials(treeIds: string[])` returning per-year sums of revenue/EBITDA/employees + top-5 children by latest revenue + count of children missing latest year.

- [ ] **Step 2: Build board interlock query**

Export `getKonsernBoardWithInterlocks(treeIds: string[])` returning board members grouped by personKey, with interlock flags (`internalInterlock` if in ≥2 konsernselskap; `externalInterlock` if also in another konsern).

- [ ] **Step 3: Render Section 4 (table + top-5 + ekspanderbar liste over manglende regnskap)**

- [ ] **Step 4: Render Section 5 (board interlock table with badges, link to /personer/{personKey} when profile exists)**

- [ ] **Step 5: tsc + lint + tests + browser**

- [ ] **Step 6: Commit**

```bash
git add src/lib/queries/konsern.ts src/app/eierskap/[slug]/KonsernDossier.tsx
git commit -m "feat(eierskap): add aggregated economy and board interlock sections"
```

---

### Task 8: Sections 6-8 (subsidies, properties, relationships)

**Files:**
- Modify: `src/lib/queries/konsern.ts` (add subsidies/properties/relationships aggregators)
- Modify: `src/app/eierskap/[slug]/KonsernDossier.tsx`

- [ ] **Step 1: Add aggregator functions**

`getKonsernSubsidies(treeIds)`, `getKonsernProperties(treeIds)`, `getKonsernRelationships(treeIds)`.

- [ ] **Step 2: Render Section 6 — Tilskudd inn**

Sum per year (last 5), top-5 schemes, top-5 recipient companies, link to `/subsidier?konsern={slug}` (filter implemented in Task 11).

- [ ] **Step 3: Render Section 7 — Eiendommer**

Table aggregated per municipality. Link to `/eiendommer?konsern={slug}`.

- [ ] **Step 4: Render Section 8 — Forretningsrelasjoner**

Three sub-sections: outgoing external, incoming external, intra-konsern (flagged for market-power analysis).

- [ ] **Step 5: tsc + lint + browser**

- [ ] **Step 6: Commit**

```bash
git add src/lib/queries/konsern.ts src/app/eierskap/[slug]/KonsernDossier.tsx
git commit -m "feat(eierskap): add subsidies, properties, relationships sections"
```

---

### Task 9: Section 9 (data quality + enrichment suggestions)

**Files:**
- Modify: `src/app/eierskap/[slug]/KonsernDossier.tsx`

- [ ] **Step 1: Render Section 9 — Datakvalitet & gap**

Sjekkliste-tabell sourced from `dossier.coverage.gaps`. Show as table with status icons. Below: static "Foreslåtte berikelseskilder" section listing Aksjonærregisteret, nordiske eierregistre, Brreg Roller-API.

- [ ] **Step 2: Browser smoke test for all 9 sections**

Verify NorgesGruppen renders complete dossier without console errors.

- [ ] **Step 3: Run full test suite + build**

Run: `npm test && npm run build`
Expected: all pass; route `/eierskap/[slug]` listed in build output.

- [ ] **Step 4: Commit**

```bash
git add src/app/eierskap/[slug]/KonsernDossier.tsx
git commit -m "feat(eierskap): add data quality section to dossier"
```

---

**Phase 2 milestone:** `/eierskap/{slug}` renders the full 9-section dossier. Stop here for incremental ship.

---

## Phase 3: Data freshness + cross-page filters

### Task 10: BRREG refresh script

**Files:**
- Create: `scripts/refresh-brreg-tracked.ts`
- Modify: `package.json` (add `refresh:brreg`)

- [ ] **Step 1: Implement script**

Fetches `https://data.brreg.no/enhetsregisteret/api/enheter/{orgnr}` for each Company in DB. Updates NACE-kode, NACE-beskrivelse, adresse, ansatte (siste registrerte), status, `lastBrregRefreshAt`. Idempotent. Supports `--dry-run`.

- [ ] **Step 2: Add npm script**

```json
    "refresh:brreg": "tsx scripts/refresh-brreg-tracked.ts",
```

- [ ] **Step 3: Dry-run on tracked companies**

Run: `npm run refresh:brreg -- --dry-run`
Expected: prints proposed updates without writing.

- [ ] **Step 4: Document in research/data-readiness**

Create `research/data-readiness/eierskap-tree-revisjon.md` with a TODO-list for manual tree revisjon of the 14 `import-*-tree.ts` scripts against 2025/2026 sources.

- [ ] **Step 5: Apply and verify**

Run: `npm run refresh:brreg`
Expected: rows updated; `lastBrregRefreshAt` set; subsequent `npm run audit:konsern` shows fresh days.

- [ ] **Step 6: Commit**

```bash
git add scripts/refresh-brreg-tracked.ts package.json research/data-readiness/eierskap-tree-revisjon.md
git commit -m "feat(eierskap): add BRREG refresh script and revisjon backlog"
```

---

### Task 11: Cross-page `?konsern={slug}` filters + /selskap link update

**Files:**
- Modify: `src/app/eiendommer/page.tsx` + content
- Modify: `src/app/subsidier/page.tsx` + content
- Modify: `src/app/selskap/[id]/page.tsx`

- [ ] **Step 1: Add `konsern` query param handling to /eiendommer**

Read `?konsern={slug}` via `searchParams`. Resolve slug → orgnr → tree → filter properties to companies in tree.

- [ ] **Step 2: Add `konsern` query param handling to /subsidier**

Same pattern. Filter subsidies to recipient producers/companies in tree.

- [ ] **Step 3: Update /selskap/[id] link**

Replace existing "Se eierskapstre →" link (which goes to `/eierskap` without context) with "Se konsern →" pointing to `/eierskap/{slug}` for the company's konsern root, when in registry. If not in registry, hide the link.

- [ ] **Step 4: tsc + lint + browser**

Open `/eiendommer?konsern=norgesgruppen` and `/subsidier?konsern=norgesgruppen`. Verify filter applies; aggregate strip shows konsern-scoped totals.

- [ ] **Step 5: Commit**

```bash
git add src/app/eiendommer/ src/app/subsidier/ src/app/selskap/[id]/page.tsx
git commit -m "feat(eierskap): cross-page konsern filters and /selskap link update"
```

---

**Phase 3 milestone:** Cross-page filters live. /selskap pages link directly to konsern dossier.

---

## Acceptance Criteria

- [ ] `npm run audit:konsern` produces `data/konsern-coverage.json` with entries for all in-DB konsern roots
- [ ] `/eierskap` shows filterable table sorted by quality score
- [ ] Aggregate strip shows konsern count, total selskap, total gaps
- [ ] Each konsern row links to `/eierskap/{slug}`
- [ ] `/eierskap/{slug}` renders 9 sections without console errors
- [ ] `/eierskap/notreal` returns 404
- [ ] `/selskap/{id}` shows "Se konsern →" for selskap in tracked konsern, hidden otherwise
- [ ] `?konsern={slug}` URL filter works on /eiendommer and /subsidier
- [ ] `npm run refresh:brreg` updates `lastBrregRefreshAt` and core BRREG fields
- [ ] `npm test` passes all suites
- [ ] `npm run lint` clean
- [ ] `npm run build` succeeds

---

## Self-Review Notes

**Spec coverage:** Foundation (T1-3) ✓; index page (T4) ✓; 9 detail sections (T5-9) ✓; BRREG refresh (T10) ✓; cross-page filters + /selskap link (T11) ✓; revisjon backlog doc (T10) ✓; data quality score formula (T3) ✓.

**Out-of-scope confirmations (per spec):** No Aksjonærregisteret import. No nordiske eierregistre. No automated M&A monitoring. No HHI/konsentrasjonsmål (belongs on /verdikjede). No automated cron for BRREG refresh.

**Risk areas flagged:**
- Sirkulære eierskap (sykler) i `CompanyOwnership` — `gatherTreeIds` uses Set-based dedup so loops won't infinite-loop. Audit script should log warning if cycles detected (TODO inline in Task 3 if encountered).
- BRREG API rate limits — 51 companies × 1 request is trivial, but add `await new Promise(r => setTimeout(r, 100))` between requests as polite default.
- Coverage cache (`loadCoverage`) reads the JSON at module load and caches. If `audit:konsern` hasn't been run since schema changes, queries fail. Build pipeline (`compute-metrics`) ensures it runs before `next build` — local dev needs `npm run audit:konsern` once.
