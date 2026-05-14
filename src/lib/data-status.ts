type CountStatus = {
  ok: boolean
  minRequired: number
  actual: number | null
  error?: string
}

type CountDelegate = {
  count: (args?: unknown) => Promise<number>
}

export type DataStatusDb = {
  subsidy: CountDelegate
  aquacultureSite: CountDelegate
  aquacultureApplication: CountDelegate
  fishHealthObservation: CountDelegate
  deliveryVolume: CountDelegate
  businessRelationship: CountDelegate
  company: CountDelegate
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

export function buildCountStatus(actual: number | null, minRequired: number, error?: string): CountStatus {
  return {
    ok: actual !== null && actual >= minRequired,
    minRequired,
    actual,
    ...(error ? { error } : {}),
  }
}

export async function getDataStatus(db: DataStatusDb) {
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
    havbruk: buildCountStatus(actual('aquacultureSites'), 100, error('aquacultureSites')),
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

  const dbOk = Object.keys(tableErrors).length === 0
  const pageGatesOk = Object.values(pages).every(page => page.ok)

  return {
    ok: dbOk && pageGatesOk,
    dbOk,
    pageGatesOk,
    tables,
    tableErrors,
    pages,
    fallbackSurfaces,
    fallbackSensitiveTables,
  }
}
