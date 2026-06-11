import Link from 'next/link'
import type { Metadata } from 'next'
import { Card } from '@/components/ui/Card'
import { InternalBanner } from '@/components/ui/InternalBanner'
import { prisma } from '@/lib/db'
import {
  getDataStatus,
  type ArtifactStatus,
  type CoverageTone,
  type DataStatusDb,
  type FieldCoverageMetric,
  type OperationalGap,
} from '@/lib/data-status'

export const metadata: Metadata = {
  title: 'Datastatus - Food Systems 2026',
  description: 'Intern oversikt over datadekning, fallbackflater og genererte artefakter.',
}

function formatNumber(value: number | null | undefined) {
  return value == null ? 'ikke lest' : value.toLocaleString('no')
}

function formatPercent(value: number | null) {
  return value == null ? 'ikke målt' : `${value.toLocaleString('no')} %`
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('no', { dateStyle: 'medium', timeStyle: 'short' })
}

function toneClasses(tone: CoverageTone | ArtifactStatus['status'] | OperationalGap['severity']) {
  if (tone === 'critical' || tone === 'missing') return 'border-rose-200 bg-rose-50 text-rose-700'
  if (tone === 'warn') return 'border-amber-200 bg-amber-50 text-amber-700'
  if (tone === 'unknown') return 'border-stone-200 bg-stone-100 text-stone-600'
  return 'border-emerald-200 bg-emerald-50 text-emerald-700'
}

function StatusPill({ tone, label }: { tone: CoverageTone | ArtifactStatus['status'] | OperationalGap['severity']; label: string }) {
  return (
    <span className={`inline-flex shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneClasses(tone)}`}>
      {label}
    </span>
  )
}

function formatOperationalGapDecision(decision: OperationalGap['decision']) {
  if (decision === 'ui_notice') return 'UI-merket'
  return decision
}

function StatTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-4 py-3 shadow-sm shadow-stone-900/[0.03]">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-stone-950">{value}</p>
      <p className="mt-1 text-xs leading-relaxed text-stone-500">{detail}</p>
    </div>
  )
}

function groupCoverageRows(fieldCoverage: FieldCoverageMetric[]) {
  const groups = new Map<string, FieldCoverageMetric[]>()
  for (const row of fieldCoverage) {
    const rows = groups.get(row.surface) ?? []
    rows.push(row)
    groups.set(row.surface, rows)
  }
  return [...groups.entries()]
}

function CoverageTable({ fieldCoverage }: { fieldCoverage: FieldCoverageMetric[] }) {
  return (
    <Card title="Feltdekning per flate">
      <div className="space-y-3 md:hidden">
        {fieldCoverage.map(row => (
          <div key={row.id} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">{row.surface}</p>
                <h3 className="mt-1 text-sm font-semibold leading-snug text-stone-900">{row.label}</h3>
                <p className="mt-0.5 text-xs text-stone-400">
                  {row.denominatorLabel}
                  {row.measuredYear ? ` · målt år ${row.measuredYear}` : ''}
                </p>
              </div>
              <StatusPill tone={row.status} label={formatPercent(row.percent)} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-stone-400">Dekket</dt>
                <dd className="mt-0.5 font-semibold tabular-nums text-stone-900">
                  {formatNumber(row.covered)} / {formatNumber(row.total)}
                </dd>
              </div>
              <div>
                <dt className="text-stone-400">Mangler</dt>
                <dd className="mt-0.5 font-semibold tabular-nums text-stone-900">{formatNumber(row.missing)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-stone-600">{row.consequence}</p>
            {row.error && <p className="mt-2 text-xs text-rose-600">{row.error}</p>}
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[840px] text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-[11px] uppercase tracking-wider text-stone-400">
              <th scope="col" className="pb-2 pr-4 font-medium">Flate</th>
              <th scope="col" className="pb-2 pr-4 font-medium">Nøkkelfelt</th>
              <th scope="col" className="pb-2 pr-4 font-medium text-right">Dekket</th>
              <th scope="col" className="pb-2 pr-4 font-medium text-right">Mangler</th>
              <th scope="col" className="pb-2 pr-4 font-medium text-right">Andel</th>
              <th scope="col" className="pb-2 font-medium">Konsekvens</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {groupCoverageRows(fieldCoverage).flatMap(([surface, rows]) =>
              rows.map((row, index) => (
                <tr key={row.id} className="align-top">
                  <td className="py-3 pr-4 text-stone-500">
                    {index === 0 ? surface : ''}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="font-medium text-stone-900">{row.label}</div>
                    <div className="mt-0.5 text-xs text-stone-400">
                      {row.denominatorLabel}
                      {row.measuredYear ? ` · målt år ${row.measuredYear}` : ''}
                    </div>
                    {row.error && <div className="mt-1 text-xs text-rose-600">{row.error}</div>}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums text-stone-700">
                    {formatNumber(row.covered)} / {formatNumber(row.total)}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums text-stone-500">{formatNumber(row.missing)}</td>
                  <td className="py-3 pr-4 text-right">
                    <div className="flex justify-end">
                      <StatusPill tone={row.status} label={formatPercent(row.percent)} />
                    </div>
                  </td>
                  <td className="py-3 text-xs leading-relaxed text-stone-600">{row.consequence}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function OperationalGaps({ operationalGaps }: { operationalGaps: OperationalGap[] }) {
  return (
    <Card title="Fallback og tomme tabeller">
      {operationalGaps.length === 0 ? (
        <p className="text-sm text-stone-500">Ingen kjente fallback-tabeller er under terskel.</p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-3">
          {operationalGaps.map(gap => (
            <div key={gap.id} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-stone-900">{gap.label}</h3>
                  <p className="mt-1 break-all font-mono text-[11px] text-stone-400">{gap.table}</p>
                </div>
                <StatusPill tone={gap.severity} label={gap.actual == null ? 'ukjent' : `${formatNumber(gap.actual)} rader`} />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-stone-600">{gap.consequence}</p>
              <div className="mt-3 rounded-md border border-amber-200 bg-white px-3 py-2 text-xs leading-relaxed text-stone-700">
                <p className="font-semibold text-amber-800">
                  Statusnotat (G-10): {formatOperationalGapDecision(gap.decision)}
                </p>
                <p className="mt-1">{gap.statusNote}</p>
                <p className="mt-1 text-stone-500">{gap.nextAction}</p>
              </div>
              <Link href={gap.route} className="mt-3 inline-block text-xs font-medium text-emerald-700 hover:underline">
                Åpne {gap.route}
              </Link>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function ArtifactPanel({ artifacts }: { artifacts: ArtifactStatus[] }) {
  return (
    <Card title="Artefakter og datering">
      <div className="grid gap-3 lg:grid-cols-3">
        {artifacts.map(artifact => (
          <div key={artifact.id} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-stone-900">{artifact.label}</h3>
                <p className="mt-1 text-xs text-stone-500">
                  {artifact.generatedAt ? formatDate(artifact.generatedAt) : artifact.displayDate}
                </p>
              </div>
              <StatusPill tone={artifact.status} label={artifact.dateSource} />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-stone-600">{artifact.note}</p>
            <ul className="mt-3 space-y-1 text-[11px] leading-relaxed text-stone-400">
              {artifact.paths.slice(0, 3).map(path => <li key={path}>{path}</li>)}
              {artifact.paths.length > 3 && <li>+ {artifact.paths.length - 3} filer</li>}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default async function DatastatusPage() {
  const status = await getDataStatus(prisma as unknown as DataStatusDb)
  const checkedAt = new Date().toISOString()
  const tables = status.tables

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Intern kontrollflate
          </p>
          <h1 className="mt-1 text-3xl font-bold text-stone-950">Datastatus</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-500">
            Dekningstallene under viser hvilke deler av plattformen som har nok radgrunnlag til å tolkes,
            og hvor UI-et fortsatt må lese data som hull, fallback eller udatert artefakt.
          </p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-xs text-stone-500 shadow-sm shadow-stone-900/[0.03]">
          <p className="font-semibold text-stone-900">Sist sjekket</p>
          <p className="mt-1">{formatDate(checkedAt)}</p>
        </div>
      </div>

      <InternalBanner note="Intern datakvalitetsflate: radtall, feltdekning og artefaktdatering brukes som arbeidsgrunnlag før tall løftes inn i offentlig språk." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile label="Selskaper" value={formatNumber(tables.companies)} detail={`${formatNumber(tables.companyFinancials)} finansrader`} />
        <StatTile label="Havbruk" value={formatNumber(tables.aquacultureSites)} detail={`${formatNumber(tables.fishHealthObservations)} fiskehelseobservasjoner`} />
        <StatTile label="Eiendommer" value={formatNumber(tables.companyProperties)} detail="CompanyProperty-rader" />
        <StatTile label="Produsenter" value={formatNumber(tables.producers)} detail={`${formatNumber(tables.landbruksregisterCompanies)} Company-rader merket Landbruksregisteret`} />
        <StatTile label="Artefakter" value={formatNumber(status.artifacts.length)} detail="Konsern, chart metrics og value-chain" />
      </div>

      {Object.keys(status.tableErrors).length > 0 && (
        <Card title="Tabellfeil">
          <div className="space-y-2">
            {Object.entries(status.tableErrors).map(([label, error]) => (
              <div key={label} className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                <span className="font-mono text-xs">{label}</span>: {error}
              </div>
            ))}
          </div>
        </Card>
      )}

      <CoverageTable fieldCoverage={status.fieldCoverage} />
      <OperationalGaps operationalGaps={status.operationalGaps} />
      <ArtifactPanel artifacts={status.artifacts} />
    </div>
  )
}
