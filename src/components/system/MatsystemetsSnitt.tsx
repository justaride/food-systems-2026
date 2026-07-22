'use client'

import Link from 'next/link'
import { useState } from 'react'
import { mergeReadinessForCompositeClaim } from '@/lib/citations/citation-readiness'
import type { CitationReadinessLevel } from '@/lib/citations/citation-status'
import {
  matsystemSnittLayers,
  matsystemSnittStages,
  matsystemSnittTopologyNote,
  type MatsystemSnittLayerId,
} from '@/lib/data/matsystem-snitt'
import { getEvidenceGrammarToken } from '@/lib/visualization/evidence-grammar'
import { getEvidenceStatusConfig } from '@/lib/visualization/status'
import { EvidenceGrammarLegend } from '@/components/visualization/EvidenceGrammarLegend'

const LAYER_ACTIVE_CLASSES: Record<MatsystemSnittLayerId, string> = {
  structure: 'border-stone-200 bg-stone-100 text-stone-950',
  power: 'border-rose-300 bg-rose-200 text-rose-950',
  dependency: 'border-amber-300 bg-amber-200 text-amber-950',
  circularity: 'border-emerald-300 bg-emerald-200 text-emerald-950',
  evidence: 'border-sky-300 bg-sky-200 text-sky-950',
}

const LAYER_DOT_CLASSES: Record<MatsystemSnittLayerId, string> = {
  structure: 'bg-stone-300',
  power: 'bg-rose-400',
  dependency: 'bg-amber-400',
  circularity: 'bg-emerald-400',
  evidence: 'bg-sky-400',
}

const LAYER_STROKES: Record<MatsystemSnittLayerId, string> = {
  structure: '#a8a29e',
  power: '#fb7185',
  dependency: '#fbbf24',
  circularity: '#34d399',
  evidence: '#38bdf8',
}

const READINESS_LABELS: Record<CitationReadinessLevel, string> = {
  citable_external: 'Eksternt siterbar',
  citable_with_note: 'Med forbehold',
  internal_context: 'Intern kontekst',
  blocked_unsourced: 'Blokkert',
}

export function MatsystemetsSnitt() {
  const [activeLayer, setActiveLayer] = useState<MatsystemSnittLayerId>('structure')
  const layer = matsystemSnittLayers.find(item => item.id === activeLayer)!

  return (
    <section
      aria-labelledby="matsystem-snitt-title"
      className="matsystem-snitt-shell overflow-hidden rounded-2xl border border-stone-800 text-stone-100 shadow-xl shadow-stone-950/10"
    >
      <div className="relative p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-300">
              Systematlas · første produksjonsslice
            </p>
            <h2 id="matsystem-snitt-title" className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
              Matsystemets snitt
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-300">
              Følg systemet fra innsatsvarer til forbruk og tilbakeføring. Bytt lag for å se hvor
              makt, avhengighet, sirkularitet og kunnskapshull ligger.
            </p>
          </div>
          <div className="max-w-sm rounded-xl border border-rose-300/25 bg-rose-300/10 px-3 py-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-rose-200">Illustrativ systemmodell</p>
            <p className="mt-1 text-xs leading-relaxed text-stone-300">{matsystemSnittTopologyNote}</p>
          </div>
        </div>

        <div className="mt-5" role="group" aria-label="Velg analyselag">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-stone-500">Velg lag</p>
          <div className="flex flex-wrap gap-2">
            {matsystemSnittLayers.map(item => {
              const isActive = item.id === activeLayer
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveLayer(item.id)}
                  className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                    isActive
                      ? LAYER_ACTIVE_CLASSES[item.id]
                      : 'border-white/15 bg-white/[0.04] text-stone-300 hover:border-white/30 hover:bg-white/[0.08]'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 border-y border-white/10 py-3">
          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${LAYER_DOT_CLASSES[activeLayer]}`} aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-white">{layer.label}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-stone-400">{layer.description}</p>
          </div>
        </div>

        <ol className="matsystem-snitt-grid mt-6 grid gap-3 lg:grid-cols-7" aria-label="Matsystemets sju funksjonelle ledd">
          {matsystemSnittStages.map(stage => {
            const signal = stage.signals[activeLayer]
            const evidenceToken = signal.state === 'available'
              ? getEvidenceGrammarToken(signal.evidence.status)
              : null
            const evidenceConfig = signal.state === 'available'
              ? getEvidenceStatusConfig(signal.evidence.status)
              : null
            const readiness = signal.state === 'available'
              ? mergeReadinessForCompositeClaim(
                  signal.evidence.sourceRefs.map(source => ({ citationReadiness: source.citationReadiness })),
                )
              : 'blocked_unsourced'

            return (
              <li key={stage.id} className="matsystem-snitt-stage relative min-w-0">
                <Link
                  href={stage.href}
                  aria-label={`${stage.order}. ${stage.label}. ${stage.question}`}
                  className={`group flex min-h-44 h-full flex-col rounded-xl border p-3 transition-[border-color,background-color,transform] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:hover:-translate-y-1 ${
                    signal.state === 'gap'
                      ? 'matsystem-snitt-gap border-rose-300/30 bg-rose-950/20 hover:border-rose-300/60'
                      : 'border-white/10 bg-stone-900/85 hover:border-white/30 hover:bg-stone-900'
                  }`}
                >
                  <span
                    className={`evidence-line ${evidenceToken?.lineClassName ?? 'evidence-line--gap'} text-stone-200`}
                    aria-hidden="true"
                  />
                  <span className="mt-3 flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-stone-500">{String(stage.order).padStart(2, '0')}</span>
                    <span className="text-[10px] text-stone-500 transition-colors group-hover:text-stone-300" aria-hidden="true">↗</span>
                  </span>
                  <span className="mt-1 text-sm font-semibold leading-tight text-white">{stage.shortLabel}</span>
                  <span className="mt-3 text-xs font-medium leading-snug text-stone-200">{signal.title}</span>
                  <span className="mt-1 text-[11px] leading-relaxed text-stone-400">{signal.detail}</span>
                  <span className="mt-auto pt-3 font-mono text-[9px] uppercase tracking-wide text-stone-500">
                    {signal.state === 'available'
                      ? `${evidenceConfig!.label} · ${READINESS_LABELS[readiness]}`
                      : 'Mangler data · blokkert'}
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>

        <div className="mt-2 hidden lg:block" aria-hidden="true">
          <svg viewBox="0 0 1000 72" className="h-16 w-full" preserveAspectRatio="none">
            <defs>
              <marker id="matsystem-return-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={LAYER_STROKES[activeLayer]} />
              </marker>
            </defs>
            <path
              d="M 982 2 C 982 58, 18 58, 18 2"
              fill="none"
              stroke={LAYER_STROKES[activeLayer]}
              strokeWidth="2"
              strokeDasharray="8 7"
              markerEnd="url(#matsystem-return-arrow)"
              opacity="0.72"
            />
            <text x="500" y="55" textAnchor="middle" fill="#a8a29e" fontSize="11">
              rest- og næringsstrømmer tilbake til ressursgrunnlaget
            </text>
          </svg>
        </div>

        <div className="mt-3 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] px-3 py-3 text-xs leading-relaxed text-stone-300 lg:hidden">
          <span className="font-semibold text-emerald-200">Returløkken:</span>{' '}
          Rest- og næringsstrømmer kan føres tilbake til innsatsvarer og primærproduksjon. Kartet viser koblingen, ikke realisert mengde.
        </div>

        <EvidenceGrammarLegend tone="dark" className="mt-5" />
      </div>
    </section>
  )
}
