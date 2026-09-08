import { parsePage } from '@/lib/pagination'
import type { Metadata } from 'next'
import { InternalBanner } from '@/components/ui/InternalBanner'
import { PageFraming } from '@/components/ui/PageFraming'
import {
  getLibraryAnalysisRecords,
  getLibraryAnalysisRecordCount,
  type LibraryAnalysisFilters,
  getLibraryAnalysisStatus,
  LIBRARY_ANALYSIS_CALIBRATION,
  type LibraryAnalysisRecordRow,
  type LibraryAnalysisStatusPayload,
} from '@/lib/queries/library-analysis'
import { buildAutomatedLibraryAnalysisStatus } from '@/lib/knowledge/library-analysis-automated-status'
import {
  getLibraryAnalysisRunGroups,
  type LibraryAnalysisRunGroup,
} from '@/lib/queries/library-analysis-runs'
import { isPrismaDataUnavailable } from '@/lib/queries/prisma-errors'
import { AiKunnskapContent } from './AiKunnskapContent'
import { LibraryAnalysisRuns } from './LibraryAnalysisRuns'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'AI-kunnskap - Food Systems 2026',
  description: 'Intern cockpit for AI-klart research-bibliotek, review queue og bruksregler.',
}

type SerializableRecord = Omit<LibraryAnalysisRecordRow, 'updatedAt'> & {
  updatedAt: string
}

const EMPTY_STATUS: LibraryAnalysisStatusPayload = {
  operational: false,
  reviewComplete: false,
  ok: false,
  total: 0,
  processed: 0,
  classificationPct: 0,
  finished: 0,
  readinessPct: 0,
  approvedForAi: 0,
  pendingReview: 0,
  pendingReviewHighRisk: 0,
  pendingReviewStandard: 0,
  safelyBlocked: 0,
  classificationConflicts: 0,
  humanReviewed: 0,
  aiDraft: 0,
  externalUsageContractAvailable: false,
  externalClaimEligible: 0,
  invalidExternalApprovals: 0,
  externalCitationBlocked: 0,
  externalReady: false,
  externalBlockers: ['status_unavailable'],
  reviewRequired: 0,
  blocked: 0,
  typeB: 0,
  typeC: 0,
  claimCandidates: 0,
  missingText: 0,
  byStatus: {},
  byUsageRule: {},
  automated: buildAutomatedLibraryAnalysisStatus({
    populationSnapshotId: null,
    populationHash: null,
    populationTotal: 0,
    queryErrors: ['status_unavailable'],
    records: [],
  }),
  calibration: LIBRARY_ANALYSIS_CALIBRATION,
}

export default async function AiKunnskapPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const value = (key: string) => typeof params[key] === 'string' ? (params[key] as string).trim().slice(0, 200) : ''
  const filters = { query: value('q'), status: value('status'), usage: value('usage') }
  const { status, records, runGroups, unavailable, total, page } = await loadPageData(filters, parsePage(params.page))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">AI-kunnskap</h1>
        <p className="text-sm text-stone-400 mt-1">
          Intern readiness for research-biblioteket, AI-kort, review queue og claim-sperrer.
        </p>
      </div>

      <InternalBanner note="AI-kunnskap er intern triage. AI-kort er draft-only og kan ikke åpne claims uten PCQ/claim-lock, gate:overclaim og audit:citable." />

      <PageFraming
        title="Hva svarer denne siden på?"
        description={[
          'Hvor langt er biblioteket bearbeidet til AI-kontekst, og hvilke kilder krever review før videre bruk?',
          'Siden viser bruksregel per kilde slik at teamet kan skille intern bakgrunn fra claim-kandidater, aktørgate og type-C gap.',
        ]}
        takeaways={[
          `${status.processed} av ${status.total} kilder har en avsluttet policyklassifisering; ${status.pendingReview} venter på review.`,
          `Automatisk kandidatvalidering er ${automatedStateLabel(status.automated.automatedValidationState)}. ${status.automated.reusableForAiContext} kilder kan gjenbrukes som KI-kontekst etter disse kontrollene.`,
          `${status.externalClaimEligible} kilder er eksplisitt godkjent for eksterne claims. Kildekontroll og bruksregler følger hver oppføring.`,
        ]}
        caveat="V1 åpner ingen nye claims automatisk. Eksterne flater kan fortsatt bare bruke innhold etter eksisterende claim/citation-gater."
      />

      {unavailable && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          LibraryAnalysisRecord-tabellen er ikke tilgjengelig i denne kjøringen. Kjør migrasjon og research:library:process:apply for DB-backed cockpit.
        </div>
      )}

      <AiKunnskapContent status={status} records={records} filters={filters} total={total} page={page} pageSize={100} />

      <LibraryAnalysisRuns groups={runGroups} />
    </div>
  )
}

function automatedStateLabel(state: LibraryAnalysisStatusPayload['automated']['automatedValidationState']) {
  switch (state) {
    case 'not_started': return 'ikke startet'
    case 'running': return 'pågående'
    case 'complete': return 'fullført'
    case 'degraded': return 'degradert'
  }
}

async function loadPageData(filters: LibraryAnalysisFilters, requestedPage: number): Promise<{
  total: number
  page: number
  status: LibraryAnalysisStatusPayload
  records: SerializableRecord[]
  runGroups: LibraryAnalysisRunGroup[]
  unavailable: boolean
}> {
  try {
    const total = await getLibraryAnalysisRecordCount(filters)
    const page = Math.min(requestedPage, Math.max(1, Math.ceil(total / 100)))
    const [status, records, runGroups] = await Promise.all([
      getLibraryAnalysisStatus(),
      getLibraryAnalysisRecords({ ...filters, limit: 100, offset: (page - 1) * 100 }),
      getLibraryAnalysisRunGroups({ limit: 500 }),
    ])

    return {
      total, page,
      status,
      records: records.map(record => ({
        ...record,
        updatedAt: record.updatedAt.toISOString(),
      })),
      runGroups,
      unavailable: false,
    }
  } catch (error) {
    if (!isPrismaDataUnavailable(error)) throw error
    return {
      total: 0, page: 1,
      status: EMPTY_STATUS,
      records: [],
      runGroups: [],
      unavailable: true,
    }
  }
}
