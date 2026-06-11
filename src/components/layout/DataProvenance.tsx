'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  findRouteProvenance,
  type FallbackCondition,
  type ProvenanceSource,
  type RouteFallback,
} from '@/lib/data/provenance'

type ArtifactStatus = {
  id: string
  label: string
  displayDate: string
  generatedAt?: string | null
  dateSource?: string
  status?: string
}

type OperationalGap = {
  id: string
  route: string
  actual: number | null
  minExpected: number
  severity: 'warn' | 'critical'
  consequence: string
}

type DataStatusPayload = {
  checkedAt?: string
  tables?: Record<string, number | null>
  tableErrors?: Record<string, string>
  artifacts?: ArtifactStatus[]
  operationalGaps?: OperationalGap[]
}

const kindLabels: Record<ProvenanceSource['kind'], string> = {
  db: 'Tabell',
  artifact: 'Artefakt',
  manual: 'Manuell',
  api: 'API',
}

function formatDateTime(value: string | undefined): string | null {
  if (!value) return null

  try {
    return new Intl.DateTimeFormat('nb-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return value
  }
}

function isFallbackActive(condition: FallbackCondition | undefined, status: DataStatusPayload | null): boolean {
  if (!condition || condition === 'always') return true
  if (!status) return false

  switch (condition) {
    case 'communications-empty':
      return status.tables?.communications === 0
        || status.operationalGaps?.some(gap => gap.id === 'communications-empty') === true
    case 'meetings-error':
      return Boolean(status.tableErrors?.meetings)
    case 'project-core-error':
      return ['phases', 'teamMembers', 'kpis', 'tenSteps', 'evidenceDocs', 'applications', 'insights']
        .some(table => Boolean(status.tableErrors?.[table]) || status.tables?.[table] == null)
    default:
      return false
  }
}

function fallbackClasses(fallback: RouteFallback): string {
  if (fallback.tone === 'danger') {
    return 'border-red-300 bg-red-50 text-red-950'
  }

  return 'border-orange-300 bg-orange-50 text-orange-950'
}

function buildArtifactLine(sources: ProvenanceSource[], status: DataStatusPayload | null): string | null {
  const artifacts = sources
    .map(source => source.artifactId
      ? status?.artifacts?.find(artifact => artifact.id === source.artifactId)
      : null)
    .filter((artifact): artifact is ArtifactStatus => Boolean(artifact))

  if (artifacts.length === 0) return null

  return artifacts
    .map(artifact => `${artifact.label}: ${artifact.displayDate}`)
    .join(' · ')
}

function DataProvenanceSources({ sources }: { sources: ProvenanceSource[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {sources.map(source => (
        <li
          key={`${source.kind}-${source.label}-${source.detail ?? ''}`}
          className="inline-flex max-w-full items-center gap-1.5 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
        >
          <span className="font-semibold text-slate-950">{kindLabels[source.kind]}</span>
          <span className="truncate">{source.label}</span>
          {source.detail ? (
            <span className="hidden text-slate-500 sm:inline">({source.detail})</span>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export function RouteDataProvenance() {
  const pathname = usePathname()
  const provenance = useMemo(() => findRouteProvenance(pathname), [pathname])
  const [status, setStatus] = useState<DataStatusPayload | null>(null)
  const [statusError, setStatusError] = useState(false)

  useEffect(() => {
    let active = true

    async function loadStatus() {
      try {
        const response = await fetch('/api/data-status', { cache: 'no-store' })
        const payload = await response.json() as DataStatusPayload
        if (active) {
          setStatus(payload)
          setStatusError(false)
        }
      } catch {
        if (active) {
          setStatusError(true)
        }
      }
    }

    loadStatus()

    return () => {
      active = false
    }
  }, [pathname])

  if (!provenance) return null

  const checkedAt = formatDateTime(status?.checkedAt)
  const artifactLine = buildArtifactLine(provenance.sources, status)
  const fallback = provenance.fallback
  const showFallback = fallback ? isFallbackActive(fallback.condition, status) : false

  return (
    <section className="mt-12 border-t border-slate-200 pt-5 text-sm text-slate-700" aria-label="Datagrunnlag">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-3">
          <div>
            <h2 className="text-sm font-semibold uppercase text-slate-950">Datagrunnlag</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              {provenance.title} bygger på kildene under. Datering og hull hentes fra datastatus.
            </p>
          </div>
          <DataProvenanceSources sources={provenance.sources} />
        </div>
        <Link
          href="/datastatus"
          className="inline-flex w-fit items-center rounded border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 hover:border-slate-500 hover:text-slate-950"
        >
          Åpne datastatus
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-2 text-xs leading-5 text-slate-600">
        {checkedAt ? (
          <p>DB- og artefaktstatus sjekket {checkedAt}.</p>
        ) : statusError ? (
          <p>Datastatus kunne ikke hentes akkurat nå. Kildelisten over er fortsatt route-konfigurasjonen.</p>
        ) : (
          <p>Henter datostempel fra /datastatus.</p>
        )}
        {artifactLine ? <p>Artefaktdatoer: {artifactLine}.</p> : null}
      </div>

      {fallback && showFallback ? (
        <div className={`mt-4 rounded border px-3 py-2 text-sm leading-6 ${fallbackClasses(fallback)}`} role="status" aria-live="polite">
          <p className="font-semibold">{fallback.note}</p>
          <p>{fallback.consequence}</p>
        </div>
      ) : null}
    </section>
  )
}
