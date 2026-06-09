import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { PageFraming } from '@/components/ui/PageFraming'
import { KnowledgeGraph } from '@/components/charts/KnowledgeGraph'
import { StatusLegend } from '@/components/visualization/StatusLegend'
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

  const nodeIds = new Set(nodes.map((node) => node.id))
  const degreeById = new Map<string, number>()
  let brokenEdges = 0
  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) brokenEdges += 1
    degreeById.set(edge.source, (degreeById.get(edge.source) ?? 0) + 1)
    degreeById.set(edge.target, (degreeById.get(edge.target) ?? 0) + 1)
  }
  const interactiveNodes = nodes.filter((node) => (degreeById.get(node.id) ?? 0) > 0)
  const interactiveNodeIds = new Set(interactiveNodes.map((node) => node.id))
  const interactiveEdges = edges.filter(
    (edge) => interactiveNodeIds.has(edge.source) && interactiveNodeIds.has(edge.target),
  )
  const connectedNodes = interactiveNodes.length
  const isolatedNodes = nodes.length - connectedNodes
  const actionableIsolates = quality?.isolatedNodeTriage.actionable ?? isolatedNodes
  const confidencePct =
    quality && quality.edgeConfidenceCoverage.totalEdges > 0
      ? Math.round(
          (quality.edgeConfidenceCoverage.withConfidence /
            quality.edgeConfidenceCoverage.totalEdges) *
            1000,
        ) / 10
      : 0

  return (
    <div className="space-y-5 lg:w-[calc(100vw-14rem-4rem)] lg:max-w-none">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Relasjonsmotor
          </p>
          <h1 className="mt-1 text-3xl font-bold text-stone-950">Kunnskapsgraf</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-500">
            Fullformat arbeidsflate for koblinger mellom dokumenter, innsikt, masteroppgaver,
            selskaper, aktører, personer og eiendommer.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[560px]">
          <StatusTile label="Koblede noder" value={connectedNodes.toLocaleString('no')} tone="ok" />
          <StatusTile label="Isolat-kø" value={actionableIsolates.toLocaleString('no')} tone={actionableIsolates > 0 ? 'warn' : 'ok'} />
          <StatusTile label="Brutte kanter" value={brokenEdges.toLocaleString('no')} tone={brokenEdges > 0 ? 'error' : 'ok'} />
          <StatusTile label="Konfidens" value={`${confidencePct}%`} tone={confidencePct >= 70 ? 'ok' : 'warn'} />
        </div>
      </div>

      <PageFraming
        title="Hva svarer denne siden på?"
        description={[
          'Siden svarer på hvilke dokumenter, innsikter, selskaper, personer og eiendommer som henger sammen i kunnskapsbasen.',
          'Den brukes til QA, navigasjon og isolat-kø, ikke som selvstendig bevis for effekt eller eierskap.',
        ]}
        takeaways={[
          'Canvas viser bare koblede noder slik at arbeidsflaten holder fokus på relasjoner.',
          'Statusflisene gjør brutte kanter, isolater og konfidens synlige for videre rydding.',
          'Datakvalitetspanelet peker ut duplikater, manglende profiler og kantdekning.',
        ]}
        caveat="Internt arbeidsgrunnlag med forbehold: grafkanter bygger på kuraterte kilder, proxy og konfidensmerking og er ikke ekstern validering."
      />

      <StatusLegend
        title="Status for graf og relasjoner"
        description="Les grafstatus som datakvalitet og språkstyring: proxy, illustrativ og intern betyr at koblingen trenger kildekontroll før den brukes i beslutningsspråk."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
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

      <section className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm shadow-stone-900/[0.03]">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-stone-500">
          <span>
            Interaktiv flate viser {interactiveNodes.length.toLocaleString('no')} koblede noder.
          </span>
          <span>
            {isolatedNodes.toLocaleString('no')} isolerte registerrader holdes utenfor canvas; {actionableIsolates.toLocaleString('no')} ligger i tiltakskøen.
          </span>
        </div>
        <KnowledgeGraph nodes={interactiveNodes} edges={interactiveEdges} />
      </section>

      {quality && <DataQualityPanel quality={quality} />}
    </div>
  )
}

function StatusTile({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'ok' | 'warn' | 'error'
}) {
  const toneClass =
    tone === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : tone === 'warn'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700'

  return (
    <div className={`rounded-lg border px-3 py-2 ${toneClass}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
    </div>
  )
}

function DataQualityPanel({ quality }: { quality: GraphQualityReport }) {
  const personDuplicateTriage = quality.personDuplicateTriage
  const totalCompanyDupIds = quality.companyNameDuplicates
    .concat(quality.companyOrgNrDuplicates)
    .reduce((acc, g) => acc + g.ids.length, 0)
  const hasIssues =
    quality.companyNameDuplicates.length > 0 ||
    quality.companyOrgNrDuplicates.length > 0 ||
    quality.personNameDuplicates.length > 0 ||
    quality.personKeyDuplicates.length > 0 ||
    quality.businessRelationshipDuplicates.length > 0 ||
    quality.orphanBoardMembers.length > 0 ||
    quality.boardMemberProfileGaps.length > 0 ||
    quality.isolatedNodeTriage.actionable > 0

  const confidencePct =
    quality.edgeConfidenceCoverage.totalEdges > 0
      ? Math.round(
          (quality.edgeConfidenceCoverage.withConfidence /
            quality.edgeConfidenceCoverage.totalEdges) *
            1000,
        ) / 10
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
          sub={`${personDuplicateTriage.mergeCandidates} kan samles; ${personDuplicateTriage.reviewRequired} må vurderes`}
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
          label="Styremedlem uten profilside"
          count={quality.boardMemberProfileGaps.length}
          sub="fallback-node i graf"
          severity={quality.boardMemberProfileGaps.length > 0 ? 'warn' : 'ok'}
        />
        <QualityStat
          label="Styremedlem uten grafnode"
          count={quality.orphanBoardMembers.length}
          sub="manglende kant i graf"
          severity={quality.orphanBoardMembers.length > 0 ? 'error' : 'ok'}
        />
        <QualityStat
          label="Kanter med konfidens"
          count={quality.edgeConfidenceCoverage.withConfidence}
          sub={`${confidencePct}% av ${quality.edgeConfidenceCoverage.totalEdges}`}
          severity="info"
        />
        <QualityStat
          label="Isolerte tiltaksnoder"
          count={quality.isolatedNodeTriage.actionable}
          sub={`${quality.isolatedNodeTriage.intentional} katalog-/kildenoder`}
          severity={quality.isolatedNodeTriage.actionable > 0 ? 'warn' : 'ok'}
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
          hrefBuilder={() => null}
          tone="warn"
        />
      )}

      {personDuplicateTriage.total > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
            Personduplikater - tiltakskø ({personDuplicateTriage.total})
          </h4>
          <ul className="text-xs text-stone-700 space-y-1 max-h-56 overflow-y-auto border border-amber-200 rounded p-2 bg-amber-50">
            {personDuplicateTriage.samples.slice(0, 50).map((item) => {
              const href = item.canonicalPersonKey
                ? `/personer/${encodeURIComponent(item.canonicalPersonKey)}`
                : null
              const actionLabel = item.action === 'merge_candidate'
                ? 'kan samles'
                : 'må vurderes'

              return (
                <li key={item.key} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate">
                    {href ? (
                      <Link href={href} className="text-stone-800 hover:underline font-medium">
                        {item.label}
                      </Link>
                    ) : (
                      <span className="font-medium text-stone-800">{item.label}</span>
                    )}
                    <span className="text-stone-400">
                      {' '}
                      — {item.ids.length} profiler; {item.rationale}
                    </span>
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono shrink-0">
                    {actionLabel}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {quality.businessRelationshipDuplicates.length > 0 && (
        <DuplicateList
          title="Relasjons-duplikater"
          groups={quality.businessRelationshipDuplicates}
          hrefBuilder={() => null}
          tone="warn"
        />
      )}

      {quality.isolatedNodeTriage.actionable > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
            Isolerte noder som trenger kobling ({quality.isolatedNodeTriage.actionable})
          </h4>
          <ul className="text-xs text-stone-600 space-y-1 max-h-56 overflow-y-auto border border-amber-200 rounded p-2 bg-amber-50">
            {quality.isolatedNodeTriage.samples
              .filter(item => item.actionable)
              .slice(0, 50)
              .map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate">
                    {item.href ? (
                      <Link href={item.href} className="text-stone-800 hover:underline font-medium">
                        {item.label}
                      </Link>
                    ) : (
                      <span className="font-medium text-stone-800">{item.label}</span>
                    )}
                    <span className="text-stone-400"> — {item.rationale}</span>
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono shrink-0">
                    {item.type}/{item.action}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {quality.orphanBoardMembers.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
            Styremedlemmer uten profil ({quality.orphanBoardMembers.length})
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

      {quality.boardMemberProfileGaps.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
            Styremedlemmer uten profilside ({quality.boardMemberProfileGaps.length})
          </h4>
          <ul className="text-xs text-stone-600 space-y-1 max-h-48 overflow-y-auto border border-stone-200 rounded p-2 bg-stone-50">
            {quality.boardMemberProfileGaps.slice(0, 50).map((bm, i) => (
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
            {quality.boardMemberProfileGaps.length > 50 && (
              <li className="text-stone-400 italic">
                … og {quality.boardMemberProfileGaps.length - 50} til
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
