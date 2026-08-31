import type { Metadata } from 'next'

import { InternalBanner } from '@/components/ui/InternalBanner'
import insightData from '@/data/field08-internal-insights.v1.json'
import statusData from '@/data/field08-owner-review-status.v1.json'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Field 08 – intern innsiktspilot | Food Systems 2026',
  description: 'Eiergjennomgått intern pilot for matsvinn, sidestrømmer og N–P–K.',
  robots: { index: false, follow: false },
}

const decisionLabels: Record<string, string> = {
  pending_owner_review: 'Venter på eiergjennomgang',
  accepted_internal_with_limitations: 'Akseptert internt med begrensninger',
  returned_for_revision: 'Returnert for revisjon',
  rejected: 'Avvist',
  retained_open: 'Beholdt åpen',
}

function shortHash(value: string) {
  return `${value.slice(0, 15)}…${value.slice(-8)}`
}

export default function Field08PilotPage() {
  const complete = statusData.packageStatus === 'owner_review_complete_internal_only'
  const insights = insightData.insights as Array<{
    insightId: string
    statement: string
    calculationMethod: string
    comparabilityClass: string
  }>

  return (
    <main className="space-y-8 pb-12">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Intern innsiktspilot</p>
        <div>
          <h1 className="text-3xl font-bold text-stone-950">Field 08: matsvinn, sidestrømmer og N–P–K</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
            Reproduserbar eiergjennomgang av fem avgrensede kilder. Siden viser bare deploybare status- og
            innsiktsartefakter; private PDF-er og lokale arkivdetaljer inngår ikke.
          </p>
        </div>
        <InternalBanner note="Kun internt beslutningsgrunnlag. Ekstern bruk er blokkert, coverage er uendret, og eiergjennomgang erstatter ikke uavhengig ekspertvurdering." />
      </header>

      <section className="grid gap-4 md:grid-cols-3" aria-labelledby="field08-status-heading">
        <div className="rounded-xl border border-stone-200 bg-white p-5 md:col-span-2">
          <h2 id="field08-status-heading" className="text-lg font-semibold text-stone-900">
            {complete ? 'Eiergjennomgang fullført – kun internt' : 'Eiergjennomgang pågår'}
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Pakke fra {statusData.packageGeneratedAt}. {statusData.sources.filter((source) => source.receiptId).length} av {statusData.sources.length} kilder har eierkvittering.
          </p>
          <p className="mt-3 break-all font-mono text-xs text-stone-500">
            Pakkehash: {statusData.evidencePackageHash}
          </p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-950">
          <p className="font-semibold">Stopplinje</p>
          <p className="mt-2">Ekstern bruk er blokkert. Coverage promotion er blokkert. Sápmi får ingen evidens eller dekning fra disse politiske landdataene.</p>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="field08-sources-heading">
        <div>
          <h2 id="field08-sources-heading" className="text-xl font-semibold text-stone-900">Fem kildebeslutninger</h2>
          <p className="mt-1 text-sm text-stone-500">Hver beslutning er bundet til eksakt kildehash og samme Gate 2C-pakke.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {statusData.sources.map((source) => (
            <article key={source.sourceId} data-field08-source-card="true" className="rounded-xl border border-stone-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-stone-900">{source.publisher}</h3>
                  <p className="mt-1 text-sm text-stone-600">{source.title}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">
                  {decisionLabels[source.decision] ?? source.decision}
                </span>
              </div>
              <dl className="mt-4 grid gap-2 text-xs text-stone-600 sm:grid-cols-2">
                <div><dt className="font-medium text-stone-800">Geografi</dt><dd>{source.geographyIds.join(', ')}</dd></div>
                <div><dt className="font-medium text-stone-800">Lokatorer</dt><dd>{source.locatorCount}</dd></div>
                <div className="sm:col-span-2"><dt className="font-medium text-stone-800">Kilde-ID</dt><dd className="break-all font-mono">{source.sourceId}</dd></div>
                <div className="sm:col-span-2"><dt className="font-medium text-stone-800">Kildehash</dt><dd className="font-mono">{shortHash(source.sourceHash)}</dd></div>
              </dl>
              {source.limitations.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-700">Begrensninger</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-600">
                    {source.limitations.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="field08-insights-heading">
        <h2 id="field08-insights-heading" className="text-xl font-semibold text-stone-900">Godkjente interne innsiktskandidater</h2>
        {insights.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
            Ingen funn vises før en kilde er eksplisitt akseptert for intern bruk med begrensninger.
          </p>
        ) : (
          <div className="grid gap-4">
            {insights.map((insight) => (
              <article key={insight.insightId} className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <h3 className="font-semibold text-emerald-950">{insight.statement}</h3>
                <p className="mt-2 text-sm text-emerald-900">{insight.calculationMethod}</p>
                <p className="mt-2 text-xs text-emerald-800">Sammenlignbarhetsklasse: {insight.comparabilityClass}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5" aria-labelledby="field08-blocked-heading">
          <h2 id="field08-blocked-heading" className="text-lg font-semibold text-amber-950">Blokkerte sammenligninger</h2>
          <ul className="mt-3 space-y-3 text-sm text-amber-950">
            {insightData.blockedComparisons.map((item) => (
              <li key={item.statement}><strong>{item.statement}</strong> {item.reason}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-red-200 bg-red-50 p-5" aria-labelledby="field08-dont-say-heading">
          <h2 id="field08-dont-say-heading" className="text-lg font-semibold text-red-950">Ikke si</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-red-950">
            {insightData.doNotSay.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-stone-900">Neste databehov</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-stone-600">
            {insightData.nextDataNeeds.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
        <section className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-stone-900">Senere ekspertporter</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-stone-600">
            {insightData.laterExpertGates.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
      </div>
    </main>
  )
}
