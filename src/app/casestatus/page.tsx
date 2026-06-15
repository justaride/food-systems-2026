import type { Metadata } from 'next'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { InternalBanner } from '@/components/ui/InternalBanner'
import { PageFraming } from '@/components/ui/PageFraming'
import { CASESTATUS_RULE, CASESTATUS_UPDATED, caseAnchors } from '@/lib/data/casestatus'
import { MATURITY_LABELS, STATUS_STYLES } from './status-display'

export const metadata: Metadata = {
  title: 'Casestatus — Food Systems 2026',
  description: 'Intern modenhetsstatus for de syv caseankrene fra 09.06-spissingen.',
}

export default function CasestatusPage() {
  const counts = {
    kartlagt: caseAnchors.filter(c => c.maturity === 'kartlagt').length,
    delvis: caseAnchors.filter(c => c.maturity === 'delvis').length,
    radar: caseAnchors.filter(c => c.maturity === 'radar').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Casestatus</h1>
        <p className="text-sm text-stone-400 mt-1">
          De syv caseankrene fra 09.06-spissingen med intern modenhet, nøkkeltall, blokkere og neste handling.
          Oppdatert {CASESTATUS_UPDATED}.
        </p>
      </div>

      <InternalBanner note={CASESTATUS_RULE} />

      <PageFraming
        title="Hva svarer denne siden på?"
        description={[
          'Hvor moden er hvert av de syv caseankrene fra arbeidsavklaringen 09.06, hva er tallfestet, og hva stopper videre løft?',
          'Siden speiler sprintboardet og desk-research-loggen, slik at styringsdialogen ikke krever lesing av repo-filer.',
        ]}
        takeaways={[
          `${counts.kartlagt} av ${caseAnchors.length} ankre er kartlagt med tallgrunnlag; ${counts.delvis} er delvis kartlagt.`,
          'Relasjonscasene (kaffe/kakao) venter kun på interne dokumenter — mer research avgjør dem ikke.',
          'Kjernefunnet på tvers: avhengigheter og høyverdigap er nå tallfestet, ikke bare påstått.',
        ]}
        caveat="Intern modenhetsstatus med forbehold: ingen claims er eksternt validert, ingen aktører er kontaktet, og tall merket internt tallgrunnlag re-trekkes autorisert før ekstern bruk."
      />

      <div className="space-y-4">
        {caseAnchors.map(anchor => (
          <Card key={anchor.id}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-base font-semibold text-stone-800">
                  <Link href={`/casestatus/${anchor.id}`} className="hover:text-emerald-700 hover:underline">
                    {anchor.title}
                  </Link>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Spor {anchor.tracks.join('/')} · {MATURITY_LABELS[anchor.maturity]}
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-1.5 max-w-[50%]">
                {anchor.statuses.map(status => (
                  <span
                    key={status}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[status]}`}
                  >
                    {status}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4 rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400 mb-1">Go/no-go-retning</p>
              <p className="text-sm font-medium text-stone-700">{anchor.goNoGo}</p>
              <p className="text-sm text-stone-600 leading-relaxed mt-2">{anchor.summary}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <h4 className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-2">Nøkkeltall</h4>
                <ul className="space-y-2">
                  {anchor.keyFigures.map(fig => (
                    <li key={fig.label} className="text-xs text-stone-600">
                      <span className="font-semibold text-stone-800">{fig.value}</span>
                      {' — '}
                      {fig.label}
                      <span className="block text-[11px] text-stone-400 mt-0.5">{fig.source}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-stone-200 bg-white p-4">
                  <h4 className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-2">Blokkere</h4>
                  <ul className="space-y-1.5">
                    {anchor.blockers.map(blocker => (
                      <li key={blocker} className="flex items-start gap-2 text-xs text-stone-600">
                        <span className="text-amber-500 mt-0.5 shrink-0">-</span>
                        {blocker}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-white p-4">
                  <h4 className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-2">Neste handling</h4>
                  <ul className="space-y-1.5">
                    {anchor.nextActions.map(action => (
                      <li key={action} className="flex items-start gap-2 text-xs text-stone-600">
                        <span className="text-emerald-500 mt-0.5 shrink-0">+</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4 mb-3">
              <h4 className="text-xs text-rose-500 uppercase tracking-wider font-medium mb-2">Ikke si</h4>
              <ul className="space-y-1">
                {anchor.notSay.map(item => (
                  <li key={item} className="text-xs text-rose-900">{item}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-stone-400 font-mono break-all">
                Underlag: {anchor.docRefs.join(' · ')}
              </p>
              <Link
                href={`/casestatus/${anchor.id}`}
                className="shrink-0 text-xs font-medium text-emerald-700 hover:underline"
              >
                Åpne dybde-avsjekk →
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
