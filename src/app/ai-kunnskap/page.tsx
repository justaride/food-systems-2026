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
  finished: 0,
  readinessPct: 0,
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
          `${status.finished} av ${status.total} kilder er ferdige for intern bruk.`,
          `${status.reviewRequired} kilder ligger i review queue; ${status.blocked} er blokkert.`,
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
