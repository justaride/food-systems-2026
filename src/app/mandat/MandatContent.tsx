import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import {
  foodTgClaimBoard,
  foodTgDecisionDocuments,
  foodTgMandateSummary,
  foodTgOpportunityRadar,
  foodTgStatusLabels,
  foodTgStopSignals,
  foodTgValidationSprint,
  type FoodTgSprintItem,
  type FoodTgTrack,
  type FoodTgValidationStatus,
} from '@/lib/data/food-tg-mandate'

const trackStyles: Record<FoodTgTrack, string> = {
  A: 'bg-sky-50 text-sky-700 border-sky-200',
  B: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  C: 'bg-amber-50 text-amber-700 border-amber-200',
}

const statusStyles: Record<FoodTgValidationStatus, string> = {
  'internt-trygt': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'needs-primary-check': 'bg-sky-50 text-sky-700 border-sky-200',
  'needs-actor-validation': 'bg-amber-50 text-amber-700 border-amber-200',
  benchmark: 'bg-violet-50 text-violet-700 border-violet-200',
  hypotese: 'bg-stone-100 text-stone-600 border-stone-200',
}

const documentStatusStyles: Record<string, string> = {
  'klar-til-bruk': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  arbeidsgrunnlag: 'bg-sky-50 text-sky-700 border-sky-200',
  koe: 'bg-amber-50 text-amber-700 border-amber-200',
}

function TrackPill({ track }: { track: FoodTgTrack }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${trackStyles[track]}`}>
      Spor {track}
    </span>
  )
}

function StatusPill({ status }: { status: FoodTgValidationStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}>
      {foodTgStatusLabels[status]}
    </span>
  )
}

function DocumentStatus({ status }: { status: string }) {
  const label = status === 'klar-til-bruk' ? 'Klar til bruk' : status === 'arbeidsgrunnlag' ? 'Arbeidsgrunnlag' : 'Koe'
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${documentStatusStyles[status]}`}>
      {label}
    </span>
  )
}

function SprintRow({ item }: { item: FoodTgSprintItem }) {
  return (
    <div className="grid gap-3 border-b border-stone-100 py-3 last:border-0 md:grid-cols-[72px_1fr_1fr]">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-stone-400">Dag</p>
        <p className="text-sm font-semibold text-stone-800">{item.day}</p>
      </div>
      <div>
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <p className="text-sm font-semibold text-stone-800">{item.work}</p>
          {item.status.map((status) => (
            <StatusPill key={status} status={status} />
          ))}
        </div>
        <p className="text-sm text-stone-600">{item.counterparties}</p>
      </div>
      <div>
        <p className="text-sm text-stone-700">{item.question}</p>
        <p className="mt-1 text-xs text-stone-500">{item.output}</p>
      </div>
    </div>
  )
}

export function MandatContent() {
  const statusCounts = foodTgOpportunityRadar.reduce<Record<FoodTgValidationStatus, number>>((acc, item) => {
    for (const status of item.statuses) acc[status] = (acc[status] ?? 0) + 1
    return acc
  }, {} as Record<FoodTgValidationStatus, number>)

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-900/[0.03]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] font-medium uppercase tracking-wider text-stone-500">Food TG styringsflate</p>
            <h1 className="mt-1 text-2xl font-bold text-stone-900">{foodTgMandateSummary.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{foodTgMandateSummary.scope}</p>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{foodTgMandateSummary.recommendation}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm lg:w-72">
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-stone-400">Oppdatert</p>
              <p className="mt-1 font-semibold text-stone-800">{foodTgMandateSummary.date}</p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-stone-400">Scope-mote</p>
              <p className="mt-1 font-semibold text-stone-800">{foodTgMandateSummary.decisionDate}</p>
            </div>
            <div className="col-span-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-amber-700">Statusdisiplin</p>
              <p className="mt-1 text-sm font-medium text-amber-900">{foodTgMandateSummary.externalValidation}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        {Object.entries(foodTgStatusLabels).map(([status, label]) => (
          <div key={status} className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-[10px] uppercase tracking-wider text-stone-400">{label}</p>
            <p className="mt-2 text-2xl font-bold text-stone-900">{statusCounts[status as FoodTgValidationStatus] ?? 0}</p>
            <p className="mt-1 text-xs text-stone-500">opportunity-treff</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title="Beslutningsgrunnlag">
          <div className="space-y-3">
            {foodTgDecisionDocuments.map((doc) => (
              <div key={doc.id} className="border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-stone-800">{doc.title}</h3>
                  <DocumentStatus status={doc.status} />
                </div>
                <p className="mt-1 text-xs text-stone-500">{doc.kind}</p>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">{doc.use}</p>
                <code className="mt-2 block break-all rounded-md bg-stone-50 px-2 py-1 text-[11px] text-stone-500">{doc.path}</code>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Beslutningsregel">
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-stone-600">{foodTgMandateSummary.decisionRule}</p>
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-stone-400">Neste arbeid</p>
              <p className="mt-1 text-sm font-medium text-stone-800">
                Kjor sprinten, oppdater claim-status, og bruk resultatet til et oppdatert decision memo etter sprint.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/innsikt" className="rounded-md border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50">
                Innsikt
              </Link>
              <Link href="/rapporter" className="rounded-md border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50">
                Rapporter
              </Link>
              <Link href="/metodikk" className="rounded-md border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50">
                Metodikk
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Opportunity radar">
        <div className="space-y-4">
          {foodTgOpportunityRadar.map((item) => (
            <div key={item.rank} className="rounded-lg border border-stone-200 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-stone-400">#{item.rank}</span>
                    <h3 className="text-sm font-semibold text-stone-900">{item.title}</h3>
                    <TrackPill track={item.track} />
                  </div>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-stone-400">{item.role}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.statuses.map((status) => (
                    <StatusPill key={status} status={status} />
                  ))}
                </div>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Kan sies na</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">{item.canSay}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Skal ikke sies enna</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">{item.cannotSay}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Valideringsbehov</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">{item.validationNeed}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Stoppsignal</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">{item.stopSignal}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-stone-500">
                {[...item.claimIds, ...item.evidenceIds, ...item.sourceIds].map((id) => (
                  <span key={id} className="rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5">
                    {id}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="10 arbeidsdagers valideringssprint">
        <div>
          {foodTgValidationSprint.map((item) => (
            <SprintRow key={`${item.day}-${item.work}`} item={item} />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_0.8fr]">
        <Card title="Claim og evidence board">
          <div className="space-y-3">
            {foodTgClaimBoard.map((claim) => (
              <div key={claim.id} className="border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  <TrackPill track={claim.track} />
                  <StatusPill status={claim.status} />
                  <span className="text-xs font-mono text-stone-400">{claim.id}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-stone-800">{claim.title}</p>
                <p className="mt-1 text-sm text-stone-600">{claim.useNow}</p>
                <p className="mt-1 text-xs text-stone-500">Ma avklares: {claim.needs}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Stoppsignaler">
          <ul className="space-y-2">
            {foodTgStopSignals.map((signal) => (
              <li key={signal} className="flex gap-2 text-sm leading-relaxed text-stone-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                <span>{signal}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
