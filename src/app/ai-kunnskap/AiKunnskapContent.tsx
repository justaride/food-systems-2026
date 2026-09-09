import Link from 'next/link'
import { Pagination } from '@/components/ui/Pagination'
import type { LibraryAnalysisFilters } from '@/lib/queries/library-analysis'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import type { LibraryAnalysisStatusPayload } from '@/lib/queries/library-analysis'

type AiKunnskapRecord = {
  id: string
  sourceKind: string
  sourceKey: string
  title: string
  documentSlug: string | null
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
  filters: LibraryAnalysisFilters
  total: number
  page: number
  pageSize: number
}

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Ikke startet',
  inventory_only: 'Kun inventory',
  ai_draft: 'AI utkast',
  validated: 'Validert',
  review_required: 'Kildekontroll gjenstår',
  approved_internal: 'Historisk intern policy',
  blocked: 'Blokkert',
  superseded: 'Erstattet',
}

const USAGE_LABELS: Record<string, string> = {
  internal_background: 'Intern bakgrunn',
  safe_for_ai_context: 'Historisk KI-kontekstregel',
  safe_for_external_claims: 'Ekstern godkjenning markert',
  claim_candidate_review: 'Claim-review',
  do_not_use_for_claims: 'Ikke claim',
  requires_actor_gate: 'Aktørgate',
  type_c_gap: 'Type-C gap',
}

export function AiKunnskapContent({ status, records, filters, total, page, pageSize }: Props) {
  const statuses = Object.keys(status.byStatus).sort()
  const usageRules = Object.keys(status.byUsageRule).sort()
  return (
    <div className="space-y-5">
      <details className="rounded-lg border border-sky-200 bg-sky-50/60 p-4"><summary className="cursor-pointer text-sm font-medium">Detaljer om automatisk kandidatvalidering · {automatedStateLabel(status.automated.automatedValidationState)}</summary>
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
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-6">
          <Metric label="Automatisk disponert" value={`${status.automated.disposedTotal}/${status.automated.populationTotal}`} detail="Forseglet populasjon" />
          <Metric label="Automatisk validert kandidat" value={status.automated.candidateComplete.toString()} detail="Kandidatstatus, ikke autoritet" />
          <Metric label="Gjenbrukbar intern KI-kontekst" value={status.automated.reusableForAiContext.toString()} detail="automatedOnly" />
          <Metric label="Karantenesatt" value={status.automated.quarantined.toString()} detail="Kan ikke gjenbrukes" />
          <Metric label="Mangler lesbart input" value={status.automated.blockedInput.toString()} detail="Kildegrunnlag blokkert" />
          <Metric label="Delvis / feilet" value={`${status.automated.partial}/${status.automated.failed}`} detail="Må rettes eller kjøres på nytt" />
        </div>
      </details>

      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        Status- og bruksmerkene er historiske policyklassifiseringer. De dokumenterer ikke at originalkilden er kontrollert,
        at teksten er komplett eller at innholdet er godkjent av et menneske. Tallene overlapper: en rad med lavt eller
        manglende tekstgrunnlag kan også ligge i review-køen.
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-7">
        <Metric label="Klassifisert" value={`${status.classificationPct}%`} detail={`${status.processed}/${status.total} kilder`} />
        <Metric label="Historisk KI-kontekstregel" value={status.approvedForAi.toString()} detail="Policymerke; ikke kildegodkjenning" />
        <Metric label="Kildekontroll gjenstår" value={status.pendingReview.toString()} detail="Uklare, claim eller lavtekst" />
        <Metric label="Lavt/manglende tekstgrunnlag" value={status.missingText.toString()} detail="Risikoflagg; kan overlappe køen" />
        <Metric label="Ekstern claim-markering" value={status.externalClaimEligible.toString()} detail={status.externalReady ? 'Ekstern port grønn' : 'Ekstern port stengt'} />
        <Metric label="Claim-kandidater" value={status.claimCandidates.toString()} detail="Må via PCQ/claim-lock" />
        <Metric label="Gap" value={`${status.typeB}/${status.typeC}`} detail="Type-B aktørgate / type-C" />
      </div>

      <form action="/ai-kunnskap" method="get" className="flex flex-wrap gap-2 items-center">
        <label className="sr-only" htmlFor="source-query">Søk i alle kilder</label>
        <input id="source-query" name="q" defaultValue={filters.query} placeholder="Søk i alle kilder" className="rounded-lg border border-stone-200 px-3 py-2 text-sm" />
        <select
          name="status" aria-label="Status" defaultValue={filters.status || 'alle'}
          className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="alle">Status: Alle</option>
          {statuses.map(statusValue => (
            <option key={statusValue} value={statusValue}>{STATUS_LABELS[statusValue] ?? statusValue}</option>
          ))}
        </select>

        <select
          name="usage" aria-label="Bruksregel" defaultValue={filters.usage || 'alle'}
          className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="alle">Bruksregel: Alle</option>
          {usageRules.map(rule => (
            <option key={rule} value={rule}>{USAGE_LABELS[rule] ?? rule}</option>
          ))}
        </select>

        <button className="rounded-lg bg-emerald-700 px-3 py-2 text-sm text-white" type="submit">Søk og filtrer</button>
        <Link href="/ai-kunnskap" className="text-sm underline">Nullstill</Link>
        <span className="text-xs text-stone-500">{total} kilder i utvalget</span>
      </form>

      {records.length === 0 ? (
        <EmptyState message="Ingen library analysis-rader funnet" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
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
              {records.map(record => (
                <tr key={record.id} className="align-top">
                  <td className="px-3 py-3">
                    <p className="font-medium text-stone-800">{record.documentSlug
                      ? <Link href={`/bibliotek/${record.documentSlug}`} className="underline">{record.title}</Link>
                      : record.title}</p>
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
                      {record.riskFlags.includes('synthetic_identity') ? 'Karantenesatt syntetisk kilde. Skal ikke brukes.' : record.aiSummary ?? record.projectImplications[0] ?? record.keyFindings[0] ?? 'Mangler AI-kort'}
                    </p>
                    <details className="mt-2 max-w-md">
                      <summary className="cursor-pointer font-medium text-emerald-800">Underlag og neste handling</summary>
                      <p className="mt-2">{nextAction(record)}</p>
                      <p className="mt-2 text-stone-500">Kildeoppføringen ble oppdatert {record.updatedAt.slice(0, 10)}. Dette er ikke en dato for menneskelig godkjenning.</p>
                      <ul className="mt-2 list-disc pl-4">{record.riskFlags.map(flag => <li key={flag}>{flag}</li>)}</ul>
                      {!record.riskFlags.includes('synthetic_identity') && <p className="mt-2 whitespace-pre-line">{record.aiSummary ?? 'Ingen analyse tilgjengelig.'}</p>}
                      {!record.documentSlug && <p className="mt-2 text-amber-800">Mangler koblet dokument. Avstem kilden via referansen i første kolonne før gjennomgang.</p>}
                      <p className="mt-2 text-stone-500">En kildekontroll her endrer ingen godkjenning. Navngitt vurdering må registreres i prosjektets kilde- og claimprosess.</p>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination path="/ai-kunnskap" page={page} pageSize={pageSize} total={total} filters={{ q: filters.query, status: filters.status, usage: filters.usage }} />
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

function nextAction(record: AiKunnskapRecord): string {
  if (record.riskFlags.includes('synthetic_identity')) return 'Behold i karantene. Erstatt med en identifisert primærkilde før videre analyse.'
  if (record.status === 'blocked') return 'Avklar blokkeringen og dokumenter nytt kildegrunnlag før bruk.'
  if (record.wordCount === 0) return 'Hent lesbart originalmateriale og kontroller identitet og proveniens.'
  if (record.usageRule === 'requires_actor_gate') return 'Kildeansvarlig må avklare spørsmålet med relevant aktør og dokumentere svaret.'
  if (record.reviewStatus === 'queued' || record.status === 'review_required') return 'Kildeansvarlig må kontrollere original, datagrunnlag og konkrete påstander. Navngitt review gjenstår.'
  return 'Åpne originalunderlaget og kontroller relevans og kildehenvisning for den konkrete bruken.'
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
