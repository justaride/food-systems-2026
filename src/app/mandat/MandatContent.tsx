import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { PageFraming } from '@/components/ui/PageFraming'
import { EvidenceStatusBadge } from '@/components/visualization/EvidenceStatusBadge'
import { StatusLegend } from '@/components/visualization/StatusLegend'
import {
  foodTgClaimBoard,
  foodTgClaimStrengthLabels,
  foodTgMandateSummary,
  foodTgOpportunityRadar,
  foodTgStatusLabels,
  foodTgStopSignals,
  foodTgTrackStatusCards,
  foodTgValidationLanes,
  foodTgValidationSprint,
  type FoodTgClaimStrength,
  type FoodTgSprintItem,
  type FoodTgTrack,
  type FoodTgValidationLaneId,
  type FoodTgValidationStatus,
} from '@/lib/data/food-tg-mandate'
import {
  foodTgCandidateCards,
  foodTgControlDocuments,
  foodTgControlStatusLabels,
  foodTgDecisionGates,
  foodTgReaderJourneySurfaces,
  type FoodTgControlStatus,
} from '@/lib/data/food-tg-control-layer'
import { foodTgWageningenMethod } from '@/lib/data/wageningen-method'

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

const claimStrengthStyles: Record<FoodTgClaimStrength, string> = {
  'sterk-intern': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  moderat: 'bg-sky-50 text-sky-700 border-sky-200',
  benchmark: 'bg-violet-50 text-violet-700 border-violet-200',
  hypotese: 'bg-stone-100 text-stone-600 border-stone-200',
}

const validationLaneStyles: Record<FoodTgValidationLaneId, string> = {
  'utfort-internt': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'needs-primary-check': 'bg-sky-50 text-sky-800 border-sky-200',
  'needs-actor-validation': 'bg-amber-50 text-amber-900 border-amber-200',
  'validert-eksternt': 'bg-stone-50 text-stone-600 border-stone-200',
}

const controlStatusStyles: Record<FoodTgControlStatus, string> = {
  klar: 'bg-stone-50 text-stone-700 border-stone-300',
  'klar-med-forbehold': 'bg-sky-50 text-sky-700 border-sky-200',
  'krever-bekreftelse': 'bg-amber-50 text-amber-800 border-amber-200',
  'maa-harmoniseres': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'hold-tilbake': 'bg-rose-50 text-rose-700 border-rose-200',
  'venter-minimumsvedtak': 'bg-orange-50 text-orange-800 border-orange-200',
  'ikke-startet': 'bg-stone-100 text-stone-600 border-stone-200',
  benchmark: 'bg-violet-50 text-violet-700 border-violet-200',
  hypotese: 'bg-stone-100 text-stone-600 border-stone-200',
  pilotkandidat: 'bg-teal-50 text-teal-700 border-teal-200',
  sekundaerspor: 'bg-slate-50 text-slate-700 border-slate-200',
}

const controlTrackStyles: Record<string, string> = {
  A: trackStyles.A,
  'A/B': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  B: trackStyles.B,
  'B/C': 'bg-lime-50 text-lime-800 border-lime-200',
  C: trackStyles.C,
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

function ClaimStrengthPill({ strength }: { strength: FoodTgClaimStrength }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${claimStrengthStyles[strength]}`}>
      Styrke: {foodTgClaimStrengthLabels[strength]}
    </span>
  )
}

function ControlStatusPill({ status }: { status: FoodTgControlStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${controlStatusStyles[status]}`}>
      {foodTgControlStatusLabels[status]}
    </span>
  )
}

function ControlTrackPill({ track }: { track: string }) {
  const style = controlTrackStyles[track] ?? 'bg-stone-50 text-stone-700 border-stone-200'

  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${style}`}>Spor {track}</span>
}

function InlineList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item} className="rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-[11px] leading-snug text-stone-600">
          {item}
        </li>
      ))}
    </ul>
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

function WageningenMethodOverview() {
  return (
    <section className="overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm shadow-emerald-950/[0.04]">
      <div className="border-b border-emerald-100 bg-emerald-50/60 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-800">Metodegrunnlag for neste prosess</p>
              <ControlStatusPill status={foodTgWageningenMethod.status} />
              <span className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-xs font-medium text-emerald-800">
                {foodTgWageningenMethod.source.id}
              </span>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-stone-950">{foodTgWageningenMethod.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">{foodTgWageningenMethod.summary}</p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-emerald-900">{foodTgWageningenMethod.decision}</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 lg:w-80">
            <p className="text-[10px] uppercase tracking-wider text-amber-700">Bruksgrense</p>
            <p className="mt-1 text-sm leading-relaxed text-amber-950">{foodTgWageningenMethod.boundary}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <section>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h3 className="text-sm font-semibold text-stone-800">Food biomass cascade</h3>
              <p className="text-xs text-stone-500">Moerman/R9 brukt som spørsmål, ikke fasit</p>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {foodTgWageningenMethod.cascade.map((step) => (
                <div key={step.rank} className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <div className="flex items-start gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800">
                      {step.rank}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{step.level}</p>
                      <p className="mt-1 text-xs leading-relaxed text-stone-600">{step.foodUse}</p>
                    </div>
                  </div>
                  <p className="mt-2 border-t border-stone-200 pt-2 text-[11px] leading-relaxed text-stone-500">
                    Gate: {step.gate}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-stone-800">Claim-lock konsekvens</h3>
            <div className="mt-3 grid gap-2 lg:grid-cols-2">
              {foodTgWageningenMethod.claimDeltas.map((claim) => (
                <div key={claim.claimId} className="rounded-lg border border-stone-200 bg-white p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[11px] font-mono text-stone-500">
                      {claim.claimId}
                    </span>
                    <p className="text-sm font-semibold text-stone-800">{claim.label}</p>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-stone-600">{claim.effect}</p>
                  <p className="mt-1 text-xs leading-relaxed text-stone-500">Beslutning: {claim.decision}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <h3 className="text-sm font-semibold text-stone-800">Kildeanker og locatorstatus</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">{foodTgWageningenMethod.source.label}</p>
            <p className="mt-2 text-xs leading-relaxed text-stone-500">{foodTgWageningenMethod.source.locatorStatus}</p>
            <a
              href={foodTgWageningenMethod.source.doi}
              className="mt-3 inline-flex rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100"
            >
              DOI
            </a>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-stone-800">Røde porter</h3>
            <div className="mt-3 space-y-2">
              {foodTgWageningenMethod.redGates.map((gate) => (
                <div key={gate.title} className="rounded-lg border border-stone-200 bg-white p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-stone-800">{gate.title}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                      gate.state === 'apen'
                        ? 'border-amber-200 bg-amber-50 text-amber-800'
                        : 'border-sky-200 bg-sky-50 text-sky-700'
                    }`}
                    >
                      {gate.state === 'apen' ? 'Åpen' : 'Klar med forbehold'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-stone-600">{gate.closureEvidence}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-stone-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-stone-800">Neste valideringsasks</h3>
            <div className="mt-3 space-y-2">
              {foodTgWageningenMethod.validationAsks.slice(0, 4).map((ask) => (
                <div key={`${ask.candidate}-${ask.ask}`} className="border-b border-stone-100 pb-2 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[11px] font-mono text-stone-500">
                      {ask.candidate}
                    </span>
                    <p className="text-xs font-semibold text-stone-800">{ask.ask}</p>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-stone-500">{ask.evidenceRequired}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-emerald-800">Trygt språk</p>
              <InlineList items={foodTgWageningenMethod.safeLanguage} />
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-rose-700">Ikke si</p>
              <InlineList items={foodTgWageningenMethod.blockedLanguage} />
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-stone-800">Dokumenter</h3>
            <div className="mt-3 space-y-1.5">
              {foodTgWageningenMethod.documents.map((doc) => (
                <div key={doc.path} className="rounded-md border border-stone-200 bg-stone-50 px-2 py-1.5">
                  <p className="text-xs font-medium text-stone-700">{doc.label}</p>
                  <code className="mt-0.5 block break-all text-[11px] text-stone-500">{doc.path}</code>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}

export function MandatContent() {
  const statusCounts = foodTgOpportunityRadar.reduce<Record<FoodTgValidationStatus, number>>((acc, item) => {
    for (const status of item.statuses) acc[status] = (acc[status] ?? 0) + 1
    return acc
  }, {} as Record<FoodTgValidationStatus, number>)
  const nextDecisionRuleAction =
    foodTgDecisionGates.find((gate) => gate.id === 'validation')?.nextAction ?? foodTgMandateSummary.recommendation

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-900/[0.03]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] font-medium uppercase tracking-wider text-stone-500">Food TG styringsflate</p>
            <h1 className="mt-1 text-2xl font-bold text-stone-900">{foodTgMandateSummary.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{foodTgMandateSummary.scope}</p>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{foodTgMandateSummary.recommendation}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <EvidenceStatusBadge
                status={foodTgMandateSummary.evidenceStatus}
                detail={foodTgMandateSummary.evidenceStatusNote}
              />
              <p className="text-xs leading-relaxed text-stone-500">{foodTgMandateSummary.evidenceStatusNote}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm lg:w-80">
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-stone-400">Oppdatert</p>
              <p className="mt-1 font-semibold text-stone-800">{foodTgMandateSummary.date}</p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-stone-400">Beslutningsstatus</p>
              <p className="mt-1 font-semibold text-stone-800">{foodTgMandateSummary.decisionStatus}</p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-stone-400">Beslutningsdato</p>
              <p className="mt-1 font-semibold text-stone-800">{foodTgMandateSummary.decisionDate}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-amber-700">Statusdisiplin</p>
              <p className="mt-1 text-sm font-medium text-amber-900">{foodTgMandateSummary.externalValidation}</p>
            </div>
          </div>
        </div>
      </section>

      <PageFraming
        title="Hva svarer denne siden på?"
        description={[
          'Siden viser mandat, beslutningsstatus og kontrollag for Food TG-sporet før videre validering.',
          'Den skal hjelpe intern styring med å se hva som er klart, hva som krever bekreftelse og hvor stoppsignalene ligger.',
        ]}
        takeaways={[
          'Mandatet skiller interne beslutninger fra aktør- og primærkildesjekk.',
          'Kandidatkort, porter og kontrollstatus viser hva som kan brukes nå og hva som må holdes tilbake.',
          'Wageningen-metoden brukes som metodegrunnlag og spørsmål, ikke som fasit.',
        ]}
        caveat="Intern styringsflate med forbehold: ingen Food TG-claims løftes til validert eksternt uten dokumentert ekstern validering."
      />

      <StatusLegend
        title="Status for Food TG-styring"
        description="Legend viser hvilke ord som holder claims i riktig styrke: utført internt er arbeidsstatus, blokkert skal stoppes, og validert eksternt er reservert for dokumentert ekstern bekreftelse."
      />

      <WageningenMethodOverview />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        {Object.entries(foodTgStatusLabels).map(([status, label]) => (
          <div key={status} className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-[10px] uppercase tracking-wider text-stone-400">{label}</p>
            <p className="mt-2 text-2xl font-bold text-stone-900">{statusCounts[status as FoodTgValidationStatus] ?? 0}</p>
            <p className="mt-1 text-xs text-stone-500">opportunity-treff</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-stone-700">Beslutningsporter før ekstern bruk</h2>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {foodTgDecisionGates.map((gate) => (
            <section key={gate.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-stone-900">{gate.title}</h3>
                <ControlStatusPill status={gate.status} />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{gate.mustBeTrue}</p>
              <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
                <p className="text-[10px] uppercase tracking-wider text-stone-400">Blokkerer</p>
                <p className="mt-1 text-sm leading-relaxed text-stone-700">{gate.blocks}</p>
              </div>
              <code className="mt-3 block break-all rounded-md bg-stone-50 px-2 py-1 text-[11px] text-stone-500">{gate.governingDocument}</code>
              <p className="mt-3 text-xs leading-relaxed text-stone-500">Neste handling: {gate.nextAction}</p>
            </section>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {foodTgTrackStatusCards.map((track) => (
          <section key={track.track} className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <TrackPill track={track.track} />
              <span className="text-xs font-medium text-stone-500">{track.status}</span>
            </div>
            <h2 className="mt-3 text-sm font-semibold text-stone-900">{track.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{track.readyNow}</p>
            <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-stone-400">Må sjekkes først</p>
              <p className="mt-1 text-sm leading-relaxed text-stone-700">{track.checkFirst}</p>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-stone-500">Neste handling: {track.nextAction}</p>
          </section>
        ))}
      </div>

      <Card title="Kandidatkort">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {foodTgCandidateCards.map((candidate) => (
            <div key={candidate.id} className="rounded-lg border border-stone-200 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <ControlTrackPill track={candidate.track} />
                <ControlStatusPill status={candidate.status} />
                <span className="text-xs font-mono text-stone-400">{candidate.id}</span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-stone-900">{candidate.title}</h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-stone-400">{candidate.role}</p>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Kan sies nå</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">{candidate.canSay}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Skal ikke sies ennå</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">{candidate.cannotSay}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Kildeport</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">{candidate.sourceGate}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Aktørport</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">{candidate.actorGate}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">C-gate</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">{candidate.cGate}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Stoppsignal</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">{candidate.stopSignal}</p>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-[10px] uppercase tracking-wider text-stone-400">Minimumsdata</p>
                <InlineList items={candidate.minimumData} />
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-stone-500">
                {[...candidate.claimIds, ...candidate.evidenceIds, ...candidate.sourceIds].map((id) => (
                  <span key={id} className="rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5">
                    {id}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-stone-500">Neste handling: {candidate.nextAction}</p>
            </div>
          ))}
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-stone-700">Minimum valideringslaner</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {foodTgValidationLanes.map((lane) => (
            <section key={lane.id} className={`rounded-lg border p-3 ${validationLaneStyles[lane.id]}`}>
              <p className="text-sm font-semibold">{lane.title}</p>
              <p className="mt-1 text-xs leading-relaxed opacity-85">{lane.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {lane.items.length ? (
                  lane.items.map((item) => (
                    <span key={item} className="rounded border border-current/20 bg-white/60 px-1.5 py-0.5 text-[11px]">
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="rounded border border-current/20 bg-white/60 px-1.5 py-0.5 text-[11px]">0 claims</span>
                )}
              </div>
            </section>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title="Beslutningsgrunnlag">
          <div className="space-y-3">
            {foodTgControlDocuments.map((doc) => (
              <div key={doc.id} className="border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-stone-800">{doc.title}</h3>
                  <ControlStatusPill status={doc.status} />
                </div>
                <p className="mt-1 text-xs text-stone-500">{doc.kind}</p>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">{doc.use}</p>
                <InlineList items={doc.blocks} />
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
              <p className="mt-1 text-sm font-medium text-stone-800">{nextDecisionRuleAction}</p>
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

      <Card title="Reader journey og plattformflater">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {foodTgReaderJourneySurfaces.map((surface) => (
            <div key={surface.route} className="rounded-lg border border-stone-200 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-stone-400">{surface.route}</span>
                <ControlStatusPill status={surface.readiness} />
              </div>
              <h3 className="mt-2 text-sm font-semibold text-stone-900">{surface.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">{surface.use}</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Figurnote</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">{surface.figureNote}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Risiko</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">{surface.risk}</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-stone-500">Neste handling: {surface.nextAction}</p>
            </div>
          ))}
        </div>
      </Card>

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
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Kan sies nå</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">{item.canSay}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Skal ikke sies ennå</p>
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
                  <ClaimStrengthPill strength={claim.strength} />
                  <StatusPill status={claim.status} />
                  <span className="text-xs font-mono text-stone-400">{claim.claimId}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-stone-800">{claim.title}</p>
                <p className="mt-1 text-sm text-stone-600">{claim.useNow}</p>
                <p className="mt-1 text-xs text-stone-500">Neste handling: {claim.nextAction}</p>
                <p className="mt-1 text-xs text-stone-500">Må avklares: {claim.needs}</p>
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
