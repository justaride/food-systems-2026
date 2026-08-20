'use client'

import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import type { LibraryAnalysisStatusPayload } from '@/lib/queries/library-analysis'

type AiKunnskapRecord = {
  id: string
  sourceKind: string
  sourceKey: string
  title: string
  canonicalPath: string | null
  status: string
  usageRule: string
  reviewStatus: string
  citationReadiness: string | null
  aiSummary: string | null
  keyFindings: string[]
  projectImplications: string[]
  riskFlags: string[]
  claimCandidateCount: number
  externalClaimEligible: boolean
  wordCount: number
  updatedAt: string
}

type Props = {
  status: LibraryAnalysisStatusPayload
  records: AiKunnskapRecord[]
}

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Ikke startet',
  inventory_only: 'Kun inventory',
  ai_draft: 'AI utkast',
  validated: 'Validert',
  review_required: 'Review',
  approved_internal: 'Godkjent internt',
  blocked: 'Blokkert',
  superseded: 'Erstattet',
}

const USAGE_LABELS: Record<string, string> = {
  internal_background: 'Intern bakgrunn',
  safe_for_ai_context: 'Trygg AI-kontekst',
  safe_for_external_claims: 'Ekstern godkjenning markert',
  claim_candidate_review: 'Claim-review',
  do_not_use_for_claims: 'Ikke claim',
  requires_actor_gate: 'Aktørgate',
  type_c_gap: 'Type-C gap',
}

export function AiKunnskapContent({ status, records }: Props) {
  const [statusFilter, setStatusFilter] = useState('alle')
  const [usageFilter, setUsageFilter] = useState('alle')

  const statuses = useMemo(() => unique(records.map(record => record.status)), [records])
  const usageRules = useMemo(() => unique(records.map(record => record.usageRule)), [records])
  const filtered = useMemo(() => records.filter(record => {
    if (statusFilter !== 'alle' && record.status !== statusFilter) return false
    if (usageFilter !== 'alle' && record.usageRule !== usageFilter) return false
    return true
  }), [records, statusFilter, usageFilter])

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-sky-200 bg-sky-50/60 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-stone-900">Automatisk kandidatvalidering</h2>
            <p className="mt-1 text-xs text-stone-600">
              Kun intern KI-validering. Ingen menneskelig gjennomgang eller ekstern claim-godkjenning.
            </p>
          </div>
          <span className="rounded border border-sky-200 bg-white px-2 py-1 text-[10px] uppercase tracking-wider text-sky-800">
            {automatedStateLabel(status.automated.automatedValidationState)}
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <Metric label="Automatisk disponert" value={`${status.automated.disposedTotal}/${status.automated.populationTotal}`} detail="Forseglet populasjon" />
          <Metric label="Automatisk validert kandidat" value={status.automated.candidateComplete.toString()} detail="Kandidatstatus, ikke autoritet" />
          <Metric label="Gjenbrukbar intern KI-kontekst" value={status.automated.reusableForAiContext.toString()} detail="automatedOnly" />
          <Metric label="Karantenesatt" value={status.automated.quarantined.toString()} detail="Kan ikke gjenbrukes" />
          <Metric label="Mangler lesbart input" value={status.automated.blockedInput.toString()} detail="Kildegrunnlag blokkert" />
          <Metric label="Delvis / feilet" value={`${status.automated.partial}/${status.automated.failed}`} detail="Må rettes eller kjøres på nytt" />
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <Metric label="Klassifisert" value={`${status.classificationPct}%`} detail={`${status.processed}/${status.total} kilder`} />
        <Metric label="Eksisterende policy-kontekst" value={status.approvedForAi.toString()} detail="Legacy safe_for_ai_context" />
        <Metric label="Review queue" value={status.pendingReview.toString()} detail="Uklare, claim eller lavtekst" />
        <Metric label="Ekstern claim-klar" value={status.externalClaimEligible.toString()} detail={status.externalReady ? 'Ekstern port grønn' : 'Ekstern port stengt'} />
        <Metric label="Claim-kandidater" value={status.claimCandidates.toString()} detail="Må via PCQ/claim-lock" />
        <Metric label="Gap" value={`${status.typeB}/${status.typeC}`} detail="Type-B aktørgate / type-C" />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={statusFilter}
          onChange={event => setStatusFilter(event.target.value)}
          className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="alle">Status: Alle</option>
          {statuses.map(statusValue => (
            <option key={statusValue} value={statusValue}>{STATUS_LABELS[statusValue] ?? statusValue}</option>
          ))}
        </select>

        <select
          value={usageFilter}
          onChange={event => setUsageFilter(event.target.value)}
          className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="alle">Bruksregel: Alle</option>
          {usageRules.map(rule => (
            <option key={rule} value={rule}>{USAGE_LABELS[rule] ?? rule}</option>
          ))}
        </select>

        <span className="text-xs text-stone-400">{filtered.length} kilder</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Ingen library analysis-rader funnet" />
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-3 py-2 font-medium">Kilde</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Bruksregel</th>
                <th className="px-3 py-2 font-medium">Risiko</th>
                <th className="px-3 py-2 font-medium">Kort</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map(record => (
                <tr key={record.id} className="align-top">
                  <td className="px-3 py-3">
                    <p className="font-medium text-stone-800">{record.title}</p>
                    <p className="mt-1 font-mono text-[10px] text-stone-400 break-all">{record.canonicalPath ?? record.sourceKey}</p>
                    <p className="mt-1 text-[10px] text-stone-400">
                      {record.sourceKind} · {record.wordCount} ord · {record.citationReadiness ?? 'ikke citation-check'}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <StatusPill status={record.status} review={record.reviewStatus === 'queued'} />
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded border border-stone-200 bg-stone-50 px-2 py-1 text-[10px] text-stone-600">
                      {record.usageRule === 'safe_for_external_claims' && record.externalClaimEligible
                        ? 'Godkjent eksternt'
                        : (USAGE_LABELS[record.usageRule] ?? record.usageRule)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {record.claimCandidateCount > 0 && (
                        <span className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] text-rose-700">
                          {record.claimCandidateCount} claim
                        </span>
                      )}
                      {record.riskFlags.length === 0 && (
                        <span className="text-[10px] text-stone-400">Ingen flags</span>
                      )}
                      {record.riskFlags.slice(0, 4).map(flag => (
                        <span key={flag} className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] text-amber-800">
                          {flag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <p className="max-w-md text-xs leading-relaxed text-stone-600 line-clamp-3">
                      {record.aiSummary ?? record.projectImplications[0] ?? record.keyFindings[0] ?? 'Mangler AI-kort'}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card className="!p-4">
      <p className="text-[10px] font-medium uppercase tracking-wider text-stone-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-stone-900">{value}</p>
      <p className="mt-1 text-xs text-stone-500">{detail}</p>
    </Card>
  )
}

function StatusPill({ status, review }: { status: string; review: boolean }) {
  const tone = status === 'approved_internal' || status === 'validated'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : status === 'blocked'
      ? 'border-rose-200 bg-rose-50 text-rose-800'
      : review || status === 'review_required'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-stone-200 bg-stone-50 text-stone-600'

  return (
    <span className={`rounded border px-2 py-1 text-[10px] ${tone}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

function unique(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

function automatedStateLabel(
  state: LibraryAnalysisStatusPayload['automated']['automatedValidationState'],
) {
  switch (state) {
    case 'not_started': return 'Ikke startet'
    case 'running': return 'Pågår'
    case 'complete': return 'Fullført'
    case 'degraded': return 'Degradert'
  }
}
