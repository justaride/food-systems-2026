import { promises as fs } from 'node:fs'
import path from 'node:path'

type CountStatus = {
  ok: boolean
  minRequired: number
  actual: number | null
  error?: string
}

type CountDelegate = {
  count: (args?: unknown) => Promise<number>
}

type LatestFinancialYearDelegate = CountDelegate & {
  findFirst: (args?: unknown) => Promise<{ year: number } | null>
}

export type DataStatusDb = {
  subsidy: CountDelegate
  aquacultureSite: CountDelegate
  aquacultureApplication: CountDelegate
  fishHealthObservation: CountDelegate
  deliveryVolume: CountDelegate
  businessRelationship: CountDelegate
  company: CountDelegate
  companyFinancial: LatestFinancialYearDelegate
  companyProperty: CountDelegate
  producer: CountDelegate
  phase: CountDelegate
  teamMember: CountDelegate
  kPI: CountDelegate
  tenStep: CountDelegate
  evidenceDoc: CountDelegate
  application: CountDelegate
  insight: CountDelegate
  meeting: CountDelegate
  communication: CountDelegate
  document: CountDelegate
  actor: CountDelegate
  personProfile: CountDelegate
}

export type CoverageTone = 'ok' | 'warn' | 'critical' | 'unknown'

export type FieldCoverageMetric = {
  id: string
  surface: string
  label: string
  denominatorLabel: string
  total: number | null
  covered: number | null
  missing: number | null
  percent: number | null
  status: CoverageTone
  consequence: string
  measuredYear?: number
  error?: string
}

export type OperationalGap = {
  id: string
  label: string
  route: string
  table: string
  actual: number | null
  minExpected: number
  severity: 'warn' | 'critical'
  consequence: string
}

export type ArtifactStatus = {
  id: string
  label: string
  paths: string[]
  generatedAt: string | null
  displayDate: string
  dateSource: 'generatedAt' | 'generated' | 'year' | 'missing'
  status: 'ok' | 'warn' | 'missing'
  note: string
}

type DataStatusOptions = {
  artifactRoot?: string
}

export type FallbackSurface = {
  id: string
  route: string
  queryModule: string
  fallbackSource: string
  fallbackTrigger: string
  statusCoverage: 'listed_only' | 'counted_table'
  risk: 'medium' | 'low'
}

export const fallbackSurfaces: FallbackSurface[] = [
  {
    id: 'project-core',
    route: '/',
    queryModule: 'src/lib/queries/project.ts',
    fallbackSource: 'src/lib/data/{phases,team,kpis,ten-step-start,evidence-pack,applications,insights}.ts',
    fallbackTrigger: 'Prisma data unavailable for project overview tables',
    statusCoverage: 'counted_table',
    risk: 'medium',
  },
  {
    id: 'meetings',
    route: '/moter',
    queryModule: 'src/lib/queries/meetings.ts',
    fallbackSource: 'src/lib/data/meetings.ts',
    fallbackTrigger: 'Meeting query fails because Prisma data is unavailable',
    statusCoverage: 'counted_table',
    risk: 'medium',
  },
  {
    id: 'communications',
    route: '/kommunikasjon',
    queryModule: 'src/lib/queries/communications.ts',
    fallbackSource: 'src/lib/data/communications.ts',
    fallbackTrigger: 'Communication and correspondence document queries return no rows or data is unavailable',
    statusCoverage: 'counted_table',
    risk: 'medium',
  },
  {
    id: 'search-semantic',
    route: '/sok',
    queryModule: 'src/lib/queries/search.ts',
    fallbackSource: 'keyword search over Document/SourceDoc/Report records',
    fallbackTrigger: 'Semantic/vector search unavailable or missing supporting tables',
    statusCoverage: 'listed_only',
    risk: 'low',
  },
  {
    id: 'entity-surfaces',
    route: '/graf, /personer, /selskap',
    queryModule: 'src/lib/queries/{graph,persons,companies}.ts',
    fallbackSource: 'Empty result or BoardMember-derived fallback rows for missing optional tables',
    fallbackTrigger: 'Optional entity tables are missing or temporarily unavailable',
    statusCoverage: 'counted_table',
    risk: 'medium',
  },
]

async function safeCount(label: string, count: () => Promise<number>): Promise<{ label: string; actual: number | null; error?: string }> {
  try {
    return { label, actual: await count() }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { label, actual: null, error: message }
  }
}

async function safeLatestFinancialYear(db: DataStatusDb): Promise<{ actual: number | null; error?: string }> {
  try {
    const latest = await db.companyFinancial.findFirst({
      orderBy: { year: 'desc' },
      select: { year: true },
    })
    return { actual: latest?.year ?? null }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { actual: null, error: message }
  }
}

export function buildCountStatus(actual: number | null, minRequired: number, error?: string): CountStatus {
  return {
    ok: actual !== null && actual >= minRequired,
    minRequired,
    actual,
    ...(error ? { error } : {}),
  }
}

function roundPercent(covered: number, total: number): number {
  if (total === 0) return 0
  return Math.round((covered / total) * 1000) / 10
}

function coverageStatus(percent: number | null): CoverageTone {
  if (percent == null) return 'unknown'
  if (percent < 50) return 'critical'
  if (percent < 80) return 'warn'
  return 'ok'
}

function buildFieldCoverageMetric(input: {
  id: string
  surface: string
  label: string
  denominatorLabel: string
  total: number | null
  covered: number | null
  consequence: string
  measuredYear?: number
  error?: string
}): FieldCoverageMetric {
  const missing =
    input.total == null || input.covered == null
      ? null
      : Math.max(0, input.total - input.covered)
  const percent =
    input.total == null || input.covered == null || input.total === 0
      ? null
      : roundPercent(input.covered, input.total)

  return {
    ...input,
    missing,
    percent,
    status: coverageStatus(percent),
  }
}

async function safeFieldCoverageMetric(input: {
  id: string
  surface: string
  label: string
  denominatorLabel: string
  consequence: string
  total: () => Promise<number>
  covered: () => Promise<number>
  measuredYear?: number
}): Promise<FieldCoverageMetric> {
  const [totalResult, coveredResult] = await Promise.all([
    safeCount(`${input.id}.total`, input.total),
    safeCount(`${input.id}.covered`, input.covered),
  ])
  const error = [totalResult.error, coveredResult.error].filter(Boolean).join(' | ') || undefined

  return buildFieldCoverageMetric({
    id: input.id,
    surface: input.surface,
    label: input.label,
    denominatorLabel: input.denominatorLabel,
    total: totalResult.actual,
    covered: coveredResult.actual,
    consequence: input.consequence,
    measuredYear: input.measuredYear,
    error,
  })
}

function buildOperationalGaps(counts: Record<string, number | null>): OperationalGap[] {
  const gapConfigs = [
    {
      id: 'communications-empty',
      label: 'Kommunikasjon mangler DB-rader',
      route: '/kommunikasjon',
      table: 'Communication',
      actual: counts.communications,
      minExpected: 1,
      severity: 'warn' as const,
      consequence: 'Siden faller tilbake til tom-/arbeidsmelding og kan ikke dokumentere korrespondanse fra databasen.',
    },
    {
      id: 'fish-health-empty',
      label: 'Fiskehelse er ikke lastet',
      route: '/havbruk',
      table: 'FishHealthObservation',
      actual: counts.fishHealthObservations,
      minExpected: 1,
      severity: 'warn' as const,
      consequence: 'Havbruk viser lokaliteter og søknader, men ikke luse-/helseobservasjoner fra BarentsWatch.',
    },
    {
      id: 'landbruksregister-narrow',
      label: 'Landbruksregisteret er smalt innlastet',
      route: '/produsenter',
      table: 'Company.metadata.source=Landbruksregisteret',
      actual: counts.landbruksregisterCompanies,
      minExpected: 100,
      severity: 'warn' as const,
      consequence: 'Produsentflatene må leses som register-/leveransedata, ikke komplett kartlegging av landbruksregisteret i Company.',
    },
  ]

  return gapConfigs.filter(gap => gap.actual == null || gap.actual < gap.minExpected)
}

async function readJson(rootDir: string, relPath: string): Promise<Record<string, unknown> | null> {
  try {
    const raw = await fs.readFile(path.join(rootDir, relPath), 'utf-8')
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }
}

function summarizeYears(years: number[]): string | null {
  if (years.length === 0) return null
  const uniqueYears = [...new Set(years)].sort((a, b) => a - b)
  if (uniqueYears.length === 1) return String(uniqueYears[0])
  return `${uniqueYears[0]}-${uniqueYears[uniqueYears.length - 1]}`
}

async function buildArtifactStatus(input: {
  id: string
  label: string
  paths: string[]
  rootDir: string
  missingNote: string
  yearNote: string
}): Promise<ArtifactStatus> {
  const parsed = await Promise.all(
    input.paths.map(async relPath => ({ relPath, json: await readJson(input.rootDir, relPath) })),
  )
  const existing = parsed.filter((row): row is { relPath: string; json: Record<string, unknown> } => row.json != null)

  if (existing.length === 0) {
    return {
      id: input.id,
      label: input.label,
      paths: input.paths,
      generatedAt: null,
      displayDate: 'mangler',
      dateSource: 'missing',
      status: 'missing',
      note: input.missingNote,
    }
  }

  const generatedAtValues = existing
    .map(row => row.json.generatedAt)
    .filter((value): value is string => typeof value === 'string')
    .sort()
  if (generatedAtValues.length > 0) {
    return {
      id: input.id,
      label: input.label,
      paths: existing.map(row => row.relPath),
      generatedAt: generatedAtValues[0],
      displayDate: generatedAtValues[0],
      dateSource: 'generatedAt',
      status: 'ok',
      note: 'Viser eldste generatedAt blant filene i artefaktfamilien.',
    }
  }

  const generatedValues = existing
    .map(row => row.json.generated)
    .filter((value): value is string => typeof value === 'string')
    .sort()
  if (generatedValues.length > 0) {
    return {
      id: input.id,
      label: input.label,
      paths: existing.map(row => row.relPath),
      generatedAt: generatedValues[0],
      displayDate: generatedValues[0],
      dateSource: 'generated',
      status: 'ok',
      note: 'Viser eldste generated-felt blant filene i artefaktfamilien.',
    }
  }

  const years = existing
    .map(row => row.json.year)
    .filter((value): value is number => typeof value === 'number')
  const yearLabel = summarizeYears(years)

  return {
    id: input.id,
    label: input.label,
    paths: existing.map(row => row.relPath),
    generatedAt: null,
    displayDate: yearLabel ?? 'ikke datert',
    dateSource: yearLabel ? 'year' : 'missing',
    status: yearLabel ? 'warn' : 'missing',
    note: yearLabel ? input.yearNote : input.missingNote,
  }
}

export async function getArtifactStatuses(rootDir = process.cwd()): Promise<ArtifactStatus[]> {
  const countries = ['no', 'se', 'dk', 'fi', 'is']

  return Promise.all([
    buildArtifactStatus({
      id: 'konsern-coverage',
      label: 'Konsern-coverage',
      rootDir,
      paths: ['data/konsern-coverage.json'],
      missingNote: 'Konsern-coverage-artefakt mangler lokalt; kjør npm run audit:konsern.',
      yearNote: 'Konsern-coverage bør ha generatedAt, ikke bare år.',
    }),
    buildArtifactStatus({
      id: 'chart-metrics',
      label: 'Chart metrics',
      rootDir,
      paths: [
        'public/data/food-systems/chart-metrics.json',
        ...countries.map(country => `public/data/food-systems/${country}/chart-metrics.json`),
      ],
      missingNote: 'Chart-metrics-artefakter mangler lokalt; kjør npm run compute-metrics.',
      yearNote: 'Chart metrics bør ha generated/generatedAt, ikke bare år.',
    }),
    buildArtifactStatus({
      id: 'value-chain',
      label: 'Value-chain',
      rootDir,
      paths: countries.map(country => `public/data/food-systems/${country}/value-chain.json`),
      missingNote: 'Value-chain-artefakter mangler lokalt.',
      yearNote: 'Value-chain-filene mangler generatedAt; siden viser datasettår som svakere datering.',
    }),
  ])
}

export async function getDataStatus(db: DataStatusDb, options: DataStatusOptions = {}) {
  const latestFinancialYear = await safeLatestFinancialYear(db)
  const countResults = await Promise.all([
    safeCount('subsidiesAll', () => db.subsidy.count()),
    safeCount('subsidiesProduksjon', () => db.subsidy.count({ where: { subsidyType: 'produksjonstilskudd' } })),
    safeCount('aquacultureSites', () => db.aquacultureSite.count()),
    safeCount('aquacultureApplications', () => db.aquacultureApplication.count()),
    safeCount('fishHealthObservations', () => db.fishHealthObservation.count()),
    safeCount('deliveryVolumes', () => db.deliveryVolume.count()),
    safeCount('businessRelationships', () => db.businessRelationship.count()),
    safeCount('landbruksregisterCompanies', () => db.company.count({
      where: { metadata: { path: ['source'], equals: 'Landbruksregisteret' } },
    })),
    safeCount('companyFinancials', () => db.companyFinancial.count()),
    safeCount('companyProperties', () => db.companyProperty.count()),
    safeCount('producers', () => db.producer.count()),
    safeCount('phases', () => db.phase.count()),
    safeCount('teamMembers', () => db.teamMember.count()),
    safeCount('kpis', () => db.kPI.count()),
    safeCount('tenSteps', () => db.tenStep.count()),
    safeCount('evidenceDocs', () => db.evidenceDoc.count()),
    safeCount('applications', () => db.application.count()),
    safeCount('insights', () => db.insight.count()),
    safeCount('meetings', () => db.meeting.count()),
    safeCount('communications', () => db.communication.count()),
    safeCount('documents', () => db.document.count()),
    safeCount('actors', () => db.actor.count()),
    safeCount('companies', () => db.company.count()),
    safeCount('personProfiles', () => db.personProfile.count()),
  ])

  const countByLabel = Object.fromEntries(countResults.map(result => [result.label, result]))
  const actual = (label: string) => countByLabel[label]?.actual ?? null
  const error = (label: string) => countByLabel[label]?.error

  const tables = Object.fromEntries(countResults.map(result => [result.label, result.actual]))
  const tableErrors = Object.fromEntries(
    countResults
      .filter((result): result is { label: string; actual: null; error: string } => Boolean(result.error))
      .map(result => [result.label, result.error]),
  )

  const pages: Record<string, CountStatus> = {
    subsidier: buildCountStatus(actual('subsidiesProduksjon'), 100, error('subsidiesProduksjon')),
    havbruk: buildCountStatus(actual('aquacultureSites'), 50, error('aquacultureSites')),
    forsyningskjede: buildCountStatus(actual('deliveryVolumes'), 1, error('deliveryVolumes')),
  }

  const fallbackSensitiveTables = {
    projectCore: {
      phases: actual('phases'),
      teamMembers: actual('teamMembers'),
      kpis: actual('kpis'),
      tenSteps: actual('tenSteps'),
      evidenceDocs: actual('evidenceDocs'),
      applications: actual('applications'),
      insights: actual('insights'),
    },
    meetings: {
      meetings: actual('meetings'),
    },
    communications: {
      communications: actual('communications'),
      documents: actual('documents'),
    },
    entities: {
      actors: actual('actors'),
      companies: actual('companies'),
      personProfiles: actual('personProfiles'),
      businessRelationships: actual('businessRelationships'),
    },
  }

  const fieldCoverage = await Promise.all([
    safeFieldCoverageMetric({
      id: 'companies.latest-financial',
      surface: 'Selskap / finans',
      label: latestFinancialYear.actual == null
        ? 'Selskaper med regnskap'
        : `Selskaper med regnskap (nyeste DB-år ${latestFinancialYear.actual})`,
      denominatorLabel: 'Company-rader',
      total: () => db.company.count(),
      covered: () => db.company.count({ where: { financials: { some: {} } } }),
      measuredYear: latestFinancialYear.actual ?? undefined,
      consequence: 'Rader uten regnskapsrad får svakere økonomi- og konserndekning; nyeste tilgjengelige rad brukes per selskap.',
    }),
    safeFieldCoverageMetric({
      id: 'companies.employees',
      surface: 'Selskap / finans',
      label: 'Selskaper med ansatte',
      denominatorLabel: 'Company-rader',
      total: () => db.company.count(),
      covered: () => db.company.count({
        where: {
          OR: [
            { employees: { not: null } },
            { financials: { some: { groupEmployees: { not: null } } } },
          ],
        },
      }),
      consequence: 'Manglende ansatte gjør størrelse, effektivitet og kartvisninger mindre presise.',
    }),
    safeFieldCoverageMetric({
      id: 'companies.controlling-owner',
      surface: 'Selskap / eierskap',
      label: 'Selskaper med kontrollerende eier',
      denominatorLabel: 'Company-rader',
      total: () => db.company.count(),
      covered: () => db.company.count({ where: { shareholders: { some: { isControlling: true } } } }),
      consequence: 'Manglende kontrollerende eier svekker konsern-, eier- og maktkonsentrasjonslesning.',
    }),
    safeFieldCoverageMetric({
      id: 'aquaculture.capacity',
      surface: 'Havbruk',
      label: 'Lokaliteter med kapasitet',
      denominatorLabel: 'AquacultureSite-rader',
      total: () => db.aquacultureSite.count(),
      covered: () => db.aquacultureSite.count({ where: { capacityTonnes: { not: null } } }),
      consequence: 'Lokaliteter uten kapasitet kan telles, men bidrar ikke til MTB-/biomasseanalyser.',
    }),
    safeFieldCoverageMetric({
      id: 'properties.sqm',
      surface: 'Eiendommer',
      label: 'Eiendommer med kvadratmeter',
      denominatorLabel: 'CompanyProperty-rader',
      total: () => db.companyProperty.count(),
      covered: () => db.companyProperty.count({ where: { sqMeters: { not: null } } }),
      consequence: 'Eiendommer uten areal kan kartlegges, men ikke summeres i areal- og leieflateanalyser.',
    }),
    safeFieldCoverageMetric({
      id: 'properties.acquired-year',
      surface: 'Eiendommer',
      label: 'Eiendommer med år',
      denominatorLabel: 'CompanyProperty-rader',
      total: () => db.companyProperty.count(),
      covered: () => db.companyProperty.count({ where: { acquiredYear: { not: null } } }),
      consequence: 'Eiendommer uten år kan ikke brukes til tidslinje eller oppkjøpsrekkefølge.',
    }),
    safeFieldCoverageMetric({
      id: 'producers.total',
      surface: 'Produsenter',
      label: 'Produsent-totaler',
      denominatorLabel: 'Producer-rader',
      total: () => db.producer.count(),
      covered: () => db.producer.count(),
      consequence: 'Produsentregisteret er totalgrunnlaget for produsentflater; geografiske hull håndteres i senere liste- og dekningsgoals.',
    }),
  ])

  const operationalGaps = buildOperationalGaps(tables)
  const artifacts = await getArtifactStatuses(options.artifactRoot)

  const dbOk = Object.keys(tableErrors).length === 0
  const pageGatesOk = Object.values(pages).every(page => page.ok)

  return {
    ok: dbOk && pageGatesOk,
    dbOk,
    pageGatesOk,
    tables,
    tableErrors,
    pages,
    fieldCoverage,
    artifacts,
    operationalGaps,
    fallbackSurfaces,
    fallbackSensitiveTables,
  }
}
