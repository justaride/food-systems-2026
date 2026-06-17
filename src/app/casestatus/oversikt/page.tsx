import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { InternalBanner } from '@/components/ui/InternalBanner'
import { PageFraming } from '@/components/ui/PageFraming'
import { CASESTATUS_RULE, CASESTATUS_UPDATED, caseAnchors } from '@/lib/data/casestatus'
import { MATURITY_LABELS, STATUS_STYLES } from '../status-display'

export const metadata: Metadata = {
  title: 'Case-oversikt (JTs format) — Food Systems 2026',
  description:
    'Alle caseankrene på én side i Jan Thomas’ §7-format: problem, data, barriere, stakeholders, finansiering, første handling og hva som må valideres.',
}

/** Ett felt i JTs §7-format. */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-stone-400 mb-1.5">{label}</p>
      {children}
    </div>
  )
}

function Bullets({ items, marker = 'text-stone-400' }: { items: string[]; marker?: string }) {
  return (
    <ul className="space-y-1">
      {items.map(item => (
        <li key={item} className="flex items-start gap-1.5 text-xs text-stone-600 leading-snug">
          <span className={`${marker} mt-[3px] shrink-0`}>·</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function CaseOversiktPage() {
  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <Link href="/casestatus" className="hover:text-emerald-700">Casestatus</Link>
        <span>/</span>
        <span className="font-medium text-stone-700">Oversikt (JTs format)</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-stone-900">Case-oversikt — alle ankrene på én side</h1>
        <p className="text-sm text-stone-400 mt-1">
          Caseporteføljen i Jan Thomas’ §7-format: problem · data · barriere · stakeholders · finansiering ·
          første handling · må valideres. {caseAnchors.length} ankre. Oppdatert {CASESTATUS_UPDATED}.
        </p>
      </div>

      <InternalBanner note={CASESTATUS_RULE} />

      <PageFraming
        title="Hva svarer denne siden på?"
        description={[
          'Dette er leveransen JT skisserte 09.06: ett ark der hvert caseanker har de samme syv feltene ved siden av hverandre, slik at hele porteføljen kan vurderes samlet uten å lese flere filer.',
          'Hvert kort lenker videre til den fulle dybde-avsjekken.',
        ]}
        takeaways={[
          'Stakeholders og finansiering er fylt fra det som faktisk står i avsjekkene — der det er tynt, står det «ikke kartlagt», ikke pyntet.',
          'Finansiering er reelt tynn på de fleste casene: bare kaffe/kakao (EUDR-marked) og spillvarme (Enova) har en konkret vinkel.',
          'Fôr/import er nå med som eget anker — JTs hovedspor, tidligere bare en deck-ramme.',
        ]}
        caveat="Intern modenhetsstatus. Tall merket internt tallgrunnlag eller historisk/estimat re-trekkes og re-valideres før ekstern bruk."
      />

      <div className="space-y-5">
        {caseAnchors.map(anchor => (
          <article key={anchor.id} className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 print:break-inside-avoid">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <h2 className="text-base font-semibold text-stone-800">
                  <Link href={`/casestatus/${anchor.id}`} className="hover:text-emerald-700 hover:underline">
                    {anchor.title}
                  </Link>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Spor {anchor.tracks.join('/')} · {MATURITY_LABELS[anchor.maturity]}
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-1.5 max-w-[55%]">
                {anchor.statuses.map(status => (
                  <span
                    key={status}
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[status]}`}
                  >
                    {status}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              <div className="md:col-span-2 xl:col-span-3">
                <Field label="1 · Problem">
                  <p className="text-sm text-stone-700 leading-snug">{anchor.problem}</p>
                </Field>
              </div>

              <Field label="2 · Data">
                <ul className="space-y-1.5">
                  {anchor.keyFigures.slice(0, 3).map(fig => (
                    <li key={fig.label} className="text-xs text-stone-600 leading-snug">
                      <span className="font-semibold text-stone-800">{fig.value}</span> — {fig.label}
                    </li>
                  ))}
                </ul>
              </Field>

              <Field label="3 · Barriere">
                <Bullets items={anchor.blockers} marker="text-amber-500" />
              </Field>

              <Field label="4 · Stakeholders">
                <Bullets items={anchor.stakeholders} marker="text-sky-500" />
              </Field>

              <Field label="5 · Finansiering">
                <p className="text-xs text-stone-600 leading-snug">{anchor.funding}</p>
              </Field>

              <Field label="6 · Første handling">
                <Bullets items={anchor.nextActions} marker="text-emerald-500" />
              </Field>

              <Field label="7 · Må valideres (ikke si ennå)">
                <Bullets items={anchor.notSay} marker="text-rose-400" />
              </Field>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-stone-400">Go/no-go</p>
              <Link href={`/casestatus/${anchor.id}`} className="shrink-0 text-xs font-medium text-emerald-700 hover:underline">
                Åpne dybde-avsjekk →
              </Link>
            </div>
            <p className="text-xs text-stone-600 leading-snug mt-1">{anchor.goNoGo}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
