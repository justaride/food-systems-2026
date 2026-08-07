import type { Metadata } from 'next'
import { InternalBanner } from '@/components/ui/InternalBanner'
import { PageFraming } from '@/components/ui/PageFraming'
import {
  getLibraryAnalysisRecords,
  getLibraryAnalysisStatus,
  type LibraryAnalysisRecordRow,
  type LibraryAnalysisStatusPayload,
} from '@/lib/queries/library-analysis'
import { isPrismaDataUnavailable } from '@/lib/queries/prisma-errors'
import { AiKunnskapContent } from './AiKunnskapContent'

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
  ok: false,
  total: 0,
  processed: 0,
  classificationPct: 0,
  finished: 0,
  readinessPct: 0,
  approvedForAi: 0,
  pendingReview: 0,
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
}

export default async function AiKunnskapPage() {
  const { status, records, unavailable } = await loadPageData()

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
          `${status.processed} av ${status.total} kilder har en avsluttet policyklassifisering.`,
          `${status.approvedForAi} kilder er godkjent for intern AI-kontekst; øvrige beholdes som intern bakgrunn eller er sperret.`,
          `${status.pendingReview} kilder venter på review; ${status.safelyBlocked} er eksplisitt og trygt blokkert.`,
          status.externalReady
            ? `${status.externalClaimEligible} kilder er eksplisitt klare for eksterne claims.`
            : `Ikke eksternt claim-klar: ${status.humanReviewed} navngitte/daterte reviews og ${status.externalClaimEligible} eksplisitt godkjente kilder.`,
          `${status.claimCandidates} claim-kandidater må via eksisterende claim/citation-gater.`,
        ]}
        caveat="V1 åpner ingen nye claims automatisk. Eksterne flater kan fortsatt bare bruke innhold etter eksisterende claim/citation-gater."
      />

      {unavailable && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          LibraryAnalysisRecord-tabellen er ikke tilgjengelig i denne kjøringen. Kjør migrasjon og research:library:process:apply for DB-backed cockpit.
        </div>
      )}

      <AiKunnskapContent status={status} records={records} />
    </div>
  )
}

async function loadPageData(): Promise<{
  status: LibraryAnalysisStatusPayload
  records: SerializableRecord[]
  unavailable: boolean
}> {
  try {
    const [status, records] = await Promise.all([
      getLibraryAnalysisStatus(),
      getLibraryAnalysisRecords({ limit: 500 }),
    ])

    return {
      status,
      records: records.map(record => ({
        ...record,
        updatedAt: record.updatedAt.toISOString(),
      })),
      unavailable: false,
    }
  } catch (error) {
    if (!isPrismaDataUnavailable(error)) throw error
    return {
      status: EMPTY_STATUS,
      records: [],
      unavailable: true,
    }
  }
}
