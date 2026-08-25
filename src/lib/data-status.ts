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
  companyFinancial: CountDelegate
  boardMember: CountDelegate
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
  sourceCitation: CountDelegate
  fieldCitation: CountDelegate
  libraryAnalysisRecord: CountDelegate
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

export const knowledgeBaseMinimums = {
  documents: 1539,
  sourceCitations: 2699,
  fieldCitations: 244516,
  libraryAnalysisRecords: 1295,
  actors: 1636,
  companies: 351,
  personProfiles: 1594,
} as const

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

/**
 * Andel som desimaltall med tre siffer, eller `null` når et av tallene ikke
 * kunne leses. Null her betyr «vet ikke», ikke «null dekning» — derfor ingen
 * fallback til 0.
 */
export function coverageShare(part: number | null, whole: number | null): number | null {
  if (part === null || whole === null || whole === 0) return null
  return Math.round((part / whole) * 1000) / 1000
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
    safeCount('sourceCitations', () => db.sourceCitation.count()),
    safeCount('fieldCitations', () => db.fieldCitation.count()),
    safeCount('libraryAnalysisRecords', () => db.libraryAnalysisRecord.count()),
    safeCount('actors', () => db.actor.count()),
    safeCount('companies', () => db.company.count()),
    safeCount('personProfiles', () => db.personProfile.count()),
    // AP-4 (verdifangst) kobler DeliveryVolume × CompanyFinancial. Om pakken er
    // verdt å bygge avhenger ikke av radtallet, men av hvor mange selskaper som
    // faktisk har BEGGE deler — se `financialCoverage` under.
    //
    // DeliveryVolume har TO selskapssider, og de er ikke likeverdige for AP-4:
    // leverandørsiden (`deliveriesFrom`) er bønder, som ligger i `Producer` og
    // ikke i `Company` etter produsentseparasjonen — den er tom ved
    // konstruksjon, ikke av datamangel. Kjøpersiden (`deliveriesTo`) er
    // foredlingsleddet, og det er der verdifangst faktisk kan måles. Begge
    // telles, slik at tallet ikke kan leses som en datamangel når det er en
    // modellgrense.
    safeCount('companyFinancials', () => db.companyFinancial.count()),
    safeCount('companiesWithFinancials', () =>
      db.company.count({ where: { financials: { some: {} } } }),
    ),
    safeCount('companiesWithFinancialsAndDeliveries', () =>
      db.company.count({
        where: { AND: [{ financials: { some: {} } }, { deliveriesFrom: { some: {} } }] },
      }),
    ),
    safeCount('companiesWithDeliveriesTo', () =>
      db.company.count({ where: { deliveriesTo: { some: {} } } }),
    ),
    safeCount('companiesWithFinancialsAndDeliveriesTo', () =>
      db.company.count({
        where: { AND: [{ financials: { some: {} } }, { deliveriesTo: { some: {} } }] },
      }),
    ),
    // AP-1 (styreoverlapp) måles som andel selskaper med styredata. To nivåer,
    // og de svarer på ulike spørsmål: `boardMembers` teller alle rader, mens
    // AP-1s `--active-only`-kjøring filtrerer på `effectiveTo: null` (sittende
    // styre). Dekningstallene i planen er active-only, så begge rapporteres —
    // ellers leses 72 % og 36 % som om de var samme størrelse.
    safeCount('boardMembers', () => db.boardMember.count()),
    safeCount('boardMembersActive', () => db.boardMember.count({ where: { effectiveTo: null } })),
    safeCount('companiesWithBoard', () =>
      db.company.count({ where: { boardMembers: { some: {} } } }),
    ),
    safeCount('companiesWithActiveBoard', () =>
      db.company.count({ where: { boardMembers: { some: { effectiveTo: null } } } }),
    ),
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

  const knowledgeBase: Record<string, CountStatus> = {
    documents: buildCountStatus(actual('documents'), knowledgeBaseMinimums.documents, error('documents')),
    sourceCitations: buildCountStatus(
      actual('sourceCitations'),
      knowledgeBaseMinimums.sourceCitations,
      error('sourceCitations'),
    ),
    fieldCitations: buildCountStatus(
      actual('fieldCitations'),
      knowledgeBaseMinimums.fieldCitations,
      error('fieldCitations'),
    ),
    libraryAnalysisRecords: buildCountStatus(
      actual('libraryAnalysisRecords'),
      knowledgeBaseMinimums.libraryAnalysisRecords,
      error('libraryAnalysisRecords'),
    ),
    actors: buildCountStatus(actual('actors'), knowledgeBaseMinimums.actors, error('actors')),
    companies: buildCountStatus(actual('companies'), knowledgeBaseMinimums.companies, error('companies')),
    personProfiles: buildCountStatus(
      actual('personProfiles'),
      knowledgeBaseMinimums.personProfiles,
      error('personProfiles'),
    ),
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

  // Finansdekning — grunnlaget for å avgjøre om AP-4 er verdt å bygge.
  // `share` svarer på det juni-anslaget sa (~50 %); join-tallene svarer på det
  // AP-4 faktisk trenger, siden hypotesetesten krever både leveransevolum og
  // regnskap for samme selskap. Dekning på én av delene alene kan være høy mens
  // snittet er lite.
  //
  // `buyerSide` er det tallet AP-4 skal leses mot. `supplierSide` beholdes fordi
  // det var det første målet, og fordi det er lærerikt: det er lavt av
  // strukturelle grunner (bønder er `Producer`, ikke `Company`), ikke fordi
  // regnskap mangler. Å rapportere bare det ene ville invitert til å lese en
  // modellgrense som et datahull.
  const financialCoverage = {
    companies: actual('companies'),
    withFinancials: actual('companiesWithFinancials'),
    financialRows: actual('companyFinancials'),
    share: coverageShare(actual('companiesWithFinancials'), actual('companies')),
    supplierSide: {
      withDeliveries: actual('companiesWithFinancialsAndDeliveries'),
      note: 'Leverandørsiden er bønder i Producer-tabellen; lav verdi er en modellgrense, ikke datamangel.',
    },
    buyerSide: {
      withDeliveries: actual('companiesWithDeliveriesTo'),
      withFinancialsAndDeliveries: actual('companiesWithFinancialsAndDeliveriesTo'),
      note: 'Foredlingsleddet — AP-4s faktiske univers for volum↔margin.',
    },
    // Bakoverkompatible felt: samme leverandørside-tall som før, uendret form.
    withFinancialsAndDeliveries: actual('companiesWithFinancialsAndDeliveries'),
    joinShare: coverageShare(actual('companiesWithFinancialsAndDeliveries'), actual('companies')),
  }

  // Styredekning — grunnlaget for å vurdere AP-1 dekningsutvidelse (O5).
  // `activeShare` er tallet planen omtaler («36 %»); `allShare` er det høyere
  // tallet som inkluderer historiske verv. Begge måles mot dagens
  // selskapsunivers, som er poenget: AP-1-baselinene ble regnet mot 275 og 351
  // selskaper, og de universene finnes ikke lenger.
  const boardCoverage = {
    companies: actual('companies'),
    boardRows: actual('boardMembers'),
    boardRowsActive: actual('boardMembersActive'),
    withBoard: actual('companiesWithBoard'),
    withActiveBoard: actual('companiesWithActiveBoard'),
    allShare: coverageShare(actual('companiesWithBoard'), actual('companies')),
    activeShare: coverageShare(actual('companiesWithActiveBoard'), actual('companies')),
  }

  const dbOk = Object.keys(tableErrors).length === 0
  const pageGatesOk = Object.values(pages).every(page => page.ok)
  const knowledgeBaseGatesOk = Object.values(knowledgeBase).every(gate => gate.ok)

  return {
    ok: dbOk && pageGatesOk && knowledgeBaseGatesOk,
    dbOk,
    pageGatesOk,
    knowledgeBaseGatesOk,
    tables,
    tableErrors,
    pages,
    knowledgeBase,
    financialCoverage,
    boardCoverage,
    fallbackSurfaces,
    fallbackSensitiveTables,
  }
}
