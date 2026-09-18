import type { ReactNode } from 'react'
import type { MatreiseStationId } from '@/lib/data/matreise'

const ACCENT = 'fill-emerald-50 stroke-emerald-600'
const WAVES = 'q8 -6 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0'
const GROUND = <path d="M10 120 H190" />

const scenes: Record<MatreiseStationId, ReactNode> = {
  innsatsvarer: (
    <>
      <path d={`M8 122 ${WAVES}`} />
      <path d="M28 98 H152 L142 116 H40 Z" />
      <path d="M124 98 V78 H142 V98 M129 86 h8" />
      <g className={ACCENT}>
        <rect x="46" y="84" width="22" height="14" rx="1" />
        <rect x="70" y="84" width="22" height="14" rx="1" />
        <rect x="94" y="84" width="22" height="14" rx="1" />
        <rect x="58" y="70" width="22" height="14" rx="1" />
      </g>
      <path d="M176 122 V52 M176 58 H140 M148 58 v12 M176 58 l12 12" />
    </>
  ),
  garden: (
    <>
      {GROUND}
      <path d="M30 120 V84 L56 64 L82 84 V120" />
      <path d="M48 120 V100 H64 V120 M48 100 L64 120 M64 100 L48 120" />
      <path d="M92 120 V78 a10 10 0 0 1 20 0 V120 M92 92 h20 M92 106 h20" />
      <circle cx="166" cy="38" r="10" />
      <g className="stroke-emerald-600">
        {[128, 142, 156, 170, 184].map(x => (
          <path key={x} d={`M${x} 120 v-12 M${x} 112 q-5 -2 -6 -8 M${x} 112 q5 -2 6 -8`} />
        ))}
      </g>
    </>
  ),
  havet: (
    <>
      <path d={`M8 72 ${WAVES}`} />
      <path d="M134 62 h44 l-7 10 h-30 z M152 62 V48 h12 v14" />
      <ellipse cx="76" cy="82" rx="44" ry="9" />
      <path d="M32 82 V110 a44 9 0 0 0 88 0 V82" />
      <path d="M54 90 V117 M76 91 V119 M98 90 V117" className="stroke-stone-300" />
      <g className={ACCENT}>
        <path d="M60 103 q10 -8 22 0 q-12 8 -22 0 z M82 103 l7 -5 v10 z" />
      </g>
    </>
  ),
  foredling: (
    <>
      {GROUND}
      <path d="M22 120 V84 L44 72 V84 L66 72 V84 L88 72 V120" />
      <path d="M32 100 h10 M54 100 h10 M76 100 h10" />
      <path d="M98 120 V56 h12 V120 M104 46 q-6 -6 0 -12 q6 -6 0 -12" />
      <path d="M120 120 V86 a12 5 0 0 1 24 0 V120 M120 86 a12 5 0 0 0 24 0" />
      <path d="M152 112 h38" />
      <circle cx="156" cy="116" r="3" />
      <circle cx="186" cy="116" r="3" />
      <g className={ACCENT}>
        <path d="M158 112 v-14 l5 -5 l5 5 v14 z" />
        <path d="M174 112 v-14 l5 -5 l5 5 v14 z" />
      </g>
    </>
  ),
  logistikk: (
    <>
      {GROUND}
      <path d="M14 120 V78 L54 62 L94 78 V120" />
      <path d="M26 120 V96 h20 v24 M26 104 h20 M26 112 h20 M60 120 V96 h20 v24 M60 104 h20 M60 112 h20" />
      <path d="M48 50 a8 8 0 0 1 12 0 M43 44 a15 15 0 0 1 22 0" />
      <g className={ACCENT}>
        <rect x="106" y="82" width="46" height="28" rx="2" />
        <path d="M152 92 h14 l10 10 v8 h-24 z" />
        <circle cx="120" cy="113" r="5" />
        <circle cx="164" cy="113" r="5" />
      </g>
    </>
  ),
  butikken: (
    <>
      {GROUND}
      <path d="M40 120 V72 H160 V120" />
      <path d="M34 72 L44 54 H156 L166 72 Z" />
      <path d="M34 72 q11 10 22 0 q11 10 22 0 q11 10 22 0 q11 10 22 0 q11 10 22 0 q11 10 22 0" />
      <rect x="88" y="92" width="24" height="28" />
      <rect x="50" y="88" width="28" height="20" />
      <rect x="122" y="88" width="28" height="20" />
      <g className={ACCENT}>
        <circle cx="58" cy="103" r="4" />
        <circle cx="68" cy="103" r="4" />
        <circle cx="63" cy="96" r="4" />
        <circle cx="131" cy="103" r="4" />
        <circle cx="141" cy="103" r="4" />
      </g>
    </>
  ),
  kjokkenet: (
    <>
      {GROUND}
      <path d="M60 112 H140 V120 H60 Z" />
      <path d="M72 112 V86 H128 V112 M68 86 H132 M96 86 v-6 h8 v6 M72 94 h-8 M128 94 h8" />
      <path d="M22 120 V100 a9 3 0 0 1 18 0 V120 M22 100 a9 3 0 0 0 18 0" />
      <ellipse cx="168" cy="115" rx="17" ry="4" />
      <g className="stroke-emerald-600">
        <path d="M88 70 q-6 -8 0 -16 M100 66 q-6 -8 0 -16 M112 70 q-6 -8 0 -16" />
      </g>
    </>
  ),
  tilbake: (
    <>
      <path d="M10 120 H40 q60 -26 120 0 H190" />
      <path d="M142 74 h24 l-3 30 h-18 z M138 74 h32" />
      <path d="M34 78 q13 -6 26 0 v26 q-13 5 -26 0 z" />
      <g className="stroke-emerald-600">
        <path d="M153 57 A56 56 0 0 0 47 57 M47 57 l8 -6 M47 57 l-2 -10" />
        <path d="M100 106 V82 M100 94 q-14 -2 -16 -16 q14 0 16 16 M100 88 q14 -2 16 -16 q-14 0 -16 16" />
      </g>
    </>
  ),
}

export function StasjonIllustrasjon({ id, className = '' }: { id: MatreiseStationId; className?: string }) {
  return (
    <svg
      viewBox="0 0 200 140"
      className={`text-stone-400 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {scenes[id]}
    </svg>
  )
}
