import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { KnowledgeGraph } from '@/components/charts/KnowledgeGraph'
import { getFullGraph, type GraphQualityReport } from '@/lib/queries/graph'

export default async function GrafPage() {
  let nodes: Awaited<ReturnType<typeof getFullGraph>>['nodes'] = []
  let edges: Awaited<ReturnType<typeof getFullGraph>>['edges'] = []
  let quality: GraphQualityReport | undefined
  try {
    const graph = await getFullGraph()
    nodes = graph.nodes
    edges = graph.edges
    quality = graph.quality
  } catch (e) {
    console.error('[graf] DB query failed:', e)
  }

  const typeCounts = nodes.reduce<Record<string, number>>((acc, n) => {
    acc[n.type] = (acc[n.type] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Kunnskapsgraf</h1>
        <p className="text-sm text-stone-400 mt-1">
          Kryssreferanser mellom dokumenter, innsikt, masteroppgaver, selskaper og aktorer
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {Object.entries(typeCounts).map(([type, count]) => (
          <Card key={type}>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">{type}</p>
            <p className="text-xl font-bold text-stone-900 mt-1">{count}</p>
          </Card>
        ))}
        <Card>
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Kanter</p>
          <p className="text-xl font-bold text-stone-900 mt-1">{edges.length}</p>
        </Card>
      </div>

      {quality && <DataQualityPanel quality={quality} />}

      <Card title="Interaktiv graf">
        <KnowledgeGraph nodes={nodes} edges={edges} />
      </Card>
    </div>
  )
}

function DataQualityPanel({ quality }: { quality: GraphQualityReport }) {
  const totalCompanyDupIds = quality.companyNameDuplicates
    .concat(quality.companyOrgNrDuplicates)
    .reduce((acc, g) => acc + g.ids.length, 0)
  const totalPersonDupIds = quality.personNameDuplicates
    .concat(quality.personKeyDuplicates)
    .reduce((acc, g) => acc + g.ids.length, 0)

  const hasIssues =
    quality.companyNameDuplicates.length > 0 ||
    quality.companyOrgNrDuplicates.length > 0 ||
    quality.personNameDuplicates.length > 0 ||
    quality.personKeyDuplicates.length > 0 ||
    quality.businessRelationshipDuplicates.length > 0 ||
    quality.orphanBoardMembers.length > 0

  const confidencePct =
    quality.edgeConfidenceCoverage.totalEdges > 0
      ? Math.round(
          (quality.edgeConfidenceCoverage.withConfidence /
            quality.edgeConfidenceCoverage.totalEdges) *
            100,
        )
      : 0

  return (
    <Card title="Datakvalitet">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <QualityStat
          label="Selskap-duplikater (navn)"
          count={quality.companyNameDuplicates.length}
          sub={`${totalCompanyDupIds} IDer berørt`}
          severity={quality.companyNameDuplicates.length > 0 ? 'warn' : 'ok'}
        />
        <QualityStat
          label="Selskap-duplikater (orgNr)"
          count={quality.companyOrgNrDuplicates.length}
          sub="kritisk — samme orgNr"
          severity={quality.companyOrgNrDuplicates.length > 0 ? 'error' : 'ok'}
        />
        <QualityStat
          label="Person-duplikater"
          count={quality.personNameDuplicates.length + quality.personKeyDuplicates.length}
          sub={`${totalPersonDupIds} IDer berørt`}
          severity={
            quality.personNameDuplicates.length + quality.personKeyDuplicates.length > 0
              ? 'warn'
              : 'ok'
          }
        />
        <QualityStat
          label="Relasjons-duplikater"
          count={quality.businessRelationshipDuplicates.length}
          sub="samme (kjøper, leverandør, type)"
          severity={quality.businessRelationshipDuplicates.length > 0 ? 'warn' : 'ok'}
        />
        <QualityStat
          label="Styremedlem uten PersonProfile"
          count={quality.orphanBoardMembers.length}
          sub="manglende kant i graf"
          severity={quality.orphanBoardMembers.length > 0 ? 'warn' : 'ok'}
        />
        <QualityStat
          label="Kanter med konfidens"
          count={quality.edgeConfidenceCoverage.withConfidence}
          sub={`${confidencePct}% av ${quality.edgeConfidenceCoverage.totalEdges}`}
          severity="info"
        />
      </div>

      {!hasIssues && (
        <p className="text-xs text-stone-500">Ingen kvalitetsproblemer oppdaget.</p>
      )}

      {quality.companyOrgNrDuplicates.length > 0 && (
        <DuplicateList
          title="Selskap med delt organisasjonsnummer"
          groups={quality.companyOrgNrDuplicates}
          hrefBuilder={(id) => `/selskap/${id}`}
          tone="error"
        />
      )}

      {quality.companyNameDuplicates.length > 0 && (
        <DuplicateList
          title="Selskap med samme normaliserte navn"
          groups={quality.companyNameDuplicates}
          hrefBuilder={(id) => `/selskap/${id}`}
          tone="warn"
        />
      )}

      {quality.personKeyDuplicates.length > 0 && (
        <DuplicateList
          title="Personer med delt personKey"
          groups={quality.personKeyDuplicates}
          hrefBuilder={(id) => `/personer/${id}`}
          tone="warn"
        />
      )}

      {quality.personNameDuplicates.length > 0 && (
        <DuplicateList
          title="Personer med samme normaliserte navn"
          groups={quality.personNameDuplicates}
          hrefBuilder={(id) => `/personer/${id}`}
          tone="warn"
        />
      )}

      {quality.businessRelationshipDuplicates.length > 0 && (
        <DuplicateList
          title="BusinessRelationship-duplikater"
          groups={quality.businessRelationshipDuplicates}
          hrefBuilder={() => null}
          tone="warn"
        />
      )}

      {quality.orphanBoardMembers.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
            Styremedlemmer uten PersonProfile ({quality.orphanBoardMembers.length})
          </h4>
          <ul className="text-xs text-stone-600 space-y-1 max-h-48 overflow-y-auto border border-stone-200 rounded p-2 bg-stone-50">
            {quality.orphanBoardMembers.slice(0, 50).map((bm, i) => (
              <li key={`${bm.companyId}:${bm.personKey}:${i}`} className="flex justify-between gap-2">
                <span className="truncate">
                  <Link href={`/selskap/${bm.companyId}`} className="text-stone-700 hover:underline">
                    {bm.companyName}
                  </Link>
                  <span className="text-stone-400"> → </span>
                  <span>{bm.personName}</span>
                </span>
                <span className="text-[10px] text-stone-400 font-mono shrink-0">{bm.personKey}</span>
              </li>
            ))}
            {quality.orphanBoardMembers.length > 50 && (
              <li className="text-stone-400 italic">
                … og {quality.orphanBoardMembers.length - 50} til
              </li>
            )}
          </ul>
        </div>
      )}
    </Card>
  )
}

function QualityStat({
  label,
  count,
  sub,
  severity,
}: {
  label: string
  count: number
  sub?: string
  severity: 'ok' | 'warn' | 'error' | 'info'
}) {
  const color =
    severity === 'error'
      ? 'text-rose-600'
      : severity === 'warn' && count > 0
        ? 'text-amber-600'
        : severity === 'info'
          ? 'text-stone-900'
          : 'text-stone-900'
  return (
    <div className="rounded-md border border-stone-200 bg-white p-3">
      <p className="text-[10px] uppercase tracking-wider text-stone-400">{label}</p>
      <p className={`text-xl font-bold mt-1 ${color}`}>{count}</p>
      {sub && <p className="text-[10px] text-stone-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function DuplicateList({
  title,
  groups,
  hrefBuilder,
  tone,
}: {
  title: string
  groups: Array<{ key: string; label: string; ids: string[] }>
  hrefBuilder: (id: string) => string | null
  tone: 'warn' | 'error'
}) {
  const toneClass = tone === 'error' ? 'border-rose-200 bg-rose-50' : 'border-amber-200 bg-amber-50'
  return (
    <div className="mt-4">
      <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
        {title} ({groups.length})
      </h4>
      <ul className={`text-xs text-stone-700 space-y-1 max-h-48 overflow-y-auto border rounded p-2 ${toneClass}`}>
        {groups.slice(0, 50).map((g) => {
          const href = hrefBuilder(g.ids[0])
          return (
            <li key={g.key} className="flex justify-between gap-2">
              <span className="truncate">
                {href ? (
                  <Link href={href} className="text-stone-800 hover:underline font-medium">
                    {g.label}
                  </Link>
                ) : (
                  <span className="font-medium">{g.label}</span>
                )}
                <span className="text-stone-400"> — {g.ids.length} IDer</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono shrink-0">{g.key.slice(0, 32)}</span>
            </li>
          )
        })}
        {groups.length > 50 && (
          <li className="text-stone-400 italic">… og {groups.length - 50} til</li>
        )}
      </ul>
    </div>
  )
}
