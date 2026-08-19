import type {
  LibraryAnalysisRunGroup,
  LibraryAnalysisRunRow,
} from '@/lib/queries/library-analysis-runs'

type Props = {
  groups: LibraryAnalysisRunGroup[]
}

/**
 * Review surface for model analyses. Read-only by design: this app has no
 * authentication, so an approve button here would be an unauthenticated
 * authority action. Decisions are recorded with research:library:review-run,
 * the same shape the external review decision already uses.
 */
export function LibraryAnalysisRuns({ groups }: Props) {
  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white px-4 py-6 text-center text-xs text-stone-400">
        Ingen modellkjøringer registrert. Kjør <code className="font-mono">research:library:analyse:apply</code> for å legge inn kandidater.
      </div>
    )
  }

  const totalRuns = groups.reduce((sum, group) => sum + group.runs.length, 0)
  const totalClaims = groups.reduce(
    (sum, group) => sum + group.runs.reduce((runSum, run) => runSum + run.claims.length, 0),
    0,
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-lg font-semibold text-stone-900">Modellkjøringer til review</h2>
        <p className="text-xs text-stone-400">
          {totalRuns} kjøringer over {groups.length} kilder · {totalClaims} påstander
        </p>
      </div>

      <p className="text-xs leading-relaxed text-stone-500">
        Hver kjøring er en uforanderlig kandidat. Flere kjøringer på samme kilde vises
        side om side slik at modeller og promptversjoner kan sammenlignes. Ingen kjøring
        har myndighet før et menneske registrerer en beslutning.
      </p>

      {groups.map(group => (
        <SourceGroup key={`${group.sourceKind}:${group.sourceKey}`} group={group} />
      ))}
    </div>
  )
}

function SourceGroup({ group }: { group: LibraryAnalysisRunGroup }) {
  const identicalHashes = new Set(
    group.runs
      .map(run => run.payloadHash)
      .filter((hash, index, hashes) => hashes.indexOf(hash) !== index),
  )

  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
      <div className="border-b border-stone-100 bg-stone-50 px-4 py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-medium text-stone-800">{group.title}</p>
          <ReviewBadge run={group.runs[0]} />
        </div>
        <p className="mt-1 break-all font-mono text-[10px] text-stone-400">
          {group.canonicalPath ?? group.sourceKey}
        </p>
      </div>

      <div className="grid gap-px bg-stone-100 md:grid-cols-2">
        {group.runs.map(run => (
          <RunCard key={run.id} run={run} identical={identicalHashes.has(run.payloadHash)} />
        ))}
      </div>
    </div>
  )
}

function RunCard({ run, identical }: { run: LibraryAnalysisRunRow; identical: boolean }) {
  return (
    <div className="bg-white p-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded border border-stone-200 bg-stone-50 px-2 py-1 font-mono text-[10px] text-stone-700">
          {run.aiModel}
        </span>
        <span className="rounded border border-stone-200 bg-stone-50 px-2 py-1 font-mono text-[10px] text-stone-500">
          {run.promptVersion}
        </span>
        {run.isCurrent && (
          <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] text-emerald-800">
            Vist i dag
          </span>
        )}
        {identical && (
          <span className="rounded border border-stone-200 bg-stone-50 px-2 py-1 text-[10px] text-stone-500">
            Identisk analyse
          </span>
        )}
      </div>

      <p className="mt-1.5 font-mono text-[10px] text-stone-400">
        {run.runId} · {run.createdAt.toISOString().slice(0, 16).replace('T', ' ')} · {run.payloadHash.slice(0, 12)}
      </p>

      {run.aiSummary && (
        <p className="mt-3 text-xs leading-relaxed text-stone-600">{run.aiSummary}</p>
      )}

      {run.claims.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-stone-400">
            Påstander ({run.claims.length})
          </p>
          <ul className="mt-2 space-y-2">
            {run.claims.map((claim, index) => (
              <li key={index} className="rounded border border-stone-200 bg-stone-50 px-3 py-2">
                <p className="text-xs text-stone-800">{claim.text}</p>
                {claim.evidence && (
                  <p className="mt-1.5 border-l-2 border-stone-300 pl-2 text-[11px] italic leading-relaxed text-stone-500">
                    {claim.evidence}
                  </p>
                )}
                <p className="mt-1.5 break-all font-mono text-[10px] text-stone-400">
                  {[claim.sourcePath, claim.pageRef].filter(Boolean).join(' · ')}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {run.gaps.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-stone-400">Gap</p>
          <ul className="mt-1.5 space-y-1">
            {run.gaps.map((gap, index) => (
              <li key={index} className="text-[11px] leading-relaxed text-stone-500">
                <span className="font-mono text-[10px] text-stone-400">{gap.kind}</span> — {gap.note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {run.riskFlags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {run.riskFlags.map(flag => (
            <span key={flag} className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] text-amber-800">
              {flag}
            </span>
          ))}
        </div>
      )}

      <p className="mt-3 select-all break-all font-mono text-[10px] text-stone-300">
        {run.id}
      </p>
    </div>
  )
}

function ReviewBadge({ run }: { run: LibraryAnalysisRunRow | undefined }) {
  if (!run?.reviewStatus || run.reviewStatus === 'not_reviewed') {
    return (
      <span className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] text-amber-800">
        Venter på review
      </span>
    )
  }

  const tone = run.reviewStatus === 'approved'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : run.reviewStatus === 'rejected'
      ? 'border-rose-200 bg-rose-50 text-rose-800'
      : 'border-stone-200 bg-stone-50 text-stone-600'

  return (
    <span className={`rounded border px-2 py-1 text-[10px] ${tone}`}>
      {run.reviewStatus}{run.reviewer ? ` · ${run.reviewer}` : ''}
    </span>
  )
}
