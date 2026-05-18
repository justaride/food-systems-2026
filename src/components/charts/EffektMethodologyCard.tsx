'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'

export function EffektMethodologyCard() {
  const [open, setOpen] = useState(false)

  return (
    <Card className="bg-stone-50 border-stone-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-xs font-semibold text-stone-700">Metodikk og forbehold</span>
        <svg
          className={`w-3 h-3 text-stone-500 transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {open && (
        <div className="mt-3 space-y-3 text-xs text-stone-600 leading-relaxed">
          <div>
            <p className="font-semibold text-stone-700 mb-1">Hvorfor ingen LCA?</p>
            <p>
              Vi har ikke en samlet nordisk LCA-komparator som rangerer tiltak per kg CO₂e, kg N/P og biodiversitets­påvirkning per investert krone. NORSUS dokumenterer at forebygging er 5–10× mer klimaeffektiv enn gjenvinning, og van der Fels-Klerx et al. (2024) påpeker at sirkularitet må passere et mattrygghet-gate-kriterium for å være systemisk forbedring. Inntil en samlet LCA er på plass, er rangeringen redaksjonell — basert på syntese av prosjektets research­dokumenter.
            </p>
          </div>
          <div>
            <p className="font-semibold text-stone-700 mb-1">Hva vurderte vi?</p>
            <p>
              Vi inkluderte tiltak som har dokumentert volum-/effekt-grunnlag i forsknings­korpuset (whitepaper §7, sirkularitet-dyp, circularity-loops, circularity-questions) og som er meningsfulle på land- eller nordisk nivå. Tiltak med tynt grunnlag (kaffe-svinn, mikroplast i biorest, R4-emballasje) er parkert til mer research er tilgjengelig.
            </p>
          </div>
          <div>
            <p className="font-semibold text-stone-700 mb-1">Hvordan foreslå endring</p>
            <p>
              Endringer skjer via PR mot{' '}
              <code className="text-[11px] bg-stone-100 px-1 py-0.5 rounded">src/lib/data/circular-leverage.ts</code>{' '}
              i{' '}
              <a
                href="https://github.com/justaride/food-systems-2026"
                target="_blank"
                rel="noreferrer"
                className="underline text-stone-700 hover:text-stone-900"
              >
                food-systems-2026
              </a>
              . Hver rad har eksplisitt evidence-status og kildehenvisninger.
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}
